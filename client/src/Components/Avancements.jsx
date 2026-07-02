import { useCallback, useEffect, useState } from "react";
import "../App.css";

const API_BASE = "http://localhost:3000";

const formatClasse = (classe) => {
    if (!classe) return "";
    const mapping = {
        STAGIAIRE: "Stagiaire",
        "1ERE_CLASSE": "1ère classe",
        "2EME_CLASSE": "2ème classe",
        PRINCIPAL: "Principal",
        EXCEPTIONNEL: "Exceptionnel",
    };
    return mapping[classe] || classe;
};

const formatGrade = (grade) => {
    if (!grade) return "";
    return `Cat. ${grade.categorie} - ${formatClasse(grade.classe)} - Ech. ${grade.echelon}`;
};

// --- Composant Historique / Formulaire de promotion ---
function PromotionModal({
    personnelId,
    personnelName,
    dark,
    onClose,
    onPromoted,
}) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [numArrete, setNumArrete] = useState("");
    const [dateSignature, setDateSignature] = useState("");
    const [dateEffet, setDateEffet] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const token = localStorage.getItem("token");

    const fetchHistory = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE}/avancements/${personnelId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok)
                    throw new Error(
                        "Erreur lors de la récupération de l'historique",
                    );
                return res.json();
            })
            .then((data) => {
                setHistory(data.data || data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [personnelId, token]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handlePromote = async (e) => {
        e.preventDefault();
        if (!dateSignature || !dateEffet) {
            setSubmitError("Veuillez remplir les dates obligatoires.");
            return;
        }
        setSubmitting(true);
        setSubmitError(null);

        try {
            const res = await fetch(`${API_BASE}/avancements/${personnelId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    num_arrete: numArrete.trim(),
                    date_signature: dateSignature,
                    date_effet: dateEffet,
                }),
            });

            if (!res.ok) {
                if (res.status === 409) {
                    throw new Error(
                        "Conflit de date : La date d'effet doit être strictement supérieure à la date du dernier avancement.",
                    );
                }
                const json = await res.json().catch(() => ({}));
                throw new Error(
                    json.message ||
                        "Erreur lors de l'application de l'avancement",
                );
            }

            onPromoted();
            onClose();
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const modalBg = dark
        ? "bg-[#0d1526] border-white/10"
        : "bg-white border-slate-200";
    const headerBg = dark
        ? "bg-white/3 border-white/8"
        : "bg-slate-50 border-slate-200";
    const textTitle = dark ? "text-white" : "text-slate-800";
    const textSub = dark ? "text-slate-400" : "text-slate-500";
    const inputCls = dark
        ? "w-full px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none focus:border-blue-500/60 transition-all"
        : "w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col md:flex-row overflow-hidden ${modalBg}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Colonne Gauche : Historique */}
                <div
                    className={`flex-1 flex flex-col border-b md:border-b-0 md:border-r ${dark ? "border-white/10" : "border-slate-200"}`}
                >
                    <div className={`px-5 py-4 border-b ${headerBg}`}>
                        <h2 className={`text-base font-bold ${textTitle}`}>
                            Historique de {personnelName}
                        </h2>
                        <p className={`text-xs mt-0.5 ${textSub}`}>
                            Frise chronologique des avancements
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : error ? (
                            <p className="text-sm text-rose-500">{error}</p>
                        ) : history.length === 0 ? (
                            <p className={`text-sm italic ${textSub}`}>
                                Aucun historique disponible.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {history.map((h, i) => (
                                    <div
                                        key={h.id_avancement}
                                        className={`relative pl-4 border-l-2 ${i === 0 ? "border-blue-500" : dark ? "border-white/10" : "border-slate-200"}`}
                                    >
                                        <div
                                            className={`absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-blue-500" : dark ? "bg-white/20" : "bg-slate-300"}`}
                                        />
                                        <div
                                            className={`p-3 rounded-xl border ${dark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span
                                                    className={`text-xs font-bold px-2 py-0.5 rounded ${dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-100 text-blue-700"}`}
                                                >
                                                    {h.type_mouvement ===
                                                    "AVANCEMENT_DECHELON"
                                                        ? "Avancement d'échelon"
                                                        : "Promotion de classe"}
                                                </span>
                                                <span
                                                    className={`text-xs ${textSub}`}
                                                >
                                                    {h.date_effet
                                                        ? new Date(
                                                              h.date_effet,
                                                          ).toLocaleDateString()
                                                        : ""}
                                                </span>
                                            </div>
                                            {h.grade && (
                                                <p
                                                    className={`text-sm font-semibold mt-2 ${textTitle}`}
                                                >
                                                    {formatGrade(h.grade)}
                                                </p>
                                            )}
                                            <p
                                                className={`text-xs mt-1 ${textSub}`}
                                            >
                                                Indice: {h.grade?.indice}{" "}
                                                {h.num_arrete
                                                    ? `• Arrêté: ${h.num_arrete}`
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Colonne Droite : Formulaire */}
                <div className="w-full md:w-80 flex flex-col shrink-0">
                    <div className="flex justify-end p-2 border-b border-transparent">
                        <button
                            onClick={onClose}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${dark ? "text-slate-500 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-800 hover:bg-slate-200"}`}
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="px-5 pb-5">
                        <h3 className={`text-base font-bold mb-4 ${textTitle}`}>
                            Appliquer un avancement
                        </h3>
                        {submitError && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
                                {submitError}
                            </div>
                        )}
                        <form onSubmit={handlePromote} className="space-y-4">
                            <div>
                                <label
                                    className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
                                >
                                    Numéro d'arrêté
                                </label>
                                <input
                                    type="text"
                                    value={numArrete}
                                    onChange={(e) =>
                                        setNumArrete(e.target.value)
                                    }
                                    className={inputCls}
                                    placeholder="Optionnel"
                                />
                            </div>
                            <div>
                                <label
                                    className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
                                >
                                    Date de signature *
                                </label>
                                <input
                                    type="date"
                                    value={dateSignature}
                                    onChange={(e) =>
                                        setDateSignature(e.target.value)
                                    }
                                    className={inputCls}
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
                                >
                                    Date d'effet *
                                </label>
                                <input
                                    type="date"
                                    value={dateEffet}
                                    onChange={(e) =>
                                        setDateEffet(e.target.value)
                                    }
                                    className={inputCls}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full mt-2 flex items-center justify-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
                            >
                                {submitting
                                    ? "Validation..."
                                    : "Valider la promotion"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Composant Principal : Liste ---
export default function Avancements({ dark, refreshNotifications }) {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedAgent, setSelectedAgent] = useState(null);

    // [NOUVEAU] Stats de notifications : dépassé / très proches / total
    const [notifStats, setNotifStats] = useState(null);

    const token = localStorage.getItem("token");

    // [NOUVEAU] Fetch des stats de notifications au montage
    useEffect(() => {
        fetch(`${API_BASE}/avancements/stats`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (json?.data) setNotifStats(json.data);
            })
            .catch(() => {}); // silencieux — la bannière est facultative
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchEligible = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE}/avancements/proches`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok)
                    throw new Error(
                        "Erreur lors de la récupération des agents éligibles",
                    );
                return res.json();
            })
            .then((data) => {
                setAgents(data.data || data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [token]);

    useEffect(() => {
        fetchEligible();
    }, [fetchEligible]);

    const bg = dark ? "bg-[#0a0f1e]" : "bg-slate-50";
    const card = dark
        ? "bg-[#0d1526] border-white/8"
        : "bg-white border-slate-200 shadow-sm";
    const textTitle = dark ? "text-white" : "text-slate-800";
    const textSub = dark ? "text-slate-400" : "text-slate-500";
    const rowHover = dark
        ? "hover:bg-white/5 border-white/5"
        : "hover:bg-slate-50 border-slate-100";

    return (
        <div className={`flex-1 h-full overflow-y-auto p-4 lg:p-6 ${bg}`}>
            {selectedAgent && (
                <PromotionModal
                    personnelId={selectedAgent.personnel_id}
                    personnelName={`${selectedAgent.nom} ${selectedAgent.prenoms}`}
                    dark={dark}
                    onClose={() => setSelectedAgent(null)}
                    onPromoted={() => {
                        fetchEligible(); // Refresh list after promotion
                        if (typeof refreshNotifications === "function") {
                            refreshNotifications();
                        }
                    }}
                />
            )}

            <div className="mb-6">
                <h1 className={`text-2xl lg:text-3xl font-bold ${textTitle}`}>
                    Gestion des Avancements
                </h1>
                <p className={`text-sm mt-1 ${textSub}`}>
                    Liste des agents dont la date de prochain avancement est
                    passée ou proche
                </p>
            </div>

            {/* [NOUVEAU] Bannière statistiques de notifications */}
            {notifStats &&
                (notifStats.depasse > 0 || notifStats.tres_proche > 0) && (
                    <div
                        className={`mb-5 rounded-2xl border p-4 ${
                            dark
                                ? "bg-amber-500/5 border-amber-500/20"
                                : "bg-amber-50 border-amber-200"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Icône alerte */}
                            <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    dark
                                        ? "bg-amber-500/15 text-amber-400"
                                        : "bg-amber-100 text-amber-600"
                                }`}
                            >
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
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p
                                    className={`text-sm font-bold mb-2 ${dark ? "text-amber-300" : "text-amber-800"}`}
                                >
                                    Avancements nécessitant une attention
                                </p>
                                {/* 3 compteurs */}
                                <div className="flex flex-wrap gap-3">
                                    {/* Dépassé */}
                                    {notifStats.depasse > 0 && (
                                        <div
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                                                dark
                                                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                                    : "bg-rose-50 border-rose-200 text-rose-700"
                                            }`}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                                            <span className="font-bold text-sm">
                                                {notifStats.depasse}
                                            </span>
                                            Dépassé
                                            {notifStats.depasse > 1 ? "s" : ""}
                                        </div>
                                    )}
                                    {/* Très proche */}
                                    {notifStats.tres_proche > 0 && (
                                        <div
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                                                dark
                                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                                    : "bg-amber-100 border-amber-200 text-amber-700"
                                            }`}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                            <span className="font-bold text-sm">
                                                {notifStats.tres_proche}
                                            </span>
                                            Très proche
                                            {notifStats.tres_proche > 1
                                                ? "s"
                                                : ""}
                                        </div>
                                    )}
                                    {/* Total éligible */}
                                    <div
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                                            dark
                                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                : "bg-blue-50 border-blue-200 text-blue-700"
                                        }`}
                                    >
                                        <span className="font-bold text-sm">
                                            {notifStats.total_eligible}
                                        </span>
                                        Total éligible
                                        {notifStats.total_eligible > 1
                                            ? "s"
                                            : ""}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            <div className={`rounded-2xl border ${card} overflow-hidden`}>
                <div
                    className={`px-5 py-4 border-b ${dark ? "border-white/8" : "border-slate-100"} flex items-center justify-between`}
                >
                    <h2 className={`font-semibold ${textTitle}`}>
                        Agents éligibles
                    </h2>
                    <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${dark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"}`}
                    >
                        {agents.length} agent(s)
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-rose-500">{error}</div>
                ) : agents.length === 0 ? (
                    <div className="p-10 text-center">
                        <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${dark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-8 h-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <p className={`text-lg font-medium ${textTitle}`}>
                            Aucun agent éligible
                        </p>
                        <p className={`text-sm mt-1 ${textSub}`}>
                            Tous les avancements sont à jour.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    className={`text-[10px] font-bold uppercase tracking-widest ${dark ? "text-slate-500 bg-white/5" : "text-slate-400 bg-slate-50"}`}
                                >
                                    <th className="px-5 py-3">Agent</th>
                                    <th className="px-5 py-3">Service</th>
                                    <th className="px-5 py-3">Grade Actuel</th>
                                    <th className="px-5 py-3">
                                        Prochain Avancement
                                    </th>
                                    <th className="px-5 py-3 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody
                                className={`text-sm divide-y ${dark ? "divide-white/5" : "divide-slate-100"}`}
                            >
                                {agents.map((a) => {
                                    const past =
                                        new Date(a.date_prochain_avancement) <
                                        new Date();
                                    return (
                                        <tr
                                            key={a.personnel_id}
                                            className={`transition-colors ${rowHover}`}
                                        >
                                            <td className="px-5 py-3.5">
                                                <div
                                                    className={`font-semibold ${textTitle}`}
                                                >
                                                    {a.nom} {a.prenoms}
                                                </div>
                                                <div
                                                    className={`text-xs ${textSub}`}
                                                >
                                                    IM: {a.im}
                                                </div>
                                            </td>
                                            <td
                                                className={`px-5 py-3.5 ${textSub}`}
                                            >
                                                {a.service}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {a.grade_actuel && (
                                                    <div className={textTitle}>
                                                        {formatGrade(
                                                            a.grade_actuel,
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        past
                                                            ? dark
                                                                ? "bg-rose-500/15 text-rose-400"
                                                                : "bg-rose-100 text-rose-700"
                                                            : dark
                                                              ? "bg-amber-500/15 text-amber-400"
                                                              : "bg-amber-100 text-amber-700"
                                                    }`}
                                                >
                                                    {new Date(
                                                        a.date_prochain_avancement,
                                                    ).toLocaleDateString()}
                                                    {past && " (En retard)"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    onClick={() =>
                                                        setSelectedAgent(a)
                                                    }
                                                    className="px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                                                >
                                                    Historique / Promouvoir
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
