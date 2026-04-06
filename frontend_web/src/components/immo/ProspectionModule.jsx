import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const LBL = { fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const DEFAULT_PROSPECTION = {
  sessions: [
    { id:1, date:'2026-04-04', secteur:'Nice Centre', type:'porte-a-porte', agent:'Vassili B.', contacts:[
      { id:1, nom:'Mme Rossi', adresse:'12 rue de France, Nice', statut:'interesse', note:'T3 à vendre, rappeler semaine prochaine', tel:'0612000001' },
      { id:2, nom:'M. Ferrara', adresse:'14 rue de France, Nice', statut:'absent', note:'Absent, boîte aux lettres pleine', tel:'' },
      { id:3, nom:'Mme Blanc', adresse:'16 rue de France, Nice', statut:'refus', note:'Pas intéressée, propriétaire occupant', tel:'' },
      { id:4, nom:'M. Chen', adresse:'18 rue de France, Nice', statut:'rappeler', note:'En réflexion, rappeler dans 2 semaines', tel:'0612000004' },
    ]},
    { id:2, date:'2026-04-02', secteur:'Nice Libération', type:'phoning', agent:'Vassili B.', contacts:[
      { id:5, nom:'M. Dupont', adresse:'5 av de la Libération', statut:'interesse', note:'Propriétaire T4, estimation souhaitée', tel:'0612000005' },
      { id:6, nom:'Mme Leroy', adresse:'8 av de la Libération', statut:'refus', note:'Vient de rénover, pas vendeur', tel:'0612000006' },
    ]},
    { id:3, date:'2026-03-28', secteur:'Nice Gambetta', type:'boitage', agent:'Vassili B.', contacts:[
      { id:7, nom:'Résidence Gambetta', adresse:'24 bd Gambetta', statut:'interesse', note:'3 retours sur 50 flyers déposés', tel:'' },
    ]},
  ],
  secteurs: [
    { id:1, nom:'Nice Centre', ville:'Nice', priorite:'haute', nbImmeubles:45, turnoverRate:8.2, prixMoyen:4800, nbVentes:32, evolution:'+5%' },
    { id:2, nom:'Nice Libération', ville:'Nice', priorite:'haute', nbImmeubles:38, turnoverRate:6.5, prixMoyen:3900, nbVentes:24, evolution:'+3%' },
    { id:3, nom:'Nice Gambetta', ville:'Nice', priorite:'moyenne', nbImmeubles:28, turnoverRate:5.1, prixMoyen:4200, nbVentes:14, evolution:'+1%' },
    { id:4, nom:'Nice Cimiez', ville:'Nice', priorite:'basse', nbImmeubles:22, turnoverRate:3.8, prixMoyen:5500, nbVentes:8, evolution:'-2%' },
    { id:5, nom:'Paris 18e - Montmartre', ville:'Paris', priorite:'moyenne', nbImmeubles:60, turnoverRate:7.0, prixMoyen:8500, nbVentes:42, evolution:'+4%' },
  ],
  immeubles: [
    { id:1, adresse:'12-18 rue de France, Nice', secteurId:1, nbLots:24, syndic:'Foncia Nice', immatriculation:'AA-0012345', ascenseur:true, parking:true, piscine:false, gardien:true, derniereAG:'2026-01-15', travauxPrevus:'Ravalement façade 2027', cadastre:'Section AB, parcelle 123, 850m²', plu:'Zone UA', residents:[
      { id:1, nom:'Mme Rossi', etage:3, statut:'proprietaire' },
      { id:2, nom:'M. Ferrara', etage:4, statut:'locataire' },
      { id:3, nom:'Mme Blanc', etage:2, statut:'proprietaire' },
      { id:4, nom:'M. Chen', etage:5, statut:'proprietaire' },
    ]},
    { id:2, adresse:'24-30 bd Gambetta, Nice', secteurId:3, nbLots:36, syndic:'Nexity Lamy', immatriculation:'AA-0067890', ascenseur:true, parking:false, piscine:false, gardien:false, derniereAG:'2025-11-20', travauxPrevus:'Remplacement chaudière collective', cadastre:'Section CD, parcelle 456, 1200m²', plu:'Zone UB', residents:[
      { id:5, nom:'M. Lambert', etage:2, statut:'proprietaire' },
      { id:6, nom:'Mme Dubois', etage:5, statut:'locataire' },
    ]},
  ],
  activites: [
    { id:1, date:'2026-04-04', type:'porte-a-porte', agent:'Vassili B.', detail:'Prospection rue de France — 4 contacts', resultat:'1 intéressé, 1 à rappeler' },
    { id:2, date:'2026-04-02', type:'phoning', agent:'Vassili B.', detail:'Phoning Libération — 2 contacts', resultat:'1 estimation demandée' },
    { id:3, date:'2026-03-28', type:'boitage', agent:'Vassili B.', detail:'Boîtage Gambetta — 50 flyers', resultat:'3 retours' },
    { id:4, date:'2026-03-25', type:'porte-a-porte', agent:'Vassili B.', detail:'Prospection Cimiez — 6 contacts', resultat:'0 intéressé' },
    { id:5, date:'2026-03-20', type:'phoning', agent:'Vassili B.', detail:'Phoning Nice Centre — 8 contacts', resultat:'2 estimations' },
  ],
};

const prioriteColors = { haute:L.red, moyenne:L.orange, basse:L.green };
const statutColors = { interesse:L.green, refus:L.red, absent:L.textLight, rappeler:L.orange };

export default function ProspectionModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('terrain');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedImmeuble, setSelectedImmeuble] = useState(null);

  const prospection = data.prospection || DEFAULT_PROSPECTION;
  const ensure = () => { if(!data.prospection) setData(d=>({...d, prospection:DEFAULT_PROSPECTION})); };
  if(!data.prospection) ensure();

  const sessions = prospection.sessions || [];
  const secteurs = prospection.secteurs || [];
  const immeubles = prospection.immeubles || [];
  const activites = prospection.activites || [];

  const totalContacts = sessions.reduce((s,sess)=>s+sess.contacts.length,0);
  const totalInteresses = sessions.reduce((s,sess)=>s+sess.contacts.filter(c=>c.statut==='interesse').length,0);
  const conversionRate = totalContacts>0?Math.round(totalInteresses/totalContacts*100):0;

  const addSession = () => {
    const sess = { id:genId(), date:form.date||new Date().toISOString().slice(0,10), secteur:form.secteur||'', type:form.type||'porte-a-porte', agent:'Vassili B.', contacts:[] };
    setData(d=>({...d, prospection:{...prospection, sessions:[sess,...sessions]}}));
    setModal(null); setForm({}); showToast('Session créée');
  };

  const addContactToSession = (sessionId) => {
    const contact = { id:genId(), nom:form.nom||'', adresse:form.adresse||'', statut:form.statut||'interesse', note:form.note||'', tel:form.tel||'' };
    setData(d=>({...d, prospection:{...prospection, sessions:sessions.map(s=>s.id===sessionId?{...s,contacts:[...s.contacts,contact]}:s)}}));
    setModal(null); setForm({}); showToast('Contact ajouté · Remerciement envoyé (simulé)');
  };

  return (
    <div>
      <div style={{ display:'flex', gap:0, marginBottom:16, borderBottom:`1px solid ${L.border}` }}>
        {[{id:'terrain',label:'Terrain'},{id:'secteurs',label:'Secteurs & Îlots'},{id:'immeubles',label:'Immeubles'},{id:'geoloc',label:'Géolocalisation'},{id:'activites',label:'Activités'}].map(t=>(
          <button key={t.id} onClick={()=>{setSub(t.id);setSelectedSession(null);setSelectedImmeuble(null);}} style={{ padding:'8px 16px', background:'none', border:'none', borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`, fontSize:12, fontWeight:sub===t.id?700:400, color:sub===t.id?L.text:L.textSec, cursor:'pointer', fontFamily:L.font }}>{t.label}</button>
        ))}
      </div>

      {/* ══ TERRAIN ══ */}
      {sub==='terrain' && !selectedSession && <>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>Prospection terrain ({sessions.length} sessions)</h2>
          <button onClick={()=>{setForm({type:'porte-a-porte'});setModal({type:'addSession'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Nouvelle session</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
          {[{l:'Sessions',v:sessions.length,c:L.blue},{l:'Contacts',v:totalContacts,c:L.gold},{l:'Intéressés',v:totalInteresses,c:L.green},{l:'Taux conversion',v:`${conversionRate}%`,c:conversionRate>20?L.green:L.orange}].map(k=>(
            <div key={k.l} style={{...CARD,position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:2,background:k.c}}/><div style={{fontSize:10,color:L.textLight,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{k.l}</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{k.v}</div></div>
          ))}
        </div>
        {sessions.map(sess=>{
          const nbPos = sess.contacts.filter(c=>c.statut==='interesse').length;
          return <div key={sess.id} onClick={()=>setSelectedSession(sess)} style={{...CARD, marginBottom:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'all .15s'}} onMouseEnter={e=>e.currentTarget.style.borderColor=L.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>
            <div>
              <div style={{fontSize:14,fontWeight:700}}>{sess.secteur} — {sess.type}</div>
              <div style={{fontSize:12,color:L.textSec}}>{sess.date} · {sess.agent} · {sess.contacts.length} contacts</div>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:600,color:L.green,background:L.greenBg,padding:'3px 10px'}}>{nbPos} intéressé{nbPos>1?'s':''}</span>
              <span style={{fontSize:13,color:L.textLight}}>→</span>
            </div>
          </div>;
        })}
      </>}

      {sub==='terrain' && selectedSession && (()=>{
        const sess = sessions.find(s=>s.id===selectedSession.id)||selectedSession;
        return <>
          <button onClick={()=>setSelectedSession(null)} style={{...BTN_OUTLINE,fontSize:11,marginBottom:12}}>← Retour</button>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h2 style={{fontSize:18,fontWeight:800,margin:0}}>{sess.secteur} — {sess.type} ({sess.date})</h2>
            <button onClick={()=>{setForm({});setModal({type:'addContact',sessionId:sess.id});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Ajouter contact</button>
          </div>
          <div style={{...CARD,padding:0}}>
            {sess.contacts.map((c,i)=>(
              <div key={c.id} style={{padding:'12px 18px',borderBottom:i<sess.contacts.length-1?`1px solid ${L.border}`:'none',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:statutColors[c.statut]||L.textLight,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700}}>{c.nom}</div>
                  <div style={{fontSize:12,color:L.textSec}}>{c.adresse}</div>
                  {c.note && <div style={{fontSize:11,color:L.textLight,fontStyle:'italic'}}>{c.note}</div>}
                </div>
                <span style={{fontSize:10,fontWeight:600,color:statutColors[c.statut],background:`${statutColors[c.statut]}15`,padding:'3px 8px'}}>{c.statut}</span>
                <div style={{display:'flex',gap:4}}>
                  <button onClick={()=>showToast('Transféré en estimation')} style={{...BTN_OUTLINE,fontSize:9,padding:'3px 8px'}}>→ Estimation</button>
                  <button onClick={()=>showToast('Fiche acquéreur créée')} style={{...BTN_OUTLINE,fontSize:9,padding:'3px 8px'}}>→ Acquéreur</button>
                </div>
              </div>
            ))}
            {sess.contacts.length===0 && <div style={{padding:24,textAlign:'center',color:L.textLight}}>Aucun contact dans cette session</div>}
          </div>
        </>;
      })()}

      {/* ══ SECTEURS ══ */}
      {sub==='secteurs' && <>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h2 style={{fontSize:18,fontWeight:800,margin:0}}>Secteurs & Îlots ({secteurs.length})</h2>
          <button onClick={()=>{setForm({priorite:'moyenne'});setModal({type:'addSecteur'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Ajouter secteur</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12,marginBottom:20}}>
          {secteurs.map(s=>(
            <div key={s.id} style={{...CARD,borderLeft:`4px solid ${prioriteColors[s.priorite]}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div><div style={{fontSize:15,fontWeight:700}}>{s.nom}</div><div style={{fontSize:12,color:L.textSec}}>{s.ville}</div></div>
                <span style={{fontSize:10,fontWeight:700,color:prioriteColors[s.priorite],background:`${prioriteColors[s.priorite]}12`,padding:'3px 8px'}}>{s.priorite}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:12}}>
                <div><span style={{color:L.textSec}}>Immeubles:</span> <strong>{s.nbImmeubles}</strong></div>
                <div><span style={{color:L.textSec}}>Turnover:</span> <strong style={{color:L.gold}}>{s.turnoverRate}%</strong></div>
                <div><span style={{color:L.textSec}}>Prix moy.:</span> <strong>{s.prixMoyen}€/m²</strong></div>
                <div><span style={{color:L.textSec}}>Ventes/an:</span> <strong>{s.nbVentes}</strong></div>
              </div>
              <div style={{fontSize:11,color:s.evolution?.startsWith('+')?L.green:L.red,fontWeight:600,marginTop:6}}>Évolution: {s.evolution}</div>
            </div>
          ))}
        </div>
        <div style={CARD}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Turnover par secteur</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:12,height:140}}>
            {secteurs.map(s=>{
              const max = Math.max(...secteurs.map(x=>x.turnoverRate))||1;
              return <div key={s.id} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{fontSize:10,fontWeight:700,color:L.gold}}>{s.turnoverRate}%</div>
                <div style={{width:'100%',background:prioriteColors[s.priorite],borderRadius:'3px 3px 0 0',height:Math.max(8,s.turnoverRate/max*100),opacity:0.7,transition:'height .4s'}}/>
                <div style={{fontSize:10,color:L.textSec,textAlign:'center'}}>{s.nom.split(' ').slice(-1)[0]}</div>
              </div>;
            })}
          </div>
        </div>
      </>}

      {/* ══ IMMEUBLES ══ */}
      {sub==='immeubles' && !selectedImmeuble && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Immeubles ({immeubles.length})</h2>
        {immeubles.map(imm=>(
          <div key={imm.id} onClick={()=>setSelectedImmeuble(imm)} style={{...CARD,marginBottom:8,cursor:'pointer',transition:'all .15s'}} onMouseEnter={e=>e.currentTarget.style.borderColor=L.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>{imm.adresse}</div>
                <div style={{fontSize:12,color:L.textSec}}>{imm.nbLots} lots · Syndic: {imm.syndic}</div>
              </div>
              <div style={{display:'flex',gap:4}}>
                {imm.ascenseur && <span style={{fontSize:10,padding:'2px 6px',background:L.cream,border:`1px solid ${L.border}`}}>Ascenseur</span>}
                {imm.parking && <span style={{fontSize:10,padding:'2px 6px',background:L.cream,border:`1px solid ${L.border}`}}>Parking</span>}
                {imm.gardien && <span style={{fontSize:10,padding:'2px 6px',background:L.cream,border:`1px solid ${L.border}`}}>Gardien</span>}
              </div>
            </div>
          </div>
        ))}
      </>}

      {sub==='immeubles' && selectedImmeuble && (()=>{
        const imm = immeubles.find(i=>i.id===selectedImmeuble.id)||selectedImmeuble;
        return <>
          <button onClick={()=>setSelectedImmeuble(null)} style={{...BTN_OUTLINE,fontSize:11,marginBottom:12}}>← Retour</button>
          <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>{imm.adresse}</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            <div style={CARD}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Informations immeuble</div>
              <div style={{fontSize:13,display:'flex',flexDirection:'column',gap:6}}>
                <div><strong>Lots:</strong> {imm.nbLots}</div>
                <div><strong>Syndic:</strong> {imm.syndic}</div>
                <div><strong>Immatriculation:</strong> {imm.immatriculation}</div>
                <div><strong>Dernière AG:</strong> {imm.derniereAG}</div>
                <div><strong>Travaux prévus:</strong> {imm.travauxPrevus}</div>
              </div>
            </div>
            <div style={CARD}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Cadastre & Urbanisme</div>
              <div style={{fontSize:13,display:'flex',flexDirection:'column',gap:6}}>
                <div><strong>Cadastre:</strong> {imm.cadastre}</div>
                <div><strong>PLU:</strong> {imm.plu}</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
                  {imm.ascenseur && <span style={{fontSize:10,padding:'3px 8px',background:L.greenBg,color:L.green,fontWeight:600}}>Ascenseur</span>}
                  {imm.parking && <span style={{fontSize:10,padding:'3px 8px',background:L.blueBg,color:L.blue,fontWeight:600}}>Parking</span>}
                  {imm.piscine && <span style={{fontSize:10,padding:'3px 8px',background:L.blueBg,color:L.blue,fontWeight:600}}>Piscine</span>}
                  {imm.gardien && <span style={{fontSize:10,padding:'3px 8px',background:L.orangeBg,color:L.orange,fontWeight:600}}>Gardien</span>}
                </div>
              </div>
            </div>
          </div>
          <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Résidents ({(imm.residents||[]).length})</div>
          <div style={{...CARD,padding:0}}>
            {(imm.residents||[]).map((r,i)=>(
              <div key={r.id} style={{padding:'10px 18px',borderBottom:i<imm.residents.length-1?`1px solid ${L.border}`:'none',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div><span style={{fontSize:13,fontWeight:600}}>{r.nom}</span><span style={{fontSize:12,color:L.textSec,marginLeft:8}}>Étage {r.etage}</span></div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <span style={{fontSize:10,fontWeight:600,color:r.statut==='proprietaire'?L.gold:L.blue,background:r.statut==='proprietaire'?`${L.gold}12`:L.blueBg,padding:'3px 8px'}}>{r.statut}</span>
                  <button onClick={()=>showToast(`Prospection ${r.nom} lancée`)} style={{...BTN_OUTLINE,fontSize:9,padding:'3px 8px'}}>Prospecter</button>
                </div>
              </div>
            ))}
          </div>
        </>;
      })()}

      {/* ══ GÉOLOCALISATION ══ */}
      {sub==='geoloc' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Géolocalisation & Exploration</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div style={{...CARD,textAlign:'center',padding:40,background:L.cream}}>
            <div style={{fontSize:32,marginBottom:8,opacity:0.3}}>📍</div>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>GPS Agent terrain</div>
            <div style={{fontSize:12,color:L.textSec,marginBottom:12}}>Suivez vos déplacements en temps réel et enregistrez chaque contact sur la carte.</div>
            <button onClick={()=>showToast('GPS activé (simulé)')} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Activer le GPS</button>
          </div>
          <div style={{...CARD,textAlign:'center',padding:40,background:L.cream}}>
            <div style={{fontSize:32,marginBottom:8,opacity:0.3}}>🗺️</div>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Exploration intelligente</div>
            <div style={{fontSize:12,color:L.textSec,marginBottom:12}}>L'algorithme suggère les zones à prospecter en priorité selon le turnover et votre historique.</div>
            <button onClick={()=>showToast('Zone suggérée: Nice Centre - rue de France')} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Suggestion</button>
          </div>
        </div>
        <div style={CARD}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Anciens clients & propriétaires géolocalisés</div>
          {[
            {nom:'Mme Rossi',adresse:'12 rue de France, Nice',type:'prospect',distance:'0.2 km'},
            {nom:'M. Dupont',adresse:'5 av de la Libération, Nice',type:'estimation',distance:'1.5 km'},
            {nom:'M. Martin',adresse:'8 av Jean Médecin, Nice',type:'vendeur',distance:'0.8 km'},
          ].map((c,i)=>(
            <div key={i} style={{padding:'8px 0',borderBottom:`1px solid ${L.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><span style={{fontSize:13,fontWeight:600}}>{c.nom}</span><span style={{fontSize:12,color:L.textSec,marginLeft:8}}>{c.adresse}</span></div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <span style={{fontSize:11,color:L.textLight}}>{c.distance}</span>
                <span style={{fontSize:10,padding:'2px 6px',background:L.cream,border:`1px solid ${L.border}`}}>{c.type}</span>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* ══ ACTIVITÉS ══ */}
      {sub==='activites' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Activités de prospection</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[
            {l:'Cette semaine',v:activites.filter(a=>new Date(a.date)>new Date(Date.now()-7*24*60*60*1000)).length+' actions',c:L.blue},
            {l:'Contacts total',v:totalContacts,c:L.gold},
            {l:'Estimations générées',v:'3',c:L.green},
            {l:'Mandats signés',v:'1',c:'#7C3AED'},
          ].map(k=>(
            <div key={k.l} style={{...CARD,position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:2,background:k.c}}/><div style={{fontSize:10,color:L.textLight,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{k.l}</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{k.v}</div></div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:8}}>
          <button onClick={()=>{
            const rows=[['Date','Type','Agent','Détail','Résultat']];
            activites.forEach(a=>rows.push([a.date,a.type,a.agent,a.detail,a.resultat]));
            const csv=rows.map(r=>r.join(';')).join('\n');
            const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='activites_prospection.csv';a.click();
            showToast('Export CSV');
          }} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 12px'}}>📥 Export CSV</button>
        </div>
        <div style={{...CARD,padding:0}}>
          {activites.map((a,i)=>(
            <div key={a.id} style={{padding:'12px 18px',borderBottom:i<activites.length-1?`1px solid ${L.border}`:'none',display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:a.type==='porte-a-porte'?L.green:a.type==='phoning'?L.blue:L.orange,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600}}>{a.detail}</div>
                <div style={{fontSize:12,color:L.textSec}}>{a.resultat}</div>
              </div>
              <div style={{fontSize:11,color:L.textLight,flexShrink:0}}>{a.date}</div>
            </div>
          ))}
        </div>
      </>}

      {/* ══ MODALS ══ */}
      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setModal(null)}>
          <div style={{background:L.white,width:'100%',maxWidth:460,maxHeight:'80vh',overflowY:'auto',padding:'28px 24px'}} onClick={e=>e.stopPropagation()}>
            {modal.type==='addSession' && <>
              <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 16px'}}>Nouvelle session</h3>
              <div style={{marginBottom:10}}><label style={LBL}>Date</label><input type="date" value={form.date||''} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={INP}/></div>
              <div style={{marginBottom:10}}><label style={LBL}>Secteur</label><input value={form.secteur||''} onChange={e=>setForm(f=>({...f,secteur:e.target.value}))} style={INP} placeholder="Nice Centre..."/></div>
              <div style={{marginBottom:14}}><label style={LBL}>Type</label><select value={form.type||'porte-a-porte'} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={INP}><option value="porte-a-porte">Porte-à-porte</option><option value="phoning">Phoning</option><option value="boitage">Boîtage</option></select></div>
              <button onClick={addSession} style={{...BTN,width:'100%',padding:'12px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Créer</button>
            </>}
            {modal.type==='addContact' && <>
              <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 16px'}}>Ajouter un contact</h3>
              <div style={{marginBottom:10}}><label style={LBL}>Nom</label><input value={form.nom||''} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} style={INP}/></div>
              <div style={{marginBottom:10}}><label style={LBL}>Adresse</label><input value={form.adresse||''} onChange={e=>setForm(f=>({...f,adresse:e.target.value}))} style={INP}/></div>
              <div style={{marginBottom:10}}><label style={LBL}>Téléphone</label><input value={form.tel||''} onChange={e=>setForm(f=>({...f,tel:e.target.value}))} style={INP}/></div>
              <div style={{marginBottom:10}}><label style={LBL}>Statut</label><select value={form.statut||'interesse'} onChange={e=>setForm(f=>({...f,statut:e.target.value}))} style={INP}><option value="interesse">Intéressé</option><option value="refus">Refus</option><option value="absent">Absent</option><option value="rappeler">À rappeler</option></select></div>
              <div style={{marginBottom:14}}><label style={LBL}>Note</label><textarea value={form.note||''} onChange={e=>setForm(f=>({...f,note:e.target.value}))} rows={2} style={{...INP,resize:'vertical'}}/></div>
              <button onClick={()=>addContactToSession(modal.sessionId)} style={{...BTN,width:'100%',padding:'12px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Ajouter</button>
            </>}
            {modal.type==='addSecteur' && <>
              <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 16px'}}>Nouveau secteur</h3>
              <div style={{marginBottom:10}}><label style={LBL}>Nom</label><input value={form.nom||''} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} style={INP}/></div>
              <div style={{marginBottom:10}}><label style={LBL}>Ville</label><input value={form.ville||''} onChange={e=>setForm(f=>({...f,ville:e.target.value}))} style={INP}/></div>
              <div style={{marginBottom:14}}><label style={LBL}>Priorité</label><select value={form.priorite||'moyenne'} onChange={e=>setForm(f=>({...f,priorite:e.target.value}))} style={INP}><option value="haute">Haute</option><option value="moyenne">Moyenne</option><option value="basse">Basse</option></select></div>
              <button onClick={()=>{
                const s={id:genId(),nom:form.nom||'',ville:form.ville||'',priorite:form.priorite||'moyenne',nbImmeubles:0,turnoverRate:0,prixMoyen:0,nbVentes:0,evolution:'0%'};
                setData(d=>({...d,prospection:{...prospection,secteurs:[...secteurs,s]}}));
                setModal(null);setForm({});showToast('Secteur ajouté');
              }} style={{...BTN,width:'100%',padding:'12px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Ajouter</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
