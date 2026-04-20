import React, { useState, useMemo, useRef } from 'react';
import { getProfilEntreprise, isProfilComplet, champsManquants, LABELS_CHAMPS } from '../utils/profilEntreprise';

// ── Constantes ──
const TVA_RATES = [0, 5.5, 10, 20];
const UNITES = ['u', 'm\u00B2', 'm', 'ml', 'h', 'j', 'forfait', 'kg', 'm\u00B3', 'ensemble'];
const TYPE_LIGNE = ['Fourniture', 'Main d\'oeuvre', 'Deplacement', 'Sous-traitance', 'Divers'];

const TEMPLATES_BTP = [
  { cat: 'Maconnerie', items: [
    { description: 'Realisation de mur en parpaings 20 cm — fourniture et pose', unite: 'm\u00B2', prixUnitaire: 85, tva: 10, type: 'Fourniture' },
    { description: 'Enduit de facade projete — preparation + application', unite: 'm\u00B2', prixUnitaire: 45, tva: 10, type: 'Main d\'oeuvre' },
    { description: 'Chape liquide autonivelante — fourniture et pose', unite: 'm\u00B2', prixUnitaire: 28, tva: 10, type: 'Fourniture' },
  ]},
  { cat: 'Carrelage / Sol', items: [
    { description: 'Pose de carrelage 60x60 rectifie — fourniture et pose', unite: 'm\u00B2', prixUnitaire: 65, tva: 10, type: 'Fourniture' },
    { description: 'Ragreage de sol — preparation et pose', unite: 'm\u00B2', prixUnitaire: 18, tva: 10, type: 'Main d\'oeuvre' },
    { description: 'Pose de plinthes carrelage', unite: 'ml', prixUnitaire: 22, tva: 10, type: 'Main d\'oeuvre' },
  ]},
  { cat: 'Peinture', items: [
    { description: 'Peinture interieure 2 couches — preparation + application', unite: 'm\u00B2', prixUnitaire: 22, tva: 10, type: 'Main d\'oeuvre' },
    { description: 'Ravalement de facade — nettoyage + peinture', unite: 'm\u00B2', prixUnitaire: 55, tva: 10, type: 'Main d\'oeuvre' },
  ]},
  { cat: 'Plomberie', items: [
    { description: 'Installation salle de bain complete — fourniture et pose', unite: 'forfait', prixUnitaire: 2800, tva: 10, type: 'Fourniture' },
    { description: 'Remplacement chauffe-eau — fourniture et pose', unite: 'u', prixUnitaire: 950, tva: 10, type: 'Fourniture' },
  ]},
  { cat: 'Electricite', items: [
    { description: 'Mise aux normes tableau electrique', unite: 'forfait', prixUnitaire: 1200, tva: 10, type: 'Main d\'oeuvre' },
    { description: 'Pose de prises et interrupteurs', unite: 'u', prixUnitaire: 85, tva: 10, type: 'Fourniture' },
  ]},
  { cat: 'Gros oeuvre', items: [
    { description: 'Demolition cloison — depose et evacuation', unite: 'm\u00B2', prixUnitaire: 35, tva: 10, type: 'Main d\'oeuvre' },
    { description: 'Ouverture mur porteur avec IPN', unite: 'forfait', prixUnitaire: 3500, tva: 10, type: 'Main d\'oeuvre' },
  ]},
  { cat: 'Deplacement / Divers', items: [
    { description: 'Frais de deplacement', unite: 'forfait', prixUnitaire: 45, tva: 20, type: 'Deplacement' },
    { description: 'Depose et evacuation dechets de chantier', unite: 'forfait', prixUnitaire: 350, tva: 20, type: 'Divers' },
    { description: 'Protection et nettoyage chantier', unite: 'forfait', prixUnitaire: 180, tva: 20, type: 'Divers' },
  ]},
];

const ECHEANCIER_DEFAUT = [
  { label: 'Acompte a la commande', pct: 30 },
  { label: 'Situation en cours de chantier', pct: 40 },
  { label: 'Solde a la reception des travaux', pct: 30 },
];

const VALIDITE_OPTIONS = [15, 30, 60, 90];

const LIGNE_VIDE = { description: '', quantite: 1, unite: 'u', prixUnitaire: '', tva: 10, remise: 0, type: 'Fourniture', lot: '' };

// ── Calculs ──
function calcLine(l) {
  const qty = Number(l.quantite) || 0;
  const pu = Number(l.prixUnitaire) || 0;
  const remPct = Number(l.remise) || 0;
  const ht = qty * pu * (1 - remPct / 100);
  return { ht, tvaAmt: ht * (Number(l.tva) || 0) / 100 };
}

