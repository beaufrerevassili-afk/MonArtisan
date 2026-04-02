import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Design System ────────────────────────────────────────────────────────────
const DS = {
  bg:      '#FAFAF8',
  white:   '#FFFFFF',
  surface: '#F4F3F0',
  ink:     '#0A0A0A',
  ink2:    '#2D2D2D',
  muted:   '#6B6B6B',
  subtle:  '#AAAAAA',
  border:  '#E8E7E4',
  gold:    '#C9A96E',
  green:   '#2A7C2A',
  greenBg: '#EEF6EE',
};

// ─── Données ──────────────────────────────────────────────────────────────────
const SOUS_TYPES = ['Tout', 'Coiffeur', 'Barbier', 'Manucure', 'Institut de beauté', 'Bien-être'];

const SALONS = [
  {
    id: 1, nom: 'Salon Léa', type: 'Coiffeur', ville: 'Paris 11e', adresse: '24 rue de la Roquette, 75011 Paris',
    note: 4.9, avis: 142, distance: '0.3 km', prixMin: 30, dispo: true,
    grad: 'linear-gradient(140deg,#E8C5D0,#C9A0C0)',
    initials: 'SL',
    bio: 'Spécialiste couleur et balayage depuis 12 ans. Produits Davines certifiés bio. Résultats naturels garantis.',
    horaires: [
      { j: 'Lun', h: 'Fermé' }, { j: 'Mar', h: '9h – 19h' }, { j: 'Mer', h: '9h – 19h' },
      { j: 'Jeu', h: '9h – 20h' }, { j: 'Ven', h: '9h – 20h' }, { j: 'Sam', h: '9h – 18h' }, { j: 'Dim', h: 'Fermé' },
    ],
    staff: [{ id:1, nom:'Léa', metier:'Coloriste', initials:'LÉ' }, { id:2, nom:'Sofia', metier:'Coiffeuse', initials:'SO' }, { id:3, nom:'Jade', metier:'Coiffeuse', initials:'JA' }],
    services: [
      { cat:'Coupes femme', items:[{ nom:'Coupe + brushing', prix:65, duree:60 },{ nom:'Coupe sans brushing', prix:45, duree:45 },{ nom:'Brushing seul', prix:30, duree:30 }] },
      { cat:'Couleur & Balayage', items:[{ nom:'Couleur racines', prix:75, duree:90 },{ nom:'Balayage', prix:110, duree:120 },{ nom:'Mèches complètes', prix:130, duree:150 }] },
      { cat:'Soins', items:[{ nom:'Soin profond Davines', prix:35, duree:30 },{ nom:'Lissage brésilien', prix:200, duree:180 }] },
    ],
    tags: ['Coloriste', 'Balayage', 'Bio'],
  },
  {
    id: 2, nom: 'Barbershop Alex', type: 'Barbier', ville: 'Paris 3e', adresse: '8 rue de Bretagne, 75003 Paris',
    note: 5.0, avis: 67, distance: '0.8 km', prixMin: 22, dispo: true,
    grad: 'linear-gradient(140deg,#A8B8D8,#7890BC)',
    initials: 'BA',
    bio: 'Barbier traditionnel au rasoir droit. Ambiance raffinée, soin premium garanti.',
    horaires: [
      { j:'Lun', h:'10h – 19h' }, { j:'Mar', h:'10h – 19h' }, { j:'Mer', h:'10h – 19h' },
      { j:'Jeu', h:'10h – 20h' }, { j:'Ven', h:'10h – 20h' }, { j:'Sam', h:'9h – 18h' }, { j:'Dim', h:'Fermé' },
    ],
    staff: [{ id:1, nom:'Alex', metier:'Barbier', initials:'AL' }, { id:2, nom:'Mehdi', metier:'Barbier', initials:'ME' }],
    services: [
      { cat:'Coupe', items:[{ nom:'Coupe homme', prix:22, duree:25 },{ nom:'Coupe dégradé', prix:25, duree:30 }] },
      { cat:'Barbe', items:[{ nom:'Taille de barbe', prix:18, duree:20 },{ nom:'Rasage au rasoir droit', prix:22, duree:30 }] },
      { cat:'Formules', items:[{ nom:'Coupe + barbe', prix:35, duree:50 },{ nom:'Coupe + barbe + soin', prix:45, duree:60 }] },
    ],
    tags: ['Barbier', 'Rasoir droit', 'Dégradé'],
  },
  {
    id: 3, nom: 'Studio Inès', type: 'Coiffeur', ville: 'Paris 18e', adresse: '52 rue Lepic, 75018 Paris',
    note: 4.7, avis: 89, distance: '1.4 km', prixMin: 42, dispo: true,
    grad: 'linear-gradient(140deg,#C5B0D8,#A090C0)',
    initials: 'SI',
    bio: 'Spécialiste cheveux bouclés et crépus. Kératine, soins ultra-hydratants, tendances parisiennes.',
    horaires: [
      { j:'Lun', h:'Fermé' }, { j:'Mar', h:'10h – 19h' }, { j:'Mer', h:'10h – 19h' },
      { j:'Jeu', h:'10h – 20h' }, { j:'Ven', h:'10h – 20h' }, { j:'Sam', h:'9h – 18h' }, { j:'Dim', h:'10h – 15h' },
    ],
    staff: [{ id:1, nom:'Inès', metier:'Spécialiste bouclés', initials:'IN' }, { id:2, nom:'Naomi', metier:'Coloriste', initials:'NA' }],
    services: [
      { cat:'Coupes', items:[{ nom:'Coupe femme', prix:42, duree:45 },{ nom:'Coupe bouclée', prix:55, duree:60 }] },
      { cat:'Lissage & Kératine', items:[{ nom:'Lissage brésilien', prix:190, duree:180 },{ nom:'Kératine express', prix:140, duree:120 }] },
      { cat:'Couleur', items:[{ nom:'Balayage', prix:95, duree:120 },{ nom:'Ombré hair', prix:110, duree:130 }] },
    ],
    tags: ['Bouclés', 'Kératine', 'Lissage'],
  },
  {
    id: 4, nom: 'Atelier Beauté Marais', type: 'Institut de beauté', ville: 'Paris 4e', adresse: '12 rue des Archives, 75004 Paris',
    note: 4.8, avis: 204, distance: '0.6 km', prixMin: 22, dispo: true,
    grad: 'linear-gradient(140deg,#B8D0C0,#90B098)',
    initials: 'AB',
    bio: 'Institut haut de gamme : soins du visage, manucure gel, épilation à la cire. Produits Decléor.',
    horaires: [
      { j:'Lun', h:'10h – 19h' }, { j:'Mar', h:'10h – 19h' }, { j:'Mer', h:'10h – 19h' },
      { j:'Jeu', h:'10h – 20h' }, { j:'Ven', h:'10h – 20h' }, { j:'Sam', h:'9h – 19h' }, { j:'Dim', h:'Fermé' },
    ],
    staff: [{ id:1, nom:'Camille', metier:'Esthéticienne', initials:'CA' }, { id:2, nom:'Lucie', metier:'Prothésiste ongulaire', initials:'LU' }],
    services: [
      { cat:'Soins visage', items:[{ nom:'Soin hydratant Decléor', prix:75, duree:60 },{ nom:'Peeling éclat', prix:90, duree:75 }] },
      { cat:'Manucure & Pédicure', items:[{ nom:'Pose vernis gel', prix:35, duree:45 },{ nom:'Manucure complète', prix:50, duree:60 },{ nom:'Pédicure', prix:55, duree:60 }] },
      { cat:'Épilation', items:[{ nom:'Demi-jambes', prix:22, duree:20 },{ nom:'Jambes complètes', prix:38, duree:35 }] },
    ],
    tags: ['Institut', 'Manucure', 'Soins visage'],
  },
  {
    id: 5, nom: 'Le Barbier du Marais', type: 'Barbier', ville: 'Paris 4e', adresse: '27 rue Vieille du Temple, 75004 Paris',
    note: 4.6, avis: 156, distance: '0.9 km', prixMin: 25, dispo: false,
    grad: 'linear-gradient(140deg,#D0B898,#B09070)',
    initials: 'BM',
    bio: 'Maître barbier depuis 15 ans. Coupe au ciseau, rasage au coupe-chou, soins barbe premium.',
    horaires: [
      { j:'Lun', h:'Fermé' }, { j:'Mar', h:'10h – 19h' }, { j:'Mer', h:'10h – 19h' },
      { j:'Jeu', h:'10h – 20h' }, { j:'Ven', h:'10h – 20h' }, { j:'Sam', h:'9h – 20h' }, { j:'Dim', h:'Fermé' },
    ],
    staff: [{ id:1, nom:'Thomas', metier:'Maître barbier', initials:'TH' }],
    services: [
      { cat:'Coupe & Barbe', items:[{ nom:'Coupe ciseau', prix:30, duree:35 },{ nom:'Coupe + barbe premium', prix:55, duree:60 },{ nom:'Rasage coupe-chou', prix:40, duree:45 }] },
      { cat:'Soins barbe', items:[{ nom:"Soin barbe huile d'argan", prix:20, duree:15 },{ nom:'Masque visage homme', prix:35, duree:30 }] },
    ],
    tags: ['Barbier', 'Ciseau', 'Rasage'],
  },
  {
    id: 6, nom: 'Spa Lumière', type: 'Bien-être', ville: 'Paris 8e', adresse: '5 avenue Montaigne, 75008 Paris',
    note: 4.9, avis: 78, distance: '2.1 km', prixMin: 70, dispo: true,
    grad: 'linear-gradient(140deg,#A8C5D8,#80A8C0)',
    initials: 'SL',
    bio: 'Spa urbain haut de gamme. Massages, soins corps, rituels bien-être. Ambiance lumineuse et feutrée.',
    horaires: [
      { j:'Lun', h:'10h – 20h' }, { j:'Mar', h:'10h – 20h' }, { j:'Mer', h:'10h – 20h' },
      { j:'Jeu', h:'10h – 21h' }, { j:'Ven', h:'10h – 21h' }, { j:'Sam', h:'9h – 20h' }, { j:'Dim', h:'10h – 18h' },
    ],
    staff: [{ id:1, nom:'Marie', metier:'Masseuse', initials:'MA' }, { id:2, nom:'Yuki', metier:'Thérapeute', initials:'YU' }],
    services: [
      { cat:'Massages', items:[{ nom:'Massage relaxant 60 min', prix:90, duree:60 },{ nom:'Massage sportif 60 min', prix:95, duree:60 },{ nom:'Massage duo 60 min', prix:170, duree:60 }] },
      { cat:'Rituels', items:[{ nom:'Rituel Lumière 90 min', prix:140, duree:90 },{ nom:'Rituel Oriental 120 min', prix:180, duree:120 }] },
    ],
    tags: ['Spa', 'Massage', 'Bien-être'],
  },
];

