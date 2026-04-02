import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// ─── Config par secteur ────────────────────────────────────────────────────────

const CONFIGS = {
  btp: {
    emoji: '🏗️',
    nom: 'Bâtiment & Artisanat',
    tagline: 'Gérez vos chantiers, équipes et clients depuis un seul outil',
    description: 'De la recherche d\'artisan au suivi de chantier, en passant par la facturation et le recrutement — tout ce dont votre entreprise du bâtiment a besoin.',
    color: '#5B5BD6',
    grad: 'linear-gradient(135deg, #5B5BD6 0%, #7C3AED 100%)',
    shadow: 'rgba(91,91,214,0.3)',
    metiers: ['Plombier', 'Électricien', 'Menuisier', 'Carreleur', 'Peintre', 'Maçon', 'Couvreur', 'Chauffagiste'],
    modules: [
      { icon: '📋', titre: 'Devis & Facturation', desc: 'Créez des devis professionnels en 2 minutes. Transformez-les en factures d\'un clic. Suivi des paiements automatique.' },
      { icon: '🏗️', titre: 'Gestion de chantiers', desc: 'Planifiez et suivez vos chantiers. Photos avant/après, rapport client, avancement en temps réel.' },
      { icon: '👥', titre: 'RH & Recrutement', desc: 'Gérez vos équipes, plannings, congés. Publiez vos offres et recevez des candidatures qualifiées.' },
      { icon: '⏱️', titre: 'Pointage géolocalisé', desc: 'Vos employés pointent directement sur le chantier. Suivi des heures automatisé, exportable paie.' },
      { icon: '📦', titre: 'Stock & Matériaux', desc: 'Gérez vos matériaux et outillage. Alertes de stock bas, bons de commande fournisseurs.' },
      { icon: '⭐', titre: 'Avis & Réputation', desc: 'Collectez les avis de vos clients après chaque chantier. Boostez votre visibilité locale.' },
    ],
    stats: [{ val: '600 000', label: 'artisans en France' }, { val: '80%', label: 'encore sur Excel' }, { val: '2 min', label: 'pour créer un devis' }],
    cta_patron: 'Gérer mon entreprise',
    cta_client: 'Trouver un artisan',
    temoignages: [
      { nom: 'Marc D.', metier: 'Plombier, Lyon', note: 5, texte: 'J\'ai divisé mon temps admin par 3. Les devis partent en quelques minutes.' },
      { nom: 'Sophie L.', metier: 'Électricienne, Bordeaux', note: 5, texte: 'Le suivi de chantier photo, mes clients adorent ça. Vraiment pro.' },
      { nom: 'Karim B.', metier: 'Patron BTP, Paris', note: 5, texte: 'Le recrutement intégré m\'a fait gagner 2 bons électriciens en 3 semaines.' },
    ],
  },
  coiffure: {
    emoji: '✂️',
    nom: 'Coiffure & Beauté',
    tagline: 'Gérez votre salon, vos équipes et vos clients en toute simplicité',
    description: 'Réservation en ligne, gestion des prestataires, fidélité clients, caisse — la plateforme pensée pour les professionnels de la beauté.',
    color: '#EC4899',
    grad: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)',
    shadow: 'rgba(236,72,153,0.3)',
    metiers: ['Coiffeur', 'Barbier', 'Coloriste', 'Esthéticienne', 'Prothésiste ongulaire', 'Maquilleur'],
    modules: [
      { icon: '📅', titre: 'Réservation en ligne', desc: 'Vos clients réservent 24h/24 depuis votre page ou Instagram. Confirmation SMS automatique, zéro no-show.' },
      { icon: '💇', titre: 'Fiche client intelligente', desc: 'Historique complet : coupe, couleur, produits utilisés, allergies. Retrouvez tout en 2 secondes.' },
      { icon: '💈', titre: 'Gestion des prestataires', desc: 'Gérez les loueurs de chaise indépendants. Facturation automatique de la location mensuelle.' },
      { icon: '🎁', titre: 'Programme fidélité', desc: 'Points, bons de réduction, offre anniversaire. Vos clients reviennent plus souvent.' },
      { icon: '💰', titre: 'Caisse & Facturation', desc: 'Encaissement rapide, TVA 10%, remises. Z de caisse journalier exportable.' },
      { icon: '👥', titre: 'RH & Plannings', desc: 'Plannings équipe, congés, heures. Recrutez directement sur la plateforme.' },
    ],
    stats: [{ val: '80 000', label: 'salons en France' }, { val: '+40%', label: 'de réservations en ligne' }, { val: '0€', label: 'pour commencer' }],
    cta_patron: 'Gérer mon salon',
    cta_client: 'Trouver un salon',
    temoignages: [
      { nom: 'Léa M.', metier: 'Salonnière, Paris 11e', note: 5, texte: 'La réservation en ligne a changé ma vie. Plus de téléphone en plein shampoing !' },
      { nom: 'Alex T.', metier: 'Barbier, Marseille', note: 5, texte: 'La fiche client avec l\'historique produits, c\'est ce que je cherchais depuis des années.' },
      { nom: 'Inès B.', metier: 'Salon mixte, Nantes', note: 5, texte: 'Je gère 4 prestataires sans stress. La facturation auto, c\'est magique.' },
    ],
  },
  restaurant: {
    emoji: '🍽️',
    nom: 'Restauration',
    tagline: 'Du plan de salle à la clôture de caisse, tout en un',
    description: 'Réservations, gestion des tables, commandes en cuisine, menus, facturation TVA multi-taux — l\'outil complet pour votre restaurant.',
    color: '#F97316',
    grad: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
    shadow: 'rgba(249,115,22,0.3)',
    metiers: ['Restaurateur', 'Brasserie', 'Bistrot', 'Traiteur', 'Food truck', 'Pizzeria'],
    modules: [
      { icon: '🗺️', titre: 'Plan de salle interactif', desc: 'Gérez vos tables en temps réel. Affectation serveurs, statut tables, fusion et rotation.' },
      { icon: '📲', titre: 'Réservation en ligne', desc: 'Vos clients réservent depuis Google, votre site, Instagram. Confirmation et rappel automatiques.' },
      { icon: '🧾', titre: 'Commandes & Cuisine', desc: 'Les commandes partent directement en cuisine sur tablette. Moins d\'erreurs, service plus rapide.' },
      { icon: '🍴', titre: 'Gestion des menus', desc: 'Créez et modifiez vos menus facilement. Affichage QR code, carte numérique mise à jour instantanément.' },
      { icon: '💳', titre: 'Caisse TVA multi-taux', desc: 'TVA 5,5% / 10% automatique. Ticket de caisse, Z de caisse, rapprochement bancaire.' },
      { icon: '👨‍🍳', titre: 'RH & Recrutement', desc: 'Plannings équipe (serveurs, cuisine), gestion des extras. Recrutez chef, serveur, plongeur directement.' },
    ],
    stats: [{ val: '175 000', label: 'établissements en France' }, { val: '60%', label: 'sans outil digital' }, { val: '-30%', label: 'de no-shows avec rappel SMS' }],
    cta_patron: 'Gérer mon restaurant',
    cta_client: 'Réserver une table',
    temoignages: [
      { nom: 'Pierre G.', metier: 'Restaurateur, Lyon', note: 5, texte: 'Le plan de salle en temps réel, mes serveurs adorent. On ne perd plus aucune table.' },
      { nom: 'Fatou D.', metier: 'Traiteur, Paris', note: 5, texte: 'La gestion des commandes en cuisine a réduit nos erreurs de 80%.' },
      { nom: 'Julien R.', metier: 'Brasserie, Strasbourg', note: 5, texte: 'J\'ai recruté 2 serveurs en 2 semaines via la plateforme. Top !' },
    ],
  },
  boulangerie: {
    emoji: '🥖',
    nom: 'Boulangerie & Pâtisserie',
    tagline: 'De la fournée du matin à la clôture du soir, on gère tout',
    description: 'Production, traçabilité DLC, commandes récurrentes, livraisons — la plateforme conçue pour les boulangers et pâtissiers artisanaux.',
    color: '#D97706',
    grad: 'linear-gradient(135deg, #D97706 0%, #DC2626 100%)',
    shadow: 'rgba(217,119,6,0.3)',
    metiers: ['Boulanger', 'Pâtissier', 'Chocolatier', 'Traiteur', 'Viennoisier'],
    modules: [
      { icon: '🌾', titre: 'Gestion de production', desc: 'Planifiez vos recettes et quantités selon vos ventes J-1. Ne gaspillez plus, ne manquez plus.' },
      { icon: '🏷️', titre: 'Traçabilité DLC/DLUO', desc: 'Étiquetage automatique avec dates. Alertes avant expiration. Conformité HACCP simplifiée.' },
      { icon: '📦', titre: 'Commandes récurrentes', desc: 'Vos clients abonnés reçoivent leur pain chaque matin. Facturation automatique en fin de mois.' },
      { icon: '🚐', titre: 'Gestion des livraisons', desc: 'Tournées optimisées, bons de livraison, suivi client. Livrez restaurants, hôtels, entreprises.' },
      { icon: '⏰', titre: 'Planning nuit & tournées', desc: 'Plannings adaptés aux horaires décalés (4h-12h). Gestion des équipes nuit/jour.' },
      { icon: '💰', titre: 'Caisse & Facturation', desc: 'Encaissement rapide, TVA 5,5%, tickets de caisse. Tableau de bord ventes par produit.' },
    ],
    stats: [{ val: '33 000', label: 'artisans boulangers' }, { val: '10 M', label: 'baguettes/jour en France' }, { val: '0€', label: 'pour commencer' }],
    cta_patron: 'Gérer ma boulangerie',
    cta_client: 'Commander du pain',
    temoignages: [
      { nom: 'Bernard L.', metier: 'Boulanger, Tours', note: 5, texte: 'La gestion de production m\'a fait économiser 40 kg de farine par semaine. Incroyable.' },
      { nom: 'Nadia K.', metier: 'Pâtissière, Nice', note: 5, texte: 'La traçabilité DLC automatique, enfin une solution simple pour le HACCP.' },
      { nom: 'Thomas M.', metier: 'Boulanger livreur, Rennes', note: 5, texte: 'J\'ai 15 restaurants livrés. Les tournées optimisées m\'ont fait gagner 1h par matin.' },
    ],
  },
  garage: {
    emoji: '🔧',
    nom: 'Garage & Auto',
    tagline: 'Gérez vos réparations, stocks et clients comme un pro',
    description: 'Fiches véhicules, ordres de réparation, catalogue pièces, facturation — la solution complète pour les garages et centres auto.',
    color: '#10B981',
    grad: 'linear-gradient(135deg, #10B981 0%, #0891B2 100%)',
    shadow: 'rgba(16,185,129,0.3)',
    metiers: ['Mécanicien', 'Carrossier', 'Électricien auto', 'Contrôle technique', 'Moto', 'Poids lourds'],
    modules: [
      { icon: '🚗', titre: 'Fiches véhicules', desc: 'Fiche complète par véhicule : immatriculation, VIN, kilométrage, historique toutes interventions.' },
      { icon: '🔩', titre: 'Ordres de réparation', desc: 'Créez et suivez vos OR. Diagnostic, pièces, main d\'œuvre, photos. Envoi devis par SMS.' },
      { icon: '📦', titre: 'Catalogue pièces', desc: 'Gérez votre stock de pièces. Commandes fournisseurs, valorisation stock, alertes rupture.' },
      { icon: '📅', titre: 'Rendez-vous & rappels', desc: 'Prise de RDV en ligne. Rappels automatiques entretien, CT, révision selon kilométrage.' },
      { icon: '💰', titre: 'Devis & Facturation', desc: 'Devis main d\'œuvre + pièces séparés. TVA 20%, acompte, règlement partiel. SEPA.' },
      { icon: '👥', titre: 'RH & Recrutement', desc: 'Plannings mécaniciens, formation continue, habilitations. Recrutez directement.' },
    ],
    stats: [{ val: '40 000', label: 'garages en France' }, { val: '70%', label: 'encore sur papier' }, { val: '0€', label: 'pour commencer' }],
    cta_patron: 'Gérer mon garage',
    cta_client: 'Trouver un garage',
    temoignages: [
      { nom: 'Pascal V.', metier: 'Garagiste, Toulouse', note: 5, texte: 'La fiche véhicule avec tout l\'historique, mes clients adorent. Ça inspire confiance.' },
      { nom: 'Sébastien M.', metier: 'Mécanicien indépendant, Lille', note: 5, texte: 'Les rappels entretien auto m\'ont rapporté 20% de chiffre d\'affaires en plus.' },
      { nom: 'Rachid A.', metier: 'Centre auto, Montpellier', note: 5, texte: 'Le devis par SMS, mes clients répondent 5x plus vite qu\'avant.' },
    ],
  },
  commerce: {
    emoji: '🏪',
    nom: 'Commerce de proximité',
    tagline: 'Gérez votre boutique, vos stocks et vos clients simplement',
    description: 'Caisse, gestion de stock, fidélité, fournisseurs — la solution tout-en-un pour les commerces de proximité.',
    color: '#6366F1',
    grad: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    shadow: 'rgba(99,102,241,0.3)',
    metiers: ['Épicier', 'Fleuriste', 'Pressing', 'Pharmacie', 'Librairie', 'Bijouterie'],
    modules: [
      { icon: '🖥️', titre: 'Caisse tactile', desc: 'Caisse rapide, code-barre, multi-modes de paiement. Z de caisse automatique en fin de journée.' },
      { icon: '📦', titre: 'Gestion de stock', desc: 'Inventaire en temps réel, alertes de rupture, historique des mouvements. Scan code-barre.' },
      { icon: '🎁', titre: 'Fidélité clients', desc: 'Cartes de fidélité digitales, points, bons de réduction. Vos clients reviennent plus souvent.' },
      { icon: '🚚', titre: 'Gestion fournisseurs', desc: 'Bons de commande, réception marchandise, évaluation fournisseurs, rapprochement factures.' },
      { icon: '📊', titre: 'Tableau de bord ventes', desc: 'Meilleures ventes, heures de pointe, panier moyen. Prenez les bonnes décisions.' },
      { icon: '👥', titre: 'RH & Recrutement', desc: 'Plannings, congés, gestion des extras. Recrutez directement via la plateforme.' },
    ],
    stats: [{ val: '400 000', label: 'commerces de proximité' }, { val: '65%', label: 'sans logiciel moderne' }, { val: '0€', label: 'pour commencer' }],
    cta_patron: 'Gérer ma boutique',
    cta_client: 'Trouver un commerce',
    temoignages: [
      { nom: 'Marie-Claire F.', metier: 'Fleuriste, Lyon', note: 5, texte: 'La fidélité digitale a augmenté mes clients réguliers de 30%. Simple et efficace.' },
      { nom: 'Ahmed S.', metier: 'Épicier, Paris', note: 5, texte: 'La gestion stock m\'a fait économiser des centaines d\'euros de produits périmés.' },
      { nom: 'Élise T.', metier: 'Pressing, Bordeaux', note: 5, texte: 'Mes employés gèrent la caisse seuls maintenant. Je peux enfin souffler.' },
    ],
  },
};

