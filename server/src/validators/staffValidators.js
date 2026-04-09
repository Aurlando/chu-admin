const pool = require('../config/db');

// ------------------------------------------------------------------
//  verification de l'age (>= 16 ans)
// ------------------------------------------------------------------
function validerAge(date_naissance){
    const naissance = new Date(date_naissance);

    // verification si date de naissance n'est pas un nombre
    if(isNaN(naissance.getTime())) {
        return "Date de naissance invalide.";
    }

    const today = new Date();
    let age = today.getFullYear() - naissance.getFullYear(); // calcul de l'age en annee

    // verification si l'anniversaire n'est pas encore passé
    // monthdiff < 0 => annif pas encore passé
    // monthdiff === 0 et jour pas encore passé => annif pas encore passé
    const monthDiff = today.getMonth() - naissance.getMonth();
    if(monthDiff < 0 || (monthDiff === 0 && today.getDate() < naissance.getDate())) {
        age--;
    }

    if(age <= 16) {
        return "L'âge doit être supérieur à 16 ans.";
    }

    return null; // null => valide
}

/// ------------------------------------------------------------------
//  verification de l'email
// ------------------------------------------------------------------
function validerEmail(email) {
    if(!email) return null;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // @gmail.com, @chu-anosiala.com, @blabla.com 
    if(!regex.test(email)) {
        return "L'adresse mail n'est pas valide.";
    }

    return null;
}

// ------------------------------------------------------------------
//  verification du numero de telephone (obligatoire)
// ------------------------------------------------------------------
// 0340000000 - 034 00 000 00 - +261 34 00 000 00
function validerTelephone(telephone) {
    if(!telephone) return "Le numero de telephone est requis.";

    const tel = telephone.trim().replace(/[\s\-]/g, ""); // retire les espaces et tirets
    const telRegex = /^(\+261\d{9}|0\d{9})$/;

    if(!telRegex.test(tel)) {
        return "Le numero de telephone n'est pas valide (format attendu : 034 00 000 00 ou +261 34 000 0000).";
    }

    return null;
}

// ------------------------------------------------------------------
//  verification du matricule (obligatoire)
// ------------------------------------------------------------------
function validerIM(im) {
    if(!im) return "Le matricule est requis."

    const imFormatter = im.toString().trim().replace(/\s+/g, "");
    
    if(imFormatter.length !== 6) {
        return "Le matricule doit contenir 6 chiffres."
    }

    if(!/^\d+$/.test(imFormatter)) {
        return "Le matricule doit contenir uniquement des chiffres."
    }

    return null;
}

// ------------------------------------------------------------------
//  tranformer l'Im 123456 en 123 456
// ------------------------------------------------------------------
function formatIM(im) {
    const chiffres = im.toString().trim().replace(/\s+/g, "");
    
    if(chiffres.length >= 6) {
        return `${chiffres.slice(0, 3)} ${chiffres.slice(3)}`
    }

    return chiffres;
}

// ------------------------------------------------------------------
//  verification des diplomes et normalisation de format
// ------------------------------------------------------------------
function normaliserDiplomes(diplomesRaw) {
    if(!diplomesRaw) {
        return { erreur: null, diplomes: [] } // diplomes non obligatoires
    }

    try {
        const diplomesParsed = JSON.parse(diplomesRaw);

        if(!Array.isArray(diplomesParsed)) throw new Error("Format Diplomes invalide.");

        const diplomes = diplomesParsed.map(d => ({
            // id present => modification, sinon creation
            ...(d?.id ? { id: parseInt(d.id, 10) } : {}),
            libelle: d.libelle?.trim() || "",
            etablissement: d.etablissement?.trim() || null,
            annee_obtention: d?.annee_obtention && Number.isFinite(Number(d.annee_obtention)) ? Number(d.annee_obtention) : null,
            est_principal: Boolean(d?.est_principal),
        }))
        .filter(d => d.libelle !== "");

        return { erreur: null, diplomes };
    } catch (error) {
        return { erreur: "Format Diplomes invalide.", diplomes: [] };
    }
}

// ------------------------------------------------------------------
//  verification unicite : im, telephone, email, excludedId
// ------------------------------------------------------------------
async function verifierUniciteBDD({ im, telephone, email, excludedId = null }) {
    const exclusion = excludedId ? `AND id != $2` : ""; // si excludedId existe, on l'exclut de la verification
    
    if(im !== undefined) {
        const check = await pool.query(
            `SELECT id FROM chu.personnel WHERE im = $1 ${exclusion}`,
            excludedId ? [im, excludedId] : [im]
        );
        if(check.rows.length > 0) return "Ce matricule existe déjà.";
    }

    if(telephone !== undefined && telephone !== null) {
        const check = await pool.query(
            `SELECT id FROM chu.personnel WHERE telephone = $1 ${exclusion}`,
            excludedId ? [telephone, excludedId] : [telephone]
        );
        if(check.rows.length > 0) return "Ce numero de telephone existe déjà.";
    }

    if(email !== undefined && email !== null) {
        const check = await pool.query(
            `SELECT id FROM chu.personnel WHERE email = $1 ${exclusion}`,
            excludedId ? [email, excludedId] : [email]
        );
        if(check.rows.length > 0) return "Cet email existe déjà.";
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
function validerAccesSIH({ donner_acces, username, password, aDejaUnCompte = false }) {
    if(!donner_acces) return null;

    if(!username || username.trim() === "") {
        return "Le username est requis pour donner accès au SIH.";
    }

    if(!aDejaUnCompte && (!password || password.trim() === "")) {
        return "Le password est requis pour créer un compte.";
    }

    return null;
}

// ------------------------------------------------------------------
//  supprimer un fichier du disque si validation echoue
// ------------------------------------------------------------------
function supprimerFichierSiExiste(chemin) {
    const fs = require('fs');

    try {
        if(chemin && fs.existsSync(chemin)) {
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
    normaliserDiplomes,
    verifierUniciteBDD,
    validerAccesSIH,
    supprimerFichierSiExiste
}