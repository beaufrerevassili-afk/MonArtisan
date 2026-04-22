import api from '../../services/api';
import React, { useState, useEffect } from 'react';
import { isDemo as _isDemo, demoGet, demoSet } from '../../utils/storage';
import DS from '../../design/luxe';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };

const TYPES_DECHETS = ['Amiante','Plomb','Gravats inertes','Bois traité','Déchets dangereux','Peintures/solvants','Métaux','Plastiques','Déchets mélangés','Terre polluée'];
const FILIERES = ['ISDI (inerte)','ISDND (non dangereux)','ISDD (dangereux)','Centre de tri','Déchèterie pro','Plateforme de regroupement','Valorisation matière','Incinération'];

const DEMO = [
  { id:1, numero:'BSDD-2026-001', date:'2026-04-02', chantier:'Rénovation Dupont', typeDechet:'Amiante', quantite:0.5, unite:'tonnes', filiere:'ISDD (dangereux)', transporteur:'Veolia Propreté', destinataire:'Centre ISDD Fos-sur-Mer', numeroCAP:'CAP-06-2026-0421', statut:'traite', dateTraitement:'2026-04-05', certificat:true },
  { id:2, numero:'BSDD-2026-002', date:'2026-04-04', chantier:'Bureau Médecin', typeDechet:'Gravats inertes', quantite:3.2, unite:'tonnes', filiere:'ISDI (inerte)', transporteur:'Nicollin', destinataire:'Carrière ISDI Gardanne', numeroCAP:'', statut:'en_transit', dateTraitement:null, certificat:false },
  { id:3, numero:'BSDD-2026-003', date:'2026-04-06', chantier:'Peinture Pastorelli', typeDechet:'Peintures/solvants', quantite:0.08, unite:'tonnes', filiere:'Incinération', transporteur:'Suez RV', destinataire:'UIOM Marseille', numeroCAP:'CAP-06-2026-0435', statut:'emis', dateTraitement:null, certificat:false },
];

const statutColors = { emis:'#D97706', en_transit:'#2563EB', traite:'#16A34A', refuse:'#DC2626' };
const statutLabels = { emis:'Émis', en_transit:'En transit', traite:'Traité', refuse:'Refusé' };

