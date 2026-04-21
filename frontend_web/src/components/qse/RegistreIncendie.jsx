// ============================================================
//  RegistreIncendie.jsx — Registre de Sécurité Incendie complet
//  Art. R123-51 CCH · Arrêté 25 juin 1980 · Art. R4227-39 CT
// ============================================================

import React, { useState } from 'react';
import { genererRegistreIncendie } from '../../utils/qsePDF';

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 };
const inp = { width: '100%', padding: '8px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const sel = { ...inp, background: '#fff' };

const ORGANISMES = ['APAVE', 'Bureau Veritas', 'SOCOTEC', 'DEKRA', 'Veriforce', 'QUALICONSULT', 'Autre'];
const RESULTATS  = ['Conforme', 'Non conforme', 'Hors service', 'En cours de vérification'];

function TableauControle({ titre, lignes, setLignes, colonnes, nouvelleLigne }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{titre}</span>
        <button type="button" onClick={() => setLignes(prev => [...prev, { ...nouvelleLigne, id: Date.now() }])}
          style={{ padding: '4px 12px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          + Ajouter
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#F8F8FC', borderBottom: '2px solid #5B5BD6' }}>
              {colonnes.map(c => <th key={c.key} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#5B5BD6', fontSize: 11, whiteSpace: 'nowrap' }}>{c.label}</th>)}
              <th style={{ padding: '6px 8px', width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne, i) => (
              <tr key={ligne.id || i} style={{ borderBottom: '1px solid #F2F2F7' }}>
                {colonnes.map(c => (
                  <td key={c.key} style={{ padding: '4px 6px' }}>
                    {c.type === 'select' ? (
                      <select value={ligne[c.key] || ''} onChange={e => setLignes(prev => prev.map((l, j) => j === i ? { ...l, [c.key]: e.target.value } : l))}
                        style={{ ...sel, fontSize: 12, padding: '5px 8px' }}>
                        <option value="">—</option>
                        {c.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={c.type || 'text'} value={ligne[c.key] || ''} placeholder={c.ph}
                        onChange={e => setLignes(prev => prev.map((l, j) => j === i ? { ...l, [c.key]: e.target.value } : l))}
                        style={{ ...inp, fontSize: 12, padding: '5px 8px' }} />
                    )}
                  </td>
                ))}
                <td style={{ padding: '4px 6px' }}>
                  <button type="button" onClick={() => setLignes(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: '#FFE5E5', border: 'none', borderRadius: 5, cursor: 'pointer', color: '#C0392B', padding: '3px 7px', fontSize: 13 }}>✕</button>
                </td>
              </tr>
            ))}
            {lignes.length === 0 && (
              <tr><td colSpan={colonnes.length + 1} style={{ padding: '12px', textAlign: 'center', color: '#636363', fontSize: 12 }}>Aucune entrée — cliquez "Ajouter"</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function RegistreIncendie({ onRetour }) {
  // ─── Informations générales
  const [info, setInfo] = useState({
    entreprise: '', siret: '', etablissement: '', adresse: '',
    typeEtablissement: 'Chantier BTP', categorieERP: 'Non applicable',
    responsableIncendie: '', dirigeant: '', effectifMaximal: '',
    organismeRef: '', dateVerification: new Date().toISOString().split('T')[0],
  });

  // ─── Extincteurs
  const [extincteurs, setExtincteurs] = useState([
    { id: 1, localisation: 'Entrée principale', type: 'CO2 2kg', numero: '', dateDernier: '', dateProchain: '', organisme: 'APAVE', resultat: 'Conforme' },
    { id: 2, localisation: 'Atelier / Chaufferie', type: 'Poudre 6kg', numero: '', dateDernier: '', dateProchain: '', organisme: '', resultat: '' },
  ]);

  // ─── RIA et colonnes sèches
  const [ria, setRia] = useState([
    { id: 1, localisation: '', type: 'RIA DN25', numero: '', dateDernier: '', dateProchain: '', organisme: '', resultat: 'Conforme' },
  ]);

  // ─── SSI (détection, alarme, éclairage, portes CF)
  const [ssi, setSsi] = useState([
    { id: 1, equipement: 'Centrale SSI / Tableau de signalisation', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'Oui' },
    { id: 2, equipement: 'Détecteurs automatiques (fumée/chaleur)', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'Oui' },
    { id: 3, equipement: 'Déclencheurs manuels', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'Oui' },
    { id: 4, equipement: 'Éclairage de sécurité (BAES/BAEH)', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'Oui' },
    { id: 5, equipement: 'Désenfumage', localisation: 'N/A', dateDernier: '', dateProchain: '', organisme: '', conforme: 'N/A' },
    { id: 6, equipement: 'Portes coupe-feu / EI60 / EI90', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'Oui' },
    { id: 7, equipement: 'Colonne sèche / humide', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'N/A' },
  ]);

  // ─── Exercices d'évacuation
  const [exercices, setExercices] = useState([]);

  // ─── Incidents
  const [incidents, setIncidents] = useState([]);

  // ─── Personnel formé
  const [personnelForme, setPersonnelForme] = useState([
    { id: 1, nom: '', fonction: 'SST — Sauveteur Secouriste du Travail', formation: 'SST', organisme: '', dateFormation: '', validite: '2 ans' },
    { id: 2, nom: '', fonction: 'Équipier de Première Intervention (EPI)', formation: 'EPI', organisme: '', dateFormation: '', validite: '1 an' },
  ]);

  function handleInfo(k, v) { setInfo(prev => ({ ...prev, [k]: v })); }

  function exportPDF() {
    genererRegistreIncendie({ ...info, extincteurs, ria, ssi, exercices, incidents, personnelForme });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <button onClick={onRetour} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B5BD6', fontSize: 14, fontWeight: 600, padding: '0 0 4px', display: 'block' }}>← Retour aux documents</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Registre de Sécurité Incendie</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6E6E73' }}>
            Art. R123-51 CCH · Arrêté du 25 juin 1980 · Art. R4227-39 CT — Obligatoire pour tout établissement
          </p>
        </div>
        <button onClick={exportPDF}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
          ⬇ Exporter PDF
        </button>
      </div>

      {/* Alerte légale */}
      <div style={{ background: '#FFF3E0', border: '1px solid #FF9500', borderRadius: 10, padding: '10px 16px', fontSize: 13 }}>
        <strong>⚖️ Obligations légales :</strong> Ce registre doit être tenu à jour en permanence, présenté à toute demande de l'inspection du travail ou des sapeurs-pompiers, et conservé pendant toute la durée de vie de l'établissement. Le contrôle annuel des extincteurs et l'exercice d'évacuation annuel sont obligatoires.
      </div>

      {/* Section 1 — Informations générales */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,.08)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#5B5BD6', borderBottom: '2px solid #5B5BD6', paddingBottom: 8 }}>
          1. Informations de l'établissement
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { k: 'entreprise', label: 'Nom de l\'entreprise *', ph: 'Bernard Martin BTP' },
            { k: 'siret', label: 'SIRET', ph: '123 456 789 00012' },
            { k: 'etablissement', label: 'Nom de l\'établissement / chantier', ph: 'Chantier Dupont, Bâtiment A' },
            { k: 'adresse', label: 'Adresse complète *', ph: '12 rue des Artisans, 13005 Marseille' },
            { k: 'typeEtablissement', label: 'Type d\'établissement', type: 'select', options: ['Chantier BTP', 'Bureau', 'Entrepôt / Atelier', 'ERP (Établissement Recevant du Public)', 'Immeuble de Grande Hauteur (IGH)', 'Autre'] },
            { k: 'categorieERP', label: 'Catégorie ERP', ph: 'Non applicable / 1ère à 5ème catégorie' },
            { k: 'responsableIncendie', label: 'Responsable sécurité incendie *', ph: 'Nom Prénom' },
            { k: 'dirigeant', label: 'Dirigeant / Gérant', ph: 'Nom Prénom' },
            { k: 'effectifMaximal', label: 'Effectif maximal sur site', ph: '15 personnes' },
            { k: 'organismeRef', label: 'Organisme vérificateur agréé', type: 'select', options: ORGANISMES },
            { k: 'dateVerification', label: 'Date de la dernière vérification globale', type: 'date' },
          ].map(f => (
            <div key={f.k} style={{ gridColumn: f.k === 'adresse' ? 'span 2' : 'auto' }}>
              <label style={lbl}>{f.label}</label>
              {f.type === 'select' ? (
                <select value={info[f.k] || ''} onChange={e => handleInfo(f.k, e.target.value)} style={sel}>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type || 'text'} value={info[f.k] || ''} onChange={e => handleInfo(f.k, e.target.value)} placeholder={f.ph} style={inp} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 — Extincteurs */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,.08)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#5B5BD6', borderBottom: '2px solid #5B5BD6', paddingBottom: 8, marginBottom: 16 }}>
          2. Extincteurs — Vérification annuelle obligatoire
        </h3>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6E6E73' }}>
          Art. MS40 IGH · Arrêté du 25 juin 1980 · Contrôle annuel par organisme agréé obligatoire — Norme NF EN 3
        </p>
        <TableauControle
          titre=""
          lignes={extincteurs}
          setLignes={setExtincteurs}
          nouvelleLigne={{ localisation: '', type: 'Poudre 6kg', numero: '', dateDernier: '', dateProchain: '', organisme: '', resultat: 'Conforme' }}
          colonnes={[
            { key: 'localisation', label: 'Localisation', ph: 'Hall entrée, atelier...' },
            { key: 'type', label: 'Type / Capacité', ph: 'CO2 2kg, Poudre 6kg...' },
            { key: 'numero', label: 'N° série', ph: '' },
            { key: 'dateDernier', label: 'Dernier contrôle', type: 'date' },
            { key: 'dateProchain', label: 'Prochain contrôle', type: 'date' },
            { key: 'organisme', label: 'Organisme', type: 'select', options: ORGANISMES },
            { key: 'resultat', label: 'Résultat', type: 'select', options: RESULTATS },
          ]}
        />
      </div>

      {/* Section 3 — RIA / Colonnes */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,.08)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#5B5BD6', borderBottom: '2px solid #5B5BD6', paddingBottom: 8, marginBottom: 16 }}>
          3. RIA et Colonnes sèches / humides — Contrôle semestriel
        </h3>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6E6E73' }}>Norme NF S61-213 · Vérification semestrielle par organisme agréé</p>
        <TableauControle
          titre=""
          lignes={ria}
          setLignes={setRia}
          nouvelleLigne={{ localisation: '', type: 'RIA DN25', numero: '', dateDernier: '', dateProchain: '', organisme: '', resultat: 'Conforme' }}
          colonnes={[
            { key: 'localisation', label: 'Localisation / N°', ph: 'Couloir Rdc, n°01...' },
            { key: 'type', label: 'Type', ph: 'RIA DN25, Colonne sèche...' },
            { key: 'dateDernier', label: 'Dernier contrôle', type: 'date' },
            { key: 'dateProchain', label: 'Prochain contrôle', type: 'date' },
            { key: 'organisme', label: 'Organisme', type: 'select', options: ORGANISMES },
            { key: 'resultat', label: 'Résultat', type: 'select', options: RESULTATS },
          ]}
        />
      </div>

      {/* Section 4 — SSI / Éclairage / Portes CF */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,.08)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#5B5BD6', borderBottom: '2px solid #5B5BD6', paddingBottom: 8, marginBottom: 16 }}>
          4. Système de Sécurité Incendie, Détection et Éclairage de sécurité
        </h3>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6E6E73' }}>
          SSI : NF S61-970 · BAES : NF EN 60598-2-22 · Vérification annuelle par organisme agréé
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#F8F8FC', borderBottom: '2px solid #5B5BD6' }}>
                {['Équipement', 'Localisation', 'Dernier contrôle', 'Prochain contrôle', 'Organisme agréé', 'Conforme'].map(h => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#5B5BD6', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ssi.map((item, i) => (
                <tr key={item.id || i} style={{ borderBottom: '1px solid #F2F2F7' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600, fontSize: 12 }}>{item.equipement}</td>
                  {['localisation', 'dateDernier', 'dateProchain', 'organisme'].map(k => (
                    <td key={k} style={{ padding: '4px 6px' }}>
                      {k === 'organisme' ? (
                        <select value={item[k] || ''} onChange={e => setSsi(prev => prev.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x))}
                          style={{ ...sel, fontSize: 12, padding: '5px 8px' }}>
                          <option value="">—</option>
                          {ORGANISMES.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={k.includes('date') ? 'date' : 'text'} value={item[k] || ''}
                          onChange={e => setSsi(prev => prev.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x))}
                          style={{ ...inp, fontSize: 12, padding: '5px 8px' }} />
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '4px 6px' }}>
                    <select value={item.conforme || 'Oui'} onChange={e => setSsi(prev => prev.map((x, j) => j === i ? { ...x, conforme: e.target.value } : x))}
                      style={{ ...sel, fontSize: 12, padding: '5px 8px', color: item.conforme === 'Non conforme' ? '#C0392B' : item.conforme === 'N/A' ? '#636363' : '#1A7F43', fontWeight: 600 }}>
                      {['Oui', 'Non conforme', 'N/A', 'À vérifier'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5 — Exercices d'évacuation */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,.08)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#5B5BD6', borderBottom: '2px solid #5B5BD6', paddingBottom: 8, marginBottom: 16 }}>
          5. Exercices d'évacuation — Annuel obligatoire
        </h3>
        <div style={{ background: '#FFF3E0', border: '1px solid #FF9500', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 12 }}>
          ⚠️ <strong>Art. R4227-39 CT :</strong> Au moins un exercice d'évacuation par an est obligatoire. Les résultats doivent être consignés dans ce registre.
        </div>
        <TableauControle
          titre=""
          lignes={exercices}
          setLignes={setExercices}
          nouvelleLigne={{ date: new Date().toISOString().split('T')[0], heure: '', participants: '', duree: '', observations: '', responsable: '' }}
          colonnes={[
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'heure', label: 'Heure', ph: '10:00' },
            { key: 'participants', label: 'Nb participants', ph: '12' },
            { key: 'duree', label: 'Durée évacuation', ph: '2 min 30s' },
            { key: 'observations', label: 'Observations / Anomalies', ph: 'RAS / Délai OK' },
            { key: 'responsable', label: 'Responsable exercice', ph: 'Nom Prénom' },
          ]}
        />
      </div>

      {/* Section 6 — Incidents */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,.08)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#5B5BD6', borderBottom: '2px solid #5B5BD6', paddingBottom: 8 }}>
          6. Incidents et interventions des secours
        </h3>
        <TableauControle
          titre=""
          lignes={incidents}
          setLignes={setIncidents}
          nouvelleLigne={{ date: new Date().toISOString().split('T')[0], heure: '', nature: '', zone: '', pompiers: 'Non', mesures: '', declaration: 'Non' }}
          colonnes={[
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'heure', label: 'Heure', ph: '14:30' },
            { key: 'nature', label: 'Nature de l\'incident', ph: 'Début d\'incendie…' },
            { key: 'zone', label: 'Zone', ph: 'Atelier R+1' },
            { key: 'pompiers', label: 'Pompiers', type: 'select', options: ['Non', 'Oui'] },
            { key: 'mesures', label: 'Mesures prises', ph: 'Extinction CO2…' },
            { key: 'declaration', label: 'Décl. assurance', type: 'select', options: ['Non', 'Oui', 'N/A'] },
          ]}
        />
      </div>

      {/* Section 7 — Personnel formé */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,.08)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#5B5BD6', borderBottom: '2px solid #5B5BD6', paddingBottom: 8, marginBottom: 16 }}>
          7. Personnel formé à la sécurité incendie
        </h3>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6E6E73' }}>
          SST (Sauveteur Secouriste du Travail) : validité 2 ans · EPI (Équipier Première Intervention) : recyclage annuel recommandé
        </p>
        <TableauControle
          titre=""
          lignes={personnelForme}
          setLignes={setPersonnelForme}
          nouvelleLigne={{ nom: '', fonction: 'SST', formation: 'SST', organisme: '', dateFormation: '', validite: '2 ans' }}
          colonnes={[
            { key: 'nom', label: 'Nom / Prénom', ph: 'Martin Jean' },
            { key: 'fonction', label: 'Fonction', type: 'select', options: ['SST — Sauveteur Secouriste du Travail', 'EPI — Équipier Première Intervention', 'ESI — Équipier Seconde Intervention', 'Responsable évacuation', 'Guide d\'évacuation', 'Technicien SSI', 'Autre'] },
            { key: 'formation', label: 'Formation', ph: 'SST, EPI, ESI…' },
            { key: 'organisme', label: 'Organisme', ph: 'Croix-Rouge, APAVE…' },
            { key: 'dateFormation', label: 'Date formation', type: 'date' },
            { key: 'validite', label: 'Validité', ph: '2 ans' },
          ]}
        />
      </div>

      {/* Bouton export bas de page */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
        <button onClick={onRetour}
          style={{ padding: '10px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          ← Retour
        </button>
        <button onClick={exportPDF}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
          ⬇ Exporter PDF officiel
        </button>
      </div>

      {/* Références légales */}
      <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 18px', fontSize: 12, color: '#6E6E73', borderLeft: '4px solid #5B5BD6' }}>
        <strong>Références légales :</strong> Art. R123-51 du Code de la Construction et de l'Habitation (CCH) · Art. R123-43 CCH — Contrôles périodiques des installations de protection contre l'incendie · Arrêté du 25 juin 1980 portant règlement de sécurité contre les risques d'incendie et de panique dans les ERP · Art. R4227-39 CT — Exercice d'évacuation annuel · Norme NF EN 3 (extincteurs) · Norme NF S61-213 (RIA) · NF S61-970 (SSI)
      </div>
    </div>
  );
}
