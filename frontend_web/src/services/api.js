import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Intercepteur réponse : rediriger vers /login uniquement si l'utilisateur est connecté
// (ne pas rediriger sur /me — c'est une vérification de session normale)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/me') && !url.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
