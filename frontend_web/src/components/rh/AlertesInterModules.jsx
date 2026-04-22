import React, { useState } from 'react';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:16 };

function makeAlerteId(a) {
  // Clé stable : hash du message + module
  return (a.module + '::' + a.message).replace(/\s+/g, '_').slice(0, 120);
}

/*
  Moteur de ponts inter-modules.
  Reçoit les données de tous les modules et génère des alertes croisées.
  Ce composant est affiché en haut du Dashboard patron.
*/
export default function AlertesInterModules({ employes = [], habilitations = [], conges = [], pointages = [], devis = [], factures = [], incidents = [], epis = [], certifications = [] }) {
  const alertes = [];
  const now = new Date();

  // Si aucune donnée n'est passée, générer des alertes démo réalistes
  const noData = employes.length===0 && habilitations.length===0 && devis.length===0 && incidents.length===0 && epis.length===0;
  if (noData) {
    alertes.push({ type:'danger', module:'QSE → Planning', icon:'🚫', message:'Habilitation CACES R489 expirée — Marc Lambert ne peut pas conduire le chariot sur chantier', action:'Renouveler', link:'/patron/qse?onglet=habilitations' });
    alertes.push({ type:'warning', module:'QSE → Chantier', icon:'🦺', message:'EPI expiré : Chaussures de sécurité de Sophie Duval — date d\'expiration dépassée', action:'Remplacer l\'EPI', link:'/patron/qse?onglet=epi' });
    alertes.push({ type:'info', module:'Devis → Facturation', icon:'💰', message:'Devis DEV-2026-008 signé par Mme Dupont — facture non encore créée', action:'Créer la facture', link:'/patron/finance?onglet=facturation' });
    alertes.push({ type:'warning', module:'QSE → DUERP', icon:'⚡', message:'Incident "Chute outil échafaudage" non clôturé — mettre à jour le DUERP', action:'Voir l\'incident', link:'/patron/qse?onglet=incidents' });
    alertes.push({ type:'info', module:'RH → Planning', icon:'📅', message:'Jean Martin en congé du 12/04 au 16/04 — impact sur le planning chantier Dupont', action:'Voir le planning', link:'/patron/rh?onglet=conges' });
    alertes.push({ type:'warning', module:'Pointage → Paie', icon:'⏰', message:'3 pointages en attente de validation — impact sur le calcul de paie d\'avril', action:'Valider', link:'/patron/rh?onglet=pointage' });
    alertes.push({ type:'danger', module:'QSE → Commercial', icon:'📛', message:'Certification QUALIBAT Peinture expirée — vous ne pouvez plus répondre aux appels d\'offre peinture', action:'Renouveler', link:'/patron/qse?onglet=certifications' });
  }

  // 1. Habilitation expirée → bloque le planning
  (habilitations || []).forEach(h => {
    if (h.dateExpiration && new Date(h.dateExpiration) < now) {
      const emp = (employes || []).find(e => e.id === h.employeId);
      alertes.push({ type: 'danger', module: 'RH → Planning', icon: '🚫', message: `Habilitation expirée : ${h.type || h.titre} — ${emp?.prenom || ''} ${emp?.nom || 'Employé'} ne peut pas être assigné sur chantier`, action: 'Renouveler l\'habilitation', link: '/patron/qse?onglet=habilitations' });
    } else if (h.dateExpiration && new Date(h.dateExpiration) < new Date(now.getTime() + 30 * 86400000)) {
      const emp = (employes || []).find(e => e.id === h.employeId);
      alertes.push({ type: 'warning', module: 'QSE → RH', icon: '⚠️', message: `Habilitation expire dans < 30j : ${h.type || h.titre} — ${emp?.prenom || ''} ${emp?.nom || ''}`, action: 'Planifier renouvellement', link: '/patron/qse?onglet=habilitations' });
    }
  });

  // 2. EPI expiré → alerte sécurité
  (epis || []).forEach(e => {
    if (e.dateExpiration && new Date(e.dateExpiration) < now) {
      alertes.push({ type: 'danger', module: 'QSE → Chantier', icon: '🦺', message: `EPI expiré : ${e.epi} de ${e.employe} — interdiction de travailler sans EPI conforme`, action: 'Remplacer l\'EPI', link: '/patron/qse?onglet=epi' });
    }
  });

  // 3. Certification expirée → perte marché
  (certifications || []).forEach(c => {
    if (c.statut === 'expire') {
      alertes.push({ type: 'danger', module: 'QSE → Commercial', icon: '📛', message: `Certification expirée : ${c.nom} — vous ne pouvez plus répondre aux appels d'offre exigeant cette certification`, action: 'Renouveler', link: '/patron/qse?onglet=certifications' });
    }
  });

  // 4. Devis signé sans facture → facturation automatique
  (devis || []).filter(d => d.statut === 'signé' || d.statut === 'signe' || d.statut === 'accepté').forEach(d => {
    const hasFacture = (factures || []).some(f => f.devisId === d.id);
    if (!hasFacture) {
      alertes.push({ type: 'info', module: 'Devis → Facturation', icon: '💰', message: `Devis ${d.numero || '#' + d.id} signé — facture non encore créée`, action: 'Créer la facture', link: '/patron/finance?onglet=facturation' });
    }
  });

  // 5. Incident non clôturé → mise à jour DUERP
  (incidents || []).filter(i => i.statut !== 'cloture').forEach(i => {
    alertes.push({ type: 'warning', module: 'QSE → DUERP', icon: '⚡', message: `Incident non clôturé : ${i.type} sur ${i.chantier} — le DUERP doit être mis à jour`, action: 'Voir l\'incident', link: '/patron/qse?onglet=incidents' });
  });

  // 6. Congé approuvé → impact planning
  (conges || []).filter(c => c.statut === 'approuve' || c.statut === 'approuvé').forEach(c => {
    if (c.debut && new Date(c.debut) > now && new Date(c.debut) < new Date(now.getTime() + 14 * 86400000)) {
      alertes.push({ type: 'info', module: 'RH → Planning', icon: '📅', message: `${c.employe || 'Employé'} en congé du ${c.debut} au ${c.fin} — à prendre en compte dans le planning chantier`, action: 'Voir le planning', link: '/patron/rh?onglet=conges' });
    }
  });

  // 7. Heures non validées
  const nonValides = (pointages || []).filter(p => p.statut === 'en_attente').length;
  if (nonValides > 0) {
    alertes.push({ type: 'warning', module: 'Pointage → Paie', icon: '⏰', message: `${nonValides} pointage${nonValides > 1 ? 's' : ''} en attente de validation — impact sur le calcul de paie`, action: 'Valider', link: '/patron/rh?onglet=pointage' });
  }

  // Filtrer les alertes dismissed par l'utilisateur
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('freample_alertes_dismissed') || '[]')); }
    catch { return new Set(); }
  });

  // Générer ID et filtrer
  const visibleAlertes = alertes
    .map(a => ({ ...a, _id: makeAlerteId(a) }))
    .filter(a => !dismissed.has(a._id));

  if (visibleAlertes.length === 0) return null;

  const typeOrder = { danger: 0, warning: 1, info: 2 };
  visibleAlertes.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

  const typeStyles = {
    danger: { bg: '#FEF2F2', border: '#DC2626', color: '#DC2626' },
    warning: { bg: '#FFFBEB', border: '#D97706', color: '#D97706' },
    info: { bg: '#EFF6FF', border: '#2563EB', color: '#2563EB' },
  };

  const dismissAlerte = (id) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    try { localStorage.setItem('freample_alertes_dismissed', JSON.stringify(Array.from(next))); } catch {}
  };

  const resetDismissed = () => {
    setDismissed(new Set());
    try { localStorage.removeItem('freample_alertes_dismissed'); } catch {}
  };

  const dismissedCount = dismissed.size;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>🔗</span> Alertes inter-modules ({visibleAlertes.length})
        </span>
        {dismissedCount > 0 && (
          <button onClick={resetDismissed} style={{ fontSize: 11, color: '#6E6E73', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Restaurer {dismissedCount} alerte{dismissedCount > 1 ? 's' : ''} masquée{dismissedCount > 1 ? 's' : ''}
          </button>
        )}
      </div>
      {visibleAlertes.map((a) => {
        const s = typeStyles[a.type];
        return (
          <div key={a._id} style={{ ...CARD, background: s.bg, borderLeft: `4px solid ${s.border}`, marginBottom: 4, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <span style={{ fontSize: 16 }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{a.message}</div>
                <div style={{ fontSize: 10, color: '#555' }}>{a.module}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              <a href={a.link} style={{ fontSize: 10, fontWeight: 600, color: s.color, textDecoration: 'none', whiteSpace: 'nowrap', padding: '4px 10px', border: `1px solid ${s.border}40`, borderRadius: 6, background: '#fff' }}>{a.action} →</a>
              <button onClick={() => dismissAlerte(a._id)} title="Marquer comme traité" style={{ width: 22, height: 22, border: 'none', background: 'transparent', cursor: 'pointer', color: s.color, fontSize: 14, fontWeight: 700, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
