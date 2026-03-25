const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const staffModels = require("../models/staffModels");

// Paramètres acceptés dans l'URL (query string) :
//   ?search=dupont&department=Chirurgie&page=2&limit=10
//   GET /staff/show-all?search=sarah&department=Cardiology&fonction=Medecin&page=1&limit=10
// ------------------------------------------------------------------
async function getStaff(req, res) {
    try {
        const search = req.query.search || ""; // || '' = valeur par défaut si absent
        const department = req.query.department || "";
        const fonction = req.query.fonction || "";

        // parseInt(..., 10) convertit "2" (string) → 2 (number), base 10
        // || 1 et || 10 sont les valeurs par défaut si le paramètre est absent ou invalide
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Sécurité : on limite le nombre de résultats par page à 100
        // pour éviter qu'un client demande ?limit=999999 et surcharge la BDD
        const safeLimit = Math.min(limit, 100); // min(ce que demande le client, 100)

        // On passe tous les filtres et la pagination au model
        const result = await staffModels.getAllStaff({
            search,
            department,
            fonction,
            page,
            limit: safeLimit,
        });

        res.status(200).json({
            message: "Staff récupéré avec succès",
            data: result.data, // tableau des membres du staff
            pagination: result.pagination, // { total, page, limit, totalPages }
        });
    } catch (error) {
        // On logue l'erreur côté serveur (visible dans le terminal)
        // mais on NE renvoie PAS les détails techniques au client
        // (risque de sécurité : révèle la structure de la BDD)
        console.error("[getStaff] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
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
        console.error("[getDepartments] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
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
        console.error("[getFonctions] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ------------------------------------------------------------------
// Prends tous les donnees pour le profil
// ------------------------------------------------------------------
async function getStaffProfile(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "ID invalide" });
    }

    try {
        const profile = await staffModels.getStaffById(id);

        if (!profile) {
            return res.status(404).json({ message: "Personnel introuvable" });
        }

        res.status(200).json({
            message: "Profil récupéré avec succès",
            data: profile,
        });
    } catch (error) {
        console.error("[getStaffPtofile] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ------------------------------------------------------------------
// Creer un nouveau personnel
// ------------------------------------------------------------------
async function addStaff(req, res) {
    // 1-- Validation des champs obligatoires (Tous arrivent en string, conversion a faire si besoin)
    const {
        nom,
        prenoms,
        im,
        date_naissance,
        categorie,
        classe,
        echelon,
        specialite,
        telephone,
        email,
        service_id,
        fonction_id,
        statut,
        donner_access,
        username,
        password,
        diplomes: diplomesRaw,
    } = req.body;

    // champs obligatoire pour creer un personnel
    const champsObligatoires = {
        nom,
        prenoms,
        im,
        date_naissance,
        categorie,
        classe,
        echelon,
        service_id,
        fonction_id,
        statut,
    };
    const manquants = Object.entries(champsObligatoires) // transforme l'objet en tableau de tableux; {nom: "", prenoms: "Rakoto", ...} ==> [["nom", ""], ["prenoms", "Rakoto"], ...]
        .filter(([_, valeur]) => !valeur || valeur.toString().trim() === "") // ce qui n'ont pas de valeur ou vide
        .map(([cle]) => cle); // garder only nom du champ

    if (manquants.length > 0) {
        // supprimer le fichier uploaded si validation echoue evitant de stocker des fichiers dans le disque pour ne pas encombrer le serveur
        // fs.unlinkSync() est synchrone, on bloque ici jusqu'a suppression
        if (req.file) fs.unlinkSync(req.file.path);

        return res.status(400).json({
            message: `Champs obligatoires manquants : ${manquants.join(", ")}`,
        });
    }

    // 2-- Validation acces SIH (conversion du string "true"/"false" en boolean)
    const accesBoolean = donner_access === "true";
    if (accesBoolean) {
        if (!username || !password) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                message:
                    "username et password sont requis pour donner accès au SIH.",
            });
        }
    }

    // 3-- Transformation des diplomes (JSON string → tableau d'objets)
    let diplomes = [];
    if (diplomesRaw) {
        try {
            const parsed = JSON.parse(diplomesRaw);
            if (!Array.isArray(parsed)) throw new Error(); // doit être un tableau

            diplomes = parsed
                .map((d) => ({
                    libelle: d?.libelle?.toString().trim() || "",
                    etablissement: d?.etablissement?.toString().trim() || null,
                    annee_obtention: d?.annee_obtention
                        ? Number(d.annee_obtention)
                        : null,
                    est_principal: Boolean(d?.est_principal),
                }))
                .filter((d) => d.libelle !== "");
        } catch (parseError) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                message: "Format des diplomes invalide.",
            });
        }
    }

    // 4-- Hachage du mot de passe
    let password_hash = null;
    if (accesBoolean) {
        password_hash = await bcrypt.hash(password, 10);
    }

    // 5-- Nommer photo de profil uploaded
    const photoTemp = req.file ? req.file.filename : null; // nom temporaire si photo uploaded
    const photoDefaut = "default-avatar.png"; // photo par defaut si pas d'upload

    try {
        // 6-- Insertion dans le BDD
        const { personnelId, personnelIm } = await staffModels.addPersonnel({
            nom: nom.trim().toUpperCase(),
            prenoms: prenoms.trim(),
            im: parseInt(im.trim().replace(/\s+/g, ""), 10),
            date_naissance,
            categorie,
            classe,
            echelon,
            specialite: specialite || null,
            telephone: telephone || null,
            email: email || null,
            service_id: parseInt(service_id, 10),
            fonction_id: parseInt(fonction_id, 10),
            statut,
            photo_profil: req.file ? `photo-profil-${im}.png` : photoDefaut,
            diplomes,
            donner_acces: accesBoolean,
            username: accesBoolean ? username.trim() : null,
            password_hash: accesBoolean ? password_hash : null,
        });

        // 7-- Renommer le fichier photo
        if (req.file) {
            const dossierPhotos = path.join(__dirname, "..", "..", "uploads");
            const ancienChemin = path.join(dossierPhotos, req.file.filename);
            const nouveauNom = `photo-profil-${personnelIm}.png`;
            const nouveauChemin = path.join(dossierPhotos, nouveauNom);

            fs.renameSync(ancienChemin, nouveauChemin);
        }

        res.status(201).json({
            message: "personnel ajouté avec succès",
            personnelId,
            matricule: personnelIm,
        });
    } catch (error) {
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch {}
        }
        console.error("[addStaff] Erreur :", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Ce matricule ou username existe déjà.",
            });
        }

        if (error.code === "22P02" || error.code === "23502") {
            return res.status(400).json({
                message:
                    "Données invalides, veuillez vérifier les champs saisis.",
            });
        }

        res.status(500).json({
            message: "Erreur interne du serveur",
        });
    }
}

module.exports = {
    getStaff,
    getDepartments,
    getFonctions,
    getStaffProfile,
    addStaff,
};
