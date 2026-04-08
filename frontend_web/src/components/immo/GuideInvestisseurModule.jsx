import React, { useState } from 'react';
import L from '../../design/luxe';

const CARD = { background: L.white, border: `1px solid ${L.border}`, padding: '20px' };

const ETAPES = [
  {
    num: 1, icon: '🎯', title: 'Définir sa stratégie',
    subtitle: 'Rendement locatif, plus-value, défiscalisation, retraite ?',
    color: '#8B5CF6',
    contenu: 'Tout commence par la stratégie : investir sans objectif clair, c\'est naviguer sans cap. Selon ce que tu cherches — revenus mensuels, constitution de patrimoine, avantage fiscal — les biens à cibler ne seront pas les mêmes.',
    checklist: [
      'Définir mon objectif principal (cashflow, patrimoine, défiscalisation, retraite)',
      'Fixer un horizon de placement (5 ans, 10 ans, 20 ans)',
      'Déterminer mon budget d\'investissement total',
      'Évaluer ma tolérance au risque (conservateur, équilibré, dynamique)',
    ],
    outils: ['Stratégie & Pilotage → Objectifs', 'Investir → Dossiers d\'investissement'],
  },
  {
    num: 2, icon: '📍', title: 'Analyser le marché',
    subtitle: 'Localisation, demande locative, prix/m², tensions du marché',
    color: '#2563EB',
    contenu: 'L\'analyse du marché local est souvent sous-estimée. Un bien "pas cher" dans une ville sans dynamisme économique peut être un piège, là où un bien plus cher dans une zone à forte demande locative se révèle bien plus sécurisé.',
    checklist: [
      'Étudier la tension locative de la zone (demande vs offre)',
      'Comparer les prix au m² du quartier (DVF, notaires)',
      'Vérifier la dynamique économique (emploi, transports, projets urbains)',
      'Identifier les risques géographiques (Géorisques)',
      'Analyser le taux de vacance locative moyen de la zone',
    ],
    outils: ['Géorisques → Analyse des risques', 'Pige immobilière → Marché local'],
  },
  {
    num: 3, icon: '🧮', title: 'Calculer la rentabilité',
    subtitle: 'Rendement brut/net, cashflow, taux d\'effort, TRI',
    color: '#16A34A',
    contenu: 'Le calcul de rentabilité est la colonne vertébrale de toute décision. Le rendement brut (loyer annuel / prix d\'achat) donne une première indication, mais c\'est le cashflow net — après crédit, charges, taxes et vacance estimée — qui dit la vérité.',
    checklist: [
      'Calculer le rendement brut (loyer annuel × 12 / prix total)',
      'Déduire toutes les charges (taxe foncière, copro, assurance, gestion)',
      'Estimer la vacance locative (1 mois/an minimum)',
      'Calculer le cashflow net mensuel (loyer - charges - crédit - impôts)',
      'Vérifier que le taux d\'effort reste < 35%',
    ],
    outils: ['Finances → Simulateurs', 'Stratégie → Comparateur de biens'],
  },
  {
    num: 4, icon: '🔍', title: 'Faire la due diligence',
    subtitle: 'État du bien, diagnostics, charges, urbanisme, bail en cours',
    color: '#D97706',
    contenu: 'La due diligence est l\'étape que les investisseurs pressés sautent… et regrettent. Diagnostics, syndic, PLU, bail existant, travaux cachés : ces éléments peuvent faire basculer la rentabilité.',
    checklist: [
      'Vérifier tous les diagnostics obligatoires (DPE, amiante, plomb...)',
      'Analyser les PV d\'AG et les charges de copropriété (3 dernières années)',
      'Consulter le PLU (Plan Local d\'Urbanisme) pour les possibilités de travaux',
      'Vérifier le bail en cours si le bien est occupé',
      'Faire chiffrer les travaux par un professionnel',
      'Consulter les risques via Géorisques',
    ],
    outils: ['Géorisques → Risques naturels & technologiques', 'Estimations → Comparables'],
  },
  {
    num: 5, icon: '🏦', title: 'Structurer le financement',
    subtitle: 'Levier bancaire, SCI, LMNP, régimes fiscaux, assurances',
    color: '#059669',
    contenu: 'Le financement et la structuration juridique (SCI, LMNP, nu-propriété…) peuvent significativement améliorer la performance nette d\'un investissement, parfois autant que le choix du bien lui-même.',
    checklist: [
      'Comparer les offres de prêt (taux, durée, différé)',
      'Choisir la structure juridique (nom propre, SCI IR, SCI IS, LMNP)',
      'Simuler l\'impact fiscal de chaque régime',
      'Souscrire les assurances (PNO, GLI, emprunteur)',
      'Préparer le dossier bancaire complet',
    ],
    outils: ['Stratégie → IR vs IS', 'Investir → Score bancabilité', 'Stratégie → Structure'],
  },
];

