import { useEffect, useState } from "react";
import "../App.css";
import AddPersonnel from "./AddPersonnel";
import PersonnelDirectory from "./PersonnelDirectory";
import SecurityCredentials from "./SecurityCredentials";
import Sidebar from "./Sidebar";
import StructureHospitaliere from "./StructureHospitaliere";
// [AJOUTÉ] Page archives du personnel
import ArchivePage from "./ArchivePage";
import AuditLogsPage from "./AuditLogsPage";
import Avancements from "./Avancements";
import NotificationMenu from "./NotificationMenu";
import SettingsMenu from "./SettingsMenu";
import ToggleMode from "./ToggleMode";
import { API_BASE } from "../config/api.js";

// Palette coherente cards + graphique
const PALETTE = {
    Professeur: "#8b5cf6ff",
    Medecin: "#3b82f6",
    Paramedical: "#10b981",
    Admin: "#bc4749",
    "Agent d'appui": "#06b6d4",
    Autre: "#94a3b8",
};

// Noms exacts des groupes retournes par l'API
const GROUPES = [
    "Professeur",
    "Médecin",
    "Paramédical",
    "Admin",
    "Agent d'appui",
    "Autre",
];

// Palette indexee par nom API
const PALETTE_API = {
    Professeur: "#8b5cf6",
    Médecin: "#3b82f6",
    Paramédical: "#10b981",
    Admin: "#bc4749",
    "Agent d'appui": "#06b6d4",
    Autre: "#94a3b8",
};

// Icones SVG par groupe
const ICONS = {
    Professeur: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
        </svg>
    ),
    Médecin: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
        </svg>
    ),
    Paramédical: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
        </svg>
    ),
    Admin: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
        </svg>
    ),
    "Agent d'appui": (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20H7a4 4 0 01-4-4v0a4 4 0 014-4h10a4 4 0 014 4v0a4 4 0 01-4 4zM12 3a4 4 0 110 8 4 4 0 010-8z"
            />
        </svg>
    ),
    Autre: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
        </svg>
    ),
    Total: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20H7a4 4 0 01-4-4v0a4 4 0 014-4h10a4 4 0 014 4v0a4 4 0 01-4 4zM12 3a4 4 0 110 8 4 4 0 010-8z"
            />
        </svg>
    ),
};

// ── Mapping couleurs / icônes pour les actions d'audit
const ACTION_STYLE = {
    AJOUT_PERSONNEL: {
        dark: "bg-emerald-400/10 text-emerald-400",
        light: "bg-emerald-50 text-emerald-600",
        label: "Ajout d'employé",
    },
    ARCHIVAGE_PERSONNEL: {
        dark: "bg-rose-400/10 text-rose-400",
        light: "bg-rose-50 text-rose-600",
        label: "Archivage d'employé",
    },
    AVANCEMENT_ECHELON: {
        dark: "bg-blue-400/10 text-blue-400",
        light: "bg-blue-50 text-blue-600",
        label: "Avancement d'échelon",
    },
    PROMOTION_CLASSE: {
        dark: "bg-violet-400/10 text-violet-400",
        light: "bg-violet-50 text-violet-600",
        label: "Promotion d'employé",
    },
    MODIFICATION_PERSONNEL: {
        dark: "bg-amber-400/10 text-amber-400",
        light: "bg-amber-50 text-amber-600",
        label: "Modification d'employé",
    },
    GENERATION_DOCUMENT: {
        dark: "bg-cyan-400/10 text-cyan-400",
        light: "bg-cyan-50 text-cyan-600",
        label: "Génération de document",
    },
    RESET_MDP: {
        dark: "bg-orange-400/10 text-orange-400",
        light: "bg-orange-50 text-orange-600",
        label: "Réinitialisation mot de passe",
    },
    ACTIVATION: {
        dark: "bg-lime-400/10 text-lime-400",
        light: "bg-lime-50 text-lime-600",
        label: "Activation compte",
    },
    DESACTIVATION: {
        dark: "bg-slate-400/10 text-slate-400",
        light: "bg-slate-100 text-slate-500",
        label: "Désactivation compte",
    },
};
const ACTION_DEFAULT = {
    dark: "bg-slate-400/10 text-slate-400",
    light: "bg-slate-100 text-slate-500",
    label: "Activité",
};

