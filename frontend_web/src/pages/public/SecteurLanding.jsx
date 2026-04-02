import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Design System ────────────────────────────────────────────────────────────
const DS = {
  bg:      '#FAFAF8',
  white:   '#FFFFFF',
  surface: '#F4F3F0',
  ink:     '#0A0A0A',
  muted:   '#6B6B6B',
  subtle:  '#AAAAAA',
  border:  '#E8E7E4',
  gold:    '#C9A96E',
  green:   '#2A7C2A',
  greenBg: '#EEF6EE',
};

// ─── Config par secteur ────────────────────────────────────────────────────────
const SECTEUR_CONFIG = {
  restaurant:  { label:'Restaurants',                emoji:'🍽️', placeholder:'Cuisine, ambiance, adresse…', filtres:['Tous','Sur place','À emporter','Livraison','Traiteur'] },
  boulangerie: { label:'Boulangeries & Pâtisseries', emoji:'🥖', placeholder:'Pain, viennoiserie, gâteau…',  filtres:['Tous','Boulangerie','Pâtisserie','Bio','Livraison'] },
  garage:      { label:'Garages & Auto',             emoji:'🔧', placeholder:'Vidange, pneus, diagnostic…', filtres:['Tous','Mécanique','Carrosserie','Pneus','Diagnostic'] },
  commerce:    { label:'Commerces de proximité',     emoji:'🛍️', placeholder:'Fleuriste, pressing, épicerie…',filtres:['Tous','Fleuriste','Pressing','Épicerie','Librairie'] },
  coiffure:    { label:'Coiffure & Beauté',          emoji:'✂️', placeholder:'Coupe, couleur, balayage…',   filtres:['Tous','Salon','Barbier','Institut','Domicile'] },
};

