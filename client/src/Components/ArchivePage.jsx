import { useCallback, useEffect, useRef, useState } from "react";
import SearchInput from "./SearchInput";
import StaffProfile from "./StaffProfile";
import { API_BASE } from "../config/api.js";

const PER_PAGE = 10;

// Couleurs avatar cycliques
const AVATAR_COLORS = [
    "#2563eb",
    "#7c3aed",
    "#059669",
    "#d97706",
    "#e11d48",
    "#0891b2",
    "#65a30d",
    "#9333ea",
    "#0284c7",
    "#c2410c",
];
const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const initials = (nom = "", prenoms = "") =>
    ((nom[0] || "") + (prenoms[0] || "")).toUpperCase();

// ────────────────────────────────────────
// Spinner
// ────────────────────────────────────────
function Spinner({ dark }) {
    return (
        <div className="flex items-center justify-center py-16">
            <div
                className={`w-7 h-7 border-2 border-t-blue-500 rounded-full animate-spin
        ${dark ? "border-white/8" : "border-slate-200"}`}
            />
        </div>
    );
}

// ────────────────────────────────────────
// Alerte erreur
// ────────────────────────────────────────
function ErrorAlert({ message, onRetry, dark }) {
    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm mb-4
      ${
          dark
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : "bg-rose-50 border-rose-200 text-rose-700"
      }`}
        >
            <svg
                className="w-4 h-4 shrink-0"
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
            <span className="flex-1">{message}</span>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="underline font-semibold text-xs cursor-pointer"
                >
                    Réessayer
                </button>
            )}
        </div>
    );
}

// ────────────────────────────────────────
// Modal confirmation suppression définitive
// ────────────────────────────────────────
function DeleteModal({
    open,
    onClose,
    onConfirm,
    staff,
    deleting,
    deleteError,
    dark,
}) {
    useEffect(() => {
        const h = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (open) document.addEventListener("keydown", h);
        return () => document.removeEventListener("keydown", h);
    }, [open, onClose]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open || !staff) return null;

    const modal = dark
        ? "bg-[#0c1424] border border-white/8"
        : "bg-white border border-slate-200";
    const hdBorder = dark ? "border-white/6" : "border-slate-100";
    const ttl = dark ? "text-white" : "text-slate-800";
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const cancelBtn = dark
        ? "border-white/10 text-slate-300 hover:bg-white/6"
        : "border-slate-200 text-slate-600 hover:bg-slate-50";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: "rgba(5,10,25,0.65)",
                backdropFilter: "blur(8px)",
            }}
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${modal}`}
                style={{
                    animation: "modalIn .22s cubic-bezier(.34,1.56,.64,1)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Barre rose */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-rose-500 to-rose-600" />

                <div className="px-6 py-6 space-y-4">
                    {/* Icône */}
                    <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto
            ${dark ? "bg-rose-500/15" : "bg-rose-50"}`}
                    >
                        <svg
                            className="w-6 h-6 text-rose-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </div>

                    {/* Texte */}
                    <div className="text-center space-y-1.5">
                        <h3 className={`text-[15px] font-bold ${ttl}`}>
                            Suppression définitive
                        </h3>
                        <p className={`text-sm leading-relaxed ${sub}`}>
                            Vous allez supprimer définitivement{" "}
                            <strong
                                className={
                                    dark ? "text-slate-200" : "text-slate-700"
                                }
                            >
                                {staff.nom} {staff.prenoms}
                            </strong>{" "}
                            de la base de données. Cette action est{" "}
                            <strong className="text-rose-500">
                                irréversible
                            </strong>
                            .
                        </p>
                    </div>

                    {/* Erreur */}
                    {deleteError && (
                        <div
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs
              ${
                  dark
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
                        >
                            <svg
                                className="w-3.5 h-3.5 shrink-0"
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
                            {deleteError}
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={onClose}
                            disabled={deleting}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer
                disabled:opacity-40 ${cancelBtn}`}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={deleting}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                bg-rose-600 hover:bg-rose-500 border border-rose-600
                transition-all cursor-pointer disabled:opacity-60
                flex items-center justify-center gap-2"
                        >
                            {deleting ? (
                                <>
                                    <svg
                                        className="w-4 h-4 animate-spin"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        />
                                    </svg>
                                    Suppression…
                                </>
                            ) : (
                                "Supprimer"
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:scale(.93) translateY(12px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
        </div>
    );
}

// ════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL — ArchivePage
// ════════════════════════════════════════════════════════
export default function ArchivePage({ dark }) {
    const token = localStorage.getItem("token");

    const [staff, setStaff] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState({ open: false, staff: null });
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [toast, setToast] = useState({
        show: false,
        msg: "",
        type: "success",
    });
    // [AJOUTÉ] selectedId : id de la personne archivée à afficher en profil lecture seule
    // null = liste, number = affiche le profil via GET /staff/archives/:id
    const [selectedId, setSelectedId] = useState(null);

    const searchTimer = useRef(null);
    const toastTimer = useRef(null);

    const showToast = (msg, type = "success") => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ show: true, msg, type });
        toastTimer.current = setTimeout(
            () => setToast((t) => ({ ...t, show: false })),
            1500,
        ); // Disparition rapide après 1.5 secondes
    };

    // ── GET /staff/archives?page=X&limit=10&search=Y
    const fetchArchives = useCallback(() => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ page, limit: PER_PAGE });
        if (search) params.set("search", search);

        fetch(`${API_BASE}/staff/archives?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => {
                if (!r.ok) throw new Error(`Erreur ${r.status}`);
                return r.json();
            })
            .then((json) => {
                // Adapte selon la structure de ton API :
                // json.data = tableau OU { staff: [], total: N }
                const data = json.data;
                if (Array.isArray(data)) {
                    setStaff(data);
                    setTotal(json.total ?? data.length);
                } else {
                    setStaff(data?.staff ?? []);
                    setTotal(data?.total ?? 0);
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [page, search, token]);

    useEffect(() => {
        fetchArchives();
    }, [fetchArchives]);

    // Debounce recherche
    const handleSearch = (val) => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setSearch(val);
            setPage(1);
        }, 400);
    };

    // ── DELETE /staff/:id — suppression définitive
    const handleDelete = () => {
        if (!modal.staff) return;
        setDeleting(true);
        setDeleteError(null);

        fetch(`${API_BASE}/staff/${modal.staff.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => {
                if (!r.ok) throw new Error(`Erreur ${r.status}`);
                return r.json();
            })
            .then(() => {
                setModal({ open: false, staff: null });
                showToast(
                    `${modal.staff.nom} ${modal.staff.prenoms} supprimé définitivement.`,
                );
                // Recharge la liste
                fetchArchives();
            })
            .catch((err) => setDeleteError(err.message))
            .finally(() => setDeleting(false));
    };

    // Pagination
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const pageNumbers = Array.from(
        { length: Math.min(totalPages, 5) },
        (_, i) => {
            if (totalPages <= 5) return i + 1;
            if (page <= 3) return i + 1;
            if (page >= totalPages - 2) return totalPages - 4 + i;
            return page - 2 + i;
        },
    );
    const startIdx = (page - 1) * PER_PAGE + 1;
    const endIdx = Math.min(page * PER_PAGE, total);

    // Tokens thème
    const bg = dark ? "bg-[#0a0f1e]" : "bg-slate-50";
    const card = dark
        ? "bg-[#0d1526] border-white/6"
        : "bg-white border-slate-200 shadow-sm";
    const ttl = dark ? "text-white" : "text-slate-800";
    const sub = dark ? "text-slate-400" : "text-slate-500";
    const border = dark ? "border-white/6" : "border-slate-100";
    const thCls = dark
        ? "px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-600 bg-white/2 border-b border-white/5 whitespace-nowrap"
        : "px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100 whitespace-nowrap";
    const tdCls = dark
        ? "px-5 py-[13px] border-b border-white/4"
        : "px-5 py-[13px] border-b border-slate-100";
    const trHover = dark ? "hover:bg-white/3" : "hover:bg-rose-50/20";
    const inputCls = dark
        ? "bg-white/5 border-white/10 text-white placeholder-slate-600 focus:border-blue-500/50"
        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-300 focus:bg-white";
    const pgBtn = dark
        ? "border-white/10 text-slate-400 hover:bg-white/8"
        : "border-slate-200 text-slate-500 hover:bg-slate-100";

    // [AJOUTÉ] Si selectedId défini → afficher le profil archivé en lecture seule
    // readOnly=true masque tous les boutons d'action dans StaffProfile
    // apiOverride="staff/archives" → StaffProfile appelle GET /staff/archives/:id
    if (selectedId !== null) {
        return (
            <StaffProfile
                id={selectedId}
                dark={dark}
                readOnly={true}
                apiOverride="staff/archives"
                onBack={() => setSelectedId(null)}
            />
        );
    }

    return (
        <div className={`flex-1 overflow-auto ${bg}`}>
            {/* Modal suppression */}
            <DeleteModal
                open={modal.open}
                onClose={() => {
                    if (!deleting) {
                        setModal({ open: false, staff: null });
                        setDeleteError(null);
                    }
                }}
                onConfirm={handleDelete}
                staff={modal.staff}
                deleting={deleting}
                deleteError={deleteError}
                dark={dark}
            />

            {/* Toast */}
            <div
                className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl
        shadow-2xl text-sm font-medium transition-all duration-300
        ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}
        ${dark ? "bg-[#0d1526] border border-white/10 text-slate-200" : "bg-slate-800 text-white"}`}
            >
                <svg
                    className={`w-4 h-4 shrink-0 ${toast.type === "success" ? "text-emerald-400" : "text-rose-400"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    {toast.type === "success" ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    )}
                </svg>
                {toast.msg}
            </div>

            <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">
                {/* ══ EN-TÊTE ══ */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1
                            className={`text-[22px] font-extrabold tracking-tight ${ttl}`}
                        >
                            Archives du Personnel
                        </h1>
                        <p
                            className={`text-sm mt-1 max-w-lg leading-relaxed ${sub}`}
                        >
                            Personnel ayant terminé leur service. Vous pouvez
                            les supprimer définitivement de la base de données.
                        </p>
                    </div>
                    {/* Compteur */}
                    {!loading && !error && (
                        <div
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold
              ${dark ? "bg-white/4 border-white/8 text-slate-300" : "bg-white border-slate-200 text-slate-600 shadow-sm"}`}
                        >
                            <svg
                                className="w-4 h-4 text-rose-500"
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
                            {total} archivé{total > 1 ? "s" : ""}
                        </div>
                    )}
                </div>

                {/* Bannière info */}
                <div
                    className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-[12.5px] leading-relaxed
          ${
              dark
                  ? "bg-rose-500/8 border-rose-500/15 text-rose-400"
                  : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
                >
                    <svg
                        className="w-4 h-4 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                    <span>
                        <strong>Suppression définitive</strong> — La suppression
                        retire le personnel de toutes les tables. Cette action
                        est irréversible.
                    </span>
                </div>

                {/* ══ TABLE CARD ══ */}
                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                    {/* Toolbar */}
                    <div
                        className={`flex items-center gap-3 px-4 py-3.5 border-b ${border}`}
                    >
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            dark={dark}
                            placeholder="Rechercher dans les archives…"
                            className="flex-1"
                        />
                    </div>

                    {/* Erreur */}
                    {error && (
                        <div className="px-5 pt-4">
                            <ErrorAlert
                                message={`Impossible de charger : ${error}`}
                                onRetry={fetchArchives}
                                dark={dark}
                            />
                        </div>
                    )}

                    {loading && <Spinner dark={dark} />}

                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr>
                                        <th className={`${thCls} text-left`}>
                                            Personnel
                                        </th>
                                        <th className={`${thCls} text-left`}>
                                            Service
                                        </th>
                                        <th className={`${thCls} text-left`}>
                                            Fonction
                                        </th>
                                        <th className={`${thCls} text-left`}>
                                            Date de sortie
                                        </th>
                                        <th className={`${thCls} text-right`}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.length ? (
                                        staff.map((p) => (
                                            <tr
                                                key={p.id}
                                                className={`transition-colors ${trHover}`}
                                            >
                                                {/* Personnel */}
                                                <td className={tdCls}>
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-9 h-9 rounded-full flex items-center justify-center
                              text-[11px] font-bold text-white shrink-0 opacity-70"
                                                            style={{
                                                                background:
                                                                    avatarColor(
                                                                        p.id,
                                                                    ),
                                                            }}
                                                        >
                                                            {initials(
                                                                p.nom,
                                                                p.prenoms,
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p
                                                                className={`font-semibold text-[13px] ${ttl}`}
                                                            >
                                                                {p.nom}{" "}
                                                                {p.prenoms}
                                                            </p>
                                                            <p
                                                                className={`text-[11px] mt-0.5 ${sub}`}
                                                            >
                                                                {p.matricule}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Service */}
                                                <td className={tdCls}>
                                                    <span
                                                        className={`text-[12.5px] ${sub}`}
                                                    >
                                                        {p.service ?? "—"}
                                                    </span>
                                                </td>
                                                {/* Fonction */}
                                                <td className={tdCls}>
                                                    <span
                                                        className={`text-[12.5px] ${sub}`}
                                                    >
                                                        {p.fonction ?? "—"}
                                                    </span>
                                                </td>
                                                {/* Date sortie */}
                                                <td className={tdCls}>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                            text-[10.5px] font-semibold border
                            ${
                                dark
                                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                    : "bg-rose-50 border-rose-200 text-rose-600"
                            }`}
                                                    >
                                                        <svg
                                                            className="w-3 h-3"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        {p.date_sortie || "—"}
                                                    </span>
                                                </td>
                                                {/* [AJOUTÉ] Bouton Voir — ouvre le profil en lecture seule
                                                 Appelle GET /staff/archives/:id via prop apiOverride dans StaffProfile */}
                                                <td
                                                    className={`${tdCls} text-right`}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            setSelectedId(p.id)
                                                        }
                                                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl
                              text-xs font-bold border transition-all cursor-pointer
                              hover:-translate-y-0.5 hover:shadow-md
                              ${
                                  dark
                                      ? "border-blue-500/25 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/40"
                                      : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                              }`}
                                                    >
                                                        <svg
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
                                                        Voir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5}>
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
                                                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                                        />
                                                    </svg>
                                                    <p className="text-sm font-medium">
                                                        Aucun personnel archivé.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && !error && total > PER_PAGE && (
                        <div
                            className={`flex items-center justify-between px-5 py-3.5 border-t ${border}`}
                        >
                            <p className={`text-xs font-medium ${sub}`}>
                                Affichage de {startIdx}–{endIdx} sur {total}{" "}
                                archivés
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page === 1}
                                    className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                    disabled:opacity-30 disabled:cursor-not-allowed ${pgBtn}`}
                                >
                                    ← Préc.
                                </button>
                                {pageNumbers.map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setPage(n)}
                                        className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer
                      ${
                          n === page
                              ? "bg-rose-600 border-rose-600 text-white"
                              : pgBtn
                      }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    disabled={page === totalPages}
                                    className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                    disabled:opacity-30 disabled:cursor-not-allowed ${pgBtn}`}
                                >
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
