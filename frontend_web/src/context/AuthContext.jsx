import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.id, nom: payload.nom, email: payload.email, role: payload.role, secteur: payload.secteur || null });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          sessionStorage.removeItem('token');
        }
      } catch {
        sessionStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  async function login(email, motdepasse) {
    // Compte démo Freample — fonctionne sans backend
    if (email === 'freamplecom@gmail.com') {
      const header = btoa(JSON.stringify({alg:'HS256',typ:'JWT'}));
      const payload = btoa(JSON.stringify({id:999,nom:'Dev Freample',email,role:'fondateur',exp:Math.floor(Date.now()/1000)+86400}));
      const devToken = `${header}.${payload}.dev`;
      sessionStorage.setItem('token', devToken);
      setUser({ id:999, nom:'Dev Freample', email, role:'fondateur', secteur:null });
      return { userId:999, nom:'Dev Freample', email, role:'fondateur', token:devToken };
    }
    const { data } = await api.post('/login', { email, motdepasse });
    sessionStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser({ id: data.userId, nom: data.nom, email: data.email, role: data.role, secteur: data.secteur || null });
    return data;
  }

  async function logout() {
    await api.post('/logout').catch(() => {});
    sessionStorage.removeItem('token');
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
