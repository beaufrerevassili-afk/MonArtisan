import React, { useState } from 'react';
import DS from '../../design/ds';

/**
 * PV de Réception de Travaux
 * Génère un procès-verbal conforme au Code civil (art. 1792-6)
 *
 * Props:
 * - chantier: { id, titre, description, client, adresse, budgetPrevu, caDevis, dateDebut, dateFin, equipe }
 * - devis: { numero, montantHT, montantTTC, lignes, emetteur, ... } (optionnel)
 * - profilEntreprise: { nom, siret, adresse, decennale, ... }
 * - clientNom: string
 * - onSigner: (pvData) => void — appelé quand le client signe
 * - onRefuser: (motif) => void — appelé si le client refuse
 * - readOnly: boolean — mode consultation
 * - role: 'patron' | 'client'
 */

const CARD = { background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 14, padding: '16px 20px' };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

export default function PVReception({ chantier, devis, profilEntreprise, clientNom, onSigner, onRefuser, readOnly, role, pvExistant }) {
  const [mode, setMode] = useState(pvExistant ? 'consultation' : 'edition'); // edition | reserves | signature | consultation
  const [reserves, setReserves] = useState(pvExistant?.reserves || []);
  const [newReserve, setNewReserve] = useState('');
  const [sansReserve, setSansReserve] = useState(pvExistant ? pvExistant.reserves?.length === 0 : true);
  const [refusMotif, setRefusMotif] = useState('');
  const [showRefus, setShowRefus] = useState(false);
  const [signed, setSigned] = useState(!!pvExistant?.dateSignature);

  const entreprise = profilEntreprise || {};
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateReception = pvExistant?.dateReception || new Date().toISOString().slice(0, 10);

  const ajouterReserve = () => {
    if (!newReserve.trim()) return;
    setReserves(prev => [...prev, { id: Date.now(), description: newReserve.trim(), corrigee: false }]);
    setNewReserve('');
    setSansReserve(false);
  };

  const supprimerReserve = (id) => {
    const updated = reserves.filter(r => r.id !== id);
    setReserves(updated);
    if (updated.length === 0) setSansReserve(true);
  };

  const pvData = {
    id: pvExistant?.id || 'pv_' + Date.now(),
    chantierId: chantier?.id,
    dateReception,
    dateSignature: null,
    // Maître d'ouvrage (client)
    maitreOuvrage: {
      nom: clientNom || chantier?.client || '',
      adresse: chantier?.adresse || '',
    },
    // Entreprise
    entreprise: {
      nom: entreprise.nom || '',
      siret: entreprise.siret || '',
      adresse: entreprise.adresse || '',
      decennale: entreprise.decennale || '',
    },
    // Chantier
    chantier: {
      adresse: chantier?.adresse || '',
      description: chantier?.titre || chantier?.description || '',
      dateDebut: chantier?.dateDebut || '',
      dateFin: dateReception,
    },
    // Devis de référence
    devisRef: devis?.numero || '',
    montantTTC: devis?.montantTTC || chantier?.caDevis || chantier?.budgetPrevu || 0,
    // Réserves
    sansReserve,
    reserves: sansReserve ? [] : reserves,
    // Garanties
    garanties: {
      parfaitAchevement: { debut: dateReception, duree: '1 an' },
      biennale: { debut: dateReception, duree: '2 ans' },
      decennale: { debut: dateReception, duree: '10 ans' },
    },
  };

  const signerPV = () => {
    pvData.dateSignature = new Date().toISOString();
    pvData.signePar = role;
    setSigned(true);
    if (onSigner) onSigner(pvData);
  };

  const refuserPV = () => {
    if (!refusMotif.trim()) return;
    if (onRefuser) onRefuser(refusMotif.trim());
    setShowRefus(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* En-tête */}
      <div style={{ textAlign: 'center', padding: '20px 16px', background: '#2C2520', borderRadius: 14, color: '#F5EFE0' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A68B4B', marginBottom: 6 }}>Procès-verbal</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Réception de travaux</div>
        <div style={{ fontSize: 12, color: 'rgba(245,239,224,0.6)', marginTop: 6 }}>Article 1792-6 du Code civil</div>
      </div>

      {/* Parties */}
      <div style={CARD}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>Les parties</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ padding: '12px 14px', background: '#F8F7F4', borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#A68B4B', textTransform: 'uppercase', marginBottom: 6 }}>Maître d'ouvrage (client)</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{clientNom || chantier?.client || '—'}</div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{chantier?.adresse || '—'}</div>
          </div>
          <div style={{ padding: '12px 14px', background: '#F8F7F4', borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#A68B4B', textTransform: 'uppercase', marginBottom: 6 }}>Entreprise</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{entreprise.nom || '—'}</div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>SIRET : {entreprise.siret || '—'}</div>
            {entreprise.decennale && <div style={{ fontSize: 11, color: '#16A34A', marginTop: 2, fontWeight: 600 }}>Décennale : {entreprise.decennale}</div>}
          </div>
        </div>
      </div>

      {/* Objet des travaux */}
      <div style={CARD}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>Objet des travaux</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          {[
            ['Chantier', chantier?.titre || chantier?.description || '—'],
            ['Adresse', chantier?.adresse || '—'],
            ['Début', chantier?.dateDebut ? new Date(chantier.dateDebut).toLocaleDateString('fr-FR') : '—'],
            ['Réception', new Date(dateReception).toLocaleDateString('fr-FR')],
            ['Devis réf.', devis?.numero || '—'],
            ['Montant TTC', `${(pvData.montantTTC || 0).toLocaleString('fr-FR')}€`],
          ].map(([k, v]) => (
            <div key={k} style={{ background: '#F8F7F4', padding: '8px 10px', borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Travaux réalisés (lignes du devis) */}
      {devis?.lignes?.length > 0 && (
        <div style={CARD}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#1A1A1A' }}>Travaux réalisés</div>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${DS.border}` }}>
            {devis.lignes.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: i < devis.lignes.length - 1 ? '1px solid #F2F2F7' : 'none', fontSize: 12 }}>
                <span style={{ color: '#333' }}>{l.desc || l.description || '—'}</span>
                <span style={{ fontWeight: 600, color: '#1A1A1A', flexShrink: 0, marginLeft: 10 }}>{((l.qte || l.quantite || 1) * (l.pu || l.prixUnitaire || 0)).toLocaleString('fr-FR')}€</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8F7F4', fontWeight: 700, fontSize: 13 }}>
              <span>Total TTC</span>
              <span>{(pvData.montantTTC || 0).toLocaleString('fr-FR')}€</span>
            </div>
          </div>
        </div>
      )}

      {/* Réserves */}
      {!signed && role === 'client' && (
        <div style={CARD}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>Constat de réception</div>

          {/* Toggle sans réserve */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button onClick={() => { setSansReserve(true); setReserves([]); }}
              style={{ flex: 1, padding: '12px 14px', background: sansReserve ? '#F0FDF4' : '#fff', border: `2px solid ${sansReserve ? '#16A34A' : DS.border}`, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: sansReserve ? '#16A34A' : '#1A1A1A' }}>Sans réserve</div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>Les travaux sont conformes au devis</div>
            </button>
            <button onClick={() => setSansReserve(false)}
              style={{ flex: 1, padding: '12px 14px', background: !sansReserve ? '#FFFBEB' : '#fff', border: `2px solid ${!sansReserve ? '#D97706' : DS.border}`, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: !sansReserve ? '#D97706' : '#1A1A1A' }}>Avec réserves</div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>Des défauts à corriger sous 1 an</div>
            </button>
          </div>

          {/* Liste des réserves */}
          {!sansReserve && (
            <div>
              {reserves.length > 0 && (
                <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {reserves.map((r, i) => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FFFBEB', border: '1px solid #D9770630', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: '#333' }}><strong>Réserve {i + 1} :</strong> {r.description}</div>
                      {!readOnly && <button onClick={() => supprimerReserve(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#DC2626', padding: 4 }}>×</button>}
                    </div>
                  ))}
                </div>
              )}
              {!readOnly && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={newReserve} onChange={e => setNewReserve(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') ajouterReserve(); }}
                    placeholder="Décrivez le défaut constaté..." style={{ ...INP, flex: 1 }} />
                  <button onClick={ajouterReserve}
                    style={{ padding: '10px 16px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    + Ajouter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Réserves en mode consultation */}
      {(signed || role === 'patron' || readOnly) && pvExistant && (
        <div style={CARD}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#1A1A1A' }}>Constat</div>
          {pvExistant.sansReserve ? (
            <div style={{ padding: '12px 14px', background: '#F0FDF4', border: '1px solid #16A34A40', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#16A34A' }}>
              Réception sans réserve — travaux conformes
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(pvExistant.reserves || []).map((r, i) => (
                <div key={r.id || i} style={{ padding: '8px 12px', background: '#FFFBEB', border: '1px solid #D9770630', borderRadius: 8, fontSize: 12, color: '#333' }}>
                  <strong>Réserve {i + 1} :</strong> {r.description}
                  {r.corrigee && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#16A34A' }}>CORRIGÉE</span>}
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#D97706', fontWeight: 600, marginTop: 4 }}>
                L'entreprise dispose d'un an (garantie de parfait achèvement) pour corriger ces réserves.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Garanties légales */}
      <div style={CARD}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#1A1A1A' }}>Garanties légales activées</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { nom: 'Garantie de parfait achèvement', duree: '1 an', desc: 'Réparation de tous les désordres signalés', color: '#2563EB', article: 'Art. 1792-6 C. civ.' },
            { nom: 'Garantie biennale', duree: '2 ans', desc: 'Éléments d\'équipement dissociables', color: '#D97706', article: 'Art. 1792-3 C. civ.' },
            { nom: 'Garantie décennale', duree: '10 ans', desc: 'Solidité et destination de l\'ouvrage', color: '#DC2626', article: 'Art. 1792 C. civ.' },
          ].map(g => (
            <div key={g.nom} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F8F7F4', borderRadius: 8, borderLeft: `4px solid ${g.color}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>{g.nom}</div>
                <div style={{ fontSize: 11, color: '#444' }}>{g.desc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: g.color }}>{g.duree}</div>
                <div style={{ fontSize: 9, color: '#555' }}>{g.article}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#444', marginTop: 10, lineHeight: 1.6 }}>
          Les garanties ci-dessus démarrent à la date de réception ({new Date(dateReception).toLocaleDateString('fr-FR')}). L'assurance décennale de l'entreprise{entreprise.decennale ? ` (n° ${entreprise.decennale})` : ''} couvre les dommages relevant de l'article 1792 du Code civil.
        </div>
      </div>

      {/* Signature / Actions */}
      {!signed && role === 'client' && !readOnly && (
        <div style={CARD}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>Signature</div>
          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6, marginBottom: 16 }}>
            En signant ce procès-verbal, vous confirmez la réception des travaux{sansReserve ? ' sans réserve' : ' avec les réserves listées ci-dessus'}.
            {sansReserve
              ? ' Le solde du paiement sera libéré à l\'artisan.'
              : ' 90% du solde sera libéré. Les 10% restants seront libérés après correction des réserves.'}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={signerPV}
              style={{ flex: 1, padding: '14px 20px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', minWidth: 200 }}>
              Signer le PV de réception
            </button>
            <button onClick={() => setShowRefus(true)}
              style={{ padding: '14px 20px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #DC262640', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Refuser la réception
            </button>
          </div>

          {showRefus && (
            <div style={{ marginTop: 12, padding: '14px 16px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #DC262640' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>Motif du refus</div>
              <textarea value={refusMotif} onChange={e => setRefusMotif(e.target.value)} rows={3}
                placeholder="Décrivez pourquoi vous refusez la réception des travaux..."
                style={{ ...INP, resize: 'vertical', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={refuserPV} disabled={!refusMotif.trim()}
                  style={{ padding: '8px 18px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: refusMotif.trim() ? 1 : 0.5 }}>
                  Confirmer le refus
                </button>
                <button onClick={() => setShowRefus(false)}
                  style={{ padding: '8px 18px', background: 'transparent', color: '#444', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PV signé */}
      {signed && (
        <div style={{ textAlign: 'center', padding: '24px 16px', background: '#F0FDF4', border: '2px solid #16A34A', borderRadius: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#16A34A', marginBottom: 4 }}>PV de réception signé</div>
          <div style={{ fontSize: 12, color: '#444' }}>
            Signé le {pvExistant?.dateSignature ? new Date(pvExistant.dateSignature).toLocaleDateString('fr-FR') : today}
            {pvExistant?.sansReserve === false ? ' — avec réserves' : ' — sans réserve'}
          </div>
          <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginTop: 8 }}>
            Les garanties légales sont activées à compter de cette date.
          </div>
        </div>
      )}

      {/* Mentions légales */}
      <div style={{ fontSize: 10, color: '#777', lineHeight: 1.5, padding: '0 4px' }}>
        Ce procès-verbal est établi conformément aux articles 1792 et suivants du Code civil. Il constitue le point de départ des garanties légales (parfait achèvement, biennale, décennale). En cas de litige, les tribunaux compétents sont ceux du lieu d'exécution des travaux. Document généré par Freample.
      </div>
    </div>
  );
}
