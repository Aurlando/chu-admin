const express = require('express');
const router = express.Router();
const avancementsControllers = require('../controllers/avancementsControllers');

router.get('/proches', avancementsControllers.getProches);
router.get('/stats', avancementsControllers.getStatsNotification);
router.get('/grades/:categorie', avancementsControllers.getGradesParCategorie);
router.get('/:personnelId', avancementsControllers.getHistorique);
router.post('/:personnelId', avancementsControllers.effectuerAvancement);

module.exports = router;