import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SECTEURS = [
  {
    id: 'btp',
    emoji: '🏗️',
    nom: 'Bâtiment & Artisanat',
    desc: 'Plomberie, électricité, menuiserie, peinture, maçonnerie...',
    features: ['Gestion de chantiers', 'Devis & facturation', 'Recrutement BTP'],
    color: '#5B5BD6',
    grad: 'linear-gradient(135deg, #5B5BD6 0%, #7C3AED 100%)',
    shadow: 'rgba(91,91,214,0.35)',
    stat: '600 000 entreprises',
  },
  {
    id: 'coiffure',
    emoji: '✂️',
    nom: 'Coiffure & Beauté',
    desc: 'Salons de coiffure, barbiers, instituts de beauté...',
    features: ['Réservation en ligne', 'Fidélité clients', 'Planning prestataires'],
    color: '#EC4899',
    grad: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)',
    shadow: 'rgba(236,72,153,0.35)',
    stat: '80 000 salons',
  },
  {
    id: 'restaurant',
    emoji: '🍽️',
    nom: 'Restauration',
    desc: 'Restaurants, brasseries, traiteurs, food trucks...',
    features: ['Plan de salle', 'Réservation & commandes', 'Gestion des menus'],
    color: '#F97316',
    grad: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
    shadow: 'rgba(249,115,22,0.35)',
    stat: '175 000 établissements',
  },
  {
    id: 'boulangerie',
    emoji: '🥖',
    nom: 'Boulangerie & Pâtisserie',
    desc: 'Boulangeries, pâtisseries, chocolateries, traiteurs...',
    features: ['Gestion de production', 'Traçabilité DLC', 'Commandes clients'],
    color: '#D97706',
    grad: 'linear-gradient(135deg, #D97706 0%, #DC2626 100%)',
    shadow: 'rgba(217,119,6,0.35)',
    stat: '33 000 artisans',
  },
  {
    id: 'garage',
    emoji: '🔧',
    nom: 'Garage & Auto',
    desc: 'Garages, centres auto, carrosseries, motos...',
    features: ['Fiches véhicules', 'Ordres de réparation', 'Gestion pièces'],
    color: '#10B981',
    grad: 'linear-gradient(135deg, #10B981 0%, #0891B2 100%)',
    shadow: 'rgba(16,185,129,0.35)',
    stat: '40 000 garages',
  },
  {
    id: 'commerce',
    emoji: '🏪',
    nom: 'Commerce de proximité',
    desc: 'Épiceries, pharmacies, pressing, fleuristes...',
    features: ['Caisse & stock', 'Fidélité clients', 'Gestion fournisseurs'],
    color: '#6366F1',
    grad: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    shadow: 'rgba(99,102,241,0.35)',
    stat: '400 000 commerces',
  },
];

