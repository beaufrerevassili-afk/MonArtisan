import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DS from '../../design/luxe';
import { isDemo as _isDemo } from '../../utils/storage';

export default function SubscriptionBanner() {
  const isDemo = _isDemo();
  const { user } = useAuth();
  const [sub, setSub] = useState(null);

  useEffect(() => {
    if (isDemo) return;
    if (user?.role === 'fondateur') return;
    api.get('/patron/subscription').then(({ data }) => setSub(data)).catch(() => {});
  }, []);

  if (isDemo || !sub || user?.role === 'fondateur') return null;

  // Trial active — show days remaining
  if (sub.status === 'trial') {
    return (
      <div style={{ padding: '10px 20px', background: '#EFF6FF', borderBottom: '1px solid #2563EB30', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontFamily: DS.font }}>
        <span style={{ color: '#1565C0' }}>
          🎁 <strong>Essai gratuit</strong> — {sub.daysLeft} jour{sub.daysLeft > 1 ? 's' : ''} restant{sub.daysLeft > 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: 11, color: '#636363' }}>Puis 15€/mois</span>
      </div>
    );
  }

  // Subscription active
  if (sub.status === 'active') return null;

  // Trial expired — paywall
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: DS.font }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 440, width: '100%', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A', margin: '0 0 8px' }}>Votre essai gratuit est terminé</h2>
        <p style={{ fontSize: 14, color: '#636363', lineHeight: 1.6, margin: '0 0 24px' }}>
          Pour continuer à utiliser Freample Pro et toutes ses fonctionnalités (devis, chantiers, RH, recrutement...), passez à l'abonnement.
        </p>

        <div style={{ background: '#F8F7F4', borderRadius: 14, padding: 20, marginBottom: 24, border: '1px solid #E8E6E1' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#2C2520' }}>15€<span style={{ fontSize: 16, fontWeight: 400, color: '#636363' }}>/mois</span></div>
          <div style={{ fontSize: 12, color: '#A68B4B', fontWeight: 600, marginTop: 4 }}>Sans engagement · Annulable à tout moment</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}>
            {['Marketplace illimitée', 'Devis & Factures pro', 'Gestion RH complète', 'QHSE', 'Signature électronique', 'Recrutement', 'Messagerie', 'Support prioritaire'].map(f => (
              <div key={f} style={{ fontSize: 12, color: '#333', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#16A34A' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        <button style={{ width: '100%', padding: 16, background: '#A68B4B', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font, transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#8B7340'}
          onMouseLeave={e => e.currentTarget.style.background = '#A68B4B'}
          onClick={() => alert('Paiement Stripe — bientôt disponible. Contactez contact@freample.com')}>
          S'abonner — 15€/mois
        </button>
        <p style={{ fontSize: 11, color: '#999', marginTop: 12 }}>Paiement sécurisé par Stripe. Facture mensuelle automatique.</p>
      </div>
    </div>
  );
}