function calcTotals(lignes, remiseGlobale = 0) {
  let totalHTBrut = 0, tvaDetails = {};
  lignes.forEach(l => {
    const c = calcLine(l);
    totalHTBrut += c.ht;
    const rate = Number(l.tva) || 0;
    if (!tvaDetails[rate]) tvaDetails[rate] = { base: 0, montant: 0 };
    tvaDetails[rate].base += c.ht;
    tvaDetails[rate].montant += c.tvaAmt;
  });
  const remiseMt = totalHTBrut * remiseGlobale / 100;
  const totalHT = totalHTBrut - remiseMt;
  const ratio = totalHTBrut > 0 ? totalHT / totalHTBrut : 0;
  let totalTVA = 0;
  Object.keys(tvaDetails).forEach(r => {
    tvaDetails[r].baseApresRemise = tvaDetails[r].base * ratio;
    tvaDetails[r].montantApresRemise = tvaDetails[r].montant * ratio;
    totalTVA += tvaDetails[r].montantApresRemise;
  });
  // Totaux par type
  const parType = {};
  lignes.forEach(l => {
    const t = l.type || 'Divers';
    if (!parType[t]) parType[t] = 0;
    parType[t] += calcLine(l).ht;
  });
  // Totaux par lot
  const parLot = {};
  lignes.forEach(l => {
    const lot = l.lot || 'Sans lot';
    if (!parLot[lot]) parLot[lot] = 0;
    parLot[lot] += calcLine(l).ht;
  });
  return { totalHTBrut, remiseMt, totalHT, totalTVA, totalTTC: totalHT + totalTVA, tvaDetails, parType, parLot };
}

// ── Styles ──
const inp = { width: '100%', padding: '8px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#1C1C1E', background: '#fff', fontFamily: 'inherit' };
const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6E6E73', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 };
const SECTION = { background: '#F8F9FD', borderRadius: 14, padding: 18, border: '1px solid #E0EAFF' };
const SECTION_TITLE = { fontSize: 13, fontWeight: 700, color: '#1C1C1E', marginBottom: 14 };
const fmtE = n => Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Formulaire de devis professionnel BTP — conforme aux obligations legales francaises
 *
 * Props:
 *   clientNom, missionTitre — pre-remplissage
 *   entreprise — { nom, forme, adresse, siret, tvaIntra, decennale, decennaleAssureur, decennaleCouverture, rcpro, rcproAssureur, email, tel }
 *   isAE — boolean: auto-entrepreneur (mention TVA non applicable)
 *   onSoumettre(devis) — callback
 *   onAnnuler() — callback
 *   compact — masquer certaines sections
 *   initialData — devis existant pour edition/versioning
 */
