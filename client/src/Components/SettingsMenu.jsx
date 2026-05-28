import React, { useState, useEffect, useRef } from "react";

export default function SettingsMenu({ dark, onNavigate, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // ── Fermeture du menu lors d'un clic à l'extérieur
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const iconBtnClass = dark
        ? "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
        : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200";

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${iconBtnClass}
                    ${isOpen ? (dark ? "bg-white/10 text-white" : "bg-slate-200 text-slate-800") : ""}`}
                title="Paramètres"
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            </button>

            {/* ── Menu déroulant ── */}
            {isOpen && (
                <div
                    className={`absolute right-0 top-11 z-50 w-52 rounded-2xl border shadow-2xl overflow-hidden
                        ${dark ? "bg-[#0d1526] border-white/10" : "bg-white border-slate-200"}`}
                    style={{
                        animation: "dropIn .18s cubic-bezier(.34,1.56,.64,1)",
                    }}
                >
                    <div
                        className={`px-4 py-3 border-b text-[10.5px] font-bold uppercase tracking-widest
                        ${dark ? "border-white/6 text-slate-600" : "border-slate-100 text-slate-400"}`}
                    >
                        Paramètres
                    </div>

                    <button
                        onClick={() => {
                            onNavigate("Archives");
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all cursor-pointer
                            ${dark ? "text-slate-300 hover:bg-white/6 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}`}
                    >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${dark ? "bg-rose-500/15" : "bg-rose-50"}`}>
                            <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                        Archives
                    </button>

                    <div className={`mx-4 h-px ${dark ? "bg-white/5" : "bg-slate-100"}`} />

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onLogout && onLogout();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all cursor-pointer
                            ${dark ? "text-rose-400 hover:bg-rose-500/8" : "text-rose-600 hover:bg-rose-50"}`}
                    >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${dark ? "bg-rose-500/12" : "bg-rose-50"}`}>
                            <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        Déconnexion
                    </button>
                </div>
            )}

            <style>{`
                @keyframes dropIn {
                    from { opacity:0; transform:scale(.95) translateY(-6px); }
                    to   { opacity:1; transform:scale(1)   translateY(0); }
                }
            `}</style>
        </div>
    );
}