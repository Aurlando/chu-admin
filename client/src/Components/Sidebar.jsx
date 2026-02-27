import { useState } from "react";

// ════════════════════════════════════════════════════
// Sidebar.jsx — Barre de navigation latérale fixe
// Props reçues :
//   - activeNav / setActiveNav : page active
//   - mobileOpen / setMobileOpen : ouverture mobile
//   - onCollapse : informe Dashboard de l'état réduit/étendu
//   - dark : thème sombre ou clair
//   - onLogout : fonction de déconnexion venant de Dashboard
//     → qui vient elle-même de App.jsx (voir App.jsx → handleLogout)
// ════════════════════════════════════════════════════

const navItems = [
  {
    label: "Dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
];

// Icône déconnexion (SVG inline pour éviter une dépendance)
function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

export default function Sidebar({ activeNav, setActiveNav, mobileOpen, setMobileOpen, onCollapse, dark, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapse = (val) => {
    setCollapsed(val);
    if (onCollapse) onCollapse(val);
  };

  // ── Tokens de thème : classes Tailwind selon dark/light
  const bg         = dark ? "bg-[#0d1526] border-white/5"  : "bg-white border-slate-200";
  const logoText   = dark ? "text-white"                   : "text-slate-800";
  const logoSub    = dark ? "text-slate-500"               : "text-slate-400";
  const navActive  = dark ? "bg-blue-600/20 text-blue-400 border-blue-500/20"       : "bg-blue-50 text-blue-600 border-blue-200";
  const navInactive= dark ? "text-slate-400 hover:text-white hover:bg-white/5 border-transparent" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent";
  const userBg     = dark ? "bg-white/5"                   : "bg-slate-100";
  const userName   = dark ? "text-white"                   : "text-slate-800";
  const userSub    = dark ? "text-slate-500"               : "text-slate-400";
  const toggleBtn  = dark ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-800";
  const expandBtn  = dark ? "bg-[#0d1526] border-white/10 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:text-slate-800";

  return (
    <>
      {/* Overlay sombre (mobile) — clique dessus pour fermer le menu */}
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
          ${collapsed ? "w-[68px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ── En-tête logo ── */}
        <div className={`relative flex items-center border-b h-[57px] ${dark ? "border-white/5" : "border-slate-200"} ${collapsed ? "justify-center px-3" : "justify-between px-4"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20 text-white">
              H
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className={`text-sm font-bold whitespace-nowrap ${logoText}`}>HIS Admin</div>
                <div className={`text-[10px] whitespace-nowrap ${logoSub}`}>Système Hospitalier</div>
              </div>
            )}
          </div>

          {/* Bouton réduire (desktop) */}
          {!collapsed ? (
            <button onClick={() => handleCollapse(true)} className={`hidden lg:flex w-7 h-7 rounded-lg border items-center justify-center transition-all flex-shrink-0 ${toggleBtn}`} title="Réduire le menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <button onClick={() => handleCollapse(false)} className={`hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border items-center justify-center transition-all shadow-md ${expandBtn}`} title="Agrandir le menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = activeNav === item.label;
            return (
              <button
                key={item.label}
                onClick={() => { setActiveNav(item.label); setMobileOpen(false); }}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full flex items-center rounded-xl text-sm transition-all duration-200 text-left border
                  ${collapsed ? "justify-center px-0 py-3 gap-0" : "gap-3 px-3 py-2.5"}
                  ${isActive ? navActive : navInactive}
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="leading-none truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* ── Footer utilisateur + Déconnexion ── */}
        <div className={`border-t ${dark ? "border-white/5" : "border-slate-200"} ${collapsed ? "p-2 flex flex-col items-center gap-2" : "p-3 space-y-2"}`}>

          {!collapsed ? (
            <>
              {/* Infos utilisateur */}
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${userBg}`}>
                <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium truncate ${userName}`}>Administrateur</div>
                  <div className={`text-[10px] truncate ${userSub}`}>CHU Anosiala</div>
                </div>
              </div>

              {/* ── Bouton Déconnexion — stylisé ── */}
              {/* onLogout vient de Dashboard → App → handleLogout */}
              <button
                onClick={onLogout}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 border group
                  ${dark
                    ? "text-slate-400 border-transparent hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
                    : "text-slate-500 border-transparent hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                  }
                `}
              >
                <span className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                  <LogoutIcon />
                </span>
                <span>Se déconnecter</span>
              </button>
            </>
          ) : (
            /* Mode réduit : avatar + bouton déco compacts */
            <>
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white cursor-default"
                title="Administrateur — CHU Anosiala"
              >
                A
              </div>
              <button
                onClick={onLogout}
                title="Se déconnecter"
                className={`w-8 h-8 flex items-center justify-center transition-colors rounded-lg ${
                  dark ? "text-slate-500 hover:text-rose-400 hover:bg-rose-500/10" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                }`}
              >
                <LogoutIcon />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}