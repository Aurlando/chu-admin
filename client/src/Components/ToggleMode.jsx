import React from "react";

export default function ToggleMode({ dark, onToggle, className = "" }) {
    return (
        <button
            onClick={onToggle}
            type="button"
            title={dark ? "Passer en mode jour" : "Passer en mode nuit"}
            className={`group relative w-14 h-8 rounded-full border transition-all duration-500 flex items-center shrink-0 cursor-pointer shadow-md hover:shadow-lg ${className} ${
                dark
                    ? "bg-slate-900/60 border-white/10 hover:border-indigo-500/50"
                    : "bg-slate-100/60 border-slate-300 hover:border-amber-400/50"
            } backdrop-blur-md hover:scale-105 active:scale-95`}
        >
            <span
                className={`absolute left-2 text-[12px] transition-all duration-300 ${dark ? "opacity-100 scale-100" : "opacity-20 scale-75"} select-none pointer-events-none`}
            >
                🌙
            </span>
            <span
                className={`absolute right-2 text-[12px] transition-all duration-300 ${dark ? "opacity-20 scale-75" : "opacity-100 scale-100"} select-none pointer-events-none`}
            >
                ☀️
            </span>
            <span
                className={`absolute w-6 h-6 rounded-full shadow-lg transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) flex items-center justify-center text-[11px] pointer-events-none z-10 ${
                    dark
                        ? "translate-x-1 bg-linear-to-br from-indigo-500 to-purple-600 ring-1 ring-white/20"
                        : "translate-x-7 bg-linear-to-br from-amber-300 to-yellow-500 ring-1 ring-black/5"
                }`}
            >
                {dark ? "🌙" : "☀️"}
            </span>
        </button>
    );
}
