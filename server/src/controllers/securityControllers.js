const securityModels = require("../models/securityModels");

// Afficher tous les comptes
async function getAccounts(req, res) {
    const search = req.query.search || "";
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 10, 1),
        100,
    );

    try {
        const result = await securityModels.getAccounts({
            search,
            page,
            limit,
        });
        res.status(200).json({
            message: "Comptes récupérés",
            data: result.data,
            pagination: result.pagination,
            totalComptesActifs: result.totalComptesActifs,
        });
    } catch (error) {
        console.error("[getAccounts] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Réinitialiser le mot de passe d'un compte
async function resetPassword(req, res) {
    const accountId = parseInt(req.params.id, 10);

    if (isNaN(accountId) || accountId <= 0) {
        return res.status(400).json({ message: "ID invalide" });
    }

    const { new_password } = req.body;

    if (typeof new_password !== "string" || new_password.trim().length < 6) {
        return res
            .status(400)
            .json({
                message:
                    "Le mot de passe doit être une chaîne d'au moins 6 caractères.",
            });
    }

    const adminId = req.user.id;

    try {
        const result = await securityModels.resetPassword({
            accountId,
            newPassword: new_password.trim(),
            adminId,
        });

        if (!result.found) {
            return res.status(404).json({ message: "Compte introuvable" });
        }

        res.status(200).json({
            message: "Mot de passe réinitialisé avec succès",
        });
    } catch (error) {
        console.error("[resetPassword] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Activer/désactiver un compte
async function toggleActif(req, res) {
    const accountId = parseInt(req.params.id, 10);

    if (isNaN(accountId) || accountId <= 0) {
        return res.status(400).json({ message: "ID invalide" });
    }

    const adminId = req.user.id;

    try {
        const result = await securityModels.toggleActif({ accountId, adminId });

        if (!result.found) {
            return res.status(404).json({ message: "Compte introuvable" });
        }

        res.status(200).json({
            message: result.actif
                ? "Compte activé avec succès"
                : "Compte désactivé avec succès",
            actif: result.actif,
        });
    } catch (error) {
        console.error("[toggleActif] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Afficher l'historique des actions
async function getAuditLog(req, res) {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 20, 1),
        100,
    );

    try {
        const result = await securityModels.getAuditLog({ page, limit });
        res.status(200).json({
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error("[getAuditLog] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

module.exports = {
    getAccounts,
    resetPassword,
    toggleActif,
    getAuditLog,
};