function SecteurCard({ secteur, index }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/${secteur.id}`)}
      style={{
        position: 'relative',
        background: hovered
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(255,255,255,0.04)',
        border: hovered
          ? `1px solid ${secteur.color}55`
          : '1px solid rgba(255,255,255,0.09)',
        borderRadius: 20,
        padding: '28px 24px 24px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.34,1.1,0.64,1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 50px ${secteur.shadow}, 0 0 0 1px ${secteur.color}33`
          : '0 2px 12px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(12px)',
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 20, right: 20, height: 2,
        background: hovered ? secteur.grad : 'transparent',
        borderRadius: '0 0 4px 4px',
        transition: 'all 0.25s',
      }} />

      {/* Emoji icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: hovered ? secteur.grad : `${secteur.color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem', marginBottom: 16,
        transition: 'all 0.25s',
        boxShadow: hovered ? `0 8px 24px ${secteur.shadow}` : 'none',
      }}>
        {secteur.emoji}
      </div>

      {/* Nom */}
      <div style={{
        fontSize: '1.0625rem', fontWeight: 700,
        color: hovered ? '#fff' : 'rgba(255,255,255,0.88)',
        letterSpacing: '-0.02em', marginBottom: 6, transition: 'color 0.2s',
      }}>
        {secteur.nom}
      </div>

      {/* Description */}
      <div style={{
        fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)',
        lineHeight: 1.5, marginBottom: 16,
      }}>
        {secteur.desc}
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {secteur.features.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: `${secteur.color}22`, border: `1px solid ${secteur.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <polyline points="2 6 5 9 10 3" stroke={secteur.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.01em' }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.725rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.01em' }}>
          {secteur.stat}
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: '0.8125rem', fontWeight: 600,
          color: hovered ? secteur.color : 'rgba(255,255,255,0.4)',
          transition: 'color 0.2s',
        }}>
          Découvrir
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: hovered ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.2s' }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function SecteurSelect() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080F',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background mesh */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91,91,214,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(124,58,237,0.08) 0%, transparent 50%)
        `,
      }} />
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Navbar ── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(20px, 5vw, 60px)', height: 64,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(91,91,214,0.4)',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22" fill="rgba(255,255,255,0.7)"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#fff', letterSpacing: '-0.025em' }}>
              Artisans<span style={{ background: 'linear-gradient(90deg, #A5A5FF, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}> Pro</span>
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', padding: '8px 18px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', border: 'none', cursor: 'pointer', padding: '8px 18px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, color: '#fff', boxShadow: '0 4px 14px rgba(91,91,214,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(91,91,214,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(91,91,214,0.4)'; }}
            >
              Créer un compte
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{
          textAlign: 'center',
          padding: 'clamp(48px, 8vh, 80px) clamp(20px, 5vw, 60px) clamp(40px, 6vh, 60px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(91,91,214,0.12)', border: '1px solid rgba(91,91,214,0.25)',
            borderRadius: 24, padding: '5px 16px 5px 10px', marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5B5BD6', boxShadow: '0 0 8px #5B5BD6' }} />
            <span style={{ fontSize: '0.8125rem', color: 'rgba(165,165,255,0.9)', fontWeight: 500, letterSpacing: '-0.01em' }}>
              La plateforme tout-en-un pour les professionnels
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: '#fff',
            margin: '0 auto 16px',
            maxWidth: 680,
          }}>
            Gérez votre entreprise,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #A5A5FF 0%, #C084FC 50%, #F472B6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              quel que soit votre secteur
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
            color: 'rgba(255,255,255,0.5)',
            margin: '0 auto 14px',
            maxWidth: 520,
            lineHeight: 1.6,
            letterSpacing: '-0.01em',
          }}>
            ERP, RH, facturation, recrutement, relation client — adapté à votre métier.
          </p>

          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '-0.01em' }}>
            Choisissez votre secteur d'activité pour commencer
          </p>
        </div>

        {/* ── Grille secteurs ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
          padding: '0 clamp(20px, 5vw, 60px) clamp(40px, 6vh, 80px)',
          maxWidth: 1200,
          margin: '0 auto',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.5s 0.15s ease, transform 0.5s 0.15s ease',
        }}>
          {SECTEURS.map((s, i) => (
            <SecteurCard key={s.id} secteur={s} index={i} />
          ))}
        </div>

        {/* ── Stats bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 'clamp(24px, 5vw, 64px)',
          flexWrap: 'wrap',
          padding: 'clamp(24px, 4vh, 40px) clamp(20px, 5vw, 60px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.5s 0.3s ease',
        }}>
          {[
            { val: '1 300 000+', label: 'professionnels ciblés' },
            { val: '6 secteurs', label: 'd\'activité couverts' },
            { val: '100%', label: 'français & RGPD' },
            { val: 'Gratuit', label: 'pour commencer' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{val}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '-0.01em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Footer minimal ── */}
        <div style={{
          textAlign: 'center',
          padding: '16px clamp(20px, 5vw, 60px) 32px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          {[
            { label: 'Connexion', path: '/login' },
            { label: 'Inscription', path: '/register' },
            { label: 'Recrutement', path: '/recrutement' },
            { label: 'CGU', path: '/cgu' },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '-0.01em', transition: 'color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
