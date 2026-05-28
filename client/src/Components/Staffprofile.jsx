import { useState, useEffect } from "react";
import UpdateModal from "./UpdateModal"; // [NOUVEAU] modal de mise à jour
import "../App.css";

const API_BASE = "http://localhost:3000";

const formatClasse = (classe) => {
    if (!classe) return "";
    const mapping = {
        STAGIAIRE: "Stagiaire",
        "1ERE_CLASSE": "1ère classe",
        "2EME_CLASSE": "2ème classe",
        PRINCIPAL: "Principal",
        EXCEPTIONNEL: "Exceptionnel",
    };
    return mapping[classe] || classe;
};

// [AJOUTÉ] Calcul de l'ancienneté en front-end à partir de la date d'entrée
const getSeniorityLabel = (dateEntreeStr) => {
    if (!dateEntreeStr) return null;
    const [d, m, y] = dateEntreeStr.split("/").map(Number);
    const entryDate = new Date(y, m - 1, d);
    const today = new Date();

    let years = today.getFullYear() - entryDate.getFullYear();
    const monthDiff = today.getMonth() - entryDate.getMonth();
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < entryDate.getDate())
    ) {
        years--;
    }
    if (years <= 0) return "Moins d'un an";
    return `${years} an${years > 1 ? "s" : ""}`;
};

// ── Badge de statut — même logique que PersonnelDirectory.jsx ligne 23
function StatutBadge({ statut = "En activité", dark }) {
    // Normalisation : les valeurs de l'API peuvent varier
    const normalized =
        statut === "En activité"
            ? "Actif"
            : statut === "Actif"
              ? "Actif"
              : statut === "Congé"
                ? "Congé"
                : "Suspendu";

    const styles = {
        Actif: dark
            ? "bg-emerald-400/15 text-emerald-400 border-emerald-500/30 "
            : "bg-emerald-50 text-emerald-700 border-emerald-200",
        Congé: dark
            ? "bg-amber-400/15   text-amber-400   border-amber-500/30"
            : "bg-amber-50   text-amber-700   border-amber-200",
        Suspendu: dark
            ? "bg-slate-400/15   text-slate-400   border-slate-500/30"
            : "bg-slate-100  text-slate-600   border-slate-300",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide flex-shrink-0 whitespace-nowrap ${styles[normalized] || styles["Actif"]}`}
        >
            <span className="w-1.5 translate-y- h-1.5 rounded-full bg-current whitespace-nowrap" />
            {statut}
        </span>
    );
}

// ── Carte d'information générique (label + valeur)
// Utilisée dans les sections Infos Personnelles, Parcours, Affectation
function InfoRow({ label, value, accent = false, dark }) {
    return (
        <div>
            <p
                className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${dark ? "text-slate-500" : "text-slate-400"}`}
            >
                {label}
            </p>
            <p
                className={`text-sm font-medium ${
                    accent
                        ? dark
                            ? "text-blue-400"
                            : "text-blue-600"
                        : dark
                          ? "text-slate-100"
                          : "text-slate-800"
                }`}
            >
                {value || (
                    <span
                        className={
                            dark
                                ? "text-slate-600 italic"
                                : "text-slate-400 italic"
                        }
                    >
                        Non renseigné
                    </span>
                )}
            </p>
        </div>
    );
}

