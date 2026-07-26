// const pool = require('../config/db');
const prisma = require("../config/prisma");
// ------------------------------------------------------------------
//  verification de l'age (>= 16 ans)
// ------------------------------------------------------------------
function validerAge(date_naissance) {
    const naissance = new Date(date_naissance);

    // verification si date de naissance n'est pas un nombre
    if (isNaN(naissance.getTime())) {
        return "Date de naissance invalide.";
    }

    const today = new Date();
    let age = today.getFullYear() - naissance.getFullYear(); // calcul de l'age en annee

    // verification si l'anniversaire n'est pas encore passé
    // monthdiff < 0 => annif pas encore passé
    // monthdiff === 0 et jour pas encore passé => annif pas encore passé
    const monthDiff = today.getMonth() - naissance.getMonth();
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < naissance.getDate())
    ) {
        age--;
    }

    if (age > 70) {
        return "L'âge ne doit pas dépasser 70 ans.";
    }

    if (age <= 16) {
        return "L'âge doit être supérieur à 16 ans.";
    }

    return null; // null => valide
}

/// ------------------------------------------------------------------
//  verification de l'email
// ------------------------------------------------------------------

// ------------------------------------------------------------------
//  Vérification de la chronologie des dates
// ------------------------------------------------------------------
function validerChronologie(dateNaissance, dateTest, label) {
    if (!dateNaissance || !dateTest) return null;
    if (new Date(dateTest) < new Date(dateNaissance)) {
        return `La ${label} ne peut pas être antérieure à la date de naissance.`;
    }
    return null;
}

function validerEmail(email) {
    if (!email) return null;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // @gmail.com, @chu-anosiala.com, @blabla.com
    if (!regex.test(email)) {
        return "L'adresse mail n'est pas valide.";
    }

    return null;
}

// ------------------------------------------------------------------
//  verification du numero de telephone (obligatoire)
// ------------------------------------------------------------------
// 0340000000 - 034 00 000 00 - +261 34 00 000 00
function validerTelephone(telephone) {
    if (!telephone) return "Le numero de telephone est requis.";

    const tel = telephone.trim().replace(/[\s\-]/g, ""); // retire les espaces et tirets
    const telRegex = /^(\+261\d{9}|0\d{9})$/;

    if (!telRegex.test(tel)) {
        return "Le numero de telephone n'est pas valide (format attendu : 034 00 000 00 ou +261 34 000 0000).";
    }

    return null;
}

// ------------------------------------------------------------------
//  verification du matricule 6 chiffres (obligatoire)
// ------------------------------------------------------------------
function validerIM(im) {
    if (!im) return "Le matricule est requis.";

    const imFormatter = im.toString().trim().replace(/\s+/g, "");

    if (imFormatter.length !== 6) {
        return "Le matricule doit contenir 6 chiffres.";
    }

    if (!/^\d+$/.test(imFormatter)) {
        return "Le matricule doit contenir uniquement des chiffres.";
    }

    return null;
}

// ------------------------------------------------------------------
//  normaliser l'IM pour stockage/validation (retire espaces/tirets)
// ------------------------------------------------------------------
function formatIM(im) {
    if (!im) return "";
    return im.toString().trim().replace(/\D/g, "");
}

// ------------------------------------------------------------------
//  vérifier que genre_id existe dans ref.genre
// ------------------------------------------------------------------
async function validerGenreId(genre_id) {
    if (genre_id === undefined || genre_id === null) return null; // optionnel

    const id = parseInt(genre_id, 10);
    if (isNaN(id) || id <= 0) return "genre_id invalide.";

    const genre = await prisma.genre.findUnique({ where: { id: BigInt(id) } });
    if (!genre) return "Le genre sélectionné n'existe pas.";

    return null;
}

// ------------------------------------------------------------------
//  verification des diplomes et normalisation de format
// ------------------------------------------------------------------
const STATUTS_ENUM_MAP = {
    "En activité": "En_activit_",
    "En absence": "En_absence",
    Sortie: "Sortie",
    En_activit_: "En_activit_",
    En_absence: "En_absence",
};