const FILTRES = [
  {
    icon: '⚠️', title: 'Risque', color: '#DC2626',
    questions: ['Quel est le taux de vacance locative de la zone ?', 'Quel est le profil type des locataires ?', 'Le bien est-il facilement revendable ?', 'Y a-t-il des risques naturels ou technologiques ?'],
  },
  {
    icon: '💰', title: 'Cashflow', color: '#16A34A',
    questions: ['Loyer - charges - crédit - impôts > 0 ?', 'Le cashflow résiste-t-il à 2 mois de vacance ?', 'Les charges sont-elles prévisibles et stables ?', 'Y a-t-il des travaux à prévoir à court terme ?'],
  },
  {
    icon: '📈', title: 'Valorisation', color: '#2563EB',
    questions: ['Le quartier est-il en développement ?', 'Des projets urbains sont-ils prévus (transport, commerces) ?', 'Des travaux peuvent-ils créer de la valeur ?', 'Le prix au m² est-il en dessous du marché ?'],
  },
  {
    icon: '⚖️', title: 'Fiscalité', color: '#8B5CF6',
    questions: ['Quel régime fiscal est le plus avantageux ?', 'Les intérêts d\'emprunt sont-ils déductibles ?', 'L\'amortissement IS est-il pertinent ?', 'Y a-t-il un dispositif de défiscalisation applicable ?'],
  },
];

