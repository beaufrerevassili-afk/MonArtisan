import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { API_URL } from '../../services/api';

// ─── Données salons ───────────────────────────────────────────────────────────
const SALONS = {
  '1': {
    id:'1', nom:'Salon Léa', type:'Salon de coiffure mixte', adresse:'24 rue de la Roquette', ville:'Paris 11e', cp:'75011',
    note:4.9, avis:142, prixMin:30, dispo:true,
    grad:'linear-gradient(140deg,#E8C5D0,#C9A0C0)',
    bio:"Spécialiste couleur et balayage depuis 12 ans. Produits Davines certifiés bio. Une équipe passionnée qui prend soin de vous.",
    horaires:[{j:'Lun',h:'Fermé'},{j:'Mar',h:'9h–19h'},{j:'Mer',h:'9h–19h'},{j:'Jeu',h:'9h–20h'},{j:'Ven',h:'9h–20h'},{j:'Sam',h:'9h–18h'},{j:'Dim',h:'Fermé'}],
    photos:['#E8C5D0','#D4B0C0','#C09AAC','#E0D0D8'],
    staff:[{id:1,nom:'Léa',metier:'Coloriste',initials:'LÉ'},{id:2,nom:'Sofia',metier:'Coiffeuse',initials:'SO'},{id:3,nom:'Jade',metier:'Coiffeuse',initials:'JA'}],
    services:[
      {cat:'Coupes femme',items:[{nom:'Coupe + brushing',prix:65,duree:60},{nom:'Coupe sans brushing',prix:45,duree:45},{nom:'Brushing seul',prix:30,duree:30}]},
      {cat:'Couleur & Balayage',items:[{nom:'Couleur racines',prix:75,duree:90},{nom:'Balayage',prix:110,duree:120},{nom:'Mèches complètes',prix:130,duree:150}]},
      {cat:'Soins',items:[{nom:'Soin profond Davines',prix:35,duree:30},{nom:'Lissage brésilien',prix:200,duree:180}]},
    ],
  },
  '2': {
    id:'2', nom:'Barbershop Alex', type:'Barbier', adresse:'8 rue de Bretagne', ville:'Paris 3e', cp:'75003',
    note:5.0, avis:67, prixMin:22, dispo:true,
    grad:'linear-gradient(140deg,#A8B8D8,#7890BC)',
    bio:"Barbier traditionnel au rasoir droit. Ambiance raffinée, soin premium garanti. Votre style, notre métier.",
    horaires:[{j:'Lun',h:'10h–19h'},{j:'Mar',h:'10h–19h'},{j:'Mer',h:'10h–19h'},{j:'Jeu',h:'10h–20h'},{j:'Ven',h:'10h–20h'},{j:'Sam',h:'9h–18h'},{j:'Dim',h:'Fermé'}],
    photos:['#A8B8D8','#90A0C0','#7890AC','#B8C8E0'],
    staff:[{id:1,nom:'Alex',metier:'Barbier',initials:'AL'},{id:2,nom:'Mehdi',metier:'Barbier',initials:'ME'}],
    services:[
      {cat:'Coupe',items:[{nom:'Coupe homme',prix:22,duree:25},{nom:'Coupe dégradé',prix:25,duree:30}]},
      {cat:'Barbe',items:[{nom:'Taille de barbe',prix:18,duree:20},{nom:'Rasage au rasoir droit',prix:22,duree:30}]},
      {cat:'Formules',items:[{nom:'Coupe + barbe',prix:35,duree:50},{nom:'Coupe + barbe + soin',prix:45,duree:60}]},
    ],
  },
  '3': {
    id:'3', nom:'Studio Inès', type:'Salon femme', adresse:'52 rue Lepic', ville:'Paris 18e', cp:'75018',
    note:4.7, avis:89, prixMin:42, dispo:true,
    grad:'linear-gradient(140deg,#C5B0D8,#A090C0)',
    bio:"Spécialiste cheveux bouclés et crépus. Kératine, soins ultra-hydratants, tendances parisiennes.",
    horaires:[{j:'Lun',h:'Fermé'},{j:'Mar',h:'10h–19h'},{j:'Mer',h:'10h–19h'},{j:'Jeu',h:'10h–20h'},{j:'Ven',h:'10h–20h'},{j:'Sam',h:'9h–18h'},{j:'Dim',h:'10h–15h'}],
    photos:['#C5B0D8','#B09DC8','#9D8AB4','#D0C0E0'],
    staff:[{id:1,nom:'Inès',metier:'Spécialiste bouclés',initials:'IN'},{id:2,nom:'Naomi',metier:'Coloriste',initials:'NA'}],
    services:[
      {cat:'Coupes',items:[{nom:'Coupe femme',prix:42,duree:45},{nom:'Coupe bouclée',prix:55,duree:60}]},
      {cat:'Lissage & Kératine',items:[{nom:'Lissage brésilien',prix:190,duree:180},{nom:'Kératine express',prix:140,duree:120}]},
      {cat:'Couleur',items:[{nom:'Balayage',prix:95,duree:120},{nom:'Ombré hair',prix:110,duree:130}]},
    ],
  },
  '4': {
    id:'4', nom:'Atelier Beauté Marais', type:'Institut de beauté', adresse:'12 rue des Archives', ville:'Paris 4e', cp:'75004',
    note:4.8, avis:204, prixMin:22, dispo:true,
    grad:'linear-gradient(140deg,#B8D0C0,#90B098)',
    bio:"Institut haut de gamme : soins du visage, manucure gel, épilation à la cire. Produits Decléor exclusifs.",
    horaires:[{j:'Lun',h:'10h–19h'},{j:'Mar',h:'10h–19h'},{j:'Mer',h:'10h–19h'},{j:'Jeu',h:'10h–20h'},{j:'Ven',h:'10h–20h'},{j:'Sam',h:'9h–19h'},{j:'Dim',h:'Fermé'}],
    photos:['#B8D0C0','#A0C0A8','#88AC90','#C8E0D0'],
    staff:[{id:1,nom:'Camille',metier:'Esthéticienne',initials:'CA'},{id:2,nom:'Lucie',metier:'Prothésiste ongulaire',initials:'LU'}],
    services:[
      {cat:'Soins visage',items:[{nom:'Soin hydratant Decléor',prix:75,duree:60},{nom:'Peeling éclat',prix:90,duree:75}]},
      {cat:'Manucure & Pédicure',items:[{nom:'Pose vernis gel',prix:35,duree:45},{nom:'Manucure complète',prix:50,duree:60}]},
      {cat:'Épilation',items:[{nom:'Demi-jambes',prix:22,duree:20},{nom:'Jambes complètes',prix:38,duree:35}]},
    ],
  },
  '5': {
    id:'5', nom:'Le Barbier du Marais', type:'Barbier', adresse:'27 rue Vieille du Temple', ville:'Paris 4e', cp:'75004',
    note:4.6, avis:156, prixMin:25, dispo:false,
    grad:'linear-gradient(140deg,#D0B898,#B09070)',
    bio:"Maître barbier depuis 15 ans. Coupe au ciseau, rasage au coupe-chou, soins barbe premium.",
    horaires:[{j:'Lun',h:'Fermé'},{j:'Mar',h:'10h–19h'},{j:'Mer',h:'10h–19h'},{j:'Jeu',h:'10h–20h'},{j:'Ven',h:'10h–20h'},{j:'Sam',h:'9h–20h'},{j:'Dim',h:'Fermé'}],
    photos:['#D0B898','#C0A880','#B09870','#D8C0A0'],
    staff:[{id:1,nom:'Thomas',metier:'Maître barbier',initials:'TH'}],
    services:[
      {cat:'Coupe & Barbe',items:[{nom:'Coupe ciseau',prix:30,duree:35},{nom:'Coupe + barbe premium',prix:55,duree:60},{nom:'Rasage coupe-chou',prix:40,duree:45}]},
      {cat:'Soins barbe',items:[{nom:"Soin barbe huile d'argan",prix:20,duree:15},{nom:'Masque visage homme',prix:35,duree:30}]},
    ],
  },
  '6': {
    id:'6', nom:'Spa Lumière', type:'Spa & Bien-être', adresse:'5 avenue Montaigne', ville:'Paris 8e', cp:'75008',
    note:4.9, avis:78, prixMin:70, dispo:true,
    grad:'linear-gradient(140deg,#A8C5D8,#80A8C0)',
    bio:"Spa urbain haut de gamme. Massages, soins corps, rituels bien-être. Ambiance lumineuse et feutrée.",
    horaires:[{j:'Lun',h:'10h–20h'},{j:'Mar',h:'10h–20h'},{j:'Mer',h:'10h–20h'},{j:'Jeu',h:'10h–21h'},{j:'Ven',h:'10h–21h'},{j:'Sam',h:'9h–20h'},{j:'Dim',h:'10h–18h'}],
    photos:['#A8C5D8','#90B0C8','#78A0B8','#B8D0E0'],
    staff:[{id:1,nom:'Marie',metier:'Masseuse',initials:'MA'},{id:2,nom:'Yuki',metier:'Thérapeute',initials:'YU'}],
    services:[
      {cat:'Massages',items:[{nom:'Massage relaxant 60 min',prix:90,duree:60},{nom:'Massage sportif 60 min',prix:95,duree:60},{nom:'Massage duo 60 min',prix:170,duree:60}]},
      {cat:'Rituels',items:[{nom:'Rituel Lumière 90 min',prix:140,duree:90},{nom:'Rituel Oriental 120 min',prix:180,duree:120}]},
    ],
  },
};

