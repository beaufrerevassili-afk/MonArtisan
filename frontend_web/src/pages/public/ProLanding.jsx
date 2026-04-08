import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFadeUp, useScaleIn, StaggerChildren } from '../../utils/scrollAnimations';
import L from '../../design/luxe';

const SECTEURS = [
  { id: 'btp', emoji: '🏗️', label: 'BTP & Artisans', color: '#8B5CF6' },
  { id: 'coiffure', emoji: '💇', label: 'Coiffure & Beauté', color: '#EC4899' },
  { id: 'immo', emoji: '🏠', label: 'Immobilier & SCI', color: '#2563EB' },
  { id: 'droit', emoji: '⚖️', label: 'Droit & Juridique', color: '#059669' },
  { id: 'autre', emoji: '💼', label: 'Autre activité', color: '#D97706' },
];

const ECO = {
  btp: {
    center: { icon: '🏗️', label: 'BTP' },
    modules: [
      { icon: '📊', label: 'Pipeline commercial', desc: 'Prospects, devis, factures — suivez chaque affaire du premier contact au paiement.', color: '#8B5CF6' },
      { icon: '👥', label: 'RH & Paie', desc: 'Convention collective BTP, bulletins de paie, indemnités trajet, gestion des congés.', color: '#2563EB' },
      { icon: '🛡️', label: 'QHSE', desc: 'Audits sécurité, EPI, incidents, BSDD, habilitations — conformité chantier totale.', color: '#16A34A' },
      { icon: '📍', label: 'Chantiers', desc: 'Planning, affectation, photos, calcul de distance automatique.', color: '#D97706' },
      { icon: '📢', label: 'Recrutement', desc: 'Publiez des offres, recevez des CV, pipeline d\'embauche complet.', color: '#059669' },
      { icon: '💰', label: 'Finance', desc: 'Trésorerie, URSSAF, export Sage/EBP, bibliothèque de prix.', color: '#DC2626' },
    ],
    phrase: 'Remplace Sage + PayFit + Qualnet en un seul outil.',
    avant: ['Excel pour les devis', 'PayFit pour la paie', 'Qualnet pour la sécurité', 'Sage pour la compta', 'Papier pour les EPI'],
    apres: ['Pipeline commercial visuel', 'Paie BTP automatisée', 'Audits QHSE intégrés', 'Export comptable en 1 clic', 'Suivi EPI numérique'],
  },
  coiffure: {
    center: { icon: '💇', label: 'Salon' },
    modules: [
      { icon: '📅', label: 'Agenda & RDV', desc: 'Prise de rendez-vous en ligne, rappels automatiques, planning équipe.', color: '#8B5CF6' },
      { icon: '👥', label: 'Personnel', desc: 'Planning, congés, paie, contrats — adapté aux salons.', color: '#2563EB' },
      { icon: '💰', label: 'Caisse & Factures', desc: 'Encaissements, historique client, export comptable.', color: '#16A34A' },
      { icon: '📦', label: 'Stock produits', desc: 'Suivi produits, alertes réapprovisionnement.', color: '#D97706' },
      { icon: '⭐', label: 'Avis & Fidélité', desc: 'Avis clients, programme de fidélité, communication.', color: '#059669' },
      { icon: '🎬', label: 'Communication', desc: 'Vidéos réseaux sociaux, branding, présence en ligne.', color: '#DC2626' },
    ],
    phrase: 'Gérez votre salon de A à Z sans multiplier les logiciels.',
    avant: ['Cahier de rendez-vous', 'Logiciel de caisse séparé', 'Comptable externe', 'Pas de fidélisation client', 'Pas de présence en ligne'],
    apres: ['Agenda en ligne avec rappels', 'Caisse + factures intégrées', 'Export comptable automatique', 'Programme fidélité intégré', 'Vidéos & branding inclus'],
  },
  immo: {
    center: { icon: '🏠', label: 'Immobilier' },
    modules: [
      { icon: '🏢', label: 'Gestion locative', desc: 'Baux, quittances, appels de loyer automatisés.', color: '#8B5CF6' },
      { icon: '💰', label: 'Comptabilité SCI', desc: 'Revenus, charges, amortissements, déclarations.', color: '#2563EB' },
      { icon: '🔧', label: 'Travaux', desc: 'Suivi interventions, devis artisans, historique par bien.', color: '#16A34A' },
      { icon: '📄', label: 'Documents', desc: 'Baux, avenants, PV d\'AG générés en un clic.', color: '#D97706' },
      { icon: '📊', label: 'Rentabilité', desc: 'Rendement par bien, cash-flow, projection.', color: '#059669' },
      { icon: '👥', label: 'Locataires', desc: 'Fiches locataires, paiements, relances auto.', color: '#DC2626' },
    ],
    phrase: 'Pilotez vos biens et SCI depuis un seul tableau de bord.',
    avant: ['Excel pour les loyers', 'Courriers manuels', 'Comptable pour tout', 'Pas de suivi travaux', 'Relances oubliées'],
    apres: ['Appels de loyer automatiques', 'Documents générés en 1 clic', 'Comptabilité SCI intégrée', 'Suivi travaux par bien', 'Relances automatiques'],
  },
  droit: {
    center: { icon: '⚖️', label: 'Cabinet' },
    modules: [
      { icon: '📁', label: 'Dossiers', desc: 'Suivi des affaires, échéances, pièces jointes.', color: '#8B5CF6' },
      { icon: '💰', label: 'Facturation', desc: 'Saisie du temps, honoraires, facturation auto.', color: '#2563EB' },
      { icon: '📄', label: 'Documents', desc: 'Modèles de contrats, actes, courriers.', color: '#16A34A' },
      { icon: '👥', label: 'Clients & CRM', desc: 'Fiches clients, historique, relances.', color: '#D97706' },
      { icon: '📅', label: 'Agenda', desc: 'Planning, audiences, rendez-vous.', color: '#059669' },
      { icon: '🛡️', label: 'Conformité', desc: 'RGPD, archivage sécurisé.', color: '#DC2626' },
    ],
    phrase: 'L\'outil de gestion pensé pour les professionnels du droit.',
    avant: ['Dossiers papier', 'Facturation manuelle', 'Pas de suivi temps', 'Agenda séparé', 'RGPD non maîtrisé'],
    apres: ['Dossiers numériques complets', 'Facturation automatisée', 'Suivi temps intégré', 'Agenda avec rappels', 'Conformité RGPD intégrée'],
  },
  autre: {
    center: { icon: '💼', label: 'Activité' },
    modules: [
      { icon: '📊', label: 'Commercial', desc: 'Pipeline de ventes, devis, factures, suivi clients.', color: '#8B5CF6' },
      { icon: '👥', label: 'RH & Équipe', desc: 'Gestion du personnel, congés, paie, contrats.', color: '#2563EB' },
      { icon: '💰', label: 'Finance', desc: 'Trésorerie, comptabilité, déclarations.', color: '#16A34A' },
      { icon: '📢', label: 'Recrutement', desc: 'Offres d\'emploi, candidatures, embauche.', color: '#D97706' },
      { icon: '🎬', label: 'Communication', desc: 'Vidéos, branding, réseaux sociaux.', color: '#059669' },
      { icon: '📄', label: 'Documents', desc: 'Contrats, modèles, génération auto.', color: '#DC2626' },
    ],
    phrase: 'Un outil de gestion complet, quel que soit votre métier.',
    avant: ['Plusieurs logiciels', 'Données dispersées', 'Tâches manuelles', 'Pas de vision globale', 'Perte de temps'],
    apres: ['Un seul outil', 'Données connectées', 'Automatisation complète', 'Tableau de bord unifié', 'Gain de temps massif'],
  },
};

