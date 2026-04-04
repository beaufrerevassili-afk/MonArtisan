import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const G = '#05944F';
const BG = '#F7F7F7';

const CARD = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E5E5E5', boxShadow:'0 1px 4px rgba(0,0,0,.04)' };
const HDR = { fontSize:13, fontWeight:700, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN = { background:G, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const GHOST = { background:'transparent', color:'#5E5E5E', border:'1px solid #E5E5E5', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };

const TABS = [
  { id:'accueil',     icon:'🏠', label:'Accueil' },
  { id:'livraisons',  icon:'🛵', label:'Mes livraisons' },
  { id:'gains',       icon:'💰', label:'Mes gains' },
  { id:'avis',        icon:'⭐', label:'Mes avis' },
  { id:'profil',      icon:'👤', label:'Mon profil' },
];

const STATUS = {
  nouvelle:   { label:'Nouvelle',    bg:'#FEF3C7', border:'#FDE047', color:'#713F12' },
  acceptee:   { label:'Acceptée',    bg:'#DBEAFE', border:'#93C5FD', color:'#1D4ED8' },
  recuperee:  { label:'Récupérée',   bg:'#F5F3FF', border:'#C4B5FD', color:'#5B21B6' },
  en_route:   { label:'En route',    bg:'#FFF7ED', border:'#FED7AA', color:'#C2410C' },
  livree:     { label:'Livrée',      bg:'#D1FAE5', border:'#86EFAC', color:'#065F46' },
};

const LIVRAISONS = [
  { id:1, restaurant:'La Trattoria', client:'Sophie Martin', adresse:'24 rue de Rivoli, Paris 1er', articles:['1× Pizza Margherita','1× Tiramisu'], montant:32, fraisLiv:4.50, pourboire:3, statut:'en_route', heure:'12:35', distance:'2.3 km' },
  { id:2, restaurant:'Sakura House', client:'Lucas Bernard', adresse:'8 rue de Bretagne, Paris 3e', articles:['2× Sushi Mix','1× Gyoza'], montant:48, fraisLiv:3.80, pourboire:0, statut:'nouvelle', heure:'12:50', distance:'3.1 km' },
  { id:3, restaurant:'Big Smoke', client:'Claire Dupont', adresse:'15 av. Montaigne, Paris 8e', articles:['1× Double Burger','1× Frites XL'], montant:24, fraisLiv:5.20, pourboire:2, statut:'livree', heure:'11:45', distance:'4.2 km' },
  { id:4, restaurant:'Green Bowl', client:'Pierre Garnier', adresse:'52 rue Lepic, Paris 18e', articles:['1× Buddha Bowl'], montant:16, fraisLiv:3.50, pourboire:1, statut:'livree', heure:'11:10', distance:'2.8 km' },
  { id:5, restaurant:'Wok Express', client:'Marie Lambert', adresse:'12 rue des Archives, Paris 4e', articles:['1× Pad Thaï','1× Nem x4'], montant:22, fraisLiv:4.00, pourboire:0, statut:'livree', heure:'10:30', distance:'1.9 km' },
];

const AVIS = [
  { client:'Claire Dupont', note:5, commentaire:'Livraison rapide, tout était chaud !', date:'2026-04-04' },
  { client:'Pierre Garnier', note:5, commentaire:'Très sympathique.', date:'2026-04-04' },
  { client:'Marie Lambert', note:4, commentaire:'Bien livré, un peu de retard.', date:'2026-04-04' },
  { client:'Jean Moreau', note:5, commentaire:'Top livreur !', date:'2026-04-03' },
];

const GAINS_SEMAINE = [
  { jour:'Lun', livraisons:6, montant:32 },{ jour:'Mar', livraisons:8, montant:48 },{ jour:'Mer', livraisons:7, montant:38 },
  { jour:'Jeu', livraisons:9, montant:55 },{ jour:'Ven', livraisons:11, montant:68 },{ jour:'Sam', livraisons:14, montant:85 },
  { jour:'Dim', livraisons:5, montant:28 },
];

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...CARD, flex:1, minWidth:140 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:accent||'#1C1C1E', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#8B8B8B', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function Badge({ statut }) {
  const s = STATUS[statut]; if(!s) return null;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{s.label}</span>;
}

const TAB_MAP = { livraisons:'livraisons', gains:'gains', avis:'avis', profil:'profil' };

export default function DashboardCoursier() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB_MAP[searchParams.get('tab')] || 'accueil');
  const [livraisons, setLivraisons] = useState(LIVRAISONS);
  const [enLigne, setEnLigne] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const o = searchParams.get('tab');
    if (o && TAB_MAP[o]) setTab(TAB_MAP[o]);
    else if (!o) setTab('accueil');
  }, [searchParams]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3500); };
  const gainsJour = livraisons.filter(l=>l.statut==='livree').reduce((s,l)=>s+l.fraisLiv+l.pourboire,0);
  const livJour = livraisons.filter(l=>l.statut==='livree').length;
  const noteAvg = AVIS.length ? (AVIS.reduce((s,a)=>s+a.note,0)/AVIS.length).toFixed(1) : '—';
  const maxG = Math.max(...GAINS_SEMAINE.map(g=>g.montant),1);

  const accepter = (id) => { setLivraisons(p=>p.map(l=>l.id===id?{...l,statut:'acceptee'}:l)); showToast('Livraison acceptée !'); };
  const recuperer = (id) => { setLivraisons(p=>p.map(l=>l.id===id?{...l,statut:'recuperee'}:l)); showToast('Commande récupérée au restaurant'); };
  const enRouteFn = (id) => { setLivraisons(p=>p.map(l=>l.id===id?{...l,statut:'en_route'}:l)); showToast('En route vers le client !'); };
  const livrer = (id) => { setLivraisons(p=>p.map(l=>l.id===id?{...l,statut:'livree'}:l)); showToast('Livraison terminée — paiement reçu !'); };

  return (
    <div style={{ padding:'24px 28px', background:BG, minHeight:'100vh', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800 }}>🛵 Freample Eat — Livreur</div>
          <div style={{ fontSize:14, color:'#8B8B8B', marginTop:2 }}>Bonjour, {user?.nom || 'Livreur'}</div>
        </div>
        <button onClick={()=>setEnLigne(!enLigne)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:999, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, fontFamily:'inherit', background:enLigne?'#D1FAE5':'#FEE2E2', color:enLigne?'#065F46':'#DC2626' }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:enLigne?G:'#DC2626' }} />{enLigne?'En ligne':'Hors ligne'}
        </button>
      </div>

      <div style={{ display:'flex', gap:4, background:'#fff', borderRadius:14, padding:6, border:'1px solid #E5E5E5', marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:tab===t.id?700:500, background:tab===t.id?G:'transparent', color:tab===t.id?'#fff':'#666', fontFamily:'inherit', fontSize:'0.875rem', transition:'all .15s' }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ACCUEIL */}
      {tab==='accueil'&&(<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Gains aujourd'hui" value={`${gainsJour.toFixed(0)}€`} accent={G} />
          <KpiCard label="Livraisons" value={livJour} accent="#7C3AED" />
          <KpiCard label="Note" value={`${noteAvg}/5`} accent="#F59E0B" />
          <KpiCard label="Km parcourus" value="11.2 km" accent="#3B82F6" />
        </div>
        {/* Livraison active */}
        {livraisons.filter(l=>['acceptee','recuperee','en_route'].includes(l.statut)).map(l=>(
          <div key={l.id} style={{ ...CARD, marginBottom:16, border:`2px solid ${STATUS[l.statut].border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ fontSize:16, fontWeight:800 }}>Livraison en cours</div>
              <Badge statut={l.statut} />
            </div>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:2 }}>🍽️ {l.restaurant}</div>
            <div style={{ fontSize:14, color:'#5E5E5E', marginBottom:8 }}>📍 {l.client} — {l.adresse}</div>
            <div style={{ fontSize:12, color:'#8B8B8B', marginBottom:4 }}>{l.articles.join(', ')}</div>
            <div style={{ display:'flex', gap:12, fontSize:13, color:'#8B8B8B', marginBottom:14 }}>
              <span>{l.distance}</span><span style={{ fontWeight:800, color:G, fontSize:15 }}>+{l.fraisLiv}€</span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {l.statut==='acceptee'&&<button onClick={()=>recuperer(l.id)} style={{ ...BTN, flex:1, padding:'12px' }}>📦 Commande récupérée</button>}
              {l.statut==='recuperee'&&<button onClick={()=>enRouteFn(l.id)} style={{ ...BTN, flex:1, padding:'12px' }}>🛵 En route</button>}
              {l.statut==='en_route'&&<button onClick={()=>livrer(l.id)} style={{ ...BTN, flex:1, padding:'12px' }}>✓ Livré au client</button>}
              <button style={{ ...GHOST, padding:'12px' }}>📞 Appeler</button>
            </div>
          </div>
        ))}
        {/* Nouvelles livraisons */}
        <div style={CARD}>
          <div style={HDR}>Livraisons disponibles</div>
          {livraisons.filter(l=>l.statut==='nouvelle').length===0&&<div style={{ color:'#8B8B8B', padding:20, textAlign:'center' }}>En attente de livraisons...</div>}
          {livraisons.filter(l=>l.statut==='nouvelle').map(l=>(
            <div key={l.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px', background:'#FAFAFA', borderRadius:10, marginBottom:8, border:'1px solid #F0F0F0' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{l.restaurant} → {l.client}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{l.distance} · {l.articles.length} article{l.articles.length>1?'s':''}</div>
              </div>
              <div style={{ fontWeight:800, fontSize:16, color:G, marginRight:12 }}>+{l.fraisLiv}€</div>
              <button onClick={()=>accepter(l.id)} style={{ ...BTN, padding:'8px 16px' }}>Accepter</button>
            </div>
          ))}
        </div>
      </div>)}

      {/* MES LIVRAISONS */}
      {tab==='livraisons'&&(<div>
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          {livraisons.map((l,i)=>(
            <div key={l.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:i<livraisons.length-1?'1px solid #F0F0F0':'none' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{l.restaurant} → {l.client}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{l.heure} · {l.distance} · {l.articles.length} articles</div>
              </div>
              <div style={{ fontWeight:800, color:G }}>{l.fraisLiv}€</div>
              {l.pourboire>0&&<span style={{ fontSize:11, fontWeight:700, color:'#F59E0B', background:'#FFFBEB', padding:'2px 8px', borderRadius:10 }}>+{l.pourboire}€</span>}
              <Badge statut={l.statut} />
            </div>
          ))}
        </div>
      </div>)}

      {/* MES GAINS */}
      {tab==='gains'&&(<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Cette semaine" value={`${GAINS_SEMAINE.reduce((s,g)=>s+g.montant,0)}€`} accent={G} />
          <KpiCard label="Livraisons" value={GAINS_SEMAINE.reduce((s,g)=>s+g.livraisons,0)} accent="#7C3AED" />
          <KpiCard label="Pourboires" value={`${livraisons.reduce((s,l)=>s+l.pourboire,0)}€`} accent="#F59E0B" />
        </div>
        <div style={CARD}>
          <div style={HDR}>Gains par jour</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
            {GAINS_SEMAINE.map(g=>(
              <div key={g.jour} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:12, fontWeight:700, color:G }}>{g.montant}€</div>
                <div style={{ width:'100%', background:G, borderRadius:'6px 6px 0 0', height:`${Math.round((g.montant/maxG)*120)}px` }} />
                <div style={{ fontSize:11, color:'#8B8B8B', fontWeight:600 }}>{g.jour}</div>
              </div>
            ))}
          </div>
        </div>
      </div>)}

      {/* MES AVIS */}
      {tab==='avis'&&(<div>
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          {AVIS.map((a,i)=>(
            <div key={i} style={{ padding:'16px 20px', borderBottom:i<AVIS.length-1?'1px solid #F0F0F0':'none' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>{a.client}</span>
                <span style={{ color:'#F59E0B' }}>{'★'.repeat(a.note)}{'☆'.repeat(5-a.note)}</span>
              </div>
              <div style={{ fontSize:13, color:'#5E5E5E' }}>"{a.commentaire}"</div>
              <div style={{ fontSize:12, color:'#8B8B8B', marginTop:4 }}>{a.date}</div>
            </div>
          ))}
        </div>
      </div>)}

      {/* PROFIL */}
      {tab==='profil'&&(<div>
        <div style={{ ...CARD, textAlign:'center', padding:32 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#E6F4ED', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:G }}>{(user?.nom||'L')[0]}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{user?.nom || 'Livreur'}</div>
          <div style={{ fontSize:14, color:'#8B8B8B', marginTop:4 }}>{user?.email}</div>
          <div style={{ fontSize:13, color:'#8B8B8B', marginTop:8 }}>🛵 Vélo électrique · Paris Centre</div>
          <div style={{ marginTop:20, display:'flex', justifyContent:'center', gap:24 }}>
            <div><div style={{ fontSize:22, fontWeight:800, color:G }}>{GAINS_SEMAINE.reduce((s,g)=>s+g.livraisons,0)}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Livraisons</div></div>
            <div><div style={{ fontSize:22, fontWeight:800, color:'#F59E0B' }}>{noteAvg}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Note</div></div>
            <div><div style={{ fontSize:22, fontWeight:800 }}>{GAINS_SEMAINE.reduce((s,g)=>s+g.montant,0)}€</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Semaine</div></div>
          </div>
        </div>
      </div>)}

      {toast&&<div style={{ position:'fixed', top:24, right:24, background:'#1C1C1E', color:'#fff', padding:'12px 20px', borderRadius:12, fontWeight:600, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,.25)', zIndex:2000 }}>{toast}</div>}
    </div>
  );
}
