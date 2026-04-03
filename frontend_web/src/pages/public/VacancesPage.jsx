import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';

const TYPES = ['Tout', '🏠 Maison', '🏢 Appartement', '🏖️ Villa', "🛏️ Chambre d'hôtes", '🏨 Hôtel', '🏕️ Insolite'];

const PROPRIETES = [
  {
    id:'1', nom:'Villa Azur',                type:'🏖️ Villa',         ville:'Antibes',       region:'Côte d\'Azur',
    note:4.9, avis:184, prixNuit:280, capacite:'6 pers.', surface:'140 m²', dispo:true,
    grad:'linear-gradient(140deg,#A0C8E8,#6090C0)',
    initials:'VA', tags:['Piscine','Vue mer','Climatisation']
  },
  {
    id:'2', nom:'Chalet Mont Blanc',          type:'🏠 Maison',        ville:'Chamonix',      region:'Haute-Savoie',
    note:4.8, avis:97,  prixNuit:195, capacite:'8 pers.', surface:'120 m²', dispo:true,
    grad:'linear-gradient(140deg,#C0D0E0,#8090A8)',
    initials:'CM', tags:['Sauna','Ski','Parking']
  },
  {
    id:'3', nom:'Appartement Marais',         type:'🏢 Appartement',   ville:'Paris 4e',      region:'Île-de-France',
    note:4.7, avis:312, prixNuit:95,  capacite:'2 pers.', surface:'45 m²', dispo:true,
    grad:'linear-gradient(140deg,#E0C8A0,#C0A070)',
    initials:'AM', tags:['Wi-Fi','Balcon','Centre-ville']
  },
  {
    id:'4', nom:"Mas Provençal",              type:'🏠 Maison',        ville:'Gordes',        region:'Luberon',
    note:5.0, avis:56,  prixNuit:220, capacite:'4 pers.', surface:'95 m²', dispo:true,
    grad:'linear-gradient(140deg,#E8D0A0,#C8A860)',
    initials:'MP', tags:['Piscine','Jardin','Animaux OK']
  },
  {
    id:'5', nom:"Chambre Vue Vignes",         type:"🛏️ Chambre d'hôtes",ville:'Saint-Émilion', region:'Gironde',
    note:4.8, avis:73,  prixNuit:85,  capacite:'2 pers.', surface:'30 m²', dispo:false,
    grad:'linear-gradient(140deg,#C0B090,#908060)',
    initials:'VV', tags:['Petit-déj.','Vignoble','Romantique']
  },
  {
    id:'6', nom:'Cabane dans les Arbres',     type:'🏕️ Insolite',     ville:'Périgueux',     region:'Dordogne',
    note:4.9, avis:128, prixNuit:135, capacite:'2 pers.', surface:'25 m²', dispo:true,
    grad:'linear-gradient(140deg,#A0C0A0,#709870)',
    initials:'CA', tags:['Nature','Terrasse','Insolite']
  },
];

function Stars({ note }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(note) ? DS.gold : '#E0DDD8', fontSize: 11 }}>★</span>
      ))}
    </span>
  );
}

