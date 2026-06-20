const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// POST /documents/certificat-administratif/:id
// Génère et télécharge le certificat administratif pour l'agent :id
router.post('/certificat-administratif/:id', documentController.generateCertificat);

module.exports = router;
