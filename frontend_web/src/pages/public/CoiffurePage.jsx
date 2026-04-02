import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Données démo ─────────────────────────────────────────────────────────────

const SALONS = [
  {
    id: 1, nom: 'Salon Léa', type: 'Salon mixte', ville: 'Paris 11e', adresse: '24 rue de la Roquette, 75011 Paris',
    note: 4.9, avis: 142, distance: '0.3 km', dispo_today: true,
    bio: 'Spécialiste couleur et balayage depuis 12 ans. Produits bio Davines. Résultats naturels garantis.',
    horaires: [
      { jour: 'Lun', h: 'Fermé' }, { jour: 'Mar', h: '9h–19h' }, { jour: 'Mer', h: '9h–19h' },
      { jour: 'Jeu', h: '9h–20h' }, { jour: 'Ven', h: '9h–20h' }, { jour: 'Sam', h: '9h–18h' }, { jour: 'Dim', h: 'Fermé' },
    ],
    color1: '#EC4899', color2: '#A855F7',
    staff: [
      { id: 1, nom: 'Léa', metier: 'Coloriste', initials: 'LÉ', color: '#EC4899' },
      { id: 2, nom: 'Sofia', metier: 'Coiffeuse', initials: 'SO', color: '#A855F7' },
      { id: 3, nom: 'Jade', metier: 'Coiffeuse', initials: 'JA', color: '#F97316' },
    ],
    services: [
      { cat: 'Coupes femme', items: [{ nom: 'Coupe + brushing', prix: 65, duree: 60 }, { nom: 'Coupe sans brushing', prix: 45, duree: 45 }, { nom: 'Brushing seul', prix: 30, duree: 30 }] },
      { cat: 'Coupes homme', items: [{ nom: 'Coupe homme', prix: 28, duree: 30 }, { nom: 'Coupe + barbe', prix: 40, duree: 45 }] },
      { cat: 'Couleur & Balayage', items: [{ nom: 'Couleur racines', prix: 75, duree: 90 }, { nom: 'Balayage', prix: 110, duree: 120 }, { nom: 'Mèches complètes', prix: 130, duree: 150 }, { nom: 'Couleur complète', prix: 90, duree: 100 }] },
      { cat: 'Soins & Traitements', items: [{ nom: 'Soin profond Davines', prix: 35, duree: 30 }, { nom: 'Lissage brésilien', prix: 200, duree: 180 }] },
    ],
    tags: ['Coloriste', 'Balayage', 'Bio', 'Mixte'],
  },
  {
    id: 2, nom: 'Barbershop Alex', type: 'Barbier', ville: 'Paris 3e', adresse: '8 rue de Bretagne, 75003 Paris',
    note: 5.0, avis: 67, distance: '0.8 km', dispo_today: true,
    bio: 'Barbier traditionnel au rasoir droit. Ambiance détendue, whisky offert. Résultat garanti ou refait.',
    horaires: [
      { jour: 'Lun', h: '10h–19h' }, { jour: 'Mar', h: '10h–19h' }, { jour: 'Mer', h: '10h–19h' },
      { jour: 'Jeu', h: '10h–20h' }, { jour: 'Ven', h: '10h–20h' }, { jour: 'Sam', h: '9h–18h' }, { jour: 'Dim', h: 'Fermé' },
    ],
    color1: '#6366F1', color2: '#3B82F6',
    staff: [
      { id: 1, nom: 'Alex', metier: 'Barbier', initials: 'AL', color: '#6366F1' },
      { id: 2, nom: 'Mehdi', metier: 'Barbier', initials: 'ME', color: '#3B82F6' },
    ],
    services: [
      { cat: 'Coupe', items: [{ nom: 'Coupe homme', prix: 22, duree: 25 }, { nom: 'Coupe enfant (–12 ans)', prix: 16, duree: 20 }, { nom: 'Coupe dégradé', prix: 25, duree: 30 }] },
      { cat: 'Barbe', items: [{ nom: 'Taille de barbe', prix: 18, duree: 20 }, { nom: 'Rasage au rasoir droit', prix: 22, duree: 30 }, { nom: 'Barbe + contour', prix: 24, duree: 25 }] },
      { cat: 'Formules', items: [{ nom: 'Coupe + barbe', prix: 35, duree: 50 }, { nom: 'Coupe + barbe + soin', prix: 45, duree: 60 }] },
    ],
    tags: ['Barbier', 'Rasoir droit', 'Dégradé', 'Barbe'],
  },
  {
    id: 3, nom: 'Studio Inès', type: 'Salon femme', ville: 'Paris 18e', adresse: '52 rue Lepic, 75018 Paris',
    note: 4.7, avis: 89, distance: '1.4 km', dispo_today: true,
    bio: 'Spécialiste des cheveux bouclés et crépus. Kératine, lissage brésilien, soins ultra-hydratants.',
    horaires: [
      { jour: 'Lun', h: 'Fermé' }, { jour: 'Mar', h: '10h–19h' }, { jour: 'Mer', h: '10h–19h' },
      { jour: 'Jeu', h: '10h–20h' }, { jour: 'Ven', h: '10h–20h' }, { jour: 'Sam', h: '9h–18h' }, { jour: 'Dim', h: '10h–15h' },
    ],
    color1: '#A855F7', color2: '#EC4899',
    staff: [
      { id: 1, nom: 'Inès', metier: 'Spécialiste bouclés', initials: 'IN', color: '#A855F7' },
      { id: 2, nom: 'Naomi', metier: 'Coloriste', initials: 'NA', color: '#EC4899' },
    ],
    services: [
      { cat: 'Coupes', items: [{ nom: 'Coupe femme', prix: 42, duree: 45 }, { nom: 'Coupe bouclée', prix: 55, duree: 60 }] },
      { cat: 'Lissage & Kératine', items: [{ nom: 'Lissage brésilien', prix: 190, duree: 180 }, { nom: 'Kératine express', prix: 140, duree: 120 }, { nom: 'Défrisage', prix: 95, duree: 90 }] },
      { cat: 'Couleur', items: [{ nom: 'Balayage', prix: 95, duree: 120 }, { nom: 'Ombré hair', prix: 110, duree: 130 }] },
      { cat: 'Soins', items: [{ nom: 'Soin kératine', prix: 40, duree: 40 }, { nom: 'Masque hydratant intense', prix: 28, duree: 30 }] },
    ],
    tags: ['Bouclés', 'Kératine', 'Lissage', 'Soins'],
  },
  {
    id: 4, nom: 'Coiff\'Express Bastille', type: 'Salon mixte', ville: 'Paris 12e', adresse: '3 rue de la Bastille, 75012 Paris',
    note: 4.5, avis: 312, distance: '0.5 km', dispo_today: false,
    bio: 'Salon sans rendez-vous disponible, coiffure rapide et abordable. Ouvert 7j/7.',
    horaires: [{ jour: 'Lun', h: '9h–20h' }, { jour: 'Mar', h: '9h–20h' }, { jour: 'Mer', h: '9h–20h' }, { jour: 'Jeu', h: '9h–20h' }, { jour: 'Ven', h: '9h–20h' }, { jour: 'Sam', h: '9h–20h' }, { jour: 'Dim', h: '10h–18h' }],
    color1: '#F59E0B', color2: '#EF4444',
    staff: [
      { id: 1, nom: 'Équipe', metier: 'Plusieurs coiffeurs', initials: '+3', color: '#F59E0B' },
    ],
    services: [
      { cat: 'Coupes', items: [{ nom: 'Coupe femme courte', prix: 28, duree: 30 }, { nom: 'Coupe femme longue', prix: 35, duree: 40 }, { nom: 'Coupe homme', prix: 18, duree: 20 }, { nom: 'Coupe enfant', prix: 14, duree: 15 }] },
      { cat: 'Brushing & Coiffage', items: [{ nom: 'Brushing', prix: 22, duree: 30 }, { nom: 'Coiffage mariage', prix: 65, duree: 60 }] },
    ],
    tags: ['Sans RDV', 'Rapide', 'Abordable', '7j/7'],
  },
  {
    id: 5, nom: 'Atelier Beauté Passy', type: 'Institut', ville: 'Paris 16e', adresse: '18 rue de Passy, 75016 Paris',
    note: 4.8, avis: 54, distance: '2.1 km', dispo_today: true,
    bio: 'Coiffure + onglerie + soins du visage. Prenez soin de vous en une seule visite.',
    horaires: [{ jour: 'Lun', h: 'Fermé' }, { jour: 'Mar', h: '9h30–18h30' }, { jour: 'Mer', h: '9h30–18h30' }, { jour: 'Jeu', h: '9h30–19h' }, { jour: 'Ven', h: '9h30–19h' }, { jour: 'Sam', h: '9h–17h' }, { jour: 'Dim', h: 'Fermé' }],
    color1: '#10B981', color2: '#0891B2',
    staff: [
      { id: 1, nom: 'Claire', metier: 'Coiffeuse & Esthéticienne', initials: 'CL', color: '#10B981' },
      { id: 2, nom: 'Eva', metier: 'Prothésiste ongulaire', initials: 'EV', color: '#0891B2' },
    ],
    services: [
      { cat: 'Coiffure', items: [{ nom: 'Coupe + soin', prix: 72, duree: 60 }, { nom: 'Brushing', prix: 32, duree: 30 }] },
      { cat: 'Onglerie', items: [{ nom: 'Manucure', prix: 42, duree: 45 }, { nom: 'Pose résine', prix: 65, duree: 90 }, { nom: 'Gel couleur', prix: 55, duree: 75 }] },
      { cat: 'Soins visage', items: [{ nom: 'Soin éclat', prix: 68, duree: 60 }, { nom: 'Épilation sourcils', prix: 12, duree: 15 }] },
    ],
    tags: ['Institut', 'Onglerie', 'Soins', 'Mixte'],
  },
  {
    id: 6, nom: 'Le Barbier du Marais', type: 'Barbier', ville: 'Paris 4e', adresse: '15 rue des Archives, 75004 Paris',
    note: 4.9, avis: 118, distance: '1.0 km', dispo_today: true,
    bio: 'Barbier de quartier depuis 8 ans. Coupe classique, dégradé américain, barbe soignée.',
    horaires: [{ jour: 'Lun', h: 'Fermé' }, { jour: 'Mar', h: '10h–19h' }, { jour: 'Mer', h: '10h–19h' }, { jour: 'Jeu', h: '10h–20h' }, { jour: 'Ven', h: '10h–20h' }, { jour: 'Sam', h: '9h30–18h' }, { jour: 'Dim', h: '10h–16h' }],
    color1: '#EF4444', color2: '#DC2626',
    staff: [
      { id: 1, nom: 'Karim', metier: 'Barbier', initials: 'KA', color: '#EF4444' },
      { id: 2, nom: 'Lucas', metier: 'Barbier', initials: 'LU', color: '#DC2626' },
    ],
    services: [
      { cat: 'Coupe', items: [{ nom: 'Coupe classique', prix: 25, duree: 30 }, { nom: 'Dégradé américain', prix: 28, duree: 35 }, { nom: 'Coupe texturée', prix: 30, duree: 35 }] },
      { cat: 'Barbe', items: [{ nom: 'Taille barbe', prix: 18, duree: 20 }, { nom: 'Barbe complète', prix: 22, duree: 25 }] },
      { cat: 'Formules', items: [{ nom: 'Coupe + barbe', prix: 38, duree: 50 }, { nom: 'Formule complète', prix: 48, duree: 65 }] },
    ],
    tags: ['Barbier', 'Dégradé', 'Classique', 'Marais'],
  },
];

