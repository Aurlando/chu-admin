// ------------------------------------------------------------------
//  Validators — Documents administratifs
// ------------------------------------------------------------------

const SIGNATAIRES_VALIDES = ['ADAAF', 'Directeur'];

// Champs supplémentaires (au-delà du socle commun numero/date/signataire)
// requis pour chaque type de document, avec leur libellé d'erreur.
// Pour ajouter un document avec des champs obligatoires propres,
// ajouter une entrée ici (ex: attestation_stage: [{ champ: 'periode', libelle: 'La période' }]).
const CHAMPS_SUPPLEMENTAIRES_REQUIS = {
    certificat_administratif: [
        { champ: 'motif', libelle: 'Le motif' },
    ],
    attestation_non_interruption_service: [
        // Aucun champ supplémentaire requis : corps/poste/grade viennent
        // directement de la fiche de l'agent en base.
    ],
    attestation_benevolat: [
        // Aucun champ supplémentaire requis : fonction/service/date_sortie
        // viennent directement de la fiche de l'agent en base.
    ],
};

/**
 * Valide les champs communs à tous les documents : numero, date_delivrance, signataire.
 * Retourne un tableau d'erreurs (vide si tout est OK).
 */
function validerChampsCommuns({ numero, date_delivrance, signataire }) {
    const erreurs = [];

    // numero — non vide
    if (!numero || String(numero).trim() === '') {
        erreurs.push('Le numéro de référence est requis.');
    }

    // date_delivrance — date valide format ISO YYYY-MM-DD
    if (!date_delivrance) {
        erreurs.push('La date de délivrance est requise.');
    } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date_delivrance)) {
            erreurs.push('La date de délivrance doit être au format YYYY-MM-DD.');
        } else {
            const d = new Date(date_delivrance);
            if (isNaN(d.getTime())) {
                erreurs.push('La date de délivrance est invalide.');
            }
        }
    }

    // signataire — valeur exacte parmi la liste
    if (!signataire) {
        erreurs.push('Le signataire est requis.');
    } else if (!SIGNATAIRES_VALIDES.includes(signataire)) {
        erreurs.push(`Le signataire doit être l'une des valeurs suivantes : ${SIGNATAIRES_VALIDES.join(', ')}.`);
    }

    return erreurs;
}

/**
 * Valide le body pour un type de document donné : applique les
 * règles communes, puis les règles spécifiques déclarées dans
 * CHAMPS_SUPPLEMENTAIRES_REQUIS.
 * @param {string} typeDocument - clé de CHAMPS_SUPPLEMENTAIRES_REQUIS
 * @param {object} body
 * @returns {string[]} tableau d'erreurs (vide si tout est OK)
 */
function validerDocument(typeDocument, body) {
    const erreurs = validerChampsCommuns(body);

    const champsRequis = CHAMPS_SUPPLEMENTAIRES_REQUIS[typeDocument] || [];
    for (const { champ, libelle } of champsRequis) {
        if (!body[champ] || String(body[champ]).trim() === '') {
            erreurs.push(`${libelle} est requis.`);
        }
    }

    return erreurs;
}

module.exports = {
    validerDocument,
    SIGNATAIRES_VALIDES,
};