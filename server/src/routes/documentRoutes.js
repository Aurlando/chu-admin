const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// POST /documents/certificat-administratif/:id
// Génère et télécharge le certificat administratif pour l'agent :id
router.post('/certificat-administratif/:id', documentController.generateDocument('certificat_administratif'));

// POST /documents/attestation-non-interruption-service/:id
// Génère et télécharge l'attestation de non-interruption de service pour l'agent :id
router.post(
    '/attestation-non-interruption-service/:id',
    documentController.generateDocument('attestation_non_interruption_service'),
);

// Pour ajouter un nouveau document à l'avenir :
//   1. Déposer le template .docx dans server/templates/
//   2. Ajouter une entrée dans TYPES_DOCUMENTS (documentService.js)
//   3. Ajouter les champs requis dans CHAMPS_SUPPLEMENTAIRES_REQUIS (documentValidators.js)
//   4. Ajouter une ligne ici : router.post('/mon-document/:id', documentController.generateDocument('mon_document'));

module.exports = router;
