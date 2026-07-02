const express = require("express");
const router = express.Router();
const staffControllers = require("../controllers/staffControllers");

const multer = require("multer");
const path = require("path");

// Configuration du stockage pour multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "..", "uploads"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const tempName = `temp-${Date.now()}${ext}`;
        cb(null, tempName);
    },
});

// Filtre de type de fichier
const fileFilter = function (req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Seuls les formats JPEG, PNG et WEBP sont autorisés."),
            false,
        );
    }
};

// Instance multer prete a l'emploi
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10_000_000 }, // limite de 10 Mo => 10 * 1024 * 1024 octets
});

// ?search=  &department=  &service=  &fonction=  &page=  &limit=
router.get("/show-all", staffControllers.getStaff);

// liste des départements pour le dropdown
router.get("/departments", staffControllers.getDepartments);

// liste des job titles pour le dropdown
router.get("/fonctions", staffControllers.getFonctions);

// liste des genres pour le dropdown
router.get("/genres", staffControllers.getGenres);

// route pour la page profil d'un personnel
router.get("/profile/:id", staffControllers.getStaffProfile);

// route ajouter personnel
router.post("/add", upload.single("photo"), staffControllers.addStaff);

// route update personnel
router.patch(
    "/update/:id",
    upload.single("photo_profil"),
    staffControllers.updateStaff,
);

// Route pour mettre fin au service d'un personnel
router.patch("/:id/archiver", staffControllers.archiverStaff);

// ── ROUTES ARCHIVES (lecture seule) ───────────────────────────────
// ?search=  &department=  &fonction=  &page=  &limit=
router.get("/archives", staffControllers.getArchivedStaff);

// profil complet d'un personnel archivé
router.get("/archives/:id", staffControllers.getArchivedProfile);

module.exports = router;
