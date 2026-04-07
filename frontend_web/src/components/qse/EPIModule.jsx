import api from '../../services/api';
import React, { useState, useEffect } from 'react';
import DS from '../../design/ds';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };

const TYPES_EPI = ['Casque de chantier','Chaussures de sécurité','Gilet haute visibilité','Gants de protection','Lunettes de protection','Protection auditive','Harnais antichute','Masque respiratoire','Genouillères','Combinaison de travail'];

const DEMO = [
  { id:1, employe:'Jean Martin', epi:'Casque de chantier', marque:'3M Peltor', taille:'Universel', dateRemise:'2025-09-01', dateExpiration:'2027-09-01', etat:'bon', signature:true },
  { id:2, employe:'Jean Martin', epi:'Chaussures de sécurité', marque:'Caterpillar S3', taille:'43', dateRemise:'2025-09-01', dateExpiration:'2026-09-01', etat:'bon', signature:true },
  { id:3, employe:'Jean Martin', epi:'Gilet haute visibilité', marque:'Portwest', taille:'L', dateRemise:'2025-09-01', dateExpiration:null, etat:'bon', signature:true },
  { id:4, employe:'Jean Martin', epi:'Gants de protection', marque:'Mechanix', taille:'L', dateRemise:'2026-03-15', dateExpiration:null, etat:'bon', signature:true },
  { id:5, employe:'Sophie Duval', epi:'Casque de chantier', marque:'3M Peltor', taille:'Universel', dateRemise:'2025-10-01', dateExpiration:'2027-10-01', etat:'bon', signature:true },
  { id:6, employe:'Sophie Duval', epi:'Chaussures de sécurité', marque:'Puma Safety', taille:'39', dateRemise:'2025-10-01', dateExpiration:'2026-10-01', etat:'usé', signature:true },
  { id:7, employe:'Sophie Duval', epi:'Harnais antichute', marque:'Petzl', taille:'M', dateRemise:'2026-01-10', dateExpiration:'2027-01-10', etat:'bon', signature:true },
  { id:8, employe:'Marc Lambert', epi:'Casque de chantier', marque:'MSA V-Gard', taille:'Universel', dateRemise:'2026-03-15', dateExpiration:'2028-03-15', etat:'neuf', signature:true },
  { id:9, employe:'Marc Lambert', epi:'Lunettes de protection', marque:'Bollé Safety', taille:'Universel', dateRemise:'2026-03-15', dateExpiration:null, etat:'bon', signature:true },
  { id:10, employe:'Lucas Garcia', epi:'Casque de chantier', marque:'3M Peltor', taille:'Universel', dateRemise:'2026-04-01', dateExpiration:'2028-04-01', etat:'neuf', signature:false },
  { id:11, employe:'Lucas Garcia', epi:'Chaussures de sécurité', marque:'Timberland Pro', taille:'42', dateRemise:'2026-04-01', dateExpiration:'2027-04-01', etat:'neuf', signature:false },
  { id:12, employe:'Lucas Garcia', epi:'Masque respiratoire', marque:'3M 6200', taille:'M', dateRemise:'2026-04-01', dateExpiration:'2026-10-01', etat:'neuf', signature:false },
];

