import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:3000/structure";

// ── Palette couleurs par groupe (index cyclique)
const GROUP_PALETTE = [
  { dot: "bg-violet-500",  dark: "bg-violet-500/12 text-violet-400 border-violet-500/20",  light: "bg-violet-50 text-violet-700 border-violet-200"   },
  { dot: "bg-blue-500",    dark: "bg-blue-500/12 text-blue-400 border-blue-500/20",         light: "bg-blue-50 text-blue-700 border-blue-200"          },
  { dot: "bg-emerald-500", dark: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",light: "bg-emerald-50 text-emerald-700 border-emerald-200"  },
  { dot: "bg-rose-500",    dark: "bg-rose-500/12 text-rose-400 border-rose-500/20",         light: "bg-rose-50 text-rose-700 border-rose-200"          },
  { dot: "bg-amber-500",   dark: "bg-amber-500/12 text-amber-400 border-amber-500/20",      light: "bg-amber-50 text-amber-700 border-amber-200"       },
  { dot: "bg-cyan-500",    dark: "bg-cyan-500/12 text-cyan-400 border-cyan-500/20",         light: "bg-cyan-50 text-cyan-700 border-cyan-200"          },
];

// ── Dégradés avatar
const AVATAR_BG = [
  "from-blue-500 to-blue-700", "from-violet-500 to-violet-700",
  "from-emerald-500 to-emerald-700", "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-700", "from-cyan-500 to-cyan-700",
  "from-indigo-500 to-indigo-700",
];
const avatarBg = (id) => AVATAR_BG[id % AVATAR_BG.length];
const initials = (nom = "", prenoms = "") =>
  ((nom[0] || "") + (prenoms[0] || "")).toUpperCase();

// ════════════════════════════════════════════════════════
function Spinner({ dark }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className={`w-7 h-7 border-2 border-t-blue-500 rounded-full animate-spin
        ${dark ? "border-white/8" : "border-slate-200"}`} />
    </div>
  );
}

