import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { sha256, isNotExpired } from '../utils/security';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.id, nom: payload.nom, email: payload.email, role: payload.role, secteur: payload.secteur || null, patronId: payload.patronId || null, suspendu: payload.suspendu || false });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  // Comptes démo — fonctionnent sans backend
  const DEMO_ACCOUNTS = {
    'demo-client@freample.fr': { id:900, nom:'Marie Dupont', role:'client', secteur:null },
    'demo-entreprise@freample.fr': { id:904, nom:'SAS Dupont & Fils', role:'client', secteur:null, clientType:'entreprise' },
    'demo-patron@freample.fr': { id:901, nom:'Marc Lambert BTP', role:'patron', secteur:'btp' },
    'demo-ae@freample.fr': { id:906, nom:'Thomas Petit Plomberie', role:'patron', secteur:'btp', entrepriseType:'ae' },
    'demo-employe@freample.fr': { id:902, nom:'Lucas Garcia', role:'employe', secteur:'btp', patronId:901 },
    'demo-artisan@freample.fr': { id:903, nom:'Marc Lambert', role:'artisan', secteur:'btp' },
  };

  async function login(email, motdepasse) {
    // Comptes démo — fonctionne sans backend
    const demo = DEMO_ACCOUNTS[email];
    if (demo) {
      const header = btoa(JSON.stringify({alg:'HS256',typ:'JWT'}));
      const payload = btoa(JSON.stringify({...demo, email, exp:Math.floor(Date.now()/1000)+86400}));
      const devToken = `${header}.${payload}.dev`;
      localStorage.setItem('token', devToken);
      setToken(devToken);
      setUser({ ...demo, email });
      return { userId:demo.id, ...demo, email, token:devToken };
    }
    // Comptes auto-créés (clients qui ont signé un devis via lien direct)
    // Hash le mot de passe saisi et compare au hash stocké (jamais en clair)
    try {
      const autoComptes = JSON.parse(localStorage.getItem('freample_clients_auto') || '[]');
      const compteAuto = autoComptes.find(c => c.email === email);
      if (compteAuto) {
        // Support rétrocompatibilité : anciens comptes avec motDePasse en clair
        let matches = false;
        if (compteAuto.motDePasseHash) {
          const saisiHash = await sha256(motdepasse);
          matches = compteAuto.motDePasseHash === saisiHash;
        } else if (compteAuto.motDePasse) {
          // Ancien format (déprécié) — migrer vers hash
          matches = compteAuto.motDePasse === motdepasse;
          if (matches) {
            // Migration silencieuse : hasher et supprimer le clair
            compteAuto.motDePasseHash = await sha256(motdepasse);
            delete compteAuto.motDePasse;
            const idx = autoComptes.findIndex(c => c.email === email);
            if (idx >= 0) { autoComptes[idx] = compteAuto; localStorage.setItem('freample_clients_auto', JSON.stringify(autoComptes)); }
          }
        }
        if (matches) {
          const userData = { id: compteAuto.id, nom: compteAuto.nom, role: 'client', secteur: null };
          const header = btoa(JSON.stringify({alg:'HS256',typ:'JWT'}));
          const payload = btoa(JSON.stringify({...userData, email, exp:Math.floor(Date.now()/1000)+86400}));
          const devToken = `${header}.${payload}.dev`;
          localStorage.setItem('token', devToken);
          setToken(devToken);
          setUser({ ...userData, email });
          return { userId: userData.id, ...userData, email, token: devToken };
        }
      }
    } catch {}
    const { data } = await api.post('/login', { email, motdepasse });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser({ id: data.userId, nom: data.nom, email: data.email, role: data.role, secteur: data.secteur || null, patronId: data.patronId || null, suspendu: data.suspendu || false, motifSuspension: data.motifSuspension || null });
    return data;
  }

  async function loginWithMagicToken(magicToken) {
    try {
      const autoComptes = JSON.parse(localStorage.getItem('freample_clients_auto') || '[]');
      const compte = autoComptes.find(c => c.magicToken === magicToken);
      if (!compte) throw new Error('Lien invalide');
      // Vérifier expiration (24h par défaut)
      if (compte.magicTokenExpire && !isNotExpired(compte.magicTokenExpire)) {
        throw new Error('Ce lien a expiré. Demandez un nouveau lien.');
      }
      const userData = { id: compte.id, nom: compte.nom, role: 'client', secteur: null };
      const header = btoa(JSON.stringify({alg:'HS256',typ:'JWT'}));
      const payload = btoa(JSON.stringify({...userData, email: compte.email, exp:Math.floor(Date.now()/1000)+86400}));
      const devToken = `${header}.${payload}.dev`;
      localStorage.setItem('token', devToken);
      setToken(devToken);
      setUser({ ...userData, email: compte.email });
      return compte;
    } catch (e) {
      throw e;
    }
  }

  async function logout() {
    await api.post('/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('freample_projet_brouillon');
    localStorage.removeItem('freample_clients_auto');

    localStorage.removeItem('freample_trajet_today');
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithMagicToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
