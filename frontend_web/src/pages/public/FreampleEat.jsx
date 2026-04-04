import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import HideForClient from '../../components/public/HideForClient';

const E = {
  black: '#000000', white: '#FFFFFF', gray: '#F3F3F3', grayDark: '#E5E5E5',
  text: '#000000', textSec: '#5E5E5E', textLight: '#8B8B8B',
  green: '#05944F', greenBg: '#E6F4ED', greenLight: '#F0FDF4',
  gold: '#F2CA2F', goldBg: '#FFFBEB',
  font: "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif",
  r: 12, rPill: 999,
};

const FOOD_CATEGORIES = [
  { id:'tout',    icon:'🔥', label:'Populaire' },
  { id:'pizza',   icon:'🍕', label:'Pizza' },
  { id:'sushi',   icon:'🍣', label:'Sushi' },
  { id:'burger',  icon:'🍔', label:'Burger' },
  { id:'healthy', icon:'🥗', label:'Healthy' },
  { id:'mexicain',icon:'🌮', label:'Mexicain' },
  { id:'brunch',  icon:'🥐', label:'Brunch' },
  { id:'asiatique',icon:'🍜', label:'Asiatique' },
  { id:'desserts',icon:'🧁', label:'Desserts' },
  { id:'cafe',    icon:'☕', label:'Café' },
  { id:'grill',   icon:'🥩', label:'Grill' },
];

const RESTAURANTS = [
  { id:1, nom:'La Trattoria',     type:'pizza',    ville:'Paris 11e', note:4.8, avis:312, temps:'25–35 min', frais:'2,99€',  promo:'-20%',            color:'linear-gradient(140deg,#E8C8A0,#C8A070)', tags:['Italien','Pâtes','Pizza'] },
  { id:2, nom:'Sakura House',     type:'sushi',    ville:'Paris 3e',  note:4.9, avis:189, temps:'30–40 min', frais:'1,99€',  promo:null,              color:'linear-gradient(140deg,#E8A0B0,#C87090)', tags:['Japonais','Sushi','Ramen'] },
  { id:3, nom:'Big Smoke',        type:'burger',   ville:'Paris 18e', note:4.7, avis:278, temps:'15–25 min', frais:'Offerte', promo:'Livraison offerte',color:'linear-gradient(140deg,#E8B870,#C89040)', tags:['Burger','Frites','Américain'] },
  { id:4, nom:'Green Bowl',       type:'healthy',  ville:'Paris 6e',  note:4.6, avis:145, temps:'20–30 min', frais:'3,49€',  promo:null,              color:'linear-gradient(140deg,#B8D8A0,#90C870)', tags:['Healthy','Bowls','Vegan'] },
  { id:5, nom:'Taco Loco',        type:'mexicain', ville:'Paris 10e', note:4.5, avis:98,  temps:'25–35 min', frais:'2,49€',  promo:null,              color:'linear-gradient(140deg,#E8D0A0,#D8B870)', tags:['Mexicain','Tacos','Burritos'] },
  { id:6, nom:'Le Petit Brunch',  type:'brunch',   ville:'Paris 4e',  note:4.8, avis:215, temps:'30–45 min', frais:'1,99€',  promo:'-15%',            color:'linear-gradient(140deg,#D8C8E0,#C0A8D0)', tags:['Brunch','Pancakes','Eggs'] },
  { id:7, nom:'Wok Express',      type:'asiatique',ville:'Paris 13e', note:4.4, avis:167, temps:'20–30 min', frais:'2,99€',  promo:null,              color:'linear-gradient(140deg,#E8A8A0,#D08878)', tags:['Asiatique','Wok','Nouilles'] },
  { id:8, nom:'Sweet Corner',     type:'desserts', ville:'Paris 8e',  note:4.9, avis:342, temps:'15–20 min', frais:'1,49€',  promo:null,              color:'linear-gradient(140deg,#E8C0D0,#D0A0B8)', tags:['Desserts','Pâtisserie','Glaces'] },
];

const STATS = [
  { value:'1 200+', label:'restaurants partenaires' },
  { value:'4.8/5',  label:'satisfaction client' },
  { value:'25 min', label:'livraison moyenne' },
  { value:'100%',   label:'paiement sécurisé' },
];

