// ============================================================
//  EstimationModule — Estimateur de valeur pour SCI
//  Calcul auto basé sur localisation + surface + DPE + état
//  Intégré aux biens existants du patrimoine
// ============================================================
import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, transition:'background .15s' };
const BTN_O = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

// Prix/m² par département + arrondissements Paris/Lyon/Marseille
const PRIX_M2 = { '75':10500,'92':6500,'93':3800,'94':5000,'69':3800,'13':3200,'06':4800,'33':3500,'31':3100,'44':3400,'59':2200,'67':2800,'34':3000,'38':2600,'83':3600,'default':2500 };
const PRIX_ARR_PARIS = {1:12500,2:11000,3:11500,4:12800,5:11800,6:14500,7:14000,8:12000,9:10500,10:9800,11:10200,12:9500,13:8500,14:10000,15:10200,16:11800,17:10000,18:8200,19:7500,20:8000};
const PRIX_ARR_LYON = {1:4800,2:5200,3:4500,4:4200,5:3800,6:5500,7:4000,8:3600,9:3200};
const PRIX_ARR_MARSEILLE = {1:2800,2:3200,3:2200,4:2400,5:2600,6:3800,7:4200,8:4500,9:3000,10:2600,11:2400,12:2800,13:2200,14:2000,15:2000,16:2600};

function getPrixM2(bien) {
  // Utilise les champs structurés si disponibles, sinon parse l'adresse
  const cp = bien.codePostal || '';
  const ville = (bien.ville || '').toLowerCase();
  const arr = bien.arrondissement;
  const adresse = (bien.adresse || '').toLowerCase();

  // Arrondissement explicite
  if (arr) {
    if (cp.startsWith('75') || ville.includes('paris')) return PRIX_ARR_PARIS[arr] || PRIX_M2['75'];
    if (cp.startsWith('69') || ville.includes('lyon')) return PRIX_ARR_LYON[arr] || PRIX_M2['69'];
    if (cp.startsWith('13') || ville.includes('marseille')) return PRIX_ARR_MARSEILLE[arr] || PRIX_M2['13'];
  }

  // Code postal → département
  if (cp.length >= 2) {
    const dept = cp.slice(0, 2);
    if (PRIX_M2[dept]) return PRIX_M2[dept];
  }

  // Ville connue
  if (ville.includes('paris')) return PRIX_M2['75'];
  if (ville.includes('lyon')) return PRIX_M2['69'];
  if (ville.includes('marseille')) return PRIX_M2['13'];
  if (ville.includes('nice') || ville.includes('antibes') || ville.includes('cannes')) return PRIX_M2['06'];
  if (ville.includes('bordeaux')) return PRIX_M2['33'];
  if (ville.includes('toulouse')) return PRIX_M2['31'];
  if (ville.includes('nantes')) return PRIX_M2['44'];
  if (ville.includes('lille')) return PRIX_M2['59'];
  if (ville.includes('strasbourg')) return PRIX_M2['67'];
  if (ville.includes('montpellier')) return PRIX_M2['34'];

  // Fallback : parser l'adresse comme avant
  const a = `${adresse} ${ville} ${cp}`;
  const pm = a.match(/paris\s*(\d{1,2})/i) || a.match(/750(\d{2})/);
  if (pm) return PRIX_ARR_PARIS[parseInt(pm[1])] || PRIX_M2['75'];
  for (const [dept, prix] of Object.entries(PRIX_M2)) {
    if (dept !== 'default' && a.includes(dept)) return prix;
  }
  return PRIX_M2['default'];
}

function estimerBien(bien) {
  const prixM2 = getPrixM2(bien);
  const surface = bien.surface || 0;
  if (!surface) return null;

  // Ajustements
  const ajustDPE = { A:1.12, B:1.06, C:1.0, D:0.97, E:0.93, F:0.85, G:0.75 }[bien.dpe] || 1.0;
  const ajustEtat = bien.etat === 'a_renover' ? 0.82 : bien.etat === 'moyen' ? 0.92 : 1.0;
  const ajustEtage = (bien.etage||0) >= 4 ? 1.05 : (bien.etage||0) === 0 ? 0.90 : 1.0;
  const ajustPieces = (bien.pieces||0) <= 1 ? 1.08 : (bien.pieces||0) >= 5 ? 0.95 : 1.0;

  const prixM2Ajuste = Math.round(prixM2 * ajustDPE * ajustEtat * ajustEtage * ajustPieces);
  const mediane = prixM2Ajuste * surface;
  return {
    prixM2Zone: prixM2,
    prixM2Ajuste,
    basse: Math.round(mediane * 0.90),
    mediane: Math.round(mediane),
    haute: Math.round(mediane * 1.12),
    ajustements: [
      ajustDPE !== 1.0 && { label: `DPE ${bien.dpe}`, pct: Math.round((ajustDPE - 1) * 100), color: ajustDPE >= 1 ? L.green : L.red },
      ajustEtat !== 1.0 && { label: bien.etat === 'a_renover' ? 'À rénover' : 'État moyen', pct: Math.round((ajustEtat - 1) * 100), color: L.red },
      ajustEtage !== 1.0 && { label: (bien.etage||0) >= 4 ? 'Étage élevé' : 'RDC', pct: Math.round((ajustEtage - 1) * 100), color: ajustEtage >= 1 ? L.green : L.red },
      ajustPieces !== 1.0 && { label: (bien.pieces||0) <= 1 ? 'Studio' : 'Grand logement', pct: Math.round((ajustPieces - 1) * 100), color: ajustPieces >= 1 ? L.green : L.orange },
    ].filter(Boolean),
  };
}

