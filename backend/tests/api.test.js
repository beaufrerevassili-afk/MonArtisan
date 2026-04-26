/**
 * Freample API Tests — Critical endpoints
 * Run: node tests/api.test.js
 */

const BASE = process.env.API_URL || 'https://monartisan-4lqa.onrender.com';

async function fetchJSON(url, options = {}) {
  const r = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

let patronToken, clientToken, fondateurToken;
let passed = 0, failed = 0;

function assert(name, condition, detail = '') {
  if (condition) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name} ${detail}`); }
}

async function run() {
  console.log('\n═══ FREAMPLE API TESTS ═══\n');

  // Auth
  console.log('── Auth ──');
  const login1 = await fetchJSON('/login', { method: 'POST', body: JSON.stringify({ email: 'patron@freample-test.fr', motdepasse: 'patron123' }) });
  assert('Login patron', login1.status === 200 && login1.data.token);
  patronToken = login1.data.token;

  const login2 = await fetchJSON('/login', { method: 'POST', body: JSON.stringify({ email: 'beaufrere.vassili@gmail.com', motdepasse: 'azertyuiop789A!' }) });
  assert('Login client', login2.status === 200 && login2.data.token);
  clientToken = login2.data.token;

  const login3 = await fetchJSON('/login', { method: 'POST', body: JSON.stringify({ email: 'freamplecom@gmail.com', motdepasse: 'azertyuiop789A!' }) });
  assert('Login fondateur', login3.status === 200 && login3.data.token);
  fondateurToken = login3.data.token;

  const loginBad = await fetchJSON('/login', { method: 'POST', body: JSON.stringify({ email: 'patron@freample-test.fr', motdepasse: 'wrong' }) });
  assert('Login mauvais mdp → 401', loginBad.status === 401);

  // Patron routes
  console.log('\n── Patron ──');
  const h = { Authorization: `Bearer ${patronToken}` };

  const chantiers = await fetchJSON('/patron/chantiers', { headers: h });
  assert('GET /patron/chantiers', chantiers.status === 200 && chantiers.data.chantiers !== undefined);

  const devis = await fetchJSON('/patron/devis-pro', { headers: h });
  assert('GET /patron/devis-pro', devis.status === 200 && devis.data.devis !== undefined);

  const stock = await fetchJSON('/patron/stock', { headers: h });
  assert('GET /patron/stock', stock.status === 200 && stock.data.articles !== undefined);

  const agenda = await fetchJSON('/patron/agenda', { headers: h });
  assert('GET /patron/agenda', agenda.status === 200 && agenda.data.events !== undefined);

  const avoirs = await fetchJSON('/patron/avoirs', { headers: h });
  assert('GET /patron/avoirs', avoirs.status === 200);

  const bc = await fetchJSON('/patron/bons-commande', { headers: h });
  assert('GET /patron/bons-commande', bc.status === 200);

  const bl = await fetchJSON('/patron/bons-livraison', { headers: h });
  assert('GET /patron/bons-livraison', bl.status === 200);

  const sub = await fetchJSON('/patron/subscription', { headers: h });
  assert('GET /patron/subscription', sub.status === 200 && sub.data.status);

  const image = await fetchJSON('/patron/mon-image', { headers: h });
  assert('GET /patron/mon-image', image.status === 200);

  const biblio = await fetchJSON('/patron/bibliotheque', { headers: h });
  assert('GET /patron/bibliotheque', biblio.status === 200);

  // RH
  console.log('\n── RH ──');
  const employes = await fetchJSON('/rh/employes', { headers: h });
  assert('GET /rh/employes', employes.status === 200);

  const tdb = await fetchJSON('/rh/tableau-de-bord', { headers: h });
  assert('GET /rh/tableau-de-bord', tdb.status === 200);

  const conges = await fetchJSON('/rh/conges', { headers: h });
  assert('GET /rh/conges', conges.status === 200);

  const frais = await fetchJSON('/rh/notes-frais', { headers: h });
  assert('GET /rh/notes-frais', frais.status === 200);

  const expir = await fetchJSON('/rh/check-expirations', { headers: h });
  assert('GET /rh/check-expirations', expir.status === 200);

  // Notifications + Messagerie
  console.log('\n── Notifications & Messagerie ──');
  const notifs = await fetchJSON('/notifications', { headers: h });
  assert('GET /notifications', notifs.status === 200 && notifs.data.notifications !== undefined);

  const convs = await fetchJSON('/messagerie/conversations', { headers: h });
  assert('GET /messagerie/conversations', convs.status === 200);

  // Public
  console.log('\n── Public ──');
  const annonces = await fetchJSON('/recrutement/annonces');
  assert('GET /recrutement/annonces (public)', annonces.status === 200);

  const entreprise = await fetchJSON('/entreprise/4');
  assert('GET /entreprise/4 (public)', entreprise.status === 200);

  const verify = await fetchJSON('/verify-email', { method: 'POST', body: JSON.stringify({ email: 'test@gmail.com' }) });
  assert('POST /verify-email', verify.status === 200);

  // Client
  console.log('\n── Client ──');
  const ch = { Authorization: `Bearer ${clientToken}` };
  const projets = await fetchJSON('/projets/disponibles', { headers: ch });
  assert('GET /projets/disponibles', projets.status === 200);

  const mesDevis = await fetchJSON('/projets/mes-devis', { headers: ch });
  assert('GET /projets/mes-devis', mesDevis.status === 200);

  // Admin
  console.log('\n── Admin ──');
  const fh = { Authorization: `Bearer ${fondateurToken}` };
  const stats = await fetchJSON('/admin/dashboard-stats', { headers: fh });
  assert('GET /admin/dashboard-stats', stats.status === 200);

  const users = await fetchJSON('/admin/users', { headers: fh });
  assert('GET /admin/users', users.status === 200);

  // Security
  console.log('\n── Sécurité ──');
  const noAuth = await fetchJSON('/patron/chantiers');
  assert('GET /patron/chantiers sans auth → 401/403', noAuth.status === 401 || noAuth.status === 403);

  const profilePhoto = await fetchJSON('/profile-photo', { headers: h });
  assert('GET /profile-photo', profilePhoto.status === 200);

  // Avis de passage
  const avis = await fetchJSON('/avis-passage', { headers: h });
  assert('GET /avis-passage', avis.status === 200);

  // Summary
  console.log(`\n═══ RÉSULTAT: ${passed}/${passed + failed} PASS ═══`);
  if (failed > 0) console.log(`⚠️  ${failed} test(s) en échec`);
  else console.log('🎉 Tous les tests passent !');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Test runner error:', e); process.exit(1); });
