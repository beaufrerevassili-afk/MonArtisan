import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const G = '#05944F';
const G_BG = '#F0FDF4';
const G_SOFT = '#E6F4ED';

const CARD_STYLE = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E5E5E5', boxShadow:'0 1px 4px rgba(0,0,0,.04)' };
const SECTION_HDR = { fontSize:13, fontWeight:700, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN_PRIMARY = { background:G, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const BTN_GHOST = { background:'transparent', color:'#5E5E5E', border:'1px solid #E5E5E5', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const MODAL_OVERLAY = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const MODAL_BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:480, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

const TABS = [
  { id:'accueil',     icon:'🏠', label:'Accueil' },
  { id:'livraisons',  icon:'🛵', label:'Livraisons' },
  { id:'historique',  icon:'📋', label:'Historique' },
  { id:'paiements',   icon:'💳', label:'Paiements' },
  { id:'restaurants', icon:'🍽️', label:'Restaurants' },
  { id:'livreurs',    icon:'👥', label:'Livreurs' },
  { id:'parametres',  icon:'⚙️', label:'Paramètres' },
  { id:'rapports',    icon:'📊', label:'Rapports' },
];

const LIVRAISON_STATUS = {
  en_attente:  { label:'En attente',   bg:'#FEF3C7', border:'#FDE047', color:'#713F12' },
  acceptee:    { label:'Acceptée',     bg:'#DBEAFE', border:'#93C5FD', color:'#1D4ED8' },
  en_route:    { label:'En route',     bg:'#F5F3FF', border:'#C4B5FD', color:'#5B21B6' },
  livree:      { label:'Livrée',       bg:'#D1FAE5', border:'#86EFAC', color:'#065F46' },
  annulee:     { label:'Annulée',      bg:'#FEE2E2', border:'#FCA5A5', color:'#DC2626' },
};

const LIVRAISONS_INIT = [
  { id:1, commande:'CMD-4812', restaurant:'La Trattoria', client:{ nom:'Sophie Martin', adresse:'24 rue de Rivoli, Paris 1er', tel:'06 12 34 56 78' }, articles:['1× Pizza Margherita','1× Tiramisu','2× Coca'], montant:32, fraisLivraison:2.99, livreur:'Karim B.', statut:'en_route', heure:'12:35', tempsEstime:'15 min', code:'FRE-8412' },
  { id:2, commande:'CMD-4813', restaurant:'Sakura House', client:{ nom:'Lucas Bernard', adresse:'8 rue de Bretagne, Paris 3e', tel:'06 23 45 67 89' }, articles:['2× Sushi Mix','1× Miso Soup','1× Gyoza'], montant:48, fraisLivraison:1.99, livreur:'Amine D.', statut:'acceptee', heure:'12:42', tempsEstime:'25 min', code:'FRE-8413' },
  { id:3, commande:'CMD-4814', restaurant:'Big Smoke', client:{ nom:'Claire Dupont', adresse:'15 avenue Montaigne, Paris 8e', tel:'06 34 56 78 90' }, articles:['1× Double Burger','1× Frites XL','1× Milkshake'], montant:24, fraisLivraison:0, livreur:null, statut:'en_attente', heure:'12:48', tempsEstime:'—', code:'FRE-8414' },
  { id:4, commande:'CMD-4815', restaurant:'Green Bowl', client:{ nom:'Marie Lambert', adresse:'52 rue Lepic, Paris 18e', tel:'06 45 67 89 01' }, articles:['1× Buddha Bowl','1× Smoothie Vert'], montant:19, fraisLivraison:3.49, livreur:null, statut:'en_attente', heure:'12:52', tempsEstime:'—', code:'FRE-8415' },
  { id:5, commande:'CMD-4810', restaurant:'La Trattoria', client:{ nom:'Pierre Garnier', adresse:'5 rue du Commerce, Paris 15e', tel:'06 56 78 90 12' }, articles:['1× Pasta Carbonara','1× Salade César'], montant:28, fraisLivraison:2.99, livreur:'Karim B.', statut:'livree', heure:'11:45', tempsEstime:'Livré', code:'FRE-8410' },
  { id:6, commande:'CMD-4808', restaurant:'Wok Express', client:{ nom:'Amélie Rousseau', adresse:'12 rue des Archives, Paris 4e', tel:'06 67 89 01 23' }, articles:['1× Pad Thaï','1× Nem x4'], montant:22, fraisLivraison:2.99, livreur:'Amine D.', statut:'livree', heure:'11:20', tempsEstime:'Livré', code:'FRE-8408' },
];

const LIVREURS_INIT = [
  { id:1, nom:'Karim Benali',  vehicule:'Scooter', zone:'Paris Centre', note:4.9, livraisons:342, enLigne:true, caJour:68 },
  { id:2, nom:'Amine Diallo',  vehicule:'Vélo élec.', zone:'Paris Est', note:4.7, livraisons:215, enLigne:true, caJour:42 },
  { id:3, nom:'Youssef Kaci',  vehicule:'Scooter', zone:'Paris Sud', note:4.8, livraisons:189, enLigne:false, caJour:0 },
  { id:4, nom:'Thomas Petit',  vehicule:'Vélo', zone:'Paris Ouest', note:4.5, livraisons:87, enLigne:false, caJour:0 },
];

const RESTAURANTS_PARTENAIRES = [
  { id:1, nom:'La Trattoria',   type:'Italien',   commandes:45, note:4.8, ca:1240 },
  { id:2, nom:'Sakura House',   type:'Japonais',  commandes:38, note:4.9, ca:1680 },
  { id:3, nom:'Big Smoke',      type:'Burger',    commandes:62, note:4.7, ca:890 },
  { id:4, nom:'Green Bowl',     type:'Healthy',   commandes:28, note:4.6, ca:520 },
  { id:5, nom:'Wok Express',    type:'Asiatique', commandes:35, note:4.4, ca:780 },
];

const TRANSACTIONS_INIT = [
  { id:'T001', date:'2026-04-04', type:'paiement', client:'Sophie Martin', montant:34.99, statut:'bloque', restaurant:'La Trattoria' },
  { id:'T002', date:'2026-04-04', type:'paiement', client:'Lucas Bernard', montant:49.99, statut:'bloque', restaurant:'Sakura House' },
  { id:'T003', date:'2026-04-04', type:'paiement', client:'Pierre Garnier', montant:30.99, statut:'libere', restaurant:'La Trattoria' },
  { id:'T004', date:'2026-04-03', type:'paiement', client:'Amélie Rousseau', montant:24.99, statut:'libere', restaurant:'Wok Express' },
  { id:'T005', date:'2026-04-02', type:'paiement', client:'Nina Fontaine', montant:42.50, statut:'libere', restaurant:'Sakura House' },
  { id:'VIRT1', date:'2026-03-31', type:'virement', client:'', montant:1850, statut:'vire', restaurant:'' },
];

const REVENUS_7J = [
  { jour:'Lun', montant:320 },{ jour:'Mar', montant:480 },{ jour:'Mer', montant:390 },
  { jour:'Jeu', montant:520 },{ jour:'Ven', montant:680 },{ jour:'Sam', montant:890 },
  { jour:'Dim', montant:450 },
];

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...CARD_STYLE, flex:1, minWidth:140 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:accent||'#1C1C1E', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#8B8B8B', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ statut }) {
  const s = LIVRAISON_STATUS[statut] || LIVRAISON_STATUS.en_attente;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{s.label}</span>;
}

const EAT_TAB_MAP = { livraisons:'livraisons', historique:'historique', paiements:'paiements', restaurants:'restaurants', livreurs:'livreurs', parametres:'parametres', rapports:'rapports' };

export default function DashboardEat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const onglet = searchParams.get('onglet');
  const [tab, setTab] = useState(EAT_TAB_MAP[onglet] || 'accueil');
  const [livraisons, setLivraisons] = useState(LIVRAISONS_INIT);
  const [transactions, setTransactions] = useState(TRANSACTIONS_INIT);
  const [livreurs] = useState(LIVREURS_INIT);
  const [restaurants] = useState(RESTAURANTS_PARTENAIRES);

  useEffect(() => {
    const o = searchParams.get('onglet');
    if (o && EAT_TAB_MAP[o]) setTab(EAT_TAB_MAP[o]);
    else if (!o) setTab('accueil');
  }, [searchParams]);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const [modalLivraison, setModalLivraison] = useState(null);
  const [modalVirement, setModalVirement] = useState(false);
  const [virementDone, setVirementDone] = useState(false);
  const [virementAmount, setVirementAmount] = useState('');
  const [payFilter, setPayFilter] = useState('tous');
  const [livFilter, setLivFilter] = useState('toutes');

  // Computed
  const livEnCours = livraisons.filter(l => ['en_attente','acceptee','en_route'].includes(l.statut)).length;
  const livLivrees = livraisons.filter(l => l.statut === 'livree').length;
  const revenuJour = transactions.filter(t => t.date === '2026-04-04' && t.type === 'paiement').reduce((s,t) => s+t.montant, 0);
  const totalBloque = transactions.filter(t => t.statut === 'bloque').reduce((s,t) => s+t.montant, 0);
  const livreursEnLigne = livreurs.filter(l => l.enLigne).length;
  const maxRevenu = Math.max(...REVENUS_7J.map(r => r.montant));

  const filteredLiv = livFilter === 'toutes' ? livraisons : livraisons.filter(l => l.statut === livFilter);
  const filteredTx = payFilter === 'tous' ? transactions : payFilter === 'bloques' ? transactions.filter(t => t.statut === 'bloque') : payFilter === 'liberes' ? transactions.filter(t => t.statut === 'libere') : transactions.filter(t => t.type === 'virement');

  const assignerLivreur = (livId) => {
    const dispo = livreurs.find(l => l.enLigne);
    if (!dispo) { showToast('Aucun livreur disponible','error'); return; }
    setLivraisons(prev => prev.map(l => l.id === livId ? { ...l, statut:'acceptee', livreur:dispo.nom } : l));
    showToast(`${dispo.nom} assigné à la livraison`);
  };

  const marquerLivree = (livId) => {
    setLivraisons(prev => prev.map(l => l.id === livId ? { ...l, statut:'livree', tempsEstime:'Livré' } : l));
    const liv = livraisons.find(l => l.id === livId);
    setTransactions(prev => prev.map(t => t.client === liv?.client?.nom && t.statut === 'bloque' ? { ...t, statut:'libere' } : t));
    showToast('Livraison terminée — paiement libéré');
    setModalLivraison(null);
  };

  const submitVirement = () => {
    if (!virementAmount || isNaN(virementAmount)) return;
    setTransactions(prev => [{ id:'VIRT'+Date.now(), date:'2026-04-04', type:'virement', client:'', montant:Number(virementAmount), statut:'vire', restaurant:'' }, ...prev]);
    setVirementDone(true);
    setTimeout(() => { setModalVirement(false); setVirementDone(false); setVirementAmount(''); }, 2500);
    showToast(`Virement de ${virementAmount}€ initié`);
  };

  return (
    <div style={{ padding:'24px 28px', background:K_BG, minHeight:'100vh', fontFamily:'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:'#1C1C1E' }}>🛵 Freample Eat — Gestion Livraisons</div>
          <div style={{ fontSize:14, color:'#8B8B8B', marginTop:2 }}>Commandes · Livreurs · Restaurants partenaires</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background: livreursEnLigne > 0 ? G : '#DC2626' }} />
          <span style={{ fontSize:13, fontWeight:600, color: livreursEnLigne > 0 ? G : '#DC2626' }}>{livreursEnLigne} livreur{livreursEnLigne > 1 ? 's' : ''} en ligne</span>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, background:'#fff', borderRadius:14, padding:6, border:'1px solid #E5E5E5', boxShadow:'0 1px 4px rgba(0,0,0,.04)', marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontWeight: tab===t.id ? 700 : 500, background: tab===t.id ? G : 'transparent', color: tab===t.id ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.875rem', transition:'all .15s' }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* TAB: Accueil */}
      {tab === 'accueil' && (
        <div>
          <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
            <KpiCard label="Livraisons en cours" value={livEnCours} sub="Actives maintenant" accent={G} />
            <KpiCard label="Livrées aujourd'hui" value={livLivrees} sub="Commandes terminées" accent="#7C3AED" />
            <KpiCard label="Revenu du jour" value={`${Math.round(revenuJour)}€`} sub="Paiements reçus" accent="#059669" />
            <KpiCard label="Livreurs en ligne" value={livreursEnLigne} sub={`sur ${livreurs.length} total`} accent="#2563EB" />
          </div>
          {/* Active deliveries */}
          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>Livraisons actives</div>
            {livraisons.filter(l => !['livree','annulee'].includes(l.statut)).length === 0 && <div style={{ color:'#8B8B8B', fontSize:14, padding:20, textAlign:'center' }}>Aucune livraison active</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {livraisons.filter(l => !['livree','annulee'].includes(l.statut)).map(l => (
                <div key={l.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#FAFAFA', borderRadius:10, border:'1px solid #F0F0F0' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background: LIVRAISON_STATUS[l.statut].bg, border:`2px solid ${LIVRAISON_STATUS[l.statut].border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🛵</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{l.restaurant} → {l.client.nom}</div>
                    <div style={{ fontSize:12, color:'#8B8B8B' }}>{l.livreur || 'Non assigné'} · {l.tempsEstime} · {l.commande}</div>
                  </div>
                  <StatusBadge statut={l.statut} />
                  <div style={{ fontWeight:800, color:G, fontSize:15 }}>{l.montant}€</div>
                  {l.statut === 'en_attente' && <button onClick={() => assignerLivreur(l.id)} style={{ ...BTN_PRIMARY, padding:'6px 14px', fontSize:'0.8rem' }}>Assigner</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Livraisons */}
      {tab === 'livraisons' && (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
            {[['toutes','Toutes'],['en_attente','En attente'],['acceptee','Acceptées'],['en_route','En route'],['livree','Livrées']].map(([v,l]) => (
              <button key={v} onClick={() => setLivFilter(v)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight: livFilter===v ? 700 : 500, background: livFilter===v ? G : '#F3F3F3', color: livFilter===v ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.825rem' }}>{l}</button>
            ))}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filteredLiv.map(l => (
              <div key={l.id} onClick={() => setModalLivraison(l)} style={{ ...CARD_STYLE, cursor:'pointer', padding:'16px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{l.commande} — {l.restaurant}</div>
                      <StatusBadge statut={l.statut} />
                    </div>
                    <div style={{ fontSize:13, color:'#8B8B8B', marginBottom:4 }}>{l.client.nom} · {l.client.adresse}</div>
                    <div style={{ fontSize:12, color:'#8B8B8B' }}>{l.articles.join(', ')}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontWeight:800, fontSize:16, color:G }}>{l.montant}€</div>
                    <div style={{ fontSize:12, color:'#8B8B8B' }}>{l.heure}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Historique */}
      {tab === 'historique' && (
        <div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Livraisons terminées</div>
          <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
            {livraisons.filter(l => l.statut === 'livree').map((l,i,arr) => (
              <div key={l.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < arr.length-1 ? '1px solid #F0F0F0' : 'none' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{l.restaurant} → {l.client.nom}</div>
                  <div style={{ fontSize:12, color:'#8B8B8B' }}>{l.commande} · {l.livreur} · {l.heure}</div>
                </div>
                <div style={{ fontWeight:800, color:G }}>{l.montant}€</div>
                <span style={{ fontSize:12, fontWeight:600, color:'#065F46', background:'#D1FAE5', padding:'2px 8px', borderRadius:10 }}>✓ Livré</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Paiements */}
      {tab === 'paiements' && (
        <div>
          <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
            <KpiCard label="Bloqués" value={`${Math.round(totalBloque)}€`} sub="En attente" accent="#D97706" />
            <KpiCard label="Libérés aujourd'hui" value={`${Math.round(transactions.filter(t=>t.date==='2026-04-04'&&t.statut==='libere').reduce((s,t)=>s+t.montant,0))}€`} sub="Validés" accent="#059669" />
            <KpiCard label="Total viré" value={`${transactions.filter(t=>t.type==='virement').reduce((s,t)=>s+t.montant,0)}€`} sub="Virements" accent="#2563EB" />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', gap:8 }}>
              {[['tous','Tous'],['bloques','Bloqués'],['liberes','Libérés'],['virements','Virements']].map(([v,l]) => (
                <button key={v} onClick={() => setPayFilter(v)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight: payFilter===v ? 700 : 500, background: payFilter===v ? G : '#F3F3F3', color: payFilter===v ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.825rem' }}>{l}</button>
              ))}
            </div>
            <button onClick={() => { setModalVirement(true); setVirementDone(false); setVirementAmount(''); }} style={BTN_PRIMARY}>💸 Demander un virement</button>
          </div>
          <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
            {filteredTx.map((t,i) => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < filteredTx.length-1 ? '1px solid #F0F0F0' : 'none' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{t.type==='virement' ? 'Virement vers votre compte' : t.client}</div>
                  <div style={{ fontSize:12, color:'#8B8B8B' }}>{t.date}{t.restaurant ? ` · ${t.restaurant}` : ''} · {t.id}</div>
                </div>
                <div style={{ fontWeight:800, fontSize:16, color: t.type==='virement' ? '#2563EB' : t.statut==='libere' ? '#059669' : '#D97706' }}>{t.type==='virement'?'−':''}{t.montant}€</div>
                <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background: t.statut==='libere'||t.statut==='vire' ? '#D1FAE5' : '#FEF3C7', color: t.statut==='libere'||t.statut==='vire' ? '#065F46' : '#D97706' }}>
                  {t.statut==='libere' ? '✓ Libéré' : t.statut==='bloque' ? '⏳ Bloqué' : '✓ Viré'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Restaurants */}
      {tab === 'restaurants' && (
        <div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Restaurants partenaires</div>
          <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
            {restaurants.map((r,i) => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < restaurants.length-1 ? '1px solid #F0F0F0' : 'none' }}>
                <div style={{ width:44, height:44, borderRadius:10, background:G_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:G, fontSize:16, flexShrink:0 }}>{r.nom[0]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{r.nom}</div>
                  <div style={{ fontSize:12, color:'#8B8B8B' }}>{r.type} · {r.commandes} commandes · ★ {r.note}</div>
                </div>
                <div style={{ fontWeight:800, color:G, fontSize:15 }}>{r.ca}€</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Livreurs */}
      {tab === 'livreurs' && (
        <div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Équipe de livreurs</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
            {livreurs.map(l => (
              <div key={l.id} style={{ ...CARD_STYLE }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:G_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:G, fontSize:15 }}>{l.nom.split(' ').map(n=>n[0]).join('')}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{l.nom}</div>
                    <div style={{ fontSize:12, color:'#8B8B8B' }}>{l.vehicule} · {l.zone}</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
                  <span style={{ color:'#8B8B8B' }}>Note</span><span style={{ fontWeight:700 }}>★ {l.note}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
                  <span style={{ color:'#8B8B8B' }}>Livraisons</span><span style={{ fontWeight:700 }}>{l.livraisons}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                  <span style={{ color:'#8B8B8B' }}>CA jour</span><span style={{ fontWeight:700, color:G }}>{l.caJour}€</span>
                </div>
                <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background: l.enLigne ? G : '#DC2626' }} />
                  <span style={{ fontSize:12, fontWeight:600, color: l.enLigne ? G : '#DC2626' }}>{l.enLigne ? 'En ligne' : 'Hors ligne'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Paramètres */}
      {tab === 'parametres' && (
        <div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Paramètres Freample Eat</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Zone de livraison</div>
              {['3 km','5 km','10 km','15 km','20 km'].map(z => (
                <label key={z} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', fontSize:14, cursor:'pointer' }}>
                  <input type="radio" name="zone" defaultChecked={z==='10 km'} style={{ accentColor:G }} /> {z}
                </label>
              ))}
            </div>
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Notifications</div>
              {[{label:'Nouvelle commande',desc:'Alerte à chaque commande reçue'},{label:'Livreur assigné',desc:'Quand un livreur accepte'},{label:'Livraison terminée',desc:'Quand le client reçoit sa commande'}].map(n => (
                <div key={n.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <div><div style={{ fontSize:14, fontWeight:600 }}>{n.label}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>{n.desc}</div></div>
                  <div style={{ width:44, height:24, borderRadius:12, background:G, position:'relative', cursor:'pointer' }}><div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left:22, boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} /></div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => showToast('Paramètres sauvegardés')} style={{ ...BTN_PRIMARY, marginTop:20, padding:'12px 24px' }}>💾 Sauvegarder</button>
        </div>
      )}

      {/* TAB: Rapports */}
      {tab === 'rapports' && (
        <div>
          <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
            <KpiCard label="Revenus semaine" value={`${REVENUS_7J.reduce((s,r)=>s+r.montant,0)}€`} accent={G} />
            <KpiCard label="Livraisons semaine" value="48" accent="#7C3AED" />
            <KpiCard label="Temps moyen" value="28 min" accent="#059669" />
            <KpiCard label="Note satisfaction" value="4.7/5" accent="#2563EB" />
          </div>
          <div style={{ ...CARD_STYLE, marginBottom:24 }}>
            <div style={SECTION_HDR}>Revenus des 7 derniers jours</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
              {REVENUS_7J.map(r => (
                <div key={r.jour} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:G }}>{r.montant}€</div>
                  <div style={{ width:'100%', background:G, borderRadius:'6px 6px 0 0', height:`${Math.round((r.montant/maxRevenu)*120)}px` }} />
                  <div style={{ fontSize:11, color:'#8B8B8B', fontWeight:600 }}>{r.jour}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Top restaurants</div>
              {restaurants.slice(0,5).map((r,i) => (
                <div key={r.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:13 }}>{i+1}. {r.nom}</span>
                  <span style={{ fontWeight:700, color:G, fontSize:13 }}>{r.commandes}×</span>
                </div>
              ))}
            </div>
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Répartition</div>
              {[{cat:'Commandes livrées',pct:72,color:G},{cat:'En attente',pct:15,color:'#D97706'},{cat:'Annulées',pct:8,color:'#DC2626'},{cat:'En cours',pct:5,color:'#7C3AED'}].map(c => (
                <div key={c.cat} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:3 }}>
                    <span>{c.cat}</span><span style={{ fontWeight:700 }}>{c.pct}%</span>
                  </div>
                  <div style={{ background:'#F3F3F3', borderRadius:4, height:6 }}>
                    <div style={{ background:c.color, borderRadius:4, height:6, width:`${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}

      {/* Livraison detail */}
      {modalLivraison && (
        <div style={MODAL_OVERLAY} onClick={() => setModalLivraison(null)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Livraison {modalLivraison.commande}</div>
            <div style={{ color:'#8B8B8B', fontSize:14, marginBottom:20 }}>{modalLivraison.restaurant} · {modalLivraison.heure}</div>
            <div style={{ ...CARD_STYLE, background:'#FAFAFA', marginBottom:16 }}>
              <div style={SECTION_HDR}>Commande</div>
              {modalLivraison.articles.map((a,i) => <div key={i} style={{ fontSize:13, marginBottom:4 }}>{a}</div>)}
              <div style={{ borderTop:'1px solid #E5E5E5', paddingTop:10, marginTop:10, display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:16 }}>
                <span>Total</span><span style={{ color:G }}>{modalLivraison.montant}€</span>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, color:'#8B8B8B', marginBottom:4 }}>Client</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{modalLivraison.client.nom}</div>
              <div style={{ fontSize:13, color:'#5E5E5E' }}>{modalLivraison.client.adresse}</div>
              <div style={{ fontSize:13, color:'#5E5E5E' }}>{modalLivraison.client.tel}</div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ fontSize:13, color:'#8B8B8B' }}>Livreur</span>
              <span style={{ fontWeight:600 }}>{modalLivraison.livreur || 'Non assigné'}</span>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              {modalLivraison.statut === 'en_attente' && <button onClick={() => { assignerLivreur(modalLivraison.id); setModalLivraison(null); }} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>🛵 Assigner un livreur</button>}
              {['acceptee','en_route'].includes(modalLivraison.statut) && <button onClick={() => marquerLivree(modalLivraison.id)} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>✓ Marquer comme livrée</button>}
              <button onClick={() => setModalLivraison(null)} style={{ ...BTN_GHOST, padding:'12px' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Virement */}
      {modalVirement && (
        <div style={MODAL_OVERLAY} onClick={() => { if (!virementDone) setModalVirement(false); }}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            {virementDone ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
                <div style={{ fontWeight:800, fontSize:20, marginBottom:8 }}>Virement initié !</div>
                <div style={{ color:'#8B8B8B', fontSize:14 }}>Réception sous 1–2 jours ouvrés</div>
              </div>
            ) : (
              <>
                <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Demander un virement</div>
                <div style={{ color:'#8B8B8B', fontSize:14, marginBottom:20 }}>Disponible : <strong style={{ color:G }}>{Math.round(totalBloque)}€</strong></div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Montant (€)</label>
                  <input type="number" value={virementAmount} onChange={e => setVirementAmount(e.target.value)} placeholder={`Max: ${Math.round(totalBloque)}€`} style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid #E5E5E5', fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={submitVirement} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>💸 Confirmer</button>
                  <button onClick={() => setModalVirement(false)} style={{ ...BTN_GHOST, padding:'12px' }}>Annuler</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, background: toast.type==='error' ? '#DC2626' : '#1C1C1E', color:'#fff', padding:'12px 20px', borderRadius:12, fontWeight:600, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,.25)', zIndex:2000, maxWidth:360 }}>{toast.msg}</div>
      )}
    </div>
  );
}

const K_BG = '#F7F7F7';
