const express = require('express');
const router = express.Router();
const dashboardControllers = require('../controllers/dashboardControllers');

// Stats + graphe
router.get('/', dashboardControllers.getDashboardData);

// Activité système : derniers logs d'audit (?limit=10)
router.get('/activity-log', dashboardControllers.getDashboardLogs);

module.exports = router;