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

module.exports = {
    getDashboardData,
}