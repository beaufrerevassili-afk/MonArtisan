import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { useAuth } from '../../context/AuthContext';
import { useFadeUp, useScaleIn } from '../../utils/scrollAnimations';
import L from '../../design/luxe';

const DEV_EMAIL = 'freamplecom@gmail.com';

export default function SecteurSelect() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const isDev = user?.email === DEV_EMAIL;
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchMetier, setSearchMetier] = useState('');
  const [searchVille, setSearchVille] = useState('');
  useEffect(() => { setMounted(true); document.title = 'Freample — Trouvez un artisan de confiance'; }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const s1 = useScaleIn();
  const r1 = useFadeUp(), r2 = useFadeUp(0.1), r3 = useFadeUp(0.15);

  return (
    <div style={{ minHeight: '100vh', background: L.bg, fontFamily: L.font, color: L.text }}>
      <RecrutementBanner />

      {/* ══ NAVBAR — Style Uber ══ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(20px,4vw,48px)', height: 64, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${L.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 900, color: L.text, fontFamily: L.font, letterSpacing: '-0.04em' }}>
            Freample<span style={{ color: L.gold }}>.</span>
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => navigate('/pro')} style={{ padding: '8px 18px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = L.noir} onMouseLeave={e => e.currentTarget.style.color = L.textSec}>
              Professionnel
            </button>
            <button onClick={() => navigate('/immo')} style={{ padding: '8px 18px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = L.noir} onMouseLeave={e => e.currentTarget.style.color = L.textSec}>
              Freample Immo
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isDev && <button onClick={() => navigate('/immo/demo')} style={{ padding: '6px 12px', background: '#F0FDF4', border: 'none', fontSize: 11, fontWeight: 700, color: '#16A34A', cursor: 'pointer' }}>Demo</button>}
          {user ? <>
            <button onClick={() => {
              const dest = { client: '/client/dashboard', patron: '/patron/dashboard', employe: '/employe/dashboard', artisan: '/artisan/dashboard', fondateur: '/' };
              navigate(dest[user.role] || '/');
            }} style={{ padding: '8px 18px', background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: L.gold, cursor: 'pointer', fontFamily: L.font }}>
              Mon espace
            </button>
            {/* Avatar + menu */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)}
                style={{ width: 38, height: 38, borderRadius: '50%', background: L.gold, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: L.font }}>
                {(user.nom || 'U').charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: `1px solid ${L.border}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 220, zIndex: 300, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${L.border}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: L.text }}>{user.nom}</div>
                    <div style={{ fontSize: 12, color: L.textSec }}>{user.email}</div>
                  </div>
                  {[
                    { label: 'Mon espace', icon: '📊', action: () => { const dest = { client: '/client/dashboard', patron: '/patron/dashboard', employe: '/employe/dashboard', artisan: '/artisan/dashboard' }; navigate(dest[user.role] || '/'); } },
                    { label: 'Trouver un artisan', icon: '🔨', action: () => navigate('/btp') },
                    { label: 'Freample Immo', icon: '🏠', action: () => navigate('/immo') },
                  ].map(item => (
                    <button key={item.label} onClick={() => { setMenuOpen(false); item.action(); }}
                      style={{ width: '100%', padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: L.font, fontSize: 13, fontWeight: 500, color: L.text, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <span style={{ fontSize: 15 }}>{item.icon}</span> {item.label}
                    </button>
                  ))}
                  <div style={{ borderTop: `1px solid ${L.border}` }}>
                    <button onClick={async () => { setMenuOpen(false); const { logout } = auth; if (logout) await logout(); navigate('/'); }}
                      style={{ width: '100%', padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: L.font, fontSize: 13, fontWeight: 500, color: '#DC2626', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <span style={{ fontSize: 15 }}>🚪</span> Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </> : <>
            <button onClick={() => navigate('/login')} style={{ padding: '8px 20px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = L.noir} onMouseLeave={e => e.currentTarget.style.color = L.textSec}>
              Se connecter
            </button>
            <button onClick={() => navigate('/register')} style={{ padding: '8px 20px', background: L.noir, border: 'none', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: L.font, transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#333'} onMouseLeave={e => e.currentTarget.style.background = L.noir}>
              S'inscrire
            </button>
          </>}
        </div>
      </nav>

      {/* ══ HERO — Uber/Doctolib style, recherche directe ══ */}
      <section style={{
        background: '#2C2520', position: 'relative', overflow: 'hidden',
        padding: 'clamp(72px,14vh,140px) clamp(20px,4vw,48px) clamp(60px,10vh,100px)',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(44,37,32,0.4) 0%, rgba(44,37,32,0.95) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'opacity .6s, transform .6s' }}>
          <h1 ref={s1} style={{ fontFamily: L.serif, fontSize: 'clamp(36px,7vw,60px)', fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: 1.06, color: '#F5EFE0', textAlign: 'center' }}>
            Trouvez un artisan<br />de <span style={{ fontWeight: 700, color: L.gold }}>confiance</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(245,239,224,0.6)', lineHeight: 1.6, margin: '0 auto 36px', maxWidth: 460, textAlign: 'center' }}>
            Plombier, électricien, peintre, menuisier — trouvez le bon professionnel près de chez vous.
          </p>

          {/* Barre de recherche — 1 clic */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 6, display: 'flex', gap: 0, boxShadow: '0 8px 40px rgba(0,0,0,0.3)', maxWidth: 620, margin: '0 auto' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔨</span>
              <select value={searchMetier} onChange={e => setSearchMetier(e.target.value)}
                style={{ width: '100%', padding: '16px 16px 16px 42px', border: 'none', fontSize: 15, fontFamily: L.font, outline: 'none', background: 'transparent', color: L.text, cursor: 'pointer', appearance: 'none' }}>
                <option value="">Quel métier ?</option>
                {['Plomberie', 'Électricité', 'Menuiserie', 'Carrelage', 'Peinture', 'Maçonnerie', 'Chauffage', 'Serrurerie', 'Couverture', 'Isolation', 'Autre'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ width: 1, background: '#E8E6E1', margin: '10px 0' }} />
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>📍</span>
              <input value={searchVille} onChange={e => setSearchVille(e.target.value)} placeholder="Ville ou code postal"
                style={{ width: '100%', padding: '16px 16px 16px 42px', border: 'none', fontSize: 15, fontFamily: L.font, outline: 'none', background: 'transparent', color: L.text, boxSizing: 'border-box' }}
                onKeyDown={e => { if (e.key === 'Enter') navigate(`/btp?metier=${searchMetier}&ville=${searchVille}`); }} />
            </div>
            <button onClick={() => navigate(`/btp?metier=${searchMetier}&ville=${searchVille}`)}
              style={{ padding: '14px 28px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: L.font, flexShrink: 0, transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = '#2C2520'}>
              Rechercher
            </button>
          </div>

          {/* Métiers rapides */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
            {[{ m: 'Plomberie', e: '🔧' }, { m: 'Électricité', e: '⚡' }, { m: 'Peinture', e: '🎨' }, { m: 'Maçonnerie', e: '🧱' }, { m: 'Menuiserie', e: '🪚' }, { m: 'Carrelage', e: '🔲' }].map(({ m, e }) => (
              <button key={m} onClick={() => navigate(`/btp?metier=${m}`)}
                style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(245,239,224,0.7)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: L.font, transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6 }}
                onMouseEnter={e2 => { e2.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e2.currentTarget.style.color = '#F5EFE0'; }}
                onMouseLeave={e2 => { e2.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e2.currentTarget.style.color = 'rgba(245,239,224,0.7)'; }}>
                {e} {m}
              </button>
            ))}
          </div>

          {/* Chiffres */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px,5vw,56px)', marginTop: 40 }}>
            {[{ v: '100%', l: 'Gratuit' }, { v: '✓', l: 'Artisans vérifiés' }, { v: '⭐', l: 'Avis clients' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, fontFamily: L.serif, color: L.gold }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'rgba(245,239,224,0.45)', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Comment ça marche ══ */}
      <section ref={r2} style={{ background: L.white, borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}`, padding: 'clamp(48px,7vh,72px) clamp(20px,4vw,40px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, textAlign: 'center', margin: '0 0 48px', letterSpacing: '-0.03em' }}>
            Comment ça marche
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: '01', title: 'Décrivez votre besoin', desc: 'Quel métier, quelle ville, quel type de travaux. En 2 minutes, pas plus.' },
              { n: '02', title: 'Comparez les professionnels', desc: 'Des artisans vérifiés, avec avis clients, qualifications et assurances contrôlées.' },
              { n: '03', title: 'Choisissez le meilleur', desc: 'Comparez les profils, les réalisations, et lancez les travaux en toute confiance.' },
            ].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', gap: 'clamp(16px,3vw,32px)', alignItems: 'flex-start', padding: '28px 0', borderTop: i > 0 ? `1px solid ${L.border}` : 'none' }}>
                <span style={{ fontSize: 32, fontWeight: 200, color: L.textLight, fontFamily: L.serif, lineHeight: 1, flexShrink: 0, minWidth: 48 }}>{s.n}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: L.textSec, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Qui nous sommes ══ */}
      <section id="qui-nous-sommes" ref={r3} style={{ padding: 'clamp(56px,8vh,88px) clamp(20px,4vw,40px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontFamily: L.serif, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Qui nous sommes
          </h2>
          <p style={{ fontSize: 16, color: L.textSec, lineHeight: 1.75, margin: '0 0 28px' }}>
            Freample est une startup French Tech. On est partis d'un constat simple : trouver un bon artisan ou gérer un bien immobilier, c'est encore trop compliqué en France. Trop d'intermédiaires, trop de frictions, trop de prix opaques.
          </p>
          <p style={{ fontSize: 16, color: L.textSec, lineHeight: 1.75, margin: '0 0 28px' }}>
            On a construit Freample pour regrouper ces services dans un seul endroit, avec une interface claire et des tarifs honnêtes. Pas de jargon, pas de surprises.
          </p>
          <div style={{ borderLeft: `3px solid ${L.gold}`, paddingLeft: 20, marginTop: 32 }}>
            <p style={{ fontSize: 15, fontStyle: 'italic', color: L.text, lineHeight: 1.7, margin: 0 }}>
              On croit que la technologie doit simplifier la vie des gens, pas la complexifier. Chaque fonctionnalité qu'on développe doit faire gagner du temps — sinon on ne la livre pas.
            </p>
          </div>
        </div>
      </section>

      {/* ══ Nos objectifs ══ */}
      <section id="nos-objectifs" style={{ padding: 'clamp(56px,8vh,88px) clamp(20px,4vw,40px)', background: L.white, borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: L.gold, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 16px' }}>Nos objectifs</p>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.03em' }}>
            Simplifier votre quotidien.
          </h2>
          <p style={{ fontSize: 15, color: L.textSec, lineHeight: 1.7, margin: '0 0 40px', maxWidth: 560 }}>
            Simplifier chaque interaction entre les clients et les professionnels. Supprimer les frictions. Rendre chaque service accessible en quelques clics.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: L.border }}>
            {[
              { title: 'Simplicité', desc: 'Zéro jargon. Chaque parcours est pensé pour être compris en 30 secondes.' },
              { title: 'Rapidité', desc: 'Gestion instantanée, documents en quelques minutes.' },
              { title: 'Accessibilité', desc: 'Des services premium à des tarifs justes, pour les particuliers comme les entreprises.' },
              { title: 'Écosystème', desc: 'Artisans, immobilier, gestion — tout est connecté dans une seule plateforme.' },
            ].map(o => (
              <div key={o.title} style={{ background: L.white, padding: 'clamp(20px,3vw,32px)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>{o.title}</h3>
                <p style={{ fontSize: 13, color: L.textSec, lineHeight: 1.6, margin: 0 }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA Final — Artisan ══ */}
      <section style={{ background: '#2C2520', padding: 'clamp(56px,10vh,88px) 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px,4.5vw,42px)', fontWeight: 800, color: '#F5EFE0', letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 14px' }}>
            Prêt à lancer<br />votre projet ?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(245,239,224,0.5)', lineHeight: 1.6, margin: '0 0 36px' }}>
            Trouvez le bon artisan en quelques clics.
          </p>
          <button onClick={() => navigate('/btp')}
            style={{ padding: '16px 48px', background: L.gold, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'background .25s' }}
            onMouseEnter={e => e.currentTarget.style.background = L.goldDark} onMouseLeave={e => e.currentTarget.style.background = L.gold}>
            Rechercher un artisan
          </button>
        </div>
      </section>

      {/* ══ Footer ══ */}
      <footer style={{ padding: '28px 32px', textAlign: 'center', borderTop: `1px solid ${L.border}` }}>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
          {[{ label: 'Artisans', href: '/btp' }, { label: 'Espace pro', href: '/pro' }, { label: 'Freample Immo', href: '/immo' }, { label: 'Recrutement', href: '/recrutement' }, { label: 'CGU', href: '/cgu' }].map(l => (
            <a key={l.label} href={l.href} style={{ fontSize: 12, color: L.textSec, textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = L.gold} onMouseLeave={e => e.currentTarget.style.color = L.textSec}>{l.label}</a>
          ))}
        </nav>
        <p style={{ fontSize: 11, color: L.textLight, margin: 0 }}>© 2026 Freample · Tous droits réservés</p>
      </footer>
    </div>
  );
}
