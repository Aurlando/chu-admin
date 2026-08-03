const path = require("path");
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const prisma = require("../config/prisma");

// ------------------------------------------------------------------
//  Correspondances signataire -> fonction_id + titre + civilité
// ------------------------------------------------------------------
// `civiliteFixe` : si renseigné, ce titre est utilisé pour TOUS les
// signataires occupant cette fonction, quel que soit leur genre en BDD
// (ex: le Directeur est toujours appelé "Professeur"). Pour changer ce
// titre (ex: si le Directeur devient "Docteur"), il suffit de modifier
// cette seule valeur.
// Si `civiliteFixe` est absent, la civilité est déduite du genre de
// l'agent en base : "Monsieur" ou "Madame" (cas de l'ADAAF, qui peut
// être un homme ou une femme selon la personne en poste).
// Valeur de l'enum Prisma `statut_personnel` correspondant à un agent
// ayant quitté ses fonctions (utilisé par l'attestation de bénévolat
// pour savoir si {date_sortie} doit afficher une date réelle ou "ce
// jour"). ⚠️ À VÉRIFIER : ajuster si le nom exact généré par Prisma
// diffère (ex: si un accent a été sanitisé en "_").
const STATUT_SORTIE = "Sortie";

const SIGNATAIRE_CONFIG = {
    Directeur: {
        fonction_id: 1,
        titre: "Directeur",
        civiliteFixe: "Professeur",
    },
    ADAAF: {
        fonction_id: 2,
        titre: "Adjoint au Directeur chargé des Affaires Administratives et Financières",
        // pas de civiliteFixe -> dépend du genre en BDD (Monsieur / Madame)
    },
};

// ------------------------------------------------------------------
//  Registre des types de documents générables
// ------------------------------------------------------------------
// Pour ajouter un nouveau document : déposer le template .docx dans
// server/templates/, puis ajouter une entrée ici + les champs requis
// dans CHAMPS_SUPPLEMENTAIRES_REQUIS (documentValidators.js) + la route
// (documentRoutes.js). Le controller reste inchangé.
//
//  - templateFilename : nom du fichier .docx dans server/templates/
//  - prefixeFichier   : préfixe du nom de fichier téléchargé
//  - libelle          : nom lisible utilisé dans l'audit log
//  - genreLibelle     : "m" ou "f", pour accorder "généré"/"générée" dans l'audit log
//  - construireChampsSupplementaires : construit les variables du
//    template qui ne font PAS partie du socle commun (voir
//    `construireDonneesCommunes` ci-dessous). Reçoit `agent` (déjà
//    chargé avec ses relations) + le reste du body de la requête.
const TYPES_DOCUMENTS = {
    certificat_administratif: {
        templateFilename: "certificat_administratif.docx",
        prefixeFichier: "certificat",
        libelle: "Certificat administratif",
        genreLibelle: "m",
        construireChampsSupplementaires: ({ motif }) => ({
            motif: String(motif).trim(),
        }),
    },
    attestation_non_interruption_service: {
        templateFilename: "attestation_de_non_interruption_de_service.docx",
        prefixeFichier: "attestation_non_interruption",
        libelle: "Attestation de non-interruption de service",
        genreLibelle: "f",
        construireChampsSupplementaires: ({ agent }) => ({
            // `corps` peut être soit une relation (objet avec `libelle`)
            // soit une colonne texte. Gérer les deux cas.
            corps:
                agent.corps && typeof agent.corps === "object"
                    ? agent.corps.libelle || ""
                    : agent.corps || "",
        }),
    },
    attestation_benevolat: {
        templateFilename: "attestation_de_benevolat.docx",
        prefixeFichier: "attestation_benevolat",
        libelle: "Attestation de bénévolat",
        genreLibelle: "f",
        // Réservé aux agents dont type_personnel = 'BENEVOLE' (voir
        // `genererDocument`, qui applique ce contrôle avant génération).
        typePersonnelRequis: "BENEVOLE",
        construireChampsSupplementaires: ({ agent }) => ({
            service: agent.service?.libelle || "",
            // Si l'agent a déjà quitté (statut = STATUT_SORTIE), on
            // affiche sa date de sortie réelle ; sinon le bénévolat est
            // toujours en cours -> "à ce jour". La préposition (au/à)
            // est incluse ici car le template écrit juste "jusqu'{date_sortie}".
            date_sortie:
                agent.statut === STATUT_SORTIE && agent.date_sortie
                    ? `au ${formaterDateFr(agent.date_sortie)}`
                    : "à ce jour",
        }),
    },
};

