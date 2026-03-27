import { http, HttpResponse } from 'msw';
import { DEMO_USERS, makeToken } from '../data/users';

export const authHandlers = [
  // Login
  http.post('*/login', async ({ request }) => {
    const body = await request.json();
    const user = DEMO_USERS.find(
      u => u.email === body.email && u.motdepasse === body.motdepasse
    );
    if (!user) {
      return HttpResponse.json({ message: 'Email ou mot de passe incorrect' }, { status: 401 });
    }
    const token = makeToken(user);
    return HttpResponse.json({ token, userId: user.id, nom: user.nom, email: user.email, role: user.role });
  }),

  // Logout
  http.post('*/logout', () => {
    return HttpResponse.json({ message: 'Déconnecté' });
  }),

  // Register
  http.post('*/register', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      message: 'Inscription réussie — votre compte sera validé sous 24h',
      user: { ...body, id: Math.floor(Math.random() * 9000) + 1000 },
    });
  }),

  // Forgot password
  http.post('*/forgot-password', async () => {
    return HttpResponse.json({ message: 'Si ce compte existe, un email a été envoyé.' });
  }),

  // Reset password
  http.post('*/reset-password/:token', async () => {
    return HttpResponse.json({ message: 'Mot de passe réinitialisé avec succès.' });
  }),
];
