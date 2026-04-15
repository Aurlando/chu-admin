// ════════════════════════════════════════════════════════════════════
// ConfirmModal.jsx — Modal de confirmation réutilisable
//
// RÔLE : Affiche une boîte de dialogue de confirmation par-dessus
//        n'importe quelle page, similaire à la photo de référence.
//        Utilisé pour confirmer :
//          - L'enregistrement d'un nouveau personnel (AddPersonnel)
//          - L'annulation d'un formulaire (AddPersonnel)
//          - La mise à jour d'un personnel (UpdateModal)
//          - L'annulation d'une mise à jour (UpdateModal)
//
// PROPS reçues :
//   - dark        : booléen thème sombre/clair
//   - type        : "confirm" | "warning" | "danger"
//                   → change la couleur de l'icône et du bouton de validation
//   - title       : titre de la boîte de dialogue (ex: "Enregistrer le personnel ?")
//   - message     : texte descriptif sous le titre
//   - labelOui    : texte du bouton de confirmation (ex: "Oui, enregistrer")
//   - labelNon    : texte du bouton d'annulation (ex: "Non, continuer")
//   - onConfirm   : fonction appelée si l'utilisateur clique sur "Oui"
//   - onCancel    : fonction appelée si l'utilisateur clique sur "Non" ou l'overlay
// ════════════════════════════════════════════════════════════════════

import { useEffect } from "react";

export default function ConfirmModal({
    dark,
    type = "confirm",
    title,
    message,
    labelOui = "Confirmer",
    labelNon = "Annuler",
    onConfirm,
    onCancel,
}) {
    // ── Fermeture avec la touche Échap → équivaut à "Non"
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onCancel(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onCancel]);

    // ── Couleurs selon le type de confirmation
    // "confirm" → bleu  (enregistrement)
    // "warning" → orange (action irréversible neutre)
    // "danger"  → rouge  (annulation / suppression)
    const iconBg = {
        confirm: dark ? "bg-blue-500/15"   : "bg-blue-50",
        warning: dark ? "bg-amber-500/15"  : "bg-amber-50",
        danger:  dark ? "bg-rose-500/15"   : "bg-rose-50",
    }[type];

    const iconColor = {
        confirm: dark ? "text-blue-400"   : "text-blue-600",
        warning: dark ? "text-amber-400"  : "text-amber-600",
        danger:  dark ? "text-rose-400"   : "text-rose-500",
    }[type];

    const btnOui = {
        confirm: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20",
        warning: "bg-amber-500 hover:bg-amber-400 shadow-amber-500/20",
        danger:  "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20",
    }[type];

    // ── Icône selon le type
    const Icon = () => {
        if (type === "confirm") {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        }
        // warning et danger → icône point d'exclamation (comme la photo de référence)
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        );
    };

    return (
        // ── OVERLAY : fond semi-transparent
        // Clic sur l'overlay → onCancel (équivaut à "Non")
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            {/* ── CARTE de confirmation ── */}
            <div
                className={`w-full max-w-sm rounded-2xl shadow-2xl border p-6 flex flex-col items-center text-center gap-4
                    ${dark ? "bg-[#0d1526] border-white/10" : "bg-white border-slate-200"}`}
                // Stoppe la propagation pour ne pas fermer en cliquant à l'intérieur
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Icône dans un cercle coloré ── */}
                {/* Reproduit le design de la photo de référence */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBg}`}>
                    <div className={iconColor}>
                        <Icon />
                    </div>
                </div>

                {/* ── Titre ── */}
                <h3 className={`text-base font-bold ${dark ? "text-white" : "text-slate-800"}`}>
                    {title}
                </h3>

                {/* ── Message descriptif ── */}
                {message && (
                    <p className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        {message}
                    </p>
                )}

                {/* ── Boutons : Non (gauche) + Oui (droite) ── */}
                {/* Disposition identique à la photo de référence */}
                <div className="flex items-center gap-3 w-full mt-1">
                    {/* Bouton "Non" — neutre, gris */}
                    <button
                        onClick={onCancel}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all
                            ${dark
                                ? "border-white/10 text-slate-300 hover:bg-white/8 hover:border-white/20"
                                : "border-slate-200 text-slate-600 bg-slate-100 hover:bg-slate-200"
                            }`}
                    >
                        {labelNon}
                    </button>

                    {/* Bouton "Oui" — coloré selon le type */}
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg ${btnOui}`}
                    >
                        {labelOui}
                    </button>
                </div>
            </div>
        </div>
    );
}