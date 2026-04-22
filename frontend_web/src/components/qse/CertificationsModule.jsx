import api from '../../services/api';
import React, { useState, useEffect } from 'react';
import DS from '../../design/luxe';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };

const TYPES_CERTIF = [
  { categorie:'Qualifications', items:['QUALIBAT','QUALIT\'EnR','QUALIFELEC','QUALIGAZ','QUALIPAC','QUALIPV','QUALIBOIS'] },
  { categorie:'Labels', items:['RGE (Reconnu Garant Environnement)','Éco Artisan','Handibat','Silverbat','NF Habitat','Certibat'] },
  { categorie:'Normes ISO', items:['ISO 9001 (Qualité)','ISO 14001 (Environnement)','ISO 45001 (Sécurité)','MASE','OHSAS 18001'] },
  { categorie:'Assurances', items:['Décennale','RC Professionnelle','Dommages-ouvrage','Garantie biennale'] },
];

const DEMO = [
  { id:1, nom:'QUALIBAT 2111 — Maçonnerie', type:'Qualifications', organisme:'QUALIBAT', numero:'E-2024-05678', dateObtention:'2024-06-15', dateExpiration:'2028-06-15', statut:'valide', document:true },
  { id:2, nom:'RGE (Reconnu Garant Environnement)', type:'Labels', organisme:'QUALIT\'EnR', numero:'RGE-2025-12345', dateObtention:'2025-01-10', dateExpiration:'2029-01-10', statut:'valide', document:true },
  { id:3, nom:'Décennale', type:'Assurances', organisme:'AXA Entreprises', numero:'POL-2026-98765', dateObtention:'2026-01-01', dateExpiration:'2027-01-01', statut:'valide', document:true },
  { id:4, nom:'RC Professionnelle', type:'Assurances', organisme:'SMABTP', numero:'RC-2026-45678', dateObtention:'2026-01-01', dateExpiration:'2027-01-01', statut:'valide', document:true },
  { id:5, nom:'QUALIBAT 5112 — Peinture', type:'Qualifications', organisme:'QUALIBAT', numero:'E-2023-04321', dateObtention:'2023-03-20', dateExpiration:'2026-03-20', statut:'expire', document:true },
  { id:6, nom:'ISO 9001 (Qualité)', type:'Normes ISO', organisme:'Bureau Veritas', numero:'', dateObtention:null, dateExpiration:null, statut:'en_cours', document:false },
];

const statutColors = { valide:'#16A34A', expire:'#DC2626', en_cours:'#D97706', a_renouveler:'#D97706' };

