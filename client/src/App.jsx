import { useState } from "react";
import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token")

  );

  const handleLoginSuccess = (token) => {
    localStorage.setItem("token", token); // 💾 Sauvegarde le token
    setIsAuthenticated(true);             // 🔓 Déverrouille le Dashboard
  };

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