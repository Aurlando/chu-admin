import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import logoHospital from '../assets/image/chu-anosiala-logo.png'

const LoginPage = () => {
  // --- 1. LES ÉTATS (LA MÉMOIRE DU COMPOSANT) ---
  
  // Stocke ce que l'utilisateur écrit dans les champs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Gère l'affichage du mot de passe (oeil ouvert/fermé)
  const [showPassword, setShowPassword] = useState(false);
  
  // Gère les messages de retour (Succès ou Erreur)
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
  
  // Gère l'état de chargement (pour désactiver le bouton pendant l'envoi)
  const [isLoading, setIsLoading] = useState(false);

  // --- 2. LA FONCTION D'ENVOI (COMMUNICATION AVEC LE BACK) ---

  const handleLogin = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsLoading(true); // Active l'état de chargement
    setStatusMessage({ text: '', isError: false }); // Réinitialise les messages

    try {
      // On envoie la requête à l'API
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,    // On envoie la variable 'email'
          password: password  // On envoie la variable 'password'
        }),
      });

      const data = await response.json(); // On transforme la réponse du serveur en objet

      if (response.ok) {
        // SUCCÈS : Le serveur a dit OK (code 200)
        setStatusMessage({ text: "Connexion réussie ! Redirection...", isError: false });
        console.log("Données reçues du back :", data);
        // Ici, tu pourrais utiliser 'window.location.href = "/dashboard"' pour rediriger
      } else {
        // ERREUR : Le serveur a renvoyé une erreur (ex: 401 mot de passe faux)
        setStatusMessage({ text: data.error || "Identifiants incorrects", isError: true });
      }
    } catch (error) {
      // ERREUR RÉSEAU : Le serveur ne répond pas (éteint)
      setStatusMessage({ text: `Erreur : Le serveur ne répond pas .`, isError: true });
    } finally {
      setIsLoading(false); // On arrête le chargement, quoi qu'il arrive
    }
  };

  // --- 3. LE RENDU VISUEL (HTML / TAILWIND) ---

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-200 rounded-2xl mb-4 shadow-sm">
        <img 
            src = {logoHospital}
            alt="Logo CHU Anosiala"
            className='w-full h-full object-contain p-1'
           />      
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">CHU Anosiala</h1>
        <p className="text-sm text-slate-500 font-medium">Système Information Hospitalier</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-105 bg-white rounded-4xl border-[3px] border-sky-200 p-10 shadow-xl shadow-sky-900/5">
        <h2 className="text-xl font-bold text-slate-800 mb-8">Login</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Champ Username / Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identifiants</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500" size={18} />
              <input 
                type="text" 
                required
                value={email} // Lié à l'état
                onChange={(e) => setEmail(e.target.value)} // Met à jour l'état
                placeholder="Enter your ID or email"
                className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Champ Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password} // Lié à l'état
                onChange={(e) => setPassword(e.target.value)} // Met à jour l'état
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-12 text-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Affichage des messages d'erreur ou de succès */}
          {statusMessage.text && (
            <p className={`text-xs text-center font-bold p-2 rounded-lg ${statusMessage.isError ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50'}`}>
              {statusMessage.text}
            </p>
          )}

          {/* Bouton de soumission */}
          <button 
            type="submit"
            disabled={isLoading} // Désactive le bouton pendant l'envoi
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-200 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? "Connecting..." : "Login"} <LogIn size={20} />
          </button>
        </form>
      </div>
  
    </div>
  );
};

export default LoginPage;