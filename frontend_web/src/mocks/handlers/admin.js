import { http, HttpResponse } from 'msw';
import { ADMIN_DASHBOARD, ADMIN_ARTISANS_EN_ATTENTE } from '../data/demo';

let artisansEnAttente = [...ADMIN_ARTISANS_EN_ATTENTE];

export const adminHandlers = [
  http.get('*/dashboard/admin', () => HttpResponse.json(ADMIN_DASHBOARD)),

  http.get('*/admin/artisans-en-attente', () =>
    HttpResponse.json({ artisans: artisansEnAttente })
  ),

  http.put('*/admin/valider-artisan/:id', async ({ request, params }) => {
    const { decision } = await request.json();
    if (decision === 'valider') {
      artisansEnAttente = artisansEnAttente.filter(a => a.id !== Number(params.id));
    } else {
      artisansEnAttente = artisansEnAttente.map(a =>
        a.id === Number(params.id) ? { ...a, statut: 'refusé' } : a
      );
    }
    return HttpResponse.json({ ok: true });
  }),

  http.put('*/admin/suspendre/:id', ({ params }) => {
    return HttpResponse.json({ ok: true, message: 'Compte suspendu (démo)' });
  }),
];
