import { useState, useEffect } from "react";
import Sidebar from "./SideBar";

const API_URL = "http://localhost:3000/dashboard";

const auditLogs = [
  {
    id: 1,
    message: "Nouveau médecin enregistré",
    detail: "Dr. Rakoto • Service CHIR",
    time: "Il y a 3 min",
    darkColor: "text-emerald-400",
    darkBg: "bg-emerald-400/10",
    lightColor: "text-emerald-600",
    lightBg: "bg-emerald-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    id: 2,
    message: "Mise à jour des credentials",
    detail: "Dr. Andriamanga • ATU",
    time: "Il y a 1h",
    darkColor: "text-blue-400",
    darkBg: "bg-blue-400/10",
    lightColor: "text-blue-600",
    lightBg: "bg-blue-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    id: 3,
    message: "Audit log consulté",
    detail: "Admin James Miller",
    time: "Il y a 3h",
    darkColor: "text-amber-400",
    darkBg: "bg-amber-400/10",
    lightColor: "text-amber-600",
    lightBg: "bg-amber-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 4,
    message: "Sage-femme ajoutée",
    detail: "Mme. Rasoa • Service BE",
    time: "Hier, 16h45",
    darkColor: "text-purple-400",
    darkBg: "bg-purple-400/10",
    lightColor: "text-purple-600",
    lightBg: "bg-purple-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 5,
    message: "Service REA mis à jour",
    detail: "Modification effectif",
    time: "Hier, 09h20",
    darkColor: "text-cyan-400",
    darkBg: "bg-cyan-400/10",
    lightColor: "text-cyan-600",
    lightBg: "bg-cyan-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

// ─────────────────────────────────────────
// Toggle bouton jour / nuit
// ─────────────────────────────────────────
function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? "Passer en mode jour" : "Passer en mode nuit"}
      className={`
        relative w-[52px] h-7 rounded-full border transition-all duration-300 flex items-center
        ${dark
          ? "bg-slate-700 border-white/10"
          : "bg-slate-200 border-slate-300"
        }
      `}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 text-[11px] select-none">🌙</span>
      <span className="absolute right-1.5 text-[11px] select-none">☀️</span>
      {/* Thumb */}
      <span
        className={`
          absolute w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-[10px]
          ${dark
            ? "translate-x-1 bg-slate-900 text-white"
            : "translate-x-[26px] bg-white text-yellow-500"
          }
        `}
      >
        {dark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────
function StatCard({ icon, label, value, trend, color, dark }) {
  const isPositive = trend >= 0;
  return (
    <div className={`
      relative group overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5
      ${dark
        ? "bg-white/5 border-white/10 hover:border-white/20"
        : "bg-white border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-md"
      }
    `}>
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 80% 20%, ${color}15, transparent 60%)` }}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? "text-emerald-500 bg-emerald-50" : "text-rose-500 bg-rose-50"}`}>
          {isPositive ? "+" : ""}{trend}%
        </span>
      </div>
      <div className={`text-3xl font-bold font-mono tracking-tight ${dark ? "text-white" : "text-slate-800"}`}>{value}</div>
      <div className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────
// Bar Chart
// ─────────────────────────────────────────
function BarChart({ data, dark }) {
  const max = Math.max(...data.map((d) => parseInt(d.id_medecin)));
  return (
    <div className="flex items-end gap-1.5 h-40 w-full">
      {data.map((item, i) => {
        const height = max > 0 ? (parseInt(item.id_medecin) / max) * 100 : 5;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
            <div className="relative w-full flex items-end justify-center" style={{ height: "120px" }}>
              <div
                className="w-full rounded-t-lg transition-all duration-500 relative overflow-hidden cursor-pointer"
                style={{
                  height: `${Math.max(height, 5)}%`,
                  background: dark
                    ? "linear-gradient(180deg, #60a5fa, #3b82f6)"
                    : "linear-gradient(180deg, #93c5fd, #2563eb)",
                  opacity: parseInt(item.id_medecin) === 0 ? 0.2 : 0.85,
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: dark ? "linear-gradient(180deg, #93c5fd, #60a5fa)" : "linear-gradient(180deg, #bfdbfe, #3b82f6)" }} />
              </div>
              <div className={`
                absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded
                opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border z-10
                ${dark ? "bg-slate-800 text-white border-white/10" : "bg-slate-800 text-white border-slate-700"}
              `}>
                {item.id_medecin} médecin{parseInt(item.id_medecin) > 1 ? "s" : ""}
              </div>
            </div>
            <span className={`text-[9px] group-hover:text-blue-500 transition-colors text-center leading-tight font-medium ${dark ? "text-slate-500" : "text-slate-400"}`}>
              {item.code_service}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// Dashboard principal
// ─────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => { if (!res.ok) throw new Error("Erreur réseau"); return res.json(); })
      .then((json) => { setData(json.data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  // Tokens thème
  const T = {
    pageBg:     dark ? "bg-[#0a0f1e]" : "bg-slate-50",
    headerBg:   dark ? "bg-[#0a0f1e]/80 border-white/5" : "bg-white/80 border-slate-200",
    searchBg:   dark ? "bg-white/5 border-white/10 text-slate-500 hover:border-white/20" : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300",
    iconBtn:    dark ? "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200",
    cardBg:     dark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm",
    cardTitle:  dark ? "text-white" : "text-slate-800",
    cardSub:    dark ? "text-slate-500" : "text-slate-400",
    greetTitle: dark ? "text-white" : "text-slate-800",
    greetSub:   dark ? "text-slate-400" : "text-slate-500",
    logBtnBorder: dark ? "border-blue-500/20 hover:border-blue-400/30 text-blue-400 hover:text-blue-300" : "border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700",
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${T.pageBg}`}>

      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onCollapse={setSidebarCollapsed}
        dark={dark}
      />

      {/* Main */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? "lg:ml-[68px]" : "lg:ml-64"}`}>

        {/* Topbar */}
        <header className={`sticky top-0 z-10 backdrop-blur-md border-b px-4 lg:px-6 py-3 flex items-center gap-4 transition-colors duration-300 ${T.headerBg}`}>
          {/* Burger mobile */}
          <button
            className={`lg:hidden transition-colors ${dark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"}`}
            onClick={() => setMobileOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 text-sm cursor-text transition-colors ${T.searchBg}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Rechercher du personnel, services...</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">

            {/* ── TOGGLE THÈME ── */}
            <ThemeToggle dark={dark} onToggle={() => setDark(!dark)} />

            {/* Notif */}
            <button className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${T.iconBtn}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </button>

            {/* Settings */}
            <button className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${T.iconBtn}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">

          {/* Greeting */}
          <div className="mb-6">
            <h1 className={`text-2xl lg:text-3xl font-bold ${T.greetTitle}`}>{greeting}, Admin 👋</h1>
            <p className={`text-sm mt-1 ${T.greetSub}`}>Voici un résumé du statut du personnel hospitalier.</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-500 text-sm flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Erreur de connexion à l'API : {error}
            </div>
          )}

          {data && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
                <StatCard dark={dark}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20H7a4 4 0 01-4-4v0a4 4 0 014-4h10a4 4 0 014 4v0a4 4 0 01-4 4zM12 3a4 4 0 110 8 4 4 0 010-8z" /></svg>}
                  label="Total Personnel" value={data.summary.total_staff} trend={2.5} color="#3b82f6"
                />
                <StatCard dark={dark}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" /></svg>}
                  label="Médecins actifs" value={data.summary.total_medecin} trend={-1.2} color="#ef4444"
                />
                <StatCard dark={dark}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                  label="Sages-femmes" value={data.summary.total_sage_femme} trend={4.8} color="#10b981"
                />
                <StatCard dark={dark}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  label="Administratifs" value={data.summary.total_admin} trend={0.5} color="#8b5cf6"
                />
              </div>

              {/* Chart + Audit */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">

                {/* Bar Chart */}
                <div className={`xl:col-span-2 border rounded-2xl p-5 transition-colors duration-300 ${T.cardBg}`}>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h2 className={`text-base font-semibold ${T.cardTitle}`}>Distribution du Personnel</h2>
                      <p className={`text-xs mt-0.5 ${T.cardSub}`}>Médecins par service</p>
                    </div>
                    <select className={`text-xs border rounded-lg px-2.5 py-1.5 outline-none cursor-pointer transition-colors ${dark ? "bg-white/5 border-white/10 text-slate-400 hover:border-white/20" : "bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                      <option>Trimestre actuel</option>
                      <option>Mois actuel</option>
                      <option>Année</option>
                    </select>
                  </div>
                  <BarChart data={data.distribution} dark={dark} />
                </div>

                {/* Audit Logs */}
                <div className={`border rounded-2xl p-5 transition-colors duration-300 ${T.cardBg}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className={`text-base font-semibold ${T.cardTitle}`}>Activité système</h2>
                      <p className={`text-xs mt-0.5 ${T.cardSub}`}>Logs récents</p>
                    </div>
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                  </div>
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${dark ? `${log.darkBg} ${log.darkColor}` : `${log.lightBg} ${log.lightColor}`}`}>
                          {log.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium leading-tight ${T.cardTitle}`}>{log.message}</div>
                          <div className={`text-[10px] mt-0.5 ${T.cardSub}`}>{log.detail}</div>
                          <div className={`text-[10px] font-medium mt-0.5 ${dark ? log.darkColor : log.lightColor}`}>{log.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className={`mt-4 w-full text-xs border rounded-xl py-2 transition-all ${T.logBtnBorder}`}>
                    Voir tous les logs →
                  </button>
                </div>
              </div>

              {/* CTA Banner */}
              <div
                className="relative overflow-hidden rounded-2xl p-5 lg:p-6"
                style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)" }}
              >
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #60a5fa 0%, transparent 50%)" }} />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Besoin d'agrandir l'équipe médicale ?</h3>
                    <p className="text-blue-200 text-sm mt-1">Intégrez facilement médecins, sages-femmes et personnel administratif dans le HIS.</p>
                  </div>
                  <button className="flex-shrink-0 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-blue-900/40 hover:-translate-y-0.5 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un personnel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}