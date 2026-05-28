import React from "react";

export default function SearchInput({ 
    value, 
    onChange, 
    placeholder = "Rechercher...", 
    dark, 
    className = "" 
}) {
    // Styles de base pour l'input selon le mode
    const inputCls = dark
        ? "bg-white/5 border-white/10 text-white placeholder-slate-600 focus:border-blue-500/50"
        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-300 focus:bg-white";

    return (
        <div className={`relative ${className}`}>
            {/* Icône Loupe */}
            <svg
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? "text-slate-500" : "text-slate-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>

            {/* Champ de saisie */}
            <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border outline-none transition-all font-[inherit] ${inputCls}`}
            />

            {/* Bouton Croix Rouge (Effacer) */}
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Effacer la recherche"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}