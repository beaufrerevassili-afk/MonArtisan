import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useScaleIn } from '../../utils/scrollAnimations';
import L from '../../design/luxe';

const STORAGE_KEY = 'freample_immo_data';
const TYPES_LOGEMENT = ['Appartement', 'Maison', 'Studio', 'Loft', 'Local commercial'];

const DEMO_ANNONCES = [
  { id: 1, nom: 'T2 lumineux Gambetta', type: 'Appartement', adresse: '12 rue Gambetta, 06000 Nice', surface: 45, pieces: 2, loyer: 750, charges: 50, dpe: 'C', meuble: false, description: 'Bel appartement traversant, parquet, balcon sud. Proche tramway.', proprio: 'SCI Riviera', publie: true, photos: [] },
  { id: 2, nom: 'Studio meublé centre', type: 'Studio', adresse: '8 avenue Jean Médecin, 06000 Nice', surface: 22, pieces: 1, loyer: 550, charges: 30, dpe: 'D', meuble: true, description: 'Studio entièrement meublé et équipé. Idéal étudiant ou jeune actif.', proprio: 'SCI Azur', publie: true, photos: [] },
  { id: 3, nom: 'Maison T4 avec jardin', type: 'Maison', adresse: '24 chemin des Oliviers, 06100 Nice', surface: 90, pieces: 4, loyer: 1400, charges: 80, dpe: 'B', meuble: false, description: 'Maison individuelle, jardin 200m², garage, quartier calme.', proprio: 'SCI Les Pins', publie: true, photos: [] },
  { id: 4, nom: 'T3 rénové Libération', type: 'Appartement', adresse: '15 boulevard de la Libération, 06000 Nice', surface: 65, pieces: 3, loyer: 950, charges: 60, dpe: 'C', meuble: false, description: 'Appartement entièrement rénové, cuisine équipée, cave.', proprio: 'Propriétaire', publie: true, photos: [] },
];

const dpeColors = { A: '#16A34A', B: '#22C55E', C: '#84CC16', D: '#D97706', E: '#EA580C', F: '#DC2626', G: '#DC2626' };

