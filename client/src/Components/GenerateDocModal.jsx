import { useEffect, useRef } from "react";

/**
 * GenerateDocModal — modale générique réutilisable pour tous les documents.
 *
 * Props :
 *   title       {string}    — Titre de la modale (ex : "Certificat Administratif")
 *   dark        {boolean}   — Thème sombre/clair
 *   onClose     {function}  — Ferme la modale sans rien faire
 *   loading     {boolean}   — true pendant l'appel API (désactive le bouton Générer)
 *   error       {string}    — Message d'erreur à afficher dans la modale
 *   onSubmit    {function}  — Appelée au clic sur "Générer"
 *   children    {ReactNode} — Formulaire spécifique injecté (ex: CertificatAdminForm)
 */
export default function GenerateDocModal({
    title = "Générer un document",
    dark,
    onClose,
    loading,
    error,
    onSubmit,
    children,
}) {
    const overlayRef = useRef(null);

    // Fermer la modale en appuyant sur Échap
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape" && !loading) onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [loading, onClose]);

    // Tokens thème
    const modal = dark
        ? "bg-[#0c1424] border border-white/8 text-white"
        : "bg-white border border-slate-200 text-slate-800";
    const overlay = "rgba(5,10,25,0.70)";
    const labelCls = dark ? "text-slate-400" : "text-slate-500";
    const errBox = dark
        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
        : "bg-rose-50 border-rose-200 text-rose-600";
    const btnCancel = dark
        ? "border-white/10 text-slate-300 hover:bg-white/6"
        : "border-slate-200 text-slate-600 hover:bg-slate-100";

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: overlay, backdropFilter: "blur(8px)" }}
            onClick={(e) => {
                // Clic sur l'overlay → ferme si pas en cours de chargement
                if (e.target === overlayRef.current && !loading) onClose();
            }}
        >
            <div
                className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${modal}`}
                style={{ animation: "docModalIn .22s cubic-bezier(.34,1.56,.64,1)" }}
            >
                {/* Barre décorative bleue en haut */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500" />

                {/* En-tête */}
                <div
                    className={`flex items-center justify-between px-6 pt-6 pb-4 border-b ${
                        dark ? "border-white/8" : "border-slate-100"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {/* Icône document */}
                        <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"
                            }`}
                        >
                            <svg
                                className="w-4.5 h-4.5 w-5 h-5"
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
                        </div>
                        <div>
                            <p
                                className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${labelCls}`}
                            >
                                Génération de document
                            </p>
                            <h2
                                className={`text-[15px] font-bold leading-tight ${
                                    dark ? "text-white" : "text-slate-800"
                                }`}
                            >
                                {title}
                            </h2>
                        </div>
                    </div>

                    {/* Bouton fermeture × */}
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 ${
                            dark ? "hover:bg-white/8 text-slate-400" : "hover:bg-slate-100 text-slate-400"
                        }`}
                    >
                        <svg
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

                {/* Corps — formulaire injecté via children */}
                <div className="px-6 py-5 space-y-4">{children}</div>

                {/* Message d'erreur API */}
                {error && (
                    <div
                        className={`mx-6 mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-xs font-medium ${errBox}`}
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Boutons action */}
                <div
                    className={`flex gap-2.5 px-6 pb-6 ${error ? "" : "pt-0"}`}
                >
                    {/* Annuler */}
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${btnCancel}`}
                    >
                        Annuler
                    </button>

                    {/* Générer */}
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-600 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
                    >
                        {loading ? (
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
                                Génération…
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                Générer
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Animation CSS */}
            <style>{`
                @keyframes docModalIn {
                    from { opacity: 0; transform: scale(.94) translateY(14px); }
                    to   { opacity: 1; transform: scale(1)   translateY(0);    }
                }
            `}</style>
        </div>
    );
}