function genCreneaux() {
  const out = [];
  const now = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(now); date.setDate(now.getDate() + d);
    const label = d===0?"Aujourd'hui":d===1?'Demain':date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'short'});
    const heures = [];
    for (let h=9;h<19;h++) { if(Math.random()>.42) heures.push(`${h}:00`); if(Math.random()>.5) heures.push(`${h}:30`); }
    if (heures.length) out.push({ label, date:date.toLocaleDateString('fr-FR'), heures });
  }
  return out;
}

function Stars({ note, size=12 }) {
  return <span>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(note)?DS.gold:'#E0DDD8',fontSize:size}}>★</span>)}</span>;
}

// ─── QR Code visuel (SVG) ─────────────────────────────────────────────────────
function QRCodeVisual({ bookingId }) {
  // Génère un pattern QR visuel simplifié basé sur l'ID
  const seed = bookingId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const cells = Array.from({length:25},(_,i)=>((seed*(i+7))%17)>7);
  return (
    <div style={{ width:160, height:160, padding:12, background:DS.bg, borderRadius:DS.r.md, border:`1px solid ${DS.border}`, margin:'0 auto', display:'inline-block' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3, width:'100%', height:'100%' }}>
        {cells.map((filled,i)=>(
          <div key={i} style={{ background:filled?DS.ink:'transparent', borderRadius:2 }} />
        ))}
      </div>
    </div>
  );
}

