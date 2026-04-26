const BASE = 'https://monartisan-4lqa.onrender.com';

async function api(url, opts = {}) {
  const r = await fetch(BASE + url, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

let pt, ct, ft, st;
let passed = 0, failed = 0, warnings = 0;

function ok(n, c, d='') { if(c){passed++;console.log(`  ✅ ${n}`)}else{failed++;console.log(`  ❌ ${n} — ${d}`)} }
function warn(n, d='') { warnings++;console.log(`  ⚠️  ${n} — ${d}`) }

async function run() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  FREAMPLE — TEST COMPLET BOUT EN BOUT');
  console.log('═══════════════════════════════════════════\n');

  // ══ AUTH ══
  console.log('── 1. Authentification ──');
  const l1 = await api('/login', { method:'POST', body:{email:'patron@freample-test.fr',motdepasse:'patron123'} });
  ok('Login patron', l1.status===200 && l1.data.token, `status=${l1.status}`);
  pt = l1.data.token;

  const l2 = await api('/login', { method:'POST', body:{email:'beaufrere.vassili@gmail.com',motdepasse:'azertyuiop789A!'} });
  ok('Login client', l2.status===200 && l2.data.token, `status=${l2.status}`);
  ct = l2.data.token;

  const l3 = await api('/login', { method:'POST', body:{email:'freamplecom@gmail.com',motdepasse:'azertyuiop789A!'} });
  ok('Login fondateur', l3.status===200 && l3.data.token, `status=${l3.status}`);
  ft = l3.data.token;

  const l4 = await api('/login', { method:'POST', body:{email:'salarie@freample-test.fr',motdepasse:'salarie123'} });
  ok('Login salarié', l4.status===200 && l4.data.token, `status=${l4.status}`);
  st = l4.data.token;

  ok('Login mauvais mdp → 401', (await api('/login', { method:'POST', body:{email:'patron@freample-test.fr',motdepasse:'wrong'} })).status === 401);
  ok('Login email inexistant → 401', (await api('/login', { method:'POST', body:{email:'nexiste@pas.fr',motdepasse:'test'} })).status === 401);
  ok('Login sans body → 400', (await api('/login', { method:'POST', body:{} })).status === 400);

  const ph = {Authorization:`Bearer ${pt}`};
  const ch = {Authorization:`Bearer ${ct}`};
  const fh = {Authorization:`Bearer ${ft}`};
  const sh = {Authorization:`Bearer ${st}`};

  // ══ PATRON — CHANTIERS ══
  console.log('\n── 2. Chantiers ──');
  const ch1 = await api('/patron/chantiers', { method:'POST', headers:ph, body:{nom:'Test Complet',adresse:'1 rue Test, Marseille',client:'Client Auto',budgetPrevu:5000} });
  ok('Créer chantier', ch1.status===201, `${ch1.status} ${JSON.stringify(ch1.data).slice(0,80)}`);
  
  ok('Créer chantier sans nom → erreur', (await api('/patron/chantiers', { method:'POST', headers:ph, body:{adresse:'test'} })).status !== 201, 'Devrait refuser');
  
  const ch2 = await api('/patron/chantiers', { headers:ph });
  ok('Lister chantiers', ch2.status===200 && Array.isArray(ch2.data.chantiers), `count=${ch2.data.chantiers?.length}`);

  // ══ PATRON — DEVIS ══
  console.log('\n── 3. Devis ──');
  const dv1 = await api('/patron/devis-pro', { method:'POST', headers:ph, body:{client:{nom:'Test Client'},titre:'Devis Complet',lignes:[{description:'Ligne 1',quantite:2,prixHT:100,tva:0.10},{description:'Ligne 2',quantite:1,prixHT:500,tva:0.20}],validite:30} });
  ok('Créer devis multi-lignes', dv1.status===201, `${dv1.status}`);
  const devisId = dv1.data?.devis?.id;
  
  ok('Devis a un numéro', dv1.data?.devis?.numero?.startsWith('DEV-'), `numero=${dv1.data?.devis?.numero}`);
  ok('Devis calcule totalHT', dv1.data?.devis?.totalHT > 0, `totalHT=${dv1.data?.devis?.totalHT}`);
  ok('Devis calcule totalTTC', dv1.data?.devis?.totalTTC > dv1.data?.devis?.totalHT, `ttc=${dv1.data?.devis?.totalTTC}`);
  
  ok('Créer devis sans client → erreur', (await api('/patron/devis-pro', { method:'POST', headers:ph, body:{titre:'test',lignes:[{description:'x',quantite:1,prixHT:10}]} })).status !== 201);
  ok('Créer devis sans lignes → erreur', (await api('/patron/devis-pro', { method:'POST', headers:ph, body:{client:{nom:'x'},titre:'test',lignes:[]} })).status !== 201);

  if (devisId) {
    const dv2 = await api(`/patron/devis-pro/${devisId}/envoyer`, { method:'PUT', headers:ph });
    ok('Envoyer devis → lien signature', dv2.status===200 && dv2.data.lienSignature, `${dv2.status}`);
    
    if (dv2.data.lienSignature) {
      const token = new URL(dv2.data.lienSignature).searchParams.get('token');
      ok('Signer sans nom → erreur', (await api(`/patron/devis-pro/${devisId}/signer`, { method:'POST', body:{token,nomSignataire:''} })).status !== 200);
      ok('Signer avec mauvais token → erreur', (await api(`/patron/devis-pro/${devisId}/signer`, { method:'POST', body:{token:'faux',nomSignataire:'Test'} })).status !== 200);
      
      const dv3 = await api(`/patron/devis-pro/${devisId}/signer`, { method:'POST', body:{nomSignataire:'Client Test Signature',token} });
      ok('Signer devis', dv3.status===200, `${dv3.status} ${JSON.stringify(dv3.data).slice(0,60)}`);
      ok('Re-signer → erreur', (await api(`/patron/devis-pro/${devisId}/signer`, { method:'POST', body:{nomSignataire:'Bis',token} })).status !== 200);
    }
  }

  // ══ PATRON — STOCK ══
  console.log('\n── 4. Stock ──');
  const st1 = await api('/patron/stock', { method:'POST', headers:ph, body:{designation:'Ciment Test',categorie:'Matériaux',quantite:100,unite:'sacs',seuilAlerte:20,valeurUnitaire:8} });
  ok('Créer article stock', st1.status===201, `${st1.status}`);
  
  const st2 = await api('/patron/stock', { headers:ph });
  ok('Lister stock', st2.status===200 && Array.isArray(st2.data.articles));

  // ══ PATRON — AGENDA ══
  console.log('\n── 5. Agenda ──');
  const ag1 = await api('/patron/agenda', { method:'POST', headers:ph, body:{type:'rdv',title:'RDV Client Test',date:'2026-05-15',heure:'14:00',lieu:'Marseille centre'} });
  ok('Créer événement', ag1.status===201, `${ag1.status}`);

  // ══ PATRON — FACTURATION AVANCÉE ══
  console.log('\n── 6. Avoirs + BC + BL ──');
  const av1 = await api('/patron/avoirs', { method:'POST', headers:ph, body:{client:{nom:'Client Avoir'},motif:'Erreur de facturation',lignes:[{description:'Remboursement',montant:200}],totalHT:200,tva:20,totalTTC:220} });
  ok('Créer avoir', av1.status===201, `${av1.status}`);

  const bc1 = await api('/patron/bons-commande', { method:'POST', headers:ph, body:{fournisseur:{nom:'Fournisseur Test'},chantierRef:'Chantier A',lignes:[{description:'Ciment',quantite:50,prixUnitaire:8}],totalHT:400} });
  ok('Créer bon de commande', bc1.status===201, `${bc1.status}`);

  const bl1 = await api('/patron/bons-livraison', { method:'POST', headers:ph, body:{fournisseur:{nom:'Fournisseur Test'},chantierRef:'Chantier A',lignes:[{description:'Ciment',quantiteCommandee:50,quantiteRecue:48}],receptionnaire:'Pierre Martin',conforme:true} });
  ok('Créer bon de livraison', bl1.status===201, `${bl1.status}`);

  // ══ PATRON — RH ══
  console.log('\n── 7. RH ──');
  ok('Lister employés', (await api('/rh/employes', {headers:ph})).status===200);
  ok('Tableau de bord RH', (await api('/rh/tableau-de-bord', {headers:ph})).status===200);
  ok('Congés', (await api('/rh/conges', {headers:ph})).status===200);
  ok('Notes de frais', (await api('/rh/notes-frais', {headers:ph})).status===200);
  ok('Habilitations', (await api('/rh/habilitations', {headers:ph})).status===200);
  ok('Check expirations', (await api('/rh/check-expirations', {headers:ph})).status===200);

  // ══ PATRON — RECRUTEMENT ══
  console.log('\n── 8. Recrutement ──');
  const rc1 = await api('/recrutement/patron/annonces', { method:'POST', headers:ph, body:{titre:'Maçon Test Complet',poste:'Maçon',description:'Test recrutement fonctionnel',localisation:'Marseille',typeContrat:'CDI'} });
  ok('Publier annonce', rc1.status===201, `${rc1.status}`);
  const annonceId = rc1.data?.annonce?.id;

  ok('Annonce visible publiquement', (await api('/recrutement/annonces')).data.annonces?.length > 0);

  if (annonceId) {
    const rc2 = await api(`/recrutement/annonces/${annonceId}/candidatures`, { method:'POST', body:{nom:'Testeur',prenom:'Auto',email:'auto-test-'+Date.now()+'@gmail.com',telephone:'0600000000',lettre:'Motivation test',cvTexte:'5 ans experience'} });
    ok('Postuler', rc2.status===201, `${rc2.status}`);
    
    const rc3 = await api(`/recrutement/patron/annonces/${annonceId}/candidatures`, { headers:ph });
    ok('Voir candidatures', rc3.status===200 && rc3.data.candidatures?.length > 0);
  }

  // ══ PATRON — MON IMAGE ══
  console.log('\n── 9. Profil entreprise ──');
  const im1 = await api('/patron/mon-image', { method:'PUT', headers:ph, body:{description:'Test entreprise',specialites:'Maçonnerie, Plomberie',zoneIntervention:'Marseille +30km',certifications:['Qualibat','RGE'],anneeCreation:'2020',effectif:'5-10'} });
  ok('Mettre à jour profil entreprise', im1.status===200, `${im1.status}`);
  
  const im2 = await api('/entreprise/4');
  ok('Profil public visible', im2.status===200 && im2.data.entreprise, `${im2.status}`);
  ok('Profil public a description', im2.data.profil?.description === 'Test entreprise', `desc=${im2.data.profil?.description}`);

  // ══ PATRON — SUBSCRIPTION ══
  console.log('\n── 10. Abonnement ──');
  const sub1 = await api('/patron/subscription', { headers:ph });
  ok('Status abonnement patron', sub1.status===200 && sub1.data.status, `status=${sub1.data.status}`);
  ok('Patron en trial', sub1.data.status === 'trial', `status=${sub1.data.status}`);
  
  const sub2 = await api('/patron/subscription', { headers:fh });
  ok('Fondateur exempt', sub2.status===200 && sub2.data.exempt === true, `exempt=${sub2.data.exempt}`);

  // ══ CLIENT ══
  console.log('\n── 11. Client ──');
  const cp1 = await api('/projets', { method:'POST', headers:ch, body:{titre:'Projet Test Complet',description:'Rénovation salle de bain complète',metier:'Plomberie',ville:'Marseille',budgetEstime:5000,urgence:'normal'} });
  ok('Client publie projet', cp1.status===201, `${cp1.status}`);
  
  const cp2 = await api('/projets/disponibles', { headers:ph });
  ok('Patron voit le projet', cp2.status===200 && cp2.data.projets?.length > 0, `count=${cp2.data.projets?.length}`);

  ok('Client reçoit devis', (await api('/projets/mes-devis', {headers:ch})).status===200);

  // ══ MESSAGERIE ══
  console.log('\n── 12. Messagerie ──');
  const mg1 = await api('/messagerie/envoyer', { method:'POST', headers:ph, body:{receiverId:3,contenu:'Hello depuis les tests',contexte:'projet',contexteTitre:'Test Projet'} });
  ok('Envoyer message', mg1.status===201, `${mg1.status}`);
  
  const mg2 = await api('/messagerie/conversations', { headers:ch });
  ok('Client voit conversation', mg2.status===200 && mg2.data.conversations?.length > 0, `count=${mg2.data.conversations?.length}`);
  
  if (mg2.data.conversations?.[0]) {
    const convId = mg2.data.conversations[0].conversationId;
    const mg3 = await api(`/messagerie/conversation/${convId}`, { headers:ch });
    ok('Lire messages', mg3.status===200 && mg3.data.messages?.length > 0, `count=${mg3.data.messages?.length}`);
  }

  // ══ NOTIFICATIONS ══
  console.log('\n── 13. Notifications ──');
  const nt1 = await api('/notifications', { headers:ph });
  ok('Patron notifications', nt1.status===200);
  
  const nt2 = await api('/notifications', { headers:ch });
  ok('Client notifications', nt2.status===200);

  // ══ SALARIÉ ══
  console.log('\n── 14. Salarié ──');
  const se1 = await api('/rh/mon-profil', { headers:sh });
  ok('Profil salarié', se1.status===200 || se1.status===404, `${se1.status}`);

  // ══ ADMIN ══
  console.log('\n── 15. Admin ──');
  const ad1 = await api('/admin/dashboard-stats', { headers:fh });
  ok('Stats admin', ad1.status===200 && ad1.data.users > 0, `users=${ad1.data.totalUsers}`);
  
  const ad2 = await api('/admin/users', { headers:fh });
  ok('Liste users', ad2.status===200 && ad2.data.users?.length > 0, `count=${ad2.data.users?.length}`);

  // ══ SÉCURITÉ ══
  console.log('\n── 16. Sécurité ──');
  ok('Route patron sans auth → 401', (await api('/patron/chantiers')).status === 401);
  ok('Route RH sans auth → 401', (await api('/rh/employes')).status === 401);
  ok('Route admin sans auth → 401', [401,403].includes((await api('/admin/users')).status));
  ok('Route notifications sans auth → 401', (await api('/notifications')).status === 401);
  
  // MDP
  const pw1 = await api('/change-password', { method:'PUT', headers:ph, body:{ancienMotdepasse:'patron123',nouveauMotdepasse:'temp_test_999'} });
  ok('Changer mdp', pw1.status===200);
  const pw2 = await api('/change-password', { method:'PUT', headers:ph, body:{ancienMotdepasse:'temp_test_999',nouveauMotdepasse:'patron123'} });
  ok('Remettre mdp', pw2.status===200);
  ok('Mauvais ancien mdp → erreur', (await api('/change-password', { method:'PUT', headers:ph, body:{ancienMotdepasse:'faux',nouveauMotdepasse:'test1234'} })).status === 400);
  ok('Mdp trop court → erreur', (await api('/change-password', { method:'PUT', headers:ph, body:{ancienMotdepasse:'patron123',nouveauMotdepasse:'abc'} })).status === 400);

  // ══ AVIS PASSAGE ══
  console.log('\n── 17. Avis de passage ──');
  ok('Liste avis passage', (await api('/avis-passage', {headers:ph})).status===200);

  // Summary
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  RÉSULTAT: ${passed} PASS / ${failed} FAIL / ${warnings} WARN`);
  console.log(`  Total: ${passed}/${passed+failed} (${Math.round(passed/(passed+failed)*100)}%)`);
  console.log(`═══════════════════════════════════════════`);
  if (failed === 0) console.log('🎉 TOUS LES TESTS PASSENT !');
  process.exit(failed > 0 ? 1 : 0);
}
run().catch(e => { console.error('CRASH:', e.message); process.exit(1); });
