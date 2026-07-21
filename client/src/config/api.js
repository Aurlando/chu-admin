export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    const defaultHeaders = {};
    if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const isFormData =
        typeof FormData !== "undefined" && options.body instanceof FormData;
    if (!isFormData) {
        defaultHeaders["Content-Type"] = "application/json";
    }

    const headers = {
        ...defaultHeaders,
        ...(options.headers || {}),
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("dernierePageAdmin");
        window.location.reload();
        throw new Error("Session expirée");
    }

    return response;
}
