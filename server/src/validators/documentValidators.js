// ------------------------------------------------------------------
//  Validators — Documents administratifs
// ------------------------------------------------------------------

const SIGNATAIRES_VALIDES = ['ADAAF', 'Directeur'];

/**
 * Valide le body pour la génération du certificat administratif.
 * Retourne un tableau d'erreurs (vide si tout est OK).
 */
function validerCertificatAdministratif({ numero, motif, date_delivrance, signataire }) {
    const erreurs = [];

    // numero — non vide
    if (!numero || String(numero).trim() === '') {
        erreurs.push('Le numéro de référence est requis.');
    }

    // motif — non vide
    if (!motif || String(motif).trim() === '') {
        erreurs.push('Le motif est requis.');
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

module.exports = {
    validerCertificatAdministratif,
    SIGNATAIRES_VALIDES,
};