export default function EPIModule() {
  const STORE_EPI='freample_epi'; function loadEPI(){try{const d=localStorage.getItem(STORE_EPI);return d?JSON.parse(d):DEMO;}catch{return DEMO;}}
  const [epis, setEpis] = useState(loadEPI);
  useEffect(()=>{localStorage.setItem(STORE_EPI,JSON.stringify(epis));},[epis]);
  useEffect(()=>{api.get('/modules/epi').then(({data})=>{if(data.epi?.length) setEpis(data.epi);}).catch(()=>{});},[]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [filterEmploye, setFilterEmploye] = useState('');

  const employes = [...new Set(epis.map(e => e.employe))];
  const filtered = filterEmploye ? epis.filter(e => e.employe === filterEmploye) : epis;
  const now = new Date();
  const expirationProche = epis.filter(e => e.dateExpiration && new Date(e.dateExpiration) < new Date(now.getTime() + 90 * 86400000));
  const nonSignes = epis.filter(e => !e.signature).length;

  const ajouter = () => {
    const e = { id: Date.now(), employe: form.employe || '', epi: form.epi || '', marque: form.marque || '', taille: form.taille || '', dateRemise: form.dateRemise || new Date().toISOString().slice(0, 10), dateExpiration: form.dateExpiration || null, etat: 'neuf', signature: false };
    setEpis(prev => [e, ...prev]);
    setModal(null); setForm({});
  };

  const signer = (id) => setEpis(prev => prev.map(e => e.id === id ? { ...e, signature: true } : e));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Gestion des EPI</h2>
        <button onClick={() => { setForm({ epi: 'Casque de chantier' }); setModal('add'); }} style={BTN}>+ Attribuer EPI</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'EPI distribués', v: epis.length, c: '#2563EB' },
          { l: 'Employés équipés', v: employes.length, c: '#16A34A' },
          { l: 'Expirations < 90j', v: expirationProche.length, c: expirationProche.length > 0 ? '#DC2626' : '#16A34A' },
          { l: 'À signer', v: nonSignes, c: nonSignes > 0 ? '#D97706' : '#16A34A' },
        ].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Alertes expiration */}
      {expirationProche.length > 0 && (
        <div style={{ ...CARD, borderLeft: '4px solid #DC2626', marginBottom: 16, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 6 }}>EPI à renouveler</div>
          {expirationProche.map(e => (
            <div key={e.id} style={{ fontSize: 12, padding: '3px 0', color: '#555' }}>
              {e.employe} — {e.epi} ({e.marque}) — expire le {e.dateExpiration}
            </div>
          ))}
        </div>
      )}

      {/* Filtre par employé */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterEmploye('')} style={!filterEmploye ? BTN : BTN_O}>Tous ({epis.length})</button>
        {employes.map(emp => (
          <button key={emp} onClick={() => setFilterEmploye(filterEmploye === emp ? '' : emp)} style={filterEmploye === emp ? BTN : BTN_O}>{emp} ({epis.filter(e => e.employe === emp).length})</button>
        ))}
      </div>

      {/* Liste */}
      <div style={{ ...CARD, padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 0.8fr 1fr 0.8fr 0.8fr', padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#555', borderBottom: '2px solid #E8E6E1' }}>
          <span>Employé</span><span>EPI</span><span>Marque</span><span>Taille</span><span>Remis le</span><span>État</span><span>Signature</span>
        </div>
        {filtered.map(e => {
          const isExpiring = e.dateExpiration && new Date(e.dateExpiration) < new Date(now.getTime() + 90 * 86400000);
          return <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 0.8fr 1fr 0.8fr 0.8fr', padding: '10px 14px', fontSize: 12, borderBottom: '1px solid #E8E6E1', alignItems: 'center', background: isExpiring ? '#FEF2F2' : 'transparent' }}>
            <span style={{ fontWeight: 600 }}>{e.employe}</span>
            <span>{e.epi}</span>
            <span style={{ color: '#555' }}>{e.marque}</span>
            <span>{e.taille}</span>
            <span>{e.dateRemise}{e.dateExpiration && <span style={{ fontSize: 10, color: isExpiring ? '#DC2626' : '#555', display: 'block' }}>→ {e.dateExpiration}</span>}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: e.etat === 'neuf' ? '#16A34A' : e.etat === 'bon' ? '#2563EB' : '#D97706', background: e.etat === 'neuf' ? '#F0FDF4' : e.etat === 'bon' ? '#EFF6FF' : '#FFFBEB', padding: '2px 6px', borderRadius: 4, textAlign: 'center' }}>{e.etat}</span>
            {e.signature ? <span style={{ fontSize: 10, color: '#16A34A', fontWeight: 600 }}>✓ Signé</span>
              : <button onClick={() => signer(e.id)} style={{ fontSize: 10, padding: '3px 8px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Signer</button>}
          </div>;
        })}
      </div>

      {modal === 'add' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Attribuer un EPI</h3>
            <div style={{ marginBottom: 10 }}><label style={LBL}>Employé</label><input value={form.employe || ''} onChange={e => setForm(f => ({ ...f, employe: e.target.value }))} style={INP} placeholder="Jean Martin" /></div>
            <div style={{ marginBottom: 10 }}><label style={LBL}>Type d'EPI</label><select value={form.epi || ''} onChange={e => setForm(f => ({ ...f, epi: e.target.value }))} style={INP}>{TYPES_EPI.map(t => <option key={t}>{t}</option>)}</select></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Marque</label><input value={form.marque || ''} onChange={e => setForm(f => ({ ...f, marque: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Taille</label><input value={form.taille || ''} onChange={e => setForm(f => ({ ...f, taille: e.target.value }))} style={INP} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div><label style={LBL}>Date remise</label><input type="date" value={form.dateRemise || ''} onChange={e => setForm(f => ({ ...f, dateRemise: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Date expiration</label><input type="date" value={form.dateExpiration || ''} onChange={e => setForm(f => ({ ...f, dateExpiration: e.target.value }))} style={INP} /></div>
            </div>
            <button onClick={ajouter} style={{ ...BTN, width: '100%', padding: 12 }}>Attribuer</button>
          </div>
        </div>
      )}
    </div>
  );
}
