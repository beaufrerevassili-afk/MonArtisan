import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Avis démo représentant ce que les clients ont laissé
const AVIS_DEMO = [
  {
    id: 1, client: 'Marie L.', artisan: 'Eric Leroy', specialite: 'Électricité',
    travail: 'Installation prise électrique salon', date: '2024-03-22',
    note: 4.9, recommande: true, verifie: true,
    commentaire: 'Travail impeccable, très professionnel et ponctuel. Je recommande vivement.',
    criteres: { qualite: 5, ponctualite: 5, proprete: 5, communication: 5, rapport: 4 },
    reponse: null,
  },
  {
    id: 2, client: 'Thomas R.', artisan: 'Carlos Garcia', specialite: 'Plomberie',
    travail: 'Réparation robinet chambre', date: '2024-02-14',
    note: 4.4, recommande: true, verifie: true,
    commentaire: 'Rapide et efficace. Léger retard au démarrage mais le résultat est là.',
    criteres: { qualite: 5, ponctualite: 3, proprete: 4, communication: 5, rapport: 5 },
    reponse: null,
  },
  {
    id: 3, client: 'Claire B.', artisan: 'Sophie Martin', specialite: 'Peinture',
    travail: 'Peinture couloir entrée', date: '2024-01-28',
    note: 5.0, recommande: true, verifie: true,
    commentaire: 'Magnifique résultat, travail soigné et propre. La meilleure artisane que j\'ai eue.',
    criteres: { qualite: 5, ponctualite: 5, proprete: 5, communication: 5, rapport: 5 },
    reponse: 'Merci pour votre confiance, c\'est toujours un plaisir de travailler avec des clients attentifs !',
  },
  {
    id: 4, client: 'François D.', artisan: 'Jean-Paul Moreau', specialite: 'Menuiserie',
    travail: 'Remplacement fenêtres double-vitrage', date: '2023-11-10',
    note: 4.8, recommande: true, verifie: true,
    commentaire: '',
    criteres: { qualite: 5, ponctualite: 5, proprete: 4, communication: 5, rapport: 5 },
    reponse: null,
  },
];

const CRITERES_LABELS = {
  qualite: '🔨 Qualité', ponctualite: '⏱ Ponctualité',
  proprete: '🧹 Propreté', communication: '💬 Communication', rapport: '💰 Qualité/prix',
};

