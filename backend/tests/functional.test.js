const BASE = 'https://monartisan-4lqa.onrender.com';
async function f(url, opts = {}) {
  const r = await fetch(BASE + url, { headers: { 'Content-Type': 'application/json', ...opts.headers }, ...opts });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}
let pt, ct, ft; let passed = 0, failed = 0;
function ok(n, c, d='') { if(c){passed++;console.log(`  ✅ ${n}`)}else{failed++;console.log(`  ❌ ${n} ${d}`)} }

async function run() {
  console.log('\n═══ TESTS FONCTIONNELS ═══\n');
  
  // Login
  pt = (await f('/login', { method:'POST', body: JSON.stringify({email:'patron@freample-test.fr',motdepasse:'patron123'}) })).data.token;
  ct = (await f('/login', { method:'POST', body: JSON.stringify({email:'beaufrere.vassili@gmail.com',motdepasse:'azertyuiop789A!'}) })).data.token;
  ft = (await f('/login', { method:'POST', body: JSON.stringify({email:'freamplecom@gmail.com',motdepasse:'azertyuiop789A!'}) })).data.token;
  const ph = { Authorization: `Bearer ${pt}` };
  const ch = { Authorization: `Bearer ${ct}` };
  const fh = { Authorization: `Bearer ${ft}` };

  // ═══ FLOW 1: Créer un chantier
  console.log('── Flow 1: Chantier CRUD ──');
  const c1 = await f('/patron/chantiers', { method:'POST', headers:ph, body: JSON.stringify({nom:'Test Fonctionnel',adresse:'1 rue Test, Marseille',client:'Client Test',budgetPrevu:5000}) });
  ok('Créer chantier', c1.status === 201, `status=${c1.status} ${JSON.stringify(c1.data).slice(0,100)}`);
  const chantierId = c1.data?.chantier?.id;
  
  if (chantierId) {
    const c2 = await f(`/patron/chantiers/${chantierId}/avancement`, { method:'PUT', headers:ph, body: JSON.stringify({avancement:50,statut:'en_cours'}) });
    ok('Mettre à jour avancement', c2.status === 200, `status=${c2.status}`);
  }

  // ═══ FLOW 2: Créer un devis
  console.log('\n── Flow 2: Devis CRUD ──');
  const d1 = await f('/patron/devis-pro', { method:'POST', headers:ph, body: JSON.stringify({
    client:{nom:'Client Devis Test'}, titre:'Devis Test Fonctionnel',
    lignes:[{description:'Pose carrelage',quantite:10,prixHT:50,tva:0.10}], validite:30
  }) });
  ok('Créer devis', d1.status === 201, `status=${d1.status} ${JSON.stringify(d1.data).slice(0,100)}`);
  const devisId = d1.data?.devis?.id;
  
  if (devisId) {
    const d2 = await f(`/patron/devis-pro/${devisId}/envoyer`, { method:'PUT', headers:ph });
    ok('Envoyer devis', d2.status === 200 && d2.data.lienSignature, `status=${d2.status}`);
    
    // Signer le devis (public route)
    if (d2.data.lienSignature) {
      const token = new URL(d2.data.lienSignature).searchParams.get('token');
      const d3 = await f(`/patron/devis-pro/${devisId}/signer`, { method:'POST', body: JSON.stringify({nomSignataire:'Test Client',token}) });
      ok('Signer devis', d3.status === 200, `status=${d3.status} ${JSON.stringify(d3.data).slice(0,80)}`);
    }
  }

  // ═══ FLOW 3: Stock
  console.log('\n── Flow 3: Stock CRUD ──');
  const s1 = await f('/patron/stock', { method:'POST', headers:ph, body: JSON.stringify({designation:'Ciment CEM II',categorie:'Matériaux',quantite:50,unite:'sacs',seuilAlerte:10,valeurUnitaire:8}) });
  ok('Créer article stock', s1.status === 201, `status=${s1.status} ${JSON.stringify(s1.data).slice(0,80)}`);

  // ═══ FLOW 4: Agenda
  console.log('\n── Flow 4: Agenda CRUD ──');
  const a1 = await f('/patron/agenda', { method:'POST', headers:ph, body: JSON.stringify({type:'chantier',title:'Test Event',date:'2026-05-01',heure:'08:00',lieu:'Marseille'}) });
  ok('Créer événement agenda', a1.status === 201, `status=${a1.status} ${JSON.stringify(a1.data).slice(0,80)}`);

  // ═══ FLOW 5: Recrutement
  console.log('\n── Flow 5: Recrutement ──');
  const r1 = await f('/recrutement/patron/annonces', { method:'POST', headers:ph, body: JSON.stringify({titre:'Test Maçon',poste:'Maçon',description:'Test fonctionnel',localisation:'Marseille',typeContrat:'CDI'}) });
  ok('Créer annonce', r1.status === 201, `status=${r1.status}`);
  const annonceId = r1.data?.annonce?.id;
  
  if (annonceId) {
    const r2 = await f(`/recrutement/annonces/${annonceId}/candidatures`, { method:'POST', body: JSON.stringify({nom:'Dupont',prenom:'Jean',email:'test-fonc@gmail.com',telephone:'0612345678'}) });
    ok('Postuler candidature', r2.status === 201, `status=${r2.status} ${JSON.stringify(r2.data).slice(0,80)}`);
    
    const r3 = await f(`/recrutement/patron/annonces/${annonceId}/candidatures`, { headers:ph });
    ok('Voir candidatures', r3.status === 200 && r3.data.candidatures?.length > 0, `count=${r3.data.candidatures?.length}`);
  }

  // ═══ FLOW 6: Messagerie
  console.log('\n── Flow 6: Messagerie ──');
  const m1 = await f('/messagerie/envoyer', { method:'POST', headers:ph, body: JSON.stringify({receiverId:3,contenu:'Test message fonctionnel',contexte:'direct'}) });
  ok('Envoyer message', m1.status === 201, `status=${m1.status}`);
  
  const m2 = await f('/messagerie/conversations', { headers:ch });
  ok('Client voit conversation', m2.status === 200 && m2.data.conversations?.length > 0, `count=${m2.data.conversations?.length}`);

  // ═══ FLOW 7: Notifications
  console.log('\n── Flow 7: Notifications ──');
  const n1 = await f('/notifications', { headers:ct ? {Authorization:`Bearer ${ct}`} : ch });
  ok('Client a des notifications', n1.status === 200, `count=${n1.data.notifications?.length}`);

  // ═══ FLOW 8: Client publie un projet
  console.log('\n── Flow 8: Marketplace ──');
  const p1 = await f('/projets', { method:'POST', headers:ch, body: JSON.stringify({titre:'Test Projet Fonctionnel',description:'Rénovation test',metier:'Plomberie',ville:'Marseille',budgetEstime:3000}) });
  ok('Client publie projet', p1.status === 201, `status=${p1.status} ${JSON.stringify(p1.data).slice(0,80)}`);
  
  const p2 = await f('/projets/disponibles', { headers:ph });
  ok('Patron voit projets', p2.status === 200, `count=${p2.data.projets?.length}`);

  // ═══ FLOW 9: Admin
  console.log('\n── Flow 9: Admin ──');
  const a9 = await f('/admin/dashboard-stats', { headers:fh });
  ok('Stats dashboard', a9.status === 200 && a9.data.totalUsers > 0, `users=${a9.data.totalUsers}`);

  // ═══ FLOW 10: Change password round-trip
  console.log('\n── Flow 10: Sécurité ──');
  const pw1 = await f('/change-password', { method:'PUT', headers:ph, body: JSON.stringify({ancienMotdepasse:'patron123',nouveauMotdepasse:'patron456test'}) });
  ok('Changer mdp', pw1.status === 200);
  const pw2 = await f('/change-password', { method:'PUT', headers:ph, body: JSON.stringify({ancienMotdepasse:'patron456test',nouveauMotdepasse:'patron123'}) });
  ok('Remettre mdp', pw2.status === 200);

  // Summary
  console.log(`\n═══ RÉSULTAT: ${passed}/${passed+failed} PASS ═══`);
  if (failed > 0) console.log(`⚠️  ${failed} test(s) en échec`);
  else console.log('🎉 Tous les tests fonctionnels passent !');
  process.exit(failed > 0 ? 1 : 0);
}
run().catch(e => { console.error(e); process.exit(1); });
