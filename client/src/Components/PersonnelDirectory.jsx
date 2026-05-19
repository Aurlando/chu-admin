import { useState, useEffect, useCallback, useRef } from "react";
import StaffProfile from "./StaffProfile";
import UpdateModal from "./UpdateModal"; // [NOUVEAU] modal de mise à jour
import "../App.css";

const API_BASE = "http://localhost:3000";
const LIMIT = 10;

// ── Couleurs d'avatar tournantes (index de la ligne % 6)
const AVATAR_COLORS = [
    "from-blue-400 to-blue-600",
    "from-violet-400 to-violet-600",
    "from-emerald-400 to-emerald-600",
    "from-rose-400 to-rose-600",
    "from-amber-400 to-amber-600",
    "from-cyan-400 to-cyan-600",
];

// Génère les initiales : "RAKOTO" + "Jean" → "RJ"
function getInitiales(nom = "", prenoms = "") {
    return ((nom.trim()[0] || "") + (prenoms.trim()[0] || "")).toUpperCase();
}

// ── Badge statut coloré
function StatutBadge({ statut = "Actif", dark }) {
    const map = {
        Actif: dark
            ? "bg-emerald-400/10 text-emerald-400 border-emerald-500/20"
            : "bg-emerald-50 text-emerald-600 border-emerald-200",
        "En activité": dark
            ? "bg-emerald-400/10 text-emerald-400 border-emerald-500/20"
            : "bg-emerald-50 text-emerald-600 border-emerald-200",
        Congé: dark
            ? "bg-amber-400/10   text-amber-400   border-amber-500/20"
            : "bg-amber-50   text-amber-600   border-amber-200",
        Suspendu: dark
            ? "bg-slate-400/10   text-slate-400   border-slate-500/20"
            : "bg-slate-100  text-slate-500   border-slate-300",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${map[statut] || map["Actif"]}`}
        >
            {statut}
        </span>
    );
}

function EyeIcon() {
    return (
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
        </svg>
    );
}
function EditIcon() {
    return (
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
        </svg>
    );
}

// ════════════════════════════════════════════════════════════════════
// Composant principal
// ════════════════════════════════════════════════════════════════════
export default function PersonnelDirectory({ dark, onNavigate }) {
    // selectedId : null = liste, valeur = vue profil détail
    const [selectedId, setSelectedId] = useState(null);
    const [selectedIdUpdate, setSelectedIdUpdate] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // Pour forcer le rafraîchissement de la liste

    // [AJOUTÉ] Logique de notification (Toast) manquante
    const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
    const toastTimer = useRef(null);

    const showToast = (msg, type = "success") => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ show: true, msg, type });
        toastTimer.current = setTimeout(() => 
            setToast(prev => ({ ...prev, show: false })), 
            2000
        );
    };

    // Vue profil — remplace toute la page
    if (selectedId !== null) {
        return (
            <StaffProfile
                id={selectedId}
                dark={dark}
                onBack={() => setSelectedId(null)}
                showToast={showToast} // Pass showToast to StaffProfile
            />
        );
    }

    // Vue liste — avec le modal superposé si selectedIdUpdate != null
    return (
        <>
            {selectedIdUpdate !== null && (
                <UpdateModal
                    id={selectedIdUpdate}
                    dark={dark}
                    onClose={() => setSelectedIdUpdate(null)}
                    onSaved={(success, message) => {
                        setSelectedIdUpdate(null);
                        if (success) {
                            showToast(message || "Mise à jour réussie");
                            setRefreshKey(prev => prev + 1); // Rafraîchit la liste
                        } else {
                            showToast(message, "error");
                        }
                    }}
                />
            )}
            <PersonnelList
                key={refreshKey}
                dark={dark}
                onSelectId={setSelectedId}
                onSelectIdUpdate={setSelectedIdUpdate}
                onNavigate={onNavigate}
            />

            {/* Composant Toast */}
            <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium transition-all duration-300
                ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}
                ${dark ? "bg-[#0d1526] border border-white/10 text-slate-200" : "bg-slate-800 text-white"}`}>
                <div className={toast.type === "success" ? "text-emerald-400" : "text-rose-400"}>
                    {toast.type === "success" ? "✓" : "✕"}
                </div>
                {toast.msg}
            </div>
        </>
    );
}

