// ════════════════════════════════════════════════════════════════════
// documentTypes.js — Registre central des documents générables
// ════════════════════════════════════════════════════════════════════
// Miroir côté front du registre TYPES_DOCUMENTS de documentService.js.
// Le dropdown "Docs ▾" et la modale de génération lisent cette liste :
// ajouter une entrée ici suffit à faire apparaître le document partout
// (PersonnelDirectory, StaffProfile, et tout futur écran) sans toucher
// à la logique d'ouverture/soumission de la modale.
//
// Pour ajouter un nouveau document :
//   1. Si ce document a des champs en plus de numero/date_delivrance/
//      signataire (déjà gérés par DocumentCommonFields), créer un petit
//      composant "ExtraFields" (voir CertificatExtraFields.jsx pour
//      l'exemple du champ "motif").
//   2. Ajouter une entrée ci-dessous avec le même `endpoint` que la
//      route backend (documentRoutes.js).
//   3. Rien d'autre à faire : DocsDropdown, DocumentForm et
//      useDocumentGenerator sont déjà génériques.

import CertificatExtraFields from "./CertificatExtraFields";

export const DOCUMENT_TYPES = {
    certificat_administratif: {
        label: "Certificat Administratif",
        endpoint: "certificat-administratif",
        filenamePrefix: "certificat",
        // Champ(s) propre(s) à ce document, rendus après les champs communs
        ExtraFields: CertificatExtraFields,
        extraDefaults: { motif: "" },
    },
    attestation_non_interruption_service: {
        label: "Attestation de non-interruption de service",
        endpoint: "attestation-non-interruption-service",
        filenamePrefix: "attestation_non_interruption",
        // Aucun champ en plus de numero/date_delivrance/signataire
        ExtraFields: null,
        extraDefaults: {},
    },
};
