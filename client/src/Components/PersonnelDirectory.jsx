import { useState, useEffect, useCallback } from "react";


const API_BASE = "http://localhost:3000"; 
const LIMIT    = 10; 

// ── Couleurs d'avatar tournantes selon l'index de la ligne
const AVATAR_COLORS = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-emerald-400 to-emerald-600",
  "from-rose-400 to-rose-600",
  "from-amber-400 to-amber-600",
  "from-cyan-400 to-cyan-600",
];

function getInitiales(nom = "", prenoms = "") {
  const n = nom.trim()[0]     || "";
  const p = prenoms.trim()[0] || "";
  return (n + p).toUpperCase();
}

function StatutBadge({ statut = "Actif", dark }) {
  const map = {
    "Actif":    dark ? "bg-emerald-400/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200",
    "Congé":    dark ? "bg-amber-400/10   text-amber-400   border-amber-500/20"  : "bg-amber-50   text-amber-600   border-amber-200",
    "Suspendu": dark ? "bg-slate-400/10   text-slate-400   border-slate-500/20"  : "bg-slate-100  text-slate-500   border-slate-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${map[statut] || map["Actif"]}`}>
      {statut}
    </span>
  );
}

// ── Icônes SVG inline pour les boutons d'action
function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════
// Composant principal
// ════════════════════════════════════════════════════════════════════
export default function PersonnelDirectory({ dark }) {

  // ── États des données
  const [personnel,    setPersonnel]    = useState([]);   // tableau retourné par l'API
  const [pagination,   setPagination]   = useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 });
  const [loading,      setLoading]      = useState(true); // spinner pendant le fetch
  const [error,        setError]        = useState(null); // message d'erreur si fetch échoue

  // ── États des filtres (contrôlent les query params envoyés à l'API)
  const [search,       setSearch]       = useState("");   // barre de recherche
  const [filterDept,   setFilterDept]   = useState("");   // dropdown Département
  const [filterFonc,   setFilterFonc]   = useState("");   // dropdown Service (= fonction BDD)
  const [page,         setPage]         = useState(1);    // page courante

  // ── Données des dropdowns (chargées une seule fois au montage)
  const [departments,  setDepartments]  = useState([]);  // liste des départements
  const [fonctions,    setFonctions]    = useState([]);  // liste des fonctions

  const token = localStorage.getItem("token");

  const fetchPersonnel = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {

      const params = new URLSearchParams({
        ...(search     && { search }),       // n'ajoute le param que s'il n'est pas vide
        ...(filterDept && { department: filterDept }),
        ...(filterFonc && { fonction: filterFonc }),
        page,
        limit: LIMIT,
      });

      const res = await fetch(`${API_BASE}/staff/show-all?${params}`, {
        headers: {
          // On envoie le token JWT dans l'en-tête Authorization
          // Format standard "Bearer <token>" (voir authControllers.js)
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const json = await res.json();
      setPersonnel(json.data);
      setPagination(json.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // toujours désactiver le spinner, succès ou erreur
    }
  }, [search, filterDept, filterFonc, page, token]);

  useEffect(() => {
    fetchPersonnel();
  }, [fetchPersonnel]); // fetchPersonnel change quand ses propres dépendances changent

  useEffect(() => {
    fetch(`${API_BASE}/staff/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => setDepartments(json.data || []))
      .catch(() => {}); // silencieux — les dropdowns resteront vides si l'API échoue
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Chargement des fonctions/services (une seule fois, au montage)
  useEffect(() => {
    fetch(`${API_BASE}/staff/fonctions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => setFonctions(json.data || []))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch     = (val) => { setSearch(val);     setPage(1); };
  const handleFilterDept = (val) => { setFilterDept(val); setPage(1); };
  const handleFilterFonc = (val) => { setFilterFonc(val); setPage(1); };

  const hasActiveFilter  = search || filterDept || filterFonc;

  const resetFiltres = () => {
    setSearch(""); setFilterDept(""); setFilterFonc(""); setPage(1);
  };

  // ── Tokens thème (classes Tailwind selon dark/light)
  const T = {
    title:    dark ? "text-white"              : "text-slate-800",
    sub:      dark ? "text-slate-400"          : "text-slate-500",
    card:     dark ? "bg-[#0d1526] border-white/8" : "bg-white border-slate-200 shadow-sm",
    input:    dark ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400",
    select:   dark ? "bg-white/5 border-white/10 text-slate-300 focus:border-blue-500/50" : "bg-white border-slate-200 text-slate-700 focus:border-blue-400",
    thHead:   dark ? "text-slate-500 border-white/8 bg-white/3" : "text-slate-400 border-slate-200 bg-slate-50",
    trHover:  dark ? "hover:bg-white/3 border-white/5" : "hover:bg-slate-50/80 border-slate-100",
    tdText:   dark ? "text-slate-200"          : "text-slate-700",
    tdSub:    dark ? "text-slate-500"          : "text-slate-400",
    pagBtn:   dark ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
    pagBtnAct:"bg-blue-600 border-blue-600 text-white",
    iconColor:dark ? "text-slate-500"          : "text-slate-400",
    actionView: dark
      ? "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 transition-all"
      : "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all",
    actionEdit: dark
      ? "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
      : "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all",
  };

  // ── Pagination : génère les numéros de pages à afficher
  // Affiche au plus 5 numéros autour de la page courante
  const buildPageNumbers = () => {
    const total = pagination.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (page > 3)       pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-auto">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${T.title}`}>Répertoire du Personnel</h1>
          <p className={`text-sm mt-1 ${T.sub}`}>
            Gérez et consultez le personnel du CHU Anosiala.
            {pagination.total > 0 && (
              <span className="ml-2 font-medium">{pagination.total} membres</span>
            )}
          </p>
        </div>
        {/* Bouton Ajouter — non fonctionnel pour l'instant, prévu pour la prochaine page */}
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Ajouter un personnel
        </button>
      </div>

      {/* ── Zone de filtres ── */}
      <div className={`rounded-2xl border p-4 mb-5 ${T.card}`}>
        <div className="flex flex-wrap gap-3 items-center">

          {/* Barre de recherche — envoie ?search= à l'API (voir staffModels.js ligne 38) */}
          {/* Recherche dans : nom, prenoms, matricule (CAST im AS TEXT) */}
          <div className="relative flex-1 min-w-50">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${T.iconColor}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher par nom ou matricule..."
              className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none transition-all ${T.input}`}
            />
          </div>

          {/* Dropdown Département — envoie ?department= à l'API (voir staffModels.js ligne 47) */}
          <select
            value={filterDept}
            onChange={(e) => handleFilterDept(e.target.value)}
            className={`text-sm px-3 py-2.5 rounded-xl border outline-none cursor-pointer transition-all ${T.select}`}
          >
            <option value="">Département</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={filterFonc}
            onChange={(e) => handleFilterFonc(e.target.value)}
            className={`text-sm px-3 py-2.5 rounded-xl border outline-none cursor-pointer transition-all ${T.select}`}
          >
            <option value="">Service</option>
            {fonctions.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          {/* Bouton reset — visible seulement quand un filtre est actif */}
          {hasActiveFilter && (
            <button
              onClick={resetFiltres}
              className={`flex items-center gap-1.5 text-xs px-3 py-2.5 rounded-xl border transition-all ${
                dark ? "text-slate-400 hover:text-white border-white/10 hover:border-white/20" : "text-slate-500 hover:text-slate-800 border-slate-200 hover:border-slate-300"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── État : chargement ── */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── État : erreur ── */}
      {!loading && error && (
        <div className={`rounded-2xl border p-5 flex items-center gap-3 text-sm ${
          dark ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Impossible de charger le personnel : {error}
          <button onClick={fetchPersonnel} className="ml-auto underline text-xs">Réessayer</button>
        </div>
      )}

      {/* ── Tableau du personnel ── */}
      {!loading && !error && (
        <div className={`rounded-2xl border overflow-hidden ${T.card}`}>
          <table className="w-full text-sm">

            {/* En-têtes */}
            <thead>
              <tr className={`border-b text-left text-[11px] font-bold uppercase tracking-wider ${T.thHead}`}>
                <th className="px-5 py-3.5">Nom</th>
                <th className="px-5 py-3.5">Matricule</th>
                {/* Département et Service masqués sur mobile, visibles sur md/lg+ */}
                <th className="px-5 py-3.5 hidden md:table-cell">Département</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Service</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {personnel.length === 0 ? (
                /* Aucun résultat */
                <tr>
                  <td colSpan={6} className={`px-5 py-14 text-center text-sm ${T.sub}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20H7a4 4 0 01-4-4v0a4 4 0 014-4h10a4 4 0 014 4v0a4 4 0 01-4 4zM12 3a4 4 0 110 8 4 4 0 010-8z" />
                    </svg>
                    Aucun personnel trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
        
                personnel.map((p, i) => (
                  <tr key={`${p.matricule}-${i}`} className={`border-b transition-colors ${T.trHover}`}>

                    {/* Nom + avatar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-linear-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                          {getInitiales(p.nom, p.prenoms)}
                        </div>
                        <div>
                          <div className={`font-semibold leading-tight ${T.tdText}`}>
                            {p.nom} {p.prenoms}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Matricule — colonne m.im de la BDD (voir staffModels.js ligne 78) */}
                    <td className={`px-5 py-3.5 font-mono text-xs ${T.tdSub}`}>
                      #{p.matricule}
                    </td>

                    {/* Département — INITCAP(s.libelle) (voir staffModels.js ligne 79) */}
                    <td className={`px-5 py-3.5 hidden md:table-cell ${T.tdText}`}>
                      {p.departement || <span className={T.tdSub}>—</span>}
                    </td>

                    {/* Service — m.fonction renommé "service" (voir staffModels.js ligne 80) */}
                    <td className={`px-5 py-3.5 hidden lg:table-cell ${T.tdSub}`}>
                      {p.service || <span className="opacity-50">—</span>}
                    </td>

                    {/* Statut — valeur par défaut "Actif" en attendant la colonne BDD */}
                    <td className="px-5 py-3.5">
                      <StatutBadge statut={p.statut || "Actif"} dark={dark} />
                    </td>

                    {/* Actions : Voir + Mettre à jour */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Bouton Voir — à brancher sur une page détail plus tard */}
                        <button className={T.actionView} title="Voir le détail">
                          <EyeIcon />
                          <span className="hidden sm:inline">Voir</span>
                        </button>
                        {/* Bouton Mettre à jour — à brancher sur une page édition plus tard */}
                        <button className={T.actionEdit} title="Mettre à jour">
                          <EditIcon />
                          <span className="hidden sm:inline">Modifier</span>
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
            <div className={`flex items-center justify-between px-5 py-3.5 border-t ${dark ? "border-white/8" : "border-slate-100"}`}>
              {/* Compteur ex: "Affichage 1–10 sur 256" */}
              <p className={`text-xs ${T.sub}`}>
                Affichage {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total}
              </p>

              <div className="flex items-center gap-1.5">
                {/* Précédent */}
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${T.pagBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Numéros de pages avec ellipsis */}
                {buildPageNumbers().map((n, i) =>
                  n === "..." ? (
                    <span key={`ellipsis-${i}`} className={`w-8 h-8 flex items-center justify-center text-xs ${T.sub}`}>…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-all ${page === n ? T.pagBtnAct : T.pagBtn}`}
                    >
                      {n}
                    </button>
                  )
                )}

                {/* Suivant */}
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${T.pagBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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