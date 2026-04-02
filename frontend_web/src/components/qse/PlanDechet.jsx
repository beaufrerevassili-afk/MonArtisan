import React, { useState } from 'react';
import { genererPlanDechet } from '../../utils/qsePDF';

const INPUT = { padding:'8px 12px', border:'1px solid #E5E5EA', borderRadius:8, fontSize:14, width:'100%', boxSizing:'border-box' };
const BTN_VIOLET = { padding:'8px 18px', background:'#5B5BD6', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14 };
const BTN_GHOST = { padding:'8px 14px', background:'#F2F2F7', color:'#3A3A3C', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:13 };
const CARD = { background:'#fff', borderRadius:14, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', marginBottom:16 };
const SECTION_TITLE = { fontSize:14, fontWeight:700, color:'#5B5BD6', marginBottom:12, paddingBottom:6, borderBottom:'2px solid #E3E3F8' };

const FLUX5 = [
  { key:'bois',      label:'Bois',                 icon:'🪵' },
  { key:'metal',     label:'Métaux',               icon:'🔩' },
  { key:'plastique', label:'Plastiques / emballages', icon:'♻️' },
  { key:'platre',    label:'Plâtre',               icon:'🧱' },
  { key:'gravats',   label:'Gravats / béton',       icon:'🏗️' },
];

const TRI_INIT = Object.fromEntries(FLUX5.map(f => [f.key, { actif:false, benne:'', prestataire:'', frequence:'', centre:'' }]));

const newDI  = () => ({ id:Date.now(), type:'', volume:'', filiere:'', observation:'' });
const newDND = () => ({ id:Date.now(), type:'', volume:'', filiere:'', bsdd:false, observation:'' });
const newDD  = () => ({ id:Date.now(), type:'', code:'', volume:'', filiere:'', bsdd:true, observation:'' });

export default function PlanDechet({ onRetour }) {
  const [ident, setIdent] = useState({ chantier:'', adresse:'', mairie:'', dateDebut:'', dateFin:'', conducteur:'', coordonnees:'' });
  const [tri, setTri] = useState(TRI_INIT);
  const [di, setDI] = useState([newDI()]);
  const [dnd, setDND] = useState([newDND()]);
  const [dd, setDD] = useState([newDD()]);
  const [tracabilite, setTracabilite] = useState({ responsable:'', registre:false, bsdNumero:'', archivage:'5 ans', observations:'' });
  const [sigs, setSigs] = useState({ conducteur:'', date:new Date().toISOString().slice(0,10), responsableQSE:'', dateQSE:new Date().toISOString().slice(0,10) });

  /* ── Helpers tri ── */
  const setTriField = (flux, field, val) => setTri(t => ({ ...t, [flux]: { ...t[flux], [field]: val } }));

  /* ── Helpers tables ── */
  const setRow = (setter, id, field, val) => setter(rows => rows.map(r => r.id === id ? { ...r, [field]: val } : r));
  const addRow = (setter, factory) => setter(rows => [...rows, factory()]);
  const delRow = (setter, id) => setter(rows => rows.filter(r => r.id !== id));

  /* ── Export PDF ── */
  const handlePDF = () => {
    genererPlanDechet({
      identification: ident,
      tri5flux: tri,
      dechetsInertes: di,
      dechetsNonDangereux: dnd,
      dechetsDangereux: dd,
      tracabilite,
      signatures: sigs,
    });
  };

  /* ── Row editor factory ── */
  const TableDechet = ({ rows, setter, columns, factory }) => (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
      <thead>
        <tr style={{ background:'#F2F2F7' }}>
          {columns.map(c => <th key={c.key} style={{ padding:'6px 8px', textAlign:'left', fontWeight:600, fontSize:12, color:'#3A3A3C' }}>{c.label}</th>)}
          <th style={{ width:36 }}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} style={{ borderBottom:'1px solid #F2F2F7' }}>
            {columns.map(c => (
              <td key={c.key} style={{ padding:'4px 6px' }}>
                {c.type === 'checkbox' ? (
                  <input type="checkbox" checked={!!row[c.key]} onChange={e => setRow(setter, row.id, c.key, e.target.checked)} />
                ) : (
                  <input value={row[c.key]||''} onChange={e => setRow(setter, row.id, c.key, e.target.value)}
                    style={{ ...INPUT, padding:'4px 8px', fontSize:12 }} placeholder={c.placeholder||''} />
                )}
              </td>
            ))}
            <td style={{ padding:'4px 6px', textAlign:'center' }}>
              {rows.length > 1 && (
                <button onClick={() => delRow(setter, row.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#C0392B', fontSize:16, fontWeight:700 }}>×</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={columns.length + 1} style={{ paddingTop:8 }}>
            <button onClick={() => addRow(setter, factory)} style={{ ...BTN_GHOST, fontSize:12, padding:'5px 12px' }}>+ Ajouter une ligne</button>
          </td>
        </tr>
      </tfoot>
    </table>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:1100, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
        <div>
          <button onClick={onRetour} style={{ background:'none', border:'none', cursor:'pointer', color:'#5B5BD6', fontSize:14, fontWeight:600, padding:'0 0 4px' }}>← Retour aux documents</button>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>Plan de Gestion des Déchets de Chantier</h2>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#6E6E73' }}>Loi 2020-105 AGEC · Art. L541-1 Code Environnement · Décret 2020-1573 (BSDD obligatoire)</p>
        </div>
        <button onClick={handlePDF} style={{ ...BTN_VIOLET, display:'flex', alignItems:'center', gap:8 }}>
          <span>⬇</span> Exporter PDF
        </button>
      </div>

      {/* 1 — Identification chantier */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>1. Identification du chantier</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            ['chantier','Nom / réf. chantier','Ex : Rénovation Dupont'],
            ['adresse','Adresse chantier',''],
            ['mairie','Commune / mairie',''],
            ['dateDebut','Date début','date'],
            ['dateFin','Date fin prévisionnelle','date'],
            ['conducteur','Conducteur de travaux',''],
            ['coordonnees','Contact / Téléphone',''],
          ].map(([k, lbl, ph]) => (
            <div key={k}>
              <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>{lbl}</label>
              <input type={ph==='date'?'date':'text'} value={ident[k]||''} onChange={e=>setIdent(p=>({...p,[k]:e.target.value}))}
                placeholder={ph!=='date'?ph:''} style={INPUT} />
            </div>
          ))}
        </div>
      </div>

      {/* 2 — Tri 5 flux */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>2. Tri des 5 flux obligatoires (Décret 2016-288)</p>
        <p style={{ fontSize:12, color:'#6E6E73', marginBottom:12, marginTop:0 }}>
          Obligation de tri à la source pour les 5 flux : bois, métaux, plastiques, plâtre, gravats/béton.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {FLUX5.map(f => (
            <div key={f.key} style={{ border:'1px solid #E5E5EA', borderRadius:10, padding:12 }}>
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom: tri[f.key].actif ? 12 : 0 }}>
                <input type="checkbox" checked={tri[f.key].actif} onChange={e=>setTriField(f.key,'actif',e.target.checked)} style={{ width:16, height:16 }} />
                <span style={{ fontSize:20 }}>{f.icon}</span>
                <span style={{ fontWeight:700, fontSize:14 }}>{f.label}</span>
                {!tri[f.key].actif && <span style={{ fontSize:12, color:'#C0392B', marginLeft:'auto' }}>Non trié</span>}
                {tri[f.key].actif && <span style={{ fontSize:12, color:'#1A7F43', marginLeft:'auto' }}>✓ Trié</span>}
              </label>
              {tri[f.key].actif && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, paddingLeft:26 }}>
                  {[['benne','N° / libellé benne'],['prestataire','Prestataire collecte'],['frequence','Fréquence enlèvement'],['centre','Centre traitement']].map(([fk,lbl])=>(
                    <div key={fk}>
                      <label style={{ fontSize:11, color:'#6E6E73', display:'block', marginBottom:3 }}>{lbl}</label>
                      <input value={tri[f.key][fk]||''} onChange={e=>setTriField(f.key,fk,e.target.value)} style={{ ...INPUT, padding:'5px 8px', fontSize:12 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3 — Déchets inertes */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>3. Déchets Inertes (DI) — Gravats, béton, tuiles, verre…</p>
        <p style={{ fontSize:12, color:'#6E6E73', marginBottom:12, marginTop:0 }}>Acceptés en décharge classe 3 / ISDI. Pas de BSDD requis.</p>
        <TableDechet
          rows={di} setter={setDI} factory={newDI}
          columns={[
            { key:'type', label:'Type de déchet', placeholder:'Ex : Béton' },
            { key:'volume', label:'Volume estimé (m³)', placeholder:'Ex : 2.5' },
            { key:'filiere', label:'Filière / destination', placeholder:'Ex : ISDI Loiret' },
            { key:'observation', label:'Observation', placeholder:'' },
          ]}
        />
      </div>

      {/* 4 — DND */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>4. Déchets Non Dangereux (DND) — Bois, plastique, plâtre…</p>
        <p style={{ fontSize:12, color:'#6E6E73', marginBottom:12, marginTop:0 }}>Acceptés en décharge classe 2 / ISDND. BSDD selon filière.</p>
        <TableDechet
          rows={dnd} setter={setDND} factory={newDND}
          columns={[
            { key:'type', label:'Type de déchet', placeholder:'Ex : Bois' },
            { key:'volume', label:'Volume (m³)', placeholder:'Ex : 1.0' },
            { key:'filiere', label:'Filière', placeholder:'Ex : Recyclerie BTP' },
            { key:'bsdd', label:'BSDD requis', type:'checkbox' },
            { key:'observation', label:'Observation', placeholder:'' },
          ]}
        />
      </div>

      {/* 5 — DD / BSDD */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>5. Déchets Dangereux (DD) — BSDD obligatoire</p>
        <p style={{ fontSize:12, color:'#6E6E73', marginBottom:12, marginTop:0 }}>
          Amiante, plomb, huiles, solvants, peintures, DEEE… — Bordereau de Suivi des Déchets Dangereux (BSDD) obligatoire. Art. R543-66 Code Environnement.
        </p>
        <TableDechet
          rows={dd} setter={setDD} factory={newDD}
          columns={[
            { key:'type', label:'Type de déchet', placeholder:'Ex : Amiante-ciment' },
            { key:'code', label:'Code déchet (ONU)', placeholder:'Ex : 17 06 05*' },
            { key:'volume', label:'Quantité / kg', placeholder:'Ex : 150' },
            { key:'filiere', label:'Filière / centre agréé', placeholder:'Ex : Triadis Déchets' },
            { key:'observation', label:'N° BSDD / observation', placeholder:'' },
          ]}
        />
      </div>

      {/* 6 — Traçabilité */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>6. Traçabilité et archivage</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>Responsable suivi déchets</label>
            <input value={tracabilite.responsable} onChange={e=>setTracabilite(p=>({...p,responsable:e.target.value}))} style={INPUT} placeholder="Nom, prénom" />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>Durée d'archivage</label>
            <input value={tracabilite.archivage} onChange={e=>setTracabilite(p=>({...p,archivage:e.target.value}))} style={INPUT} placeholder="Ex : 5 ans" />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>N° registre déchets</label>
            <input value={tracabilite.bsdNumero} onChange={e=>setTracabilite(p=>({...p,bsdNumero:e.target.value}))} style={INPUT} placeholder="Ex : REG-2025-01" />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:16 }}>
            <input type="checkbox" id="reg" checked={tracabilite.registre} onChange={e=>setTracabilite(p=>({...p,registre:e.target.checked}))} style={{ width:16, height:16 }} />
            <label htmlFor="reg" style={{ fontSize:13, fontWeight:600, cursor:'pointer' }}>Registre déchets tenu et archivé sur site</label>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>Observations complémentaires</label>
            <textarea value={tracabilite.observations} onChange={e=>setTracabilite(p=>({...p,observations:e.target.value}))}
              style={{ ...INPUT, height:70, resize:'vertical' }} placeholder="Ex : Transport assuré par transporteur agréé ADEME" />
          </div>
        </div>
      </div>

      {/* 7 — Signatures */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>7. Signatures</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[
            ['conducteur','date','Conducteur de travaux'],
            ['responsableQSE','dateQSE','Responsable QSE / Sécurité'],
          ].map(([nameKey, dateKey, lbl]) => (
            <div key={nameKey} style={{ border:'1px dashed #C7C7CC', borderRadius:10, padding:14 }}>
              <p style={{ margin:'0 0 10px', fontWeight:700, fontSize:13 }}>{lbl}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div>
                  <label style={{ fontSize:11, color:'#6E6E73', display:'block', marginBottom:3 }}>Nom complet</label>
                  <input value={sigs[nameKey]||''} onChange={e=>setSigs(p=>({...p,[nameKey]:e.target.value}))} style={INPUT} placeholder="Prénom NOM" />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#6E6E73', display:'block', marginBottom:3 }}>Date</label>
                  <input type="date" value={sigs[dateKey]||''} onChange={e=>setSigs(p=>({...p,[dateKey]:e.target.value}))} style={INPUT} />
                </div>
                <div style={{ marginTop:8, height:40, border:'1px dashed #C7C7CC', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:11, color:'#C7C7CC' }}>Zone de signature</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:11, color:'#8E8E93', marginTop:12, textAlign:'center' }}>
          Ce document est à conserver 5 ans sur le chantier et au siège social · Réf. légale : Art. R541-43 Code Environnement
        </p>
      </div>
    </div>
  );
}
