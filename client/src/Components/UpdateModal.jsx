import { useEffect, useRef, useState } from "react";
// [AJOUT] Import du modal de confirmation réutilisable
import ConfirmModal from "./ConfirModal";
import { API_BASE, apiFetch } from "../config/api";

const CATEGORIES = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
];
const CLASSES = [
    { value: "STAGIAIRE", label: "Stagiaire" },
    { value: "1ERE_CLASSE", label: "Classe 1" },
    { value: "2EME_CLASSE", label: "Classe 2" },
    { value: "PRINCIPAL", label: "Principal" },
    { value: "EXCEPTIONNEL", label: "Exceptionnel" },
];
const ECHELONS = ["1", "2", "3"];
const STATUTS = ["En activité", "En absence", "Sortie"];
// [AJOUT] Rôles SIH — value = valeur brute attendue par auth_user.role, label = libellé affiché
const ROLES = [
    { value: "admin", label: "Administrateur" },
    { value: "medecin", label: "Médecin" },
    { value: "user", label: "Utilisateur" },
    { value: "be", label: "Bureau des entrées" },
];
const DIPLOME_VIDE = {
    libelle: "",
    etablissement: "",
    annee_obtention: "",
    est_principal: false,
};

// Définition des onglets
const TABS = [
    {
        id: "identite",
        label: "Identité",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
        ),
    },
    {
        id: "situation",
        label: "Situation",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
        ),
    },
    {
        id: "affectation",
        label: "Affectation",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
            </svg>
        ),
    },
    {
        id: "diplomes",
        label: "Diplômes",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                />
            </svg>
        ),
    },
    {
        id: "acces",
        label: "Accès SIH",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 11-12 0 6 6 0 0112 0zM3 21v-2a4 4 0 014-4h.5"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 13l6 6m0 0l-2.5-1m2.5 1l-1 2.5"
                />
            </svg>
        ),
    },
];

