const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const staffModels = require("../models/staffModels");
const validators = require("../validators/staffValidators");

// Paramètres acceptés dans l'URL (query string) :
//   ?search=dupont&department=Chirurgie&page=2&limit=10
//   GET /staff/show-all?search=sarah&department=Cardiology&fonction=Medecin&page=1&limit=10
// ── LISTE ─────────────────────────────────────────────────────────
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

// ── DROPDOWNS ─────────────────────────────────────────────────────

// ------------------------------------------------------------------
//   Departements
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
//   Fonctions
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
//   Genres
// ------------------------------------------------------------------
async function getGenres(req, res) {
    try {
        const genres = await staffModels.getDistinctGenres();
        res.status(200).json({ data: genres });
    } catch (error) {
        console.error("[getGenres] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── PROFIL ────────────────────────────────────────────────────────
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
        console.error("[getStaffProfile] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── AJOUT ─────────────────────────────────────────────────────────
async function addStaff(req, res) {
    const cheminFichier = req.file?.path; // raccourci pour nettoyage en cas d'erreur

    // Helper pour repondre avec erreur 400 et supprimer le fichier, eviter repetition du verification
    const erreur400 = (message) => {
        validators.supprimerFichierSiExiste(cheminFichier);
        return res.status(400).json({ message });
    };
    // ── 1. Champs obligatoires ────────────────────────────────────
    const {
        nom,
        prenoms,
        im,
        date_naissance,
        categorie,
        classe,
        echelon,
        id_grade_actuel,
        num_arrete,
        date_effet,
        specialite,
        telephone,
        email,
        service_id,
        fonction_id,
        genre_id,
        statut,
        donner_access,
        donner_acces,
        username,
        password,
        role,
        date_entree_admin,
        corps,
        diplomes: diplomesRaw,
    } = req.body;

    // ── Résolution du grade : id_grade_actuel (si fourni) OU
    //    lookup BDD depuis categorie + classe + echelon
    //    Pour la classe STAGIAIRE, l'échelon est optionnel
    const estStagiaire = classe?.toString().toUpperCase() === "STAGIAIRE";
    let gradeIdResolu = id_grade_actuel;
    if (!gradeIdResolu && categorie && classe && (echelon || estStagiaire)) {
        const gradeFound = await staffModels.trouverGrade({
            categorie,
            classe,
            echelon: estStagiaire ? null : echelon,
        });
        if (gradeFound) gradeIdResolu = String(gradeFound.id_grade);
    }

    // champs obligatoire pour creer un personnel
    const champsObligatoires = {
        nom,
        prenoms,
        im,
        date_naissance,
        telephone,
        service_id,
        fonction_id,
        statut,
        date_effet,
    };
    const manquants = Object.entries(champsObligatoires)
        .filter(([_, valeur]) => !valeur || valeur.toString().trim() === "")
        .map(([cle]) => cle);

    if (manquants.length > 0) {
        validators.supprimerFichierSiExiste(cheminFichier);
        return res.status(400).json({
            message: `Champs obligatoires manquants : ${manquants.join(", ")}`,
        });
    }

    // Si le grade n'a pas pu être résolu
    // (uniquement si des infos de grade ont été fournies mais ne correspondent à rien)
    if (!gradeIdResolu && (categorie || classe)) {
        validators.supprimerFichierSiExiste(cheminFichier);
        return res.status(400).json({
            message: estStagiaire
                ? `Grade STAGIAIRE introuvable pour la catégorie ${categorie}. Veuillez vérifier la configuration des grades.`
                : `Grade introuvable pour la combinaison : Catégorie ${categorie}, Classe ${classe}, Échelon ${echelon}. Veuillez vérifier la configuration des grades.`,
        });
    }

    const serviceId = parseInt(service_id, 10);
    const fonctionId = parseInt(fonction_id, 10);
    const gradeId = parseInt(gradeIdResolu, 10);
    if (Number.isNaN(serviceId) || serviceId <= 0) {
        return erreur400("service_id invalide");
    }
    if (Number.isNaN(fonctionId) || fonctionId <= 0) {
        return erreur400("fonction_id invalide");
    }
    if (Number.isNaN(gradeId) || gradeId <= 0) {
        return erreur400("id_grade_actuel invalide");
    }

    const statutNormalise = validators.normaliserStatut(statut);
    if (!statutNormalise) return erreur400("Statut invalide");

    // ── 2. Validations métier ─────────────────────────────────────
    const erreurIM = validators.validerIM(im);
    if (erreurIM) return erreur400(erreurIM);

    const erreurAge = validators.validerAge(date_naissance);
    if (erreurAge) return erreur400(erreurAge);

    const erreurEntree = validators.validerChronologie(
        date_naissance,
        date_entree_admin,
        "date d'entrée",
    );
    if (erreurEntree) return erreur400(erreurEntree);

    const erreurEffet = validators.validerChronologie(
        date_naissance,
        date_effet,
        "date d'effet",
    );
    if (erreurEffet) return erreur400(erreurEffet);

    const erreurTel = validators.validerTelephone(telephone);
    if (erreurTel) return erreur400(erreurTel);

    const erreurEmail = validators.validerEmail(email);
    if (erreurEmail) return erreur400(erreurEmail);

    // ── genre_id ──────────────────────────────────────────────────
    const erreurGenre = await validators.validerGenreId(genre_id);
    if (erreurGenre) return erreur400(erreurGenre);

    // ── 3. Accès SIH ──────────────────────────────────────────────
    const accesBoolean = (donner_access ?? donner_acces) === "true";
    const erreurSIH = validators.validerAccesSIH({
        donner_acces: accesBoolean,
        username,
        password,
        aDejaUnCompte: false,
    });
    if (erreurSIH) return erreur400(erreurSIH);

    // ── 4. Diplômes ───────────────────────────────────────────────
    const { erreur: erreurDiplomes, diplomes } =
        validators.normaliserDiplomes(diplomesRaw);
    if (erreurDiplomes) return erreur400(erreurDiplomes);

    // ── 5. IM normalisé + unicité BDD ─────────────────────────────
    const imNormalise = validators.formatIM(im);

    const erreurUnicite = await validators.verifierUniciteBDD({
        im: imNormalise,
        telephone: telephone?.trim(),
        email: email?.trim() || null,
    });
    if (erreurUnicite) {
        validators.supprimerFichierSiExiste(cheminFichier);
        return res.status(409).json({ message: erreurUnicite });
    }

    // ── 6. Hachage mot de passe ───────────────────────────────────
    let password_hash = null;
    if (accesBoolean) {
        password_hash = await bcrypt.hash(password, 10);
    }

    // ── 7. Insertion BDD ──────────────────────────────────────────
    try {
        const { personnelId, personnelIm } = await staffModels.addPersonnel({
            nom: nom.trim().toUpperCase(),
            prenoms: prenoms
                .trim()
                .split(" ")
                .map(
                    (p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(),
                )
                .join(" "),
            im: imNormalise,
            date_naissance,
            id_grade_actuel: gradeId,
            // Supporte "num_arrete" (nom API) ET "arrete" (ancien nom frontend)
            num_arrete: num_arrete || req.body.arrete || null,
            date_effet,
            specialite: specialite?.trim() || null,
            corps: corps?.trim() || null,
            telephone: telephone.trim(),
            email: email?.trim() || null,
            service_id: serviceId,
            fonction_id: fonctionId,
            genre_id: genre_id ? parseInt(genre_id, 10) : null,
            statut: statutNormalise,
            photo_profil: req.file
                ? `photo-profil-${imNormalise.replaceAll(" ", "")}.png`
                : "default-avatar.png",
            diplomes,
            donner_acces: accesBoolean,
            username: accesBoolean ? username.trim() : null,
            password_hash,
            role: accesBoolean ? role : "user",
            adminId: req.user?.id,
            date_entree_admin,
        });

        // ── 8. Renommer le fichier photo ──────────────────────────
        if (req.file) {
            const dossier = path.join(__dirname, "..", "..", "uploads");
            const ancienChemin = path.join(dossier, req.file.filename);
            const nouveauNom = `photo-profil-${personnelIm.toString().replaceAll(" ", "")}.png`;
            const nouveauChemin = path.join(dossier, nouveauNom);

            try {
                fs.renameSync(ancienChemin, nouveauChemin);
            } catch (error) {
                validators.supprimerFichierSiExiste(ancienChemin);
                console.error("[addStaff] Erreur renommage photo :", error);
                return res
                    .status(500)
                    .json({ message: "Erreur lors du traitement de la photo" });
            }
        }

        res.status(201).json({
            message: "Personnel ajouté avec succès",
            personnelId,
            matricule: personnelIm,
        });
    } catch (error) {
        validators.supprimerFichierSiExiste(cheminFichier);
        console.error("[addStaff] Erreur :", error);
        if (error.code === "P2002")
            return res
                .status(409)
                .json({ message: "Ce matricule ou username existe déjà." });
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// PATCH /staff/update/:id
// ── UPDATE ─────────────────────────────────────────────────────────
async function updateStaff(req, res) {
    const id = parseInt(req.params.id, 10);

    // ── 1. Valider l'id ───────────────────────────────────────────
    if (isNaN(id) || id <= 0) {
        validators.supprimerFichierSiExiste(req.file?.path);
        return res.status(400).json({ message: "ID invalide" });
    }

    // ── 2. Vérifier que le personnel existe ───────────────────────
    let existant;
    try {
        existant = await staffModels.getStaffById(id);
    } catch (error) {
        validators.supprimerFichierSiExiste(req.file?.path);
        console.error("[updateStaff] Erreur récupération profil :", error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }

    if (!existant) {
        validators.supprimerFichierSiExiste(req.file?.path);
        return res.status(404).json({ message: "Personnel introuvable" });
    }

    // Helper : lit req.body et retourne undifined si le champ est absent/vide
    const body = req.body;
    const ouString = (valeur) =>
        valeur !== undefined && valeur.trim?.() !== ""
            ? valeur.trim()
            : undefined;
    const ouInt = (valeur) => {
        const num = parseInt(valeur, 10);
        return isNaN(num) ? undefined : num;
    };

    // ── 3. Extraire les champs présents dans le body ──────────────
    const nom = ouString(body.nom);
    const prenoms = ouString(body.prenoms);
    const date_naissance = ouString(body.date_naissance);
    const categorie = ouString(body.categorie);
    const classe = ouString(body.classe);
    const echelon = ouString(body.echelon);
    let id_grade_actuel = ouInt(body.id_grade_actuel);

    const estStagiaire = classe?.toUpperCase() === "STAGIAIRE";
    if (!id_grade_actuel && categorie && classe && (echelon || estStagiaire)) {
        const gradeFound = await staffModels.trouverGrade({
            categorie,
            classe,
            echelon: estStagiaire ? null : echelon,
        });
        if (gradeFound) {
            id_grade_actuel = parseInt(gradeFound.id_grade, 10);
        } else {
            validators.supprimerFichierSiExiste(req.file?.path);
            return res.status(400).json({
                message: estStagiaire
                    ? `Grade STAGIAIRE introuvable pour la catégorie ${categorie}. Veuillez vérifier la configuration des grades.`
                    : `Combinaison de grade (catégorie, classe, échelon) invalide`,
            });
        }
    }
    const specialite = ouString(body.specialite);
    const corps = ouString(body.corps);
    const telephone = ouString(body.telephone);
    const email = ouString(body.email);
    const service_id = ouInt(body.service_id);
    const fonction_id = ouInt(body.fonction_id);
    const genre_id = ouInt(body.genre_id);
    const statut = ouString(body.statut);

    //Helper update : reutilise erreur400 avec nettoyage fichier
    const erreur400 = (message) => {
        validators.supprimerFichierSiExiste(req.file?.path);
        return res.status(400).json({ message });
    };

    if (body.service_id !== undefined && service_id === undefined) {
        return erreur400("service_id invalide");
    }
    if (body.fonction_id !== undefined && fonction_id === undefined) {
        return erreur400("fonction_id invalide");
    }
    if (body.id_grade_actuel !== undefined && id_grade_actuel === undefined) {
        return erreur400("id_grade_actuel invalide");
    }
    if (service_id !== undefined && service_id <= 0) {
        return erreur400("service_id invalide");
    }
    if (fonction_id !== undefined && fonction_id <= 0) {
        return erreur400("fonction_id invalide");
    }
    if (id_grade_actuel !== undefined && id_grade_actuel <= 0) {
        return erreur400("id_grade_actuel invalide");
    }

    if (statut !== undefined) {
        const statutNormalise = validators.normaliserStatut(statut);
        if (!statutNormalise) return erreur400("Statut invalide");
    }

    // ── 4. Validations — seulement pour les champs présents ───────
    // Si un champ est undefined (non envoyé), on ne le valide pas car il ne sera pas modifié de toute façon
    if (date_naissance !== undefined) {
        const erreurAge = validators.validerAge(date_naissance);
        if (erreurAge) return erreur400(erreurAge);
    }

    if (telephone !== undefined) {
        const erreurTel = validators.validerTelephone(telephone);
        if (erreurTel) return erreur400(erreurTel);
    }

    if (email !== undefined) {
        const erreurEmail = validators.validerEmail(email);
        if (erreurEmail) return erreur400(erreurEmail);
    }

    if (genre_id !== undefined) {
        const erreurGenre = await validators.validerGenreId(genre_id);
        if (erreurGenre) return erreur400(erreurGenre);
    }

    // ── 5. Unicité BDD — en excluant le personnel actuel ─────────
    // On ne vérifie que les champs qui ont effectivement changé
    const champsUnicite = {};
    if (telephone !== undefined) champsUnicite.telephone = telephone;
    if (email !== undefined) champsUnicite.email = email;

    if (Object.keys(champsUnicite).length > 0) {
        const erreurUnicite = await validators.verifierUniciteBDD({
            ...champsUnicite,
            excludedId: id,
        });

        if (erreurUnicite) {
            validators.supprimerFichierSiExiste(req.file?.path);
            return res.status(409).json({ message: erreurUnicite });
        }
    }

    // ── 6. Diplômes ───────────────────────────────────────────────
    const { erreur: erreurDiplomes, diplomes } = validators.normaliserDiplomes(
        body.diplomes,
    );
    if (erreurDiplomes) return erreur400(erreurDiplomes);

    // ── 7. Photo de profil ────────────────────────────────────────
    const matricule = existant.matricule;

    const anciennePhoto = existant.photo_profil
        ? existant.photo_profil.replace("/uploads/", "")
        : null;
    let photo_profil = undefined; // si pas de changement

    if (req.file) {
        const nomFinal = `photo-profil-${matricule.toString().replace(" ", "")}.png`;
        const dossier = path.join(__dirname, "..", "..", "uploads");
        const ancienChemin = path.join(dossier, req.file.filename);
        const nouveauChemin = path.join(dossier, nomFinal);

        try {
            fs.renameSync(ancienChemin, nouveauChemin);
            photo_profil = nomFinal;
        } catch (error) {
            validators.supprimerFichierSiExiste(req.file.path);
            console.error("[updateStaff] Erreur renommage photo :", error);
            return res
                .status(500)
                .json({ message: "Erreur lors du traitement de la photo" });
        }
    }

    // ── 8. Accès SIH ──────────────────────────────────────────────
    const donner_acces = (body.donner_access ?? body.donner_acces) === "true";
    const aDejaUnCompte = Boolean(existant.a_acces_sih);

    let password_hash = undefined;

    if (donner_acces) {
        const erreurSIH = validators.validerAccesSIH({
            donner_acces: true,
            username: body.username?.trim(),
            password: body.password,
            aDejaUnCompte,
        });

        if (body.password) {
            password_hash = await bcrypt.hash(body.password, 10);
        }
    }

    // ── 9. Transaction BDD ────────────────────────────────────────
    try {
        const result = await staffModels.updatePersonnel({
            id,
            nom: nom ? nom.toUpperCase() : undefined,
            prenoms: prenoms
                ? prenoms
                      .split(" ")
                      .map(
                          (p) =>
                              p.charAt(0).toUpperCase() +
                              p.slice(1).toLowerCase(),
                      )
                      .join(" ")
                : undefined,
            date_naissance,
            categorie,
            classe,
            echelon,
            id_grade_actuel,
            specialite,
            corps,
            telephone,
            email,
            service_id,
            fonction_id,
            genre_id,
            statut:
                statut !== undefined
                    ? validators.normaliserStatut(statut)
                    : undefined,
            photo_profil,
            anciennePhoto,
            diplomes,
            donner_acces: donner_acces || undefined,
            username: donner_acces ? body.username?.trim() : undefined,
            password_hash,
            adminId: req.user?.id,
        });
        // Supprimer l'ancienne photo après la mise à jour en BDD
        staffModels.supprimerAnciennePhoto(photo_profil, anciennePhoto);

        // Si le modèle renvoie le profil mis à jour, l'inclure dans la réponse
        const data = result && result.data ? result.data : null;
        res.status(200).json({
            message: "Personnel mis à jour avec succès",
            data,
        });
    } catch (error) {
        if (req.file && photo_profil) {
            validators.supprimerFichierSiExiste(
                path.join(__dirname, "..", "..", "uploads", photo_profil),
            );
        }
        console.error("[updateStaff] Erreur :", error);
        if (error.code === "P2002")
            return res
                .status(409)
                .json({ message: "Ce username existe déjà." });
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── ARCHIVER UN PERSONNEL ─────────────────────────────────────────
async function archiverStaff(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "ID invalide" });
    }

    try {
        const adminId = req.user?.id;
        const result = await staffModels.archiverPersonnel(id, adminId);

        if (!result.found) {
            return res.status(404).json({ message: "Personnel introuvable" });
        }

        if (result.dejaArchive) {
            return res
                .status(409)
                .json({ message: "Ce personnel est déjà sorti du service" });
        }

        res.status(200).json({ message: "Personnel archivé avec succès" });
    } catch (error) {
        console.error("[archiverStaff] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── LISTE DES ARCHIVÉS ─────────────────────────────────────────────────────────
async function getArchivedStaff(req, res) {
    const search = req.query.search || "";
    const department = req.query.department || "";
    const fonction = req.query.fonction || "";
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 10, 1),
        100,
    );

    try {
        const result = await staffModels.getArchivedStaff({
            search,
            department,
            fonction,
            page,
            limit,
        });
        res.status(200).json({
            message: "Archives récupérées avec succès",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error("[getArchivedStaff] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── PROFIL D'UN ARCHIVÉ (lecture seule) ───────────────────────────────────────
async function getArchivedProfile(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "ID invalide" });
    }

    try {
        const profile = await staffModels.getStaffById(id);

        if (!profile) {
            return res.status(404).json({ message: "Personnel introuvable" });
        }

        if (profile.statut !== "Sorti") {
            return res
                .status(403)
                .json({ message: "Ce personnel n'est pas archivé" });
        }

        res.status(200).json({
            message: "Profil archivé récupéré avec succès",
            data: profile,
        });
    } catch (error) {
        console.error("[getArchivedProfile] Erreur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

module.exports = {
    getStaff,
    getArchivedStaff,
    getArchivedProfile,
    getDepartments,
    getFonctions,
    getGenres,
    getStaffProfile,
    addStaff,
    updateStaff,
    archiverStaff,
};
