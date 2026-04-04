import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { getTarifs } from '../../data/tarifsCom';

const C = {
  primary: '#8B5CF6', primaryHover: '#7C3AED', dark: '#0F0A1A', darkSoft: '#1A1128',
  text: '#0F0A1A', textSec: '#6B7280', textLight: '#9CA3AF',
  bg: '#FFFFFF', soft: '#F5F3FF', border: '#E9E5F5',
  pink: '#EC4899', blue: '#3B82F6', green: '#10B981', gold: '#F59E0B',
  font: "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif",
};

// Tarifs lus depuis la source partagée (modifiables par le patron)
const TARIFS_RAW = getTarifs();

function getMinPrix(catName) {
  const cat = TARIFS_RAW.find(t => t.cat.toLowerCase().includes(catName.toLowerCase()));
  if (!cat || !cat.items.length) return '—';
  return Math.min(...cat.items.map(i => i.prix));
}

const SERVICES = [
  { icon:'🎬', title:'Montage Vidéo', desc:'TikTok, Reels, YouTube Shorts', price:`À partir de ${getMinPrix('Montage')}€`, delai:'48h — 5 jours', color:'linear-gradient(135deg,#EC4899,#8B5CF6)', features:['Montage dynamique','Sous-titres auto','Musique tendance','Transitions pro'] },
  { icon:'📱', title:'Réseaux Sociaux', desc:'Gestion de comptes & stratégie', price:`À partir de ${getMinPrix('Réseaux')}€/mois`, delai:'Livraison continue', color:'linear-gradient(135deg,#3B82F6,#8B5CF6)', features:['Planning éditorial','Création de contenu','Community management','Reporting mensuel'] },
  { icon:'🎨', title:'Design Graphique', desc:'Logos, visuels, identité', price:`À partir de ${getMinPrix('Design')}€`, delai:'3 — 7 jours', color:'linear-gradient(135deg,#10B981,#3B82F6)', features:['Logo & charte graphique','Visuels réseaux sociaux','Flyers & cartes de visite','Bannières web'] },
  { icon:'📈', title:'Publicité en ligne', desc:'Meta Ads, Google Ads, TikTok Ads', price:`À partir de ${getMinPrix('Publicité')}€/mois`, delai:'Setup en 48h', color:'linear-gradient(135deg,#F59E0B,#EC4899)', features:['Création de campagnes','Ciblage audience','A/B testing','Reporting ROI'] },
];

const TEMOIGNAGES = [
  { nom:'@emma.lifestyle', type:'Influenceuse', avatar:'EL', text:'Freample Com a transformé mon contenu TikTok. Les montages sont top et livrés en 48h !', note:5 },
  { nom:'Salon Léa', type:'Commerce', avatar:'SL', text:'Notre Instagram est passé de 200 à 5000 abonnés en 3 mois grâce à leur gestion de compte.', note:5 },
  { nom:'@alex.fitness', type:'Influenceur', avatar:'AF', text:'Pack 10 TikToks par mois, qualité constante, je recommande à 100%.', note:5 },
];

