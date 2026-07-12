import { useState } from "react";
import { API_BASE } from "../config/api";
import { DOCUMENT_TYPES } from "./documentTypes";

const today = () => new Date().toISOString().split("T")[0];

/**
 * useDocumentGenerator — logique partagée pour ouvrir la modale de
 * génération de document, gérer son formulaire, et appeler l'API.
 *
 * Auparavant dupliquée (docModal/certFields/handleGenerate...) dans
 * PersonnelDirectory.jsx ET Staffprofile.jsx. Un seul hook, utilisé
 * aux deux endroits.
 *
 * @param {function} showToast - (message, type?) => void
 */
export function useDocumentGenerator(showToast) {
    // docModal : { type, agentId } | null
    const [docModal, setDocModal] = useState(null);
    const [docFields, setDocFields] = useState({});
    const [docLoading, setDocLoading] = useState(false);
    const [docError, setDocError] = useState(null);

    // Ouvre la modale pour un type de document + un agent donnés
    const openDocModal = (type, agentId) => {
        const config = DOCUMENT_TYPES[type];
        if (!config) {
            console.error(`Type de document inconnu : ${type}`);
            return;
        }
        setDocFields({
            numero: "",
            date_delivrance: today(),
            signataire: "Directeur",
            ...config.extraDefaults,
        });
        setDocError(null);
        setDocModal({ type, agentId });
    };

    const closeDocModal = () => {
        if (!docLoading) setDocModal(null);
    };

    const updateDocField = (key, value) =>
        setDocFields((prev) => ({ ...prev, [key]: value }));

    // Génère le document et déclenche le téléchargement
    const generateDoc = async () => {
        if (!docModal) return;
        const config = DOCUMENT_TYPES[docModal.type];
        const token = localStorage.getItem("token");
        setDocLoading(true);
        setDocError(null);
        try {
            const res = await fetch(
                `${API_BASE}/documents/${config.endpoint}/${docModal.agentId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(docFields),
                },
            );
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.message || `Erreur ${res.status}`);
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${config.filenamePrefix}_${docModal.agentId}.docx`;
            a.click();
            window.URL.revokeObjectURL(url);
            setDocModal(null);
            if (typeof showToast === "function") {
                showToast("Document généré avec succès !");
            }
        } catch (err) {
            setDocError(err.message);
        } finally {
            setDocLoading(false);
        }
    };

    return {
        docModal,
        docFields,
        docLoading,
        docError,
        openDocModal,
        closeDocModal,
        updateDocField,
        generateDoc,
    };
}
