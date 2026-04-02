import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Config par secteur ────────────────────────────────────────────────────────

const SECTEUR_CONFIG = {
  coiffure: {
    label: 'Coiffure & Beauté', emoji: '✂️',
    color: '#EC4899', grad: 'linear-gradient(135deg,#EC4899,#A855F7)',
    placeholder: 'Coupe, couleur, balayage...',
    filtres: ['Tous', 'Salon', 'Barbier', 'Institut', 'Domicile'],
    services_defaut: ['Coupe femme', 'Coupe homme', 'Balayage', 'Couleur', 'Brushing', 'Barbe'],
  },
  restaurant: {
    label: 'Restaurants', emoji: '🍽️',
    color: '#F97316', grad: 'linear-gradient(135deg,#F97316,#EF4444)',
    placeholder: 'Italien, sushi, burger...',
    filtres: ['Tous', 'Sur place', 'À emporter', 'Livraison', 'Traiteur'],
    services_defaut: ['Menu midi', 'Menu soir', 'À la carte', 'Brunch', 'Privatisation'],
  },
  boulangerie: {
    label: 'Boulangeries & Pâtisseries', emoji: '🥖',
    color: '#D97706', grad: 'linear-gradient(135deg,#D97706,#DC2626)',
    placeholder: 'Pain, croissant, gâteau...',
    filtres: ['Tous', 'Boulangerie', 'Pâtisserie', 'Bio', 'Livraison'],
    services_defaut: ['Baguette tradition', 'Pain au levain', 'Croissant', 'Commande gâteau', 'Viennoiseries'],
  },
  garage: {
    label: 'Garages & Auto', emoji: '🔧',
    color: '#10B981', grad: 'linear-gradient(135deg,#10B981,#0891B2)',
    placeholder: 'Vidange, pneus, diagnostic...',
    filtres: ['Tous', 'Mécanique', 'Carrosserie', 'Pneus', 'Diagnostic'],
    services_defaut: ['Vidange', 'Contrôle technique', 'Changement pneus', 'Diagnostic', 'Freins'],
  },
  commerce: {
    label: 'Commerces de proximité', emoji: '🛍️',
    color: '#6366F1', grad: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
    placeholder: 'Fleuriste, pressing, épicerie...',
    filtres: ['Tous', 'Fleuriste', 'Pressing', 'Épicerie', 'Librairie'],
    services_defaut: ['Bouquet', 'Pressing express', 'Commande', 'Livraison', 'Sur mesure'],
  },
};

// ─── Données démo professionnels ──────────────────────────────────────────────

