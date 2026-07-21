import { useState } from "react";
import "../App.css";

const navItems = [
    {
        label: "Dashboard",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6 cursor-pointer" />
            </svg>
        ),
    },
    {
        label: "Répertoire du personnel",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20H7a4 4 0 01-4-4v0a4 4 0 014-4h10a4 4 0 014 4v0a4 4 0 01-4 4zM12 3a4 4 0 110 8 4 4 0 010-8z" />
            </svg>
        ),
    },
    {
        label: "Ajouter un personnel",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
        ),
    },
    {
        label: "Structure hospitalière",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
    {
        label: "Sécurité & Credentials",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
    },
    {
        label: "Audit Logs",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        label: "Avancements",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
    },
];

function LogoutIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    );
}

export default function Sidebar({
    activeNav,
    setActiveNav,
    mobileOpen,
    setMobileOpen,
    onCollapse,
    dark,
    onLogout,
}) {
    const [collapsed, setCollapsed] = useState(false);

    const handleCollapse = (val) => {
        setCollapsed(val);
        if (onCollapse) onCollapse(val);
    };

    const bg = dark ? "bg-[#0d1526] border-white/5" : "bg-white border-slate-200";
    const logoText = dark ? "text-white" : "text-slate-800";
    const logoSub = dark ? "text-slate-500" : "text-slate-400";
    const navActive = dark ? "bg-blue-600/20 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200";
    const navInactive = dark ? "text-slate-400 hover:text-white hover:bg-white/5 border-transparent" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent";
    const userBg = dark ? "bg-white/5" : "bg-slate-100";
    const userName = dark ? "text-white" : "text-slate-800";
    const userSub = dark ? "text-slate-500" : "text-slate-400";
    const toggleBtn = dark ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-800";
    const expandBtn = dark ? "bg-[#0d1526] border-white/10 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:text-slate-800";

    const tooltipStyle = `hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-xl z-50 pointer-events-none items-center transition-all ${
        dark ? "bg-white text-slate-900 border border-slate-200" : "bg-slate-900 text-white"
    }`;
    const arrowStyle = `absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 ${
        dark ? "bg-white border-l border-b border-slate-200" : "bg-slate-900"
    }`;

    // NOUVEAU : Classes d'accentuation rouge pour le bouton de déconnexion
    const logoutBtnStyle = dark
        ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40"
        : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 hover:border-rose-300";

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-full z-30 border-r flex flex-col
          transition-all duration-300 ease-in-out
          ${bg}
          w-64 ${collapsed ? "lg:w-17" : ""}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                {/* ── En-tête logo ── */}
                <div
                    className={`relative flex items-center border-b h-14.25 ${dark ? "border-white/5" : "border-slate-200"} justify-between px-4 ${collapsed ? "lg:justify-center lg:px-3" : ""}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative group flex items-center">
                            <div className="w-9 h-9 shrink-0 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20 text-white">
                                H
                            </div>
                            {collapsed && (
                                <div className={tooltipStyle}>
                                    <div className={arrowStyle} />
                                    <span className="relative z-10">HIS Admin</span>
                                </div>
                            )}
                        </div>

                        <div className={`min-w-0 overflow-hidden ${collapsed ? "lg:hidden" : ""}`}>
                            <div className={`text-sm font-bold whitespace-nowrap ${logoText}`}>
                                HIS Admin
                            </div>
                            <div className={`text-[10px] whitespace-nowrap ${logoSub}`}>
                                Système Hospitalier
                            </div>
                        </div>
                    </div>

                    {!collapsed ? (
                        <button
                            onClick={() => handleCollapse(true)}
                            className={`hidden lg:flex w-7 h-7 rounded-lg border items-center justify-center transition-all shrink-0 cursor-pointer ${toggleBtn}`}
                            title="Réduire le menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={() => handleCollapse(false)}
                            className={`hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border items-center justify-center transition-all shadow-md cursor-pointer ${expandBtn}`}
                            title="Agrandir le menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* ── Navigation principale ── */}
                <nav className={`flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden ${collapsed ? "lg:overflow-visible" : ""}`}>
                    {navItems.map((item) => {
                        const isActive = activeNav === item.label;
                        return (
                            <button
                                key={item.label}
                                onClick={() => {
                                    setActiveNav(item.label);
                                    setMobileOpen(false);
                                }}
                                className={`
                  group relative w-full flex items-center rounded-xl text-sm transition-all duration-200 text-left border cursor-pointer
                  gap-3 px-3 py-2.5 ${collapsed ? "lg:justify-center lg:px-0 lg:py-3 lg:gap-0" : ""}
                  ${isActive ? navActive : navInactive}
                `}
                            >
                                <span className="shrink-0">{item.icon}</span>

                                <span className={`leading-none truncate ${collapsed ? "lg:hidden" : ""}`}>
                                    {item.label}
                                </span>

                                {collapsed && (
                                    <div className={tooltipStyle}>
                                        <div className={arrowStyle} />
                                        <span className="relative z-10">{item.label}</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* ── Footer : Mode complet avec bouton de déconnexion rouge ── */}
                <div
                    className={`border-t ${dark ? "border-white/5" : "border-slate-200"} p-3 space-y-2 ${collapsed ? "lg:hidden" : ""}`}
                >
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${userBg}`}>
                        <div className="w-7 h-7 shrink-0 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium truncate ${userName}`}>
                                Administrateur
                            </div>
                            <div className={`text-[10px] truncate ${userSub}`}>
                                CHU Anosiala
                            </div>
                        </div>
                    </div>

                    {/* Bouton de déconnexion stylisé en rouge */}
                    <button
                        onClick={onLogout}
                        className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 border group cursor-pointer ${logoutBtnStyle}
            `}
                    >
                        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                            <LogoutIcon />
                        </span>
                        <span>Se déconnecter</span>
                    </button>
                </div>

                {/* ── Footer : Mode compact avec icône déconnexion rouge ── */}
                <div
                    className={`border-t ${dark ? "border-white/5" : "border-slate-200"} p-2 flex-col items-center gap-2 hidden ${collapsed ? "lg:flex" : "lg:hidden"}`}
                >
                    <div className="relative group flex items-center">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white cursor-default">
                            A
                        </div>
                        <div className={tooltipStyle}>
                            <div className={arrowStyle} />
                            <span className="relative z-10">Administrateur — CHU Anosiala</span>
                        </div>
                    </div>

                    <div className="relative group flex items-center">
                        <button
                            onClick={onLogout}
                            className={`w-8 h-8 flex items-center justify-center transition-all border rounded-lg cursor-pointer ${logoutBtnStyle}`}
                        >
                            <LogoutIcon />
                        </button>
                        <div className={tooltipStyle}>
                            <div className={arrowStyle} />
                            <span className="relative z-10">Se déconnecter</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}