export default function EstimationModule({ data, setData, showToast, genId, biens }) {
  const [selectedBien, setSelectedBien] = useState(null);

  return (
    <div>
      <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 6px' }}>Estimation de valeur</h2>
      <p style={{ fontSize:13, color:L.textSec, margin:'0 0 20px' }}>Valeur estimée de vos biens basée sur la localisation, la surface, le DPE et l'état général.</p>

      {/* Vue d'ensemble — tous les biens */}
      <div style={{ ...CARD, padding:0, marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr', padding:'10px 18px', fontSize:10, fontWeight:700, color:L.textLight, textTransform:'uppercase', borderBottom:`2px solid ${L.border}` }}>
          <span>Bien</span>
          <span style={{ textAlign:'right' }}>Prix/m² zone</span>
          <span style={{ textAlign:'right' }}>Prix/m² ajusté</span>
          <span style={{ textAlign:'right' }}>Estimation</span>
          <span style={{ textAlign:'right' }}>Prix d'achat</span>
          <span style={{ textAlign:'right' }}>Plus-value</span>
        </div>
        {biens.map(b => {
          const est = estimerBien(b);
          if (!est) return null;
          const pv = est.mediane - (b.prixAchat || 0);
          const pvPct = b.prixAchat > 0 ? (pv / b.prixAchat * 100) : 0;
          const isSelected = selectedBien === b.id;
          return (
            <div key={b.id} onClick={() => setSelectedBien(isSelected ? null : b.id)}
              style={{ padding:'12px 18px', borderBottom:`1px solid ${L.borderLight}`, cursor:'pointer', background: isSelected ? L.cream : 'transparent', transition:'background .1s' }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#FAFAF8'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr', alignItems:'center', fontSize:13 }}>
                <div>
                  <div style={{ fontWeight:600 }}>{b.nom || b.adresse}</div>
                  <div style={{ fontSize:11, color:L.textLight }}>
                    {b.ville || '?'}{b.arrondissement ? ` ${b.arrondissement}e` : ''}{b.codePostal ? ` (${b.codePostal})` : ''} · {b.surface}m² · {b.pieces||'?'}p · DPE {b.dpe || '?'}
                  </div>
                </div>
                <div style={{ textAlign:'right', color:L.textSec }}>{est.prixM2Zone.toLocaleString()}€</div>
                <div style={{ textAlign:'right', fontWeight:600 }}>{est.prixM2Ajuste.toLocaleString()}€</div>
                <div style={{ textAlign:'right', fontWeight:700, color:L.gold }}>{est.mediane.toLocaleString()}€</div>
                <div style={{ textAlign:'right', color:L.textLight }}>{b.prixAchat ? `${b.prixAchat.toLocaleString()}€` : '—'}</div>
                <div style={{ textAlign:'right', fontWeight:600, color: pv >= 0 ? L.green : L.red }}>
                  {b.prixAchat ? `${pv >= 0 ? '+' : ''}${pv.toLocaleString()}€` : '—'}
                  {b.prixAchat > 0 && <span style={{ fontSize:10, marginLeft:4 }}>({pvPct >= 0 ? '+' : ''}{pvPct.toFixed(0)}%)</span>}
                </div>
              </div>

              {/* Détail si sélectionné */}
              {isSelected && (
                <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${L.border}` }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    {/* Fourchette */}
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:L.textLight, textTransform:'uppercase', marginBottom:10 }}>Fourchette d'estimation</div>
                      <div style={{ display:'flex', gap:10 }}>
                        {[
                          { l:'Basse', v:est.basse, c:L.orange },
                          { l:'Médiane', v:est.mediane, c:L.gold },
                          { l:'Haute', v:est.haute, c:L.green },
                        ].map(f => (
                          <div key={f.l} style={{ flex:1, background:L.cream, padding:'12px 10px', textAlign:'center' }}>
                            <div style={{ fontSize:10, color:L.textLight, marginBottom:4 }}>{f.l}</div>
                            <div style={{ fontSize:16, fontWeight:200, color:f.c, fontFamily:L.serif }}>{f.v.toLocaleString()}€</div>
                            <div style={{ fontSize:10, color:L.textLight }}>{Math.round(f.v / b.surface)}/m²</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ajustements appliqués */}
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:L.textLight, textTransform:'uppercase', marginBottom:10 }}>Ajustements appliqués</div>
                      <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:12, borderBottom:`1px solid ${L.borderLight}` }}>
                        <span>Prix de base (zone)</span>
                        <span style={{ fontWeight:600 }}>{est.prixM2Zone.toLocaleString()} €/m²</span>
                      </div>
                      {est.ajustements.map(a => (
                        <div key={a.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:12, borderBottom:`1px solid ${L.borderLight}` }}>
                          <span>{a.label}</span>
                          <span style={{ fontWeight:600, color:a.color }}>{a.pct >= 0 ? '+' : ''}{a.pct}%</span>
                        </div>
                      ))}
                      <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:13, fontWeight:700 }}>
                        <span>Prix ajusté</span>
                        <span style={{ color:L.gold }}>{est.prixM2Ajuste.toLocaleString()} €/m²</span>
                      </div>
                    </div>
                  </div>

                  {/* Comparaison avec le prix d'achat */}
                  {b.prixAchat > 0 && (
                    <div style={{ marginTop:14, padding:'14px 16px', background: pv >= 0 ? '#F0FDF4' : '#FEF2F2', borderLeft:`4px solid ${pv >= 0 ? L.green : L.red}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color: pv >= 0 ? L.green : L.red }}>
                            {pv >= 0 ? 'Plus-value latente' : 'Moins-value latente'}
                          </div>
                          <div style={{ fontSize:11, color:L.textSec, marginTop:2 }}>
                            Achat : {b.prixAchat.toLocaleString()}€ ({Math.round(b.prixAchat / b.surface)}€/m²)
                            {b.dateAcquisition && <span> — le {new Date(b.dateAcquisition).toLocaleDateString('fr-FR')}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:20, fontWeight:200, color: pv >= 0 ? L.green : L.red, fontFamily:L.serif }}>
                            {pv >= 0 ? '+' : ''}{pv.toLocaleString()}€
                          </div>
                          <div style={{ fontSize:11, color:L.textLight }}>{pvPct >= 0 ? '+' : ''}{pvPct.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action : mettre à jour la valeur du bien */}
                  <div style={{ display:'flex', gap:8, marginTop:12 }}>
                    <button onClick={() => {
                      setData(d => ({ ...d, biens: d.biens.map(x => x.id === b.id ? { ...x, valeur: est.mediane } : x) }));
                      showToast(`Valeur de ${b.nom || 'bien'} mise à jour : ${est.mediane.toLocaleString()}€`);
                    }} style={BTN}>Appliquer l'estimation médiane</button>
                    <button onClick={() => window.print()} style={BTN_O}>Imprimer</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totaux patrimoine */}
      <div style={{ ...CARD }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Synthèse du patrimoine</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
          {(() => {
            const totalAchat = biens.reduce((s, b) => s + (b.prixAchat || 0), 0);
            const totalEstim = biens.reduce((s, b) => { const e = estimerBien(b); return s + (e?.mediane || b.valeur || 0); }, 0);
            const totalPV = totalEstim - totalAchat;
            const nbBiens = biens.length;
            return [
              { l: 'Biens', v: nbBiens, c: L.blue },
              { l: 'Coût d\'achat total', v: `${(totalAchat / 1000).toFixed(0)}k€`, c: L.text },
              { l: 'Valeur estimée', v: `${(totalEstim / 1000).toFixed(0)}k€`, c: L.gold },
              { l: 'Plus-value globale', v: `${totalPV >= 0 ? '+' : ''}${(totalPV / 1000).toFixed(0)}k€`, c: totalPV >= 0 ? L.green : L.red },
            ];
          })().map(k => (
            <div key={k.l} style={{ textAlign:'center', padding:'12px', background:L.cream }}>
              <div style={{ fontSize:20, fontWeight:200, color:k.c, fontFamily:L.serif }}>{k.v}</div>
              <div style={{ fontSize:10, color:L.textLight, textTransform:'uppercase', marginTop:4 }}>{k.l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, fontSize:10, color:L.textLight }}>
          Estimations basées sur les données DVF (Demandes de Valeurs Foncières) par département et arrondissement, ajustées selon le DPE, l'état, l'étage et la typologie. Ces valeurs sont indicatives.
        </div>
      </div>
    </div>
  );
}
