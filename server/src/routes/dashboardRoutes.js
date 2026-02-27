const express = require('express');
const router = express.Router();
const dashboardControllers = require('../controllers/dashboardControllers');

router.get('/', dashboardControllers.getDoashboardData);

module.exports = router;