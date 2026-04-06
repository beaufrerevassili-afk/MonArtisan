import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const DEFAULT_AUTOMATIONS = [
  {id:1,cat:'Prospection',titre:'Remerciement après contact',desc:'Email de remerciement envoyé automatiquement après chaque nouveau contact de prospection',trigger:'Nouveau contact prospection',action:'Envoi email',active:true,nb:45},
  {id:2,cat:'Prospection',titre:'Relance prospect J+7',desc:'Relance automatique 7 jours après le premier contact si pas de retour',trigger:'7j sans réponse',action:'Envoi email',active:true,nb:32},
  {id:3,cat:'Prospection',titre:'Relance prospect J+30',desc:'Seconde relance 30 jours après le premier contact',trigger:'30j sans réponse',action:'Envoi email',active:true,nb:18},
  {id:4,cat:'Prospection',titre:'Alerte nouveau prospect chaud',desc:'Notification push quand un prospect obtient un score >70',trigger:'Score lead >70',action:'Notification push',active:true,nb:12},
  {id:5,cat:'Estimation',titre:'Suivi estimation sans suite',desc:'Relance automatique des estimations restées sans suite après 14 jours',trigger:'14j sans suite',action:'Envoi email',active:true,nb:8},
  {id:6,cat:'Estimation',titre:'Rappel estimation en cours',desc:'Rappel au conseiller si estimation en cours depuis plus de 7 jours',trigger:'7j en cours',action:'Notification interne',active:true,nb:5},
  {id:7,cat:'Estimation',titre:'Relance estimation terminée',desc:'Proposition de mandat 3 jours après estimation terminée',trigger:'3j après estimation',action:'Envoi email',active:false,nb:0},
  {id:8,cat:'Mandat',titre:'Renouvellement mandat',desc:'Alerte 30 jours avant expiration du mandat',trigger:'30j avant expiration',action:'Email + notification',active:true,nb:3},
  {id:9,cat:'Mandat',titre:'Relance mandant hebdomadaire',desc:'Rapport automatique envoyé chaque lundi au mandant',trigger:'Chaque lundi',action:'Envoi email rapport',active:true,nb:24},
  {id:10,cat:'Mandat',titre:'Rapport hebdo mandant',desc:'Statistiques de consultation et visites envoyées au propriétaire',trigger:'Hebdomadaire',action:'Email rapport',active:true,nb:24},
  {id:11,cat:'Mandat',titre:'Alerte expiration mandat',desc:'Notification 7 jours avant fin de mandat',trigger:'7j avant fin',action:'Notification',active:true,nb:2},
  {id:12,cat:'Acquéreur',titre:'Nouveau bien correspondant',desc:'Notification automatique quand un bien correspond aux critères de l\'acquéreur',trigger:'Nouveau bien match',action:'Email + SMS',active:true,nb:28},
  {id:13,cat:'Acquéreur',titre:'Relance acquéreur inactif',desc:'Relance si pas d\'activité depuis 21 jours',trigger:'21j inactif',action:'Envoi email',active:true,nb:15},
  {id:14,cat:'Acquéreur',titre:'Anniversaire de recherche',desc:'Message personnalisé 3 mois après le début de la recherche',trigger:'90j recherche',action:'Email',active:false,nb:0},
  {id:15,cat:'Visite',titre:'Confirmation visite J-1',desc:'Rappel automatique la veille de chaque visite',trigger:'Veille visite',action:'SMS + email',active:true,nb:42},
  {id:16,cat:'Visite',titre:'Compte rendu post-visite',desc:'Demande de feedback envoyée 2h après la visite',trigger:'2h après visite',action:'Email',active:true,nb:38},
  {id:17,cat:'Visite',titre:'Relance après visite',desc:'Relance acquéreur 3 jours après une visite sans retour',trigger:'3j sans retour',action:'Email',active:true,nb:22},
  {id:18,cat:'Vente',titre:'Suivi conditions suspensives',desc:'Rappels automatiques pour chaque condition suspensive du compromis',trigger:'Échéances CS',action:'Notification',active:true,nb:6},
  {id:19,cat:'Vente',titre:'Rappel acte authentique',desc:'Notification 7 jours avant la date de l\'acte chez le notaire',trigger:'7j avant acte',action:'Email + SMS',active:true,nb:1},
  {id:20,cat:'Vente',titre:'Notification étapes vente',desc:'Notification à chaque changement d\'étape dans le pipeline',trigger:'Changement étape',action:'Email parties',active:true,nb:18},
  {id:21,cat:'Vente',titre:'Félicitations post-acte',desc:'Email de félicitations envoyé le jour de la signature de l\'acte',trigger:'Jour acte',action:'Email',active:true,nb:2},
  {id:22,cat:'Location',titre:'Appel de loyer automatique',desc:'Appel de loyer envoyé le 1er de chaque mois',trigger:'1er du mois',action:'Email',active:true,nb:48},
  {id:23,cat:'Location',titre:'Relance impayé J+5',desc:'Relance amiable si loyer non reçu après 5 jours',trigger:'5j impayé',action:'Email',active:true,nb:8},
  {id:24,cat:'Location',titre:'Relance impayé J+15',desc:'Relance formelle si loyer toujours impayé après 15 jours',trigger:'15j impayé',action:'Email + courrier',active:true,nb:3},
  {id:25,cat:'Location',titre:'Renouvellement bail',desc:'Notification 6 mois avant fin de bail',trigger:'6 mois avant fin',action:'Email + notification',active:true,nb:2},
  {id:26,cat:'Location',titre:'Quittance automatique',desc:'Génération et envoi de quittance à chaque loyer reçu',trigger:'Loyer encaissé',action:'PDF + email',active:true,nb:48},
  {id:27,cat:'Location',titre:'Anniversaire entrée locataire',desc:'Message au locataire pour son anniversaire d\'entrée',trigger:'Anniversaire bail',action:'Email',active:false,nb:0},
  {id:28,cat:'Communication',titre:'Vœux nouvelle année',desc:'Email de vœux envoyé le 1er janvier à tous les contacts',trigger:'1er janvier',action:'Email',active:true,nb:380},
  {id:29,cat:'Communication',titre:'Anniversaire client',desc:'Message personnalisé envoyé le jour de l\'anniversaire',trigger:'Date anniversaire',action:'Email',active:true,nb:25},
  {id:30,cat:'Communication',titre:'Campagne saisonnière été',desc:'Campagne email ciblée pour les investisseurs en période estivale',trigger:'1er juin',action:'Email campagne',active:false,nb:0},
  {id:31,cat:'Communication',titre:'Newsletter mensuelle',desc:'Envoi automatique de la newsletter marché le 1er du mois',trigger:'1er du mois',action:'Email',active:true,nb:12},
  {id:32,cat:'Communication',titre:'Bienvenue nouveau contact',desc:'Email de bienvenue envoyé à chaque nouveau contact dans le CRM',trigger:'Nouveau contact CRM',action:'Email',active:true,nb:65},
  {id:33,cat:'Prospection',titre:'Suivi boîtage automatique',desc:'Relance des secteurs boîtés après 14 jours sans retour',trigger:'14j après boîtage',action:'Notification',active:false,nb:0},
];

