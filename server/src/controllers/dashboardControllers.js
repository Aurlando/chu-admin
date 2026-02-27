const dashboardModels = require('../models/dashboardModels');

async function getDoashboardData(req, res) {
    try {
        const stats = await dashboardModels.getDashboardStats();

        res.status(200).json({
            message: "Données du dashboard récupérées avec succès",
            data: stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Une erreur est survenue lors de la récupération des statistiques" });
    }
}

module.exports = {
    getDoashboardData,
}