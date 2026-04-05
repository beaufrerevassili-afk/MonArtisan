import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldLight:'#F5EFE0', goldDark:'#8B7240',
  border:'#E8E6E1', green:'#16A34A', greenBg:'#F0FDF4',
  red:'#DC2626', redBg:'#FEF2F2', blue:'#2563EB', blueBg:'#EFF6FF',
  orange:'#D97706', orangeBg:'#FFFBEB',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

const STORAGE_KEY = 'freample_immo_data';
const TYPES_BIEN = ['Appartement','Studio','Maison','Local commercial','Parking','Cave','Terrain'];
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const DEFAULT_DATA = {
  scis: [
    { id:1, nom:'SCI Riviera', type:'IR', parts:100 },
    { id:2, nom:'SCI Patrimoine 75', type:'IS', parts:500 },
  ],
  biens: [
    { id:1, sciId:1, type:'Appartement', adresse:'24 rue de la Liberté, Nice', surface:65, valeur:180000, loyer:850, charges:150, locataireId:1 },
    { id:2, sciId:1, type:'Studio', adresse:'8 av. Jean Médecin, Nice', surface:28, valeur:95000, loyer:550, charges:80, locataireId:2 },
    { id:3, sciId:2, type:'Appartement', adresse:'15 rue du Faubourg, Paris 10e', surface:45, valeur:320000, loyer:1200, charges:200, locataireId:3 },
    { id:4, sciId:2, type:'Local commercial', adresse:'42 bd Voltaire, Paris 11e', surface:55, valeur:280000, loyer:2200, charges:350, locataireId:4 },
    { id:5, sciId:2, type:'Appartement', adresse:'7 rue Lepic, Paris 18e', surface:38, valeur:250000, loyer:0, charges:180, locataireId:null },
  ],
  locataires: [
    { id:1, nom:'M. Martin', email:'martin@email.com', tel:'0612345678', debut:'2024-09-01', fin:'2027-08-31', depot:850 },
    { id:2, nom:'Mme Duval', email:'duval@email.com', tel:'0698765432', debut:'2025-01-01', fin:'2028-12-31', depot:550 },
    { id:3, nom:'Mme Lambert', email:'lambert@email.com', tel:'0645678901', debut:'2025-03-01', fin:'2028-02-28', depot:1200 },
    { id:4, nom:'SARL Café Voltaire', email:'cafe@voltaire.fr', tel:'0156789012', debut:'2024-01-01', fin:'2033-12-31', depot:4400 },
  ],
  paiements: [
    { id:1, bienId:1, mois:'2026-04', montant:850, date:'2026-04-01', statut:'paye' },
    { id:2, bienId:2, mois:'2026-04', montant:550, date:'2026-04-02', statut:'paye' },
    { id:3, bienId:3, mois:'2026-04', montant:0, date:null, statut:'impaye' },
    { id:4, bienId:4, mois:'2026-04', montant:2200, date:'2026-04-01', statut:'paye' },
    { id:5, bienId:1, mois:'2026-03', montant:850, date:'2026-03-01', statut:'paye' },
    { id:6, bienId:2, mois:'2026-03', montant:550, date:'2026-03-03', statut:'paye' },
    { id:7, bienId:3, mois:'2026-03', montant:1200, date:'2026-03-01', statut:'paye' },
    { id:8, bienId:4, mois:'2026-03', montant:2200, date:'2026-03-01', statut:'paye' },
  ],
  nextId: 10,
};

function loadData() { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : DEFAULT_DATA; } catch { return DEFAULT_DATA; } }
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

