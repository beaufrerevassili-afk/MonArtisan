// ============================================================
//  InvestirModule — Simulateur d'acquisition immobilière
//  5 étapes : Étudier → Budgétiser → Financer → Piloter → Louer
//  Pipeline Kanban + Dossier bancaire PDF + Gantt travaux
// ============================================================
import React, { useState, useEffect } from 'react';
import L from '../../design/luxe';

const STORAGE = 'freample_investir_dossiers';
const loadDossiers = () => { try { return JSON.parse(localStorage.getItem(STORAGE)) || []; } catch { return []; } };

const CARD = { background: L.white, border: `1px solid ${L.border}`, padding: '20px' };
const BTN = { padding: '8px 18px', background: L.noir, color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: L.font };
const BTN_O = { ...BTN, background: 'transparent', color: L.text, border: `1px solid ${L.border}` };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${L.border}`, fontSize: 13, fontFamily: L.font, outline: 'none', boxSizing: 'border-box', background: L.white };
const LBL = { fontSize: 11, fontWeight: 600, color: L.textSec, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' };
const EST = { fontSize: 10, color: L.textLight, fontStyle: 'italic' };

// ── Constantes métier ──
const TYPES_BIEN = ['Appartement', 'Maison', 'Studio', 'Local commercial', 'Immeuble', 'Parking'];
const DPE_LIST = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const STATUTS = [
  { id: 'etude', label: 'En étude', color: L.blue },
  { id: 'offre', label: 'Offre faite', color: L.orange },
  { id: 'compromis', label: 'Sous compromis', color: '#8B5CF6' },
  { id: 'travaux', label: 'Travaux', color: L.gold },
  { id: 'location', label: 'En location', color: L.green },
  { id: 'abandonne', label: 'Abandonné', color: L.red },
];

const POSTES_TRAVAUX = [
  { id: 'demolition', label: 'Démolition / Dépose', dureeBase: 1, prixM2: 25, ordre: 1, deps: [] },
  { id: 'gros_oeuvre', label: 'Gros œuvre / Maçonnerie', dureeBase: 3, prixM2: 80, ordre: 2, deps: ['demolition'] },
  { id: 'electricite', label: 'Électricité', dureeBase: 1.5, prixM2: 45, ordre: 3, deps: ['gros_oeuvre'] },
  { id: 'plomberie', label: 'Plomberie', dureeBase: 2, prixM2: 55, ordre: 3, deps: ['gros_oeuvre'] },
  { id: 'isolation', label: 'Isolation / Placo', dureeBase: 2, prixM2: 50, ordre: 4, deps: ['electricite', 'plomberie'] },
  { id: 'sols', label: 'Sols (chape + revêtement)', dureeBase: 1.5, prixM2: 45, ordre: 5, deps: ['isolation'] },
  { id: 'cuisine', label: 'Cuisine', dureeBase: 2, prixM2: 0, prix: 5000, ordre: 6, deps: ['sols', 'plomberie'] },
  { id: 'sdb', label: 'Salle de bain', dureeBase: 2, prixM2: 0, prix: 4500, ordre: 6, deps: ['sols', 'plomberie'] },
  { id: 'peinture', label: 'Peinture', dureeBase: 1, prixM2: 18, ordre: 7, deps: ['isolation', 'sols'] },
  { id: 'menuiseries', label: 'Menuiseries / Finitions', dureeBase: 1, prixM2: 12, ordre: 8, deps: ['peinture'] },
  { id: 'nettoyage', label: 'Nettoyage', dureeBase: 0.5, prixM2: 5, ordre: 9, deps: ['menuiseries', 'peinture'] },
];

const CHECKLIST_AVANT_ACHAT = [
  'Règlement de copropriété consulté',
  'PV des 3 dernières AG de la copro lus',
  'Diagnostics vérifiés (DPE, amiante, plomb, termites)',
  'PLU consulté (si travaux lourds)',
  'Géorisques vérifiés',
  'Devis travaux obtenus',
  'Éligibilité aides vérifiée (MaPrimeRénov\', éco-PTZ)',
];
const CHECKLIST_AVANT_LOC = [
  'DPE valide et ≤ E',
  'Détecteurs de fumée installés',
  'Assurance PNO souscrite',
  'Bail rédigé (loi ALUR/ELAN)',
  'État des lieux réalisé',
  'Dépôt de garantie encaissé',
  'Numéro fiscal du logement obtenu',
];

// Prix/m² par département (simplifié)
const PRIX_M2 = { '75': 10500, '92': 6500, '93': 3800, '94': 5000, '69': 3800, '13': 3200, '06': 4800, '33': 3500, '31': 3100, '44': 3400, '59': 2200, '67': 2800, '34': 3000, '38': 2600, '83': 3600, 'default': 2500 };
const PRIX_ARR = { 1: 12500, 2: 11000, 3: 11500, 4: 12800, 5: 11800, 6: 14500, 7: 14000, 8: 12000, 9: 10500, 10: 9800, 11: 10200, 12: 9500, 13: 8500, 14: 10000, 15: 10200, 16: 11800, 17: 10000, 18: 8200, 19: 7500, 20: 8000 };
const LOYER_M2 = { '75': 28, '92': 20, '93': 16, '94': 18, '69': 14, '13': 13, '06': 16, '33': 12, '31': 11, '44': 12, '59': 11, '67': 11, '34': 13, '38': 11, '83': 13, 'default': 10 };

function estimerPrixM2(adresse) {
  if (!adresse) return PRIX_M2['default'];
  const a = adresse.toLowerCase();
  // Paris arrondissement
  const parisMatch = a.match(/paris\s*(\d{1,2})/i) || a.match(/750(\d{2})/);
  if (parisMatch) { const arr = parseInt(parisMatch[1]); return PRIX_ARR[arr] || PRIX_M2['75']; }
  // Département
  for (const [dept, prix] of Object.entries(PRIX_M2)) {
    if (dept !== 'default' && a.includes(dept)) return prix;
  }
  return PRIX_M2['default'];
}
function estimerLoyerM2(adresse) {
  if (!adresse) return LOYER_M2['default'];
  const a = adresse.toLowerCase();
  for (const [dept, prix] of Object.entries(LOYER_M2)) {
    if (dept !== 'default' && a.includes(dept)) return prix;
  }
  return LOYER_M2['default'];
}

// Loyer intelligent : ville/arrondissement + pièces + DPE
function estimerLoyerComplet(adresse, surface, pieces, dpe) {
  const base = estimerLoyerM2(adresse) * (surface || 20);
  // Ajustement pièces : un studio se loue plus cher au m² qu'un T4
  const facteurPieces = pieces <= 1 ? 1.15 : pieces === 2 ? 1.05 : pieces === 3 ? 1.0 : 0.95;
  // Ajustement DPE : un A/B se loue mieux, un F/G se loue mal
  const facteurDPE = { A: 1.08, B: 1.04, C: 1.0, D: 0.97, E: 0.93, F: 0.85, G: 0.75 }[dpe] || 1.0;
  return Math.round(base * facteurPieces * facteurDPE);
}

// Géorisques déterministes (basés sur l'adresse, pas aléatoire)
function calcGeorisques(adresse) {
  if (!adresse) return null;
  const a = adresse.toLowerCase();
  // Risques basés sur des heuristiques géographiques simples
  const enZoneInondable = a.includes('quai') || a.includes('berge') || a.includes('fleuve') || a.includes('rivière');
  const enZoneSismique = a.includes('nice') || a.includes('06') || a.includes('pyren') || a.includes('alpes') || a.includes('antill');
  const enZoneArgile = a.includes('ile-de-france') || a.includes('75') || a.includes('92') || a.includes('93') || a.includes('94') || a.includes('paris');
  const enZoneRadon = a.includes('bretagne') || a.includes('auvergne') || a.includes('corse') || a.includes('limousin');
  return [
    { nom: 'Inondation', niveau: enZoneInondable ? 'fort' : 'faible' },
    { nom: 'Séisme', niveau: enZoneSismique ? 'moyen' : 'faible' },
    { nom: 'Radon', niveau: enZoneRadon ? 'moyen' : 'faible' },
    { nom: 'Retrait-gonflement argile', niveau: enZoneArgile ? 'moyen' : 'faible' },
    { nom: 'Cavités souterraines', niveau: 'faible' },
    { nom: 'PPRI', niveau: enZoneInondable ? 'moyen' : 'faible' },
  ];
}

const METIERS_VISITE = ['Plombier', 'Électricien', 'Maçon', 'Peintre', 'Carreleur', 'Plaquiste', 'Menuisier', 'Couvreur', 'Tous corps d\'état'];

function estimerDureeTravaux(surface, posteId) {
  const p = POSTES_TRAVAUX.find(x => x.id === posteId);
  if (!p) return 2;
  return Math.max(0.5, p.dureeBase + Math.floor(surface / 40) * 0.5);
}
function estimerCoutTravaux(surface, posteId) {
  const p = POSTES_TRAVAUX.find(x => x.id === posteId);
  if (!p) return 0;
  return p.prix || Math.round(surface * p.prixM2);
}

function calcScore(d) {
  if (!d.prixAchat || !d.surface) return 0;
  const prixM2Marche = estimerPrixM2(d.adresse);
  const prixM2Bien = d.prixAchat / d.surface;
  const loyerMensuel = d.loyerEstime || estimerLoyerM2(d.adresse) * d.surface;
  const rendementBrut = (loyerMensuel * 12) / d.prixAchat * 100;
  const ecartPrix = ((prixM2Marche - prixM2Bien) / prixM2Marche) * 100;
  const dpeScore = { A: 100, B: 90, C: 80, D: 65, E: 45, F: 20, G: 5 }[d.dpe] || 50;
  const coutTotal = d.prixAchat + (d.fraisNotaire || 0) + (d.budgetTravaux || 0);
  const chargesMensuelles = (d.chargesCopro || 0) + (d.taxeFonciere || 0) / 12 + (d.assurancePNO || 0) / 12;
  const cashflow = loyerMensuel - chargesMensuelles - (d.mensualiteCredit || 0);
  const cashflowScore = cashflow > 200 ? 100 : cashflow > 0 ? 70 : cashflow > -200 ? 40 : 10;
  return Math.min(100, Math.max(0, Math.round(
    rendementBrut * 3 + Math.min(20, Math.max(-10, ecartPrix)) + dpeScore * 0.15 + cashflowScore * 0.20 + 15 // tension locative baseline
  )));
}

function scoreLabel(s) {
  if (s >= 80) return { label: 'Excellent', color: L.green };
  if (s >= 60) return { label: 'Bon', color: L.blue };
  if (s >= 40) return { label: 'Moyen', color: L.orange };
  return { label: 'Risqué', color: L.red };
}

const DOSSIER_VIDE = {
  id: 0, nom: '', statut: 'etude', etape: 1,
  adresse: '', type: 'Appartement', surface: '', pieces: '', etage: '', dpe: 'D', ancien: true,
  prixDemande: '', prixAchat: '',
  // Estimations (null = auto, valeur = personnalisé)
  prixM2Custom: null, loyerEstime: null, taxeFonciere: null, chargesCopro: null,
  // Acquisition
  fraisNotaire: null, fraisAgence: 0, fraisCourtier: 0, fraisDossier: 1000, fraisGarantie: null,
  // Travaux
  travaux: [], budgetTravaux: 0, dateDebutTravaux: '',
  // Mise en location
  ameublement: 0, diagnostics: 500, assurancePNO: null, assuranceEmprunteur: null,
  vacanceMois: null, budgetSecurite: null, // null = auto 2% du prix
  // Visite artisan
  visiteMetiers: [], visiteDate: '', visiteHeure: '14:00',
  // Financement
  apport: '', dureeCredit: 20, tauxCredit: 3.5, mensualiteCredit: 0,
  // Profil emprunteur
  revenus: '', chargesPerso: '', autresCredits: '',
  // Pilotage travaux
  depensesReelles: [],
  // Checklist
  checkAvant: [], checkLoc: [],
  // Meta
  notes: '', creeLe: '', georisques: null,
  // Demandes artisans
  demandesVisite: [], devisRecus: [],
};

function fmt(n) { return Number(n || 0).toLocaleString('fr-FR'); }
function fmtE(n) { return `${fmt(n)} €`; }
function pct(n) { return `${Number(n || 0).toFixed(1)}%`; }

// ── Composant Gantt simplifié ──
function GanttChart({ travaux, dateDebut, surface }) {
  if (!travaux || travaux.length === 0) return null;
  // Calculer les dates de début/fin de chaque poste en respectant les dépendances
  const timeline = [];
  const ends = {};
  const sorted = [...travaux].sort((a, b) => {
    const pa = POSTES_TRAVAUX.find(p => p.id === a.posteId);
    const pb = POSTES_TRAVAUX.find(p => p.id === b.posteId);
    return (pa?.ordre || 99) - (pb?.ordre || 99);
  });
  sorted.forEach(t => {
    const p = POSTES_TRAVAUX.find(x => x.id === t.posteId);
    const deps = p?.deps || [];
    const startWeek = deps.length > 0 ? Math.max(...deps.map(d => ends[d] || 0)) : 0;
    const duree = t.dureeCustom || t.duree || estimerDureeTravaux(surface || 50, t.posteId);
    ends[t.posteId] = startWeek + duree;
    timeline.push({ ...t, label: t.label || p?.label || t.posteId, startWeek, duree, endWeek: startWeek + duree });
  });
  const maxWeek = Math.max(...timeline.map(t => t.endWeek), 1);
  const colors = ['#2563EB', '#D97706', '#8B5CF6', '#16A34A', '#DC2626', '#0891B2', '#A68B4B', '#6366F1', '#059669', '#E11D48', '#7C3AED'];

  return (
    <div style={{ ...CARD, marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Planning travaux</div>
        <div style={{ fontSize: 12, color: L.textLight }}>Durée totale : {Math.ceil(maxWeek)} semaines</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {/* Header semaines */}
        <div style={{ display: 'flex', marginLeft: 140, marginBottom: 4 }}>
          {Array.from({ length: Math.ceil(maxWeek) }, (_, i) => (
            <div key={i} style={{ minWidth: 40, fontSize: 9, color: L.textLight, textAlign: 'center', borderLeft: `1px solid ${L.borderLight}` }}>S{i + 1}</div>
          ))}
        </div>
        {/* Barres */}
        {timeline.map((t, i) => (
          <div key={t.posteId} style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
            <div style={{ width: 140, fontSize: 11, fontWeight: 500, color: L.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, paddingRight: 8 }}>{t.label}</div>
            <div style={{ flex: 1, position: 'relative', height: 20 }}>
              <div style={{
                position: 'absolute', left: `${(t.startWeek / maxWeek) * 100}%`, width: `${Math.max(2, (t.duree / maxWeek) * 100)}%`,
                height: 18, borderRadius: 4, background: colors[i % colors.length], opacity: 0.85,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 600,
              }}>
                {t.duree >= 1 ? `${t.duree}s` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════
export default function InvestirModule({ data, setData, showToast, genId }) {
  const [dossiers, setDossiers] = useState(loadDossiers);
  const [activeDossier, setActiveDossier] = useState(null);
  const [vue, setVue] = useState('pipeline'); // 'pipeline' | 'dossier'

  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(dossiers)); }, [dossiers]);

  const d = activeDossier ? dossiers.find(x => x.id === activeDossier) : null;

  function updateDossier(id, updates) {
    setDossiers(prev => prev.map(x => x.id === id ? { ...x, ...updates } : x));
  }
  function creerDossier() {
    const nouveau = { ...DOSSIER_VIDE, id: Date.now(), nom: `Dossier ${dossiers.length + 1}`, creeLe: new Date().toISOString() };
    setDossiers(prev => [nouveau, ...prev]);
    setActiveDossier(nouveau.id);
    setVue('dossier');
  }
  function dupliquerDossier(id) {
    const original = dossiers.find(x => x.id === id);
    if (!original) return;
    const copie = { ...JSON.parse(JSON.stringify(original)), id: Date.now(), nom: `${original.nom} (copie)`, statut: 'etude', creeLe: new Date().toISOString() };
    setDossiers(prev => [copie, ...prev]);
    showToast?.('Dossier dupliqué');
  }

  // ── Calculs auto pour le dossier actif ──
  const prixM2Marche = d ? estimerPrixM2(d.adresse) : 0;
  const prixM2Bien = d && d.surface ? (d.prixAchat || d.prixDemande || 0) / d.surface : 0;
  const ecartPrix = prixM2Marche > 0 ? ((prixM2Bien - prixM2Marche) / prixM2Marche * 100) : 0;
  const loyerAuto = d ? estimerLoyerComplet(d.adresse, d.surface, d.pieces, d.dpe) : 0;
  const loyerMensuel = d ? (d.loyerEstime || loyerAuto) : 0;
  const fraisNotaireAuto = d ? Math.round((d.prixAchat || 0) * (d.ancien ? 0.075 : 0.025)) : 0;
  const fraisNotaire = d ? (d.fraisNotaire ?? fraisNotaireAuto) : 0;
  const fraisGarantieAuto = d ? Math.round((d.prixAchat || 0) * 0.012) : 0;
  const budgetTravaux = d ? (d.travaux || []).reduce((s, t) => s + (t.budget || 0), 0) : 0;
  const tfAuto = d ? Math.round((d.surface || 0) * 12) : 0;
  const coproAuto = d ? Math.round((d.surface || 0) * 3) : 0;
  const pnoAuto = d ? Math.round(loyerMensuel * 12 * 0.02) : 0;
  const assEmprAuto = d ? Math.round((d.prixAchat || 0) * 0.003) : 0;
  const vacanceAuto = d ? Math.ceil(((d.travaux || []).reduce((s, t) => s + (t.dureeCustom || t.duree || 0), 0) / 4) + 1) : 2;

  const coutAcquisition = d ? ((d.prixAchat || 0) + fraisNotaire + (d.fraisAgence || 0) + (d.fraisCourtier || 0) + (d.fraisDossier || 0) + (d.fraisGarantie ?? fraisGarantieAuto)) : 0;
  const secuAuto = d ? Math.round((d.prixAchat || 0) * 0.02) : 0;
  const budgetSecu = d ? (d.budgetSecurite ?? secuAuto) : 0;
  const coutMiseEnLoc = d ? ((d.ameublement || 0) + (d.diagnostics || 0) + (d.assurancePNO ?? pnoAuto) + ((d.vacanceMois ?? vacanceAuto) * (d.mensualiteCredit || 0))) : 0;
  const coutTotal = coutAcquisition + budgetTravaux + coutMiseEnLoc + budgetSecu;
  const montantEmprunte = d ? Math.max(0, coutTotal - (d.apport || 0)) : 0;
  const score = d ? calcScore({ ...d, loyerEstime: loyerMensuel, fraisNotaire, budgetTravaux, chargesCopro: d.chargesCopro ?? coproAuto, taxeFonciere: d.taxeFonciere ?? tfAuto, assurancePNO: d.assurancePNO ?? pnoAuto, mensualiteCredit: d.mensualiteCredit }) : 0;
  const sl = scoreLabel(score);

  // Mensualité crédit
  function calcMensualite(capital, taux, dureeAns) {
    if (!capital || !taux || !dureeAns) return 0;
    const r = taux / 100 / 12;
    const n = dureeAns * 12;
    return Math.round(capital * r / (1 - Math.pow(1 + r, -n)));
  }

  // ══════════════════════════════════════
  //  VUE PIPELINE (Kanban)
  // ══════════════════════════════════════
  if (vue === 'pipeline') return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Mes projets d'investissement</h2>
          <p style={{ fontSize: 13, color: L.textLight, margin: '4px 0 0' }}>{dossiers.length} dossier{dossiers.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={creerDossier} style={BTN}>+ Nouveau dossier</button>
      </div>

      {dossiers.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>+</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Aucun dossier d'investissement</div>
          <div style={{ fontSize: 13, color: L.textLight, marginBottom: 20 }}>Créez votre premier dossier pour simuler une acquisition immobilière.</div>
          <button onClick={creerDossier} style={BTN}>Créer un dossier</button>
        </div>
      ) : (
        <div>
          {/* Kanban */}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {STATUTS.filter(s => s.id !== 'abandonne').map(statut => {
              const items = dossiers.filter(d => d.statut === statut.id);
              return (
                <div key={statut.id} style={{ minWidth: 220, flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: statut.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statut.color }} />
                    {statut.label} ({items.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {items.map(d => (
                      <div key={d.id} onClick={() => { setActiveDossier(d.id); setVue('dossier'); }}
                        style={{ ...CARD, padding: '12px 14px', cursor: 'pointer', borderLeft: `3px solid ${statut.color}`, transition: 'box-shadow .15s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{d.nom || 'Sans nom'}</div>
                        {d.adresse && <div style={{ fontSize: 11, color: L.textLight, marginBottom: 4 }}>{d.adresse}</div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          {d.prixAchat ? <span style={{ fontWeight: 600 }}>{fmtE(d.prixAchat)}</span> : <span style={{ color: L.textLight }}>Prix non défini</span>}
                          {d.surface ? <span style={{ color: L.textLight }}>{d.surface} m²</span> : null}
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && <div style={{ padding: 16, fontSize: 11, color: L.textLight, textAlign: 'center', border: `1px dashed ${L.border}` }}>Aucun dossier</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dossiers abandonnés */}
          {dossiers.filter(d => d.statut === 'abandonne').length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: L.textLight, marginBottom: 6 }}>Abandonnés ({dossiers.filter(d => d.statut === 'abandonne').length})</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {dossiers.filter(d => d.statut === 'abandonne').map(d => (
                  <div key={d.id} onClick={() => { setActiveDossier(d.id); setVue('dossier'); }}
                    style={{ padding: '8px 14px', background: '#F8F7F4', border: `1px solid ${L.border}`, fontSize: 12, cursor: 'pointer', opacity: 0.6 }}>
                    {d.nom} — {d.adresse || '?'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════
  //  VUE DOSSIER (5 étapes)
  // ══════════════════════════════════════
  if (!d) { setVue('pipeline'); return null; }
  const etape = d.etape || 1;
  const setEtape = (n) => updateDossier(d.id, { etape: n });
  const u = (updates) => updateDossier(d.id, updates);
  const estimatedField = (label, value, autoValue, field) => (
    <div>
      <label style={LBL}>{label} {value == null && <span style={EST}>(estimé)</span>}</label>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input type="number" value={value ?? autoValue} onChange={e => u({ [field]: e.target.value === '' ? null : Number(e.target.value) })}
          style={{ ...INP, fontWeight: value != null ? 700 : 400, color: value != null ? L.text : L.textLight, fontStyle: value != null ? 'normal' : 'italic' }} />
        {value != null && <button onClick={() => u({ [field]: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: L.textLight }} title="Réinitialiser">↺</button>}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setVue('pipeline')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: L.gold }}>← Retour</button>
          <input value={d.nom} onChange={e => u({ nom: e.target.value })} style={{ fontSize: 18, fontWeight: 800, border: 'none', outline: 'none', fontFamily: L.font, background: 'transparent', color: L.text, width: 300 }} placeholder="Nom du dossier" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={d.statut} onChange={e => u({ statut: e.target.value })} style={{ padding: '6px 12px', border: `1px solid ${L.border}`, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, color: STATUTS.find(s => s.id === d.statut)?.color }}>
            {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button onClick={() => dupliquerDossier(d.id)} style={BTN_O}>Dupliquer</button>
          <button onClick={() => { setDossiers(prev => prev.filter(x => x.id !== d.id)); setVue('pipeline'); showToast?.('Dossier supprimé'); }} style={{ ...BTN_O, color: L.red, borderColor: L.red }}>Supprimer</button>
        </div>
      </div>

      {/* Score */}
      {d.prixAchat > 0 && (
        <div style={{ ...CARD, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, borderLeft: `4px solid ${sl.color}` }}>
          <div style={{ fontSize: 36, fontWeight: 300, color: sl.color }}>{score}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: sl.color }}>{sl.label}</div>
            <div style={{ fontSize: 12, color: L.textLight }}>Score d'investissement Freample</div>
          </div>
          {prixM2Bien > 0 && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{Math.round(prixM2Bien)} €/m² <span style={{ color: ecartPrix > 0 ? L.red : L.green, fontSize: 11 }}>({ecartPrix > 0 ? '+' : ''}{ecartPrix.toFixed(0)}% vs marché)</span></div>
              <div style={{ fontSize: 11, color: L.textLight }}>Marché : {fmt(prixM2Marche)} €/m² — Offre suggérée : {fmtE(Math.round(prixM2Marche * 0.95 * (d.surface || 1)))} – {fmtE(Math.round(prixM2Marche * (d.surface || 1)))}</div>
            </div>
          )}
        </div>
      )}

      {/* Navigation étapes */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[
          { n: 1, label: 'Étudier' },
          { n: 2, label: 'Budgétiser' },
          { n: 3, label: 'Financer' },
          { n: 4, label: 'Piloter travaux' },
          { n: 5, label: 'Mettre en location' },
        ].map(s => (
          <button key={s.n} onClick={() => setEtape(s.n)}
            style={{ flex: 1, padding: '10px 8px', fontSize: 12, fontWeight: etape === s.n ? 700 : 400, border: `1px solid ${etape === s.n ? L.gold : L.border}`, background: etape === s.n ? L.cream : 'transparent', color: etape === s.n ? L.gold : L.textLight, cursor: 'pointer', fontFamily: L.font, borderBottom: etape === s.n ? `3px solid ${L.gold}` : `3px solid transparent` }}>
            {s.n}. {s.label}
          </button>
        ))}
      </div>

      {/* ═══ ÉTAPE 1 — ÉTUDIER ═══ */}
      {etape === 1 && <>
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Informations du bien</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={LBL}>Adresse</label><input value={d.adresse} onChange={e => u({ adresse: e.target.value })} placeholder="12 rue de la Paix, Paris 3e" style={INP} /></div>
            <div><label style={LBL}>Type</label><select value={d.type} onChange={e => u({ type: e.target.value })} style={INP}>{TYPES_BIEN.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label style={LBL}>Ancien / Neuf</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {[true, false].map(v => <button key={String(v)} onClick={() => u({ ancien: v })} style={{ flex: 1, padding: '8px', fontSize: 12, fontWeight: 600, border: `1px solid ${d.ancien === v ? L.gold : L.border}`, background: d.ancien === v ? L.cream : 'transparent', color: d.ancien === v ? L.gold : L.textLight, cursor: 'pointer', fontFamily: L.font }}>{v ? 'Ancien' : 'Neuf'}</button>)}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
            <div><label style={LBL}>Surface (m²)</label><input type="number" value={d.surface} onChange={e => u({ surface: Number(e.target.value) })} style={INP} /></div>
            <div><label style={LBL}>Pièces</label><input type="number" value={d.pieces} onChange={e => u({ pieces: Number(e.target.value) })} style={INP} /></div>
            <div><label style={LBL}>Étage</label><input value={d.etage} onChange={e => u({ etage: e.target.value })} style={INP} /></div>
            <div><label style={LBL}>DPE</label><select value={d.dpe} onChange={e => u({ dpe: e.target.value })} style={{ ...INP, color: ['F', 'G'].includes(d.dpe) ? L.red : L.text }}>{DPE_LIST.map(v => <option key={v}>{v}</option>)}</select></div>
            <div><label style={LBL}>Prix demandé</label><input type="number" value={d.prixDemande} onChange={e => u({ prixDemande: Number(e.target.value), prixAchat: d.prixAchat || Number(e.target.value) })} style={INP} /></div>
          </div>
        </div>

        {/* Alertes DPE */}
        {['F', 'G'].includes(d.dpe) && (
          <div style={{ ...CARD, marginBottom: 16, borderLeft: `4px solid ${L.red}`, background: '#FEF2F2' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: L.red }}>DPE {d.dpe} — Interdiction de location</div>
            <div style={{ fontSize: 12, color: '#92400E', marginTop: 4 }}>Depuis 2025, les logements classés F et G sont interdits à la location. Des travaux de rénovation énergétique seront obligatoires avant la mise en location.</div>
          </div>
        )}

        {/* Estimations auto — loyer basé sur ville + pièces + DPE */}
        {d.surface > 0 && (
          <div style={{ ...CARD, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Estimations Freample</div>
            <div style={{ fontSize: 11, color: L.textLight, marginBottom: 12 }}>Calculées selon la localisation, la surface, le nombre de pièces et le DPE. Cliquez sur une valeur pour la personnaliser.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
              {estimatedField('Loyer mensuel (€)', d.loyerEstime, loyerAuto, 'loyerEstime')}
              {estimatedField('Taxe foncière (€/an)', d.taxeFonciere, tfAuto, 'taxeFonciere')}
              {estimatedField('Charges copro (€/mois)', d.chargesCopro, coproAuto, 'chargesCopro')}
              {estimatedField('Assurance PNO (€/an)', d.assurancePNO, pnoAuto, 'assurancePNO')}
            </div>
            {d.dpe && ['F','G'].includes(d.dpe) && (
              <div style={{ marginTop: 8, fontSize: 11, color: L.red }}>Le DPE {d.dpe} réduit le loyer estimé de {d.dpe === 'F' ? '15' : '25'}% par rapport à un DPE C.</div>
            )}
          </div>
        )}

        {/* Géorisques — déterministes selon l'adresse */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Risques naturels (Géorisques)</div>
          {d.adresse ? (() => {
            const risques = calcGeorisques(d.adresse);
            const niveauColors = { faible: { bg: '#F0FDF4', color: L.green, label: 'Faible' }, moyen: { bg: '#FFFBEB', color: L.orange, label: 'Moyen' }, fort: { bg: '#FEF2F2', color: L.red, label: 'Fort' } };
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {risques.map(r => {
                  const c = niveauColors[r.niveau];
                  return (
                    <div key={r.nom} style={{ padding: '8px 12px', background: c.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <span>{r.nom}</span>
                      <span style={{ fontWeight: 700, color: c.color, fontSize: 11 }}>{c.label}</span>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div style={{ fontSize: 12, color: L.textLight }}>Saisissez l'adresse pour afficher les risques naturels.</div>
          )}
          <div style={{ marginTop: 8, fontSize: 10, color: L.textLight }}>Données indicatives basées sur la localisation. Consultez georisques.gouv.fr pour les données officielles.</div>
        </div>

        {/* Demande accompagnement visite — multi-sélection métiers */}
        <div style={{ ...CARD }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Visite avec des artisans Freample</div>
          <div style={{ fontSize: 12, color: L.textLight, marginBottom: 14 }}>Des artisans vous accompagnent gratuitement pour estimer les travaux sur place. Sélectionnez les corps de métier nécessaires.</div>
          <div style={{ marginBottom: 12 }}>
            <label style={LBL}>Métiers nécessaires (cliquez pour sélectionner)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {METIERS_VISITE.map(m => {
                const selected = (d.visiteMetiers || []).includes(m);
                return (
                  <button key={m} onClick={() => u({ visiteMetiers: selected ? (d.visiteMetiers || []).filter(x => x !== m) : [...(d.visiteMetiers || []), m] })}
                    style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, border: `1px solid ${selected ? L.gold : L.border}`, background: selected ? L.cream : 'transparent', color: selected ? L.gold : L.textLight, cursor: 'pointer', fontFamily: L.font, transition: 'all .15s' }}>
                    {selected ? '✓ ' : ''}{m}
                  </button>
                );
              })}
            </div>
            {(d.visiteMetiers || []).length > 0 && (
              <div style={{ marginTop: 6, fontSize: 11, color: L.gold }}>{(d.visiteMetiers || []).length} artisan{(d.visiteMetiers || []).length > 1 ? 's' : ''} demandé{(d.visiteMetiers || []).length > 1 ? 's' : ''} — une demande sera publiée par métier</div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
            <div><label style={LBL}>Date de visite</label><input type="date" value={d.visiteDate || ''} onChange={e => u({ visiteDate: e.target.value })} style={INP} /></div>
            <div><label style={LBL}>Heure</label><input type="time" value={d.visiteHeure || '14:00'} onChange={e => u({ visiteHeure: e.target.value })} style={INP} /></div>
            <button onClick={() => {
              if ((d.visiteMetiers || []).length === 0) return showToast?.('Sélectionnez au moins un métier');
              if (!d.visiteDate) return showToast?.('Choisissez une date');
              showToast?.(`${(d.visiteMetiers || []).length} demande${(d.visiteMetiers || []).length > 1 ? 's' : ''} envoyée${(d.visiteMetiers || []).length > 1 ? 's' : ''} aux artisans de la zone`);
              u({ demandesVisite: [...(d.demandesVisite || []), ...d.visiteMetiers.map(m => ({ id: Date.now() + Math.random(), metier: m, date: d.visiteDate, heure: d.visiteHeure, statut: 'en_attente', artisan: null }))] });
            }} style={{ ...BTN, background: L.gold, whiteSpace: 'nowrap' }}>Envoyer les demandes</button>
          </div>
          {/* Demandes envoyées */}
          {(d.demandesVisite || []).length > 0 && (
            <div style={{ marginTop: 14, borderTop: `1px solid ${L.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Demandes envoyées</div>
              {(d.demandesVisite || []).map(dv => (
                <div key={dv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${L.borderLight}`, fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>{dv.metier}</span>
                  <span style={{ color: L.textLight }}>{dv.date} à {dv.heure}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: dv.statut === 'accepte' ? L.green : L.orange, background: dv.statut === 'accepte' ? '#F0FDF4' : '#FFFBEB', padding: '2px 8px' }}>
                    {dv.statut === 'accepte' ? `${dv.artisan} confirmé` : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* Devis reçus des artisans */}
          {(d.devisRecus || []).length > 0 && (
            <div style={{ marginTop: 14, borderTop: `1px solid ${L.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: L.green, marginBottom: 8 }}>Devis reçus</div>
              {(d.devisRecus || []).map((dv, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F0FDF4', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>{dv.artisan} — {dv.poste}</span>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{fmtE(dv.montant)}</span>
                </div>
              ))}
              <div style={{ marginTop: 6, fontSize: 11, color: L.textLight }}>Les devis acceptés mettent à jour automatiquement le budget travaux de l'étape 2.</div>
            </div>
          )}
        </div>
      </>}

      {/* ═══ ÉTAPE 2 — BUDGÉTISER ═══ */}
      {etape === 2 && <>
        {/* Acquisition */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Phase 1 — Acquisition</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div><label style={LBL}>Prix d'achat</label><input type="number" value={d.prixAchat || ''} onChange={e => u({ prixAchat: Number(e.target.value) })} style={INP} /></div>
            {estimatedField('Frais de notaire', d.fraisNotaire, fraisNotaireAuto, 'fraisNotaire')}
            <div><label style={LBL}>Frais d'agence</label><input type="number" value={d.fraisAgence || ''} onChange={e => u({ fraisAgence: Number(e.target.value) })} style={INP} /></div>
            <div><label style={LBL}>Frais de courtier</label><input type="number" value={d.fraisCourtier || ''} onChange={e => u({ fraisCourtier: Number(e.target.value) })} style={INP} /></div>
            <div><label style={LBL}>Frais de dossier bancaire</label><input type="number" value={d.fraisDossier || ''} onChange={e => u({ fraisDossier: Number(e.target.value) })} style={INP} /></div>
            {estimatedField('Frais de garantie', d.fraisGarantie, fraisGarantieAuto, 'fraisGarantie')}
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: L.cream, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
            <span>Sous-total acquisition</span><span>{fmtE(coutAcquisition)}</span>
          </div>
        </div>

        {/* Travaux */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Phase 2 — Travaux</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <select onChange={e => {
                if (!e.target.value) return;
                const p = POSTES_TRAVAUX.find(x => x.id === e.target.value);
                if (p && !(d.travaux || []).find(t => t.posteId === p.id)) {
                  const duree = estimerDureeTravaux(d.surface || 50, p.id);
                  const budget = estimerCoutTravaux(d.surface || 50, p.id);
                  u({ travaux: [...(d.travaux || []), { posteId: p.id, label: p.label, budget, duree, dureeCustom: null, budgetCustom: null, statut: 'attente', depense: 0 }] });
                }
                e.target.value = '';
              }} style={{ ...INP, width: 200 }}>
                <option value="">+ Ajouter un poste</option>
                {POSTES_TRAVAUX.filter(p => !(d.travaux || []).find(t => t.posteId === p.id)).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>
          {(d.travaux || []).length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: L.textLight, fontSize: 12 }}>Ajoutez des postes de travaux pour estimer le budget et la durée.</div>
          ) : (
            <div>
              {(d.travaux || []).map((t, i) => (
                <div key={t.posteId} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 6, alignItems: 'center', padding: '8px 10px', background: i % 2 === 0 ? 'transparent' : '#FAFAF8', borderRadius: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
                  <div>
                    <div style={{ fontSize: 10, color: L.textLight }}>Budget {t.budgetCustom == null ? '(estimé)' : ''}</div>
                    <input type="number" value={t.budgetCustom ?? t.budget} onChange={e => {
                      const travaux = [...d.travaux]; travaux[i] = { ...t, budgetCustom: Number(e.target.value), budget: Number(e.target.value) }; u({ travaux });
                    }} style={{ ...INP, padding: '6px 8px', fontSize: 12, fontWeight: t.budgetCustom != null ? 700 : 400, fontStyle: t.budgetCustom != null ? 'normal' : 'italic' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: L.textLight }}>Durée (sem.) {t.dureeCustom == null ? '(estimé)' : ''}</div>
                    <input type="number" step="0.5" value={t.dureeCustom ?? t.duree} onChange={e => {
                      const travaux = [...d.travaux]; travaux[i] = { ...t, dureeCustom: Number(e.target.value) }; u({ travaux });
                    }} style={{ ...INP, padding: '6px 8px', fontSize: 12, fontWeight: t.dureeCustom != null ? 700 : 400, fontStyle: t.dureeCustom != null ? 'normal' : 'italic' }} />
                  </div>
                  <button onClick={() => showToast?.('Demande de devis envoyée')} style={{ fontSize: 10, fontWeight: 600, color: L.gold, background: 'transparent', border: `1px solid ${L.gold}`, padding: '6px 8px', cursor: 'pointer', fontFamily: L.font }}>Devis Freample</button>
                  <button onClick={() => u({ travaux: d.travaux.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: L.red, fontSize: 16 }}>×</button>
                </div>
              ))}
              <div style={{ marginTop: 10, padding: '10px 14px', background: L.cream, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                <span>Sous-total travaux</span><span>{fmtE(budgetTravaux)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Gantt */}
        <GanttChart travaux={d.travaux || []} dateDebut={d.dateDebutTravaux} surface={d.surface} />

        {/* Mise en location */}
        <div style={{ ...CARD, marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Phase 3 — Mise en location</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div><label style={LBL}>Ameublement</label><input type="number" value={d.ameublement || ''} onChange={e => u({ ameublement: Number(e.target.value) })} style={INP} /></div>
            <div><label style={LBL}>Diagnostics</label><input type="number" value={d.diagnostics || ''} onChange={e => u({ diagnostics: Number(e.target.value) })} style={INP} /></div>
            {estimatedField('Vacance (mois)', d.vacanceMois, vacanceAuto, 'vacanceMois')}
            {estimatedField('Assurance emprunteur/an', d.assuranceEmprunteur, assEmprAuto, 'assuranceEmprunteur')}
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: L.cream, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
            <span>Sous-total mise en location</span><span>{fmtE(coutMiseEnLoc)}</span>
          </div>
        </div>

        {/* Budget sécurité */}
        <div style={{ ...CARD, marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Enveloppe de sécurité</div>
          <div style={{ fontSize: 12, color: L.textLight, marginBottom: 10 }}>Réserve pour imprévus (vacance prolongée, travaux supplémentaires, réparations urgentes). Recommandé : 2% du prix d'achat.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {estimatedField('Budget sécurité (€)', d.budgetSecurite, secuAuto, 'budgetSecurite')}
            <div style={{ display: 'flex', alignItems: 'end', fontSize: 12, color: L.textLight, paddingBottom: 10 }}>
              = {((d.prixAchat || 0) > 0 ? ((d.budgetSecurite ?? secuAuto) / (d.prixAchat || 1) * 100).toFixed(1) : 0)}% du prix d'achat
            </div>
          </div>
        </div>

        {/* Total clé en main */}
        <div style={{ ...CARD, marginTop: 16, borderLeft: `4px solid ${L.gold}`, background: '#FDFCF7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
            <span>Coût total clé en main</span><span style={{ color: L.gold }}>{fmtE(coutTotal)}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginTop: 12, fontSize: 12 }}>
            <div>Acquisition : <strong>{fmtE(coutAcquisition)}</strong></div>
            <div>Travaux : <strong>{fmtE(budgetTravaux)}</strong></div>
            <div>Mise en loc : <strong>{fmtE(coutMiseEnLoc)}</strong></div>
            <div>Sécurité : <strong>{fmtE(budgetSecu)}</strong></div>
          </div>
        </div>
      </>}

      {/* ═══ ÉTAPE 3 — FINANCER ═══ */}
      {etape === 3 && <>
        {/* Profil emprunteur */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Profil emprunteur</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div><label style={LBL}>Apport personnel</label><input type="number" value={d.apport || ''} onChange={e => u({ apport: Number(e.target.value) })} style={INP} /></div>
            <div><label style={LBL}>Revenus mensuels nets</label><input type="number" value={d.revenus || ''} onChange={e => u({ revenus: Number(e.target.value) })} style={INP} /></div>
            <div><label style={LBL}>Charges mensuelles</label><input type="number" value={d.chargesPerso || ''} onChange={e => u({ chargesPerso: Number(e.target.value) })} style={INP} /></div>
            <div><label style={LBL}>Autres crédits (€/mois)</label><input type="number" value={d.autresCredits || ''} onChange={e => u({ autresCredits: Number(e.target.value) })} style={INP} /></div>
          </div>
        </div>

        {/* 3 scénarios crédit */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Simulation de financement</div>
          <div style={{ marginBottom: 10 }}>
            <label style={LBL}>Taux estimé (%)</label>
            <input type="number" step="0.1" value={d.tauxCredit || 3.5} onChange={e => u({ tauxCredit: Number(e.target.value) })} style={{ ...INP, width: 120 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[15, 20, 25].map(duree => {
              const capital = Math.max(0, coutTotal - (d.apport || 0));
              const mens = calcMensualite(capital, d.tauxCredit || 3.5, duree);
              const coutCredit = mens * duree * 12 - capital;
              const chargesMens = (d.chargesCopro ?? coproAuto) + (d.taxeFonciere ?? tfAuto) / 12 + (d.assurancePNO ?? pnoAuto) / 12;
              const cf = loyerMensuel - mens - chargesMens;
              const rendApport = (d.apport || 0) > 0 ? (cf * 12 / (d.apport || 1) * 100) : 0;
              return (
                <div key={duree} style={{ border: `1px solid ${duree === 20 ? L.gold : L.border}`, padding: 16, background: duree === 20 ? '#FDFCF7' : 'transparent' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10, color: duree === 20 ? L.gold : L.text }}>{duree} ans</div>
                  {[
                    ['Montant emprunté', fmtE(capital)],
                    ['Mensualité', fmtE(mens)],
                    ['Coût total crédit', fmtE(coutCredit)],
                    ['Cashflow mensuel', <span style={{ color: cf >= 0 ? L.green : L.red, fontWeight: 700 }}>{cf >= 0 ? '+' : ''}{fmt(Math.round(cf))} €</span>],
                    ['Rendement / apport', <span style={{ color: rendApport >= 0 ? L.green : L.red, fontWeight: 700 }}>{pct(rendApport)}</span>],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderBottom: `1px solid ${L.borderLight}` }}>
                      <span style={{ color: L.textLight }}>{l}</span><span>{v}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stress test */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Stress test</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Optimiste', color: L.green, taux: 0, vacance: 0, loyerAjust: 0 },
              { label: 'Réaliste', color: L.orange, taux: 0.5, vacance: 1, loyerAjust: -5 },
              { label: 'Pessimiste', color: L.red, taux: 1.5, vacance: 2, loyerAjust: -15 },
            ].map(sc => {
              const capital = Math.max(0, coutTotal - (d.apport || 0));
              const mens = calcMensualite(capital, (d.tauxCredit || 3.5) + sc.taux, d.dureeCredit || 20);
              const loyerAdj = loyerMensuel * (1 + sc.loyerAjust / 100);
              const chargesMens = (d.chargesCopro ?? coproAuto) + (d.taxeFonciere ?? tfAuto) / 12 + (d.assurancePNO ?? pnoAuto) / 12;
              const cfAnnuel = (loyerAdj * (12 - sc.vacance)) - mens * 12 - chargesMens * 12;
              return (
                <div key={sc.label} style={{ border: `1px solid ${sc.color}30`, padding: 14, borderTop: `3px solid ${sc.color}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: sc.color, marginBottom: 8 }}>{sc.label}</div>
                  <div style={{ fontSize: 11, color: L.textLight, lineHeight: 1.8 }}>
                    Taux : {((d.tauxCredit || 3.5) + sc.taux).toFixed(1)}%<br />
                    Vacance : {sc.vacance} mois/an<br />
                    Loyer : {sc.loyerAjust !== 0 ? `${sc.loyerAjust}%` : 'inchangé'}<br />
                  </div>
                  <div style={{ marginTop: 8, padding: '8px 10px', background: cfAnnuel >= 0 ? '#F0FDF4' : '#FEF2F2', fontWeight: 700, fontSize: 13, color: cfAnnuel >= 0 ? L.green : L.red }}>
                    {cfAnnuel >= 0 ? '+' : ''}{fmt(Math.round(cfAnnuel))} €/an
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Immo vs placement — avec effet de levier */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Immobilier vs placements financiers</div>
          <div style={{ fontSize: 11, color: L.textLight, marginBottom: 14 }}>L'immobilier utilise l'effet de levier : vous investissez votre apport, mais le bien est financé par le crédit et remboursé par les locataires.</div>
          {(d.apport || 0) > 0 ? (() => {
            const apport = d.apport || 0;
            const capital = Math.max(0, coutTotal - apport);
            const mens = calcMensualite(capital, d.tauxCredit || 3.5, d.dureeCredit || 20);
            const chargesMens = (d.chargesCopro ?? coproAuto) + (d.taxeFonciere ?? tfAuto) / 12 + (d.assurancePNO ?? pnoAuto) / 12;
            // Cashflow = loyers (11 mois/an pour vacance) - crédit - charges
            const cfAnnuel = loyerMensuel * 11 - mens * 12 - chargesMens * 12;
            // Capital amorti par an (remboursé par les locataires)
            const capitalAmortiParAn = mens * 12 - capital * (d.tauxCredit || 3.5) / 100; // partie capital de la mensualité
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Livret A (3%)', taux: 3, color: '#2563EB' },
                  { label: 'Assurance-vie (2,5%)', taux: 2.5, color: '#8B5CF6' },
                  { label: 'Bourse (7% moy.)', taux: 7, color: '#D97706' },
                  { label: 'Ce bien (levier)', taux: null, color: L.gold },
                ].map(p => {
                  let gain10, gain20, detail;
                  if (p.taux !== null) {
                    gain10 = apport * Math.pow(1 + p.taux / 100, 10) - apport;
                    gain20 = apport * Math.pow(1 + p.taux / 100, 20) - apport;
                    detail = `${p.taux}% par an, pas d'effet de levier`;
                  } else {
                    // Immo : cashflow cumulé + capital remboursé par locataires + plus-value
                    const pv10 = (d.prixAchat || 0) * (Math.pow(1.02, 10) - 1);
                    const pv20 = (d.prixAchat || 0) * (Math.pow(1.02, 20) - 1);
                    const capitalRembourse10 = Math.min(capital, capitalAmortiParAn * 10);
                    const capitalRembourse20 = Math.min(capital, capitalAmortiParAn * 20);
                    gain10 = cfAnnuel * 10 + capitalRembourse10 + pv10;
                    gain20 = cfAnnuel * 20 + capitalRembourse20 + pv20;
                    detail = `Loyers remboursent le crédit + plus-value 2%/an`;
                  }
                  return (
                    <div key={p.label} style={{ padding: 14, border: `1px solid ${p.color}30`, borderTop: `3px solid ${p.color}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: p.color, marginBottom: 8 }}>{p.label}</div>
                      <div style={{ fontSize: 12, lineHeight: 2.2 }}>
                        <div>10 ans : <strong style={{ color: gain10 >= 0 ? L.green : L.red }}>{gain10 >= 0 ? '+' : ''}{fmtE(Math.round(gain10))}</strong></div>
                        <div>20 ans : <strong style={{ color: gain20 >= 0 ? L.green : L.red }}>{gain20 >= 0 ? '+' : ''}{fmtE(Math.round(gain20))}</strong></div>
                      </div>
                      <div style={{ fontSize: 10, color: L.textLight, marginTop: 6, lineHeight: 1.4 }}>{detail}</div>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div style={{ fontSize: 12, color: L.textLight }}>Renseignez votre apport personnel pour comparer.</div>
          )}
          <div style={{ marginTop: 10, fontSize: 10, color: L.textLight }}>L'immobilier intègre : cashflow net (loyers - crédit - charges), capital remboursé par les locataires, et plus-value estimée à 2%/an. Les placements financiers n'utilisent que l'apport initial.</div>
        </div>

        {/* PDF */}
        <button onClick={() => { showToast?.('Utilisez Ctrl+P pour sauvegarder en PDF'); window.print(); }}
          style={{ ...BTN, padding: '12px 24px', fontSize: 14, background: L.gold }}>Générer le dossier bancaire (PDF)</button>
      </>}

      {/* ═══ ÉTAPE 4 — PILOTER TRAVAUX ═══ */}
      {etape === 4 && <>
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Suivi des travaux — Prévu vs Réel</div>
          {(d.travaux || []).length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: L.textLight, fontSize: 12 }}>Aucun poste de travaux défini. Retournez à l'étape 2 pour ajouter des postes.</div>
          ) : (
            <div>
              {/* Progression globale */}
              {(() => {
                const totalPrevu = (d.travaux || []).reduce((s, t) => s + (t.budget || 0), 0);
                const totalDepense = (d.travaux || []).reduce((s, t) => s + (t.depense || 0), 0);
                const termine = (d.travaux || []).filter(t => t.statut === 'termine').length;
                const pctTermine = d.travaux.length > 0 ? Math.round(termine / d.travaux.length * 100) : 0;
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 300 }}>{pctTermine}%</div>
                      <div style={{ fontSize: 10, color: L.textLight }}>Avancement</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 300 }}>{fmtE(totalPrevu)}</div>
                      <div style={{ fontSize: 10, color: L.textLight }}>Budget prévu</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 300 }}>{fmtE(totalDepense)}</div>
                      <div style={{ fontSize: 10, color: L.textLight }}>Dépensé</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 300, color: totalDepense > totalPrevu * 1.1 ? L.red : L.green }}>{fmtE(totalPrevu - totalDepense)}</div>
                      <div style={{ fontSize: 10, color: L.textLight }}>Reste</div>
                    </div>
                  </div>
                );
              })()}
              {/* Tableau par poste */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${L.border}` }}>
                    {['Poste', 'Budget', 'Dépensé', 'Écart', 'Statut'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: L.textLight, textTransform: 'uppercase', textAlign: h === 'Poste' ? 'left' : 'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(d.travaux || []).map((t, i) => {
                    const ecart = (t.budget || 0) - (t.depense || 0);
                    const depasse = t.depense > t.budget * 1.1;
                    return (
                      <tr key={t.posteId} style={{ borderBottom: `1px solid ${L.borderLight}`, background: depasse ? '#FEF2F2' : 'transparent' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{t.label}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmtE(t.budget)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          <input type="number" value={t.depense || ''} onChange={e => {
                            const travaux = [...d.travaux]; travaux[i] = { ...t, depense: Number(e.target.value) }; u({ travaux });
                          }} style={{ width: 90, padding: '4px 6px', border: `1px solid ${L.border}`, fontSize: 12, textAlign: 'right', fontFamily: L.font }} />
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: ecart < 0 ? L.red : L.green }}>{ecart >= 0 ? '+' : ''}{fmt(ecart)} €</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          <select value={t.statut || 'attente'} onChange={e => {
                            const travaux = [...d.travaux]; travaux[i] = { ...t, statut: e.target.value }; u({ travaux });
                          }} style={{ padding: '4px 8px', border: `1px solid ${L.border}`, fontSize: 11, fontFamily: L.font }}>
                            <option value="attente">En attente</option><option value="en_cours">En cours</option><option value="termine">Terminé</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <GanttChart travaux={d.travaux || []} dateDebut={d.dateDebutTravaux} surface={d.surface} />
      </>}

      {/* ═══ ÉTAPE 5 — METTRE EN LOCATION ═══ */}
      {etape === 5 && <>
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Checklist avant achat</div>
          {CHECKLIST_AVANT_ACHAT.map(item => (
            <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${L.borderLight}`, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={(d.checkAvant || []).includes(item)}
                onChange={e => u({ checkAvant: e.target.checked ? [...(d.checkAvant || []), item] : (d.checkAvant || []).filter(x => x !== item) })}
                style={{ accentColor: L.gold, width: 18, height: 18 }} />
              <span style={{ color: (d.checkAvant || []).includes(item) ? L.green : L.text }}>{item}</span>
            </label>
          ))}
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: (d.checkAvant || []).length === CHECKLIST_AVANT_ACHAT.length ? L.green : L.orange }}>
            {(d.checkAvant || []).length}/{CHECKLIST_AVANT_ACHAT.length} validés
          </div>
        </div>

        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Checklist mise en location</div>
          {CHECKLIST_AVANT_LOC.map(item => (
            <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${L.borderLight}`, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={(d.checkLoc || []).includes(item)}
                onChange={e => u({ checkLoc: e.target.checked ? [...(d.checkLoc || []), item] : (d.checkLoc || []).filter(x => x !== item) })}
                style={{ accentColor: L.gold, width: 18, height: 18 }} />
              <span style={{ color: (d.checkLoc || []).includes(item) ? L.green : L.text }}>{item}</span>
            </label>
          ))}
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: (d.checkLoc || []).length === CHECKLIST_AVANT_LOC.length ? L.green : L.orange }}>
            {(d.checkLoc || []).length}/{CHECKLIST_AVANT_LOC.length} validés
          </div>
        </div>

        {/* Transition vers bien actif */}
        {(d.checkAvant || []).length === CHECKLIST_AVANT_ACHAT.length && (d.checkLoc || []).length === CHECKLIST_AVANT_LOC.length && (
          <div style={{ ...CARD, borderLeft: `4px solid ${L.green}`, background: '#F0FDF4' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: L.green, marginBottom: 8 }}>Prêt pour la mise en location</div>
            <div style={{ fontSize: 13, color: L.textSec, marginBottom: 16 }}>Toutes les vérifications sont complètes. Transformez ce dossier en bien actif dans votre patrimoine SCI.</div>
            <button onClick={() => {
              if (!data || !setData) return;
              const bien = { id: genId?.() || Date.now(), sciId: data.scis[0]?.id || 1, nom: d.nom || 'Nouveau bien', type: d.type, adresse: d.adresse, surface: d.surface || 0, pieces: d.pieces || 0, prixAchat: d.prixAchat || 0, fraisNotaire: fraisNotaire, travaux: budgetTravaux, dateAcquisition: new Date().toISOString().slice(0, 10), valeur: d.prixAchat || 0, loyer: loyerMensuel, autresRevenus: 0, charges: d.chargesCopro ?? coproAuto, chargesNonRecup: 0, vacanceLocative: 0, locataireId: null, dpe: d.dpe, assurance: { pno: d.assurancePNO ?? pnoAuto, gli: 0 }, taxeFonciere: d.taxeFonciere ?? tfAuto };
              setData(prev => ({ ...prev, biens: [...prev.biens, bien] }));
              updateDossier(d.id, { statut: 'location' });
              showToast?.(`${d.nom} ajouté à votre patrimoine`);
              setVue('pipeline');
            }} style={{ ...BTN, background: L.green, padding: '12px 24px', fontSize: 14 }}>
              Transformer en bien actif
            </button>
          </div>
        )}
      </>}

      {/* ═══ NOTES / JOURNAL DE BORD ═══ */}
      <div style={{ ...CARD, marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Notes & journal de bord</div>
        <textarea value={d.notes || ''} onChange={e => u({ notes: e.target.value })}
          rows={4} placeholder="Impressions après la visite, remarques de l'artisan, points à vérifier..."
          style={{ ...INP, resize: 'vertical', lineHeight: 1.6 }} />
      </div>
    </div>
  );
}