export default function FreampleImmo() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const isDev = user?.email === 'freamplecom@gmail.com';
  const s1 = useScaleIn();
  const [mounted, setMounted] = useState(false);
  const [searchVille, setSearchVille] = useState('');
  const [searchType, setSearchType] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [annonces, setAnnonces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMounted(true); document.title = 'Freample Immo — Trouvez votre logement'; }, []);

  // Charger les annonces depuis localStorage (partagé avec ImmoDemo) + fallback démo
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        const published = (d.biens || []).filter(b => b.publie && !b.locataireId);
        const withSci = published.map(b => {
          const sci = (d.scis || []).find(s => s.id === b.sciId);
          return { ...b, proprio: sci?.nom || 'Propriétaire' };
        });
        setAnnonces(withSci.length > 0 ? withSci : DEMO_ANNONCES);
      } else {
        setAnnonces(DEMO_ANNONCES);
      }
    } catch { setAnnonces(DEMO_ANNONCES); }
  }, []);

  const filtered = annonces.filter(a => {
    if (searchType && a.type !== searchType) return false;
    if (searchVille && !a.adresse?.toLowerCase().includes(searchVille.toLowerCase())) return false;
    if (budgetMax && a.loyer > Number(budgetMax)) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: L.bg, fontFamily: L.font, color: L.text }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(20px,4vw,48px)', height: 64, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${L.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <button onClick={() => navigate('/immo')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 900, color: L.text, fontFamily: L.font, letterSpacing: '-0.04em' }}>
            Freample<span style={{ color: L.gold }}>.</span> <span style={{ fontSize: 13, fontWeight: 600, color: '#2563EB' }}>Immo</span>
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => navigate('/pro')} style={{ padding: '8px 18px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = L.noir} onMouseLeave={e => e.currentTarget.style.color = L.textSec}>
              Professionnel
            </button>
            <button onClick={() => navigate('/btp')} style={{ padding: '8px 18px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = L.noir} onMouseLeave={e => e.currentTarget.style.color = L.textSec}>
              Freample Artisans
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isDev && <button onClick={() => navigate('/immo/demo')} style={{ padding: '6px 12px', background: '#F0FDF4', border: 'none', fontSize: 11, fontWeight: 700, color: '#16A34A', cursor: 'pointer' }}>Demo</button>}
          {user ? <>
            <button onClick={() => { const d = { client: '/client/dashboard', patron: '/patron/dashboard', employe: '/employe/dashboard', artisan: '/artisan/dashboard' }; navigate(d[user.role] || '/'); }}
              style={{ padding: '8px 18px', background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: L.gold, cursor: 'pointer', fontFamily: L.font }}>Mon espace</button>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onClick={() => navigate('/login')}>{(user.nom || 'U').charAt(0).toUpperCase()}</div>
          </> : <>
            <button onClick={() => navigate('/login')} style={{ padding: '8px 20px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font }}>Se connecter</button>
            <button onClick={() => navigate('/register')} style={{ padding: '8px 20px', background: L.noir, border: 'none', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: L.font }}>S'inscrire</button>
          </>}
        </div>
      </nav>

      {/* ══ HERO — Recherche logement ══ */}
      <section style={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #0F2744 100%)', position: 'relative', overflow: 'hidden',
        padding: 'clamp(60px,10vh,100px) clamp(20px,4vw,48px) clamp(48px,8vh,72px)',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,39,68,0.5) 0%, rgba(15,39,68,0.95) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', textAlign: 'center', opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'opacity .6s, transform .6s' }}>
          <h1 ref={s1} style={{ fontFamily: L.serif, fontSize: 'clamp(34px,6.5vw,56px)', fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 14px', lineHeight: 1.06, color: '#fff' }}>
            Trouvez votre <span style={{ fontWeight: 700, color: '#60A5FA' }}>logement</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 auto 32px', maxWidth: 460 }}>
            Appartement, maison, studio — parcourez les annonces et candidatez en quelques clics.
          </p>

          {/* Barre de recherche */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 6, display: 'flex', gap: 0, boxShadow: '0 8px 40px rgba(0,0,0,0.3)', maxWidth: 640, margin: '0 auto' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none' }}>🏠</span>
              <select value={searchType} onChange={e => setSearchType(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 38px', border: 'none', fontSize: 14, fontFamily: L.font, outline: 'none', background: 'transparent', color: L.text, cursor: 'pointer', appearance: 'none' }}>
                <option value="">Type de bien</option>
                {TYPES_LOGEMENT.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ width: 1, background: '#E8E6E1', margin: '10px 0' }} />
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none' }}>📍</span>
              <input value={searchVille} onChange={e => setSearchVille(e.target.value)} placeholder="Ville ou quartier"
                style={{ width: '100%', padding: '14px 14px 14px 38px', border: 'none', fontSize: 14, fontFamily: L.font, outline: 'none', background: 'transparent', color: L.text, boxSizing: 'border-box' }} />
            </div>
            <div style={{ width: 1, background: '#E8E6E1', margin: '10px 0' }} />
            <div style={{ flex: '0 0 110px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none' }}>💰</span>
              <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder="Budget max"
                style={{ width: '100%', padding: '14px 14px 14px 38px', border: 'none', fontSize: 14, fontFamily: L.font, outline: 'none', background: 'transparent', color: L.text, boxSizing: 'border-box' }} />
            </div>
            <button style={{ padding: '12px 24px', background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: L.font, flexShrink: 0, transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2563EB'} onMouseLeave={e => e.currentTarget.style.background = '#1E3A5F'}>
              Rechercher
            </button>
          </div>

          {/* Chiffres */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px,5vw,56px)', marginTop: 32 }}>
            {[{ v: `${filtered.length}`, l: 'Annonces' }, { v: '0€', l: 'Frais dossier' }, { v: '✓', l: 'Dossier en ligne' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 500, fontFamily: L.serif, color: '#60A5FA' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RÉSULTATS ══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(24px,4vw,40px) clamp(20px,4vw,48px) 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
            {filtered.length} logement{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: L.textSec }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Aucun logement trouvé</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Essayez d'élargir vos critères de recherche.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(a => (
              <div key={a.id} onClick={() => setSelected(a)}
                style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                {/* Image placeholder */}
                <div style={{ height: 160, background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ fontSize: 40, opacity: 0.3 }}>🏠</span>
                  <div style={{ position: 'absolute', top: 10, left: 10, background: dpeColors[a.dpe] || '#888', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>DPE {a.dpe}</div>
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>{a.loyer}€/mois</div>
                  {a.meuble && <div style={{ position: 'absolute', bottom: 10, left: 10, background: '#fff', color: L.text, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4 }}>Meublé</div>}
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{a.nom}</div>
                  <div style={{ fontSize: 12, color: L.textSec, marginBottom: 6 }}>📍 {a.adresse}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: L.textSec }}>
                    <span>{a.surface}m²</span>
                    <span>{a.pieces} pièce{a.pieces > 1 ? 's' : ''}</span>
                    <span>{a.loyer + (a.charges || 0)}€ CC</span>
                  </div>
                  <div style={{ fontSize: 11, color: L.textSec, marginTop: 6 }}>{a.proprio}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ MODAL DÉTAIL LOGEMENT ══ */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ height: 200, background: 'linear-gradient(135deg, #1E3A5F, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '16px 16px 0 0' }}>
              <span style={{ fontSize: 60, opacity: 0.2 }}>🏠</span>
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{selected.nom}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{selected.adresse}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 16, right: 16, background: '#fff', color: '#1E3A5F', padding: '6px 14px', borderRadius: 8, fontWeight: 800, fontSize: 18 }}>{selected.loyer}€<span style={{ fontSize: 12, fontWeight: 400 }}>/mois</span></div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { l: 'Type', v: selected.type },
                  { l: 'Surface', v: `${selected.surface}m²` },
                  { l: 'Pièces', v: selected.pieces },
                  { l: 'Charges', v: `${selected.charges || 0}€/mois` },
                  { l: 'DPE', v: selected.dpe },
                  { l: 'Meublé', v: selected.meuble ? 'Oui' : 'Non' },
                ].map(k => (
                  <div key={k.l} style={{ flex: '1 1 100px', background: '#F8F8F6', padding: '8px 12px', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: L.textSec, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{k.v}</div>
                  </div>
                ))}
              </div>
              {selected.description && <p style={{ fontSize: 13, color: L.textSec, lineHeight: 1.7, marginBottom: 16 }}>{selected.description}</p>}
              <div style={{ fontSize: 12, color: L.textSec, marginBottom: 16 }}>Proposé par : <strong>{selected.proprio}</strong></div>
              <button onClick={() => { if (user) { navigate('/client/dashboard'); } else { navigate('/register'); } }}
                style={{ width: '100%', padding: '14px', background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: L.font, transition: 'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2563EB'} onMouseLeave={e => e.currentTarget.style.background = '#1E3A5F'}>
                {user ? 'Candidater' : 'Créer un compte pour candidater'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CTA FINAL ══ */}
      <section style={{ background: '#1E3A5F', padding: 'clamp(48px,8vh,72px) 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 12px' }}>Vous êtes propriétaire ?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>Gérez vos biens, locataires et SCI depuis votre espace Freample Immo.</p>
          <button onClick={() => navigate('/pro')} style={{ padding: '14px 36px', background: '#60A5FA', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, transition: 'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#3B82F6'} onMouseLeave={e => e.currentTarget.style.background = '#60A5FA'}>
            Espace professionnel →
          </button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: '24px 32px', textAlign: 'center', borderTop: `1px solid ${L.border}` }}>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12, flexWrap: 'wrap' }}>
          {[{ label: 'Accueil', href: '/' }, { label: 'Artisans', href: '/btp' }, { label: 'Espace pro', href: '/pro' }, { label: 'Recrutement', href: '/recrutement' }].map(l => (
            <a key={l.label} href={l.href} style={{ fontSize: 12, color: L.textSec, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#2563EB'} onMouseLeave={e => e.currentTarget.style.color = L.textSec}>{l.label}</a>
          ))}
        </nav>
        <p style={{ fontSize: 11, color: L.textLight, margin: 0 }}>© 2026 Freample · Tous droits réservés</p>
      </footer>
    </div>
  );
}
