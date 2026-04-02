import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'coiffure',    emoji: '✂️',  label: 'Coiffure & Beauté'  },
  { id: 'restaurant',  emoji: '🍽️', label: 'Restaurants'         },
  { id: 'boulangerie', emoji: '🥖',  label: 'Boulangeries'        },
  { id: 'garage',      emoji: '🔧',  label: 'Garages & Auto'      },
  { id: 'btp',         emoji: '🔨',  label: 'Artisans & Travaux'  },
  { id: 'commerce',    emoji: '🛍️', label: 'Commerces'           },
];

const PROS = [
  { id:1, secteur:'coiffure',    nom:'Salon Léa',       metier:'Salon de coiffure',  ville:'Paris 11e',  note:4.9, avis:142, prix:'35€', dispo:true  },
  { id:2, secteur:'restaurant',  nom:'Chez Marco',       metier:'Restaurant italien', ville:'Lyon 2e',    note:4.8, avis:89,  prix:'22€', dispo:true  },
  { id:3, secteur:'boulangerie', nom:'Maison Dupont',    metier:'Boulangerie artisanale', ville:'Bordeaux', note:4.9, avis:213, prix:'1,20€', dispo:true },
  { id:4, secteur:'coiffure',    nom:'Barbershop Alex',  metier:'Barbier',            ville:'Paris 3e',   note:5.0, avis:67,  prix:'18€', dispo:true  },
  { id:5, secteur:'garage',      nom:'Garage Martin',    metier:'Mécanicien',         ville:'Toulouse',   note:4.7, avis:54,  prix:'Devis', dispo:true },
  { id:6, secteur:'btp',         nom:'Tom Plomberie',    metier:'Plombier certifié',  ville:'Nantes',     note:4.8, avis:98,  prix:'Devis', dispo:true },
];