function PropertyCard({ prop, onClick }) {
  const [hov, setHov] = useState(false);

  return (
    <div onClick={onClick}
      style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, overflow:'hidden', cursor:'pointer', transition:'all .2s', boxShadow:hov?DS.shadow.md:DS.shadow.xs, transform:hov?'translateY(-3px)':'none' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {/* Cover */}
      <div style={{ height:180, background:prop.grad, position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.25))' }} />
        {/* Type badge */}
        <div style={{ position:'absolute', top:12, left:12, padding:'4px 10px', background:'rgba(255,255,255,0.92)', backdropFilter:'blur(8px)', borderRadius:DS.r.full, fontSize:11, fontWeight:600, color:DS.ink }}>
          {prop.type}
        </div>
        {/* Dispo badge */}
        {!prop.dispo && (
          <div style={{ position:'absolute', top:12, right:12, padding:'4px 10px', background:'rgba(10,10,10,0.7)', borderRadius:DS.r.full, fontSize:11, fontWeight:600, color:'#fff' }}>
            Indisponible
          </div>
        )}
        {/* Initials */}
        <div style={{ position:'absolute', bottom:12, left:16, fontSize:32, fontWeight:900, color:'rgba(255,255,255,0.85)', letterSpacing:'-0.04em' }}>
          {prop.initials}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding:'16px 18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <div style={{ fontSize:15, fontWeight:700, color:DS.ink, letterSpacing:'-0.03em', lineHeight:1.3, flex:1, marginRight:8 }}>{prop.nom}</div>
          <div style={{ display:'flex', alignItems:'center', gap:3, flexShrink:0 }}>
            <span style={{ color:DS.gold, fontSize:11 }}>★</span>
            <span style={{ fontSize:12, fontWeight:700, color:DS.ink }}>{prop.note}</span>
          </div>
        </div>

        <div style={{ fontSize:12, color:DS.muted, marginBottom:10 }}>
          📍 {prop.ville} · {prop.region}
        </div>

        {/* Tags */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12 }}>
          {prop.tags.map(t => (
            <span key={t} style={{ padding:'3px 8px', background:DS.surface, borderRadius:DS.r.full, fontSize:11, color:DS.ink2, fontWeight:500 }}>{t}</span>
          ))}
        </div>

        {/* Prix + infos */}
        <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:4 }}>
          <span style={{ fontSize:20, fontWeight:900, color:DS.ink, letterSpacing:'-0.03em' }}>{prop.prixNuit}€</span>
          <span style={{ fontSize:12, color:DS.muted }}>/nuit</span>
        </div>
        <div style={{ fontSize:11.5, color:DS.subtle, marginBottom:14 }}>
          {prop.capacite} · {prop.surface} · {prop.avis} avis
        </div>

        {/* CTA */}
        <button
          style={{ width:'100%', padding:'11px', background:prop.dispo?DS.accent:DS.bgMuted, color:prop.dispo?'#fff':DS.subtle, border:'none', borderRadius:DS.r.full, fontWeight:700, fontSize:13, cursor:prop.dispo?'pointer':'default', transition:'background .15s', fontFamily:DS.font }}
          onMouseEnter={e=>{ if(prop.dispo) e.currentTarget.style.background=DS.accentHover; }}
          onMouseLeave={e=>{ if(prop.dispo) e.currentTarget.style.background=DS.accent; }}>
          {prop.dispo ? 'Voir & Réserver' : 'Indisponible'}
        </button>
      </div>
    </div>
  );
}

