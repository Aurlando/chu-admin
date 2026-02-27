import { useState, useEffect } from "react";

// ════════════════════════════════════════════════════
// Login.jsx — Page de connexion
// Props reçues depuis App.jsx :
//   - onLoginSuccess(token) : fonction à appeler quand
//     la connexion réussit, en passant le token au parent
// ════════════════════════════════════════════════════

export default function Login({ onLoginSuccess }) {
  const [darkMode, setDarkMode]       = useState(false);
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  // ── useEffect : déclenche une animation d'entrée après le montage
  //    "mounted" sert juste à faire apparaître la carte (opacity + translateY)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Connexion réussie : on remonte le token vers App.jsx
        //    App.jsx va le stocker dans localStorage et afficher le Dashboard
        //    Voir App.jsx → handleLoginSuccess(token)
        onLoginSuccess(data.token);
      } else {
        // ❌ Le back renvoie une erreur (ex: mot de passe incorrect)
        setError(data.message || "Identifiants incorrects.");
      }
    } catch (err) {
      // ❌ Le serveur est injoignable (éteint, CORS, réseau...)
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false); // Dans tous les cas, on arrête le spinner
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        darkMode ? "bg-gray-950" : "bg-gradient-to-br from-slate-200 via-blue-100 to-indigo-200"
      }`}
    >
      {/* ── Bouton Toggle Nuit/Jour — coin supérieur droit ── */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-5 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          darkMode
            ? "bg-indigo-500 text-white hover:bg-indigo-400"
            : "bg-white text-indigo-600 hover:bg-indigo-50"
        }`}
        title={darkMode ? "Mode jour" : "Mode nuit"}
      >
        {darkMode ? (
          // Icône Soleil (mode jour)
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          // Icône Lune (mode nuit)
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>

      {/* ── Carte principale (animation d'entrée via mounted) ── */}
      <div
        className={`flex rounded-3xl overflow-hidden shadow-2xl w-full max-w-3xl mx-4 transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transition: "opacity 0.6s ease, transform 0.6s ease" }}
      >
        {/* ════ PANNEAU GAUCHE — Décoratif ════ */}
        <div
          className={`hidden md:flex flex-col items-center justify-center w-2/5 p-10 relative overflow-hidden ${
            darkMode
              ? "bg-gradient-to-br from-indigo-900 to-blue-950"
              : "bg-gradient-to-br from-indigo-400 to-blue-500"
          }`}
        >
          {/* Cercles décoratifs */}
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white opacity-10" />
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white opacity-10" />

          {/* Logo + Nom hôpital */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg ${darkMode ? "bg-indigo-700" : "bg-white/20"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-white font-bold text-2xl tracking-wide" style={{ fontFamily: "'Georgia', serif" }}>
                CHU Anosiala
              </h2>
              <p className="text-white/70 text-sm mt-1">Portail Administrateur</p>
            </div>
          </div>
        </div>

        {/* ════ PANNEAU DROIT — Formulaire ════ */}
        <div
          className={`flex-1 p-10 flex flex-col justify-center transition-colors duration-500 ${
            darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
          }`}
        >
          {/* Sélecteur de langue (décoratif) */}
          <div className="flex justify-end mb-4">
            <span className={`text-xs flex items-center gap-1 ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Français (FR) ▾
            </span>
          </div>

          {/* Titre */}
          <h1 className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-800"}`} style={{ fontFamily: "'Georgia', serif" }}>
            Admin
          </h1>
          <p className={`text-sm mb-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Connectez-vous à votre espace administrateur
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Champ Identifiant */}
            <div>
              <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
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
              <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <p className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                darkMode ? "text-red-400 bg-red-950/40 border border-red-800/40" : "text-red-500 bg-red-50 border border-red-200"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            )}

            {/* Bouton Se connecter */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl font-semibold text-white text-sm tracking-wide transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
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