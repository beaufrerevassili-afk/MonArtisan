import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DS from '../../design/ds';
import DevisFormulaire from '../../components/DevisFormulaire';

const CARD = { background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 14, padding: '16px 20px' };
const BTN = { padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' };

const URGENCE_LABELS = { urgent: { label: 'Urgent (48h)', color: '#DC2626' }, normal: { label: 'Normal', color: '#D97706' }, flexible: { label: 'Flexible', color: '#16A34A' } };

const DEMO_PROJETS = [
  { id: 1, metier: 'Plomberie', titre: 'Rénovation salle de bain', description: 'Douche à l\'italienne, nouveau carrelage, meuble vasque. Surface 6m².', ville: 'Marseille', budget: 3500, urgence: 'normal', statut: 'publie', date: '2026-04-06', clientNom: 'Marie D.', nbOffres: 1 },
  { id: 2, metier: 'Électricité', titre: 'Mise aux normes tableau électrique', description: 'Tableau vétuste à remplacer. Appartement T3, années 70.', ville: 'Marseille', budget: 800, urgence: 'urgent', statut: 'publie', date: '2026-04-07', clientNom: 'Thomas P.', nbOffres: 0 },
  { id: 3, metier: 'Peinture', titre: 'Peinture complète T2', description: 'Murs + plafonds, 2 chambres + salon + couloir. Environ 60m².', ville: 'Aix-en-Provence', budget: 2200, urgence: 'flexible', statut: 'publie', date: '2026-04-05', clientNom: 'Sophie L.', nbOffres: 2 },
  { id: 4, metier: 'Maçonnerie', titre: 'Mur de clôture jardin', description: 'Construction mur parpaing 15m linéaire, hauteur 1m80, enduit.', ville: 'Aubagne', budget: 4500, urgence: 'normal', statut: 'publie', date: '2026-04-04', clientNom: 'Henri M.', nbOffres: 0 },
  { id: 5, metier: 'Plomberie', titre: 'Fuite sous évier cuisine', description: 'Fuite importante sous évier, intervention rapide souhaitée.', ville: 'Marseille', budget: 200, urgence: 'urgent', statut: 'publie', date: '2026-04-08', clientNom: 'Claire F.', nbOffres: 0 },
  { id: 6, metier: 'Carrelage', titre: 'Pose carrelage terrasse', description: 'Terrasse 25m², carrelage extérieur antidérapant.', ville: 'Cassis', budget: 3000, urgence: 'flexible', statut: 'publie', date: '2026-04-03', clientNom: 'Jean R.', nbOffres: 1 },
];

export default function ProjetsClients() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalView, setModalView] = useState('detail');
  const [rdvForm, setRdvForm] = useState({ date: '', heure: '09:00', lieu: '', message: '' });
  const [filtreMet, setFiltreMet] = useState('');
  const [showMesDevis, setShowMesDevis] = useState(false);
  const [voirDevisId, setVoirDevisId] = useState(null);
  const tokenVal = localStorage.getItem('token');
  const isDemo = tokenVal && tokenVal.endsWith('.dev');
  const [mesOffres, setMesOffres] = useState(() => {
    try { return JSON.parse(localStorage.getItem('freample_offres') || '[]'); } catch { return []; }
  });

  // Charger les projets
  useEffect(() => {
    if (isDemo) {
      try {
        const local = JSON.parse(localStorage.getItem('freample_projets') || '[]').filter(p => p.statut === 'publie');
        setProjets(local.length > 0 ? local : DEMO_PROJETS);
      } catch { setProjets(DEMO_PROJETS); }
      setLoading(false);
      return;
    }
    // Vrais comptes → API backend
    api.get('/projets/disponibles').then(({ data }) => {
      if (data.projets?.length) {
        setProjets(data.projets.map(p => ({
          id: p.id, metier: p.metier, titre: p.titre, description: p.description,
          ville: p.ville, budget: Number(p.budget_estime) || 0, urgence: p.urgence,
          statut: p.statut, date: p.created_at?.slice(0, 10), clientNom: p.client_nom || '',
          nbOffres: Number(p.nb_offres) || 0,
        })));
      } else { setProjets([]); }
    }).catch(() => { setProjets([]); }).finally(() => setLoading(false));
    // Charger mes offres envoyées
    api.get('/projets/mes-offres').then(({ data }) => {
      if (data.offres) {
        setMesOffres(data.offres.map(o => ({
          id: o.id, projetId: o.projet_id, artisanNom: o.artisan_nom || user?.nom,
          prix: Number(o.prix_propose) || 0, statut: o.statut, createdAt: o.created_at,
        })));
      }
    }).catch(() => {});
  }, []);

  // Filtrer par métiers du patron + filtre UI
  const profilPatron = (() => { try { return JSON.parse(localStorage.getItem('freample_profil_patron') || '{}'); } catch { return {}; } })();
  const metiersPatron = (profilPatron.metiers || []).map(m => m.toLowerCase());

  const filtered = projets.filter(p => {
    if (metiersPatron.length > 0 && !metiersPatron.some(m => (p.metier || '').toLowerCase().includes(m) || m.includes((p.metier || '').toLowerCase()))) return false;
    if (filtreMet && p.metier !== filtreMet) return false;
    return true;
  });

  const metiers = [...new Set(projets.filter(p => metiersPatron.length === 0 || metiersPatron.some(m => (p.metier || '').toLowerCase().includes(m))).map(p => p.metier))];

  // Vérifier si j'ai une offre ACTIVE sur ce projet (exclure les retirées)
  function dejaPostule(projetId) {
    return mesOffres.some(o => o.projetId === projetId && o.statut !== 'retiree');
  }

  // Toutes mes offres (actives + retirées) pour le récap
  const offresActives = mesOffres.filter(o => o.statut !== 'retiree');
  const offresRetirees = mesOffres.filter(o => o.statut === 'retiree');

  // Lire les devis complets depuis localStorage
  function getDevisComplets() {
    try { return JSON.parse(localStorage.getItem('freample_devis') || '[]'); } catch { return []; }
  }

  // Trouver le projet correspondant à une offre
  function getProjetForOffre(offre) {
    return [...projets, ...DEMO_PROJETS].find(p => p.id === offre.projetId);
  }

  // Retirer une offre
  function retirerOffre(offre) {
    // 1. Marquer l'offre comme retirée
    const updatedOffres = mesOffres.map(o => o.id === offre.id ? { ...o, statut: 'retiree' } : o);
    setMesOffres(updatedOffres);
    try { localStorage.setItem('freample_offres', JSON.stringify(updatedOffres)); } catch {}

    // 2. Passer le devis lié en statut retire_marketplace
    try {
      const devis = JSON.parse(localStorage.getItem('freample_devis') || '[]');
      const updated = devis.map(d => d.projetId === offre.projetId && d.statut === 'envoye' && d.source === 'marketplace'
        ? { ...d, statut: 'retire_marketplace' } : d);
      localStorage.setItem('freample_devis', JSON.stringify(updated));
    } catch {}

    // 3. Décrémenter nbOffres sur le projet
    setProjets(prev => prev.map(p => p.id === offre.projetId ? { ...p, nbOffres: Math.max(0, (p.nbOffres || 1) - 1) } : p));
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }} /></div>;

  return (
    <div style={{ padding: 28, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Marketplace</h1>
        <p style={{ fontSize: 13, color: DS.muted, margin: 0 }}>
          {filtered.length} projet{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres métiers */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setFiltreMet('')} style={{ padding: '6px 14px', background: !filtreMet ? '#2C2520' : 'transparent', color: !filtreMet ? '#F5EFE0' : DS.muted, border: `1px solid ${!filtreMet ? '#2C2520' : DS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>Tous</button>
        {metiers.map(m => (
          <button key={m} onClick={() => setFiltreMet(filtreMet === m ? '' : m)}
            style={{ padding: '6px 14px', background: filtreMet === m ? '#2C2520' : 'transparent', color: filtreMet === m ? '#F5EFE0' : DS.muted, border: `1px solid ${filtreMet === m ? '#2C2520' : DS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>
            {m}
          </button>
        ))}
      </div>

      {/* Info bulle marketplace */}
      <div style={{ padding: '10px 14px', background: '#EFF6FF', border: '1px solid #2563EB30', borderRadius: 10, marginBottom: 16, fontSize: 12, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
        <span>Envoyez votre devis — le client compare les offres reçues et choisit l'artisan. Commission Freample : 1%.</span>
      </div>

      {/* ══ BANDEAU RECAP MES DEVIS ══ */}
      {mesOffres.length > 0 && (
        <div
          onClick={() => { setShowMesDevis(true); setVoirDevisId(null); }}
          style={{
            padding: '12px 16px', background: '#fff', border: '1px solid #A68B4B',
            borderLeft: '4px solid #A68B4B', borderRadius: 10, marginBottom: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(166,139,75,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#A68B4B15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A68B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2C2520' }}>
                Vous avez envoyé {offresActives.length} devis{offresActives.length > 1 ? '' : ''}
                {offresRetirees.length > 0 && <span style={{ fontSize: 12, color: DS.muted, fontWeight: 500 }}> · {offresRetirees.length} retiré{offresRetirees.length > 1 ? 's' : ''}</span>}
              </div>
              <div style={{ fontSize: 11, color: DS.muted, marginTop: 1 }}>
                {offresActives.length > 0 ? `${offresActives.length} en attente de réponse client` : 'Aucun devis actif'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#A68B4B', fontWeight: 600, flexShrink: 0 }}>Voir mes devis →</div>
        </div>
      )}

      {/* ══ MODAL MES DEVIS (zoom) ══ */}
      {showMesDevis && (
        <div
          onClick={() => { setShowMesDevis(false); setVoirDevisId(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn .2s ease-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 20, padding: '28px 24px',
              width: '92%', maxWidth: 700, maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              animation: 'zoomIn .25s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Mes devis envoyés</h2>
              <button onClick={() => { setShowMesDevis(false); setVoirDevisId(null); }}
                style={{ background: '#F2F2F7', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6E6E73' }}>
                Fermer
              </button>
            </div>

            {/* Détail d'un devis spécifique */}
            {voirDevisId && (() => {
              const devis = getDevisComplets().find(d => d.id === voirDevisId);
              if (!devis) return <div style={{ fontSize: 13, color: DS.muted }}>Devis introuvable</div>;
              return (
                <div>
                  <button onClick={() => setVoirDevisId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 14, fontFamily: DS.font }}>← Retour à la liste</button>
                  <div style={{ background: '#F8F7F4', borderRadius: 14, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#2C2520' }}>{devis.numero}</div>
                        <div style={{ fontSize: 12, color: DS.muted, marginTop: 2 }}>{devis.objet || devis.client}</div>
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                        background: devis.statut === 'envoye' ? '#FFFBEB' : '#F2F2F7',
                        color: devis.statut === 'envoye' ? '#D97706' : '#6E6E73',
                      }}>
                        {devis.statut === 'envoye' ? 'En attente' : devis.statut === 'retire_marketplace' ? 'Retiré' : devis.statut}
                      </div>
                    </div>

                    {/* Infos */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 16 }}>
                      {[
                        ['Client', devis.client || '—'],
                        ['Date', devis.date ? new Date(devis.date).toLocaleDateString('fr-FR') : '—'],
                        ['Montant HT', `${(devis.montantHT || 0).toLocaleString('fr-FR')}€`],
                        ['Montant TTC', `${(devis.montantTTC || 0).toLocaleString('fr-FR')}€`],
                      ].map(([k, v]) => (
                        <div key={k} style={{ background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
                          <div style={{ fontSize: 10, color: DS.muted }}>{k}</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Lignes du devis */}
                    {(devis.lignes || []).length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#2C2520' }}>Détail des lignes</div>
                        <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #E8E6E1' }}>
                          {devis.lignes.map((l, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: i < devis.lignes.length - 1 ? '1px solid #F2F2F7' : 'none', fontSize: 12 }}>
                              <div style={{ flex: 1, color: '#333' }}>{l.desc || l.description || '—'}</div>
                              <div style={{ color: DS.muted, marginRight: 10 }}>{l.qte || 1} × {(l.pu || l.prixUnitaire || 0).toLocaleString('fr-FR')}€</div>
                              <div style={{ fontWeight: 700, color: '#2C2520' }}>{((l.qte || 1) * (l.pu || l.prixUnitaire || 0)).toLocaleString('fr-FR')}€</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lots */}
                    {(devis.lots || []).length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#2C2520' }}>Lots</div>
                        {devis.lots.map((lot, li) => (
                          <div key={li} style={{ background: '#fff', borderRadius: 10, padding: '10px 14px', border: '1px solid #E8E6E1', marginBottom: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{lot.nom || `Lot ${li + 1}`}</div>
                            {(lot.lignes || []).map((l, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: i < lot.lignes.length - 1 ? '1px solid #F8F7F4' : 'none' }}>
                                <span style={{ color: '#333' }}>{l.desc || l.description}</span>
                                <span style={{ fontWeight: 600 }}>{((l.qte || 1) * (l.pu || l.prixUnitaire || 0)).toLocaleString('fr-FR')}€</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Totaux */}
                    <div style={{ background: '#2C2520', borderRadius: 10, padding: '14px 16px', color: '#F5EFE0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Total TTC</div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>{(devis.montantTTC || 0).toLocaleString('fr-FR')}€</div>
                    </div>

                    {devis.conditions && (
                      <div style={{ marginTop: 12, fontSize: 11, color: DS.muted, lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 600 }}>Conditions : </span>{devis.conditions}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Liste des offres */}
            {!voirDevisId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mesOffres.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 32, color: DS.muted, fontSize: 13 }}>Aucun devis envoyé pour l'instant</div>
                )}
                {mesOffres.map(offre => {
                  const projet = getProjetForOffre(offre);
                  const isActive = offre.statut !== 'retiree';
                  const devisLie = getDevisComplets().find(d => d.projetId === offre.projetId && d.source === 'marketplace' && (isActive ? d.statut === 'envoye' : d.statut === 'retire_marketplace'));
                  return (
                    <div key={offre.id} style={{
                      background: '#fff', border: `1px solid ${isActive ? '#E8E6E1' : '#E8E6E140'}`,
                      borderLeft: `4px solid ${isActive ? '#A68B4B' : '#ccc'}`,
                      borderRadius: 12, padding: '14px 16px', opacity: isActive ? 1 : 0.6,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#2C2520' }}>{projet?.titre || projet?.description?.slice(0, 40) || 'Projet'}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                              background: isActive ? '#FFFBEB' : '#F2F2F7',
                              color: isActive ? '#D97706' : '#6E6E73',
                            }}>
                              {isActive ? 'En attente' : 'Retiré'}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: DS.muted }}>
                            {projet?.metier || '—'} · {projet?.clientNom || '—'} · {projet?.ville || '—'}
                          </div>
                          <div style={{ fontSize: 11, color: DS.muted, marginTop: 2 }}>
                            Envoyé le {new Date(offre.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: isActive ? '#A68B4B' : '#999' }}>{(offre.prix || 0).toLocaleString('fr-FR')}€</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {devisLie && (
                          <button onClick={() => setVoirDevisId(devisLie.id)}
                            style={{ padding: '6px 14px', background: '#F8F7F4', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#2C2520', fontFamily: DS.font }}>
                            Voir le devis
                          </button>
                        )}
                        {isActive && (
                          <button onClick={() => {
                            if (window.confirm('Retirer cette offre ? Le client ne verra plus votre devis. Vous pourrez en renvoyer un nouveau.')) {
                              retirerOffre(offre);
                            }
                          }}
                            style={{ padding: '6px 14px', background: '#FEF2F2', border: '1px solid #DC262640', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#DC2626', fontFamily: DS.font }}>
                            Retirer l'offre
                          </button>
                        )}
                        {!isActive && (
                          <span style={{ fontSize: 11, color: DS.muted, padding: '6px 0' }}>
                            Vous pouvez renvoyer un nouveau devis sur ce projet
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Liste des projets */}
      {filtered.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 48 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F0F0F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Aucun projet dans votre zone</div>
          <div style={{ fontSize: 13, color: DS.muted }}>Aucun projet disponible pour le moment. Les clients publient régulièrement de nouveaux projets.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(p => {
            const urg = URGENCE_LABELS[p.urgence] || URGENCE_LABELS.normal;
            const deja = dejaPostule(p.id);
            return (
              <div key={p.id}
                onClick={() => { if (!deja) { setSelected(p); setModalView('detail'); } }}
                style={{
                  ...CARD, cursor: deja ? 'default' : 'pointer', display: 'flex', gap: 16, alignItems: 'center',
                  transition: 'all .15s', borderLeft: `4px solid ${deja ? '#16A34A' : urg.color}`,
                  opacity: deja ? 0.75 : 1,
                }}
                onMouseEnter={e => { if (!deja) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{p.titre || p.description?.slice(0, 40)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: urg.color, background: urg.color + '15', padding: '2px 8px', borderRadius: 4 }}>{urg.label}</span>
                    {deja && <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '2px 8px', borderRadius: 4 }}>Devis envoyé</span>}
                  </div>
                  <div style={{ fontSize: 12, color: DS.muted, marginBottom: 4 }}>{p.description?.slice(0, 80)}{p.description?.length > 80 ? '...' : ''}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: DS.muted, flexWrap: 'wrap' }}>
                    <span>{p.metier}</span>
                    <span>{p.ville || 'Marseille'}</span>
                    <span>{p.clientNom || 'Client'}</span>
                    <span>{(p.nbOffres || 0)} offre{(p.nbOffres || 0) > 1 ? 's' : ''} reçue{(p.nbOffres || 0) > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2C2520' }}>{(p.budget || 0).toLocaleString('fr-FR')}€</div>
                  <div style={{ fontSize: 10, color: DS.muted }}>budget client</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ MODAL DÉTAIL PROJET ══ */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            {/* Header */}
            <div style={{ background: '#2C2520', padding: '20px 24px', borderRadius: '16px 16px 0 0', color: '#F5EFE0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#A68B4B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{selected.metier}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.titre || selected.description?.slice(0, 50)}</div>
                  <div style={{ fontSize: 12, color: 'rgba(245,239,224,0.6)', marginTop: 4 }}>
                    {selected.ville || 'Marseille'} · {selected.clientNom || 'Client'}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 30, height: 30, color: '#F5EFE0', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>

              {/* ── VUE DÉTAIL ── */}
              {modalView === 'detail' && <>
                {/* Description */}
                <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7, marginBottom: 16, padding: '12px 14px', background: '#F8F7F4', borderRadius: 10 }}>
                  {selected.description}
                </div>

                {/* Infos clés */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 16 }}>
                  {[
                    ['Budget client', `${(selected.budget || 0).toLocaleString('fr-FR')}€`],
                    ['Urgence', URGENCE_LABELS[selected.urgence]?.label || 'Normal'],
                    ['Offres reçues', `${selected.nbOffres || 0}`],
                    ['Commission', `${Math.max(1, Math.round((selected.budget || 0) * 0.01))}€ (1%)`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: '#F8F7F4', padding: '8px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: DS.muted }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Concurrence */}
                {(selected.nbOffres || 0) > 0 && (
                  <div style={{ padding: '10px 14px', background: '#FFFBEB', border: '1px solid #D9770640', borderRadius: 10, marginBottom: 16, fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>⚡</span>
                    <span>{selected.nbOffres} artisan{selected.nbOffres > 1 ? 's' : ''} {selected.nbOffres > 1 ? 'ont' : 'a'} déjà envoyé un devis — démarquez-vous avec un devis détaillé et un bon prix.</span>
                  </div>
                )}

                {/* Décennale manquante */}
                {(() => {
                  let profil = null;
                  try { profil = JSON.parse(localStorage.getItem('freample_profil_patron')); } catch {}
                  return !profil?.decennale?.trim() ? (
                    <div style={{ padding: '10px 14px', background: '#FFF7E0', border: '1px solid #A68B4B40', marginBottom: 16, fontSize: 12, color: '#92400E', borderRadius: 8 }}>
                      Votre assurance décennale n'est pas renseignée. Complétez votre profil pour rassurer les clients.
                    </div>
                  ) : null;
                })()}

                {/* ── 2 ACTIONS SIMPLES ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Action principale : Envoyer mon devis */}
                  <button onClick={() => setModalView('devis')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                      background: '#2C2520', border: 'none', borderRadius: 12,
                      cursor: 'pointer', textAlign: 'left', fontFamily: DS.font, transition: 'all .15s', width: '100%',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(44,37,32,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#A68B4B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#F5EFE0' }}>Envoyer mon devis</div>
                      <div style={{ fontSize: 12, color: 'rgba(245,239,224,0.6)', marginTop: 2 }}>Le client comparera avec les autres offres et choisira</div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A68B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>

                  {/* Action secondaire : Proposer un RDV */}
                  <button onClick={() => { setRdvForm({ date: '', heure: '09:00', lieu: '', message: '' }); setModalView('rdv'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                      background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 12,
                      cursor: 'pointer', textAlign: 'left', fontFamily: DS.font, transition: 'all .15s', width: '100%',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#A68B4B'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F8F7F4', color: '#2C2520', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C2520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#2C2520' }}>Proposer un RDV d'estimation</div>
                      <div style={{ fontSize: 12, color: DS.muted, marginTop: 2 }}>Visiter le chantier avant de chiffrer</div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>

                {/* Fonctionnement */}
                <div style={{ marginTop: 16, padding: '12px 14px', background: '#F8F7F4', borderRadius: 10, fontSize: 11, color: DS.muted, lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, color: '#2C2520', fontSize: 12 }}>Comment ça marche ?</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>1. Vous envoyez votre devis au client</div>
                    <div>2. Le client reçoit et compare toutes les offres</div>
                    <div>3. Le client choisit l'artisan qui lui convient</div>
                    <div>4. Vous êtes notifié → le chantier se crée automatiquement</div>
                  </div>
                </div>
              </>}

              {/* ── FORMULAIRE DEVIS ── */}
              {modalView === 'devis' && (
                <div>
                  <button onClick={() => setModalView('detail')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 12, fontFamily: DS.font }}>← Retour au projet</button>
                  <DevisFormulaire
                    clientNom={selected.clientNom || selected.client_nom || ''}
                    missionTitre={`${selected.metier} — ${selected.titre || selected.description?.slice(0, 50) || ''}`}
                    entreprise={(() => {
                      try {
                        const p = JSON.parse(localStorage.getItem('freample_profil_patron') || '{}');
                        return { nom: p.nom || '', adresse: p.adresse || '', siret: p.siret || '', decennale: p.decennale || '', email: p.email || '', tel: p.telephone || '' };
                      } catch { return {}; }
                    })()}
                    compact={false}
                    onSoumettre={async (devisData) => {
                      if (!isDemo) {
                        // Backend — envoyer l'offre via API
                        try {
                          await api.post(`/projets/${selected.id}/offre`, {
                            prixPropose: devisData.totalTTC,
                            message: devisData.objet || '',
                          });
                          // Recharger les offres
                          api.get('/projets/mes-offres').then(({ data }) => {
                            if (data.offres) setMesOffres(data.offres.map(o => ({
                              id: o.id, projetId: o.projet_id, artisanNom: o.artisan_nom || user?.nom,
                              prix: Number(o.prix_propose) || 0, statut: o.statut, createdAt: o.created_at,
                            })));
                          }).catch(() => {});
                        } catch {}
                      } else {
                        // Démo — localStorage
                        const offre = { id: Date.now(), projetId: selected.id, artisanNom: user?.nom, prix: devisData.totalTTC, statut: 'proposee', createdAt: new Date().toISOString() };
                        try {
                          const offres = JSON.parse(localStorage.getItem('freample_offres') || '[]');
                          offres.push(offre);
                          localStorage.setItem('freample_offres', JSON.stringify(offres));
                          setMesOffres(offres);
                        } catch {}
                      }
                      // Sauver le devis complet (localStorage pour les deux, backend à venir)
                      try {
                        const devis = JSON.parse(localStorage.getItem('freample_devis') || '[]');
                        const nextNum = devis.length + 1;
                        devis.push({
                          id: Date.now(), numero: `DEV-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`,
                          projetId: selected.id,
                          client: devisData.client?.nom || selected.clientNom, clientEmail: devisData.client?.email || '',
                          objet: devisData.objet, lignes: devisData.lignes,
                          montantHT: devisData.totalHT, tva: devisData.totalTVA, montantTTC: devisData.totalTTC,
                          date: new Date().toISOString().slice(0, 10), statut: 'envoye', source: 'marketplace',
                        });
                        localStorage.setItem('freample_devis', JSON.stringify(devis));
                      } catch {}
                      setProjets(prev => prev.map(p => p.id === selected.id ? { ...p, nbOffres: (p.nbOffres || 0) + 1 } : p));
                      setModalView('sent');
                    }}
                    onAnnuler={() => setModalView('detail')}
                  />
                </div>
              )}

              {/* ── PROPOSER RDV ── */}
              {modalView === 'rdv' && <>
                <button onClick={() => setModalView('detail')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 12, fontFamily: DS.font }}>← Retour au projet</button>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Proposer un rendez-vous d'estimation</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Date *</label>
                    <input type="date" value={rdvForm.date} onChange={e => setRdvForm(f => ({ ...f, date: e.target.value }))} style={INP} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Heure</label>
                    <input type="time" value={rdvForm.heure} onChange={e => setRdvForm(f => ({ ...f, heure: e.target.value }))} style={INP} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Lieu</label>
                    <input value={rdvForm.lieu} onChange={e => setRdvForm(f => ({ ...f, lieu: e.target.value }))} placeholder="Adresse du chantier" style={INP} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Message</label>
                    <textarea value={rdvForm.message} onChange={e => setRdvForm(f => ({ ...f, message: e.target.value }))} rows={2}
                      placeholder="Je souhaite visiter le chantier pour vous établir un devis précis..."
                      style={{ ...INP, resize: 'vertical' }} />
                  </div>
                </div>
                <button onClick={async () => {
                  if (!isDemo) {
                    try {
                      await api.post(`/projets/${selected.id}/offre`, {
                        prixPropose: 0,
                        message: `RDV proposé le ${rdvForm.date} à ${rdvForm.heure}${rdvForm.lieu ? ' — ' + rdvForm.lieu : ''}${rdvForm.message ? '. ' + rdvForm.message : ''}`,
                        dateProposee: rdvForm.date,
                      });
                    } catch {}
                  } else {
                    try {
                      const rdvs = JSON.parse(localStorage.getItem('freample_rdv') || '[]');
                      rdvs.push({ id: Date.now(), projetId: selected.id, client: selected.clientNom || selected.client_nom, ...rdvForm, statut: 'propose', createdAt: new Date().toISOString() });
                      localStorage.setItem('freample_rdv', JSON.stringify(rdvs));
                    } catch {}
                  }
                  setModalView('sent');
                }} disabled={!rdvForm.date}
                  style={{ ...BTN, width: '100%', marginTop: 14, padding: 14, fontSize: 14, opacity: rdvForm.date ? 1 : 0.5 }}>
                  Proposer ce rendez-vous
                </button>
              </>}

              {/* ── CONFIRMATION ── */}
              {modalView === 'sent' && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F0FDF4', border: '2px solid #16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Proposition envoyée !</div>
                  <div style={{ fontSize: 13, color: DS.muted, marginBottom: 6, lineHeight: 1.5 }}>
                    Le client va comparer votre offre avec les autres artisans.
                  </div>
                  <div style={{ fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 20 }}>
                    Vous serez notifié si le client vous choisit.
                  </div>
                  <div style={{ padding: '12px 16px', background: '#F8F7F4', borderRadius: 10, marginBottom: 20, textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#2C2520', marginBottom: 6 }}>Prochaines étapes :</div>
                    <div style={{ fontSize: 12, color: DS.muted, lineHeight: 1.6 }}>
                      <div>1. Le client reçoit votre devis dans son espace</div>
                      <div>2. Il compare avec les {selected.nbOffres || 0} autre{(selected.nbOffres || 0) > 1 ? 's' : ''} offre{(selected.nbOffres || 0) > 1 ? 's' : ''}</div>
                      <div>3. S'il vous choisit → notification + chantier créé automatiquement</div>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ ...BTN, padding: '12px 32px', fontSize: 14 }}>
                    Retour aux projets
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animations CSS */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
