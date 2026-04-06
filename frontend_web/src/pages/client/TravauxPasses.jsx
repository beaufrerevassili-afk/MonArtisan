import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconCheck, IconStar, IconDownload, IconDocument } from '../../components/ui/Icons';
import { API_URL } from '../../services/api';

const TRAVAUX_DEMO = [
  { id: 1, titre: 'Installation prise électrique salon', artisan: 'Eric Leroy',          specialite: 'Électricité', date: '2024-03-22', montant: 216,  facture: 'FAC-2024-102', devis: 'DEV-2024-102' },
  { id: 2, titre: 'Réparation robinet chambre',          artisan: 'Carlos Garcia',        specialite: 'Plomberie',   date: '2024-02-14', montant: 185,  facture: 'FAC-2024-098', devis: 'DEV-2024-098' },
  { id: 3, titre: 'Peinture couloir entrée',             artisan: 'Sophie Martin',        specialite: 'Peinture',    date: '2024-01-28', montant: 680,  facture: 'FAC-2024-095', devis: 'DEV-2024-095' },
  { id: 4, titre: 'Remplacement fenêtres double-vitrage', artisan: 'Jean-Paul Moreau',   specialite: 'Menuiserie',  date: '2023-11-10', montant: 1840, facture: 'FAC-2023-047', devis: 'DEV-2023-047' },
];

const CRITERES = [
  { key: 'qualite',       label: 'Qualité',        icon: '🔨' },
  { key: 'ponctualite',   label: 'Ponctualité',    icon: '⏱' },
  { key: 'proprete',      label: 'Propreté',       icon: '🧹' },
  { key: 'communication', label: 'Communication',  icon: '💬' },
  { key: 'rapport',       label: 'Qualité/prix',   icon: '💰' },
];

function Stars({ note, size = 14, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const display = interactive ? (hover || note) : note;
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5].map(s => (
        <span
          key={s}
          onClick={() => interactive && onChange?.(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ cursor: interactive ? 'pointer' : 'default', display: 'flex' }}
        >
          <IconStar size={size} color={s <= display ? '#FF9500' : 'var(--border)'} fill={s <= display ? '#FF9500' : 'none'} />
        </span>
      ))}
    </div>
  );
}

