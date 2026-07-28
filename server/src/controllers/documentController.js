const documentService = require('../services/documentService');
const { validerDocument } = require('../validators/documentValidators');

// Message d'erreur 500 personnalisé par type de document (facultatif,
// sinon un message générique est utilisé).
const MESSAGES_ERREUR_PAR_TYPE = {
    certificat_administratif: 'Erreur lors de la génération du certificat.',
    attestation_non_interruption_service: "Erreur lors de la génération de l'attestation.",
    attestation_benevolat: "Erreur lors de la génération de l'attestation de bénévolat.",
};

// Libellés lisibles des types_personnel, pour le message d'erreur 400
// renvoyé quand un document est demandé pour un agent du mauvais type
// (ex: attestation de bénévolat demandée pour un fonctionnaire).
const LIBELLES_TYPE_PERSONNEL = {
    BENEVOLE: 'bénévoles',
    FONCTIONNAIRE: 'fonctionnaires',
    STAGIAIRE: 'stagiaires',
};

/**
 * Fabrique un handler Express pour un type de document donné.
 * Toute la logique (validation, récupération agent/signataire,
 * remplissage du template, audit log) est déjà générique côté
 * documentService — ce handler n'a donc pas besoin d'être dupliqué
 * pour chaque nouveau document.
 *
 * @param {string} typeDocument - clé de TYPES_DOCUMENTS (documentService.js)
 */
function generateDocument(typeDocument) {
    return async function (req, res) {
        const personnelId = parseInt(req.params.id, 10);

        if (isNaN(personnelId) || personnelId <= 0) {
            return res.status(400).json({
                status: 'error',
                message: "L'identifiant de l'agent est invalide.",
            });
        }

        // Validation du body (règles communes + règles propres au type)
        const erreurs = validerDocument(typeDocument, req.body);
        if (erreurs.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Données invalides.',
                erreurs,
            });
        }

        const { numero, date_delivrance, signataire, ...champsSupplementaires } = req.body;

        try {
            const adminId = req.user?.id;

            const result = await documentService.genererDocument(typeDocument, {
                personnelId,
                numero,
                date_delivrance,
                signataire,
                adminId,
                ...champsSupplementaires, // ex: motif pour le certificat administratif
            });

            if (result.notFound) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Agent introuvable.',
                });
            }

            if (result.typeInvalide) {
                const libelle = LIBELLES_TYPE_PERSONNEL[result.typeRequis] || result.typeRequis;
                return res.status(400).json({
                    status: 'error',
                    message: `Ce document est réservé aux agents ${libelle}.`,
                });
            }

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.send(result.buffer);

        } catch (error) {
            console.error(`[generateDocument:${typeDocument}] Erreur :`, error);
            res.status(500).json({
                status: 'error',
                message: MESSAGES_ERREUR_PAR_TYPE[typeDocument] || 'Erreur lors de la génération du document.',
            });
        }
    };
}

module.exports = {
    generateDocument,
};