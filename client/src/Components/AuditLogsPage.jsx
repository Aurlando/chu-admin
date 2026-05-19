import { useState, useEffect, useCallback } from "react";
import "../App.css";

const API_BASE = "http://localhost:3000";

// ── Mapping styles + labels par type d'action
const ACTION_STYLE = {
    AJOUT_PERSONNEL: {
        dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
        light: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Ajout personnel",
        dot: "bg-emerald-500",
    },
    ARCHIVAGE_PERSONNEL: {
        dark: "bg-rose-500/15 text-rose-400 border-rose-500/25",
        light: "bg-rose-50 text-rose-700 border-rose-200",
        label: "Archivage",
        dot: "bg-rose-500",
    },
    AVANCEMENT_ECHELON: {
        dark: "bg-blue-500/15 text-blue-400 border-blue-500/25",
        light: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Avancement échelon",
        dot: "bg-blue-500",
    },
    PROMOTION_CLASSE: {
        dark: "bg-violet-500/15 text-violet-400 border-violet-500/25",
        light: "bg-violet-50 text-violet-700 border-violet-200",
        label: "Promotion classe",
        dot: "bg-violet-500",
    },
    MODIFICATION: {
        dark: "bg-amber-500/15 text-amber-400 border-amber-500/25",
        light: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Modification",
        dot: "bg-amber-500",
    },
};
const ACTION_DEFAULT = {
    dark: "bg-slate-500/15 text-slate-400 border-slate-500/25",
    light: "bg-slate-100 text-slate-600 border-slate-300",
    label: "Activité",
    dot: "bg-slate-400",
};

const ACTION_FILTERS = [
    { value: "", label: "Toutes les actions" },
    { value: "AJOUT_PERSONNEL", label: "Ajout personnel" },
    { value: "ARCHIVAGE_PERSONNEL", label: "Archivage" },
    { value: "AVANCEMENT_ECHELON", label: "Avancement échelon" },
    { value: "PROMOTION_CLASSE", label: "Promotion classe" },
    { value: "MODIFICATION", label: "Modification" },
];

function auditIcon(action, cls = "w-4 h-4") {
    if (action === "AJOUT_PERSONNEL")
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={cls}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
            </svg>
        );
    if (action === "ARCHIVAGE_PERSONNEL")
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={cls}
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
        );
    if (action === "AVANCEMENT_ECHELON" || action === "PROMOTION_CLASSE")
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={cls}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
            </svg>
        );
    if (action === "MODIFICATION")
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={cls}
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
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={cls}
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
    );
}

