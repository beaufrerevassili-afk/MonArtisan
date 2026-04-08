import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { useAuth } from '../../context/AuthContext';
import { useFadeUp, useScaleIn } from '../../utils/scrollAnimations';
import L from '../../design/luxe';

const DEV_EMAIL = 'freamplecom@gmail.com';

const SECTORS_PUBLIC = [
  { id:'btp', label:'Freample Artisans', href:'/btp' },
  { id:'com', label:'Freample Com', href:'/com' },
  { id:'immo', label:'Freample Immo', href:'/immo' },
  { id:'logement', label:'Freample Logement', href:'/immo/logement' },
  { id:'droit', label:'Freample Droit', href:'/droit' },
  { id:'coiffure', label:'Freample Beauté', href:'/coiffure' },
  { id:'recrutement', label:'Recrutement', href:'/recrutement' },
  { id:'pro', label:'Espace pro', href:'/pro' },
];
const SECTORS_DEV = [
  ...SECTORS_PUBLIC,
  { id:'immoDemo', label:'Immo Démo', href:'/immo/demo' },
  { id:'stats', label:'Statistiques', href:'/admin/stats' },
];


/* ══════════════════════════════════════════════════════════════
   Écosystème interactif — schéma visuel avec toggle Client / Entreprise
   ══════════════════════════════════════════════════════════════ */
const ECO_DATA = {
  client: {
    titre: 'Je suis un particulier',
    center: { icon: '🏠', label: 'Votre projet' },
    nodes: [
      { id: 'artisan',     icon: '🔨', label: 'Trouver un pro',          desc: 'Décrivez votre besoin, recevez des devis gratuits de professionnels vérifiés près de chez vous.', color: '#8B5CF6', href: '/btp' },
      { id: 'devis',       icon: '📋', label: 'Devis en 24h',             desc: 'Comparez les offres et choisissez le meilleur rapport qualité/prix, sans engagement.', color: '#2563EB' },
      { id: 'suivi',       icon: '📍', label: 'Suivi en temps réel',      desc: 'Suivez l\'avancement de votre projet : photos, étapes validées, planning partagé.', color: '#16A34A' },
      { id: 'com',         icon: '🎬', label: 'Communication',            desc: 'Montage vidéo, création de contenu, stratégie digitale — confiez votre image à des experts.', color: '#D97706', href: '/com' },
      { id: 'recrutement', icon: '👥', label: 'Offres d\'emploi',         desc: 'Consultez les offres d\'emploi publiées par les entreprises sur Freample.', color: '#059669', href: '/recrutement' },
      { id: 'avis',        icon: '⭐', label: 'Avis vérifiés',            desc: 'Des retours authentiques de vrais clients pour choisir en toute confiance.', color: '#DC2626' },
    ],
    avantages: [
      { icon: '💸', titre: '0 € de commission', desc: 'Aucun frais caché. Le prix affiché est le prix payé.' },
      { icon: '⚡', titre: 'Réponse en 24h', desc: 'Recevez des devis de professionnels proches de chez vous.' },
      { icon: '🛡️', titre: 'Professionnels vérifiés', desc: 'Assurances, qualifications et avis contrôlés.' },
    ],
  },
  entreprise: {
    titre: 'Je suis un professionnel',
    center: { icon: '💼', label: 'Votre activité' },
    nodes: [
      { id: 'erp',        icon: '📊', label: 'Gestion d\'entreprise', desc: 'Un ERP complet adapté à votre métier : commercial, facturation, suivi clients, pipeline de ventes.', color: '#8B5CF6', href: '/pro' },
      { id: 'rh',         icon: '👥', label: 'RH & Paie',            desc: 'Gérez vos équipes, congés, contrats et bulletins de paie. Automatisez l\'administratif.', color: '#2563EB', href: '/pro' },
      { id: 'conformite', icon: '🛡️', label: 'Conformité & Qualité', desc: 'Audits, certifications, documents réglementaires — restez conforme aux normes de votre secteur.', color: '#16A34A', href: '/pro' },
      { id: 'recruter',   icon: '📢', label: 'Recruter',             desc: 'Publiez vos offres, recevez des candidatures qualifiées et gérez tout le processus d\'embauche.', color: '#D97706', href: '/recrutement' },
      { id: 'com',        icon: '🎬', label: 'Communication',        desc: 'Vidéo, branding, présence en ligne — développez votre visibilité avec nos services créatifs.', color: '#059669', href: '/com' },
      { id: 'finance',    icon: '💰', label: 'Finance & Compta',     desc: 'Trésorerie, export comptable, déclarations sociales, bibliothèque de prix — tout centralisé.', color: '#DC2626', href: '/pro' },
    ],
    avantages: [
      { icon: '🎯', titre: 'Tout-en-un', desc: 'Un seul outil remplace vos logiciels de gestion, paie, conformité et CRM.' },
      { icon: '⏱️', titre: 'Gain de temps massif', desc: 'Automatisation des tâches répétitives : paie, documents, calculs, relances.' },
      { icon: '🔗', titre: 'Données connectées', desc: 'Un client, un devis, une facture, un salarié — tout est lié, zéro ressaisie.' },
    ],
  },
};