function Stars({ note, size = 13 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(note) ? '#FF9500' : 'none'}
          stroke={s <= Math.round(note) ? '#FF9500' : 'var(--border)'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function ReponseModal({ avis, onClose, onSave }) {
  const [texte, setTexte] = useState(avis.reponse || '');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text)', marginBottom: 6 }}>
          {avis.reponse ? 'Modifier la réponse' : 'Répondre à l\'avis'}
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 18 }}>
          {avis.client} · {avis.travail}
        </p>

        {/* Rappel de l'avis */}
        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, borderLeft: '3px solid var(--border)' }}>
          {avis.commentaire
            ? <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{avis.commentaire}"</p>
            : <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Avis sans commentaire</p>
          }
        </div>

        <textarea
          className="input"
          rows={4}
          placeholder="Votre réponse professionnelle... (visible par tous les clients)"
          value={texte}
          onChange={e => setTexte(e.target.value)}
          style={{ resize: 'vertical', marginBottom: 16 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Annuler</button>
          <button
            className="btn-primary"
            style={{ flex: 2 }}
            disabled={!texte.trim()}
            onClick={() => { onSave(avis.id, texte.trim()); onClose(); }}
          >
            Publier la réponse
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Reputation() {
  const { token } = useAuth();
  const isDemo = localStorage.getItem('token')?.endsWith('.dev');
  const [avis, setAvis]     = useState([]);
  const [apiOk, setApiOk]   = useState(false);
  const [filtre, setFiltre] = useState('tous');
  const [modal, setModal]   = useState(null);

  useEffect(() => {
    api.get('/patron/avis')
      .then(({ data }) => { setAvis(data.avis || []); setApiOk(true); })
      .catch(() => setAvis(isDemo ? AVIS_DEMO : []));
  }, []);

  async function handleSaveReponse(id, texte) {
    try {
      await api.post(`/patron/avis/${id}/repondre`, { reponse: texte });
      setAvis(prev => prev.map(a => a.id === id ? { ...a, reponse: texte } : a));
    } catch (err) {

    }
  }

  // Filtrage direct sur le state avis (les réponses y sont déjà incluses)
  const avisAvecReponses = avis;
  const avisFiltres = avis.filter(a => {
    if (filtre === 'sans_reponse') return !a.reponse;
    if (filtre === 'avec_reponse') return !!a.reponse;
    if (filtre === 'recommande')   return a.recommande;
    return true;
  });

  // Stats globales
  const noteGlobale   = avis.length ? avis.reduce((s, a) => s + a.note, 0) / avis.length : 0;
  const pctRecommande = avis.length ? Math.round(avis.filter(a => a.recommande).length / avis.length * 100) : 0;
  const sansReponse   = avisAvecReponses.filter(a => !a.reponse && a.commentaire).length;

  // Moyennes par critère
  const moyennesCriteres = Object.keys(CRITERES_LABELS).reduce((acc, k) => {
    const vals = avis.filter(a => a.criteres?.[k]).map(a => a.criteres[k]);
    acc[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return acc;
  }, {});

  // Répartition par note
  const repartition = [5,4,3,2,1].map(n => ({
    note: n,
    count: avis.filter(a => Math.round(a.note) === n).length,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1>Réputation & Avis</h1>
          <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
            Avis laissés par vos clients · {!apiOk && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>données démo</span>}
          </p>
        </div>
        {sansReponse > 0 && (
          <div style={{ background: 'rgba(255,149,0,0.1)', border: '1px solid rgba(255,149,0,0.3)', borderRadius: 10, padding: '8px 14px', fontSize: '0.8125rem', color: '#995900', fontWeight: 500 }}>
            ⚠️ {sansReponse} avis sans réponse
          </div>
        )}
      </div>

      {/* Stats top */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Note globale', value: noteGlobale.toFixed(1) + ' / 5', sub: `${avis.length} avis vérifiés` },
          { label: '% Recommandations', value: pctRecommande + '%', sub: 'clients satisfaits' },
          { label: 'Taux de réponse', value: Math.round((avisAvecReponses.filter(a => a.reponse).length / Math.max(avis.filter(a => a.commentaire).length, 1)) * 100) + '%', sub: 'réponses publiées' },
          { label: 'Sans réponse', value: sansReponse, sub: 'à traiter' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Répartition étoiles */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>{noteGlobale.toFixed(1)}</span>
            <div>
              <Stars note={Math.round(noteGlobale)} size={16} />
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 3 }}>{avis.length} avis</p>
            </div>
          </div>
          {repartition.map(r => (
            <div key={r.note} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: 12, textAlign: 'right' }}>{r.note}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF9500" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <div style={{ flex: 1, height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#FF9500', borderRadius: 3, width: `${avis.length ? (r.count / avis.length) * 100 : 0}%`, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', width: 16, textAlign: 'right' }}>{r.count}</span>
            </div>
          ))}
        </div>

        {/* Moyennes par critère */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Détail par critère</h3>
          {Object.entries(CRITERES_LABELS).map(([k, label]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text)', flex: 1 }}>{label}</span>
              <div style={{ width: 60, height: 4, background: 'var(--border-light)', borderRadius: 2 }}>
                <div style={{ height: '100%', background: moyennesCriteres[k] >= 4 ? '#34C759' : moyennesCriteres[k] >= 3 ? '#FF9500' : '#FF3B30', borderRadius: 2, width: `${moyennesCriteres[k] / 5 * 100}%` }} />
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', width: 28, textAlign: 'right' }}>
                {moyennesCriteres[k].toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { key: 'tous',         label: `Tous (${avisAvecReponses.length})` },
          { key: 'sans_reponse', label: `Sans réponse (${sansReponse})` },
          { key: 'avec_reponse', label: 'Avec réponse' },
          { key: 'recommande',   label: '👍 Recommandés' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: '0.8125rem', border: 'none', cursor: 'pointer', fontWeight: 500,
              background: filtre === f.key ? 'var(--primary)' : 'var(--card)',
              color: filtre === f.key ? 'white' : 'var(--text-secondary)',
              boxShadow: filtre === f.key ? '0 2px 8px rgba(0,122,255,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste des avis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {avisFiltres.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Aucun avis dans cette catégorie.
          </div>
        ) : (
          avisFiltres.map(a => (
            <div key={a.id} className="card" style={{ padding: '20px 24px' }}>
              {/* En-tête */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{a.client}</span>
                    {a.verifie && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(52,199,89,0.1)', color: '#1A7A3C', border: '1px solid rgba(52,199,89,0.25)', borderRadius: 20, padding: '1px 7px', fontSize: '0.625rem', fontWeight: 600 }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Avis vérifié
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: a.recommande ? '#1A7A3C' : 'var(--danger)', fontWeight: 500 }}>
                      {a.recommande ? '👍' : '👎'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {a.artisan} · {a.specialite} · {a.travail}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{a.note.toFixed(1)}</span>
                    <Stars note={Math.round(a.note)} size={13} />
                  </div>
                </div>
              </div>

              {/* Critères mini */}
              {a.criteres && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, marginBottom: 12 }}>
                  {Object.entries(CRITERES_LABELS).map(([k, label]) => (
                    <span key={k} style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                      {label.split(' ')[0]} <strong>{a.criteres[k]}/5</strong>
                    </span>
                  ))}
                </div>
              )}

              {/* Commentaire */}
              {a.commentaire && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 12 }}>
                  "{a.commentaire}"
                </p>
              )}

              {/* Réponse existante */}
              {a.reponse && (
                <div style={{ marginBottom: 12, padding: '12px 14px', background: 'var(--primary-light)', border: '1px solid rgba(0,122,255,0.12)', borderRadius: 10, borderLeft: '3px solid var(--primary)' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>Votre réponse</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text)', lineHeight: 1.5 }}>{a.reponse}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={a.reponse ? 'btn-secondary' : 'btn-primary'}
                  style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
                  onClick={() => setModal(a)}
                >
                  {a.reponse ? '✏️ Modifier la réponse' : '💬 Répondre à cet avis'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <ReponseModal
          avis={modal}
          onClose={() => setModal(null)}
          onSave={handleSaveReponse}
        />
      )}
    </div>
  );
}
