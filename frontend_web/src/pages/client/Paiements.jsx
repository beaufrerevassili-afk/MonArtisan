import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { IconCreditCard, IconCheck, IconDownload, IconPlus } from '../../components/ui/Icons';

const METHODES = [
  { id: 1, type: 'visa',   numero: '•••• 4242', expiry: '12/26', principale: true  },
  { id: 2, type: 'paypal', email: 'marie.d@gmail.com',          principale: false },
];

export default function PaiementsClient() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/client/paiements-historique').then(r => {
      setData(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1>Paiements</h1>
        <p style={{ marginTop: 4 }}>Historique et gestion de vos paiements</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <div className="stat-card">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--success-light)', color: '#1A7A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <IconCreditCard size={15} />
          </div>
          <p style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {data?.total_depense?.toLocaleString('fr-FR')} €
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>Total dépensé</p>
        </div>
        <div className="stat-card">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <IconCheck size={15} />
          </div>
          <p style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {data?.nb_paiements || 0}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>Paiements effectués</p>
        </div>
      </div>

      {/* Historique */}
      <div>
        <h2 style={{ marginBottom: 16 }}>Historique des transactions</h2>
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mission</th>
                <th>Artisan</th>
                <th>Méthode</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Facture</th>
              </tr>
            </thead>
            <tbody>
              {(data?.paiements || []).map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.titre}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{p.artisanNom}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{p.methode}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    {p.date ? new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.montant.toLocaleString('fr-FR')} €</td>
                  <td>
                    <span className={`badge ${p.statut === 'payé' ? 'badge-green' : 'badge-yellow'}`}>
                      {p.statut === 'payé' ? 'Payé' : 'En attente'}
                    </span>
                  </td>
                  <td>
                    {p.facture ? (
                      <button className="btn-ghost" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                        <IconDownload size={12} /> {p.facture}
                      </button>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Méthodes de paiement */}
      <div>
        <h2 style={{ marginBottom: 16 }}>Moyens de paiement</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 540 }}>
          {METHODES.map(m => (
            <div key={m.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 46, height: 30, borderRadius: 6, flexShrink: 0,
                background: m.type === 'visa' ? '#1A1F71' : '#003087',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '0.5625rem', letterSpacing: 0.5 }}>
                  {m.type === 'visa' ? 'VISA' : 'PayPal'}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)' }}>
                  {m.type === 'visa' ? `Carte Visa ${m.numero}` : `PayPal — ${m.email}`}
                </p>
                {m.expiry && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Expire {m.expiry}</p>}
              </div>
              {m.principale
                ? <span className="badge badge-green">Principale</span>
                : <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>Définir par défaut</button>
              }
            </div>
          ))}
          <button className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
            <IconPlus size={14} /> Ajouter un moyen de paiement
          </button>
        </div>
      </div>
    </div>
  );
}
