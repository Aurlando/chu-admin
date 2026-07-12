import DocumentCommonFields from "./DocumentCommonFields";
import { DOCUMENT_TYPES } from "./documentTypes";

/**
 * DocumentForm — formulaire générique pour la modale de génération de
 * documents. Rend toujours le socle commun (numero, date_delivrance,
 * signataire), puis les champs propres au type de document (s'il y en a),
 * d'après le registre DOCUMENT_TYPES.
 *
 * Remplace les anciens formulaires dédiés (ex: CertificatAdminForm) —
 * un nouveau type de document n'a besoin que d'un petit composant
 * "ExtraFields" déclaré dans documentTypes.js, pas d'un formulaire entier.
 *
 * Props :
 *   type        {string}    — clé de DOCUMENT_TYPES (ex: "certificat_administratif")
 *   fields      {object}    — valeurs actuelles du formulaire
 *   onChange    {function}  — (key, value) => void
 *   dark        {boolean}
 */
export default function DocumentForm({ type, fields, onChange, dark }) {
    const config = DOCUMENT_TYPES[type];
    if (!config) return null;

    const ExtraFields = config.ExtraFields;

    return (
        <div className="space-y-4">
            <DocumentCommonFields fields={fields} onChange={onChange} dark={dark} />
            {ExtraFields && (
                <ExtraFields fields={fields} onChange={onChange} dark={dark} />
            )}
        </div>
    );
}