const PROS_DEMO = {
  coiffure: [
    { id: 1, nom: 'Salon Léa', type: 'Salon', ville: 'Paris 11e', note: 4.9, avis: 142, dispo: true, bio: 'Spécialiste couleur et balayage depuis 12 ans. Produits bio et éco-responsables.', services: [{ nom: 'Coupe femme', prix: 45 }, { nom: 'Coupe + brushing', prix: 65 }, { nom: 'Balayage', prix: 95 }, { nom: 'Couleur racines', prix: 75 }, { nom: 'Brushing seul', prix: 30 }], horaires: 'Mar–Sam · 9h–19h', color: '#EC4899', initials: 'SL' },
    { id: 2, nom: 'Barbershop Alex', type: 'Barbier', ville: 'Paris 3e', note: 5.0, avis: 67, dispo: true, bio: 'Barbier traditionnel. Coupe + barbe au rasoir. Ambiance détendue, résultat impeccable.', services: [{ nom: 'Coupe homme', prix: 22 }, { nom: 'Barbe', prix: 15 }, { nom: 'Coupe + barbe', prix: 32 }, { nom: 'Rasage traditionnel', prix: 18 }], horaires: 'Lun–Sam · 10h–20h', color: '#6366F1', initials: 'BA' },
    { id: 3, nom: 'Studio Inès', type: 'Salon', ville: 'Paris 18e', note: 4.7, avis: 89, dispo: true, bio: 'Colorations naturelles, soins kératine, lissage brésilien. Résultats durables.', services: [{ nom: 'Coupe femme', prix: 40 }, { nom: 'Lissage brésilien', prix: 180 }, { nom: 'Kératine', prix: 150 }, { nom: 'Balayage', prix: 90 }], horaires: 'Mar–Dim · 10h–19h', color: '#A855F7', initials: 'SI' },
    { id: 4, nom: 'Coiff\'Express', type: 'Salon', ville: 'Boulogne', note: 4.5, avis: 203, dispo: false, bio: 'Coiffure rapide et abordable. Réservation en ligne, pas d\'attente.', services: [{ nom: 'Coupe femme', prix: 28 }, { nom: 'Coupe homme', prix: 18 }, { nom: 'Brushing', prix: 22 }], horaires: 'Lun–Dim · 9h–20h', color: '#F59E0B', initials: 'CE' },
    { id: 5, nom: 'Atelier Beauté', type: 'Institut', ville: 'Neuilly', note: 4.8, avis: 54, dispo: true, bio: 'Coiffure + soins du visage + onglerie. Votre beauté à 360°.', services: [{ nom: 'Coupe + soin', prix: 70 }, { nom: 'Manucure', prix: 40 }, { nom: 'Soin visage', prix: 65 }], horaires: 'Mar–Sam · 9h30–18h30', color: '#10B981', initials: 'AB' },
    { id: 6, nom: 'Le Barbier du Marais', type: 'Barbier', ville: 'Paris 4e', note: 4.9, avis: 118, dispo: true, bio: 'Barbier de quartier depuis 8 ans. Coupes classiques et modernes, ambiance authentique.', services: [{ nom: 'Coupe homme', prix: 25 }, { nom: 'Coupe + barbe', prix: 38 }, { nom: 'Barbe complète', prix: 20 }], horaires: 'Mar–Dim · 10h–19h', color: '#EF4444', initials: 'BM' },
  ],
  restaurant: [
    { id: 1, nom: 'Chez Marco', type: 'Sur place', ville: 'Lyon 2e', note: 4.8, avis: 89, dispo: true, bio: 'Cuisine italienne authentique, pâtes fraîches maison. Ambiance chaleureuse.', services: [{ nom: 'Menu midi (entrée+plat)', prix: 16 }, { nom: 'Menu soir complet', prix: 28 }, { nom: 'Pizza au feu de bois', prix: 14 }, { nom: 'Pâtes fraîches', prix: 16 }], horaires: 'Lun–Dim · 12h–14h30 · 19h–22h30', color: '#F97316', initials: 'CM' },
    { id: 2, nom: 'Le Bistrot Paulette', type: 'Sur place', ville: 'Lyon 6e', note: 4.9, avis: 201, dispo: true, bio: 'Cuisine française traditionnelle. Produits du marché, vins naturels.', services: [{ nom: 'Formule midi', prix: 19 }, { nom: 'Menu dégustation', prix: 48 }, { nom: 'Table privatisée (min. 10)', prix: 35 }], horaires: 'Mar–Sam · 12h–14h · 19h30–22h', color: '#EF4444', initials: 'BP' },
    { id: 3, nom: 'Sushi Kenji', type: 'Sur place', ville: 'Lyon 3e', note: 4.7, avis: 156, dispo: true, bio: 'Sushis préparés minute par un chef japonais. Poisson frais livré chaque matin.', services: [{ nom: 'Plateau 12 pièces', prix: 22 }, { nom: 'Menu omakase', prix: 45 }, { nom: 'À emporter', prix: 18 }], horaires: 'Mar–Dim · 12h–14h30 · 19h–22h', color: '#0891B2', initials: 'SK' },
    { id: 4, nom: 'La Terrasse Verte', type: 'Sur place', ville: 'Villeurbanne', note: 4.6, avis: 78, dispo: false, bio: 'Cuisine végétale créative. Formules midi express pour les professionnels.', services: [{ nom: 'Lunch box', prix: 12 }, { nom: 'Formule complète', prix: 22 }, { nom: 'Brunch weekend', prix: 28 }], horaires: 'Lun–Ven · 11h30–15h · Samedi brunch', color: '#10B981', initials: 'TV' },
  ],
  boulangerie: [
    { id: 1, nom: 'Maison Dupont', type: 'Boulangerie', ville: 'Bordeaux Centre', note: 4.9, avis: 213, dispo: true, bio: 'Boulangerie artisanale depuis 1987. Pains au levain naturel, viennoiseries au beurre AOP.', services: [{ nom: 'Baguette tradition', prix: 1.35 }, { nom: 'Pain au levain (800g)', prix: 6.50 }, { nom: 'Croissant pur beurre', prix: 1.40 }, { nom: 'Gâteau sur commande', prix: 45 }], horaires: 'Lun–Sam · 7h–19h30 · Dim 7h–13h', color: '#D97706', initials: 'MD' },
    { id: 2, nom: 'La Fournée Bio', type: 'Bio', ville: 'Bordeaux Chartrons', note: 4.8, avis: 97, dispo: true, bio: 'Farine bio locale, levain maison, cuisson au feu de bois. Livraison quartier disponible.', services: [{ nom: 'Baguette bio', prix: 1.80 }, { nom: 'Pain complet', prix: 5.50 }, { nom: 'Tarte du jour', prix: 3.20 }, { nom: 'Abonnement hebdo', prix: 25 }], horaires: 'Mar–Dim · 7h30–13h30', color: '#10B981', initials: 'FB' },
  ],
  garage: [
    { id: 1, nom: 'Garage Martin', type: 'Mécanique', ville: 'Toulouse Rangueil', note: 4.7, avis: 54, dispo: true, bio: 'Toutes marques. Devis gratuit et sans engagement. Véhicule de prêt disponible.', services: [{ nom: 'Vidange + filtre', prix: 69 }, { nom: 'Diagnostic complet', prix: 49 }, { nom: 'Changement pneus (4)', prix: 120 }, { nom: 'Freins avant', prix: 180 }, { nom: 'Révision complète', prix: 250 }], horaires: 'Lun–Ven · 8h–18h · Sam 8h–12h', color: '#10B981', initials: 'GM' },
    { id: 2, nom: 'Express Auto', type: 'Pneus', ville: 'Toulouse Mirail', note: 4.5, avis: 123, dispo: true, bio: 'Spécialiste pneus et vidange express. Résultat en 1h sans rendez-vous.', services: [{ nom: 'Pneu été (l\'unité)', prix: 55 }, { nom: 'Pneu hiver (l\'unité)', prix: 65 }, { nom: 'Équilibrage', prix: 35 }, { nom: 'Vidange express', prix: 59 }], horaires: 'Lun–Sam · 8h30–19h', color: '#F97316', initials: 'EA' },
  ],
  commerce: [
    { id: 1, nom: 'Fleurs & Sens', type: 'Fleuriste', ville: 'Paris 15e', note: 4.9, avis: 87, dispo: true, bio: 'Bouquets sur mesure, livraison domicile en 2h. Compositions pour mariages et événements.', services: [{ nom: 'Bouquet surprise', prix: 35 }, { nom: 'Bouquet premium', prix: 65 }, { nom: 'Composition événement', prix: 120 }, { nom: 'Abonnement hebdo', prix: 45 }], horaires: 'Lun–Sam · 9h–19h30 · Dim 9h–13h', color: '#EC4899', initials: 'FS' },
    { id: 2, nom: 'Pressing Rapid', type: 'Pressing', ville: 'Paris 15e', note: 4.6, avis: 142, dispo: true, bio: 'Pressing écologique, express en 24h. Retouches sur place, cuir et daim acceptés.', services: [{ nom: 'Chemise', prix: 4.50 }, { nom: 'Costume', prix: 18 }, { nom: 'Robe de mariée', prix: 85 }, { nom: 'Express 4h', prix: 8 }], horaires: 'Lun–Sam · 8h–19h', color: '#6366F1', initials: 'PR' },
  ],
};