const TYPES = ['Tous', 'Salon mixte', 'Salon femme', 'Barbier', 'Institut'];
const NOTES_MIN = [{ v: 0, l: 'Toutes notes' }, { v: 4, l: '4+ ⭐' }, { v: 4.5, l: '4,5+ ⭐' }, { v: 4.8, l: '4,8+ ⭐' }];

// ─── Génération créneaux ──────────────────────────────────────────────────────

function genCreneaux(salonId) {
  const today = new Date();
  const days = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const isMonday = date.getDay() === 1;
    if (isMonday) continue;
    const slots = [9, 10, 11, 14, 15, 16, 17, 18].map(h => ({
      h,
      avail: Math.random() > 0.4,
    })).filter(s => s.avail);
    const label = d === 0 ? "Auj." : d === 1 ? 'Dem.' : date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    days.push({ label, date: date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }), slots });
  }
  return days;
}

// ─── Widget de réservation ────────────────────────────────────────────────────

function BookingWidget({ salon, onClose }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState(null);
  const [creneaux] = useState(() => genCreneaux(salon.id));
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState(null);
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', tel: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const confirmer = async () => {
    if (!form.prenom || !form.nom || !form.email || !form.tel) { setErr('Tous les champs sont obligatoires.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErr('Email invalide.'); return; }
    setLoading(true); setErr('');
    try {
      await axios.post(`${API}/reservations`, {
        pro_id: salon.id, secteur: 'coiffure',
        service: service.nom, prix: service.prix,
        creneau: `${creneaux[dayIdx].date} à ${slot}h00`,
        staff: staff?.nom || 'Au choix',
        ...form, nom: form.nom, prenom: form.prenom,
        telephone: form.tel,
      });
    } catch (_) {}
    setLoading(false);
    setDone(true);
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '32px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.03em' }}>Réservation confirmée !</div>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '16px 20px', marginBottom: 16, textAlign: 'left' }}>
        <div style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 700, marginBottom: 6 }}>{service.nom}</div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          💇 {staff ? staff.nom : 'Premier coiffeur disponible'}<br />
          📅 {creneaux[dayIdx].date} à {slot}h00<br />
          📍 {salon.adresse}
        </div>
        <div style={{ marginTop: 10, fontSize: '1rem', fontWeight: 800, color: salon.color1 }}>{service.prix} €</div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>À régler sur place · Annulation gratuite jusqu'à 2h avant</div>
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
        Confirmation envoyée à <span style={{ color: salon.color1 }}>{form.email}</span>
      </div>
      <button onClick={onClose} style={{ padding: '12px 28px', background: `linear-gradient(135deg,${salon.color1},${salon.color2})`, border: 'none', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Fermer</button>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Progress */}
      <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {['Service', 'Coiffeur', 'Créneau', 'Contact'].map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ height: 3, width: '100%', borderRadius: 2, background: i < step ? `linear-gradient(90deg,${salon.color1},${salon.color2})` : 'rgba(255,255,255,0.1)', transition: 'all .3s' }} />
              <span style={{ fontSize: '0.65rem', color: i < step ? salon.color1 : 'rgba(255,255,255,0.3)', fontWeight: i + 1 === step ? 700 : 400 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 20px' }}>

        {/* Étape 1 : service */}
        {step === 1 && (
          <div>
            {salon.services.map(cat => (
              <div key={cat.cat} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 8 }}>{cat.cat}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {cat.items.map(item => (
                    <button key={item.nom} onClick={() => { setService(item); setStep(2); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'all .15s', textAlign: 'left', gap: 8 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = salon.color1 + '55'; e.currentTarget.style.background = salon.color1 + '12'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 500 }}>{item.nom}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{item.duree} min</div>
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: salon.color1, flexShrink: 0 }}>{item.prix} €</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Étape 2 : coiffeur */}
        {step === 2 && (
          <div>
            <div style={{ background: `${salon.color1}14`, border: `1px solid ${salon.color1}30`, borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 600 }}>{service?.nom}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{service?.duree} min</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: salon.color1 }}>{service?.prix} €</span>
                <button onClick={() => { setService(null); setStep(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>✕</button>
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Choisissez votre coiffeur</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Option "peu importe" */}
              <button onClick={() => { setStaff(null); setStep(3); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: !staff ? `${salon.color1}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${!staff ? salon.color1 + '44' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = salon.color1 + '14'; e.currentTarget.style.borderColor = salon.color1 + '44'; }}
                onMouseLeave={e => { e.currentTarget.style.background = !staff ? `${salon.color1}18` : 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = !staff ? salon.color1 + '44' : 'rgba(255,255,255,0.08)'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎲</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>Premier disponible</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Plus de disponibilités</div>
                </div>
              </button>
              {salon.staff.map(s => (
                <button key={s.id} onClick={() => { setStaff(s); setStep(3); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = s.color + '14'; e.currentTarget.style.borderColor = s.color + '44'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${s.color},${s.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{s.initials}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{s.nom}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{s.metier}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 3 : créneau */}
        {step === 3 && (
          <div>
            {/* Récap */}
            <div style={{ background: `${salon.color1}10`, border: `1px solid ${salon.color1}25`, borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
              <div style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 600 }}>{service?.nom} · {service?.prix} €</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                💇 {staff ? staff.nom : 'Premier disponible'} · {service?.duree} min
              </div>
            </div>

            {/* Sélection jour */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
              {creneaux.map((day, i) => (
                <button key={i} onClick={() => setDayIdx(i)}
                  style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, border: `1px solid ${i === dayIdx ? salon.color1 : 'rgba(255,255,255,0.1)'}`, background: i === dayIdx ? `${salon.color1}22` : 'rgba(255,255,255,0.04)', color: i === dayIdx ? salon.color1 : 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: i === dayIdx ? 700 : 400, cursor: 'pointer', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                  {day.label}
                </button>
              ))}
            </div>

            {/* Créneaux horaires */}
            {creneaux[dayIdx]?.slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Pas de disponibilité ce jour</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {creneaux[dayIdx]?.slots.map(s => (
                  <button key={s.h} onClick={() => { setSlot(s.h); setStep(4); }}
                    style={{ padding: '10px 0', borderRadius: 10, border: `1px solid ${slot === s.h ? salon.color1 : 'rgba(255,255,255,0.12)'}`, background: slot === s.h ? `linear-gradient(135deg,${salon.color1},${salon.color2})` : 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { if (slot !== s.h) { e.currentTarget.style.background = salon.color1 + '20'; e.currentTarget.style.borderColor = salon.color1; } }}
                    onMouseLeave={e => { if (slot !== s.h) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; } }}
                  >{s.h}:00</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Étape 4 : contact */}
        {step === 4 && (
          <div>
            <div style={{ background: `${salon.color1}10`, border: `1px solid ${salon.color1}25`, borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 700 }}>{service?.nom}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: 4, lineHeight: 1.6 }}>
                💇 {staff ? staff.nom : 'Premier disponible'}<br />
                📅 {creneaux[dayIdx]?.date} à {slot}h00
              </div>
              <div style={{ marginTop: 6, fontSize: '1rem', fontWeight: 800, color: salon.color1 }}>{service?.prix} €</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ k: 'prenom', l: 'Prénom', p: 'Marie' }, { k: 'nom', l: 'Nom', p: 'Dupont' }].map(f => (
                  <div key={f.k} style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 5 }}>{f.l}</label>
                    <input type="text" value={form[f.k]} onChange={e => setForm(x => ({ ...x, [f.k]: e.target.value }))} placeholder={f.p}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '10px 12px', fontSize: '0.875rem', color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = salon.color1}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                ))}
              </div>
              {[{ k: 'email', l: 'Email', p: 'marie@email.com', t: 'email' }, { k: 'tel', l: 'Téléphone', p: '06 12 34 56 78', t: 'tel' }].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 5 }}>{f.l}</label>
                  <input type={f.t} value={form[f.k]} onChange={e => setForm(x => ({ ...x, [f.k]: e.target.value }))} placeholder={f.p}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '10px 12px', fontSize: '0.875rem', color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = salon.color1}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              ))}
            </div>

            {err && <div style={{ padding: '9px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: '0.8rem', color: '#FCA5A5', marginBottom: 12 }}>{err}</div>}

            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.5, margin: '0 0 14px' }}>
              Sans compte · Paiement sur place · Annulation gratuite jusqu'à 2h avant
            </p>

            <button onClick={confirmer} disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg,${salon.color1},${salon.color2})`, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.9375rem', color: '#fff', cursor: loading ? 'default' : 'pointer', boxShadow: loading ? 'none' : `0 6px 20px ${salon.color1}40`, transition: 'all .15s', letterSpacing: '-0.01em' }}>
              {loading ? 'Confirmation en cours...' : `Confirmer · ${service?.prix} €`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Panneau détail salon ─────────────────────────────────────────────────────

function SalonDetail({ salon, onClose, onBook }) {
  const [tab, setTab] = useState('services');
  const jour = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const horaire = salon.horaires.find(h => h.jour.toLowerCase() === jour.slice(0, 3).toLowerCase());

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0E0E1A', overflow: 'hidden' }}>

      {/* Cover */}
      <div style={{ height: 160, background: `linear-gradient(135deg, ${salon.color1}33, ${salon.color2}22)`, position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${salon.color1}, ${salon.color2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900, color: '#fff', boxShadow: `0 8px 32px ${salon.color1}60` }}>
          {salon.nom.slice(0, 2).toUpperCase()}
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      </div>

      {/* Infos principales */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.025em' }}>{salon.nom}</h2>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{salon.type} · {salon.adresse}</div>
          </div>
          {salon.dispo_today && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '3px 10px', flexShrink: 0, marginLeft: 8 }}>Disponible aujourd'hui</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(salon.note) ? '#F59E0B' : 'rgba(255,255,255,0.15)'} stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginLeft: 4 }}>{salon.note}</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>({salon.avis} avis)</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>·</span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{salon.distance}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {salon.tags.map(t => <span key={t} style={{ fontSize: '0.72rem', color: salon.color1, background: `${salon.color1}14`, border: `1px solid ${salon.color1}30`, borderRadius: 20, padding: '2px 9px', fontWeight: 600 }}>{t}</span>)}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        {[{ id: 'services', l: 'Services' }, { id: 'equipe', l: 'L\'équipe' }, { id: 'horaires', l: 'Horaires' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? salon.color1 : 'rgba(255,255,255,0.4)', borderBottom: `2px solid ${tab === t.id ? salon.color1 : 'transparent'}`, transition: 'all .15s', marginBottom: -1 }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Contenu onglets */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 20px' }}>

        {tab === 'services' && (
          <div>
            {salon.services.map(cat => (
              <div key={cat.cat} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>{cat.cat}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {cat.items.map(item => (
                    <div key={item.nom} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#fff' }}>{item.nom}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{item.duree} min</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: salon.color1 }}>{item.prix} €</span>
                        <button onClick={() => onBook(item)} style={{ background: `linear-gradient(135deg,${salon.color1},${salon.color2})`, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Réserver</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'equipe' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {salon.staff.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${s.color},${s.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.875rem', flexShrink: 0 }}>{s.initials}</div>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff' }}>{s.nom}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.metier}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'horaires' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {salon.horaires.map(h => {
              const isToday = h.jour.toLowerCase() === jour.slice(0, 3).toLowerCase();
              return (
                <div key={h.jour} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: isToday ? `${salon.color1}10` : 'rgba(255,255,255,0.02)', border: `1px solid ${isToday ? salon.color1 + '30' : 'rgba(255,255,255,0.06)'}`, borderRadius: 9 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: isToday ? 700 : 400, color: isToday ? '#fff' : 'rgba(255,255,255,0.5)' }}>{h.jour}{isToday && <span style={{ fontSize: '0.7rem', color: salon.color1, marginLeft: 6 }}>· Aujourd'hui</span>}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: isToday ? 700 : 400, color: h.h === 'Fermé' ? 'rgba(255,255,255,0.25)' : (isToday ? salon.color1 : 'rgba(255,255,255,0.6)') }}>{h.h}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bouton RDV principal */}
      <div style={{ padding: '12px 20px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <button onClick={() => onBook(null)}
          style={{ width: '100%', padding: '14px', background: salon.dispo_today ? `linear-gradient(135deg,${salon.color1},${salon.color2})` : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '1rem', color: salon.dispo_today ? '#fff' : 'rgba(255,255,255,0.35)', cursor: salon.dispo_today ? 'pointer' : 'default', boxShadow: salon.dispo_today ? `0 6px 20px ${salon.color1}40` : 'none', letterSpacing: '-0.01em' }}>
          {salon.dispo_today ? 'Prendre rendez-vous →' : 'Complet · Indisponible aujourd\'hui'}
        </button>
      </div>
    </div>
  );
}

// ─── Carte salon (liste) ──────────────────────────────────────────────────────

function SalonCard({ salon, selected, onClick }) {
  const [hov, setHov] = useState(false);
  const active = selected || hov;
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', gap: 0, background: selected ? 'rgba(255,255,255,0.07)' : (hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)'), border: `1px solid ${selected ? 'rgba(255,255,255,0.2)' : (hov ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)')}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }}>
      {/* Couleur latérale */}
      <div style={{ width: 4, background: active ? `linear-gradient(180deg,${salon.color1},${salon.color2})` : 'transparent', flexShrink: 0, transition: 'all .2s' }} />
      <div style={{ flex: 1, padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${salon.color1},${salon.color2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.875rem', flexShrink: 0, boxShadow: active ? `0 4px 16px ${salon.color1}50` : 'none', transition: 'all .2s' }}>
            {salon.nom.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{salon.nom}</span>
              {salon.dispo_today && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '2px 7px' }}>Disponible</span>}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{salon.type} · {salon.ville}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{salon.note}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>({salon.avis})</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{salon.distance}</span>
            </div>
          </div>
        </div>
        {/* Services preview */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
          {salon.services[0]?.items.slice(0, 3).map(s => (
            <span key={s.nom} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '2px 8px' }}>
              {s.nom} <span style={{ color: salon.color1, fontWeight: 700 }}>{s.prix}€</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function CoiffurePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [ville, setVille] = useState(searchParams.get('ou') || 'Paris');
  const [filtre, setFiltre] = useState('Tous');
  const [noteMin, setNoteMin] = useState(0);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [bookingService, setBookingService] = useState(undefined); // undefined = pas ouvert, null = ouvert sans preselection
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const salons = SALONS.filter(s => {
    const mq = !query || s.nom.toLowerCase().includes(query.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) || s.services.some(c => c.items.some(i => i.nom.toLowerCase().includes(query.toLowerCase())));
    const mf = filtre === 'Tous' || s.type === filtre;
    const mn = s.note >= noteMin;
    return mq && mf && mn;
  }).sort((a, b) => (b.dispo_today ? 1 : 0) - (a.dispo_today ? 1 : 0) || b.note - a.note);

  const handleBook = (service) => {
    setBookingService(service); // null = pas de service preselectionné, sinon service
  };

  const isBookingOpen = bookingService !== undefined;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#09090F', fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif", color: '#fff', overflow: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 clamp(16px,3vw,32px)', height: 56, borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(9,9,15,0.95)', backdropFilter: 'blur(16px)', flexShrink: 0, zIndex: 100 }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#5B5BD6,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill="rgba(255,255,255,0.65)"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.875rem', letterSpacing: '-0.03em', color: '#fff' }}>Artisans<span style={{ background: 'linear-gradient(90deg,#A5A5FF,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}> Pro</span></span>
        </button>

        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style={{ fontSize: '0.8rem', color: '#EC4899', fontWeight: 600 }}>✂️ Coiffure & Beauté</span>

        {/* Barre de recherche inline */}
        <div style={{ flex: 1, display: 'flex', gap: 8, maxWidth: 560, margin: '0 auto' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '0 12px', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Coupe, balayage, barbier..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.8375rem', color: '#fff', fontFamily: 'inherit', padding: '7px 0' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '0 12px', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Paris" style={{ width: 90, background: 'none', border: 'none', outline: 'none', fontSize: '0.8375rem', color: '#fff', fontFamily: 'inherit', padding: '7px 0' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Connexion</button>
          <button onClick={() => navigate('/register?secteur=coiffure')} style={{ background: 'linear-gradient(135deg,#EC4899,#A855F7)', border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>Inscription</button>
        </div>
      </nav>

      {/* ── Filtres ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px clamp(16px,3vw,32px)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, flexWrap: 'wrap', background: 'rgba(9,9,15,0.8)' }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600, marginRight: 4 }}>Type</span>
        {TYPES.map(t => (
          <button key={t} onClick={() => setFiltre(t)}
            style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${filtre === t ? '#EC4899' : 'rgba(255,255,255,0.1)'}`, background: filtre === t ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)', color: filtre === t ? '#EC4899' : 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontWeight: filtre === t ? 600 : 400, cursor: 'pointer', transition: 'all .15s' }}>
            {t}
          </button>
        ))}
        <div style={{ marginLeft: 12, display: 'flex', gap: 6 }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600, alignSelf: 'center' }}>Note</span>
          {NOTES_MIN.map(n => (
            <button key={n.v} onClick={() => setNoteMin(n.v)}
              style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${noteMin === n.v ? '#EC4899' : 'rgba(255,255,255,0.1)'}`, background: noteMin === n.v ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)', color: noteMin === n.v ? '#EC4899' : 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontWeight: noteMin === n.v ? 600 : 400, cursor: 'pointer', transition: 'all .15s' }}>
              {n.l}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>{salons.length} salon{salons.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Layout principal ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', opacity: mounted ? 1 : 0, transition: 'opacity .4s' }}>

        {/* ── Colonne gauche : liste ── */}
        <div style={{ width: selectedSalon ? '40%' : '50%', minWidth: 300, flexShrink: 0, overflowY: 'auto', padding: 'clamp(12px,2vw,20px)', display: 'flex', flexDirection: 'column', gap: 10, transition: 'width .3s ease', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {salons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>✂️</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Aucun salon trouvé</div>
              <button onClick={() => { setQuery(''); setFiltre('Tous'); setNoteMin(0); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '7px 16px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.8rem', marginTop: 8 }}>Réinitialiser les filtres</button>
            </div>
          ) : (
            salons.map(salon => (
              <SalonCard key={salon.id} salon={salon} selected={selectedSalon?.id === salon.id} onClick={() => setSelectedSalon(selectedSalon?.id === salon.id ? null : salon)} />
            ))
          )}
        </div>

        {/* ── Colonne droite : détail ou carte ── */}
        <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all .3s ease' }}>
          {selectedSalon && !isBookingOpen ? (
            <SalonDetail key={selectedSalon.id} salon={selectedSalon} onClose={() => setSelectedSalon(null)} onBook={handleBook} />
          ) : selectedSalon && isBookingOpen ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button onClick={() => setBookingService(undefined)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Retour
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Réserver chez {selectedSalon.nom}</span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <BookingWidget salon={selectedSalon} initialService={bookingService} onClose={() => { setBookingService(undefined); setSelectedSalon(null); }} />
              </div>
            </div>
          ) : (
            /* État vide — invite à choisir un salon */
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 32 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>✂️</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Sélectionnez un salon</div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>Cliquez sur un salon dans la liste<br />pour voir ses services et disponibilités</div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Coupe femme', 'Balayage', 'Barbier', 'Kératine'].map(q => (
                  <button key={q} onClick={() => setQuery(q)} style={{ padding: '7px 16px', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 20, fontSize: '0.8rem', color: '#EC4899', cursor: 'pointer', fontWeight: 600 }}>{q}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`input::placeholder{color:rgba(255,255,255,0.28);} ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}`}</style>
    </div>
  );
}
