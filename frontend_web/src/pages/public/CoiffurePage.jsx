import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#FAFAFA',
  white: '#FFFFFF',
  ink: '#0A0A0A',
  muted: '#6B6B6B',
  border: '#E8E8E8',
  accent: '#0A0A0A',
  gold: '#B8A876',
};

// ─── Données démo ─────────────────────────────────────────────────────────────

const SALONS = [
  {
    id: 1, nom: 'Salon Léa', type: 'Coiffeur', ville: 'Paris 11e', adresse: '24 rue de la Roquette, 75011 Paris',
    note: 4.9, avis: 142, distance: '0.3 km', dispo_today: true,
    bio: 'Spécialiste couleur et balayage depuis 12 ans. Produits Davines certifiés bio. Résultats naturels garantis.',
    horaires: [
      { jour: 'Lun', h: 'Fermé' }, { jour: 'Mar', h: '9h – 19h' }, { jour: 'Mer', h: '9h – 19h' },
      { jour: 'Jeu', h: '9h – 20h' }, { jour: 'Ven', h: '9h – 20h' }, { jour: 'Sam', h: '9h – 18h' }, { jour: 'Dim', h: 'Fermé' },
    ],
    staff: [
      { id: 1, nom: 'Léa', metier: 'Coloriste', initials: 'LÉ' },
      { id: 2, nom: 'Sofia', metier: 'Coiffeuse', initials: 'SO' },
      { id: 3, nom: 'Jade', metier: 'Coiffeuse', initials: 'JA' },
    ],
    services: [
      { cat: 'Coupes femme', items: [{ nom: 'Coupe + brushing', prix: 65, duree: 60 }, { nom: 'Coupe sans brushing', prix: 45, duree: 45 }, { nom: 'Brushing seul', prix: 30, duree: 30 }] },
      { cat: 'Couleur & Balayage', items: [{ nom: 'Couleur racines', prix: 75, duree: 90 }, { nom: 'Balayage', prix: 110, duree: 120 }, { nom: 'Mèches complètes', prix: 130, duree: 150 }] },
      { cat: 'Soins', items: [{ nom: 'Soin profond Davines', prix: 35, duree: 30 }, { nom: 'Lissage brésilien', prix: 200, duree: 180 }] },
    ],
    tags: ['Coloriste', 'Balayage', 'Bio'],
  },
  {
    id: 2, nom: 'Barbershop Alex', type: 'Barbier', ville: 'Paris 3e', adresse: '8 rue de Bretagne, 75003 Paris',
    note: 5.0, avis: 67, distance: '0.8 km', dispo_today: true,
    bio: 'Barbier traditionnel au rasoir droit. Ambiance raffinée, soin premium. Résultat garanti ou refait.',
    horaires: [
      { jour: 'Lun', h: '10h – 19h' }, { jour: 'Mar', h: '10h – 19h' }, { jour: 'Mer', h: '10h – 19h' },
      { jour: 'Jeu', h: '10h – 20h' }, { jour: 'Ven', h: '10h – 20h' }, { jour: 'Sam', h: '9h – 18h' }, { jour: 'Dim', h: 'Fermé' },
    ],
    staff: [
      { id: 1, nom: 'Alex', metier: 'Barbier', initials: 'AL' },
      { id: 2, nom: 'Mehdi', metier: 'Barbier', initials: 'ME' },
    ],
    services: [
      { cat: 'Coupe', items: [{ nom: 'Coupe homme', prix: 22, duree: 25 }, { nom: 'Coupe dégradé', prix: 25, duree: 30 }] },
      { cat: 'Barbe', items: [{ nom: 'Taille de barbe', prix: 18, duree: 20 }, { nom: 'Rasage au rasoir droit', prix: 22, duree: 30 }] },
      { cat: 'Formules', items: [{ nom: 'Coupe + barbe', prix: 35, duree: 50 }, { nom: 'Coupe + barbe + soin', prix: 45, duree: 60 }] },
    ],
    tags: ['Barbier', 'Rasoir droit', 'Dégradé'],
  },
  {
    id: 3, nom: 'Studio Inès', type: 'Coiffeur', ville: 'Paris 18e', adresse: '52 rue Lepic, 75018 Paris',
    note: 4.7, avis: 89, distance: '1.4 km', dispo_today: true,
    bio: 'Spécialiste des cheveux bouclés et crépus. Kératine, soins ultra-hydratants, tendances parisiennes.',
    horaires: [
      { jour: 'Lun', h: 'Fermé' }, { jour: 'Mar', h: '10h – 19h' }, { jour: 'Mer', h: '10h – 19h' },
      { jour: 'Jeu', h: '10h – 20h' }, { jour: 'Ven', h: '10h – 20h' }, { jour: 'Sam', h: '9h – 18h' }, { jour: 'Dim', h: '10h – 15h' },
    ],
    staff: [
      { id: 1, nom: 'Inès', metier: 'Spécialiste bouclés', initials: 'IN' },
      { id: 2, nom: 'Naomi', metier: 'Coloriste', initials: 'NA' },
    ],
    services: [
      { cat: 'Coupes', items: [{ nom: 'Coupe femme', prix: 42, duree: 45 }, { nom: 'Coupe bouclée', prix: 55, duree: 60 }] },
      { cat: 'Lissage & Kératine', items: [{ nom: 'Lissage brésilien', prix: 190, duree: 180 }, { nom: 'Kératine express', prix: 140, duree: 120 }] },
      { cat: 'Couleur', items: [{ nom: 'Balayage', prix: 95, duree: 120 }, { nom: 'Ombré hair', prix: 110, duree: 130 }] },
    ],
    tags: ['Bouclés', 'Kératine', 'Lissage'],
  },
  {
    id: 4, nom: "Atelier Beauté Marais", type: 'Institut de beauté', ville: 'Paris 4e', adresse: '12 rue des Archives, 75004 Paris',
    note: 4.8, avis: 204, distance: '0.6 km', dispo_today: true,
    bio: 'Institut haut de gamme spécialisé soins du visage, manucure gel, épilation à la cire. Produits Decléor.',
    horaires: [
      { jour: 'Lun', h: '10h – 19h' }, { jour: 'Mar', h: '10h – 19h' }, { jour: 'Mer', h: '10h – 19h' },
      { jour: 'Jeu', h: '10h – 20h' }, { jour: 'Ven', h: '10h – 20h' }, { jour: 'Sam', h: '9h – 19h' }, { jour: 'Dim', h: 'Fermé' },
    ],
    staff: [
      { id: 1, nom: 'Camille', metier: 'Esthéticienne', initials: 'CA' },
      { id: 2, nom: 'Lucie', metier: 'Prothésiste ongulaire', initials: 'LU' },
    ],
    services: [
      { cat: 'Soins visage', items: [{ nom: 'Soin hydratant Decléor', prix: 75, duree: 60 }, { nom: 'Peeling éclat', prix: 90, duree: 75 }] },
      { cat: 'Manucure & Pédicure', items: [{ nom: 'Pose vernis gel', prix: 35, duree: 45 }, { nom: 'Manucure complète', prix: 50, duree: 60 }, { nom: 'Pédicure', prix: 55, duree: 60 }] },
      { cat: 'Épilation', items: [{ nom: 'Demi-jambes', prix: 22, duree: 20 }, { nom: 'Jambes complètes', prix: 38, duree: 35 }, { nom: 'Maillot complet', prix: 30, duree: 25 }] },
    ],
    tags: ['Institut', 'Manucure', 'Soins visage', 'Épilation'],
  },
  {
    id: 5, nom: 'Le Barbier du Marais', type: 'Barbier', ville: 'Paris 4e', adresse: '27 rue Vieille du Temple, 75004 Paris',
    note: 4.6, avis: 156, distance: '0.9 km', dispo_today: false,
    bio: 'Maître barbier depuis 15 ans. Coupe au ciseau, rasage au coupe-chou, soins barbe premium.',
    horaires: [
      { jour: 'Lun', h: 'Fermé' }, { jour: 'Mar', h: '10h – 19h' }, { jour: 'Mer', h: '10h – 19h' },
      { jour: 'Jeu', h: '10h – 20h' }, { jour: 'Ven', h: '10h – 20h' }, { jour: 'Sam', h: '9h – 20h' }, { jour: 'Dim', h: 'Fermé' },
    ],
    staff: [
      { id: 1, nom: 'Thomas', metier: 'Maître barbier', initials: 'TH' },
    ],
    services: [
      { cat: 'Coupe & Barbe', items: [{ nom: 'Coupe ciseau', prix: 30, duree: 35 }, { nom: 'Coupe + barbe premium', prix: 55, duree: 60 }, { nom: 'Rasage coupe-chou', prix: 40, duree: 45 }] },
      { cat: 'Soins', items: [{ nom: 'Soin barbe huile d\'argan', prix: 20, duree: 15 }, { nom: 'Masque visage homme', prix: 35, duree: 30 }] },
    ],
    tags: ['Barbier', 'Ciseau', 'Rasage'],
  },
  {
    id: 6, nom: 'Spa Bien-être Lumière', type: 'Bien-être', ville: 'Paris 8e', adresse: '5 avenue Montaigne, 75008 Paris',
    note: 4.9, avis: 78, distance: '2.1 km', dispo_today: true,
    bio: 'Spa urbain haut de gamme. Massages, soins corps, rituels bien-être. Ambiance feutrée et lumineuse.',
    horaires: [
      { jour: 'Lun', h: '10h – 20h' }, { jour: 'Mar', h: '10h – 20h' }, { jour: 'Mer', h: '10h – 20h' },
      { jour: 'Jeu', h: '10h – 21h' }, { jour: 'Ven', h: '10h – 21h' }, { jour: 'Sam', h: '9h – 20h' }, { jour: 'Dim', h: '10h – 18h' },
    ],
    staff: [
      { id: 1, nom: 'Marie', metier: 'Masseuse', initials: 'MA' },
      { id: 2, nom: 'Yuki', metier: 'Thérapeute', initials: 'YU' },
    ],
    services: [
      { cat: 'Massages', items: [{ nom: 'Massage relaxant 60 min', prix: 90, duree: 60 }, { nom: 'Massage sportif 60 min', prix: 95, duree: 60 }, { nom: 'Massage duo 60 min', prix: 170, duree: 60 }] },
      { cat: 'Soins corps', items: [{ nom: 'Gommage corps', prix: 70, duree: 50 }, { nom: 'Enveloppement argile', prix: 85, duree: 60 }] },
      { cat: 'Rituels', items: [{ nom: 'Rituel Lumière 90 min', prix: 140, duree: 90 }, { nom: 'Rituel Oriental 120 min', prix: 180, duree: 120 }] },
    ],
    tags: ['Spa', 'Massage', 'Bien-être'],
  },
];

