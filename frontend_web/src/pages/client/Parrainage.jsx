import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { IconGift, IconCheck } from '../../components/ui/Icons';

export default function ParrainageClient() {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/client/parrainage', { params: { userId: user?.id } }).then(r => setData(r.data));
  }, [user?.id]);

  function copierCode() {
    navigator.clipboard.writeText(data?.codeParrainage || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  const steps = [
    { n: '1', titre: 'Partagez votre code',    desc: 'Envoyez votre code unique à vos amis par SMS, email ou réseaux sociaux.' },
    { n: '2', titre: 'Votre ami s\'inscrit',   desc: 'Il entre votre code lors de son inscription sur la plateforme.' },
    { n: '3', titre: 'Récoltez la récompense', desc: 'Dès sa première mission terminée, vous recevez tous les deux 10 € de crédit.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1>Parrainage</h1>
        <p style={{ marginTop: 4 }}>Invitez vos amis et gagnez des récompenses ensemble</p>
      </div>

      {/* Hero card */}
      <div className="card" style={{
        padding: 32,
        background: 'linear-gradient(135deg, var(--primary) 0%, #5AC8FA 100%)',
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -24, right: -24, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 80, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <IconGift size={22} color="white" />
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Programme de parrainage</span>
          </div>
          <p style={{ fontSize: '1.625rem', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>10 € pour vous et votre ami</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.85, marginBottom: 26, maxWidth: 500 }}>
            Partagez votre code unique et recevez 10 € de crédit dès la première mission complétée par votre filleul.
          </p>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255,255,255,0.18)', borderRadius: 12,
              padding: '10px 20px', fontWeight: 700, fontSize: '1.0625rem',
              letterSpacing: 3, minWidth: 180,
            }}>
              {data?.codeParrainage || '···'}
            </div>
            <button
              onClick={copierCode}
              style={{
                background: 'white', color: 'var(--primary)', border: 'none',
                borderRadius: 12, padding: '10px 20px', fontWeight: 600,
                fontSize: '0.875rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {copied ? <><IconCheck size={14} color="var(--primary)" /> Copié !</> : 'Copier le code'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 380 }}>
        <div className="stat-card">
          <p style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {data?.statistiques?.amisInvites || 0}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>Amis invités</p>
        </div>
        <div className="stat-card">
          <p style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {data?.statistiques?.recompensesGagnees || 0} €
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>Crédits gagnés</p>
        </div>
      </div>

      {/* Comment ça marche */}
      <div>
        <h2 style={{ marginBottom: 18 }}>Comment ça marche ?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520 }}>
          {steps.map(({ n, titre, desc }) => (
            <div key={n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9375rem', flexShrink: 0,
              }}>
                {n}
              </div>
              <div style={{ paddingTop: 4 }}>
                <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{titre}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
