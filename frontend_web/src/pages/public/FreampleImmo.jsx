import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { useFadeUp, useScaleIn, StaggerChildren } from '../../utils/scrollAnimations';
import L from '../../design/luxe';

export default function FreampleImmo() {
  const navigate = useNavigate();
  const r1=useFadeUp(),r2=useFadeUp(0.1),r3=useFadeUp(0.1),r4=useFadeUp(0.1),r5=useFadeUp(),r6=useFadeUp();
  const s1=useScaleIn(),s2=useScaleIn(0.15),s3=useScaleIn(0.15);

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <RecrutementBanner />
      <PublicNavbar />

      {/* ══ SOUS-NAV APPLE STYLE ══ */}
      <div style={{ position:'sticky', top:58, zIndex:190, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:`1px solid ${L.border}`, display:'flex', justifyContent:'center', gap:0, padding:'0 24px' }}>
        {[
          { label:'Freample Immo', href:'/immo', active:true },
          { label:'Freample Logement', href:'/immo/logement' },
          { label:'ERP & Diagnostics', href:'/immo/erp' },
        ].map(item => (
          <button key={item.label} onClick={()=>navigate(item.href)}
            style={{ padding:'12px 24px', background:'none', border:'none', borderBottom:`2px solid ${item.active?L.noir:'transparent'}`, fontSize:13, fontWeight:item.active?700:400, color:item.active?L.text:L.textSec, cursor:'pointer', fontFamily:L.font, transition:'all .15s' }}
            onMouseEnter={e=>{if(!item.active)e.currentTarget.style.color=L.text;}}
            onMouseLeave={e=>{if(!item.active)e.currentTarget.style.color=L.textSec;}}>
            {item.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO
         ══════════════════════════════════════════════════════ */}
      <section style={{ background:L.noir, padding:'clamp(88px,15vh,150px) 32px clamp(72px,12vh,110px)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1800&q=85)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.18 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.92) 100%)' }} />
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
        <div style={{ maxWidth:720, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', padding:'6px 18px', background:'rgba(201,169,110,0.12)', border:`1px solid ${L.gold}40`, fontSize:11, fontWeight:600, color:L.gold, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:24 }}>En cours de développement</div>
          <h1 style={{ fontFamily:L.serif, fontSize:'clamp(38px,7vw,72px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.02, letterSpacing:'-0.02em', margin:'0 0 16px' }}>
            Freample <span style={{ fontWeight:700, fontStyle:'normal' }}>Immo</span>
          </h1>
          <p style={{ fontSize:'clamp(15px,1.8vw,18px)', color:'rgba(255,255,255,0.45)', lineHeight:1.65, margin:'0 auto 0', maxWidth:480, fontWeight:300 }}>
            Gestion de patrimoine immobilier, SCI et diagnostics réglementaires.
          </p>
        </div>
        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION APPLE 1 — Gestion SCI (fond blanc)
         ══════════════════════════════════════════════════════ */}
      <section style={{ background:L.white, padding:'clamp(80px,12vh,120px) 32px', textAlign:'center' }}>
        <div ref={s1} style={{ maxWidth:700, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.3em', marginBottom:16 }}>Gestion privée</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(32px,5.5vw,56px)', fontWeight:700, color:L.text, letterSpacing:'-0.03em', margin:'0 0 12px', lineHeight:1.05 }}>
            Multi-SCI
          </h2>
          <p style={{ fontSize:17, color:L.textSec, lineHeight:1.6, margin:'0 auto 20px', maxWidth:480 }}>
            Toutes vos SCI sur un seul compte. IR ou IS. Vision consolidée de votre patrimoine.
          </p>
          <button onClick={()=>document.getElementById('sci-details')?.scrollIntoView({behavior:'smooth'})} style={{ fontSize:14, color:L.gold, background:'none', border:'none', cursor:'pointer', fontFamily:L.font, fontWeight:600 }}>
            Voir les fonctionnalités →
          </button>
        </div>
      </section>

      {/* Parallax image */}
      <div style={{ height:'clamp(200px,30vh,360px)', backgroundImage:'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center', backgroundAttachment:'fixed' }} />

      <section style={{ background:L.cream, padding:'clamp(80px,12vh,120px) 32px', textAlign:'center' }}>
        <div ref={s2} style={{ maxWidth:700, margin:'0 auto' }}>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(32px,5.5vw,56px)', fontWeight:700, color:L.text, letterSpacing:'-0.03em', margin:'0 0 12px', lineHeight:1.05 }}>
            Loyers & Locataires
          </h2>
          <p style={{ fontSize:17, color:L.textSec, lineHeight:1.6, margin:'0 auto 0', maxWidth:480 }}>
            Quittances automatiques. Relances impayés. État des lieux numériques. Suivi des encaissements.
          </p>
        </div>
      </section>

      <section style={{ background:L.white, padding:'clamp(80px,12vh,120px) 32px', textAlign:'center' }}>
        <div ref={s3} style={{ maxWidth:700, margin:'0 auto' }}>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(32px,5.5vw,56px)', fontWeight:700, color:L.text, letterSpacing:'-0.03em', margin:'0 0 12px', lineHeight:1.05 }}>
            Comptabilité SCI
          </h2>
          <p style={{ fontSize:17, color:L.textSec, lineHeight:1.6, margin:'0 auto 0', maxWidth:480 }}>
            Plan comptable, bilan, compte de résultat. Déclarations 2072, 2065, 2044. Export comptable.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DÉTAIL FONCTIONNALITÉS SCI (grille)
         ══════════════════════════════════════════════════════ */}
      <section ref={r5} id="sci-details" style={{ background:L.bg, padding:'clamp(64px,9vh,100px) 32px', borderTop:`1px solid ${L.border}` }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:12 }}>Toutes les fonctionnalités</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,38px)', fontWeight:300, fontStyle:'italic', margin:0 }}>
              Un outil <span style={{ fontWeight:700, fontStyle:'normal' }}>complet</span>
            </h2>
          </div>
          <StaggerChildren style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:1, background:L.border }}>
            {[
              { icon:'🏢', title:'Multi-SCI', desc:'Basculez d\'une SCI à l\'autre en un clic. Vision consolidée ou par structure.' },
              { icon:'🏠', title:'Parc immobilier', desc:'Fiches détaillées par bien : photos, surface, charges, historique travaux.' },
              { icon:'👥', title:'Gestion locataires', desc:'Dossiers, baux, cautions, EDL d\'entrée et sortie numériques.' },
              { icon:'💰', title:'Loyers & Quittances', desc:'Suivi des loyers, quittances auto, relances impayés, historique paiements.' },
              { icon:'📊', title:'Comptabilité SCI', desc:'Plan comptable, journal des écritures, bilan, compte de résultat, export.' },
              { icon:'📄', title:'Déclarations fiscales', desc:'Aide 2072 (IR), 2065 (IS), revenus fonciers 2044.' },
              { icon:'🔧', title:'Travaux & Charges', desc:'Suivi par bien, ventilation des charges, appels de fonds copropriété.' },
              { icon:'📋', title:'GED Documents', desc:'Baux, avenants, diagnostics, PV d\'AG, statuts, courriers type.' },
              { icon:'📈', title:'Rentabilité', desc:'Rendement brut/net, cashflow, plus-value latente, valorisation patrimoine.' },
              { icon:'🏗️', title:'Simulation investissement', desc:'Calcul de rentabilité, simulation prêt, effort d\'épargne, défiscalisation.' },
              { icon:'⚖️', title:'AG & Décisions', desc:'Convocations, PV, vote des résolutions, registre des décisions.' },
              { icon:'🔔', title:'Alertes & Rappels', desc:'Fin de bail, révision loyer, assurance, contrôle technique, diagnostics.' },
              { icon:'🤝', title:'Espace associés', desc:'Chaque associé accède à ses SCI, parts, revenus, documents.' },
              { icon:'📱', title:'Application mobile', desc:'Gestion en mobilité, photos, signature électronique, notifications.' },
              { icon:'🗺️', title:'ERP & Zonage', desc:'État des risques, PPR, arrêtés, pollution des sols. Intégré.' },
            ].map(f => (
              <div key={f.title} style={{ background:L.white, padding:'28px 24px', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=L.cream} onMouseLeave={e=>e.currentTarget.style.background=L.white}>
                <div style={{ fontSize:26, marginBottom:12 }}>{f.icon}</div>
                <h3 style={{ fontSize:14, fontWeight:700, color:L.text, marginBottom:6 }}>{f.title}</h3>
                <p style={{ fontSize:12.5, color:L.textSec, lineHeight:1.6, margin:0 }}>{f.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          POUR QUI
         ══════════════════════════════════════════════════════ */}
      <section ref={r6} style={{ background:L.white, padding:'clamp(64px,9vh,100px) 32px', borderTop:`1px solid ${L.border}` }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,38px)', fontWeight:300, fontStyle:'italic', margin:'0 0 40px' }}>
            Pour les <span style={{ fontWeight:700, fontStyle:'normal' }}>investisseurs</span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:28 }}>
            {[
              { icon:'🏛️', title:'Gérants de SCI' },
              { icon:'🏠', title:'Propriétaires bailleurs' },
              { icon:'💼', title:'Investisseurs' },
              { icon:'📋', title:'Gestionnaires de parc' },
            ].map(s => (
              <div key={s.title}>
                <div style={{ fontSize:32, marginBottom:10 }}>{s.icon}</div>
                <div style={{ fontSize:14, fontWeight:700, color:L.text }}>{s.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding:'28px 32px', textAlign:'center', borderTop:`1px solid ${L.border}` }}>
        <nav style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:14, flexWrap:'wrap' }}>
          {[{label:'Accueil',href:'/'},{label:'ERP & Diagnostics',href:'/immo/erp'},{label:'Freample Artisans',href:'/btp'},{label:'Freample Com',href:'/com'}].map(l=>(
            <a key={l.label} href={l.href} style={{ fontSize:12, color:L.textSec, textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textSec}>{l.label}</a>
          ))}
        </nav>
        <p style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase', margin:0 }}>© 2026 Freample Immo</p>
      </footer>
    </div>
  );
}
