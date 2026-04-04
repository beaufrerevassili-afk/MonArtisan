import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const K = '#000000';
const BG = '#F7F7F7';
const GREEN = '#16A34A';

const CARD = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E5E5E5', boxShadow:'0 1px 4px rgba(0,0,0,.04)' };
const HDR = { fontSize:13, fontWeight:700, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN = { background:K, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const GHOST = { background:'transparent', color:'#5E5E5E', border:'1px solid #E5E5E5', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const OVL = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:480, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

const TABS = [
  { id:'accueil',    icon:'🏠', label:'Accueil' },
  { id:'courses',    icon:'🚗', label:'Mes courses' },
  { id:'gains',      icon:'💰', label:'Mes gains' },
  { id:'vehicule',   icon:'🚙', label:'Mon véhicule' },
  { id:'avis',       icon:'⭐', label:'Mes avis' },
  { id:'profil',     icon:'👤', label:'Mon profil' },
];

const STATUS = {
  nouvelle:  { label:'Nouvelle',   bg:'#FEF3C7', border:'#FDE047', color:'#713F12' },
  acceptee:  { label:'Acceptée',   bg:'#DBEAFE', border:'#93C5FD', color:'#1D4ED8' },
  en_route:  { label:'En route',   bg:'#F5F3FF', border:'#C4B5FD', color:'#5B21B6' },
  arrivee:   { label:'Arrivé',     bg:'#FFF7ED', border:'#FED7AA', color:'#C2410C' },
  terminee:  { label:'Terminée',   bg:'#D1FAE5', border:'#86EFAC', color:'#065F46' },
};

const COURSES = [
  { id:1, client:'Sophie Martin', depart:'Gare du Nord', destination:'Aéroport CDG', distance:'32 km', duree:'45 min', prix:38, pourboire:5, statut:'en_route', heure:'12:30', note:null },
  { id:2, client:'Lucas Bernard', depart:'Opéra', destination:'La Défense', distance:'12 km', duree:'25 min', prix:18, pourboire:0, statut:'nouvelle', heure:'13:15', note:null },
  { id:3, client:'Pierre Garnier', depart:'Châtelet', destination:'Vincennes', distance:'8 km', duree:'20 min', prix:14, pourboire:2, statut:'terminee', heure:'11:00', note:5 },
  { id:4, client:'Marie Lambert', depart:'Bastille', destination:'Montmartre', distance:'6 km', duree:'18 min', prix:12, pourboire:0, statut:'terminee', heure:'10:15', note:4 },
  { id:5, client:'Amélie Rousseau', depart:'Nation', destination:'République', distance:'4 km', duree:'12 min', prix:9, pourboire:1, statut:'terminee', heure:'09:30', note:5 },
  { id:6, client:'Jean Moreau', depart:'Gare de Lyon', destination:'Montparnasse', distance:'5 km', duree:'15 min', prix:11, pourboire:0, statut:'terminee', heure:'08:45', note:5 },
];

const AVIS = [
  { client:'Pierre Garnier', note:5, commentaire:'Chauffeur très agréable, conduite douce.', date:'2026-04-04' },
  { client:'Marie Lambert', note:4, commentaire:'Bien, un peu de retard au départ.', date:'2026-04-04' },
  { client:'Amélie Rousseau', note:5, commentaire:'Parfait !', date:'2026-04-04' },
  { client:'Jean Moreau', note:5, commentaire:'Ponctuel et professionnel.', date:'2026-04-03' },
  { client:'Nina Fontaine', note:4, commentaire:'Bonne course, voiture propre.', date:'2026-04-02' },
];

const VEHICULE = { marque:'Tesla', modele:'Model 3', annee:2024, immat:'AB-123-CD', couleur:'Noir', places:4, assurance:'2026-12-31', controle:'2026-06-15', km:42000 };

const GAINS_SEMAINE = [
  { jour:'Lun', courses:4, montant:85 },{ jour:'Mar', courses:6, montant:120 },{ jour:'Mer', courses:5, montant:95 },
  { jour:'Jeu', courses:7, montant:140 },{ jour:'Ven', courses:8, montant:180 },{ jour:'Sam', courses:9, montant:210 },
  { jour:'Dim', courses:3, montant:65 },
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

const TAB_MAP = { courses:'courses', gains:'gains', vehicule:'vehicule', avis:'avis', profil:'profil' };

export default function DashboardDriver() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB_MAP[searchParams.get('tab')] || 'accueil');
  const [courses, setCourses] = useState(COURSES);
  const [enLigne, setEnLigne] = useState(true);
  const [toast, setToast] = useState(null);
  const [modalCourse, setModalCourse] = useState(null);

  useEffect(() => {
    const o = searchParams.get('tab');
    if (o && TAB_MAP[o]) setTab(TAB_MAP[o]);
    else if (!o) setTab('accueil');
  }, [searchParams]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3500); };
  const gainsJour = courses.filter(c=>c.statut==='terminee').reduce((s,c)=>s+c.prix+c.pourboire,0);
  const coursesJour = courses.filter(c=>c.statut==='terminee').length;
  const noteAvg = AVIS.length ? (AVIS.reduce((s,a)=>s+a.note,0)/AVIS.length).toFixed(1) : '—';
  const maxG = Math.max(...GAINS_SEMAINE.map(g=>g.montant),1);

  const accepter = (id) => { setCourses(p=>p.map(c=>c.id===id?{...c,statut:'acceptee'}:c)); showToast('Course acceptée !'); setModalCourse(null); };
  const terminer = (id) => { setCourses(p=>p.map(c=>c.id===id?{...c,statut:'terminee'}:c)); showToast('Course terminée — paiement reçu !'); setModalCourse(null); };

  return (
    <div style={{ padding:'24px 28px', background:BG, minHeight:'100vh', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800 }}>🚗 Freample Driver</div>
          <div style={{ fontSize:14, color:'#8B8B8B', marginTop:2 }}>Bonjour, {user?.nom || 'Chauffeur'}</div>
        </div>
        <button onClick={()=>setEnLigne(!enLigne)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:999, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, fontFamily:'inherit', background:enLigne?'#D1FAE5':'#FEE2E2', color:enLigne?'#065F46':'#DC2626' }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:enLigne?GREEN:'#DC2626' }} />{enLigne?'En ligne':'Hors ligne'}
        </button>
      </div>

      <div style={{ display:'flex', gap:4, background:'#fff', borderRadius:14, padding:6, border:'1px solid #E5E5E5', marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:tab===t.id?700:500, background:tab===t.id?K:'transparent', color:tab===t.id?'#fff':'#666', fontFamily:'inherit', fontSize:'0.875rem', transition:'all .15s' }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ACCUEIL */}
      {tab==='accueil'&&(<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Gains aujourd'hui" value={`${gainsJour}€`} accent={GREEN} />
          <KpiCard label="Courses terminées" value={coursesJour} accent="#7C3AED" />
          <KpiCard label="Note moyenne" value={`${noteAvg}/5`} sub="★★★★★" accent="#F59E0B" />
          <KpiCard label="Km parcourus" value="55 km" accent="#3B82F6" />
        </div>
        {/* Course active */}
        {courses.filter(c=>['en_route','acceptee'].includes(c.statut)).map(c=>(
          <div key={c.id} style={{ ...CARD, marginBottom:16, border:`2px solid ${STATUS[c.statut].border}`, background:STATUS[c.statut].bg+'30' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:16, fontWeight:800 }}>Course en cours</div>
              <Badge statut={c.statut} />
            </div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>📍 {c.depart}</div>
            <div style={{ fontSize:15, fontWeight:700, color:GREEN, marginBottom:12 }}>📍 {c.destination}</div>
            <div style={{ display:'flex', gap:16, fontSize:13, color:'#8B8B8B', marginBottom:16 }}>
              <span>{c.distance}</span><span>{c.duree}</span><span style={{ fontWeight:800, color:K, fontSize:16 }}>{c.prix}€</span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>terminer(c.id)} style={{ ...BTN, flex:1, padding:'12px', background:GREEN }}>✓ Course terminée</button>
              <button style={{ ...GHOST, padding:'12px' }}>📞 Appeler</button>
            </div>
          </div>
        ))}
        {/* Nouvelles courses */}
        <div style={CARD}>
          <div style={HDR}>Courses disponibles</div>
          {courses.filter(c=>c.statut==='nouvelle').length===0&&<div style={{ color:'#8B8B8B', padding:20, textAlign:'center' }}>En attente de nouvelles courses...</div>}
          {courses.filter(c=>c.statut==='nouvelle').map(c=>(
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px', background:'#FAFAFA', borderRadius:10, marginBottom:8, border:'1px solid #F0F0F0' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{c.depart} → {c.destination}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{c.distance} · {c.duree} · {c.client}</div>
              </div>
              <div style={{ fontWeight:800, fontSize:18, marginRight:12 }}>{c.prix}€</div>
              <button onClick={()=>accepter(c.id)} style={{ ...BTN, padding:'8px 16px' }}>Accepter</button>
            </div>
          ))}
        </div>
      </div>)}

      {/* MES COURSES */}
      {tab==='courses'&&(<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Historique des courses</div>
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          {courses.map((c,i)=>(
            <div key={c.id} onClick={()=>setModalCourse(c)} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:i<courses.length-1?'1px solid #F0F0F0':'none', cursor:'pointer' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{c.depart} → {c.destination}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{c.client} · {c.heure} · {c.distance}</div>
              </div>
              <div style={{ fontWeight:800, fontSize:15, color:c.statut==='terminee'?GREEN:K }}>{c.prix}€</div>
              {c.pourboire>0&&<span style={{ fontSize:11, fontWeight:700, color:'#F59E0B', background:'#FFFBEB', padding:'2px 8px', borderRadius:10 }}>+{c.pourboire}€</span>}
              <Badge statut={c.statut} />
            </div>
          ))}
        </div>
      </div>)}

      {/* MES GAINS */}
      {tab==='gains'&&(<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Cette semaine" value={`${GAINS_SEMAINE.reduce((s,g)=>s+g.montant,0)}€`} accent={GREEN} />
          <KpiCard label="Courses semaine" value={GAINS_SEMAINE.reduce((s,g)=>s+g.courses,0)} accent="#7C3AED" />
          <KpiCard label="Pourboires" value={`${courses.reduce((s,c)=>s+c.pourboire,0)}€`} accent="#F59E0B" />
          <KpiCard label="Moy. par course" value={`${Math.round(GAINS_SEMAINE.reduce((s,g)=>s+g.montant,0)/GAINS_SEMAINE.reduce((s,g)=>s+g.courses,0))}€`} accent="#3B82F6" />
        </div>
        <div style={CARD}>
          <div style={HDR}>Gains par jour</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
            {GAINS_SEMAINE.map(g=>(
              <div key={g.jour} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:12, fontWeight:700 }}>{g.montant}€</div>
                <div style={{ width:'100%', background:K, borderRadius:'6px 6px 0 0', height:`${Math.round((g.montant/maxG)*120)}px` }} />
                <div style={{ fontSize:11, color:'#8B8B8B', fontWeight:600 }}>{g.jour}</div>
                <div style={{ fontSize:10, color:'#8B8B8B' }}>{g.courses}c</div>
              </div>
            ))}
          </div>
        </div>
      </div>)}

      {/* MON VEHICULE */}
      {tab==='vehicule'&&(<div>
        <div style={{ ...CARD, textAlign:'center', padding:32, marginBottom:20 }}>
          <div style={{ fontSize:72, marginBottom:12 }}>🚗</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{VEHICULE.marque} {VEHICULE.modele}</div>
          <div style={{ fontSize:14, color:'#8B8B8B' }}>{VEHICULE.immat} · {VEHICULE.couleur} · {VEHICULE.annee}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={CARD}>
            <div style={HDR}>Informations</div>
            {[{l:'Places',v:VEHICULE.places},{l:'Kilométrage',v:`${VEHICULE.km.toLocaleString()} km`}].map(r=>(
              <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0F0F0', fontSize:14 }}>
                <span style={{ color:'#8B8B8B' }}>{r.l}</span><span style={{ fontWeight:600 }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div style={CARD}>
            <div style={HDR}>Documents</div>
            {[{l:'Assurance',v:VEHICULE.assurance,ok:true},{l:'Contrôle technique',v:VEHICULE.controle,ok:new Date(VEHICULE.controle)>new Date()}].map(d=>(
              <div key={d.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F0F0F0' }}>
                <div><div style={{ fontSize:14, fontWeight:600 }}>{d.l}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Expire le {d.v}</div></div>
                <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:10, background:d.ok?'#D1FAE5':'#FEE2E2', color:d.ok?'#065F46':'#DC2626' }}>{d.ok?'✓ Valide':'⚠ Expiré'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>)}

      {/* MES AVIS */}
      {tab==='avis'&&(<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Note moyenne" value={`${noteAvg}/5`} accent="#F59E0B" />
          <KpiCard label="Total avis" value={AVIS.length} accent="#7C3AED" />
        </div>
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          {AVIS.map((a,i)=>(
            <div key={i} style={{ padding:'16px 20px', borderBottom:i<AVIS.length-1?'1px solid #F0F0F0':'none' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>{a.client}</span>
                <span style={{ color:'#F59E0B', fontSize:14 }}>{'★'.repeat(a.note)}{'☆'.repeat(5-a.note)}</span>
              </div>
              <div style={{ fontSize:13, color:'#5E5E5E', marginBottom:4 }}>"{a.commentaire}"</div>
              <div style={{ fontSize:12, color:'#8B8B8B' }}>{a.date}</div>
            </div>
          ))}
        </div>
      </div>)}

      {/* MON PROFIL */}
      {tab==='profil'&&(<div>
        <div style={{ ...CARD, textAlign:'center', padding:32 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#F3F3F3', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800 }}>{(user?.nom||'C')[0]}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{user?.nom || 'Chauffeur'}</div>
          <div style={{ fontSize:14, color:'#8B8B8B', marginTop:4 }}>{user?.email || 'chauffeur@demo.com'}</div>
          <div style={{ marginTop:16, display:'flex', justifyContent:'center', gap:24 }}>
            <div><div style={{ fontSize:22, fontWeight:800, color:GREEN }}>{coursesJour+GAINS_SEMAINE.reduce((s,g)=>s+g.courses,0)}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Courses totales</div></div>
            <div><div style={{ fontSize:22, fontWeight:800, color:'#F59E0B' }}>{noteAvg}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Note moyenne</div></div>
            <div><div style={{ fontSize:22, fontWeight:800 }}>{GAINS_SEMAINE.reduce((s,g)=>s+g.montant,0)}€</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Gains semaine</div></div>
          </div>
        </div>
      </div>)}

      {/* MODAL course */}
      {modalCourse&&(
        <div style={OVL} onClick={()=>setModalCourse(null)}>
          <div style={BOX} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>Détail de la course</div>
            <div style={{ ...CARD, background:'#FAFAFA', marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>📍 {modalCourse.depart}</div>
              <div style={{ fontWeight:700, fontSize:14, color:GREEN, marginBottom:8 }}>📍 {modalCourse.destination}</div>
              {[{l:'Client',v:modalCourse.client},{l:'Distance',v:modalCourse.distance},{l:'Durée',v:modalCourse.duree},{l:'Prix',v:`${modalCourse.prix}€`},{l:'Pourboire',v:modalCourse.pourboire>0?`+${modalCourse.pourboire}€`:'—'}].map(r=>(
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:14, borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ color:'#8B8B8B' }}>{r.l}</span><span style={{ fontWeight:600 }}>{r.v}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setModalCourse(null)} style={{ ...BTN, width:'100%', padding:'12px' }}>Fermer</button>
          </div>
        </div>
      )}

      {toast&&<div style={{ position:'fixed', top:24, right:24, background:'#1C1C1E', color:'#fff', padding:'12px 20px', borderRadius:12, fontWeight:600, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,.25)', zIndex:2000 }}>{toast}</div>}
    </div>
  );
}
