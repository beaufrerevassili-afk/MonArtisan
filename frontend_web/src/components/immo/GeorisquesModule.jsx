import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, transition:'background .15s' };
const BTN_O = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const RISK_ICONS = {
  'Inondation': '🌊', 'Séisme': '🔴', 'Mouvement de terrain': '⛰️', 'Radon': '☢️',
  'Argiles': '🏜️', 'Feu de forêt': '🔥', 'Tempête': '🌪️', 'Avalanche': '❄️',
  'Volcanisme': '🌋', 'Industriel': '🏭', 'Nucléaire': '☢️', 'Transport': '🚛',
  'Rupture de barrage': '🌊', 'Minier': '⛏️',
};

const RISK_COLORS = {
  1: { bg: '#F0FDF4', color: '#16A34A', label: 'Faible' },
  2: { bg: '#FFFBEB', color: '#D97706', label: 'Moyen' },
  3: { bg: '#FEF2F2', color: '#DC2626', label: 'Élevé' },
};

const GEORISQUES_BASE = 'https://www.georisques.gouv.fr/api/v1';

export default function GeorisquesModule({ biens = [] }) {
  const [selectedBien, setSelectedBien] = useState(null);
  const [manualAddr, setManualAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  async function geocodeAddress(address) {
    const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`);
    const data = await r.json();
    if (!data.features?.length) throw new Error('Adresse non trouvée');
    const [lon, lat] = data.features[0].geometry.coordinates;
    const props = data.features[0].properties;
    return { lon, lat, codeInsee: props.citycode, commune: props.city, label: props.label };
  }

  async function fetchRisques(address) {
    setLoading(true); setError(''); setResults(null);
    try {
      const geo = await geocodeAddress(address);

      // Appels parallèles à l'API Géorisques V1 (gratuite, sans clé)
      const [risquesRes, sismRes, radonRes, rgaRes, catnatRes] = await Promise.all([
        fetch(`${GEORISQUES_BASE}/gaspar/risques?code_insee=${geo.codeInsee}&page_size=50`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/zonage_sismique?code_insee=${geo.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/radon?code_insee=${geo.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/rga?code_insee=${geo.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/gaspar/catnat?code_insee=${geo.codeInsee}&page_size=10`).then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      // Risques identifiés
      const risquesCommune = risquesRes.data?.[0]?.risques_detail || [];
      const risquesList = risquesCommune.map(r => ({
        code: r.num_risque,
        label: r.libelle_risque_long || r.libelle_risque || 'Risque inconnu',
      }));

      // Zone sismique
      const sismique = sismRes.data?.[0];
      const zoneSismique = sismique ? {
        code: sismique.code_zone,
        label: sismique.zone_sismicite || `Zone ${sismique.code_zone}`,
        niveau: parseInt(sismique.code_zone) || 1,
      } : null;

      // Radon
      const radon = radonRes.data?.[0];
      const classeRadon = radon ? parseInt(radon.classe_potentiel) || 1 : null;

      // Retrait-gonflement argiles
      const rga = rgaRes.data?.[0];
      const niveauArgiles = rga?.exposition || rga?.niveau || null;

      // CATNAT
      const catnat = (catnatRes.data || []).map(c => ({
        type: c.libelle_risque_jo || c.lib_risque_jo || 'N/A',
        debut: c.dat_deb || '',
        fin: c.dat_fin || '',
        arrete: c.dat_pub_arrete || '',
      }));

      setResults({
        adresse: geo.label,
        commune: geo.commune,
        codeInsee: geo.codeInsee,
        coords: { lat: geo.lat, lon: geo.lon },
        risques: risquesList,
        sismique: zoneSismique,
        radon: classeRadon,
        argiles: niveauArgiles,
        catnat,
        nbRisques: risquesList.length,
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération des risques');
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Géorisques</h2>
      <p style={{ fontSize: 13, color: L.textSec, margin: '0 0 20px' }}>
        Analyse des risques naturels et technologiques via l'API gouvernementale Géorisques.
      </p>

      {/* Sélection du bien ou adresse manuelle */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Analyser un bien</div>

        {biens.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {biens.filter(b => b.adresse).map(b => (
              <button key={b.id} onClick={() => { setSelectedBien(b); setManualAddr(''); fetchRisques(b.adresse); }}
                style={{ ...BTN_O, fontSize: 11, padding: '6px 12px', background: selectedBien?.id === b.id ? L.cream : 'transparent', borderColor: selectedBien?.id === b.id ? L.gold : L.border }}>
                🏠 {b.nom}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <input value={manualAddr} onChange={e => { setManualAddr(e.target.value); setSelectedBien(null); }}
            placeholder="Ou saisissez une adresse..."
            style={{ flex: 1, padding: '10px 12px', border: `1px solid ${L.border}`, fontSize: 13, fontFamily: L.font, outline: 'none' }} />
          <button onClick={() => { if (manualAddr.trim()) fetchRisques(manualAddr); }}
            disabled={loading || !manualAddr.trim()}
            style={{ ...BTN, opacity: loading || !manualAddr.trim() ? 0.5 : 1 }}>
            {loading ? 'Analyse...' : 'Analyser'}
          </button>
        </div>

        {error && <div style={{ marginTop: 8, fontSize: 12, color: '#DC2626' }}>{error}</div>}
      </div>

      {/* Résultats */}
      {loading && (
        <div style={{ ...CARD, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 14, color: L.textSec }}>Interrogation de l'API Géorisques...</div>
        </div>
      )}

      {results && !loading && (
        <div>
          {/* En-tête résultat */}
          <div style={{ ...CARD, marginBottom: 12, borderLeft: `4px solid ${results.nbRisques > 5 ? '#DC2626' : results.nbRisques > 2 ? '#D97706' : '#16A34A'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>📍 {results.adresse}</div>
                <div style={{ fontSize: 12, color: L.textSec, marginTop: 2 }}>
                  Commune : {results.commune} · INSEE : {results.codeInsee} · Analyse du {results.date}
                </div>
              </div>
              <div style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: results.nbRisques > 5 ? '#FEF2F2' : results.nbRisques > 2 ? '#FFFBEB' : '#F0FDF4', color: results.nbRisques > 5 ? '#DC2626' : results.nbRisques > 2 ? '#D97706' : '#16A34A' }}>
                {results.nbRisques} risque{results.nbRisques > 1 ? 's' : ''} identifié{results.nbRisques > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* KPI rapides */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {/* Sismique */}
            <div style={{ ...CARD, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: L.textSec, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>Zone sismique</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: results.sismique?.niveau >= 4 ? '#DC2626' : results.sismique?.niveau >= 3 ? '#D97706' : '#16A34A' }}>
                {results.sismique ? results.sismique.code : '—'}
              </div>
              <div style={{ fontSize: 11, color: L.textSec }}>{results.sismique?.label || 'Non disponible'}</div>
            </div>
            {/* Radon */}
            <div style={{ ...CARD, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: L.textSec, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>Radon</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: RISK_COLORS[results.radon]?.color || '#636363' }}>
                {results.radon ? `Classe ${results.radon}` : '—'}
              </div>
              <div style={{ fontSize: 11, color: L.textSec }}>{RISK_COLORS[results.radon]?.label || 'Non disponible'}</div>
            </div>
            {/* Argiles */}
            <div style={{ ...CARD, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: L.textSec, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>Retrait-gonflement argiles</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: results.argiles === 'fort' ? '#DC2626' : results.argiles === 'moyen' ? '#D97706' : '#16A34A' }}>
                {results.argiles ? '🏜️' : '—'}
              </div>
              <div style={{ fontSize: 11, color: L.textSec }}>{results.argiles || 'Non disponible'}</div>
            </div>
          </div>

          {/* Liste des risques */}
          {results.risques.length > 0 && (
            <div style={{ ...CARD, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Risques identifiés sur la commune</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {results.risques.map((r, i) => {
                  const icon = Object.entries(RISK_ICONS).find(([k]) => r.label.toLowerCase().includes(k.toLowerCase()))?.[1] || '⚠️';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: i % 2 === 0 ? '#FAFAF8' : 'transparent', borderRadius: 6 }}>
                      <span style={{ fontSize: 18 }}>{icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historique CATNAT */}
          {results.catnat.length > 0 && (
            <div style={{ ...CARD, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Arrêtés de catastrophe naturelle (CATNAT)</div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {results.catnat.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${L.border}`, fontSize: 12 }}>
                    <span style={{ fontWeight: 500 }}>{c.type}</span>
                    <span style={{ color: L.textSec }}>{c.debut} → {c.fin}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lien vers le rapport officiel */}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <a href={`https://www.georisques.gouv.fr/mes-risques/connaitre-les-risques-pres-de-chez-moi/rapport?form-commune=true&codeInsee=${results.codeInsee}&ign=false&CGU-commune=on&type498=on&typeICPE=on`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: L.gold, fontWeight: 600, textDecoration: 'none' }}>
              📄 Voir le rapport complet sur georisques.gouv.fr →
            </a>
          </div>
        </div>
      )}

      {/* Message si aucune analyse */}
      {!results && !loading && !error && (
        <div style={{ ...CARD, textAlign: 'center', padding: 40, color: L.textSec }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Sélectionnez un bien ou saisissez une adresse</div>
          <div style={{ fontSize: 12 }}>L'API Géorisques (gratuite, gouvernementale) analysera les risques naturels et technologiques du secteur.</div>
        </div>
      )}
    </div>
  );
}
