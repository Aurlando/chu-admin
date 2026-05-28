import React, { useState, useEffect, useRef } from "react";

export default function NotificationMenu({ dark, onNavigate }) {
    const [notifStats, setNotifStats] = useState(null);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const notifMenuRef = useRef(null);

    const token = localStorage.getItem("token");

    // ── Récupération des statistiques d'avancement
    useEffect(() => {
        if (!token) return;
        fetch("http://localhost:3000/avancements/stats", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (json && json.data) setNotifStats(json.data);
            })
            .catch((err) => console.error("Error fetching notif stats:", err));
    }, [token]);

    // ── Fermeture du menu lors d'un clic à l'extérieur
    useEffect(() => {
        const handler = (e) => {
            if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
                setShowNotifMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const totalNotifs = notifStats ? notifStats.depasse + notifStats.tres_proche : 0;

    // Style du bouton repris du Dashboard
    const iconBtnClass = dark
        ? "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
        : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200";

    return (
        <div className="relative" ref={notifMenuRef}>
            <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${iconBtnClass} ${showNotifMenu ? (dark ? "bg-white/10 border-blue-500/50" : "bg-slate-100 border-blue-400") : ""}`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 cursor-pointer transition-colors ${totalNotifs > 0 ? "text-amber-500 animate-swing" : ""}`}
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
                {totalNotifs > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0f1e] animate-bounce">
                        {totalNotifs}
                    </span>
                )}
            </button>

            {/* ── Menu déroulant des notifications ── */}
            {showNotifMenu && (
                <div
                    className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
                        dark ? "bg-[#0d1526] border-white/10 shadow-black/40" : "bg-white border-slate-200 shadow-slate-200"
                    }`}
                >
                    <div className={`px-4 py-3 border-b flex items-center justify-between ${dark ? "border-white/5 bg-white/3" : "border-slate-100 bg-slate-50"}`}>
                        <h3 className={`text-xs font-bold uppercase tracking-wider ${dark ? "text-slate-400" : "text-slate-500"}`}>
                            Notifications
                        </h3>
                        {totalNotifs > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">
                                {totalNotifs} nouvelle{totalNotifs > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {totalNotifs === 0 ? (
                            <div className="p-8 text-center">
                                <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${dark ? "bg-white/5 text-slate-600" : "bg-slate-100 text-slate-400"}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <p className={`text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>Aucune notification</p>
                                <p className={`text-xs mt-1 ${dark ? "text-slate-500" : "text-slate-500"}`}>Tout est à jour pour le moment.</p>
                            </div>
                        ) : (
                            <div className="divide-y dark:divide-white/5 divide-slate-100">
                                {notifStats.depasse > 0 && (
                                    <button
                                        onClick={() => { onNavigate("Avancements"); setShowNotifMenu(false); }}
                                        className={`w-full text-left p-4 flex gap-3 transition-colors ${dark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-slate-800"}`}>Avancements dépassés</p>
                                            <p className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                                                <span className="font-bold text-rose-500">{notifStats.depasse}</span> personnel{notifStats.depasse > 1 ? "s ont" : " a"} dépassé la date d'avancement.
                                            </p>
                                        </div>
                                    </button>
                                )}
                                {notifStats.tres_proche > 0 && (
                                    <button
                                        onClick={() => { onNavigate("Avancements"); setShowNotifMenu(false); }}
                                        className={`w-full text-left p-4 flex gap-3 transition-colors ${dark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-slate-800"}`}>Avancements imminents</p>
                                            <p className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                                                <span className="font-bold text-amber-500">{notifStats.tres_proche}</span> personnel{notifStats.tres_proche > 1 ? "s sont" : " est"} très proche de l'éligibilité.
                                            </p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => { onNavigate("Avancements"); setShowNotifMenu(false); }}
                        className={`w-full py-3 text-center text-xs font-bold transition-all border-t ${
                            dark ? "bg-white/3 border-white/5 text-blue-400 hover:bg-white/8 hover:text-blue-300" : "bg-slate-50 border-slate-100 text-blue-600 hover:bg-slate-100 hover:text-blue-700"
                        }`}
                    >
                        Voir tous les détails
                    </button>
                </div>
            )}
        </div>
    );
}