export default function VacancesPage() {
  const navigate = useNavigate();
  const [type, setType] = useState('Tout');
  const [recherche, setRecherche] = useState('');
  const [dateArrivee, setDateArrivee] = useState('');
  const [dateDepart, setDateDepart] = useState('');

  const filtered = PROPRIETES.filter(p => {
    const tm = type === 'Tout' || p.type === type;
    const sm = !recherche || p.nom.toLowerCase().includes(recherche.toLowerCase()) || p.ville.toLowerCase().includes(recherche.toLowerCase()) || p.region.toLowerCase().includes(recherche.toLowerCase());
    return tm && sm;
  });

  const minPrice = Math.min(...filtered.map(p => p.prixNuit));

  const subNav = (
    <div style={{ display:'flex', padding:'0 clamp(16px,4vw,48px)', overflowX:'auto', scrollbarWidth:'none' }}>
      {TYPES.map(t => (
        <button key={t} onClick={() => setType(t)}
          style={{ padding:'11px 16px', background:'none', border:'none', borderBottom:`2px solid ${type===t?DS.accent:'transparent'}`, fontSize:12.5, fontWeight:type===t?700:400, color:type===t?DS.ink:DS.muted, cursor:'pointer', whiteSpace:'nowrap', marginBottom:-1, transition:'color .15s', fontFamily:DS.font }}>
          {t}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:DS.bg, fontFamily:DS.font, color:DS.ink }}>
      <RecrutementBanner secteur="vacances" />
      <PublicNavbar subNav={subNav} />

      {/* Barre de recherche Airbnb-style */}
      <div style={{ background:DS.bg, borderBottom:`1px solid ${DS.border}`, padding:'16px clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth:800, margin:'0 auto', display:'flex', border:`1.5px solid ${DS.border}`, borderRadius:DS.r.full, overflow:'hidden', boxShadow:DS.shadow.md, transition:'box-shadow .2s' }}
          onFocusCapture={e=>e.currentTarget.style.boxShadow=DS.shadow.lg}
          onBlurCapture={e=>e.currentTarget.style.boxShadow=DS.shadow.md}>
          {/* Destination */}
          <div style={{ flex:1.5, display:'flex', flexDirection:'column', padding:'10px 20px', borderRight:`1px solid ${DS.border}` }}>
            <label style={{ fontSize:9, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:3 }}>Destination</label>
            <input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="Antibes, Paris, Alpes…"
              style={{ border:'none', outline:'none', fontSize:13.5, color:DS.ink, background:'none', fontFamily:DS.font }} />
          </div>
          {/* Arrivée */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'10px 16px', borderRight:`1px solid ${DS.border}` }}>
            <label style={{ fontSize:9, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:3 }}>Arrivée</label>
            <input type="date" value={dateArrivee} onChange={e=>setDateArrivee(e.target.value)}
              style={{ border:'none', outline:'none', fontSize:13, color:DS.ink, background:'none', fontFamily:DS.font }} />
          </div>
          {/* Départ */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'10px 16px' }}>
            <label style={{ fontSize:9, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:3 }}>Départ</label>
            <input type="date" value={dateDepart} onChange={e=>setDateDepart(e.target.value)}
              style={{ border:'none', outline:'none', fontSize:13, color:DS.ink, background:'none', fontFamily:DS.font }} />
          </div>
          <button style={{ padding:'0 24px', background:DS.ink, border:'none', cursor:'pointer', color:'#fff', fontSize:13, fontWeight:700, transition:'opacity .15s', flexShrink:0 }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            🔍 Rechercher
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ padding:'10px clamp(16px,4vw,48px)', borderBottom:`1px solid ${DS.border}`, display:'flex', alignItems:'center', gap:20, fontSize:12.5, color:DS.muted }}>
        <span style={{ color:DS.ink, fontWeight:600 }}>{filtered.length} logement{filtered.length > 1 ? 's' : ''}</span>
        <span>·</span>
        <span>À partir de <strong style={{ color:DS.ink }}>{minPrice}€/nuit</strong></span>
        <span>·</span>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Annulation gratuite
        </span>
      </div>

      {/* Grille de propriétés */}
      <div style={{ padding:'clamp(24px,4vh,40px) clamp(16px,4vw,48px)', maxWidth:1200, margin:'0 auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding:'60px 40px', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🏠</div>
            <div style={{ fontWeight:600, color:DS.ink, marginBottom:6, fontSize:'1.0625rem' }}>Aucun logement trouvé</div>
            <div style={{ fontSize:'0.875rem', color:DS.muted, marginBottom:20 }}>Essayez d'autres dates ou une autre destination</div>
            <button onClick={() => { setType('Tout'); setRecherche(''); setDateArrivee(''); setDateDepart(''); }}
              style={{ background:'none', border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:'9px 20px', color:DS.muted, cursor:'pointer', fontSize:'0.8125rem', fontFamily:DS.font }}>
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
            {filtered.map(p => (
              <PropertyCard key={p.id} prop={p} onClick={() => navigate(`/vacances/${p.id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* CTA hôte */}
      <section style={{ margin:'0 clamp(16px,4vw,48px) clamp(40px,6vh,64px)', background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, padding:'clamp(28px,4vh,44px) clamp(24px,4vw,48px)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:DS.gold, textTransform:'uppercase', letterSpacing:3, marginBottom:10 }}>Vous avez un logement ?</div>
          <h3 style={{ fontSize:'clamp(1.25rem,3vw,1.5rem)', fontWeight:800, color:DS.ink, letterSpacing:'-0.04em', margin:'0 0 8px' }}>Publiez gratuitement<br/>et commencez à louer.</h3>
          <p style={{ fontSize:14, color:DS.muted, lineHeight:1.6, margin:0 }}>Gestion des réservations, paiements sécurisés, visibilité nationale.</p>
        </div>
        <button onClick={() => navigate('/register?role=patron&secteur=vacances')}
          style={{ padding:'13px 28px', background:DS.ink, border:'none', borderRadius:DS.r.full, fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', transition:'opacity .15s', whiteSpace:'nowrap' }}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          Publier mon logement →
        </button>
      </section>
    </div>
  );
}