export default function CertificationsModule() {
  const STORE_C='freample_certifs'; function loadC(){try{const d=localStorage.getItem(STORE_C);return d?JSON.parse(d):DEMO;}catch{return DEMO;}}
  const [certifs, setCertifs] = useState(loadC);
  useEffect(()=>{localStorage.setItem(STORE_C,JSON.stringify(certifs));},[certifs]);
  useEffect(()=>{api.get('/modules/certifications').then(({data})=>{if(data.certifications?.length) setCertifs(data.certifications);}).catch(()=>{});},[]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [filterType, setFilterType] = useState('');

  const now = new Date();
  const expirationProche = certifs.filter(c => c.dateExpiration && c.statut === 'valide' && new Date(c.dateExpiration) < new Date(now.getTime() + 90 * 86400000));
  const expirees = certifs.filter(c => c.statut === 'expire');
  const filtered = filterType ? certifs.filter(c => c.type === filterType) : certifs;

  const ajouter = () => {
    const c = { id: Date.now(), nom: form.nom || '', type: form.type || 'Qualifications', organisme: form.organisme || '', numero: form.numero || '', dateObtention: form.dateObtention || null, dateExpiration: form.dateExpiration || null, statut: form.dateObtention ? 'valide' : 'en_cours', document: false };
    setCertifs(prev => [c, ...prev]);
    setModal(null); setForm({});
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Certifications & Labels</h2>
        <button onClick={() => { setForm({ type: 'Qualifications' }); setModal('add'); }} style={BTN}>+ Ajouter</button>
      </div>

      {/* Alertes */}
      {(expirationProche.length > 0 || expirees.length > 0) && (
        <div style={{ ...CARD, borderLeft: '4px solid #DC2626', marginBottom: 16, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 6 }}>Alertes certifications</div>
          {expirees.map(c => <div key={c.id} style={{ fontSize: 12, color: '#DC2626', padding: '2px 0' }}>EXPIRÉ : {c.nom} — expiré le {c.dateExpiration}</div>)}
          {expirationProche.map(c => <div key={c.id} style={{ fontSize: 12, color: '#D97706', padding: '2px 0' }}>EXPIRE BIENTÔT : {c.nom} — {c.dateExpiration}</div>)}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'Certifications', v: certifs.length, c: '#2563EB' },
          { l: 'Valides', v: certifs.filter(c => c.statut === 'valide').length, c: '#16A34A' },
          { l: 'Expirées', v: expirees.length, c: '#DC2626' },
          { l: 'En cours', v: certifs.filter(c => c.statut === 'en_cours').length, c: '#D97706' },
        ].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterType('')} style={!filterType ? BTN : BTN_O}>Tous</button>
        {TYPES_CERTIF.map(t => <button key={t.categorie} onClick={() => setFilterType(filterType === t.categorie ? '' : t.categorie)} style={filterType === t.categorie ? BTN : BTN_O}>{t.categorie}</button>)}
      </div>

      {filtered.map(c => (
        <div key={c.id} style={{ ...CARD, marginBottom: 6, borderLeft: `4px solid ${statutColors[c.statut]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{c.nom}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: statutColors[c.statut], background: `${statutColors[c.statut]}15`, padding: '2px 8px', borderRadius: 6 }}>{c.statut}</span>
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>{c.organisme} · N°{c.numero || '—'} · {c.dateObtention || 'En cours'}{c.dateExpiration ? ` → ${c.dateExpiration}` : ''}</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {c.document && <span style={{ fontSize: 10, color: '#16A34A' }}>✓ Document</span>}
            {c.statut === 'expire' && <button onClick={() => setCertifs(prev => prev.map(x => x.id === c.id ? { ...x, statut: 'en_cours' } : x))} style={{ ...BTN, fontSize: 10, padding: '5px 10px', background: '#D97706' }}>Renouveler</button>}
          </div>
        </div>
      ))}

      {modal === 'add' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Ajouter une certification</h3>
            <div style={{ marginBottom: 10 }}><label style={LBL}>Nom / Intitulé</label><input value={form.nom || ''} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={INP} placeholder="QUALIBAT 2111, RGE..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Type</label><select value={form.type || 'Qualifications'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={INP}>{TYPES_CERTIF.map(t => <option key={t.categorie}>{t.categorie}</option>)}</select></div>
              <div><label style={LBL}>Organisme</label><input value={form.organisme || ''} onChange={e => setForm(f => ({ ...f, organisme: e.target.value }))} style={INP} placeholder="QUALIBAT, Bureau Veritas..." /></div>
            </div>
            <div style={{ marginBottom: 10 }}><label style={LBL}>Numéro</label><input value={form.numero || ''} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} style={INP} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div><label style={LBL}>Date obtention</label><input type="date" value={form.dateObtention || ''} onChange={e => setForm(f => ({ ...f, dateObtention: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Date expiration</label><input type="date" value={form.dateExpiration || ''} onChange={e => setForm(f => ({ ...f, dateExpiration: e.target.value }))} style={INP} /></div>
            </div>
            <button onClick={ajouter} style={{ ...BTN, width: '100%', padding: 12 }}>Ajouter</button>
          </div>
        </div>
      )}
    </div>
  );
}
