const documentService = require('../services/documentService');
const { validerCertificatAdministratif } = require('../validators/documentValidators');

/**
 * POST /api/documents/certificat-administratif/:id
 * Génère et renvoie le certificat administratif en téléchargement direct.
 */
async function generateCertificat(req, res) {
    const personnelId = parseInt(req.params.id, 10);

    if (isNaN(personnelId) || personnelId <= 0) {
        return res.status(400).json({
            status: 'error',
            message: "L'identifiant de l'agent est invalide.",
        });
    }

    const { numero, motif, date_delivrance, signataire } = req.body;

    // Validation du body
    const erreurs = validerCertificatAdministratif({ numero, motif, date_delivrance, signataire });
    if (erreurs.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Données invalides.',
            erreurs,
        });
    }

    try {
        const adminId = req.user?.id;

        const result = await documentService.genererCertificatAdministratif({
            personnelId,
            numero,
            motif,
            date_delivrance,
            signataire,
            adminId,
        });

        if (result.notFound) {
            return res.status(404).json({
                status: 'error',
                message: 'Agent introuvable.',
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.buffer);

    } catch (error) {
        console.error('[generateCertificat] Erreur :', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la génération du certificat.',
        });
    }
}

module.exports = {
    generateCertificat,
};
