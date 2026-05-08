const dashboardModels = require('../models/dashboardModels');

async function getDashboardData(req, res) {
    try {
        const stats = await dashboardModels.getDashboardStats();
        res.status(200).json({
            message: "Données du dashboard récupérées avec succès",
            data: stats
        });
    } catch (error) {
        console.error('[getDashboardData] Erreur :', error);
        res.status(500).json({
            message: "Erreur lors de la récupération des statistiques"
        });
    }
}

async function getDashboardLogs(req, res) {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    try {
        const logs = await dashboardModels.getRecentAuditLogs({ limit });
        res.status(200).json({
            message: "Activité système récupérée avec succès",
            data: logs,
        });
    } catch (error) {
        console.error('[getDashboardLogs] Erreur :', error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

module.exports = {
    getDashboardData,
    getDashboardLogs,
}