// ─── Utils ────────────────────────────────────────────────────────────────────
function genCreneaux() {
  const out = [];
  const now = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(now); date.setDate(now.getDate() + d);
    const label = d === 0 ? "Aujourd'hui" : d === 1 ? 'Demain'
      : date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
    const heures = [];
    for (let h = 9; h < 19; h++) {
      if (Math.random() > 0.45) heures.push(`${h}:00`);
      if (Math.random() > 0.5) heures.push(`${h}:30`);
    }
    if (heures.length) out.push({ label, date: date.toLocaleDateString('fr-FR'), heures });
  }
  return out;
}

function Stars({ note, size = 11 }) {
  return (
    <span>{[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= Math.round(note) ? '#C9A96E' : '#DEDED8', fontSize: size }}>★</span>
    ))}</span>
  );
}

// ─── Modal Réservation ────────────────────────────────────────────────────────
function ModalReservation({ salon, onClose }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState(null);
  const [creneau, setCreneau] = useState(null);
  const [form, setForm] = useState({ nom:'', prenom:'', email:'', telephone:'' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const creneaux = useRef(genCreneaux()).current;

  async function confirmer() {
    setLoading(true);
    try {
      await axios.post(`${API}/reservations`, {
        pro_id: salon.id, secteur: 'coiffure',
        service: service.nom, prix: service.prix,
        creneau: `${creneau.date} ${creneau.heure} — ${staff?.nom || 'Premier disponible'}`,
        ...form,
      });
    } catch (_) {}
    setLoading(false); setDone(true);
  }

  const steps = ['Prestation', 'Coiffeur', 'Créneau', 'Contact'];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,10,10,0.6)', backdropFilter:'blur(12px)', zIndex:9999, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:DS.white, borderRadius:'24px 24px 0 0', width:'100%', maxWidth:540, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 -8px 48px rgba(0,0,0,0.15)' }} onClick={e=>e.stopPropagation()}>

        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'#E0E0E0' }} />
        </div>

        <div style={{ padding:'20px 28px 40px' }}>
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
            <div>
              <div style={{ fontSize:11, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:4 }}>Réservation</div>
              <div style={{ fontSize:20, fontWeight:800, color:DS.ink, letterSpacing:'-0.04em' }}>{salon.nom}</div>
            </div>
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:'50%', background:DS.surface, border:'none', cursor:'pointer', fontSize:15, color:DS.muted, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
          </div>

          {!done && (
            <div style={{ display:'flex', gap:6, marginBottom:28 }}>
              {steps.map((s,i) => (
                <div key={s} style={{ flex:1 }}>
                  <div style={{ height:2, borderRadius:2, background: step > i ? DS.ink : '#E8E7E4', marginBottom:5, transition:'background .3s' }} />
                  <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:1.5, fontWeight: step===i+1?700:400, color: step===i+1?DS.ink:DS.subtle }}>{s}</div>
                </div>
              ))}
            </div>
          )}

          {done ? (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:DS.surface, margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>✓</div>
              <div style={{ fontSize:22, fontWeight:800, color:DS.ink, letterSpacing:'-0.04em', marginBottom:10 }}>Réservé !</div>
              <div style={{ fontSize:14, color:DS.muted, lineHeight:1.7 }}>
                <strong style={{ color:DS.ink }}>{service?.nom}</strong> · {service?.prix} €<br/>
                {creneau?.date} à {creneau?.heure}{staff ? ` · avec ${staff.nom}` : ''}<br/>
                Un e-mail de confirmation vous sera envoyé.
              </div>
              <div style={{ marginTop:16, fontSize:12, color:DS.subtle }}>Paiement sur place · Annulation gratuite 24h avant</div>
              <button onClick={onClose} style={{ marginTop:28, padding:'13px 36px', background:DS.ink, color:'#fff', border:'none', borderRadius:100, fontWeight:700, fontSize:14, cursor:'pointer', letterSpacing:0.3 }}>Fermer</button>
            </div>
          ) : step === 1 ? (
            <div>
              {salon.services.map(cat => (
                <div key={cat.cat} style={{ marginBottom:22 }}>
                  <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:10 }}>{cat.cat}</div>
                  {cat.items.map(item => (
                    <button key={item.nom} onClick={() => { setService(item); setStep(2); }}
                      style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', padding:'14px 16px', marginBottom:6, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:12, cursor:'pointer', textAlign:'left', transition:'all .18s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=DS.ink; e.currentTarget.style.background=DS.white; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=DS.border; e.currentTarget.style.background=DS.bg; }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:500, color:DS.ink, marginBottom:2 }}>{item.nom}</div>
                        <div style={{ fontSize:12, color:DS.muted }}>{item.duree} min</div>
                      </div>
                      <div style={{ fontSize:15, fontWeight:700, color:DS.ink }}>{item.prix} €</div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : step === 2 ? (
            <div>
              <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:14 }}>Choisir votre coiffeur</div>
              {[{ id:0, nom:'Sans préférence', metier:'Premier disponible', initials:'★', isAny:true }, ...salon.staff].map(s => (
                <button key={s.id} onClick={() => { setStaff(s.isAny ? null : s); setStep(3); }}
                  style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'14px 16px', marginBottom:8, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:12, cursor:'pointer', textAlign:'left', transition:'all .18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=DS.ink; e.currentTarget.style.background=DS.white; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=DS.border; e.currentTarget.style.background=DS.bg; }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background: s.isAny ? DS.surface : DS.ink, display:'flex', alignItems:'center', justifyContent:'center', fontSize: s.isAny ? 18 : 12, color: s.isAny ? DS.muted : '#fff', fontWeight:700, flexShrink:0 }}>{s.initials}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:DS.ink }}>{s.nom}</div>
                    <div style={{ fontSize:12, color:DS.muted }}>{s.metier}</div>
                  </div>
                </button>
              ))}
              <button onClick={() => setStep(1)} style={{ marginTop:8, fontSize:13, color:DS.muted, background:'none', border:'none', cursor:'pointer' }}>← Retour</button>
            </div>
          ) : step === 3 ? (
            <div>
              <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:14 }}>Choisir un créneau</div>
              {creneaux.map(jour => (
                <div key={jour.label} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:DS.ink2, marginBottom:8, textTransform:'capitalize' }}>{jour.label}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {jour.heures.map(h => (
                      <button key={h} onClick={() => { setCreneau({ date:jour.date, heure:h }); setStep(4); }}
                        style={{ padding:'8px 14px', background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:8, fontSize:13, fontWeight:500, color:DS.ink, cursor:'pointer', transition:'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background=DS.ink; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor=DS.ink; }}
                        onMouseLeave={e => { e.currentTarget.style.background=DS.bg; e.currentTarget.style.color=DS.ink; e.currentTarget.style.borderColor=DS.border; }}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => setStep(2)} style={{ marginTop:4, fontSize:13, color:DS.muted, background:'none', border:'none', cursor:'pointer' }}>← Retour</button>
            </div>
          ) : (
            <div>
              <div style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:12, padding:'14px 16px', marginBottom:20, fontSize:13, color:DS.ink, lineHeight:1.6 }}>
                <strong>{service?.nom}</strong> · {service?.prix} €<br/>
                {creneau?.date} à {creneau?.heure}{staff ? ` · avec ${staff.nom}` : ''}
              </div>
              <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:14 }}>Vos coordonnées</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                {[['prenom','Prénom'], ['nom','Nom']].map(([k,label]) => (
                  <input key={k} placeholder={label} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))}
                    style={{ padding:'13px 15px', border:`1px solid ${DS.border}`, borderRadius:10, fontSize:14, color:DS.ink, background:DS.bg, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
                ))}
              </div>
              {[['email','E-mail','email'],['telephone','Téléphone','tel']].map(([k,label,type]) => (
                <input key={k} type={type} placeholder={label} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))}
                  style={{ display:'block', width:'100%', padding:'13px 15px', marginBottom:10, border:`1px solid ${DS.border}`, borderRadius:10, fontSize:14, color:DS.ink, background:DS.bg, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
              ))}
              <button onClick={confirmer} disabled={loading || !form.prenom || !form.nom || !form.email || !form.telephone}
                style={{ width:'100%', padding:'15px', background: loading || !form.prenom || !form.nom || !form.email || !form.telephone ? '#CCCCCC' : DS.ink, color:'#fff', border:'none', borderRadius:100, fontWeight:700, fontSize:15, cursor: loading ? 'wait' : 'pointer', marginTop:6, letterSpacing:0.2, transition:'background .2s' }}>
                {loading ? 'Confirmation…' : 'Confirmer la réservation'}
              </button>
              <div style={{ fontSize:11, color:DS.subtle, textAlign:'center', marginTop:12 }}>Paiement sur place · Annulation gratuite jusqu'à 24h avant</div>
              <button onClick={() => setStep(3)} style={{ display:'block', margin:'12px auto 0', fontSize:13, color:DS.muted, background:'none', border:'none', cursor:'pointer' }}>← Retour</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Panneau Détail Salon ──────────────────────────────────────────────────────
