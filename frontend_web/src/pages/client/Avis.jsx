import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IconStar, IconCheck, IconDocument } from '../../components/ui/Icons';
import { API_URL } from '../../services/api';

// Travaux de référence (viendraient de l'API en production)
const TRAVAUX_DEMO = [
  { id: 1, titre: 'Installation prise électrique salon', artisan: 'Eric Leroy',         specialite: 'Électricité', date: '2024-03-22', montant: 216,  facture: 'FAC-2024-102' },
  { id: 2, titre: 'Réparation robinet chambre',          artisan: 'Carlos Garcia',       specialite: 'Plomberie',   date: '2024-02-14', montant: 185,  facture: 'FAC-2024-098' },
  { id: 3, titre: 'Peinture couloir entrée',             artisan: 'Sophie Martin',       specialite: 'Peinture',    date: '2024-01-28', montant: 680,  facture: 'FAC-2024-095' },
  { id: 4, titre: 'Remplacement fenêtres double-vitrage', artisan: 'Jean-Paul Moreau',  specialite: 'Menuiserie',  date: '2023-11-10', montant: 1840, facture: 'FAC-2023-047' },
];

const CRITERES = [
  { key: 'qualite',    label: 'Qualité du travail', icon: '🔨' },
  { key: 'ponctualite',label: 'Ponctualité',         icon: '⏱' },
  { key: 'proprete',   label: 'Propreté',            icon: '🧹' },
  { key: 'communication', label: 'Communication',   icon: '💬' },
  { key: 'rapport',    label: 'Rapport qualité/prix',icon: '💰' },
];

function avgNote(avis) {
  if (!avis?.criteres) return avis?.note || 0;
  const vals = Object.values(avis.criteres).filter(Boolean);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function Stars({ note, size = 14, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const display = interactive ? (hover || note) : note;
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <span
          key={s}
          onClick={() => interactive && onChange?.(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ cursor: interactive ? 'pointer' : 'default', display: 'flex' }}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={s <= display ? '#FF9500' : 'none'} stroke={s <= display ? '#FF9500' : 'var(--border)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </span>
      ))}
    </div>
  );
}

function BadgeVerifie() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: '0.6875rem', fontWeight: 600,
      background: 'rgba(52,199,89,0.1)', color: '#1A7A3C',
      border: '1px solid rgba(52,199,89,0.25)',
      padding: '2px 8px', borderRadius: 20,
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      Avis vérifié
    </span>
  );
}

function ModalAvis({ travail, existingAvis, onClose, onSave }) {
  const initCriteres = existingAvis?.criteres || { qualite: 5, ponctualite: 5, proprete: 5, communication: 5, rapport: 5 };
  const [criteres, setCriteres] = useState(initCriteres);
  const [commentaire, setCommentaire] = useState(existingAvis?.commentaire || '');
  const [anonyme, setAnonyme] = useState(existingAvis?.anonyme || false);
  const [recommande, setRecommande] = useState(existingAvis?.recommande !== false);

  const moyenne = Object.values(criteres).reduce((a, b) => a + b, 0) / Object.values(criteres).length;

  function handleSave() {
    const avis = {
      travailId: travail.id,
      artisan: travail.artisan,
      specialite: travail.specialite,
      titre: travail.titre,
      facture: travail.facture,
      date: travail.date,
      montant: travail.montant,
      criteres,
      note: Math.round(moyenne * 10) / 10,
      commentaire,
      anonyme,
      recommande,
      publieeLe: new Date().toISOString(),
      verifie: true,
    };
    onSave(avis);
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)' }}>Laisser un avis</h2>
            <BadgeVerifie />
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {travail.artisan} · {travail.titre}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {new Date(travail.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · Facture {travail.facture}
          </p>
        </div>

        {/* Score global */}
        <div style={{ textAlign: 'center', padding: '16px 0 20px', borderBottom: '1px solid var(--border-light)', marginBottom: 20 }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {moyenne.toFixed(1)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <Stars note={Math.round(moyenne)} size={20} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6 }}>Note moyenne sur 5 critères</p>
        </div>

        {/* Multi-critères */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {CRITERES.map(c => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7, minWidth: 170 }}>
                <span>{c.icon}</span> {c.label}
              </span>
              <Stars
                note={criteres[c.key]}
                size={20}
                interactive
                onChange={val => setCriteres(prev => ({ ...prev, [c.key]: val }))}
              />
            </div>
          ))}
        </div>

        {/* Recommande */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setRecommande(true)}
            style={{
              flex: 1, padding: '9px', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
              background: recommande ? 'var(--success-light, #F0FFF4)' : 'var(--bg)',
              border: recommande ? '1px solid var(--success)' : '1px solid var(--border)',
              color: recommande ? '#1A7A3C' : 'var(--text-secondary)',
            }}
          >
            👍 Je recommande
          </button>
          <button
            onClick={() => setRecommande(false)}
            style={{
              flex: 1, padding: '9px', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
              background: !recommande ? '#FFF5F5' : 'var(--bg)',
              border: !recommande ? '1px solid var(--danger)' : '1px solid var(--border)',
              color: !recommande ? 'var(--danger)' : 'var(--text-secondary)',
            }}
          >
            👎 Je ne recommande pas
          </button>
        </div>

        {/* Commentaire */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Commentaire (optionnel)</label>
          <textarea
            className="input"
            rows={3}
            placeholder="Décrivez votre expérience avec cet artisan..."
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            style={{ resize: 'vertical' }}
          />
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            {commentaire.length}/500 caractères
          </p>
        </div>

        {/* Anonyme */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 20, userSelect: 'none' }}>
          <input type="checkbox" checked={anonyme} onChange={e => setAnonyme(e.target.checked)} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Publier de façon anonyme</span>
        </label>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Annuler</button>
          <button className="btn-primary" style={{ flex: 2 }} onClick={handleSave}>
            Publier l'avis vérifié
          </button>
        </div>
      </div>
    </div>
  );
}

