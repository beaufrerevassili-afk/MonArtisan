import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const LBL = { fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const typeColors = { visite:L.gold, estimation:L.orange, rdv:L.blue, signature:L.green, prospection:'#7C3AED', reunion:L.textSec };

function getWeekDates() {
  const now = new Date(); const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return Array.from({length:7},(_,i)=>{ const d=new Date(now); d.setDate(diff+i); return d.toISOString().slice(0,10); });
}

const weekDates = getWeekDates();

const DEFAULT_AGENDA = [
  { id:1, titre:'Visite Garcia — Médecin', date:weekDates[0], heure:'10:00', duree:30, type:'visite', agent:'Vassili B.', notes:'T2 Jean Médecin' },
  { id:2, titre:'Visite Kessler — Rossini', date:weekDates[0], heure:'11:00', duree:30, type:'visite', agent:'Vassili B.', notes:'' },
  { id:3, titre:'Estimation bd Victor Hugo', date:weekDates[1], heure:'09:30', duree:60, type:'estimation', agent:'Vassili B.', notes:'T3 75m²' },
  { id:4, titre:'RDV notaire Me Moreau', date:weekDates[2], heure:'14:00', duree:60, type:'rdv', agent:'Vassili B.', notes:'Compromis Voltaire' },
  { id:5, titre:'Signature mandat Martin', date:weekDates[2], heure:'16:00', duree:30, type:'signature', agent:'Vassili B.', notes:'Mandat exclusif' },
  { id:6, titre:'Prospection Nice Centre', date:weekDates[3], heure:'09:00', duree:120, type:'prospection', agent:'Vassili B.', notes:'Rue de France + Pastorelli' },
  { id:7, titre:'Réunion équipe hebdo', date:weekDates[4], heure:'09:00', duree:60, type:'reunion', agent:'Toute l\'équipe', notes:'Bilan semaine' },
  { id:8, titre:'Visite Lefebvre — Pastorelli', date:weekDates[4], heure:'14:30', duree:45, type:'visite', agent:'Vassili B.', notes:'' },
];

export default function AgendaImmoModule({ data, setData, showToast, genId }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const agenda = data.agendaImmo || DEFAULT_AGENDA;
  if(!data.agendaImmo) setData(d=>({...d, agendaImmo:DEFAULT_AGENDA}));

  const addEvent = () => {
    const ev = { id:genId(), titre:form.titre||'', date:form.date||weekDates[0], heure:form.heure||'10:00', duree:Number(form.duree)||30, type:form.type||'rdv', agent:'Vassili B.', notes:form.notes||'' };
    setData(d=>({...d, agendaImmo:[...(d.agendaImmo||DEFAULT_AGENDA), ev]}));
    setModal(null); setForm({}); showToast('Événement ajouté · Rappel programmé');
  };

  const deleteEvent = (id) => {
    setData(d=>({...d, agendaImmo:(d.agendaImmo||[]).filter(e=>e.id!==id)}));
    showToast('Événement supprimé');
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h2 style={{fontSize:18,fontWeight:800,margin:0}}>Agenda — Semaine en cours</h2>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>showToast('Synchronisation Google Calendar (simulé)')} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 12px'}}>🔄 Sync</button>
          <button onClick={()=>{setForm({type:'rdv'});setModal({type:'add'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Événement</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1,background:L.border,marginBottom:16}}>
        {weekDates.map((date,i)=>{
          const events = agenda.filter(e=>e.date===date).sort((a,b)=>a.heure.localeCompare(b.heure));
          const isToday = date === new Date().toISOString().slice(0,10);
          return <div key={date} style={{background:L.white,minHeight:200}}>
            <div style={{padding:'8px 10px',borderBottom:`1px solid ${L.border}`,background:isToday?L.noir:L.cream,textAlign:'center'}}>
              <div style={{fontSize:10,fontWeight:700,color:isToday?L.gold:L.textSec,textTransform:'uppercase'}}>{JOURS[i]}</div>
              <div style={{fontSize:16,fontWeight:isToday?800:200,color:isToday?'#fff':L.text,fontFamily:L.serif}}>{parseInt(date.split('-')[2])}</div>
            </div>
            <div style={{padding:'4px'}}>
              {events.map(ev=>(
                <div key={ev.id} style={{padding:'6px 8px',marginBottom:3,background:`${typeColors[ev.type]}10`,borderLeft:`3px solid ${typeColors[ev.type]}`,cursor:'pointer',transition:'all .1s'}} onClick={()=>deleteEvent(ev.id)} title="Cliquer pour supprimer">
                  <div style={{fontSize:10,fontWeight:700,color:typeColors[ev.type]}}>{ev.heure} ({ev.duree}min)</div>
                  <div style={{fontSize:11,fontWeight:600,color:L.text}}>{ev.titre}</div>
                </div>
              ))}
            </div>
          </div>;
        })}
      </div>

      <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:16}}>
        {Object.entries(typeColors).map(([type,color])=>(
          <span key={type} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:L.textSec}}>
            <div style={{width:10,height:10,background:color,borderRadius:2}}/>{type}
          </span>
        ))}
      </div>

      <div style={CARD}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Résumé de la semaine</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10}}>
          {Object.entries(typeColors).map(([type,color])=>{
            const count = agenda.filter(e=>weekDates.includes(e.date)&&e.type===type).length;
            return <div key={type} style={{textAlign:'center',padding:'8px',background:L.cream}}>
              <div style={{fontSize:18,fontWeight:200,fontFamily:L.serif,color}}>{count}</div>
              <div style={{fontSize:10,color:L.textSec}}>{type}</div>
            </div>;
          })}
        </div>
      </div>

      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setModal(null)}>
          <div style={{background:L.white,width:'100%',maxWidth:420,padding:'28px 24px'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 16px'}}>Nouvel événement</h3>
            <div style={{marginBottom:10}}><label style={LBL}>Titre</label><input value={form.titre||''} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} style={INP}/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div><label style={LBL}>Date</label><input type="date" value={form.date||weekDates[0]} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={INP}/></div>
              <div><label style={LBL}>Heure</label><input type="time" value={form.heure||'10:00'} onChange={e=>setForm(f=>({...f,heure:e.target.value}))} style={INP}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div><label style={LBL}>Type</label><select value={form.type||'rdv'} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={INP}>{Object.keys(typeColors).map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              <div><label style={LBL}>Durée (min)</label><input type="number" value={form.duree||'30'} onChange={e=>setForm(f=>({...f,duree:e.target.value}))} style={INP}/></div>
            </div>
            <div style={{marginBottom:14}}><label style={LBL}>Notes</label><input value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={INP}/></div>
            <button onClick={addEvent} style={{...BTN,width:'100%',padding:'12px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Ajouter</button>
          </div>
        </div>
      )}
    </div>
  );
}
