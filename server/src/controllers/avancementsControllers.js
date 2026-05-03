const avancementsModels = require('../models/avancementsModels');

async function getGradesParCategorie(req, res) {
    const { categorie } = req.params;

    // Valider que la catégorie est I à X
    const categoriesValides = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
    if (!categoriesValides.includes(categorie)) {
        return res.status(400).json({ message: 'Catégorie invalide (I à X)' });
    }

    try {
        const grades = await avancementsModels.getGradesParCategorie(categorie);
        res.status(200).json({ data: grades });
    } catch (error) {
        console.error('[getGradesParCategorie] Erreur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

async function getHistorique(req, res) {
    const personnelId = parseInt(req.params.personnelId, 10);

    if (isNaN(personnelId) || personnelId <= 0) {
        return res.status(400).json({ message: 'ID invalide' });
    }

    try {
        const historique = await avancementsModels.getHistoriqueAvancements(personnelId);
        res.status(200).json({ data: historique });
    } catch (error) {
        console.error('[getHistorique] Erreur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

async function getProches(req, res) {
    const mois = parseInt(req.query.mois, 10) || 3;

    const moisSafe = Math.min(Math.max(mois, 1), 12);

    try {
        const proches = await avancementsModels.getAvancementsProches(moisSafe);
        res.status(200).json({
            message: `Personnels à avancer dans les ${moisSafe} prochains mois`,
            data:    proches,
        });
    } catch (error) {
        console.error('[getProches] Erreur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

async function effectuerAvancement(req, res) {
    const personnelId = parseInt(req.params.personnelId, 10);

    if (isNaN(personnelId) || personnelId <= 0) {
        return res.status(400).json({ message: 'ID invalide' });
    }

    const { num_arrete, date_signature, date_effet } = req.body;

    if (!num_arrete || !date_signature || !date_effet) {
        return res.status(400).json({
            message: "num_arrete, date_signature et date_effet sont obligatoires",
        });
    }

    if (isNaN(new Date(date_signature).getTime()) || isNaN(new Date(date_effet).getTime())) {
        return res.status(400).json({ message: "Dates invalides" });
    }

    try {
        const result = await avancementsModels.effectuerAvancement({
            personnelId,
            num_arrete: num_arrete.trim(),
            date_signature,
            date_effet,
        });

        if (!result.found) {
            return res.status(404).json({ message: "Personnel introuvable" });
        }

        if (result.erreur) {
            return res.status(409).json({ message: result.erreur });
        }

        return res.status(201).json({
            message: `Avancement effectué : ${result.type_mouvement}`,
            grade_obtenu: result.grade_obtenu,
            type_mouvement: result.type_mouvement,
            date_prochain_avancement: result.date_prochain_avancement,
        });

    } catch (error) {
        console.error("[effectuerAvancement] Erreur : ", error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

module.exports = {
    getGradesParCategorie,
    getHistorique,
    getProches,
    effectuerAvancement,
};
