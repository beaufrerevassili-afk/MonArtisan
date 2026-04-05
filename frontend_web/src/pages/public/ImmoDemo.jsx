import React, { useState } from 'react';
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

const DEMO_SCI = [
  { id:1, nom:'SCI Riviera', type:'IR', parts:100, biens:3, loyers:4200, charges:1800, tresorerie:28500 },
  { id:2, nom:'SCI Patrimoine 75', type:'IS', parts:500, biens:5, loyers:8900, charges:3200, tresorerie:67200 },
  { id:3, nom:'SCI Famille Dupont', type:'IR', parts:200, biens:2, loyers:2100, charges:900, tresorerie:15800 },
];

const DEMO_BIENS = [
  { id:1, sci:'SCI Riviera', type:'Appartement', adresse:'24 rue de la Liberté, Nice', surface:65, loyer:850, locataire:'M. Martin', statut:'loue', occupation:100, rendement:5.2 },
  { id:2, sci:'SCI Riviera', type:'Studio', adresse:'8 av. Jean Médecin, Nice', surface:28, loyer:550, locataire:'Mme Duval', statut:'loue', occupation:100, rendement:6.8 },
  { id:3, sci:'SCI Riviera', type:'Parking', adresse:'Résidence Les Pins, Nice', surface:0, loyer:120, locataire:'M. Roche', statut:'loue', occupation:100, rendement:8.1 },
  { id:4, sci:'SCI Patrimoine 75', type:'Appartement', adresse:'15 rue du Faubourg, Paris 10e', surface:45, loyer:1200, locataire:'Mme Lambert', statut:'loue', occupation:100, rendement:4.1 },
  { id:5, sci:'SCI Patrimoine 75', type:'Appartement', adresse:'3 rue des Archives, Paris 3e', surface:72, loyer:1800, locataire:'M. Chen', statut:'loue', occupation:100, rendement:3.8 },
  { id:6, sci:'SCI Patrimoine 75', type:'Local commercial', adresse:'42 bd Voltaire, Paris 11e', surface:55, loyer:2200, locataire:'SARL Café Voltaire', statut:'loue', occupation:100, rendement:5.5 },
  { id:7, sci:'SCI Patrimoine 75', type:'Appartement', adresse:'7 rue Lepic, Paris 18e', surface:38, loyer:0, locataire:null, statut:'vacant', occupation:0, rendement:0 },
  { id:8, sci:'SCI Patrimoine 75', type:'Studio', adresse:'21 rue Oberkampf, Paris 11e', surface:22, loyer:750, locataire:'M. Petit', statut:'loue', occupation:100, rendement:7.2 },
  { id:9, sci:'SCI Famille Dupont', type:'Maison', adresse:'12 chemin des Vignes, Bordeaux', surface:110, loyer:1400, locataire:'Famille Moreau', statut:'loue', occupation:100, rendement:4.5 },
  { id:10, sci:'SCI Famille Dupont', type:'Appartement', adresse:'5 place Gambetta, Bordeaux', surface:52, loyer:700, locataire:null, statut:'vacant', occupation:0, rendement:0 },
];

const DEMO_ALERTES = [
  { type:'warning', msg:'Fin de bail — M. Martin (SCI Riviera) — 15 juillet 2026', date:'2026-05-01' },
  { type:'danger', msg:'Loyer impayé — Mme Lambert (SCI Patrimoine 75) — Mars 2026', date:'2026-04-02' },
  { type:'info', msg:'Diagnostic DPE à renouveler — 7 rue Lepic, Paris 18e', date:'2026-04-05' },
  { type:'success', msg:'Loyer encaissé — M. Chen — 1 800€', date:'2026-04-01' },
];

