import React, { useState } from 'react';
import { genererPPSPS } from '../../utils/qsePDF';

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const ta = { ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 };

function Section({ titre, color = '#5B5BD6', children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)', marginBottom: 16 }}>
      <div style={{ padding: '10px 18px', background: color, color: '#fff', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {titre}
      </div>
      <div style={{ padding: '20px 22px' }}>{children}</div>
    </div>
  );
}

function Grid({ cols = '1fr 1fr', children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>{children}</div>;
}

function F({ label, span, children }) {
  return (
    <div style={span ? { gridColumn: span } : {}}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

const today = new Date().toISOString().split('T')[0];

const PHASES_INIT = [
  { id: 1, phase: 'Installation de chantier', debut: '', fin: '', entreprises: '', risques: '' },
  { id: 2, phase: 'Gros œuvre / Fondations', debut: '', fin: '', entreprises: '', risques: 'Chute de hauteur, manutention lourde' },
  { id: 3, phase: 'Second œuvre', debut: '', fin: '', entreprises: '', risques: 'Co-activité, électrique, chimique' },
  { id: 4, phase: 'Finitions / Nettoyage', debut: '', fin: '', entreprises: '', risques: 'COV, poussières' },
];

const RISQUES_INIT = [
  { id: 1, risque: 'Chutes de hauteur', categorie: 'Physique', mesures: 'Garde-corps réglementaires, port du harnais, formation travail en hauteur', responsable: 'Chef de chantier', priorite: 'Critique' },
  { id: 2, risque: 'Co-activité avec entreprises extérieures', categorie: 'Organisationnel', mesures: 'Plan de prévention signé, réunion de coordination, zones d\'exclusion', responsable: 'Patron', priorite: 'Élevé' },
  { id: 3, risque: 'Manutention manuelle (charges > 25 kg)', categorie: 'Physique', mesures: 'Aides mécaniques, formation gestes et postures, limite 25 kg/personne', responsable: 'RH', priorite: 'Moyen' },
  { id: 4, risque: 'Exposition produits chimiques (peintures, solvants)', categorie: 'Chimique', mesures: 'FDS disponibles, EPI adaptés, ventilation, stockage séparé', responsable: 'Chef d\'équipe', priorite: 'Élevé' },
  { id: 5, risque: 'Risque électrique (travaux voisinage)', categorie: 'Électrique', mesures: 'Habilitation électrique, consignation, VGP appareils électriques', responsable: 'Électricien responsable', priorite: 'Critique' },
];

export default function PPSPS({ onRetour }) {
  /* ── Section 1 — Renseignements chantier ── */
  const [chantier, setChantier] = useState({
    nomChantier: '',
    adresse: '',
    commune: '',
    natureOperation: '',
    maitreouvrage: '',
    adresseMO: '',
    contactMO: '',
    maitreDOeuvre: '',
    contactMOE: '',
    coordoSPS: '',
    contactCSPS: '',
    dateDebut: today,
    dateFin: '',
    dureeEstimee: '',
    effectifMaxSimultane: '',
    effectifTotal: '',
    montantTravaux: '',
    categorieChantier: 'Catégorie 1 (> 10 000 j-h)',
  });

  /* ── Section 2 — Entreprise intervenante ── */
  const [entreprise, setEntreprise] = useState({
    nom: 'Bernard Martin BTP',
    siret: '123 456 789 00012',
    adresse: '',
    telephone: '',
    email: '',
    activite: 'BTP — Maçonnerie, Plomberie, Électricité',
    responsableChantier: '',
    responsableSecurite: '',
    assuranceRCD: '',
    assuranceDecennale: '',
    numDecennale: '',
    dateValiditeDecennale: '',
  });

  /* ── Section 3 — Phasage travaux ── */
  const [phases, setPhases] = useState(PHASES_INIT);

  /* ── Section 4 — Risques et mesures ── */
  const [risques, setRisques] = useState(RISQUES_INIT);

  /* ── Section 5 — Installations de chantier ── */
  const [installations, setInstallations] = useState({
    baseVie: '',
    sanitaires: '',
    stockageMateriaux: '',
    acces: '',
    signalisation: '',
    gardiennage: false,
    branchementElec: '',
    branchementEau: '',
    positionGrue: '',
    airesDeStockage: '',
  });

  /* ── Section 6 — Gestion des déchets ── */
  const [dechets, setDechets] = useState({
    planGestion: false,
    tri5flux: false,
    presenceAmiante: false,
    presencePlomb: false,
    diagnosticRealise: false,
    operateurAgree: '',
    bsdObligatoire: false,
    frequenceEnlevement: '',
  });

  /* ── Section 7 — Formations et habilitations ── */
  const [formations, setFormations] = useState({
    sst: false, caces: false, hauteur: false, habilElec: false,
    amiante: false, echafaudage: false, premiers_secours: false,
    autresFormations: '',
    nombreSST: '',
    infirmerie: '',
    contactSamu: '15',
    contactSapeurs: '18',
    contactMedecinTravail: '',
    hositalProche: '',
  });

  /* ── Section 8 — Signatures ── */
  const [signatures, setSignatures] = useState({
    redacteur: { nom: '', fonction: 'Responsable QSE', date: today },
    dirigeant: { nom: '', fonction: 'Gérant / Dirigeant', date: today },
    csps: { nom: '', fonction: 'Coordinateur SPS', date: today },
  });

  function handleExportPDF() {
    genererPPSPS({ chantier, entreprise, phases, risques, installations, dechets, formations, signatures });
  }

  function addPhase() {
    setPhases(p => [...p, { id: Date.now(), phase: '', debut: '', fin: '', entreprises: '', risques: '' }]);
  }

  function addRisque() {
    setRisques(p => [...p, { id: Date.now(), risque: '', categorie: 'Physique', mesures: '', responsable: '', priorite: 'Moyen' }]);
  }

  const PRIORITE_COLORS = { Critique: '#C0392B', Élevé: '#E65100', Moyen: '#856404', Faible: '#1A7F43' };

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button onClick={onRetour} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B5BD6', fontSize: 14, fontWeight: 600, padding: '0 0 4px' }}>
            ← Retour aux documents
          </button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>PPSPS — Plan Particulier de Sécurité et de Protection de la Santé</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6E6E73' }}>
            Art. L4532-8 et R4532-61 à R4532-98 CT · Décret n°94-1159 · Obligatoire sur chantiers soumis à coordination SPS
          </p>
        </div>
        <button onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
          ⬇ Exporter PDF officiel
        </button>
      </div>

      <div style={{ background: '#E3F2FD', border: '1px solid #1565C0', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#1565C0' }}>
        ℹ️ Le PPSPS doit être remis au Coordinateur SPS <strong>avant tout démarrage des travaux</strong> (Art. R4532-66 CT).
        Il doit être mis à jour à chaque modification significative du chantier.
      </div>

      {/* Section 1 — Renseignements chantier */}
      <Section titre="1. Renseignements sur le chantier" color="#1C1C1E">
        <Grid cols="1fr 1fr">
          <F label="Nom / Intitulé de l'opération *" span="1 / -1">
            <input value={chantier.nomChantier} onChange={e => setChantier(p => ({ ...p, nomChantier: e.target.value }))} placeholder="Ex: Rénovation complète appartement Dupont" style={inp} />
          </F>
          <F label="Adresse du chantier *">
            <input value={chantier.adresse} onChange={e => setChantier(p => ({ ...p, adresse: e.target.value }))} placeholder="N°, rue, code postal" style={inp} />
          </F>
          <F label="Commune">
            <input value={chantier.commune} onChange={e => setChantier(p => ({ ...p, commune: e.target.value }))} placeholder="Ville" style={inp} />
          </F>
          <F label="Nature de l'opération" span="1 / -1">
            <textarea value={chantier.natureOperation} onChange={e => setChantier(p => ({ ...p, natureOperation: e.target.value }))} rows={2} placeholder="Construction neuve, rénovation, extension, démolition…" style={ta} />
          </F>
          <F label="Maître d'ouvrage *">
            <input value={chantier.maitreouvrage} onChange={e => setChantier(p => ({ ...p, maitreouvrage: e.target.value }))} placeholder="Nom ou raison sociale" style={inp} />
          </F>
          <F label="Contact maître d'ouvrage">
            <input value={chantier.contactMO} onChange={e => setChantier(p => ({ ...p, contactMO: e.target.value }))} placeholder="Tél, email" style={inp} />
          </F>
          <F label="Maître d'œuvre">
            <input value={chantier.maitreDOeuvre} onChange={e => setChantier(p => ({ ...p, maitreDOeuvre: e.target.value }))} placeholder="Architecte, bureau d'études…" style={inp} />
          </F>
          <F label="Coordinateur SPS">
            <input value={chantier.coordoSPS} onChange={e => setChantier(p => ({ ...p, coordoSPS: e.target.value }))} placeholder="Nom du CSPS" style={inp} />
          </F>
          <F label="Date de début *">
            <input type="date" value={chantier.dateDebut} onChange={e => setChantier(p => ({ ...p, dateDebut: e.target.value }))} style={inp} />
          </F>
          <F label="Date de fin prévue *">
            <input type="date" value={chantier.dateFin} onChange={e => setChantier(p => ({ ...p, dateFin: e.target.value }))} style={inp} />
          </F>
          <F label="Effectif max simultané">
            <input type="number" value={chantier.effectifMaxSimultane} onChange={e => setChantier(p => ({ ...p, effectifMaxSimultane: e.target.value }))} placeholder="Ex: 12" style={inp} />
          </F>
          <F label="Catégorie du chantier">
            <select value={chantier.categorieChantier} onChange={e => setChantier(p => ({ ...p, categorieChantier: e.target.value }))} style={inp}>
              <option>Catégorie 1 (&gt; 10 000 j-h)</option>
              <option>Catégorie 2 (&gt; 500 j-h + opérations dangereuses)</option>
              <option>Catégorie 3 (autres)</option>
            </select>
          </F>
        </Grid>
      </Section>

      {/* Section 2 — Entreprise */}
      <Section titre="2. Entreprise intervenante" color="#5B5BD6">
        <Grid cols="1fr 1fr 1fr">
          <F label="Raison sociale *">
            <input value={entreprise.nom} onChange={e => setEntreprise(p => ({ ...p, nom: e.target.value }))} style={inp} />
          </F>
          <F label="N° SIRET">
            <input value={entreprise.siret} onChange={e => setEntreprise(p => ({ ...p, siret: e.target.value }))} style={inp} />
          </F>
          <F label="Téléphone">
            <input value={entreprise.telephone} onChange={e => setEntreprise(p => ({ ...p, telephone: e.target.value }))} style={inp} />
          </F>
          <F label="Adresse" span="1 / -1">
            <input value={entreprise.adresse} onChange={e => setEntreprise(p => ({ ...p, adresse: e.target.value }))} style={inp} />
          </F>
          <F label="Activité principale">
            <input value={entreprise.activite} onChange={e => setEntreprise(p => ({ ...p, activite: e.target.value }))} style={inp} />
          </F>
          <F label="Responsable de chantier">
            <input value={entreprise.responsableChantier} onChange={e => setEntreprise(p => ({ ...p, responsableChantier: e.target.value }))} placeholder="Nom Prénom" style={inp} />
          </F>
          <F label="Responsable sécurité / QSE">
            <input value={entreprise.responsableSecurite} onChange={e => setEntreprise(p => ({ ...p, responsableSecurite: e.target.value }))} placeholder="Nom Prénom" style={inp} />
          </F>
          <F label="Assurance RCD (n° police)">
            <input value={entreprise.assuranceRCD} onChange={e => setEntreprise(p => ({ ...p, assuranceRCD: e.target.value }))} placeholder="N° contrat" style={inp} />
          </F>
          <F label="Assurance décennale">
            <input value={entreprise.assuranceDecennale} onChange={e => setEntreprise(p => ({ ...p, assuranceDecennale: e.target.value }))} placeholder="Assureur" style={inp} />
          </F>
          <F label="N° police décennale">
            <input value={entreprise.numDecennale} onChange={e => setEntreprise(p => ({ ...p, numDecennale: e.target.value }))} style={inp} />
          </F>
        </Grid>
      </Section>

      {/* Section 3 — Phasage */}
      <Section titre="3. Phasage des travaux et co-activités" color="#E65100">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                {['Phase / Lot de travaux', 'Date début', 'Date fin', 'Entreprises concernées', 'Risques co-activité', ''].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: '2px solid #E5E5EA' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {phases.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F2F2F7' }}>
                  <td style={{ padding: '6px 8px' }}>
                    <input value={p.phase} onChange={e => setPhases(prev => prev.map((x, j) => j === i ? { ...x, phase: e.target.value } : x))} placeholder="Phase de travaux…" style={{ ...inp, fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input type="date" value={p.debut} onChange={e => setPhases(prev => prev.map((x, j) => j === i ? { ...x, debut: e.target.value } : x))} style={{ ...inp, fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input type="date" value={p.fin} onChange={e => setPhases(prev => prev.map((x, j) => j === i ? { ...x, fin: e.target.value } : x))} style={{ ...inp, fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input value={p.entreprises} onChange={e => setPhases(prev => prev.map((x, j) => j === i ? { ...x, entreprises: e.target.value } : x))} placeholder="Entreprises…" style={{ ...inp, fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input value={p.risques} onChange={e => setPhases(prev => prev.map((x, j) => j === i ? { ...x, risques: e.target.value } : x))} placeholder="Risques identifiés…" style={{ ...inp, fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <button onClick={() => setPhases(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30', fontSize: 16 }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addPhase} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'none', border: '1px dashed #E65100', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#E65100', fontWeight: 600 }}>
          + Ajouter une phase
        </button>
      </Section>

      {/* Section 4 — Analyse des risques */}
      <Section titre="4. Analyse des risques et mesures de prévention" color="#C0392B">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#FFF5F5' }}>
                {['Risque identifié', 'Catégorie', 'Mesures de prévention', 'Responsable', 'Priorité', ''].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#C0392B', textTransform: 'uppercase', borderBottom: '2px solid #FFE5E5', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {risques.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F2F2F7' }}>
                  <td style={{ padding: '6px 8px' }}>
                    <input value={r.risque} onChange={e => setRisques(prev => prev.map((x, j) => j === i ? { ...x, risque: e.target.value } : x))} placeholder="Danger identifié" style={{ ...inp, fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <select value={r.categorie} onChange={e => setRisques(prev => prev.map((x, j) => j === i ? { ...x, categorie: e.target.value } : x))} style={{ ...inp, fontSize: 12 }}>
                      {['Physique', 'Chimique', 'Électrique', 'Organisationnel', 'Psychosocial', 'Bruit/Vibration'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input value={r.mesures} onChange={e => setRisques(prev => prev.map((x, j) => j === i ? { ...x, mesures: e.target.value } : x))} placeholder="Mesures préventives…" style={{ ...inp, fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input value={r.responsable} onChange={e => setRisques(prev => prev.map((x, j) => j === i ? { ...x, responsable: e.target.value } : x))} placeholder="Responsable" style={{ ...inp, fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <select value={r.priorite} onChange={e => setRisques(prev => prev.map((x, j) => j === i ? { ...x, priorite: e.target.value } : x))} style={{ ...inp, fontSize: 12, color: PRIORITE_COLORS[r.priorite], fontWeight: 700 }}>
                      {['Critique', 'Élevé', 'Moyen', 'Faible'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <button onClick={() => setRisques(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30', fontSize: 16 }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addRisque} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'none', border: '1px dashed #C0392B', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#C0392B', fontWeight: 600 }}>
          + Ajouter un risque
        </button>
      </Section>

      {/* Section 5 — Installations */}
      <Section titre="5. Organisation et installations de chantier" color="#1A7F43">
        <Grid cols="1fr 1fr">
          <F label="Base vie / Vestiaires">
            <input value={installations.baseVie} onChange={e => setInstallations(p => ({ ...p, baseVie: e.target.value }))} placeholder="Emplacement, surface, équipements…" style={inp} />
          </F>
          <F label="Sanitaires">
            <input value={installations.sanitaires} onChange={e => setInstallations(p => ({ ...p, sanitaires: e.target.value }))} placeholder="Nombre, emplacement" style={inp} />
          </F>
          <F label="Accès chantier / Circulation">
            <input value={installations.acces} onChange={e => setInstallations(p => ({ ...p, acces: e.target.value }))} placeholder="Entrée/sortie, sens de circulation…" style={inp} />
          </F>
          <F label="Signalisation extérieure">
            <input value={installations.signalisation} onChange={e => setInstallations(p => ({ ...p, signalisation: e.target.value }))} placeholder="Panneaux, balises, clôtures…" style={inp} />
          </F>
          <F label="Stockage matériaux">
            <input value={installations.stockageMateriaux} onChange={e => setInstallations(p => ({ ...p, stockageMateriaux: e.target.value }))} placeholder="Zones de stockage, conditions…" style={inp} />
          </F>
          <F label="Aires de stockage déchets">
            <input value={installations.airesDeStockage} onChange={e => setInstallations(p => ({ ...p, airesDeStockage: e.target.value }))} placeholder="Benne, tri, localisation…" style={inp} />
          </F>
          <F label="Branchement électrique provisoire">
            <input value={installations.branchementElec} onChange={e => setInstallations(p => ({ ...p, branchementElec: e.target.value }))} placeholder="TGBT chantier, armoire, puissance…" style={inp} />
          </F>
          <F label="Branchement eau / évacuation">
            <input value={installations.branchementEau} onChange={e => setInstallations(p => ({ ...p, branchementEau: e.target.value }))} placeholder="Raccordement provisoire" style={inp} />
          </F>
        </Grid>
      </Section>

      {/* Section 6 — Déchets */}
      <Section titre="6. Gestion des déchets de chantier" color="#856404">
        <Grid cols="1fr 1fr 1fr">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
            <input type="checkbox" checked={dechets.planGestion} onChange={e => setDechets(p => ({ ...p, planGestion: e.target.checked }))} style={{ width: 16, height: 16 }} />
            Plan de gestion des déchets établi
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
            <input type="checkbox" checked={dechets.tri5flux} onChange={e => setDechets(p => ({ ...p, tri5flux: e.target.checked }))} style={{ width: 16, height: 16 }} />
            Tri 5 flux obligatoires en place
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
            <input type="checkbox" checked={dechets.bsdObligatoire} onChange={e => setDechets(p => ({ ...p, bsdObligatoire: e.target.checked }))} style={{ width: 16, height: 16 }} />
            BSDD pour déchets dangereux
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
            <input type="checkbox" checked={dechets.presenceAmiante} onChange={e => setDechets(p => ({ ...p, presenceAmiante: e.target.checked }))} style={{ width: 16, height: 16 }} />
            Risque amiante identifié
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
            <input type="checkbox" checked={dechets.presencePlomb} onChange={e => setDechets(p => ({ ...p, presencePlomb: e.target.checked }))} style={{ width: 16, height: 16 }} />
            Risque plomb identifié (CREP)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
            <input type="checkbox" checked={dechets.diagnosticRealise} onChange={e => setDechets(p => ({ ...p, diagnosticRealise: e.target.checked }))} style={{ width: 16, height: 16 }} />
            Diagnostic déchets réalisé
          </label>
        </Grid>
        <div style={{ marginTop: 14 }}>
          <Grid cols="1fr 1fr">
            <F label="Opérateur agréé d'élimination">
              <input value={dechets.operateurAgree} onChange={e => setDechets(p => ({ ...p, operateurAgree: e.target.value }))} placeholder="Nom de la société" style={inp} />
            </F>
            <F label="Fréquence d'enlèvement">
              <input value={dechets.frequenceEnlevement} onChange={e => setDechets(p => ({ ...p, frequenceEnlevement: e.target.value }))} placeholder="Hebdomadaire, selon remplissage…" style={inp} />
            </F>
          </Grid>
        </div>
      </Section>

      {/* Section 7 — Formations */}
      <Section titre="7. Formations, habilitations et secours" color="#5B5BD6">
        <div style={{ marginBottom: 14 }}>
          <label style={{ ...lbl, marginBottom: 8 }}>Formations et habilitations disponibles dans l'équipe</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { key: 'sst', label: '🚑 SST (Sauveteur Secouriste)' },
              { key: 'caces', label: '🏗️ CACES (engins)' },
              { key: 'hauteur', label: '⛑️ Travail en hauteur' },
              { key: 'habilElec', label: '⚡ Habilitation électrique' },
              { key: 'amiante', label: '☢️ Amiante (SS3/SS4)' },
              { key: 'echafaudage', label: '🔧 Montage échafaudages' },
              { key: 'premiers_secours', label: '🆘 PSC1 / PSE1' },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
                <input type="checkbox" checked={formations[key]} onChange={e => setFormations(p => ({ ...p, [key]: e.target.checked }))} style={{ width: 16, height: 16 }} />
                {label}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <F label="Autres formations (préciser)">
              <input value={formations.autresFormations} onChange={e => setFormations(p => ({ ...p, autresFormations: e.target.value }))} placeholder="ATEX, Nacelles, Gruiste…" style={inp} />
            </F>
          </div>
        </div>
        <Grid cols="1fr 1fr 1fr">
          <F label="Nombre de SST dans l'équipe">
            <input type="number" min="0" value={formations.nombreSST} onChange={e => setFormations(p => ({ ...p, nombreSST: e.target.value }))} style={inp} />
          </F>
          <F label="Infirmerie / Poste de secours">
            <input value={formations.infirmerie} onChange={e => setFormations(p => ({ ...p, infirmerie: e.target.value }))} placeholder="Emplacement, équipements" style={inp} />
          </F>
          <F label="Médecin du travail (contact)">
            <input value={formations.contactMedecinTravail} onChange={e => setFormations(p => ({ ...p, contactMedecinTravail: e.target.value }))} placeholder="N° de téléphone" style={inp} />
          </F>
          <F label="SAMU">
            <input value={formations.contactSamu} onChange={e => setFormations(p => ({ ...p, contactSamu: e.target.value }))} style={inp} />
          </F>
          <F label="Pompiers">
            <input value={formations.contactSapeurs} onChange={e => setFormations(p => ({ ...p, contactSapeurs: e.target.value }))} style={inp} />
          </F>
          <F label="Hôpital le plus proche">
            <input value={formations.hositalProche} onChange={e => setFormations(p => ({ ...p, hositalProche: e.target.value }))} placeholder="Nom, adresse" style={inp} />
          </F>
        </Grid>
      </Section>

      {/* Section 8 — Signatures */}
      <Section titre="8. Visa et signatures" color="#1C1C1E">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { key: 'redacteur', title: 'Rédacteur du PPSPS' },
            { key: 'dirigeant', title: 'Dirigeant / Représentant légal' },
            { key: 'csps', title: 'Coordinateur SPS (CSPS)' },
          ].map(({ key, title }) => (
            <div key={key} style={{ border: '1px solid #E5E5EA', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{title}</div>
              <F label="Nom Prénom *">
                <input value={signatures[key].nom} onChange={e => setSignatures(p => ({ ...p, [key]: { ...p[key], nom: e.target.value } }))} placeholder="Nom Prénom" style={{ ...inp, marginBottom: 8 }} />
              </F>
              <F label="Fonction">
                <input value={signatures[key].fonction} onChange={e => setSignatures(p => ({ ...p, [key]: { ...p[key], fonction: e.target.value } }))} style={{ ...inp, marginBottom: 8 }} />
              </F>
              <F label="Date de signature">
                <input type="date" value={signatures[key].date} onChange={e => setSignatures(p => ({ ...p, [key]: { ...p[key], date: e.target.value } }))} style={inp} />
              </F>
              <div style={{ height: 45, borderBottom: '1px solid #E5E5EA', marginTop: 14 }}></div>
              <div style={{ fontSize: 11, color: '#C7C7CC', textAlign: 'center', marginTop: 6 }}>Signature</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Références légales */}
      <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 18px', border: '1px solid #E5E5EA' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#3C3C43', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Références réglementaires</div>
        {[
          'Art. L4532-8 et R4532-61 à R4532-98 Code du Travail — PPSPS',
          'Décret n°94-1159 du 26 décembre 1994 — Coordination SPS',
          'Art. R4532-66 — Le PPSPS doit être remis au CSPS avant démarrage',
          'Art. R4532-71 — Contenu minimum du PPSPS',
          'Loi n°93-1418 du 31 décembre 1993 — Coordination sécurité chantiers',
        ].map((ref, i) => (
          <div key={i} style={{ fontSize: 11, color: '#6E6E73', marginBottom: 3 }}>• {ref}</div>
        ))}
        <div style={{ fontSize: 10, color: '#636363', marginTop: 10 }}>
          {entreprise.nom} — SIRET : {entreprise.siret} · {entreprise.adresse} · Document généré le {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
    </div>
  );
}