function AvisCard({ avis, onEdit }) {
  const note = avis.note || avgNote(avis);
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{avis.artisan}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>·</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{avis.specialite}</span>
            <BadgeVerifie />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {avis.titre} · {new Date(avis.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{note.toFixed(1)}</span>
            <Stars note={Math.round(note)} size={13} />
          </div>
          <p style={{ fontSize: '0.6875rem', color: avis.recommande !== false ? '#1A7A3C' : 'var(--danger)', marginTop: 3, fontWeight: 500 }}>
            {avis.recommande !== false ? '👍 Recommande' : '👎 Ne recommande pas'}
          </p>
        </div>
      </div>

      {/* Critères */}
      {avis.criteres && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, padding: '12px 14px', background: 'var(--bg)', borderRadius: 10, marginBottom: 12 }}>
          {CRITERES.map(c => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem' }}>{c.icon}</span>
              <Stars note={avis.criteres[c.key]} size={11} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{avis.criteres[c.key]}/5</span>
            </div>
          ))}
        </div>
      )}

      {avis.commentaire && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 12 }}>
          "{avis.commentaire}"
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
            {avis.anonyme ? 'Publié anonymement' : 'Publié avec votre nom'} · Facture {avis.facture}
          </span>
        </div>
        <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => onEdit(avis.travailId)}>
          Modifier
        </button>
      </div>
    </div>
  );
}

export default function Avis() {
  const { token } = useAuth();
  const [tab, setTab] = useState('publies');
  const [travaux, setTravaux] = useState(TRAVAUX_DEMO);
  const [avisMap, setAvisMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('client_avis')) || {}; }
    catch { return {}; }
  });
  const [modal, setModal] = useState(null); // travailId en cours

  useEffect(() => {
    localStorage.setItem('client_avis', JSON.stringify(avisMap));
  }, [avisMap]);

  // Tenter de charger les travaux depuis l'API
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/client/travaux`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.travaux?.length) setTravaux(data.travaux); })
      .catch(() => {});
  }, [token]);

  function handleSave(avis) {
    setAvisMap(prev => ({ ...prev, [avis.travailId]: avis }));
  }

  const avisPublies  = travaux.filter(t => avisMap[t.id]);
  const avisEnAttente = travaux.filter(t => !avisMap[t.id]);
  const avgGlobal = avisPublies.length
    ? avisPublies.reduce((s, t) => s + (avisMap[t.id]?.note || 0), 0) / avisPublies.length
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1>Mes avis</h1>
          <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>Avis vérifiés liés à vos travaux réels</p>
        </div>
        {avisEnAttente.length > 0 && (
          <div style={{ background: 'var(--primary)', color: 'white', borderRadius: 10, padding: '10px 16px', fontSize: '0.8125rem', fontWeight: 500 }}>
            {avisEnAttente.length} travail{avisEnAttente.length > 1 ? 'x' : ''} à noter
          </div>
        )}
      </div>

      {/* Stats */}
      {avisPublies.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Note moyenne', value: avgGlobal.toFixed(1) + ' / 5', sub: `${avisPublies.length} avis publié${avisPublies.length > 1 ? 's' : ''}` },
            { label: 'Recommandations', value: avisPublies.filter(t => avisMap[t.id]?.recommande !== false).length + ' / ' + avisPublies.length, sub: 'artisans recommandés' },
            { label: 'En attente', value: avisEnAttente.length, sub: 'travaux sans avis' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: '16px 18px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', padding: 4, borderRadius: 10, alignSelf: 'flex-start' }}>
        {[
          { key: 'publies',   label: `Publiés (${avisPublies.length})` },
          { key: 'attente',   label: `À noter (${avisEnAttente.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '7px 16px', borderRadius: 7, fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'var(--card)' : 'transparent',
              color: tab === t.key ? 'var(--text)' : 'var(--text-secondary)',
              boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Avis publiés */}
      {tab === 'publies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {avisPublies.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', marginBottom: 12 }}>⭐</p>
              <p style={{ color: 'var(--text-secondary)' }}>Vous n'avez pas encore publié d'avis.</p>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('attente')}>
                Voir les travaux à noter →
              </button>
            </div>
          ) : (
            avisPublies.map(t => (
              <AvisCard
                key={t.id}
                avis={avisMap[t.id]}
                onEdit={(id) => setModal(id)}
              />
            ))
          )}
        </div>
      )}

      {/* À noter */}
      {tab === 'attente' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {avisEnAttente.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', marginBottom: 12 }}>✅</p>
              <p style={{ color: 'var(--text-secondary)' }}>Tous vos travaux ont été notés. Merci !</p>
            </div>
          ) : (
            avisEnAttente.map(t => (
              <div key={t.id} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A7A3C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9375rem' }}>{t.titre}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {t.artisan} · {t.specialite} · {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>{t.montant.toLocaleString('fr-FR')} €</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Facture {t.facture}</span>
                      <BadgeVerifie />
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ flexShrink: 0 }}
                    onClick={() => setModal(t.id)}
                  >
                    ⭐ Donner mon avis
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <ModalAvis
          travail={travaux.find(t => t.id === modal)}
          existingAvis={avisMap[modal]}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
