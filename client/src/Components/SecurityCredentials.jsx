import { useState, useEffect, useCallback, useRef } from "react";

// ── À adapter selon ton backend
const API_BASE = "http://localhost:3000";
const PER_PAGE = 8;

const AVATAR_COLORS = [
  "#2563eb","#7c3aed","#059669","#d97706","#e11d48",
  "#0891b2","#65a30d","#9333ea","#0284c7","#c2410c",
  "#0f766e","#b45309","#4f46e5","#be185d","#1d4ed8",
];
const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const initials    = (nom = "", prenoms = "") =>
  ((nom[0] || "") + (prenoms[0] || "")).toUpperCase();

// ════════════════════════════════════
// Spinner
// ════════════════════════════════════
function Spinner({ dark }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className={`w-7 h-7 border-2 border-t-blue-500 rounded-full animate-spin
        ${dark ? "border-white/8" : "border-slate-200"}`} />
    </div>
  );
}

// ════════════════════════════════════
// ErrorAlert
// ════════════════════════════════════
function ErrorAlert({ message, onRetry, dark }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm mb-4
      ${dark ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
             : "bg-rose-50 border-rose-200 text-rose-700"}`}>
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="underline font-semibold text-xs cursor-pointer">
          Réessayer
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════
// StatCard
// ════════════════════════════════════
function StatCard({ icon, value, label, colorClass, bgClass, dark }) {
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 transition-all
      hover:shadow-md hover:-translate-y-0.5
      ${dark ? "bg-[#0d1526] border-white/6" : "bg-white border-slate-200 shadow-sm"}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold tracking-tight ${colorClass}`}>{value}</div>
        <div className={`text-[11px] font-semibold uppercase tracking-wide mt-0.5
          ${dark ? "text-slate-500" : "text-slate-400"}`}>{label}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// RevealModal
