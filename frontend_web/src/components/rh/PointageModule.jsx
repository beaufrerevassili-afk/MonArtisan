import api from '../../services/api';
import React, { useState, useEffect } from 'react';
import { isDemo as _isDemo, demoGet, demoSet } from '../../utils/storage';
import DS from '../../design/luxe';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };

const DEMO = [
  { id:1, employe:'Jean Martin', chantier:'Rénovation Dupont', date:'2026-04-07', debut:'07:30', fin:'17:00', pause:60, heures:8.5, statut:'valide' },
  { id:2, employe:'Jean Martin', chantier:'Rénovation Dupont', date:'2026-04-04', debut:'07:30', fin:'17:30', pause:60, heures:9, statut:'valide' },
  { id:3, employe:'Jean Martin', chantier:'Bureau Médecin', date:'2026-04-03', debut:'08:00', fin:'16:00', pause:45, heures:7.25, statut:'valide' },
  { id:4, employe:'Sophie Duval', chantier:'Rénovation Dupont', date:'2026-04-07', debut:'08:00', fin:'17:00', pause:60, heures:8, statut:'en_attente' },
  { id:5, employe:'Sophie Duval', chantier:'Rénovation Dupont', date:'2026-04-04', debut:'08:00', fin:'12:00', pause:0, heures:4, statut:'valide' },
  { id:6, employe:'Marc Lambert', chantier:'Bureau Médecin', date:'2026-04-07', debut:'07:00', fin:'16:30', pause:60, heures:8.5, statut:'en_attente' },
  { id:7, employe:'Marc Lambert', chantier:'Bureau Médecin', date:'2026-04-04', debut:'07:00', fin:'17:00', pause:60, heures:9, statut:'valide' },
  { id:8, employe:'Lucas Garcia', chantier:'Peinture Pastorelli', date:'2026-04-07', debut:'08:30', fin:'17:30', pause:60, heures:8, statut:'en_attente' },
];