function RestaurantCard({ resto }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background:E.white, borderRadius:E.r, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', border:`1px solid ${hover ? E.grayDark : E.gray}`, boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.08)' : 'none', transform: hover ? 'translateY(-2px)' : 'none' }}>
      {/* Image */}
      <div style={{ height:160, background:resto.color, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:48, opacity:0.5 }}>🍽️</span>
        {resto.promo && (
          <div style={{ position:'absolute', top:12, left:12, background:E.gold, color:E.black, padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:700 }}>
            {resto.promo}
          </div>
        )}
        <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(0,0,0,0.7)', color:E.white, padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:600 }}>
          {resto.temps}
        </div>
      </div>
      {/* Info */}
      <div style={{ padding:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
          <div style={{ fontSize:16, fontWeight:700, color:E.text }}>{resto.nom}</div>
          <div style={{ display:'flex', alignItems:'center', gap:4, background:E.gray, padding:'3px 8px', borderRadius:6, flexShrink:0 }}>
            <span style={{ fontSize:12, color:E.gold }}>★</span>
            <span style={{ fontSize:13, fontWeight:700, color:E.text }}>{resto.note}</span>
          </div>
        </div>
        <div style={{ fontSize:13, color:E.textSec, marginBottom:8 }}>{resto.tags.join(' · ')}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, color: resto.frais === 'Offerte' ? E.green : E.textSec, fontWeight: resto.frais === 'Offerte' ? 600 : 400 }}>
            {resto.frais === 'Offerte' ? '✓ Livraison offerte' : `Livraison ${resto.frais}`}
          </span>
          <span style={{ fontSize:12, color:E.textLight }}>· {resto.avis} avis</span>
        </div>
      </div>
    </div>
  );
}