export default function SecteurSelect() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    const q = query.toLowerCase();
    if (q.includes('coiff') || q.includes('cheveux') || q.includes('barbier') || q.includes('manucure')) navigate(`/coiffure?q=${encodeURIComponent(query)}`);
    else if (q.includes('restaurant') || q.includes('table')) navigate(`/restaurant?q=${encodeURIComponent(query)}`);
    else if (q.includes('pain') || q.includes('boulan')) navigate(`/boulangerie?q=${encodeURIComponent(query)}`);
    else if (q.includes('garage') || q.includes('voiture')) navigate(`/garage?q=${encodeURIComponent(query)}`);
    else navigate(`/btp?q=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#060608', fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif", color:'#fff', overflowX:'hidden' }}>

      {/* Glow très subtil */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(255,255,255,0.04) 0%, transparent 60%)' }} />

      <div style={{ position:'relative', zIndex:1 }}>

        {/* ── Bandeau "Ils recrutent" ── */}
        <div
          onClick={() => navigate('/recrutement')}
          style={{ background:'rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'10px clamp(20px,5vw,56px)', display:'flex', alignItems:'center', justifyContent:'center', gap:12, cursor:'pointer', transition:'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
        >
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#E8D5A3', boxShadow:'0 0 8px rgba(232,213,163,0.6)', flexShrink:0 }} />
          <span style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.6)', letterSpacing:'-0.01em' }}>
            Des entreprises recrutent en ce moment
          </span>
          <span style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.85)', fontWeight:600, letterSpacing:'-0.01em', display:'flex', alignItems:'center', gap:4 }}>
            Voir les offres
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </div>

        {/* ── Navbar ── */}
        <nav style={{ position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 clamp(20px,5vw,56px)', height:58, background:'rgba(6,6,8,0.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#060608" stroke="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill="rgba(6,6,8,0.5)"/></svg>
            </div>
            <span style={{ fontWeight:700, fontSize:'0.9375rem', letterSpacing:'-0.03em', color:'#fff' }}>Artisans Pro</span>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <button onClick={() => navigate('/recrutement')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.8125rem', color:'rgba(255,255,255,0.45)', padding:'6px 10px', borderRadius:8, letterSpacing:'-0.01em', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.85)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>Emploi</button>
            <button onClick={() => navigate('/login')} style={{ background:'none', border:'1px solid rgba(255,255,255,0.14)', cursor:'pointer', padding:'7px 16px', borderRadius:8, fontSize:'0.8125rem', fontWeight:500, color:'rgba(255,255,255,0.75)', letterSpacing:'-0.01em', transition:'all .15s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.35)';e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.14)';e.currentTarget.style.color='rgba(255,255,255,0.75)';}}>Se connecter</button>
            <button onClick={() => navigate('/register')} style={{ background:'#fff', border:'none', cursor:'pointer', padding:'7px 16px', borderRadius:8, fontSize:'0.8125rem', fontWeight:600, color:'#060608', letterSpacing:'-0.01em', transition:'opacity .15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Créer un compte</button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{ padding:'clamp(64px,11vh,100px) clamp(20px,5vw,56px) clamp(48px,7vh,72px)', textAlign:'center', maxWidth:720, margin:'0 auto', opacity:mounted?1:0, transform:mounted?'none':'translateY(18px)', transition:'opacity .6s ease, transform .6s ease' }}>
          <p style={{ fontSize:'0.75rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', fontWeight:500, margin:'0 0 20px' }}>Trouvez. Réservez. Profitez.</p>
          <h1 style={{ fontSize:'clamp(2.25rem,6vw,4rem)', fontWeight:800, lineHeight:1.06, letterSpacing:'-0.05em', color:'#fff', margin:'0 0 20px' }}>
            Les meilleurs pros<br />
            <span style={{ color:'rgba(255,255,255,0.35)' }}>près de chez vous</span>
          </h1>
          <p style={{ fontSize:'clamp(0.9375rem,2vw,1.0625rem)', color:'rgba(255,255,255,0.35)', margin:'0 0 40px', lineHeight:1.6, letterSpacing:'-0.01em' }}>
            Coiffeur, restaurant, artisan, boulangerie — sans compte, sans attente.
          </p>

          {/* Barre de recherche */}
          <div style={{ display:'flex', maxWidth:520, margin:'0 auto', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 16px', gap:10 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Coiffeur, restaurant, plombier..." style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:'0.9rem', color:'#fff', fontFamily:'inherit', padding:'15px 0', letterSpacing:'-0.01em' }} />
            </div>
            <button onClick={handleSearch} style={{ background:'#fff', border:'none', cursor:'pointer', padding:'0 22px', fontWeight:600, color:'#060608', fontSize:'0.875rem', letterSpacing:'-0.01em', transition:'opacity .15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Rechercher</button>
          </div>
        </div>

        {/* ── Catégories ── */}
        <div style={{ padding:'0 clamp(20px,5vw,56px) 56px', opacity:mounted?1:0, transform:mounted?'none':'translateY(10px)', transition:'opacity .5s .1s, transform .5s .1s' }}>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', maxWidth:640, margin:'0 auto' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => navigate(`/${c.id}`)} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:40, padding:'9px 18px', cursor:'pointer', transition:'all .2s', fontSize:'0.875rem', fontWeight:500, color:'rgba(255,255,255,0.6)', letterSpacing:'-0.01em' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)';e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='rgba(255,255,255,0.18)';e.currentTarget.style.transform='translateY(-2px)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='rgba(255,255,255,0.6)';e.currentTarget.style.borderColor='rgba(255,255,255,0.09)';e.currentTarget.style.transform='';}}>
                <span style={{ fontSize:'1rem' }}>{c.emoji}</span>{c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Disponibles maintenant ── */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'clamp(32px,5vh,48px) 0 clamp(40px,6vh,56px)' }}>
          <div style={{ padding:'0 clamp(20px,5vw,56px)', marginBottom:18, display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
            <span style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.25)', fontWeight:600 }}>Disponibles maintenant</span>
          </div>
          <div style={{ display:'flex', gap:12, overflowX:'auto', padding:'4px clamp(20px,5vw,56px) 8px', scrollbarWidth:'none' }}>
            {PROS.map(pro => <ProCard key={pro.id} pro={pro} onClick={() => navigate(`/${pro.secteur}`)} />)}
          </div>
        </div>

        {/* ── Bandeau professionnel ── */}
        <div style={{ margin:'0 clamp(20px,5vw,56px) clamp(40px,6vh,56px)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', padding:'clamp(24px,4vh,36px) clamp(20px,4vw,40px)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600, marginBottom:6 }}>Pour les professionnels</div>
            <div style={{ fontSize:'clamp(1rem,2.5vw,1.375rem)', fontWeight:700, color:'#fff', letterSpacing:'-0.03em', marginBottom:4 }}>Développez votre clientèle</div>
            <div style={{ fontSize:'0.8375rem', color:'rgba(255,255,255,0.35)', letterSpacing:'-0.01em' }}>Visibilité immédiate · Réservations en ligne · Gratuit pour commencer</div>
          </div>
          <button onClick={() => navigate('/register')} style={{ flexShrink:0, background:'#fff', border:'none', cursor:'pointer', padding:'12px 24px', borderRadius:10, fontSize:'0.875rem', fontWeight:600, color:'#060608', letterSpacing:'-0.01em', transition:'opacity .15s', whiteSpace:'nowrap' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Rejoindre gratuitement →</button>
        </div>

        {/* ── Footer ── */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'16px clamp(20px,5vw,56px) 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.15)', letterSpacing:'-0.01em' }}>© 2025 Artisans Pro</span>
          <div style={{ display:'flex', gap:20 }}>
            {[['Emploi','/recrutement'],['CGU','/cgu'],['Connexion','/login']].map(([l,p]) => (
              <button key={p} onClick={()=>navigate(p)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.75rem', color:'rgba(255,255,255,0.2)', letterSpacing:'-0.01em', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.55)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.2)'}>{l}</button>
            ))}
          </div>
        </div>

      </div>
      <style>{`input::placeholder{color:rgba(255,255,255,0.22);} *::-webkit-scrollbar{display:none;}`}</style>
    </div>
  );
}

function ProCard({ pro, onClick }) {
  const [hov, setHov] = useState(false);
  const initials = pro.nom.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ flexShrink:0, width:200, background:hov?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.03)', border:`1px solid ${hov?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.07)'}`, borderRadius:14, overflow:'hidden', cursor:'pointer', transition:'all .2s', transform:hov?'translateY(-3px)':'none' }}>
      <div style={{ height:80, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.875rem', fontWeight:800, color:'#fff' }}>{initials}</div>
        {pro.dispo && <span style={{ position:'absolute', top:8, right:8, width:7, height:7, borderRadius:'50%', background:'#4ADE80', boxShadow:'0 0 6px rgba(74,222,128,0.6)' }} />}
      </div>
      <div style={{ padding:'10px 12px 12px' }}>
        <div style={{ fontSize:'0.875rem', fontWeight:700, color:'#fff', letterSpacing:'-0.02em', marginBottom:2 }}>{pro.nom}</div>
        <div style={{ fontSize:'0.725rem', color:'rgba(255,255,255,0.35)', marginBottom:8 }}>{pro.metier} · {pro.ville}</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)' }}>⭐ {pro.note} ({pro.avis})</span>
          <span style={{ fontSize:'0.8rem', fontWeight:700, color:'rgba(255,255,255,0.8)' }}>À partir de {pro.prix}</span>
        </div>
      </div>
    </div>
  );
}
