import { useState, useEffect, useCallback } from "react";
import SearchInput from "./SearchInput";
import "../App.css";
import { API_BASE, apiFetch } from "../config/api.js";

// ── Mapping styles + labels par type d'action
const ACTION_STYLE = {
    AJOUT_PERSONNEL: {
        dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
        light: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Ajout d'employé",
        dot: "bg-emerald-500",
    },
    ARCHIVAGE_PERSONNEL: {
        dark: "bg-rose-500/15 text-rose-400 border-rose-500/25",
        light: "bg-rose-50 text-rose-700 border-rose-200",
        label: "Archivage d'employé",
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
    MODIFICATION_PERSONNEL: {
        dark: "bg-amber-500/15 text-amber-400 border-amber-500/25",
        light: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Modification d'employé",
        dot: "bg-amber-500",
    },
    GENERATION_DOCUMENT: {
        dark: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
        light: "bg-cyan-50 text-cyan-700 border-cyan-200",
        label: "Génération de document",
        dot: "bg-cyan-500",
    },
    RESET_MDP: {
        dark: "bg-orange-500/15 text-orange-400 border-orange-500/25",
        light: "bg-orange-50 text-orange-700 border-orange-200",
        label: "Réinitialisation mot de passe",
        dot: "bg-orange-500",
    },
    ACTIVATION: {
        dark: "bg-lime-500/15 text-lime-400 border-lime-500/25",
        light: "bg-lime-50 text-lime-700 border-lime-200",
        label: "Activation compte",
        dot: "bg-lime-500",
    },
    DESACTIVATION: {
        dark: "bg-slate-500/15 text-slate-400 border-slate-500/25",
        light: "bg-slate-100 text-slate-600 border-slate-300",
        label: "Désactivation compte",
        dot: "bg-slate-400",
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
    { value: "MODIFICATION_PERSONNEL", label: "Modification" },
    { value: "GENERATION_DOCUMENT", label: "Génération de document" },
    { value: "RESET_MDP", label: "Réinitialisation mot de passe" },
    { value: "ACTIVATION", label: "Activation compte" },
    { value: "DESACTIVATION", label: "Désactivation compte" },
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
    if (action === "MODIFICATION" || action === "MODIFICATION_PERSONNEL")
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
    if (action === "GENERATION_DOCUMENT")
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
    if (action === "RESET_MDP")
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
            </svg>
        );
    if (action === "ACTIVATION")
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        );
    if (action === "DESACTIVATION")
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
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
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
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}
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

    const selectCls = dark
        ? "px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-sm outline-none focus:border-blue-500/60 cursor-pointer transition-all [&_option]:text-black [&_option]:bg-white"
        : "px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-blue-400 cursor-pointer transition-all";

    // ── GET /audit-logs — search, filtre et stats gérés côté backend
    const requestLogs = useCallback(
        (page = currentPage) => {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({ page, limit: 20 });
            if (searchText) params.set("search", searchText);
            if (filterAction) params.set("type_action", filterAction);

            return apiFetch(`${API_BASE}/audit-logs?${params}`)
                .then((res) => {
                    if (!res.ok) throw new Error(`Erreur ${res.status}`);
                    return res.json();
                })
                .then((json) => {
                    setLogs(json.data || []);
                    setPagination(
                        json.pagination || {
                            total: 0,
                            page: 1,
                            limit: 20,
                            totalPages: 1,
                        },
                    );
                    // Stats reçues du backend (totaux réels, pas seulement la page)
                    setCounts(json.stats || {});
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
        },
        [currentPage, searchText, filterAction],
    );

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void requestLogs(currentPage);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [requestLogs, currentPage]);

    const handleSearchChange = (value) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e) => {
        setFilterAction(e.target.value);
        setCurrentPage(1);
    };

    // Plus de filtrage côté client : le backend gère search + type_action
    const logsFiltres = logs;

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
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
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
                    <div className="space-y-3">
                        {/* Ligne 1 — 4 cards existantes */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <StatCard
                                dark={dark}
                                value={counts["ajouts"] ?? 0}
                                label="Ajouts d'employés (total)"
                                colorClass={
                                    dark
                                        ? "text-emerald-400"
                                        : "text-emerald-600"
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
                                value={counts["archivages"] ?? 0}
                                label="Archivages de profils (total)"
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
                                value={counts["avancements"] ?? 0}
                                label="Avancements (total)"
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
                                value={counts["modifications"] ?? 0}
                                label="Modifications de profils (total)"
                                colorClass={
                                    dark ? "text-amber-400" : "text-amber-600"
                                }
                                bgClass={
                                    dark ? "bg-amber-500/15" : "bg-amber-50"
                                }
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
                        {/* Ligne 2 — 3 nouvelles cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <StatCard
                                dark={dark}
                                value={counts["documents"] ?? 0}
                                label="Documents générés (total)"
                                colorClass={
                                    dark ? "text-cyan-400" : "text-cyan-600"
                                }
                                bgClass={dark ? "bg-cyan-500/15" : "bg-cyan-50"}
                                icon={
                                    <svg
                                        className={`w-5 h-5 ${dark ? "text-cyan-400" : "text-cyan-600"}`}
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
                                }
                            />
                            <StatCard
                                dark={dark}
                                value={counts["comptes"] ?? 0}
                                label="Activations/désactivations de comptes (total)"
                                colorClass={
                                    dark ? "text-lime-400" : "text-lime-600"
                                }
                                bgClass={dark ? "bg-lime-500/15" : "bg-lime-50"}
                                icon={
                                    <svg
                                        className={`w-5 h-5 ${dark ? "text-lime-400" : "text-lime-600"}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                }
                            />
                            <StatCard
                                dark={dark}
                                value={counts["reinitialisations_mdp"] ?? 0}
                                label="Réinitialisations de mots de passe (total)"
                                colorClass={
                                    dark ? "text-orange-400" : "text-orange-600"
                                }
                                bgClass={
                                    dark ? "bg-orange-500/15" : "bg-orange-50"
                                }
                                icon={
                                    <svg
                                        className={`w-5 h-5 ${dark ? "text-orange-400" : "text-orange-600"}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                        />
                                    </svg>
                                }
                            />
                        </div>
                    </div>
                )}

                {/* ── BARRE FILTRES */}
                <div
                    className={`rounded-2xl border p-4 flex flex-col sm:flex-row gap-3 ${card}`}
                >
                    <SearchInput
                        value={searchText}
                        onChange={handleSearchChange}
                        dark={dark}
                        placeholder="Rechercher par description ou auteur…"
                        className="flex-1"
                    />
                    <select
                        value={filterAction}
                        onChange={handleFilterChange}
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
                        onClick={() => requestLogs(currentPage)}
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
                                    onClick={() => requestLogs(currentPage)}
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
                                                                    className={`w-1.5 h-1.5 rounded-full ${dotCls} shrink-0`}
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
