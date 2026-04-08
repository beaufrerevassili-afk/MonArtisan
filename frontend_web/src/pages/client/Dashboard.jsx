import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DS from '../../design/ds';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { id: 'projets', label: 'Suivi de projets', icon: '📋' },
  { id: 'paiements', label: 'Paiements', icon: '💳' },
  { id: 'messagerie', label: 'Messagerie', icon: '💬' },
  { id: 'favoris', label: 'Artisans favoris', icon: '⭐' },
  { id: 'profil', label: 'Mon profil', icon: '👤' },
];

const STATUT_PROJET = {
  publie: { label: 'Publié', color: '#2563EB', bg: '#EFF6FF' },
  en_cours: { label: 'En cours', color: '#D97706', bg: '#FFFBEB' },
  termine: { label: 'Terminé', color: '#16A34A', bg: '#F0FDF4' },
  annule: { label: 'Annulé', color: '#DC2626', bg: '#FEF2F2' },
};

const DEMO_PROJETS = [
  { id: 1, metier: 'Plomberie', titre: 'Rénovation salle de bain', description: 'Douche à l\'italienne, nouveau carrelage, meuble vasque.', ville: 'Nice', budget: 3500, commission: null, urgence: 'normal', statut: 'publie', date: '2026-04-06', nbOffres: 2 },
  { id: 2, metier: 'Peinture', titre: 'Peinture salon + chambre', description: 'Peinture complète 2 pièces, murs et plafonds.', ville: 'Nice', budget: 1200, commission: null, urgence: 'flexible', statut: 'en_cours', date: '2026-03-28', nbOffres: 3, artisan: 'Sophie Duval' },
  { id: 3, metier: 'Électricité', titre: 'Mise aux normes tableau', description: 'Remplacement tableau électrique vétuste.', ville: 'Antibes', budget: 800, commission: null, urgence: 'urgent', statut: 'termine', date: '2026-03-15', nbOffres: 1, artisan: 'Marc Lambert' },
];

const DEMO_PAIEMENTS = [
  { id: 1, projetTitre: 'Peinture salon + chambre', artisan: 'Sophie Duval', montant: 1200, commission: 12, total: 1212, date: '2026-04-02', statut: 'paye' },
  { id: 2, projetTitre: 'Mise aux normes tableau', artisan: 'Marc Lambert', montant: 800, commission: 8, total: 808, date: '2026-03-20', statut: 'paye' },
];

const DEMO_FAVORIS = [
  { id: 1, nom: 'Lucas Garcia', metier: 'Plomberie', ville: 'Nice', note: 4.8, nbAvis: 47 },
  { id: 2, nom: 'Sophie Duval', metier: 'Peinture', ville: 'Antibes', note: 4.7, nbAvis: 31 },
  { id: 3, nom: 'Marc Lambert', metier: 'Électricité', ville: 'Nice', note: 4.9, nbAvis: 62 },
];

const DEMO_MESSAGES = [
  { id: 1, artisan: 'Sophie Duval', dernier: 'Très bien, on commence lundi !', date: '2026-04-05', unread: 0 },
  { id: 2, artisan: 'Lucas Garcia', dernier: 'Je peux passer demain matin pour le devis.', date: '2026-04-06', unread: 1 },
];

const CARD = { background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 14, padding: '16px 20px' };
const BTN = { padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font };

