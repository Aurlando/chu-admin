import { useEffect, useRef, useState } from "react";
import { DOCUMENT_TYPES } from "./documentTypes";

/**
 * DocsDropdown — bouton "Docs ▾" générique : un menu déroulant listant
 * tous les documents disponibles d'après DOCUMENT_TYPES. Ajouter un
 * document dans ce registre suffit à le faire apparaître ici, dans les
 * deux tailles (liste et profil), sans dupliquer de code.
 *
 * Remplace les anciens DocsDropdown (PersonnelDirectory) et
 * ProfileDocsDropdown (Staffprofile), identiques à un habillage près.
 *
 * Props :
 *   dark      {boolean}
 *   onSelect  {function}  — (typeKey, event) => void — appelé au clic sur un document
 *   size      {"sm"|"md"} — "sm" = compact (ligne de tableau), "md" = en-tête profil (défaut)
 */
export default function DocsDropdown({ dark, onSelect, size = "md" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const isSm = size === "sm";

    const triggerCls = isSm
        ? dark
            ? "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-violet-500/25 text-violet-400 hover:bg-violet-500/10 transition-all cursor-pointer"
            : "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-violet-200 text-violet-600 hover:bg-violet-50 transition-all cursor-pointer"
        : dark
          ? "flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-all hover:-translate-y-0.5 cursor-pointer"
          : "flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-violet-200 text-violet-600 hover:bg-violet-50 transition-all hover:-translate-y-0.5 cursor-pointer";

    const menuCls = isSm
        ? dark
            ? "absolute right-0 top-full mt-1 w-52 rounded-xl border border-white/10 bg-[#0d1526] shadow-2xl z-30 py-1"
            : "absolute right-0 top-full mt-1 w-52 rounded-xl border border-slate-200 bg-white shadow-2xl z-30 py-1"
        : dark
          ? "absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-white/10 bg-[#0d1526] shadow-2xl z-30 py-1"
          : "absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-slate-200 bg-white shadow-2xl z-30 py-1";

    const itemCls = isSm
        ? dark
            ? "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left"
            : "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-colors cursor-pointer text-left"
        : dark
          ? "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left"
          : "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-colors cursor-pointer text-left";

    const iconCls = isSm ? "w-3.5 h-3.5" : "w-4 h-4";

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((o) => !o);
                }}
                className={triggerCls}
                title="Générer un document"
            >
                <svg
                    className={iconCls}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                {isSm ? <span className="hidden sm:inline">Docs</span> : "Docs"}
                <svg
                    className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {open && (
                <div className={menuCls}>
                    <div
                        className={`px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest ${dark ? "text-slate-600" : "text-slate-400"}`}
                    >
                        Documents disponibles
                    </div>
                    {Object.entries(DOCUMENT_TYPES).map(([key, config]) => (
                        <button
                            key={key}
                            type="button"
                            className={itemCls}
                            onClick={(e) => {
                                setOpen(false);
                                onSelect(key, e);
                            }}
                        >
                            <svg
                                className={`${iconCls} text-violet-400 shrink-0`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            {config.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