// ─── Données démo ──────────────────────────────────────────────────────────────
const PROS_DEMO = {
  restaurant: [
    { id:1, nom:'Chez Marco', type:'Sur place', ville:'Lyon 2e', note:4.8, avis:89, dispo:true, bio:'Cuisine italienne authentique, pâtes fraîches maison.', grad:'linear-gradient(140deg,#E8C8A0,#C8A070)', initials:'CM', services:[{nom:'Menu midi',prix:16},{nom:'Menu soir complet',prix:28},{nom:'Pizza au feu de bois',prix:14}], horaires:'Lun–Dim · 12h–22h30' },
    { id:2, nom:'Le Bistrot Paulette', type:'Sur place', ville:'Lyon 6e', note:4.9, avis:201, dispo:true, bio:'Cuisine française, produits du marché, vins naturels.', grad:'linear-gradient(140deg,#D4B0A0,#B09080)', initials:'BP', services:[{nom:'Formule midi',prix:19},{nom:'Menu dégustation',prix:48}], horaires:'Mar–Sam · 12h–14h · 19h30–22h' },
    { id:3, nom:'Sushi Kokoro', type:'Sur place', ville:'Lyon 3e', note:4.7, avis:134, dispo:true, bio:'Sushis artisanaux, poissons frais quotidiens.', grad:'linear-gradient(140deg,#A8B8C8,#8898A8)', initials:'SK', services:[{nom:'Menu déjeuner',prix:15},{nom:'Plateau sushis',prix:22},{nom:'Omakase',prix:55}], horaires:'Lun–Sam · 12h–14h30 · 19h–22h' },
    { id:4, nom:'La Brasserie du Port', type:'Sur place', ville:'Lyon 1er', note:4.5, avis:312, dispo:false, bio:'Brasserie emblématique avec vue sur la Saône.', grad:'linear-gradient(140deg,#C0B8A8,#A09880)', initials:'BP', services:[{nom:'Formule brasserie',prix:24},{nom:'Fruits de mer',prix:38}], horaires:'Lun–Dim · 11h30–23h' },
  ],
  boulangerie: [
    { id:1, nom:'Maison Dupont', type:'Boulangerie', ville:'Bordeaux Centre', note:4.9, avis:213, dispo:true, bio:'Pain au levain, pains spéciaux, viennoiseries artisanales.', grad:'linear-gradient(140deg,#E8C890,#C8A860)', initials:'MD', services:[{nom:'Baguette tradition',prix:1.20},{nom:'Pain au levain 500g',prix:4.50},{nom:'Croissant',prix:1.40}], horaires:'Lun–Sam · 7h–19h30' },
    { id:2, nom:'Pâtisserie Laurent', type:'Pâtisserie', ville:'Bordeaux Chartrons', note:4.8, avis:98, dispo:true, bio:'Pâtisseries fines, gâteaux d\'anniversaire sur commande.', grad:'linear-gradient(140deg,#D4C0B0,#B4A090)', initials:'PL', services:[{nom:'Éclair',prix:3.80},{nom:'Paris-Brest',prix:4.20},{nom:'Gâteau sur commande',prix:45}], horaires:'Mar–Sam · 8h–19h' },
    { id:3, nom:'Le Four du Quartier', type:'Boulangerie', ville:'Bordeaux Saint-Michel', note:4.6, avis:156, dispo:true, bio:'Boulangerie familiale depuis 30 ans. Recettes transmises.', grad:'linear-gradient(140deg,#C8B898,#A89870)', initials:'FQ', services:[{nom:'Pain de campagne',prix:3.80},{nom:'Baguette',prix:1.10}], horaires:'Lun–Sam · 6h30–19h' },
  ],
  garage: [
    { id:1, nom:'Garage Martin', type:'Mécanique', ville:'Toulouse Nord', note:4.7, avis:54, dispo:true, bio:'Mécanique générale, diagnostic, révision constructeur.', grad:'linear-gradient(140deg,#B0C0B0,#909888)', initials:'GM', services:[{nom:'Vidange',prix:69},{nom:'Diagnostic OBD',prix:45},{nom:'Révision complète',prix:199}], horaires:'Lun–Ven · 8h–18h · Sam 8h–12h' },
    { id:2, nom:'AutoService Pro', type:'Carrosserie', ville:'Toulouse Centre', note:4.5, avis:87, dispo:true, bio:'Carrosserie, peinture, débosselage sans peinture.', grad:'linear-gradient(140deg,#C0B8A8,#A09888)', initials:'AS', services:[{nom:'Débosselage PDR',prix:120},{nom:'Retouche peinture',prix:200},{nom:'Remplacement pare-chocs',prix:350}], horaires:'Lun–Ven · 8h30–18h30' },
    { id:3, nom:'Pneus Express', type:'Pneus', ville:'Toulouse Est', note:4.8, avis:203, dispo:false, bio:'Spécialiste pneumatiques, équilibrage, géométrie.', grad:'linear-gradient(140deg,#A8A8B8,#888898)', initials:'PE', services:[{nom:'Montage pneu (x4)',prix:40},{nom:'Géométrie',prix:89},{nom:'Équilibrage',prix:30}], horaires:'Lun–Sam · 8h–18h' },
  ],
  commerce: [
    { id:1, nom:'Fleurs & Sens', type:'Fleuriste', ville:'Paris 15e', note:4.9, avis:67, dispo:true, bio:'Compositions florales créatives, livraison dans Paris.', grad:'linear-gradient(140deg,#C8D8B8,#A8B898)', initials:'FS', services:[{nom:'Bouquet de saison',prix:35},{nom:'Composition sur-mesure',prix:65},{nom:'Livraison Paris',prix:8}], horaires:'Mar–Sam · 9h–19h' },
    { id:2, nom:'Pressing du Marché', type:'Pressing', ville:'Paris 14e', note:4.6, avis:145, dispo:true, bio:'Nettoyage à sec express, blanchisserie, retouches.', grad:'linear-gradient(140deg,#B8C8D8,#98A8B8)', initials:'PM', services:[{nom:'Chemise',prix:4.50},{nom:'Costume',prix:18},{nom:'Veste seule',prix:10}], horaires:'Lun–Sam · 8h–19h30' },
  ],
};

// ─── Génération créneaux ───────────────────────────────────────────────────────
function genCreneaux() {
  const out = [];
  const now = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(now); date.setDate(now.getDate() + d);
    const label = d === 0 ? "Aujourd'hui" : d === 1 ? 'Demain'
      : date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
    const heures = [];
    for (let h = 9; h < 19; h++) {
      if (Math.random() > 0.5) heures.push(`${h}:00`);
      if (Math.random() > 0.55) heures.push(`${h}:30`);
    }
    if (heures.length) out.push({ label, date: date.toLocaleDateString('fr-FR'), heures });
  }
  return out;
}

