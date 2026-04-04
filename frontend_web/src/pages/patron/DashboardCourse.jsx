import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const K = '#000000';
const K_BG = '#F7F7F7';
const K_SOFT = '#F3F3F3';
const ACCENT = '#276EF1';

const CARD_STYLE = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E5E5E5', boxShadow:'0 1px 4px rgba(0,0,0,.04)' };
const SECTION_HDR = { fontSize:13, fontWeight:700, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN_PRIMARY = { background:K, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const BTN_GHOST = { background:'transparent', color:'#5E5E5E', border:'1px solid #E5E5E5', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const MODAL_OVERLAY = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const MODAL_BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:480, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

const TABS = [
  { id:'accueil',    icon:'🏠', label:'Accueil' },
  { id:'courses',    icon:'🚗', label:'Courses' },
  { id:'historique', icon:'📋', label:'Historique' },
  { id:'paiements',  icon:'💳', label:'Paiements' },
  { id:'vehicule',   icon:'🚙', label:'Véhicule' },
  { id:'clients',    icon:'👥', label:'Clients' },
  { id:'parametres', icon:'⚙️', label:'Paramètres' },
  { id:'rapports',   icon:'📊', label:'Rapports' },
];

const COURSE_STATUS = {
  en_attente: { label:'En attente', bg:'#FEF3C7', border:'#FDE047', color:'#713F12' },
  acceptee:   { label:'Acceptée',   bg:'#DBEAFE', border:'#93C5FD', color:'#1D4ED8' },
  en_cours:   { label:'En cours',   bg:'#F5F3FF', border:'#C4B5FD', color:'#5B21B6' },
  terminee:   { label:'Terminée',   bg:'#D1FAE5', border:'#86EFAC', color:'#065F46' },
  annulee:    { label:'Annulée',    bg:'#FEE2E2', border:'#FCA5A5', color:'#DC2626' },
};

const COURSES_INIT = [
  { id:1, client:{nom:'Sophie Martin',tel:'06 12 34 56 78'}, depart:'Paris Gare du Nord', destination:'Aéroport CDG', distance:'32 km', duree:'45 min', prix:38, statut:'en_cours', code:'FRC-4812', heure:'12:30' },
  { id:2, client:{nom:'Lucas Bernard',tel:'06 23 45 67 89'}, depart:'Paris Opéra', destination:'La Défense', distance:'12 km', duree:'25 min', prix:18, statut:'en_attente', code:'FRC-4813', heure:'13:15' },
  { id:3, client:{nom:'Claire Dupont',tel:'06 34 56 78 90'}, depart:'Gare de Lyon', destination:'Orly', distance:'22 km', duree:'35 min', prix:28, statut:'en_attente', code:'FRC-4814', heure:'13:30' },
  { id:4, client:{nom:'Pierre Garnier',tel:'06 45 67 89 01'}, depart:'Châtelet', destination:'Vincennes', distance:'8 km', duree:'20 min', prix:14, statut:'terminee', code:'FRC-4810', heure:'11:00' },
  { id:5, client:{nom:'Marie Lambert',tel:'06 56 78 90 12'}, depart:'Bastille', destination:'Montmartre', distance:'6 km', duree:'18 min', prix:12, statut:'terminee', code:'FRC-4808', heure:'10:15' },
  { id:6, client:{nom:'Amélie Rousseau',tel:'06 67 89 01 23'}, depart:'Nation', destination:'République', distance:'4 km', duree:'12 min', prix:9, statut:'terminee', code:'FRC-4805', heure:'09:30' },
];

const CLIENTS_INIT = [
  { id:1, nom:'Sophie Martin',  tel:'06 12 34 56 78', courses:12, depense:380, note:4.9, fidelite:'vip' },
  { id:2, nom:'Lucas Bernard',  tel:'06 23 45 67 89', courses:5,  depense:120, note:4.7, fidelite:'fidele' },
  { id:3, nom:'Claire Dupont',  tel:'06 34 56 78 90', courses:3,  depense:68,  note:4.8, fidelite:'regulier' },
  { id:4, nom:'Pierre Garnier', tel:'06 45 67 89 01', courses:22, depense:640, note:5.0, fidelite:'vip' },
  { id:5, nom:'Nina Fontaine',  tel:'07 78 90 12 34', courses:1,  depense:18,  note:0,   fidelite:'nouveau' },
];

const VEHICULE = { marque:'Tesla', modele:'Model 3', annee:2024, immat:'AB-123-CD', couleur:'Noir', places:4, assurance:'2026-12-31', controle:'2026-06-15', km:42000 };

const TRANSACTIONS_INIT = [
  { id:'T001', date:'2026-04-04', client:'Sophie Martin', montant:38, statut:'bloque', type:'paiement' },
  { id:'T002', date:'2026-04-04', client:'Pierre Garnier', montant:14, statut:'libere', type:'paiement' },
  { id:'T003', date:'2026-04-04', client:'Marie Lambert', montant:12, statut:'libere', type:'paiement' },
  { id:'T004', date:'2026-04-03', client:'Amélie Rousseau', montant:9, statut:'libere', type:'paiement' },
  { id:'T005', date:'2026-04-02', client:'Jean Moreau', montant:45, statut:'libere', type:'paiement' },
  { id:'VIRT1', date:'2026-03-31', client:'', montant:680, statut:'vire', type:'virement' },
];

const REVENUS_7J = [
  { jour:'Lun', montant:85 },{ jour:'Mar', montant:120 },{ jour:'Mer', montant:95 },
  { jour:'Jeu', montant:140 },{ jour:'Ven', montant:180 },{ jour:'Sam', montant:210 },
  { jour:'Dim', montant:65 },
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
  const s = COURSE_STATUS[statut] || COURSE_STATUS.en_attente;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{s.label}</span>;
}

function FideliteBadge({ f }) {
  const map = { vip:{bg:'#FEF3C7',color:'#92400E',l:'VIP'}, fidele:{bg:'#D1FAE5',color:'#065F46',l:'Fidèle'}, regulier:{bg:'#DBEAFE',color:'#1D4ED8',l:'Régulier'}, nouveau:{bg:'#F3F3F3',color:'#8B8B8B',l:'Nouveau'} };
  const s = map[f]||map.nouveau;
  return <span style={{ background:s.bg, color:s.color, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>{s.l}</span>;
}

const COURSE_TAB_MAP = { courses:'courses', historique:'historique', paiements:'paiements', vehicule:'vehicule', clients:'clients', parametres:'parametres', rapports:'rapports' };

export default function DashboardCourse() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(COURSE_TAB_MAP[searchParams.get('onglet')] || 'accueil');
  const [courses, setCourses] = useState(COURSES_INIT);
  const [transactions, setTransactions] = useState(TRANSACTIONS_INIT);
  const [enLigne, setEnLigne] = useState(true);

  useEffect(() => {
    const o = searchParams.get('onglet');
    if (o && COURSE_TAB_MAP[o]) setTab(COURSE_TAB_MAP[o]);
    else if (!o) setTab('accueil');
  }, [searchParams]);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const [modalCourse, setModalCourse] = useState(null);
  const [modalVirement, setModalVirement] = useState(false);
  const [virementDone, setVirementDone] = useState(false);
  const [virementAmount, setVirementAmount] = useState('');
  const [courseFilter, setCourseFilter] = useState('toutes');
  const [payFilter, setPayFilter] = useState('tous');
  const [clientSearch, setClientSearch] = useState('');

  const coursesActives = courses.filter(c => ['en_attente','acceptee','en_cours'].includes(c.statut)).length;
  const coursesTerminees = courses.filter(c => c.statut === 'terminee').length;
  const revenuJour = transactions.filter(t => t.date === '2026-04-04' && t.type === 'paiement').reduce((s,t) => s+t.montant, 0);
  const totalBloque = transactions.filter(t => t.statut === 'bloque').reduce((s,t) => s+t.montant, 0);
  const maxRevenu = Math.max(...REVENUS_7J.map(r => r.montant));

  const filteredCourses = courseFilter === 'toutes' ? courses : courses.filter(c => c.statut === courseFilter);
  const filteredTx = payFilter === 'tous' ? transactions : payFilter === 'bloques' ? transactions.filter(t => t.statut === 'bloque') : payFilter === 'liberes' ? transactions.filter(t => t.statut === 'libere') : transactions.filter(t => t.type === 'virement');
  const filteredClients = CLIENTS_INIT.filter(c => c.nom.toLowerCase().includes(clientSearch.toLowerCase()));

  const accepterCourse = (id) => { setCourses(prev => prev.map(c => c.id===id ? {...c, statut:'acceptee'} : c)); showToast('Course acceptée'); setModalCourse(null); };
  const terminerCourse = (id) => {
    setCourses(prev => prev.map(c => c.id===id ? {...c, statut:'terminee'} : c));
    const course = courses.find(c => c.id === id);
    setTransactions(prev => prev.map(t => t.client === course?.client?.nom && t.statut === 'bloque' ? {...t, statut:'libere'} : t));
    showToast('Course terminée — paiement libéré');
    setModalCourse(null);
  };

  const submitVirement = () => {
    if (!virementAmount || isNaN(virementAmount)) return;
    setTransactions(prev => [{ id:'VIRT'+Date.now(), date:'2026-04-04', client:'', montant:Number(virementAmount), statut:'vire', type:'virement' }, ...prev]);
    setVirementDone(true);
    setTimeout(() => { setModalVirement(false); setVirementDone(false); setVirementAmount(''); }, 2500);
    showToast(`Virement de ${virementAmount}€ initié`);
  };

  return (
    <div style={{ padding:'24px 28px', background:K_BG, minHeight:'100vh', fontFamily:'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:'#1C1C1E' }}>🚗 Freample Course</div>
          <div style={{ fontSize:14, color:'#8B8B8B', marginTop:2 }}>Courses · Revenus · Véhicule</div>
        </div>
        <button onClick={() => setEnLigne(!enLigne)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:999, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, fontFamily:'inherit', background: enLigne ? '#D1FAE5' : '#FEE2E2', color: enLigne ? '#065F46' : '#DC2626', transition:'all .2s' }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background: enLigne ? '#16A34A' : '#DC2626' }} />
          {enLigne ? 'En ligne' : 'Hors ligne'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'#fff', borderRadius:14, padding:6, border:'1px solid #E5E5E5', marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontWeight: tab===t.id ? 700 : 500, background: tab===t.id ? K : 'transparent', color: tab===t.id ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.875rem', transition:'all .15s' }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* TAB: Accueil */}
      {tab === 'accueil' && (<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Courses actives" value={coursesActives} sub="En ce moment" accent={K} />
          <KpiCard label="Terminées aujourd'hui" value={coursesTerminees} accent="#7C3AED" />
          <KpiCard label="Revenu du jour" value={`${revenuJour}€`} accent="#059669" />
          <KpiCard label="Note moyenne" value="4.9/5" sub="★★★★★" accent="#F59E0B" />
        </div>
        <div style={CARD_STYLE}>
          <div style={SECTION_HDR}>Courses en cours</div>
          {courses.filter(c => !['terminee','annulee'].includes(c.statut)).length === 0 && <div style={{ color:'#8B8B8B', fontSize:14, padding:20, textAlign:'center' }}>Aucune course active — en attente de demandes</div>}
          {courses.filter(c => !['terminee','annulee'].includes(c.statut)).map(c => (
            <div key={c.id} onClick={() => setModalCourse(c)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#FAFAFA', borderRadius:10, marginBottom:8, cursor:'pointer', border:'1px solid #F0F0F0' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:COURSE_STATUS[c.statut].bg, border:`2px solid ${COURSE_STATUS[c.statut].border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🚗</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{c.client.nom}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{c.depart} → {c.destination} · {c.duree}</div>
              </div>
              <StatusBadge statut={c.statut} />
              <div style={{ fontWeight:800, color:K, fontSize:15 }}>{c.prix}€</div>
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Courses */}
      {tab === 'courses' && (<div>
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {[['toutes','Toutes'],['en_attente','En attente'],['acceptee','Acceptées'],['en_cours','En cours'],['terminee','Terminées']].map(([v,l]) => (
            <button key={v} onClick={() => setCourseFilter(v)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight: courseFilter===v ? 700 : 500, background: courseFilter===v ? K : '#F3F3F3', color: courseFilter===v ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.825rem' }}>{l}</button>
          ))}
        </div>
        {filteredCourses.map(c => (
          <div key={c.id} onClick={() => setModalCourse(c)} style={{ ...CARD_STYLE, marginBottom:10, cursor:'pointer', padding:'16px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{c.client.nom}</div>
                  <StatusBadge statut={c.statut} />
                </div>
                <div style={{ fontSize:13, color:'#8B8B8B', marginBottom:2 }}>📍 {c.depart} → {c.destination}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{c.distance} · {c.duree} · {c.heure} · {c.code}</div>
              </div>
              <div style={{ fontWeight:800, fontSize:18, color:K, flexShrink:0 }}>{c.prix}€</div>
            </div>
          </div>
        ))}
      </div>)}

      {/* TAB: Historique */}
      {tab === 'historique' && (<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Courses terminées</div>
        <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
          {courses.filter(c => c.statut === 'terminee').map((c,i,arr) => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < arr.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{c.depart} → {c.destination}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{c.client.nom} · {c.heure} · {c.distance}</div>
              </div>
              <div style={{ fontWeight:800, color:'#059669' }}>{c.prix}€</div>
              <span style={{ fontSize:12, fontWeight:600, color:'#065F46', background:'#D1FAE5', padding:'2px 8px', borderRadius:10 }}>✓</span>
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Paiements */}
      {tab === 'paiements' && (<div>
        <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
          <KpiCard label="Bloqués" value={`${totalBloque}€`} accent="#D97706" />
          <KpiCard label="Libérés aujourd'hui" value={`${transactions.filter(t=>t.date==='2026-04-04'&&t.statut==='libere').reduce((s,t)=>s+t.montant,0)}€`} accent="#059669" />
          <KpiCard label="Total viré" value={`${transactions.filter(t=>t.type==='virement').reduce((s,t)=>s+t.montant,0)}€`} accent="#2563EB" />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', gap:8 }}>
            {[['tous','Tous'],['bloques','Bloqués'],['liberes','Libérés'],['virements','Virements']].map(([v,l]) => (
              <button key={v} onClick={() => setPayFilter(v)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight: payFilter===v ? 700 : 500, background: payFilter===v ? K : '#F3F3F3', color: payFilter===v ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.825rem' }}>{l}</button>
            ))}
          </div>
          <button onClick={() => { setModalVirement(true); setVirementDone(false); setVirementAmount(''); }} style={BTN_PRIMARY}>💸 Virement</button>
        </div>
        <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
          {filteredTx.map((t,i) => (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < filteredTx.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14 }}>{t.type==='virement'?'Virement':t.client}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>{t.date} · {t.id}</div></div>
              <div style={{ fontWeight:800, fontSize:16, color: t.type==='virement' ? '#2563EB' : t.statut==='libere' ? '#059669' : '#D97706' }}>{t.type==='virement'?'−':''}{t.montant}€</div>
              <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background: t.statut==='libere'||t.statut==='vire' ? '#D1FAE5' : '#FEF3C7', color: t.statut==='libere'||t.statut==='vire' ? '#065F46' : '#D97706' }}>{t.statut==='libere'?'✓ Libéré':t.statut==='bloque'?'⏳ Bloqué':'✓ Viré'}</span>
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Véhicule */}
      {tab === 'vehicule' && (<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Mon véhicule</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>Informations</div>
            {[{l:'Marque',v:VEHICULE.marque},{l:'Modèle',v:VEHICULE.modele},{l:'Année',v:VEHICULE.annee},{l:'Immatriculation',v:VEHICULE.immat},{l:'Couleur',v:VEHICULE.couleur},{l:'Places',v:VEHICULE.places},{l:'Kilométrage',v:`${VEHICULE.km.toLocaleString()} km`}].map(r => (
              <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0F0F0', fontSize:14 }}>
                <span style={{ color:'#8B8B8B' }}>{r.l}</span><span style={{ fontWeight:600 }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>Documents</div>
            {[{l:'Assurance',v:VEHICULE.assurance, ok:true},{l:'Contrôle technique',v:VEHICULE.controle, ok: new Date(VEHICULE.controle) > new Date()}].map(d => (
              <div key={d.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #F0F0F0' }}>
                <div><div style={{ fontSize:14, fontWeight:600 }}>{d.l}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Expire le {d.v}</div></div>
                <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:10, background: d.ok ? '#D1FAE5' : '#FEE2E2', color: d.ok ? '#065F46' : '#DC2626' }}>{d.ok ? '✓ Valide' : '⚠ Expiré'}</span>
              </div>
            ))}
            <div style={{ marginTop:16, padding:'16px', background:K_SOFT, borderRadius:10, textAlign:'center' }}>
              <div style={{ fontSize:60, marginBottom:8 }}>🚗</div>
              <div style={{ fontSize:16, fontWeight:700 }}>{VEHICULE.marque} {VEHICULE.modele}</div>
              <div style={{ fontSize:14, color:'#8B8B8B' }}>{VEHICULE.immat} · {VEHICULE.couleur}</div>
            </div>
          </div>
        </div>
      </div>)}

      {/* TAB: Clients */}
      {tab === 'clients' && (<div>
        <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Rechercher un client..." style={{ width:'100%', maxWidth:360, padding:'10px 16px', borderRadius:10, border:'1px solid #E5E5E5', fontSize:14, fontFamily:'inherit', outline:'none', marginBottom:20, boxSizing:'border-box' }} />
        <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
          {filteredClients.map((c,i) => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < filteredClients.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:K_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14 }}>{c.nom[0]}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14 }}>{c.nom}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>{c.courses} courses · {c.depense}€ dépensés</div></div>
              <div style={{ textAlign:'right' }}>{c.note > 0 && <div style={{ fontSize:13, fontWeight:700, color:'#F59E0B' }}>★ {c.note}</div>}<FideliteBadge f={c.fidelite} /></div>
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Paramètres */}
      {tab === 'parametres' && (<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Paramètres chauffeur</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>Zone d'acceptation</div>
            {['5 km','10 km','20 km','50 km','Illimité'].map(z => (
              <label key={z} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', fontSize:14, cursor:'pointer' }}>
                <input type="radio" name="zone" defaultChecked={z==='20 km'} style={{ accentColor:K }} /> {z}
              </label>
            ))}
          </div>
          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>Notifications</div>
            {[{l:'Nouvelle course',d:'Alerte à chaque demande'},{l:'Course acceptée',d:'Confirmation client'},{l:'Paiement reçu',d:'Quand le paiement est libéré'}].map(n => (
              <div key={n.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F0F0F0' }}>
                <div><div style={{ fontSize:14, fontWeight:600 }}>{n.l}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>{n.d}</div></div>
                <div style={{ width:44, height:24, borderRadius:12, background:K, position:'relative', cursor:'pointer' }}><div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left:22, boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} /></div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => showToast('Paramètres sauvegardés')} style={{ ...BTN_PRIMARY, marginTop:20, padding:'12px 24px' }}>💾 Sauvegarder</button>
      </div>)}

      {/* TAB: Rapports */}
      {tab === 'rapports' && (<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Revenus semaine" value={`${REVENUS_7J.reduce((s,r)=>s+r.montant,0)}€`} accent={K} />
          <KpiCard label="Courses semaine" value="18" accent="#7C3AED" />
          <KpiCard label="Km parcourus" value="342 km" accent="#059669" />
          <KpiCard label="Note moyenne" value="4.9/5" accent="#F59E0B" />
        </div>
        <div style={{ ...CARD_STYLE, marginBottom:24 }}>
          <div style={SECTION_HDR}>Revenus des 7 derniers jours</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
            {REVENUS_7J.map(r => (
              <div key={r.jour} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:12, fontWeight:700 }}>{r.montant}€</div>
                <div style={{ width:'100%', background:K, borderRadius:'6px 6px 0 0', height:`${Math.round((r.montant/maxRevenu)*120)}px` }} />
                <div style={{ fontSize:11, color:'#8B8B8B', fontWeight:600 }}>{r.jour}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={CARD_STYLE}>
          <div style={SECTION_HDR}>Top destinations</div>
          {[{d:'Aéroport CDG',n:8},{d:'La Défense',n:6},{d:'Gare de Lyon',n:5},{d:'Orly',n:4},{d:'Montmartre',n:3}].map((t,i) => (
            <div key={t.d} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontSize:13 }}>{i+1}. {t.d}</span><span style={{ fontWeight:700, fontSize:13 }}>{t.n}×</span></div>
          ))}
        </div>
      </div>)}

      {/* MODAL: Course detail */}
      {modalCourse && (
        <div style={MODAL_OVERLAY} onClick={() => setModalCourse(null)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Course {modalCourse.code}</div>
            <div style={{ color:'#8B8B8B', fontSize:14, marginBottom:20 }}>{modalCourse.heure} · <StatusBadge statut={modalCourse.statut} /></div>
            <div style={{ ...CARD_STYLE, background:'#FAFAFA', marginBottom:16 }}>
              <div style={{ fontSize:13, color:'#8B8B8B', marginBottom:4 }}>Trajet</div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>📍 {modalCourse.depart}</div>
              <div style={{ fontWeight:700, fontSize:14, color:'#059669' }}>📍 {modalCourse.destination}</div>
              <div style={{ fontSize:12, color:'#8B8B8B', marginTop:8 }}>{modalCourse.distance} · {modalCourse.duree}</div>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, color:'#8B8B8B', marginBottom:4 }}>Client</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{modalCourse.client.nom}</div>
              <div style={{ fontSize:13, color:'#5E5E5E' }}>{modalCourse.client.tel}</div>
            </div>
            <div style={{ borderTop:'2px solid #F0F0F0', paddingTop:12, marginBottom:16, display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:18 }}>
              <span>Prix</span><span>{modalCourse.prix}€</span>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              {modalCourse.statut === 'en_attente' && <button onClick={() => accepterCourse(modalCourse.id)} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>✓ Accepter la course</button>}
              {['acceptee','en_cours'].includes(modalCourse.statut) && <button onClick={() => terminerCourse(modalCourse.id)} style={{ ...BTN_PRIMARY, flex:1, padding:'12px', background:'#059669' }}>✓ Terminer et encaisser</button>}
              <button onClick={() => setModalCourse(null)} style={{ ...BTN_GHOST, padding:'12px' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Virement */}
      {modalVirement && (
        <div style={MODAL_OVERLAY} onClick={() => { if(!virementDone) setModalVirement(false); }}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            {virementDone ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}><div style={{ fontSize:52, marginBottom:16 }}>🎉</div><div style={{ fontWeight:800, fontSize:20 }}>Virement initié !</div><div style={{ color:'#8B8B8B', fontSize:14, marginTop:8 }}>Réception sous 1–2 jours ouvrés</div></div>
            ) : (<>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Demander un virement</div>
              <div style={{ color:'#8B8B8B', fontSize:14, marginBottom:20 }}>Disponible : <strong style={{ color:'#059669' }}>{totalBloque}€</strong></div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Montant (€)</label><input type="number" value={virementAmount} onChange={e => setVirementAmount(e.target.value)} placeholder={`Max: ${totalBloque}€`} style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid #E5E5E5', fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} /></div>
              <div style={{ display:'flex', gap:10 }}><button onClick={submitVirement} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>💸 Confirmer</button><button onClick={() => setModalVirement(false)} style={{ ...BTN_GHOST, padding:'12px' }}>Annuler</button></div>
            </>)}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={{ position:'fixed', top:24, right:24, background: toast.type==='error' ? '#DC2626' : '#1C1C1E', color:'#fff', padding:'12px 20px', borderRadius:12, fontWeight:600, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,.25)', zIndex:2000, maxWidth:360 }}>{toast.msg}</div>}
    </div>
  );
}
