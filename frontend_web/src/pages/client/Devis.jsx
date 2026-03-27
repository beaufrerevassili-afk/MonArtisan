import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { IconCheck, IconX, IconStar, IconClock, IconDownload } from '../../components/ui/Icons';

const TABS = [
  { key: '',           label: 'Tous'       },
  { key: 'en_attente', label: 'En attente' },
  { key: 'accepte',    label: 'Acceptés'   },
  { key: 'refuse',     label: 'Refusés'    },
];

const STATUT_STYLE = {
  en_attente: { cls: 'badge badge-yellow', label: 'En attente' },
  accepte:    { cls: 'badge badge-green',  label: 'Accepté'    },
  refuse:     { cls: 'badge badge-red',    label: 'Refusé'     },
};

export default function DevisClient() {
  const [devis, setDevis]     = useState([]);
  const [stats, setStats]     = useState({});
  const [tab, setTab]         = useState('');
  const [loading, setLoading] = useState(true);
  const [compareId, setCompareId] = useState(null);

  useEffect(() => { charger(); }, [tab]);

  async function charger() {
    setLoading(true);
    const params = tab ? { statut: tab } : {};
    const { data } = await api.get('/client/devis-client', { params });
    setDevis(data.devis);
    setStats(data.stats);
    setLoading(false);
  }

  async function accepter(id) {
    await api.post(`/client/devis-client/${id}/accepter`);
    charger();
    setCompareId(null);
  }

  async function refuser(id) {
    await api.post(`/client/devis-client/${id}/refuser`);
    charger();
  }

  // Group by missionId
  const grouped = devis.reduce((acc, d) => {
    (acc[d.missionId] = acc[d.missionId] || []).push(d);
    return acc;
  }, {});

  const missionsMultiples = Object.entries(grouped).filter(([, arr]) => arr.filter(d => d.statut === 'en_attente').length > 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1>Mes devis</h1>
        <p style={{ marginTop: 4 }}>Comparez et acceptez les offres de vos artisans</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total reçus', val: stats.total || 0,       color: 'var(--primary)' },
          { label: 'En attente',  val: stats.en_attente || 0,  color: '#FF9500'        },
          { label: 'Acceptés',    val: stats.accepte || 0,     color: '#34C759'        },
          { label: 'Refusés',     val: stats.refuse || 0,      color: '#FF3B30'        },
        ].map(({ label, val, color }) => (
          <div key={label} className="stat-card">
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{val}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.key} className={`tab-item${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
            {t.key === 'en_attente' && stats.en_attente > 0 && (
              <span style={{ marginLeft: 6, background: '#FF9500', color: 'white', fontSize: '0.625rem', fontWeight: 700, padding: '1px 5px', borderRadius: 10 }}>
                {stats.en_attente}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Compare banner */}
      {missionsMultiples.length > 0 && (tab === '' || tab === 'en_attente') && (
        <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(0,122,255,0.2)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
            {missionsMultiples.length} mission{missionsMultiples.length > 1 ? 's ont' : ' a'} plusieurs devis en attente — comparez avant d'accepter
          </span>
          <button className="btn-primary" style={{ fontSize: '0.8125rem', padding: '6px 14px', flexShrink: 0 }} onClick={() => setCompareId(parseInt(missionsMultiples[0][0]))}>
            Comparer les offres
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" style={{ width: 24, height: 24 }} />
        </div>
      ) : devis.length === 0 ? (
        <div className="card" style={{ padding: 56, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>Aucun devis trouvé</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {devis.map(d => (
            <DevisCard key={d.id} devis={d} onAccepter={accepter} onRefuser={refuser} />
          ))}
        </div>
      )}

      {/* Comparison modal */}
      {compareId !== null && (
        <CompareModal
          devis={(grouped[compareId] || []).filter(d => d.statut === 'en_attente')}
          allDevis={grouped[compareId] || []}
          onClose={() => setCompareId(null)}
          onAccepter={accepter}
          onRefuser={refuser}
        />
      )}
    </div>
  );
}

function DevisCard({ devis: d, onAccepter, onRefuser }) {
  const [expanded, setExpanded] = useState(false);
  const sm = STATUT_STYLE[d.statut] || { cls: 'badge badge-gray', label: d.statut };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'var(--primary-light)', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1rem', flexShrink: 0,
        }}>
          {d.artisanNom?.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{d.artisanNom}</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>·</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{d.artisanSpecialite}</span>
            {d.artisanNote && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.75rem', color: '#FF9500', fontWeight: 600 }}>
                <IconStar size={11} color="#FF9500" fill="#FF9500" /> {d.artisanNote}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{d.titre}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={sm.cls}>{sm.label}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <IconClock size={11} /> {d.delai}
            </span>
            {d.validiteDate && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Valide jusqu'au {d.validiteDate.slice(0, 10)}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {d.montantTTC?.toLocaleString('fr-FR')} €
          </p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>TTC · TVA {d.tva}€</p>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6 }}>{d.description}</p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Prestation</th>
                <th style={{ textAlign: 'right' }}>Qté</th>
                <th style={{ textAlign: 'right' }}>Prix unit.</th>
                <th style={{ textAlign: 'right' }}>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {d.lignes?.map((l, i) => (
                <tr key={i}>
                  <td>{l.description}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{l.quantite}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{l.prixUnitaire}€</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>{l.total}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Masquer' : 'Voir le détail'}
        </button>
        <div style={{ flex: 1 }} />
        {d.statut === 'en_attente' && (
          <>
            <button className="btn-danger" style={{ padding: '5px 12px', fontSize: '0.8125rem' }} onClick={() => onRefuser(d.id)}>
              <IconX size={12} /> Décliner
            </button>
            <button className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.8125rem' }} onClick={() => onAccepter(d.id)}>
              <IconCheck size={12} /> Accepter
            </button>
          </>
        )}
        {d.statut === 'accepte' && (
          <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.8125rem' }}>
            <IconDownload size={12} /> Télécharger
          </button>
        )}
      </div>
    </div>
  );
}

function CompareModal({ devis, onClose, onAccepter, onRefuser }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: 20, padding: 28,
        width: '100%', maxWidth: 860, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2>Comparaison des devis</h2>
            {devis[0] && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>{devis[0].titre}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex' }}>
            <IconX size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(devis.length, 3)}, 1fr)`, gap: 16 }}>
          {devis.map(d => {
            const isBest = d.montantTTC === Math.min(...devis.map(x => x.montantTTC));
            return (
              <div key={d.id} style={{
                border: `1px solid ${isBest ? 'var(--success)' : 'var(--border-light)'}`,
                borderRadius: 16, padding: 20,
                background: isBest ? 'rgba(52,199,89,0.05)' : 'var(--bg)',
                position: 'relative',
              }}>
                {isBest && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--success)', color: 'white',
                    fontSize: '0.6875rem', fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                    whiteSpace: 'nowrap',
                  }}>
                    Meilleur prix
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1.125rem', margin: '0 auto 10px',
                  }}>
                    {d.artisanNom?.charAt(0)}
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--text)' }}>{d.artisanNom}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{d.artisanSpecialite}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 4 }}>
                    <IconStar size={11} color="#FF9500" fill="#FF9500" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FF9500' }}>{d.artisanNote}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14, marginBottom: 14 }}>
                  {[['Montant HT', `${d.montantHT}€`], ['TVA (20%)', `${d.tva}€`]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{l}</span>
                      <span style={{ fontSize: '0.875rem' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: 8, marginTop: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Total TTC</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{d.montantTTC}€</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  <div>Délai : <strong>{d.delai}</strong></div>
                  <div style={{ marginTop: 3 }}>Valide jusqu'au : <strong>{d.validiteDate?.slice(0, 10)}</strong></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onAccepter(d.id)}>
                    <IconCheck size={13} /> Accepter ce devis
                  </button>
                  <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem' }} onClick={() => onRefuser(d.id)}>
                    <IconX size={13} /> Décliner
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