// Styles
const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const LBL = { fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

export default function ImmoDemo() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const [data, setData] = useState(loadData);
  const [activeSci, setActiveSci] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null); // { type:'addBien'|'addLocataire'|'quittance'|'revision'|'paiement', data }
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => { saveData(data); }, [data]);
  if (!user || user.email !== 'freamplecom@gmail.com') { navigate('/'); return null; }

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 3000); };
  const genId = () => { const id = data.nextId; setData(d=>({...d, nextId:d.nextId+1})); return id; };

  const sci = activeSci ? data.scis.find(s=>s.id===activeSci) : null;
  const biens = activeSci ? data.biens.filter(b=>b.sciId===activeSci) : data.biens;
  const totalLoyers = biens.reduce((s,b)=>s+b.loyer,0);
  const totalCharges = biens.reduce((s,b)=>s+b.charges,0);
  const totalValeur = biens.reduce((s,b)=>s+b.valeur,0);
  const vacants = biens.filter(b=>!b.locataireId).length;
  const occupation = biens.length > 0 ? Math.round(((biens.length-vacants)/biens.length)*100) : 0;
  const rendementBrut = totalValeur > 0 ? ((totalLoyers*12)/totalValeur*100).toFixed(2) : '0';
  const rendementNet = totalValeur > 0 ? (((totalLoyers-totalCharges)*12)/totalValeur*100).toFixed(2) : '0';
  const cashflow = totalLoyers - totalCharges;

  const getLocataire = (id) => data.locataires.find(l=>l.id===id);
  const getPaiementsMois = (mois) => data.paiements.filter(p=>p.mois===mois);
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;

  const impayes = biens.filter(b=>b.locataireId && !data.paiements.find(p=>p.bienId===b.id && p.mois===currentMonth && p.statut==='paye'));

  const TABS = [
    { id:'dashboard', label:'Tableau de bord', icon:'📊' },
    { id:'biens', label:'Biens', icon:'🏠' },
    { id:'locataires', label:'Locataires', icon:'👥' },
    { id:'paiements', label:'Loyers & Paiements', icon:'💰' },
    { id:'quittances', label:'Quittances', icon:'📄' },
    { id:'finances', label:'Finances', icon:'📈' },
    { id:'outils', label:'Outils', icon:'🔧' },
    { id:'alertes', label:'Alertes', icon:'🔔' },
  ];

  // ── ACTIONS ──
  const addBien = () => {
    const b = { id:genId(), sciId:activeSci||data.scis[0]?.id||1, type:form.type||'Appartement', adresse:form.adresse||'', surface:Number(form.surface)||0, valeur:Number(form.valeur)||0, loyer:Number(form.loyer)||0, charges:Number(form.charges)||0, locataireId:null };
    setData(d=>({...d, biens:[...d.biens, b]}));
    setModal(null); setForm({}); showToast('Bien ajouté');
  };
  const deleteBien = (id) => { setData(d=>({...d, biens:d.biens.filter(b=>b.id!==id), paiements:d.paiements.filter(p=>p.bienId!==id)})); showToast('Bien supprimé'); };
  const addLocataire = () => {
    const l = { id:genId(), nom:form.nom||'', email:form.email||'', tel:form.tel||'', debut:form.debut||'', fin:form.fin||'', depot:Number(form.depot)||0 };
    setData(d=>({...d, locataires:[...d.locataires, l]}));
    if (form.bienId) setData(d=>({...d, biens:d.biens.map(b=>b.id===Number(form.bienId)?{...b,locataireId:l.id}:b)}));
    setModal(null); setForm({}); showToast('Locataire ajouté');
  };
  const enregistrerPaiement = (bienId) => {
    const exists = data.paiements.find(p=>p.bienId===bienId && p.mois===currentMonth && p.statut==='paye');
    if (exists) return;
    const bien = data.biens.find(b=>b.id===bienId);
    const p = { id:genId(), bienId, mois:currentMonth, montant:bien?.loyer||0, date:new Date().toISOString().slice(0,10), statut:'paye' };
    setData(d=>({...d, paiements:[...d.paiements, p]}));
    showToast('Paiement enregistré');
  };
  const resetData = () => { setData(DEFAULT_DATA); showToast('Données réinitialisées'); };

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text, display:'flex', flexDirection:'column' }}>

      {/* TOAST */}
      {toast && <div style={{ position:'fixed', top:20, right:20, background:L.noir, color:'#fff', padding:'12px 24px', fontSize:13, fontWeight:600, zIndex:9999, boxShadow:'0 4px 16px rgba(0,0,0,0.15)' }}>{toast}</div>}

      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:52, background:L.white, borderBottom:`1px solid ${L.border}`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>navigate('/immo')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:800, color:L.text, fontFamily:L.font }}>Freample<span style={{ color:L.gold }}>.</span> Immo</button>
          <span style={{ fontSize:10, fontWeight:700, color:L.green, background:'rgba(34,197,94,0.08)', padding:'2px 8px', borderRadius:4 }}>Opérationnel</span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={resetData} style={{ ...BTN_OUTLINE, fontSize:11, padding:'5px 12px' }}>↻ Reset</button>
          <button onClick={()=>navigate('/')} style={{ ...BTN, fontSize:11, padding:'5px 12px' }}>Accueil</button>
        </div>
      </nav>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* SIDEBAR */}
        <div style={{ width:220, background:L.white, borderRight:`1px solid ${L.border}`, overflowY:'auto', flexShrink:0 }}>
          <div style={{ padding:'12px', borderBottom:`1px solid ${L.border}` }}>
            <div style={{ ...LBL, marginBottom:6 }}>Mes SCI</div>
            <button onClick={()=>setActiveSci(null)} style={{ width:'100%', padding:'7px 10px', background:!activeSci?L.cream:'transparent', border:`1px solid ${!activeSci?L.gold:L.border}`, color:!activeSci?L.goldDark:L.textSec, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:L.font, marginBottom:3, textAlign:'left' }}>
              📊 Consolidé ({data.biens.length} biens)
            </button>
            {data.scis.map(s=>{
              const nb = data.biens.filter(b=>b.sciId===s.id).length;
              return <button key={s.id} onClick={()=>setActiveSci(s.id)} style={{ width:'100%', padding:'7px 10px', background:activeSci===s.id?L.cream:'transparent', border:`1px solid ${activeSci===s.id?L.gold:L.border}`, color:activeSci===s.id?L.goldDark:L.text, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:L.font, marginBottom:3, textAlign:'left' }}>
                🏛️ {s.nom} <span style={{ color:L.textLight, fontSize:10 }}>({nb})</span>
              </button>;
            })}
          </div>
          <div style={{ padding:'6px 0' }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ width:'100%', padding:'9px 14px', background:tab===t.id?L.cream:'transparent', border:'none', display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:tab===t.id?700:500, color:tab===t.id?L.text:L.textSec, cursor:'pointer', fontFamily:L.font, borderLeft:tab===t.id?`3px solid ${L.gold}`:'3px solid transparent' }}>
                <span style={{ fontSize:14 }}>{t.icon}</span>{t.label}
                {t.id==='alertes' && impayes.length>0 && <span style={{ marginLeft:'auto', background:L.red, color:'#fff', fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:10 }}>{impayes.length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px' }}>

          {/* ═══ DASHBOARD ═══ */}
          {tab==='dashboard' && <>
            <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 16px' }}>{sci?.nom || 'Vue consolidée'}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:10, marginBottom:20 }}>
              {[
                { l:'Loyers/mois', v:`${totalLoyers.toLocaleString()}€`, c:L.green },
                { l:'Charges/mois', v:`${totalCharges.toLocaleString()}€`, c:L.red },
                { l:'Cashflow net', v:`${cashflow.toLocaleString()}€`, c:cashflow>0?L.green:L.red },
                { l:'Biens', v:biens.length, c:L.blue },
                { l:'Occupation', v:`${occupation}%`, c:occupation>80?L.green:L.orange },
                { l:'Rendement brut', v:`${rendementBrut}%`, c:L.gold },
                { l:'Rendement net', v:`${rendementNet}%`, c:L.gold },
                { l:'Patrimoine', v:`${(totalValeur/1000).toFixed(0)}k€`, c:L.blue },
              ].map(k=>(
                <div key={k.l} style={{ ...CARD, position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:k.c }} />
                  <div style={{ fontSize:10, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>{k.l}</div>
                  <div style={{ fontSize:20, fontWeight:200, color:L.text, fontFamily:L.serif }}>{k.v}</div>
                </div>
              ))}
            </div>
            {impayes.length>0 && <div style={{ background:L.redBg, border:`1px solid ${L.red}30`, padding:'14px 18px', marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:L.red, marginBottom:6 }}>⚠️ {impayes.length} loyer{impayes.length>1?'s':''} impayé{impayes.length>1?'s':''} ce mois</div>
              {impayes.map(b=><div key={b.id} style={{ fontSize:12, color:L.red, padding:'2px 0' }}>• {b.adresse} — {b.loyer}€</div>)}
            </div>}
          </>}

          {/* ═══ BIENS ═══ */}
          {tab==='biens' && <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>Biens ({biens.length})</h2>
              <button onClick={()=>{setForm({type:'Appartement',sciId:activeSci||data.scis[0]?.id});setModal({type:'addBien'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Ajouter un bien</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:10 }}>
              {biens.map(b=>{
                const loc = getLocataire(b.locataireId);
                const rdt = b.valeur>0 ? ((b.loyer*12)/b.valeur*100).toFixed(1) : '0';
                return <div key={b.id} style={{ ...CARD, transition:'all .15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;}}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:L.goldDark, background:L.goldLight, padding:'2px 8px' }}>{b.type}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:loc?L.green:L.red, background:loc?L.greenBg:L.redBg, padding:'2px 8px' }}>{loc?'Loué':'Vacant'}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{b.adresse}</div>
                  <div style={{ fontSize:11, color:L.textSec, marginBottom:10 }}>{b.surface}m² · Valeur: {b.valeur.toLocaleString()}€</div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                    <span style={{ color:L.textSec }}>Loyer</span><span style={{ fontWeight:700, color:b.loyer?L.green:L.textLight }}>{b.loyer?`${b.loyer}€/mois`:'—'}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                    <span style={{ color:L.textSec }}>Charges</span><span style={{ fontWeight:600 }}>{b.charges}€/mois</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                    <span style={{ color:L.textSec }}>Rendement brut</span><span style={{ fontWeight:700, color:L.gold }}>{rdt}%</span>
                  </div>
                  {loc && <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}><span style={{ color:L.textSec }}>Locataire</span><span style={{ fontWeight:600 }}>{loc.nom}</span></div>}
                  <div style={{ display:'flex', gap:6, marginTop:12 }}>
                    {loc && !data.paiements.find(p=>p.bienId===b.id&&p.mois===currentMonth&&p.statut==='paye') &&
                      <button onClick={()=>enregistrerPaiement(b.id)} style={{ ...BTN, fontSize:10, padding:'5px 10px', background:L.green }}>Encaisser loyer</button>}
                    <button onClick={()=>deleteBien(b.id)} style={{ ...BTN_OUTLINE, fontSize:10, padding:'5px 10px', color:L.red, borderColor:L.red+'40' }}>Supprimer</button>
                  </div>
                </div>;
              })}
            </div>
          </>}

          {/* ═══ LOCATAIRES ═══ */}
          {tab==='locataires' && <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>Locataires ({data.locataires.length})</h2>
              <button onClick={()=>{setForm({});setModal({type:'addLocataire'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Ajouter un locataire</button>
            </div>
            <div style={{ ...CARD, padding:0 }}>
              {data.locataires.map((l,i)=>{
                const bien = data.biens.find(b=>b.locataireId===l.id);
                return <div key={l.id} style={{ padding:'14px 18px', borderBottom:i<data.locataires.length-1?`1px solid ${L.border}`:'none', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{l.nom}</div>
                    <div style={{ fontSize:12, color:L.textSec }}>{l.email} · {l.tel}</div>
                    <div style={{ fontSize:11, color:L.textLight }}>Bail: {l.debut} → {l.fin} · Dépôt: {l.depot}€</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    {bien ? <>
                      <div style={{ fontSize:13, fontWeight:700, color:L.green }}>{bien.loyer}€/mois</div>
                      <div style={{ fontSize:11, color:L.textSec }}>{bien.adresse.slice(0,30)}...</div>
                    </> : <span style={{ fontSize:11, color:L.textLight }}>Sans bien assigné</span>}
                  </div>
                </div>;
              })}
            </div>
          </>}

          {/* ═══ PAIEMENTS ═══ */}
          {tab==='paiements' && <>
            <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 16px' }}>Loyers — {MOIS[new Date().getMonth()]} {new Date().getFullYear()}</h2>
            <div style={{ ...CARD, padding:0 }}>
              {biens.filter(b=>b.locataireId).map((b,i,arr)=>{
                const loc = getLocataire(b.locataireId);
                const paid = data.paiements.find(p=>p.bienId===b.id && p.mois===currentMonth && p.statut==='paye');
                return <div key={b.id} style={{ padding:'14px 18px', borderBottom:i<arr.length-1?`1px solid ${L.border}`:'none', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{loc?.nom}</div>
                    <div style={{ fontSize:11, color:L.textSec }}>{b.adresse}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:14, fontWeight:700 }}>{b.loyer}€</span>
                    {paid ? <span style={{ fontSize:11, fontWeight:700, color:L.green, background:L.greenBg, padding:'3px 10px' }}>Payé le {paid.date}</span>
                      : <button onClick={()=>enregistrerPaiement(b.id)} style={{ ...BTN, fontSize:11, padding:'5px 14px', background:L.green }}>Encaisser</button>}
                  </div>
                </div>;
              })}
            </div>
          </>}

          {/* ═══ QUITTANCES ═══ */}
          {tab==='quittances' && <>
            <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 16px' }}>Quittances de loyer</h2>
            <p style={{ fontSize:13, color:L.textSec, marginBottom:16 }}>Cliquez sur "Générer" pour créer une quittance pour un paiement encaissé.</p>
            <div style={{ ...CARD, padding:0 }}>
              {data.paiements.filter(p=>p.statut==='paye').sort((a,b)=>b.mois.localeCompare(a.mois)).map((p,i,arr)=>{
                const bien = data.biens.find(b=>b.id===p.bienId);
                const loc = bien ? getLocataire(bien.locataireId) : null;
                const [y,m] = p.mois.split('-');
                return <div key={p.id} style={{ padding:'12px 18px', borderBottom:i<arr.length-1?`1px solid ${L.border}`:'none', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{loc?.nom || '?'} — {MOIS[parseInt(m)-1]} {y}</div>
                    <div style={{ fontSize:11, color:L.textSec }}>{bien?.adresse}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:13, fontWeight:700 }}>{p.montant}€</span>
                    <button onClick={()=>setModal({type:'quittance', data:{...p, bien, loc, moisLabel:`${MOIS[parseInt(m)-1]} ${y}`}})} style={{ ...BTN_OUTLINE, fontSize:10, padding:'5px 12px' }}>Voir quittance</button>
                  </div>
                </div>;
              })}
            </div>
          </>}

          {/* ═══ FINANCES ═══ */}
          {tab==='finances' && <>
            <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 16px' }}>Analyse financière</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              <div style={CARD}>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Revenus annuels estimés</div>
                {[{l:'Loyers bruts',v:totalLoyers*12},{l:'Charges',v:-(totalCharges*12)},{l:'Revenu net',v:(totalLoyers-totalCharges)*12}].map(r=>(
                  <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${L.border}`, fontSize:13 }}>
                    <span style={{ color:L.textSec }}>{r.l}</span><span style={{ fontWeight:700, color:r.v>=0?L.green:L.red }}>{r.v.toLocaleString()}€</span>
                  </div>
                ))}
              </div>
              <div style={CARD}>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Rendement par bien</div>
                {biens.filter(b=>b.valeur>0).map(b=>{
                  const rdt = ((b.loyer*12)/b.valeur*100);
                  return <div key={b.id} style={{ marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                      <span style={{ color:L.textSec }}>{b.adresse.slice(0,35)}...</span><span style={{ fontWeight:700, color:L.gold }}>{rdt.toFixed(1)}%</span>
                    </div>
                    <div style={{ height:4, background:L.cream, borderRadius:2 }}><div style={{ height:4, background:L.gold, borderRadius:2, width:`${Math.min(rdt*10,100)}%` }} /></div>
                  </div>;
                })}
              </div>
            </div>
            <div style={CARD}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Historique des encaissements</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:120 }}>
                {['2026-01','2026-02','2026-03','2026-04'].map(m=>{
                  const total = data.paiements.filter(p=>p.mois===m&&p.statut==='paye').reduce((s,p)=>s+p.montant,0);
                  const max = totalLoyers || 1;
                  return <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:L.gold }}>{total}€</div>
                    <div style={{ width:'100%', background:L.gold, borderRadius:'3px 3px 0 0', height:Math.max(8,Math.round((total/max)*80)), opacity:0.7 }} />
                    <div style={{ fontSize:10, color:L.textLight }}>{MOIS[parseInt(m.split('-')[1])-1].slice(0,3)}</div>
                  </div>;
                })}
              </div>
            </div>
          </>}

          {/* ═══ OUTILS ═══ */}
          {tab==='outils' && <>
            <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 16px' }}>Outils de calcul</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {/* Simulateur rendement */}
              <div style={CARD}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>📊 Simulateur de rendement</div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Prix d'achat (€)</label><input type="number" value={form.simPrix||''} onChange={e=>setForm(f=>({...f,simPrix:e.target.value}))} style={INP} placeholder="200000" /></div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Loyer mensuel (€)</label><input type="number" value={form.simLoyer||''} onChange={e=>setForm(f=>({...f,simLoyer:e.target.value}))} style={INP} placeholder="800" /></div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Charges mensuelles (€)</label><input type="number" value={form.simCharges||''} onChange={e=>setForm(f=>({...f,simCharges:e.target.value}))} style={INP} placeholder="150" /></div>
                {form.simPrix && form.simLoyer && <div style={{ background:L.cream, padding:'14px', marginTop:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Rendement brut</span><span style={{ fontWeight:700, color:L.gold }}>{((Number(form.simLoyer)*12)/Number(form.simPrix)*100).toFixed(2)}%</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Rendement net</span><span style={{ fontWeight:700, color:L.green }}>{(((Number(form.simLoyer)-Number(form.simCharges||0))*12)/Number(form.simPrix)*100).toFixed(2)}%</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span>Cashflow mensuel</span><span style={{ fontWeight:700, color:Number(form.simLoyer)-Number(form.simCharges||0)>0?L.green:L.red }}>{Number(form.simLoyer)-Number(form.simCharges||0)}€</span></div>
                </div>}
              </div>
              {/* Révision de loyer */}
              <div style={CARD}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>📐 Révision de loyer (IRL)</div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Loyer actuel (€)</label><input type="number" value={form.revLoyer||''} onChange={e=>setForm(f=>({...f,revLoyer:e.target.value}))} style={INP} placeholder="800" /></div>
                <div style={{ marginBottom:8 }}><label style={LBL}>IRL ancien</label><input type="number" value={form.revIrlOld||''} onChange={e=>setForm(f=>({...f,revIrlOld:e.target.value}))} style={INP} placeholder="142.06" step="0.01" /></div>
                <div style={{ marginBottom:8 }}><label style={LBL}>IRL nouveau</label><input type="number" value={form.revIrlNew||''} onChange={e=>setForm(f=>({...f,revIrlNew:e.target.value}))} style={INP} placeholder="143.46" step="0.01" /></div>
                {form.revLoyer && form.revIrlOld && form.revIrlNew && <div style={{ background:L.cream, padding:'14px', marginTop:8 }}>
                  <div style={{ fontSize:12, color:L.textSec, marginBottom:8 }}>Formule : Loyer × (IRL nouveau / IRL ancien)</div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Nouveau loyer</span><span style={{ fontWeight:700, color:L.gold }}>{(Number(form.revLoyer)*(Number(form.revIrlNew)/Number(form.revIrlOld))).toFixed(2)}€</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span>Augmentation</span><span style={{ fontWeight:700, color:L.green }}>+{(Number(form.revLoyer)*(Number(form.revIrlNew)/Number(form.revIrlOld))-Number(form.revLoyer)).toFixed(2)}€/mois</span></div>
                </div>}
              </div>
            </div>
          </>}

          {/* ═══ ALERTES ═══ */}
          {tab==='alertes' && <>
            <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 16px' }}>Alertes</h2>
            {[
              ...impayes.map(b=>({ type:'danger', msg:`Loyer impayé — ${getLocataire(b.locataireId)?.nom} — ${b.loyer}€ — ${b.adresse}` })),
              ...data.locataires.filter(l=>{ const d=new Date(l.fin); const now=new Date(); const diff=(d-now)/(1000*60*60*24); return diff>0 && diff<90; }).map(l=>({ type:'warning', msg:`Fin de bail dans moins de 3 mois — ${l.nom} — ${l.fin}` })),
              ...biens.filter(b=>!b.locataireId).map(b=>({ type:'info', msg:`Bien vacant — ${b.adresse} — perte de ${b.loyer||0}€/mois` })),
            ].map((a,i)=>(
              <div key={i} style={{ background:a.type==='danger'?L.redBg:a.type==='warning'?L.orangeBg:L.blueBg, border:`1px solid ${a.type==='danger'?L.red:a.type==='warning'?L.orange:L.blue}30`, padding:'14px 18px', marginBottom:6, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:a.type==='danger'?L.red:a.type==='warning'?L.orange:L.blue }} />
                <span style={{ fontSize:13, color:a.type==='danger'?L.red:a.type==='warning'?L.orange:L.blue, fontWeight:500 }}>{a.msg}</span>
              </div>
            ))}
            {impayes.length===0 && biens.filter(b=>!b.locataireId).length===0 && <div style={{ textAlign:'center', padding:40, color:L.textLight }}>Aucune alerte</div>}
          </>}
        </div>
      </div>

      {/* ═══ MODALS ═══ */}
      {modal && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(6px)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={()=>{setModal(null);setForm({});}}>
        <div style={{ background:L.white, maxWidth:480, width:'100%', maxHeight:'85vh', overflowY:'auto', padding:'28px 24px' }} onClick={e=>e.stopPropagation()}>

          {modal.type==='addBien' && <>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 16px' }}>Ajouter un bien</h3>
            <div style={{ marginBottom:10 }}><label style={LBL}>Type</label><select value={form.type||'Appartement'} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={INP}>{TYPES_BIEN.map(t=><option key={t}>{t}</option>)}</select></div>
            <div style={{ marginBottom:10 }}><label style={LBL}>Adresse</label><input value={form.adresse||''} onChange={e=>setForm(f=>({...f,adresse:e.target.value}))} style={INP} placeholder="12 rue..." /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
              <div><label style={LBL}>Surface (m²)</label><input type="number" value={form.surface||''} onChange={e=>setForm(f=>({...f,surface:e.target.value}))} style={INP} /></div>
              <div><label style={LBL}>Valeur (€)</label><input type="number" value={form.valeur||''} onChange={e=>setForm(f=>({...f,valeur:e.target.value}))} style={INP} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              <div><label style={LBL}>Loyer (€/mois)</label><input type="number" value={form.loyer||''} onChange={e=>setForm(f=>({...f,loyer:e.target.value}))} style={INP} /></div>
              <div><label style={LBL}>Charges (€/mois)</label><input type="number" value={form.charges||''} onChange={e=>setForm(f=>({...f,charges:e.target.value}))} style={INP} /></div>
            </div>
            <button onClick={addBien} style={{ ...BTN, width:'100%' }} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Ajouter</button>
          </>}

          {modal.type==='addLocataire' && <>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 16px' }}>Ajouter un locataire</h3>
            <div style={{ marginBottom:10 }}><label style={LBL}>Nom</label><input value={form.nom||''} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} style={INP} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
              <div><label style={LBL}>Email</label><input value={form.email||''} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={INP} /></div>
              <div><label style={LBL}>Téléphone</label><input value={form.tel||''} onChange={e=>setForm(f=>({...f,tel:e.target.value}))} style={INP} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
              <div><label style={LBL}>Début bail</label><input type="date" value={form.debut||''} onChange={e=>setForm(f=>({...f,debut:e.target.value}))} style={INP} /></div>
              <div><label style={LBL}>Fin bail</label><input type="date" value={form.fin||''} onChange={e=>setForm(f=>({...f,fin:e.target.value}))} style={INP} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              <div><label style={LBL}>Dépôt de garantie (€)</label><input type="number" value={form.depot||''} onChange={e=>setForm(f=>({...f,depot:e.target.value}))} style={INP} /></div>
              <div><label style={LBL}>Assigner au bien</label><select value={form.bienId||''} onChange={e=>setForm(f=>({...f,bienId:e.target.value}))} style={INP}><option value="">Aucun</option>{biens.filter(b=>!b.locataireId).map(b=><option key={b.id} value={b.id}>{b.adresse.slice(0,40)}</option>)}</select></div>
            </div>
            <button onClick={addLocataire} style={{ ...BTN, width:'100%' }} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Ajouter</button>
          </>}

          {modal.type==='quittance' && modal.data && <>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:8 }}>Quittance de loyer</div>
              <div style={{ fontSize:18, fontWeight:800 }}>{modal.data.moisLabel}</div>
            </div>
            <div style={{ border:`1px solid ${L.border}`, padding:'20px', marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:`1px solid ${L.border}` }}><span style={{ color:L.textSec }}>Bailleur</span><span style={{ fontWeight:600 }}>Freample Immo</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:`1px solid ${L.border}` }}><span style={{ color:L.textSec }}>Locataire</span><span style={{ fontWeight:600 }}>{modal.data.loc?.nom}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:`1px solid ${L.border}` }}><span style={{ color:L.textSec }}>Adresse du bien</span><span style={{ fontWeight:600 }}>{modal.data.bien?.adresse}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:`1px solid ${L.border}` }}><span style={{ color:L.textSec }}>Période</span><span style={{ fontWeight:600 }}>{modal.data.moisLabel}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:`1px solid ${L.border}` }}><span style={{ color:L.textSec }}>Loyer</span><span style={{ fontWeight:600 }}>{modal.data.bien?.loyer}€</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:`1px solid ${L.border}` }}><span style={{ color:L.textSec }}>Charges</span><span style={{ fontWeight:600 }}>{modal.data.bien?.charges}€</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, padding:'10px 0', fontWeight:800 }}><span>Total</span><span style={{ color:L.green }}>{modal.data.montant}€</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0' }}><span style={{ color:L.textSec }}>Date de paiement</span><span style={{ fontWeight:600 }}>{modal.data.date}</span></div>
            </div>
            <div style={{ textAlign:'center', fontSize:12, color:L.textLight, marginBottom:16 }}>Document généré par Freample Immo</div>
            <button onClick={()=>window.print()} style={{ ...BTN, width:'100%' }} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Imprimer / PDF</button>
          </>}

          <button onClick={()=>{setModal(null);setForm({});}} style={{ display:'block', margin:'12px auto 0', background:'none', border:'none', color:L.textLight, cursor:'pointer', fontSize:13, fontFamily:L.font }}>Fermer</button>
        </div>
      </div>}
    </div>
  );
}