// ─── Créneaux horaires démo ───────────────────────────────────────────────────

function genCreneaux() {
  const slots = [];
  const hours = [9, 10, 11, 14, 15, 16, 17, 18];
  const today = new Date();
  for (let d = 0; d < 5; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d + (d === 0 && today.getHours() > 16 ? 1 : 0));
    const label = d === 0 ? "Aujourd'hui" : d === 1 ? 'Demain' : date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    slots.push({
      date: label,
      heures: hours.filter(() => Math.random() > 0.35).slice(0, 4 + Math.floor(Math.random() * 3)),
    });
  }
  return slots;
}

// ─── Modal réservation ────────────────────────────────────────────────────────

function ModalReservation({ pro, cfg, onClose }) {
  const [step, setStep] = useState(1); // 1: service, 2: créneau, 3: infos, 4: confirmé
  const [service, setService] = useState(null);
  const [creneau, setCreneau] = useState(null);
  const [creneaux] = useState(genCreneaux);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const confirmer = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.telephone) { setErr('Tous les champs sont requis.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErr('Email invalide.'); return; }
    setLoading(true); setErr('');
    try {
      await axios.post(`${API}/reservations`, { pro_id: pro.id, service: service.nom, prix: service.prix, creneau, ...form });
    } catch (_) { /* pas grave si pas encore dispo */ }
    setLoading(false);
    setStep(4);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#12121E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{pro.nom}</div>
            {step < 4 && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              Étape {step}/3 · {['', 'Choisissez un service', 'Choisissez un créneau', 'Vos coordonnées'][step]}
            </div>}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>×</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px 24px' }}>

          {/* Étape 1 : service */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pro.services.map(s => (
                <button key={s.nom} onClick={() => { setService(s); setStep(2); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all .15s', textAlign: 'left' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${cfg.color}18`; e.currentTarget.style.borderColor = `${cfg.color}44`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
                >
                  <span style={{ fontSize: '0.9375rem', color: '#fff', fontWeight: 500 }}>{s.nom}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: cfg.color }}>{typeof s.prix === 'number' && s.prix < 10 ? `${s.prix.toFixed(2)}€` : `${s.prix}€`}</span>
                </button>
              ))}
            </div>
          )}

          {/* Étape 2 : créneau */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, padding: '10px 14px', background: `${cfg.color}14`, border: `1px solid ${cfg.color}30`, borderRadius: 10 }}>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{service?.nom}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: 700, color: cfg.color }}>{service?.prix}€</span>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', letterSpacing: '-0.01em', padding: 0 }}>Changer</button>
              </div>
              {creneaux.map(jour => (
                <div key={jour.date} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'capitalize', letterSpacing: '-0.01em' }}>{jour.date}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {jour.heures.length === 0 ? <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>Complet</span> :
                      jour.heures.map(h => (
                        <button key={`${jour.date}-${h}`}
                          onClick={() => { setCreneau(`${jour.date} à ${h}h00`); setStep(3); }}
                          style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#fff', transition: 'all .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = cfg.color; e.currentTarget.style.borderColor = cfg.color; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                        >{h}h00</button>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Étape 3 : infos contact */}
          {step === 3 && (
            <div>
              {/* Récap */}
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, marginBottom: 20 }}>
                <div style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 600 }}>{service?.nom} · {service?.prix}€</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>📅 {creneau}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'prenom', label: 'Prénom', type: 'text', placeholder: 'Marie' },
                  { key: 'nom', label: 'Nom', type: 'text', placeholder: 'Dupont' },
                  { key: 'email', label: 'Email', type: 'email', placeholder: 'marie@email.com' },
                  { key: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '06 12 34 56 78' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 5, display: 'block', letterSpacing: '-0.01em' }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontSize: '0.9375rem', color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = cfg.color}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                ))}
              </div>
              {err && <div style={{ marginTop: 10, fontSize: '0.8125rem', color: '#F87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '8px 12px' }}>{err}</div>}
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 12, lineHeight: 1.5 }}>
                Aucun compte nécessaire. Vous recevrez une confirmation par email. Paiement sur place.
              </p>
              <button onClick={confirmer} disabled={loading}
                style={{ width: '100%', marginTop: 8, padding: '14px', background: loading ? 'rgba(255,255,255,0.1)' : cfg.grad, border: 'none', borderRadius: 12, cursor: loading ? 'default' : 'pointer', fontSize: '0.9375rem', fontWeight: 700, color: '#fff', transition: 'opacity .15s' }}>
                {loading ? 'Confirmation...' : 'Confirmer la réservation'}
              </button>
            </div>
          )}

          {/* Étape 4 : confirmé */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.03em' }}>Réservation confirmée !</div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 20 }}>
                <strong style={{ color: '#fff' }}>{service?.nom}</strong> chez <strong style={{ color: '#fff' }}>{pro.nom}</strong><br />
                📅 {creneau}<br /><br />
                Un email de confirmation a été envoyé à <strong style={{ color: cfg.color }}>{form.email}</strong>
              </div>
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, marginBottom: 20 }}>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>À régler sur place</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: cfg.color }}>{service?.prix}€</div>
              </div>
              <button onClick={onClose}
                style={{ padding: '12px 28px', background: cfg.grad, border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 700, color: '#fff' }}>
                Fermer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Carte professionnel ──────────────────────────────────────────────────────