function SalonDetail({ salon, onReserve }) {
  const [tab, setTab] = useState('services');

  return (
    <div style={{ height:'100%', overflowY:'auto' }}>
      {/* Cover */}
      <div style={{ height:180, background:salon.grad, display:'flex', alignItems:'flex-end', padding:'0 28px 24px', position:'relative', flexShrink:0 }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 30%, rgba(10,10,10,0.45))' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:4 }}>{salon.type}</div>
          <div style={{ fontSize:26, fontWeight:800, color:'#fff', letterSpacing:'-0.05em', lineHeight:1.15 }}>{salon.nom}</div>
        </div>
      </div>

      <div style={{ padding:'24px 28px' }}>
        {/* Rating + infos */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
          <Stars note={salon.note} size={12} />
          <span style={{ fontSize:13, fontWeight:700, color:DS.ink }}>{salon.note}</span>
          <span style={{ fontSize:13, color:DS.muted }}>({salon.avis} avis)</span>
          <span style={{ fontSize:13, color:DS.subtle }}>·</span>
          <span style={{ fontSize:13, color:DS.muted }}>{salon.distance}</span>
        </div>
        <div style={{ fontSize:13, color:DS.muted, marginBottom:14 }}>{salon.adresse}</div>

        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${DS.border}` }}>
          {salon.dispo ? (
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', background:DS.greenBg, borderRadius:100 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:DS.green }} />
              <span style={{ fontSize:12, color:DS.green, fontWeight:600 }}>Disponible aujourd'hui</span>
            </span>
          ) : (
            <span style={{ fontSize:12, color:DS.muted }}>Prochain créneau disponible demain</span>
          )}
          <span style={{ fontSize:13, color:DS.muted }}>À partir de <strong style={{ color:DS.ink }}>{salon.prixMin} €</strong></span>
        </div>

        <div style={{ fontSize:13, color:DS.muted, lineHeight:1.7, marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${DS.border}` }}>{salon.bio}</div>

        {/* Tags */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:24, paddingBottom:24, borderBottom:`1px solid ${DS.border}` }}>
          {salon.tags.map(t => (
            <span key={t} style={{ padding:'5px 12px', background:DS.surface, borderRadius:100, fontSize:12, color:DS.ink2, fontWeight:500, letterSpacing:0.2 }}>{t}</span>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${DS.border}`, marginBottom:24 }}>
          {[['services','Prestations'], ['staff',"L'équipe"], ['horaires','Horaires']].map(([k,label]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:'10px 0', background:'none', border:'none', borderBottom: tab===k ? `2px solid ${DS.ink}` : '2px solid transparent', fontSize:13, fontWeight: tab===k ? 700 : 400, color: tab===k ? DS.ink : DS.muted, cursor:'pointer', marginBottom:-1, letterSpacing:0.1, transition:'color .15s' }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'services' && (
          <div>
            {salon.services.map(cat => (
              <div key={cat.cat} style={{ marginBottom:22 }}>
                <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:10 }}>{cat.cat}</div>
                {cat.items.map(item => (
                  <div key={item.nom} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:`1px solid ${DS.border}` }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:500, color:DS.ink }}>{item.nom}</div>
                      <div style={{ fontSize:12, color:DS.muted, marginTop:2 }}>{item.duree} min</div>
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:DS.ink }}>{item.prix} €</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === 'staff' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {salon.staff.map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:DS.surface, borderRadius:12 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:DS.ink, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', fontWeight:700, flexShrink:0 }}>{s.initials}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:DS.ink }}>{s.nom}</div>
                  <div style={{ fontSize:12, color:DS.muted }}>{s.metier}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'horaires' && (
          <div>
            {salon.horaires.map((h, i) => {
              const today = new Date().getDay();
              const dayMap = { Lun:1, Mar:2, Mer:3, Jeu:4, Ven:5, Sam:6, Dim:0 };
              const isToday = dayMap[h.j] === today;
              return (
                <div key={h.j} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom: i < salon.horaires.length-1 ? `1px solid ${DS.border}` : 'none' }}>
                  <span style={{ fontSize:13, fontWeight: isToday ? 700 : 400, color: isToday ? DS.ink : DS.muted }}>{h.j}{isToday && <span style={{ marginLeft:6, fontSize:10, color:DS.gold, fontWeight:700 }}>Aujourd'hui</span>}</span>
                  <span style={{ fontSize:13, color: h.h === 'Fermé' ? DS.subtle : DS.ink, fontWeight: isToday ? 600 : 400 }}>{h.h}</span>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={onReserve} style={{ width:'100%', marginTop:28, padding:'16px', background:DS.ink, color:'#fff', border:'none', borderRadius:100, fontWeight:700, fontSize:15, cursor:'pointer', letterSpacing:0.3, transition:'opacity .15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          Réserver
        </button>
      </div>
    </div>
  );
}

// ─── Salon Card ───────────────────────────────────────────────────────────────
function SalonCard({ salon, selected, onClick }) {
  return (
    <div onClick={onClick}
      style={{ padding:'18px 20px', borderBottom:`1px solid ${DS.border}`, cursor:'pointer', background: selected ? DS.bg : DS.white, transition:'background .15s' }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background=DS.bg; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background=DS.white; }}>
      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        {/* Avatar */}
        <div style={{ width:56, height:56, borderRadius:14, background:salon.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'rgba(255,255,255,0.9)', fontWeight:800, flexShrink:0, letterSpacing:0.5 }}>{salon.initials}</div>
        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:2 }}>
            <div style={{ fontSize:16, fontWeight:700, color:DS.ink, letterSpacing:'-0.03em', lineHeight:1.3 }}>{salon.nom}</div>
            <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0, marginLeft:8 }}>
              <span style={{ fontSize:11, color:DS.gold }}>★</span>
              <span style={{ fontSize:13, fontWeight:700, color:DS.ink }}>{salon.note}</span>
            </div>
          </div>
          <div style={{ fontSize:12, color:DS.muted, marginBottom:8 }}>{salon.type} · {salon.ville} · {salon.distance}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
            {salon.tags.map(t => (
              <span key={t} style={{ padding:'3px 9px', background:DS.surface, borderRadius:100, fontSize:11, color:DS.ink2, fontWeight:500 }}>{t}</span>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, color:DS.muted }}>À partir de <strong style={{ color:DS.ink }}>{salon.prixMin} €</strong></span>
            {salon.dispo ? (
              <span style={{ fontSize:11, color:DS.green, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:DS.green, display:'inline-block' }} />
                Dispo aujourd'hui
              </span>
            ) : (
              <span style={{ fontSize:11, color:DS.subtle }}>Prochain dispo →</span>
            )}
          </div>
        </div>
      </div>
      {selected && <div style={{ marginTop:12, height:2, background:DS.ink, borderRadius:1, marginLeft:70 }} />}
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

  const typeMap = { 'Manucure': 'Institut de beauté' };
  const filtered = SALONS.filter(s => {
    const st = typeMap[sousType] || sousType;
    const typeMatch = sousType === 'Tout' || s.type === st
      || (sousType === 'Manucure' && s.tags.includes('Manucure'));
    const searchMatch = !recherche || s.nom.toLowerCase().includes(recherche.toLowerCase())
      || s.tags.some(t => t.toLowerCase().includes(recherche.toLowerCase()));
    return typeMatch && searchMatch;
  });

  return (
    <div style={{ minHeight:'100vh', background:DS.white, fontFamily:"-apple-system,'SF Pro Display','Inter','Helvetica Neue',sans-serif", color:DS.ink }}>

      {/* ── Bandeau recrutement ── */}
      <div onClick={() => navigate('/recrutement')}
        style={{ background:'#F9F6EE', borderBottom:`1px solid #EDE8D4`, padding:'10px 32px', display:'flex', alignItems:'center', justifyContent:'center', gap:10, cursor:'pointer', transition:'background .15s' }}
        onMouseEnter={e => e.currentTarget.style.background='#F3EFE2'}
        onMouseLeave={e => e.currentTarget.style.background='#F9F6EE'}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:DS.gold, boxShadow:`0 0 8px rgba(201,169,110,0.7)`, flexShrink:0 }} />
        <span style={{ fontSize:13, color:'#7A6840' }}>Des salons et instituts recrutent en ce moment</span>
        <span style={{ fontSize:13, color:'#5A4820', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
          Voir les offres
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>

      {/* ── Navbar ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${DS.border}` }}>
        {/* Barre principale */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:56 }}>
          <button onClick={() => navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:17, fontWeight:800, color:DS.ink, letterSpacing:'-0.05em', display:'flex', alignItems:'center', gap:2 }}>
            Artisans<span style={{ color:DS.gold }}>.</span>
          </button>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <button onClick={() => navigate('/recrutement')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:DS.muted, padding:'6px 12px', borderRadius:8, transition:'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color=DS.ink}
              onMouseLeave={e => e.currentTarget.style.color=DS.muted}>
              Emploi
            </button>
            <button onClick={() => navigate('/register?role=patron')} style={{ padding:'7px 16px', background:'none', border:`1px solid ${DS.border}`, borderRadius:100, fontSize:12, fontWeight:500, color:DS.muted, cursor:'pointer', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=DS.ink; e.currentTarget.style.color=DS.ink; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=DS.border; e.currentTarget.style.color=DS.muted; }}>
              Je suis professionnel
            </button>
            <button onClick={() => navigate('/login')} style={{ padding:'7px 20px', background:DS.ink, border:'none', borderRadius:100, fontSize:12, fontWeight:600, color:'#fff', cursor:'pointer', transition:'opacity .15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              Mon compte
            </button>
          </div>
        </div>

        {/* Sous-nav catégories */}
        <div style={{ display:'flex', padding:'0 32px', borderTop:`1px solid ${DS.border}`, overflowX:'auto', scrollbarWidth:'none' }}>
          {SOUS_TYPES.map(type => (
            <button key={type} onClick={() => setSousType(type)}
              style={{ padding:'11px 16px', background:'none', border:'none', borderBottom: sousType===type ? `2px solid ${DS.ink}` : '2px solid transparent', fontSize:12, fontWeight: sousType===type ? 700 : 400, color: sousType===type ? DS.ink : DS.muted, cursor:'pointer', whiteSpace:'nowrap', letterSpacing:0.2, transition:'color .15s', marginBottom:-1 }}>
              {type}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Barre de recherche ── */}
      <div style={{ background:DS.white, borderBottom:`1px solid ${DS.border}`, padding:'16px 32px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', display:'flex', border:`1.5px solid ${DS.border}`, borderRadius:14, overflow:'hidden', background:DS.white, boxShadow:'0 4px 20px rgba(0,0,0,0.06)', transition:'box-shadow .2s' }}
          onFocusCapture={e => e.currentTarget.style.boxShadow='0 4px 24px rgba(0,0,0,0.12)'}
          onBlurCapture={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.06)'}>
          <div style={{ flex:1.2, display:'flex', flexDirection:'column', padding:'12px 20px', borderRight:`1px solid ${DS.border}` }}>
            <label style={{ fontSize:9, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>Que cherchez-vous ?</label>
            <input value={recherche} onChange={e => setRecherche(e.target.value)}
              placeholder="Coupe, balayage, massage…"
              style={{ border:'none', outline:'none', fontSize:14, color:DS.ink, background:'none', fontFamily:'inherit', letterSpacing:'-0.01em' }} />
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'12px 20px' }}>
            <label style={{ fontSize:9, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>Où ?</label>
            <input value={ville} onChange={e => setVille(e.target.value)}
              placeholder="Paris, Lyon, Bordeaux…"
              style={{ border:'none', outline:'none', fontSize:14, color:DS.ink, background:'none', fontFamily:'inherit', letterSpacing:'-0.01em' }} />
          </div>
          <button style={{ padding:'0 24px', background:DS.ink, border:'none', cursor:'pointer', color:'#fff', fontSize:13, fontWeight:700, letterSpacing:0.3, transition:'opacity .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            Rechercher
          </button>
        </div>
      </div>

      {/* ── Layout deux colonnes ── */}
      <div style={{ display:'flex', height:'calc(100vh - 218px)' }}>

        {/* Liste */}
        <div style={{ width:400, flexShrink:0, borderRight:`1px solid ${DS.border}`, overflowY:'auto', background:DS.white }}>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${DS.border}` }}>
            <span style={{ fontSize:12, color:DS.muted }}>{filtered.length} établissement{filtered.length > 1 ? 's' : ''}</span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', color:DS.muted, fontSize:14 }}>Aucun résultat</div>
          ) : filtered.map(s => (
            <SalonCard key={s.id} salon={s} selected={selectedSalon?.id===s.id} onClick={() => setSelectedSalon(s)} />
          ))}
        </div>

        {/* Détail */}
        <div style={{ flex:1, overflowY:'auto', background:DS.bg }}>
          {selectedSalon ? (
            <SalonDetail salon={selectedSalon} onReserve={() => setShowModal(true)} />
          ) : (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:14 }}>
              <div style={{ fontSize:40 }}>✂️</div>
              <div style={{ fontSize:14, color:DS.muted }}>Sélectionnez un établissement</div>
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
