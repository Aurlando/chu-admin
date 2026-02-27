import { useState } from "react";
import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";

// ════════════════════════════════════════════════════
// App.jsx — Composant racine de l'application
// C'est lui qui décide quelle page afficher :
//   - Login  → si l'utilisateur n'est pas connecté
//   - Dashboard → si l'utilisateur EST connecté
// ════════════════════════════════════════════════════

function App() {
  // ── useState : on vérifie d'abord si un token existe déjà dans
  //    le localStorage (cas d'un rechargement de page).
  //    Si oui → on part directement authentifié (true).
  //    Si non → on affiche le login (false).
  //    Voir Guide.txt § "Pourquoi le rechargement revenait au Login"
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token")
    //   ^^^ Le !! transforme une string (ou null) en booléen :
    //       "eyJ..." → true  |  null → false
  );

  // ── handleLoginSuccess : appelée par Login.jsx quand la connexion réussit.
  //    Elle reçoit le token du back, le stocke, et bascule isAuthenticated à true.
  //    Voir Login.jsx → onLoginSuccess(data.token)
  const handleLoginSuccess = (token) => {
    localStorage.setItem("token", token); // 💾 Sauvegarde le token
    setIsAuthenticated(true);             // 🔓 Déverrouille le Dashboard
  };

  // ── handleLogout : appelée par Sidebar.jsx quand on clique "Déconnexion".
  //    Elle efface le token et rebascule vers le Login.
  //    Voir Sidebar.jsx → onLogout()
  const handleLogout = () => {
    localStorage.removeItem("token"); // 🗑️ Supprime le token
    setIsAuthenticated(false);        // 🔒 Retour au Login
  };

  return (
    <div className="App">
      {/* Rendu conditionnel : si connecté → Dashboard, sinon → Login */}
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;