const DEFAULT_LOG = [
  {id:1,automationId:1,date:'2026-04-04 14:30',contact:'Mme Rossi',detail:'Email de remerciement envoyé après prospection rue de France'},
  {id:2,automationId:15,date:'2026-04-06 18:00',contact:'Lucas Garcia',detail:'Rappel visite demain 10h — 8 av Jean Médecin'},
  {id:3,automationId:22,date:'2026-04-01 08:00',contact:'Jean Martin',detail:'Appel de loyer avril — Appt Liberté 850€'},
  {id:4,automationId:12,date:'2026-04-03 10:15',contact:'Thomas Kessler',detail:'Nouveau bien correspondant: T4 rue de la Buffa 520k€'},
  {id:5,automationId:29,date:'2026-04-02 09:00',contact:'Sophie Lefebvre',detail:'Joyeux anniversaire — message personnalisé'},
  {id:6,automationId:9,date:'2026-04-01 09:00',contact:'Philippe Martin',detail:'Rapport hebdomadaire mandat MAN-2026-001 envoyé'},
];

const catColors = {Prospection:L.blue,Estimation:L.orange,Mandat:L.gold,Acquéreur:'#7C3AED',Visite:'#14B8A6',Vente:L.green,Location:'#EC4899',Communication:L.textSec};

