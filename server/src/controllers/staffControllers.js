const { json } = require('express');
const staffModels = require('../models/staffModels');

// Paramètres acceptés dans l'URL (query string) :
//   ?search=dupont&department=Chirurgie&page=2&limit=10
//   GET /staff/show-all?search=sarah&department=Cardiology&fonction=Medecin&page=1&limit=10
// ------------------------------------------------------------------
async function getStaff(req, res) {
    try {
        const search     = req.query.search     || '';  // || '' = valeur par défaut si absent
        const department = req.query.department || '';
        const fonction   = req.query.fonction   || '';

        // parseInt(..., 10) convertit "2" (string) → 2 (number), base 10
        // || 1 et || 10 sont les valeurs par défaut si le paramètre est absent ou invalide
        const page  = parseInt(req.query.page,  10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Sécurité : on limite le nombre de résultats par page à 100
        // pour éviter qu'un client demande ?limit=999999 et surcharge la BDD
        const safeLimit = Math.min(limit, 100);  // min(ce que demande le client, 100)

        // On passe tous les filtres et la pagination au model
        const result = await staffModels.getAllStaff({
            search,
            department,
            fonction,
            page,
            limit: safeLimit,
        });

        res.status(200).json({
            message:    'Staff récupéré avec succès',
            data:       result.data,        // tableau des membres du staff
            pagination: result.pagination,  // { total, page, limit, totalPages }
        });

    } catch (error) {
        // On logue l'erreur côté serveur (visible dans le terminal)
        // mais on NE renvoie PAS les détails techniques au client
        // (risque de sécurité : révèle la structure de la BDD)
        console.error('[getStaff] Erreur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// ------------------------------------------------------------------
// Renvoie la liste des départements uniques pour le dropdown front
// ------------------------------------------------------------------
async function getDepartments(req, res) {
    try {
        const departments = await staffModels.getDistinctDepartments();
        res.status(200).json({ data: departments });
    } catch (error) {
        console.error('[getDepartments] Erreur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// ------------------------------------------------------------------
// Renvoie la liste des fonctions/job titles uniques pour le dropdown
// ------------------------------------------------------------------
async function getFonctions(req, res) {
    try {
        const fonctions = await staffModels.getDistinctFonctions();
        res.status(200).json({ data: fonctions });
    } catch (error) {
        console.error('[getFonctions] Erreur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// ------------------------------------------------------------------
// Prends tous les donnees pour le profil
// ------------------------------------------------------------------
async function getStaffProfile(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'ID invalide' });
    }

    try {
        const profile = await staffModels.getStaffById(id)

        if(!profile) {
            return res.status(404).json({ message: 'Personnel introuvable' });
        }

        res.status(200).json({
            message: 'Profil récupéré avec succès', 
            data: profile
        });
    } catch (error) {
        console.error('[getStaffPtofile] Erreur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
        
    }
}

module.exports = {
    getStaff,
    getDepartments,
    getFonctions,
    getStaffProfile,
};
