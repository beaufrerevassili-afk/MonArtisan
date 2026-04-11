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
  const [showProjet, setShowProjet] = useState(false);
  const [projetStep, setProjetStep] = useState(1);
  const [projet, setProjet] = useState({ metier: '', ville: '', description: '', budget: '', urgence: 'normal', pieces: '' });
  const [projetSent, setProjetSent] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Au chargement : si un projet en attente existe et l'utilisateur est connecté → publier auto
  useEffect(() => {
    setMounted(true);
    document.title = 'Freample — Trouvez un artisan de confiance';
    try {
      const pending = localStorage.getItem('freample_projet_pending');
      if (pending && user) {
        const p = JSON.parse(pending);
        localStorage.removeItem('freample_projet_pending');
        // Publier automatiquement
        const budget = Number(p.budget) || 0;
        const commission = Math.max(1, Math.round(budget * 0.01 * 100) / 100);
        const fraisPaiement = Math.round((budget * 0.015 + 0.25) * 100) / 100;
        const total = Math.round((budget + commission + fraisPaiement) * 100) / 100;
        const projets = JSON.parse(localStorage.getItem('freample_projets') || '[]');
        projets.push({ id: Date.now(), ...p, budget, commission, fraisPaiement, total, statut: 'publie', date: new Date().toISOString(), clientNom: user?.nom || 'Client' });
        localStorage.setItem('freample_projets', JSON.stringify(projets));
        setProjet(p);
        setShowProjet(true);
        setProjetSent(true);
      }
    } catch {}
  }, [user]);

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
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isDev && <button onClick={() => navigate('/immo/demo')} style={{ padding: '6px 12px', background: '#F0FDF4', border: 'none', fontSize: 11, fontWeight: 700, color: '#16A34A', cursor: 'pointer' }}>Demo</button>}
          {user ? <>
            <button onClick={() => {
              if (user.secteur === 'immo' || user.entrepriseType === 'sci') { navigate('/immo/gestion'); return; }
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
                    { label: 'Mon espace', icon: '📊', action: () => { if (user.secteur === 'immo' || user.entrepriseType === 'sci') { navigate('/immo/gestion'); return; } const dest = { client: '/client/dashboard', patron: '/patron/dashboard', employe: '/employe/dashboard', artisan: '/artisan/dashboard' }; navigate(dest[user.role] || '/'); } },
                    { label: 'Trouver un artisan', icon: '🔨', action: () => navigate('/btp') },
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

      {/* ══ HERO ══ */}
      <section style={{ background: '#2C2520', position: 'relative', overflow: 'hidden', padding: 'clamp(64px,12vh,120px) clamp(20px,4vw,48px) clamp(52px,9vh,88px)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(44,37,32,0.4) 0%, rgba(44,37,32,0.95) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'opacity .6s, transform .6s' }}>

          {!showProjet ? <>
            {/* ── Vue principale : 2 options ── */}
            <h1 ref={s1} style={{ fontFamily: L.serif, fontSize: 'clamp(32px,6vw,52px)', fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 14px', lineHeight: 1.06, color: '#F5EFE0', textAlign: 'center' }}>
              Vos travaux,<br /><span style={{ fontWeight: 700, color: L.gold }}>simplifiés</span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(245,239,224,0.55)', lineHeight: 1.6, margin: '0 auto 36px', maxWidth: 440, textAlign: 'center' }}>
              Publiez votre projet et recevez des offres, ou trouvez directement un artisan pour un dépannage.
            </p>

            {/* 2 cartes : Proposer projet + Trouver artisan */}
            <div style={{ display: 'flex', gap: 16, maxWidth: 620, margin: '0 auto', flexWrap: 'wrap' }}>
              {/* Carte 1 — Proposer mon projet */}
              <div onClick={() => { setShowProjet(true); setProjetStep(1); setProjetSent(false); setProjet({ metier: '', ville: '', description: '', budget: '', urgence: 'normal', pieces: '' }); }}
                style={{ flex: '1 1 280px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 'clamp(24px,3vw,32px)', cursor: 'pointer', transition: 'all .3s' }}
                onMouseEnter={e => { e.currentTarget.style.background = L.gold; e.currentTarget.style.borderColor = L.gold; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(166,139,75,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F5EFE0', marginBottom: 6 }}>Proposer mon projet</div>
                <div style={{ fontSize: 13, color: 'rgba(245,239,224,0.6)', lineHeight: 1.5, marginBottom: 16 }}>Décrivez vos travaux, fixez votre budget. Des artisans vous envoient leurs offres.</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'rgba(245,239,224,0.4)' }}>
                  <span>📋 Publiez</span><span>🔔 Recevez</span><span>✅ Choisissez</span>
                </div>
              </div>
              {/* Carte 2 — Trouver un artisan */}
              <div onClick={() => navigate('/btp')}
                style={{ flex: '1 1 280px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 'clamp(24px,3vw,32px)', cursor: 'pointer', transition: 'all .3s' }}
                onMouseEnter={e => { e.currentTarget.style.background = L.gold; e.currentTarget.style.borderColor = L.gold; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(166,139,75,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F5EFE0', marginBottom: 6 }}>Trouver un artisan</div>
                <div style={{ fontSize: 13, color: 'rgba(245,239,224,0.6)', lineHeight: 1.5, marginBottom: 16 }}>Dépannage urgent ou artisan de confiance — trouvez le bon professionnel directement.</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'rgba(245,239,224,0.4)' }}>
                  <span>⚡ Rapide</span><span>🛡️ Vérifiés</span><span>⭐ Avis</span>
                </div>
              </div>
            </div>

            {/* Commission */}
            <div style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: 'rgba(245,239,224,0.3)' }}>
              Commission projet : 2€ &lt; 500€ · 5€ au-dessus · L'artisan reçoit 100%
            </div>
          </> : projetSent ? <>
            {/* ── Confirmation ── */}
            <div style={{ textAlign: 'center', maxWidth: 440, margin: '0 auto' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(22,163,74,0.15)', border: '2px solid #16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>✓</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F5EFE0', marginBottom: 8 }}>Projet publié !</h2>
              <p style={{ fontSize: 14, color: 'rgba(245,239,224,0.6)', lineHeight: 1.6, marginBottom: 24 }}>
                Votre projet <strong style={{ color: '#F5EFE0' }}>{projet.metier}</strong> est en ligne. Les artisans de votre zone vont vous envoyer leurs offres.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {user && <button onClick={() => navigate('/client/dashboard')} style={{ padding: '12px 24px', background: L.gold, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font }}>Voir mes projets</button>}
                <button onClick={() => { setShowProjet(false); setProjetSent(false); }} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: '#F5EFE0', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: L.font }}>Retour</button>
              </div>
            </div>
          </> : <>
            {/* ── Questionnaire étape par étape ── */}
            <button onClick={() => { if (projetStep > 1) setProjetStep(projetStep - 1); else setShowProjet(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,239,224,0.5)', fontSize: 13, fontFamily: L.font, marginBottom: 16 }}>
              ← {projetStep > 1 ? 'Étape précédente' : 'Retour'}
            </button>

            {/* Progression */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
              {[1, 2, 3, 4].map(s => (
                <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: projetStep >= s ? L.gold : 'rgba(255,255,255,0.12)', transition: 'background .3s' }} />
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 'clamp(24px,3vw,32px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {projetStep === 1 && <>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F5EFE0', marginBottom: 4 }}>Quel type de travaux ?</div>
                <p style={{ fontSize: 13, color: 'rgba(245,239,224,0.5)', marginBottom: 20 }}>Sélectionnez le métier concerné</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                  {[{ m: 'Plomberie', e: '🔧' }, { m: 'Électricité', e: '⚡' }, { m: 'Peinture', e: '🎨' }, { m: 'Maçonnerie', e: '🧱' }, { m: 'Menuiserie', e: '🪚' }, { m: 'Carrelage', e: '🔲' }, { m: 'Chauffage', e: '🔥' }, { m: 'Serrurerie', e: '🔑' }, { m: 'Couverture', e: '🏠' }, { m: 'Isolation', e: '🧊' }, { m: 'Autre', e: '🔨' }].map(({ m, e }) => (
                    <button key={m} onClick={() => { setProjet(p => ({ ...p, metier: m })); setProjetStep(2); }}
                      style={{ padding: '14px 12px', background: projet.metier === m ? L.gold : 'rgba(255,255,255,0.06)', border: `1px solid ${projet.metier === m ? L.gold : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, color: projet.metier === m ? '#fff' : '#F5EFE0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, textAlign: 'center', transition: 'all .15s' }}>
                      <span style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>{e}</span>{m}
                    </button>
                  ))}
                </div>
              </>}

              {projetStep === 2 && <>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F5EFE0', marginBottom: 4 }}>Décrivez votre projet</div>
                <p style={{ fontSize: 13, color: 'rgba(245,239,224,0.5)', marginBottom: 16 }}>Plus c'est précis, meilleures seront les offres</p>
                <textarea value={projet.description} onChange={e => setProjet(p => ({ ...p, description: e.target.value }))} rows={4}
                  placeholder="Ex : Je souhaite refaire la salle de bain complète (douche à l'italienne, nouveau carrelage, meuble vasque)..."
                  style={{ width: '100%', padding: '14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,0.06)', color: '#F5EFE0', outline: 'none', boxSizing: 'border-box', fontFamily: L.font, resize: 'vertical' }} />
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: 'rgba(245,239,224,0.5)', marginBottom: 6 }}>Pièce concernée (optionnel)</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['Salle de bain', 'Cuisine', 'Salon', 'Chambre', 'Extérieur', 'Tout le logement', 'Autre'].map(p => (
                      <button key={p} onClick={() => setProjet(pr => ({ ...pr, pieces: p }))}
                        style={{ padding: '6px 14px', background: projet.pieces === p ? L.gold : 'rgba(255,255,255,0.06)', border: `1px solid ${projet.pieces === p ? L.gold : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, color: projet.pieces === p ? '#fff' : 'rgba(245,239,224,0.7)', fontSize: 12, cursor: 'pointer', fontFamily: L.font }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => { if (projet.description.trim()) setProjetStep(3); }}
                  disabled={!projet.description.trim()}
                  style={{ marginTop: 16, width: '100%', padding: '14px', background: projet.description.trim() ? L.gold : 'rgba(255,255,255,0.08)', color: projet.description.trim() ? '#fff' : 'rgba(245,239,224,0.3)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: projet.description.trim() ? 'pointer' : 'not-allowed', fontFamily: L.font }}>
                  Continuer →
                </button>
              </>}

              {projetStep === 3 && <>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F5EFE0', marginBottom: 4 }}>Où et quand ?</div>
                <p style={{ fontSize: 13, color: 'rgba(245,239,224,0.5)', marginBottom: 16 }}>Pour trouver les artisans proches de chez vous</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(245,239,224,0.5)', marginBottom: 4 }}>Ville *</div>
                    <input value={projet.ville} onChange={e => setProjet(p => ({ ...p, ville: e.target.value }))} placeholder="Nice, Paris, Lyon..."
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,0.06)', color: '#F5EFE0', outline: 'none', boxSizing: 'border-box', fontFamily: L.font }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(245,239,224,0.5)', marginBottom: 4 }}>Urgence</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[{ id: 'urgent', label: '🚨 Urgent', desc: 'Sous 48h' }, { id: 'normal', label: '📅 Normal', desc: 'Sous 2 semaines' }, { id: 'flexible', label: '🕐 Flexible', desc: 'Pas pressé' }].map(u => (
                        <button key={u.id} onClick={() => setProjet(p => ({ ...p, urgence: u.id }))}
                          style={{ flex: 1, padding: '10px', background: projet.urgence === u.id ? L.gold + '20' : 'rgba(255,255,255,0.04)', border: `1px solid ${projet.urgence === u.id ? L.gold : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, cursor: 'pointer', fontFamily: L.font, textAlign: 'center' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: projet.urgence === u.id ? L.gold : '#F5EFE0' }}>{u.label}</div>
                          <div style={{ fontSize: 10, color: 'rgba(245,239,224,0.4)' }}>{u.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => { if (projet.ville.trim()) setProjetStep(4); }}
                  disabled={!projet.ville.trim()}
                  style={{ marginTop: 16, width: '100%', padding: '14px', background: projet.ville.trim() ? L.gold : 'rgba(255,255,255,0.08)', color: projet.ville.trim() ? '#fff' : 'rgba(245,239,224,0.3)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: projet.ville.trim() ? 'pointer' : 'not-allowed', fontFamily: L.font }}>
                  Continuer →
                </button>
              </>}

              {projetStep === 4 && (() => {
                const budget = Number(projet.budget) || 0;
                const commission = Math.max(1, Math.round(budget * 0.01 * 100) / 100);
                const fraisPaiement = Math.min(2, Math.round((budget * 0.002 + 0.20) * 100) / 100);
                const total = Math.round((budget + commission + fraisPaiement) * 100) / 100;
                return <>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F5EFE0', marginBottom: 4 }}>Votre budget</div>
                <p style={{ fontSize: 13, color: 'rgba(245,239,224,0.5)', marginBottom: 16 }}>Indiquez votre budget, la commission Freample est calculée automatiquement.</p>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(245,239,224,0.5)', marginBottom: 4 }}>Budget travaux (€)</div>
                  <input type="number" value={projet.budget} onChange={e => setProjet(p => ({ ...p, budget: e.target.value }))} placeholder="Ex : 2000"
                    style={{ width: '100%', padding: '14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 18, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: '#F5EFE0', outline: 'none', boxSizing: 'border-box', fontFamily: L.font, textAlign: 'center' }} />
                </div>

                {/* Détail commission */}
                {budget > 0 && (
                  <div style={{ marginTop: 16, padding: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: '#F5EFE0' }}>
                      <span>Budget travaux</span>
                      <span style={{ fontWeight: 700 }}>{budget.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'rgba(245,239,224,0.6)' }}>
                      <span>Commission Freample (1%)</span>
                      <span style={{ fontWeight: 600 }}>{commission.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'rgba(245,239,224,0.6)' }}>
                      <span>Frais sécurisation paiement (0,2% + 0,20€, max 2€)</span>
                      <span style={{ fontWeight: 600 }}>{fraisPaiement.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 16, color: L.gold }}>
                      <span style={{ fontWeight: 700 }}>Total à payer</span>
                      <span style={{ fontWeight: 800 }}>{total.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(245,239,224,0.35)', marginTop: 6 }}>
                      L'artisan reçoit 100% du budget travaux ({budget.toLocaleString('fr-FR')}€). Les frais couvrent la plateforme et la sécurisation des paiements via prélèvement SEPA.
                    </div>
                  </div>
                )}

                {/* Récap */}
                <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: L.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Récapitulatif</div>
                  {[['Métier', projet.metier], ['Description', projet.description?.slice(0, 60) + (projet.description?.length > 60 ? '...' : '')], ['Ville', projet.ville], ['Urgence', { urgent: 'Urgent (48h)', normal: 'Normal (2 sem.)', flexible: 'Flexible' }[projet.urgence]], ['Budget', budget > 0 ? `${budget.toLocaleString('fr-FR')}€` : 'Non défini'], ['Commission (1%)', budget > 0 ? `${commission}€` : '—'], ['Frais paiement', budget > 0 ? `${fraisPaiement}€` : '—'], ['Total', budget > 0 ? `${total.toLocaleString('fr-FR')}€` : '—']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                      <span style={{ color: 'rgba(245,239,224,0.5)' }}>{k}</span>
                      <span style={{ color: '#F5EFE0', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => {
                  if (!user) {
                    // Sauvegarder le projet en attente et afficher la modale auth
                    localStorage.setItem('freample_projet_pending', JSON.stringify(projet));
                    setShowAuthModal(true);
                    return;
                  }
                  try {
                    const projets = JSON.parse(localStorage.getItem('freample_projets') || '[]');
                    projets.push({ id: Date.now(), ...projet, budget, commission, fraisPaiement, total, statut: 'publie', date: new Date().toISOString(), clientNom: user?.nom || 'Client' });
                    localStorage.setItem('freample_projets', JSON.stringify(projets));
                  } catch {}
                  setProjetSent(true);
                }}
                  style={{ marginTop: 16, width: '100%', padding: '16px', background: L.gold, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: L.font, transition: 'background .2s', boxShadow: '0 4px 16px rgba(166,139,75,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#B89B5A'} onMouseLeave={e => e.currentTarget.style.background = L.gold}>
                  Publier mon projet →
                </button>
              </>;
              })()}
            </div>
          </>}
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

      {/* ══ MODALE AUTH — "Créer un compte pour publier" ══ */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAuthModal(false); }}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 420, width: '100%', padding: '32px 28px', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', textAlign: 'center', position: 'relative' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: 14, right: 14, background: '#F2F2F7', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 14, color: '#636363', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF7ED', border: '2px solid #A68B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>📋</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Votre projet est prêt !</h3>
            <p style={{ fontSize: 14, color: '#636363', lineHeight: 1.6, margin: '0 0 24px' }}>
              Créez un compte gratuit pour publier votre projet et recevoir des offres d'artisans. <strong>Votre projet ne sera pas perdu.</strong>
            </p>

            {/* Récap mini du projet */}
            <div style={{ background: '#F8F7F4', borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: '#636363' }}>{projet.metier}</span>
                <span style={{ fontWeight: 700 }}>{projet.budget ? `${Number(projet.budget).toLocaleString('fr-FR')}€` : '—'}</span>
              </div>
              <div style={{ fontSize: 12, color: '#8E8E93' }}>📍 {projet.ville || '—'} · {projet.description?.slice(0, 40)}{projet.description?.length > 40 ? '...' : ''}</div>
            </div>

            <button onClick={() => { setShowAuthModal(false); navigate('/register?role=client&redirect=/'); }}
              style={{ width: '100%', padding: '14px', background: '#A68B4B', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: L.font, marginBottom: 10, transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#8B7540'} onMouseLeave={e => e.currentTarget.style.background = '#A68B4B'}>
              Créer mon compte — Gratuit
            </button>
            <button onClick={() => { setShowAuthModal(false); navigate('/login'); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#636363', fontFamily: L.font }}>
              J'ai déjà un compte — Se connecter
            </button>
            <div style={{ fontSize: 11, color: '#AEAEB2', marginTop: 12 }}>
              ✓ Gratuit · ✓ Sans engagement · ✓ Votre projet sera publié automatiquement
            </div>
          </div>
        </div>
      )}

      {/* ══ Footer ══ */}
      <footer style={{ padding: '28px 32px', textAlign: 'center', borderTop: `1px solid ${L.border}` }}>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
          {[{ label: 'Artisans', href: '/btp' }, { label: 'Espace pro', href: '/pro' }, { label: 'Recrutement', href: '/recrutement' }, { label: 'CGU', href: '/cgu' }].map(l => (
            <a key={l.label} href={l.href} style={{ fontSize: 12, color: L.textSec, textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = L.gold} onMouseLeave={e => e.currentTarget.style.color = L.textSec}>{l.label}</a>
          ))}
        </nav>
        <p style={{ fontSize: 11, color: L.textLight, margin: 0 }}>© 2026 Freample · Tous droits réservés</p>
      </footer>
    </div>
  );
}