// ── Sous-composant Field (label + input + erreur)
function Field({ label, required, children, error, dark, name }) {
    return (
        <div
            id={name ? `field-${name}` : undefined}
            className="flex flex-col gap-1.5 scroll-mt-4"
        >
            <label
                className={`text-[11px] font-bold uppercase tracking-widest ${dark ? "text-slate-500" : "text-slate-400"}`}
            >
                {label}
                {required && <span className="text-rose-400 ml-0.5">*</span>}
            </label>
            {children}
            {error && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01"
                        />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════
// Composant principal UpdateModal
// ════════════════════════════════════════════════════════════════════
export default function UpdateModal({ id, dark, onClose, onSaved }) {
    const fileInputRef = useRef(null);

    // ── Onglet actif
    const [activeTab, setActiveTab] = useState("identite");

    // ── Chargement initial du profil depuis l'API
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadError, setLoadError] = useState(null);

    // ── Formulaire — pré-rempli après chargement du profil
    const [form, setForm] = useState({
        nom: "",
        prenoms: "",
        date_naissance: "",
        genre_id: "",
        corps: "", // [NOUVEAU] Corps du personnel
        categorie: "",
        classe: "",
        echelon: "",
        specialite: "",
        telephone: "",
        email: "",
        service_id: "",
        fonction_id: "",
        statut: "En activité",
        // [AJOUT] Stagiaire — case "Tous les services"
        tous_les_services: false,
        // [AJOUT] Stagiaire — infos de stage (remplace les diplômes)
        etablissement: "",
        niveau: "",
        filiere_parcours: "",
        duree_mois: "",
        // [AJOUT] Accès SIH — uniquement si le personnel n'a pas encore de compte
        donner_access: false,
        username: "",
        password: "",
        role: "",
    });
    const [diplomes, setDiplomes] = useState([
        { ...DIPLOME_VIDE, est_principal: true },
    ]);

    // [AJOUT] type_personnel n'est jamais modifiable ici (fixé à la création)
    // — on le charge simplement pour piloter l'affichage conditionnel des champs.
    const [typePersonnel, setTypePersonnel] = useState("");
    // [AJOUT] Indique si le personnel dispose déjà d'un compte SIH
    const [aAccesSih, setAAccesSih] = useState(false);
    const [photoFile, setPhotoFile] = useState(null); // nouveau fichier (si changé)
    const [photoPreview, setPhotoPreview] = useState(null); // URL d'aperçu (existante ou nouvelle)

    // ── Dropdowns
    const [services, setServices] = useState([]);
    const [fonctions, setFonctions] = useState([]);

    // ── Soumission
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);

    // [AJOUT] États des modals de confirmation
    // confirmSave  : true → affiche "Confirmer la mise à jour ?"
    // confirmClose : true → affiche "Confirmer l'annulation de la modification ?"
    const [confirmSave, setConfirmSave] = useState(false);
    const [confirmClose, setConfirmClose] = useState(false);

    // ── Styles partagés
    const inputCls = dark
        ? "w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-slate-600 outline-none focus:border-blue-500/60 transition-all [&_option]:text-black [&_option]:bg-white"
        : "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all";
    const inputErr = dark
        ? "w-full px-3.5 py-2.5 rounded-xl border-2 border-rose-500 bg-rose-500/10 text-white text-sm outline-none transition-all [&_option]:text-black [&_option]:bg-white ring-4 ring-rose-500/10"
        : "w-full px-3.5 py-2.5 rounded-xl border-2 border-rose-500 bg-rose-50 text-slate-800 text-sm outline-none transition-all ring-4 ring-rose-500/10";
    const selectCls = dark
        ? "w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-sm outline-none focus:border-blue-500/60 cursor-pointer transition-all [&_option]:text-black [&_option]:bg-white"
        : "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-blue-400 cursor-pointer transition-all";
    const selectErr = dark
        ? "w-full px-3.5 py-2.5 rounded-xl border-2 border-rose-500 bg-rose-500/10 text-slate-200 text-sm outline-none cursor-pointer transition-all [&_option]:text-black [&_option]:bg-white ring-4 ring-rose-500/10"
        : "w-full px-3.5 py-2.5 rounded-xl border-2 border-rose-500 bg-rose-50 text-slate-700 text-sm outline-none cursor-pointer transition-all ring-4 ring-rose-500/10";
    const inp = (name) => (errors[name] ? inputErr : inputCls);
    const sel = (name) => (errors[name] ? selectErr : selectCls);

    // ════════════════════════════════════════════════════════════════════
    // Chargement du profil + dropdowns au montage
    // ════════════════════════════════════════════════════════════════════
    useEffect(() => {
        // Chargement du profil pour pré-remplir le formulaire
        apiFetch(`${API_BASE}/staff/profile/${id}`)
            .then((r) => {
                if (!r.ok) throw new Error(`Erreur ${r.status}`);
                return r.json();
            })
            .then((json) => {
                const p = json.data;

                // Conversion du format JJ/MM/AAAA (API) vers AAAA-MM-JJ (Format attendu par l'input date)
                let dateFormatted = "";
                if (p.date_naissance && p.date_naissance.includes("/")) {
                    const [day, month, year] = p.date_naissance.split("/");
                    dateFormatted = `${year}-${month}-${day}`;
                }

                // [AJOUT] type_personnel et accès SIH — pilotent l'affichage conditionnel
                setTypePersonnel(p.type_personnel || "");
                setAAccesSih(!!p.a_acces_sih);

                // Pré-remplissage de tous les champs avec les données existantes
                setForm({
                    nom: p.nom || "",
                    prenoms: p.prenoms || "",
                    date_naissance: dateFormatted,
                    genre_id: p.genre_id || "",
                    categorie: p.grade_actuel ? p.grade_actuel.categorie : "",
                    classe: p.grade_actuel ? p.grade_actuel.classe : "",
                    echelon: p.grade_actuel ? p.grade_actuel.echelon : "",
                    corps: p.corps || "",
                    specialite: p.specialite || "",
                    telephone: formatPhoneDisplay(p.telephone || ""),
                    email: p.email || "",
                    service_id: p.service_id || "", // si l'API renvoie l'id FK
                    fonction_id: p.fonction_id || "",
                    statut: p.statut || "En activité",
                    // [AJOUT] Stagiaire
                    tous_les_services:
                        p.tous_les_services === true ||
                        p.tous_les_services === "true",
                    etablissement: p.stagiaire_details?.etablissement || "",
                    niveau: p.stagiaire_details?.niveau || "",
                    filiere_parcours:
                        p.stagiaire_details?.filiere_parcours || "",
                    duree_mois: p.stagiaire_details?.duree_mois || "",
                    // [AJOUT] Accès SIH — champs vides par défaut, saisis uniquement
                    // si l'on choisit de créer un compte a posteriori
                    donner_access: false,
                    username: "",
                    password: "",
                    role: "",
                });

                // Pré-remplissage des diplômes
                if (p.diplomes && p.diplomes.length > 0) {
                    setDiplomes(
                        p.diplomes.map((d) => ({
                            libelle: d.libelle || "",
                            etablissement: d.etablissement || "",
                            annee_obtention: d.annee_obtention || "",
                            est_principal: d.est_principal || false,
                        })),
                    );
                }

                // Photo existante — on construit l'URL pour l'aperçu
                if (p.photo_profil) {
                    setPhotoPreview(`${API_BASE}${p.photo_profil}`);
                }

                setLoadingProfile(false);
            })
            .catch((err) => {
                setLoadError(err.message);
                setLoadingProfile(false);
            });

        // Chargement des dropdowns
        apiFetch(`${API_BASE}/staff/departments`)
            .then((r) => r.json())
            .then((json) => {
                const data = json.data || [];
                setServices(
                    typeof data[0] === "string"
                        ? data.map((s, i) => ({ id: i + 1, libelle: s }))
                        : data,
                );
            })
            .catch(() => {});

        apiFetch(`${API_BASE}/staff/fonctions`)
            .then((r) => r.json())
            .then((json) => {
                const data = json.data || [];
                setFonctions(
                    typeof data[0] === "string"
                        ? data.map((f, i) => ({ id: i + 1, libelle: f }))
                        : data,
                );
            })
            .catch(() => {});
    }, [id]); 

    // ── Fermer le modal en cliquant sur l'overlay (backdrop)
    const handleBackdropClick = (e) => {
        // e.target = l'élément cliqué
        // e.currentTarget = l'élément sur lequel l'handler est attaché (l'overlay)
        // Si on clique DIRECTEMENT sur l'overlay (pas sur un enfant) → fermer
        if (e.target === e.currentTarget) onClose();
    };

    // ── Fermer avec la touche Échap
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    // ════════════════════════════════════════════════════════════════════
    // Handlers
    // ════════════════════════════════════════════════════════════════════
    const handleChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const formatPhoneDisplay = (value) => {
        const raw = String(value ?? "").replace(/[^\d+]/g, "");
        if (!raw) return "";

        const hasPlus = raw.startsWith("+");
        const digits = raw.replace(/\D/g, "");
        if (!digits) return hasPlus ? "+" : "";

        const limited = digits.slice(0, 10);
        const parts = [];
        if (limited.length <= 3) parts.push(limited);
        else if (limited.length <= 5)
            parts.push(limited.slice(0, 3), limited.slice(3));
        else if (limited.length <= 8)
            parts.push(
                limited.slice(0, 3),
                limited.slice(3, 5),
                limited.slice(5),
            );
        else
            parts.push(
                limited.slice(0, 3),
                limited.slice(3, 5),
                limited.slice(5, 8),
                limited.slice(8),
            );

        const formatted = parts.join(" ");
        return hasPlus ? `+${formatted}` : formatted;
    };

    const normalizePhoneForBackend = (value) =>
        String(value ?? "")
            .replace(/[^\d+]/g, "")
            .replace(/\s+/g, "")
            .replace(/-/g, "");

    const handlePhoto = (file) => {
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleDiplomeChange = (index, field, value) =>
        setDiplomes((prev) =>
            prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
        );

    const ajouterDiplome = () =>
        setDiplomes((prev) => [...prev, { ...DIPLOME_VIDE }]);
    const supprimerDiplome = (i) =>
        setDiplomes((prev) => prev.filter((_, idx) => idx !== i));

    // ── Navigation vers le champ en erreur ─────────────────────────
    // Associe chaque champ à l'onglet où il est réellement affiché
    // (reflète l'agencement du formulaire ci-dessous, pas une supposition).
    const FIELD_TABS = {
        nom: "identite",
        prenoms: "identite",
        date_naissance: "identite",
        genre_id: "identite",
        telephone: "identite",
        email: "identite",
        statut: "situation",
        corps: "situation",
        categorie: "situation",
        classe: "situation",
        echelon: "situation",
        service_id: "affectation",
        fonction_id: "affectation",
        specialite: "affectation",
        etablissement: "diplomes",
        niveau: "diplomes",
        filiere_parcours: "diplomes",
        duree_mois: "diplomes",
        diplome0: "diplomes",
        username: "acces",
        password: "acces",
        role: "acces",
    };
    // Ordre d'apparition à l'écran, pour choisir le "premier" champ en
    // erreur de façon stable quand plusieurs champs sont en erreur.
    const FIELD_ORDER = [
        "nom",
        "prenoms",
        "date_naissance",
        "genre_id",
        "telephone",
        "email",
        "statut",
        "corps",
        "categorie",
        "classe",
        "echelon",
        "service_id",
        "fonction_id",
        "specialite",
        "etablissement",
        "niveau",
        "filiere_parcours",
        "duree_mois",
        "diplome0",
        "username",
        "password",
        "role",
    ];

    const tabForField = (key) => {
        if (FIELD_TABS[key]) return FIELD_TABS[key];
        if (key.startsWith("etab")) return "diplomes"; // etab0, etab1, ...
        return "identite";
    };

    // Scrolle et place le focus sur le champ fautif une fois l'onglet
    // affiché (double rAF : laisse React re-render l'onglet avant de
    // mesurer sa position dans le conteneur scrollable).
    const scrollToField = (fieldKey) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const el = document.getElementById(`field-${fieldKey}`);
                if (!el) return;
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                const focusable = el.querySelector("input, select, textarea");
                if (focusable) focusable.focus({ preventScroll: true });
            });
        });
    };

    // Point d'entrée unique : à partir de l'objet d'erreurs, on va
    // directement sur le premier champ fautif (onglet + scroll + focus)
    // au lieu de se contenter de changer d'onglet à l'aveugle.
    const goToFirstError = (e) => {
        const keys = Object.keys(e).filter((k) => e[k]);
        if (keys.length === 0) return;
        const ordered = [
            ...FIELD_ORDER.filter((k) => keys.includes(k)),
            ...keys.filter(
                (k) => k.startsWith("etab") && !FIELD_ORDER.includes(k),
            ),
        ];
        const firstKey = ordered[0] || keys[0];
        setActiveTab(tabForField(firstKey));
        scrollToField(firstKey);
    };

    // ── Validation
    const validate = () => {
        const e = {};
        // [AJOUT] Définition des expressions régulières pour des messages plus explicatifs
        const noSpecialCharsRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'’-]+$/u;
        const noSpecialCharsAlphanumRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s'’-]+$/u;

        if (!form.nom.trim()) {
            e.nom = "Le nom est requis";
        } else if (!noSpecialCharsRegex.test(form.nom)) {
            // [AJOUT] Message spécifique pour expliquer la nature de l'erreur
            e.nom =
                "Seules les lettres, espaces, accents, apostrophes et traits d'union sont autorisés";
        }

        if (!form.prenoms.trim()) {
            e.prenoms = "Le prénom est requis";
        } else if (!noSpecialCharsRegex.test(form.prenoms)) {
            e.prenoms =
                "Seules les lettres, espaces, accents, apostrophes et traits d'union sont autorisés";
        }

        if (!form.genre_id) {
            e.genre_id = "Le sexe est requis";
        }

        // [AJOUT] Validation de l'âge (minimum 16 ans)
        if (form.date_naissance) {
            const birthDate = new Date(form.date_naissance);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
                age--;
            if (age > 70)
                e.date_naissance = "L'âge ne doit pas dépasser 70 ans";
            if (age < 16)
                e.date_naissance = "L'âge doit être de 16 ans minimum";
        }

        // [AJOUT] Validation des coordonnées avec messages spécifiques
        if (form.telephone.trim()) {
            const telRegex = /^(\+261\d{9}|0\d{9})$/;
            if (!telRegex.test(form.telephone.trim().replace(/[\s-]/g, ""))) {
                e.telephone = "Format invalide (ex: 034 00 000 00)";
            }
        }
        if (form.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.email.trim()))
                e.email = "L'adresse email n'est pas valide";
        }

        // [MODIFIÉ] Diplômes uniquement pour les non-stagiaires ; infos de stage sinon
        if (typePersonnel !== "STAGIAIRE") {
            // [MODIFIÉ] Le diplôme principal n'est pas obligatoire pour un Bénévole
            // (le backend accepte un tableau `diplomes` vide/absent pour ce type)
            if (
                typePersonnel !== "BENEVOLE" &&
                !diplomes[0]?.libelle?.trim()
            )
                e.diplome0 = "Le diplôme principal est requis";

            // [AJOUT] Explication de l'erreur pour tous les diplômes et établissements
            diplomes.forEach((d, i) => {
                if (d.libelle && !noSpecialCharsAlphanumRegex.test(d.libelle))
                    e[`diplome${i}`] = "Pas de caractères spéciaux";
                if (
                    d.etablissement &&
                    !noSpecialCharsAlphanumRegex.test(d.etablissement)
                )
                    e[`etab${i}`] = "Pas de caractères spéciaux";
            });
        } else {
            if (!form.etablissement.trim())
                e.etablissement = "L'établissement est requis";
            if (!form.niveau.trim()) e.niveau = "Le niveau est requis";
            if (!form.filiere_parcours.trim())
                e.filiere_parcours = "La filière / le parcours est requis";
            if (!form.duree_mois || Number(form.duree_mois) <= 0)
                e.duree_mois = "La durée (en mois) est requise";
        }

        // [AJOUT] Accès SIH — uniquement si on choisit de créer un compte a posteriori
        if (!aAccesSih && form.donner_access) {
            if (!form.username.trim())
                e.username = "Le nom d'utilisateur est requis";
            if (!form.password || form.password.length < 6)
                e.password =
                    "Le mot de passe doit contenir au moins 6 caractères";
            if (!form.role) e.role = "Le rôle est requis";
        }

        return e;
    };

    // ── Soumission PUT /staff/update/:id
    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) {
            setErrors(e);
            // Emmène directement l'utilisateur sur le premier champ fautif
            // (onglet + scroll + focus) plutôt que de bloquer silencieusement.
            goToFirstError(e);
            return;
        }

        setSubmitting(true);
        setApiError(null);

        try {
            const fd = new FormData();
            if (photoFile) fd.append("photo_profil", photoFile);
            fd.append("nom", form.nom.trim());
            fd.append("prenoms", form.prenoms.trim());
            fd.append("date_naissance", form.date_naissance);
            fd.append("genre_id", form.genre_id);
            fd.append("telephone", normalizePhoneForBackend(form.telephone));
            fd.append("email", form.email.trim());
            fd.append("statut", form.statut);

            // [MODIFIÉ] Catégorie/classe/échelon/corps réservés aux fonctionnaires
            if (typePersonnel === "FONCTIONNAIRE") {
                fd.append("categorie", form.categorie);
                if (form.classe) fd.append("classe", form.classe);
                if (form.echelon) fd.append("echelon", form.echelon);
                fd.append("corps", form.corps?.trim() || "");
            }

            // [MODIFIÉ] Spécialité et fonction masquées pour un stagiaire
            if (typePersonnel !== "STAGIAIRE") {
                fd.append("specialite", form.specialite.trim());
                fd.append("fonction_id", form.fonction_id);
            }

            // [MODIFIÉ] Service — un stagiaire peut cocher "Tous les services"
            if (typePersonnel === "STAGIAIRE") {
                fd.append(
                    "tous_les_services",
                    form.tous_les_services ? "true" : "false",
                );
                if (!form.tous_les_services)
                    fd.append("service_id", form.service_id);
            } else {
                fd.append("service_id", form.service_id);
            }

            // [MODIFIÉ] Diplômes pour un non-stagiaire, infos de stage sinon
            if (typePersonnel === "STAGIAIRE") {
                fd.append(
                    "stagiaire_details",
                    JSON.stringify({
                        etablissement: form.etablissement.trim(),
                        niveau: form.niveau.trim(),
                        filiere_parcours: form.filiere_parcours.trim(),
                        duree_mois: form.duree_mois,
                    }),
                );
            } else {
                // [MODIFIÉ] On ne garde que les diplômes réellement remplis —
                // permet d'envoyer un tableau vide pour un Bénévole n'ayant
                // saisi aucun diplôme (le backend accepte `diplomes: []`)
                const diplomesRemplis = diplomes.filter((d) =>
                    d.libelle?.trim(),
                );
                fd.append("diplomes", JSON.stringify(diplomesRemplis));
            }

            // [AJOUT] Accès SIH — uniquement si le personnel n'en a pas déjà un
            if (!aAccesSih) {
                fd.append(
                    "donner_access",
                    form.donner_access ? "true" : "false",
                );
                if (form.donner_access) {
                    fd.append("username", form.username.trim());
                    fd.append("password", form.password);
                    fd.append("role", form.role); // valeur brute, jamais le label
                }
            }

            const res = await apiFetch(`${API_BASE}/staff/update/${id}`, {
                method: "PATCH",
                body: fd,
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(json.message || `Erreur ${res.status}`);
            }

            // Mettre à jour le formulaire local avec les données renvoyées (notamment `corps`)
            if (json.data) {
                if (json.data.corps !== undefined)
                    setForm((prev) => ({ ...prev, corps: json.data.corps }));
                if (json.data.photo_profil)
                    setPhotoPreview(
                        `${API_BASE}${json.data.photo_profil}?t=${Date.now()}`,
                    );
            }

            // Succès : fermer le modal et demander au parent de rafraîchir
            if (typeof onClose === "function") onClose();
            if (typeof onSaved === "function")
                onSaved(true, "Profil mis à jour avec succès");
        } catch (err) {
            setApiError(err.message);
            // Signale l'échec au parent pour qu'il puisse afficher un message ou refetch
            if (typeof onSaved === "function") {
                try {
                    onSaved(
                        false,
                        err.message || "Erreur lors de la mise à jour",
                    );
                } catch (cbErr) {
                    // Intentionally ignore callback errors to avoid logging or exposing data in production.
                    void cbErr;
                }
            }
            const msg = err.message.toLowerCase();
            let fieldKey = null;
            if (msg.includes("téléphone") || msg.includes("telephone")) {
                setActiveTab("affectation");
                fieldKey = "telephone";
            } else if (msg.includes("email")) {
                setActiveTab("affectation");
                fieldKey = "email";
            }

            if (fieldKey)
                setErrors((prev) => ({ ...prev, [fieldKey]: err.message }));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Tokens thème
    const overlay =
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm";
    const modalBg = dark
        ? "bg-[#0d1526] border-white/10"
        : "bg-white border-slate-200";
    const headerBg = dark
        ? "bg-white/3 border-white/8"
        : "bg-slate-50 border-slate-200";
    const tabActive = dark
        ? "bg-blue-600/20 text-blue-400 border-blue-500/20"
        : "bg-blue-50 text-blue-600 border-blue-200";
    const tabIdle = dark
        ? "text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent"
        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-transparent";
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const ttl = dark ? "text-white" : "text-slate-800";
    const dipCard = dark
        ? "bg-white/3 border-white/8 rounded-xl border p-4 space-y-3"
        : "bg-slate-50 border-slate-200 rounded-xl border p-4 space-y-3";

    return (
        // Fragment React : permet de retourner plusieurs éléments frères
        // sans div wrapper — les ConfirmModals sont frères de l'overlay UpdateModal,
        // pas enfants, donc ils ne sont pas bloqués par overflow:hidden
        <>
            {/* [AJOUT] ConfirmModals au niveau racine — position:fixed les rend visibles
            par-dessus tout le reste, z-[60] > z-50 de l'overlay UpdateModal */}
            {confirmSave && (
                <ConfirmModal
                    dark={dark}
                    type="confirm"
                    title="Confirmer la mise à jour ?"
                    message="Les informations de ce membre seront modifiées. Assurez-vous que les données saisies sont correctes."
                    labelOui="Oui, mettre à jour"
                    labelNon="Non, vérifier"
                    onConfirm={() => {
                        setConfirmSave(false);
                        handleSubmit();
                    }}
                    onCancel={() => setConfirmSave(false)}
                />
            )}
            {confirmClose && (
                <ConfirmModal
                    dark={dark}
                    type="danger"
                    title="Abandonner les modifications ?"
                    message="Les modifications non enregistrées seront perdues. Voulez-vous vraiment fermer ?"
                    labelOui="Oui, abandonner"
                    labelNon="Non, continuer"
                    onConfirm={() => {
                        setConfirmClose(false);
                        onClose();
                    }}
                    onCancel={() => setConfirmClose(false)}
                />
            )}

            {/* ── OVERLAY : fond semi-transparent derrière le modal */}
            <div className={overlay} onClick={handleBackdropClick}>
                {/* ── MODAL ── */}
                <div
                    className={`relative w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col ${modalBg}`}
                    onClick={(e) => e.stopPropagation()} // empêche la fermeture au clic à l'intérieur
                >
                    {/* ── En-tête du modal ── */}
                    <div
                        className={`flex items-center justify-between px-5 py-4 border-b rounded-t-2xl ${headerBg}`}
                    >
                        <div>
                            <h2 className={`text-base font-bold ${ttl}`}>
                                Mise à jour du personnel
                            </h2>
                            <p className={`text-xs mt-0.5 ${sub}`}>
                                Modifiez les informations puis cliquez sur
                                Enregistrer
                            </p>
                        </div>
                        {/* Bouton fermer (✕) */}
                        <button
                            onClick={onClose}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                dark
                                    ? "text-slate-500 hover:text-white hover:bg-white/10"
                                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-200"
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* ── Onglets ── */}
                    <div
                        className={`flex items-center gap-1 px-4 py-2.5 border-b ${dark ? "border-white/8" : "border-slate-200"}`}
                    >
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${activeTab === tab.id ? tabActive : tabIdle}`}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">
                                    {tab.id === "diplomes" &&
                                    typePersonnel === "STAGIAIRE"
                                        ? "Infos de stage"
                                        : tab.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── Contenu scrollable ── */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {/* ── État : chargement du profil ── */}
                        {loadingProfile && (
                            <div className="flex items-center justify-center h-48">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {/* ── État : erreur de chargement ── */}
                        {!loadingProfile && loadError && (
                            <div
                                className={`rounded-xl border p-4 text-sm flex items-center gap-3 ${dark ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                Impossible de charger le profil : {loadError}
                            </div>
                        )}

                        {/* ── Erreur soumission API ── */}
                        {apiError && (
                            <div
                                className={`mb-4 rounded-xl border p-3.5 flex items-center gap-3 text-sm ${dark ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                {apiError}
                                <button
                                    onClick={() => setApiError(null)}
                                    className="ml-auto opacity-60 hover:opacity-100"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {!loadingProfile && !loadError && (
                            <>
                                {/* ══════ ONGLET 1 : IDENTITÉ ══════ */}
                                {activeTab === "identite" && (
                                    <div className="space-y-4">
                                        {/* Photo */}
                                        <div className="flex items-center gap-4 mb-2">
                                            <div
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 cursor-pointer group border-2 border-dashed transition-all ${
                                                    photoPreview
                                                        ? "border-transparent"
                                                        : dark
                                                          ? "border-white/15 hover:border-blue-500/50"
                                                          : "border-slate-300 hover:border-blue-400"
                                                }`}
                                            >
                                                {photoPreview ? (
                                                    <>
                                                        <img
                                                            src={photoPreview}
                                                            alt="Photo"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="w-4 h-4 text-white"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div
                                                        className={`w-full h-full flex items-center justify-center ${dark ? "bg-white/5" : "bg-slate-100"}`}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className={`w-6 h-6 ${dark ? "text-slate-600" : "text-slate-400"}`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={1.5}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M12 4v16m8-8H4"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) =>
                                                    handlePhoto(
                                                        e.target.files[0],
                                                    )
                                                }
                                            />
                                            <div>
                                                <p
                                                    className={`text-sm font-medium ${ttl}`}
                                                >
                                                    Photo de profil
                                                </p>
                                                <p
                                                    className={`text-xs mt-0.5 mb-1.5 ${sub}`}
                                                >
                                                    Cliquez pour changer
                                                </p>
                                                {photoFile && (
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full ${dark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}
                                                    >
                                                        Nouvelle photo
                                                        sélectionnée
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field
                                                label="Nom"
                                                required
                                                dark={dark}
                                                error={errors.nom} name="nom"
                                            >
                                                <input
                                                    type="text"
                                                    value={form.nom}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "nom",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inp("nom")}
                                                    placeholder="Ex: RAKOTO"
                                                />
                                            </Field>

                                            <Field
                                                label="Prénoms"
                                                required
                                                dark={dark}
                                                error={errors.prenoms} name="prenoms"
                                            >
                                                <input
                                                    type="text"
                                                    value={form.prenoms}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "prenoms",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inp("prenoms")}
                                                    placeholder="Ex: Jean Paul"
                                                />
                                            </Field>

                                            <Field
                                                label="Date de naissance"
                                                dark={dark}
                                                error={errors.date_naissance} name="date_naissance"
                                            >
                                                <input
                                                    type="date"
                                                    value={form.date_naissance}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "date_naissance",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputCls}
                                                />
                                            </Field>

                                            <Field
                                                label="Sexe"
                                                required
                                                dark={dark}
                                                error={errors.genre_id} name="genre_id"
                                            >
                                                <select
                                                    value={form.genre_id}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "genre_id",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={sel("genre_id")}
                                                >
                                                    <option value="">
                                                        Sélectionner
                                                    </option>
                                                    <option value="1">
                                                        Masculin
                                                    </option>
                                                    <option value="2">
                                                        Féminin
                                                    </option>
                                                </select>
                                            </Field>

                                            <Field
                                                label="Téléphone"
                                                required
                                                dark={dark}
                                                error={errors.telephone} name="telephone"
                                            >
                                                <input
                                                    type="tel"
                                                    value={formatPhoneDisplay(
                                                        form.telephone,
                                                    )}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "telephone",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inp("telephone")}
                                                    placeholder="Ex: 034 24 724 58"
                                                />
                                            </Field>

                                            <Field
                                                label="Email"
                                                required
                                                dark={dark}
                                                error={errors.email} name="email"
                                            >
                                                <input
                                                    type="email"
                                                    value={form.email}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "email",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inp("email")}
                                                    placeholder="Ex: jean@hopital.mg"
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                )}

                                {/* ══════ ONGLET 2 : SITUATION ══════ */}
                                {activeTab === "situation" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field
                                            label="Statut"
                                            required
                                            dark={dark}
                                            error={errors.statut} name="statut"
                                        >
                                            <select
                                                value={form.statut}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "statut",
                                                        e.target.value,
                                                    )
                                                }
                                                className={selectCls}
                                            >
                                                {STATUTS.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                        {/* [MODIFIÉ] Corps/Catégorie/Classe/Échelon réservés aux fonctionnaires */}
                                        {typePersonnel ===
                                            "FONCTIONNAIRE" && (
                                            <>
                                                <Field
                                                    label="Corps"
                                                    dark={dark}
                                                    error={errors.corps} name="corps"
                                                >
                                                    <input
                                                        type="text"
                                                        value={
                                                            form.corps || ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "corps",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={inp(
                                                            "corps",
                                                        )}
                                                        placeholder="Ex: Cadre supérieur"
                                                    />
                                                </Field>
                                                <Field
                                                    label="Catégorie"
                                                    required
                                                    dark={dark}
                                                    error={errors.categorie} name="categorie"
                                                >
                                                    <select
                                                        value={form.categorie}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "categorie",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={selectCls}
                                                    >
                                                        <option value="">
                                                            Sélectionner
                                                        </option>
                                                        {CATEGORIES.map(
                                                            (c) => (
                                                                <option
                                                                    key={c}
                                                                    value={c}
                                                                >
                                                                    {c}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </Field>
                                                <Field
                                                    label="Classe"
                                                    required
                                                    dark={dark}
                                                    error={errors.classe} name="classe"
                                                >
                                                    <select
                                                        value={form.classe}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "classe",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={selectCls}
                                                    >
                                                        <option value="">
                                                            Sélectionner
                                                        </option>
                                                        {CLASSES.map((c) => (
                                                            <option
                                                                key={c.value}
                                                                value={
                                                                    c.value
                                                                }
                                                            >
                                                                {c.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Field>
                                                <Field
                                                    label="Échelon"
                                                    required
                                                    dark={dark}
                                                    error={errors.echelon} name="echelon"
                                                >
                                                    <select
                                                        value={form.echelon}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "echelon",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={selectCls}
                                                    >
                                                        <option value="">
                                                            Sélectionner
                                                        </option>
                                                        {ECHELONS.map((e) => (
                                                            <option
                                                                key={e}
                                                                value={e}
                                                            >
                                                                {e}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Field>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ══════ ONGLET 3 : AFFECTATION ══════ */}
                                {activeTab === "affectation" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* [AJOUT] Case "Tous les services" — uniquement pour un stagiaire */}
                                        {typePersonnel === "STAGIAIRE" && (
                                            <label
                                                className={`sm:col-span-2 flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 cursor-pointer transition-all ${
                                                    dark
                                                        ? "border-white/10 bg-white/5 text-slate-300"
                                                        : "border-slate-200 bg-white text-slate-700"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        form.tous_les_services
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "tous_les_services",
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                                                />
                                                <span className="text-sm font-medium">
                                                    Tous les services
                                                </span>
                                            </label>
                                        )}

                                        {/* [MODIFIÉ] Service masqué si stagiaire + "Tous les services" coché */}
                                        {!(
                                            typePersonnel === "STAGIAIRE" &&
                                            form.tous_les_services
                                        ) && (
                                            <Field
                                                label="Service"
                                                required
                                                dark={dark}
                                                error={errors.service_id} name="service_id"
                                            >
                                                <select
                                                    value={form.service_id}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "service_id",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={sel(
                                                        "service_id",
                                                    )}
                                                >
                                                    <option value="">
                                                        Sélectionner un
                                                        service
                                                    </option>
                                                    {services.map((s) => (
                                                        <option
                                                            key={s.id}
                                                            value={s.id}
                                                        >
                                                            {s.libelle}
                                                        </option>
                                                    ))}
                                                </select>
                                            </Field>
                                        )}

                                        {/* [MODIFIÉ] Fonction et Spécialité masquées pour un stagiaire */}
                                        {typePersonnel !== "STAGIAIRE" && (
                                            <>
                                                <Field
                                                    label="Fonction"
                                                    required
                                                    dark={dark}
                                                    error={errors.fonction_id} name="fonction_id"
                                                >
                                                    <select
                                                        value={
                                                            form.fonction_id
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "fonction_id",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={sel(
                                                            "fonction_id",
                                                        )}
                                                    >
                                                        <option value="">
                                                            Sélectionner une
                                                            fonction
                                                        </option>
                                                        {fonctions.map(
                                                            (f) => (
                                                                <option
                                                                    key={f.id}
                                                                    value={
                                                                        f.id
                                                                    }
                                                                >
                                                                    {
                                                                        f.libelle
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </Field>
                                                <Field
                                                    label="Spécialité"
                                                    required
                                                    dark={dark}
                                                    error={errors.specialite} name="specialite"
                                                >
                                                    <input
                                                        type="text"
                                                        value={
                                                            form.specialite
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "specialite",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={inp(
                                                            "specialite",
                                                        )}
                                                        placeholder="Ex: Médecin spécialiste en chirurgie"
                                                    />
                                                </Field>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ══════ ONGLET 4 : DIPLÔMES (non-stagiaire) ══════ */}
                                {activeTab === "diplomes" &&
                                    typePersonnel !== "STAGIAIRE" && (
                                    <div className="space-y-3">
                                        {diplomes.map((diplome, index) => (
                                            <div
                                                key={index}
                                                className={dipCard}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                            diplome.est_principal
                                                                ? dark
                                                                    ? "text-blue-400 border-blue-500/20 bg-blue-500/10"
                                                                    : "text-blue-600 border-blue-200 bg-blue-50"
                                                                : dark
                                                                  ? "text-slate-500 border-white/10 bg-white/5"
                                                                  : "text-slate-500 border-slate-200 bg-slate-100"
                                                        }`}
                                                    >
                                                        {diplome.est_principal
                                                            ? "★ Principal"
                                                            : `Diplôme ${index + 1}`}
                                                    </span>
                                                    {!diplome.est_principal && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                supprimerDiplome(
                                                                    index,
                                                                )
                                                            }
                                                            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="w-3.5 h-3.5"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                            Supprimer
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <Field
                                                        label="Intitulé"
                                                        required={
                                                            diplome.est_principal &&
                                                            typePersonnel !==
                                                                "BENEVOLE"
                                                        }
                                                        dark={dark}
                                                        name={
                                                            index === 0
                                                                ? "diplome0"
                                                                : undefined
                                                        }
                                                        error={
                                                            index === 0
                                                                ? errors.diplome0
                                                                : null
                                                        }
                                                    >
                                                        <input
                                                            type="text"
                                                            placeholder="Ex: Doctorat en Médecine"
                                                            value={
                                                                diplome.libelle
                                                            }
                                                            onChange={(e) =>
                                                                handleDiplomeChange(
                                                                    index,
                                                                    "libelle",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={
                                                                index === 0 &&
                                                                errors.diplome0
                                                                    ? inputErr
                                                                    : inputCls
                                                            }
                                                        />
                                                    </Field>
                                                    <Field
                                                        label="Établissement"
                                                        dark={dark}
                                                        name={`etab${index}`}
                                                        // [AJOUT] Liaison avec le message d'erreur
                                                        error={
                                                            errors[
                                                                `etab${index}`
                                                            ]
                                                        }
                                                    >
                                                        <input
                                                            type="text"
                                                            placeholder="Ex: Université d'Antananarivo"
                                                            value={
                                                                diplome.etablissement
                                                            }
                                                            onChange={(e) =>
                                                                handleDiplomeChange(
                                                                    index,
                                                                    "etablissement",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={inputCls}
                                                        />
                                                    </Field>
                                                    <Field
                                                        label="Année d'obtention"
                                                        dark={dark}
                                                    >
                                                        <input
                                                            type="number"
                                                            min="1950"
                                                            max={new Date().getFullYear()}
                                                            placeholder="Ex: 2010"
                                                            value={
                                                                diplome.annee_obtention
                                                            }
                                                            onChange={(e) =>
                                                                handleDiplomeChange(
                                                                    index,
                                                                    "annee_obtention",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={inputCls}
                                                        />
                                                    </Field>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={ajouterDiplome}
                                            className={`w-full py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                dark
                                                    ? "border-white/10 border-dashed text-slate-500 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5"
                                                    : "border-slate-300 border-dashed text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50"
                                            }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                            Ajouter un autre diplôme
                                        </button>
                                    </div>
                                )}

                                {/* ══════ ONGLET 4 (bis) : INFOS DE STAGE (stagiaire) ══════ */}
                                {activeTab === "diplomes" &&
                                    typePersonnel === "STAGIAIRE" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field
                                            label="Établissement"
                                            required
                                            dark={dark}
                                            error={errors.etablissement} name="etablissement"
                                        >
                                            <input
                                                type="text"
                                                value={form.etablissement}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "etablissement",
                                                        e.target.value,
                                                    )
                                                }
                                                className={inp(
                                                    "etablissement",
                                                )}
                                                placeholder="Ex: Université d'Antananarivo"
                                            />
                                        </Field>
                                        <Field
                                            label="Niveau"
                                            required
                                            dark={dark}
                                            error={errors.niveau} name="niveau"
                                        >
                                            <input
                                                type="text"
                                                value={form.niveau}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "niveau",
                                                        e.target.value,
                                                    )
                                                }
                                                className={inp("niveau")}
                                                placeholder="Ex: Master 2"
                                            />
                                        </Field>
                                        <Field
                                            label="Filière / Parcours"
                                            required
                                            dark={dark}
                                            error={errors.filiere_parcours} name="filiere_parcours"
                                        >
                                            <input
                                                type="text"
                                                value={form.filiere_parcours}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "filiere_parcours",
                                                        e.target.value,
                                                    )
                                                }
                                                className={inp(
                                                    "filiere_parcours",
                                                )}
                                                placeholder="Ex: Génie Logiciel"
                                            />
                                        </Field>
                                        <Field
                                            label="Durée du stage (mois)"
                                            required
                                            dark={dark}
                                            error={errors.duree_mois} name="duree_mois"
                                        >
                                            <input
                                                type="number"
                                                min="1"
                                                value={form.duree_mois}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "duree_mois",
                                                        e.target.value,
                                                    )
                                                }
                                                className={inp("duree_mois")}
                                                placeholder="Ex: 4"
                                            />
                                        </Field>
                                        <p
                                            className={`sm:col-span-2 text-xs ${sub}`}
                                        >
                                            La date de fin de stage est
                                            calculée automatiquement à partir
                                            de la durée saisie.
                                        </p>
                                    </div>
                                )}

                                {/* ══════ ONGLET 5 : ACCÈS SIH ══════ */}
                                {activeTab === "acces" && (
                                    <div className="space-y-4">
                                        {aAccesSih ? (
                                            <div
                                                className={`rounded-xl border p-4 text-sm flex items-center gap-3 ${dark ? "bg-white/3 border-white/8 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-5 h-5 shrink-0"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Ce membre du personnel
                                                dispose déjà d&apos;un accès
                                                SIH. La gestion de son compte
                                                (mot de passe, désactivation,
                                                etc.) se fait depuis un autre
                                                écran.
                                            </div>
                                        ) : (
                                            <>
                                                <label
                                                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 cursor-pointer transition-all ${
                                                        dark
                                                            ? "border-white/10 bg-white/5 text-slate-300"
                                                            : "border-slate-200 bg-white text-slate-700"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            form.donner_access
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "donner_access",
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                                                    />
                                                    <span className="text-sm font-medium">
                                                        Donner un accès SIH
                                                    </span>
                                                </label>

                                                {form.donner_access && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <Field
                                                            label="Nom d'utilisateur"
                                                            required
                                                            dark={dark}
                                                            name="username"
                                                            error={
                                                                errors.username
                                                            }
                                                        >
                                                            <input
                                                                type="text"
                                                                value={
                                                                    form.username
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) =>
                                                                    handleChange(
                                                                        "username",
                                                                        e
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                className={inp(
                                                                    "username",
                                                                )}
                                                                placeholder="Ex: jrakoto"
                                                            />
                                                        </Field>
                                                        <Field
                                                            label="Mot de passe"
                                                            required
                                                            dark={dark}
                                                            name="password"
                                                            error={
                                                                errors.password
                                                            }
                                                        >
                                                            <input
                                                                type="password"
                                                                value={
                                                                    form.password
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) =>
                                                                    handleChange(
                                                                        "password",
                                                                        e
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                className={inp(
                                                                    "password",
                                                                )}
                                                                placeholder="••••••••"
                                                            />
                                                        </Field>
                                                        {/* [AJOUT] Rôle SIH — envoie value (brut), affiche label */}
                                                        <Field
                                                            label="Rôle"
                                                            required
                                                            dark={dark}
                                                            name="role"
                                                            error={
                                                                errors.role
                                                            }
                                                        >
                                                            <select
                                                                value={
                                                                    form.role
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) =>
                                                                    handleChange(
                                                                        "role",
                                                                        e
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                className={sel(
                                                                    "role",
                                                                )}
                                                            >
                                                                <option value="">
                                                                    Sélectionner
                                                                    un rôle
                                                                </option>
                                                                {ROLES.map(
                                                                    (r) => (
                                                                        <option
                                                                            key={
                                                                                r.value
                                                                            }
                                                                            value={
                                                                                r.value
                                                                            }
                                                                        >
                                                                            {
                                                                                r.label
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </Field>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Pied du modal : Annuler + Enregistrer ── */}
                    <div
                        className={`flex items-center justify-end gap-3 px-5 py-4 border-t rounded-b-2xl ${dark ? "border-white/8 bg-white/2" : "border-slate-100 bg-slate-50/50"}`}
                    >
                        {/* [MODIFIÉ] Annuler — ouvre le modal de confirmation d'annulation */}
                        <button
                            onClick={() => setConfirmClose(true)}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                                dark
                                    ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            Annuler
                        </button>
                        {/* [MODIFIÉ] Enregistrer — ouvre le modal de confirmation */}
                        <button
                            onClick={() => {
                                const e = validate();
                                if (Object.keys(e).length > 0) {
                                    setErrors(e);
                                    // Emmène directement sur le premier champ fautif
                                    goToFirstError(e);
                                    return;
                                }
                                setConfirmSave(true);
                            }}
                            disabled={submitting || loadingProfile}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Enregistrer les modifications
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}