// ─── Booking widget (sidebar) ─────────────────────────────────────────────────
function BookingWidget({ salon, onClose }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState(null);
  const [creneau, setCreneau] = useState(null);
  const [form, setForm] = useState({ nom:'', prenom:'', email:'', telephone:'' });
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const creneaux = useRef(genCreneaux()).current;

  async function confirmer() {
    if (!form.nom||!form.prenom||!form.email||!form.telephone) return;
    setLoading(true);
    let bookingId = `RDV-${Date.now().toString(36).toUpperCase()}`;
    try {
      const res = await axios.post(`${API_URL}/reservations`, {
        pro_id:salon.id, secteur:'coiffure',
        service:service.nom, prix:service.prix,
        creneau:`${creneau.date} ${creneau.heure}${staff?` — avec ${staff.nom}`:''}`,
        ...form,
      });
      if (res.data?.reservation?.id) bookingId = `RDV-${res.data.reservation.id.toString(36).toUpperCase()}`;
    } catch (_) {}
    setLoading(false);
    setBooking({ id:bookingId, service, creneau, staff, form });
  }

  const btnStyle = (active) => ({
    display:'flex', justifyContent:'space-between', alignItems:'center',
    width:'100%', padding:'13px 16px', marginBottom:8,
    background: active ? DS.accentMuted : DS.bgSoft,
    border:`1px solid ${active ? DS.accent : DS.border}`,
    borderRadius:DS.r.md, cursor:'pointer', textAlign:'left', transition:'all .15s', fontFamily:DS.font,
  });

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', justifyContent:'flex-end' }}>
      {/* Overlay */}
      <div style={{ position:'absolute', inset:0, background:'rgba(10,10,10,0.45)', backdropFilter:'blur(8px)' }} onClick={onClose} />
      {/* Panneau */}
      <div style={{ position:'relative', zIndex:1, width:420, maxWidth:'100vw', height:'100%', background:DS.bg, boxShadow:DS.shadow.xl, display:'flex', flexDirection:'column', overflowY:'auto' }}>
        {/* Header */}
        <div style={{ padding:'24px 24px 0', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:11, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:4 }}>Prendre rendez-vous</div>
              <div style={{ fontSize:19, fontWeight:800, color:DS.ink, letterSpacing:'-0.04em' }}>{salon.nom}</div>
            </div>
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:'50%', background:DS.surface, border:'none', cursor:'pointer', fontSize:15, color:DS.muted, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>

          {!booking && (
            <div style={{ display:'flex', gap:6, marginBottom:24 }}>
              {['Prestation','Coiffeur','Créneau','Contact'].map((s,i)=>(
                <div key={s} style={{ flex:1 }}>
                  <div style={{ height:2.5, borderRadius:2, background:step>i?DS.accent:DS.border, marginBottom:5, transition:'background .3s' }} />
                  <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:1.5, fontWeight:step===i+1?700:400, color:step===i+1?DS.ink:DS.subtle }}>{s}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div style={{ flex:1, padding:'0 24px 32px', overflowY:'auto' }}>
          {booking ? (
            /* ── Confirmation + QR ── */
            <div style={{ textAlign:'center', paddingTop:16 }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:DS.accentMuted, margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DS.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontSize:20, fontWeight:800, color:DS.ink, letterSpacing:'-0.04em', marginBottom:6 }}>Rendez-vous confirmé !</div>
              <div style={{ fontSize:13, color:DS.muted, lineHeight:1.7, marginBottom:24 }}>
                <strong style={{color:DS.ink}}>{booking.service.nom}</strong> · {booking.service.prix} €<br/>
                {booking.creneau.date} à {booking.creneau.heure}
                {booking.staff ? ` · avec ${booking.staff.nom}` : ''}<br/>
                Confirmation envoyée à <strong style={{color:DS.ink}}>{booking.form.email}</strong>
              </div>

              {/* Récap paiement */}
              <div style={{ background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, padding:'16px', marginBottom:24 }}>
                <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:10 }}>Paiement sécurisé</div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, color:DS.muted }}>{booking.service.nom}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:DS.ink }}>{booking.service.prix} €</span>
                </div>
                <div style={{ height:1, background:DS.border, margin:'10px 0' }} />
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:DS.ink }}>Total</span>
                  <span style={{ fontSize:16, fontWeight:800, color:DS.accent }}>{booking.service.prix} €</span>
                </div>
                <div style={{ fontSize:11, color:DS.subtle, marginTop:8 }}>Payé en ligne · Libéré après validation du service</div>
              </div>

              {/* QR Code */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, color:DS.muted, marginBottom:12 }}>Présentez ce QR code à votre arrivée</div>
                <QRCodeVisual bookingId={booking.id} />
                <div style={{ fontSize:11, color:DS.subtle, marginTop:8, fontWeight:600, letterSpacing:1 }}>{booking.id}</div>
              </div>

              <div style={{ background:'#FFFBEB', border:`1px solid #FDE68A`, borderRadius:DS.r.md, padding:'12px 14px', fontSize:12, color:'#92400E', lineHeight:1.6, textAlign:'left' }}>
                <strong>Comment ça marche ?</strong><br/>
                1. Présentez le QR code à votre coiffeur<br/>
                2. À la fin de la prestation, il valide "Terminé" sur l'app<br/>
                3. Le paiement est automatiquement libéré
              </div>

              <button onClick={onClose} style={{ width:'100%', marginTop:20, padding:'14px', background:DS.ink, color:'#fff', border:'none', borderRadius:DS.r.full, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                Fermer
              </button>
            </div>
          ) : step===1 ? (
            <div>
              {salon.services.map(cat=>(
                <div key={cat.cat} style={{ marginBottom:20 }}>
                  <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:10 }}>{cat.cat}</div>
                  {cat.items.map(item=>(
                    <button key={item.nom} onClick={()=>{setService(item);setStep(2);}} style={btnStyle(service?.nom===item.nom)}
                      onMouseEnter={e=>{if(service?.nom!==item.nom){e.currentTarget.style.borderColor=DS.ink;e.currentTarget.style.background=DS.bgSoft;}}}
                      onMouseLeave={e=>{if(service?.nom!==item.nom){e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.background=DS.bgSoft;}}}>
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
          ) : step===2 ? (
            <div>
              {[{id:0,nom:'Sans préférence',metier:'Premier disponible',initials:'★',any:true},...salon.staff].map(s=>(
                <button key={s.id} onClick={()=>{setStaff(s.any?null:s);setStep(3);}}
                  style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'13px 16px', marginBottom:8, background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.md, cursor:'pointer', textAlign:'left', transition:'all .15s', fontFamily:DS.font }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=DS.ink;e.currentTarget.style.background=DS.bg;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.background=DS.bgSoft;}}>
                  <div style={{ width:42,height:42,borderRadius:'50%',background:s.any?DS.surface:DS.ink,display:'flex',alignItems:'center',justifyContent:'center',fontSize:s.any?18:12,color:s.any?DS.muted:'#fff',fontWeight:700,flexShrink:0 }}>{s.initials}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:DS.ink }}>{s.nom}</div>
                    <div style={{ fontSize:12, color:DS.muted }}>{s.metier}</div>
                  </div>
                </button>
              ))}
              <button onClick={()=>setStep(1)} style={{ fontSize:13, color:DS.muted, background:'none', border:'none', cursor:'pointer', marginTop:4 }}>← Retour</button>
            </div>
          ) : step===3 ? (
            <div>
              <div style={{ background:DS.accentMuted, border:`1px solid ${DS.accentLight}`, borderRadius:DS.r.md, padding:'10px 14px', marginBottom:18, fontSize:13, color:DS.ink }}>
                <strong>{service?.nom}</strong> · {service?.prix} €{staff?` · avec ${staff.nom}`:''}
              </div>
              {creneaux.map(jour=>(
                <div key={jour.label} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:DS.ink, marginBottom:8, textTransform:'capitalize' }}>{jour.label}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {jour.heures.map(h=>(
                      <button key={h} onClick={()=>{setCreneau({date:jour.date,heure:h});setStep(4);}}
                        style={{ padding:'8px 14px', background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, fontSize:13, fontWeight:500, color:DS.ink, cursor:'pointer', transition:'all .15s', fontFamily:DS.font }}
                        onMouseEnter={e=>{e.currentTarget.style.background=DS.accent;e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor=DS.accent;}}
                        onMouseLeave={e=>{e.currentTarget.style.background=DS.bgSoft;e.currentTarget.style.color=DS.ink;e.currentTarget.style.borderColor=DS.border;}}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={()=>setStep(2)} style={{ fontSize:13, color:DS.muted, background:'none', border:'none', cursor:'pointer' }}>← Retour</button>
            </div>
          ) : (
            <div>
              <div style={{ background:DS.accentMuted, border:`1px solid ${DS.accentLight}`, borderRadius:DS.r.md, padding:'12px 14px', marginBottom:20, fontSize:13, color:DS.ink, lineHeight:1.6 }}>
                <strong>{service?.nom}</strong> · {service?.prix} €<br/>
                {creneau?.date} à {creneau?.heure}{staff?` · avec ${staff.nom}`:''}
              </div>
              <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:14 }}>Vos coordonnées</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                {[['prenom','Prénom'],['nom','Nom']].map(([k,l])=>(
                  <input key={k} placeholder={l} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    style={{ padding:'12px 14px', border:`1px solid ${DS.border}`, borderRadius:DS.r.md, fontSize:13, color:DS.ink, background:DS.bgSoft, outline:'none', fontFamily:DS.font, boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor=DS.accent} onBlur={e=>e.target.style.borderColor=DS.border} />
                ))}
              </div>
              {[['email','E-mail','email'],['telephone','Téléphone','tel']].map(([k,l,t])=>(
                <input key={k} type={t} placeholder={l} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  style={{ display:'block', width:'100%', padding:'12px 14px', marginBottom:10, border:`1px solid ${DS.border}`, borderRadius:DS.r.md, fontSize:13, color:DS.ink, background:DS.bgSoft, outline:'none', fontFamily:DS.font, boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor=DS.accent} onBlur={e=>e.target.style.borderColor=DS.border} />
              ))}
              <button onClick={confirmer} disabled={loading||!form.prenom||!form.nom||!form.email||!form.telephone}
                style={{ width:'100%', padding:'14px', background:!form.prenom||!form.nom||!form.email||!form.telephone?DS.border:DS.accent, color:'#fff', border:'none', borderRadius:DS.r.full, fontWeight:700, fontSize:14, cursor:loading?'wait':'pointer', marginTop:6, transition:'background .2s', fontFamily:DS.font }}>
                {loading?'Réservation…':'Confirmer & payer en ligne'}
              </button>
              <div style={{ fontSize:11, color:DS.subtle, textAlign:'center', marginTop:10, lineHeight:1.6 }}>
                🔒 Paiement sécurisé · Annulation gratuite 24h avant<br/>
                Aucun compte requis
              </div>
              <button onClick={()=>setStep(3)} style={{ display:'block', margin:'12px auto 0', fontSize:13, color:DS.muted, background:'none', border:'none', cursor:'pointer' }}>← Retour</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function SalonDetailPage() {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const salon = SALONS[salonId];
  const [tab, setTab] = useState('services');
  const [activePhoto, setActivePhoto] = useState(0);
  const [showBooking, setShowBooking] = useState(false);

  if (!salon) {
    navigate('/coiffure'); return null;
  }

  const todayIdx = new Date().getDay(); // 0=dim
  const dayMap = { Lun:1,Mar:2,Mer:3,Jeu:4,Ven:5,Sam:6,Dim:0 };

  return (
    <div style={{ minHeight:'100vh', background:DS.bg, fontFamily:DS.font, color:DS.ink }}>
      <RecrutementBanner secteur="coiffure" />
      <PublicNavbar />

      {/* Fil d'Ariane */}
      <div style={{ padding:'12px clamp(16px,5vw,48px)', borderBottom:`1px solid ${DS.border}`, display:'flex', alignItems:'center', gap:8, fontSize:13, color:DS.muted }}>
        <button onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', color:DS.muted, fontSize:13, fontFamily:DS.font, padding:0 }}>Accueil</button>
        <span>›</span>
        <button onClick={()=>navigate('/coiffure')} style={{ background:'none', border:'none', cursor:'pointer', color:DS.muted, fontSize:13, fontFamily:DS.font, padding:0 }}>Coiffure</button>
        <span>›</span>
        <span style={{ color:DS.ink, fontWeight:600 }}>{salon.nom}</span>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'clamp(24px,4vh,40px) clamp(16px,5vw,48px)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:32, alignItems:'start' }}>

          {/* ── Colonne gauche ── */}
          <div>
            {/* Photos */}
            <div style={{ borderRadius:DS.r.xl, overflow:'hidden', marginBottom:28, aspectRatio:'16/7', background:salon.photos[activePhoto], position:'relative', transition:'background .4s' }}>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.5))' }} />
              <div style={{ position:'absolute', bottom:16, left:20, right:20, zIndex:1 }}>
                <div style={{ display:'flex', gap:8 }}>
                  {salon.photos.map((p,i)=>(
                    <button key={i} onClick={()=>setActivePhoto(i)}
                      style={{ width:48, height:36, borderRadius:DS.r.sm, background:p, border:`2px solid ${i===activePhoto?'#fff':'rgba(255,255,255,0.3)'}`, cursor:'pointer', transition:'border-color .15s' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Infos */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2.5, fontWeight:600, marginBottom:8 }}>{salon.type}</div>
              <h1 style={{ fontSize:'clamp(1.5rem,4vw,2.25rem)', fontWeight:900, letterSpacing:'-0.05em', color:DS.ink, margin:'0 0 10px', lineHeight:1.1 }}>{salon.nom}</h1>
              <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <Stars note={salon.note} size={13} />
                  <span style={{ fontSize:14, fontWeight:700, color:DS.ink }}>{salon.note}</span>
                  <span style={{ fontSize:13, color:DS.muted }}>({salon.avis} avis)</span>
                </div>
                <span style={{ color:DS.border }}>·</span>
                <span style={{ fontSize:13, color:DS.muted }}>📍 {salon.adresse}, {salon.ville}</span>
              </div>
              {salon.dispo && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', background:DS.greenBg, borderRadius:DS.r.full, fontSize:12, color:DS.green, fontWeight:600 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:DS.green }} />
                  Disponible aujourd'hui
                </span>
              )}
            </div>

            <p style={{ fontSize:15, color:DS.muted, lineHeight:1.75, marginBottom:28, paddingBottom:28, borderBottom:`1px solid ${DS.border}` }}>{salon.bio}</p>

            {/* Onglets */}
            <div style={{ display:'flex', borderBottom:`1px solid ${DS.border}`, marginBottom:24 }}>
              {[['services','Prestations'],['staff',"L'équipe"],['horaires','Horaires'],['avis','Avis']].map(([k,label])=>(
                <button key={k} onClick={()=>setTab(k)} style={{ flex:1, padding:'11px 0', background:'none', border:'none', borderBottom:`2px solid ${tab===k?DS.accent:'transparent'}`, fontSize:13, fontWeight:tab===k?700:400, color:tab===k?DS.ink:DS.muted, cursor:'pointer', marginBottom:-1, transition:'color .15s', fontFamily:DS.font }}>
                  {label}
                </button>
              ))}
            </div>

            {tab==='services' && (
              <div>
                {salon.services.map(cat=>(
                  <div key={cat.cat} style={{ marginBottom:24 }}>
                    <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:10 }}>{cat.cat}</div>
                    {cat.items.map(item=>(
                      <div key={item.nom} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderBottom:`1px solid ${DS.border}` }}>
                        <div>
                          <div style={{ fontSize:14, fontWeight:500, color:DS.ink, marginBottom:2 }}>{item.nom}</div>
                          <div style={{ fontSize:12, color:DS.muted }}>{item.duree} min</div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <span style={{ fontSize:15, fontWeight:700, color:DS.ink }}>{item.prix} €</span>
                          <button onClick={()=>setShowBooking(true)} style={{ padding:'6px 14px', background:DS.accentMuted, border:`1px solid ${DS.accentLight}`, borderRadius:DS.r.full, fontSize:12, fontWeight:600, color:DS.accent, cursor:'pointer', transition:'all .15s', fontFamily:DS.font }}
                            onMouseEnter={e=>{e.currentTarget.style.background=DS.accent;e.currentTarget.style.color='#fff';}}
                            onMouseLeave={e=>{e.currentTarget.style.background=DS.accentMuted;e.currentTarget.style.color=DS.accent;}}>
                            Réserver
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {tab==='staff' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14 }}>
                {salon.staff.map(s=>(
                  <div key={s.id} style={{ padding:'16px', background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:46, height:46, borderRadius:'50%', background:DS.ink, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', fontWeight:700, flexShrink:0 }}>{s.initials}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:DS.ink }}>{s.nom}</div>
                      <div style={{ fontSize:12, color:DS.muted }}>{s.metier}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab==='horaires' && (
              <div style={{ maxWidth:360 }}>
                {salon.horaires.map((h,i)=>{
                  const isToday = dayMap[h.j]===todayIdx;
                  return (
                    <div key={h.j} style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:i<salon.horaires.length-1?`1px solid ${DS.border}`:'none' }}>
                      <span style={{ fontSize:14, fontWeight:isToday?700:400, color:isToday?DS.ink:DS.muted }}>
                        {h.j}
                        {isToday && <span style={{ marginLeft:8, fontSize:10, color:DS.gold, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Aujourd'hui</span>}
                      </span>
                      <span style={{ fontSize:14, color:h.h==='Fermé'?DS.subtle:DS.ink, fontWeight:isToday?600:400 }}>{h.h}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {tab==='avis' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[{nom:'Marie L.',note:5,txt:'Léa est incroyable, le balayage est parfait et les produits sentent divinement bon.',date:'Il y a 3 jours'},{nom:'Sophie R.',note:5,txt:'Super accueil, résultat magnifique. Je reviendrai sans hésiter !',date:'Il y a 1 semaine'},{nom:'Emma D.',note:4,txt:'Très bon salon, soin kératine bien fait. Un peu d\'attente mais le résultat est là.',date:'Il y a 2 semaines'}].map((a,i)=>(
                  <div key={i} style={{ padding:'16px', background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:DS.surface, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:DS.muted }}>{a.nom[0]}</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:DS.ink }}>{a.nom}</div>
                          <Stars note={a.note} size={10} />
                        </div>
                      </div>
                      <span style={{ fontSize:11, color:DS.subtle }}>{a.date}</span>
                    </div>
                    <p style={{ fontSize:13, color:DS.muted, lineHeight:1.6, margin:0 }}>{a.txt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Colonne droite — widget sticky ── */}
          <div style={{ position:'sticky', top:DS.navH+16 }}>
            <div style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, padding:'24px', boxShadow:DS.shadow.md }}>
              <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:6 }}>À partir de</div>
              <div style={{ fontSize:32, fontWeight:900, color:DS.ink, letterSpacing:'-0.05em', marginBottom:4 }}>{salon.prixMin} €</div>
              <div style={{ fontSize:13, color:DS.muted, marginBottom:20 }}>· {salon.adresse}, {salon.ville}</div>

              <button onClick={()=>setShowBooking(true)}
                style={{ width:'100%', padding:'15px', background:DS.accent, color:'#fff', border:'none', borderRadius:DS.r.full, fontWeight:700, fontSize:15, cursor:'pointer', transition:'background .15s, transform .15s', letterSpacing:0.2, fontFamily:DS.font }}
                onMouseEnter={e=>{e.currentTarget.style.background=DS.accentHover;e.currentTarget.style.transform='translateY(-1px)';}}
                onMouseLeave={e=>{e.currentTarget.style.background=DS.accent;e.currentTarget.style.transform='none';}}>
                Prendre rendez-vous
              </button>

              <div style={{ marginTop:16, fontSize:11.5, color:DS.muted, textAlign:'center', lineHeight:1.6 }}>
                🔒 Paiement sécurisé · Sans compte requis<br/>
                Annulation gratuite jusqu'à 24h avant
              </div>

              <div style={{ marginTop:18, paddingTop:18, borderTop:`1px solid ${DS.border}` }}>
                <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:12 }}>Horaires</div>
                {salon.horaires.filter(h=>h.h!=='Fermé').slice(0,3).map(h=>(
                  <div key={h.j} style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, color:DS.muted }}>{h.j}</span>
                    <span style={{ fontSize:12, color:DS.ink, fontWeight:500 }}>{h.h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && <BookingWidget salon={salon} onClose={()=>setShowBooking(false)} />}
    </div>
  );
}
