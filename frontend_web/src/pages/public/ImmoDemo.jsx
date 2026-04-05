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
  depenses: [
    { id:1, bienId:1, cat:'Travaux', desc:'Remplacement chauffe-eau', montant:1200, date:'2026-02-15' },
    { id:2, bienId:3, cat:'Assurance', desc:'PNO annuelle', montant:280, date:'2026-01-10' },
    { id:3, bienId:4, cat:'Taxe foncière', desc:'Taxe foncière 2025', montant:1850, date:'2025-10-15' },
    { id:4, bienId:1, cat:'Copropriété', desc:'Appel de fonds T1', montant:450, date:'2026-01-01' },
    { id:5, bienId:2, cat:'Travaux', desc:'Peinture studio', montant:600, date:'2026-03-20' },
    { id:6, bienId:5, cat:'Diagnostic', desc:'DPE + Amiante', montant:350, date:'2025-11-05' },
  ],
  credits: [
    { id:1, bienId:1, banque:'Crédit Agricole', montant:140000, duree:240, taux:1.8, mensualite:692, debut:'2022-09-01', restant:118000 },
    { id:2, bienId:3, banque:'BNP Paribas', montant:250000, duree:300, taux:2.1, mensualite:1056, debut:'2024-03-01', restant:238000 },
    { id:3, bienId:4, banque:'Société Générale', montant:220000, duree:240, taux:1.5, mensualite:950, debut:'2021-01-01', restant:168000 },
  ],
  associes: [
    { id:1, sciId:1, nom:'Vassili B.', parts:60, role:'Gérant' },
    { id:2, sciId:1, nom:'Mathieu D.', parts:40, role:'Associé' },
    { id:3, sciId:2, nom:'Vassili B.', parts:300, role:'Gérant' },
    { id:4, sciId:2, nom:'Marius L.', parts:100, role:'Associé' },
    { id:5, sciId:2, nom:'Maxence R.', parts:100, role:'Associé' },
  ],
  nextId: 20,
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

  // Dépenses
  const depenses = activeSci ? (data.depenses||[]).filter(d=>biens.some(b=>b.id===d.bienId)) : (data.depenses||[]);
  const totalDepenses = depenses.reduce((s,d)=>s+d.montant,0);
  // Crédits
  const credits = activeSci ? (data.credits||[]).filter(c=>biens.some(b=>b.id===c.bienId)) : (data.credits||[]);
  const totalMensualites = credits.reduce((s,c)=>s+c.mensualite,0);
  const totalRestant = credits.reduce((s,c)=>s+c.restant,0);
  // Associés
  const associes = activeSci ? (data.associes||[]).filter(a=>a.sciId===activeSci) : (data.associes||[]);

  const TABS = [
    { id:'dashboard', label:'Tableau de bord', icon:'📊' },
    { id:'biens', label:'Biens', icon:'🏠' },
    { id:'locataires', label:'Locataires', icon:'👥' },
    { id:'paiements', label:'Loyers & Paiements', icon:'💰' },
    { id:'depenses', label:'Dépenses & Travaux', icon:'🔧' },
    { id:'credits', label:'Crédits immobiliers', icon:'🏦' },
    { id:'quittances', label:'Quittances', icon:'📄' },
    { id:'finances', label:'Finances', icon:'📈' },
    { id:'associes', label:'Associés', icon:'🤝' },
    { id:'outils', label:'Outils de calcul', icon:'🧮' },
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
                { l:'Crédits/mois', v:`${totalMensualites.toLocaleString()}€`, c:L.orange },
                { l:'Cashflow réel', v:`${(cashflow-totalMensualites).toLocaleString()}€`, c:(cashflow-totalMensualites)>0?L.green:L.red },
                { l:'Biens', v:biens.length, c:L.blue },
                { l:'Occupation', v:`${occupation}%`, c:occupation>80?L.green:L.orange },
                { l:'Rendement brut', v:`${rendementBrut}%`, c:L.gold },
                { l:'Rendement net', v:`${rendementNet}%`, c:L.gold },
                { l:'Patrimoine', v:`${(totalValeur/1000).toFixed(0)}k€`, c:L.blue },
                { l:'Encours crédit', v:`${(totalRestant/1000).toFixed(0)}k€`, c:L.orange },
                { l:'Equity', v:`${((totalValeur-totalRestant)/1000).toFixed(0)}k€`, c:L.green },
                { l:'Dépenses YTD', v:`${totalDepenses.toLocaleString()}€`, c:L.red },
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
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {biens.map(b=>{
                const loc = getLocataire(b.locataireId);
                const credit = (data.credits||[]).find(c=>c.bienId===b.id);
                const mensCredit = credit?.mensualite || 0;
                const capitalRestant = credit?.restant || 0;
                const capitalRembourse = credit ? credit.montant - credit.restant : 0;
                const progressCredit = credit ? ((capitalRembourse/credit.montant)*100).toFixed(0) : 0;
                const rdtBrut = b.valeur>0 ? ((b.loyer*12)/b.valeur*100).toFixed(2) : '0';
                const rdtNet = b.valeur>0 ? (((b.loyer-b.charges)*12)/b.valeur*100).toFixed(2) : '0';
                const cashflowBien = b.loyer - b.charges - mensCredit;
                const paidThisMonth = data.paiements.find(p=>p.bienId===b.id&&p.mois===currentMonth&&p.statut==='paye');
                const Row = ({l,v,c,bold}) => <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'3px 0' }}><span style={{ color:L.textSec }}>{l}</span><span style={{ fontWeight:bold?700:600, color:c||L.text }}>{v}</span></div>;

                return <div key={b.id} style={{ ...CARD, transition:'all .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=L.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>

                  {/* Header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <div style={{ display:'flex', gap:6, marginBottom:6 }}>
                        <span style={{ fontSize:11, fontWeight:600, color:L.goldDark, background:L.goldLight, padding:'2px 8px' }}>{b.type}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:loc?L.green:L.red, background:loc?L.greenBg:L.redBg, padding:'2px 8px' }}>{loc?'Loué':'Vacant'}</span>
                        {paidThisMonth && <span style={{ fontSize:10, fontWeight:700, color:L.green, background:L.greenBg, padding:'2px 8px' }}>✓ Loyer encaissé</span>}
                      </div>
                      <div style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>{b.adresse}</div>
                      <div style={{ fontSize:12, color:L.textSec }}>{b.surface}m² {loc ? `· ${loc.nom}` : ''}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:22, fontWeight:200, color:cashflowBien>=0?L.green:L.red, fontFamily:L.serif }}>{cashflowBien>=0?'+':''}{cashflowBien}€</div>
                      <div style={{ fontSize:10, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.05em' }}>{cashflowBien>=0?'Cashflow':'Cash low'} /mois</div>
                    </div>
                  </div>

                  {/* 3 colonnes : Achat | Crédit | Revenus */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, padding:'12px 0', borderTop:`1px solid ${L.border}`, borderBottom:`1px solid ${L.border}` }}>
                    {/* Achat */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:L.gold, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Acquisition</div>
                      <Row l="Valeur" v={`${b.valeur.toLocaleString()}€`} bold />
                      <Row l="Prix/m²" v={b.surface>0?`${Math.round(b.valeur/b.surface)}€`:'—'} />
                    </div>
                    {/* Crédit */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:L.orange, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Crédit</div>
                      {credit ? <>
                        <Row l="Mensualité" v={`${mensCredit}€`} c={L.orange} bold />
                        <Row l="Restant" v={`${(capitalRestant/1000).toFixed(0)}k€`} />
                        <Row l="Remboursé" v={`${progressCredit}%`} c={L.green} />
                        <div style={{ height:4, background:L.cream, borderRadius:2, marginTop:4 }}>
                          <div style={{ height:4, background:L.green, borderRadius:2, width:`${progressCredit}%` }} />
                        </div>
                        <div style={{ fontSize:10, color:L.textLight, marginTop:3 }}>{credit.banque} · {credit.taux}% · {credit.duree/12}ans</div>
                      </> : <div style={{ fontSize:11, color:L.textLight }}>Pas de crédit</div>}
                    </div>
                    {/* Revenus */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:L.green, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Revenus</div>
                      <Row l="Loyer" v={b.loyer?`${b.loyer}€`:'—'} c={b.loyer?L.green:L.textLight} bold />
                      <Row l="Charges" v={`-${b.charges}€`} c={L.red} />
                      {credit && <Row l="Crédit" v={`-${mensCredit}€`} c={L.orange} />}
                      <div style={{ height:1, background:L.border, margin:'4px 0' }} />
                      <Row l="Net" v={`${cashflowBien>=0?'+':''}${cashflowBien}€`} c={cashflowBien>=0?L.green:L.red} bold />
                    </div>
                  </div>

                  {/* Rendements */}
                  <div style={{ display:'flex', gap:16, padding:'8px 0', fontSize:11 }}>
                    <span style={{ color:L.textSec }}>Rdt brut <strong style={{ color:L.gold }}>{rdtBrut}%</strong></span>
                    <span style={{ color:L.textSec }}>Rdt net <strong style={{ color:L.green }}>{rdtNet}%</strong></span>
                    <span style={{ color:L.textSec }}>Revenu annuel <strong style={{ color:cashflowBien>=0?L.green:L.red }}>{(cashflowBien*12).toLocaleString()}€</strong></span>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', paddingTop:8, borderTop:`1px solid ${L.border}` }}>
                    {loc && !paidThisMonth && <button onClick={()=>enregistrerPaiement(b.id)} style={{ ...BTN, fontSize:10, padding:'5px 10px', background:L.green }}>Encaisser {b.loyer}€</button>}
                    <button onClick={()=>navigate(`/btp?q=${encodeURIComponent(b.adresse)}`)} style={{ ...BTN, fontSize:10, padding:'5px 10px', background:L.blue }}>🔧 Artisan</button>
                    {!loc && <button onClick={()=>navigate(`/com`)} style={{ ...BTN, fontSize:10, padding:'5px 10px', background:'#8B5CF6' }}>🎬 Annonce</button>}
                    <button onClick={()=>setModal({type:'edl',data:b})} style={{ ...BTN_OUTLINE, fontSize:10, padding:'5px 10px' }}>📋 EDL</button>
                    <button onClick={()=>deleteBien(b.id)} style={{ ...BTN_OUTLINE, fontSize:10, padding:'5px 10px', color:L.red, borderColor:L.red+'40' }}>✕</button>
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

          {/* ═══ DÉPENSES & TRAVAUX ═══ */}
          {tab==='depenses' && <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>Dépenses & Travaux ({depenses.length})</h2>
              <button onClick={()=>{setForm({cat:'Travaux'});setModal({type:'addDepense'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Ajouter</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:10, marginBottom:16 }}>
              {['Travaux','Assurance','Taxe foncière','Copropriété','Diagnostic','Autre'].map(cat=>{
                const tot = depenses.filter(d=>d.cat===cat).reduce((s,d)=>s+d.montant,0);
                return <div key={cat} style={{ ...CARD, textAlign:'center' }}>
                  <div style={{ fontSize:10, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>{cat}</div>
                  <div style={{ fontSize:18, fontWeight:200, color:tot>0?L.text:L.textLight, fontFamily:L.serif }}>{tot.toLocaleString()}€</div>
                </div>;
              })}
            </div>
            <div style={{ ...CARD, padding:0 }}>
              {depenses.sort((a,b)=>b.date.localeCompare(a.date)).map((d,i)=>{
                const bien = data.biens.find(b=>b.id===d.bienId);
                return <div key={d.id} style={{ padding:'12px 18px', borderBottom:i<depenses.length-1?`1px solid ${L.border}`:'none', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{d.desc}</div>
                    <div style={{ fontSize:11, color:L.textSec }}>{d.cat} · {bien?.adresse?.slice(0,30)} · {new Date(d.date).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:L.red }}>{d.montant.toLocaleString()}€</span>
                    <button onClick={()=>setData(p=>({...p,depenses:p.depenses.filter(x=>x.id!==d.id)}))} style={{ ...BTN_OUTLINE, fontSize:10, padding:'3px 8px', color:L.red, borderColor:L.red+'40' }}>✕</button>
                  </div>
                </div>;
              })}
              {depenses.length===0 && <div style={{ padding:32, textAlign:'center', color:L.textLight }}>Aucune dépense enregistrée</div>}
            </div>
          </>}

          {/* ═══ CRÉDITS IMMOBILIERS ═══ */}
          {tab==='credits' && <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>Crédits immobiliers</h2>
              <button onClick={()=>{setForm({});setModal({type:'addCredit'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Ajouter</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:10, marginBottom:16 }}>
              {[
                { l:'Mensualités totales', v:`${totalMensualites.toLocaleString()}€/mois`, c:L.orange },
                { l:'Capital restant dû', v:`${(totalRestant/1000).toFixed(0)}k€`, c:L.red },
                { l:'Capital remboursé', v:`${((credits.reduce((s,c)=>s+c.montant,0)-totalRestant)/1000).toFixed(0)}k€`, c:L.green },
                { l:'Taux moyen', v:credits.length? `${(credits.reduce((s,c)=>s+c.taux,0)/credits.length).toFixed(2)}%` :'—', c:L.blue },
              ].map(k=>(
                <div key={k.l} style={{ ...CARD, position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:k.c }} />
                  <div style={{ fontSize:10, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>{k.l}</div>
                  <div style={{ fontSize:18, fontWeight:200, fontFamily:L.serif }}>{k.v}</div>
                </div>
              ))}
            </div>
            {credits.map(c=>{
              const bien = data.biens.find(b=>b.id===c.bienId);
              const progress = ((c.montant-c.restant)/c.montant*100).toFixed(0);
              return <div key={c.id} style={{ ...CARD, marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{bien?.adresse||'Bien inconnu'}</div>
                    <div style={{ fontSize:12, color:L.textSec }}>{c.banque} · Taux {c.taux}% · {c.duree/12} ans</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:16, fontWeight:700, color:L.orange }}>{c.mensualite}€/mois</div>
                    <div style={{ fontSize:11, color:L.textLight }}>Restant: {c.restant.toLocaleString()}€</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:L.textSec, marginBottom:6 }}>
                  <span>Remboursé: {progress}%</span><span>{c.montant.toLocaleString()}€ empruntés</span>
                </div>
                <div style={{ height:6, background:L.cream, borderRadius:3 }}>
                  <div style={{ height:6, background:L.green, borderRadius:3, width:`${progress}%`, transition:'width .4s' }} />
                </div>
              </div>;
            })}
            {credits.length===0 && <div style={{ ...CARD, textAlign:'center', color:L.textLight }}>Aucun crédit enregistré</div>}
          </>}

          {/* ═══ ASSOCIÉS ═══ */}
          {tab==='associes' && <>
            <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 16px' }}>Associés{sci?` — ${sci.nom}`:''}</h2>
            {!activeSci ? (
              data.scis.map(s=>{
                const ass = (data.associes||[]).filter(a=>a.sciId===s.id);
                const totalParts = ass.reduce((sum,a)=>sum+a.parts,0);
                return <div key={s.id} style={{ ...CARD, marginBottom:12 }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>🏛️ {s.nom} ({s.type}) — {totalParts} parts</div>
                  {ass.map(a=>(
                    <div key={a.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${L.border}`, fontSize:13 }}>
                      <div><span style={{ fontWeight:600 }}>{a.nom}</span> <span style={{ color:L.textLight }}>({a.role})</span></div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontWeight:700, color:L.gold }}>{a.parts} parts</span>
                        <span style={{ fontSize:11, color:L.textSec }}>({(a.parts/totalParts*100).toFixed(0)}%)</span>
                        <div style={{ width:60, height:4, background:L.cream, borderRadius:2 }}><div style={{ height:4, background:L.gold, borderRadius:2, width:`${a.parts/totalParts*100}%` }} /></div>
                      </div>
                    </div>
                  ))}
                </div>;
              })
            ) : (
              <div style={CARD}>
                {associes.map(a=>{
                  const totalParts = associes.reduce((s,x)=>s+x.parts,0);
                  const revenuPart = totalLoyers > 0 ? (a.parts/totalParts*totalLoyers).toFixed(0) : 0;
                  return <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:`1px solid ${L.border}` }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700 }}>{a.nom}</div>
                      <div style={{ fontSize:12, color:L.textSec }}>{a.role} · {a.parts} parts ({(a.parts/totalParts*100).toFixed(0)}%)</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:15, fontWeight:700, color:L.green }}>{revenuPart}€/mois</div>
                      <div style={{ fontSize:11, color:L.textLight }}>Quote-part loyers</div>
                    </div>
                  </div>;
                })}
              </div>
            )}
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
              {/* Simulation crédit */}
              <div style={CARD}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>🏦 Simulation de prêt</div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Montant emprunté (€)</label><input type="number" value={form.credMontant||''} onChange={e=>setForm(f=>({...f,credMontant:e.target.value}))} style={INP} placeholder="200000" /></div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Durée (années)</label><input type="number" value={form.credDuree||''} onChange={e=>setForm(f=>({...f,credDuree:e.target.value}))} style={INP} placeholder="20" /></div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Taux annuel (%)</label><input type="number" value={form.credTaux||''} onChange={e=>setForm(f=>({...f,credTaux:e.target.value}))} style={INP} placeholder="2.5" step="0.1" /></div>
                {form.credMontant && form.credDuree && form.credTaux && (()=>{
                  const M=Number(form.credMontant), n=Number(form.credDuree)*12, t=Number(form.credTaux)/100/12;
                  const mens = t>0 ? M*(t*Math.pow(1+t,n))/(Math.pow(1+t,n)-1) : M/n;
                  const totalPaye = mens*n;
                  const coutCredit = totalPaye-M;
                  return <div style={{ background:L.cream, padding:'14px', marginTop:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Mensualité</span><span style={{ fontWeight:700, color:L.gold }}>{mens.toFixed(2)}€</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Coût total du crédit</span><span style={{ fontWeight:700, color:L.red }}>{coutCredit.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,' ')}€</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span>Total remboursé</span><span style={{ fontWeight:700 }}>{totalPaye.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,' ')}€</span></div>
                  </div>;
                })()}
              </div>
              {/* Plus-value */}
              <div style={CARD}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>💎 Calcul de plus-value</div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Prix d'achat (€)</label><input type="number" value={form.pvAchat||''} onChange={e=>setForm(f=>({...f,pvAchat:e.target.value}))} style={INP} placeholder="180000" /></div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Frais d'acquisition (€)</label><input type="number" value={form.pvFrais||''} onChange={e=>setForm(f=>({...f,pvFrais:e.target.value}))} style={INP} placeholder="14000" /></div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Travaux réalisés (€)</label><input type="number" value={form.pvTravaux||''} onChange={e=>setForm(f=>({...f,pvTravaux:e.target.value}))} style={INP} placeholder="10000" /></div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Prix de vente estimé (€)</label><input type="number" value={form.pvVente||''} onChange={e=>setForm(f=>({...f,pvVente:e.target.value}))} style={INP} placeholder="250000" /></div>
                <div style={{ marginBottom:8 }}><label style={LBL}>Durée de détention (années)</label><input type="number" value={form.pvDuree||''} onChange={e=>setForm(f=>({...f,pvDuree:e.target.value}))} style={INP} placeholder="5" /></div>
                {form.pvAchat && form.pvVente && (()=>{
                  const achat=Number(form.pvAchat)+Number(form.pvFrais||0)+Number(form.pvTravaux||0);
                  const pv=Number(form.pvVente)-achat;
                  const duree=Number(form.pvDuree||1);
                  // Abattement IR: 6%/an après 5 ans, exonération après 22 ans
                  let abatIR = 0;
                  if(duree>=22) abatIR=100;
                  else if(duree>5) abatIR=(duree-5)*6;
                  // Abattement PS: 1.65%/an de 6 à 21, 1.60% la 22e, 9%/an de 23 à 30
                  let abatPS = 0;
                  if(duree>=30) abatPS=100;
                  else if(duree>22) abatPS=28+(duree-22)*9;
                  else if(duree>5) abatPS=(duree-5)*1.65;
                  const pvImposableIR = Math.max(0, pv*(1-abatIR/100));
                  const pvImposablePS = Math.max(0, pv*(1-abatPS/100));
                  const impotIR = pvImposableIR*0.19;
                  const impotPS = pvImposablePS*0.172;
                  return <div style={{ background:L.cream, padding:'14px', marginTop:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Plus-value brute</span><span style={{ fontWeight:700, color:pv>0?L.green:L.red }}>{pv.toLocaleString()}€</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Abattement IR ({abatIR.toFixed(0)}%)</span><span style={{ fontWeight:600, color:L.textSec }}>{pvImposableIR.toFixed(0)}€ imposable</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>IR (19%)</span><span style={{ fontWeight:700, color:L.red }}>{impotIR.toFixed(0)}€</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>PS (17.2%)</span><span style={{ fontWeight:700, color:L.red }}>{impotPS.toFixed(0)}€</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginTop:6, paddingTop:6, borderTop:`1px solid ${L.border}` }}><span style={{ fontWeight:700 }}>Net après impôts</span><span style={{ fontWeight:800, color:L.green }}>{(pv-impotIR-impotPS).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,' ')}€</span></div>
                  </div>;
                })()}
              </div>
              {/* Estimation fiscale */}
              <div style={{...CARD, gridColumn:'1/-1'}}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>🧾 Estimation fiscale — Revenus fonciers</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Micro-foncier (abattement 30%)</div>
                    <div style={{ fontSize:12, color:L.textSec, marginBottom:6 }}>Si revenus fonciers &lt; 15 000€/an</div>
                    <div style={{ background:L.cream, padding:'12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Revenus bruts annuels</span><span style={{ fontWeight:700 }}>{(totalLoyers*12).toLocaleString()}€</span></div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Abattement 30%</span><span style={{ fontWeight:600, color:L.green }}>-{(totalLoyers*12*0.3).toFixed(0)}€</span></div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span>Base imposable</span><span style={{ fontWeight:700, color:L.gold }}>{(totalLoyers*12*0.7).toFixed(0)}€</span></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Régime réel (charges déductibles)</div>
                    <div style={{ fontSize:12, color:L.textSec, marginBottom:6 }}>Déduction des charges réelles + intérêts</div>
                    <div style={{ background:L.cream, padding:'12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Revenus bruts</span><span style={{ fontWeight:700 }}>{(totalLoyers*12).toLocaleString()}€</span></div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Charges déductibles</span><span style={{ fontWeight:600, color:L.green }}>-{(totalCharges*12+totalDepenses).toLocaleString()}€</span></div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span>Intérêts d'emprunt</span><span style={{ fontWeight:600, color:L.green }}>-{(totalMensualites*12*0.35).toFixed(0)}€ (est.)</span></div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span>Base imposable</span><span style={{ fontWeight:700, color:L.gold }}>{Math.max(0,(totalLoyers*12-totalCharges*12-totalDepenses-totalMensualites*12*0.35)).toFixed(0)}€</span></div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop:12, padding:'10px 14px', background:L.blueBg, border:`1px solid ${L.blue}30`, fontSize:12, color:L.blue }}>
                  💡 Le régime réel est plus avantageux si vos charges réelles dépassent 30% de vos revenus fonciers.
                  Ici: micro = {(totalLoyers*12*0.7).toFixed(0)}€ vs réel = {Math.max(0,(totalLoyers*12-totalCharges*12-totalDepenses-totalMensualites*12*0.35)).toFixed(0)}€ → <strong>{(totalLoyers*12*0.7) > Math.max(0,(totalLoyers*12-totalCharges*12-totalDepenses-totalMensualites*12*0.35)) ? 'Régime réel recommandé' : 'Micro-foncier suffisant'}</strong>
                </div>
              </div>
            </div>
          </>}

          {/* ═══ ALERTES + MISE EN DEMEURE + PROJECTION ═══ */}
          {tab==='alertes' && <>
            <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 16px' }}>Alertes & Actions</h2>

            {/* Impayés avec mise en demeure */}
            {impayes.length>0 && <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:L.red, marginBottom:8 }}>⚠️ Loyers impayés</div>
              {impayes.map(b=>{
                const loc=getLocataire(b.locataireId);
                return <div key={b.id} style={{ background:L.redBg, border:`1px solid ${L.red}30`, padding:'14px 18px', marginBottom:6, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:L.red }}>{loc?.nom} — {b.loyer}€</div>
                    <div style={{ fontSize:11, color:L.textSec }}>{b.adresse}</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>enregistrerPaiement(b.id)} style={{ ...BTN, fontSize:10, padding:'5px 12px', background:L.green }}>Encaisser</button>
                    <button onClick={()=>setModal({type:'miseEnDemeure', data:{bien:b, loc}})} style={{ ...BTN, fontSize:10, padding:'5px 12px', background:L.red }}>Mise en demeure</button>
                  </div>
                </div>;
              })}
            </div>}

            {/* Autres alertes */}
            {[
              ...data.locataires.filter(l=>{ const d=new Date(l.fin); const now=new Date(); const diff=(d-now)/(1000*60*60*24); return diff>0 && diff<90; }).map(l=>({ type:'warning', msg:`Fin de bail dans moins de 3 mois — ${l.nom} — ${l.fin}` })),
              ...biens.filter(b=>!b.locataireId).map(b=>({ type:'info', msg:`Bien vacant — ${b.adresse} — perte estimée ${(b.loyer||0)*12}€/an`, bienId:b.id })),
              ...credits.filter(c=>{const b=data.biens.find(x=>x.id===c.bienId);return b&&b.loyer>0&&b.loyer<c.mensualite;}).map(c=>{const b=data.biens.find(x=>x.id===c.bienId);return{type:'warning',msg:`Cashflow négatif — ${b.adresse} — loyer ${b.loyer}€ < crédit ${c.mensualite}€`};}),
            ].map((a,i)=>(
              <div key={i} style={{ background:a.type==='warning'?L.orangeBg:L.blueBg, border:`1px solid ${a.type==='warning'?L.orange:L.blue}30`, padding:'14px 18px', marginBottom:6, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:a.type==='warning'?L.orange:L.blue }} />
                  <span style={{ fontSize:13, color:a.type==='warning'?L.orange:L.blue, fontWeight:500 }}>{a.msg}</span>
                </div>
                {a.bienId && <button onClick={()=>navigate(`/com`)} style={{ ...BTN, fontSize:10, padding:'5px 12px', background:'#8B5CF6' }}>🎬 Créer annonce</button>}
              </div>
            ))}

            {/* Projection cashflow 12 mois */}
            <div style={{ ...CARD, marginTop:24 }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>📈 Projection cashflow — 12 prochains mois</div>
              <div style={{ overflowX:'auto' }}>
                <div style={{ display:'flex', gap:0, minWidth:700 }}>
                  {Array.from({length:12}).map((_,i)=>{
                    const d=new Date(); d.setMonth(d.getMonth()+i);
                    const m=MOIS[d.getMonth()].slice(0,3);
                    const revenus=totalLoyers;
                    const sortie=totalCharges+totalMensualites+(i%3===0?Math.round(totalDepenses/4):0);
                    const net=revenus-sortie;
                    const maxH=Math.max(totalLoyers,totalCharges+totalMensualites+totalDepenses/4)*1.2||1;
                    return <div key={i} style={{ flex:1, textAlign:'center', borderRight:i<11?`1px solid ${L.border}`:'none', padding:'8px 4px' }}>
                      <div style={{ fontSize:9, color:L.textLight, marginBottom:6 }}>{m}</div>
                      <div style={{ height:80, display:'flex', alignItems:'flex-end', justifyContent:'center', gap:2 }}>
                        <div style={{ width:12, background:L.green, borderRadius:'2px 2px 0 0', height:Math.max(4,revenus/maxH*70), opacity:0.7 }} title={`Revenus: ${revenus}€`} />
                        <div style={{ width:12, background:L.red, borderRadius:'2px 2px 0 0', height:Math.max(4,sortie/maxH*70), opacity:0.7 }} title={`Sorties: ${sortie}€`} />
                      </div>
                      <div style={{ fontSize:10, fontWeight:700, color:net>0?L.green:L.red, marginTop:4 }}>{net>0?'+':''}{net}€</div>
                    </div>;
                  })}
                </div>
              </div>
              <div style={{ display:'flex', gap:16, justifyContent:'center', marginTop:12, fontSize:11 }}>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:10, height:10, background:L.green, opacity:0.7 }}/>Revenus</span>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:10, height:10, background:L.red, opacity:0.7 }}/>Sorties</span>
              </div>
            </div>
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

          {modal.type==='miseEnDemeure' && modal.data && <>
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:600, color:L.red, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:8 }}>Mise en demeure</div>
              <div style={{ fontSize:16, fontWeight:800 }}>Lettre de relance — Loyer impayé</div>
            </div>
            <div style={{ border:`1px solid ${L.border}`, padding:'20px', fontSize:13, lineHeight:1.8, marginBottom:16 }}>
              <p style={{ textAlign:'right', color:L.textSec }}>Fait à __________, le {new Date().toLocaleDateString('fr-FR')}</p>
              <p><strong>Objet : Mise en demeure de payer — Loyer du mois de {MOIS[new Date().getMonth()]} {new Date().getFullYear()}</strong></p>
              <p>Madame, Monsieur <strong>{modal.data.loc?.nom}</strong>,</p>
              <p>Je constate à ce jour que le loyer du mois de {MOIS[new Date().getMonth()]} {new Date().getFullYear()}, d'un montant de <strong>{modal.data.bien?.loyer}€</strong>, relatif au bien situé au <strong>{modal.data.bien?.adresse}</strong>, n'a toujours pas été réglé.</p>
              <p>Conformément aux dispositions de votre bail, je vous mets en demeure de procéder au règlement de cette somme dans un délai de <strong>8 jours</strong> à compter de la réception de la présente.</p>
              <p>À défaut de régularisation dans ce délai, je me verrai contraint(e) d'engager les procédures légales prévues par la loi, pouvant aller jusqu'à la résiliation du bail et l'expulsion.</p>
              <p>Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>
              <p style={{ marginTop:20 }}>Le bailleur,<br/><em>(Signature)</em></p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>window.print()} style={{ ...BTN, flex:1 }} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Imprimer / PDF</button>
              <button onClick={()=>{enregistrerPaiement(modal.data.bien?.id);setModal(null);}} style={{ ...BTN, flex:1, background:L.green }}>Marquer comme payé</button>
            </div>
          </>}

          {modal.type==='edl' && modal.data && <>
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:8 }}>État des lieux</div>
              <div style={{ fontSize:16, fontWeight:800 }}>{modal.data.adresse}</div>
            </div>
            <div style={{ marginBottom:10 }}><label style={LBL}>Type</label><select value={form.edlType||'entree'} onChange={e=>setForm(f=>({...f,edlType:e.target.value}))} style={INP}><option value="entree">Entrée</option><option value="sortie">Sortie</option></select></div>
            <div style={{ marginBottom:10 }}><label style={LBL}>Date</label><input type="date" value={form.edlDate||new Date().toISOString().slice(0,10)} onChange={e=>setForm(f=>({...f,edlDate:e.target.value}))} style={INP} /></div>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Pièces</div>
            {['Entrée/couloir','Séjour','Cuisine','Chambre 1','Chambre 2','Salle de bain','WC','Extérieur/balcon'].map(piece=>(
              <div key={piece} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:`1px solid ${L.border}` }}>
                <span style={{ flex:1, fontSize:13 }}>{piece}</span>
                {['Bon','Usure','Dégradé'].map(etat=>(
                  <button key={etat} onClick={()=>setForm(f=>({...f,[`edl_${piece}`]:etat}))}
                    style={{ padding:'4px 12px', fontSize:11, fontWeight:600, border:`1px solid ${form[`edl_${piece}`]===etat?(etat==='Bon'?L.green:etat==='Usure'?L.orange:L.red):L.border}`, background:form[`edl_${piece}`]===etat?(etat==='Bon'?L.greenBg:etat==='Usure'?L.orangeBg:L.redBg):'transparent', color:form[`edl_${piece}`]===etat?(etat==='Bon'?L.green:etat==='Usure'?L.orange:L.red):L.textLight, cursor:'pointer', fontFamily:L.font, transition:'all .1s' }}>
                    {etat}
                  </button>
                ))}
              </div>
            ))}
            <div style={{ marginTop:12, marginBottom:10 }}><label style={LBL}>Observations</label><textarea value={form.edlObs||''} onChange={e=>setForm(f=>({...f,edlObs:e.target.value}))} rows={3} style={{...INP, resize:'vertical'}} placeholder="Remarques générales..." /></div>
            <div style={{ marginTop:12, marginBottom:10 }}><label style={LBL}>Relevés compteurs</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                <div><label style={{...LBL,fontSize:9}}>Eau</label><input value={form.edlEau||''} onChange={e=>setForm(f=>({...f,edlEau:e.target.value}))} style={INP} placeholder="m³" /></div>
                <div><label style={{...LBL,fontSize:9}}>Électricité</label><input value={form.edlElec||''} onChange={e=>setForm(f=>({...f,edlElec:e.target.value}))} style={INP} placeholder="kWh" /></div>
                <div><label style={{...LBL,fontSize:9}}>Gaz</label><input value={form.edlGaz||''} onChange={e=>setForm(f=>({...f,edlGaz:e.target.value}))} style={INP} placeholder="m³" /></div>
              </div>
            </div>
            <button onClick={()=>{showToast('État des lieux enregistré');setModal(null);setForm({});}} style={{ ...BTN, width:'100%', marginTop:8 }} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Enregistrer l'EDL</button>
          </>}

          {modal.type==='addDepense' && <>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 16px' }}>Ajouter une dépense</h3>
            <div style={{ marginBottom:10 }}><label style={LBL}>Catégorie</label><select value={form.cat||'Travaux'} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} style={INP}>{['Travaux','Assurance','Taxe foncière','Copropriété','Diagnostic','Autre'].map(c=><option key={c}>{c}</option>)}</select></div>
            <div style={{ marginBottom:10 }}><label style={LBL}>Description</label><input value={form.desc||''} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} style={INP} placeholder="Ex: Remplacement chaudière" /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
              <div><label style={LBL}>Montant (€)</label><input type="number" value={form.montant||''} onChange={e=>setForm(f=>({...f,montant:e.target.value}))} style={INP} /></div>
              <div><label style={LBL}>Date</label><input type="date" value={form.date||new Date().toISOString().slice(0,10)} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={INP} /></div>
            </div>
            <div style={{ marginBottom:14 }}><label style={LBL}>Bien concerné</label><select value={form.bienId||''} onChange={e=>setForm(f=>({...f,bienId:e.target.value}))} style={INP}><option value="">Sélectionner</option>{biens.map(b=><option key={b.id} value={b.id}>{b.adresse}</option>)}</select></div>
            <button onClick={()=>{
              if(!form.bienId||!form.montant) return;
              setData(d=>({...d, depenses:[...d.depenses, {id:genId(), bienId:Number(form.bienId), cat:form.cat||'Travaux', desc:form.desc||'', montant:Number(form.montant), date:form.date||new Date().toISOString().slice(0,10)}]}));
              setModal(null); setForm({}); showToast('Dépense ajoutée');
            }} style={{ ...BTN, width:'100%' }} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Ajouter</button>
          </>}

          {modal.type==='addCredit' && <>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 16px' }}>Ajouter un crédit</h3>
            <div style={{ marginBottom:10 }}><label style={LBL}>Bien</label><select value={form.bienId||''} onChange={e=>setForm(f=>({...f,bienId:e.target.value}))} style={INP}><option value="">Sélectionner</option>{biens.map(b=><option key={b.id} value={b.id}>{b.adresse}</option>)}</select></div>
            <div style={{ marginBottom:10 }}><label style={LBL}>Banque</label><input value={form.banque||''} onChange={e=>setForm(f=>({...f,banque:e.target.value}))} style={INP} placeholder="Ex: Crédit Agricole" /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
              <div><label style={LBL}>Montant emprunté (€)</label><input type="number" value={form.montant||''} onChange={e=>setForm(f=>({...f,montant:e.target.value}))} style={INP} /></div>
              <div><label style={LBL}>Capital restant (€)</label><input type="number" value={form.restant||''} onChange={e=>setForm(f=>({...f,restant:e.target.value}))} style={INP} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
              <div><label style={LBL}>Durée (mois)</label><input type="number" value={form.duree||''} onChange={e=>setForm(f=>({...f,duree:e.target.value}))} style={INP} placeholder="240" /></div>
              <div><label style={LBL}>Taux (%)</label><input type="number" value={form.taux||''} onChange={e=>setForm(f=>({...f,taux:e.target.value}))} style={INP} placeholder="2.1" step="0.1" /></div>
              <div><label style={LBL}>Mensualité (€)</label><input type="number" value={form.mensualite||''} onChange={e=>setForm(f=>({...f,mensualite:e.target.value}))} style={INP} /></div>
            </div>
            <div style={{ marginBottom:14 }}><label style={LBL}>Date début</label><input type="date" value={form.debut||''} onChange={e=>setForm(f=>({...f,debut:e.target.value}))} style={INP} /></div>
            <button onClick={()=>{
              if(!form.bienId||!form.montant) return;
              setData(d=>({...d, credits:[...d.credits, {id:genId(), bienId:Number(form.bienId), banque:form.banque||'', montant:Number(form.montant), duree:Number(form.duree||240), taux:Number(form.taux||2), mensualite:Number(form.mensualite||0), debut:form.debut||'', restant:Number(form.restant||form.montant)}]}));
              setModal(null); setForm({}); showToast('Crédit ajouté');
            }} style={{ ...BTN, width:'100%' }} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Ajouter</button>
          </>}

          <button onClick={()=>{setModal(null);setForm({});}} style={{ display:'block', margin:'12px auto 0', background:'none', border:'none', color:L.textLight, cursor:'pointer', fontSize:13, fontFamily:L.font }}>Fermer</button>
        </div>
      </div>}
    </div>
  );
}