export default function AutomationsModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('list');
  const [filterCat, setFilterCat] = useState('');

  const automations = data.automations || DEFAULT_AUTOMATIONS;
  const log = data.automationsLog || DEFAULT_LOG;
  if(!data.automations) setData(d=>({...d, automations:DEFAULT_AUTOMATIONS, automationsLog:DEFAULT_LOG}));

  const actives = automations.filter(a=>a.active);
  const totalDeclenchements = automations.reduce((s,a)=>s+a.nb,0);
  const categories = [...new Set(automations.map(a=>a.cat))];
  const filtered = filterCat ? automations.filter(a=>a.cat===filterCat) : automations;

  const toggle = (id) => {
    setData(d=>({...d, automations:(d.automations||DEFAULT_AUTOMATIONS).map(a=>a.id===id?{...a,active:!a.active}:a)}));
  };

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'list',label:`Automatisations (${automations.length})`},{id:'journal',label:'Journal'}].map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {sub==='list' && <>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
          {[{l:'Actives',v:`${actives.length}/${automations.length}`,c:L.green},{l:'Déclenchements total',v:totalDeclenchements,c:L.gold},{l:'Cette semaine',v:log.length,c:L.blue}].map(k=>(
            <div key={k.l} style={{...CARD,position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:2,background:k.c}}/><div style={{fontSize:10,color:L.textLight,textTransform:'uppercase',marginBottom:4}}>{k.l}</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{k.v}</div></div>
          ))}
        </div>
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          <span onClick={()=>setFilterCat('')} style={{padding:'4px 10px',fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${!filterCat?L.noir:L.border}`,color:!filterCat?L.text:L.textSec}}>Toutes</span>
          {categories.map(cat=>(
            <span key={cat} onClick={()=>setFilterCat(filterCat===cat?'':cat)} style={{padding:'4px 10px',fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${filterCat===cat?catColors[cat]:L.border}`,color:filterCat===cat?catColors[cat]:L.textSec}}>{cat}</span>
          ))}
        </div>
        {filtered.map(a=>(
          <div key={a.id} style={{...CARD,marginBottom:4,padding:'12px 18px',display:'flex',alignItems:'center',gap:12,opacity:a.active?1:0.5}}>
            <div onClick={()=>toggle(a.id)} style={{width:40,height:22,borderRadius:11,background:a.active?L.green:L.border,cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
              <div style={{width:18,height:18,borderRadius:9,background:'#fff',position:'absolute',top:2,left:a.active?20:2,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,0.15)'}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:13,fontWeight:700}}>{a.titre}</span>
                <span style={{fontSize:10,color:catColors[a.cat],fontWeight:600}}>{a.cat}</span>
              </div>
              <div style={{fontSize:11,color:L.textSec}}>{a.desc}</div>
              <div style={{fontSize:10,color:L.textLight,marginTop:2}}>Trigger: {a.trigger} → {a.action}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:14,fontWeight:200,fontFamily:L.serif,color:a.nb>0?L.gold:L.textLight}}>{a.nb}</div>
              <div style={{fontSize:9,color:L.textLight}}>déclenchements</div>
            </div>
          </div>
        ))}
      </>}

      {sub==='journal' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Journal des automatisations</h2>
        <div style={{...CARD,padding:0}}>
          {log.map((entry,i)=>{
            const auto = automations.find(a=>a.id===entry.automationId);
            return <div key={entry.id} style={{padding:'12px 18px',borderBottom:i<log.length-1?`1px solid ${L.border}`:'none',display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:auto?catColors[auto.cat]:L.textLight,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13}}><strong>{auto?.titre||'—'}</strong> → {entry.contact}</div>
                <div style={{fontSize:11,color:L.textSec}}>{entry.detail}</div>
              </div>
              <div style={{fontSize:11,color:L.textLight,flexShrink:0}}>{entry.date}</div>
            </div>;
          })}
        </div>
      </>}
    </div>
  );
}