function ErrorAlert({ message, onRetry, dark }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm
      ${dark ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
             : "bg-rose-50 border-rose-200 text-rose-700"}`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="underline font-semibold text-xs">Réessayer</button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// Cellule cliquable — pill + icône liste au hover
// ════════════════════════════════════════════════════════
function CellBtn({ value, onClick, dark, groupIdx }) {
  if (!value || value === 0) {
    return <span className={`text-sm ${dark ? "text-white/15" : "text-slate-300"}`}>—</span>;
  }
  const pal = GROUP_PALETTE[groupIdx % GROUP_PALETTE.length];
  return (
    <div className="relative inline-flex group/cell">
      <button
        onClick={onClick}
        title="Cliquer pour voir la liste nominative"
        className={`inline-flex items-center justify-center gap-1 min-w-[34px] h-7 px-2.5 rounded-lg
          text-sm font-bold border transition-all duration-150
          hover:scale-105 hover:shadow-md cursor-pointer
          ${dark ? pal.dark : pal.light}`}
      >
        {value}
        {/* Icône liste visible au hover = indique que c'est cliquable */}
        <svg
          className="w-3 h-3 opacity-0 group-hover/cell:opacity-70 transition-opacity duration-150 flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
        </svg>
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// Stat Card — ancien style avec icône + valeur colorée
// ════════════════════════════════════════════════════════
function StatCard({ icon, value, label, colorClass, bgClass, dark }) {
  const card = dark
    ? "bg-[#0d1526] border-white/6 shadow-none"
    : "bg-white border-slate-200 shadow-sm";
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${card}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold tracking-tight ${colorClass}`}>{value}</div>
        <div className={`text-xs font-medium mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>{label}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// MODAL redesignée
// ════════════════════════════════════════════════════════
function DetailModal({ open, onClose, serviceId, groupeId, serviceName, groupeName, groupIdx, dark, token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open || !serviceId || !groupeId) return;
    setLoading(true); setError(null); setData(null);
    fetch(`${API_BASE}/detail/${serviceId}/${groupeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.json(); })
      .then((json) => setData(json.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, serviceId, groupeId, token]);

  if (!open) return null;

  const pal      = GROUP_PALETTE[groupIdx % GROUP_PALETTE.length];
  const modal    = dark ? "bg-[#0c1424] border border-white/8" : "bg-white border border-slate-200/60";
  const hdBorder = dark ? "border-white/6"  : "border-slate-100";
  const ttl      = dark ? "text-white"      : "text-slate-800";
  const sub      = dark ? "text-slate-400"  : "text-slate-500";
  const closeBtn = dark
    ? "border-white/10 text-slate-500 hover:text-white hover:bg-white/8"
    : "border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,10,25,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${modal}`}
        style={{ animation: "modalIn .22s cubic-bezier(.34,1.56,.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre colorée */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${pal.dot}`} />

        {/* ── En-tête ── */}
        <div className={`flex items-start justify-between px-6 pt-6 pb-4 border-b ${hdBorder}`}>
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${dark ? "bg-white/6" : "bg-slate-50 border border-slate-200"}`}>
              <svg className={`w-5 h-5 ${dark ? "text-slate-300" : "text-slate-500"}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className={`text-[13.5px] font-bold leading-snug truncate ${ttl}`}>
                {serviceName}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold
                  ${dark ? pal.dark : pal.light}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${pal.dot}`} />
                  {groupeName}
                </span>
                {data && (
                  <span className={`text-[11px] font-medium ${sub}`}>
                    {data.total} agent{data.total > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className={`flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center ml-3
              transition-all cursor-pointer ${closeBtn}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Corps ── */}
        <div className="px-6 py-5 max-h-[62vh] overflow-y-auto space-y-4
          [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-slate-400/30">

          {loading && <Spinner dark={dark} />}
          {error   && <ErrorAlert message={error} dark={dark} />}

          {data && !loading && (
            <>
              {/* Répartition par fonction */}
              {data.comptage_par_fonction && Object.keys(data.comptage_par_fonction).length > 0 && (
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 ${sub}`}>
                    Répartition par fonction
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.comptage_par_fonction).map(([fn, cnt], i) => (
                      <div key={fn}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium
                          ${dark ? "bg-white/4 border-white/8 text-slate-300"
                                 : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                        <span className={`w-5 h-5 rounded-lg flex items-center justify-center
                          text-[10px] font-bold text-white bg-gradient-to-br ${avatarBg(i)}`}>
                          {cnt}
                        </span>
                        {fn}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`h-px ${dark ? "bg-white/5" : "bg-slate-100"}`} />

              {/* Liste nominative */}
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 ${sub}`}>
                  Personnel ({data.personnels?.length ?? 0})
                </p>
                <div className="space-y-2">
                  {data.personnels?.length ? data.personnels.map((p) => (
                    <div key={p.id}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all
                        ${dark
                          ? "bg-white/3 border-white/6 hover:bg-white/6 hover:border-white/12"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"}`}>
                      <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
                        text-[11px] font-bold text-white bg-gradient-to-br ${avatarBg(p.id)}`}>
                        {initials(p.nom, p.prenoms)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold truncate ${ttl}`}>
                          {p.nom} {p.prenoms}
                        </p>
                        <p className={`text-[11px] mt-0.5 truncate ${sub}`}>
                          {p.fonction}
                          <span className="mx-1.5 opacity-30">·</span>
                          <span className="font-mono opacity-60">{p.matricule}</span>
                        </p>
                      </div>
                      <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border
                        ${p.statut === "En activité"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                        {p.statut}
                      </span>
                    </div>
                  )) : (
                    <p className={`text-sm text-center py-8 ${sub}`}>Aucun personnel trouvé.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:scale(.93) translateY(14px); }
          to   { opacity:1; transform:scale(1)   translateY(0);    }
        }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
export default function StructureHospitaliere({ dark }) {
  const token = localStorage.getItem("token");

  const [recap,   setRecap]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [modal,   setModal]   = useState({
    open: false, serviceId: null, groupeId: null,
    serviceName: "", groupeName: "", groupIdx: 0,
  });

  const fetchRecap = useCallback(() => {
    setLoading(true); setError(null);
    fetch(`${API_BASE}/recap`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.json(); })
      .then((json) => setRecap(json.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchRecap(); }, [fetchRecap]);

  const handleExport = () => window.open(`${API_BASE}/recap/export`, "_blank");

  const openModal = (serviceId, groupeId, serviceName, groupeName, groupIdx) =>
    setModal({ open: true, serviceId, groupeId, serviceName, groupeName, groupIdx });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // Tokens thème
  const bg   = dark ? "bg-[#0a0f1e]"                 : "bg-slate-50";
  const card = dark ? "bg-[#0d1526] border-white/6"  : "bg-white border-slate-200/80 shadow-sm shadow-slate-100";
  const ttl  = dark ? "text-white"                   : "text-slate-800";
  const sub  = dark ? "text-slate-500"               : "text-slate-400";
  const thCls = dark
    ? "px-4 py-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-600 bg-white/2 border-b border-white/5 text-center whitespace-nowrap"
    : "px-4 py-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100 text-center whitespace-nowrap";
  const tdCls = dark
    ? "px-4 text-center border-b border-white/4"
    : "px-4 text-center border-b border-slate-100/80";
  const trCls = dark
    ? "transition-colors hover:bg-white/3"
    : "transition-colors hover:bg-blue-50/25";

  const groupes = recap?.groupes ?? [];
  const lignes  = recap?.lignes  ?? [];
  const totaux  = recap?.totaux  ?? {};

  return (
    <div className={`flex-1 overflow-auto ${bg}`}>

      <DetailModal
        open={modal.open} onClose={closeModal}
        serviceId={modal.serviceId} groupeId={modal.groupeId}
        serviceName={modal.serviceName} groupeName={modal.groupeName}
        groupIdx={modal.groupIdx} dark={dark} token={token}
      />

      <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">

        {/* ══ EN-TÊTE ══ */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className={`text-[22px] font-extrabold tracking-tight ${ttl}`}>
              Structure Hospitalière
            </h1>
            <p className={`text-sm mt-1 ${sub}`}>
              Récapitulatif RH par service et groupe de fonctions
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={loading || !!error}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
              ${dark
                ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm"}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Exporter Excel
          </button>
        </div>

        {error && (
          <ErrorAlert message={`Impossible de charger : ${error}`} onRetry={fetchRecap} dark={dark} />
        )}

        {/* ══ STAT CARDS — ancien style icône + valeur colorée ══ */}
        {!loading && !error && recap && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard dark={dark} value={totaux.TOTAL ?? "—"} label="Total Personnel"
              colorClass={dark ? "text-blue-400" : "text-blue-600"}
              bgClass={dark ? "bg-blue-500/15" : "bg-blue-50"}
              icon={<svg className={`w-5 h-5 ${dark ? "text-blue-400" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20H7a4 4 0 01-4-4v0a4 4 0 014-4h10a4 4 0 014 4v0a4 4 0 01-4 4zM12 3a4 4 0 110 8 4 4 0 010-8z"/>
              </svg>}
            />
            <StatCard dark={dark} value={lignes.length} label="Services actifs"
              colorClass={dark ? "text-emerald-400" : "text-emerald-600"}
              bgClass={dark ? "bg-emerald-500/15" : "bg-emerald-50"}
              icon={<svg className={`w-5 h-5 ${dark ? "text-emerald-400" : "text-emerald-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>}
            />
            {groupes.slice(0, 2).map((g, i) => {
              const colors = [
                { clr: dark ? "text-violet-400" : "text-violet-700", bg: dark ? "bg-violet-500/15" : "bg-violet-50" },
                { clr: dark ? "text-amber-400"  : "text-amber-700",  bg: dark ? "bg-amber-500/15"  : "bg-amber-50"  },
              ];
              const c = colors[i] ?? colors[0];
              return (
                <StatCard key={g.id} dark={dark}
                  value={totaux[g.libelle] ?? "—"} label={g.libelle + "s"}
                  colorClass={c.clr} bgClass={c.bg}
                  icon={<svg className={`w-5 h-5 ${c.clr}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                  </svg>}
                />
              );
            })}
          </div>
        )}

        {/* ══ TABLEAU ══ */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-white/6" : "border-slate-100"}`}>
            <div>
              <p className={`text-[13px] font-bold ${ttl}`}>
                Tableau croisé — Personnel par Service &amp; Groupe
              </p>
              <p className={`text-xs mt-0.5 ${sub}`}>
                Cliquez sur un chiffre pour afficher la liste nominative
              </p>
            </div>
            {!loading && !error && recap && (
              <span className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[11px] font-semibold
                ${dark ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                       : "bg-blue-50 border-blue-200 text-blue-600"}`}>
                {lignes.length} services · {groupes.length} groupes
              </span>
            )}
          </div>

          {loading && <Spinner dark={dark} />}

          {/* Bannière d'aide — indique que les chiffres sont cliquables */}
          {!loading && !error && recap && lignes.length > 0 && (
            <div className={`flex items-center gap-2.5 px-5 py-2.5 border-b text-xs font-medium
              ${dark
                ? "bg-blue-500/5 border-white/4 text-blue-400"
                : "bg-blue-50/70 border-blue-100 text-blue-600"}`}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Les chiffres colorés sont cliquables — ils affichent la liste nominative du personnel de ce groupe.
            </div>
          )}

          {!loading && !error && recap && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={`${thCls} text-left pl-6 min-w-[190px]`}>Service</th>
                    {groupes.map((g, i) => {
                      const pal = GROUP_PALETTE[i % GROUP_PALETTE.length];
                      return (
                        <th key={g.id} className={thCls}>
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${pal.dot}`} />
                            {g.libelle}
                          </span>
                        </th>
                      );
                    })}
                    <th className={`${thCls} ${dark ? "text-slate-400" : "text-slate-500"} font-extrabold`}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne) => (
                    <tr key={ligne.service_id} className={trCls}>
                      <td className={`${tdCls} text-left pl-6 py-3.5`}>
                        <span className={`text-[13px] font-semibold ${dark ? "text-slate-200" : "text-slate-700"}`}>
                          {ligne.service}
                        </span>
                      </td>
                      {groupes.map((g, gi) => (
                        <td key={g.id} className={`${tdCls} py-3`}>
                          <CellBtn
                            value={ligne[g.libelle]} dark={dark} groupIdx={gi}
                            onClick={() => openModal(ligne.service_id, g.id, ligne.service, g.libelle, gi)}
                          />
                        </td>
                      ))}
                      <td className={`${tdCls} py-3 font-bold text-[13px]
                        ${ligne.TOTAL > 0 ? (dark ? "text-white" : "text-slate-800") : (dark ? "text-white/15" : "text-slate-300")}`}>
                        {ligne.TOTAL || "—"}
                      </td>
                    </tr>
                  ))}

                  {/* Ligne totaux */}
                  <tr className={dark ? "bg-white/3 border-t border-white/8" : "bg-slate-50/80 border-t border-slate-200/80"}>
                    <td className={`px-4 py-4 pl-6 text-[10.5px] font-extrabold uppercase tracking-widest ${sub}`}>
                      Total général
                    </td>
                    {groupes.map((g, gi) => {
                      const pal = GROUP_PALETTE[gi % GROUP_PALETTE.length];
                      // Extraire seulement la couleur du texte de la palette
                      const textColor = dark
                        ? pal.dark.split(" ").find(c => c.startsWith("text-"))
                        : pal.light.split(" ").find(c => c.startsWith("text-"));
                      return (
                        <td key={g.id} className="px-4 py-4 text-center">
                          <span className={`text-[13px] font-extrabold ${textColor}`}>
                            {totaux[g.libelle] ?? 0}
                          </span>
                        </td>
                      );
                    })}
                    <td className={`px-4 py-4 text-center text-base font-extrabold
                      ${dark ? "text-blue-400" : "text-blue-600"}`}>
                      {totaux.TOTAL ?? 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && recap && lignes.length === 0 && (
            <div className={`flex flex-col items-center py-16 gap-3 ${sub}`}>
              <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p className="text-sm font-medium">Aucune donnée disponible.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}