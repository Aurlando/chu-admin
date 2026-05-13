const auditModels = require('../models/auditModels');

async function getAuditLogs(req, res) {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    try {
        const result = await auditModels.getAllAuditLogs({ page, limit });
        res.status(200).json({
            status: "success",
            message: "Historique des actions récupéré avec succès",
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('[getAuditLogs] Erreur :', error);
        res.status(500).json({
            status: "error",
            message: "Erreur lors de la récupération des logs d'audit"
        });
    }
}

module.exports = {
    getAuditLogs,
};
