import api from '../../services/api';
import React, { useState, useEffect } from 'react';
import { isDemo as _isDemo, demoGet, demoSet } from '../../utils/storage';
import DS from '../../design/luxe';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };

const CATEGORIES = ['Qualité travaux','Délai','Sécurité','Environnement','Matériel','Sous-traitance','Client','Autre'];
const STATUTS = { ouverte:'#DC2626', en_analyse:'#D97706', action_corrective:'#2563EB', verifiee:'#16A34A', cloturee:'#16A34A' };

const DEMO = [
  { id:1, numero:'NC-2026-001', date:'2026-04-02', categorie:'Qualité travaux', chantier:'Rénovation Dupont', description:'Carrelage posé avec joints irréguliers dans la salle de bain', detectePar:'Chef chantier', gravite:'majeure', cause:'Carreleur non qualifié pour grand format', actions:[{desc:'Reprise carrelage SDB',responsable:'Marc Lambert',echeance:'2026-04-10',fait:true},{desc:'Formation pose grand format',responsable:'Marc Lambert',echeance:'2026-04-15',fait:false}], statut:'action_corrective', coutImpact:1200 },
  { id:2, numero:'NC-2026-002', date:'2026-04-04', categorie:'Délai', chantier:'Bureau Médecin', description:'Retard de 3 jours sur la livraison des menuiseries', detectePar:'Client', gravite:'mineure', cause:'Fournisseur en rupture de stock', actions:[{desc:'Relance fournisseur + pénalité',responsable:'Vassili B.',echeance:'2026-04-06',fait:true}], statut:'verifiee', coutImpact:0 },
  { id:3, numero:'NC-2026-003', date:'2026-04-06', categorie:'Sécurité', chantier:'Peinture Pastorelli', description:'Échafaudage non conforme — garde-corps manquant côté rue', detectePar:'Inspection OPPBTP', gravite:'critique', cause:'Montage incomplet par sous-traitant', actions:[{desc:'Mise en conformité immédiate',responsable:'Jean Martin',echeance:'2026-04-06',fait:true},{desc:'Audit sous-traitant échafaudage',responsable:'Vassili B.',echeance:'2026-04-12',fait:false},{desc:'Mise à jour procédure réception échafaudage',responsable:'Sophie Duval',echeance:'2026-04-15',fait:false}], statut:'action_corrective', coutImpact:800 },
];

const graviteColors = { mineure:'#D97706', majeure:'#DC2626', critique:'#7C2D12' };