function auditIcon(action) {
    if (action === "AJOUT_PERSONNEL")
        return (
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
            </svg>
        );
    if (action === "ARCHIVAGE_PERSONNEL")
        return (
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
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
            </svg>
        );
    if (action === "AVANCEMENT_ECHELON" || action === "PROMOTION_CLASSE")
        return (
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
            </svg>
        );
    if (action === "MODIFICATION" || action === "MODIFICATION_PERSONNEL")
        return (
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
        );
    if (action === "GENERATION_DOCUMENT")
        return (
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
        );

    if (action === "RESET_MDP")
        return (
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
            </svg>
        );

    if (action === "ACTIVATION")
        return (
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        );

    if (action === "DESACTIVATION")
        return (
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
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        );
    return (
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
    );
}

// ════════════════════════════════════════════════════════════════════
// StatCard — cliquable, filtre le graphe sur son groupe
// ════════════════════════════════════════════════════════════════════
function StatCard({ groupe, total, dark, onClick, isActive }) {
    const color = PALETTE_API[groupe] || "#94a3b8";
    const icon = ICONS[groupe] || ICONS["Autre"];
    const isTotal = groupe === "Total";

    return (
        <div
            onClick={onClick}
            className={`relative group overflow-hidden rounded-2xl border p-4 lg:p-5
                transition-all duration-300 cursor-pointer select-none hover:-translate-y-0.5
                ${
                    isTotal
                        ? dark
                            ? "bg-blue-500/15 border-blue-500/30"
                            : "bg-blue-50 border-blue-200 shadow-sm"
                        : dark
                          ? "bg-white/5 border-white/10 hover:border-white/20"
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
                }`}
            style={
                isActive
                    ? { borderColor: color, boxShadow: `0 0 0 2px ${color}35` }
                    : {}
            }
        >
            {/* Glow — permanent si active */}
            <div
                className={`absolute inset-0 transition-opacity duration-300 pointer-events-none
                ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                style={{
                    background: `radial-gradient(circle at 80% 10%, ${color}28, transparent 65%)`,
                }}
            />

            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}20`, color }}
                >
                    {icon}
                </div>
                {isActive && (
                    <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                            color,
                            background: `${color}18`,
                            borderColor: `${color}45`,
                        }}
                    >
                        actif
                    </span>
                )}
                {!isActive && isTotal && (
                    <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                        ${dark ? "text-blue-400 bg-blue-500/10 border-blue-500/20" : "text-blue-600 bg-blue-50 border-blue-200"}`}
                    >
                        CHU
                    </span>
                )}
            </div>

            <div
                className={`text-2xl lg:text-3xl font-bold font-mono tracking-tight
                ${dark ? "text-white" : "text-slate-800"}`}
            >
                {total}
            </div>
            <div
                className={`text-xs lg:text-sm mt-1 font-medium truncate
                ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
                {isTotal ? "Total Personnel" : groupe}
            </div>

            {/* Trait coloré en bas */}
            <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl transition-opacity"
                style={{ backgroundColor: color, opacity: isActive ? 1 : 0.4 }}
            />
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════
// BarChart — mode Total (barre pleine bleue) ou groupe unique (couleur groupe)
// ════════════════════════════════════════════════════════════════════
function BarChart({ data, filter, dark }) {
    const values = data.map((item) => {
        if (filter === "Total")
            return GROUPES.reduce((s, g) => s + (Number(item[g]) || 0), 0);
        return Number(item[filter]) || 0;
    });
    const maxVal = Math.max(...values, 1);
    const barColor = filter === "Total" ? null : PALETTE_API[filter];

    // Couleur du label au survol
    const labelColor =
        filter === "Total" ? "#3b82f6" : PALETTE_API[filter] || "#3b82f6";

    return (
        <div className="overflow-x-auto pb-2">
            <div
                className="flex items-end gap-2 px-1"
                style={{ minWidth: `${data.length * 48}px`, height: "170px" }}
            >
                {data.map((item, i) => {
                    const val = values[i];
                    const barH = Math.max(
                        (val / maxVal) * 130,
                        val > 0 ? 5 : 2,
                    );
                    const abbr = item.service.split(/[\s-]/)[0].substring(0, 7);

                    return (
                        <div
                            key={i}
                            className="flex flex-col items-center gap-1 group flex-1"
                            style={{ minWidth: "40px" }}
                        >
                            <div
                                className="relative flex items-end justify-center w-full"
                                style={{ height: "145px" }}
                            >
                                {/* Label valeur — apparait au survol AU-DESSUS de la barre */}
                                <div
                                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center
                                    pointer-events-none transition-all duration-200
                                    opacity-0 group-hover:opacity-100`}
                                    style={{ bottom: `${barH + 4}px` }}
                                >
                                    {/* Bulle avec le nombre */}
                                    <div
                                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap shadow-lg
                                        ${dark ? "text-white" : "text-white"}`}
                                        style={{ backgroundColor: labelColor }}
                                    >
                                        {val}
                                    </div>
                                    {/* Petite fleche vers le bas */}
                                    <div
                                        className="w-0 h-0"
                                        style={{
                                            borderLeft: "4px solid transparent",
                                            borderRight:
                                                "4px solid transparent",
                                            borderTop: `5px solid ${labelColor}`,
                                        }}
                                    />
                                </div>

                                {/* Barre */}
                                {val > 0 ? (
                                    filter === "Total" ? (
                                        // Mode Total → barre unie dégradé bleu
                                        <div
                                            className="w-7 lg:w-8 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                                            style={{
                                                height: `${barH}px`,
                                                background:
                                                    "linear-gradient(to top, #1d4ed8, #60a5fa)",
                                            }}
                                        />
                                    ) : (
                                        // Mode groupe → couleur du groupe
                                        <div
                                            className="w-7 lg:w-8 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                                            style={{
                                                height: `${barH}px`,
                                                backgroundColor: barColor,
                                                opacity: 0.88,
                                            }}
                                        />
                                    )
                                ) : (
                                    <div
                                        className="w-7 lg:w-8 rounded-t-sm"
                                        style={{
                                            height: "3px",
                                            background: dark
                                                ? "rgba(255,255,255,0.06)"
                                                : "#e2e8f0",
                                        }}
                                    />
                                )}
                            </div>

                            <span
                                className={`text-[9px] lg:text-[10px] text-center leading-tight font-medium
                                w-full truncate transition-colors group-hover:text-blue-400
                                ${dark ? "text-slate-500" : "text-slate-400"}`}
                                title={item.service}
                            >
                                {abbr}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Legende (affichee en mode Total uniquement)
function ChartLegend({ dark }) {
    return (
        <div
            className={`flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t
            ${dark ? "border-white/8" : "border-slate-100"}`}
        >
            {GROUPES.map((g) => (
                <div key={g} className="flex items-center gap-1.5">
                    <div
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: PALETTE_API[g] }}
                    />
                    <span
                        className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-500"}`}
                    >
                        {g}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════
// AuditLogPanel — Activite systeme (logs réels depuis /audit-logs)
// ════════════════════════════════════════════════════════════════════
function AuditLogPanel({ dark, T, onNavigate, onLogout }) {
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${API_BASE}/audit-logs?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    onLogout();
                    throw new Error("Session expirée");
                }
                if (!res.ok) throw new Error(`Erreur ${res.status}`);
                return res.json();
            })
            .then((json) => {
                setLogs(json.data || []);
                setLoadingLogs(false);
            })
            .catch((err) => {
                setLoadError(err.message);
                setLoadingLogs(false);
            });
    }, [onLogout]);

    return (
        <div
            className={`xl:col-span-2 rounded-2xl border p-5 flex flex-col ${T.cardBg}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className={`text-sm font-bold ${T.cardTitle}`}>
                        Activité système
                    </h2>
                    <p className={`text-xs mt-0.5 ${T.cardSub}`}>
                        Logs récents en temps réel
                    </p>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse">
                    LIVE
                </span>
            </div>

            {/* État chargement */}
            {loadingLogs && (
                <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* État erreur */}
            {!loadingLogs && loadError && (
                <div
                    className={`text-xs text-center py-6 ${dark ? "text-slate-600" : "text-slate-400"}`}
                >
                    Impossible de charger les logs
                </div>
            )}

            {/* Logs */}
            {!loadingLogs && !loadError && (
                <div className="space-y-3 flex-1">
                    {logs.length === 0 ? (
                        <p className={`text-xs text-center py-6 ${T.cardSub}`}>
                            Aucun log disponible
                        </p>
                    ) : (
                        logs.map((log) => {
                            const style =
                                ACTION_STYLE[log.action] || ACTION_DEFAULT;
                            const colorCls = dark ? style.dark : style.light;
                            const label = style.label;
                            // Description : champ details.description ou details.nouveau_grade
                            const desc =
                                log.details?.description ||
                                log.details?.nouveau_grade ||
                                "";
                            // Date relative
                            const dateStr = log.date
                                ? new Date(log.date).toLocaleDateString(
                                      "fr-FR",
                                      { day: "2-digit", month: "short" },
                                  )
                                : "";
                            // Auteur
                            const auteur =
                                log.utilisateur?.nom_complet ||
                                log.utilisateur?.username ||
                                "";

                            return (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3"
                                >
                                    <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colorCls}`}
                                    >
                                        {auditIcon(log.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className={`text-xs font-semibold leading-tight ${T.cardTitle}`}
                                        >
                                            {label}
                                        </div>
                                        {desc && (
                                            <div
                                                className={`text-[10px] mt-0.5 truncate ${T.cardSub}`}
                                                title={desc}
                                            >
                                                {desc}
                                            </div>
                                        )}
                                        <div
                                            className={`text-[10px] font-medium mt-0.5 flex items-center gap-1.5 ${T.cardSub}`}
                                        >
                                            {auteur && <span>{auteur}</span>}
                                            {auteur && dateStr && (
                                                <span>·</span>
                                            )}
                                            {dateStr && <span>{dateStr}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <button
                onClick={() => onNavigate?.("Audit Logs")}
                className={`mt-4 w-full text-xs border rounded-xl py-2 font-medium transition-all cursor-pointer
                    ${
                        dark
                            ? "border-blue-500/20 hover:border-blue-400/40 text-blue-400 hover:text-blue-300"
                            : "border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700"
                    }`}
            >
                Voir tous les logs →
            </button>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════
// DashboardHome — page d'accueil avec donnees reelles
// ════════════════════════════════════════════════════════════════════
function DashboardHome({ dark, T, onNavigate, onLogout }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // "Total" = empilement multicolore, nom de groupe = barre simple
    const [selectedGroup, setSelectedGroup] = useState("Total");

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${API_BASE}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                // Intercepter la session expirée / invalide
                if (res.status === 401 || res.status === 403) {
                    onLogout();
                    throw new Error("Session expirée");
                }
                if (!res.ok) throw new Error("Erreur reseau");
                return res.json();
            })
            .then((json) => {
                setData(json.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [onLogout]);

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Bonjour" : hour < 18 ? "Bon apres-midi" : "Bonsoir";

    const totalCard = data?.cards?.find((c) => c.groupe === "Total");
    const groupCards = data?.cards?.filter((c) => c.groupe !== "Total") ?? [];

    // Options dropdown : Total + 6 groupes
    const DROPDOWN_OPTIONS = [
        { value: "Total", label: "Total Personnel" },
        ...GROUPES.map((g) => ({ value: g, label: g })),
    ];

    const handleCardClick = (groupe) => {
        setSelectedGroup(groupe === "Total" ? "Total" : groupe);
    };

    return (
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {/* En-tete */}
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                    <h1
                        className={`text-2xl lg:text-3xl font-bold ${T.greetTitle}`}
                    >
                        {greeting}, Admin 👋
                    </h1>
                    <p className={`text-sm mt-1 ${T.greetSub}`}>
                        Voici un resume du statut du personnel hospitalier.
                    </p>
                </div>
                <button
                    onClick={() => onNavigate?.("Ajouter un personnel")}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 shrink-0 cursor-pointer"
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

            {/* Spinner */}
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Erreur */}
            {error && (
                <div
                    className={`rounded-2xl border p-4 text-sm flex items-center gap-3
                    ${dark ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"}`}
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
                    Erreur de connexion : {error}
                </div>
            )}

            {data && (
                <div className="space-y-5">
                    {/* CARDS cliquables — clic filtre le graphe */}
                    {totalCard && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                                <StatCard
                                    groupe={totalCard.groupe}
                                    total={totalCard.total}
                                    dark={dark}
                                    isActive={selectedGroup === "Total"}
                                    onClick={() => handleCardClick("Total")}
                                />
                            </div>
                            {groupCards.map((card) => (
                                <StatCard
                                    key={card.groupe_id ?? card.groupe}
                                    groupe={card.groupe}
                                    total={card.total}
                                    dark={dark}
                                    isActive={selectedGroup === card.groupe}
                                    onClick={() => handleCardClick(card.groupe)}
                                />
                            ))}
                        </div>
                    )}

                    {/* GRAPHIQUE + ACTIVITE SYSTEME */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                        {/* Graphique avec dropdown — xl:3/5 */}
                        <div
                            className={`xl:col-span-3 rounded-2xl border p-5 ${T.cardBg}`}
                        >
                            {/* Header : titre + dropdown */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <h2
                                        className={`text-sm font-bold ${T.cardTitle}`}
                                    >
                                        Distribution par Service
                                    </h2>
                                    <p
                                        className={`text-xs mt-0.5 ${T.cardSub}`}
                                    >
                                        {data.graphe?.length ?? 0} services
                                        {selectedGroup !== "Total" && (
                                            <span
                                                style={{
                                                    color: PALETTE_API[
                                                        selectedGroup
                                                    ],
                                                }}
                                            >
                                                {" "}
                                                • {selectedGroup}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Dropdown filtre */}
                                <div className="relative shrink-0">
                                    <select
                                        value={selectedGroup}
                                        onChange={(e) =>
                                            setSelectedGroup(e.target.value)
                                        }
                                        className={`appearance-none text-xs border rounded-xl px-3 py-1.5 pr-7 outline-none cursor-pointer font-medium transition-colors
                                            ${
                                                dark
                                                    ? "bg-white/8 border-white/15 text-slate-300 hover:border-white/30"
                                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                                            }`}
                                        style={
                                            selectedGroup !== "Total"
                                                ? {
                                                      borderColor: `${PALETTE_API[selectedGroup]}60`,
                                                      color: PALETTE_API[
                                                          selectedGroup
                                                      ],
                                                  }
                                                : {}
                                        }
                                    >
                                        {DROPDOWN_OPTIONS.map((opt) => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <span
                                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]
                                        ${dark ? "text-slate-500" : "text-slate-400"}`}
                                    >
                                        ▾
                                    </span>
                                </div>
                            </div>

                            {data.graphe?.length > 0 ? (
                                <>
                                    <BarChart
                                        data={data.graphe}
                                        filter={selectedGroup}
                                        dark={dark}
                                    />
                                    {selectedGroup === "Total" && (
                                        <ChartLegend dark={dark} />
                                    )}
                                </>
                            ) : (
                                <p
                                    className={`text-sm text-center py-10 ${T.cardSub}`}
                                >
                                    Aucune donnee
                                </p>
                            )}
                        </div>

                        {/* Panneau Activite systeme — xl:2/5 */}
                        <AuditLogPanel
                            dark={dark}
                            T={T}
                            onNavigate={onNavigate}
                            onLogout={onLogout}
                        />
                    </div>

                    {/* BANNER Ajouter un personnel */}
                    <div
                        className="relative overflow-hidden rounded-2xl p-5 lg:p-6"
                        style={{
                            background:
                                "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%)",
                        }}
                    >
                        <div
                            className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 85% 50%, #60a5fa 0%, transparent 55%)",
                            }}
                        />
                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base lg:text-lg font-bold text-white">
                                    Besoin d'agrandir l'equipe medicale ?
                                </h3>
                                <p className="text-blue-200 text-sm mt-1">
                                    Integrez facilement medecins, sages-femmes
                                    et personnel administratif dans le HIS.
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    onNavigate?.("Ajouter un personnel")
                                }
                                className="shrink-0 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-blue-900/40 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
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
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Ajouter un personnel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════
// Dashboard — Shell : Sidebar + Topbar + contenu
// ════════════════════════════════════════════════════════════════════
export default function Dashboard({ onLogout }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeNav, setActiveNav] = useState("Dashboard");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dark, setDark] = useState(
        () =>
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
    const [notifRefresh, setNotifRefresh] = useState(0);
    const refreshNotifications = () => setNotifRefresh((prev) => prev + 1);

    // [AJOUTÉ] Écouteur pour les changements de thème du système
    useEffect(() => {
        if (!window.matchMedia) return;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => setDark(e.matches);

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        } else {
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, []);

    const T = {
        pageBg: dark ? "bg-[#0a0f1e]" : "bg-slate-50",
        headerBg: dark
            ? "bg-[#0a0f1e]/80 border-white/5"
            : "bg-white/80 border-slate-200",
        iconBtn: dark
            ? "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
            : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200",
        cardBg: dark
            ? "bg-white/5 border-white/10"
            : "bg-white border-slate-200 shadow-sm",
        cardTitle: dark ? "text-white" : "text-slate-800",
        cardSub: dark ? "text-slate-500" : "text-slate-400",
        greetTitle: dark ? "text-white" : "text-slate-800",
        greetSub: dark ? "text-slate-400" : "text-slate-500",
    };

    const renderPage = () => {
        switch (activeNav) {
            case "Répertoire du personnel":
                return (
                    <PersonnelDirectory
                        dark={dark}
                        onNavigate={setActiveNav}
                        refreshNotifications={refreshNotifications}
                    />
                );
            case "Ajouter un personnel":
                return (
                    <AddPersonnel
                        dark={dark}
                        onAnnuler={() =>
                            setActiveNav("Répertoire du personnel")
                        }
                        refreshNotifications={refreshNotifications}
                    />
                );
            // ── [AJOUTÉ] Liaison avec StructureHospitaliere (déjà importé ligne 6)
            case "Structure hospitalière":
                return <StructureHospitaliere dark={dark} />;
            // ── [AJOUTÉ] Liaison avec SecurityCredentials (déjà importé ligne 7)
            case "Sécurité & Credentials":
                return (
                    <SecurityCredentials
                        dark={dark}
                        onNavigate={setActiveNav}
                    />
                );
            // [AJOUTÉ] Page archives
            case "Archives":
                return <ArchivePage dark={dark} />;
            case "Avancements":
                return (
                    <Avancements
                        dark={dark}
                        refreshNotifications={refreshNotifications}
                    />
                );
            case "Audit Logs":
                return <AuditLogsPage dark={dark} />;
            case "Dashboard":
            default:
                return (
                    <DashboardHome
                        dark={dark}
                        T={T}
                        onNavigate={setActiveNav}
                        onLogout={onLogout}
                    />
                );
        }
    };

    return (
        <div
            className={`min-h-screen font-sans flex transition-colors duration-300 ${T.pageBg}`}
        >
            <Sidebar
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                onCollapse={setSidebarCollapsed}
                dark={dark}
                onLogout={onLogout}
            />

            <main
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
                ${sidebarCollapsed ? "lg:ml-17" : "lg:ml-64"}`}
            >
                {/* Topbar sticky */}
                <header
                    className={`sticky top-0 z-10 backdrop-blur-md border-b px-4 lg:px-6 py-3 flex items-center gap-3 transition-colors duration-300 ${T.headerBg}`}
                >
                    <button
                        className={`lg:hidden transition-colors ${dark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"}`}
                        onClick={() => setMobileOpen(true)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>

                    <span
                        className={`text-sm font-semibold lg:hidden truncate ${dark ? "text-white" : "text-slate-800"}`}
                    >
                        {activeNav}
                    </span>

                    <div className="flex items-center gap-2 ml-auto">
                        <ToggleMode
                            dark={dark}
                            onToggle={() => setDark((d) => !d)}
                        />

                        <NotificationMenu
                            dark={dark}
                            onNavigate={setActiveNav}
                            refreshKey={notifRefresh}
                        />

                        <SettingsMenu
                            dark={dark}
                            onNavigate={setActiveNav}
                            onLogout={onLogout}
                        />
                    </div>
                </header>

                {renderPage()}
            </main>
        </div>
    );
}
