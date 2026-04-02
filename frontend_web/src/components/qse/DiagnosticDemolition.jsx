import React, { useState } from 'react';
import { genererDiagnostic } from '../../utils/qsePDF';

const INPUT = { padding:'8px 12px', border:'1px solid #E5E5EA', borderRadius:8, fontSize:14, width:'100%', boxSizing:'border-box' };
const BTN_VIOLET = { padding:'8px 18px', background:'#5B5BD6', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14 };
const BTN_GHOST = { padding:'8px 14px', background:'#F2F2F7', color:'#3A3A3C', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:13 };
const CARD = { background:'#fff', borderRadius:14, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', marginBottom:16 };
const SECTION_TITLE = { fontSize:14, fontWeight:700, color:'#5B5BD6', marginBottom:12, paddingBottom:6, borderBottom:'2px solid #E3E3F8' };
const ALERT_STYLE = { background:'#FFF3E0', border:'1px solid #FFB74D', borderRadius:10, padding:12, fontSize:12, color:'#E65100', marginBottom:12 };

const newAmiante = () => ({ id:Date.now(), localisation:'', type:'', etat:'', quantite:'', recommandation:'' });
const newPlomb   = () => ({ id:Date.now(), localisation:'', concentration:'', surface:'', etat:'', travaux:'' });
const newSubst   = () => ({ id:Date.now(), substance:'', emplacement:'', quantite:'', traitement:'' });
const newDechet  = () => ({ id:Date.now(), categorie:'', code:'', quantite:'', filiere:'' });

const ETAT_AMIANTE = ['Bon état (confinement)', 'Dégradé (retrait nécessaire)', 'Très dégradé (urgence)'];
const ETAT_PLOMB   = ['< 1 mg/cm² (absence)', '1-5 mg/cm² (présence)', '> 5 mg/cm² (fort)'];

export default function DiagnosticDemolition({ onRetour }) {
  const [batiment, setBatiment] = useState({ adresse:'', commune:'', anneeConstruction:'', surface:'', usage:'', proprietaire:'', permisNumero:'', datePermis:'' });
  const [diagnostic, setDiag] = useState({ dateVisite:new Date().toISOString().slice(0,10), operateur:'', qualification:'', rapport:'' });
  const [amiante, setAmiante] = useState([newAmiante()]);
  const [amianteConclusion, setAmianteConclusion] = useState('');
  const [plomb, setPlomb] = useState([newPlomb()]);
  const [plombConclusion, setPlombConclusion] = useState('');
  const [autresSubst, setAutresSubst] = useState([newSubst()]);
  const [dechets, setDechets] = useState([newDechet()]);
  const [recommandations, setRecommandations] = useState('');
  const [operateur, setOperateur] = useState({ nom:'', qualification:'', organisme:'', attestation:'', dateRapport:new Date().toISOString().slice(0,10) });
  const [sigs, setSigs] = useState({ diagnostiqueur:'', date:new Date().toISOString().slice(0,10), maitreDOuvrage:'', dateMO:new Date().toISOString().slice(0,10), conducteur:'', dateCT:new Date().toISOString().slice(0,10) });

  const setRow = (setter, id, field, val) => setter(rows => rows.map(r => r.id === id ? { ...r, [field]: val } : r));
  const addRow = (setter, factory) => setter(rows => [...rows, factory()]);
  const delRow = (setter, id) => setter(rows => rows.filter(r => r.id !== id));

  const handlePDF = () => {
    genererDiagnostic({
      batiment,
      diagnostic: { ...diagnostic, amianteConclusion, plombConclusion },
      amiante,
      plomb,
      autresSubstances: autresSubst,
      estimationDechets: dechets,
      recommandations,
      operateur,
      signatures: sigs,
    });
  };

  const TableDiag = ({ rows, setter, columns, factory }) => (
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
                {c.options ? (
                  <select value={row[c.key]||''} onChange={e=>setRow(setter,row.id,c.key,e.target.value)}
                    style={{ ...INPUT, padding:'4px 8px', fontSize:12 }}>
                    <option value="">—</option>
                    {c.options.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input value={row[c.key]||''} onChange={e=>setRow(setter,row.id,c.key,e.target.value)}
                    style={{ ...INPUT, padding:'4px 8px', fontSize:12 }} placeholder={c.placeholder||''} />
                )}
              </td>
            ))}
            <td style={{ padding:'4px 6px', textAlign:'center' }}>
              {rows.length > 1 && (
                <button onClick={()=>delRow(setter,row.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#C0392B', fontSize:16, fontWeight:700 }}>×</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={columns.length+1} style={{ paddingTop:8 }}>
            <button onClick={()=>addRow(setter,factory)} style={{ ...BTN_GHOST, fontSize:12, padding:'5px 12px' }}>+ Ajouter une ligne</button>
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
          <h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>Diagnostic Déchets / Amiante / Plomb avant Démolition</h2>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#6E6E73' }}>Art. R4412-97 CT (amiante) · Art. L271-4 CCH (plomb/CREP) · Décret 2011-610 · Arrêté du 12/12/2012</p>
        </div>
        <button onClick={handlePDF} style={{ ...BTN_VIOLET, display:'flex', alignItems:'center', gap:8 }}>
          <span>⬇</span> Exporter PDF
        </button>
      </div>

      <div style={ALERT_STYLE}>
        ⚠️ <strong>Obligation légale :</strong> Tout bâtiment construit avant le 01/07/1997 doit faire l'objet d'un diagnostic amiante avant démolition (Art. R4412-97 CT). Le diagnostic plomb (CREP) est obligatoire avant travaux sur bâtiment d'avant 1949. Ces diagnostics doivent être réalisés par un opérateur certifié.
      </div>

      {/* 1 — Identification bâtiment */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>1. Identification du bâtiment</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            ['adresse','Adresse complète'],
            ['commune','Commune'],
            ['anneeConstruction','Année de construction'],
            ['surface','Surface (m²)'],
            ['usage','Usage (habitation/tertiaire/industriel)'],
            ['proprietaire','Propriétaire / Maître d\'ouvrage'],
            ['permisNumero','N° permis de démolir'],
            ['datePermis','Date permis de démolir','date'],
          ].map(([k,lbl,type])=>(
            <div key={k}>
              <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>{lbl}</label>
              <input type={type||'text'} value={batiment[k]||''} onChange={e=>setBatiment(p=>({...p,[k]:e.target.value}))} style={INPUT} />
            </div>
          ))}
        </div>
      </div>

      {/* 2 — Infos diagnostic */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>2. Informations diagnostic</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>Date visite</label>
            <input type="date" value={diagnostic.dateVisite} onChange={e=>setDiag(p=>({...p,dateVisite:e.target.value}))} style={INPUT} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>Opérateur diagnostiqueur</label>
            <input value={diagnostic.operateur} onChange={e=>setDiag(p=>({...p,operateur:e.target.value}))} style={INPUT} placeholder="Nom / Société" />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>N° certification / Qualification</label>
            <input value={diagnostic.qualification} onChange={e=>setDiag(p=>({...p,qualification:e.target.value}))} style={INPUT} placeholder="Ex : COFRAC N°1-2345" />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>N° rapport diagnostic</label>
            <input value={diagnostic.rapport} onChange={e=>setDiag(p=>({...p,rapport:e.target.value}))} style={INPUT} placeholder="Ex : DIAG-2025-001" />
          </div>
        </div>
      </div>

      {/* 3 — Amiante */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>3. Diagnostic Amiante (Art. R4412-97 Code du Travail)</p>
        <p style={{ fontSize:12, color:'#6E6E73', marginBottom:12, marginTop:0 }}>
          Obligatoire si bâtiment construit avant le 01/07/1997. Opérateur accrédité COFRAC requis.
        </p>
        <TableDiag
          rows={amiante} setter={setAmiante} factory={newAmiante}
          columns={[
            { key:'localisation', label:'Localisation', placeholder:'Ex : Faux plafond RDC' },
            { key:'type', label:'Type de matériau', placeholder:'Ex : Flocage / amiante-ciment' },
            { key:'etat', label:'État', options: ETAT_AMIANTE },
            { key:'quantite', label:'Quantité (m²/m³)', placeholder:'Ex : 45 m²' },
            { key:'recommandation', label:'Recommandation', placeholder:'Ex : Retrait avant démolition' },
          ]}
        />
        <div style={{ marginTop:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>Conclusion amiante</label>
          <textarea value={amianteConclusion} onChange={e=>setAmianteConclusion(e.target.value)}
            style={{ ...INPUT, height:60, resize:'vertical' }}
            placeholder="Ex : Présence d'amiante-ciment confirmée. Retrait obligatoire par entreprise certifiée SS3 avant tous travaux." />
        </div>
      </div>

      {/* 4 — Plomb / CREP */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>4. Diagnostic Plomb / CREP (Art. L271-4 CCH)</p>
        <p style={{ fontSize:12, color:'#6E6E73', marginBottom:12, marginTop:0 }}>
          Obligatoire pour bâtiments construits avant le 01/01/1949. Seuil : 1 mg/cm².
        </p>
        <TableDiag
          rows={plomb} setter={setPlomb} factory={newPlomb}
          columns={[
            { key:'localisation', label:'Localisation', placeholder:'Ex : Peinture murs Étage 1' },
            { key:'concentration', label:'Concentration', options: ETAT_PLOMB },
            { key:'surface', label:'Surface (m²)', placeholder:'Ex : 120' },
            { key:'etat', label:'État de conservation', placeholder:'Ex : Dégradé' },
            { key:'travaux', label:'Travaux préconisés', placeholder:'Ex : Décapage sécurisé' },
          ]}
        />
        <div style={{ marginTop:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>Conclusion plomb</label>
          <textarea value={plombConclusion} onChange={e=>setPlombConclusion(e.target.value)}
            style={{ ...INPUT, height:60, resize:'vertical' }}
            placeholder="Ex : Peintures au plomb détectées > 1 mg/cm². Travaux réalisés par opérateur formé SS4 obligatoire." />
        </div>
      </div>

      {/* 5 — Autres substances */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>5. Autres substances dangereuses (PCB, HAP, Mercure…)</p>
        <TableDiag
          rows={autresSubst} setter={setAutresSubst} factory={newSubst}
          columns={[
            { key:'substance', label:'Substance', placeholder:'Ex : PCB / HAP / Mercure' },
            { key:'emplacement', label:'Emplacement', placeholder:'Ex : Condensateurs électriques' },
            { key:'quantite', label:'Quantité estimée', placeholder:'Ex : 5 kg' },
            { key:'traitement', label:'Mode de traitement', placeholder:'Ex : Collecte déchets dangereux' },
          ]}
        />
      </div>

      {/* 6 — Estimation déchets démolition */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>6. Estimation des déchets de démolition</p>
        <TableDiag
          rows={dechets} setter={setDechets} factory={newDechet}
          columns={[
            { key:'categorie', label:'Catégorie', placeholder:'Ex : Béton / Bois / Métaux / DD' },
            { key:'code', label:'Code déchet', placeholder:'Ex : 17 01 01' },
            { key:'quantite', label:'Quantité (t ou m³)', placeholder:'Ex : 120 t' },
            { key:'filiere', label:'Filière de traitement', placeholder:'Ex : Centre de tri BTP' },
          ]}
        />
      </div>

      {/* 7 — Recommandations */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>7. Recommandations générales</p>
        <textarea value={recommandations} onChange={e=>setRecommandations(e.target.value)}
          style={{ ...INPUT, height:100, resize:'vertical' }}
          placeholder="Ex : 1. Faire retirer l'amiante-ciment par entreprise certifiée SS3 avant le démarrage de la démolition&#10;2. Mettre en place une zone d'accès restreint pendant les travaux de désamiantage&#10;3. Prévoir 30 jours de préavis pour notification CARSAT&#10;4. Transmettre le PPSPS mis à jour au CSPS" />
      </div>

      {/* 8 — Qualifications opérateur */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>8. Qualifications de l\'opérateur diagnostiqueur</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            ['nom','Nom et prénom de l\'opérateur'],
            ['qualification','N° certification (COFRAC/Certibiocide)'],
            ['organisme','Organisme certificateur'],
            ['attestation','N° attestation de compétences'],
            ['dateRapport','Date de rédaction du rapport','date'],
          ].map(([k,lbl,type])=>(
            <div key={k}>
              <label style={{ fontSize:12, fontWeight:600, color:'#6E6E73', display:'block', marginBottom:4 }}>{lbl}</label>
              <input type={type||'text'} value={operateur[k]||''} onChange={e=>setOperateur(p=>({...p,[k]:e.target.value}))} style={INPUT} />
            </div>
          ))}
        </div>
      </div>

      {/* 9 — Signatures */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>9. Signatures</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
          {[
            ['diagnostiqueur','date','Diagnostiqueur certifié'],
            ['maitreDOuvrage','dateMO','Maître d\'ouvrage'],
            ['conducteur','dateCT','Conducteur de travaux'],
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
          Ce rapport est à annexer au PPSPS et au PGCSPS · Conservation obligatoire 10 ans · Art. L4111-6 Code du Travail
        </p>
      </div>
    </div>
  );
}
