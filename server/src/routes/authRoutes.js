const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authControllers');

router.post('/login', authControllers.login);
router.get('/test', (req, res) => {
    res.json({message: "Test réussi"});
})
router.post('/test', (req, res) => {
    const {data} = req.body;
    res.json({message: "Test Post réussi", data});
})

module.exports = router;