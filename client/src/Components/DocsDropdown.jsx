import { useEffect, useRef, useState } from "react";
import { DOCUMENT_TYPES } from "./documentTypes";

export default function DocsDropdown({ dark, onSelect, size = "md", typePersonnel }) {
    const [open, setOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState("down");
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        // On écoute aussi le scroll pour refermer (évite un menu détaché si la page scrolle)
        document.addEventListener("scroll", handler, true);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("scroll", handler, true);
        };
    }, []);

    const isSm = size === "sm";

    const availableDocuments = Object.entries(DOCUMENT_TYPES).filter(([key, config]) => {
        if (!typePersonnel) return true;
        if (!config.allowedTypes) return true;
        return config.allowedTypes.includes(typePersonnel);
    });

    const isDisabled = availableDocuments.length === 0;

    const baseTriggerCls = isSm
        ? dark
            ? "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-violet-500/25 text-violet-400 transition-all "
            : "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-violet-200 text-violet-600 transition-all "
        : dark
          ? "flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-violet-500/30 text-violet-400 transition-all "
          : "flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-violet-200 text-violet-600 transition-all ";

    const triggerCls = baseTriggerCls + (isDisabled 
        ? "opacity-50 cursor-not-allowed grayscale "
        : (isSm 
            ? (dark ? "hover:bg-violet-500/10 cursor-pointer " : "hover:bg-violet-50 cursor-pointer ")
            : (dark ? "hover:bg-violet-500/10 hover:-translate-y-0.5 cursor-pointer " : "hover:bg-violet-50 hover:-translate-y-0.5 cursor-pointer ")
        )
    );

    const positionCls = menuPosition === 'up'
        ? (isSm ? "bottom-full mb-1" : "bottom-full mb-1.5")
        : (isSm ? "top-full mt-1" : "top-full mt-1.5");

    const menuCls = `absolute right-0 z-30 py-1 shadow-2xl rounded-xl border ${isSm ? "w-52" : "w-56"} ${positionCls} ${
        dark ? "border-white/10 bg-[#0d1526]" : "border-slate-200 bg-white"
    }`;

    const itemCls = isSm
        ? dark
            ? "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left"
            : "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-colors cursor-pointer text-left"
        : dark
          ? "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left"
          : "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-colors cursor-pointer text-left";

    const iconCls = isSm ? "w-3.5 h-3.5" : "w-4 h-4";

    const toggleOpen = (e) => {
        e.stopPropagation();
        if (isDisabled) return;
        
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            // Si l'espace restant en bas de l'écran est inférieur à 180px, on ouvre vers le haut
            if (window.innerHeight - rect.bottom < 180) {
                setMenuPosition("up");
            } else {
                setMenuPosition("down");
            }
        }
        setOpen((o) => !o);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={toggleOpen}
                className={triggerCls}
                title={isDisabled ? "Aucun document disponible" : "Générer un document"}
                disabled={isDisabled}
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

            {open && !isDisabled && (
                <div className={menuCls}>
                    <div
                        className={`px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest ${dark ? "text-slate-600" : "text-slate-400"}`}
                    >
                        Documents disponibles
                    </div>
                    {availableDocuments.map(([key, config]) => (
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