// ── Portfolio data ──────────────────────────────────────────────────────────
const PORTFOLIO = [
  {
    id:1, type:'TikTok', client:'@emma.lifestyle', titre:'Routine capillaire — Transitions dynamiques',
    result:'18.4K vues en 72h', color:'linear-gradient(135deg,#EC4899,#8B5CF6)',
    tags:['Sous-titres','Transitions','Musique tendance'],
    desc:'Montage TikTok dynamique avec transitions créatives, sous-titres animés et musique tendance pour une influenceuse beauté.',
  },
  {
    id:2, type:'YouTube', client:'Salon Léa', titre:'Présentation salon — Vidéo promotionnelle',
    result:'2.3K vues · +45% réservations', color:'linear-gradient(135deg,#3B82F6,#6366F1)',
    tags:['Storytelling','Drone intérieur','Voix-off'],
    desc:'Vidéo de présentation de 3 minutes avec storytelling, plans aériens intérieurs et témoignages clients.',
  },
  {
    id:3, type:'Reels', client:'@alex.fitness', titre:'Transformation physique — 5 Reels série',
    result:'42K vues cumulées', color:'linear-gradient(135deg,#10B981,#059669)',
    tags:['Avant/Après','Slow-motion','Text overlay'],
    desc:'Série de 5 Reels Instagram avec effets slow-motion, texte motivationnel et musique épique.',
  },
  {
    id:4, type:'Design', client:'Taco Loco', titre:'Logo + Identité visuelle complète',
    result:'Ouverture du restaurant', color:'linear-gradient(135deg,#F59E0B,#EF4444)',
    tags:['Logo','Charte graphique','Menu design'],
    desc:'Création du logo, charte graphique complète (typographie, couleurs, patterns) et design du menu physique.',
  },
  {
    id:5, type:'TikTok', client:'Big Smoke Burgers', titre:'Food content — Pack 10 TikToks',
    result:'85K vues · +30% commandes', color:'linear-gradient(135deg,#F97316,#DC2626)',
    tags:['Food-porn','ASMR','Close-up'],
    desc:'Pack mensuel de 10 TikToks food content avec plans rapprochés appétissants, son ASMR et CTA commande.',
  },
  {
    id:6, type:'Ads', client:'La Trattoria', titre:'Campagne Meta Ads — Livraison',
    result:'ROAS 4.2× · CPA 3.20€', color:'linear-gradient(135deg,#8B5CF6,#3B82F6)',
    tags:['Meta Ads','A/B test','Retargeting'],
    desc:'Campagne publicitaire Meta avec 3 variantes créatives, ciblage géolocalisé et retargeting panier abandonné.',
  },
  {
    id:7, type:'Reels', client:'Freample', titre:'Lancement Freample — Teaser',
    result:'Projet interne', color:'linear-gradient(135deg,#1a1128,#8B5CF6)',
    tags:['Motion design','Branding','Teaser'],
    desc:'Vidéo teaser de lancement Freample avec animations logo, motion design et storytelling de marque.',
  },
  {
    id:8, type:'Design', client:'@nina.travel', titre:'Kit réseaux sociaux — Templates Instagram',
    result:'Feed cohérent · +800 followers/mois', color:'linear-gradient(135deg,#EC4899,#F59E0B)',
    tags:['Templates','Stories','Highlights'],
    desc:'Pack de 20 templates Instagram (posts + stories + highlights) personnalisés avec charte de la créatrice.',
  },
];

const PORTFOLIO_FILTERS = ['Tout','TikTok','Reels','YouTube','Design','Ads'];

