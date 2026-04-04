import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';

const C = {
  primary: '#8B5CF6', primaryHover: '#7C3AED', dark: '#0F0A1A', darkSoft: '#1A1128',
  text: '#0F0A1A', textSec: '#6B7280', textLight: '#9CA3AF',
  bg: '#FFFFFF', soft: '#F5F3FF', border: '#E9E5F5',
  pink: '#EC4899', blue: '#3B82F6', green: '#10B981', gold: '#F59E0B',
  font: "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif",
};

const SERVICES = [
  { icon:'🎬', title:'Montage Vidéo', desc:'TikTok, Reels, YouTube Shorts', price:'À partir de 49€', color:'linear-gradient(135deg,#EC4899,#8B5CF6)', features:['Montage dynamique','Sous-titres auto','Musique tendance','Transitions pro'] },
  { icon:'📱', title:'Réseaux Sociaux', desc:'Gestion de comptes & stratégie', price:'À partir de 299€/mois', color:'linear-gradient(135deg,#3B82F6,#8B5CF6)', features:['Planning éditorial','Création de contenu','Community management','Reporting mensuel'] },
  { icon:'🎨', title:'Design Graphique', desc:'Logos, visuels, identité', price:'À partir de 99€', color:'linear-gradient(135deg,#10B981,#3B82F6)', features:['Logo & charte graphique','Visuels réseaux sociaux','Flyers & cartes de visite','Bannières web'] },
  { icon:'📈', title:'Publicité en ligne', desc:'Meta Ads, Google Ads, TikTok Ads', price:'À partir de 199€/mois', color:'linear-gradient(135deg,#F59E0B,#EC4899)', features:['Création de campagnes','Ciblage audience','A/B testing','Reporting ROI'] },
];

const TARIFS = [
  { cat:'Montage vidéo', items:[{nom:'TikTok / Reel (15-60s)',prix:'49€'},{nom:'YouTube Short (60s-3min)',prix:'89€'},{nom:'Vidéo YouTube (5-15min)',prix:'199€'},{nom:'Clip promotionnel',prix:'349€'},{nom:'Pack 5 TikToks',prix:'199€'},{nom:'Pack 10 TikToks',prix:'349€'}] },
  { cat:'Réseaux sociaux', items:[{nom:'Gestion 1 réseau / mois',prix:'299€'},{nom:'Gestion 3 réseaux / mois',prix:'699€'},{nom:'Stratégie + audit',prix:'149€'},{nom:'Shooting photo (10 visuels)',prix:'249€'}] },
  { cat:'Design', items:[{nom:'Logo simple',prix:'99€'},{nom:'Logo + charte graphique',prix:'249€'},{nom:'Pack 10 visuels RS',prix:'149€'},{nom:'Flyer / Affiche',prix:'69€'}] },
];

const TEMOIGNAGES = [
  { nom:'@emma.lifestyle', type:'Influenceuse', avatar:'EL', text:'Freample Com a transformé mon contenu TikTok. Les montages sont top et livrés en 48h !', note:5 },
  { nom:'Salon Léa', type:'Commerce', avatar:'SL', text:'Notre Instagram est passé de 200 à 5000 abonnés en 3 mois grâce à leur gestion de compte.', note:5 },
  { nom:'@alex.fitness', type:'Influenceur', avatar:'AF', text:'Pack 10 TikToks par mois, qualité constante, je recommande à 100%.', note:5 },
];

export default function FreampleCom() {
  const navigate = useNavigate();
  const [openTarif, setOpenTarif] = useState(0);

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
            <button onClick={() => navigate('/register?secteur=com')}
              style={{ padding:'14px 32px', background:'#fff', color:C.dark, border:'none', borderRadius:999, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:C.font, transition:'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
              Demander un devis gratuit →
            </button>
            <button style={{ padding:'14px 32px', background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:999, fontSize:16, fontWeight:500, cursor:'pointer', fontFamily:C.font }}>
              Voir nos réalisations
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
                <div style={{ fontSize:16, fontWeight:800, color:C.primary, marginBottom:14 }}>{s.price}</div>
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

      {/* ── Grille tarifaire ── */}
      <div style={{ background:C.soft, padding:'56px 24px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <h2 style={{ fontSize:26, fontWeight:800, textAlign:'center', marginBottom:8 }}>Grille tarifaire</h2>
          <p style={{ fontSize:15, color:C.textSec, textAlign:'center', marginBottom:32 }}>Tarifs transparents, sans surprise</p>
          {TARIFS.map((t, i) => (
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
                      <span style={{ fontSize:14, fontWeight:700, color:C.primary }}>{item.prix}</span>
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

      {/* ── CTA ── */}
      <div style={{ padding:'56px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:26, fontWeight:800, marginBottom:12 }}>Prêt à booster votre communication ?</h2>
          <p style={{ fontSize:15, color:C.textSec, marginBottom:28, lineHeight:1.5 }}>
            Demandez un devis gratuit. Réponse en moins de 24h.
          </p>
          <button onClick={() => navigate('/register?secteur=com')}
            style={{ padding:'14px 36px', background:C.primary, color:'#fff', border:'none', borderRadius:999, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:C.font, transition:'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
            onMouseLeave={e => e.currentTarget.style.background = C.primary}>
            Demander un devis gratuit →
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding:'28px 24px', borderTop:`1px solid ${C.border}`, textAlign:'center' }}>
        <span style={{ fontSize:13, color:C.textLight }}>© 2026 Freample Com · <a href="/cgu" style={{ color:C.textSec, textDecoration:'none' }}>CGU</a> · <a href="/recrutement" style={{ color:C.textSec, textDecoration:'none' }}>Recrutement</a></span>
      </div>
    </div>
  );
}