/* ── Schéma circulaire interactif ── */
function EcoSchema({ secteur, hovered, setHovered }) {
  const eco = ECO[secteur] || ECO.btp;
  const modules = eco.modules;
  const cx = 50, cy = 50, r = 36;
  const positions = modules.map((_, i) => {
    const angle = (i / modules.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 auto', aspectRatio: '1' }}>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={0.3} strokeDasharray="2 1.5" />
        {positions.map((pos, i) => (
          <line key={i} x1={cx} y1={cy} x2={pos.x} y2={pos.y}
            stroke={hovered === i ? modules[i].color : 'rgba(255,255,255,0.08)'} strokeWidth={hovered === i ? 0.6 : 0.25}
            style={{ transition: 'all .3s' }} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <span style={{ fontSize: 28 }}>{eco.center.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 700, marginTop: 2 }}>{eco.center.label}</span>
      </div>
      {modules.map((mod, i) => {
        const pos = positions[i];
        const active = hovered === i;
        return (
          <div key={mod.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} onClick={() => setHovered(active ? null : i)}
            style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)', cursor: 'pointer', zIndex: active ? 3 : 1 }}>
            <div style={{ width: active ? 62 : 52, height: active ? 62 : 52, borderRadius: '50%', background: active ? mod.color : 'rgba(255,255,255,0.08)', border: `2px solid ${active ? mod.color : 'rgba(255,255,255,0.12)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: active ? `0 8px 24px ${mod.color}40` : 'none', transition: 'all .25s', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontSize: active ? 20 : 17 }}>{mod.icon}</span>
              <span style={{ fontSize: 6.5, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.1, padding: '0 3px', marginTop: 1 }}>{mod.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProLanding() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const isPro = user && (user.role === 'patron' || user.role === 'fondateur' || user.role === 'super_admin');
  const [secteur, setSecteur] = useState('btp');
  const [hovered, setHovered] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = (id) => { setMenuOpen(false); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); };

  const r1 = useFadeUp(), r2 = useFadeUp(0.1), r3 = useFadeUp(0.1);
  const eco = ECO[secteur] || ECO.btp;
  const modules = eco.modules;

  return (
    <div style={{ minHeight: '100vh', background: L.white, fontFamily: L.font, color: L.text }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(20px,4vw,48px)', height: 60, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${L.border}` }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 800, color: L.text, fontFamily: L.font, letterSpacing: '-0.04em' }}>
          Freample<span style={{ color: L.gold }}>.</span> <span style={{ fontSize: 12, fontWeight: 400, color: L.textSec }}>Pro</span>
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => scrollTo('ecosysteme')} style={{ padding: '8px 16px', background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font }}>Écosystème</button>
          <button onClick={() => scrollTo('avantages')} style={{ padding: '8px 16px', background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font }}>Avantages</button>
          <button onClick={() => scrollTo('faq')} style={{ padding: '8px 16px', background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font }}>FAQ</button>
          {isPro ? (
            <button onClick={() => navigate('/patron/dashboard')} style={{ padding: '8px 20px', background: L.noir, border: 'none', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: L.font }}>Mon espace</button>
          ) : (
            <button onClick={() => navigate(`/register?role=patron&secteur=${secteur}`)} style={{ padding: '8px 20px', background: L.noir, border: 'none', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: L.font, transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>
              S'inscrire gratuitement
            </button>
          )}
        </div>
      </nav>

      {/* ══ HERO + SCHÉMA INTERACTIF ══ */}
      <header id="ecosysteme" style={{ background: L.noir, padding: 'clamp(60px,10vh,100px) 32px clamp(48px,8vh,80px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.08) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 'clamp(32px,5vw,64px)', alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {/* Texte */}
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <div style={{ width: 40, height: 2, background: L.gold, marginBottom: 24 }} />
            <h1 style={{ fontSize: 'clamp(32px,5.5vw,56px)', fontWeight: 800, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
              Gérez toute votre<br />entreprise en un<br />seul endroit.
            </h1>
            <p style={{ fontSize: 'clamp(15px,1.6vw,17px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: '0 0 24px', maxWidth: 420 }}>
              RH, paie, commercial, conformité, recrutement, communication — un écosystème complet adapté à votre métier.
            </p>

            {/* Sélecteur secteur */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
              {SECTEURS.map(s => (
                <button key={s.id} onClick={() => { setSecteur(s.id); setHovered(null); }}
                  style={{ padding: '8px 16px', border: `1px solid ${secteur === s.id ? s.color : 'rgba(255,255,255,0.12)'}`, background: secteur === s.id ? s.color + '20' : 'transparent', color: secteur === s.id ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, transition: 'all .2s', borderRadius: 6 }}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 14, color: L.gold, fontWeight: 600, fontStyle: 'italic', marginBottom: 28 }}>{eco.phrase}</p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => navigate(`/register?role=patron&secteur=${secteur}`)} style={{ padding: '14px 36px', background: L.gold, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, letterSpacing: '0.04em', transition: 'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = L.goldDark} onMouseLeave={e => e.currentTarget.style.background = L.gold}>
                Créer mon espace — Gratuit
              </button>
              <button onClick={() => scrollTo('avantages')} style={{ padding: '14px 28px', background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 13, cursor: 'pointer', fontFamily: L.font, transition: 'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}>
                Voir les avantages
              </button>
            </div>
          </div>

          {/* Schéma interactif */}
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <EcoSchema secteur={secteur} hovered={hovered} setHovered={setHovered} />
            {/* Détail au survol */}
            <div style={{ minHeight: 64, marginTop: 8 }}>
              {hovered !== null ? (
                <div style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${modules[hovered].color}60`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10, backdropFilter: 'blur(4px)' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{modules[hovered].icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: modules[hovered].color, marginBottom: 2 }}>{modules[hovered].label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{modules[hovered].desc}</div>
                  </div>
                </div>
              ) : (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Survolez un module pour en savoir plus</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ══ CHIFFRES ══ */}
      <section style={{ background: L.cream, padding: 'clamp(36px,5vh,56px) 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(24px,5vw,64px)', flexWrap: 'wrap', textAlign: 'center' }}>
          {[{ val: '5 min', label: 'Pour s\'inscrire' }, { val: '0 €', label: 'Abonnement' }, { val: '6+', label: 'Modules intégrés' }, { val: '24/7', label: 'Accessible partout' }].map(s => (
            <div key={s.val}>
              <div style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 500, fontFamily: L.serif, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: L.textSec, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ AVANT / APRÈS ══ */}
      <section ref={r1} id="avantages" style={{ background: L.white, padding: 'clamp(64px,9vh,100px) 32px', scrollMarginTop: 20 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px' }}>Avant Freample vs. Avec Freample</h2>
            <p style={{ fontSize: 15, color: L.textSec }}>Sélectionnez votre secteur ci-dessus pour voir la comparaison.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: `1px solid ${L.border}`, borderRadius: 14, overflow: 'hidden' }}>
            {/* Avant */}
            <div style={{ padding: 'clamp(24px,4vw,36px)', background: '#FEF2F2' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>❌ Avant</div>
              {eco.avant.map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(220,38,38,0.08)', fontSize: 14, color: '#7F1D1D' }}>
                  <span style={{ color: '#DC2626', fontSize: 12, flexShrink: 0 }}>✗</span>{a}
                </div>
              ))}
            </div>
            {/* Après */}
            <div style={{ padding: 'clamp(24px,4vw,36px)', background: '#F0FDF4' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>✅ Avec Freample</div>
              {eco.apres.map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(22,163,74,0.08)', fontSize: 14, color: '#14532D' }}>
                  <span style={{ color: '#16A34A', fontSize: 12, flexShrink: 0 }}>✓</span>{a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MODULES DÉTAILLÉS ══ */}
      <section ref={r2} style={{ background: L.bg, padding: 'clamp(64px,9vh,100px) 32px', borderTop: `1px solid ${L.border}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px' }}>Tout est inclus, rien à ajouter.</h2>
            <p style={{ fontSize: 15, color: L.textSec }}>Chaque module est conçu pour fonctionner avec les autres. Zéro ressaisie.</p>
          </div>
          <StaggerChildren style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {eco.modules.map(mod => (
              <div key={mod.label} style={{ background: L.white, borderRadius: 14, padding: '24px 20px', border: `1px solid ${L.border}`, transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = mod.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${mod.color}12`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{mod.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: mod.color, margin: '0 0 6px' }}>{mod.label}</h3>
                <p style={{ fontSize: 13, color: L.textSec, lineHeight: 1.6, margin: 0 }}>{mod.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══ TARIFS ══ */}
      <section style={{ background: L.white, padding: 'clamp(64px,9vh,100px) 32px', borderTop: `1px solid ${L.border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px' }}>Gratuit. Vraiment.</h2>
          <p style={{ fontSize: 15, color: L.textSec, marginBottom: 36 }}>Pas d'abonnement, pas de frais cachés. La commission est sur le client, pas sur vous.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { val: '0 €', label: 'Abonnement', desc: 'Inscription et accès complet gratuits' },
              { val: '100 %', label: 'Pour vous', desc: 'Vous recevez 100% de vos prestations' },
              { val: '∞', label: 'Illimité', desc: 'Devis, factures, employés, clients' },
            ].map(t => (
              <div key={t.val} style={{ background: L.cream, borderRadius: 14, padding: '24px 16px', border: `1px solid ${L.border}` }}>
                <div style={{ fontSize: 28, fontWeight: 500, fontFamily: L.serif, color: L.gold }}>{t.val}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: L.textSec, marginTop: 4 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section ref={r3} id="faq" style={{ background: L.bg, padding: 'clamp(64px,9vh,100px) 32px', borderTop: `1px solid ${L.border}`, scrollMarginTop: 20 }}>
        <div style={{ maxWidth: 650, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Questions fréquentes</h2>
          </div>
          {[
            { q: 'L\'inscription est-elle vraiment gratuite ?', a: 'Oui. Inscription, accès à tous les modules et utilisation quotidienne sont gratuits. Aucun abonnement.' },
            { q: 'Comment Freample gagne de l\'argent ?', a: 'Une commission est prélevée sur le client final lors des transactions, jamais sur le professionnel. Vous recevez 100% de vos prestations.' },
            { q: 'Combien de temps pour commencer ?', a: '5 minutes. Créez votre compte, choisissez votre secteur, et vous accédez immédiatement à tous les outils.' },
            { q: 'C\'est adapté à mon métier ?', a: 'Freample est conçu pour le BTP, la coiffure, l\'immobilier, le droit et toute activité nécessitant de la gestion. Les modules s\'adaptent à votre secteur.' },
            { q: 'Puis-je créer les comptes de mes salariés ?', a: 'Oui. Depuis votre espace, vous créez les comptes employés. Ils reçoivent leurs identifiants et accèdent à leur propre espace (planning, fiches de paie, documents...).' },
            { q: 'Mes données sont-elles sécurisées ?', a: 'Oui. Hébergement sécurisé, chiffrement SSL, sauvegardes quotidiennes, conformité RGPD.' },
          ].map(faq => (
            <details key={faq.q} style={{ marginBottom: 1 }}>
              <summary style={{ padding: '18px 20px', background: L.white, border: `1px solid ${L.border}`, cursor: 'pointer', fontSize: 15, fontWeight: 600, color: L.text, listStyle: 'none' }}>{faq.q}</summary>
              <div style={{ padding: '16px 20px', background: L.white, border: `1px solid ${L.border}`, borderTop: 'none', fontSize: 14, color: L.textSec, lineHeight: 1.65 }}>{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section style={{ background: L.noir, padding: 'clamp(72px,12vh,110px) 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 14px' }}>
            Prêt à simplifier<br />votre quotidien ?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 36px' }}>
            Inscription gratuite, aucun abonnement, tout inclus.
          </p>
          <button onClick={() => navigate(`/register?role=patron&secteur=${secteur}`)} style={{ padding: '16px 48px', background: L.gold, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'background .25s' }}
            onMouseEnter={e => e.currentTarget.style.background = L.goldDark} onMouseLeave={e => e.currentTarget.style.background = L.gold}>
            Commencer maintenant
          </button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: '24px 32px', borderTop: `1px solid ${L.border}`, background: L.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: L.textLight, fontFamily: L.font }}
          onMouseEnter={e => e.currentTarget.style.color = L.gold} onMouseLeave={e => e.currentTarget.style.color = L.textLight}>
          ← Retour à l'accueil
        </button>
        <span style={{ fontSize: 11, color: L.textLight }}>© 2026 Freample</span>
      </footer>
    </div>
  );
}
