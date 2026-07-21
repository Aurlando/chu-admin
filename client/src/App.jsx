import { useState } from "react";
import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";
import "./App.css";

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token")

  );

  const handleLoginSuccess = (token) => {
    localStorage.setItem("token", token); 
    localStorage.removeItem("dernierePageAdmin"); // 🧹 On force le retour à zéro
    setIsAuthenticated(true); 
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("dernierePageAdmin"); // 🧹 On oublie la dernière page visitée
    setIsAuthenticated(false); 
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