export default function GuideInvestisseurModule({ onNavigate }) {
  const [activeEtape, setActiveEtape] = useState(0);
  const [activeFiltre, setActiveFiltre] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (etapeIdx, itemIdx) => {
    const key = `${etapeIdx}-${itemIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const etape = ETAPES[activeEtape];
  const totalChecks = ETAPES.reduce((s, e) => s + e.checklist.length, 0);
  const doneChecks = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = Math.round(doneChecks / totalChecks * 100);

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Guide investisseur</h2>
      <p style={{ fontSize: 13, color: L.textSec, margin: '0 0 20px' }}>
        Un parcours structuré pour prendre les bonnes décisions d'investissement immobilier.
      </p>

      {/* Barre de progression globale */}
      <div style={{ ...CARD, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Progression de votre analyse</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: progressPct === 100 ? L.green : L.gold }}>{doneChecks}/{totalChecks} points validés</span>
          </div>
          <div style={{ height: 6, background: '#E8E6E1', borderRadius: 3 }}>
            <div style={{ height: 6, background: progressPct === 100 ? L.green : L.gold, borderRadius: 3, width: `${progressPct}%`, transition: 'width .3s' }} />
          </div>
        </div>
        <span style={{ fontSize: 22, fontWeight: 500, fontFamily: L.serif, color: progressPct === 100 ? L.green : L.text }}>{progressPct}%</span>
      </div>

      {/* Parcours vertical — les 5 étapes */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
        {/* Sidebar étapes */}
        <div style={{ width: 220, flexShrink: 0 }}>
          {ETAPES.map((e, i) => {
            const etapeChecks = e.checklist.length;
            const etapeDone = e.checklist.filter((_, j) => checkedItems[`${i}-${j}`]).length;
            const isActive = activeEtape === i;
            const isComplete = etapeDone === etapeChecks;
            return (
              <div key={e.num} onClick={() => setActiveEtape(i)} style={{ cursor: 'pointer', display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, background: isActive ? e.color + '10' : 'transparent', borderLeft: `3px solid ${isActive ? e.color : 'transparent'}`, marginBottom: 2, transition: 'all .2s' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: isComplete ? L.green : isActive ? e.color : '#E8E6E1', color: isComplete || isActive ? '#fff' : L.textSec, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                  {isComplete ? '✓' : e.num}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? e.color : L.text }}>{e.title}</div>
                  <div style={{ fontSize: 10, color: L.textSec }}>{etapeDone}/{etapeChecks}</div>
                </div>
              </div>
            );
          })}
          {/* Flèches entre étapes */}
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: L.textLight }}>
            {ETAPES.map((e, i) => (
              <span key={i}>{i > 0 && <span style={{ margin: '0 4px' }}>→</span>}{e.icon}</span>
            ))}
          </div>
        </div>

        {/* Contenu de l'étape active */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...CARD, borderLeft: `4px solid ${etape.color}`, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{etape.icon}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: etape.color }}>Étape {etape.num} — {etape.title}</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: L.textSec }}>{etape.subtitle}</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: L.textSec, lineHeight: 1.7, margin: '0 0 16px' }}>{etape.contenu}</p>

            {/* Checklist interactive */}
            <div style={{ fontSize: 12, fontWeight: 700, color: L.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Checklist</div>
            {etape.checklist.map((item, j) => {
              const key = `${activeEtape}-${j}`;
              const done = checkedItems[key];
              return (
                <div key={j} onClick={() => toggleCheck(activeEtape, j)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: `1px solid ${L.border}`, cursor: 'pointer', background: done ? '#F0FDF4' : 'transparent', transition: 'background .15s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${done ? L.green : '#E8E6E1'}`, background: done ? L.green : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0, transition: 'all .15s' }}>
                    {done ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: 13, color: done ? L.green : L.text, textDecoration: done ? 'line-through' : 'none', transition: 'all .15s' }}>{item}</span>
                </div>
              );
            })}

            {/* Outils liés */}
            {etape.outils?.length > 0 && (
              <div style={{ marginTop: 14, padding: '12px 14px', background: '#FAFAF8', borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: L.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Outils Freample liés</div>
                {etape.outils.map(o => (
                  <div key={o} style={{ fontSize: 12, color: etape.color, fontWeight: 500, padding: '2px 0' }}>→ {o}</div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation étapes */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {activeEtape > 0 && (
              <button onClick={() => setActiveEtape(activeEtape - 1)}
                style={{ padding: '8px 18px', background: 'transparent', border: `1px solid ${L.border}`, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, color: L.textSec }}>
                ← {ETAPES[activeEtape - 1].title}
              </button>
            )}
            <div style={{ flex: 1 }} />
            {activeEtape < ETAPES.length - 1 && (
              <button onClick={() => setActiveEtape(activeEtape + 1)}
                style={{ padding: '8px 18px', background: ETAPES[activeEtape + 1].color, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, color: '#fff', transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                {ETAPES[activeEtape + 1].title} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filtres décisionnels ── */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px' }}>Filtres décisionnels</h3>
        <p style={{ fontSize: 12, color: L.textSec, margin: '0 0 16px' }}>Avant chaque décision, posez-vous ces 4 questions :</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {FILTRES.map((f, i) => (
            <div key={f.title} onClick={() => setActiveFiltre(activeFiltre === i ? null : i)}
              style={{ ...CARD, cursor: 'pointer', textAlign: 'center', borderTop: `3px solid ${f.color}`, transition: 'all .2s', background: activeFiltre === i ? f.color + '08' : L.white }}
              onMouseEnter={e => { if (activeFiltre !== i) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: f.color, marginBottom: 4 }}>{f.title}</div>
            </div>
          ))}
        </div>

        {/* Détail filtre sélectionné */}
        {activeFiltre !== null && (
          <div style={{ ...CARD, marginTop: 10, borderLeft: `4px solid ${FILTRES[activeFiltre].color}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: FILTRES[activeFiltre].color, marginBottom: 10 }}>
              {FILTRES[activeFiltre].icon} {FILTRES[activeFiltre].title} — Questions à se poser
            </div>
            {FILTRES[activeFiltre].questions.map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < FILTRES[activeFiltre].questions.length - 1 ? `1px solid ${L.border}` : 'none' }}>
                <span style={{ color: FILTRES[activeFiltre].color, fontSize: 12, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 13, color: L.text }}>{q}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citation de conclusion */}
      <div style={{ borderLeft: `3px solid ${L.gold}`, paddingLeft: 20, marginTop: 24 }}>
        <p style={{ fontSize: 14, fontStyle: 'italic', color: L.text, lineHeight: 1.7, margin: 0 }}>
          Le pilotage sur la durée — gestion locative, révision des loyers, arbitrage à la revente — fait souvent la différence entre un investisseur qui s'enrichit et un autre qui stagne.
        </p>
      </div>
    </div>
  );
}
