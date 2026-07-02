import { Component, useEffect, useRef, useState } from "react";
import "../App.css";
import ComfirmModal from "./ConfirModal";

const API_BASE = "http://localhost:3000";

// ── Error Boundary : capture les erreurs de rendu et affiche un message clair
// au lieu d'une page blanche
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, message: "" };
    }
    static getDerivedStateFromError(err) {
        return { hasError: true, message: err?.message || "Erreur inconnue" };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center max-w-sm">
                        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-8 h-8 text-rose-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 mb-2">
                            Une erreur est survenue
                        </h2>
                        <p className="text-sm text-slate-500 mb-4">
                            {this.state.message}
                        </p>
                        <button
                            onClick={() =>
                                this.setState({ hasError: false, message: "" })
                            }
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const CATEGORIES = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
    { value: "V", label: "V" },
    { value: "VI", label: "VI" },
    { value: "VII", label: "VII" },
    { value: "VIII", label: "VIII" },
    { value: "IX", label: "IX" },
    { value: "X", label: "X" },
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
const DIPLOME_VIDE = {
    libelle: "",
    etablissement: "",
    annee_obtention: "",
    est_principal: false,
};

// ── Définition des étapes (label + icône SVG)
const STEPS = [
    {
        id: 1,
        label: "Identité",
        icon: (active) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active ? 2.5 : 2}
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
        id: 2,
        label: "Situation",
        icon: (active) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active ? 2.5 : 2}
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
        id: 3,
        label: "Affectation",
        icon: (active) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active ? 2.5 : 2}
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
        id: 4,
        label: "Diplômes",
        icon: (active) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active ? 2.5 : 2}
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
        id: 5,
        label: "Compte",
        icon: (active) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active ? 2.5 : 2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
            </svg>
        ),
    },
];

// ════════════════════════════════════════════════════════════════════
// Sous-composants UI
// ════════════════════════════════════════════════════════════════════