// ── Carte stat résumé
function StatCard({ icon, value, label, colorClass, bgClass, dark }) {
    return (
        <div
            className={`rounded-2xl border p-4 flex items-center gap-3 transition-all hover:shadow-md
            ${dark ? "bg-[#0d1526] border-white/6" : "bg-white border-slate-200 shadow-sm"}`}
        >
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}
            >
                {icon}
            </div>
            <div>
                <div
                    className={`text-xl font-bold tracking-tight ${colorClass}`}
                >
                    {value}
                </div>
                <div
                    className={`text-[11px] font-medium mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
                >
                    {label}
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════
export default function AuditLogsPage({ dark }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
    });
    const [filterAction, setFilterAction] = useState("");
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    // Comptage par type d'action pour les stat cards
    const [counts, setCounts] = useState({});
    const [selectedLog, setSelectedLog] = useState(null);

    const token = localStorage.getItem("token");

    // ── Tokens thème
    const bg = dark ? "bg-[#0a0f1e]" : "bg-[#f4f6fb]";
    const card = dark
        ? "bg-[#0d1526] border-white/6"
        : "bg-white border-slate-200 shadow-sm";
    const ttl = dark ? "text-white" : "text-slate-800";
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const border = dark ? "border-white/6" : "border-slate-100";
    const thCls = dark
        ? "px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-600 bg-white/2 border-b border-white/5 whitespace-nowrap text-left"
        : "px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100 whitespace-nowrap text-left";
    const inputCls = dark
        ? "px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-slate-600 outline-none focus:border-blue-500/60 transition-all"
        : "px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all";
    const selectCls = dark
        ? "px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-sm outline-none focus:border-blue-500/60 cursor-pointer transition-all [&_option]:text-black [&_option]:bg-white"
        : "px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-blue-400 cursor-pointer transition-all";

    // ── GET /audit-logs
    const fetchLogs = useCallback(() => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ page: currentPage, limit: 20 });
        fetch(`${API_BASE}/audit-logs?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Erreur ${res.status}`);
                return res.json();
            })
            .then((json) => {
                const data = json.data || [];
                setLogs(data);
                setPagination(
                    json.pagination || {
                        total: 0,
                        page: 1,
                        limit: 20,
                        totalPages: 1,
                    },
                );
                // Calcul comptages pour stat cards
                const c = {};
                data.forEach((l) => {
                    c[l.action] = (c[l.action] || 0) + 1;
                });
                setCounts(c);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [currentPage, token]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // ── Filtrage côté client
    const logsFiltres = logs.filter((log) => {
        const matchAction = !filterAction || log.action === filterAction;
        const desc = (
            log.details?.description ||
            log.details?.nouveau_grade ||
            ""
        ).toLowerCase();
        const auteur = (
            log.utilisateur?.nom_complet ||
            log.utilisateur?.username ||
            ""
        ).toLowerCase();
        const matchSearch =
            !searchText ||
            desc.includes(searchText.toLowerCase()) ||
            auteur.includes(searchText.toLowerCase());
        return matchAction && matchSearch;
    });

    const goToPage = (p) => {
        if (p >= 1 && p <= pagination.totalPages) setCurrentPage(p);
    };

    return (
        <div className={`flex-1 overflow-auto ${bg}`}>
            {/* ── TOPBAR BREADCRUMB */}
            <div
                className={`sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between
                ${dark ? "bg-[#0a0f1e]/90 border-white/5 backdrop-blur-md" : "bg-white/90 border-slate-200 backdrop-blur-md"}`}
            >
                <div className="flex items-center gap-2 text-sm">
                    <span className={sub}>Admin</span>
                    <svg
                        className={`w-3.5 h-3.5 ${sub}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                    <span className={`font-semibold ${ttl}`}>
                        Journaux d'audit
                    </span>
                </div>
                <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border
                    ${dark ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"}`}
                >
                    {pagination.total} entrée{pagination.total > 1 ? "s" : ""}
                </span>
            </div>

            <div className="max-w-6xl mx-auto px-5 py-6 space-y-5">
                {/* ── TITRE */}
                <div className="flex items-start gap-4">
                    <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg
                        ${dark ? "bg-violet-500/20" : "bg-violet-600"}`}
                    >
                        <svg
                            className={`w-6 h-6 ${dark ? "text-violet-400" : "text-white"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h1
                            className={`text-2xl font-extrabold tracking-tight ${ttl}`}
                        >
                            Journaux d'audit
                        </h1>
                        <p className={`text-sm mt-1 ${sub}`}>
                            Historique complet et traçable de toutes les actions
                            effectuées dans le système.
                        </p>
                    </div>
                </div>

                {/* ── STAT CARDS */}
                {!loading && !error && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatCard
                            dark={dark}
                            value={counts["AJOUT_PERSONNEL"] ?? 0}
                            label="Ajouts (page)"
                            colorClass={
                                dark ? "text-emerald-400" : "text-emerald-600"
                            }
                            bgClass={
                                dark ? "bg-emerald-500/15" : "bg-emerald-50"
                            }
                            icon={
                                <svg
                                    className={`w-5 h-5 ${dark ? "text-emerald-400" : "text-emerald-600"}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                    />
                                </svg>
                            }
                        />
                        <StatCard
                            dark={dark}
                            value={counts["ARCHIVAGE_PERSONNEL"] ?? 0}
                            label="Archivages (page)"
                            colorClass={
                                dark ? "text-rose-400" : "text-rose-600"
                            }
                            bgClass={dark ? "bg-rose-500/15" : "bg-rose-50"}
                            icon={
                                <svg
                                    className={`w-5 h-5 ${dark ? "text-rose-400" : "text-rose-600"}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                    />
                                </svg>
                            }
                        />
                        <StatCard
                            dark={dark}
                            value={
                                (counts["AVANCEMENT_ECHELON"] ?? 0) +
                                (counts["PROMOTION_CLASSE"] ?? 0)
                            }
                            label="Avancements (page)"
                            colorClass={
                                dark ? "text-blue-400" : "text-blue-600"
                            }
                            bgClass={dark ? "bg-blue-500/15" : "bg-blue-50"}
                            icon={
                                <svg
                                    className={`w-5 h-5 ${dark ? "text-blue-400" : "text-blue-600"}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                </svg>
                            }
                        />
                        <StatCard
                            dark={dark}
                            value={counts["MODIFICATION"] ?? 0}
                            label="Modifications (page)"
                            colorClass={
                                dark ? "text-amber-400" : "text-amber-600"
                            }
                            bgClass={dark ? "bg-amber-500/15" : "bg-amber-50"}
                            icon={
                                <svg
                                    className={`w-5 h-5 ${dark ? "text-amber-400" : "text-amber-600"}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            }
                        />
                    </div>
                )}

                {/* ── BARRE FILTRES */}
                <div
                    className={`rounded-2xl border p-4 flex flex-col sm:flex-row gap-3 ${card}`}
                >
                    <div className="relative flex-1">
                        <svg
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`}
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
                            placeholder="Rechercher par description ou auteur…"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className={`${inputCls} w-full pl-9 pr-8`}
                        />
                        {searchText && (
                            <button
                                onClick={() => setSearchText("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Effacer la recherche"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className={selectCls}
                    >
                        {ACTION_FILTERS.map((f) => (
                            <option
                                key={f.value}
                                value={f.value}
                            >
                                {f.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={fetchLogs}
                        title="Rafraîchir"
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer
                            ${dark ? "border-white/10 text-slate-300 hover:bg-white/8" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Rafraîchir
                    </button>
                </div>

                {/* ── TABLE CARD */}
                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                    {/* Header */}
                    <div
                        className={`flex items-center justify-between px-5 py-4 border-b ${border}`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "bg-violet-500/15" : "bg-violet-50"}`}
                            >
                                <svg
                                    className={`w-4 h-4 ${dark ? "text-violet-400" : "text-violet-600"}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 10h16M4 14h16M4 18h7"
                                    />
                                </svg>
                            </div>
                            <p className={`text-sm font-bold ${ttl}`}>
                                Historique des actions
                            </p>
                        </div>
                        {!loading && (
                            <span className={`text-xs font-medium ${sub}`}>
                                {logsFiltres.length} entrée
                                {logsFiltres.length > 1 ? "s" : ""} affichée
                                {logsFiltres.length > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    {/* Chargement */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Erreur */}
                    {!loading && error && (
                        <div
                            className={`m-5 rounded-2xl border p-5 flex items-center gap-3 text-sm
                            ${dark ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"}`}
                        >
                            <svg
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
                            <div>
                                <p className="font-semibold">
                                    Impossible de charger les logs
                                </p>
                                <p className="text-xs mt-0.5 opacity-75">
                                    {error}
                                </p>
                                <button
                                    onClick={fetchLogs}
                                    className="underline text-xs mt-1 cursor-pointer"
                                >
                                    Réessayer
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    {!loading && !error && (
                        <>
                            {logsFiltres.length === 0 ? (
                                <div
                                    className={`flex flex-col items-center py-16 gap-3 ${sub}`}
                                >
                                    <svg
                                        className="w-10 h-10 opacity-20"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <p className="text-sm font-medium">
                                        Aucun log trouvé.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr>
                                                <th className={`${thCls} w-10`}>
                                                    #
                                                </th>
                                                <th className={thCls}>
                                                    Action
                                                </th>
                                                <th className={thCls}>
                                                    Description
                                                </th>
                                                <th className={thCls}>
                                                    Auteur
                                                </th>
                                                <th className={thCls}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logsFiltres.map((log, i) => {
                                                const style =
                                                    ACTION_STYLE[log.action] ||
                                                    ACTION_DEFAULT;
                                                const colorCls = dark
                                                    ? style.dark
                                                    : style.light;
                                                const label = style.label;
                                                const dotCls = style.dot;

                                                const desc =
                                                    log.details?.description ||
                                                    log.details
                                                        ?.nouveau_grade ||
                                                    log.details
                                                        ?.ancienne_classe ||
                                                    "—";

                                                const auteur =
                                                    log.utilisateur?.nom_complet?.trim()
                                                        ? log.utilisateur
                                                              .nom_complet
                                                        : log.utilisateur
                                                              ?.username ||
                                                          "Système";

                                                const dateStr = log.date
                                                    ? new Date(
                                                          log.date,
                                                      ).toLocaleString(
                                                          "fr-FR",
                                                          {
                                                              day: "2-digit",
                                                              month: "short",
                                                              year: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                          },
                                                      )
                                                    : "—";

                                                const rowNum =
                                                    (currentPage - 1) * 20 +
                                                    i +
                                                    1;

                                                return (
                                                    <tr
                                                        key={log.id || i}
                                                        className={`transition-colors border-b ${dark ? "border-white/4 hover:bg-white/3" : "border-slate-100 hover:bg-slate-50/60"}`}
                                                    >
                                                        {/* Numéro */}
                                                        <td
                                                            className={`px-5 py-3.5 text-xs font-mono ${sub}`}
                                                        >
                                                            {rowNum}
                                                        </td>

                                                        {/* Action badge avec point coloré */}
                                                        <td className="px-5 py-3.5">
                                                            <span
                                                                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-bold border ${colorCls}`}
                                                            >
                                                                <span
                                                                    className={`w-1.5 h-1.5 rounded-full ${dotCls} flex-shrink-0`}
                                                                />
                                                                {auditIcon(
                                                                    log.action,
                                                                    "w-3.5 h-3.5",
                                                                )}
                                                                {label}
                                                            </span>
                                                        </td>

                                                        {/* Description */}
                                                        <td
                                                            className={`px-5 py-3.5 max-w-xs ${dark ? "text-slate-300" : "text-slate-700"}`}
                                                        >
                                                            <span
                                                                className="text-xs leading-relaxed line-clamp-2"
                                                                title={desc}
                                                            >
                                                                {desc}
                                                            </span>
                                                        </td>

                                                        {/* Auteur */}
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                                                                    ${dark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"}`}
                                                                >
                                                                    {(
                                                                        auteur[0] ||
                                                                        "S"
                                                                    ).toUpperCase()}
                                                                </div>
                                                                <span
                                                                    className={`text-xs font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}
                                                                >
                                                                    {auteur}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Date */}
                                                        <td
                                                            className={`px-5 py-3.5 text-xs whitespace-nowrap ${sub}`}
                                                        >
                                                            {dateStr}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {selectedLog && (
                                <LogDetailModal
                                    log={selectedLog}
                                    dark={dark}
                                    onClose={() => setSelectedLog(null)}
                                />
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div
                                    className={`flex items-center justify-between px-5 py-3.5 border-t ${border}`}
                                >
                                    <span className={`text-xs ${sub}`}>
                                        Page{" "}
                                        <span
                                            className={`font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}
                                        >
                                            {pagination.page}
                                        </span>{" "}
                                        sur {pagination.totalPages} —{" "}
                                        {pagination.total} entrée
                                        {pagination.total > 1 ? "s" : ""}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() =>
                                                goToPage(currentPage - 1)
                                            }
                                            disabled={currentPage <= 1}
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center border text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
                                                ${dark ? "border-white/10 text-slate-400 hover:bg-white/8 hover:text-white" : "border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                                        >
                                            ‹
                                        </button>

                                        {Array.from(
                                            {
                                                length: Math.min(
                                                    pagination.totalPages,
                                                    5,
                                                ),
                                            },
                                            (_, i) => {
                                                let p;
                                                if (pagination.totalPages <= 5)
                                                    p = i + 1;
                                                else if (currentPage <= 3)
                                                    p = i + 1;
                                                else if (
                                                    currentPage >=
                                                    pagination.totalPages - 2
                                                )
                                                    p =
                                                        pagination.totalPages -
                                                        4 +
                                                        i;
                                                else p = currentPage - 2 + i;
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() =>
                                                            goToPage(p)
                                                        }
                                                        className={`w-8 h-8 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                                                        ${
                                                            p === currentPage
                                                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                                : dark
                                                                  ? "border-white/10 text-slate-400 hover:bg-white/8 hover:text-white"
                                                                  : "border-slate-200 text-slate-500 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                );
                                            },
                                        )}

                                        <button
                                            onClick={() =>
                                                goToPage(currentPage + 1)
                                            }
                                            disabled={
                                                currentPage >=
                                                pagination.totalPages
                                            }
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center border text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
                                                ${dark ? "border-white/10 text-slate-400 hover:bg-white/8 hover:text-white" : "border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Footer info */}
                            <div
                                className={`flex items-center justify-between px-5 py-3 border-t text-xs ${dark ? "border-white/4 text-slate-600" : "border-slate-100 text-slate-400"}`}
                            >
                                <span>
                                    Source :{" "}
                                    <code className="font-mono">
                                        GET /audit-logs
                                    </code>
                                </span>
                                <span>
                                    Mis à jour à{" "}
                                    {new Date().toLocaleTimeString("fr-FR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