function PortfolioSection() {
  const [filter, setFilter] = useState('Tout');
  const [selected, setSelected] = useState(null);
  const filtered = filter === 'Tout' ? PORTFOLIO : PORTFOLIO.filter(p => p.type === filter);

  return (
    <div className="portfolio-section" style={{ padding:'64px 24px', borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <h2 style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em', marginBottom:8 }}>Nos réalisations</h2>
          <p style={{ fontSize:15, color:C.textSec }}>Découvrez ce que notre équipe a produit pour nos clients</p>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:32, flexWrap:'wrap' }}>
          {PORTFOLIO_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding:'8px 18px', borderRadius:999, border:'none', cursor:'pointer',
                fontWeight: filter === f ? 700 : 500, fontSize:14,
                background: filter === f ? C.primary : '#F3F3F3',
                color: filter === f ? '#fff' : C.textSec,
                fontFamily:C.font, transition:'all .15s',
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)}
              style={{ borderRadius:16, overflow:'hidden', cursor:'pointer', border:`1px solid ${C.border}`, transition:'all .2s', background:C.bg }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              {/* Thumbnail */}
              <div style={{ height:180, background:p.color, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ fontSize:48, opacity:0.3 }}>
                  {p.type === 'TikTok' ? '📱' : p.type === 'YouTube' ? '▶️' : p.type === 'Reels' ? '📸' : p.type === 'Design' ? '🎨' : '📈'}
                </div>
                {/* Type badge */}
                <div style={{ position:'absolute', top:12, left:12, background:'rgba(0,0,0,0.6)', color:'#fff', padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:700, backdropFilter:'blur(4px)' }}>
                  {p.type}
                </div>
                {/* Result badge */}
                <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(255,255,255,0.95)', color:C.text, padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:700 }}>
                  {p.result}
                </div>
              </div>
              {/* Info */}
              <div style={{ padding:16 }}>
                <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:4, lineHeight:1.3 }}>{p.titre}</div>
                <div style={{ fontSize:13, color:C.textSec, marginBottom:10 }}>{p.client}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ padding:'3px 8px', background:C.soft, borderRadius:6, fontSize:11, color:C.primary, fontWeight:600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail modal */}
        {selected && (
          <div onClick={() => setSelected(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background:C.bg, borderRadius:20, maxWidth:560, width:'100%', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,.2)' }}>
              {/* Header image */}
              <div style={{ height:200, background:selected.color, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ fontSize:64, opacity:0.3 }}>
                  {selected.type === 'TikTok' ? '📱' : selected.type === 'YouTube' ? '▶️' : selected.type === 'Reels' ? '📸' : selected.type === 'Design' ? '🎨' : '📈'}
                </div>
                <div style={{ position:'absolute', top:16, right:16 }}>
                  <button onClick={() => setSelected(null)} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(0,0,0,0.4)', border:'none', color:'#fff', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>✕</button>
                </div>
                <div style={{ position:'absolute', bottom:16, left:16, display:'flex', gap:8 }}>
                  <span style={{ background:'rgba(0,0,0,0.6)', color:'#fff', padding:'5px 12px', borderRadius:8, fontSize:13, fontWeight:700 }}>{selected.type}</span>
                  <span style={{ background:'rgba(255,255,255,0.95)', color:C.text, padding:'5px 12px', borderRadius:8, fontSize:13, fontWeight:700 }}>{selected.result}</span>
                </div>
              </div>
              {/* Content */}
              <div style={{ padding:24 }}>
                <div style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:4, lineHeight:1.3 }}>{selected.titre}</div>
                <div style={{ fontSize:14, color:C.primary, fontWeight:600, marginBottom:16 }}>{selected.client}</div>
                <p style={{ fontSize:14, color:C.textSec, lineHeight:1.6, marginBottom:16 }}>{selected.desc}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                  {selected.tags.map(t => (
                    <span key={t} style={{ padding:'5px 12px', background:C.soft, borderRadius:8, fontSize:13, color:C.primary, fontWeight:600 }}>{t}</span>
                  ))}
                </div>
                <button onClick={() => { setSelected(null); document.getElementById('demande')?.scrollIntoView({behavior:'smooth'}); }}
                  style={{ width:'100%', padding:'14px', background:C.primary, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:C.font, transition:'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                  onMouseLeave={e => e.currentTarget.style.background = C.primary}>
                  Je veux la même chose →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FreampleCom() {
  const navigate = useNavigate();
  const [openTarif, setOpenTarif] = useState(0);
  const [briefStep, setBriefStep] = useState(1);
  const [brief, setBrief] = useState({
    nom:'', email:'', telephone:'',
    type:'', format:'', quantite:'1', frequence:'ponctuel',
    style:'', reference:'', musique:'sousTitres',
    description:'', deadline:'', budget:'',
  });
  const [demandeSent, setDemandeSent] = useState(false);

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:C.font, color:C.text }}>
      <RecrutementBanner secteur="com" />
      <PublicNavbar />

      {/* ── Hero ── */}
      <div style={{ background:`linear-gradient(160deg, ${C.dark} 0%, ${C.darkSoft} 40%, #2D1B69 70%, #4A2C8A 100%)`, padding:'clamp(56px,10vh,96px) 24px 64px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'10%', left:'5%', width:300, height:300, borderRadius:'50%', background:'rgba(139,92,246,0.08)', filter:'blur(60px)' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'10%', width:200, height:200, borderRadius:'50%', background:'rgba(236,72,153,0.08)', filter:'blur(40px)' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:700, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', background:'rgba(255,255,255,0.1)', borderRadius:999, marginBottom:28, backdropFilter:'blur(10px)' }}>
            <span style={{ fontSize:14 }}>🎬</span>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>Freample Com</span>
          </div>
          <h1 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:800, color:'#fff', lineHeight:1.12, letterSpacing:'-0.03em', margin:'0 0 16px' }}>
            Votre communication,<br/>notre expertise
          </h1>
          <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'rgba(255,255,255,0.6)', lineHeight:1.6, margin:'0 0 36px', maxWidth:520, marginLeft:'auto', marginRight:'auto' }}>
            Montage vidéo, réseaux sociaux, design, publicité — boostez votre visibilité avec nos équipes créatives.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => document.getElementById('demande')?.scrollIntoView({behavior:'smooth'})}
              style={{ padding:'14px 32px', background:'#fff', color:C.dark, border:'none', borderRadius:999, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:C.font, transition:'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
              Demander un devis gratuit →
            </button>
            <button onClick={() => document.querySelector('.portfolio-section')?.scrollIntoView({behavior:'smooth'})}
              style={{ padding:'14px 32px', background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:999, fontSize:16, fontWeight:500, cursor:'pointer', fontFamily:C.font }}>
              Voir nos réalisations ↓
            </button>
          </div>
        </div>
      </div>

      {/* ── Services ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'56px 24px' }}>
        <h2 style={{ fontSize:28, fontWeight:800, textAlign:'center', marginBottom:8, letterSpacing:'-0.02em' }}>Nos services</h2>
        <p style={{ fontSize:15, color:C.textSec, textAlign:'center', marginBottom:40 }}>Des solutions complètes pour entreprises et créateurs de contenu</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20 }}>
          {SERVICES.map(s => (
            <div key={s.title} style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${C.border}`, transition:'all 0.2s', cursor:'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(139,92,246,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ background:s.color, padding:'28px 24px', color:'#fff' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{s.icon}</div>
                <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:14, opacity:0.8 }}>{s.desc}</div>
              </div>
              <div style={{ padding:'20px 24px', background:C.bg }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontSize:16, fontWeight:800, color:C.primary }}>{s.price}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', background:'#F0FDF4', borderRadius:8, fontSize:12, fontWeight:600, color:'#059669' }}>
                    <span>⚡</span> {s.delai}
                  </div>
                </div>
                {s.features.map(f => (
                  <div key={f} style={{ fontSize:13, color:C.textSec, padding:'4px 0', display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ color:C.primary, fontSize:14 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Délais de livraison ── */}
      <div style={{ background:C.soft, padding:'48px 24px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>Nos engagements de délais</h2>
            <p style={{ fontSize:15, color:C.textSec }}>Des délais clairs, respectés, garantis</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16 }}>
            {[
              { icon:'📱', type:'TikTok / Reel', delai:'48h', detail:'Après réception des rushes', color:C.primary },
              { icon:'🎬', type:'YouTube Short', delai:'72h', detail:'60s à 3 minutes', color:'#EC4899' },
              { icon:'▶️', type:'Vidéo YouTube', delai:'5 jours', detail:'5 à 15 minutes', color:'#3B82F6' },
              { icon:'🎨', type:'Logo simple', delai:'3 jours', detail:'2 propositions incluses', color:'#10B981' },
              { icon:'📐', type:'Charte graphique', delai:'7 jours', detail:'Logo + typo + couleurs', color:'#F59E0B' },
              { icon:'📈', type:'Campagne Ads', delai:'48h setup', detail:'Premiers résultats J+3', color:'#DC2626' },
              { icon:'📅', type:'Gestion RS', delai:'J+1 lancement', detail:'Planning dès le lendemain', color:'#7C3AED' },
              { icon:'🔄', type:'Révisions', delai:'24h', detail:'Chaque révision en 24h max', color:'#0891B2' },
            ].map(d => (
              <div key={d.type} style={{ background:C.bg, borderRadius:14, padding:'18px 16px', border:`1px solid ${C.border}`, textAlign:'center' }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{d.icon}</div>
                <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>{d.type}</div>
                <div style={{ fontSize:22, fontWeight:800, color:d.color, marginBottom:4 }}>{d.delai}</div>
                <div style={{ fontSize:12, color:C.textSec }}>{d.detail}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:24 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', background:'#D1FAE5', borderRadius:999, fontSize:14, fontWeight:600, color:'#065F46' }}>
              ✅ Satisfait ou refait — si le délai n'est pas respecté, la révision est offerte
            </div>
          </div>
        </div>
      </div>

      {/* ── Portfolio / Réalisations ── */}
      <PortfolioSection />

      {/* ── Packs mensuels ── */}
      <div id="packs" style={{ padding:'64px 24px', background:C.bg }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', background:C.soft, borderRadius:999, marginBottom:16 }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.primary }}>🔥 Le plus populaire</span>
            </div>
            <h2 style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em', marginBottom:8 }}>Nos packs mensuels</h2>
            <p style={{ fontSize:15, color:C.textSec, maxWidth:500, margin:'0 auto' }}>Du contenu régulier pour votre marque. Résiliable à tout moment.</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20, alignItems:'stretch' }}>
            {/* Starter */}
            <div style={{ background:C.bg, borderRadius:20, border:`1px solid ${C.border}`, padding:'32px 24px', display:'flex', flexDirection:'column' }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.textSec, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Starter</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:6 }}>
                <span style={{ fontSize:36, fontWeight:800, color:C.text }}>149€</span>
                <span style={{ fontSize:14, color:C.textSec }}>/mois</span>
              </div>
              <p style={{ fontSize:14, color:C.textSec, lineHeight:1.5, marginBottom:20 }}>Idéal pour démarrer sur TikTok</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24, flex:1 }}>
                {['4 TikToks / mois','Sous-titres animés','Musique tendance','1 révision par vidéo','Livraison en 72h'].map(f => (
                  <div key={f} style={{ display:'flex', gap:8, fontSize:14, color:C.text }}>
                    <span style={{ color:C.primary, fontWeight:700, flexShrink:0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => document.getElementById('demande')?.scrollIntoView({behavior:'smooth'})}
                style={{ width:'100%', padding:'13px', background:C.bg, color:C.text, border:`2px solid ${C.border}`, borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:C.font, transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}>
                Choisir Starter
              </button>
            </div>

            {/* Growth — highlighted */}
            <div style={{ background:C.text, borderRadius:20, padding:'32px 24px', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:16, right:16, background:C.primary, color:'#fff', padding:'4px 12px', borderRadius:999, fontSize:12, fontWeight:700 }}>Populaire</div>
              <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Growth</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:6 }}>
                <span style={{ fontSize:36, fontWeight:800, color:'#fff' }}>349€</span>
                <span style={{ fontSize:14, color:'rgba(255,255,255,0.5)' }}>/mois</span>
              </div>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.6)', lineHeight:1.5, marginBottom:20 }}>Pour les créateurs qui veulent scaler</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24, flex:1 }}>
                {['10 TikToks / mois','5 Reels Instagram','Miniatures YouTube','Sous-titres + effets','2 révisions par vidéo','Livraison en 48h','Stratégie contenu mensuelle'].map(f => (
                  <div key={f} style={{ display:'flex', gap:8, fontSize:14, color:'rgba(255,255,255,0.9)' }}>
                    <span style={{ color:C.primary, fontWeight:700, flexShrink:0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => document.getElementById('demande')?.scrollIntoView({behavior:'smooth'})}
                style={{ width:'100%', padding:'13px', background:C.primary, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:C.font, transition:'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                onMouseLeave={e => e.currentTarget.style.background = C.primary}>
                Choisir Growth →
              </button>
            </div>

            {/* Pro */}
            <div style={{ background:C.bg, borderRadius:20, border:`1px solid ${C.border}`, padding:'32px 24px', display:'flex', flexDirection:'column' }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.textSec, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Pro</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:6 }}>
                <span style={{ fontSize:36, fontWeight:800, color:C.text }}>699€</span>
                <span style={{ fontSize:14, color:C.textSec }}>/mois</span>
              </div>
              <p style={{ fontSize:14, color:C.textSec, lineHeight:1.5, marginBottom:20 }}>Gestion complète de votre présence</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24, flex:1 }}>
                {['20 TikToks / mois','10 Reels Instagram','Gestion 1 réseau social','Planning éditorial','Révisions illimitées','Livraison en 48h','Appel stratégie mensuel','Reporting performance'].map(f => (
                  <div key={f} style={{ display:'flex', gap:8, fontSize:14, color:C.text }}>
                    <span style={{ color:C.primary, fontWeight:700, flexShrink:0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => document.getElementById('demande')?.scrollIntoView({behavior:'smooth'})}
                style={{ width:'100%', padding:'13px', background:C.bg, color:C.text, border:`2px solid ${C.border}`, borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:C.font, transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}>
                Choisir Pro
              </button>
            </div>

            {/* Agency */}
            <div style={{ background:`linear-gradient(135deg, ${C.dark}, #2D1B69)`, borderRadius:20, padding:'32px 24px', display:'flex', flexDirection:'column' }}>
              <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Agency</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:6 }}>
                <span style={{ fontSize:28, fontWeight:800, color:'#fff' }}>Sur mesure</span>
              </div>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.5, marginBottom:20 }}>Pour les marques et agences</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24, flex:1 }}>
                {['Volume illimité','Multi-plateformes','Shooting vidéo inclus','Direction artistique','Account manager dédié','Reporting avancé','Publicité en ligne','Stratégie 360°'].map(f => (
                  <div key={f} style={{ display:'flex', gap:8, fontSize:14, color:'rgba(255,255,255,0.8)' }}>
                    <span style={{ color:'#F59E0B', fontWeight:700, flexShrink:0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => document.getElementById('demande')?.scrollIntoView({behavior:'smooth'})}
                style={{ width:'100%', padding:'13px', background:'rgba(255,255,255,0.1)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:C.font, transition:'all .15s', backdropFilter:'blur(4px)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}>
                Nous contacter
              </button>
            </div>
          </div>

          {/* Reassurance */}
          <div style={{ display:'flex', justifyContent:'center', gap:24, marginTop:32, flexWrap:'wrap' }}>
            {[
              { icon:'🔄', text:'Résiliable à tout moment' },
              { icon:'⚡', text:'Livraison en 48-72h' },
              { icon:'✅', text:'Satisfait ou refait' },
              { icon:'💳', text:'Paiement sécurisé' },
            ].map(r => (
              <div key={r.text} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>{r.icon}</span>
                <span style={{ fontSize:13, color:C.textSec, fontWeight:500 }}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grille tarifaire ── */}
      <div style={{ background:C.soft, padding:'56px 24px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <h2 style={{ fontSize:26, fontWeight:800, textAlign:'center', marginBottom:8 }}>Grille tarifaire</h2>
          <p style={{ fontSize:15, color:C.textSec, textAlign:'center', marginBottom:32 }}>Tarifs transparents, sans surprise</p>
          {TARIFS_RAW.map((t, i) => (
            <div key={t.cat} style={{ marginBottom:12 }}>
              <button onClick={() => setOpenTarif(openTarif === i ? -1 : i)}
                style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:C.bg, border:`1px solid ${C.border}`, borderRadius: openTarif === i ? '12px 12px 0 0' : 12, cursor:'pointer', fontFamily:C.font }}>
                <span style={{ fontSize:16, fontWeight:700, color:C.text }}>{t.cat}</span>
                <span style={{ fontSize:18, color:C.textLight, transform: openTarif === i ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▼</span>
              </button>
              {openTarif === i && (
                <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderTop:'none', borderRadius:'0 0 12px 12px', overflow:'hidden' }}>
                  {t.items.map((item, j) => (
                    <div key={j} style={{ display:'flex', justifyContent:'space-between', padding:'12px 20px', borderBottom: j < t.items.length-1 ? `1px solid ${C.border}` : 'none' }}>
                      <span style={{ fontSize:14, color:C.text }}>{item.nom}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:C.primary }}>{item.prix}€</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Comment ça marche ── */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'56px 24px', textAlign:'center' }}>
        <h2 style={{ fontSize:26, fontWeight:800, marginBottom:8 }}>Comment ça marche ?</h2>
        <p style={{ fontSize:15, color:C.textSec, marginBottom:40 }}>De la demande à la livraison en 4 étapes</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32 }}>
          {[
            { icon:'📝', title:'1. Demandez un devis', desc:'Décrivez votre projet, on vous répond en 24h avec un devis détaillé' },
            { icon:'✅', title:'2. Validez & payez', desc:'Acceptez le devis et payez en ligne. Les fonds sont sécurisés sur Freample' },
            { icon:'🎬', title:'3. On crée', desc:'Nos monteurs et designers travaillent sur votre projet avec des révisions incluses' },
            { icon:'📦', title:'4. Livraison', desc:'Recevez vos fichiers directement sur Freample. Facture automatique envoyée' },
          ].map(s => (
            <div key={s.title}>
              <div style={{ width:56, height:56, borderRadius:14, background:C.soft, border:`1px solid ${C.border}`, margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{s.icon}</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{s.title}</div>
              <div style={{ fontSize:13, color:C.textSec, lineHeight:1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Témoignages ── */}
      <div style={{ background:C.dark, padding:'56px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <h2 style={{ fontSize:24, fontWeight:800, color:'#fff', textAlign:'center', marginBottom:32 }}>Ils nous font confiance</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
            {TEMOIGNAGES.map(t => (
              <div key={t.nom} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff', fontWeight:800 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{t.nom}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{t.type}</div>
                  </div>
                </div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.6, marginBottom:10 }}>"{t.text}"</div>
                <div style={{ color:'#F59E0B', fontSize:13 }}>{'★'.repeat(t.note)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Brief structuré Fiverr-style (3 étapes) ── */}
      <div id="demande" style={{ padding:'64px 24px', background:C.soft, borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          <h2 style={{ fontSize:26, fontWeight:800, textAlign:'center', marginBottom:8 }}>Commander un service</h2>
          <p style={{ fontSize:15, color:C.textSec, textAlign:'center', marginBottom:24 }}>Remplissez le brief en 3 étapes — réponse en moins de 24h</p>

          {/* Progress bar */}
          <div style={{ display:'flex', gap:8, marginBottom:32 }}>
            {['Votre projet','Brief créatif','Vos coordonnées'].map((s,i) => (
              <div key={s} style={{ flex:1 }}>
                <div style={{ height:4, borderRadius:2, background: i+1 <= briefStep ? C.primary : '#E5E5E5', transition:'background .3s', marginBottom:6 }} />
                <div style={{ fontSize:12, fontWeight: i+1 === briefStep ? 700 : 400, color: i+1 <= briefStep ? C.primary : C.textLight }}>{i+1}. {s}</div>
              </div>
            ))}
          </div>

          <div style={{ background:C.bg, borderRadius:16, padding:'28px 24px', border:`1px solid ${C.border}`, boxShadow:'0 4px 16px rgba(0,0,0,0.04)' }}>

            {demandeSent ? (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'#D1FAE5', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>✓</div>
                <div style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6 }}>Brief envoyé !</div>
                <div style={{ fontSize:14, color:C.textSec, marginBottom:4 }}>Nous analysons votre projet et vous répondrons sous 24h</div>
                <div style={{ fontSize:14, color:C.primary, fontWeight:600 }}>{brief.email}</div>
                <div style={{ marginTop:20, padding:'16px', background:C.soft, borderRadius:12, textAlign:'left' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:8 }}>Récapitulatif :</div>
                  <div style={{ fontSize:13, color:C.textSec, lineHeight:1.6 }}>
                    {brief.type} · {brief.format} · {brief.quantite} vidéo{brief.quantite>1?'s':''}<br/>
                    Style : {brief.style || '—'} · Fréquence : {brief.frequence}<br/>
                    {brief.deadline && `Deadline : ${brief.deadline}`}
                  </div>
                </div>
              </div>
            ) : (<>

            {/* ── Étape 1 : Type de projet ── */}
            {briefStep === 1 && (<div>
              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:14, fontWeight:700, color:C.text, display:'block', marginBottom:8 }}>Quel type de service ? *</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    { v:'Montage vidéo', icon:'🎬', sub:'TikTok, Reels, YouTube' },
                    { v:'Réseaux sociaux', icon:'📱', sub:'Gestion de comptes' },
                    { v:'Design', icon:'🎨', sub:'Logo, visuels, branding' },
                    { v:'Publicité', icon:'📈', sub:'Meta Ads, Google Ads' },
                  ].map(t => (
                    <button key={t.v} onClick={() => setBrief(p=>({...p, type:t.v}))}
                      style={{ padding:'16px 14px', borderRadius:12, border:`2px solid ${brief.type===t.v?C.primary:C.border}`, background:brief.type===t.v?C.soft:C.bg, cursor:'pointer', textAlign:'left', fontFamily:C.font, transition:'all .15s' }}>
                      <div style={{ fontSize:24, marginBottom:6 }}>{t.icon}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{t.v}</div>
                      <div style={{ fontSize:12, color:C.textSec }}>{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {brief.type === 'Montage vidéo' && (
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontSize:14, fontWeight:700, color:C.text, display:'block', marginBottom:8 }}>Format *</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['TikTok / Reel (vertical)','YouTube Short','Vidéo YouTube (longue)','Clip promo','Stories'].map(f => (
                      <button key={f} onClick={() => setBrief(p=>({...p, format:f}))}
                        style={{ padding:'8px 16px', borderRadius:999, border:`1.5px solid ${brief.format===f?C.primary:C.border}`, background:brief.format===f?C.soft:C.bg, color:brief.format===f?C.primary:C.textSec, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:C.font }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Quantité</label>
                  <select value={brief.quantite} onChange={e=>setBrief(p=>({...p,quantite:e.target.value}))} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box', background:'#fff' }}>
                    {['1','2','3','5','10','15','20','30'].map(n=><option key={n} value={n}>{n} vidéo{n>1?'s':''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Fréquence</label>
                  <select value={brief.frequence} onChange={e=>setBrief(p=>({...p,frequence:e.target.value}))} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box', background:'#fff' }}>
                    <option value="ponctuel">Ponctuel (une fois)</option>
                    <option value="hebdomadaire">Chaque semaine</option>
                    <option value="mensuel">Chaque mois</option>
                  </select>
                </div>
              </div>

              <button onClick={() => { if(brief.type) setBriefStep(2); }}
                style={{ width:'100%', padding:'14px', background:brief.type?C.primary:'#D0D0D0', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:brief.type?'pointer':'not-allowed', fontFamily:C.font }}>
                Continuer →
              </button>
            </div>)}

            {/* ── Étape 2 : Brief créatif ── */}
            {briefStep === 2 && (<div>
              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:14, fontWeight:700, color:C.text, display:'block', marginBottom:8 }}>Style souhaité</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                  {['Dynamique / Énergique','Minimaliste / Clean','Fun / Décalé','Pro / Corporate','Cinématique / Épique','Doux / Apaisant'].map(s => (
                    <button key={s} onClick={() => setBrief(p=>({...p, style:s}))}
                      style={{ padding:'8px 14px', borderRadius:999, border:`1.5px solid ${brief.style===s?C.primary:C.border}`, background:brief.style===s?C.soft:C.bg, color:brief.style===s?C.primary:C.textSec, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:C.font }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Vidéo de référence / inspiration</label>
                <input value={brief.reference} onChange={e=>setBrief(p=>({...p,reference:e.target.value}))} placeholder="Lien TikTok, Instagram ou YouTube d'une vidéo que vous aimez" style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box' }} />
                <div style={{ fontSize:12, color:C.textLight, marginTop:4 }}>Aide le monteur à comprendre exactement ce que vous voulez</div>
              </div>

              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:14, fontWeight:700, color:C.text, display:'block', marginBottom:8 }}>Options</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {[
                    { v:'sousTitres', label:'Sous-titres animés', icon:'💬' },
                    { v:'musique', label:'Musique tendance', icon:'🎵' },
                    { v:'transitions', label:'Transitions créatives', icon:'✨' },
                    { v:'colorGrading', label:'Color grading', icon:'🎨' },
                    { v:'voixOff', label:'Voix-off', icon:'🎙️' },
                    { v:'miniature', label:'Miniature YouTube', icon:'🖼️' },
                  ].map(o => (
                    <button key={o.v} onClick={() => setBrief(p=>({...p, [o.v]: !p[o.v] }))}
                      style={{ padding:'8px 14px', borderRadius:10, border:`1.5px solid ${brief[o.v]?C.primary:C.border}`, background:brief[o.v]?C.soft:C.bg, color:brief[o.v]?C.primary:C.textSec, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:C.font, display:'flex', alignItems:'center', gap:6 }}>
                      {o.icon} {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Instructions complémentaires</label>
                <textarea value={brief.description} onChange={e=>setBrief(p=>({...p,description:e.target.value}))} placeholder="Détails supplémentaires : ton, durée, éléments à inclure, texte à afficher..." rows={3} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:1.5 }} />
              </div>

              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Vos rushes / fichiers source</label>
                <div style={{ border:`2px dashed ${C.border}`, borderRadius:12, padding:'24px', textAlign:'center', cursor:'pointer', background:'#FAFAFA' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>📁</div>
                  <div style={{ fontSize:14, fontWeight:600, color:C.text }}>Glissez vos fichiers ici</div>
                  <div style={{ fontSize:13, color:C.textSec, marginTop:4 }}>Vidéos brutes, images, logos, musiques...</div>
                  <div style={{ fontSize:12, color:C.textLight, marginTop:4 }}>MP4, MOV, JPG, PNG, MP3 — max 500 Mo</div>
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setBriefStep(1)} style={{ flex:1, padding:'14px', background:C.bg, color:C.text, border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:C.font }}>← Retour</button>
                <button onClick={() => setBriefStep(3)} style={{ flex:2, padding:'14px', background:C.primary, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:C.font }}>Continuer →</button>
              </div>
            </div>)}

            {/* ── Étape 3 : Coordonnées ── */}
            {briefStep === 3 && (<div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Votre nom / pseudo *</label>
                  <input value={brief.nom} onChange={e=>setBrief(p=>({...p,nom:e.target.value}))} placeholder="@emma.lifestyle, Salon Léa..." style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Email *</label>
                  <input type="email" value={brief.email} onChange={e=>setBrief(p=>({...p,email:e.target.value}))} placeholder="vous@email.com" style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box' }} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Téléphone</label>
                  <input type="tel" value={brief.telephone} onChange={e=>setBrief(p=>({...p,telephone:e.target.value}))} placeholder="06 12 34 56 78" style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Deadline souhaitée</label>
                  <input type="date" value={brief.deadline} onChange={e=>setBrief(p=>({...p,deadline:e.target.value}))} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box' }} />
                </div>
              </div>

              {/* Récap */}
              <div style={{ padding:'16px', background:C.soft, borderRadius:12, marginBottom:18, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:8 }}>📋 Récapitulatif du brief</div>
                <div style={{ fontSize:13, color:C.textSec, lineHeight:1.7 }}>
                  <strong>Service :</strong> {brief.type || '—'}{brief.format ? ` · ${brief.format}` : ''}<br/>
                  <strong>Quantité :</strong> {brief.quantite} · {brief.frequence}<br/>
                  <strong>Style :</strong> {brief.style || 'Non précisé'}<br/>
                  <strong>Options :</strong> {['sousTitres','musique','transitions','colorGrading','voixOff','miniature'].filter(k=>brief[k]).map(k=>({sousTitres:'Sous-titres',musique:'Musique',transitions:'Transitions',colorGrading:'Color grading',voixOff:'Voix-off',miniature:'Miniature'}[k])).join(', ') || 'Aucune'}
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setBriefStep(2)} style={{ flex:1, padding:'14px', background:C.bg, color:C.text, border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:C.font }}>← Retour</button>
                <button onClick={() => { if(brief.nom && brief.email) setDemandeSent(true); }}
                  style={{ flex:2, padding:'14px', background:(brief.nom&&brief.email)?C.primary:'#D0D0D0', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:(brief.nom&&brief.email)?'pointer':'not-allowed', fontFamily:C.font }}>
                  📩 Envoyer le brief
                </button>
              </div>
            </div>)}

            </>)}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding:'28px 24px', borderTop:`1px solid ${C.border}`, textAlign:'center' }}>
        <span style={{ fontSize:13, color:C.textLight }}>© 2026 Freample Com · <a href="/cgu" style={{ color:C.textSec, textDecoration:'none' }}>CGU</a> · <a href="/recrutement" style={{ color:C.textSec, textDecoration:'none' }}>Recrutement</a></span>
      </div>
    </div>
  );
}
