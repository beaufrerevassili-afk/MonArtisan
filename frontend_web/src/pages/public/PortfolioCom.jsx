import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const L = {
  bg: '#0A0A0A',
  white: '#FFFFFF',
  text: '#FAFAF8',
  textSec: 'rgba(255,255,255,0.5)',
  textLight: 'rgba(255,255,255,0.3)',
  gold: '#C9A96E',
  goldLight: 'rgba(201,169,110,0.15)',
  border: 'rgba(255,255,255,0.08)',
  font: "'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif",
};

const CATEGORIES = ['Tout', 'Montage vidéo', 'TikTok', 'YouTube', 'Reels', 'Design'];

export default function PortfolioCom() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tout');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/com/portfolio').then(r => {
      setPortfolio(r.data.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'Tout' ? portfolio : portfolio.filter(p => p.categorie === filter);

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>

      {/* ══ NAVBAR MINIMALE ══ */}
      <nav style={{
        position:'sticky', top:0, zIndex:200, display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'0 clamp(24px,4vw,56px)', height:64,
        background:'rgba(10,10,10,0.9)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom:`1px solid ${L.border}`,
      }}>
        <button onClick={()=>navigate('/com')} style={{
          background:'none', border:'none', cursor:'pointer', color:L.textSec,
          fontSize:13, fontFamily:L.font, display:'flex', alignItems:'center', gap:8,
          letterSpacing:'0.04em', textTransform:'uppercase', transition:'color .2s',
        }}
          onMouseEnter={e=>e.currentTarget.style.color='#fff'}
          onMouseLeave={e=>e.currentTarget.style.color=L.textSec}>
          ← Retour
        </button>
        <div style={{ fontSize:12, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em' }}>
          Freample Com
        </div>
        <button onClick={()=>navigate('/com')} style={{
          padding:'8px 20px', background:'transparent', border:`1px solid ${L.border}`,
          color:'#fff', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:L.font,
          letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .2s',
        }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=L.gold; e.currentTarget.style.color=L.gold; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=L.border; e.currentTarget.style.color='#fff'; }}>
          Devis gratuit
        </button>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ padding:'clamp(80px,14vh,140px) 32px clamp(48px,8vh,80px)', textAlign:'center', position:'relative' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:400, borderRadius:'50%', background:`radial-gradient(circle, ${L.goldLight} 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.35em', marginBottom:20 }}>Portfolio</div>
          <h1 style={{ fontSize:'clamp(32px,6vw,60px)', fontWeight:200, color:'#fff', letterSpacing:'-0.03em', lineHeight:1.08, margin:'0 0 16px' }}>
            Chaque projet,<br/>une <span style={{ fontWeight:700, fontStyle:'italic' }}>vision</span>.
          </h1>
          <p style={{ fontSize:16, color:L.textSec, maxWidth:440, margin:'0 auto', lineHeight:1.6, fontWeight:300 }}>
            Explorez nos réalisations et imaginez ce que nous pouvons créer ensemble.
          </p>
        </div>
      </section>

      {/* ══ FILTRES ══ */}
      <div style={{ display:'flex', justifyContent:'center', gap:4, padding:'0 24px 48px', flexWrap:'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={()=>setFilter(cat)}
            style={{
              padding:'10px 24px', background: filter===cat ? L.gold : 'transparent',
              border:`1px solid ${filter===cat ? L.gold : L.border}`,
              color: filter===cat ? '#fff' : L.textSec,
              fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font,
              letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .25s',
            }}
            onMouseEnter={e=>{ if(filter!==cat) { e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; e.currentTarget.style.color='#fff'; } }}
            onMouseLeave={e=>{ if(filter!==cat) { e.currentTarget.style.borderColor=L.border; e.currentTarget.style.color=L.textSec; } }}>
            {cat}
          </button>
        ))}
      </div>

      {/* ══ GRILLE PORTFOLIO ══ */}
      <section style={{ padding:'0 clamp(24px,4vw,56px) 80px', maxWidth:1200, margin:'0 auto' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:L.textSec }}>
            <div style={{ width:32, height:32, border:'2px solid rgba(255,255,255,0.1)', borderTopColor:L.gold, borderRadius:'50%', margin:'0 auto 16px', animation:'spin .7s linear infinite' }} />
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:56, marginBottom:20, opacity:0.15 }}>🎬</div>
            <div style={{ fontSize:20, fontWeight:300, color:'#fff', marginBottom:8 }}>
              {portfolio.length === 0 ? 'Le portfolio arrive bientôt' : 'Aucun projet dans cette catégorie'}
            </div>
            <div style={{ fontSize:14, color:L.textSec, maxWidth:400, margin:'0 auto', lineHeight:1.6 }}>
              {portfolio.length === 0
                ? 'Nos dernières réalisations seront bientôt disponibles ici.'
                : 'Explorez les autres catégories pour découvrir nos réalisations.'}
            </div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:2 }}>
            {filtered.map((item, i) => (
              <div key={item.id}
                onClick={()=>setSelected(item)}
                style={{
                  position:'relative', cursor:'pointer', overflow:'hidden',
                  aspectRatio:'16/10',
                  opacity:1, transition:'all .4s',
                }}>
                {/* Image / placeholder */}
                <div style={{ position:'absolute', inset:0, background:'#111' }}>
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.titre}
                      style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .6s cubic-bezier(0.25,0.46,0.45,0.94)' }}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} />
                  ) : (
                    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:48, opacity:0.08 }}>🎬</span>
                    </div>
                  )}
                </div>
                {/* Overlay au hover */}
                <div style={{
                  position:'absolute', inset:0, display:'flex', flexDirection:'column',
                  justifyContent:'flex-end', padding:'24px',
                  background:'linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.85) 100%)',
                  opacity:0, transition:'opacity .35s',
                }}
                  onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='0'}>
                  <div style={{ fontSize:11, color:L.gold, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>{item.categorie}</div>
                  <div style={{ fontSize:18, fontWeight:600, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>{item.titre}</div>
                  {item.description && <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.5 }}>{item.description}</div>}
                  <div style={{ marginTop:12, fontSize:12, color:L.gold, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                    Voir le projet →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ CTA BAS DE PAGE ══ */}
      <section style={{ borderTop:`1px solid ${L.border}`, padding:'clamp(56px,8vh,88px) 32px', textAlign:'center' }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:16 }}>Votre projet</div>
          <h2 style={{ fontSize:'clamp(22px,3.5vw,32px)', fontWeight:200, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 12px', lineHeight:1.2 }}>
            Envie d'un résultat <span style={{ fontWeight:700 }}>similaire</span> ?
          </h2>
          <p style={{ fontSize:14, color:L.textSec, lineHeight:1.6, marginBottom:32 }}>
            Parlez-nous de votre projet. Devis gratuit, réponse sous 2h.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>navigate('/com')}
              style={{
                padding:'14px 40px', background:L.gold, color:'#fff', border:'none',
                fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font,
                letterSpacing:'0.06em', textTransform:'uppercase', transition:'background .2s',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='#8B7240'}
              onMouseLeave={e=>e.currentTarget.style.background=L.gold}>
              Demander un devis
            </button>
            <a href="https://wa.me/33769387193?text=Bonjour, j'ai vu votre portfolio et j'aimerais discuter d'un projet" target="_blank" rel="noopener noreferrer"
              style={{
                padding:'14px 32px', background:'transparent', color:'#fff',
                border:`1px solid ${L.border}`, fontSize:13, fontWeight:500,
                cursor:'pointer', fontFamily:L.font, textDecoration:'none',
                letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .2s',
                display:'inline-flex', alignItems:'center',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=L.border; }}>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding:'24px 32px', borderTop:`1px solid ${L.border}`, textAlign:'center' }}>
        <span style={{ fontSize:11, color:L.textLight, letterSpacing:'0.1em', textTransform:'uppercase' }}>
          © 2026 Freample Com
        </span>
      </footer>

      {/* ══ MODAL VIDÉO — Plein écran ══ */}
      {selected && (
        <div style={{
          position:'fixed', inset:0, zIndex:3000, background:'rgba(0,0,0,0.92)',
          backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:24, cursor:'pointer',
        }} onClick={()=>setSelected(null)}>
          <div style={{ maxWidth:800, width:'100%', textAlign:'center' }} onClick={e=>e.stopPropagation()}>
            {/* Image */}
            <div style={{ marginBottom:28, position:'relative' }}>
              {selected.thumbnail_url ? (
                <img src={selected.thumbnail_url} alt={selected.titre}
                  style={{ width:'100%', maxHeight:'55vh', objectFit:'contain', display:'block', margin:'0 auto' }} />
              ) : (
                <div style={{ height:300, background:'#111', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:80, opacity:0.1 }}>🎬</span>
                </div>
              )}
            </div>
            {/* Info */}
            <div style={{ fontSize:11, color:L.gold, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:10 }}>{selected.categorie}</div>
            <h3 style={{ fontSize:'clamp(22px,3.5vw,32px)', fontWeight:300, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 8px' }}>{selected.titre}</h3>
            {selected.description && (
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.6, maxWidth:500, margin:'0 auto 28px' }}>{selected.description}</p>
            )}
            {/* CTA */}
            <a href={selected.video_url} target="_blank" rel="noopener noreferrer"
              style={{
                display:'inline-block', padding:'14px 40px', background:L.gold, color:'#fff',
                fontSize:13, fontWeight:600, textDecoration:'none', letterSpacing:'0.06em',
                textTransform:'uppercase', transition:'background .2s',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='#8B7240'}
              onMouseLeave={e=>e.currentTarget.style.background=L.gold}>
              ▶ Voir la vidéo
            </a>
          </div>
          {/* Close */}
          <button onClick={()=>setSelected(null)}
            style={{
              position:'absolute', top:24, right:32, background:'none', border:'none',
              color:'rgba(255,255,255,0.4)', fontSize:24, cursor:'pointer', fontWeight:200,
              transition:'color .2s',
            }}
            onMouseEnter={e=>e.currentTarget.style.color=L.gold}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
            ✕
          </button>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