// ════════════════════════════════════
function RevealModal({ open, onClose, staff, dark }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !staff) return null;

  const modal    = dark ? "bg-[#0c1424] border border-white/8" : "bg-white border border-slate-200";
  const hdBorder = dark ? "border-white/6"  : "border-slate-100";
  const ttl      = dark ? "text-white"      : "text-slate-800";
  const sub      = dark ? "text-slate-400"  : "text-slate-500";
  const valBox   = dark
    ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
    : "bg-blue-50 border border-blue-200 text-blue-700";
  const closeBtn = dark
    ? "border-white/10 text-slate-400 hover:bg-white/8 hover:text-white"
    : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,10,25,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${modal}`}
        style={{ animation: "modalIn .22s cubic-bezier(.34,1.56,.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre amber */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-amber-500 to-amber-400" />

        {/* En-tête */}
        <div className={`px-6 pt-6 pb-5 border-b ${hdBorder}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4
            ${dark ? "bg-amber-500/15" : "bg-amber-50"}`}>
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <h3 className={`text-[15px] font-bold ${ttl}`}>{staff.nom} {staff.prenoms}</h3>
          <p className={`text-xs mt-1 ${sub}`}>{staff.fonction}</p>
        </div>

        {/* Corps */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${sub}`}>Identifiant</p>
            <div className={`px-4 py-3 rounded-xl font-mono text-sm font-semibold tracking-wide ${valBox}`}>
              {staff.username}
            </div>
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${sub}`}>Mot de passe</p>
            <div className={`px-4 py-3 rounded-xl font-mono text-sm font-semibold tracking-wide break-all ${valBox}`}>
              {staff.password}
            </div>
          </div>
          {/* Avertissement */}
          <div className={`flex gap-2.5 px-3.5 py-3 rounded-xl border text-xs leading-relaxed
            ${dark ? "bg-amber-500/8 border-amber-500/15 text-amber-400"
                   : "bg-amber-50 border-amber-200 text-amber-800"}`}>
            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            Ne partagez jamais ces informations par messagerie non sécurisée. Fermez cette fenêtre dès que possible.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end">
          <button onClick={onClose}
            className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${closeBtn}`}>
            Fermer
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:scale(.93) translateY(14px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
export default function SecurityCredentials({ dark }) {
  const token = localStorage.getItem("token");

  const [staff,     setStaff]     = useState([]);
  const [total,     setTotal]     = useState(0);
  const [stats,     setStats]     = useState({ actifs: 0, reveals24h: 0, encryption: "AES-256" });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState({ open: false, staff: null });
  const [revealing, setRevealing] = useState(null);
  const [toast,     setToast]     = useState({ show: false, msg: "" });

  const searchTimer = useRef(null);
  const toastTimer  = useRef(null);

  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ show: true, msg });
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: "" }), 3200);
  };

  // ── GET /staff/credentials?page=X&limit=8&search=Y
  const fetchStaff = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page, limit: PER_PAGE });
    if (search) params.set("search", search);

    fetch(`${API_BASE}/staff/credentials?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.json(); })
      .then((json) => {
        // Adapte selon la structure de ton API :
        // json.data.staff, json.data.total, json.data.stats
        setStaff(json.data?.staff  ?? json.data  ?? []);
        setTotal(json.data?.total  ?? json.total ?? 0);
        setStats(json.data?.stats  ?? { actifs: 0, reveals24h: 0, encryption: "AES-256" });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search, token]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  // Debounce recherche 400ms
  const handleSearch = (val) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 400);
  };

  // ── GET /staff/:id/credential → révèle le credential
  const handleReveal = (member) => {
    setRevealing(member.id);
    fetch(`${API_BASE}/staff/${member.id}/credential`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.json(); })
      .then((json) => {
        const cred = json.data ?? json;
        setModal({
          open: true,
          staff: {
            ...member,
            username: cred.username ?? member.username,
            password: cred.password ?? cred.mot_de_passe ?? "—",
          },
        });
        showToast(`Accès journalisé — ${member.nom} ${member.prenoms}`);
      })
      .catch((err) => showToast(`Erreur : ${err.message}`))
      .finally(() => setRevealing(null));
  };

  // Pagination
  const totalPages  = Math.max(1, Math.ceil(total / PER_PAGE));
  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });
  const startIdx = (page - 1) * PER_PAGE + 1;
  const endIdx   = Math.min(page * PER_PAGE, total);

  // Tokens thème
  const bg       = dark ? "bg-[#0a0f1e]"                : "bg-slate-50";
  const card     = dark ? "bg-[#0d1526] border-white/6" : "bg-white border-slate-200 shadow-sm";
  const ttl      = dark ? "text-white"                  : "text-slate-800";
  const sub      = dark ? "text-slate-400"              : "text-slate-500";
  const border   = dark ? "border-white/6"              : "border-slate-100";
  const thCls    = dark
    ? "px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-600 bg-white/2 border-b border-white/5 whitespace-nowrap"
    : "px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100 whitespace-nowrap";
  const tdCls    = dark ? "px-5 py-[14px] border-b border-white/4" : "px-5 py-[14px] border-b border-slate-100";
  const trHover  = dark ? "hover:bg-white/3" : "hover:bg-blue-50/30";
  const inputCls = dark
    ? "bg-white/5 border-white/10 text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/8"
    : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-300 focus:bg-white";
  const iconBtn  = dark
    ? "border-white/10 text-slate-500 hover:bg-white/8 hover:text-slate-300"
    : "border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600";
  const pgBtn    = dark
    ? "border-white/10 text-slate-400 hover:bg-white/8"
    : "border-slate-200 text-slate-500 hover:bg-slate-100";

  return (
    <div className={`flex-1 overflow-auto ${bg}`}>

      {/* Modal reveal */}
      <RevealModal open={modal.open} onClose={() => setModal({ open: false, staff: null })}
        staff={modal.staff} dark={dark} />

      {/* Toast */}
      <div className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl
        shadow-2xl text-sm font-medium transition-all duration-300
        ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}
        ${dark ? "bg-[#0d1526] border border-white/10 text-slate-200" : "bg-slate-800 text-white"}`}>
        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        {toast.msg}
      </div>

      <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">

        {/* ══ EN-TÊTE ══ */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className={`text-[22px] font-extrabold tracking-tight ${ttl}`}>
              Sécurité &amp; Credentials
            </h1>
            <p className={`text-sm mt-1 max-w-lg leading-relaxed ${sub}`}>
              Accès aux identifiants du personnel. Toute consultation est enregistrée
              et signalée au responsable sécurité.
            </p>
          </div>
          <button
            onClick={() => showToast("Redirection vers Audit Logs…")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              border transition-all cursor-pointer
              ${dark
                ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Voir Audit Logs
          </button>
        </div>

        {/* ══ BANNIÈRE SÉCURITÉ ══ */}
        <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-[12.5px] leading-relaxed
          ${dark ? "bg-amber-500/8 border-amber-500/15 text-amber-400"
                 : "bg-amber-50 border-amber-200 text-amber-800"}`}>
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span>
            <strong>Zone sensible</strong> — Chaque révélation de mot de passe est journalisée
            avec l'horodatage, l'adresse IP et l'identifiant de l'administrateur connecté.
          </span>
        </div>

        {/* ══ STAT CARDS ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard dark={dark} value={stats.actifs || total || "—"} label="Comptes actifs"
            colorClass={dark ? "text-blue-400" : "text-blue-600"}
            bgClass={dark ? "bg-blue-500/15" : "bg-blue-50"}
            icon={<svg className={`w-5 h-5 ${dark ? "text-blue-400" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>}
          />
          <StatCard dark={dark} value={stats.reveals24h ?? "—"} label="Révélations (24h)"
            colorClass={dark ? "text-amber-400" : "text-amber-600"}
            bgClass={dark ? "bg-amber-500/15" : "bg-amber-50"}
            icon={<svg className={`w-5 h-5 ${dark ? "text-amber-400" : "text-amber-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>}
          />
          <StatCard dark={dark} value={stats.encryption ?? "AES-256"} label="Chiffrement actif"
            colorClass={dark ? "text-emerald-400" : "text-emerald-600"}
            bgClass={dark ? "bg-emerald-500/15" : "bg-emerald-50"}
            icon={<svg className={`w-5 h-5 ${dark ? "text-emerald-400" : "text-emerald-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>}
          />
        </div>

        {/* ══ TABLE CARD ══ */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>

          {/* Toolbar */}
          <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${border}`}>
            <div className="relative flex-1">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Filtrer par nom, rôle ou identifiant…"
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none
                  transition-all font-[inherit] ${inputCls}`}
              />
            </div>
            <button onClick={() => showToast("Export déclenché")}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center
                shrink-0 transition-all cursor-pointer ${iconBtn}`} title="Exporter">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <div className="px-5 pt-4">
              <ErrorAlert message={`Impossible de charger : ${error}`} onRetry={fetchStaff} dark={dark} />
            </div>
          )}

          {loading && <Spinner dark={dark} />}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className={`${thCls} text-left`}>Membre du personnel</th>
                    <th className={`${thCls} text-left`}>Identifiant</th>
                    <th className={`${thCls} text-left`}>Mot de passe</th>
                    <th className={`${thCls} text-left`}>Statut</th>
                    <th className={`${thCls} text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length ? staff.map((p) => (
                    <tr key={p.id} className={`transition-colors ${trHover}`}>
                      {/* Membre */}
                      <td className={tdCls}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center
                            text-[11px] font-bold text-white shrink-0"
                            style={{ background: avatarColor(p.id) }}>
                            {initials(p.nom, p.prenoms)}
                          </div>
                          <div>
                            <p className={`font-semibold text-[13px] ${ttl}`}>{p.nom} {p.prenoms}</p>
                            <p className={`text-[11px] mt-0.5 ${sub}`}>{p.fonction}</p>
                          </div>
                        </div>
                      </td>
                      {/* Identifiant */}
                      <td className={tdCls}>
                        <span className={`font-mono text-[12.5px] ${sub}`}>{p.username}</span>
                      </td>
                      {/* Mot de passe masqué */}
                      <td className={tdCls}>
                        <span className={`font-mono text-lg tracking-[4px] leading-none
                          ${dark ? "text-white/20" : "text-slate-300"}`}>
                          ••••••••
                        </span>
                      </td>
                      {/* Statut */}
                      <td className={tdCls}>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                          text-[10.5px] font-bold border
                          ${(p.statut === "En activité" || p.statut === "Actif")
                            ? dark
                              ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/20"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : dark
                              ? "bg-white/4 text-slate-500 border-white/8"
                              : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {p.statut ?? "—"}
                        </span>
                      </td>
                      {/* Bouton Révéler */}
                      <td className={`${tdCls} text-right`}>
                        <button
                          onClick={() => handleReveal(p)}
                          disabled={revealing === p.id}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl
                            text-xs font-bold text-white bg-blue-600 hover:bg-blue-500
                            border border-blue-600 transition-all cursor-pointer
                            hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {revealing === p.id ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                              </svg>
                              Chargement…
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                              Révéler
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className={`px-5 py-16 text-center text-sm ${sub}`}>
                        Aucun résultat trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && total > 0 && (
            <div className={`flex items-center justify-between px-5 py-3.5 border-t ${border}`}>
              <p className={`text-xs font-medium ${sub}`}>
                Affichage de {startIdx}–{endIdx} sur {total} comptes
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                    disabled:opacity-30 disabled:cursor-not-allowed ${pgBtn}`}>
                  ← Préc.
                </button>
                {pageNumbers.map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer
                      ${n === page
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                        : pgBtn}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                    disabled:opacity-30 disabled:cursor-not-allowed ${pgBtn}`}>
                  Suiv. →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}