function Stars({ note }) {
  return <span>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(note)?DS.gold:'#DEDED8',fontSize:11}}>★</span>)}</span>;
}

// ─── Modal Réservation ────────────────────────────────────────────────────────
function ModalReservation({ pro, cfg, onClose }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [creneau, setCreneau] = useState(null);
  const [form, setForm] = useState({ nom:'', prenom:'', email:'', telephone:'' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const creneaux = useRef(genCreneaux()).current;

  async function confirmer() {
    if (!form.nom || !form.prenom || !form.email || !form.telephone) return;
    setLoading(true);
    try { await axios.post(`${API}/reservations`, { pro_id:pro.id, secteur:cfg?.emoji, service:service.nom, prix:service.prix, creneau, ...form }); } catch (_) {}
    setLoading(false); setDone(true);
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,10,10,0.6)', backdropFilter:'blur(12px)', zIndex:9999, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:DS.white, borderRadius:'24px 24px 0 0', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 -8px 48px rgba(0,0,0,0.15)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'#E0E0E0' }} />
        </div>
        <div style={{ padding:'20px 28px 40px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:11, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:4 }}>Réservation</div>
              <div style={{ fontSize:20, fontWeight:800, color:DS.ink, letterSpacing:'-0.04em' }}>{pro.nom}</div>
            </div>
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:'50%', background:DS.surface, border:'none', cursor:'pointer', fontSize:15, color:DS.muted }}>✕</button>
          </div>

          {!done && (
            <div style={{ display:'flex', gap:6, marginBottom:24 }}>
              {['Prestation','Créneau','Contact'].map((s,i)=>(
                <div key={s} style={{ flex:1 }}>
                  <div style={{ height:2, borderRadius:2, background:step>i?DS.ink:'#E8E7E4', marginBottom:5, transition:'background .3s' }} />
                  <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:1.5, fontWeight:step===i+1?700:400, color:step===i+1?DS.ink:DS.subtle }}>{s}</div>
                </div>
              ))}
            </div>
          )}

          {done ? (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:DS.surface, margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>✓</div>
              <div style={{ fontSize:20, fontWeight:800, color:DS.ink, letterSpacing:'-0.04em', marginBottom:8 }}>Réservé !</div>
              <div style={{ fontSize:13, color:DS.muted, lineHeight:1.7 }}>
                <strong style={{color:DS.ink}}>{service?.nom}</strong><br/>{creneau}<br/>
                Confirmation par e-mail.
              </div>
              <button onClick={onClose} style={{ marginTop:24, padding:'12px 32px', background:DS.ink, color:'#fff', border:'none', borderRadius:100, fontWeight:700, cursor:'pointer' }}>Fermer</button>
            </div>
          ) : step===1 ? (
            <div>
              <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:2, fontWeight:600, marginBottom:12 }}>Choisir une prestation</div>
              {pro.services.map(s => (
                <button key={s.nom} onClick={()=>{setService(s);setStep(2);}}
                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', padding:'14px 16px', marginBottom:8, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:12, cursor:'pointer', textAlign:'left', transition:'all .18s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=DS.ink;e.currentTarget.style.background=DS.white;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.background=DS.bg;}}>
                  <span style={{ fontSize:14, fontWeight:500, color:DS.ink }}>{s.nom}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:DS.ink }}>{typeof s.prix==='number'&&s.prix<10?`${s.prix.toFixed(2)} €`:`${s.prix} €`}</span>
                </button>
              ))}
            </div>
          ) : step===2 ? (
            <div>
              <div style={{ background:DS.surface, borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:DS.ink }}>
                <strong>{service?.nom}</strong> · {typeof service?.prix==='number'&&service?.prix<10?`${service.prix.toFixed(2)} €`:`${service?.prix} €`}
              </div>
              {creneaux.map(jour=>(
                <div key={jour.label} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:DS.ink, marginBottom:8, textTransform:'capitalize' }}>{jour.label}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {jour.heures.map(h=>(
                      <button key={h} onClick={()=>{setCreneau(`${jour.date} à ${h}`);setStep(3);}}
                        style={{ padding:'8px 13px', background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:8, fontSize:13, fontWeight:500, color:DS.ink, cursor:'pointer', transition:'all .15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.background=DS.ink;e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor=DS.ink;}}
                        onMouseLeave={e=>{e.currentTarget.style.background=DS.bg;e.currentTarget.style.color=DS.ink;e.currentTarget.style.borderColor=DS.border;}}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={()=>setStep(1)} style={{ fontSize:13, color:DS.muted, background:'none', border:'none', cursor:'pointer', marginTop:4 }}>← Retour</button>
            </div>
          ) : (
            <div>
              <div style={{ background:DS.surface, borderRadius:10, padding:'12px 14px', marginBottom:16, fontSize:13, color:DS.ink }}>
                <strong>{service?.nom}</strong> · {creneau}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                {[['prenom','Prénom'],['nom','Nom']].map(([k,l])=>(
                  <input key={k} placeholder={l} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    style={{ padding:'12px 14px', border:`1px solid ${DS.border}`, borderRadius:10, fontSize:13, color:DS.ink, background:DS.bg, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
                ))}
              </div>
              {[['email','E-mail','email'],['telephone','Téléphone','tel']].map(([k,l,t])=>(
                <input key={k} type={t} placeholder={l} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  style={{ display:'block', width:'100%', padding:'12px 14px', marginBottom:10, border:`1px solid ${DS.border}`, borderRadius:10, fontSize:13, color:DS.ink, background:DS.bg, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
              ))}
              <button onClick={confirmer} disabled={loading||!form.prenom||!form.nom||!form.email||!form.telephone}
                style={{ width:'100%', padding:'14px', background:!form.prenom||!form.nom||!form.email||!form.telephone?'#CCC':DS.ink, color:'#fff', border:'none', borderRadius:100, fontWeight:700, fontSize:14, cursor:'pointer', marginTop:4, transition:'background .2s' }}>
                {loading?'Confirmation…':'Confirmer'}
              </button>
              <div style={{ fontSize:11, color:DS.subtle, textAlign:'center', marginTop:10 }}>Paiement sur place · Annulation gratuite 24h avant</div>
              <button onClick={()=>setStep(2)} style={{ display:'block', margin:'10px auto 0', fontSize:13, color:DS.muted, background:'none', border:'none', cursor:'pointer' }}>← Retour</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Carte professionnel ──────────────────────────────────────────────────────
function ProCard({ pro, cfg, onReserver }) {
  return (
    <div style={{ background:DS.white, border:`1px solid ${DS.border}`, borderRadius:16, overflow:'hidden', transition:'box-shadow .2s, transform .2s', cursor:'pointer' }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.09)';e.currentTarget.style.transform='translateY(-2px)';}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}>
      {/* Header */}
      <div style={{ height:80, background:pro.grad, position:'relative', display:'flex', alignItems:'flex-end', padding:'0 16px 12px' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 20%, rgba(10,10,10,0.35))' }} />
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:42, height:42, borderRadius:12, background:'rgba(255,255,255,0.25)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff', fontWeight:800, border:'1.5px solid rgba(255,255,255,0.4)' }}>{pro.initials}</div>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff', letterSpacing:'-0.03em', lineHeight:1.2 }}>{pro.nom}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', marginTop:1 }}>{pro.type}</div>
          </div>
        </div>
        {pro.dispo && (
          <div style={{ position:'absolute', top:10, right:12, display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', borderRadius:100, padding:'3px 9px' }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#5DDB5D' }} />
            <span style={{ fontSize:10, color:'#fff', fontWeight:600 }}>Dispo</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
          <Stars note={pro.note} />
          <span style={{ fontSize:12, fontWeight:700, color:DS.ink }}>{pro.note}</span>
          <span style={{ fontSize:12, color:DS.muted }}>({pro.avis} avis)</span>
          <span style={{ marginLeft:'auto', fontSize:12, color:DS.muted }}>{pro.ville}</span>
        </div>
        <div style={{ fontSize:12, color:DS.muted, lineHeight:1.5, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{pro.bio}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
          {pro.services.slice(0,3).map(s=>(
            <span key={s.nom} style={{ padding:'3px 9px', background:DS.surface, borderRadius:100, fontSize:11, color:DS.ink }}>
              {s.nom} · <strong>{typeof s.prix==='number'&&s.prix<10?`${s.prix.toFixed(2)}€`:`${s.prix}€`}</strong>
            </span>
          ))}
        </div>
        <div style={{ fontSize:11, color:DS.subtle, marginBottom:12 }}>⏰ {pro.horaires}</div>
      </div>

      {/* Footer */}
      <div style={{ padding:'12px 16px 14px', borderTop:`1px solid ${DS.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <span style={{ fontSize:11, color:DS.muted }}>À partir de </span>
          <span style={{ fontSize:15, fontWeight:800, color:DS.ink }}>
            {typeof pro.services[0]?.prix==='number'&&pro.services[0]?.prix<10
              ?`${Math.min(...pro.services.map(s=>s.prix)).toFixed(2)} €`
              :`${Math.min(...pro.services.map(s=>s.prix))} €`}
          </span>
        </div>
        <button onClick={()=>pro.dispo&&onReserver(pro)} disabled={!pro.dispo}
          style={{ padding:'9px 20px', background:pro.dispo?DS.ink:'#E0E0E0', border:'none', borderRadius:100, fontSize:12, fontWeight:700, color:pro.dispo?'#fff':DS.subtle, cursor:pro.dispo?'pointer':'default', transition:'opacity .15s' }}
          onMouseEnter={e=>{if(pro.dispo)e.currentTarget.style.opacity='0.8';}}
          onMouseLeave={e=>{e.currentTarget.style.opacity='1';}}>
          {pro.dispo?'Réserver':'Complet'}
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

  useEffect(() => { setMounted(true); window.scrollTo(0,0); }, [secteur]);
  if (!cfg) { navigate('/'); return null; }

  const prosFiltres = prosDemo.filter(p => {
    const mq = !query || p.nom.toLowerCase().includes(query.toLowerCase()) || p.services.some(s=>s.nom.toLowerCase().includes(query.toLowerCase()));
    const mf = filtre === 'Tous' || p.type === filtre;
    return mq && mf;
  }).sort((a,b) => (b.dispo?1:0)-(a.dispo?1:0) || b.note-a.note);

  return (
    <div style={{ minHeight:'100vh', background:DS.bg, fontFamily:"-apple-system,'SF Pro Display','Inter','Helvetica Neue',sans-serif", color:DS.ink }}>

      {/* ── Bandeau recrutement ── */}
      <div onClick={()=>navigate('/recrutement')}
        style={{ background:'#F9F6EE', borderBottom:`1px solid #EDE8D4`, padding:'10px 32px', display:'flex', alignItems:'center', justifyContent:'center', gap:10, cursor:'pointer', transition:'background .15s' }}
        onMouseEnter={e=>e.currentTarget.style.background='#F3EFE2'}
        onMouseLeave={e=>e.currentTarget.style.background='#F9F6EE'}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:DS.gold, boxShadow:`0 0 8px rgba(201,169,110,0.7)`, flexShrink:0 }} />
        <span style={{ fontSize:13, color:'#7A6840' }}>Des entreprises du secteur {cfg.label.toLowerCase()} recrutent</span>
        <span style={{ fontSize:13, color:'#5A4820', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
          Voir les offres
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>

      {/* ── Navbar ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:56, background:'rgba(250,250,248,0.95)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${DS.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:17, fontWeight:800, color:DS.ink, letterSpacing:'-0.05em', fontFamily:'inherit' }}>
            Artisans<span style={{ color:DS.gold }}>.</span>
          </button>
          <span style={{ color:DS.border }}>›</span>
          <span style={{ fontSize:13, color:DS.muted, fontWeight:500 }}>{cfg.emoji} {cfg.label}</span>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <button onClick={()=>navigate('/recrutement')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:DS.muted, padding:'6px 10px', transition:'color .15s' }}
            onMouseEnter={e=>e.currentTarget.style.color=DS.ink} onMouseLeave={e=>e.currentTarget.style.color=DS.muted}>Emploi</button>
          <button onClick={()=>navigate('/login')} style={{ padding:'7px 16px', background:'none', border:`1px solid ${DS.border}`, borderRadius:100, fontSize:12, fontWeight:500, color:DS.muted, cursor:'pointer', transition:'all .15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=DS.ink;e.currentTarget.style.color=DS.ink;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.color=DS.muted;}}>Se connecter</button>
          <button onClick={()=>navigate(`/register?secteur=${secteur}`)} style={{ padding:'7px 20px', background:DS.ink, border:'none', borderRadius:100, fontSize:12, fontWeight:600, color:'#fff', cursor:'pointer', transition:'opacity .15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Créer un compte</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background:DS.white, borderBottom:`1px solid ${DS.border}`, padding:'clamp(40px,7vh,64px) 32px clamp(28px,4vh,44px)', textAlign:'center', opacity:mounted?1:0, transform:mounted?'none':'translateY(14px)', transition:'opacity .5s, transform .5s' }}>
        <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:3, fontWeight:600, marginBottom:12 }}>{cfg.emoji} {cfg.label}</div>
        <h1 style={{ fontSize:'clamp(1.875rem,4vw,3rem)', fontWeight:900, letterSpacing:'-0.05em', color:DS.ink, margin:'0 0 28px', lineHeight:1.08 }}>
          Les meilleurs {cfg.label.toLowerCase()}<br/>près de chez vous
        </h1>

        {/* Barre de recherche */}
        <div style={{ display:'flex', maxWidth:580, margin:'0 auto', border:`1.5px solid ${DS.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 18px', gap:10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={DS.subtle} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={cfg.placeholder}
              style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:14, color:DS.ink, fontFamily:'inherit', padding:'14px 0' }} />
          </div>
          <button style={{ background:DS.ink, border:'none', cursor:'pointer', padding:'0 22px', fontWeight:700, color:'#fff', fontSize:13, transition:'opacity .15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Rechercher
          </button>
        </div>

        {/* Filtres */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginTop:16 }}>
          {cfg.filtres.map(f=>(
            <button key={f} onClick={()=>setFiltre(f)}
              style={{ padding:'6px 16px', borderRadius:100, border:`1px solid ${filtre===f?DS.ink:DS.border}`, background:filtre===f?DS.ink:'transparent', color:filtre===f?'#fff':DS.muted, fontSize:12, fontWeight:filtre===f?600:400, cursor:'pointer', transition:'all .15s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Liste ── */}
      <div style={{ padding:'clamp(24px,4vh,40px) 32px clamp(48px,7vh,80px)', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <span style={{ fontSize:12, color:DS.muted }}>{prosFiltres.length} professionnel{prosFiltres.length!==1?'s':''} trouvé{prosFiltres.length!==1?'s':''}</span>
          <span style={{ fontSize:11, color:DS.subtle }}>Tri : disponibilité + note</span>
        </div>

        {prosFiltres.length===0 ? (
          <div style={{ textAlign:'center', padding:'64px 20px', color:DS.muted }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:6, color:DS.ink }}>Aucun résultat</div>
            <div style={{ fontSize:13 }}>Essayez un autre mot-clé ou retirez les filtres</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
            {prosFiltres.map(pro=><ProCard key={pro.id} pro={pro} cfg={cfg} onReserver={setProSelected} />)}
          </div>
        )}

        {/* CTA pro */}
        <div style={{ marginTop:48, padding:'28px 32px', background:DS.white, border:`1px solid ${DS.border}`, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:DS.ink, letterSpacing:'-0.03em', marginBottom:4 }}>Vous êtes {cfg.emoji} professionnel ?</div>
            <div style={{ fontSize:13, color:DS.muted }}>Rejoignez la plateforme et recevez des réservations dès aujourd'hui.</div>
          </div>
          <button onClick={()=>navigate(`/register?secteur=${secteur}&role=patron`)}
            style={{ flexShrink:0, background:DS.ink, border:'none', cursor:'pointer', padding:'12px 24px', borderRadius:100, fontSize:13, fontWeight:700, color:'#fff', transition:'opacity .15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Créer mon profil pro →
          </button>
        </div>
      </div>

      {proSelected && <ModalReservation pro={proSelected} cfg={cfg} onClose={()=>setProSelected(null)} />}
    </div>
  );
}
