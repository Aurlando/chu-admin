/**
 * CertificatAdminForm — formulaire spécifique au Certificat Administratif.
 *
 * Props :
 *   fields      {object}    — { numero, motif, date_delivrance, signataire }
 *   onChange    {function}  — (key, value) => void
 *   dark        {boolean}
 */
export default function CertificatAdminForm({ fields, onChange, dark }) {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Tokens thème
    const labelCls = `text-[11px] font-bold uppercase tracking-widest mb-1.5 block ${
        dark ? "text-slate-400" : "text-slate-500"
    }`;
    const inputCls = `w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none transition-all ${
        dark
            ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/60 focus:bg-white/7"
            : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
    }`;
    const selectCls = `w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none transition-all cursor-pointer appearance-none ${
        dark
            ? "bg-white/5 border-white/10 text-slate-200 focus:border-blue-500/60 [&_option]:bg-[#0c1424] [&_option]:text-slate-200"
            : "bg-white border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
    }`;

    return (
        <div className="space-y-4">
            {/* ── Numéro de référence ── */}
            <div>
                <label className={labelCls}>N° de référence</label>
                <div className="flex items-stretch gap-0">
                    <input
                        type="text"
                        placeholder="045"
                        value={fields.numero}
                        onChange={(e) => onChange("numero", e.target.value)}
                        maxLength={10}
                        className={`${inputCls.replace("w-full", "flex-1")} rounded-r-none border-r-0 text-center font-mono`}
                    />
                    <div
                        className={`flex items-center px-3 text-[11px] font-mono rounded-r-xl border ${
                            dark
                                ? "bg-white/3 border-white/10 text-slate-500"
                                : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                    >
                        /26-MSANP/SG/DGFS/CHUANO/PERS
                    </div>
                </div>
                <p
                    className={`text-[10px] mt-1.5 ${
                        dark ? "text-slate-600" : "text-slate-400"
                    }`}
                >
                    Saisir uniquement la partie variable (ex : 045)
                </p>
            </div>

            {/* ── Motif ── */}
            <div>
                <label className={labelCls}>Motif</label>
                <input
                    type="text"
                    placeholder="Ex : Complément de dossier"
                    value={fields.motif}
                    onChange={(e) => onChange("motif", e.target.value)}
                    className={inputCls}
                />
            </div>

            {/* ── Date de délivrance ── */}
            <div>
                <label className={labelCls}>Date de délivrance</label>
                <input
                    type="date"
                    value={fields.date_delivrance || today}
                    onChange={(e) => onChange("date_delivrance", e.target.value)}
                    className={inputCls}
                    style={
                        dark
                            ? { colorScheme: "dark" }
                            : {}
                    }
                />
            </div>

            {/* ── Signataire ── */}
            <div>
                <label className={labelCls}>Signataire</label>
                <div className="relative">
                    <select
                        value={fields.signataire}
                        onChange={(e) => onChange("signataire", e.target.value)}
                        className={selectCls}
                    >
                        <option value="Directeur">Directeur</option>
                        <option value="ADAAF">ADAAF</option>
                    </select>
                    {/* Chevron décoratif */}
                    <svg
                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                            dark ? "text-slate-500" : "text-slate-400"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