function AvisModal({ travail, existingAvis, onClose, onSave }) {
  const initCriteres = existingAvis?.criteres || { qualite: 5, ponctualite: 5, proprete: 5, communication: 5, rapport: 5 };
  const [criteres, setCriteres] = useState(initCriteres);
  const [commentaire, setCommentaire] = useState(existingAvis?.commentaire || '');
  const [recommande, setRecommande]   = useState(existingAvis?.recommande !== false);
  const moyenne = Object.values(criteres).reduce((a, b) => a + b, 0) / Object.values(criteres).length;

  function handleSave() {
    onSave({
      travailId:   travail.id,
      artisan:     travail.artisan,
      specialite:  travail.specialite,
      titre:       travail.titre,
      facture:     travail.facture,
      date:        travail.date,
      montant:     travail.montant,
      criteres,
      note:        Math.round(moyenne * 10) / 10,
      commentaire,
      recommande,
      publieeLe:   new Date().toISOString(),
      verifie:     true,
    });
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 500, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)' }}>Votre avis</h2>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(52,199,89,0.1)', color: '#1A7A3C', border: '1px solid rgba(52,199,89,0.25)', borderRadius: 20, padding: '2px 8px', fontSize: '0.6875rem', fontWeight: 600 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Avis vérifié
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{travail?.artisan} · {travail?.titre}</p>
        </div>

        {/* Score moyen */}
        <div style={{ textAlign: 'center', padding: '12px 0 18px', borderBottom: '1px solid var(--border-light)', marginBottom: 18 }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {moyenne.toFixed(1)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
            <Stars note={Math.round(moyenne)} size={18} />
          </div>
        </div>

        {/* Critères */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
          {CRITERES.map(c => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6, minWidth: 150 }}>
                {c.icon} {c.label}
              </span>
              <Stars note={criteres[c.key]} size={20} interactive onChange={val => setCriteres(p => ({ ...p, [c.key]: val }))} />
            </div>
          ))}
        </div>

        {/* Recommande */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { val: true,  label: '👍 Je recommande',        bg: recommande ? 'rgba(52,199,89,0.1)' : 'var(--bg)',  border: recommande ? 'var(--success)' : 'var(--border)', color: recommande ? '#1A7A3C' : 'var(--text-secondary)' },
            { val: false, label: '👎 Ne recommande pas',    bg: !recommande ? '#FFF5F5' : 'var(--bg)', border: !recommande ? 'var(--danger)' : 'var(--border)', color: !recommande ? 'var(--danger)' : 'var(--text-secondary)' },
          ].map(r => (
            <button key={String(r.val)} onClick={() => setRecommande(r.val)}
              style={{ flex: 1, padding: 9, borderRadius: 10, fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', background: r.bg, border: `1px solid ${r.border}`, color: r.color }}>
              {r.label}
            </button>
          ))}
        </div>

        <textarea
          className="input"
          rows={3}
          placeholder="Décrivez votre expérience..."
          value={commentaire}
          onChange={e => setCommentaire(e.target.value)}
          style={{ resize: 'vertical', marginBottom: 16 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Annuler</button>
          <button className="btn-primary" style={{ flex: 2 }} onClick={handleSave}>Publier l'avis vérifié</button>
        </div>
      </div>
    </div>
  );
}

export default function TravauxPasses() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [travaux,   setTravaux]   = useState(TRAVAUX_DEMO);
  const [avisModal, setAvisModal] = useState(null);
  const [avisMap,   setAvisMap]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('client_avis')) || {}; }
    catch { return {}; }
  });

  // Synchro localStorage
  useEffect(() => {
    localStorage.setItem('client_avis', JSON.stringify(avisMap));
  }, [avisMap]);

  // Charger les vrais travaux depuis l'API si dispo
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/client/travaux`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.travaux?.length) setTravaux(data.travaux); })
      .catch(() => {});
  }, [token]);

  function handleSaveAvis(avis) {
    setAvisMap(prev => ({ ...prev, [avis.travailId]: avis }));
    if (token) {
      fetch(`${API_URL}/client/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(avis),
      }).catch(() => {});
    }
  }

  const totalDepense = travaux.reduce((s, t) => s + t.montant, 0);
  const sansAvis     = travaux.filter(t => !avisMap[t.id]).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1>Travaux passés</h1>
          <p style={{ marginTop: 4 }}>Historique de vos travaux réalisés</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {sansAvis > 0 && (
            <button className="btn-secondary" style={{ fontSize: '0.8125rem' }} onClick={() => navigate('/client/avis')}>
              ⭐ {sansAvis} avis à laisser
            </button>
          )}
          <div className="stat-card" style={{ padding: '12px 20px', textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>Total dépensé</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {totalDepense.toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {travaux.map(t => {
          const avis = avisMap[t.id];
          return (
            <div key={t.id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--success-light)', color: '#1A7A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconCheck size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titre}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>{t.artisan} · {t.specialite}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        Terminé le {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>{t.montant.toLocaleString('fr-FR')} €</p>
                      <span className="badge badge-green" style={{ marginTop: 4, display: 'inline-block' }}>Terminé</span>
                    </div>
                  </div>

                  {/* Avis existant */}
                  {avis ? (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Stars note={Math.round(avis.note)} size={13} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>{avis.note.toFixed(1)}/5</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(52,199,89,0.1)', color: '#1A7A3C', border: '1px solid rgba(52,199,89,0.25)', borderRadius: 20, padding: '1px 6px', fontSize: '0.625rem', fontWeight: 600 }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Avis vérifié
                        </span>
                      </div>
                      {avis.commentaire && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{avis.commentaire}"</p>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 12px', background: 'rgba(255,149,0,0.06)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 8 }}>
                      <IconStar size={14} color="#FF9500" fill="none" />
                      <span style={{ fontSize: '0.8125rem', color: '#995900' }}>Votre avis aide d'autres clients à choisir cet artisan</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '5px 12px' }}>
                      <IconDownload size={13} /> Facture {t.facture}
                    </button>
                    <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '5px 12px' }}>
                      <IconDocument size={13} /> Devis signé
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: '0.8125rem', padding: '5px 12px' }}
                      onClick={() => setAvisModal(t.id)}
                    >
                      <IconStar size={13} /> {avis ? 'Modifier mon avis' : 'Laisser un avis'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {avisModal !== null && (
        <AvisModal
          travail={travaux.find(t => t.id === avisModal)}
          existingAvis={avisMap[avisModal]}
          onClose={() => setAvisModal(null)}
          onSave={handleSaveAvis}
        />
      )}
    </div>
  );
}
