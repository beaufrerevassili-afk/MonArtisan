import React, { useState, useMemo } from 'react';
import DS from '../../design/ds';
import { calculerRemunerationJournaliere, BAREME_TRAJET, PANIER_REPAS_BTP } from '../../utils/calculPaie';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };
const ROW = { display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #E8E6E1', fontSize:13 };

export default function SimulateurTrajetModule() {
  const [distance, setDistance] = useState(35);
  const [salaireBase, setSalaireBase] = useState(120);
  const [panier, setPanier] = useState(PANIER_REPAS_BTP);
  const [heuresSupp, setHeuresSupp] = useState(0);

  const result = useMemo(() => calculerRemunerationJournaliere({
    distanceKm: Number(distance) || 0,
    salaireBaseJournalier: Number(salaireBase) || 0,
    panierRepas: Number(panier) || 0,
    heuresSupp: heuresSupp > 0,
    nbHeuresSupp: Number(heuresSupp) || 0,
  }), [distance, salaireBase, panier, heuresSupp]);

  const d = result.detail;

  return (
    <div>
      <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 6px' }}>Simulateur rémunération journalière</h2>
      <p style={{ fontSize:12, color:'#555', marginBottom:16 }}>Calcul automatique : salaire + indemnité trajet + panier repas + heures supplémentaires</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Formulaire */}
        <div style={CARD}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Paramètres du jour</div>
          <div style={{ marginBottom:12 }}>
            <label style={LBL}>Distance dépôt → chantier (km aller simple)</label>
            <input type="range" min="0" max="300" value={distance} onChange={e=>setDistance(e.target.value)} style={{ width:'100%', marginBottom:4 }} />
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <input type="number" value={distance} onChange={e=>setDistance(e.target.value)} style={{ ...INP, width:80, textAlign:'center' }} />
              <span style={{ fontSize:12, color:'#555', alignSelf:'center' }}>→ {(distance*2)} km A/R</span>
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={LBL}>Salaire brut journalier (€)</label>
            <input type="number" value={salaireBase} onChange={e=>setSalaireBase(e.target.value)} style={INP} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={LBL}>Panier repas (€)</label>
            <input type="number" step="0.01" value={panier} onChange={e=>setPanier(e.target.value)} style={INP} />
            <div style={{ fontSize:10, color:'#555', marginTop:2 }}>Référence BTP 2026 : {PANIER_REPAS_BTP} €</div>
          </div>
          <div>
            <label style={LBL}>Heures supplémentaires</label>
            <input type="number" min="0" max="10" value={heuresSupp} onChange={e=>setHeuresSupp(e.target.value)} style={INP} />
            <div style={{ fontSize:10, color:'#555', marginTop:2 }}>+25% (1-8h) puis +50% (au-delà)</div>
          </div>
        </div>

        {/* Résultat */}
        <div>
          {d && <>
            {/* Total */}
            <div style={{ background:'#0A0A0A', borderRadius:14, padding:20, color:'#fff', marginBottom:12, textAlign:'center' }}>
              <div style={{ fontSize:11, color:DS.gold, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Rémunération journalière totale</div>
              <div style={{ fontSize:36, fontWeight:300 }}>{d.salaireTotal.toFixed(2)} €</div>
            </div>

            {/* Grand déplacement alerte */}
            {d.grandDeplacement && (
              <div style={{ background:'#FEF2F2', border:'1px solid #DC262625', borderLeft:'4px solid #DC2626', borderRadius:8, padding:'10px 14px', marginBottom:12, fontSize:12 }}>
                <strong style={{ color:'#DC2626' }}>Grand déplacement détecté</strong><br/>
                Distance > 200 km. Forfait hébergement + repas soir : {d.indemGrandDeplacement} €
              </div>
            )}

            {/* Détail */}
            <div style={CARD}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:10 }}>Détail du calcul</div>

              <div style={ROW}>
                <span style={{ color:'#555' }}>Salaire de base</span>
                <span style={{ fontWeight:600 }}>{d.salaireBase.toFixed(2)} €</span>
              </div>
              <div style={ROW}>
                <span style={{ color:'#555' }}>Taux horaire</span>
                <span>{d.tauxHoraire.toFixed(2)} €/h</span>
              </div>

              <div style={{ fontSize:12, fontWeight:700, color:'#2563EB', margin:'12px 0 4px', textTransform:'uppercase' }}>Trajet</div>
              <div style={ROW}>
                <span style={{ color:'#555' }}>Distance aller simple</span>
                <span>{d.distanceAllerSimple} km</span>
              </div>
              <div style={ROW}>
                <span style={{ color:'#555' }}>Distance A/R</span>
                <span>{d.distanceTotale} km</span>
              </div>
              <div style={ROW}>
                <span style={{ color:'#555' }}>Zone</span>
                <span style={{ fontSize:11 }}>{d.zone}</span>
              </div>
              <div style={ROW}>
                <span style={{ color:'#555' }}>Indemnité trajet</span>
                <span style={{ fontWeight:600, color:d.indemniteTrajet>0?'#2563EB':'#555' }}>+ {d.indemniteTrajet.toFixed(2)} €</span>
              </div>

              <div style={{ fontSize:12, fontWeight:700, color:'#16A34A', margin:'12px 0 4px', textTransform:'uppercase' }}>Repas</div>
              <div style={ROW}>
                <span style={{ color:'#555' }}>Panier repas</span>
                <span style={{ fontWeight:600, color:'#16A34A' }}>+ {d.panierRepas.toFixed(2)} €</span>
              </div>

              {d.nbHeuresSupp > 0 && <>
                <div style={{ fontSize:12, fontWeight:700, color:'#D97706', margin:'12px 0 4px', textTransform:'uppercase' }}>Heures supplémentaires</div>
                <div style={ROW}>
                  <span style={{ color:'#555' }}>{d.nbHeuresSupp}h supp (maj. 25%/50%)</span>
                  <span style={{ fontWeight:600, color:'#D97706' }}>+ {d.montantHeuresSupp.toFixed(2)} €</span>
                </div>
              </>}

              {d.grandDeplacement && <>
                <div style={{ fontSize:12, fontWeight:700, color:'#DC2626', margin:'12px 0 4px', textTransform:'uppercase' }}>Grand déplacement</div>
                <div style={ROW}>
                  <span style={{ color:'#555' }}>Hébergement + repas soir</span>
                  <span style={{ fontWeight:600, color:'#DC2626' }}>+ {d.indemGrandDeplacement.toFixed(2)} €</span>
                </div>
              </>}

              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', fontSize:15, fontWeight:800, borderTop:'2px solid #0A0A0A', marginTop:8 }}>
                <span>TOTAL</span>
                <span style={{ color:DS.gold }}>{d.salaireTotal.toFixed(2)} €</span>
              </div>
            </div>
          </>}

          {result.erreurs?.length > 0 && (
            <div style={{ background:'#FEF2F2', padding:16, borderRadius:8, color:'#DC2626', fontSize:13 }}>
              {result.erreurs.map((e,i) => <div key={i}>Erreur : {e}</div>)}
            </div>
          )}
        </div>
      </div>

      {/* Barème de référence */}
      <div style={{ ...CARD, marginTop:16 }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:10 }}>Barème indemnités de trajet BTP</div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#F2F2F7' }}>
              <th style={{ padding:'8px 12px', fontSize:11, fontWeight:700, color:'#555', textAlign:'left', borderBottom:'2px solid #E8E6E1' }}>Zone</th>
              <th style={{ padding:'8px 12px', fontSize:11, fontWeight:700, color:'#555', textAlign:'left', borderBottom:'2px solid #E8E6E1' }}>Distance (aller)</th>
              <th style={{ padding:'8px 12px', fontSize:11, fontWeight:700, color:'#555', textAlign:'right', borderBottom:'2px solid #E8E6E1' }}>Indemnité / jour</th>
            </tr>
          </thead>
          <tbody>
            {BAREME_TRAJET.map((b,i) => {
              const isActive = Number(distance) >= b.min && Number(distance) < (b.max === Infinity ? 99999 : b.max);
              return (
                <tr key={i} style={{ background:isActive?'#EFF6FF':'transparent' }}>
                  <td style={{ padding:'8px 12px', fontSize:12, borderBottom:'1px solid #E8E6E1', fontWeight:isActive?700:400, color:isActive?'#2563EB':'#333' }}>{b.label}</td>
                  <td style={{ padding:'8px 12px', fontSize:12, borderBottom:'1px solid #E8E6E1' }}>{b.min} — {b.max===Infinity?'∞':b.max} km</td>
                  <td style={{ padding:'8px 12px', fontSize:12, borderBottom:'1px solid #E8E6E1', textAlign:'right', fontWeight:700, color:isActive?'#2563EB':'#333' }}>{b.indemnite} €</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
