import React, { useState, useMemo, useCallback } from 'react';
import L from '../../design/luxe';

// ─── Style constants ───────────────────────────────────────────────
const CARD = { background: L.white, border: `1px solid ${L.border}`, padding: '20px' };
const BTN = { padding: '8px 18px', background: L.noir, color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: L.font };
const BTN_O = { ...BTN, background: 'transparent', color: L.text, border: `1px solid ${L.border}` };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${L.border}`, fontSize: 13, fontFamily: L.font, outline: 'none', boxSizing: 'border-box' };
const LBL = { fontSize: 11, fontWeight: 600, color: L.textSec, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' };

// ─── BTP Zone rates ────────────────────────────────────────────────
function getBTPZone(km) {
  if (km <= 10) return { zone: 1, rate: 1.50 };
  if (km <= 20) return { zone: 2, rate: 1.84 };
  if (km <= 30) return { zone: 3, rate: 2.00 };
  if (km <= 40) return { zone: 4, rate: 2.32 };
  if (km <= 50) return { zone: 5, rate: 2.67 };
  return { zone: 6, rate: 3.05 };
}

// ─── Helpers ───────────────────────────────────────────────────────
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function today() { return new Date().toISOString().slice(0, 10); }
function fmt(n) { return Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

const METEOS = [
  { id: 'soleil', label: 'Soleil' },
  { id: 'nuage', label: 'Nuageux' },
  { id: 'pluie', label: 'Pluie' },
  { id: 'neige', label: 'Neige' },
];

const QSE_DOCS = [
  { id: 'ppsps', label: 'PPSPS' },
  { id: 'plan_prevention', label: 'Plan de prévention' },
  { id: 'permis_feu', label: 'Permis feu' },
  { id: 'accueil_securite', label: 'Accueil sécurité' },
  { id: 'registre_verif', label: 'Registre des vérifications' },
];

const TABS = [
  { id: 'journal', label: 'Journal' },
  { id: 'equipe', label: 'Équipe' },
  { id: 'budget', label: 'Budget' },
  { id: 'materiaux', label: 'Matériaux' },
  { id: 'documents', label: 'Documents' },
  { id: 'photos', label: 'Photos' },
];

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════
export default function ChantierDetail({ chantier, employes, vehicules, depenses, onBack, onUpdate, showToast }) {
  const cid = chantier?.id || chantier?._id || 'unknown';

  // ── Tab state ──────────────────────────────────────────────────
  const [tab, setTab] = useState('journal');

  // ── Journal state ──────────────────────────────────────────────
  const [journal, setJournal] = useState(() => lsGet(`freample_journal_${cid}`, []));
  const [jDate, setJDate] = useState(today());
  const [jMeteo, setJMeteo] = useState('soleil');
  const [jOuvriers, setJOuvriers] = useState('');
  const [jDesc, setJDesc] = useState('');
  const [jProblemes, setJProblemes] = useState('');
  const [jHeureDebut, setJHeureDebut] = useState('07:30');
  const [jHeureFin, setJHeureFin] = useState('17:00');
  const [jVisiteurs, setJVisiteurs] = useState('');

  // ── Equipe & Planning state ────────────────────────────────────
  const [heures, setHeures] = useState(() => lsGet(`freample_heures_${cid}`, {}));
  const [distanceKm, setDistanceKm] = useState(() => lsGet(`freample_distance_${cid}`, ''));
  const [prixLitre, setPrixLitre] = useState(() => lsGet(`freample_prix_litre_${cid}`, '1.85'));
  const [tauxHoraire, setTauxHoraire] = useState(() => lsGet(`freample_taux_horaire_${cid}`, '45'));

  // ── Matériaux state ────────────────────────────────────────────
  const [matStock, setMatStock] = useState(() => lsGet(`freample_matieres_stock_${cid}`, []));
  const [matAchat, setMatAchat] = useState(() => lsGet(`freample_matieres_achat_${cid}`, []));
  const [msArticle, setMsArticle] = useState('');
  const [msQte, setMsQte] = useState('');
  const [msPrix, setMsPrix] = useState('');
  const [maFourn, setMaFourn] = useState('');
  const [maDesc, setMaDesc] = useState('');
  const [maMontant, setMaMontant] = useState('');
  const [maTva, setMaTva] = useState('20');

  // ── Sous-traitance state ───────────────────────────────────────
  const [soustraitance, setSoustraitance] = useState(() => lsGet(`freample_soustraitance_${cid}`, []));

  // ── Photos state ───────────────────────────────────────────────
  const [photos, setPhotos] = useState(() => lsGet(`freample_photos_${cid}`, []));
  const [photoDesc, setPhotoDesc] = useState('');

  // ── Avancement ─────────────────────────────────────────────────
  const [avancement, setAvancement] = useState(() => lsGet(`freample_avancement_${cid}`, 0));

  // ── LINK 2: Habilitations requises par type de chantier ────────
  const HABILITATIONS_REQUISES = {
    'Électricité': ['Habilitation électrique'],
    'Travail en hauteur': ['Travail en hauteur'],
    'Maçonnerie': ['CACES'],
    'Plomberie': [],
    'Carrelage': [],
    'Peinture': [],
  };

  function checkHabilitations(nomOuvrier) {
    const warnings = [];
    const titre = (chantier?.titre || chantier?.nom || '').toLowerCase();
    const desc = (chantier?.description || '').toLowerCase();
    // Find employee data from the employes prop
    const emp = (employes || []).find(e =>
      `${e.prenom} ${e.nom}`.toLowerCase().includes(nomOuvrier.toLowerCase()) ||
      nomOuvrier.toLowerCase().includes(e.nom?.toLowerCase())
    );
    if (!emp) return warnings;
    const habs = (emp.habilitations || []).map(h => h.toLowerCase());
    // Check if chantier involves electricity
    if ((titre.includes('électri') || desc.includes('électri')) && !habs.some(h => h.includes('habilitation électrique'))) {
      warnings.push('Habilitation manquante : électrique');
    }
    // Check by metier of the chantier
    Object.entries(HABILITATIONS_REQUISES).forEach(([metier, reqHabs]) => {
      if (titre.includes(metier.toLowerCase()) || desc.includes(metier.toLowerCase())) {
        reqHabs.forEach(req => {
          if (!habs.some(h => h.includes(req.toLowerCase())) && !warnings.some(w => w.includes(req.toLowerCase()))) {
            warnings.push(`Habilitation manquante : ${req}`);
          }
        });
      }
    });
    return warnings;
  }

  // ── Derived data ───────────────────────────────────────────────
  const equipe = chantier?.equipe || [];
  const vehicule = useMemo(() => {
    if (!chantier?.vehicule) return null;
    if (typeof chantier.vehicule === 'object') return chantier.vehicule;
    return (vehicules || []).find(v => v.id === chantier.vehicule || v._id === chantier.vehicule || v.immatriculation === chantier.vehicule) || null;
  }, [chantier?.vehicule, vehicules]);

  const consoL100 = vehicule?.conso || vehicule?.consommation || 8;
  const dist = parseFloat(distanceKm) || 0;
  const pxLitre = parseFloat(prixLitre) || 1.85;
  const txHoraire = parseFloat(tauxHoraire) || 45;

  const carburantJour = dist > 0 ? (dist * 2 / 100) * consoL100 * pxLitre : 0;

  const btpZone = useMemo(() => getBTPZone(dist), [dist]);
  const indemniteJourEquipe = btpZone.rate * equipe.length;

  const totalHeures = useMemo(() => {
    return Object.values(heures).reduce((s, days) => {
      return s + Object.values(days || {}).reduce((a, h) => a + (parseFloat(h) || 0), 0);
    }, 0);
  }, [heures]);

  const totalMatStock = useMemo(() => matStock.reduce((s, m) => s + (parseFloat(m.quantite) || 0) * (parseFloat(m.prixUnitaire) || 0), 0), [matStock]);
  const totalMatAchat = useMemo(() => matAchat.reduce((s, m) => s + (parseFloat(m.montantHT) || 0), 0), [matAchat]);
  const totalTvaRecup = useMemo(() => matAchat.reduce((s, m) => s + (parseFloat(m.montantHT) || 0) * (parseFloat(m.tva) || 0) / 100, 0), [matAchat]);
  const totalSousTraitance = useMemo(() => soustraitance.reduce((s, x) => s + (parseFloat(x.montant) || 0), 0), [soustraitance]);

  const depensesChantier = useMemo(() => {
    return (depenses || []).filter(d => d.chantierId === cid || d.chantier === cid);
  }, [depenses, cid]);
  const totalAutresFrais = useMemo(() => depensesChantier.reduce((s, d) => s + (parseFloat(d.montant) || 0), 0), [depensesChantier]);

  // Budget numbers (estimate based on working days logged in journal)
  const nbJoursChantier = journal.length || (() => {
    if (chantier?.dateDebut) {
      const debut = new Date(chantier.dateDebut);
      const fin = chantier?.dateFin ? new Date(chantier.dateFin) : new Date();
      return Math.max(1, Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)));
    }
    return 1;
  })();
  const coutMO = totalHeures * txHoraire;
  const coutCarburantTotal = carburantJour * nbJoursChantier;
  const coutIndemniteTotal = indemniteJourEquipe * nbJoursChantier;

  // ── Frais RH (notes de frais from RH module) ──────────────────
  const fraisRH = useMemo(() => lsGet('freample_frais_chantier', []).filter(f => f.chantierId === cid), [cid]);
  const totalFraisRH = useMemo(() => fraisRH.reduce((s, f) => s + (parseFloat(f.montant) || 0), 0), [fraisRH]);

  const totalDepenses = coutMO + totalMatStock + totalMatAchat + totalSousTraitance + coutCarburantTotal + coutIndemniteTotal + totalAutresFrais + totalFraisRH;
  const devisSigne = parseFloat(chantier?.caDevis || chantier?.budgetPrevu || 0);
  const marge = devisSigne - totalDepenses;
  const margePct = devisSigne > 0 ? (marge / devisSigne) * 100 : 0;
  const budgetConsomme = devisSigne > 0 ? (totalDepenses / devisSigne) * 100 : 0;

  // ── Sync indemnités to paie ─────────────────────────────────
  React.useEffect(() => {
    if (coutIndemniteTotal > 0 && equipe.length > 0) {
      const indemnites = lsGet('freample_indemnites_chantier', []);
      const existing = indemnites.findIndex(i => i.chantierId === cid);
      const entry = { chantierId: cid, chantierNom: chantier?.titre || '', nbJours: nbJoursChantier, zone: btpZone.zone, taux: btpZone.rate, equipe, total: coutIndemniteTotal };
      if (existing >= 0) indemnites[existing] = entry;
      else indemnites.push(entry);
      lsSet('freample_indemnites_chantier', indemnites);
    }
  }, [coutIndemniteTotal, nbJoursChantier]);

  // ── Persist helpers ────────────────────────────────────────────
  const persistJournal = useCallback((v) => { setJournal(v); lsSet(`freample_journal_${cid}`, v); }, [cid]);
  const persistHeures = useCallback((v) => { setHeures(v); lsSet(`freample_heures_${cid}`, v); }, [cid]);
  const persistMatStock = useCallback((v) => { setMatStock(v); lsSet(`freample_matieres_stock_${cid}`, v); }, [cid]);
  const persistMatAchat = useCallback((v) => { setMatAchat(v); lsSet(`freample_matieres_achat_${cid}`, v); }, [cid]);
  const persistPhotos = useCallback((v) => { setPhotos(v); lsSet(`freample_photos_${cid}`, v); }, [cid]);

  // ── Journal handlers ───────────────────────────────────────────
  const addJournalEntry = () => {
    if (!jDesc.trim()) { showToast?.('Veuillez remplir la description'); return; }
    const entry = {
      id: Date.now(),
      date: jDate,
      meteo: jMeteo,
      nbOuvriers: parseInt(jOuvriers) || 0,
      description: jDesc.trim(),
      problemesRencontres: jProblemes.trim(),
      heureDebut: jHeureDebut,
      heureFin: jHeureFin,
      visiteurs: jVisiteurs.trim(),
      photos: [],
    };
    const next = [entry, ...journal];
    persistJournal(next);
    setJDesc(''); setJProblemes(''); setJOuvriers(''); setJMeteo('soleil'); setJDate(today()); setJHeureDebut('07:30'); setJHeureFin('17:00'); setJVisiteurs('');
    showToast?.('Entrée de journal ajoutée');
  };

  // ── Heures handler ─────────────────────────────────────────────
  const setHeure = (nom, date, val) => {
    const next = { ...heures, [nom]: { ...(heures[nom] || {}), [date]: val } };
    persistHeures(next);
  };

  const getHeuresSemaine = (nom) => {
    const days = heures[nom] || {};
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return Object.entries(days).reduce((sum, [d, h]) => {
      const dt = new Date(d);
      return dt >= monday && dt <= sunday ? sum + (parseFloat(h) || 0) : sum;
    }, 0);
  };

  // ── Matériaux handlers ─────────────────────────────────────────
  const addMatStock = () => {
    if (!msArticle.trim()) return;
    const item = { id: Date.now(), article: msArticle.trim(), quantite: msQte, prixUnitaire: msPrix, date: today() };
    persistMatStock([item, ...matStock]);
    // Decrement global stock
    const globalStock = lsGet('freample_stock_articles', []);
    const idx = globalStock.findIndex(a => a.designation?.toLowerCase().includes(msArticle.trim().toLowerCase()));
    if (idx >= 0) {
      globalStock[idx].quantite = Math.max(0, (globalStock[idx].quantite || 0) - (parseFloat(msQte) || 0));
      lsSet('freample_stock_articles', globalStock);
    }
    // Écriture comptable auto — sortie stock
    const ecrituresStk = JSON.parse(localStorage.getItem('freample_ecritures') || '[]');
    const montantStk = (parseFloat(msQte) || 0) * (parseFloat(msPrix) || 0);
    const refStk = `STK-${Date.now()}`;
    ecrituresStk.push(
      { date: new Date().toISOString().slice(0,10), journal: 'OD', piece: refStk, compte: '601000', libelle: `Sortie stock ${msArticle} — Chantier`, debit: montantStk, credit: 0 },
      { date: new Date().toISOString().slice(0,10), journal: 'OD', piece: refStk, compte: '601000', libelle: 'Contrepartie stock', debit: 0, credit: montantStk },
    );
    localStorage.setItem('freample_ecritures', JSON.stringify(ecrituresStk));
    setMsArticle(''); setMsQte(''); setMsPrix('');
    showToast?.('Sortie stock ajoutée');
  };

  const addMatAchat = () => {
    if (!maDesc.trim()) return;
    const item = { id: Date.now(), fournisseur: maFourn.trim(), description: maDesc.trim(), montantHT: maMontant, tva: maTva, date: today() };
    persistMatAchat([item, ...matAchat]);
    // Écriture comptable auto — achat matériaux
    const ecritures = JSON.parse(localStorage.getItem('freample_ecritures') || '[]');
    const montantHT = parseFloat(maMontant) || 0;
    const tvaRate = parseFloat(maTva) || 20;
    const montantTVA = Math.round(montantHT * tvaRate / 100);
    const ref = `ACH-${Date.now()}`;
    ecritures.push(
      { date: new Date().toISOString().slice(0,10), journal: 'HA', piece: ref, compte: '601000', libelle: `Achat ${maDesc || maFourn} — Chantier`, debit: montantHT, credit: 0 },
      { date: new Date().toISOString().slice(0,10), journal: 'HA', piece: ref, compte: '445660', libelle: 'TVA déductible', debit: montantTVA, credit: 0 },
      { date: new Date().toISOString().slice(0,10), journal: 'HA', piece: ref, compte: '401000', libelle: `Fournisseur ${maFourn}`, debit: 0, credit: montantHT + montantTVA },
    );
    localStorage.setItem('freample_ecritures', JSON.stringify(ecritures));
    setMaFourn(''); setMaDesc(''); setMaMontant(''); setMaTva('20');
    showToast?.('Achat ajouté');
  };

  // ── Photos handler ─────────────────────────────────────────────
  const addPhoto = () => {
    if (!photoDesc.trim()) return;
    const entry = { id: Date.now(), date: today(), description: photoDesc.trim(), url: null };
    persistPhotos([entry, ...photos]);
    setPhotoDesc('');
    showToast?.('Photo ajoutée');
  };

  // ── Distance / prix persist ────────────────────────────────────
  const updateDistance = (v) => { setDistanceKm(v); lsSet(`freample_distance_${cid}`, v); };
  const updatePrixLitre = (v) => { setPrixLitre(v); lsSet(`freample_prix_litre_${cid}`, v); };
  const updateTauxHoraire = (v) => { setTauxHoraire(v); lsSet(`freample_taux_horaire_${cid}`, v); };
  const updateAvancement = (v) => { setAvancement(v); lsSet(`freample_avancement_${cid}`, v); onUpdate?.({ ...chantier, avancement: v }); };

  // ═════════════════════════════════════════════════════════════════
  // Render helpers
  // ═════════════════════════════════════════════════════════════════
  const SectionTitle = ({ children }) => (
    <h3 style={{ fontSize: 14, fontWeight: 700, color: L.text, margin: '24px 0 12px', fontFamily: L.font, letterSpacing: '0.02em' }}>{children}</h3>
  );

  const Badge = ({ children, color }) => (
    <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: color || L.gold, color: L.white, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{children}</span>
  );

  // ═════════════════════════════════════════════════════════════════
  // Tab: Journal
  // ═════════════════════════════════════════════════════════════════
  const renderJournal = () => (
    <div>
      {/* Add entry form */}
      <div style={{ ...CARD, marginBottom: 20 }}>
        <SectionTitle>Nouvelle entrée</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={LBL}>Date</label>
            <input type="date" value={jDate} onChange={e => setJDate(e.target.value)} style={INP} />
          </div>
          <div>
            <label style={LBL}>Nb ouvriers</label>
            <input type="number" min="0" value={jOuvriers} onChange={e => setJOuvriers(e.target.value)} placeholder="0" style={INP} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={LBL}>Heure début</label>
            <input type="time" value={jHeureDebut} onChange={e => setJHeureDebut(e.target.value)} style={INP} />
          </div>
          <div>
            <label style={LBL}>Heure fin</label>
            <input type="time" value={jHeureFin} onChange={e => setJHeureFin(e.target.value)} style={INP} />
          </div>
          <div>
            <label style={LBL}>Visiteurs</label>
            <input type="text" value={jVisiteurs} onChange={e => setJVisiteurs(e.target.value)} placeholder="Inspecteur, client, coordinateur SPS..." style={INP} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={LBL}>Météo</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {METEOS.map(m => (
              <button key={m.id} onClick={() => setJMeteo(m.id)}
                style={{ ...BTN_O, flex: 1, fontSize: 11, ...(jMeteo === m.id ? { background: L.noir, color: '#fff', borderColor: L.noir } : {}) }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={LBL}>Description des travaux</label>
          <textarea value={jDesc} onChange={e => setJDesc(e.target.value)} rows={3} placeholder="Travaux effectués aujourd'hui..." style={{ ...INP, resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={LBL}>Problèmes rencontrés</label>
          <textarea value={jProblemes} onChange={e => setJProblemes(e.target.value)} rows={2} placeholder="Optionnel" style={{ ...INP, resize: 'vertical' }} />
        </div>
        <button onClick={addJournalEntry} style={BTN}>Ajouter l'entrée</button>
      </div>

      {/* Entries list */}
      {journal.length === 0 && <p style={{ color: L.textLight, fontSize: 13, fontStyle: 'italic' }}>Aucune entrée dans le journal</p>}
      {journal.map(entry => (
        <div key={entry.id} style={{ ...CARD, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: L.text }}>{new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span style={{ fontSize: 12, color: L.textLight }}>
              {entry.heureDebut && entry.heureFin ? `${entry.heureDebut} – ${entry.heureFin} | ` : ''}{METEOS.find(m => m.id === entry.meteo)?.label || entry.meteo} — {entry.nbOuvriers} ouvrier{entry.nbOuvriers > 1 ? 's' : ''}
            </span>
          </div>
          <p style={{ fontSize: 13, color: L.text, margin: '0 0 6px', lineHeight: 1.6 }}>{entry.description}</p>
          {entry.visiteurs && (
            <div style={{ fontSize: 12, color: L.textSec, marginBottom: 6 }}>
              <strong>Visiteurs :</strong> {entry.visiteurs}
            </div>
          )}
          {entry.problemesRencontres && (
            <div style={{ background: L.orangeBg || '#FFFBEB', padding: '8px 12px', borderLeft: `3px solid ${L.orange}`, marginTop: 8, fontSize: 12, color: L.text }}>
              <strong>Problèmes :</strong> {entry.problemesRencontres}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ═════════════════════════════════════════════════════════════════
  // Tab: Équipe & Planning
  // ═════════════════════════════════════════════════════════════════
  const renderEquipe = () => (
    <div>
      {/* Team */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <SectionTitle>Équipe assignée</SectionTitle>
        {equipe.length === 0 && <p style={{ color: L.textLight, fontSize: 13, fontStyle: 'italic' }}>Aucun membre assigné</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${L.border}` }}>
              <th style={{ textAlign: 'left', padding: '8px 0', ...LBL, marginBottom: 0 }}>Nom</th>
              <th style={{ textAlign: 'center', padding: '8px 0', ...LBL, marginBottom: 0, width: 120 }}>Heures aujourd'hui</th>
              <th style={{ textAlign: 'center', padding: '8px 0', ...LBL, marginBottom: 0, width: 120 }}>Heures semaine</th>
            </tr>
          </thead>
          <tbody>
            {equipe.map((nom, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${L.border}` }}>
                <td style={{ padding: '10px 0', fontWeight: 500 }}>{nom}</td>
                <td style={{ padding: '10px 0', textAlign: 'center' }}>
                  <input type="number" min="0" max="24" step="0.5"
                    value={(heures[nom] || {})[today()] || ''}
                    onChange={e => setHeure(nom, today(), e.target.value)}
                    placeholder="0" style={{ ...INP, width: 80, textAlign: 'center' }} />
                </td>
                <td style={{ padding: '10px 0', textAlign: 'center', fontWeight: 600, color: L.gold }}>
                  {fmt(getHeuresSemaine(nom))} h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vehicle */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <SectionTitle>Véhicule</SectionTitle>
        {vehicule ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 13 }}>
            <div><span style={LBL}>Modèle</span><span style={{ fontWeight: 500 }}>{vehicule.modele || vehicule.marque || '—'}</span></div>
            <div><span style={LBL}>Immatriculation</span><span style={{ fontWeight: 500 }}>{vehicule.immatriculation || '—'}</span></div>
            <div><span style={LBL}>Conso (L/100km)</span><span style={{ fontWeight: 500 }}>{consoL100}</span></div>
          </div>
        ) : (
          <p style={{ color: L.textLight, fontSize: 13, fontStyle: 'italic' }}>{chantier?.vehicule ? `Véhicule : ${chantier.vehicule}` : 'Aucun véhicule assigné'}</p>
        )}
      </div>

      {/* Distance & cost calculation */}
      <div style={{ ...CARD }}>
        <SectionTitle>Frais de déplacement</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={LBL}>Distance dépôt → chantier (km)</label>
            <input type="number" min="0" value={distanceKm} onChange={e => updateDistance(e.target.value)} placeholder="0" style={INP} />
          </div>
          <div>
            <label style={LBL}>Prix litre carburant (€)</label>
            <input type="number" min="0" step="0.01" value={prixLitre} onChange={e => updatePrixLitre(e.target.value)} style={INP} />
          </div>
        </div>
        {dist > 0 && (
          <div style={{ background: L.cream, padding: 16, fontSize: 13, lineHeight: 2 }}>
            <div><strong>Aller-retour :</strong> {dist * 2} km/jour</div>
            <div><strong>Carburant/jour :</strong> {fmt(carburantJour)} €
              <span style={{ color: L.textLight, marginLeft: 8 }}>({dist * 2} km / 100 × {consoL100} L × {fmt(pxLitre)} €)</span>
            </div>
            <div style={{ borderTop: `1px solid ${L.border}`, paddingTop: 8, marginTop: 4 }}>
              <strong>Indemnité trajet BTP :</strong> Zone {btpZone.zone} — {fmt(btpZone.rate)} €/jour/personne
            </div>
            <div><strong>Indemnité équipe/jour :</strong> {fmt(indemniteJourEquipe)} € ({equipe.length} personne{equipe.length > 1 ? 's' : ''})</div>
          </div>
        )}
      </div>

      {/* CTA Sous-traitance Freample */}
      <div style={{ ...CARD, marginTop: 16, borderLeft: '3px solid #A68B4B', background: '#FDFCF7' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Besoin de renfort ?</div>
        <div style={{ fontSize: 12, color: '#6E6E73', marginBottom: 10 }}>Trouvez un sous-traitant qualifié via Freample. Commission 1% uniquement si vous l'engagez.</div>
        <button onClick={() => { window.location.href = '/btp'; }} style={{ padding: '8px 18px', background: '#A68B4B', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Trouver un sous-traitant</button>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════
  // Tab: Budget & Rentabilité
  // ═════════════════════════════════════════════════════════════════
  const renderBudget = () => {
    const lines = [
      { label: "Main d'œuvre", detail: `${fmt(totalHeures)} h × ${fmt(txHoraire)} €/h`, montant: coutMO },
      { label: 'Matériaux stock (dépôt)', montant: totalMatStock },
      { label: 'Matériaux achats (fournisseur)', montant: totalMatAchat },
      { label: 'Sous-traitance', montant: totalSousTraitance },
      { label: 'Carburant', detail: `${nbJoursChantier} jour${nbJoursChantier > 1 ? 's' : ''} × ${fmt(carburantJour)} €`, montant: coutCarburantTotal },
      { label: 'Indemnités trajet', detail: `${nbJoursChantier} j × ${fmt(indemniteJourEquipe)} €`, montant: coutIndemniteTotal },
      { label: 'Autres frais', detail: `${depensesChantier.length} dépense${depensesChantier.length > 1 ? 's' : ''}`, montant: totalAutresFrais },
      { label: 'Notes de frais (RH)', detail: `${fraisRH.length} note${fraisRH.length > 1 ? 's' : ''}`, montant: totalFraisRH },
    ];

    return (
      <div>
        {/* Devis */}
        <div style={{ ...CARD, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={LBL}>Devis signé</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: L.text, fontFamily: L.serif }}>{fmt(devisSigne)} €</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <label style={LBL}>Taux horaire MO (€/h)</label>
            <input type="number" min="0" step="1" value={tauxHoraire} onChange={e => updateTauxHoraire(e.target.value)} style={{ ...INP, width: 80, textAlign: 'center' }} />
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <SectionTitle>Détail des coûts</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${L.border}` }}>
                  <td style={{ padding: '10px 0', fontWeight: 500 }}>{l.label}</td>
                  <td style={{ padding: '10px 0', color: L.textLight, fontSize: 12 }}>{l.detail || ''}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{fmt(l.montant)} €</td>
                </tr>
              ))}
              {totalTvaRecup > 0 && (
                <tr style={{ borderBottom: `1px solid ${L.border}` }}>
                  <td style={{ padding: '10px 0', fontWeight: 500, color: L.green }}>TVA récupérable</td>
                  <td></td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600, color: L.green }}>-{fmt(totalTvaRecup)} €</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center' }}>
            <div>
              <span style={LBL}>Total dépenses</span>
              <div style={{ fontSize: 20, fontWeight: 700, color: L.red, fontFamily: L.serif }}>{fmt(totalDepenses)} €</div>
            </div>
            <div>
              <span style={LBL}>Devis signé</span>
              <div style={{ fontSize: 20, fontWeight: 700, color: L.text, fontFamily: L.serif }}>{fmt(devisSigne)} €</div>
            </div>
            <div>
              <span style={LBL}>Marge</span>
              <div style={{ fontSize: 20, fontWeight: 700, color: marge >= 0 ? L.green : L.red, fontFamily: L.serif }}>
                {fmt(marge)} € <span style={{ fontSize: 13 }}>({margePct >= 0 ? '+' : ''}{margePct.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ ...CARD }}>
          <SectionTitle>Progression</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <label style={{ ...LBL, margin: 0, whiteSpace: 'nowrap' }}>Avancement chantier (%)</label>
            <input type="range" min="0" max="100" value={avancement} onChange={e => updateAvancement(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} style={{ flex: 1 }} />
            <input type="number" min="0" max="100" value={avancement} onChange={e => updateAvancement(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} style={{ ...INP, width: 80, textAlign: 'center' }} />
          </div>
          <div style={{ background: L.cream, borderRadius: 4, height: 24, position: 'relative', overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(budgetConsomme, 100)}%`, background: budgetConsomme > 90 ? L.red : budgetConsomme > 70 ? L.orange : L.green, transition: 'width 0.3s', opacity: 0.3 }} />
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${avancement}%`, background: L.gold, transition: 'width 0.3s', opacity: 0.6 }} />
          </div>
          <p style={{ fontSize: 13, color: L.textSec, margin: 0 }}>
            <strong>{budgetConsomme.toFixed(0)}%</strong> du budget consommé pour <strong>{avancement}%</strong> d'avancement
          </p>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════
  // Tab: Matériaux
  // ═════════════════════════════════════════════════════════════════
  const renderMateriaux = () => (
    <div>
      {/* Stock section */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <SectionTitle>Sorties stock (dépôt)</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'end', marginBottom: 12 }}>
          <div><label style={LBL}>Article</label><input value={msArticle} onChange={e => setMsArticle(e.target.value)} placeholder="Nom de l'article" style={INP} /></div>
          <div><label style={LBL}>Quantité</label><input type="number" min="0" value={msQte} onChange={e => setMsQte(e.target.value)} placeholder="0" style={INP} /></div>
          <div><label style={LBL}>Prix unitaire (€)</label><input type="number" min="0" step="0.01" value={msPrix} onChange={e => setMsPrix(e.target.value)} placeholder="0.00" style={INP} /></div>
          <button onClick={addMatStock} style={{ ...BTN, marginBottom: 0 }}>Ajouter</button>
        </div>
      </div>

      {/* Achats section */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <SectionTitle>Achats directs (fournisseur)</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 80px auto', gap: 8, alignItems: 'end', marginBottom: 12 }}>
          <div><label style={LBL}>Fournisseur</label><input value={maFourn} onChange={e => setMaFourn(e.target.value)} placeholder="Nom" style={INP} /></div>
          <div><label style={LBL}>Description</label><input value={maDesc} onChange={e => setMaDesc(e.target.value)} placeholder="Description" style={INP} /></div>
          <div><label style={LBL}>Montant HT (€)</label><input type="number" min="0" step="0.01" value={maMontant} onChange={e => setMaMontant(e.target.value)} placeholder="0.00" style={INP} /></div>
          <div><label style={LBL}>TVA %</label><input type="number" min="0" max="100" value={maTva} onChange={e => setMaTva(e.target.value)} style={INP} /></div>
          <button onClick={addMatAchat} style={{ ...BTN, marginBottom: 0 }}>Ajouter</button>
        </div>
      </div>

      {/* List all materials */}
      <div style={{ ...CARD }}>
        <SectionTitle>Tous les matériaux</SectionTitle>
        {matStock.length === 0 && matAchat.length === 0 && (
          <p style={{ color: L.textLight, fontSize: 13, fontStyle: 'italic' }}>Aucun matériau enregistré</p>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {matStock.map(m => (
              <tr key={`s-${m.id}`} style={{ borderBottom: `1px solid ${L.border}` }}>
                <td style={{ padding: '8px 0' }}><Badge color={L.blue}>Stock</Badge></td>
                <td style={{ padding: '8px 4px', fontWeight: 500 }}>{m.article}</td>
                <td style={{ padding: '8px 4px', color: L.textLight }}>{m.quantite} × {fmt(parseFloat(m.prixUnitaire) || 0)} €</td>
                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>{fmt((parseFloat(m.quantite) || 0) * (parseFloat(m.prixUnitaire) || 0))} €</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: L.textLight, fontSize: 11 }}>{m.date}</td>
              </tr>
            ))}
            {matAchat.map(m => (
              <tr key={`a-${m.id}`} style={{ borderBottom: `1px solid ${L.border}` }}>
                <td style={{ padding: '8px 0' }}><Badge color={L.orange}>Achat</Badge></td>
                <td style={{ padding: '8px 4px', fontWeight: 500 }}>{m.description}</td>
                <td style={{ padding: '8px 4px', color: L.textLight }}>{m.fournisseur} — TVA {m.tva}%</td>
                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>{fmt(parseFloat(m.montantHT) || 0)} € HT</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: L.textLight, fontSize: 11 }}>{m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(matStock.length > 0 || matAchat.length > 0) && (
          <div style={{ textAlign: 'right', marginTop: 12, fontSize: 15, fontWeight: 700, color: L.text }}>
            Total matériaux : {fmt(totalMatStock + totalMatAchat)} € HT
          </div>
        )}
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════
  // Tab: Documents
  // ═════════════════════════════════════════════════════════════════
  const renderDocuments = () => (
    <div>
      <div style={{ ...CARD, marginBottom: 16 }}>
        <SectionTitle>Documents QHSE</SectionTitle>
        <button onClick={() => { if (typeof window !== 'undefined') window.location.hash = '#/patron/qse'; }}
          style={{ ...BTN, marginBottom: 16 }}>
          Ouvrir les documents de sécurité de ce chantier
        </button>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${L.border}` }}>
              <th style={{ textAlign: 'left', padding: '8px 0', ...LBL, marginBottom: 0 }}>Document</th>
              <th style={{ textAlign: 'center', padding: '8px 0', ...LBL, marginBottom: 0, width: 120 }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {QSE_DOCS.map(doc => {
              const status = lsGet(`freample_qse_${doc.id}_${cid}`, null);
              const isOk = status === true || status === 'ok' || status === 'valide';
              return (
                <tr key={doc.id} style={{ borderBottom: `1px solid ${L.border}` }}>
                  <td style={{ padding: '10px 0', fontWeight: 500 }}>{doc.label}</td>
                  <td style={{ padding: '10px 0', textAlign: 'center' }}>
                    {status == null ? (
                      <span style={{ color: L.textLight, fontSize: 12 }}>Non renseigné</span>
                    ) : isOk ? (
                      <Badge color={L.green}>Validé</Badge>
                    ) : (
                      <Badge color={L.red}>Manquant</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════
  // Tab: Photos
  // ═════════════════════════════════════════════════════════════════
  const renderPhotos = () => (
    <div>
      <div style={{ ...CARD, marginBottom: 16 }}>
        <SectionTitle>Ajouter une photo</SectionTitle>
        <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={LBL}>Description</label>
            <input value={photoDesc} onChange={e => setPhotoDesc(e.target.value)} placeholder="Description de la photo" style={INP}
              onKeyDown={e => { if (e.key === 'Enter') addPhoto(); }} />
          </div>
          <button onClick={addPhoto} style={BTN}>Ajouter</button>
        </div>
      </div>

      {photos.length === 0 && <p style={{ color: L.textLight, fontSize: 13, fontStyle: 'italic' }}>Aucune photo enregistrée</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {photos.map(p => (
          <div key={p.id} style={{ ...CARD, textAlign: 'center' }}>
            <div style={{ background: L.cream, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: L.textLight, fontSize: 12 }}>
              {p.url ? <img src={p.url} alt={p.description} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : 'Aperçu photo'}
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 4px', color: L.text }}>{p.description}</p>
            <p style={{ fontSize: 11, color: L.textLight, margin: 0 }}>{new Date(p.date).toLocaleDateString('fr-FR')}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════
  // Main render
  // ═════════════════════════════════════════════════════════════════
  const tabContent = {
    journal: renderJournal,
    equipe: renderEquipe,
    budget: renderBudget,
    materiaux: renderMateriaux,
    documents: renderDocuments,
    photos: renderPhotos,
  };

  return (
    <div style={{ fontFamily: L.font, color: L.text }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ ...BTN_O, padding: '6px 14px', fontSize: 12 }}>← Retour</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: L.serif, color: L.text }}>
            {chantier?.nom || chantier?.titre || chantier?.client || 'Chantier'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: L.textLight }}>
            {chantier?.adresse || chantier?.lieu || ''} {chantier?.statut ? `— ${chantier.statut}` : ''}
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${L.border}`, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '10px 18px', fontSize: 12, fontWeight: 600, fontFamily: L.font,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: tab === t.id ? L.gold : L.textLight,
              borderBottom: tab === t.id ? `2px solid ${L.gold}` : '2px solid transparent',
              marginBottom: -2, letterSpacing: '0.02em',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabContent[tab]?.()}
    </div>
  );
}