// ─── Sous-composants ───────────────────────────────────────────────────────────

function ModuleCard({ module, color, grad, shadow }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: hov ? `1px solid ${color}44` : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '20px 20px 18px',
        transition: 'all 0.2s ease',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 12px 32px ${shadow}` : 'none',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: hov ? grad : `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.25rem', marginBottom: 12, transition: 'all 0.2s',
      }}>
        {module.icon}
      </div>
      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>{module.titre}</div>
      <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{module.desc}</div>
    </div>
  );
}

function StarRow({ note }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= note ? '#F59E0B' : 'none'}
          stroke={i <= note ? '#F59E0B' : 'rgba(255,255,255,0.2)'}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round"/>
        </svg>
      ))}
    </span>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function SecteurLanding() {
  const { secteur: secteurId } = useParams();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const cfg = CONFIGS[secteurId];

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, [secteurId]);

  if (!cfg) {
    navigate('/');
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080F',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 50% -5%, ${cfg.color}22 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 85% 85%, ${cfg.color}0A 0%, transparent 50%)
        `,
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Navbar ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(20px, 5vw, 60px)', height: 64,
          background: 'rgba(8,8,15,0.8)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          {/* Logo + back */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(91,91,214,0.4)',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22" fill="rgba(255,255,255,0.7)"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#fff', letterSpacing: '-0.025em' }}>
                Artisans<span style={{ background: 'linear-gradient(90deg, #A5A5FF, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}> Pro</span>
              </span>
            </button>

            {/* Sector pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: `${cfg.color}18`, border: `1px solid ${cfg.color}33`,
              borderRadius: 20, padding: '4px 12px 4px 8px',
            }}>
              <span style={{ fontSize: '0.875rem' }}>{cfg.emoji}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: cfg.color, letterSpacing: '-0.01em' }}>{cfg.nom}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Changer secteur */}
            <button
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '7px 14px', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Secteurs
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', padding: '8px 18px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate(`/register?secteur=${secteurId}`)}
              style={{ background: cfg.grad, border: 'none', cursor: 'pointer', padding: '8px 18px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, color: '#fff', boxShadow: `0 4px 14px ${cfg.shadow}` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.shadow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 14px ${cfg.shadow}`; }}
            >
              Créer un compte
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{
          textAlign: 'center',
          padding: 'clamp(56px, 10vh, 90px) clamp(20px, 5vw, 60px) clamp(48px, 8vh, 72px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.5s, transform 0.5s',
        }}>
          {/* Emoji + badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: `${cfg.color}14`, border: `1px solid ${cfg.color}30`,
            borderRadius: 24, padding: '6px 18px 6px 12px', marginBottom: 28,
          }}>
            <span style={{ fontSize: '1.375rem' }}>{cfg.emoji}</span>
            <span style={{ fontSize: '0.8125rem', color: cfg.color, fontWeight: 600, letterSpacing: '-0.01em' }}>{cfg.nom}</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
            fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.04em',
            color: '#fff', margin: '0 auto 18px', maxWidth: 700,
          }}>
            {cfg.tagline}
          </h1>

          <p style={{
            fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)',
            color: 'rgba(255,255,255,0.5)', margin: '0 auto 36px',
            maxWidth: 540, lineHeight: 1.65, letterSpacing: '-0.01em',
          }}>
            {cfg.description}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/register?secteur=${secteurId}&role=patron`)}
              style={{ background: cfg.grad, border: 'none', cursor: 'pointer', padding: '13px 28px', borderRadius: 14, fontSize: '0.9375rem', fontWeight: 700, color: '#fff', boxShadow: `0 6px 20px ${cfg.shadow}`, letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${cfg.shadow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 20px ${cfg.shadow}`; }}
            >
              {cfg.cta_patron} — Gratuit →
            </button>
            <button
              onClick={() => navigate(`/register?secteur=${secteurId}&role=client`)}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', padding: '13px 24px', borderRadius: 14, fontSize: '0.9375rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            >
              {cfg.cta_client}
            </button>
          </div>

          {/* Métiers pills */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
            {cfg.metiers.map(m => (
              <span key={m} style={{
                fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '3px 10px', letterSpacing: '-0.01em',
              }}>{m}</span>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 'clamp(28px, 6vw, 72px)',
          flexWrap: 'wrap',
          padding: '24px clamp(20px, 5vw, 60px) 32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {cfg.stats.map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.03em',
                background: cfg.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{val}</div>
              <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '-0.01em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Modules ── */}
        <div style={{ padding: 'clamp(48px, 7vh, 72px) clamp(20px, 5vw, 60px)', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', margin: '0 0 10px' }}>
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: '-0.01em' }}>
              Des modules pensés pour {cfg.nom.toLowerCase()}
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {cfg.modules.map(m => (
              <ModuleCard key={m.titre} module={m} color={cfg.color} grad={cfg.grad} shadow={cfg.shadow} />
            ))}
          </div>
        </div>

        {/* ── Témoignages ── */}
        <div style={{
          padding: 'clamp(40px, 6vh, 64px) clamp(20px, 5vw, 60px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.015)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', margin: '0 0 8px' }}>
              Ils nous font confiance
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Des professionnels comme vous
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14, maxWidth: 1000, margin: '0 auto',
          }}>
            {cfg.temoignages.map((t, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '20px 20px 16px',
              }}>
                <StarRow note={t.note} />
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: '10px 0 14px', fontStyle: 'italic' }}>
                  "{t.texte}"
                </p>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{t.nom}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{t.metier}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA final ── */}
        <div style={{
          textAlign: 'center',
          padding: 'clamp(48px, 8vh, 80px) clamp(20px, 5vw, 60px)',
        }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.125rem)', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', margin: '0 0 12px' }}>
            Prêt à transformer votre {cfg.nom.split(' ')[0].toLowerCase()} ?
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 32px', letterSpacing: '-0.01em' }}>
            Gratuit pour commencer. Sans engagement. Sans carte bancaire.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/register?secteur=${secteurId}`)}
              style={{ background: cfg.grad, border: 'none', cursor: 'pointer', padding: '14px 32px', borderRadius: 14, fontSize: '1rem', fontWeight: 700, color: '#fff', boxShadow: `0 6px 24px ${cfg.shadow}`, letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 14px 40px ${cfg.shadow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 24px ${cfg.shadow}`; }}
            >
              Commencer gratuitement →
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', padding: '14px 24px', borderRadius: 14, fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              Voir tous les secteurs
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 24, flexWrap: 'wrap',
          padding: '16px clamp(20px, 5vw, 60px) 28px',
        }}>
          {[
            { label: 'Connexion', path: '/login' },
            { label: 'Inscription', path: '/register' },
            { label: 'Recrutement', path: '/recrutement' },
            { label: 'CGU', path: '/cgu' },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '-0.01em', transition: 'color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
