const express = require("express");
const router = express.Router();
const securityControllers = require("../controllers/securityControllers");

// verifyToken + authorizeRoles('admin') appliqués globalement dans server.js

// Afficher tous les comptes
router.get("/", securityControllers.getAccounts);

// Réinitialiser le mot de passe d'un compte
router.patch("/:id/reset-password", securityControllers.resetPassword);

// Activer/désactiver un compte
router.patch("/:id/toggle-actif", securityControllers.toggleActif);

// Afficher l'historique des actions
router.get("/audit-log", securityControllers.getAuditLog);

module.exports = router;
    