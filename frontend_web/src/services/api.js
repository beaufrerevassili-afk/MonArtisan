import axios from 'axios';

// Source unique de l'URL backend — importer API_URL partout au lieu de dupliquer
export const API_URL = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';

// Callback pour les toasts d'erreur (connecté par ToastProvider au mount)
let _errorToast = null;
export function setApiErrorToast(fn) { _errorToast = fn; }

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

// Intercepteur réponse : toast automatique sur erreur + redirect 401
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

    // Toast d'erreur automatique (silencieux pour les comptes démo sans backend)
    if (_errorToast && !isDemo) {
      const status = error.response?.status;
      const msg = error.response?.data?.erreur || error.response?.data?.message;
      if (status === 403 && msg === 'Compte suspendu') {
        _errorToast('Votre compte a été suspendu', 'error');
        localStorage.removeItem('token');
        setTimeout(() => { window.location.href = '/login'; }, 1500);
      } else if (status === 403) {
        _errorToast('Accès refusé', 'error');
      } else if (status === 404) {
        _errorToast('Ressource introuvable', 'warning');
      } else if (status >= 500) {
        _errorToast('Erreur serveur — réessayez dans un instant', 'error');
      } else if (!error.response && error.code === 'ERR_NETWORK') {
        // Pas de toast sur erreur réseau en mode démo (pas de backend)
      } else if (msg) {
        _errorToast(msg, 'error');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
