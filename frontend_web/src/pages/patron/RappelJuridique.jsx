import React, { useState } from 'react';

/* ── Types de mention ──────────────────────────────────── */
const NIVEAUX = {
  obligatoire: { label: 'Obligatoire', color: '#FF3B30', bg: '#FFF1F0', border: '#FF3B30' },
  attention:   { label: 'Attention',   color: '#FF9500', bg: '#FFF3E0', border: '#FF9500' },
  conseil:     { label: 'Conseil',     color: '#5B5BD6', bg: '#EBF5FF', border: '#5B5BD6' },
  info:        { label: 'Info',        color: '#34C759', bg: '#ECFDF5', border: '#34C759' },
};

function Pill({ niveau }) {
  const n = NIVEAUX[niveau] || NIVEAUX.info;
  return (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 700, background: n.bg, color: n.color, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>
      {n.label}
    </span>
  );
}

function Ref({ children }) {
  return (
    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginLeft: 6 }}>({children})</span>
  );
}

function Item({ niveau, children }) {
  const n = NIVEAUX[niveau] || NIVEAUX.info;
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
      <Pill niveau={niveau} />
      <span style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6 }}>{children}</span>
    </li>
  );
}

/* ── Section accordion ─────────────────────────────────── */
function Section({ icon, title, subtitle, color = 'var(--primary)', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%',
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', transition: 'background 0.1s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)', marginBottom: 2 }}>{title}</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{subtitle}</p>
        </div>
        <span style={{ color: 'var(--text-tertiary)', fontSize: '1.25rem', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', display: 'flex', alignItems: 'center' }}>›</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 16px', animation: 'slideUp 0.15s ease-out' }}>
          <div style={{ height: 1, background: 'var(--border-light)', marginBottom: 14 }} />
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Table helper ──────────────────────────────────────── */
function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
            {headers.map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', background: i % 2 === 0 ? 'transparent' : 'var(--bg)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '9px 12px', color: 'var(--text)', verticalAlign: 'top' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Alert box ─────────────────────────────────────────── */
function AlertBox({ niveau, children }) {
  const n = NIVEAUX[niveau] || NIVEAUX.info;
  return (
    <div style={{ background: n.bg, border: `1px solid ${n.border}`, borderRadius: 10, padding: '12px 16px', marginTop: 12, fontSize: '0.875rem', color: n.color, lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────── */
export default function RappelJuridique() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 6 }}>Rappel juridique</h1>
        <p style={{ fontSize: '0.875rem' }}>
          Obligations légales pour les artisans du BTP — droit français, réglementation 2025.
          Ces informations sont données à titre indicatif. Consultez un expert-comptable ou un avocat pour votre situation personnelle.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {Object.entries(NIVEAUX).map(([k, v]) => (
            <span key={k} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: v.bg, color: v.color }}>{v.label}</span>
          ))}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', alignSelf: 'center', marginLeft: 4 }}>Cliquez sur une section pour la déplier</span>
        </div>
      </div>

      {/* ── 1. Facturation ── */}
      <Section icon="🧾" title="Facturation" subtitle="Mentions obligatoires sur les factures" color="#5B5BD6" defaultOpen>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <Item niveau="obligatoire">Numéro de facture unique et séquentiel, non réutilisable <Ref>Art. L441-3 Code de commerce</Ref></Item>
          <Item niveau="obligatoire">Date d'émission de la facture</Item>
          <Item niveau="obligatoire">Nom, adresse, numéro SIREN/SIRET du vendeur (et forme juridique + capital pour les sociétés)</Item>
          <Item niveau="obligatoire">Numéro de TVA intracommunautaire (si assujetti) <Ref>Art. 242 nonies A CGI</Ref></Item>
          <Item niveau="obligatoire">Nom et adresse du client (acheteur)</Item>
          <Item niveau="obligatoire">Description précise des travaux ou fournitures, quantités, prix unitaires HT</Item>
          <Item niveau="obligatoire">Taux de TVA applicable à chaque ligne (5,5 %, 10 % ou 20 %)</Item>
          <Item niveau="obligatoire">Total HT, montant TVA, total TTC</Item>
          <Item niveau="obligatoire">Date ou délai de paiement et conditions d'escompte <Ref>Art. L441-6 Code de commerce</Ref></Item>
          <Item niveau="obligatoire">Pénalités de retard : taux = 3 × le taux d'intérêt légal en vigueur (ex. 2025 : ~12,34 %) ou taux BCE + 10 pts, applicable dès le lendemain de la date d'échéance</Item>
          <Item niveau="obligatoire">Indemnité forfaitaire de recouvrement de 40 € par facture impayée <Ref>Art. D441-5 Code de commerce</Ref></Item>
          <Item niveau="obligatoire">Mention "Pas d'escompte pour paiement anticipé" si aucun escompte n'est accordé</Item>
          <Item niveau="attention">Auto-liquidation de la TVA : si vous êtes sous-traitant BTP et que le donneur d'ordre est assujetti à la TVA, la TVA est due par le preneur — mention obligatoire : <em>"Auto-liquidation TVA — Art. 283-2 nonies du CGI"</em></Item>
          <Item niveau="attention">Mention RGE obligatoire sur les factures de travaux d'économie d'énergie si vous êtes certifié RGE (sinon perte de crédit d'impôt pour le client)</Item>
          <Item niveau="conseil">Délai légal de conservation des factures : 10 ans à compter de la clôture de l'exercice <Ref>Art. L123-22 Code de commerce</Ref></Item>
        </ul>
        <AlertBox niveau="attention">
          ⚠️ Toute facture incomplète expose à une amende de 15 € par mention manquante, plafonnée à 25 % du montant HT de la facture <Ref>Art. 1737 CGI</Ref>.
        </AlertBox>
      </Section>

      {/* ── 2. Devis ── */}
      <Section icon="📄" title="Devis" subtitle="Mentions obligatoires et validité" color="#34C759">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <Item niveau="obligatoire">Nom, adresse, SIRET, forme juridique de l'entreprise</Item>
          <Item niveau="obligatoire">Nom et adresse du client (maître d'ouvrage)</Item>
          <Item niveau="obligatoire">Date de rédaction du devis et durée de validité de l'offre (en général 30 à 90 jours)</Item>
          <Item niveau="obligatoire">Désignation précise des travaux (nature, lieu, description technique)</Item>
          <Item niveau="obligatoire">Prix HT de chaque poste, taux de TVA applicable, total TTC</Item>
          <Item niveau="obligatoire">Conditions de paiement (acompte, solde, modalités)</Item>
          <Item niveau="obligatoire">Délai d'exécution prévisionnel</Item>
          <Item niveau="obligatoire">Assurance décennale et RC Pro : numéro de police, compagnie, coordonnées <Ref>Art. L241-1 et L241-2 Code des assurances</Ref></Item>
          <Item niveau="attention">Pour les travaux chez un particulier : droit de rétractation de 14 jours si le devis est signé hors établissement (démarchage à domicile) <Ref>Art. L221-18 Code de la consommation</Ref></Item>
          <Item niveau="attention">Devis ≥ 150 € TTC : le devis écrit est obligatoire pour les travaux à domicile sur demande du client <Ref>Art. L211-1 Code de la consommation</Ref></Item>
          <Item niveau="conseil">Faire signer le devis avec la mention manuscrite "Bon pour accord" + date + signature</Item>
          <Item niveau="conseil">Pour les marchés publics : respect du CCAG Travaux (Cahier des Clauses Administratives Générales)</Item>
        </ul>
      </Section>

      {/* ── 3. TVA BTP ── */}
      <Section icon="💰" title="TVA — Taux applicables en BTP" subtitle="Selon la nature des travaux et la date d'achèvement" color="#FF9500">
        <Table
          headers={['Taux', 'Travaux concernés', 'Conditions']}
          rows={[
            ['20 %', 'Travaux neufs, construction, extension, locaux professionnels neufs', 'Taux normal — bâtiment achevé depuis moins de 2 ans ou travaux assimilés à une construction neuve'],
            ['10 %', 'Travaux de rénovation, entretien, amélioration sur logements achevés depuis + 2 ans', 'Logement à usage d\'habitation principale ou secondaire — Art. 279-0 bis CGI'],
            ['5,5 %', 'Travaux d\'amélioration de la performance énergétique (isolation, chaudière condensation, PAC, VMC, fenêtres…)', 'Logement achevé depuis + 2 ans — liste des équipements éligibles en annexe IV du CGI'],
            ['0 %', 'Pas applicable en BTP dans le régime général', '—'],
          ]}
        />
        <AlertBox niveau="obligatoire">
          L'artisan est tenu de vérifier l'éligibilité au taux réduit. En cas d'erreur de taux, il est solidairement responsable du rappel de TVA avec le client <Ref>Art. 283-3 CGI</Ref>.
        </AlertBox>
        <AlertBox niveau="conseil">
          Exiger du client particulier une <strong>attestation simplifiée de TVA</strong> (formulaire Cerfa n°1301-SD) avant d'appliquer le taux de 5,5 % ou 10 %. La conserver 6 ans.
        </AlertBox>
      </Section>

      {/* ── 4. Assurances obligatoires ── */}
      <Section icon="🛡️" title="Assurances obligatoires" subtitle="Décennale, RC Pro, dommages-ouvrage" color="#FF3B30">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <Item niveau="obligatoire">
            <strong>Responsabilité civile décennale (RC Décennale) :</strong> couvre pendant 10 ans les dommages compromettant la solidité de l'ouvrage ou le rendant impropre à sa destination — souscription obligatoire avant tout début de chantier <Ref>Art. L241-1 Code des assurances</Ref>
          </Item>
          <Item niveau="obligatoire">
            <strong>Responsabilité civile professionnelle (RC Pro) :</strong> couvre les dommages causés aux tiers dans l'exercice de l'activité (non couvert par la décennale)
          </Item>
          <Item niveau="obligatoire">
            Mention des deux assurances obligatoire sur le devis et la facture : numéro de police, nom de la compagnie, coordonnées
          </Item>
          <Item niveau="attention">
            <strong>Dommages-ouvrage :</strong> souscrite par le maître d'ouvrage (client) avant ouverture du chantier — vous pouvez être mis en cause si vous démarrez sans qu'elle soit en vigueur <Ref>Art. L242-1 Code des assurances</Ref>
          </Item>
          <Item niveau="attention">
            <strong>Biennale (garantie de bon fonctionnement) :</strong> 2 ans sur les éléments d'équipement dissociables de l'ouvrage (robinetterie, radiateurs, volets…) <Ref>Art. 1792-3 Code civil</Ref>
          </Item>
          <Item niveau="attention">
            <strong>Garantie de parfait achèvement :</strong> 1 an après réception — obligation de réparer tout désordre signalé par le maître d'ouvrage <Ref>Art. 1792-6 Code civil</Ref>
          </Item>
          <Item niveau="conseil">Attestation d'assurance décennale à jour : la communiquer au client avant signature du devis et en conserver un exemplaire par exercice</Item>
        </ul>
      </Section>

      {/* ── 5. Ressources Humaines ── */}
      <Section icon="👷" title="Ressources Humaines" subtitle="Embauche, contrats, congés, durée du travail" color="#8E44AD">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <Item niveau="obligatoire">
            <strong>DPAE — Déclaration Préalable à l'Embauche :</strong> obligatoire auprès de l'URSSAF dans les 8 jours qui précèdent l'embauche (et au plus tôt dans les 8 jours avant la date d'entrée) <Ref>Art. L1221-10 Code du travail</Ref>
          </Item>
          <Item niveau="obligatoire">
            Contrat de travail écrit obligatoire pour tout CDD, contrat de travail temporaire, temps partiel et apprentissage <Ref>Art. L1242-12, L3123-6 Code du travail</Ref>
          </Item>
          <Item niveau="obligatoire">
            <strong>Registre unique du personnel :</strong> tenu à jour pour chaque salarié (embauche, départ, qualification, nationalité) — accessible à l'inspection du travail <Ref>Art. L1221-13 Code du travail</Ref>
          </Item>
          <Item niveau="obligatoire">
            <strong>Fiche de paie :</strong> remise à chaque paie — conservation obligatoire 5 ans employeur, illimitée pour le salarié <Ref>Art. L3243-4 Code du travail</Ref>
          </Item>
          <Item niveau="obligatoire">
            <strong>Convention collective applicable :</strong> BTP — CCN des Ouvriers (IDCC 1597), CCN des ETAM (IDCC 2609), CCN des Cadres (IDCC 2420). Mention obligatoire sur la fiche de paie.
          </Item>
        </ul>
        <Table
          headers={['Règle', 'Valeur 2025', 'Référence']}
          rows={[
            ['SMIC horaire brut', '11,88 €/h', 'Décret 2025'],
            ['SMIC mensuel brut (35h)', '1 801,80 €/mois', 'Décret 2025'],
            ['Durée légale du travail', '35h/semaine', 'Art. L3121-27 CT'],
            ['Durée maximale quotidienne', '10h/jour (12h exceptionnelle)', 'Art. L3121-18 CT'],
            ['Durée maximale hebdomadaire absolue', '48h/semaine', 'Art. L3121-20 CT'],
            ['Congés payés', '2,5 jours ouvrables/mois = 30 j/an (5 semaines)', 'Art. L3141-3 CT'],
            ['Délai de prévenance licenciement', 'Selon ancienneté : 1 mois (< 2 ans) / 2 mois (≥ 2 ans)', 'Art. L1234-1 CT'],
          ]}
        />
        <AlertBox niveau="attention">
          Tout manquement à la DPAE expose à une amende de 1 065 € par salarié non déclaré et peut être requalifié en travail dissimulé (pénalité : 45 000 € personne physique, 225 000 € personne morale + peines d'emprisonnement).
        </AlertBox>
      </Section>

      {/* ── 6. URSSAF & cotisations ── */}
      <Section icon="🏦" title="URSSAF & Cotisations sociales" subtitle="Taux, délais de déclaration et pénalités" color="#5B5BD6">
        <Table
          headers={['Cotisation', 'Part salariale', 'Part patronale', 'Base']}
          rows={[
            ['Maladie-maternité', '0,40 %', '13,00 %', 'Totalité du salaire brut'],
            ['Vieillesse (déplafonné)', '0,40 %', '1,90 %', 'Totalité du salaire brut'],
            ['Vieillesse (plafonné)', '6,90 %', '8,55 %', 'Dans la limite du PMSS (3 925 €/mois en 2025)'],
            ['Allocations familiales', '—', '3,45 % à 5,25 %', 'Totalité (taux réduit si salaire ≤ 3,5 SMIC)'],
            ['Chômage', '—', '4,05 %', 'Dans la limite de 4 PMSS'],
            ['AGIRC-ARRCO T1', '3,15 %', '4,72 %', 'Tranche 1 (jusqu\'à 1 PMSS)'],
            ['AGIRC-ARRCO T2', '8,64 %', '12,95 %', 'Tranche 2 (1 à 8 PMSS)'],
            ['CSG imposable', '6,80 %', '—', '98,25 % du brut'],
            ['CSG non imposable + CRDS', '2,90 %', '—', '98,25 % du brut'],
            ['AT/MP (variable)', '—', 'Variable selon secteur', 'BTP : généralement 3,5 % à 6 % selon sinistralité'],
            ['Formation professionnelle', '—', '0,55 % à 1 %', 'Totalité (taux selon effectif)'],
            ['Taxe d\'apprentissage', '—', '0,68 %', 'Totalité'],
          ]}
        />
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
          <Item niveau="obligatoire">DSN (Déclaration Sociale Nominative) mensuelle au 5 ou 15 du mois suivant <Ref>Art. L133-5-3 Code SS</Ref></Item>
          <Item niveau="obligatoire">Paiement URSSAF : mensuel si masse salariale &gt; 1,6 M€/an, trimestriel sinon</Item>
          <Item niveau="attention">Pénalité de retard : 5 % du montant dû + intérêts de retard 0,2 %/mois</Item>
          <Item niveau="attention">Non-paiement : mise en demeure sous 30 jours, puis contrainte (équivalent titre exécutoire)</Item>
          <Item niveau="conseil">Possibilité de délai de paiement : contacter l'URSSAF avant l'échéance — octroi en général si situation exceptionnelle</Item>
        </ul>
      </Section>

      {/* ── 7. QSE & Sécurité ── */}
      <Section icon="⛑️" title="QSE — Qualité, Sécurité, Environnement" subtitle="Obligations légales sur les chantiers BTP" color="#FF9500">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <Item niveau="obligatoire">
            <strong>DUERP — Document Unique d'Évaluation des Risques Professionnels :</strong> obligatoire dès le 1er salarié, mis à jour annuellement et lors de toute modification des conditions de travail <Ref>Art. R4121-1 Code du travail</Ref>
          </Item>
          <Item niveau="obligatoire">
            <strong>PPSPS — Plan Particulier de Sécurité et de Protection de la Santé :</strong> obligatoire pour les entreprises intervenantes sur chantiers soumis à coordination SPS (+ de 2 entreprises simultanément) <Ref>Art. R4532-66 Code du travail</Ref>
          </Item>
          <Item niveau="obligatoire">
            <strong>Plan de prévention :</strong> obligatoire lors d'interventions dans un établissement utilisateur si les travaux présentent des risques particuliers <Ref>Art. R4512-6 Code du travail</Ref>
          </Item>
          <Item niveau="obligatoire">
            Équipements de Protection Individuelle (EPI) fournis gratuitement par l'employeur et entretenus à ses frais <Ref>Art. L4122-2 Code du travail</Ref>
          </Item>
          <Item niveau="obligatoire">
            Registre des accidents du travail bénins (si accord de l'inspection du travail) ou déclaration AT sous 48h auprès de la CPAM <Ref>Art. L441-2 Code SS</Ref>
          </Item>
          <Item niveau="attention">
            <strong>Amiante :</strong> diagnostic amiante obligatoire avant travaux sur tout bâtiment dont le permis de construire est antérieur au 1er juillet 1997 — sous-section 3 ou 4 selon le type d'intervention <Ref>Décret 2012-639</Ref>
          </Item>
          <Item niveau="attention">
            <strong>Plomb :</strong> CREP (Constat des Risques d'Exposition au Plomb) avant travaux sur logement construit avant 1949 <Ref>Art. L1334-5 Code de la santé publique</Ref>
          </Item>
          <Item niveau="attention">
            Déchets BTP : obligation de traçabilité — BSDD (Bordereau de Suivi des Déchets Dangereux) pour déchets dangereux, tri 5 flux minimum sur chantier <Ref>Décret 2016-288</Ref>
          </Item>
          <Item niveau="conseil">Formation Sauveteur Secouriste du Travail (SST) recommandée pour au moins 1 salarié par équipe</Item>
          <Item niveau="conseil">Carnet de santé et de sécurité du chantier (ou PGC — Plan Général de Coordination) transmis par le coordonnateur SPS</Item>
        </ul>
      </Section>

      {/* ── 8. Sous-traitance ── */}
      <Section icon="🤝" title="Sous-traitance" subtitle="Loi n° 75-1334 du 31 décembre 1975" color="#5856D6">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <Item niveau="obligatoire">
            Tout contrat de sous-traitance doit être soumis à l'acceptation du maître d'ouvrage et à l'agrément des conditions de paiement <Ref>Art. 3 Loi 75-1334</Ref>
          </Item>
          <Item niveau="obligatoire">
            <strong>Action directe en paiement :</strong> le sous-traitant de 1er rang peut réclamer directement au maître d'ouvrage le paiement des sommes dues si l'entrepreneur principal ne paie pas <Ref>Art. 12 Loi 75-1334</Ref>
          </Item>
          <Item niveau="obligatoire">
            Le sous-traitant non agréé ne bénéficie pas de l'action directe — risque de non-paiement intégral
          </Item>
          <Item niveau="obligatoire">
            <strong>Caution ou délégation de paiement :</strong> l'entrepreneur principal doit fournir l'une des deux garanties au sous-traitant <Ref>Art. 14 Loi 75-1334</Ref>
          </Item>
          <Item niveau="attention">
            Délai de paiement des sous-traitants : 30 jours maximum après réception des travaux, sauf accord contractuel dans la limite de 45 jours fin de mois ou 60 jours nets <Ref>Art. L441-6 Code de commerce</Ref>
          </Item>
          <Item niveau="attention">
            Vérification de la régularité fiscale et sociale du sous-traitant : attestation URSSAF à demander tous les 6 mois <Ref>Art. L8222-1 Code du travail</Ref>. En cas de travail dissimulé du sous-traitant, vous êtes solidairement responsable.
          </Item>
          <Item niveau="conseil">Formaliser systématiquement un contrat de sous-traitance écrit avant tout début d'intervention</Item>
        </ul>
      </Section>

      {/* ── 9. RGPD & données personnelles ── */}
      <Section icon="🔐" title="RGPD — Données personnelles" subtitle="Obligations CNIL applicables aux artisans" color="#34C759">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <Item niveau="obligatoire">
            <strong>Registre des activités de traitement :</strong> document interne listant toutes les données collectées (clients, salariés, fournisseurs), leur finalité et leur durée de conservation <Ref>Art. 30 RGPD</Ref>
          </Item>
          <Item niveau="obligatoire">
            Données clients (nom, adresse, téléphone, email) : durée de conservation maximale 3 ans après la dernière commande pour la prospection
          </Item>
          <Item niveau="obligatoire">
            Données salariés sur les fiches de paie : conservation permanente recommandée (pour la retraite) — données RH opérationnelles : 5 ans après fin du contrat
          </Item>
          <Item niveau="attention">
            Mention légale obligatoire dans les devis et contrats : informer le client sur l'utilisation de ses données (finalité, durée, droit d'accès/rectification/suppression)
          </Item>
          <Item niveau="attention">
            En cas de violation de données (piratage, perte), déclaration à la CNIL sous 72h <Ref>Art. 33 RGPD</Ref>
          </Item>
          <Item niveau="conseil">Nommer un référent RGPD interne (même si DPO non obligatoire pour les TPE)</Item>
          <Item niveau="conseil">Ne pas conserver les données bancaires clients en clair — utiliser un prestataire de paiement certifié PCI-DSS</Item>
        </ul>
      </Section>

      {/* ── 10. Mentions légales entreprise ── */}
      <Section icon="🏢" title="Mentions légales & immatriculation" subtitle="Obligations d'identification de l'entreprise" color="#636363">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <Item niveau="obligatoire">Mentions obligatoires sur tout document commercial : raison sociale, forme juridique, capital, siège social, numéro SIREN, RCS + ville, numéro TVA intracommunautaire</Item>
          <Item niveau="obligatoire">
            <strong>Qualification professionnelle :</strong> l'artisan doit justifier d'une qualification (CAP, BEP, BP ou 3 ans d'expérience) pour exercer un métier réglementé du BTP <Ref>Loi n°96-603 du 5 juillet 1996</Ref>
          </Item>
          <Item niveau="obligatoire">
            <strong>Immatriculation au Registre du Commerce et des Sociétés (RCS)</strong> pour les sociétés, ou au Registre National des Entreprises (RNE) pour les entrepreneurs individuels
          </Item>
          <Item niveau="attention">
            Carte d'identification professionnelle BTP obligatoire pour tout salarié travaillant sur un chantier de BTP (OPPBTP) <Ref>Décret n°2016-175 du 22 février 2016</Ref>
          </Item>
          <Item niveau="attention">
            Site internet professionnel : mentions légales obligatoires (identité, hébergeur, SIRET) sous peine d'amende de 75 000 € <Ref>Art. 19 LCEN</Ref>
          </Item>
          <Item niveau="conseil">Tenir à jour l'extrait KBIS/extrait RNE et le communiquer à vos clients sur demande</Item>
        </ul>

        <AlertBox niveau="info">
          💡 <strong>Ressources officielles :</strong> OPPBTP (prévention BTP), INRS (sécurité au travail), URSSAF.fr, DGCCRF (droit de la consommation), CNIL (données personnelles), FFBATIMENT.fr, impots.gouv.fr
        </AlertBox>
      </Section>

      {/* Footer */}
      <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--border-light)', borderRadius: 10, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--text)' }}>⚠️ Avertissement :</strong> Ces informations sont fournies à titre indicatif et de sensibilisation. Elles ne constituent pas un conseil juridique. Les taux et textes peuvent évoluer — consultez toujours un expert-comptable, un avocat spécialisé ou les organismes officiels (URSSAF, DIRECCTE, CNIL) pour votre situation spécifique. Dernière mise à jour : janvier 2025.
      </div>
    </div>
  );
}