export default function NonConformitesModule() {
  const isDemo = _isDemo();
  const STORE_NC='freample_nc';
  const [ncs, setNcs] = useState(() => demoGet(STORE_NC, isDemo ? DEMO : []));
  useEffect(()=>{demoSet(STORE_NC,ncs);},[ncs]);
  useEffect(()=>{api.get('/modules/non_conformites').then(({data})=>{if(data.non_conformites?.length) setNcs(data.non_conformites);}).catch(()=>{});},[]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [selected, setSelected] = useState(null);

  const nextNum = `NC-2026-${String(ncs.length + 1).padStart(3, '0')}`;
  const ouvertes = ncs.filter(n => n.statut !== 'cloturee').length;
  const coutTotal = ncs.reduce((s, n) => s + n.coutImpact, 0);

  const ajouter = () => {
    const nc = { id: Date.now(), numero: nextNum, date: form.date || new Date().toISOString().slice(0, 10), categorie: form.categorie || 'Autre', chantier: form.chantier || '', description: form.description || '', detectePar: form.detectePar || '', gravite: form.gravite || 'mineure', cause: '', actions: [], statut: 'ouverte', coutImpact: Number(form.cout) || 0 };
    setNcs(prev => [nc, ...prev]);
    setModal(null); setForm({});
  };

  const updateStatut = (id, statut) => setNcs(prev => prev.map(n => n.id === id ? { ...n, statut } : n));
  const addAction = (id) => {
    setNcs(prev => prev.map(n => n.id === id ? { ...n, actions: [...n.actions, { desc: form.actionDesc || '', responsable: form.actionResp || '', echeance: form.actionEch || '', fait: false }] } : n));
    setForm(f => ({ ...f, actionDesc: '', actionResp: '', actionEch: '' }));
  };
  const toggleAction = (ncId, idx) => setNcs(prev => prev.map(n => n.id === ncId ? { ...n, actions: n.actions.map((a, j) => j === idx ? { ...a, fait: !a.fait } : a) } : n));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Non-conformités</h2>
        <button onClick={() => { setForm({ categorie: 'Qualité travaux', gravite: 'mineure' }); setModal('add'); }} style={{ ...BTN, background: '#DC2626' }}>+ Déclarer NC</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'Total NC', v: ncs.length, c: '#DC2626' },
          { l: 'Ouvertes', v: ouvertes, c: '#D97706' },
          { l: 'Coût impact', v: `${coutTotal}€`, c: DS.gold },
          { l: 'Critiques', v: ncs.filter(n => n.gravite === 'critique').length, c: '#7C2D12' },
        ].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {!selected && ncs.map(nc => (
        <div key={nc.id} onClick={() => setSelected(nc.id)} style={{ ...CARD, marginBottom: 6, cursor: 'pointer', borderLeft: `4px solid ${STATUTS[nc.statut]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#555' }}>{nc.numero}</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{nc.categorie}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: graviteColors[nc.gravite], background: `${graviteColors[nc.gravite]}15`, padding: '2px 8px', borderRadius: 6 }}>{nc.gravite}</span>
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>{nc.chantier} · {nc.date} · {nc.actions.filter(a => a.fait).length}/{nc.actions.length} actions</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: STATUTS[nc.statut], background: `${STATUTS[nc.statut]}15`, padding: '3px 10px', borderRadius: 6 }}>{nc.statut.replace('_', ' ')}</span>
        </div>
      ))}

      {selected && (() => {
        const nc = ncs.find(n => n.id === selected);
        if (!nc) return null;
        return <>
          <button onClick={() => setSelected(null)} style={{ ...BTN_O, marginBottom: 12, fontSize: 11 }}>← Retour</button>
          <div style={CARD}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#555' }}>{nc.numero}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0' }}>{nc.categorie} — {nc.chantier}</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: graviteColors[nc.gravite], background: `${graviteColors[nc.gravite]}15`, padding: '2px 8px', borderRadius: 6 }}>{nc.gravite}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: STATUTS[nc.statut], background: `${STATUTS[nc.statut]}15`, padding: '2px 8px', borderRadius: 6 }}>{nc.statut.replace('_', ' ')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {nc.statut === 'ouverte' && <button onClick={() => updateStatut(nc.id, 'en_analyse')} style={{ ...BTN, fontSize: 10, padding: '5px 12px', background: '#D97706' }}>Analyser</button>}
                {nc.statut === 'en_analyse' && <button onClick={() => updateStatut(nc.id, 'action_corrective')} style={{ ...BTN, fontSize: 10, padding: '5px 12px', background: '#2563EB' }}>Plan d'actions</button>}
                {nc.statut === 'action_corrective' && <button onClick={() => updateStatut(nc.id, 'verifiee')} style={{ ...BTN, fontSize: 10, padding: '5px 12px', background: '#16A34A' }}>Vérifier</button>}
                {nc.statut === 'verifiee' && <button onClick={() => updateStatut(nc.id, 'cloturee')} style={{ ...BTN, fontSize: 10, padding: '5px 12px', background: '#16A34A' }}>Clôturer</button>}
              </div>
            </div>
            <div style={{ background: '#F8F7F4', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 12 }}>{nc.description}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, marginBottom: 12 }}>
              <div><strong>Détecté par :</strong> {nc.detectePar}</div>
              <div><strong>Coût impact :</strong> {nc.coutImpact}€</div>
            </div>
            {nc.cause && <div style={{ background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 12 }}><strong>Cause :</strong> {nc.cause}</div>}
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Actions correctives ({nc.actions.length})</div>
            {nc.actions.map((a, idx) => (
              <div key={idx} onClick={() => toggleAction(nc.id, idx)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #E8E6E1', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${a.fait ? '#16A34A' : '#E8E6E1'}`, background: a.fait ? '#16A34A' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>{a.fait ? '✓' : ''}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, textDecoration: a.fait ? 'line-through' : 'none' }}>{a.desc}</div>
                  <div style={{ fontSize: 10, color: '#555' }}>{a.responsable} · Échéance: {a.echeance}</div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input value={form.actionDesc || ''} onChange={e => setForm(f => ({ ...f, actionDesc: e.target.value }))} placeholder="Action..." style={{ ...INP, flex: 2 }} />
              <input value={form.actionResp || ''} onChange={e => setForm(f => ({ ...f, actionResp: e.target.value }))} placeholder="Responsable" style={{ ...INP, flex: 1 }} />
              <input type="date" value={form.actionEch || ''} onChange={e => setForm(f => ({ ...f, actionEch: e.target.value }))} style={{ ...INP, flex: 1 }} />
              <button onClick={() => addAction(nc.id)} style={BTN}>+</button>
            </div>
          </div>
        </>;
      })()}

      {modal === 'add' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Déclarer une non-conformité — {nextNum}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Catégorie</label><select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} style={INP}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label style={LBL}>Gravité</label><select value={form.gravite} onChange={e => setForm(f => ({ ...f, gravite: e.target.value }))} style={INP}><option value="mineure">Mineure</option><option value="majeure">Majeure</option><option value="critique">Critique</option></select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Chantier</label><input value={form.chantier || ''} onChange={e => setForm(f => ({ ...f, chantier: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Détecté par</label><input value={form.detectePar || ''} onChange={e => setForm(f => ({ ...f, detectePar: e.target.value }))} style={INP} /></div>
            </div>
            <div style={{ marginBottom: 10 }}><label style={LBL}>Description</label><textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...INP, resize: 'vertical' }} /></div>
            <div style={{ marginBottom: 14 }}><label style={LBL}>Coût d'impact estimé (€)</label><input type="number" value={form.cout || ''} onChange={e => setForm(f => ({ ...f, cout: e.target.value }))} style={INP} /></div>
            <button onClick={ajouter} style={{ ...BTN, width: '100%', padding: 12, background: '#DC2626' }}>Déclarer</button>
          </div>
        </div>
      )}
    </div>
  );
}