export default function DashboardClient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('projets');
  const [projets, setProjets] = useState([]);
  const [paiements, setPaiements] = useState(DEMO_PAIEMENTS);
  const [favoris, setFavoris] = useState([]);
  const [messages, setMessages] = useState(DEMO_MESSAGES);

  const prenom = user?.nom?.split(' ')[0] || 'vous';

  useEffect(() => {
    // Charger projets depuis localStorage + API
    try {
      const local = JSON.parse(localStorage.getItem('freample_projets') || '[]');
      setProjets(local.length > 0 ? local : DEMO_PROJETS);
    } catch { setProjets(DEMO_PROJETS); }
    api.get('/projets/mes-projets').then(({ data }) => { if (data.projets?.length) setProjets(data.projets); }).catch(() => {});

    // Charger favoris
    try {
      const fav = JSON.parse(localStorage.getItem('freample_favoris') || '[]');
      setFavoris(fav.length > 0 ? fav : DEMO_FAVORIS);
    } catch { setFavoris(DEMO_FAVORIS); }
  }, []);

  const removeFavori = (id) => {
    const updated = favoris.filter(f => f.id !== id);
    setFavoris(updated);
    localStorage.setItem('freample_favoris', JSON.stringify(updated));
  };

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${DS.border}`, padding: '16px clamp(20px,4vw,40px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: DS.ink, margin: 0, letterSpacing: '-0.03em' }}>Bonjour, {prenom} 👋</h1>
            <p style={{ fontSize: 13, color: DS.muted, margin: '2px 0 0' }}>Votre espace client Freample</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/')} style={{ ...BTN, background: '#2C2520' }}
              onMouseEnter={e => e.currentTarget.style.background = '#A68B4B'} onMouseLeave={e => e.currentTarget.style.background = '#2C2520'}>
              📋 Proposer un projet
            </button>
            <button onClick={() => navigate('/btp')} style={{ ...BTN, background: 'transparent', color: DS.ink, border: `1px solid ${DS.border}` }}>
              🔍 Trouver un artisan
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px clamp(20px,4vw,40px)' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', borderBottom: `1px solid ${DS.border}`, paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#2C2520' : 'transparent'}`, fontSize: 13, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? DS.ink : DS.muted, cursor: 'pointer', fontFamily: DS.font, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ═══ SUIVI DE PROJETS ═══ */}
        {tab === 'projets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Mes projets ({projets.length})</h2>
              <button onClick={() => navigate('/')} style={BTN}>+ Nouveau projet</button>
            </div>
            {projets.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Aucun projet</div>
                <div style={{ fontSize: 13, color: DS.muted, marginBottom: 16 }}>Publiez votre premier projet pour recevoir des offres d'artisans.</div>
                <button onClick={() => navigate('/')} style={BTN}>Proposer un projet</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projets.map(p => {
                  const st = STATUT_PROJET[p.statut] || STATUT_PROJET.publie;
                  return (
                    <div key={p.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 16, borderLeft: `4px solid ${st.color}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 700 }}>{p.metier} — {p.titre || p.description?.slice(0, 40)}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: st.color, background: st.bg, padding: '2px 8px', borderRadius: 6 }}>{st.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: DS.muted }}>
                          📍 {p.ville} · 💰 {p.budget || p.budget_ajuste || '?'}€ · {p.urgence === 'urgent' ? '🚨 Urgent' : p.urgence === 'flexible' ? '🕐 Flexible' : '📅 Normal'}
                        </div>
                        {p.artisan && <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 600, marginTop: 4 }}>🔨 Artisan : {p.artisan}</div>}
                        <div style={{ fontSize: 11, color: DS.muted, marginTop: 2 }}>Publié le {new Date(p.date || p.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {p.nbOffres > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>{p.nbOffres} offre{p.nbOffres > 1 ? 's' : ''}</div>}
                        <div style={{ fontSize: 11, color: DS.muted }}>Commission (1%) : {p.commission || Math.max(1, Math.round((p.budget || 0) * 0.01))}€</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ PAIEMENTS ═══ */}
        {tab === 'paiements' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Paiements</h2>
            {paiements.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 48, color: DS.muted }}>Aucun paiement pour le moment.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {paiements.map(p => (
                  <div key={p.id} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{p.projetTitre}</div>
                      <div style={{ fontSize: 12, color: DS.muted }}>🔨 {p.artisan} · {new Date(p.date).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{p.total}€</div>
                      <div style={{ fontSize: 10, color: DS.muted }}>{p.montant}€ + {p.commission}€ commission</div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: p.statut === 'paye' ? '#16A34A' : '#D97706', background: p.statut === 'paye' ? '#F0FDF4' : '#FFFBEB', padding: '2px 6px', borderRadius: 4 }}>
                        {p.statut === 'paye' ? '✓ Payé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ MESSAGERIE ═══ */}
        {tab === 'messagerie' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Messagerie</h2>
            {messages.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 48, color: DS.muted }}>Aucune conversation.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map(m => (
                  <div key={m.id} onClick={() => navigate('/client/messagerie')}
                    style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2C2520'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {m.artisan.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{m.artisan}</div>
                      <div style={{ fontSize: 12, color: DS.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.dernier}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: DS.muted }}>{new Date(m.date).toLocaleDateString('fr-FR')}</div>
                      {m.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#DC2626', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginTop: 4 }}>{m.unread}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ ARTISANS FAVORIS ═══ */}
        {tab === 'favoris' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Artisans favoris ({favoris.length})</h2>
            {favoris.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Aucun favori</div>
                <div style={{ fontSize: 13, color: DS.muted, marginBottom: 16 }}>Ajoutez des artisans en favoris depuis la page de recherche.</div>
                <button onClick={() => navigate('/btp')} style={BTN}>Trouver un artisan</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {favoris.map(f => (
                  <div key={f.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                      {f.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{f.nom}</div>
                      <div style={{ fontSize: 12, color: DS.muted }}>{f.metier} · {f.ville}</div>
                      <div style={{ fontSize: 12, color: '#D97706', marginTop: 2 }}>⭐ {f.note} ({f.nbAvis} avis)</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button onClick={() => navigate(`/btp?metier=${f.metier}`)} style={{ padding: '6px 12px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Contacter</button>
                      <button onClick={() => removeFavori(f.id)} style={{ padding: '6px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Retirer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ MON PROFIL ═══ */}
        {tab === 'profil' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Mon profil</h2>
            <div style={{ ...CARD }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
                  {(user?.nom || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{user?.nom || 'Utilisateur'}</div>
                  <div style={{ fontSize: 13, color: DS.muted }}>{user?.email || '—'}</div>
                  <div style={{ fontSize: 11, color: '#A68B4B', fontWeight: 600, marginTop: 2 }}>Compte client</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Projets publiés', value: projets.length },
                  { label: 'Artisans favoris', value: favoris.length },
                  { label: 'Messages', value: messages.length },
                ].map(k => (
                  <div key={k.label} style={{ background: '#F8F7F4', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: DS.muted }}>{k.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