export default function BSDDModule() {
  const isDemo = _isDemo();
  const STORE_B='freample_bsdd';
  const [bsdds, setBsdds] = useState(() => demoGet(STORE_B, isDemo ? DEMO : []));
  useEffect(()=>{demoSet(STORE_B,bsdds);},[bsdds]);
  useEffect(()=>{api.get('/modules/bsdd').then(({data})=>{if(data.bsdd?.length) setBsdds(data.bsdd);}).catch(()=>{});},[]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const nextNum = `BSDD-2026-${String(bsdds.length + 1).padStart(3, '0')}`;
  const totalTonnes = bsdds.reduce((s, b) => s + b.quantite, 0);
  const dangereux = bsdds.filter(b => ['Amiante', 'Plomb', 'Déchets dangereux', 'Peintures/solvants', 'Terre polluée'].includes(b.typeDechet));

  const ajouter = () => {
    const b = { id: Date.now(), numero: nextNum, date: form.date || new Date().toISOString().slice(0, 10), chantier: form.chantier || '', typeDechet: form.typeDechet || 'Gravats inertes', quantite: Number(form.quantite) || 0, unite: form.unite || 'tonnes', filiere: form.filiere || 'ISDI (inerte)', transporteur: form.transporteur || '', destinataire: form.destinataire || '', numeroCAP: form.cap || '', statut: 'emis', dateTraitement: null, certificat: false };
    setBsdds(prev => [b, ...prev]);
    setModal(null); setForm({});
  };

  const updateStatut = (id, statut) => setBsdds(prev => prev.map(b => b.id === id ? { ...b, statut, dateTraitement: statut === 'traite' ? new Date().toISOString().slice(0, 10) : b.dateTraitement, certificat: statut === 'traite' } : b));

  const exportCSV = () => {
    const rows = [['N° BSDD', 'Date', 'Chantier', 'Type déchet', 'Quantité', 'Filière', 'Transporteur', 'Destinataire', 'N° CAP', 'Statut']];
    bsdds.forEach(b => rows.push([b.numero, b.date, b.chantier, b.typeDechet, b.quantite + ' ' + b.unite, b.filiere, b.transporteur, b.destinataire, b.numeroCAP, statutLabels[b.statut]]));
    const blob = new Blob([rows.map(r => r.join(';')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bsdd_registre.csv'; a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Traçabilité déchets (BSDD)</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { setForm({ typeDechet: 'Gravats inertes', unite: 'tonnes', filiere: 'ISDI (inerte)' }); setModal('add'); }} style={BTN}>+ Nouveau BSDD</button>
          <button onClick={exportCSV} style={BTN_O}>Export registre</button>
        </div>
      </div>

      <div style={{ ...CARD, borderLeft: '4px solid #16A34A', marginBottom: 16, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>Obligation légale</div>
        <div style={{ fontSize: 11, color: '#555' }}>Le bordereau de suivi des déchets (BSDD) est obligatoire pour tout déchet dangereux (Art. R541-45 du Code de l'environnement). Le registre doit être conservé 3 ans (5 ans pour l'amiante).</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'Bordereaux', v: bsdds.length, c: '#2563EB' },
          { l: 'Tonnes évacuées', v: totalTonnes.toFixed(1), c: '#16A34A' },
          { l: 'Déchets dangereux', v: dangereux.length, c: '#DC2626' },
          { l: 'En attente', v: bsdds.filter(b => b.statut !== 'traite').length, c: '#D97706' },
        ].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {bsdds.map(b => (
        <div key={b.id} style={{ ...CARD, marginBottom: 6, borderLeft: `4px solid ${statutColors[b.statut]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#555' }}>{b.numero}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{b.typeDechet}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: statutColors[b.statut], background: `${statutColors[b.statut]}15`, padding: '2px 8px', borderRadius: 6 }}>{statutLabels[b.statut]}</span>
              {b.certificat && <span style={{ fontSize: 10, color: '#16A34A', fontWeight: 600 }}>✓ Certificat</span>}
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>{b.chantier} · {b.quantite} {b.unite} · {b.transporteur} → {b.destinataire}</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {b.statut === 'emis' && <button onClick={() => updateStatut(b.id, 'en_transit')} style={{ ...BTN, fontSize: 10, padding: '5px 10px', background: '#2563EB' }}>En transit</button>}
            {b.statut === 'en_transit' && <button onClick={() => updateStatut(b.id, 'traite')} style={{ ...BTN, fontSize: 10, padding: '5px 10px', background: '#16A34A' }}>Traité</button>}
          </div>
        </div>
      ))}

      {modal === 'add' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, padding: '28px 24px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Nouveau BSDD — {nextNum}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Type de déchet</label><select value={form.typeDechet} onChange={e => setForm(f => ({ ...f, typeDechet: e.target.value }))} style={INP}>{TYPES_DECHETS.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label style={LBL}>Filière</label><select value={form.filiere} onChange={e => setForm(f => ({ ...f, filiere: e.target.value }))} style={INP}>{FILIERES.map(t => <option key={t}>{t}</option>)}</select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Chantier</label><input value={form.chantier || ''} onChange={e => setForm(f => ({ ...f, chantier: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Quantité</label><input type="number" step="0.01" value={form.quantite || ''} onChange={e => setForm(f => ({ ...f, quantite: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Unité</label><select value={form.unite} onChange={e => setForm(f => ({ ...f, unite: e.target.value }))} style={INP}><option>tonnes</option><option>m³</option><option>kg</option><option>litres</option></select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Transporteur</label><input value={form.transporteur || ''} onChange={e => setForm(f => ({ ...f, transporteur: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Destinataire</label><input value={form.destinataire || ''} onChange={e => setForm(f => ({ ...f, destinataire: e.target.value }))} style={INP} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div><label style={LBL}>N° CAP</label><input value={form.cap || ''} onChange={e => setForm(f => ({ ...f, cap: e.target.value }))} style={INP} placeholder="Optionnel" /></div>
              <div><label style={LBL}>Date</label><input type="date" value={form.date || ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={INP} /></div>
            </div>
            <button onClick={ajouter} style={{ ...BTN, width: '100%', padding: 12 }}>Créer le BSDD</button>
          </div>
        </div>
      )}
    </div>
  );
}
