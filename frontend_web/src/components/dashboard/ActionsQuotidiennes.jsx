// ============================================================
//  ActionsQuotidiennes — Bloc intelligent "Vos actions du jour"
//  Se place en haut de chaque dashboard (SCI, Patron, AE)
// ============================================================
import React, { useState } from 'react';
import L from '../../design/luxe';

const MAX_VISIBLE = 5;

function ActionCard({ action }) {
  const colors = { rouge: L.red, orange: L.orange, bleu: L.blue, vert: L.green };
  const c = colors[action.urgence] || L.blue;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderLeft: `3px solid ${c}`, background: L.white, border: `1px solid ${L.border}`, borderLeftColor: c }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: L.text, lineHeight: 1.4 }}>{action.texte}</div>
        {action.detail && <div style={{ fontSize: 11, color: L.textLight, marginTop: 2 }}>{action.detail}</div>}
      </div>
      {action.bouton && (
        <button onClick={action.onClick} style={{ padding: '7px 16px', background: c, color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {action.bouton}
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════
//  Génération des actions par profil
// ══════════════════════════════════════

export function genererActionsSCI(data, biens, navigate, setTab) {
  const actions = [];
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Loyers impayés
  biens.filter(b => b.locataireId).forEach(b => {
    const loc = (data.locataires || []).find(l => l.id === b.locataireId);
    const paid = (data.paiements || []).find(p => p.bienId === b.id && p.mois === currentMonth && p.statut === 'paye');
    if (!paid && loc) {
      const jours = now.getDate();
      actions.push({
        urgence: jours > 10 ? 'rouge' : 'orange',
        texte: `${loc.prenom} ${loc.nom} n'a pas payé le loyer de ${MOIS[now.getMonth()]} (${b.loyer}€)`,
        detail: `${b.nom || b.adresse} — ${jours} jours de retard`,
        bouton: 'Relancer',
        onClick: () => loc.email && window.open(`mailto:${loc.email}?subject=${encodeURIComponent('Relance loyer')}&body=${encodeURIComponent(`Bonjour ${loc.prenom},\n\nVotre loyer de ${b.loyer}€ est en attente de règlement.\n\nCordialement`)}`, '_blank'),
      });
    }
  });

  // Baux qui expirent < 3 mois
  (data.locataires || []).forEach(l => {
    if (!l.fin) return;
    const jours = Math.floor((new Date(l.fin) - now) / (1000 * 60 * 60 * 24));
    if (jours > 0 && jours < 90) {
      actions.push({
        urgence: jours < 30 ? 'rouge' : 'orange',
        texte: `Le bail de ${l.prenom} ${l.nom} expire dans ${jours} jours`,
        detail: `Fin de bail : ${new Date(l.fin).toLocaleDateString('fr-FR')}`,
        bouton: 'Voir',
        onClick: () => setTab?.('gestion'),
      });
    }
    if (jours < 0) {
      actions.push({
        urgence: 'rouge',
        texte: `Le bail de ${l.prenom} ${l.nom} est expiré depuis ${Math.abs(jours)} jours`,
        bouton: 'Gérer',
        onClick: () => setTab?.('gestion'),
      });
    }
  });

  // DPE F/G
  biens.filter(b => ['F', 'G'].includes(b.dpe)).forEach(b => {
    actions.push({
      urgence: 'rouge',
      texte: `${b.nom || b.adresse} — DPE ${b.dpe}, interdit à la location`,
      detail: 'Travaux de rénovation énergétique obligatoires (loi Climat 2025)',
      bouton: 'Trouver un artisan',
      onClick: () => navigate?.('/btp'),
    });
  });

  // Quittances non générées ce mois
  const biensLoues = biens.filter(b => b.locataireId);
  const quittancesGenerees = (data.paiements || []).filter(p => p.mois === currentMonth && p.statut === 'paye').length;
  if (biensLoues.length > 0 && quittancesGenerees < biensLoues.length) {
    const manquantes = biensLoues.length - quittancesGenerees;
    actions.push({
      urgence: 'bleu',
      texte: `${manquantes} quittance${manquantes > 1 ? 's' : ''} de ${MOIS[now.getMonth()]} à générer`,
      bouton: 'Générer',
      onClick: () => setTab?.('quittances'),
    });
  }

  // Assurance PNO manquante
  biens.filter(b => !b.assurance?.pno || b.assurance.pno === 0).forEach(b => {
    actions.push({
      urgence: 'orange',
      texte: `${b.nom || b.adresse} — Assurance PNO non souscrite`,
      detail: 'Obligatoire pour tout bailleur (loi ALUR)',
      bouton: 'Voir le bien',
      onClick: () => setTab?.('biens'),
    });
  });

  // AG annuelle
  const anneePrecedente = now.getFullYear() - 1;
  actions.push({
    urgence: now.getMonth() >= 5 ? 'orange' : 'bleu', // après juin = urgent
    texte: `Assemblée Générale ${anneePrecedente} — à réaliser`,
    detail: 'Approbation des comptes annuels obligatoire',
    bouton: 'Rédiger le PV',
    onClick: () => setTab?.('ag'),
  });

  return actions.sort((a, b) => {
    const ordre = { rouge: 0, orange: 1, bleu: 2, vert: 3 };
    return (ordre[a.urgence] || 3) - (ordre[b.urgence] || 3);
  });
}

export function genererActionsPatron(data, navigate) {
  const actions = [];
  const now = new Date();

  // Factures impayées (depuis les données démo/API)
  actions.push({
    urgence: 'rouge',
    texte: 'Facture en retard — SCI Horizon (6 960€)',
    detail: 'Émise il y a 15 jours, aucun paiement reçu',
    bouton: 'Relancer',
    onClick: () => navigate?.('/patron/finance?onglet=facturation'),
  });

  // Devis en attente
  actions.push({
    urgence: 'orange',
    texte: '2 devis en attente de réponse client',
    detail: 'Dupont (rénovation cuisine) et Leblanc (SDB)',
    bouton: 'Voir les devis',
    onClick: () => navigate?.('/patron/finance?onglet=facturation'),
  });

  // Projets disponibles
  actions.push({
    urgence: 'bleu',
    texte: '3 nouveaux projets clients dans votre zone',
    detail: 'Plomberie, Peinture, Électricité — Nice et alentours',
    bouton: 'Consulter',
    onClick: () => navigate?.('/patron/projets'),
  });

  return actions;
}

export function genererActionsAE(aeData) {
  const actions = [];
  const now = new Date();
  const activite = aeData.activite || 'services';
  const plafond = activite === 'services' ? 77700 : 188700;
  const factures = aeData.factures || [];
  const caTotal = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + (f.montant || 0), 0);
  const pct = plafond > 0 ? Math.round(caTotal / plafond * 100) : 0;

  // Plafond CA
  if (pct >= 90) {
    actions.push({
      urgence: 'rouge',
      texte: `Attention : votre CA atteint ${pct}% du plafond (${caTotal.toLocaleString()}€ / ${plafond.toLocaleString()}€)`,
      detail: 'Anticipez un changement de statut si vous dépassez le seuil',
    });
  } else if (pct >= 75) {
    actions.push({
      urgence: 'orange',
      texte: `Votre CA approche ${pct}% du plafond`,
      detail: `${(plafond - caTotal).toLocaleString()}€ restants avant le seuil`,
    });
  }

  // Factures en retard (> 30 jours, non payées)
  const enRetard = factures.filter(f => f.statut !== 'payee' && f.date && (now - new Date(f.date)) / (1000 * 60 * 60 * 24) > 30);
  if (enRetard.length > 0) {
    actions.push({
      urgence: 'rouge',
      texte: `${enRetard.length} facture${enRetard.length > 1 ? 's' : ''} impayée${enRetard.length > 1 ? 's' : ''} depuis plus de 30 jours`,
      detail: enRetard.map(f => `${f.client || '?'} — ${f.montant}€`).join(', '),
      bouton: 'Voir',
    });
  }

  // Déclaration URSSAF
  const trimestre = Math.floor(now.getMonth() / 3);
  const deadlines = ['30 avril', '31 juillet', '31 octobre', '31 janvier'];
  actions.push({
    urgence: 'bleu',
    texte: `Prochaine déclaration URSSAF : ${deadlines[trimestre]}`,
    detail: `Trimestre ${trimestre + 1} ${now.getFullYear()}`,
  });

  return actions.sort((a, b) => {
    const ordre = { rouge: 0, orange: 1, bleu: 2, vert: 3 };
    return (ordre[a.urgence] || 3) - (ordre[b.urgence] || 3);
  });
}

// ══════════════════════════════════════
//  COMPOSANT D'AFFICHAGE
// ══════════════════════════════════════
export default function ActionsQuotidiennes({ actions = [] }) {
  const [expanded, setExpanded] = useState(false);

  if (actions.length === 0) {
    return (
      <div style={{ padding: '16px 20px', background: '#F0FDF4', border: `1px solid ${L.green}30`, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: L.green, flexShrink: 0 }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: L.green }}>Tout est en ordre. Aucune action requise.</div>
      </div>
    );
  }

  const visible = expanded ? actions : actions.slice(0, MAX_VISIBLE);
  const hidden = actions.length - MAX_VISIBLE;
  const nbRouge = actions.filter(a => a.urgence === 'rouge').length;
  const nbOrange = actions.filter(a => a.urgence === 'orange').length;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: L.text }}>
          {actions.length} action{actions.length > 1 ? 's' : ''}
          {nbRouge > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: L.red, marginLeft: 8 }}>{nbRouge} urgente{nbRouge > 1 ? 's' : ''}</span>}
          {nbOrange > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: L.orange, marginLeft: 8 }}>{nbOrange} importante{nbOrange > 1 ? 's' : ''}</span>}
        </div>
        <span style={{ fontSize: 11, color: L.textLight }}>Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {visible.map((a, i) => <ActionCard key={i} action={a} />)}
      </div>
      {hidden > 0 && !expanded && (
        <button onClick={() => setExpanded(true)} style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: L.gold, fontWeight: 600, fontFamily: L.font }}>
          Voir les {hidden} autres actions
        </button>
      )}
    </div>
  );
}