const SOUS_TYPES = ['Tout', 'Coiffeur', 'Barbier', 'Manucure', 'Institut de beauté', 'Bien-être'];

function genCreneaux() {
  const slots = [];
  const now = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() + d);
    const label = d === 0 ? "Aujourd'hui" : d === 1 ? 'Demain' : date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    const heures = [];
    for (let h = 9; h < 19; h++) {
      if (Math.random() > 0.45) heures.push(`${h}:00`);
      if (Math.random() > 0.5) heures.push(`${h}:30`);
    }
    if (heures.length) slots.push({ label, date: date.toLocaleDateString('fr-FR'), heures });
  }
  return slots;
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ note }) {
  return (
    <span style={{ letterSpacing: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(note) ? '#0A0A0A' : '#D4D4D4', fontSize: 11 }}>★</span>
      ))}
    </span>
  );
}

// ─── Modal Réservation ────────────────────────────────────────────────────────
function ModalReservation({ salon, onClose }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState(null);
  const [creneau, setCreneau] = useState(null);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const creneaux = genCreneaux();

  async function confirmer() {
    setLoading(true);
    try {
      await axios.post(`${API}/reservations`, {
        pro_id: salon.id, secteur: 'coiffure',
        service: service.nom, prix: service.prix,
        creneau: `${creneau.date} ${creneau.heure} — ${staff?.nom || 'Au choix'}`,
        ...form,
      });
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.5)', zIndex: 9000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 560, padding: '32px 28px 40px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Réservation</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>{salon.nom}</div>
          </div>
          <button onClick={onClose} style={{ background: '#F0F0F0', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: C.muted, flexShrink: 0 }}>✕</button>
        </div>

        {/* Progress */}
        {!done && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
            {['Prestation', 'Coiffeur', 'Créneau', 'Contact'].map((s, i) => (
              <div key={s} style={{ flex: 1 }}>
                <div style={{ height: 2, background: step > i ? C.ink : '#E8E8E8', borderRadius: 2, marginBottom: 4, transition: 'background .3s' }} />
                <div style={{ fontSize: 9, color: step === i+1 ? C.ink : C.muted, fontWeight: step === i+1 ? 700 : 400, textTransform: 'uppercase', letterSpacing: 1 }}>{s}</div>
              </div>
            ))}
          </div>
        )}

        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: 56, height: 56, background: '#F0F0F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px' }}>✓</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Réservation confirmée</div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
              {service?.nom} · {creneau?.date} à {creneau?.heure}<br />
              Un e-mail de confirmation vous a été envoyé.
            </div>
            <button onClick={onClose} style={{ marginTop: 28, padding: '12px 32px', background: C.ink, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Fermer</button>
          </div>
        ) : step === 1 ? (
          <div>
            {salon.services.map(cat => (
              <div key={cat.cat} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>{cat.cat}</div>
                {cat.items.map(item => (
                  <button key={item.nom} onClick={() => { setService(item); setStep(2); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '14px 16px', marginBottom: 6, background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'border-color .2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#0A0A0A'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E8E8'}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{item.nom}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{item.duree} min</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{item.prix} €</div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : step === 2 ? (
          <div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Choisir un coiffeur</div>
            <button onClick={() => { setStaff(null); setStep(3); }} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', marginBottom: 8, background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#0A0A0A'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E8E8'}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>★</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Sans préférence</div>
                <div style={{ fontSize: 12, color: C.muted }}>Premier disponible</div>
              </div>
            </button>
            {salon.staff.map(s => (
              <button key={s.id} onClick={() => { setStaff(s); setStep(3); }} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', marginBottom: 8, background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#0A0A0A'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E8E8'}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{s.initials}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{s.nom}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.metier}</div>
                </div>
              </button>
            ))}
            <button onClick={() => setStep(1)} style={{ marginTop: 8, fontSize: 13, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>← Retour</button>
          </div>
        ) : step === 3 ? (
          <div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Choisir un créneau</div>
            {creneaux.map(jour => (
              <div key={jour.label} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 8 }}>{jour.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {jour.heures.map(h => (
                    <button key={h} onClick={() => { setCreneau({ date: jour.date, heure: h }); setStep(4); }}
                      style={{ padding: '8px 14px', background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 8, fontSize: 13, fontWeight: 500, color: C.ink, cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#0A0A0A'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.color = C.ink; }}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => setStep(2)} style={{ marginTop: 4, fontSize: 13, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>← Retour</button>
          </div>
        ) : (
          <div>
            <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: C.ink }}>
              <strong>{service?.nom}</strong> · {service?.prix} € · {creneau?.date} à {creneau?.heure}
              {staff && <> · avec {staff.nom}</>}
            </div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, fontWeight: 600 }}>Vos coordonnées</div>
            {[['prenom', 'Prénom'], ['nom', 'Nom'], ['email', 'E-mail'], ['telephone', 'Téléphone']].map(([k, label]) => (
              <input key={k} type={k === 'email' ? 'email' : k === 'telephone' ? 'tel' : 'text'} placeholder={label} value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))}
                style={{ display: 'block', width: '100%', padding: '13px 16px', marginBottom: 10, border: '1px solid #E8E8E8', borderRadius: 10, fontSize: 14, color: C.ink, background: '#FAFAFA', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            ))}
            <button onClick={confirmer} disabled={loading || !form.prenom || !form.nom || !form.email || !form.telephone}
              style={{ width: '100%', padding: '15px', background: loading ? '#999' : C.ink, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
              {loading ? 'Confirmation...' : 'Confirmer la réservation'}
            </button>
            <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 12 }}>Paiement sur place · Annulation gratuite jusqu'à 24h avant</div>
            <button onClick={() => setStep(3)} style={{ display: 'block', margin: '12px auto 0', fontSize: 13, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>← Retour</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function SalonPanel({ salon, onReserve, onClose }) {
  const [tab, setTab] = useState('services');

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 28px' }}>
      {/* Close mobile */}
      <button onClick={onClose} style={{ display: 'none', position: 'absolute', top: 16, right: 16, background: '#F0F0F0', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: C.muted, '@media(maxWidth:768px)': { display: 'flex' } }}>✕</button>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{salon.type}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: -0.5, marginBottom: 8 }}>{salon.nom}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Stars note={salon.note} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{salon.note}</span>
          <span style={{ fontSize: 13, color: C.muted }}>({salon.avis} avis)</span>
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>{salon.adresse}</div>
        {salon.dispo_today && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '5px 12px', background: '#F0F7F0', borderRadius: 100 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3D9A3D' }} />
            <span style={{ fontSize: 12, color: '#3D9A3D', fontWeight: 600 }}>Disponible aujourd'hui</span>
          </div>
        )}
      </div>

      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>{salon.bio}</div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
        {salon.tags.map(t => (
          <span key={t} style={{ padding: '5px 12px', background: '#F5F5F5', borderRadius: 100, fontSize: 12, color: C.ink, fontWeight: 500 }}>{t}</span>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: `1px solid ${C.border}` }}>
        {[['services', 'Prestations'], ['staff', 'L\'équipe'], ['horaires', 'Horaires']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', borderBottom: tab === k ? `2px solid ${C.ink}` : '2px solid transparent', fontSize: 13, fontWeight: tab === k ? 700 : 400, color: tab === k ? C.ink : C.muted, cursor: 'pointer', marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'services' && (
        <div>
          {salon.services.map(cat => (
            <div key={cat.cat} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>{cat.cat}</div>
              {cat.items.map(item => (
                <div key={item.nom} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{item.nom}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{item.duree} min</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{item.prix} €</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {salon.staff.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px', background: '#FAFAFA', borderRadius: 12, border: `1px solid ${C.border}` }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{s.initials}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{s.nom}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{s.metier}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'horaires' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {salon.horaires.map(h => {
            const today = new Date().toLocaleDateString('fr-FR', { weekday: 'short' });
            const isToday = today.toLowerCase().startsWith(h.jour.toLowerCase().slice(0, 3));
            return (
              <div key={h.jour} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${C.border}`, ...(isToday ? { fontWeight: 700 } : {}) }}>
                <span style={{ fontSize: 13, color: isToday ? C.ink : C.muted }}>{h.jour}</span>
                <span style={{ fontSize: 13, color: h.h === 'Fermé' ? '#C0C0C0' : C.ink }}>{h.h}</span>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={onReserve} style={{ width: '100%', marginTop: 28, padding: '15px', background: C.ink, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 700, fontSize: 15, cursor: 'pointer', letterSpacing: 0.3 }}>
        Réserver
      </button>
    </div>
  );
}

// ─── Salon Card ───────────────────────────────────────────────────────────────
function SalonCard({ salon, selected, onClick }) {
  return (
    <div onClick={onClick} style={{ padding: '20px 20px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: selected ? '#F5F5F5' : C.white, transition: 'background .15s' }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#FAFAFA'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = C.white; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 2 }}>{salon.type}</div>
        <div style={{ fontSize: 11, color: C.muted }}>{salon.distance}</div>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 4, letterSpacing: -0.2 }}>{salon.nom}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Stars note={salon.note} />
        <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{salon.note}</span>
        <span style={{ fontSize: 12, color: C.muted }}>· {salon.avis} avis</span>
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{salon.ville}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {salon.tags.slice(0, 2).map(t => (
            <span key={t} style={{ padding: '3px 9px', background: '#F0F0F0', borderRadius: 100, fontSize: 11, color: C.ink }}>{t}</span>
          ))}
        </div>
        {salon.dispo_today ? (
          <span style={{ fontSize: 11, color: '#3D9A3D', fontWeight: 600 }}>● Dispo aujourd'hui</span>
        ) : (
          <span style={{ fontSize: 11, color: C.muted }}>Prochain dispo →</span>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function CoiffurePage() {
  const navigate = useNavigate();
  const [sousType, setSousType] = useState('Tout');
  const [recherche, setRecherche] = useState('');
  const [ville, setVille] = useState('Paris');
  const [selectedSalon, setSelectedSalon] = useState(SALONS[0]);
  const [showModal, setShowModal] = useState(false);

  const filtered = SALONS.filter(s => {
    const typeMatch = sousType === 'Tout' || s.type === sousType || (sousType === 'Manucure' && s.tags.includes('Manucure'));
    const searchMatch = !recherche || s.nom.toLowerCase().includes(recherche.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(recherche.toLowerCase()));
    return typeMatch && searchMatch;
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif', color: C.ink }}>
      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,250,250,0.92)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 56 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>
            Artisans<span style={{ color: C.gold }}>.</span>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/register?role=patron')} style={{ padding: '7px 16px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 100, fontSize: 12, fontWeight: 500, color: C.muted, cursor: 'pointer' }}>
              Je suis professionnel
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '7px 16px', background: C.ink, border: 'none', borderRadius: 100, fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
              Mon compte
            </button>
          </div>
        </div>

        {/* Sub-nav : catégories */}
        <div style={{ display: 'flex', gap: 0, padding: '0 32px', borderTop: `1px solid ${C.border}`, overflowX: 'auto' }}>
          {SOUS_TYPES.map(type => (
            <button key={type} onClick={() => setSousType(type)} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: sousType === type ? `2px solid ${C.ink}` : '2px solid transparent', fontSize: 12, fontWeight: sousType === type ? 700 : 400, color: sousType === type ? C.ink : C.muted, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: 0.3 }}>
              {type}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Search bar ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '20px 32px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', gap: 0, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', background: C.white, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 20px', borderRight: `1px solid ${C.border}` }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Que cherchez-vous ?</label>
            <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Coupe, balayage, barbe…" style={{ border: 'none', outline: 'none', fontSize: 14, color: C.ink, background: 'none', fontFamily: 'inherit' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 20px' }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Où ?</label>
            <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Paris, Lyon…" style={{ border: 'none', outline: 'none', fontSize: 14, color: C.ink, background: 'none', fontFamily: 'inherit' }} />
          </div>
          <button style={{ padding: '0 24px', background: C.ink, border: 'none', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            Rechercher
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'flex', height: 'calc(100vh - 160px)', maxWidth: 1200, margin: '0 auto' }}>

        {/* Left: list */}
        <div style={{ width: 380, flexShrink: 0, borderRight: `1px solid ${C.border}`, overflowY: 'auto', background: C.white }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.muted }}>{filtered.length} établissement{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 14 }}>Aucun résultat pour cette recherche.</div>
          ) : filtered.map(s => (
            <SalonCard key={s.id} salon={s} selected={selectedSalon?.id === s.id} onClick={() => setSelectedSalon(s)} />
          ))}
        </div>

        {/* Right: detail */}
        <div style={{ flex: 1, overflowY: 'auto', background: C.bg, position: 'relative' }}>
          {selectedSalon ? (
            <SalonPanel salon={selectedSalon} onReserve={() => setShowModal(true)} onClose={() => setSelectedSalon(null)} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 32 }}>✂️</div>
              <div style={{ fontSize: 14, color: C.muted }}>Sélectionnez un établissement</div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedSalon && (
        <ModalReservation salon={selectedSalon} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
