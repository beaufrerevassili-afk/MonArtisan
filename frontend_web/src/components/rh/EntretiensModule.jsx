import api from '../../services/api';
import React, { useState, useEffect } from 'react';
import DS from '../../design/luxe';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };

const TYPES = ['Annuel','Professionnel','Individuel','Fin période essai','Retour absence'];
const DEMO = [
  { id:1, employe:'Jean Martin', type:'Annuel', date:'2026-03-15', statut:'realise', objectifs:[{titre:'Obtenir CACES R489',atteint:true},{titre:'Réduire accidents 0',atteint:true},{titre:'Former 1 apprenti',atteint:false}], noteGlobale:4, commentaire:'Bon élément, ponctuel, à former sur le management', prochainEntretien:'2027-03-15' },
  { id:2, employe:'Sophie Duval', type:'Professionnel', date:'2026-02-20', statut:'realise', objectifs:[{titre:'Passer habilitation électrique BR',atteint:true},{titre:'Améliorer communication client',atteint:true}], noteGlobale:5, commentaire:'Excellente progression, promotion envisageable', prochainEntretien:'2028-02-20' },
  { id:3, employe:'Marc Lambert', type:'Annuel', date:'2026-04-20', statut:'planifie', objectifs:[], noteGlobale:0, commentaire:'', prochainEntretien:'' },
  { id:4, employe:'Lucas Garcia', type:'Fin période essai', date:'2026-04-10', statut:'planifie', objectifs:[], noteGlobale:0, commentaire:'', prochainEntretien:'' },
];

const statutColors = { planifie:'#D97706', realise:'#16A34A', annule:'#DC2626' };
const statutLabels = { planifie:'Planifié', realise:'Réalisé', annule:'Annulé' };

