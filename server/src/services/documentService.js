const path = require("path");
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const prisma = require("../config/prisma");

// ------------------------------------------------------------------
//  Correspondances signataire → fonction_id + titre complet
// ------------------------------------------------------------------
const SIGNATAIRE_CONFIG = {
    Directeur: {
        fonction_id: 1,
        titre: "Directeur",
    },
    ADAAF: {
        fonction_id: 2,
        titre: "Adjoint au Directeur chargé des Affaires Administratives et Financières",
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
 * Convertit "M" ou "F" en "Monsieur" ou "Madame".
 * @param {string} libelleGenre
 * @returns {string}
 */
function civilite(libelleGenre) {
    if (!libelleGenre) return "";
    return libelleGenre.trim().toUpperCase() === "M" ? "Monsieur" : "Madame";
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
    function ordinal(n) {
        const num = parseInt(n, 10);
        if (num === 1) return "1er";
        return `${num}ème`;
    }

    const classeOrd = ordinal(classeRaw);
    const echelonOrd = ordinal(echelonRaw);
    return `${classeOrd} classe ${echelonOrd} échelon`;
}

// ------------------------------------------------------------------
//  Lecture du template et injection des données
// ------------------------------------------------------------------
/**
 * Génère le certificat administratif (.docx) pour un agent donné.
 * @param {object} params
 * @param {number} params.personnelId  - ID de l'agent
 * @param {string} params.numero       - Numéro de référence
 * @param {string} params.motif        - Motif du certificat
 * @param {string} params.date_delivrance - Date ISO YYYY-MM-DD
 * @param {string} params.signataire   - "Directeur" ou "ADAAF"
 * @param {number} params.adminId      - ID auth_user de l'admin qui génère
 * @returns {{ buffer: Buffer, filename: string } | { notFound: true }}
 */
async function genererCertificatAdministratif({
    personnelId,
    numero,
    motif,
    date_delivrance,
    signataire,
    adminId,
}) {
    // 1. Récupérer l'agent
    const agent = await prisma.personnel.findUnique({
        where: { id: BigInt(personnelId) },
        include: {
            genre: true,
            fonction: { select: { libelle: true } },
            service: { select: { libelle: true } },
            grade: true,
        },
    });

    if (!agent) return { notFound: true };

    // 2. Récupérer le signataire
    const config = SIGNATAIRE_CONFIG[signataire];
    const agentSignataire = await prisma.personnel.findFirst({
        where: {
            fonction_id: config.fonction_id,
            statut: "En_activit_",
        },
        include: { genre: true },
    });

    // Données de remplacement dans le template
    const nomPrenomAgent = `${agent.nom}${agent.prenoms ? " " + agent.prenoms : ""}`;
    const nomPrenomSignataire = agentSignataire
        ? `${agentSignataire.nom}${agentSignataire.prenoms ? " " + agentSignataire.prenoms : ""}`
        : "";

    function accordSignataire(libelleGenre) {
        if (!libelleGenre) return "";
        return libelleGenre.trim().toUpperCase() === "F"
            ? "soussignée"
            : "soussigné";
    }

    const templateData = {
        numero: String(numero).trim(),
        civilite_agent: civilite(agent.genre?.libelle),
        nom_prenom_agent: nomPrenomAgent,
        matricule: agent.im || "",
        fonction: agent.fonction?.libelle || "",
        // Prioriser `ref.fonction.libelle`. Si absent, fallback sur `service.libelle`.
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
        motif: String(motif).trim(),
        civilite_signataire: agentSignataire
            ? civilite(agentSignataire.genre?.libelle)
            : "",
        accord_signataire: agentSignataire
            ? accordSignataire(agentSignataire.genre?.libelle)
            : "",
        nom_signataire: nomPrenomSignataire,
        titre_signataire: config.titre,
    };

    // 3. Charger et remplir le template
    const templatePath = path.join(
        __dirname,
        "..",
        "..",
        "templates",
        "certificat_administratif.docx",
    );
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    doc.render(templateData);

    const buffer = doc.getZip().generate({ type: "nodebuffer" });

    // 4. Nom du fichier téléchargé
    const dateGen = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const matricule = agent.im || `id${agent.id}`;
    const filename = `certificat_${matricule}_${dateGen}.docx`;

    // 5. Enregistrer l'audit log — nouveau type "GENERATION_DOCUMENT"
    await prisma.ref_audit_log.create({
        data: {
            action: "GENERATION_DOCUMENT",
            cible_type: "personnel",
            cible_id: BigInt(personnelId),
            fait_par_id: BigInt(adminId),
            details: {
                type_document: "certificat_administratif",
                signataire,
                numero: String(numero).trim(),
                motif: String(motif).trim(),
                date_delivrance,
                filename,
                description: `Certificat administratif généré pour ${nomPrenomAgent} (IM: ${agent.im || "N/A"}) — motif : ${motif}`,
            },
        },
    });

    return { buffer, filename };
}

module.exports = {
    genererCertificatAdministratif,
};
