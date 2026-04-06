import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const statutColors = { disponible:L.green, sorti:L.orange, perdu:L.red };

const DEFAULT_CLES = [
  { id:1, numero:'CLE-001', bien:'8 av Jean Médecin, Nice', emplacement:'Tiroir A1', detenteur:null, dateSortie:null, dateRetour:null, statut:'disponible', photo:false, mouvements:[{date:'2026-04-04',action:'Retour',personne:'Vassili B.'}] },
  { id:2, numero:'CLE-002', bien:'3 rue Rossini, Nice', emplacement:'Tiroir A2', detenteur:'Vassili B.', dateSortie:'2026-04-06', dateRetour:null, statut:'sorti', photo:true, mouvements:[{date:'2026-04-06',action:'Sortie',personne:'Vassili B.'},{date:'2026-04-03',action:'Retour',personne:'Vassili B.'}] },
  { id:3, numero:'CLE-003', bien:'24 rue Pastorelli, Nice', emplacement:'Tiroir A3', detenteur:'Lucas Garcia', dateSortie:'2026-04-07', dateRetour:null, statut:'sorti', photo:true, mouvements:[{date:'2026-04-07',action:'Sortie visite',personne:'Lucas Garcia'}] },
  { id:4, numero:'CLE-004', bien:'15 bd Victor Hugo, Nice', emplacement:'Tiroir B1', detenteur:null, dateSortie:null, dateRetour:null, statut:'disponible', photo:false, mouvements:[] },
  { id:5, numero:'CLE-005', bien:'42 bd Voltaire, Paris 11e', emplacement:'Tiroir B2', detenteur:null, dateSortie:null, dateRetour:null, statut:'disponible', photo:false, mouvements:[{date:'2026-03-28',action:'Retour post-compromis',personne:'Emma Faure'}] },
  { id:6, numero:'CLE-006', bien:'15 rue Lepic, Paris 18e', emplacement:'Tiroir B3', detenteur:'Thomas Kessler', dateSortie:'2026-04-05', dateRetour:null, statut:'sorti', photo:false, mouvements:[{date:'2026-04-05',action:'Sortie visite',personne:'Thomas Kessler'}] },
];

export default function ClesModule({ data, setData, showToast, genId }) {
  const cles = data.cles || DEFAULT_CLES;
  if(!data.cles) setData(d=>({...d, cles:DEFAULT_CLES}));

  const checkOut = (id) => {
    const nom = prompt('Nom du détenteur:');
    if(!nom) return;
    setData(d=>({...d, cles:(d.cles||[]).map(c=>c.id===id?{...c,statut:'sorti',detenteur:nom,dateSortie:new Date().toISOString().slice(0,10),mouvements:[{date:new Date().toISOString().slice(0,10),action:'Sortie',personne:nom},...c.mouvements]}:c)}));
    showToast('Clé sortie · Signature enregistrée');
  };

  const checkIn = (id) => {
    setData(d=>({...d, cles:(d.cles||[]).map(c=>c.id===id?{...c,statut:'disponible',detenteur:null,dateRetour:new Date().toISOString().slice(0,10),mouvements:[{date:new Date().toISOString().slice(0,10),action:'Retour',personne:c.detenteur||''},...c.mouvements]}:c)}));
    showToast('Clé retournée');
  };

  const disponibles = cles.filter(c=>c.statut==='disponible').length;
  const sorties = cles.filter(c=>c.statut==='sorti').length;

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h2 style={{fontSize:18,fontWeight:800,margin:0}}>Tableau des clés ({cles.length})</h2>
        <div style={{display:'flex',gap:8}}>
          <span style={{fontSize:12,color:L.green,fontWeight:600}}>{disponibles} disponibles</span>
          <span style={{fontSize:12,color:L.orange,fontWeight:600}}>{sorties} sorties</span>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
        {cles.map(c=>(
          <div key={c.id} style={{...CARD,borderLeft:`4px solid ${statutColors[c.statut]}`,position:'relative'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:L.textLight}}>{c.numero}</div>
                <div style={{fontSize:13,fontWeight:700}}>{c.bien}</div>
              </div>
              <span style={{fontSize:10,fontWeight:600,color:statutColors[c.statut],background:`${statutColors[c.statut]}12`,padding:'3px 8px'}}>{c.statut}</span>
            </div>
            <div style={{fontSize:12,color:L.textSec,marginBottom:8}}>📍 {c.emplacement}</div>
            {c.detenteur && <div style={{fontSize:12,color:L.orange,fontWeight:600,marginBottom:4}}>👤 {c.detenteur} · Depuis {c.dateSortie}</div>}
            {c.photo && <span style={{fontSize:10,color:L.green}}>📷 Photo prise</span>}
            <div style={{display:'flex',gap:4,marginTop:10}}>
              {c.statut==='disponible' && <button onClick={()=>checkOut(c.id)} style={{...BTN,fontSize:10,padding:'5px 12px',background:L.orange}}>🔑 Sortir</button>}
              {c.statut==='sorti' && <button onClick={()=>checkIn(c.id)} style={{...BTN,fontSize:10,padding:'5px 12px',background:L.green}}>↩ Retourner</button>}
              <button onClick={()=>showToast(`Historique: ${c.mouvements.length} mouvements`)} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 10px'}}>Historique ({c.mouvements.length})</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