export default function PointageModule({ employes = [] }) {
  const STORE_P='freample_pointages';
  const isDemo = _isDemo();
  const [pointages, setPointages] = useState(() => demoGet(STORE_P, isDemo ? DEMO : []));
  useEffect(()=>{demoSet(STORE_P,pointages);},[pointages]);
  useEffect(()=>{api.get('/modules/pointages').then(({data})=>{if(data.pointages?.length) setPointages(data.pointages);}).catch(()=>{});},[]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [filterDate, setFilterDate] = useState('');
  const [filterEmploye, setFilterEmploye] = useState('');

  const filtered = pointages.filter(p => {
    if (filterDate && p.date !== filterDate) return false;
    if (filterEmploye && !p.employe.toLowerCase().includes(filterEmploye.toLowerCase())) return false;
    return true;
  });

  const totalHeures = filtered.reduce((s, p) => s + p.heures, 0);
  const enAttente = pointages.filter(p => p.statut === 'en_attente').length;

  const valider = (id) => setPointages(prev => prev.map(p => p.id === id ? { ...p, statut: 'valide' } : p));
  const validerTous = () => setPointages(prev => prev.map(p => p.statut === 'en_attente' ? { ...p, statut: 'valide' } : p));

  const ajouter = () => {
    const heures = form.debut && form.fin ? Math.max(0, ((new Date(`2026-01-01T${form.fin}`) - new Date(`2026-01-01T${form.debut}`)) / 3600000) - (Number(form.pause) || 0) / 60) : 0;
    const p = { id: Date.now(), employe: form.employe || '', chantier: form.chantier || '', date: form.date || new Date().toISOString().slice(0, 10), debut: form.debut || '08:00', fin: form.fin || '17:00', pause: Number(form.pause) || 60, heures: Math.round(heures * 100) / 100, statut: 'en_attente' };
    setPointages(prev => [p, ...prev]);
    setModal(null); setForm({});
  };

  const exportCSV = () => {
    const rows = [['Employé', 'Chantier', 'Date', 'Début', 'Fin', 'Pause (min)', 'Heures', 'Statut']];
    filtered.forEach(p => rows.push([p.employe, p.chantier, p.date, p.debut, p.fin, p.pause, p.heures, p.statut]));
    const blob = new Blob([rows.map(r => r.join(';')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pointages.csv'; a.click();
  };

  // Résumé par employé
  const parEmploye = {};
  pointages.forEach(p => { if (!parEmploye[p.employe]) parEmploye[p.employe] = { heures: 0, jours: 0 }; parEmploye[p.employe].heures += p.heures; parEmploye[p.employe].jours += 1; });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Pointage digital</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {enAttente > 0 && <button onClick={validerTous} style={{ ...BTN, background: '#16A34A' }}>Valider tous ({enAttente})</button>}
          <button onClick={() => { setForm({}); setModal('add'); }} style={BTN}>+ Saisir pointage</button>
          <button onClick={exportCSV} style={BTN_O}>Export CSV</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'Heures cette semaine', v: `${totalHeures.toFixed(1)}h`, c: '#2563EB' },
          { l: 'Pointages', v: filtered.length, c: DS.gold },
          { l: 'En attente', v: enAttente, c: enAttente > 0 ? '#D97706' : '#16A34A' },
          { l: 'Employés actifs', v: Object.keys(parEmploye).length, c: '#16A34A' },
        ].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Résumé par employé */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Heures par employé</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 100 }}>
          {Object.entries(parEmploye).map(([nom, data]) => {
            const max = Math.max(...Object.values(parEmploye).map(d => d.heures)) || 1;
            return <div key={nom} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DS.gold }}>{data.heures.toFixed(1)}h</div>
              <div style={{ background: DS.gold, borderRadius: '4px 4px 0 0', height: Math.max(8, data.heures / max * 70), opacity: 0.7, margin: '4px auto', width: '60%' }} />
              <div style={{ fontSize: 10, color: '#555' }}>{nom.split(' ')[0]}</div>
            </div>;
          })}
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ ...INP, width: 160 }} />
        <input value={filterEmploye} onChange={e => setFilterEmploye(e.target.value)} placeholder="Filtrer par employé..." style={{ ...INP, flex: 1 }} />
        {(filterDate || filterEmploye) && <button onClick={() => { setFilterDate(''); setFilterEmploye(''); }} style={BTN_O}>Effacer</button>}
      </div>

      {/* Liste */}
      <div style={{ ...CARD, padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 0.7fr 0.7fr 0.5fr 0.7fr 1fr', padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#555', borderBottom: '2px solid #E8E6E1' }}>
          <span>Employé</span><span>Chantier</span><span>Date</span><span>Début</span><span>Fin</span><span>Pause</span><span>Heures</span><span>Statut</span>
        </div>
        {filtered.map(p => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 0.7fr 0.7fr 0.5fr 0.7fr 1fr', padding: '10px 14px', fontSize: 12, borderBottom: '1px solid #E8E6E1', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>{p.employe}</span>
            <span style={{ color: '#555' }}>{p.chantier}</span>
            <span>{p.date}</span>
            <span>{p.debut}</span>
            <span>{p.fin}</span>
            <span>{p.pause}min</span>
            <span style={{ fontWeight: 700, color: DS.gold }}>{p.heures}h</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {p.statut === 'valide' && <span style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', background: '#F0FDF4', padding: '2px 8px', borderRadius: 6 }}>Validé</span>}
              {p.statut === 'en_attente' && <>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#D97706', background: '#FFFBEB', padding: '2px 6px', borderRadius: 6 }}>En attente</span>
                <button onClick={() => valider(p.id)} style={{ fontSize: 10, padding: '2px 6px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>✓</button>
              </>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Saisir un pointage</h3>
            <div style={{ marginBottom: 10 }}><label style={LBL}>Employé</label><input value={form.employe || ''} onChange={e => setForm(f => ({ ...f, employe: e.target.value }))} style={INP} placeholder="Jean Martin" /></div>
            <div style={{ marginBottom: 10 }}><label style={LBL}>Chantier</label><input value={form.chantier || ''} onChange={e => setForm(f => ({ ...f, chantier: e.target.value }))} style={INP} placeholder="Rénovation Dupont" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Date</label><input type="date" value={form.date || ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Début</label><input type="time" value={form.debut || '07:30'} onChange={e => setForm(f => ({ ...f, debut: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Fin</label><input type="time" value={form.fin || '17:00'} onChange={e => setForm(f => ({ ...f, fin: e.target.value }))} style={INP} /></div>
            </div>
            <div style={{ marginBottom: 14 }}><label style={LBL}>Pause (min)</label><input type="number" value={form.pause || '60'} onChange={e => setForm(f => ({ ...f, pause: e.target.value }))} style={INP} /></div>
            <button onClick={ajouter} style={{ ...BTN, width: '100%', padding: 12 }}>Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
}