// ── Carte de section (Informations Personnelles / Parcours / Affectation)
function SectionCard({ icon, title, children, dark }) {
    return (
        <div
            className={`rounded-2xl border p-5 space-y-4 ${
                dark
                    ? "bg-white/4 border-white/8"
                    : "bg-white border-slate-200 shadow-sm"
            }`}
        >
            {/* En-tête de section avec icône */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-inherit">
                <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        dark
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-blue-50 text-blue-600"
                    }`}
                >
                    {icon}
                </div>
                <h3
                    className={`text-sm font-bold ${dark ? "text-white" : "text-slate-800"}`}
                >
                    {title}
                </h3>
            </div>
            {children}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════
// Composant principal StaffProfile
// ════════════════════════════════════════════════════════════════════
export default function StaffProfile({ id, dark, onBack, showToast }) {
    // Add showToast prop
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // [AJOUTÉ] Déclencheur de rafraîchissement

    // [NOUVEAU] showUpdateModal : ouvre/ferme le modal de mise à jour
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    // Local toast function if not passed from parent, or use parent's if available
    // For this scenario, it's better to use the one passed from PersonnelDirectory
    // or Dashboard if it's a global toast. Let's assume it's passed.
    const localShowToast =
        showToast ||
        ((msg, type) => {
            console.log(`Toast: ${type} - ${msg}`);
            // Fallback for development or if showToast is not passed
            // In a real app, you'd integrate a proper toast library here.
            alert(msg);
        });

    // [AJOUTÉ] showArchiveModal : ouvre la modale de confirmation "Fin de service"
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    // [AJOUTÉ] archiving : true pendant l'appel PATCH /:id/archiver
    const [archiving, setArchiving] = useState(false);
    // [AJOUTÉ] archiveError : message d'erreur si l'archivage échoue
    const [archiveError, setArchiveError] = useState(null);

    // [AJOUTÉ] handleArchiver : appelle PATCH /staff/:id/archiver
    // En cas de succès → ferme le modal + retourne au répertoire (onBack)
    const handleArchiver = async () => {
        setArchiving(true);
        setArchiveError(null);
        try {
            const res = await fetch(`${API_BASE}/staff/${id}/archiver`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.message || `Erreur ${res.status}`);
            }
            // Succès : on referme le modal et on retourne au répertoire
            setShowArchiveModal(false);
            onBack();
        } catch (err) {
            setArchiveError(err.message);
        } finally {
            setArchiving(false);
        }
    };

    // ── Lecture du token JWT depuis localStorage (voir App.jsx ligne 28)
    const token = localStorage.getItem("token");

    // ── useEffect : appel API au montage du composant
    // [id] = dépendance → si id change, on refetch automatiquement
    // (cas où on navigue d'un profil à un autre sans démonter le composant)
    useEffect(() => {
        if (!id) return; // sécurité : ne pas appeler si pas d'id

        setLoading(true);
        setError(null);
        setImgError(false);

        // GET /staff/profile/:id  (voir staffRoutes.js)
        // On utilise l'id (clé primaire BDD) — PAS le matricule
        fetch(`${API_BASE}/staff/profile/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Erreur ${res.status}`);
                return res.json();
            })
            .then((json) => {
                // L'API retourne { message, data: { nom, prenoms, matricule, diplomes: [...], ... } }

                // diplomes est un tableau d'objets : { id, libelle, etablissement, annee_obtention, est_principal }
                // est_principal = true  → diplôme principal
                // est_principal = false → diplômes secondaires
                setProfile(json.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id, refreshTrigger]); // [MODIFIÉ] refreshTrigger ajouté aux dépendances

    // ── Tokens thème
    const bg = dark ? "bg-[#0a0f1e]" : "bg-slate-50";
    const cardBig = dark
        ? "bg-[#0d1526] border-white/8"
        : "bg-white border-slate-200 shadow-sm";
    const txtTitle = dark ? "text-white" : "text-slate-800";
    const txtSub = dark ? "text-slate-400" : "text-slate-500";
    const breadcr = dark ? "text-slate-500" : "text-slate-400";
    const breadAct = dark ? "text-blue-400" : "text-blue-600";

    // ── URL de la photo de profil
    //
    // L'API retourne : photo_profil = "/uploads/default-avatar.png"
    // Le serveur expose le dossier uploads via express.static (voir server.js)
    //
    // Construction :    API_BASE              +  profile.photo_profil
    //              "http://localhost:3000"  +  "/uploads/default-avatar.png"
    //           →  "http://localhost:3000/uploads/default-avatar.png"  ✅
    const photoUrl = profile?.photo_profil
        ? `${API_BASE}${profile.photo_profil}`
        : null;

    return (
        <div className={`flex-1 overflow-auto ${bg}`}>
            {/* [NOUVEAU] Modal de mise à jour — monté par-dessus le profil
          onSaved : après sauvegarde → ferme le modal ET recharge le profil
          On recharge en remettant loading=true ce qui déclenche le useEffect */}
            {showUpdateModal && (
                <UpdateModal
                    id={id}
                    dark={dark}
                    onClose={() => setShowUpdateModal(false)}
                    onSaved={(success, message) => {
                        setShowUpdateModal(false);
                        if (success) {
                            localShowToast(
                                message || "Profil mis à jour avec succès !",
                            );
                            setRefreshTrigger((prev) => prev + 1); // [MODIFIÉ] Déclenche le rechargement réel
                        } else {
                            localShowToast(
                                message ||
                                    "Erreur lors de la mise à jour du profil.",
                                "error",
                            );
                            setLoading(true); // Re-fetch to revert to actual state if optimistic update failed
                            setError(null);
                        }
                    }}
                    // No need to pass showToast to UpdateModal itself, as onSaved handles the toast via parent.
                    // showToast={localShowToast} // Removed as per final decision
                />
            )}

            {/* [AJOUTÉ] Modale de confirmation "Fin de service"
                Appelle PATCH /staff/:id/archiver au clic sur "Confirmer"
                Se ferme automatiquement et retourne au répertoire si succès */}
            {showArchiveModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{
                        background: "rgba(5,10,25,0.65)",
                        backdropFilter: "blur(8px)",
                    }}
                    onClick={() => !archiving && setShowArchiveModal(false)}
                >
                    <div
                        className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden
                            ${dark ? "bg-[#0c1424] border border-white/8" : "bg-white border border-slate-200"}`}
                        style={{
                            animation:
                                "modalIn .2s cubic-bezier(.34,1.56,.64,1)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Barre rouge en haut */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-rose-500 to-rose-600" />

                        <div className="px-6 py-6 space-y-4">
                            {/* Icône avertissement */}
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto
                                ${dark ? "bg-rose-500/15" : "bg-rose-50"}`}
                            >
                                <svg
                                    className="w-6 h-6 text-rose-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    />
                                </svg>
                            </div>

                            {/* Texte */}
                            <div className="text-center space-y-1.5">
                                <h3
                                    className={`text-[15px] font-bold ${dark ? "text-white" : "text-slate-800"}`}
                                >
                                    Confirmer la fin de service
                                </h3>
                                <p
                                    className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}
                                >
                                    Vous êtes sur le point d'archiver{" "}
                                    <strong
                                        className={
                                            dark
                                                ? "text-slate-200"
                                                : "text-slate-700"
                                        }
                                    >
                                        {profile?.nom} {profile?.prenoms}
                                    </strong>
                                    . Cette action marquera le personnel comme
                                    sorti du service.
                                </p>
                            </div>

                            {/* Erreur API */}
                            {archiveError && (
                                <div
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium
                                    ${
                                        dark
                                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                            : "bg-rose-50 border-rose-200 text-rose-700"
                                    }`}
                                >
                                    <svg
                                        className="w-3.5 h-3.5 shrink-0"
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
                                    {archiveError}
                                </div>
                            )}

                            {/* Boutons */}
                            <div className="flex gap-2 pt-1">
                                {/* Annuler */}
                                <button
                                    onClick={() => setShowArchiveModal(false)}
                                    disabled={archiving}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer
                                        disabled:opacity-40 disabled:cursor-not-allowed
                                        ${
                                            dark
                                                ? "border-white/10 text-slate-300 hover:bg-white/6"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    Annuler
                                </button>
                                {/* Confirmer → appelle handleArchiver */}
                                <button
                                    onClick={handleArchiver}
                                    disabled={archiving}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                                        bg-rose-600 hover:bg-rose-500 border border-rose-600
                                        transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
                                        flex items-center justify-center gap-2"
                                >
                                    {archiving ? (
                                        <>
                                            <svg
                                                className="w-4 h-4 animate-spin"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v8z"
                                                />
                                            </svg>
                                            Archivage…
                                        </>
                                    ) : (
                                        "Confirmer"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes modalIn {
                            from { opacity:0; transform:scale(.93) translateY(12px); }
                            to   { opacity:1; transform:scale(1)   translateY(0);    }
                        }
                    `}</style>
                </div>
            )}

            <div className="max-w-5xl mx-auto p-4 lg:p-6">
                {/* ── Fil d'Ariane + bouton retour ── */}
                <div className="flex items-center gap-2 mb-5 text-sm">
                    <button
                        onClick={onBack} // onBack = setSelectedId(null) dans PersonnelDirectory
                        className={`flex items-center gap-1.5 transition-colors hover:-translate-x-0.5 cursor-pointer ${
                            dark
                                ? "text-slate-400 hover:text-white"
                                : "text-slate-500 hover:text-slate-800"
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
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={onBack}
                        className={`transition-colors cursor-pointer ${breadcr} hover:${dark ? "text-slate-300" : "text-slate-700"}`}
                    >
                        Répertoire du Personnel
                    </button>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-3 h-3 ${breadcr}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                    <span className={breadAct}>Profil Membre</span>
                </div>

                {/* ── En-tête de page avec boutons d'action ── */}
                <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
                    <h1 className={`text-2xl font-bold ${txtTitle}`}>
                        Détails du Personnel
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Masquer les boutons si le personnel est archivé.
                            On normalise en minuscules pour couvrir toutes les variantes
                            retournées par l'API : "Sorti", "Sortie", "SORTIE", "sorti", "Archivé"... */}
                        {profile &&
                        ["sorti", "sortie", "archivé", "archive"].includes(
                            profile.statut?.toLowerCase(),
                        ) ? (
                            <span
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold
                                ${
                                    dark
                                        ? "bg-slate-500/10 border-slate-500/20 text-slate-400"
                                        : "bg-slate-50 border-slate-200 text-slate-500"
                                }`}
                            >
                                <svg
                                    className="w-4 h-4 text-rose-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                    />
                                </svg>
                                Personnel archivé
                            </span>
                        ) : (
                            <>
                                {/* Bouton "Mettre à jour" — visible uniquement si non archivé */}
                                <button
                                    onClick={() => setShowUpdateModal(true)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20 cursor-pointer"
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
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    Mettre à jour
                                </button>
                                {/* Bouton "Fin de service" — visible uniquement si non archivé */}
                                <button
                                    onClick={() => {
                                        setArchiveError(null);
                                        setShowArchiveModal(true);
                                    }}
                                    className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all hover:-translate-y-0.5 cursor-pointer ${
                                        dark
                                            ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                                            : "border-rose-200 text-rose-600 hover:bg-rose-50"
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4 cursor-pointer"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                        />
                                    </svg>
                                    Fin de service
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ── État : chargement ── */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* ── État : erreur ── */}
                {!loading && error && (
                    <div
                        className={`rounded-2xl border p-6 flex items-center gap-3 text-sm ${
                            dark
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                : "bg-rose-50 border-rose-200 text-rose-600"
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 shrink-0"
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
                        <div>
                            <p className="font-semibold">
                                Impossible de charger le profil
                            </p>
                            <p className="text-xs mt-0.5 opacity-75">{error}</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="ml-auto underline text-xs cursor-pointer"
                        >
                            Réessayer
                        </button>
                    </div>
                )}

                {/* ── Contenu principal (affiché quand profile est chargé) ── */}
                {!loading && !error && profile && (
                    <div className="space-y-4">
                        {/* ── CARTE PRINCIPALE : Photo + Nom + Stats rapides ── */}
                        <div className={`rounded-2xl border p-6 ${cardBig}`}>
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                {/* Photo de profil */}
                                <div className="relative shrink-0">
                                    {/* Affiche l'image si elle charge, sinon les initiales */}
                                    {photoUrl && !imgError ? (
                                        <img
                                            src={photoUrl}
                                            alt={`${profile.nom} ${profile.prenoms}`}
                                            onError={() => setImgError(true)} // si l'image 404 → bascule sur initiales
                                            className="w-28 h-28 rounded-2xl object-cover border-2 border-white/10"
                                        />
                                    ) : (
                                        // Fallback : avatar initiales coloré
                                        <div className="w-28 h-28 rounded-2xl bg-linear-to-br from-blue-400 to-blue-700 flex items-center justify-center text-3xl font-bold text-white">
                                            {(profile.nom?.[0] || "") +
                                                (profile.prenoms?.[0] || "")}
                                        </div>
                                    )}
                                    {/* Badge statut superposé sur la photo */}
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                        <StatutBadge
                                            statut={profile.statut}
                                            dark={dark}
                                        />
                                    </div>
                                </div>

                                {/* Nom + titre + stats */}
                                <div className="flex-1 pt-1">
                                    <h2
                                        className={`text-2xl font-bold tracking-tight ${txtTitle}`}
                                    >
                                        {profile.nom} {profile.prenoms}
                                    </h2>
                                    <p
                                        className={`text-sm mt-1 flex items-center gap-1.5 ${txtSub}`}
                                    >
                                        {/* Icône dossier médical */}
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
                                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        {profile.specialite ||
                                            profile.service || // Fonction/Titre du poste
                                            profile.departement || // Département
                                            "Professionnel de santé"}
                                    </p>

                                    {/* 4 stats rapides : Matricule / Poste / Ancienneté / Département */}
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <p
                                                className={`text-[10px] font-bold uppercase tracking-widest ${txtSub}`}
                                            >
                                                Immatricule
                                            </p>
                                            <p
                                                className={`text-sm font-bold font-mono mt-0.5 ${txtTitle}`}
                                            >
                                                {profile.matricule
                                                    ? `IMM-${profile.matricule}`
                                                    : "—"}
                                            </p>
                                        </div>

                                        <div>
                                            <p
                                                className={`text-[10px] font-bold uppercase tracking-widest ${txtSub}`}
                                            >
                                                Fonction
                                            </p>
                                            <p
                                                className={`text-sm font-semibold mt-0.5 ${dark ? "text-blue-400" : "text-blue-600"}`}
                                            >
                                                {profile.service || "—"}
                                            </p>
                                        </div>

                                        <div>
                                            <p
                                                className={`text-[10px] font-bold uppercase tracking-widest ${txtSub}`}
                                            >
                                                Ancienneté
                                            </p>
                                            <p
                                                className={`text-sm font-semibold mt-0.5 ${txtTitle}`}
                                            >
                                                {profile.date_entree_admin
                                                    ? `${getSeniorityLabel(profile.date_entree_admin)} de service`
                                                    : "—"}
                                            </p>
                                        </div>

                                        <div>
                                            <p
                                                className={`text-[10px] font-bold uppercase tracking-widest ${txtSub}`}
                                            >
                                                Département
                                            </p>
                                            <p
                                                className={`text-sm font-semibold mt-0.5 ${txtTitle}`}
                                            >
                                                {profile.departement || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── 3 CARTES DE DÉTAIL : Infos perso / Parcours / Affectation ── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Carte 1 : Informations Personnelles */}
                            <SectionCard
                                dark={dark}
                                title="Informations Personnelles"
                                icon={
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
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                }
                            >
                                <InfoRow
                                    dark={dark}
                                    label="Date de naissance"
                                    value={
                                        profile.date_naissance
                                            ? `${profile.date_naissance}${profile.age ? ` (${profile.age} ans)` : ""}`
                                            : null
                                    }
                                />
                                <InfoRow
                                    dark={dark}
                                    label="Téléphone"
                                    value={profile.telephone}
                                />
                                <InfoRow
                                    dark={dark}
                                    label="Email"
                                    value={profile.email}
                                    accent
                                />
                            </SectionCard>

                            {/* Carte 2 : Parcours
                  diplomes = tableau retourné par l'API (voir JSON ci-dessus)
                  diplomesPrincipal = objet avec est_principal = true
                  diplomesSecondaires = tableau des autres diplômes */}
                            <SectionCard
                                dark={dark}
                                title="Parcours"
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                                        />
                                    </svg>
                                }
                            >
                                {/* Diplôme principal : est_principal = true dans le tableau diplomes */}
                                <InfoRow
                                    dark={dark}
                                    label="Diplôme principal"
                                    value={
                                        profile.diplomes?.find(
                                            (d) => d.est_principal,
                                        )?.libelle
                                    }
                                />
                                <InfoRow
                                    dark={dark}
                                    label="Spécialisation"
                                    value={profile.specialite}
                                />
                                <InfoRow
                                    dark={dark}
                                    label="Date d'entrée"
                                    value={profile.date_entree_admin || null}
                                />
                                <InfoRow
                                    dark={dark}
                                    label="Accès SIH"
                                    value={profile.a_acces_sih ? "Oui" : "Non"}
                                />

                                {/* Diplômes secondaires : est_principal = false — on boucle avec .map() */}
                                {profile.diplomes
                                    ?.filter((d) => !d.est_principal)
                                    .map((d) => (
                                        <InfoRow
                                            key={d.id} // clé unique = id du diplôme (obligatoire dans .map)
                                            dark={dark}
                                            label="Autre diplôme"
                                            value={d.libelle}
                                        />
                                    ))}
                            </SectionCard>

                            {/* Carte 3 : Affectation */}
                            <SectionCard
                                dark={dark}
                                title="Affectation"
                                icon={
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
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                }
                            >
                                <InfoRow
                                    dark={dark}
                                    label="Service"
                                    value={profile.service}
                                />
                                <InfoRow
                                    dark={dark}
                                    label="Département"
                                    value={profile.departement}
                                />
                                {/* [MODIFIÉ] categorie, echelon, classe viennent maintenant
                                    de l'objet grade_actuel retourné par l'API
                                    Avant : profile.categorie / profile.echelon / profile.classe
                                    Après : profile.grade_actuel?.categorie / .echelon / .classe */}
                                <InfoRow
                                    dark={dark}
                                    label="Catégorie"
                                    value={profile.grade_actuel?.categorie}
                                />
                                <InfoRow
                                    dark={dark}
                                    label="Classe"
                                    value={formatClasse(
                                        profile.grade_actuel?.classe,
                                    )}
                                />

                                <InfoRow
                                    dark={dark}
                                    label="Échelon"
                                    value={
                                        profile.grade_actuel?.echelon != null
                                            ? String(
                                                  profile.grade_actuel.echelon,
                                              )
                                            : null
                                    }
                                />
                                {/* [AJOUTÉ] Indice — nouveau champ de grade_actuel */}
                                {profile.grade_actuel?.indice != null && (
                                    <InfoRow
                                        dark={dark}
                                        label="Indice"
                                        value={String(
                                            profile.grade_actuel.indice,
                                        )}
                                    />
                                )}
                                {profile.grade_actuel?.date_effet && (
                                    <InfoRow
                                        dark={dark}
                                        label="Date d'effet"
                                        value={profile.grade_actuel.date_effet}
                                    />
                                )}
                                {profile.grade_actuel
                                    ?.date_prochain_avancement && (
                                    <InfoRow
                                        dark={dark}
                                        label="Prochain avancement"
                                        value={
                                            profile.grade_actuel
                                                .date_prochain_avancement
                                        }
                                    />
                                )}
                            </SectionCard>
                        </div>

                        {/* ── SECTION LOGS D'AUDIT (fusion audit_logs + avancements) ── */}
                        {profile.audit_logs &&
                            profile.audit_logs.length > 0 && (
                                <div
                                    className={`rounded-2xl border overflow-hidden ${
                                        dark
                                            ? "bg-white/4 border-white/8"
                                            : "bg-white border-slate-200 shadow-sm"
                                    }`}
                                >
                                    {/* En-tête */}
                                    <div
                                        className={`flex items-center gap-2.5 px-5 py-4 border-b ${
                                            dark
                                                ? "border-white/8"
                                                : "border-slate-100"
                                        }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                dark
                                                    ? "bg-violet-500/15 text-violet-400"
                                                    : "bg-violet-50 text-violet-600"
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
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3
                                                className={`text-sm font-bold ${dark ? "text-white" : "text-slate-800"}`}
                                            >
                                                Historique & Activité
                                            </h3>
                                            <p
                                                className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}
                                            >
                                                {profile.audit_logs.length}{" "}
                                                entrée(s)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="px-5 py-4 space-y-3">
                                        {profile.audit_logs.map((log, i) => {
                                            // Couleurs par type d'action
                                            const actionColors = {
                                                AJOUT_PERSONNEL: {
                                                    dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
                                                    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                },
                                                AVANCEMENT_ECHELON: {
                                                    dark: "bg-blue-500/15 text-blue-400 border-blue-500/25",
                                                    light: "bg-blue-50 text-blue-700 border-blue-200",
                                                },
                                                PROMOTION_CLASSE: {
                                                    dark: "bg-violet-500/15 text-violet-400 border-violet-500/25",
                                                    light: "bg-violet-50 text-violet-700 border-violet-200",
                                                },
                                                ARCHIVAGE_PERSONNEL: {
                                                    dark: "bg-rose-500/15 text-rose-400 border-rose-500/25",
                                                    light: "bg-rose-50 text-rose-700 border-rose-200",
                                                },
                                                MODIFICATION_PERSONNEL: {
                                                    dark: "bg-amber-500/15 text-amber-400 border-amber-500/25",
                                                    light: "bg-amber-50 text-amber-700 border-amber-200",
                                                },
                                                RESET_MDP: {
                                                    dark: "bg-orange-500/15 text-orange-400 border-orange-500/25",
                                                    light: "bg-orange-50 text-orange-700 border-orange-200",
                                                },
                                                ACTIVATION: {
                                                    dark: "bg-lime-500/15 text-lime-400 border-lime-500/25",
                                                    light: "bg-lime-50 text-lime-700 border-lime-200",
                                                },
                                                DESACTIVATION: {
                                                    dark: "bg-slate-500/15 text-slate-400 border-slate-500/25",
                                                    light: "bg-slate-100 text-slate-600 border-slate-300",
                                                },
                                            };
                                            const colors = actionColors[
                                                log.action
                                            ] || {
                                                dark: "bg-slate-500/15 text-slate-400 border-slate-500/25",
                                                light: "bg-slate-100 text-slate-600 border-slate-300",
                                            };
                                            const colorCls = dark
                                                ? colors.dark
                                                : colors.light;

                                            // Libellé lisible
                                            const actionLabels = {
                                                AJOUT_PERSONNEL: "Ajout",
                                                AVANCEMENT_ECHELON:
                                                    "Avancement",
                                                PROMOTION_CLASSE: "Promotion",
                                                ARCHIVAGE_PERSONNEL:
                                                    "Archivage",
                                                MODIFICATION_PERSONNEL:
                                                    "Modification",
                                                RESET_MDP:
                                                    "Réinitialisation mot de passe",
                                                ACTIVATION: "Activation Compte",
                                                DESACTIVATION:
                                                    "Désactivation Compte",
                                            };
                                            const label =
                                                actionLabels[log.action] ||
                                                log.action;

                                            const isGradeEvent =
                                                log.action ===
                                                    "AVANCEMENT_ECHELON" ||
                                                log.action ===
                                                    "PROMOTION_CLASSE";

                                            // On améliore le rendu du grade pour les promotions et avancements
                                            let contentUI = null;

                                            if (
                                                isGradeEvent &&
                                                log.details?.nouveau_grade
                                            ) {
                                                // On décompose la chaîne "Cat. X - Cl. Y - Ech. Z" reçue du serveur
                                                const parts =
                                                    log.details.nouveau_grade.split(
                                                        " - ",
                                                    );
                                                const cat =
                                                    parts[0]?.replace(
                                                        "Cat. ",
                                                        "",
                                                    ) || "—";
                                                const cl =
                                                    parts[1]?.replace(
                                                        "Cl. ",
                                                        "",
                                                    ) || "—";
                                                const ech =
                                                    parts[2]?.replace(
                                                        "Ech. ",
                                                        "",
                                                    ) || "—";

                                                contentUI = (
                                                    <div className="mt-2 space-y-2">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span
                                                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${dark ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700"}`}
                                                            >
                                                                Cat. {cat}
                                                            </span>
                                                            <span
                                                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${dark ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : "bg-violet-50 border-violet-200 text-violet-700"}`}
                                                            >
                                                                {formatClasse(
                                                                    cl,
                                                                )}
                                                            </span>
                                                            <span
                                                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${dark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
                                                            >
                                                                Échelon {ech}
                                                            </span>
                                                        </div>
                                                        {log.details
                                                            ?.arrete && (
                                                            <p
                                                                className={`text-[10px] font-medium flex items-center gap-1 ${dark ? "text-slate-500" : "text-slate-400"}`}
                                                            >
                                                                <svg
                                                                    className="w-3 h-3"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                    />
                                                                </svg>
                                                                Arrêté :{" "}
                                                                {
                                                                    log.details
                                                                        .arrete
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            } else {
                                                const description =
                                                    log.details?.description ||
                                                    log.details
                                                        ?.ancienne_classe ||
                                                    "";
                                                contentUI = description && (
                                                    <p
                                                        className={`text-xs mt-1.5 leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}
                                                    >
                                                        {description}
                                                    </p>
                                                );
                                            }

                                            // Date formatée
                                            const dateStr = log.created_at
                                                ? new Date(
                                                      log.created_at,
                                                  ).toLocaleDateString(
                                                      "fr-FR",
                                                      {
                                                          day: "2-digit",
                                                          month: "short",
                                                          year: "numeric",
                                                      },
                                                  )
                                                : "";

                                            return (
                                                <div
                                                    key={i}
                                                    className={`relative pl-4 border-l-2 ${
                                                        i === 0
                                                            ? dark
                                                                ? "border-violet-500"
                                                                : "border-violet-400"
                                                            : dark
                                                              ? "border-white/10"
                                                              : "border-slate-200"
                                                    }`}
                                                >
                                                    {/* Pastille de la timeline */}
                                                    <div
                                                        className={`absolute -left-1.5 top-2 w-2.5 h-2.5 rounded-full ${
                                                            i === 0
                                                                ? dark
                                                                    ? "bg-violet-500"
                                                                    : "bg-violet-400"
                                                                : dark
                                                                  ? "bg-white/20"
                                                                  : "bg-slate-300"
                                                        }`}
                                                    />

                                                    <div
                                                        className={`p-3 rounded-xl border transition-all ${
                                                            dark
                                                                ? "bg-white/3 border-white/6 hover:bg-white/5"
                                                                : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${colorCls}`}
                                                            >
                                                                {label}
                                                            </span>
                                                            {dateStr && (
                                                                <span
                                                                    className={`text-[10px] shrink-0 ${dark ? "text-slate-600" : "text-slate-400"}`}
                                                                >
                                                                    {dateStr}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {contentUI}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {/* ── Note de bas de page (documents RH) ── */}
                        <div
                            className={`rounded-2xl border p-4 text-center text-sm italic ${
                                dark
                                    ? "bg-white/3 border-white/5 text-slate-500"
                                    : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}
                        >
                            Informations administratives complémentaires et
                            documents contractuels disponibles via le portail RH
                            sécurisé.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