export default function EntretiensModule({ employes = [] }) {
  const STORE_E='freample_entretiens'; function loadE(fallback){try{const d=localStorage.getItem(STORE_E);return d?JSON.parse(d):fallback;}catch{return fallback;}}
  const isDemo = localStorage.getItem('token')?.endsWith('.dev');
  const [entretiens, setEntretiens] = useState(() => loadE(isDemo ? DEMO : []));
  useEffect(()=>{localStorage.setItem(STORE_E,JSON.stringify(entretiens));},[entretiens]);
  useEffect(()=>{api.get('/modules/entretiens').then(({data})=>{if(data.entretiens?.length) setEntretiens(data.entretiens);}).catch(()=>{});},[]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [selected, setSelected] = useState(null);

  const planifies = entretiens.filter(e => e.statut === 'planifie');
  const realises = entretiens.filter(e => e.statut === 'realise');

  const ajouter = () => {
    const e = { id: Date.now(), employe: form.employe || '', type: form.type || 'Annuel', date: form.date || '', statut: 'planifie', objectifs: [], noteGlobale: 0, commentaire: '', prochainEntretien: '' };
    setEntretiens(prev => [e, ...prev]);
    setModal(null); setForm({});
  };

  const completer = (id) => {
    setEntretiens(prev => prev.map(e => e.id === id ? { ...e, statut: 'realise', objectifs: form.objectifs || e.objectifs, noteGlobale: Number(form.note) || e.noteGlobale, commentaire: form.commentaire || e.commentaire, prochainEntretien: form.prochainEntretien || '' } : e));
    setModal(null); setForm({}); setSelected(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Entretiens</h2>
        <button onClick={() => { setForm({ type: 'Annuel' }); setModal('add'); }} style={BTN}>+ Planifier entretien</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[{ l: 'Planifiés', v: planifies.length, c: '#D97706' }, { l: 'Réalisés', v: realises.length, c: '#16A34A' }, { l: 'Note moyenne', v: realises.length ? (realises.reduce((s, e) => s + e.noteGlobale, 0) / realises.length).toFixed(1) + '/5' : '—', c: DS.gold }].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Rappel légal */}
      <div style={{ ...CARD, borderLeft: '4px solid #2563EB', marginBottom: 16, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', marginBottom: 4 }}>Obligation légale</div>
        <div style={{ fontSize: 11, color: '#555' }}>L'entretien professionnel est obligatoire tous les 2 ans (Art. L6315-1 du Code du travail). Un bilan à 6 ans doit vérifier que le salarié a bénéficié des entretiens et d'au moins une action de formation.</div>
      </div>

      {planifies.length > 0 && <>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>À venir ({planifies.length})</div>
        {planifies.map(e => (
          <div key={e.id} style={{ ...CARD, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span style={{ fontSize: 14, fontWeight: 700 }}>{e.employe}</span><span style={{ fontSize: 12, color: '#555', marginLeft: 8 }}>{e.type} · {e.date}</span></div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => { setSelected(e); setForm({ objectifs: [], note: '', commentaire: '', prochainEntretien: '' }); setModal('complete'); }} style={{ ...BTN, background: '#16A34A', fontSize: 10, padding: '5px 12px' }}>Compléter</button>
              <button onClick={() => setEntretiens(prev => prev.map(x => x.id === e.id ? { ...x, statut: 'annule' } : x))} style={{ ...BTN_O, fontSize: 10, padding: '5px 10px', color: '#DC2626', borderColor: '#DC262640' }}>Annuler</button>
            </div>
          </div>
        ))}
      </>}

      {realises.length > 0 && <>
        <div style={{ fontSize: 14, fontWeight: 700, margin: '16px 0 8px' }}>Réalisés ({realises.length})</div>
        {realises.map(e => (
          <div key={e.id} style={{ ...CARD, marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div><span style={{ fontSize: 14, fontWeight: 700 }}>{e.employe}</span><span style={{ fontSize: 12, color: '#555', marginLeft: 8 }}>{e.type} · {e.date}</span></div>
              <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3, 4, 5].map(n => <span key={n} style={{ color: n <= e.noteGlobale ? DS.gold : '#E8E6E1', fontSize: 14 }}>★</span>)}</div>
            </div>
            {e.objectifs.length > 0 && <div style={{ marginBottom: 6 }}>{e.objectifs.map((o, i) => (
              <div key={i} style={{ fontSize: 12, display: 'flex', gap: 6, padding: '2px 0' }}>
                <span style={{ color: o.atteint ? '#16A34A' : '#DC2626' }}>{o.atteint ? '✓' : '✗'}</span>
                <span style={{ color: o.atteint ? '#333' : '#555' }}>{o.titre}</span>
              </div>
            ))}</div>}
            {e.commentaire && <div style={{ fontSize: 12, color: '#555', background: '#F8F7F4', padding: '8px 12px', borderRadius: 8, fontStyle: 'italic' }}>{e.commentaire}</div>}
            {e.prochainEntretien && <div style={{ fontSize: 11, color: '#D97706', marginTop: 6 }}>Prochain entretien : {e.prochainEntretien}</div>}
          </div>
        ))}
      </>}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, padding: '28px 24px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            {modal === 'add' && <>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Planifier un entretien</h3>
              <div style={{ marginBottom: 10 }}><label style={LBL}>Employé</label><input value={form.employe || ''} onChange={e => setForm(f => ({ ...f, employe: e.target.value }))} style={INP} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div><label style={LBL}>Type</label><select value={form.type || 'Annuel'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={INP}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label style={LBL}>Date</label><input type="date" value={form.date || ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={INP} /></div>
              </div>
              <button onClick={ajouter} style={{ ...BTN, width: '100%', padding: 12 }}>Planifier</button>
            </>}
            {modal === 'complete' && selected && <>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>Compléter l'entretien</h3>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>{selected.employe} · {selected.type} · {selected.date}</div>
              <div style={{ marginBottom: 10 }}><label style={LBL}>Note globale (1-5)</label><select value={form.note || '4'} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={INP}>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}/5</option>)}</select></div>
              <div style={{ marginBottom: 10 }}><label style={LBL}>Commentaire</label><textarea value={form.commentaire || ''} onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))} rows={3} style={{ ...INP, resize: 'vertical' }} /></div>
              <div style={{ marginBottom: 14 }}><label style={LBL}>Prochain entretien</label><input type="date" value={form.prochainEntretien || ''} onChange={e => setForm(f => ({ ...f, prochainEntretien: e.target.value }))} style={INP} /></div>
              <button onClick={() => completer(selected.id)} style={{ ...BTN, width: '100%', padding: 12 }}>Valider l'entretien</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
