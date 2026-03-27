import { http, HttpResponse } from 'msw';
import {
  CLIENT_DASHBOARD, CLIENT_ARTISANS, CLIENT_DEVIS,
  CLIENT_PAIEMENTS, CLIENT_PARRAINAGE,
  getMessages, saveMessages,
  MISSIONS,
} from '../data/demo';

const CONVERSATIONS = [
  { missionId: 101, titre: 'Réparation fuite sous évier',   artisan: 'Carlos Silva',   specialite: 'Plomberie'   },
  { missionId: 102, titre: 'Installation prise électrique', artisan: 'Éric Leroy',     specialite: 'Électricité' },
];

let devis    = [...CLIENT_DEVIS];
let missions = [...MISSIONS];

export const clientHandlers = [
  // Dashboard
  http.get('*/dashboard/client', () => HttpResponse.json(CLIENT_DASHBOARD)),

  // Conversations list
  http.get('*/client/conversations', () => HttpResponse.json({ conversations: CONVERSATIONS })),

  // Artisans list + search
  http.get('*/client/artisans', ({ request }) => {
    const url = new URL(request.url);
    const q   = url.searchParams.get('q')?.toLowerCase() || '';
    const filtered = q
      ? CLIENT_ARTISANS.filter(a => a.nom.toLowerCase().includes(q) || a.specialite.toLowerCase().includes(q))
      : CLIENT_ARTISANS;
    return HttpResponse.json(filtered);
  }),

  // Devis client
  http.get('*/client/devis-client', () => HttpResponse.json({ devis })),

  http.post('*/client/devis-client/:id/accepter', ({ params }) => {
    devis = devis.map(d => d.id === Number(params.id) ? { ...d, statut: 'accepté' } : d);
    return HttpResponse.json({ ok: true });
  }),

  http.post('*/client/devis-client/:id/refuser', ({ params }) => {
    devis = devis.map(d => d.id === Number(params.id) ? { ...d, statut: 'refusé' } : d);
    return HttpResponse.json({ ok: true });
  }),

  // Paiements
  http.get('*/client/paiements-historique', () =>
    HttpResponse.json({ paiements: CLIENT_PAIEMENTS })
  ),

  // Parrainage
  http.get('*/client/parrainage', () => HttpResponse.json(CLIENT_PARRAINAGE)),

  // Messages — GET (load conversation)
  http.get('*/client/messages-list/:missionId', ({ params }) => {
    const msgs = getMessages(Number(params.missionId));
    return HttpResponse.json({ messages: msgs });
  }),

  // Messages — POST (send message)
  http.post('*/client/messages-list/:missionId', async ({ request, params }) => {
    const body  = await request.json();
    const msgs  = getMessages(Number(params.missionId));
    const newMsg = {
      id:         msgs.length + 1,
      auteur:     'client',
      nomAuteur:  body.nomAuteur || 'Client',
      texte:      body.texte,
      date:       new Date().toISOString(),
    };
    const updated = [...msgs, newMsg];
    saveMessages(Number(params.missionId), updated);
    // Broadcast to other tabs (artisan view)
    try {
      const ch = new BroadcastChannel(`mission_${params.missionId}`);
      ch.postMessage(newMsg);
      ch.close();
    } catch {}
    return HttpResponse.json({ message: newMsg });
  }),

  // Missions
  http.get('*/missions', ({ request }) => {
    const url    = new URL(request.url);
    const statut = url.searchParams.get('statut');
    const result = statut ? missions.filter(m => m.statut === statut) : missions;
    return HttpResponse.json(result);
  }),

  http.post('*/missions', async ({ request }) => {
    const body = await request.json();
    const m    = { ...body, id: Date.now(), statut: 'nouveau' };
    missions   = [...missions, m];
    return HttpResponse.json(m, { status: 201 });
  }),

  http.put('*/missions/:id/statut', async ({ request, params }) => {
    const { statut } = await request.json();
    missions = missions.map(m => m.id === Number(params.id) ? { ...m, statut } : m);
    return HttpResponse.json({ ok: true });
  }),

  // Profil — suppression de compte (demo no-op)
  http.delete('*/client/supprimer-compte', () =>
    HttpResponse.json({ message: 'Compte supprimé (démo)' })
  ),
];
