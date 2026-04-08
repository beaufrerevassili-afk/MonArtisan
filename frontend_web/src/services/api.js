import axios from 'axios';

// Source unique de l'URL backend — importer API_URL partout au lieu de dupliquer
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Injecter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Rediriger vers /login si session expirée (sauf comptes démo et erreurs réseau)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const token = localStorage.getItem('token');
    const isDemo = token && token.endsWith('.dev');
    // Ne déconnecter que sur une vraie 401 du serveur, jamais pour les comptes démo ou erreurs réseau
    if (error.response?.status === 401 && !url.includes('/login') && !isDemo) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
