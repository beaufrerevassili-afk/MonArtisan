// ============================================================
//  GeorisquesModule — Risques naturels et technologiques
//  API Géorisques V1 (gouvernementale, gratuite, sans clé)
// ============================================================
import React, { useState, useEffect } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, transition:'background .15s' };
const BTN_O = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const RISK_COLORS = {
  1: { bg: '#F0FDF4', color: '#16A34A', label: 'Faible' },
  2: { bg: '#FFFBEB', color: '#D97706', label: 'Moyen' },
  3: { bg: '#FEF2F2', color: '#DC2626', label: 'Élevé' },
};

const GEORISQUES_BASE = 'https://www.georisques.gouv.fr/api/v1';

function buildAdresse(bien) {
  const parts = [];
  if (bien.adresse) parts.push(bien.adresse);
  if (bien.arrondissement && bien.ville) {
    parts.push(`${bien.ville} ${bien.arrondissement}e`);
  } else if (bien.ville) {
    parts.push(bien.ville);
  }
  if (bien.codePostal) parts.push(bien.codePostal);
  return parts.join(', ') || '';
}

export default function GeorisquesModule({ biens = [] }) {
  const [selectedBien, setSelectedBien] = useState(null);
  const [manualAddr, setManualAddr] = useState('');
  const [manualVille, setManualVille] = useState('');
  const [manualArr, setManualArr] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [synthese, setSynthese] = useState({}); // { bienId: { nbRisques, sismique, radon, argiles, score } }

  // Analyse automatique de tous les biens au chargement
  useEffect(() => {
    if (biens.length === 0) return;
    biens.forEach(b => {
      if (synthese[b.id]) return; // déjà analysé
      const addr = buildAdresse(b);
      if (!addr) return;
      analyserPourSynthese(b.id, addr);
    });
  }, [biens.length]);

  async function geocodeAddress(address) {
    const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`);
    const data = await r.json();
    if (!data.features?.length) throw new Error('Adresse non trouvée');
    const [lon, lat] = data.features[0].geometry.coordinates;
    const props = data.features[0].properties;
    return { lon, lat, codeInsee: props.citycode, commune: props.city, label: props.label };
  }

  async function analyserPourSynthese(bienId, address) {
    try {
      const geo = await geocodeAddress(address);
      const [risquesRes, sismRes, radonRes, rgaRes] = await Promise.all([
        fetch(`${GEORISQUES_BASE}/gaspar/risques?code_insee=${geo.codeInsee}&page_size=50`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/zonage_sismique?code_insee=${geo.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/radon?code_insee=${geo.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/rga?code_insee=${geo.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      const nbRisques = (risquesRes.data?.[0]?.risques_detail || []).length;
      const sismique = sismRes.data?.[0] ? parseInt(sismRes.data[0].code_zone) || 1 : 1;
      const radon = radonRes.data?.[0] ? parseInt(radonRes.data[0].classe_potentiel) || 1 : 1;
      const argiles = rgaRes.data?.[0]?.exposition || null;
      const score = Math.max(1, Math.min(3, Math.ceil((nbRisques + sismique + radon) / 3)));
      setSynthese(prev => ({ ...prev, [bienId]: { nbRisques, sismique, radon, argiles, score } }));
    } catch {
      setSynthese(prev => ({ ...prev, [bienId]: { nbRisques: 0, sismique: 0, radon: 0, argiles: null, score: 0, error: true } }));
    }
  }

  async function fetchRisques(address) {
    setLoading(true); setError(''); setResults(null);
    try {
      const geo = await geocodeAddress(address);
      const [risquesRes, sismRes, radonRes, rgaRes, catnatRes] = await Promise.all([
        fetch(`${GEORISQUES_BASE}/gaspar/risques?code_insee=${geo.codeInsee}&page_size=50`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/zonage_sismique?code_insee=${geo.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/radon?code_insee=${geo.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/rga?code_insee=${geo.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/gaspar/catnat?code_insee=${geo.codeInsee}&page_size=10`).then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      const risquesList = (risquesRes.data?.[0]?.risques_detail || []).map(r => ({ code: r.num_risque, label: r.libelle_risque_long || r.libelle_risque || 'Risque inconnu' }));
      const sismique = sismRes.data?.[0];
      const zoneSismique = sismique ? { code: sismique.code_zone, label: sismique.zone_sismicite || `Zone ${sismique.code_zone}`, niveau: parseInt(sismique.code_zone) || 1 } : null;
      const radon = radonRes.data?.[0] ? parseInt(radonRes.data[0].classe_potentiel) || 1 : null;
      const argiles = rgaRes.data?.[0]?.exposition || null;
      const catnat = (catnatRes.data || []).map(c => ({ type: c.libelle_risque_jo || c.lib_risque_jo || 'N/A', debut: c.dat_deb || '', fin: c.dat_fin || '', arrete: c.dat_pub_arrete || '' }));
      setResults({ adresse: geo.label, commune: geo.commune, codeInsee: geo.codeInsee, coords: { lat: geo.lat, lon: geo.lon }, risques: risquesList, sismique: zoneSismique, radon, argiles, catnat, nbRisques: risquesList.length, date: new Date().toISOString().slice(0, 10) });
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération des risques');
    }
    setLoading(false);
  }

  function scoreColor(s) {
    if (s >= 3) return { bg: '#FEF2F2', color: L.red, label: 'Élevé' };
    if (s >= 2) return { bg: '#FFFBEB', color: L.orange, label: 'Moyen' };
    if (s >= 1) return { bg: '#F0FDF4', color: L.green, label: 'Faible' };
    return { bg: '#F2F2F7', color: L.textLight, label: 'N/A' };
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Risques naturels</h2>
      <p style={{ fontSize: 13, color: L.textSec, margin: '0 0 20px' }}>
        Analyse via l'API gouvernementale Géorisques (gratuite). Séisme, radon, argiles, inondation, CATNAT.
      </p>

      {/* Synthèse multi-biens */}
      {biens.length > 0 && (
        <div style={{ ...CARD, padding: 0, marginBottom: 20 }}>
          <div style={{ padding: '12px 18px', borderBottom: `2px solid ${L.border}`, fontSize: 12, fontWeight: 700, color: L.textLight, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Synthèse de vos biens
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${L.border}`, background: '#FAFAF8' }}>
                {['Bien', 'Localisation', 'Séisme', 'Radon', 'Argiles', 'Risques', 'Niveau global'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: L.textLight, textAlign: h === 'Bien' || h === 'Localisation' ? 'left' : 'center', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {biens.map(b => {
                const s = synthese[b.id];
                const sc = s ? scoreColor(s.score) : { bg: '#F2F2F7', color: L.textLight, label: 'En cours...' };
                const isActive = selectedBien?.id === b.id;
                return (
                  <tr key={b.id} onClick={() => { setSelectedBien(b); setManualAddr(''); fetchRisques(buildAdresse(b)); }}
                    style={{ borderBottom: `1px solid ${L.borderLight}`, cursor: 'pointer', background: isActive ? L.cream : 'transparent' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#FAFAF8'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{b.nom || b.adresse?.split(',')[0]}</td>
                    <td style={{ padding: '10px 12px', color: L.textSec }}>
                      {b.ville || '?'}{b.arrondissement ? ` ${b.arrondissement}e` : ''}{b.codePostal ? ` (${b.codePostal})` : ''}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      {s ? <span style={{ fontWeight: 600, color: s.sismique >= 4 ? L.red : s.sismique >= 3 ? L.orange : L.green }}>Zone {s.sismique}</span> : '—'}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      {s ? <span style={{ fontWeight: 600, color: RISK_COLORS[s.radon]?.color || L.textLight }}>{RISK_COLORS[s.radon]?.label || `Cl. ${s.radon}`}</span> : '—'}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      {s?.argiles ? <span style={{ fontWeight: 600, color: s.argiles === 'fort' ? L.red : s.argiles === 'moyen' ? L.orange : L.green }}>{s.argiles}</span> : '—'}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>{s ? s.nbRisques : '...'}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, background: sc.bg, padding: '3px 10px' }}>{sc.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Recherche manuelle */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Analyser une adresse</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px auto', gap: 8, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: L.textSec, display: 'block', marginBottom: 3, textTransform: 'uppercase' }}>Adresse + Ville</label>
            <input value={manualAddr} onChange={e => { setManualAddr(e.target.value); setSelectedBien(null); }}
              placeholder="24 rue de la Liberté, Nice"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${L.border}`, fontSize: 13, fontFamily: L.font, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: L.textSec, display: 'block', marginBottom: 3, textTransform: 'uppercase' }}>Code postal</label>
            <input value={manualVille} onChange={e => setManualVille(e.target.value)}
              placeholder="06000" maxLength={5}
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${L.border}`, fontSize: 13, fontFamily: L.font, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: L.textSec, display: 'block', marginBottom: 3, textTransform: 'uppercase' }}>Arr.</label>
            <input type="number" value={manualArr} onChange={e => setManualArr(e.target.value)}
              placeholder="—" min={1} max={20}
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${L.border}`, fontSize: 13, fontFamily: L.font, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={() => {
            const addr = [manualAddr, manualArr ? `${manualArr}e arrondissement` : '', manualVille].filter(Boolean).join(' ');
            if (addr.trim()) fetchRisques(addr);
          }}
            disabled={loading || !manualAddr.trim()}
            style={{ ...BTN, opacity: loading || !manualAddr.trim() ? 0.5 : 1, height: 42 }}>
            {loading ? 'Analyse...' : 'Analyser'}
          </button>
        </div>
        {error && <div style={{ marginTop: 8, fontSize: 12, color: L.red }}>{error}</div>}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ ...CARD, textAlign: 'center', padding: 40 }}>
          <div style={{ width: 24, height: 24, border: `3px solid ${L.border}`, borderTopColor: L.gold, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ fontSize: 14, color: L.textSec }}>Interrogation de l'API Géorisques...</div>
        </div>
      )}

      {/* Résultats détaillés */}
      {results && !loading && (
        <div>
          {/* En-tête */}
          <div style={{ ...CARD, marginBottom: 12, borderLeft: `4px solid ${results.nbRisques > 5 ? L.red : results.nbRisques > 2 ? L.orange : L.green}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{results.adresse}</div>
                <div style={{ fontSize: 12, color: L.textSec, marginTop: 2 }}>
                  Commune : {results.commune} — INSEE : {results.codeInsee} — Analyse du {results.date}
                </div>
              </div>
              <span style={{ padding: '6px 14px', fontSize: 13, fontWeight: 700, background: results.nbRisques > 5 ? '#FEF2F2' : results.nbRisques > 2 ? '#FFFBEB' : '#F0FDF4', color: results.nbRisques > 5 ? L.red : results.nbRisques > 2 ? L.orange : L.green }}>
                {results.nbRisques} risque{results.nbRisques !== 1 ? 's' : ''} identifié{results.nbRisques !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            <div style={{ ...CARD, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: L.textSec, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>Zone sismique</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: results.sismique?.niveau >= 4 ? L.red : results.sismique?.niveau >= 3 ? L.orange : L.green }}>
                {results.sismique ? `Zone ${results.sismique.code}` : '—'}
              </div>
              <div style={{ fontSize: 11, color: L.textSec }}>{results.sismique?.label || 'Non disponible'}</div>
            </div>
            <div style={{ ...CARD, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: L.textSec, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>Radon</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: RISK_COLORS[results.radon]?.color || L.textLight }}>
                {results.radon ? `Classe ${results.radon}` : '—'}
              </div>
              <div style={{ fontSize: 11, color: L.textSec }}>{RISK_COLORS[results.radon]?.label || 'Non disponible'}</div>
            </div>
            <div style={{ ...CARD, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: L.textSec, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>Retrait-gonflement argiles</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: results.argiles === 'fort' ? L.red : results.argiles === 'moyen' ? L.orange : L.green }}>
                {results.argiles || '—'}
              </div>
              <div style={{ fontSize: 11, color: L.textSec }}>{results.argiles ? `Exposition ${results.argiles}` : 'Non disponible'}</div>
            </div>
          </div>

          {/* Liste des risques */}
          {results.risques.length > 0 && (
            <div style={{ ...CARD, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Risques identifiés sur la commune</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {results.risques.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: i % 2 === 0 ? '#FAFAF8' : 'transparent' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: L.orange, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATNAT */}
          {results.catnat.length > 0 && (
            <div style={{ ...CARD, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Arrêtés de catastrophe naturelle (CATNAT)</div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {results.catnat.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${L.border}`, fontSize: 12 }}>
                    <span style={{ fontWeight: 500 }}>{c.type}</span>
                    <span style={{ color: L.textSec }}>{c.debut} — {c.fin}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lien officiel */}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <a href={`https://www.georisques.gouv.fr/mes-risques/connaitre-les-risques-pres-de-chez-moi/rapport?form-commune=true&codeInsee=${results.codeInsee}&ign=false&CGU-commune=on&type498=on&typeICPE=on`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: L.gold, fontWeight: 600, textDecoration: 'none' }}>
              Voir le rapport complet sur georisques.gouv.fr
            </a>
          </div>
        </div>
      )}

      {/* Aucune analyse */}
      {!results && !loading && !error && biens.length === 0 && (
        <div style={{ ...CARD, textAlign: 'center', padding: 40, color: L.textSec }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Aucun bien à analyser</div>
          <div style={{ fontSize: 12 }}>Ajoutez des biens dans votre patrimoine ou saisissez une adresse manuellement.</div>
        </div>
      )}
    </div>
  );
}