export default function FreampleEat() {
  const navigate = useNavigate();
  const [adresse, setAdresse] = useState('');
  const [category, setCategory] = useState('tout');

  const filtered = category === 'tout' ? RESTAURANTS : RESTAURANTS.filter(r => r.type === category);

  return (
    <div style={{ minHeight:'100vh', background:E.white, fontFamily:E.font, color:E.text }}>
      <RecrutementBanner />
      <PublicNavbar />

      {/* ── Hero ── */}
      <div style={{ background:'linear-gradient(135deg, #1a0a00 0%, #3d1f00 40%, #8B4513 100%)', padding:'clamp(48px,8vh,80px) 24px 56px' }}>
        <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', background:'rgba(255,255,255,0.1)', borderRadius:E.rPill, marginBottom:24 }}>
            <span style={{ fontSize:14 }}>🛵</span>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:500 }}>Freample Eat</span>
          </div>
          <h1 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:700, color:E.white, lineHeight:1.15, letterSpacing:'-0.03em', margin:'0 0 16px' }}>
            Vos restaurants préférés,<br/>livrés chez vous
          </h1>
          <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'rgba(255,255,255,0.6)', lineHeight:1.5, margin:'0 0 36px' }}>
            Découvrez des milliers de restaurants et faites-vous livrer en quelques minutes
          </p>

          {/* Search */}
          <div style={{ maxWidth:520, margin:'0 auto', display:'flex', background:E.white, borderRadius:8, overflow:'hidden', height:56, boxShadow:'0 4px 24px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, padding:'0 16px' }}>
              <span style={{ fontSize:16, flexShrink:0 }}>📍</span>
              <input value={adresse} onChange={e => setAdresse(e.target.value)}
                placeholder="Entrez votre adresse de livraison"
                style={{ flex:1, border:'none', outline:'none', fontSize:16, color:E.text, background:'none', fontFamily:E.font }} />
            </div>
            <button style={{ padding:'0 24px', background:E.black, color:E.white, border:'none', fontSize:15, fontWeight:600, cursor:'pointer', transition:'background 0.15s', flexShrink:0, fontFamily:E.font }}
              onMouseEnter={e => e.currentTarget.style.background = '#282828'}
              onMouseLeave={e => e.currentTarget.style.background = E.black}>
              Trouver
            </button>
          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:16, flexWrap:'wrap' }}>
            <button style={{ padding:'10px 24px', background:E.white, color:E.black, border:'none', borderRadius:E.rPill, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:E.font }}>
              Livrer maintenant
            </button>
            <button style={{ padding:'10px 24px', background:'transparent', color:E.white, border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:E.rPill, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:E.font }}>
              📅 Programmer
            </button>
          </div>
        </div>
      </div>

      {/* ── Categories (horizontal scroll) ── */}
      <div style={{ borderBottom:`1px solid ${E.grayDark}`, padding:'16px 0', overflow:'hidden' }}>
        <div style={{ display:'flex', gap:8, overflowX:'auto', scrollbarWidth:'none', WebkitOverflowScrolling:'touch', padding:'0 clamp(16px,4vw,48px)' }}>
          {FOOD_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                padding:'8px 16px', borderRadius:E.r, border:'none', cursor:'pointer',
                background: category === c.id ? E.black : 'transparent',
                transition:'all 0.15s', flexShrink:0, fontFamily:E.font, minWidth:70,
              }}>
              <span style={{ fontSize:28 }}>{c.icon}</span>
              <span style={{ fontSize:12, fontWeight:category === c.id ? 700 : 500, color: category === c.id ? E.white : E.textSec }}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Restaurants grid ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px clamp(16px,4vw,48px)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em', marginBottom:4 }}>
              {category === 'tout' ? 'Restaurants populaires' : FOOD_CATEGORIES.find(c => c.id === category)?.label || 'Résultats'}
            </h2>
            <p style={{ fontSize:14, color:E.textSec }}>{filtered.length} restaurant{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
          {filtered.map(r => <RestaurantCard key={r.id} resto={r} />)}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:E.textSec }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <div style={{ fontSize:18, fontWeight:600, color:E.text, marginBottom:8 }}>Aucun restaurant</div>
            <div style={{ fontSize:14 }}>Essayez une autre catégorie</div>
          </div>
        )}
      </div>

      {/* ── Comment ça marche ── */}
      <div style={{ background:E.gray, padding:'56px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:26, fontWeight:700, marginBottom:8 }}>Comment ça marche ?</h2>
          <p style={{ fontSize:15, color:E.textSec, marginBottom:40 }}>Commandez en 3 étapes simples</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:32 }}>
            {[
              { icon:'📍', title:'Entrez votre adresse', desc:'Indiquez où vous souhaitez être livré' },
              { icon:'🍕', title:'Choisissez votre repas', desc:'Parcourez les restaurants et les menus' },
              { icon:'🛵', title:'Faites-vous livrer', desc:'Suivez votre livreur en temps réel' },
            ].map(s => (
              <div key={s.title}>
                <div style={{ width:56, height:56, borderRadius:E.rPill, background:E.white, margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>{s.icon}</div>
                <div style={{ fontSize:17, fontWeight:600, marginBottom:6 }}>{s.title}</div>
                <div style={{ fontSize:14, color:E.textSec, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ padding:'40px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign:'center', minWidth:140 }}>
              <div style={{ fontSize:28, fontWeight:700, color:E.text, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:13, color:E.textLight }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Restaurateur + Livreur (caché pour clients) ── */}
      <HideForClient>
      <div style={{ background:E.black, padding:'56px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:24, fontWeight:700, color:E.white, marginBottom:12 }}>Vous êtes restaurateur ?</h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.6)', marginBottom:28, lineHeight:1.5 }}>
            Développez votre activité avec Freample Eat. Touchez de nouveaux clients sans commission fixe.
          </p>
          <button onClick={() => navigate('/register?secteur=restaurant')}
            style={{ padding:'14px 32px', background:E.green, color:E.white, border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:E.font, transition:'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#047a3f'}
            onMouseLeave={e => e.currentTarget.style.background = E.green}>
            Devenir partenaire →
          </button>
        </div>
      </div>

      {/* ── CTA Livreur ── */}
      <div style={{ background:E.gray, padding:'48px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:10 }}>Devenez livreur Freample</h2>
          <p style={{ fontSize:14, color:E.textSec, marginBottom:24, lineHeight:1.5 }}>
            Livrez et gagnez quand vous voulez. Horaires flexibles, paiement chaque semaine.
          </p>
          <button onClick={() => navigate('/register?role=artisan&secteur=eat')}
            style={{ padding:'14px 32px', background:E.black, color:E.white, border:'none', borderRadius:E.rPill, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:E.font, transition:'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#282828'}
            onMouseLeave={e => e.currentTarget.style.background = E.black}>
            S'inscrire comme livreur →
          </button>
        </div>
      </div>
      </HideForClient>

      {/* ── Footer ── */}
      <div style={{ padding:'28px 24px', borderTop:`1px solid ${E.grayDark}`, textAlign:'center' }}>
        <span style={{ fontSize:13, color:E.textLight }}>© 2026 Freample Eat · <a href="/cgu" style={{ color:E.textSec, textDecoration:'none' }}>CGU</a> · <a href="/recrutement" style={{ color:E.textSec, textDecoration:'none' }}>Recrutement</a></span>
      </div>
    </div>
  );
}
