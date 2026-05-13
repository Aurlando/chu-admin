const express = require('express');
const router = express.Router();
const auditControllers = require('../controllers/auditControllers');

// Route protégée par verifyToken et authorizeRoles('admin') dans server.js
router.get('/', auditControllers.getAuditLogs);

module.exports = router;