export default function ImmoDemo() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const [activeSci, setActiveSci] = useState(null);
  const [tab, setTab] = useState('dashboard');

  if (!user || user.email !== 'freamplecom@gmail.com') { navigate('/'); return null; }

  const sci = activeSci ? DEMO_SCI.find(s=>s.id===activeSci) : null;
  const biens = activeSci ? DEMO_BIENS.filter(b=>b.sci===sci?.nom) : DEMO_BIENS;
  const totalLoyers = biens.reduce((s,b)=>s+b.loyer,0);
  const totalBiens = biens.length;
  const vacants = biens.filter(b=>b.statut==='vacant').length;
  const occupation = totalBiens > 0 ? Math.round(((totalBiens-vacants)/totalBiens)*100) : 0;
  const totalTreso = activeSci ? (sci?.tresorerie||0) : DEMO_SCI.reduce((s,c)=>s+c.tresorerie,0);

  const TABS = [
    { id:'dashboard', label:'Vue globale', icon:'📊' },
    { id:'biens', label:'Biens', icon:'🏠' },
    { id:'locataires', label:'Locataires', icon:'👥' },
    { id:'finances', label:'Finances', icon:'💰' },
    { id:'documents', label:'Documents', icon:'📄' },
    { id:'alertes', label:'Alertes', icon:'🔔' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text, display:'flex', flexDirection:'column' }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:56, background:L.white, borderBottom:`1px solid ${L.border}`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={()=>navigate('/immo')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:800, color:L.text, fontFamily:L.font, letterSpacing:'-0.04em' }}>
            Freample<span style={{ color:L.gold }}>.</span> <span style={{ fontWeight:400, color:L.textSec }}>Immo</span>
          </button>
          <span style={{ fontSize:10, fontWeight:700, color:'#22C55E', background:'rgba(34,197,94,0.08)', padding:'3px 10px', borderRadius:4 }}>Démo investisseur</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>navigate('/immo/erp')} style={{ padding:'6px 14px', background:'none', border:`1px solid ${L.border}`, fontSize:12, color:L.textSec, cursor:'pointer', fontFamily:L.font, transition:'all .15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=L.noir;e.currentTarget.style.color=L.noir;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.color=L.textSec;}}>ERP & Diagnostics</button>
          <button onClick={()=>navigate('/')} style={{ padding:'6px 14px', background:L.noir, border:'none', fontSize:12, color:'#fff', cursor:'pointer', fontFamily:L.font }}>Accueil</button>
        </div>
      </nav>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* ══ SIDEBAR ══ */}
        <div style={{ width:240, background:L.white, borderRight:`1px solid ${L.border}`, overflowY:'auto', flexShrink:0, display:'flex', flexDirection:'column' }}>
          {/* SCI selector */}
          <div style={{ padding:'16px', borderBottom:`1px solid ${L.border}` }}>
            <div style={{ fontSize:10, fontWeight:600, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Mes SCI</div>
            <button onClick={()=>setActiveSci(null)} style={{ width:'100%', padding:'8px 12px', background:!activeSci?L.cream:'transparent', border:`1px solid ${!activeSci?L.gold:L.border}`, color:!activeSci?L.goldDark:L.textSec, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, marginBottom:4, textAlign:'left', transition:'all .15s' }}>
              📊 Vue consolidée
            </button>
            {DEMO_SCI.map(s=>(
              <button key={s.id} onClick={()=>setActiveSci(s.id)} style={{ width:'100%', padding:'8px 12px', background:activeSci===s.id?L.cream:'transparent', border:`1px solid ${activeSci===s.id?L.gold:L.border}`, color:activeSci===s.id?L.goldDark:L.text, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, marginBottom:4, textAlign:'left', transition:'all .15s' }}>
                🏛️ {s.nom} <span style={{ fontWeight:400, color:L.textLight, fontSize:10 }}>({s.type})</span>
              </button>
            ))}
          </div>
          {/* Tabs */}
          <div style={{ padding:'8px 0', flex:1 }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ width:'100%', padding:'10px 16px', background:tab===t.id?L.cream:'transparent', border:'none', display:'flex', alignItems:'center', gap:10, fontSize:13, fontWeight:tab===t.id?700:500, color:tab===t.id?L.text:L.textSec, cursor:'pointer', fontFamily:L.font, transition:'all .1s', borderLeft:tab===t.id?`3px solid ${L.gold}`:'3px solid transparent' }}
                onMouseEnter={e=>{if(tab!==t.id)e.currentTarget.style.background=L.cream;}} onMouseLeave={e=>{if(tab!==t.id)e.currentTarget.style.background='transparent';}}>
                <span style={{ fontSize:15 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ CONTENU PRINCIPAL ══ */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>

          {/* DASHBOARD */}
          {tab==='dashboard' && (<>
            <h2 style={{ fontSize:20, fontWeight:800, color:L.text, letterSpacing:'-0.03em', margin:'0 0 20px' }}>{sci ? sci.nom : 'Vue consolidée'}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12, marginBottom:24 }}>
              {[
                { label:'Loyers mensuels', value:`${totalLoyers.toLocaleString('fr-FR')}€`, color:L.green },
                { label:'Biens', value:totalBiens, color:L.blue },
                { label:'Taux d\'occupation', value:`${occupation}%`, color:occupation>90?L.green:L.orange },
                { label:'Trésorerie', value:`${totalTreso.toLocaleString('fr-FR')}€`, color:L.gold },
              ].map(k=>(
                <div key={k.label} style={{ background:L.white, border:`1px solid ${L.border}`, padding:'20px', position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:k.color }} />
                  <div style={{ fontSize:11, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{k.label}</div>
                  <div style={{ fontSize:24, fontWeight:200, color:L.text, fontFamily:L.serif }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Alertes récentes */}
            <div style={{ background:L.white, border:`1px solid ${L.border}`, marginBottom:24 }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${L.border}`, fontSize:14, fontWeight:700 }}>Alertes récentes</div>
              {DEMO_ALERTES.map((a,i)=>(
                <div key={i} style={{ padding:'12px 20px', borderBottom:i<DEMO_ALERTES.length-1?`1px solid ${L.border}`:'none', display:'flex', alignItems:'center', gap:12, fontSize:13 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:a.type==='danger'?L.red:a.type==='warning'?L.orange:a.type==='success'?L.green:L.blue, flexShrink:0 }} />
                  <div style={{ flex:1, color:L.text }}>{a.msg}</div>
                  <div style={{ fontSize:11, color:L.textLight, flexShrink:0 }}>{new Date(a.date).toLocaleDateString('fr-FR')}</div>
                </div>
              ))}
            </div>

            {/* SCI résumé */}
            {!activeSci && (
              <div style={{ background:L.white, border:`1px solid ${L.border}` }}>
                <div style={{ padding:'14px 20px', borderBottom:`1px solid ${L.border}`, fontSize:14, fontWeight:700 }}>Vos SCI</div>
                {DEMO_SCI.map(s=>(
                  <div key={s.id} onClick={()=>setActiveSci(s.id)} style={{ padding:'14px 20px', borderBottom:`1px solid ${L.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', transition:'background .1s' }}
                    onMouseEnter={e=>e.currentTarget.style.background=L.cream} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:L.text }}>{s.nom}</div>
                      <div style={{ fontSize:12, color:L.textSec }}>{s.biens} biens · {s.type} · {s.parts} parts</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:16, fontWeight:700, color:L.green }}>{s.loyers.toLocaleString('fr-FR')}€<span style={{ fontSize:11, fontWeight:400, color:L.textLight }}>/mois</span></div>
                      <div style={{ fontSize:11, color:L.textLight }}>Tréso: {s.tresorerie.toLocaleString('fr-FR')}€</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>)}

          {/* BIENS */}
          {tab==='biens' && (<>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:800, margin:0 }}>{sci ? `Biens — ${sci.nom}` : 'Tous les biens'}</h2>
              <span style={{ fontSize:13, color:L.textSec }}>{biens.length} bien{biens.length>1?'s':''}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:12 }}>
              {biens.map(b=>(
                <div key={b.id} style={{ background:L.white, border:`1px solid ${L.border}`, padding:'20px', transition:'all .15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.04)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.boxShadow='none';}}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:L.goldDark, background:L.goldLight, padding:'3px 10px' }}>{b.type}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:b.statut==='loue'?L.green:L.red, background:b.statut==='loue'?L.greenBg:L.redBg, padding:'3px 10px' }}>
                      {b.statut==='loue'?'Loué':'Vacant'}
                    </div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:L.text, marginBottom:4 }}>{b.adresse}</div>
                  <div style={{ fontSize:12, color:L.textSec, marginBottom:12 }}>{b.sci}{b.surface>0?` · ${b.surface}m²`:''}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:L.textSec }}>Loyer</span>
                    <span style={{ fontWeight:700, color:b.loyer>0?L.green:L.textLight }}>{b.loyer>0?`${b.loyer}€/mois`:'—'}</span>
                  </div>
                  {b.locataire && <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginTop:4 }}>
                    <span style={{ color:L.textSec }}>Locataire</span>
                    <span style={{ fontWeight:600, color:L.text }}>{b.locataire}</span>
                  </div>}
                  {b.rendement>0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginTop:4 }}>
                    <span style={{ color:L.textSec }}>Rendement</span>
                    <span style={{ fontWeight:700, color:L.gold }}>{b.rendement}%</span>
                  </div>}
                </div>
              ))}
            </div>
          </>)}

          {/* LOCATAIRES */}
          {tab==='locataires' && (<>
            <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 20px' }}>Locataires</h2>
            <div style={{ background:L.white, border:`1px solid ${L.border}` }}>
              {biens.filter(b=>b.locataire).map((b,i,arr)=>(
                <div key={b.id} style={{ padding:'14px 20px', borderBottom:i<arr.length-1?`1px solid ${L.border}`:'none', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:L.text }}>{b.locataire}</div>
                    <div style={{ fontSize:12, color:L.textSec }}>{b.adresse}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:14, fontWeight:700, color:L.green }}>{b.loyer}€/mois</div>
                    <div style={{ fontSize:11, color:L.textLight }}>{b.sci}</div>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* FINANCES */}
          {tab==='finances' && (<>
            <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 20px' }}>Finances{sci?` — ${sci.nom}`:''}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12, marginBottom:24 }}>
              {[
                { label:'Revenus mensuels', value:`${totalLoyers.toLocaleString('fr-FR')}€`, color:L.green },
                { label:'Charges mensuelles', value:activeSci?`${sci?.charges.toLocaleString('fr-FR')}€`:`${DEMO_SCI.reduce((s,c)=>s+c.charges,0).toLocaleString('fr-FR')}€`, color:L.red },
                { label:'Cashflow net', value:`${(totalLoyers-(activeSci?sci?.charges:DEMO_SCI.reduce((s,c)=>s+c.charges,0))).toLocaleString('fr-FR')}€`, color:L.blue },
                { label:'Trésorerie', value:`${totalTreso.toLocaleString('fr-FR')}€`, color:L.gold },
              ].map(k=>(
                <div key={k.label} style={{ background:L.white, border:`1px solid ${L.border}`, padding:'20px' }}>
                  <div style={{ position:'relative' }}><div style={{ position:'absolute', top:-20, left:0, right:0, height:3, background:k.color }} /></div>
                  <div style={{ fontSize:11, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{k.label}</div>
                  <div style={{ fontSize:22, fontWeight:200, color:L.text, fontFamily:L.serif }}>{k.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background:L.white, border:`1px solid ${L.border}`, padding:'20px' }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Historique (simulation)</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:120 }}>
                {['Jan','Fév','Mar','Avr','Mai','Juin'].map((m,i)=>{
                  const v = totalLoyers + Math.round((Math.random()-0.3)*500);
                  return <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ fontSize:10, fontWeight:600, color:L.gold }}>{v}€</div>
                    <div style={{ width:'100%', background:L.gold, borderRadius:'3px 3px 0 0', height:Math.max(20,Math.round(v/totalLoyers*80)), opacity:0.5+i*0.1 }} />
                    <div style={{ fontSize:10, color:L.textLight }}>{m}</div>
                  </div>;
                })}
              </div>
            </div>
          </>)}

          {/* DOCUMENTS */}
          {tab==='documents' && (<>
            <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 20px' }}>Documents</h2>
            <div style={{ background:L.white, border:`1px solid ${L.border}` }}>
              {[
                { icon:'📋', nom:'Statuts SCI Riviera', type:'Juridique', date:'2024-03-15' },
                { icon:'📝', nom:'Bail — M. Martin — Nice', type:'Bail', date:'2025-07-01' },
                { icon:'📝', nom:'Bail — Mme Lambert — Paris 10e', type:'Bail', date:'2025-09-01' },
                { icon:'🏠', nom:'DPE — 24 rue de la Liberté, Nice', type:'Diagnostic', date:'2025-01-20' },
                { icon:'📊', nom:'Bilan 2025 — SCI Patrimoine 75', type:'Comptabilité', date:'2026-01-10' },
                { icon:'📄', nom:'Quittance Mars 2026 — M. Chen', type:'Quittance', date:'2026-03-01' },
                { icon:'⚖️', nom:'PV AG 2025 — SCI Famille Dupont', type:'AG', date:'2025-06-20' },
              ].map((d,i,arr)=>(
                <div key={d.nom} style={{ padding:'14px 20px', borderBottom:i<arr.length-1?`1px solid ${L.border}`:'none', display:'flex', alignItems:'center', gap:14 }}>
                  <span style={{ fontSize:20 }}>{d.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:L.text }}>{d.nom}</div>
                    <div style={{ fontSize:12, color:L.textSec }}>{d.type} · {new Date(d.date).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <button style={{ padding:'6px 14px', background:'none', border:`1px solid ${L.border}`, fontSize:11, fontWeight:600, color:L.textSec, cursor:'pointer', fontFamily:L.font, transition:'all .15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.color=L.gold;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.color=L.textSec;}}>
                    Ouvrir
                  </button>
                </div>
              ))}
            </div>
          </>)}

          {/* ALERTES */}
          {tab==='alertes' && (<>
            <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 20px' }}>Alertes & Rappels</h2>
            {DEMO_ALERTES.map((a,i)=>{
              const colors = { danger:{bg:L.redBg,border:L.red,text:L.red}, warning:{bg:L.orangeBg,border:L.orange,text:L.orange}, info:{bg:L.blueBg,border:L.blue,text:L.blue}, success:{bg:L.greenBg,border:L.green,text:L.green} };
              const c = colors[a.type];
              return <div key={i} style={{ background:c.bg, border:`1px solid ${c.border}30`, padding:'16px 20px', marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:c.border, flexShrink:0 }} />
                <div style={{ flex:1, fontSize:14, color:c.text, fontWeight:500 }}>{a.msg}</div>
                <div style={{ fontSize:12, color:L.textLight }}>{new Date(a.date).toLocaleDateString('fr-FR')}</div>
              </div>;
            })}
          </>)}

        </div>
      </div>
    </div>
  );
}
