import { http, HttpResponse } from 'msw';
import {
  PATRON_DASHBOARD, PATRON_CHANTIERS, PATRON_PIPELINE, PATRON_ALERTES,
  FINANCE_DASHBOARD, FINANCE_DEVIS, FINANCE_FACTURES, FINANCE_TRESORERIE,
  URSSAF_HISTORIQUE, URSSAF_RECAPITULATIF, URSSAF_ALERTES,
  RH_EMPLOYES, RH_TABLEAU_DE_BORD, RH_CONGES, RH_NOTES_FRAIS, RH_MASSE_SALARIALE,
  QSE_DASHBOARD,
} from '../data/demo';

// Mutable state
let employes  = [...RH_EMPLOYES];
let conges    = [...RH_CONGES];
let notesFrais = [...RH_NOTES_FRAIS];
let devis     = [...FINANCE_DEVIS];
let factures  = [...FINANCE_FACTURES];

export const patronHandlers = [
  // ── Dashboard patron ──────────────────────────────────────────────────────
  http.get('*/dashboard/patron', () => HttpResponse.json(PATRON_DASHBOARD)),
  http.get('*/patron/chantiers',  () => HttpResponse.json(PATRON_CHANTIERS)),
  http.get('*/patron/pipeline',   () => HttpResponse.json(PATRON_PIPELINE)),
  http.get('*/patron/alertes',    () => HttpResponse.json(PATRON_ALERTES)),

  // ── Finance ───────────────────────────────────────────────────────────────
  http.get('*/finance/tableau-de-bord', () => HttpResponse.json(FINANCE_DASHBOARD)),

  http.get('*/finance/devis', () => HttpResponse.json({ devis })),

  http.post('*/finance/devis', async ({ request }) => {
    const body = await request.json();
    const d    = { ...body, id: Date.now(), statut: 'brouillon', date: new Date().toISOString().split('T')[0] };
    devis      = [d, ...devis];
    return HttpResponse.json(d, { status: 201 });
  }),

  http.get('*/finance/factures', () => HttpResponse.json({ factures })),

  http.post('*/finance/factures', async ({ request }) => {
    const body = await request.json();
    const f    = { ...body, id: Date.now(), statut: 'brouillon', date: new Date().toISOString().split('T')[0] };
    factures   = [f, ...factures];
    return HttpResponse.json(f, { status: 201 });
  }),

  http.put('*/finance/factures/:id/envoyer', ({ params }) => {
    factures = factures.map(f => f.id === Number(params.id) ? { ...f, statut: 'envoyée' } : f);
    return HttpResponse.json({ ok: true });
  }),

  http.put('*/finance/factures/:id/relancer', ({ params }) => {
    return HttpResponse.json({ ok: true, message: 'Relance envoyée' });
  }),

  http.get('*/finance/tresorerie', () => HttpResponse.json(FINANCE_TRESORERIE)),

  http.post('*/finance/salaires/calculer', async ({ request }) => {
    const { mois, annee } = await request.json();
    const total = employes.reduce((s, e) => s + e.salaireBrut, 0);
    return HttpResponse.json({
      mois, annee,
      brut:            total,
      chargesPatronales: Math.round(total * 0.42),
      net:             Math.round(total * 0.77),
      detail:          employes.map(e => ({
        id: e.id, nom: e.nom, poste: e.poste,
        brut:            e.salaireBrut,
        cotisations:     Math.round(e.salaireBrut * 0.23),
        net:             Math.round(e.salaireBrut * 0.77),
        chargesPatron:   Math.round(e.salaireBrut * 0.42),
      })),
    });
  }),

  http.post('*/finance/salaires/payer', async ({ request }) => {
    return HttpResponse.json({ ok: true, message: 'Virements validés' });
  }),

  // ── URSSAF ────────────────────────────────────────────────────────────────
  http.get('*/urssaf/historique',     () => HttpResponse.json({ historique: URSSAF_HISTORIQUE })),
  http.get('*/urssaf/recapitulatif',  () => HttpResponse.json(URSSAF_RECAPITULATIF)),
  http.get('*/urssaf/alertes',        () => HttpResponse.json({ alertes: URSSAF_ALERTES })),

  // ── RH ────────────────────────────────────────────────────────────────────
  http.get('*/rh/employes', () => HttpResponse.json({ employes })),

  http.post('*/rh/employes', async ({ request }) => {
    const body = await request.json();
    const e    = { ...body, id: Date.now() };
    employes   = [...employes, e];
    return HttpResponse.json(e, { status: 201 });
  }),

  http.put('*/rh/employes/:id', async ({ request, params }) => {
    const body = await request.json();
    employes   = employes.map(e => e.id === Number(params.id) ? { ...e, ...body } : e);
    return HttpResponse.json({ ok: true });
  }),

  http.get('*/rh/tableau-de-bord', () => HttpResponse.json(RH_TABLEAU_DE_BORD)),

  http.get('*/rh/conges', () => HttpResponse.json({ conges })),

  http.post('*/rh/conges', async ({ request }) => {
    const body = await request.json();
    const c    = { ...body, id: Date.now(), statut: 'en_attente' };
    conges     = [...conges, c];
    return HttpResponse.json(c, { status: 201 });
  }),

  http.put('*/rh/conges/:id/valider', async ({ request, params }) => {
    const { decision } = await request.json();
    conges = conges.map(c => c.id === Number(params.id) ? { ...c, statut: decision } : c);
    return HttpResponse.json({ ok: true });
  }),

  http.get('*/rh/notes-frais', ({ request }) => {
    const url        = new URL(request.url);
    const employeId  = url.searchParams.get('employeId');
    const result     = employeId
      ? notesFrais.filter(n => String(n.employeId) === String(employeId))
      : notesFrais;
    return HttpResponse.json({ notesFrais: result });
  }),

  http.put('*/rh/notes-frais/:id/valider', async ({ request, params }) => {
    const { decision } = await request.json();
    notesFrais = notesFrais.map(n => n.id === Number(params.id) ? { ...n, statut: decision } : n);
    return HttpResponse.json({ ok: true });
  }),

  http.post('*/rh/bulletins-paie', async ({ request }) => {
    return HttpResponse.json({ ok: true, message: 'Bulletins générés (démo)' });
  }),

  http.get('*/rh/masse-salariale', () => HttpResponse.json({ masseSalariale: RH_MASSE_SALARIALE })),

  // ── QSE ───────────────────────────────────────────────────────────────────
  http.get('*/qse/tableau-de-bord', () => HttpResponse.json(QSE_DASHBOARD)),

  http.post('*/qse/verifier-assignation', async ({ request }) => {
    return HttpResponse.json({ compatible: true, manquantes: [] });
  }),
];