function ProCard({ pro, cfg, onReserver }) {
  const [hov, setHov] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20, overflow: 'hidden',
        transition: 'all .2s ease',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? '0 12px 36px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      {/* Header card */}
      <div style={{ display: 'flex', gap: 14, padding: '18px 18px 14px', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${pro.color}, ${pro.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: `0 4px 16px ${pro.color}40` }}>
          {pro.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{pro.nom}</span>
            {pro.dispo
              ? <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10B981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '2px 8px' }}>Disponible</span>
              : <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '2px 8px' }}>Complet</span>
            }
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{pro.type} · {pro.ville}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{pro.note}</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>({pro.avis} avis)</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', margin: '0 2px' }}>·</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{pro.horaires}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={{ padding: '0 18px 12px', fontSize: '0.8375rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{pro.bio}</div>

      {/* Services preview */}
      <div style={{ padding: '0 18px 14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(expanded ? pro.services : pro.services.slice(0, 3)).map(s => (
            <div key={s.nom} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 10px', fontSize: '0.775rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>{s.nom}</span>
              <span style={{ fontWeight: 700, color: cfg.color }}>{typeof s.prix === 'number' && s.prix < 10 ? `${s.prix.toFixed(2)}€` : `${s.prix}€`}</span>
            </div>
          ))}
          {pro.services.length > 3 && !expanded && (
            <button onClick={() => setExpanded(true)} style={{ background: 'none', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8, padding: '5px 10px', fontSize: '0.775rem', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
              +{pro.services.length - 3} autres
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>À partir de </span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
            {typeof pro.services[0]?.prix === 'number' && pro.services[0]?.prix < 10
              ? `${pro.services[0].prix.toFixed(2)}€`
              : `${Math.min(...pro.services.map(s => s.prix))}€`}
          </span>
        </div>
        <button
          onClick={() => pro.dispo && onReserver(pro)}
          disabled={!pro.dispo}
          style={{
            background: pro.dispo ? cfg.grad : 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: 10, padding: '10px 20px',
            fontSize: '0.875rem', fontWeight: 700,
            color: pro.dispo ? '#fff' : 'rgba(255,255,255,0.3)',
            cursor: pro.dispo ? 'pointer' : 'default',
            boxShadow: pro.dispo ? `0 4px 14px ${cfg.color}40` : 'none',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { if (pro.dispo) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
        >
          {pro.dispo ? 'Réserver →' : 'Complet'}
        </button>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function SecteurLanding() {
  const { secteur } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filtre, setFiltre] = useState('Tous');
  const [proSelected, setProSelected] = useState(null);
  const [mounted, setMounted] = useState(false);

  const cfg = SECTEUR_CONFIG[secteur];
  const prosDemo = PROS_DEMO[secteur] || [];

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, [secteur]);

  if (!cfg) { navigate('/'); return null; }

  const prosFiltres = prosDemo.filter(p => {
    const matchQ = !query || p.nom.toLowerCase().includes(query.toLowerCase()) || p.services.some(s => s.nom.toLowerCase().includes(query.toLowerCase()));
    const matchF = filtre === 'Tous' || p.type === filtre;
    return matchQ && matchF;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#09090F', fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif", color: '#fff' }}>

      {/* Glow */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 80% 40% at 50% -5%, ${cfg.color}18 0%, transparent 55%)` }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Navbar ── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(20px,5vw,56px)', height: 58, background: 'rgba(9,9,15,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#5B5BD6,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(91,91,214,0.4)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill="rgba(255,255,255,0.65)"/></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.03em', color: '#fff' }}>Artisans<span style={{ background: 'linear-gradient(90deg,#A5A5FF,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}> Pro</span></span>
            </button>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              <span style={{ color: cfg.color, fontWeight: 600 }}>{cfg.emoji} {cfg.label}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontSize: '0.825rem', color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={e => { e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.7)'; }}
            >Connexion</button>
            <button onClick={() => navigate(`/register?secteur=${secteur}`)} style={{ background: cfg.grad, border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>
              Inscription
            </button>
          </div>
        </nav>

        {/* ── Hero search ── */}
        <div style={{ padding: 'clamp(36px,6vh,60px) clamp(20px,5vw,56px) clamp(28px,4vh,44px)', textAlign: 'center', opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'opacity .5s, transform .5s' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${cfg.color}14`, border: `1px solid ${cfg.color}30`, borderRadius: 24, padding: '4px 14px 4px 10px', marginBottom: 18 }}>
            <span style={{ fontSize: '1.125rem' }}>{cfg.emoji}</span>
            <span style={{ fontSize: '0.8rem', color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 900, letterSpacing: '-0.045em', margin: '0 0 24px', lineHeight: 1.1 }}>
            Les meilleurs <span style={{ background: cfg.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{cfg.label.toLowerCase()}</span><br />près de chez vous
          </h1>

          {/* Barre recherche */}
          <div style={{ display: 'flex', maxWidth: 520, margin: '0 auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder={cfg.placeholder}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#fff', fontFamily: 'inherit', padding: '13px 0' }} />
              {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '1rem', padding: 0 }}>×</button>}
            </div>
            <button style={{ background: cfg.grad, border: 'none', cursor: 'pointer', padding: '0 18px', fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>Chercher</button>
          </div>

          {/* Filtres type */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
            {cfg.filtres.map(f => (
              <button key={f} onClick={() => setFiltre(f)}
                style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${filtre === f ? cfg.color : 'rgba(255,255,255,0.1)'}`, background: filtre === f ? `${cfg.color}20` : 'rgba(255,255,255,0.04)', color: filtre === f ? cfg.color : 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', fontWeight: filtre === f ? 600 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Liste professionnels ── */}
        <div style={{ padding: '0 clamp(20px,5vw,56px) clamp(48px,7vh,72px)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.01em' }}>
              {prosFiltres.length} professionnel{prosFiltres.length !== 1 ? 's' : ''} trouvé{prosFiltres.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.25)' }}>Tri : disponibilité + note</span>
          </div>

          {prosFiltres.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>Aucun résultat</div>
              <div style={{ fontSize: '0.875rem' }}>Essayez un autre mot-clé ou retirez les filtres</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {[...prosFiltres].sort((a, b) => (b.dispo ? 1 : 0) - (a.dispo ? 1 : 0) || b.note - a.note).map(pro => (
                <ProCard key={pro.id} pro={pro} cfg={cfg} onReserver={setProSelected} />
              ))}
            </div>
          )}

          {/* CTA professionnel */}
          <div style={{ marginTop: 48, padding: '28px 24px', background: `${cfg.color}0D`, border: `1px solid ${cfg.color}25`, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', marginBottom: 4 }}>Vous êtes {cfg.emoji} {cfg.label.split(' ')[0].toLowerCase()} ?</div>
              <div style={{ fontSize: '0.8375rem', color: 'rgba(255,255,255,0.4)' }}>Rejoignez la plateforme et recevez des réservations dès aujourd'hui.</div>
            </div>
            <button onClick={() => navigate(`/register?secteur=${secteur}&role=patron`)}
              style={{ flexShrink: 0, background: cfg.grad, border: 'none', cursor: 'pointer', padding: '11px 22px', borderRadius: 11, fontSize: '0.875rem', fontWeight: 700, color: '#fff', boxShadow: `0 4px 16px ${cfg.color}35` }}>
              Créer mon profil pro →
            </button>
          </div>
        </div>

      </div>

      {/* Modal réservation */}
      {proSelected && <ModalReservation pro={proSelected} cfg={cfg} onClose={() => setProSelected(null)} />}

      <style>{`input::placeholder{color:rgba(255,255,255,0.28);}`}</style>
    </div>
  );
}
