const jwt = require('jsonwebtoken');
const authModels = require('../models/authModels');

async function login(req, res) {
    const { username, password } = req.body;

    if(!username || !password) {
        return res.status(400).json({message: "Champs manquqnts"});
    }

    try {
        const user = await authModels.findUserByUsername(username);

        if(!user) {
            return res.status(401).json({message: "Utilisateur introuvable"});
        }

        if(user.password_hash !== password) {
            return res.status(401).json({message: "Mot de passe incorrect"});
        }
        
        const token = jwt.sign(
            {id: user.id, username: user.username, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_TIME}
        );

        res.json({
            message: "Connexion réussie",
            token
        });
    }
    catch(error) {
        res.status(500).json({message: "Erreur serveur"})
    }
}

module.exports = {
    login,
}