function Field({ label, required, children, error, dark }) {
    return (
        <div className="flex flex-col gap-1.5">
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

// Ligne récap pour l'étape 5
function RecapRow({ label, value, dark }) {
    return (
        <div
            className={`flex items-start justify-between py-2 border-b last:border-0 ${dark ? "border-white/5" : "border-slate-100"}`}
        >
            <span
                className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}
            >
                {label}
            </span>
            <span
                className={`text-xs font-semibold text-right max-w-[60%] ${dark ? "text-slate-200" : "text-slate-700"}`}
            >
                {value || (
                    <span className="italic opacity-50">Non renseigné</span>
                )}
            </span>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════
// Composant principal
// ════════════════════════════════════════════════════════════════════
export function AddPersonnelInner({ dark, onAnnuler, refreshNotifications }) {
    const fileInputRef = useRef(null);
    const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes en millisecondes

    // Helper pour vérifier si le brouillon est toujours valide
    const getValidDraft = (key, defaultValue) => {
        const saved = localStorage.getItem(key);
        const timestamp = localStorage.getItem("add_personnel_timestamp");

        if (saved && timestamp) {
            const isExpired =
                Date.now() - parseInt(timestamp, 10) > THIRTY_MINUTES;
            if (!isExpired)
                return key === "add_personnel_step"
                    ? parseInt(saved, 10)
                    : JSON.parse(saved);
        }
        return defaultValue;
    };

    // ── Étape active (1 à 5)
    // currentStep contrôle quelle section du formulaire est visible
    const [currentStep, setCurrentStep] = useState(() => {
        return getValidDraft("add_personnel_step", 1);
    });

    // ── Données du formulaire
    const [form, setForm] = useState(() => {
        return getValidDraft("add_personnel_form", {
            nom: "",
            prenoms: "",
            im: "",
            date_naissance: "",
            genre_id: "",
            date_entree_admin: "", // [NOUVEAU] Date d'arrivée réelle à l'administration
            corps: "", // [NOUVEAU] Corps du personnel
            categorie: "",
            classe: "",
            echelon: "",
            specialite: "",
            telephone: "",
            email: "",
            date_effet: "",
            num_arrete: "",
            service_id: "",
            fonction_id: "",
            statut: "En activité",
            username: "",
            password: "",
            role: "user",
        });
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [diplomes, setDiplomes] = useState(() => {
        return getValidDraft("add_personnel_diplomes", [
            { ...DIPLOME_VIDE, est_principal: true },
        ]);
    });

    const [creerCompte, setCreerCompte] = useState(() => {
        return getValidDraft("add_personnel_creerCompte", false);
    });

    // ── Données API
    const [services, setServices] = useState([]);
    const [fonctions, setFonctions] = useState([]);

    // ── États soumission
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // [AJOUTÉ] État pour afficher/masquer le mot de passe

    const [confirmSave, setConfirmSave] = useState(false);
    const [confirmleave, setConfirmLeave] = useState(false);

    const token = localStorage.getItem("token");

    // ── Sauvegarde automatique dans localStorage
    const updateTimestamp = () => {
        localStorage.setItem("add_personnel_timestamp", Date.now().toString());
    };

    useEffect(() => {
        localStorage.setItem("add_personnel_form", JSON.stringify(form));
        updateTimestamp();
    }, [form]);

    useEffect(() => {
        localStorage.setItem(
            "add_personnel_diplomes",
            JSON.stringify(diplomes),
        );
        updateTimestamp();
    }, [diplomes]);

    useEffect(() => {
        localStorage.setItem(
            "add_personnel_creerCompte",
            JSON.stringify(creerCompte),
        );
        updateTimestamp();
    }, [creerCompte]);

    useEffect(() => {
        localStorage.setItem("add_personnel_step", currentStep.toString());
        updateTimestamp();
    }, [currentStep]);

    const clearSavedData = () => {
        localStorage.removeItem("add_personnel_form");
        localStorage.removeItem("add_personnel_diplomes");
        localStorage.removeItem("add_personnel_creerCompte");
        localStorage.removeItem("add_personnel_step");
        localStorage.removeItem("add_personnel_timestamp");
    };

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}` };
        fetch(`${API_BASE}/staff/departments`, { headers })
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
        fetch(`${API_BASE}/staff/fonctions`, { headers })
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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    const getSafeText = (value) => {
        if (value === null || value === undefined) return "";
        return typeof value === "string" ? value : String(value);
    };

    // ── Validation par étape
    // On valide uniquement les champs de l'étape en cours avant de passer à la suivante
    const validateStep = (step) => {
        const e = {};
        const noSpecialCharsRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'’-]+$/u;
        const noSpecialCharsAlphanumRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s'’-]+$/u;
        const safeDiplomes = Array.isArray(diplomes) ? diplomes : [];

        const nom = getSafeText(form.nom);
        const prenoms = getSafeText(form.prenoms);
        const im = getSafeText(form.im);
        const dateNaissance = getSafeText(form.date_naissance);
        const dateEntreeAdmin = getSafeText(form.date_entree_admin);
        const specialite = getSafeText(form.specialite);
        const telephone = getSafeText(form.telephone);
        const email = getSafeText(form.email);
        const username = getSafeText(form.username);
        const password = getSafeText(form.password);
        const dateEffet = getSafeText(form.date_effet);

        if (step === 1) {
            if (!nom.trim()) e.nom = "Requis";
            else if (!noSpecialCharsRegex.test(nom))
                e.nom =
                    "Seules les lettres, espaces, accents, apostrophes et traits d'union sont autorisés";
            if (!prenoms.trim()) e.prenoms = "Requis";
            else if (!noSpecialCharsRegex.test(prenoms))
                e.prenoms =
                    "Seules les lettres, espaces, accents, apostrophes et traits d'union sont autorisés";
            if (!form.genre_id) e.genre_id = "Requis";
            if (!dateNaissance) e.date_naissance = "Requis";
            else {
                const birthDate = new Date(dateNaissance);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (
                    m < 0 ||
                    (m === 0 && today.getDate() < birthDate.getDate())
                ) {
                    age--;
                }
                if (age > 70) {
                    e.date_naissance = "L'âge ne doit pas dépasser 70 ans";
                }
                if (age < 16)
                    e.date_naissance = "L'âge doit être de 16 ans minimum";
            }
            // Validation du numéro de téléphone
            if (!telephone.trim()) {
                e.telephone = "Le numéro de téléphone est requis.";
            } else {
                const tel = telephone.trim().replace(/[\s-]/g, "");
                const telRegex = /^(\+261\d{9}|0\d{9})$/;
                if (!telRegex.test(tel)) {
                    e.telephone =
                        "Le numéro de téléphone n'est pas valide (ex: 034 00 000 00 ou +261 34 000 0000).";
                }
            }
            // Validation de l'email (si renseigné)
            if (email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    e.email =
                        "L'adresse email n'est pas valide (ex: jean@chu.mg).";
                }
            }
        }
        if (step === 2) {
            if (!im.trim()) e.im = "Requis";
            else if (!/^\d+$/.test(im.trim()))
                e.im = "Le matricule doit contenir uniquement des chiffres";
            if (!form.categorie) e.categorie = "Requis";
            if (!form.classe) e.classe = "Requis";
            if (!form.echelon) e.echelon = "Requis";
            if (!dateEffet) {
                e.date_effet = "Requis";
            } else if (dateNaissance) {
                const effectDate = new Date(dateEffet);
                const birthDate = new Date(dateNaissance);
                if (
                    !Number.isNaN(effectDate.getTime()) &&
                    !Number.isNaN(birthDate.getTime()) &&
                    effectDate < birthDate
                ) {
                    e.date_effet =
                        "La date d'effet ne peut pas être inférieure ou égal à la date de naissance";
                }
            }
            if (dateEntreeAdmin && dateNaissance) {
                const entryDate = new Date(dateEntreeAdmin);
                const birthDate = new Date(dateNaissance);
                if (
                    !Number.isNaN(entryDate.getTime()) &&
                    !Number.isNaN(birthDate.getTime()) &&
                    entryDate < birthDate
                ) {
                    e.date_entree_admin =
                        "La date d'entrée ne peut pas être inférieur ou égal à la date de naissance";
                }
            }
        }
        if (step === 3) {
            if (!form.service_id) e.service_id = "Requis";
            if (!form.fonction_id) e.fonction_id = "Requis";
            if (!specialite.trim()) e.specialite = "Requis";
            else if (!noSpecialCharsAlphanumRegex.test(specialite))
                e.specialite =
                    "Seules les lettres, chiffres, espaces, accents, apostrophes et traits d'union sont autorisés";
        }
        if (step === 4) {
            if (
                !safeDiplomes[0] ||
                !getSafeText(safeDiplomes[0].libelle).trim()
            )
                e.diplome0 = "Le diplôme principal est requis";
            safeDiplomes.forEach((d, i) => {
                const libelle = getSafeText(d?.libelle);
                const etablissement = getSafeText(d?.etablissement);
                if (libelle && !noSpecialCharsAlphanumRegex.test(libelle))
                    e[`diplome${i}`] = "Pas de caractères spéciaux";
                if (
                    etablissement &&
                    !noSpecialCharsAlphanumRegex.test(etablissement)
                )
                    e[`etab${i}`] = "Pas de caractères spéciaux";
            });
        }
        if (step === 5 && creerCompte) {
            if (!username.trim()) e.username = "Requis";
            else if (!/^[a-zA-Z0-9]+$/.test(username))
                e.username = "Pas de caractères spéciaux";
            if (password.length < 6) e.password = "Minimum 6 caractères";
        }
        return e;
    };

    // ── Navigation entre étapes
    const goNext = () => {
        const e = validateStep(currentStep);
        if (Object.keys(e).length > 0) {
            setErrors(e);
            return;
        }
        setErrors({});
        setCurrentStep((s) => Math.min(5, s + 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goPrev = () => {
        setErrors({});
        setCurrentStep((s) => Math.max(1, s - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // [AJOUT] Fonction pour gérer la navigation par clic sur les icônes de progression
    const handleStepClick = (targetStepId) => {
        if (targetStepId < currentStep) {
            // [AJOUT] Navigation vers l'arrière : Toujours autorisée
            setErrors({});
            setCurrentStep(targetStepId);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (targetStepId > currentStep) {
            // [AJOUT] Navigation vers l'avant : On valide chaque étape entre l'actuelle et la cible
            for (let s = currentStep; s < targetStepId; s++) {
                const stepErrors = validateStep(s);
                if (Object.keys(stepErrors).length > 0) {
                    // [AJOUT] Si une erreur est trouvée, on bloque la navigation et on affiche l'erreur
                    setErrors(stepErrors);
                    setCurrentStep(s);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    return;
                }
            }
            // [AJOUT] Si toutes les étapes intermédiaires sont valides, on saute directement à la cible
            setErrors({});
            setCurrentStep(targetStepId);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Helper pour valider toutes les étapes et rediriger vers la première erreur trouvée
    const validateAllAndRedirect = () => {
        for (let step = 1; step <= 5; step++) {
            const stepErrors = validateStep(step);
            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors);
                setCurrentStep(step);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return false;
            }
        }
        return true;
    };

    // ── Soumission finale (étape 5)
    const handleSubmit = async () => {
        if (!validateAllAndRedirect()) return;

        setSubmitting(true);
        setApiError(null);
        try {
            const fd = new FormData();
            if (photoFile) fd.append("photo", photoFile);
            fd.append("nom", form.nom.trim());
            fd.append("prenoms", form.prenoms.trim());
            fd.append("im", form.im.trim());
            fd.append("date_naissance", form.date_naissance);
            fd.append("genre_id", form.genre_id);
            fd.append("categorie", form.categorie);
            fd.append("classe", form.classe);
            fd.append("echelon", form.echelon);
            fd.append("specialite", form.specialite.trim());
            fd.append("corps", form.corps?.trim() || "");
            fd.append("date_effet", form.date_effet);
            fd.append("num_arrete", form.num_arrete?.trim() || "");
            // [NOUVEAU] Date d'entrée admin — envoyée uniquement si renseignée
            if (form.date_entree_admin)
                fd.append("date_entree_admin", form.date_entree_admin);
            fd.append("telephone", normalizePhoneForBackend(form.telephone));
            fd.append("email", form.email.trim());
            fd.append("service_id", form.service_id);
            fd.append("fonction_id", form.fonction_id);
            fd.append("statut", form.statut);
            fd.append("diplomes", JSON.stringify(diplomes));

            // donner_access : booléen envoyé dans TOUS les cas (true ou false)
            // Le back l'utilise pour décider de créer ou non un compte utilisateur.
            // FormData ne supporte pas les booléens → on convertit en string "true"/"false"
            // Le back fait : const donnerAccess = req.body.donner_access === "true"
            fd.append("donner_access", String(creerCompte));

            if (creerCompte) {
                fd.append("username", form.username.trim());
                fd.append("password", form.password);
                fd.append("role", form.role || "user");
            }

            const res = await fetch(`${API_BASE}/staff/add`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.message || `Erreur ${res.status}`);
            }
            setSuccess(true);
            if (typeof refreshNotifications === "function") {
                refreshNotifications();
            }
            clearSavedData();
            // Reset complet
            setForm({
                nom: "",
                prenoms: "",
                im: "",
                date_naissance: "",
                genre_id: "",
                corps: "",
                date_entree_admin: "",
                categorie: "",
                classe: "",
                echelon: "",
                specialite: "",
                telephone: "",
                email: "",
                service_id: "",
                fonction_id: "",
                statut: "En activité",
                username: "",
                password: "",
                role: "user",
                date_effet: "",
                num_arrete: "",
            });
            setDiplomes([{ ...DIPLOME_VIDE, est_principal: true }]);
            setPhotoFile(null);
            setPhotoPreview(null);
            setCreerCompte(false);
            setErrors({});
            setCurrentStep(1);
        } catch (err) {
            setApiError(err.message);
            // Redirection intelligente selon l'erreur renvoyée par l'API
            const msg = err.message.toLowerCase();
            let fieldKey = null;
            if (msg.includes("matricule") || msg.includes(" im ")) {
                setCurrentStep(1);
                fieldKey = "im";
            } else if (msg.includes("téléphone") || msg.includes("telephone")) {
                setCurrentStep(3);
                fieldKey = "telephone";
            } else if (msg.includes("email")) {
                setCurrentStep(3);
                fieldKey = "email";
            } else if (
                msg.includes("username") ||
                msg.includes("utilisateur")
            ) {
                setCurrentStep(5);
                fieldKey = "username";
            }

            if (fieldKey)
                setErrors((prev) => ({ ...prev, [fieldKey]: err.message }));

            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Calcul de la progression (% de champs remplis) pour la barre
    // On compte les champs obligatoires remplis sur le total
    const progressPercent =
        STEPS.length <= 1
            ? 100
            : Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

    // ── Tokens thème
    const bg = dark ? "bg-[#0a0f1e]" : "bg-slate-50";
    const card = dark
        ? "bg-[#0d1526] border-white/8"
        : "bg-white border-slate-200 shadow-sm";
    const inputCls = dark
        ? "w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-slate-600 outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
        : "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all";
    const inputErr = dark
        ? "w-full px-3.5 py-2.5 rounded-xl border-2 border-rose-500 bg-rose-500/10 text-white text-sm placeholder:text-slate-400 outline-none ring-4 ring-rose-500/10 transition-all"
        : "w-full px-3.5 py-2.5 rounded-xl border-2 border-rose-500 bg-rose-50 text-slate-800 text-sm placeholder:text-slate-400 outline-none ring-4 ring-rose-500/10 transition-all";
    const selectCls = dark
        ? "w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-sm outline-none focus:border-blue-500/60 cursor-pointer transition-all [&_option]:text-black [&_option]:bg-white"
        : "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-blue-400 cursor-pointer transition-all";
    const selectErr = dark
        ? "w-full px-3.5 py-2.5 rounded-xl border-2 border-rose-500 bg-rose-500/10 text-slate-200 text-sm outline-none cursor-pointer transition-all [&_option]:text-black [&_option]:bg-white ring-4 ring-rose-500/10"
        : "w-full px-3.5 py-2.5 rounded-xl border-2 border-rose-500 bg-rose-50 text-slate-700 text-sm outline-none cursor-pointer transition-all ring-4 ring-rose-500/10";

    const inp = (name) => (errors[name] ? inputErr : inputCls);
    const sel = (name) => (errors[name] ? selectErr : selectCls);
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const ttl = dark ? "text-white" : "text-slate-800";
    const dipCard = dark
        ? "bg-white/3 border-white/8 rounded-xl border p-4 space-y-3"
        : "bg-slate-50 border-slate-200 rounded-xl border p-4 space-y-3";

    if (success) {
        return (
            <div
                className={`flex-1 flex items-center justify-center p-6 ${bg}`}
            >
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-10 h-10 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className={`text-xl font-bold mb-2 ${ttl}`}>
                        Personnel enregistré !
                    </h2>
                    <p className={`text-sm mb-6 ${sub}`}>
                        Le nouveau membre du personnel a été ajouté avec succès
                        dans le système.
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
                    >
                        Ajouter un autre personnel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-1 overflow-auto ${bg}`}>
            {confirmSave && (
                <ComfirmModal
                    dark={dark}
                    type="confirm"
                    title="Enregistrer le personnel ?"
                    message="Vous êtes sur le point d'ajouter un nouveau membre. Veuillez vérifier les informations dans le recapitulatif avant de confirmer."
                    labelOui="Oui, enregistrer"
                    labelNon="Non, vérifier"
                    onConfirm={() => {
                        setConfirmSave(false);
                        handleSubmit();
                    }}
                    onCancel={() => setConfirmSave(false)}
                />
            )}

            {confirmleave && (
                <ComfirmModal
                    dark={dark}
                    type="danger"
                    title="Abandonner le formulaire ?"
                    message="Toutes les informations saisies seront perdues. Cette action est irréversible"
                    labelOui="Oui, abandonner"
                    labelNon="Non, continuer"
                    onConfirm={() => {
                        setConfirmLeave(false);
                        clearSavedData();
                        onAnnuler();
                    }}
                    onCancel={() => setConfirmLeave(false)}
                />
            )}

            <div className="max-w-2xl mx-auto p-4 lg:p-6">
                {/* ── En-tête ── */}
                <div className="mb-6">
                    <h1 className={`text-2xl lg:text-3xl font-bold ${ttl}`}>
                        Ajouter un Personnel
                    </h1>
                    <p className={`text-sm mt-1 ${sub}`}>
                        Complétez les informations en {STEPS.length} étapes
                    </p>
                </div>

                {/* ════════════════════════════════════════
            BARRE DE PROGRESSION
            - Affiche les 5 étapes avec leur état (fait / actif / à venir)
            - La ligne entre chaque étape se remplit progressivement
        ════════════════════════════════════════ */}
                <div className={`rounded-2xl border p-5 mb-5 ${card}`}>
                    <div className="flex items-center">
                        {STEPS.map((step, idx) => {
                            const done = currentStep > step.id;
                            const active = currentStep === step.id;
                            const last = idx === STEPS.length - 1;

                            return (
                                <div
                                    key={step.id}
                                    className="flex items-center flex-1 last:flex-none"
                                >
                                    {/* Pastille — cliquable uniquement si l'étape est déjà validée (done) */}
                                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            // [AJOUT] On utilise handleStepClick pour permettre d'avancer ou reculer
                                            onClick={() =>
                                                handleStepClick(step.id)
                                            }
                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 cursor-pointer ${
                                                done
                                                    ? "bg-blue-600 border-blue-600 text-white cursor-pointer hover:bg-blue-500 hover:scale-110"
                                                    : active
                                                      ? dark
                                                          ? "border-blue-500 bg-blue-500/15 text-blue-400 cursor-default"
                                                          : "border-blue-500 bg-blue-50 text-blue-600 cursor-default"
                                                      : dark
                                                        ? "border-white/10 bg-white/3 text-slate-600 cursor-default"
                                                        : "border-slate-200 bg-slate-50 text-slate-400 cursor-default"
                                            }`}
                                        >
                                            {done ? (
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
                                            ) : (
                                                step.icon(active)
                                            )}
                                        </button>
                                        {/* Label de l'étape — visible sur md+ */}
                                        <span
                                            className={`hidden sm:block text-[10px] font-semibold whitespace-nowrap transition-colors ${
                                                active
                                                    ? dark
                                                        ? "text-blue-400"
                                                        : "text-blue-600"
                                                    : done
                                                      ? dark
                                                          ? "text-slate-300"
                                                          : "text-slate-600"
                                                      : dark
                                                        ? "text-slate-600"
                                                        : "text-slate-400"
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>

                                    {/* Ligne de connexion entre les étapes */}
                                    {!last && (
                                        <div
                                            className={`flex-1 h-0.5 mx-2 rounded-full overflow-hidden ${dark ? "bg-white/8" : "bg-slate-200"}`}
                                        >
                                            <div
                                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                                style={{
                                                    width: done ? "100%" : "0%",
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Barre de progression globale en % */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[11px] font-medium ${sub}`}>
                                Progression globale
                            </span>
                            <span
                                className={`text-[11px] font-bold ${dark ? "text-blue-400" : "text-blue-600"}`}
                            >
                                {progressPercent}%
                            </span>
                        </div>
                        <div
                            className={`w-full h-1.5 rounded-full ${dark ? "bg-white/8" : "bg-slate-200"}`}
                        >
                            <div
                                className="h-full bg-linear-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Erreur API ── */}
                {apiError && (
                    <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 flex items-center gap-3 text-rose-400 text-sm">
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

                {/* ════════════════════════════════════════════════════════════════
            CARTE DU FORMULAIRE
            Affiche uniquement le contenu de l'étape active (currentStep)
        ════════════════════════════════════════════════════════════════ */}
                <div className={`rounded-2xl border ${card}`}>
                    {/* ── ÉTAPE 1 : IDENTITÉ ── */}
                    {currentStep === 1 && (
                        <div key="step-1" className="p-5 lg:p-6 space-y-5">
                            <div
                                className={`flex items-center gap-2 pb-4 border-b ${dark ? "border-white/8" : "border-slate-100"}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}
                                >
                                    {STEPS[0].icon(true)}
                                </div>
                                <div>
                                    <h2 className={`text-sm font-bold ${ttl}`}>
                                        Identité du membre
                                    </h2>
                                    <p className={`text-xs ${sub}`}>
                                        Photo, nom complet et informations de
                                        base
                                    </p>
                                </div>
                            </div>

                            {/* Photo */}
                            <div className="flex items-center gap-5">
                                <div
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 cursor-pointer group border-2 border-dashed transition-all ${
                                        photoPreview
                                            ? "border-transparent"
                                            : dark
                                              ? "border-white/15 hover:border-blue-500/50"
                                              : "border-slate-300 hover:border-blue-400"
                                    }`}
                                >
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Aperçu"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className={`w-full h-full flex flex-col items-center justify-center gap-1 ${dark ? "bg-white/5" : "bg-slate-50"}`}
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
                                            <span
                                                className={`text-[9px] font-medium ${dark ? "text-slate-600" : "text-slate-400"}`}
                                            >
                                                Photo
                                            </span>
                                        </div>
                                    )}
                                    {/* Overlay hover */}
                                    {photoPreview && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5 text-white"
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
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handlePhoto(e.target.files[0])
                                    }
                                />
                                <div>
                                    <p className={`text-sm font-medium ${ttl}`}>
                                        Photo de profil
                                    </p>
                                    <p className={`text-xs mt-0.5 mb-2 ${sub}`}>
                                        JPG, PNG ou WEBP — max 5 Mo
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                                                dark
                                                    ? "border-white/10 text-slate-300 hover:bg-white/8"
                                                    : "border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                                            }`}
                                        >
                                            {photoPreview
                                                ? "Changer"
                                                : "Choisir"}
                                        </button>
                                        {photoPreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPhotoFile(null);
                                                    setPhotoPreview(null);
                                                }}
                                                className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Nom */}
                                <Field
                                    label="Nom"
                                    required
                                    dark={dark}
                                    error={errors.nom}
                                >
                                    <input
                                        type="text"
                                        placeholder="Ex: RAKOTO"
                                        value={form.nom}
                                        onChange={(e) =>
                                            handleChange("nom", e.target.value)
                                        }
                                        className={inp("nom")}
                                    />
                                </Field>

                                {/* Prénoms */}
                                <Field
                                    label="Prénoms"
                                    required
                                    dark={dark}
                                    error={errors.prenoms}
                                >
                                    <input
                                        type="text"
                                        placeholder="Ex: Jean Paul"
                                        value={form.prenoms}
                                        onChange={(e) =>
                                            handleChange(
                                                "prenoms",
                                                e.target.value,
                                            )
                                        }
                                        className={inp("prenoms")}
                                    />
                                </Field>

                                {/* Date de naissance */}
                                <Field
                                    label="Date de naissance"
                                    required
                                    dark={dark}
                                    error={errors.date_naissance}
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
                                        className={inp("date_naissance")}
                                    />
                                </Field>

                                {/* Sexe */}
                                <Field
                                    label="Sexe"
                                    required
                                    dark={dark}
                                    error={errors.genre_id}
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
                                        <option value="">Sélectionner</option>
                                        <option value="1">Masculin</option>
                                        <option value="2">Féminin</option>
                                    </select>
                                </Field>

                                {/* Téléphone */}
                                <Field
                                    label="Téléphone"
                                    required
                                    dark={dark}
                                    error={errors.telephone}
                                >
                                    <input
                                        type="text"
                                        placeholder="Ex: 034 24 724 58"
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
                                    />
                                </Field>

                                {/* Email */}
                                <Field
                                    label="Email"
                                    required
                                    dark={dark}
                                    error={errors.email}
                                >
                                    <input
                                        type="email"
                                        placeholder="Ex: jean.paul@hopital.mg"
                                        value={form.email}
                                        onChange={(e) =>
                                            handleChange(
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                        className={inp("email")}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* ── ÉTAPE 2 : SITUATION ADMINISTRATIVE ── */}
                    {currentStep === 2 && (
                        <div key="step-2" className="p-5 lg:p-6 space-y-5">
                            <div
                                className={`flex items-center gap-2 pb-4 border-b ${dark ? "border-white/8" : "border-slate-100"}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}
                                >
                                    {STEPS[1].icon(true)}
                                </div>
                                <div>
                                    <h2 className={`text-sm font-bold ${ttl}`}>
                                        Situation administrative
                                    </h2>
                                    <p className={`text-xs ${sub}`}>
                                        Matricule, statut, affectation et grade
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Matricule */}
                                <Field
                                    label="Matricule"
                                    required
                                    dark={dark}
                                    error={errors.im}
                                >
                                    <input
                                        type="text"
                                        placeholder="Ex: 371815"
                                        value={form.im}
                                        onChange={(e) =>
                                            handleChange(
                                                "im",
                                                e.target.value.replace(
                                                    /\s/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        className={inp("im")}
                                    />
                                </Field>

                                {/* Statut */}
                                <Field
                                    label="Statut"
                                    required
                                    dark={dark}
                                    error={errors.statut}
                                >
                                    <select
                                        value={form.statut}
                                        onChange={(e) =>
                                            handleChange(
                                                "statut",
                                                e.target.value,
                                            )
                                        }
                                        className={sel("statut")}
                                    >
                                        {STATUTS.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Date d'entrée dans l'administration */}
                                <Field
                                    label="Date d'entrée dans l'administration"
                                    required
                                    dark={dark}
                                    error={errors.date_entree_admin}
                                >
                                    <input
                                        type="date"
                                        value={form.date_entree_admin || ""}
                                        onChange={(e) =>
                                            handleChange(
                                                "date_entree_admin",
                                                e.target.value,
                                            )
                                        }
                                        className={inp("date_entree_admin")}
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                    />
                                </Field>

                                {/* Corps */}
                                <Field
                                    label="Corps"
                                    dark={dark}
                                    error={errors.corps}
                                >
                                    <input
                                        type="text"
                                        placeholder="Ex: Cadre supérieur, Cadre moyen"
                                        value={form.corps || ""}
                                        onChange={(e) =>
                                            handleChange(
                                                "corps",
                                                e.target.value,
                                            )
                                        }
                                        className={inp("corps")}
                                    />
                                </Field>

                                {/* Numéro d'arrêté */}
                                <Field
                                    label="Numéro d'arrêté"
                                    dark={dark}
                                    error={errors.num_arrete}
                                >
                                    <input
                                        type="text"
                                        placeholder="Ex: 11551/2025/MEN"
                                        value={form.num_arrete ?? ""}
                                        onChange={(e) =>
                                            handleChange(
                                                "num_arrete",
                                                e.target.value,
                                            )
                                        }
                                        className={inp("num_arrete")}
                                    />
                                </Field>

                                {/* Date d'effet */}
                                <Field
                                    label="Date d'effet"
                                    required
                                    dark={dark}
                                    error={errors.date_effet}
                                >
                                    <input
                                        type="date"
                                        value={form.date_effet}
                                        onChange={(e) =>
                                            handleChange(
                                                "date_effet",
                                                e.target.value,
                                            )
                                        }
                                        className={inp("date_effet")}
                                    />
                                </Field>

                                {/* Catégorie */}
                                <Field
                                    label="Catégorie"
                                    required
                                    dark={dark}
                                    error={errors.categorie}
                                >
                                    <select
                                        value={form.categorie}
                                        onChange={(e) =>
                                            handleChange(
                                                "categorie",
                                                e.target.value,
                                            )
                                        }
                                        className={sel("categorie")}
                                    >
                                        <option value="">Sélectionner</option>
                                        {CATEGORIES.map((c) => (
                                            <option
                                                key={c.value}
                                                value={c.value}
                                            >
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Classe */}
                                <Field
                                    label="Classe"
                                    required
                                    dark={dark}
                                    error={errors.classe}
                                >
                                    <select
                                        value={form.classe}
                                        onChange={(e) =>
                                            handleChange(
                                                "classe",
                                                e.target.value,
                                            )
                                        }
                                        className={sel("classe")}
                                    >
                                        <option value="">Sélectionner</option>
                                        {CLASSES.map((c) => (
                                            <option
                                                key={c.value}
                                                value={c.value}
                                            >
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Échelon */}
                                <Field
                                    label="Échelon"
                                    required
                                    dark={dark}
                                    error={errors.echelon}
                                >
                                    <select
                                        value={form.echelon}
                                        onChange={(e) =>
                                            handleChange(
                                                "echelon",
                                                e.target.value,
                                            )
                                        }
                                        className={sel("echelon")}
                                    >
                                        <option value="">Sélectionner</option>
                                        {ECHELONS.map((e) => (
                                            <option key={e} value={e}>
                                                {e}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            {/* Message d'aide sur les grades */}
                            <div
                                className={`mt-4 p-3 rounded-xl border flex items-start gap-3 transition-all
                ${dark ? "bg-blue-500/5 border-blue-500/10" : "bg-blue-50 border-blue-100"}`}
                            >
                                <div className="pt-0.5">
                                    <svg
                                        className={`w-4 h-4 ${dark ? "text-blue-400" : "text-blue-500"}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <p
                                    className={`text-[11px] leading-relaxed font-medium ${dark ? "text-blue-300/80" : "text-blue-700/80"}`}
                                >
                                    <span className="font-bold">Note :</span> La
                                    combinaison Catégorie + Classe + Échelon
                                    doit correspondre à un grade existant dans
                                    la base de données de référence pour valider
                                    l'enregistrement.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── ÉTAPE 3 : AFFECTATION ── */}
                    {currentStep === 3 && (
                        <div key="step-3" className="p-5 lg:p-6 space-y-5">
                            <div
                                className={`flex items-center gap-2 pb-4 border-b ${dark ? "border-white/8" : "border-slate-100"}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}
                                >
                                    {STEPS[2].icon(true)}
                                </div>
                                <div>
                                    <h2 className={`text-sm font-bold ${ttl}`}>
                                        Affectation
                                    </h2>
                                    <p className={`text-xs ${sub}`}>
                                        Service, fonction et spécialité
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Service */}
                                <Field
                                    label="Service"
                                    required
                                    dark={dark}
                                    error={errors.service_id}
                                >
                                    <select
                                        value={form.service_id}
                                        onChange={(e) =>
                                            handleChange(
                                                "service_id",
                                                e.target.value,
                                            )
                                        }
                                        className={sel("service_id")}
                                    >
                                        <option value="">
                                            Sélectionner un service
                                        </option>
                                        {services.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.libelle}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Fonction */}
                                <Field
                                    label="Fonction"
                                    required
                                    dark={dark}
                                    error={errors.fonction_id}
                                >
                                    <select
                                        value={form.fonction_id}
                                        onChange={(e) =>
                                            handleChange(
                                                "fonction_id",
                                                e.target.value,
                                            )
                                        }
                                        className={sel("fonction_id")}
                                    >
                                        <option value="">
                                            Sélectionner une fonction
                                        </option>
                                        {fonctions.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.libelle}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Spécialité */}
                                <Field
                                    label="Spécialité"
                                    required
                                    dark={dark}
                                    error={errors.specialite}
                                >
                                    <input
                                        type="text"
                                        placeholder="Ex: Médecin spécialiste en chirurgie"
                                        value={form.specialite}
                                        onChange={(e) =>
                                            handleChange(
                                                "specialite",
                                                e.target.value,
                                            )
                                        }
                                        className={inp("specialite")}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* ── ÉTAPE 4 : DIPLÔMES ── */}
                    {currentStep === 4 && (
                        <div key="step-4" className="p-5 lg:p-6 space-y-5">
                            <div
                                className={`flex items-center gap-2 pb-4 border-b ${dark ? "border-white/8" : "border-slate-100"}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}
                                >
                                    {STEPS[3].icon(true)}
                                </div>
                                <div>
                                    <h2 className={`text-sm font-bold ${ttl}`}>
                                        Diplômes & Formation
                                    </h2>
                                    <p className={`text-xs ${sub}`}>
                                        Renseignez le diplôme principal et les
                                        diplômes supplémentaires
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {diplomes.map((diplome, index) => (
                                    <div key={index} className={dipCard}>
                                        <div className="flex items-center justify-between mb-1">
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
                                                        supprimerDiplome(index)
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
                                                label="Intitulé du diplôme"
                                                required={diplome.est_principal}
                                                dark={dark}
                                                error={
                                                    index === 0
                                                        ? errors.diplome0 ||
                                                          errors.diplome0
                                                        : errors[
                                                              `diplome${index}`
                                                          ]
                                                }
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Ex: Doctorat en Médecine"
                                                    value={diplome.libelle}
                                                    onChange={(e) =>
                                                        handleDiplomeChange(
                                                            index,
                                                            "libelle",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        (index === 0 &&
                                                            errors.diplome0) ||
                                                        errors[
                                                            `diplome${index}`
                                                        ]
                                                            ? inputErr
                                                            : inputCls
                                                    }
                                                />
                                            </Field>
                                            <Field
                                                label="Établissement"
                                                dark={dark}
                                                error={errors[`etab${index}`]}
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
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        errors[`etab${index}`]
                                                            ? inputErr
                                                            : inputCls
                                                    }
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
                                                            e.target.value,
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
                        </div>
                    )}

                    {/* ── ÉTAPE 5 : COMPTE + RÉCAPITULATIF ── */}
                    {currentStep === 5 && (
                        <div key="step-5" className="p-5 lg:p-6 space-y-5">
                            <div
                                className={`flex items-center gap-2 pb-4 border-b ${dark ? "border-white/8" : "border-slate-100"}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}
                                >
                                    {STEPS[4].icon(true)}
                                </div>
                                <div>
                                    <h2 className={`text-sm font-bold ${ttl}`}>
                                        Compte & Récapitulatif
                                    </h2>
                                    <p className={`text-xs ${sub}`}>
                                        Vérifiez les informations avant de
                                        valider
                                    </p>
                                </div>
                            </div>

                            {/* Case à cocher compte */}
                            <label
                                className={`flex items-start gap-3 cursor-pointer select-none p-4 rounded-xl border transition-all ${
                                    creerCompte
                                        ? dark
                                            ? "border-blue-500/30 bg-blue-500/8"
                                            : "border-blue-300 bg-blue-50"
                                        : dark
                                          ? "border-white/8 bg-white/3 hover:border-white/15"
                                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                        creerCompte
                                            ? "bg-blue-600 border-blue-600"
                                            : dark
                                              ? "border-white/20 bg-white/5"
                                              : "border-slate-300 bg-white"
                                    }`}
                                >
                                    {creerCompte && (
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={creerCompte}
                                        onChange={(e) => {
                                            setCreerCompte(e.target.checked);
                                            if (!e.target.checked) {
                                                handleChange("username", "");
                                                handleChange("password", "");
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <p
                                        className={`text-sm font-semibold ${ttl}`}
                                    >
                                        Créer un compte d'accès HIS
                                    </p>
                                    <p className={`text-xs mt-0.5 ${sub}`}></p>
                                </div>
                            </label>

                            {creerCompte && (
                                <div
                                    className={`rounded-xl border p-4 space-y-4 ${dark ? "bg-white/3 border-white/8" : "bg-slate-50 border-slate-200"}`}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field
                                            label="Nom d'utilisateur"
                                            required
                                            dark={dark}
                                            error={errors.username}
                                        >
                                            <input
                                                type="text"
                                                placeholder="Ex: jean.rakoto"
                                                value={form.username}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "username",
                                                        e.target.value,
                                                    )
                                                }
                                                className={inp("username")}
                                                autoComplete="new-password"
                                            />
                                        </Field>
                                        <Field
                                            label="Mot de passe"
                                            required
                                            dark={dark}
                                            error={errors.password}
                                        >
                                            {" "}
                                            {/* [MODIFIÉ] */}
                                            <div className="relative">
                                                {" "}
                                                {/* [AJOUTÉ] Conteneur pour l'icône */}
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    } // [MODIFIÉ] Type dynamique
                                                    placeholder="Minimum 6 caractères"
                                                    value={form.password}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "password",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inp("password")}
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword,
                                                        )
                                                    } // [AJOUTÉ] Toggle la visibilité
                                                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center
                            ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                                                    title={
                                                        showPassword
                                                            ? "Masquer le mot de passe"
                                                            : "Afficher le mot de passe"
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <svg // Icône "œil barré"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                            />
                                                        </svg>
                                                    ) : (
                                                        <svg // Icône "œil"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </Field>
                                        <Field
                                            label="Rôle"
                                            required
                                            dark={dark}
                                        >
                                            <select
                                                value={form.role || "user"}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "role",
                                                        e.target.value,
                                                    )
                                                }
                                                className={sel("role")}
                                            >
                                                <option value="user">
                                                    Utilisateur (user)
                                                </option>
                                                <option value="admin">
                                                    Administrateur (admin)
                                                </option>
                                                <option value="medecin">
                                                    Médecin (medecin)
                                                </option>
                                                <option value="rh">
                                                    Ressources Humaines (rh)
                                                </option>
                                            </select>
                                        </Field>
                                    </div>
                                </div>
                            )}

                            {/* Récapitulatif */}
                            <div
                                className={`rounded-xl border overflow-hidden ${dark ? "border-white/8" : "border-slate-200"}`}
                            >
                                <div
                                    className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest ${dark ? "bg-white/5 text-slate-500 border-b border-white/8" : "bg-slate-50 text-slate-400 border-b border-slate-200"}`}
                                >
                                    Récapitulatif
                                </div>
                                <div className="px-4 py-1">
                                    <RecapRow
                                        dark={dark}
                                        label="Nom complet"
                                        value={`${form.nom} ${form.prenoms}`.trim()}
                                    />
                                    <RecapRow
                                        dark={dark}
                                        label="Matricule"
                                        value={form.im}
                                    />
                                    <RecapRow
                                        dark={dark}
                                        label="Date de naissance"
                                        value={form.date_naissance}
                                    />
                                    {form.date_entree_admin && (
                                        <RecapRow
                                            dark={dark}
                                            label="Date d'entrée admin."
                                            value={form.date_entree_admin}
                                        />
                                    )}
                                    <RecapRow
                                        dark={dark}
                                        label="Catégorie / Classe / Échelon"
                                        value={`${form.categorie} / ${form.classe} / ${form.echelon}`}
                                    />
                                    <RecapRow
                                        dark={dark}
                                        label="Statut"
                                        value={form.statut}
                                    />
                                    <RecapRow
                                        dark={dark}
                                        label="Spécialité"
                                        value={form.specialite}
                                    />
                                    <RecapRow
                                        dark={dark}
                                        label="Service"
                                        value={
                                            services.find(
                                                (s) =>
                                                    String(s.id) ===
                                                    String(form.service_id),
                                            )?.libelle
                                        }
                                    />
                                    <RecapRow
                                        dark={dark}
                                        label="Fonction"
                                        value={
                                            fonctions.find(
                                                (f) =>
                                                    String(f.id) ===
                                                    String(form.fonction_id),
                                            )?.libelle
                                        }
                                    />
                                    <RecapRow
                                        dark={dark}
                                        label="Téléphone"
                                        value={form.telephone}
                                    />
                                    <RecapRow
                                        dark={dark}
                                        label="Email"
                                        value={form.email}
                                    />
                                    {/* Tous les diplômes — on boucle sur le tableau diplomes */}
                                    {diplomes.map((d, i) => (
                                        <RecapRow
                                            key={i}
                                            dark={dark}
                                            label={
                                                d.est_principal
                                                    ? "Diplôme principal"
                                                    : `Diplôme ${i + 1}`
                                            }
                                            value={d.libelle}
                                        />
                                    ))}
                                    {/* Compte : on affiche uniquement si créer un compte est coché */}
                                    {creerCompte && (
                                        <RecapRow
                                            dark={dark}
                                            label="Compte HIS"
                                            value={
                                                form.username
                                                    ? `@${form.username}`
                                                    : "Non renseigné"
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Boutons navigation (Annuler / Précédent / Suivant / Enregistrer) ── */}
                    <div
                        className={`flex items-center justify-between gap-3 px-5 lg:px-6 py-4 border-t ${dark ? "border-white/8 bg-white/2" : "border-slate-100 bg-slate-50/50"} rounded-b-2xl`}
                    >
                        {/* Gauche : Annuler + Précédent */}
                        <div className="flex items-center gap-2">
                            {/* Annuler — redirige vers le Répertoire via onAnnuler (Dashboard.jsx) */}
                            <button
                                type="button"
                                onClick={() => {
                                    clearSavedData();
                                    onAnnuler();
                                }}
                                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                                    dark
                                        ? "border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                                        : "border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300"
                                }`}
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Annuler
                            </button>

                            {/* Précédent */}
                            <button
                                type="button"
                                onClick={goPrev}
                                disabled={currentStep === 1}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer${
                                    dark
                                        ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                                        : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
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
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Précédent
                            </button>
                        </div>

                        <span className={`text-xs ${sub}`}>
                            {currentStep} / {STEPS.length}
                        </span>

                        {/* Droite : Suivant ou Enregistrer */}
                        {currentStep < STEPS.length ? (
                            <button
                                type="button"
                                onClick={goNext}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 cursor-pointer"
                            >
                                Suivant
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
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (validateAllAndRedirect())
                                        setConfirmSave(true);
                                }}
                                disabled={submitting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 cursor-pointer"
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
                                            className="w-4 h-4 cursor-pointer"
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
                                        Enregistrer
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Wrapper avec ErrorBoundary pour éviter la page blanche en cas d'erreur
function AddPersonnelWithBoundary(props) {
    return (
        <ErrorBoundary>
            <AddPersonnelInner {...props} />
        </ErrorBoundary>
    );
}

export default AddPersonnelWithBoundary;