const STATUTS_LABEL_MAP = {
    En_activit_: "En activité",
    En_absence: "En absence",
    Sortie: "Sortie",
};

function normaliserStatut(statutRaw) {
    if (!statutRaw) return null;
    const statut = statutRaw.toString().trim();
    return STATUTS_ENUM_MAP[statut] ?? null;
}

function formatStatutPourClient(statutEnum) {
    if (!statutEnum) return null;
    return STATUTS_LABEL_MAP[statutEnum] ?? statutEnum;
}

function normaliserDiplomes(diplomesRaw) {
    if (!diplomesRaw) {
        return { erreur: null, diplomes: [] }; // diplomes non obligatoires
    }

    try {
        const diplomesParsed =
            typeof diplomesRaw === "string"
                ? JSON.parse(diplomesRaw)
                : diplomesRaw;

        if (!Array.isArray(diplomesParsed))
            throw new Error("Format Diplomes invalide.");

        const diplomes = diplomesParsed
            .map((d) => ({
                // id present => modification, sinon creation
                ...(d?.id ? { id: parseInt(d.id, 10) } : {}),
                libelle: d.libelle?.trim() || "",
                etablissement: d.etablissement?.trim() || null,
                annee_obtention:
                    d?.annee_obtention &&
                    Number.isFinite(Number(d.annee_obtention))
                        ? Number(d.annee_obtention)
                        : null,
                est_principal: Boolean(d?.est_principal),
            }))
            .filter((d) => d.libelle !== "");

        return { erreur: null, diplomes };
    } catch (error) {
        return { erreur: "Format Diplomes invalide.", diplomes: [] };
    }
}

// ------------------------------------------------------------------
//  verification unicite : im, telephone, email, excludedId
// ------------------------------------------------------------------
async function verifierUniciteBDD({ im, telephone, email, excludedId = null }) {
    const exclusion = excludedId ? { NOT: { id: BigInt(excludedId) } } : {}; // si excludedId existe, on l'exclut de la verification

    if (im !== undefined) {
        const doublon = await prisma.personnel.findFirst({
            where: { im, ...exclusion },
        });
        if (doublon) return "Ce matricule existe déjà.";
    }

    if (telephone !== undefined && telephone !== null) {
        const doublon = await prisma.personnel.findFirst({
            where: { telephone, ...exclusion },
        });
        if (doublon) return "Ce numero de telephone existe déjà.";
    }

    if (email !== undefined && email !== null) {
        const doublon = await prisma.personnel.findFirst({
            where: { email, ...exclusion },
        });
        if (doublon) return "Cet email existe déjà.";
    }

    return null; // pas de doublon
}

// ------------------------------------------------------------------
//  validation des champs lies a l'acces SIH
//      - Si donner_access = true => username obligatoire
//      - Si donner_access = true ET pas de compte => password obligatoire
//      - Si donner_access = true ET compte existant => password optionnel
//        (si avec password : on change le mdp sinon on keep l'ancien)
// ------------------------------------------------------------------
function validerAccesSIH({
    donner_acces,
    username,
    password,
    aDejaUnCompte = false,
}) {
    if (!donner_acces) return null;

    if (!username || username.trim() === "") {
        return "Le username est requis pour donner accès au SIH.";
    }

    if (!aDejaUnCompte && (!password || password.trim() === "")) {
        return "Le password est requis pour créer un compte.";
    }

    return null;
}

// ------------------------------------------------------------------
//  verification du type de personnel (FONCTIONNAIRE / BENEVOLE / STAGIAIRE)
// ------------------------------------------------------------------
const TYPES_PERSONNEL = ["FONCTIONNAIRE", "BENEVOLE", "STAGIAIRE"];

function normaliserTypePersonnel(typeRaw) {
    if (!typeRaw) return "FONCTIONNAIRE"; // valeur par defaut
    const type = typeRaw.toString().trim().toUpperCase();
    return TYPES_PERSONNEL.includes(type) ? type : null;
}