function EcosystemeSection({ sectionRef }) {
  const [mode, setMode] = useState('client');
  const [activeNode, setActiveNode] = useState(null);
  const data = ECO_DATA[mode];
  const nodes = data.nodes;

  // Positions circulaires autour du centre
  const cx = 50, cy = 50, r = 36;
  const positions = nodes.map((_, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <section id="ecosysteme" ref={sectionRef} style={{ padding: 'clamp(56px,8vh,88px) clamp(20px,4vw,40px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: L.gold, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 16px', textAlign: 'center' }}>L'écosystème Freample</p>
        <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.03em', textAlign: 'center' }}>
          Tout ce dont vous avez besoin, en un seul endroit.
        </h2>
        <p style={{ fontSize: 15, color: L.textSec, lineHeight: 1.7, margin: '0 auto 32px', maxWidth: 520, textAlign: 'center' }}>
          Cliquez sur un module pour découvrir comment Freample simplifie votre quotidien.
        </p>

        {/* Toggle Client / Entreprise */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', background: '#F2F2F7', borderRadius: 12, padding: 4 }}>
            {[['client', '🏠 Je suis particulier'], ['entreprise', '💼 Je suis professionnel']].map(([id, label]) => (
              <button key={id} onClick={() => { setMode(id); setActiveNode(null); }}
                style={{ padding: '10px 24px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all .2s',
                  background: mode === id ? L.noir : 'transparent', color: mode === id ? '#fff' : '#636363' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Schéma circulaire interactif */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 520, margin: '0 auto 40px', aspectRatio: '1' }}>
          {/* SVG lignes de connexion */}
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {positions.map((pos, i) => (
              <line key={i} x1={cx} y1={cy} x2={pos.x} y2={pos.y}
                stroke={activeNode === i ? nodes[i].color : '#E5E5EA'} strokeWidth={activeNode === i ? 0.6 : 0.3}
                strokeDasharray={activeNode === i ? 'none' : '1.5 1'} style={{ transition: 'all .3s' }} />
            ))}
            {/* Cercle pointillé */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E5EA" strokeWidth={0.2} strokeDasharray="2 1.5" />
          </svg>

          {/* Centre */}
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 90, height: 90, borderRadius: '50%', background: L.noir, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <span style={{ fontSize: 28 }}>{data.center.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, marginTop: 2, textAlign: 'center', lineHeight: 1.2, padding: '0 4px' }}>{data.center.label}</span>
          </div>

          {/* Nodes */}
          {nodes.map((node, i) => {
            const pos = positions[i];
            const isActive = activeNode === i;
            return (
              <div key={node.id}
                onClick={() => setActiveNode(isActive ? null : i)}
                onMouseEnter={() => setActiveNode(i)}
                style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)', cursor: 'pointer', zIndex: isActive ? 3 : 1, transition: 'transform .25s' }}>
                <div style={{ width: isActive ? 72 : 60, height: isActive ? 72 : 60, borderRadius: '50%', background: '#fff', border: `2px solid ${isActive ? node.color : '#E5E5EA'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: isActive ? `0 8px 24px ${node.color}30` : '0 2px 8px rgba(0,0,0,0.06)', transition: 'all .25s' }}>
                  <span style={{ fontSize: isActive ? 22 : 18, transition: 'font-size .2s' }}>{node.icon}</span>
                  <span style={{ fontSize: 7, fontWeight: 700, color: isActive ? node.color : '#636363', marginTop: 1, textAlign: 'center', lineHeight: 1.1, padding: '0 4px', transition: 'color .2s' }}>{node.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Détail du node sélectionné */}
        <div style={{ minHeight: 90, marginBottom: 40 }}>
          {activeNode !== null ? (() => {
            const node = nodes[activeNode];
            return (
              <div style={{ background: '#fff', border: `2px solid ${node.color}`, borderRadius: 16, padding: '20px 24px', maxWidth: 520, margin: '0 auto', boxShadow: `0 8px 32px ${node.color}12`, transition: 'all .3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{node.icon}</span>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: node.color }}>{node.label}</h3>
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: L.textSec, lineHeight: 1.7 }}>{node.desc}</p>
                {node.href && (
                  <a href={node.href} style={{ display: 'inline-block', padding: '8px 20px', background: node.color, color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'opacity .2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    Découvrir →
                  </a>
                )}
              </div>
            );
          })() : (
            <p style={{ textAlign: 'center', fontSize: 14, color: '#8E8E93', fontStyle: 'italic' }}>
              Survolez un module pour en savoir plus
            </p>
          )}
        </div>

        {/* Avantages — 3 colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {data.avantages.map(a => (
            <div key={a.titre} style={{ background: L.noir, borderRadius: 14, padding: 'clamp(18px,3vw,24px)', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
              <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px' }}>{a.titre}</h4>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
            </div>
          ))}
        </div>

        {/* Chiffres */}
        <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${L.border}` }}>
          {[
            { val: '0 €', label: 'Pour les particuliers' },
            { val: 'Tout-en-un', label: 'Gestion, RH, conformité, com' },
            { val: '100 %', label: 'Adapté à votre métier' },
          ].map((m, i) => (
            <div key={m.label} style={{ flex: 1, padding: '20px 0', textAlign: 'center', borderRight: i < 2 ? `1px solid ${L.border}` : 'none' }}>
              <div style={{ fontSize: 24, fontWeight: 500, fontFamily: L.serif, letterSpacing: '-0.02em' }}>{m.val}</div>
              <div style={{ fontSize: 11, color: L.textSec, marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SecteurSelect() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const isDev = user?.email === DEV_EMAIL;
  const menuItems = isDev ? SECTORS_DEV : SECTORS_PUBLIC;
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMounted(true); document.title = 'Freample — Artisans certifiés & montage vidéo professionnel en France'; }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const start = window.scrollY;
    const end = el.getBoundingClientRect().top + start - 120;
    const duration = 1200;
    let t0 = null;
    const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    const step = ts => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      window.scrollTo(0, start + (end - start) * ease(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const s1 = useScaleIn();
  const r1 = useFadeUp(), r2 = useFadeUp(0.1), r3 = useFadeUp();
  const a1 = useFadeUp(), a2 = useFadeUp(0.1), a3 = useFadeUp(0.15);

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <RecrutementBanner />
      <PublicNavbar onMenuOpen={()=>setMenuOpen(true)} navLinks={[
        { id:'qui-nous-sommes', label:'Qui nous sommes', onClick:()=>scrollTo('qui-nous-sommes') },
        { id:'nos-objectifs', label:'Nos objectifs', onClick:()=>scrollTo('nos-objectifs') },
        { id:'ecosysteme', label:'L\'écosystème', onClick:()=>scrollTo('ecosysteme') },
      ]} />

      {/* Sidebar */}
      <div onClick={()=>setMenuOpen(false)} style={{ position:'fixed', inset:0, zIndex:1999, background:'rgba(0,0,0,0.35)', opacity:menuOpen?1:0, pointerEvents:menuOpen?'auto':'none', transition:'opacity .35s' }} />
      <div style={{
        position:'fixed', top:0, left:0, bottom:0, zIndex:2000,
        width:'clamp(300px,85vw,400px)', background:L.white,
        transform:menuOpen?'translateX(0)':'translateX(-100%)',
        transition:'transform .4s cubic-bezier(0.25,0.46,0.45,0.94)',
        display:'flex', flexDirection:'column', boxShadow:menuOpen?'8px 0 32px rgba(0,0,0,0.1)':'none',
      }}>
        <div style={{ padding:'20px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${L.border}` }}>
          <span style={{ fontSize:16, fontWeight:800, letterSpacing:'-0.04em' }}>Freample<span style={{ color:L.gold }}>.</span></span>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {isDev && <span style={{ fontSize:10, fontWeight:700, color:'#22C55E', background:'rgba(34,197,94,0.08)', padding:'3px 10px', borderRadius:4 }}>Dev</span>}
            <button onClick={()=>setMenuOpen(false)} style={{ background:'none', border:`1px solid ${L.border}`, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14, color:L.textLight, transition:'border-color .15s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=L.noir} onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>✕</button>
          </div>
        </div>

        <nav style={{ flex:1, overflowY:'auto', padding:'12px 0' }}>
          {menuItems.map((item) => (
            <button key={item.id} onClick={()=>{setMenuOpen(false);navigate(item.href);}}
              style={{ width:'100%', background:'none', border:'none', cursor:'pointer', fontFamily:L.font, textAlign:'left', padding:'14px 28px', fontSize:15, fontWeight:600, letterSpacing:'-0.01em', transition:'background .15s, color .15s', color:L.text }}
              onMouseEnter={e=>{e.currentTarget.style.background=L.cream;e.currentTarget.style.color=L.gold;}}
              onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color=L.text;}}>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding:'16px 28px', borderTop:`1px solid ${L.border}`, display:'flex', gap:20 }}>
          <a href="https://wa.me/33769387193" target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:L.textLight, textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textLight}>WhatsApp</a>
          <a href="mailto:freamplecom@gmail.com" style={{ fontSize:11, color:L.textLight, textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textLight}>Contact</a>
          <a href="/cgu" style={{ fontSize:11, color:L.textLight, textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textLight}>CGU</a>
        </div>
      </div>

      {/* Hero */}
      <section style={{
        padding:'clamp(52px,9vh,88px) clamp(20px,4vw,40px) clamp(40px,6vh,64px)',
        textAlign:'center', maxWidth:700, margin:'0 auto',
        opacity:mounted?1:0, transform:mounted?'none':'translateY(12px)',
        transition:'opacity .6s, transform .6s',
      }}>
        <h1 ref={s1} style={{ fontFamily:L.serif, fontSize:'clamp(30px,5.5vw,50px)', fontWeight:500, letterSpacing:'-0.02em', margin:'0 0 12px', lineHeight:1.08 }}>
          Trouvez un artisan de <span style={{ fontWeight:700 }}>confiance</span>
        </h1>
        <p style={{ fontSize:16, color:L.textSec, lineHeight:1.6, margin:'0 0 32px', maxWidth:480, marginLeft:'auto', marginRight:'auto' }}>
          Plombier, électricien, peintre, menuisier — décrivez votre besoin et recevez des devis gratuits sous 24h.
        </p>
        <button onClick={()=>navigate('/btp')} style={{ padding:'16px 44px', background:L.noir, color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .25s' }}
          onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
          Trouver un artisan
        </button>
      </section>

      {/* Services */}
      <section ref={r1} style={{ maxWidth:960, margin:'0 auto', padding:'0 clamp(20px,4vw,40px) clamp(48px,7vh,72px)' }}>

        {/* Artisans — large card */}
        <div onClick={()=>navigate('/btp')} style={{ background:L.white, border:`1px solid ${L.border}`, cursor:'pointer', marginBottom:16, display:'flex', flexWrap:'wrap', overflow:'hidden', transition:'all .25s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.06)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.boxShadow='none';}}>
          <div style={{ flex:'1 1 360px', minHeight:280, background:'url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80) center/cover', position:'relative' }}>
            <div style={{ position:'absolute', top:16, left:16, background:L.gold, color:'#fff', fontSize:10, fontWeight:700, padding:'5px 14px', letterSpacing:'0.1em', textTransform:'uppercase' }}>Service principal</div>
          </div>
          <div style={{ flex:'1 1 360px', padding:'clamp(28px,4vh,44px) clamp(24px,3vw,40px)', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <h2 style={{ fontSize:'clamp(22px,3vw,30px)', fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 10px' }}>Freample Artisans</h2>
            <p style={{ fontSize:14, color:L.textSec, lineHeight:1.6, margin:'0 0 20px' }}>
              Trouvez un artisan certifié près de chez vous, comparez les professionnels et demandez un devis gratuit en quelques clics.
            </p>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:12, color:L.textSec, marginBottom:20 }}>
              <span>Artisans vérifiés</span><span>·</span><span>Devis sous 24h</span><span>·</span><span>Paiement sécurisé</span>
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:L.gold }}>Trouver un artisan →</div>
          </div>
        </div>

        {/* Com — compact */}
        <div onClick={()=>navigate('/com')} style={{ background:L.white, border:`1px solid ${L.border}`, cursor:'pointer', display:'flex', alignItems:'center', padding:'clamp(20px,3vh,28px) clamp(20px,3vw,28px)', gap:20, transition:'all .25s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.04)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.boxShadow='none';}}>
          <div style={{ width:48, height:48, background:L.noir, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0, letterSpacing:'-0.03em' }}>FC</div>
          <div style={{ flex:1 }}>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 4px' }}>Freample Com</h3>
            <p style={{ fontSize:13, color:L.textSec, margin:0, lineHeight:1.5 }}>Montage vidéo pro pour TikTok, YouTube, Reels — livré en 72h, à partir de 63,45€.</p>
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:L.gold, flexShrink:0 }}>Voir →</span>
        </div>
      </section>

      {/* Comment ça marche */}
      <section ref={r2} style={{ background:L.white, borderTop:`1px solid ${L.border}`, borderBottom:`1px solid ${L.border}`, padding:'clamp(48px,7vh,72px) clamp(20px,4vw,40px)' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(22px,3vw,32px)', fontWeight:800, textAlign:'center', margin:'0 0 48px', letterSpacing:'-0.03em' }}>
            Comment ça marche
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {[
              { n:'01', title:'Décrivez votre besoin', desc:'Quel métier, quelle ville, quel type de travaux. En 2 minutes, pas plus.' },
              { n:'02', title:'Recevez des devis', desc:'Des artisans vérifiés vous répondent sous 24h avec un devis détaillé et gratuit.' },
              { n:'03', title:'Choisissez le meilleur', desc:'Comparez les prix, les avis, et lancez les travaux en toute confiance.' },
            ].map((s, i) => (
              <div key={s.n} style={{ display:'flex', gap:'clamp(16px,3vw,32px)', alignItems:'flex-start', padding:'28px 0', borderTop: i > 0 ? `1px solid ${L.border}` : 'none' }}>
                <span style={{ fontSize:32, fontWeight:200, color:L.textLight, fontFamily:L.serif, lineHeight:1, flexShrink:0, minWidth:48 }}>{s.n}</span>
                <div>
                  <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 6px' }}>{s.title}</h3>
                  <p style={{ fontSize:14, color:L.textSec, lineHeight:1.6, margin:0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qui nous sommes */}
      <section id="qui-nous-sommes" ref={a1} style={{ padding:'clamp(56px,8vh,88px) clamp(20px,4vw,40px)' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,40px)', fontWeight:700, margin:'0 0 20px', letterSpacing:'-0.02em', lineHeight:1.15 }}>
            Qui nous sommes
          </h2>
          <p style={{ fontSize:16, color:L.textSec, lineHeight:1.75, margin:'0 0 28px' }}>
            Freample est une startup French Tech. On est partis d'un constat simple : trouver un bon artisan, monter une vidéo pro, gérer un bien immobilier ou rédiger un document juridique, c'est encore trop compliqué en France. Trop d'intermédiaires, trop de frictions, trop de prix opaques.
          </p>
          <p style={{ fontSize:16, color:L.textSec, lineHeight:1.75, margin:'0 0 28px' }}>
            On a construit Freample pour regrouper ces services dans un seul endroit, avec une interface claire et des tarifs honnêtes. Pas de jargon, pas de surprises.
          </p>
          <div style={{ borderLeft:`3px solid ${L.gold}`, paddingLeft:20, marginTop:32 }}>
            <p style={{ fontSize:15, fontStyle:'italic', color:L.text, lineHeight:1.7, margin:0 }}>
              On croit que la technologie doit simplifier la vie des gens, pas la complexifier. Chaque fonctionnalité qu'on développe doit faire gagner du temps — sinon on ne la livre pas.
            </p>
          </div>
        </div>
      </section>

      {/* Nos objectifs */}
      <section id="nos-objectifs" ref={a2} style={{ padding:'clamp(56px,8vh,88px) clamp(20px,4vw,40px)', background:L.white, borderTop:`1px solid ${L.border}`, borderBottom:`1px solid ${L.border}` }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <p style={{ fontSize:12, fontWeight:600, color:L.gold, letterSpacing:'0.15em', textTransform:'uppercase', margin:'0 0 16px' }}>Nos objectifs</p>
          <h2 style={{ fontSize:'clamp(24px,3.5vw,36px)', fontWeight:800, margin:'0 0 16px', letterSpacing:'-0.03em' }}>
            Rendre la gestion d'entreprise simple.
          </h2>
          <p style={{ fontSize:15, color:L.textSec, lineHeight:1.7, margin:'0 0 40px', maxWidth:560 }}>
            Simplifier chaque interaction entre les clients et les professionnels. Supprimer les frictions. Rendre chaque service accessible en quelques clics.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1px', background:L.border }}>
            {[
              { title:'Simplicité', desc:'Zéro jargon. Chaque parcours est pensé pour être compris en 30 secondes.' },
              { title:'Rapidité', desc:'Devis en 24h, montage en 72h, documents juridiques en quelques minutes.' },
              { title:'Accessibilité', desc:'Des services premium à des tarifs justes, pour les particuliers comme les entreprises.' },
              { title:'Écosystème', desc:'Artisans, communication, immobilier, droit — tout est connecté dans une seule plateforme.' },
            ].map((o, i) => (
              <div key={o.title} style={{ background:L.white, padding:'clamp(20px,3vw,32px)' }}>
                <h3 style={{ fontSize:15, fontWeight:700, margin:'0 0 8px' }}>{o.title}</h3>
                <p style={{ fontSize:13, color:L.textSec, lineHeight:1.6, margin:0 }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* L'écosystème Freample — Schéma interactif */}
      <EcosystemeSection sectionRef={a3} />

      {/* Footer */}
      <footer ref={r3} style={{ padding:'28px 32px', textAlign:'center', borderTop:`1px solid ${L.border}` }}>
        <nav style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:14, flexWrap:'wrap' }}>
          {[{label:'Artisans',href:'/btp'},{label:'Montage vidéo',href:'/com'},{label:'Recrutement',href:'/recrutement'},{label:'Espace pro',href:'/pro'},{label:'CGU',href:'/cgu'}].map(l=>(
            <a key={l.label} href={l.href} style={{ fontSize:12, color:L.textSec, textDecoration:'none', transition:'color .15s' }}
              onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textSec}>{l.label}</a>
          ))}
        </nav>
        <p style={{ fontSize:11, color:L.textLight, margin:0 }}>© 2026 Freample · Tous droits réservés</p>
      </footer>
    </div>
  );
}