// ------------------------------------------------------------------
//  Utilitaires de formatage
// ------------------------------------------------------------------
const MOIS_FR = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
];

/**
 * Formate une date en "DD Mois YYYY" en français.
 * @param {string|Date} date
 * @returns {string}
 */
function formaterDateFr(date) {
    const d = new Date(date);
    const jour = String(d.getUTCDate()).padStart(2, "0");
    const mois = MOIS_FR[d.getUTCMonth()];
    const annee = d.getUTCFullYear();
    return `${jour} ${mois} ${annee}`;
}

/**
 * Civilité de l'agent concerné par le document : toujours
 * "Monsieur" / "Madame" selon son genre en BDD, peu importe le
 * document.
 * @param {string} libelleGenre
 * @returns {string}
 */
function civiliteAgent(libelleGenre) {
    if (!libelleGenre) return "";
    return libelleGenre.trim().toUpperCase() === "M" ? "Monsieur" : "Madame";
}

/**
 * Civilité du SIGNATAIRE.
 *  - Si `signataireConfig.civiliteFixe` est défini (ex: Directeur ->
 *    "Professeur"), on l'utilise tel quel, quel que soit le genre.
 *  - Sinon, on retombe sur le genre de l'agent en BDD : "Monsieur" ou
 *    "Madame" (ex: ADAAF, qui peut être occupé par un homme ou une femme).
 * @param {string} libelleGenre
 * @param {object} signataireConfig - entrée de SIGNATAIRE_CONFIG
 * @returns {string}
 */
function civiliteSignataire(libelleGenre, signataireConfig) {
    if (signataireConfig.civiliteFixe) {
        return signataireConfig.civiliteFixe;
    }
    if (!libelleGenre) return "";
    return libelleGenre.trim().toUpperCase() === "M" ? "Monsieur" : "Madame";
}

/**
 * Accord grammatical de "soussigné(e)" selon le genre du signataire.
 * @param {string} libelleGenre
 * @returns {string}
 */
function accordSignataire(libelleGenre) {
    if (!libelleGenre) return "";
    return libelleGenre.trim().toUpperCase() === "F"
        ? "soussignée"
        : "soussigné";
}

/**
 * Formate le grade en notation ordinale française.
 * Exemples :
 *   classe "1", echelon 1  → "1ère classe 1er échelon"
 *   classe "2", echelon 3  → "2ème classe 3ème échelon"
 * @param {string} classeRaw
 * @param {number} echelonRaw
 * @returns {string}
 */
function formaterGrade(classeRaw, echelonRaw) {
    const classeValue = String(classeRaw ?? "").trim();
    const echelonValue = echelonRaw;

    if (!classeValue) return "";

    const classeUpper = classeValue.toUpperCase();
    if (classeUpper === "STAGIAIRE") {
        return "stagiaire";
    }

    const classeNum = parseInt(classeValue, 10);
    const echelonNum = Number(echelonValue);
    const hasClasse = !Number.isNaN(classeNum);
    const hasEchelon = !Number.isNaN(echelonNum) && echelonNum !== 0;

    function ordinal(n) {
        const num = parseInt(n, 10);
        if (num === 1) return "1er";
        return `${num}ème`;
    }

    if (!hasClasse) {
        return classeValue.toLowerCase();
    }

    const classeOrd = ordinal(classeNum);
    if (hasEchelon) {
        return `${classeOrd} classe ${ordinal(echelonNum)} échelon`;
    }

    return `${classeOrd} classe`;
}

// ------------------------------------------------------------------
//  Récupération des données (agent + signataire)
// ------------------------------------------------------------------
/**
 * Charge l'agent concerné par le document ainsi que le signataire
 * correspondant (résolu via fonction_id). Commun à tous les types de
 * documents.
 * @param {number} personnelId
 * @param {string} signataire - "Directeur" ou "ADAAF"
 */
