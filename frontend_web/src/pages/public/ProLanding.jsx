import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFadeUp } from '../../utils/scrollAnimations';
import L from '../../design/luxe';

export default function ProLanding() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const isPro = user && (user.role === 'patron' || user.role === 'fondateur');
  const r1 = useFadeUp(), r2 = useFadeUp(0.1), r3 = useFadeUp(0.1);

  return (
    <div style={{ minHeight: '100vh', background: L.white, fontFamily: L.font, color: L.text }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(20px,4vw,48px)', height: 64, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${L.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 900, color: L.text, fontFamily: L.font, letterSpacing: '-0.04em' }}>
            Freample<span style={{ color: L.gold }}>.</span> <span style={{ fontSize: 12, fontWeight: 400, color: L.textSec }}>Pro</span>
          </button>
          <button onClick={() => navigate('/')} style={{ padding: '8px 16px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font }}>Accueil</button>
          <button onClick={() => navigate('/immo')} style={{ padding: '8px 16px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font }}>Freample Immo</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isPro ? (
            <button onClick={() => navigate('/patron/dashboard')} style={{ padding: '8px 20px', background: L.noir, border: 'none', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: L.font }}>Mon espace →</button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={{ padding: '8px 18px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: L.textSec, cursor: 'pointer', fontFamily: L.font }}>Se connecter</button>
              <button onClick={() => navigate('/register?role=patron&secteur=btp')} style={{ padding: '8px 20px', background: L.noir, border: 'none', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: L.font, transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>
                S'inscrire gratuitement
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <header style={{ background: L.noir, padding: 'clamp(64px,12vh,120px) 32px clamp(48px,8vh,80px)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(166,139,75,0.08) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ width: 40, height: 2, background: L.gold, margin: '0 auto 24px' }} />
          <h1 style={{ fontSize: 'clamp(32px,6vw,56px)', fontWeight: 800, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Recevez des projets,<br />gérez votre entreprise.
          </h1>
          <p style={{ fontSize: 'clamp(15px,1.6vw,17px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: '0 auto 32px', maxWidth: 480 }}>
            Des clients publient leurs projets sur Freample. Vous choisissez ceux qui vous intéressent, envoyez un devis et gérez tout depuis un seul espace.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register?role=patron&secteur=btp')} style={{ padding: '14px 36px', background: L.gold, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: L.font, transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = L.goldDark} onMouseLeave={e => e.currentTarget.style.background = L.gold}>
              Créer mon espace pro — Gratuit
            </button>
            {isPro && <button onClick={() => navigate('/patron/projets')} style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: L.font }}>
              Voir les projets disponibles →
            </button>}
          </div>
        </div>
      </header>

      {/* ══ COMMENT ÇA MARCHE — 3 étapes ══ */}
      <section ref={r1} style={{ padding: 'clamp(56px,9vh,88px) 32px', background: L.cream, borderBottom: `1px solid ${L.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 40px' }}>Comment ça marche</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { step: '1', icon: '📋', title: 'Les clients publient', desc: 'Un particulier décrit son projet (plomberie, peinture...), fixe son budget et sa ville. Le projet apparaît dans votre zone.', color: '#2563EB' },
              { step: '2', icon: '📤', title: 'Vous proposez', desc: 'Acceptez le projet au prix client, envoyez un devis personnalisé, proposez un RDV ou contactez directement. Vous choisissez.', color: L.gold },
              { step: '3', icon: '🤝', title: 'Vous êtes mis en relation', desc: 'Le client accepte votre offre. Vous gérez le chantier, la facturation et le suivi depuis votre espace entreprise.', color: '#16A34A' },
            ].map(s => (
              <div key={s.step} style={{ background: '#fff', borderRadius: 16, padding: 'clamp(24px,3vw,32px)', border: `1px solid ${L.border}`, textAlign: 'left', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: '16px 16px 0 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>{s.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Étape {s.step}</div>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: L.textSec, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 2 VOLETS : Projets + Gestion ══ */}
      <section ref={r2} style={{ padding: 'clamp(56px,9vh,88px) 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px', textAlign: 'center' }}>Deux outils, un seul espace</h2>
          <p style={{ fontSize: 15, color: L.textSec, textAlign: 'center', margin: '0 auto 40px', maxWidth: 520 }}>Trouvez des chantiers ET gérez votre entreprise depuis le même compte.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Projets clients */}
            <div style={{ background: L.noir, borderRadius: 16, padding: 'clamp(28px,4vw,36px)', color: '#fff' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📋</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px' }}>Projets clients</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 20 }}>Des particuliers publient leurs projets dans votre zone. Vous choisissez, vous proposez, vous gagnez.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Projets géolocalisés dans votre rayon', 'Devis automatique ou personnalisé', 'Proposition de RDV intégrée', 'Messagerie directe avec le client', 'Commission 1% payée par le client'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ color: L.gold, flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Gestion entreprise */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 'clamp(28px,4vw,36px)', border: `1px solid ${L.border}` }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🏢</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px' }}>Mon entreprise</h3>
              <p style={{ fontSize: 13, color: L.textSec, lineHeight: 1.6, marginBottom: 20 }}>Un ERP complet pour gérer votre activité au quotidien. RH, paie, conformité, finances — tout inclus.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Pipeline commercial & facturation', 'Gestion du personnel & paie BTP', 'QHSE : audits, EPI, incidents', 'Comptabilité & export Sage/EBP', 'Recrutement & onboarding', 'Chantiers, planning, documents'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: L.textSec }}>
                    <span style={{ color: L.gold, flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CHIFFRES ══ */}
      <section style={{ background: L.cream, padding: 'clamp(36px,5vh,56px) 32px', borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(32px,6vw,80px)', flexWrap: 'wrap', textAlign: 'center' }}>
          {[{ val: '0 €', label: 'Abonnement' }, { val: '1%', label: 'Commission client' }, { val: '100%', label: 'Pour vous' }, { val: '∞', label: 'Projets illimités' }].map(s => (
            <div key={s.val}>
              <div style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 500, fontFamily: L.serif, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: L.textSec, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TARIFS DÉTAILLÉ ══ */}
      <section style={{ padding: 'clamp(56px,9vh,88px) 32px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px' }}>Gratuit pour vous.</h2>
          <p style={{ fontSize: 15, color: L.textSec, marginBottom: 32 }}>Pas d'abonnement. La commission de 1% est payée par le client, pas par l'artisan. Vous recevez 100% du montant des travaux.</p>
          <div style={{ background: L.noir, borderRadius: 16, padding: '28px 24px', color: '#fff', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 14 }}>Inscription</span><span style={{ fontWeight: 700, color: L.gold }}>Gratuit</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 14 }}>Abonnement mensuel</span><span style={{ fontWeight: 700, color: L.gold }}>0 €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 14 }}>Accès projets clients</span><span style={{ fontWeight: 700, color: L.gold }}>Illimité</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 14 }}>Devis & factures</span><span style={{ fontWeight: 700, color: L.gold }}>Illimité</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 14 }}>ERP complet (RH, paie, QHSE...)</span><span style={{ fontWeight: 700, color: L.gold }}>Inclus</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <span style={{ fontSize: 14 }}>Commission</span><span style={{ fontWeight: 700, color: '#16A34A' }}>0 € — payée par le client</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section ref={r3} id="faq" style={{ background: L.bg, padding: 'clamp(56px,9vh,88px) 32px', borderTop: `1px solid ${L.border}` }}>
        <div style={{ maxWidth: 650, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 32px', textAlign: 'center' }}>Questions fréquentes</h2>
          {[
            { q: 'Comment je reçois des projets ?', a: 'Les particuliers publient leurs projets sur Freample avec leur budget et leur ville. Vous configurez votre zone d\'intervention (adresse + rayon en km) et seuls les projets proches de vous apparaissent.' },
            { q: 'Combien ça coûte ?', a: 'Rien. L\'inscription, l\'accès aux projets, les devis, la gestion d\'entreprise — tout est gratuit. La commission de 1% est payée par le client, pas par vous.' },
            { q: 'Comment je réponds à un projet ?', a: 'Vous avez 4 options : accepter au prix du client (devis automatique), envoyer un devis personnalisé, proposer un rendez-vous pour évaluer les travaux, ou contacter directement le client.' },
            { q: 'C\'est quoi "Mon entreprise" ?', a: 'C\'est un ERP complet intégré : gestion du personnel, paie BTP, QHSE (audits, EPI, incidents), comptabilité, recrutement, chantiers. Tout ce dont vous avez besoin pour gérer votre activité.' },
            { q: 'Je peux créer les comptes de mes salariés ?', a: 'Oui. Depuis votre espace, vous créez les comptes employés. Ils reçoivent leurs identifiants et accèdent à leur propre espace (planning, fiches de paie, documents...).' },
            { q: 'Mes données sont sécurisées ?', a: 'Oui. Hébergement sécurisé, chiffrement SSL, sauvegardes quotidiennes.' },
          ].map(faq => (
            <details key={faq.q} style={{ marginBottom: 1 }}>
              <summary style={{ padding: '16px 20px', background: L.white, border: `1px solid ${L.border}`, cursor: 'pointer', fontSize: 15, fontWeight: 600, color: L.text, listStyle: 'none' }}>{faq.q}</summary>
              <div style={{ padding: '14px 20px', background: L.white, border: `1px solid ${L.border}`, borderTop: 'none', fontSize: 14, color: L.textSec, lineHeight: 1.65 }}>{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section style={{ background: L.noir, padding: 'clamp(64px,10vh,100px) 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 14px' }}>
            Prêt à recevoir<br />des projets ?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 32px' }}>Inscription gratuite, aucun abonnement, commencez dès maintenant.</p>
          <button onClick={() => navigate('/register?role=patron&secteur=btp')} style={{ padding: '16px 48px', background: L.gold, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'background .25s' }}
            onMouseEnter={e => e.currentTarget.style.background = L.goldDark} onMouseLeave={e => e.currentTarget.style.background = L.gold}>
            Commencer maintenant
          </button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: '24px 32px', borderTop: `1px solid ${L.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: L.textLight, fontFamily: L.font }}
          onMouseEnter={e => e.currentTarget.style.color = L.gold} onMouseLeave={e => e.currentTarget.style.color = L.textLight}>← Retour à l'accueil</button>
        <span style={{ fontSize: 11, color: L.textLight }}>© 2026 Freample</span>
      </footer>
    </div>
  );
}
