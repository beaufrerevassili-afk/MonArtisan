import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaure la session depuis le cookie HttpOnly via /me
  useEffect(() => {
    api.get('/me')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, motdepasse) {
    const { data } = await api.post('/login', { email, motdepasse });
    setUser({ id: data.userId, nom: data.nom, email: data.email, role: data.role });
    return data;
  }

  async function logout() {
    await api.post('/logout').catch(() => {});
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