async function recupererAgentEtSignataire(personnelId, signataire) {
    // `corps` can be either a relation (object with `libelle`) or a
    // scalar column (string) depending on the Prisma schema. Try to
    // include it as a relation first; if the query fails (schema has
    // a scalar `corps`), retry without the `corps` include.
    let agent;
    try {
        agent = await prisma.personnel.findUnique({
            where: { id: BigInt(personnelId) },
            include: {
                genre: true,
                fonction: { select: { libelle: true } },
                service: { select: { libelle: true } },
                grade: true,
                corps: { select: { libelle: true } },
            },
        });
    } catch (err) {
        // Fallback: `corps` is likely a scalar field, so fetch without
        // trying to include it as a relation. The scalar `corps` will
        // then be available directly on `agent.corps`.
        agent = await prisma.personnel.findUnique({
            where: { id: BigInt(personnelId) },
            include: {
                genre: true,
                fonction: { select: { libelle: true } },
                service: { select: { libelle: true } },
                grade: true,
            },
        });
    }

    if (!agent) return { notFound: true };

    const signataireConfig = SIGNATAIRE_CONFIG[signataire];
    const agentSignataire = await prisma.personnel.findFirst({
        where: {
            fonction_id: signataireConfig.fonction_id,
            statut: "En_activit_",
        },
        include: { genre: true },
    });

    return { agent, signataireConfig, agentSignataire };
}

/**
 * Construit le socle de variables commun à TOUS les templates
 * (numero, identité de l'agent, poste, grade, dates, signataire...).
 * Chaque type de document y ajoute ensuite ses propres champs via
 * `construireChampsSupplementaires`.
 */
function construireDonneesCommunes({
    agent,
    signataireConfig,
    agentSignataire,
    numero,
    date_delivrance,
}) {
    const nomPrenomAgent = `${agent.nom}${agent.prenoms ? " " + agent.prenoms : ""}`;
    const nomPrenomSignataire = agentSignataire
        ? `${agentSignataire.nom}${agentSignataire.prenoms ? " " + agentSignataire.prenoms : ""}`
        : "";

    return {
        numero: String(numero).trim(),
        // "26" pour 2026, "27" pour 2027... dérivé de date_delivrance
        // (déjà validée au format YYYY-MM-DD par documentValidators.js).
        annee: String(date_delivrance).slice(2, 4),
        civilite_agent: civiliteAgent(agent.genre?.libelle),
        nom_prenom_agent: nomPrenomAgent,
        matricule: agent.im || "",
        fonction: agent.fonction?.libelle || "",
        service: agent.service?.libelle || "",
        // Prioriser `fonction.libelle`. Si absent, fallback sur `service.libelle`.
        poste:
            agent.fonction && agent.fonction.libelle
                ? agent.fonction.libelle
                : agent.service?.libelle || "(poste non défini)",
        grade: agent.grade
            ? formaterGrade(agent.grade.classe, agent.grade.echelon)
            : "",
        date_entree_admin: agent.date_entree_admin
            ? formaterDateFr(agent.date_entree_admin)
            : "",
        date_delivrance: formaterDateFr(date_delivrance),
        civilite_signataire: agentSignataire
            ? civiliteSignataire(
                  agentSignataire.genre?.libelle,
                  signataireConfig,
              )
            : "",
        accord_signataire: agentSignataire
            ? accordSignataire(agentSignataire.genre?.libelle)
            : "",
        nom_signataire: nomPrenomSignataire,
        titre_signataire: signataireConfig.titre,
    };
}

// ------------------------------------------------------------------
//  Génération du fichier .docx
// ------------------------------------------------------------------
function remplirTemplate(templateFilename, templateData) {
    const templatePath = path.join(
        __dirname,
        "..",
        "..",
        "templates",
        templateFilename,
    );
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    doc.render(templateData);

    return doc.getZip().generate({ type: "nodebuffer" });
}

function construireNomFichier(prefixe, agent) {
    const dateGen = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const matricule = agent.im || `id${agent.id}`;
    return `${prefixe}_${matricule}_${dateGen}.docx`;
}