function validerTypePersonnel(typeRaw) {
    if (!typeRaw) return null; // absent => defaut FONCTIONNAIRE, valide
    const type = typeRaw.toString().trim().toUpperCase();
    if (!TYPES_PERSONNEL.includes(type)) {
        return "Type de personnel invalide (attendu : Fonctionnaire, Benevole ou Stagiaire).";
    }
    return null;
}

// ------------------------------------------------------------------
//  verification + normalisation des infos de stage (stagiaire_details)
//  date_fin_stage = date_entree_admin + duree_mois
// ------------------------------------------------------------------
function normaliserStagiaireDetails(raw, dateEntreeAdmin) {
    if (!raw) {
        return {
            erreur: "Les informations de stage (établissement, niveau, durée) sont requises pour un stagiaire.",
            details: null,
        };
    }

    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

        const etablissement = parsed?.etablissement?.toString().trim() || "";
        const niveau = parsed?.niveau?.toString().trim() || "";
        const filiere_parcours =
            parsed?.filiere_parcours?.toString().trim() || null;
        const duree_mois = parseInt(parsed?.duree_mois, 10);

        if (!etablissement) {
            return {
                erreur: "L'établissement du stagiaire est requis.",
                details: null,
            };
        }
        if (!niveau) {
            return {
                erreur: "Le niveau du stagiaire est requis (ex: L2, L3, M1).",
                details: null,
            };
        }
        if (!Number.isFinite(duree_mois) || duree_mois <= 0) {
            return {
                erreur: "La durée du stage (en mois) est invalide.",
                details: null,
            };
        }

        const dateFinStage = new Date(dateEntreeAdmin);
        dateFinStage.setMonth(dateFinStage.getMonth() + duree_mois);

        return {
            erreur: null,
            details: {
                etablissement,
                niveau,
                filiere_parcours,
                duree_mois,
                date_fin_stage: dateFinStage,
            },
        };
    } catch (error) {
        return {
            erreur: "Format des informations de stage invalide.",
            details: null,
        };
    }
}

// ------------------------------------------------------------------
//  verification + normalisation des infos de stage pour une MISE A JOUR
//  (sans date_entree_admin : le date_fin_stage est recalculé côté modèle
//   à partir de la date d'entrée déjà enregistrée en BDD)
// ------------------------------------------------------------------
function normaliserStagiaireDetailsPartiel(raw) {
    if (!raw) return { erreur: null, details: null }; // rien à modifier

    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

        const etablissement = parsed?.etablissement?.toString().trim() || "";
        const niveau = parsed?.niveau?.toString().trim() || "";
        const filiere_parcours =
            parsed?.filiere_parcours?.toString().trim() || null;
        const duree_mois = parseInt(parsed?.duree_mois, 10);

        if (!etablissement) {
            return {
                erreur: "L'établissement du stagiaire est requis.",
                details: null,
            };
        }
        if (!niveau) {
            return {
                erreur: "Le niveau du stagiaire est requis (ex: L2, L3, M1).",
                details: null,
            };
        }
        if (!Number.isFinite(duree_mois) || duree_mois <= 0) {
            return {
                erreur: "La durée du stage (en mois) est invalide.",
                details: null,
            };
        }

        return {
            erreur: null,
            details: { etablissement, niveau, filiere_parcours, duree_mois },
        };
    } catch (error) {
        return {
            erreur: "Format des informations de stage invalide.",
            details: null,
        };
    }
}

// ------------------------------------------------------------------
//  supprimer un fichier du disque si validation echoue
// ------------------------------------------------------------------
function supprimerFichierSiExiste(chemin) {
    const fs = require("fs");

    try {
        if (chemin && fs.existsSync(chemin)) {
            fs.unlinkSync(chemin);
        }
    } catch {}
}

module.exports = {
    validerAge,
    validerEmail,
    validerTelephone,
    validerIM,
    formatIM,
    validerGenreId,
    normaliserDiplomes,
    normaliserStatut,
    formatStatutPourClient,
    verifierUniciteBDD,
    validerAccesSIH,
    supprimerFichierSiExiste,
    validerChronologie,
    TYPES_PERSONNEL,
    normaliserTypePersonnel,
    validerTypePersonnel,
    normaliserStagiaireDetails,
    normaliserStagiaireDetailsPartiel,
};