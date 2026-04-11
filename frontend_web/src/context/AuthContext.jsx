import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.id, nom: payload.nom, email: payload.email, role: payload.role, secteur: payload.secteur || null, patronId: payload.patronId || null });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Comptes démo — fonctionnent sans backend
  const DEMO_ACCOUNTS = {
    'freamplecom@gmail.com': { id:999, nom:'Dev Freample', role:'fondateur', secteur:null },
    'demo-client@freample.fr': { id:900, nom:'Marie Dupont', role:'client', secteur:null },
    'demo-entreprise@freample.fr': { id:904, nom:'SAS Dupont & Fils', role:'client', secteur:null, clientType:'entreprise' },
    'demo-sci@freample.fr': { id:905, nom:'SCI Riviera', role:'patron', secteur:'immo', entrepriseType:'sci' },
    'demo-patron@freample.fr': { id:901, nom:'Jean Martin BTP', role:'patron', secteur:'btp' },
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
      setUser({ ...demo, email });
      return { userId:demo.id, ...demo, email, token:devToken };
    }
    const { data } = await api.post('/login', { email, motdepasse });
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser({ id: data.userId, nom: data.nom, email: data.email, role: data.role, secteur: data.secteur || null, patronId: data.patronId || null });
    return data;
  }

  async function logout() {
    await api.post('/logout').catch(() => {});
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