// ------------------------------------------------------------------
//  Audit log
// ------------------------------------------------------------------
/**
 * Construit la description lisible de l'audit log.
 * Le motif n'est ajouté que s'il existe pour ce type de document
 * (ex: présent pour le certificat administratif, absent pour
 * l'attestation de non-interruption de service).
 */
function construireDescriptionAudit(
    config,
    nomPrenomAgent,
    matricule,
    champsSupplementaires,
) {
    const accordGenre = config.genreLibelle === "f" ? "e" : "";
    let description = `${config.libelle} généré${accordGenre} pour ${nomPrenomAgent} (IM: ${matricule || "N/A"})`;

    if (champsSupplementaires.motif) {
        description += ` — motif : ${champsSupplementaires.motif}`;
    }

    return description;
}

async function enregistrerAuditDocument({
    personnelId,
    adminId,
    typeDocument,
    config,
    signataire,
    numero,
    date_delivrance,
    filename,
    champsSupplementaires,
    nomPrenomAgent,
    matricule,
}) {
    await prisma.ref_audit_log.create({
        data: {
            // Toujours le même type d'action pour tout document généré ;
            // c'est `details.description` qui distingue le contenu.
            action: "GENERATION_DOCUMENT",
            cible_type: "personnel",
            cible_id: BigInt(personnelId),
            fait_par_id: BigInt(adminId),
            details: {
                type_document: typeDocument,
                signataire,
                numero: String(numero).trim(),
                date_delivrance,
                filename,
                ...champsSupplementaires,
                description: construireDescriptionAudit(
                    config,
                    nomPrenomAgent,
                    matricule,
                    champsSupplementaires,
                ),
            },
        },
    });
}

// ------------------------------------------------------------------
//  Point d'entrée générique
// ------------------------------------------------------------------
/**
 * Génère n'importe quel document enregistré dans `TYPES_DOCUMENTS`.
 * @param {string} typeDocument - clé de TYPES_DOCUMENTS
 * @param {object} params
 * @param {number} params.personnelId
 * @param {string} params.numero
 * @param {string} params.date_delivrance - date ISO YYYY-MM-DD
 * @param {string} params.signataire - "Directeur" ou "ADAAF"
 * @param {number} params.adminId - ID auth_user de l'admin qui génère
 * @param {...any} params.champsBody - tout champ propre au type de
 *   document envoyé depuis le front (ex: `motif` pour le certificat
 *   administratif)
 * @returns {{ buffer: Buffer, filename: string } | { notFound: true }}
 */
async function genererDocument(
    typeDocument,
    {
        personnelId,
        numero,
        date_delivrance,
        signataire,
        adminId,
        ...champsBody
    },
) {
    const config = TYPES_DOCUMENTS[typeDocument];
    if (!config) {
        throw new Error(`Type de document inconnu : ${typeDocument}`);
    }

    const { agent, signataireConfig, agentSignataire, notFound } =
        await recupererAgentEtSignataire(personnelId, signataire);
    if (notFound) return { notFound: true };

    // Certains documents sont réservés à un type_personnel précis
    // (ex: l'attestation de bénévolat -> uniquement 'BENEVOLE').
    if (
        config.typePersonnelRequis &&
        agent.type_personnel !== config.typePersonnelRequis
    ) {
        return {
            typeInvalide: true,
            typeRequis: config.typePersonnelRequis,
        };
    }

    const donneesCommunes = construireDonneesCommunes({
        agent,
        signataireConfig,
        agentSignataire,
        numero,
        date_delivrance,
    });
    const champsSupplementaires = config.construireChampsSupplementaires({
        agent,
        ...champsBody,
    });

    const templateData = { ...donneesCommunes, ...champsSupplementaires };
    const buffer = remplirTemplate(config.templateFilename, templateData);
    const filename = construireNomFichier(config.prefixeFichier, agent);

    await enregistrerAuditDocument({
        personnelId,
        adminId,
        typeDocument,
        config,
        signataire,
        numero,
        date_delivrance,
        filename,
        champsSupplementaires,
        nomPrenomAgent: donneesCommunes.nom_prenom_agent,
        matricule: agent.im,
    });

    return { buffer, filename };
}

module.exports = {
    genererDocument,
    TYPES_DOCUMENTS,
};