export default function DevisFormulaire({
  clientNom = '', missionTitre = '', entreprise = {}, isAE = false, user = null,
  onSoumettre, onAnnuler, onOuvrirProfil, compact = false, initialData = null
}) {
  // ── Emetteur lu depuis profil centralisé (lecture seule dans le formulaire) ──
  const userCtx = user || { entrepriseType: isAE ? 'ae' : 'patron' };
  const [emetteur] = useState(() => {
    // Si un devis existant est modifié : utiliser son snapshot (ne change plus)
    if (initialData?.emetteur && Object.keys(initialData.emetteur).length > 3) return initialData.emetteur;
    // Sinon : lecture profil centralisé
    return getProfilEntreprise(userCtx);
  });
  const profilComplet = isProfilComplet(emetteur);
  const manquants = champsManquants(emetteur);

  // ── Client ──
  const [client, setClient] = useState(() => {
    // Pré-remplissage depuis profil client Freample (si connu via email/nom matching)
    let profilClient = {};
    try {
      const allProfils = JSON.parse(localStorage.getItem('freample_client_profil') || '{}');
      // Profil par defaut (solo client connecte) OU on cherche par email
      profilClient = allProfils;
    } catch {}
    return {
      nom: initialData?.client?.nom || clientNom,
      email: initialData?.client?.email || profilClient.email || '',
      telephone: initialData?.client?.telephone || profilClient.tel || '',
      adresse: initialData?.client?.adresse || (profilClient.adresse ? `${profilClient.adresse}, ${profilClient.codePostal || ''} ${profilClient.ville || ''}`.trim() : ''),
      adresseChantier: initialData?.client?.adresseChantier || '',
    };
  });

  // ── Devis meta ──
  const [metierDevis, setMetierDevis] = useState(initialData?.metier || '');
  const [objet, setObjet] = useState(initialData?.objet || missionTitre);
  const [validiteJours, setValiditeJours] = useState(initialData?.validiteJours || 30);
  const [dateDebut, setDateDebut] = useState(initialData?.dateDebut || '');
  const [dureeEstimee, setDureeEstimee] = useState(initialData?.dureeEstimee || '');

  // ── Lots ──
  const [lots, setLots] = useState(initialData?.lots || ['Lot 1']);
  const [showAddLot, setShowAddLot] = useState(false);
  const [newLotName, setNewLotName] = useState('');

  // ── Lignes ──
  const [lignes, setLignes] = useState(initialData?.lignes || [{ ...LIGNE_VIDE, lot: 'Lot 1' }]);
  const [remiseGlobale, setRemiseGlobale] = useState(initialData?.remiseGlobale || 0);

  // ── Options (variantes) ──
  const [options, setOptions] = useState(initialData?.options || []);

  // ── Echeancier ──
  const [echeancier, setEcheancier] = useState(initialData?.echeancier || ECHEANCIER_DEFAUT.map(e => ({ ...e })));

  // ── Conditions ──
  const [conditions, setConditions] = useState(initialData?.conditions || {
    penalitesRetard: '3 fois le taux d\'interet legal',
    indemniteRecouvrement: 40,
    garantieParfaitAchevement: true,
    garantieBiennale: true,
    garantieDecennale: true,
    droitRetractation: false, // true si demarchage a domicile
    receptionTravaux: 'Contradictoire avec PV de reception',
  });

  // ── Notes ──
  const [notes, setNotes] = useState(initialData?.notes || '');

  // ── Templates ──
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCat, setTemplateCat] = useState(null);

  // ── Preview ──
  const [showPreview, setShowPreview] = useState(false);

  // ── Calculs ──
  const totals = useMemo(() => calcTotals(lignes, remiseGlobale), [lignes, remiseGlobale]);
  const optionsTotals = useMemo(() => calcTotals(options, 0), [options]);

  // ── Handlers lignes ──
  function updateLigne(i, field, val) { setLignes(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l)); }
  function removeLigne(i) { setLignes(prev => prev.filter((_, idx) => idx !== i)); }
  function addLigne(template, lot) {
    setLignes(prev => [...prev, template ? { ...LIGNE_VIDE, ...template, lot: lot || lots[0] || '', remise: 0 } : { ...LIGNE_VIDE, lot: lot || lots[0] || '' }]);
    setShowTemplates(false); setTemplateCat(null);
  }

  // ── Submit (3 actions possibles) ──
  function handleSubmit(action = 'brouillon') {
    // Si envoyer : snapshot figé de l'émetteur au moment de l'envoi
    const emetteurFinal = action === 'envoyer' ? { ...getProfilEntreprise(userCtx) } : emetteur;
    const devis = {
      emetteur: emetteurFinal, client, objet, metier: metierDevis, validiteJours, dateDebut, dureeEstimee,
      lots, lignes, options, remiseGlobale, echeancier, conditions, notes,
      isAE, ...totals, optionsTotalTTC: optionsTotals.totalTTC,
      creeLe: new Date().toISOString(),
      mentionTVA: isAE ? 'TVA non applicable, art. 293B du CGI' : null,
      _action: action, // 'brouillon' | 'envoyer' | 'pdf'
      _editingId: initialData?.id || null, // si on modifie un devis existant
    };
    onSoumettre?.(devis);
  }

  // ═══════════════════════════════════════════
  // PREVIEW PDF-like
  // ═══════════════════════════════════════════
  if (showPreview) {
    return (
      <div style={{ background: '#fff', maxWidth: 800, margin: '0 auto', padding: 40, fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#1C1C1E', border: '1px solid #E5E5EA', borderRadius: 8 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em' }}>{emetteur.nom || 'Votre entreprise'}</div>
            <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 4 }}>{emetteur.forme} — SIRET {emetteur.siret}</div>
            <div style={{ fontSize: 11, color: '#6E6E73' }}>{emetteur.adresse}</div>
            <div style={{ fontSize: 11, color: '#6E6E73' }}>{emetteur.email} — {emetteur.tel}</div>
            {emetteur.tvaIntra && <div style={{ fontSize: 11, color: '#6E6E73' }}>TVA Intra: {emetteur.tvaIntra}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#A68B4B' }}>DEVIS</div>
            <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 4 }}>Date: {new Date().toLocaleDateString('fr-FR')}</div>
            <div style={{ fontSize: 11, color: '#6E6E73' }}>Validite: {validiteJours} jours</div>
          </div>
        </div>

        {/* Client */}
        <div style={{ background: '#F8F9FD', padding: 16, borderRadius: 8, marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', marginBottom: 6 }}>Client</div>
          <div style={{ fontWeight: 600 }}>{client.nom || '—'}</div>
          <div style={{ fontSize: 11, color: '#6E6E73' }}>{client.adresse || ''}</div>
          <div style={{ fontSize: 11, color: '#6E6E73' }}>{client.email} {client.telephone ? `— ${client.telephone}` : ''}</div>
          {client.adresseChantier && <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 4 }}>Adresse chantier: {client.adresseChantier}</div>}
        </div>

        {/* Objet + dates */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Objet: {objet}</div>
          {dateDebut && <div style={{ fontSize: 11, color: '#6E6E73' }}>Debut prevu: {dateDebut} — Duree estimee: {dureeEstimee || 'A definir'}</div>}
        </div>

        {/* Assurances */}
        <div style={{ background: '#FFF9F0', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 11 }}>
          {emetteur.decennale && <div>Assurance decennale n{'\u00B0'}{emetteur.decennale} — {emetteur.decennaleAssureur} — Couverture: {emetteur.decennaleCouverture}</div>}
          {emetteur.rcpro && <div>RC Professionnelle n{'\u00B0'}{emetteur.rcpro} — {emetteur.rcproAssureur}</div>}
          {!emetteur.decennale && !emetteur.rcpro && <div style={{ color: '#DC2626' }}>Assurances non renseignees</div>}
        </div>

        {/* Lignes par lot */}
        {lots.map(lot => {
          const lotLignes = lignes.filter(l => l.lot === lot);
          if (lotLignes.length === 0) return null;
          const lotTotal = lotLignes.reduce((s, l) => s + calcLine(l).ht, 0);
          return (
            <div key={lot} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#A68B4B', padding: '6px 0', borderBottom: '2px solid #A68B4B', marginBottom: 8 }}>{lot}</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#F2F2F7' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>Description</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, width: 50 }}>Type</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, width: 40 }}>Qte</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, width: 40 }}>Unite</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, width: 70 }}>P.U. HT</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, width: 40 }}>TVA</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, width: 80 }}>Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {lotLignes.map((l, i) => {
                    const { ht } = calcLine(l);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #F2F2F7' }}>
                        <td style={{ padding: '6px 8px' }}>{l.description}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: 10, color: '#6E6E73' }}>{l.type}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{l.quantite}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{l.unite}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtE(l.prixUnitaire)} EUR</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{l.tva}%</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{fmtE(ht)} EUR</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#FAFAF8' }}>
                    <td colSpan={6} style={{ padding: '6px 8px', fontWeight: 700, textAlign: 'right' }}>Sous-total {lot}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>{fmtE(lotTotal)} EUR</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}

        {/* Recapitulatif par type */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
          <div style={{ flex: 1, background: '#F8F9FD', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', marginBottom: 6 }}>Decomposition par nature</div>
            {Object.entries(totals.parType).map(([type, mt]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>{type}</span><span style={{ fontWeight: 600 }}>{fmtE(mt)} EUR</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, background: '#F8F9FD', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', marginBottom: 6 }}>Detail TVA</div>
            {isAE ? (
              <div style={{ fontWeight: 600, color: '#A68B4B' }}>TVA non applicable, art. 293B du CGI</div>
            ) : (
              Object.entries(totals.tvaDetails).filter(([,v]) => v.montantApresRemise > 0).map(([rate, v]) => (
                <div key={rate} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>TVA {rate}% (base {fmtE(v.baseApresRemise)})</span><span style={{ fontWeight: 600 }}>{fmtE(v.montantApresRemise)} EUR</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Totaux */}
        <div style={{ borderTop: '2px solid #1C1C1E', paddingTop: 12, marginBottom: 20 }}>
          {totals.remiseMt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span>Total HT brut</span><span>{fmtE(totals.totalHTBrut)} EUR</span></div>}
          {totals.remiseMt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#DC2626' }}><span>Remise {remiseGlobale}%</span><span>-{fmtE(totals.remiseMt)} EUR</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span style={{ fontWeight: 600 }}>Total HT</span><span style={{ fontWeight: 600 }}>{fmtE(totals.totalHT)} EUR</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span>Total TVA</span><span>{fmtE(totals.totalTVA)} EUR</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 16, fontWeight: 900, borderTop: '2px solid #1C1C1E', marginTop: 4 }}>
            <span>Total TTC</span><span style={{ color: '#A68B4B' }}>{fmtE(totals.totalTTC)} EUR</span>
          </div>
        </div>

        {/* Options */}
        {options.length > 0 && (
          <div style={{ marginBottom: 20, padding: 12, background: '#FFFBEB', borderRadius: 8, border: '1px dashed #D97706' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', marginBottom: 6 }}>OPTIONS (non incluses dans le total)</div>
            {options.map((o, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
                <span>{o.description} ({o.quantite} {o.unite})</span><span style={{ fontWeight: 600 }}>{fmtE(calcLine(o).ht)} EUR HT</span>
              </div>
            ))}
            <div style={{ fontWeight: 700, textAlign: 'right', marginTop: 4 }}>Total options TTC: {fmtE(optionsTotals.totalTTC)} EUR</div>
          </div>
        )}

        {/* Echeancier */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>ECHEANCIER DE PAIEMENT</div>
          {echeancier.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>{e.label}</span><span style={{ fontWeight: 600 }}>{e.pct}% — {fmtE(totals.totalTTC * e.pct / 100)} EUR TTC</span>
            </div>
          ))}
        </div>

        {/* Conditions legales */}
        <div style={{ fontSize: 11, color: '#6E6E73', lineHeight: 1.6, borderTop: '1px solid #E5E5EA', paddingTop: 12, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 4 }}>CONDITIONS ET MENTIONS LEGALES</div>
          <div>Penalites de retard : {conditions.penalitesRetard}.</div>
          <div>Indemnite forfaitaire de recouvrement : {conditions.indemniteRecouvrement} EUR (art. D441-5 du Code de commerce).</div>
          {conditions.garantieDecennale && <div>Les travaux sont couverts par la garantie decennale (10 ans), la garantie de parfait achevement (1 an) et la garantie biennale (2 ans).</div>}
          <div>Reception des travaux : {conditions.receptionTravaux}.</div>
          {conditions.droitRetractation && <div style={{ fontWeight: 600 }}>Droit de retractation : le client dispose d'un delai de 14 jours a compter de la signature du present devis pour exercer son droit de retractation (art. L221-18 du Code de la consommation).</div>}
          {isAE && <div style={{ fontWeight: 600, color: '#A68B4B' }}>TVA non applicable, art. 293B du CGI.</div>}
          {notes && <div style={{ marginTop: 8 }}><strong>Notes :</strong> {notes}</div>}
        </div>

        {/* Signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
          <div style={{ border: '1px solid #E5E5EA', borderRadius: 8, padding: 16, minHeight: 80 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6E6E73', marginBottom: 4 }}>L'ENTREPRISE</div>
            <div style={{ fontSize: 11 }}>{emetteur.nom}</div>
          </div>
          <div style={{ border: '1px solid #E5E5EA', borderRadius: 8, padding: 16, minHeight: 80 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6E6E73', marginBottom: 4 }}>LE CLIENT</div>
            <div style={{ fontSize: 10, color: '#6E6E73', fontStyle: 'italic' }}>Mention manuscrite "Devis recu avant l'execution des travaux" + date et signature</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
          <button onClick={() => setShowPreview(false)} style={{ padding: '10px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#1C1C1E' }}>Retour au formulaire</button>
          <button onClick={handleSubmit} style={{ padding: '10px 28px', border: 'none', borderRadius: 10, background: '#A68B4B', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Valider et envoyer</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // FORMULAIRE
  // ═══════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Section 1: Emetteur (lecture seule, depuis profil entreprise) ── */}
      {!compact && !profilComplet && (
        <div style={{ ...SECTION, background: '#FEF2F2', border: '1px solid #DC2626', borderLeft: '4px solid #DC2626' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#DC2626', marginBottom: 6 }}>Profil entreprise incomplet</div>
          <div style={{ fontSize: 12, color: '#6E6E73', marginBottom: 10 }}>
            Pour créer un devis conforme, complétez d'abord votre profil entreprise. Champs manquants : <strong>{manquants.map(c => LABELS_CHAMPS[c] || c).join(', ')}</strong>.
          </div>
          {onOuvrirProfil && (
            <button type="button" onClick={onOuvrirProfil}
              style={{ padding: '8px 16px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Compléter mon profil entreprise
            </button>
          )}
        </div>
      )}
      {!compact && profilComplet && (
        <div style={{ ...SECTION, background: '#F0FDF4', borderLeft: '4px solid #16A34A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>Devis émis par</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{emetteur.nom} <span style={{ fontSize: 11, color: '#6E6E73', fontWeight: 500 }}>· {emetteur.forme}</span></div>
            <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 2 }}>
              SIRET {emetteur.siret}{emetteur.tvaIntra ? ` · TVA ${emetteur.tvaIntra}` : ''} · {emetteur.adresse}, {emetteur.codePostal} {emetteur.ville}
            </div>
            {emetteur.decennale && <div style={{ fontSize: 10, color: '#16A34A', marginTop: 2 }}>Décennale {emetteur.decennale} · {emetteur.decennaleAssureur || ''}</div>}
          </div>
          {onOuvrirProfil && (
            <button type="button" onClick={onOuvrirProfil}
              style={{ padding: '6px 12px', background: 'transparent', color: '#16A34A', border: '1px solid #16A34A', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              Modifier mon profil
            </button>
          )}
        </div>
      )}

      {/* ── Section 2: Client ── */}
      <div style={SECTION}>
        <div style={SECTION_TITLE}>Client</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><label style={lbl}>Nom / Raison sociale</label><input value={client.nom} onChange={e => setClient(p => ({ ...p, nom: e.target.value }))} style={inp} /></div>
          <div><label style={lbl}>Email</label><input type="email" value={client.email} onChange={e => setClient(p => ({ ...p, email: e.target.value }))} style={inp} /></div>
          <div><label style={lbl}>Telephone</label><input value={client.telephone} onChange={e => setClient(p => ({ ...p, telephone: e.target.value }))} style={inp} /></div>
          <div><label style={lbl}>Adresse</label><input value={client.adresse} onChange={e => setClient(p => ({ ...p, adresse: e.target.value }))} style={inp} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Adresse du chantier (si differente)</label><input value={client.adresseChantier} onChange={e => setClient(p => ({ ...p, adresseChantier: e.target.value }))} style={inp} placeholder="Laisser vide si identique" /></div>
        </div>
      </div>

      {/* ── Section 3: Objet + Dates ── */}
      <div style={SECTION}>
        <div style={SECTION_TITLE}>Objet et planification</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
          <div><label style={lbl}>Objet du devis</label><input value={objet} onChange={e => setObjet(e.target.value)} style={inp} placeholder="Renovation salle de bain — 12 m2" /></div>
          <div><label style={lbl}>Metier</label>
            <select value={metierDevis} onChange={e => setMetierDevis(e.target.value)} style={inp}>
              <option value="">-- Sélectionner --</option>
              {(() => { try { const p = JSON.parse(localStorage.getItem(isAE ? 'freample_ae_profil' : 'freample_profil_patron') || '{}'); return (p.metiers || []).map(m => <option key={m} value={m}>{m}</option>); } catch { return null; } })()}
            </select>
          </div>
          <div><label style={lbl}>Validite (jours)</label>
            <select value={validiteJours} onChange={e => setValiditeJours(Number(e.target.value))} style={inp}>
              {VALIDITE_OPTIONS.map(v => <option key={v} value={v}>{v} jours</option>)}
            </select>
          </div>
          <div><label style={lbl}>Debut prevu</label><input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Duree estimee</label><input value={dureeEstimee} onChange={e => setDureeEstimee(e.target.value)} style={inp} placeholder="3 semaines" /></div>
        </div>
      </div>

      {/* ── Section 4: Lots ── */}
      <div style={SECTION}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={SECTION_TITLE}>Lots / Postes</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {showAddLot ? (
              <>
                <input value={newLotName} onChange={e => setNewLotName(e.target.value)} style={{ ...inp, width: 180 }} placeholder="Ex: Lot 2 — Plomberie" autoFocus
                  onKeyDown={e => { if (e.key === 'Enter' && newLotName) { setLots(p => [...p, newLotName]); setNewLotName(''); setShowAddLot(false); }}} />
                <button onClick={() => { if (newLotName) { setLots(p => [...p, newLotName]); setNewLotName(''); setShowAddLot(false); }}}
                  style={{ padding: '6px 12px', background: '#A68B4B', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>OK</button>
              </>
            ) : (
              <button onClick={() => setShowAddLot(true)}
                style={{ padding: '6px 12px', background: 'none', border: '1px dashed #C7C7CC', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#6E6E73' }}>+ Ajouter un lot</button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {lots.map(lot => (
            <span key={lot} style={{ padding: '4px 12px', background: '#A68B4B20', color: '#A68B4B', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{lot}</span>
          ))}
        </div>
      </div>

      {/* ── Section 5: Lignes (par lot) ── */}
      <div style={SECTION}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={SECTION_TITLE}>Prestations</div>
          <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setShowTemplates(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#fff', border: '1px solid #E5E5EA', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#5B5BD6' }}>
              Templates BTP
            </button>
            {showTemplates && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 100, background: '#fff', borderRadius: 12, border: '1px solid #E5E5EA', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 340, maxHeight: 400, overflow: 'auto' }}>
                {TEMPLATES_BTP.map(cat => (
                  <div key={cat.cat}>
                    <button type="button" onClick={() => setTemplateCat(templateCat === cat.cat ? null : cat.cat)}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: templateCat === cat.cat ? '#F0F5FF' : 'none', border: 'none', borderBottom: '1px solid #F2F2F7', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1C1C1E' }}>
                      {cat.cat}
                    </button>
                    {templateCat === cat.cat && cat.items.map((item, i) => (
                      <button key={i} type="button" onClick={() => addLigne(item)}
                        style={{ width: '100%', textAlign: 'left', padding: '8px 24px', background: 'none', border: 'none', borderBottom: '1px solid #F9F9F9', cursor: 'pointer', fontSize: 12, color: '#3C3C43' }}>
                        {item.description} — <strong>{item.prixUnitaire} EUR/{item.unite}</strong>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lignes par lot */}
        {lots.map(lot => {
          const lotLignes = lignes.map((l, i) => ({ ...l, _idx: i })).filter(l => l.lot === lot);
          return (
            <div key={lot} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#A68B4B', padding: '6px 0', borderBottom: '1px solid #A68B4B40', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{lot}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6E6E73' }}>{fmtE(lotLignes.reduce((s, l) => s + calcLine(l).ht, 0))} EUR HT</span>
              </div>
              {/* Headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 80px 50px 60px 75px 50px 50px 65px 28px', gap: 4, marginBottom: 4 }}>
                {['Description', 'Type', 'Qte', 'Unite', 'P.U. HT', 'TVA', 'Rem.%', 'Total HT', ''].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.3 }}>{h}</div>
                ))}
              </div>
              {lotLignes.map(l => {
                const { ht } = calcLine(l);
                return (
                  <div key={l._idx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 80px 50px 60px 75px 50px 50px 65px 28px', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                    <input value={l.description} onChange={e => updateLigne(l._idx, 'description', e.target.value)} placeholder="Prestation..." style={inp} />
                    <select value={l.type} onChange={e => updateLigne(l._idx, 'type', e.target.value)} style={{ ...inp, padding: '8px 2px', fontSize: 10 }}>
                      {TYPE_LIGNE.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <input type="number" value={l.quantite} min="0" onChange={e => updateLigne(l._idx, 'quantite', e.target.value)} style={{ ...inp, textAlign: 'center' }} />
                    <select value={l.unite} onChange={e => updateLigne(l._idx, 'unite', e.target.value)} style={{ ...inp, padding: '8px 2px' }}>
                      {UNITES.map(u => <option key={u}>{u}</option>)}
                    </select>
                    <input type="number" value={l.prixUnitaire} min="0" onChange={e => updateLigne(l._idx, 'prixUnitaire', e.target.value)} placeholder="0" style={{ ...inp, textAlign: 'right' }} />
                    <select value={l.tva} onChange={e => updateLigne(l._idx, 'tva', Number(e.target.value))} style={{ ...inp, padding: '8px 2px' }}>
                      {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                    <input type="number" value={l.remise} min="0" max="100" onChange={e => updateLigne(l._idx, 'remise', e.target.value)} placeholder="0" style={{ ...inp, textAlign: 'right' }} />
                    <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#1C1C1E' }}>{fmtE(ht)}</div>
                    <button type="button" onClick={() => lignes.length > 1 && removeLigne(l._idx)}
                      style={{ background: 'none', border: 'none', cursor: lignes.length > 1 ? 'pointer' : 'default', color: '#FF3B30', fontSize: 18, lineHeight: 1, opacity: lignes.length > 1 ? 1 : 0.25 }}>x</button>
                  </div>
                );
              })}
              <button type="button" onClick={() => addLigne(null, lot)}
                style={{ padding: '4px 10px', background: 'none', border: '1px dashed #C7C7CC', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#6E6E73', marginTop: 4 }}>
                + Ligne dans {lot}
              </button>
            </div>
          );
        })}

        {/* Remise globale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
          <label style={{ ...lbl, margin: 0, whiteSpace: 'nowrap' }}>Remise globale (%)</label>
          <input type="number" value={remiseGlobale} min="0" max="100" onChange={e => setRemiseGlobale(Number(e.target.value))} style={{ ...inp, width: 70, textAlign: 'right' }} />
        </div>
      </div>

      {/* ── Section 6: Options (variantes) ── */}
      <div style={SECTION}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={SECTION_TITLE}>Options / Variantes (non incluses dans le total)</div>
          <button type="button" onClick={() => setOptions(prev => [...prev, { ...LIGNE_VIDE }])}
            style={{ padding: '4px 10px', background: 'none', border: '1px dashed #D97706', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#D97706' }}>
            + Option
          </button>
        </div>
        {options.length === 0 && <div style={{ fontSize: 12, color: '#C7C7CC', textAlign: 'center', padding: 8 }}>Aucune option — le client pourra les ajouter en complement</div>}
        {options.map((o, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 50px 60px 75px 50px 65px 28px', gap: 4, marginBottom: 4, alignItems: 'center' }}>
            <input value={o.description} onChange={e => setOptions(prev => prev.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} style={inp} placeholder="Option..." />
            <input type="number" value={o.quantite} onChange={e => setOptions(prev => prev.map((x, j) => j === i ? { ...x, quantite: e.target.value } : x))} style={{ ...inp, textAlign: 'center' }} />
            <select value={o.unite} onChange={e => setOptions(prev => prev.map((x, j) => j === i ? { ...x, unite: e.target.value } : x))} style={{ ...inp, padding: '8px 2px' }}>
              {UNITES.map(u => <option key={u}>{u}</option>)}
            </select>
            <input type="number" value={o.prixUnitaire} onChange={e => setOptions(prev => prev.map((x, j) => j === i ? { ...x, prixUnitaire: e.target.value } : x))} style={{ ...inp, textAlign: 'right' }} placeholder="0" />
            <select value={o.tva} onChange={e => setOptions(prev => prev.map((x, j) => j === i ? { ...x, tva: Number(e.target.value) } : x))} style={{ ...inp, padding: '8px 2px' }}>
              {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
            <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600 }}>{fmtE(calcLine(o).ht)}</div>
            <button type="button" onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30', fontSize: 18 }}>x</button>
          </div>
        ))}
      </div>

      {/* ── Section 7: Totaux ── */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1px solid #E0EAFF' }}>
        {/* Par type */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          {Object.entries(totals.parType).map(([type, mt]) => (
            <span key={type} style={{ fontSize: 11, color: '#6E6E73' }}>{type}: <strong style={{ color: '#1C1C1E' }}>{fmtE(mt)} EUR</strong></span>
          ))}
        </div>
        {[
          totals.remiseMt > 0 && ['Total HT brut', totals.totalHTBrut, false],
          totals.remiseMt > 0 && ['Remise globale ' + remiseGlobale + '%', -totals.remiseMt, false],
          ['Total HT', totals.totalHT, false],
          ...Object.entries(totals.tvaDetails).filter(([, v]) => v.montantApresRemise > 0).map(([rate, v]) => ['TVA ' + rate + '% (base ' + fmtE(v.baseApresRemise) + ')', v.montantApresRemise, false]),
          isAE && ['TVA non applicable, art. 293B du CGI', 0, false],
          ['Total TTC', totals.totalTTC, true],
        ].filter(Boolean).map(([label, val, bold]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: bold ? '2px solid #E5E5EA' : 'none', marginTop: bold ? 6 : 0, paddingTop: bold ? 10 : 4 }}>
            <span style={{ fontSize: bold ? 15 : 13, fontWeight: bold ? 800 : 500, color: bold ? '#1C1C1E' : '#6E6E73' }}>{label}</span>
            <span style={{ fontSize: bold ? 16 : 13, fontWeight: bold ? 800 : 600, color: bold ? '#A68B4B' : '#1C1C1E' }}>
              {val < 0 ? '-' : ''}{fmtE(Math.abs(val))} EUR
            </span>
          </div>
        ))}
      </div>

      {/* ── Section 8: Echeancier ── */}
      {!compact && (
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Echeancier de paiement</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {echeancier.map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px', gap: 10, alignItems: 'center' }}>
                <input value={e.label} onChange={ev => setEcheancier(prev => prev.map((x, j) => j === i ? { ...x, label: ev.target.value } : x))} style={inp} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="number" value={e.pct} min="0" max="100" onChange={ev => setEcheancier(prev => prev.map((x, j) => j === i ? { ...x, pct: Number(ev.target.value) } : x))} style={{ ...inp, textAlign: 'right', width: 50 }} />
                  <span style={{ fontSize: 13, color: '#6E6E73' }}>%</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'right' }}>{fmtE(totals.totalTTC * e.pct / 100)} EUR</span>
              </div>
            ))}
            <button type="button" onClick={() => setEcheancier(prev => [...prev, { label: '', pct: 0 }])}
              style={{ padding: '4px 10px', background: 'none', border: '1px dashed #C7C7CC', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#6E6E73', alignSelf: 'flex-start' }}>
              + Echeance
            </button>
            <div style={{ fontSize: 12, color: echeancier.reduce((s, e) => s + e.pct, 0) === 100 ? '#34C759' : '#FF3B30', fontWeight: 600 }}>
              Total : {echeancier.reduce((s, e) => s + e.pct, 0)}% {echeancier.reduce((s, e) => s + e.pct, 0) === 100 ? '(OK)' : '(doit etre egal a 100%)'}
            </div>
          </div>
        </div>
      )}

      {/* ── Section 9: Conditions legales ── */}
      {!compact && (
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Conditions et mentions legales</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={lbl}>Penalites de retard</label><input value={conditions.penalitesRetard} onChange={e => setConditions(p => ({ ...p, penalitesRetard: e.target.value }))} style={inp} /></div>
            <div><label style={lbl}>Indemnite forfaitaire de recouvrement (EUR)</label><input type="number" value={conditions.indemniteRecouvrement} onChange={e => setConditions(p => ({ ...p, indemniteRecouvrement: Number(e.target.value) }))} style={{ ...inp, width: 100 }} /></div>
            <div><label style={lbl}>Reception des travaux</label><input value={conditions.receptionTravaux} onChange={e => setConditions(p => ({ ...p, receptionTravaux: e.target.value }))} style={inp} /></div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={conditions.garantieDecennale} onChange={e => setConditions(p => ({ ...p, garantieDecennale: e.target.checked }))} /> Garantie decennale (10 ans)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={conditions.garantieParfaitAchevement} onChange={e => setConditions(p => ({ ...p, garantieParfaitAchevement: e.target.checked }))} /> Garantie parfait achevement (1 an)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={conditions.garantieBiennale} onChange={e => setConditions(p => ({ ...p, garantieBiennale: e.target.checked }))} /> Garantie biennale (2 ans)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={conditions.droitRetractation} onChange={e => setConditions(p => ({ ...p, droitRetractation: e.target.checked }))} /> Droit de retractation 14j (demarchage)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 10: Notes ── */}
      <div style={SECTION}>
        <label style={{ ...lbl, marginBottom: 8 }}>Notes complementaires</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Conditions particulieres, delai d'execution, acces chantier, particularites..."
          style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
      </div>

      {/* ── Actions : 3 choix ── */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E0EAFF' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', marginBottom: 12 }}>
          {initialData?.id ? `Modifier ${initialData.numero}` : 'Que voulez-vous faire de ce devis ?'}
        </div>
        {!profilComplet && (
          <div style={{ padding: 10, background: '#FEF2F2', border: '1px solid #DC2626', borderRadius: 8, fontSize: 12, color: '#DC2626', marginBottom: 10 }}>
            Complétez d'abord votre profil entreprise pour activer les boutons.
          </div>
        )}
        {(() => { const disabled = totals.totalTTC === 0 || !profilComplet; return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Action principale : envoyer au client */}
          <button type="button" onClick={() => handleSubmit('envoyer')} disabled={disabled}
            style={{ padding: 14, border: 'none', borderRadius: 10, background: !disabled ? '#16A34A' : '#C7C7CC', color: '#fff', cursor: !disabled ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 15, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>📧</span>
            <div>
              <div>{initialData?.id ? 'Mettre à jour et envoyer au client' : 'Envoyer au client maintenant'}</div>
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.9, marginTop: 2 }}>Le client reçoit un lien par email, il peut consulter, signer et payer directement</div>
            </div>
          </button>
          {/* Action secondaire : brouillon */}
          <button type="button" onClick={() => handleSubmit('brouillon')} disabled={disabled}
            style={{ padding: 14, border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: !disabled ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14, color: '#1C1C1E', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, opacity: !disabled ? 1 : 0.5 }}>
            <span style={{ fontSize: 18 }}>💾</span>
            <div>
              <div>{initialData?.id ? 'Enregistrer les modifications' : 'Enregistrer comme brouillon'}</div>
              <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 2 }}>Sauvegardé dans vos devis, vous pourrez l'envoyer plus tard</div>
            </div>
          </button>
          {/* Action tertiaire : PDF */}
          <button type="button" onClick={() => handleSubmit('pdf')} disabled={disabled}
            style={{ padding: 14, border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: !disabled ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14, color: '#1C1C1E', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, opacity: !disabled ? 1 : 0.5 }}>
            <span style={{ fontSize: 18 }}>📄</span>
            <div>
              <div>Télécharger PDF seulement</div>
              <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 2 }}>Mode manuel, pas de séquestre Freample — vous gérez le paiement vous-même</div>
            </div>
          </button>
        </div>
        ); })()}

        {/* Boutons utilitaires */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid #F2F2F7' }}>
          {onAnnuler && (
            <button type="button" onClick={onAnnuler}
              style={{ padding: '8px 16px', border: '1px solid #E5E5EA', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12, color: '#6E6E73' }}>
              Annuler
            </button>
          )}
          <button type="button" onClick={() => setShowPreview(true)}
            style={{ padding: '8px 16px', border: '1px solid #A68B4B', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12, color: '#A68B4B' }}>
            Voir l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
}