function PersonnelList({ dark, onSelectId, onSelectIdUpdate, onNavigate }) {
    // ── États des données
    const [personnel, setPersonnel] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: LIMIT,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── États des filtres
    const [search, setSearch] = useState("");
    const [filterDept, setFilterDept] = useState("");
    const [filterFonc, setFilterFonc] = useState("");
    const [page, setPage] = useState(1);

    // ── Données des dropdowns
    const [departments, setDepartments] = useState([]);
    const [fonctions, setFonctions] = useState([]);

    const token = localStorage.getItem("token"); // voir App.jsx ligne 28

    // ── fetchPersonnel : useCallback pour éviter la boucle infinie dans useEffect
    // Se recréé uniquement quand search/filterDept/filterFonc/page changent
    const fetchPersonnel = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                ...(search && { search }),
                ...(filterDept && { department: filterDept }),
                ...(filterFonc && { fonction: filterFonc }),
                page,
                limit: LIMIT,
            });

            const res = await fetch(`${API_BASE}/staff/show-all?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            const json = await res.json();
            setPersonnel(json.data);
            setPagination(json.pagination);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, filterDept, filterFonc, page, token]);

    // ── Se déclenche à chaque fois que fetchPersonnel est recréée (= filtre change)
    useEffect(() => {
        fetchPersonnel();
    }, [fetchPersonnel]);

    // ── Chargement unique des listes de dropdowns au montage
    useEffect(() => {
        fetch(`${API_BASE}/staff/departments`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((j) => setDepartments(j.data || []))
            .catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetch(`${API_BASE}/staff/fonctions`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((j) => setFonctions(j.data || []))
            .catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Helpers filtres : reset page à 1 à chaque changement de filtre
    const handleSearch = (v) => {
        setSearch(v);
        setPage(1);
    };
    const handleFilterDept = (v) => {
        setFilterDept(v);
        setPage(1);
    };
    const handleFilterFonc = (v) => {
        setFilterFonc(v);
        setPage(1);
    };
    const hasActiveFilter = search || filterDept || filterFonc;
    const resetFiltres = () => {
        setSearch("");
        setFilterDept("");
        setFilterFonc("");
        setPage(1);
    };

    // ── Tokens thème
    const T = {
        title: dark ? "text-white" : "text-slate-800",
        sub: dark ? "text-slate-400" : "text-slate-500",
        card: dark
            ? "bg-[#0d1526] border-white/8"
            : "bg-white border-slate-200 shadow-sm",
        input: dark
            ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50"
            : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400",
        select: dark
            ? "bg-white/5 border-white/10 text-slate-300 focus:border-blue-500/50 [&_option]:text-black [&_option]:bg-white"
            : "bg-white border-slate-200 text-slate-700 focus:border-blue-400",
        thHead: dark
            ? "text-slate-500 border-white/8 bg-white/3"
            : "text-slate-400 border-slate-200 bg-slate-50",
        trHover: dark
            ? "hover:bg-white/3 border-white/5 "
            : "hover:bg-slate-50/80 border-slate-100",
        tdText: dark ? "text-slate-200 " : "text-slate-700",
        tdSub: dark ? "text-slate-500" : "text-slate-400",
        pagBtn: dark
            ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
        pagBtnAct: "bg-blue-600 border-blue-600 text-white",
        iconColor: dark ? "text-slate-500" : "text-slate-400",
        // [MODIFIÉ] Bouton "Voir" — maintenant avec onClick fonctionnel
        actionView: dark
            ? "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 transition-all"
            : "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all",
        actionEdit: dark
            ? "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
            : "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all",
    };

    // ── Génère les numéros de pages à afficher (avec ellipsis)
    const buildPageNumbers = () => {
        const total = pagination.totalPages;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages = [1];
        if (page > 3) pages.push("...");
        for (
            let i = Math.max(2, page - 1);
            i <= Math.min(total - 1, page + 1);
            i++
        )
            pages.push(i);
        if (page < total - 2) pages.push("...");
        pages.push(total);
        return pages;
    };

    return (
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {/* ── En-tête ── */}
            <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
                <div>
                    <h1 className={`text-2xl lg:text-3xl font-bold ${T.title}`}>
                        Répertoire du Personnel
                    </h1>
                    <p className={`text-sm mt-1 ${T.sub}`}>
                        Gérez et consultez le personnel du CHU Anosiala.
                        {pagination.total > 0 && (
                            <span className="ml-2 font-medium">
                                {pagination.total} membres
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => onNavigate?.("Ajouter un personnel")}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 shrink-0 cursor-pointer
          "
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
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                    </svg>
                    Ajouter un personnel
                </button>
            </div>

            {/* ── Zone de filtres ── */}
            <div className={`rounded-2xl border p-4 mb-5 ${T.card}`}>
                <div className="flex flex-nowrap gap-3 items-center">
                    {/* Barre de recherche → ?search= → cherche nom, prenoms, matricule */}
                    <div className="relative flex-1 min-w-37.5">
                        <svg
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${T.iconColor}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className={`w-full pl-8 pr-8 py-2 text-sm rounded-xl border outline-none transition-all ${T.input}`}
                        />
                        {search && (
                            <button
                                onClick={() => handleSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Effacer la recherche"
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Dropdown Département → ?department= */}
                    <div className="relative shrink-0">
                        <select
                            value={filterDept}
                            onChange={(e) => handleFilterDept(e.target.value)}
                            className={`text-sm pl-3 pr-7 py-2 rounded-xl border outline-none cursor-pointer transition-all ${T.select}`}
                        >
                            <option value="">Département</option>
                            {departments.map((d) => {
                                const id = typeof d === "string" ? d : d.id;
                                const label = typeof d === "string" ? d : d.libelle;
                                return (
                                    <option key={id} value={label}>{label}</option>
                                );
                            })}
                        </select>
                        {filterDept && (
                            <button
                                onClick={() => handleFilterDept("")}
                                    type="button"
                                className="absolute right-7 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Dropdown Service (= m.fonction dans la BDD) → ?fonction= */}
                    <div className="relative shrink-0">
                        <select
                            value={filterFonc}
                            onChange={(e) => handleFilterFonc(e.target.value)}
                            className={`text-sm pl-3 pr-7 py-2 rounded-xl border outline-none cursor-pointer transition-all ${T.select}`}
                        >
                            <option value="">Service</option>
                            {fonctions.map((f) => {
                                const id = typeof f === "string" ? f : f.id;
                                const label = typeof f === "string" ? f : f.libelle;
                                return (
                                    <option key={id} value={label}>{label}</option>
                                );
                            })}
                        </select>
                        {filterFonc && (
                            <button
                                onClick={() => handleFilterFonc("")}
                                    type="button"
                                className="absolute right-7 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Bouton reset filtres — visible uniquement si un filtre est actif */}
                    {hasActiveFilter && (
                        <button
                            onClick={resetFiltres}
                            className={`flex items-center gap-1.5 text-xs px-2 py-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                                dark
                                    ? "text-slate-400 hover:text-white border-white/10 hover:border-white/20"
                                    : "text-slate-500 hover:text-slate-800 border-slate-200 hover:border-slate-300"
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
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* ── Spinner ── */}
            {loading && (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* ── Erreur ── */}
            {!loading && error && (
                <div
                    className={`rounded-2xl border p-5 flex items-center gap-3 text-sm ${
                        dark
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            : "bg-rose-50 border-rose-200 text-rose-600"
                    }`}
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
                    Impossible de charger le personnel : {error}
                    <button
                        onClick={fetchPersonnel}
                        className="ml-auto underline text-xs cursor-pointer"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {/* ── Tableau ── */}
            {!loading && !error && (
                <div className={`rounded-2xl border overflow-hidden ${T.card}`}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr
                                className={`border-b text-left text-[11px] font-bold uppercase tracking-wider ${T.thHead}`}
                            >
                                <th className="px-5 py-3.5">Nom</th>
                                <th className="px-5 py-3.5">Imatricule</th>
                                <th className="px-5 py-3.5 hidden md:table-cell">
                                    Département
                                </th>
                                <th className="px-5 py-3.5 hidden lg:table-cell">
                                    Service
                                </th>
                                <th className="px-5 py-3.5">Statut</th>
                                <th className="px-5 py-3.5 text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {personnel.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className={`px-5 py-14 text-center text-sm ${T.sub}`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-10 h-10 mx-auto mb-3 opacity-30"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M17 20H7a4 4 0 01-4-4v0a4 4 0 014-4h10a4 4 0 014 4v0a4 4 0 01-4 4zM12 3a4 4 0 110 8 4 4 0 010-8z"
                                            />
                                        </svg>
                                        Aucun personnel trouvé pour ces
                                        critères.
                                    </td>
                                </tr>
                            ) : (
                                personnel.map((p, i) => (
                                    <tr
                                        key={`${p.matricule}-${i}`}
                                        className={`border-b transition-colors ${T.trHover}`}
                                    >
                                        {/* Nom + avatar */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-8 h-8 rounded-full bg-linear-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                                                >
                                                    {getInitiales(
                                                        p.nom,
                                                        p.prenoms,
                                                    )}
                                                </div>
                                                <div
                                                    className={`font-semibold leading-tight ${T.tdText}`}
                                                >
                                                    {p.nom} {p.prenoms}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Matricule = m.im dans la BDD (voir staffModels.js ligne 78) */}
                                        <td
                                            className={`px-5 py-3.5 font-mono text-xs ${T.tdSub}`}
                                        >
                                            #{p.matricule}
                                        </td>

                                        {/* Département = INITCAP(s.libelle) (voir staffModels.js ligne 79) */}
                                        <td
                                            className={`px-5 py-3.5 hidden md:table-cell ${T.tdText}`}
                                        >
                                            {p.departement || (
                                                <span className={T.tdSub}>
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* Service = m.fonction renommé (voir staffModels.js ligne 80) */}
                                        <td
                                            className={`px-5 py-3.5 hidden lg:table-cell ${T.tdSub}`}
                                        >
                                            {p.service || (
                                                <span className="opacity-50">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* Statut */}
                                        <td className="px-5 py-3.5">
                                            <StatutBadge
                                                statut={p.statut || "Actif"}
                                                dark={dark}
                                            />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Bouton "Voir" — fonctionnel
                            onClick → onSelectId(p.id)
                            → setSelectedId(p.id) dans le parent
                            → PersonnelDirectory affiche <StaffProfile>
                            → StaffProfile appelle GET /staff/profile/:id */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // évite de propager le clic à la <tr>
                                                        onSelectId(p.id);
                                                    }}
                                                    className={`${T.actionView} cursor-pointer`}
                                                    title="Voir le profil"
                                                >
                                                    <EyeIcon />
                                                    <span className="hidden sm:inline cursor-pointer">
                                                        Voir
                                                    </span>
                                                </button>

                                                {/* Bouton "Mis à jour" — ouvre UpdateModal avec l'id du membre */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectIdUpdate(p.id);
                                                    }}
                                                    className={`${T.actionEdit} cursor-pointer`}
                                                    title="Mettre à jour"
                                                >
                                                    <EditIcon />
                                                    <span className="hidden sm:inline cursor-pointer w-max">
                                                        Mis à jour
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* ── Pagination ── */}
                    {pagination.totalPages > 1 && (
                        <div
                            className={`flex items-center justify-between px-5 py-3.5 border-t ${dark ? "border-white/8" : "border-slate-100"}`}
                        >
                            <p className={`text-xs ${T.sub}`}>
                                Affichage{" "}
                                {(pagination.page - 1) * pagination.limit + 1}–
                                {Math.min(
                                    pagination.page * pagination.limit,
                                    pagination.total,
                                )}{" "}
                                sur {pagination.total}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page === 1}
                                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${T.pagBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
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
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                {buildPageNumbers().map((n, i) =>
                                    n === "..." ? (
                                        <span
                                            key={`e-${i}`}
                                            className={`w-8 h-8 flex items-center justify-center text-xs ${T.sub}`}
                                        >
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={n}
                                            onClick={() => setPage(n)}
                                            className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-all ${page === n ? T.pagBtnAct : T.pagBtn}`}
                                        >
                                            {n}
                                        </button>
                                    ),
                                )}
                                <button
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(
                                                pagination.totalPages,
                                                p + 1,
                                            ),
                                        )
                                    }
                                    disabled={page === pagination.totalPages}
                                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${T.pagBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
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
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
