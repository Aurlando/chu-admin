/**
 * CertificatExtraFields — champ(s) propre(s) au Certificat Administratif,
 * en plus du socle commun (numero, date_delivrance, signataire) rendu
 * par DocumentCommonFields.
 *
 * Props :
 *   fields      {object}    — { motif, ... }
 *   onChange    {function}  — (key, value) => void
 *   dark        {boolean}
 */
export default function CertificatExtraFields({ fields, onChange, dark }) {
    const labelCls = `text-[11px] font-bold uppercase tracking-widest mb-1.5 block ${
        dark ? "text-slate-400" : "text-slate-500"
    }`;
    const inputCls = `w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none transition-all ${
        dark
            ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/60 focus:bg-white/7"
            : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
    }`;

    return (
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
    );
}
