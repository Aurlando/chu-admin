import { useState, useEffect } from "react";
import ToggleMode from "./ToggleMode";
import { API_BASE, apiFetch } from "../config/api.js";
import chuLogo from "../assets/chuLOGO.png";
import chuLogoSombre from "../assets/chuLOGOsombre.png";
import chuLogoclair from "../assets/chuLOGOclair.png";

export default function Login({ onLoginSuccess }) {
    const [darkMode, setDarkMode] = useState(
        () =>
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // ── Écouteur pour le thème système
    // Permet de basculer automatiquement entre les modes clair et sombre en fonction des préférences de l'utilisateur
    useEffect(() => {
        if (!window.matchMedia) return;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => setDarkMode(e.matches);

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        } else {
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, []);

    // ── handleSubmit : envoi du formulaire vers l'API back
    const handleSubmit = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page (comportement HTML par défaut)
        setError("");

        if (!username || !password) {
            setError("Veuillez remplir tous les champs.");
            return;
        }

        setLoading(true);
        try {
            const res = await apiFetch(`${API_BASE}/auth/login`, {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                onLoginSuccess(data.token);
            } else {
                setError(data.message || "Identifiants incorrects.");
            }
        } catch {
            setError("Impossible de joindre le serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`relative min-h-screen flex items-center justify-center transition-colors duration-500 ${
                darkMode
                    ? "bg-gray-950"
                    : "bg-linear-to-br from-slate-200 via-blue-100 to-indigo-200"
            }`}
        >
            {/* ── Bouton Toggle Nuit/Jour — coin supérieur droit ── */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
                <ToggleMode
                    dark={darkMode}
                    onToggle={() => setDarkMode(!darkMode)}
                    className={`shadow-xl transition-all duration-700 ${
                        mounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                    }`}
                />
            </div>

            {/* ── Carte principale (animation d'entrée via mounted) ── */}
            <div
                className={`flex rounded-3xl overflow-hidden shadow-2xl w-full max-w-3xl mx-4 transition-all duration-500 ${
                    mounted
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                }`}
                style={{ transition: "opacity 0.6s ease, transform 0.6s ease" }}
            >
                {/* ════ PANNEAU GAUCHE — Décoratif ════ */}
                <div
                    className={`hidden md:flex flex-col items-center justify-center w-2/5 p-10 relative overflow-hidden ${
                        darkMode
                            ? "bg-linear-to-br from-indigo-900 to-blue-950"
                            : "bg-linear-to-br from-indigo-400 to-blue-500"
                    }`}
                >
                    {/* Cercles décoratifs */}
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white opacity-10" />
                    <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white opacity-10" />

                    {/* Logo + Nom hôpital */}
                    <div className="relative z-10 flex flex-col items-center gap-6">
                        <div className="w-40 h-40 flex items-center justify-center">
                            <img
                                src={darkMode ? chuLogoSombre : chuLogoclair}
                                alt="CHU Anosiala"
                                className="w-36 h-36 object-contain"
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-white/70 text-sm mt-1">
                                Portail Administrateur
                            </p>
                        </div>
                    </div>
                </div>

                {/* ════ PANNEAU DROIT — Formulaire ════ */}
                <div
                    className={`flex-1 p-10 flex flex-col justify-center transition-colors duration-500 ${
                        darkMode
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-800"
                    }`}
                >
                    {/* Sélecteur de langue (décoratif) */}

                    {/* Titre */}
                    <h1
                        className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}
                        style={{ fontFamily: "'Georgia', serif" }}
                    >
                        Admin
                    </h1>
                    <p
                        className={`text-sm mb-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                        Connectez-vous à votre espace administrateur
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        {/* Champ Identifiant */}
                        <div>
                            <label
                                className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                                Identifiant
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Entrez votre identifiant"
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${
                                    darkMode
                                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                                        : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                                }`}
                            />
                        </div>

                        {/* Champ Mot de passe */}
                        <div>
                            <label
                                className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Entrez votre mot de passe"
                                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 pr-12 ${
                                        darkMode
                                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                                            : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                                    }`}
                                />
                                {/* Bouton afficher/masquer mot de passe */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Message d'erreur */}
                        {error && (
                            <p
                                className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                                    darkMode
                                        ? "text-red-400 bg-red-950/40 boder border-red-800/40"
                                        : "text-red-500 bg-red-50 border border-red-200"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 shrink-0"
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
                            </p>
                        )}

                        {/* Bouton Se connecter */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full py-3 rounded-xl font-semibold text-white text-sm tracking-wide transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 cursor-pointer"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin w-4 h-4"
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
                                    Connexion...
                                </span>
                            ) : (
                                "Se connecter"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}