import React, { useState, useEffect } from 'react';
import { API_URL } from '../../services/api';

const CARD = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: 20 };

function StarRating({ note, size = 14 }) {
  return <span style={{ display: 'inline-flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(note) ? '#F59E0B' : '#E8E6E1', fontSize: size }}>★</span>)}
  </span>;
}

export default function ProfilEntreprise({ patronId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoZoom, setPhotoZoom] = useState(null);

  useEffect(() => {
    if (!patronId) return;
    fetch(`${API_URL}/entreprise/${patronId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patronId]);

  if (!patronId) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#FAFAF8', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#636363' }}>Chargement...</div>
        ) : !data?.entreprise ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#636363' }}>Profil introuvable</div>
            <button onClick={onClose} style={{ marginTop: 16, padding: '8px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Fermer</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #E8E6E1', position: 'relative' }}>
              <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#F2F2F7', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#636363', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {data.entreprise.photoProfil ? (
                  <img src={data.entreprise.photoProfil} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E8E6E1' }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800 }}>
                    {(data.entreprise.nom || '?')[0]}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>{data.entreprise.nom}</div>
                  <div style={{ fontSize: 13, color: '#636363', marginTop: 2 }}>
                    {data.entreprise.ville || 'Marseille'} · {data.entreprise.metier || 'BTP'}
                  </div>
                  {data.noteMoyenne && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <StarRating note={data.noteMoyenne} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{data.noteMoyenne}/5</span>
                      <span style={{ fontSize: 12, color: '#636363' }}>({data.nbAvis} avis)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Description */}
              {data.profil?.description && (
                <div style={{ ...CARD, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>A propos</div>
                  <div style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.7 }}>{data.profil.description}</div>
                  {data.profil.specialites && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      {data.profil.specialites.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                        <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', background: '#F5EFE0', color: '#7A6232', borderRadius: 6 }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Infos */}
              {(data.profil?.zoneIntervention || data.profil?.anneeCreation || data.profil?.effectif) && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {data.profil.zoneIntervention && <span style={{ fontSize: 12, padding: '4px 10px', background: '#EFF6FF', color: '#1565C0', borderRadius: 6 }}>{data.profil.zoneIntervention}</span>}
                  {data.profil.anneeCreation && <span style={{ fontSize: 12, padding: '4px 10px', background: '#F0FDF4', color: '#16A34A', borderRadius: 6 }}>Depuis {data.profil.anneeCreation}</span>}
                  {data.profil.effectif && <span style={{ fontSize: 12, padding: '4px 10px', background: '#FFFBEB', color: '#D97706', borderRadius: 6 }}>{data.profil.effectif}</span>}
                </div>
              )}

              {/* Certifications */}
              {data.profil?.certifications?.length > 0 && (
                <div style={{ ...CARD, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Certifications & garanties</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {data.profil.certifications.map(c => (
                      <span key={c} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', background: '#D1F2E0', color: '#1A7F43', borderRadius: 6 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {data.profil?.photos?.length > 0 && (
                <div style={{ ...CARD, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Realisations</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {data.profil.photos.map((photo, i) => (
                      <img key={i} src={photo} alt={`Realisation ${i + 1}`} onClick={() => setPhotoZoom(photo)}
                        style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '1px solid #E8E6E1' }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Avis */}
              {data.avis?.length > 0 && (
                <div style={{ ...CARD }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Avis clients ({data.nbAvis})</div>
                  {data.avis.slice(0, 5).map(a => (
                    <div key={a.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #F2F2F7' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <StarRating note={a.note} size={12} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{a.clientNom}</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#636363' }}>{a.creeLe ? new Date(a.creeLe).toLocaleDateString('fr-FR') : ''}</span>
                      </div>
                      {a.projetTitre && <div style={{ fontSize: 11, color: '#A68B4B', marginBottom: 4 }}>{a.projetTitre}</div>}
                      <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6 }}>{a.commentaire}</div>
                      {a.reponsePatron && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#F8F7F4', borderRadius: 8, borderLeft: '3px solid #A68B4B' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#A68B4B', marginBottom: 2 }}>Reponse de l'entreprise</div>
                          <div style={{ fontSize: 12, color: '#333', lineHeight: 1.5 }}>{a.reponsePatron}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No profile data */}
              {!data.profil && data.avis?.length === 0 && (
                <div style={{ textAlign: 'center', padding: 32, color: '#636363', fontSize: 13 }}>
                  Cette entreprise n'a pas encore complete son profil.
                </div>
              )}
            </div>
          </>
        )}

        {/* Photo zoom */}
        {photoZoom && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => setPhotoZoom(null)}>
            <img src={photoZoom} alt="" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 12 }} />
          </div>
        )}
      </div>
    </div>
  );
}
