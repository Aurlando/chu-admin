const express = require('express');
const router = express.Router();
const structureControllers = require('../controllers/structureControllers');

router.get('/recap', structureControllers.getRecap);
router.get('/recap/export', structureControllers.exportRecapExcel);
router.get('/detail/:serviceId/:groupeId', structureControllers.getDetailServiceGroupe);

module.exports = router;