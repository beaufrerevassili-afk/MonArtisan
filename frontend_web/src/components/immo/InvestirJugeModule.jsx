import React, { useState } from 'react';
import L from '../../design/luxe';

const CARD = { background: L.white, border: `1px solid ${L.border}`, padding: '20px' };
const BTN = { padding: '8px 18px', background: L.noir, color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, transition: 'background .15s' };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${L.border}`, fontSize: 13, fontFamily: L.font, outline: 'none', boxSizing: 'border-box', background: L.white };
const LBL = { fontSize: 10, fontWeight: 600, color: L.textSec, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' };
const GEORISQUES_BASE = 'https://www.georisques.gouv.fr/api/v1';

const PROFIL_RISQUE = [
  { id: 'conservateur', label: 'Conservateur', icon: '🛡️', desc: 'Sécurité maximale, cashflow positif, zone tendue', color: '#16A34A' },
  { id: 'equilibre', label: 'Équilibré', icon: '⚖️', desc: 'Bon compromis rentabilité/risque', color: '#2563EB' },
  { id: 'dynamique', label: 'Dynamique', icon: '🚀', desc: 'Rendement élevé, plus-value, accepte du risque', color: '#D97706' },
];

function scoreColor(s) { return s >= 70 ? L.green : s >= 45 ? '#D97706' : '#DC2626'; }
function scoreLabel(s) { return s >= 80 ? 'Excellente opportunité' : s >= 65 ? 'Bonne opportunité' : s >= 45 ? 'Opportunité moyenne' : s >= 25 ? 'Risquée' : 'À éviter'; }
function scoreVerdict(s) {
  if (s >= 80) return { emoji: '🟢', text: 'FONCEZ — Ce bien coche toutes les cases. Montez le dossier bancaire.' };
  if (s >= 65) return { emoji: '🟢', text: 'GO — Bonne opportunité avec quelques points de vigilance.' };
  if (s >= 45) return { emoji: '🟡', text: 'À ÉTUDIER — Potentiel intéressant mais des risques à couvrir.' };
  if (s >= 25) return { emoji: '🟠', text: 'PRUDENCE — Le ratio risque/rendement est défavorable.' };
  return { emoji: '🔴', text: 'PASSER — Trop de signaux négatifs. Cherchez mieux.' };
}

export default function InvestirJugeModule({ data, setData, showToast }) {
  const [step, setStep] = useState('list'); // 'list' | 'create' | 'analyse' | 'bilan'
  const [form, setForm] = useState({});
  const [profilRisque, setProfilRisque] = useState('equilibre');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoData, setGeoData] = useState(null);
  const [analyseDossier, setAnalyseDossier] = useState(null);

  const dossiers = data.dossiers || [];

  const creerDossier = () => {
    const d = {
      id: Date.now(), nom: form.nom || 'Sans nom', adresse: form.adresse || '',
      prix: Number(form.prix) || 0, fraisNotaire: Number(form.fraisNotaire) || 0, travaux: Number(form.travaux) || 0,
      loyer: Number(form.loyer) || 0, charges: Number(form.charges) || 0, taxeFonciere: Number(form.taxeFonciere) || 0,
      vacanceMois: Number(form.vacanceMois) || 1, assurance: Number(form.assurance) || 0,
      mensualite: Number(form.mensualite) || 0, dureeCredit: Number(form.dureeCredit) || 20,
      tauxCredit: Number(form.tauxCredit) || 2.5,
      strategie: form.strategie || 'Location nue', profilRisque, created: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, dossiers: [d, ...(prev.dossiers || [])] }));
    showToast('Dossier créé');
    lancerAnalyse(d);
  };

  async function fetchGeorisques(adresse) {
    try {
      setGeoLoading(true);
      const geoRes = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`);
      const geoJson = await geoRes.json();
      if (!geoJson.features?.length) { setGeoData({ error: 'Adresse non trouvée' }); setGeoLoading(false); return null; }
      const [lon, lat] = geoJson.features[0].geometry.coordinates;
      const codeInsee = geoJson.features[0].properties.citycode;
      const commune = geoJson.features[0].properties.city;

      const [risques, sism, radon, rga, catnat] = await Promise.all([
        fetch(`${GEORISQUES_BASE}/gaspar/risques?code_insee=${codeInsee}&page_size=50`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/zonage_sismique?code_insee=${codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/radon?code_insee=${codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/rga?code_insee=${codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${GEORISQUES_BASE}/gaspar/catnat?code_insee=${codeInsee}&page_size=20`).then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      const result = {
        commune, codeInsee,
        nbRisques: (risques.data?.[0]?.risques_detail || []).length,
        risques: (risques.data?.[0]?.risques_detail || []).map(r => r.libelle_risque_long || r.libelle_risque || ''),
        sismique: parseInt(sism.data?.[0]?.code_zone) || 1,
        radon: parseInt(radon.data?.[0]?.classe_potentiel) || 1,
        argiles: rga.data?.[0]?.exposition || 'faible',
        nbCatnat: (catnat.data || []).length,
      };
      setGeoData(result);
      setGeoLoading(false);
      return result;
    } catch { setGeoData({ error: 'Erreur API' }); setGeoLoading(false); return null; }
  }

  function calculerScore(dos, geo, profil) {
    const prixTotal = dos.prix + dos.fraisNotaire + dos.travaux;
    const loyerAnnuel = dos.loyer * (12 - dos.vacanceMois);
    const chargesAnnuelles = (dos.charges + dos.taxeFonciere + dos.assurance) * 12;
    const creditAnnuel = dos.mensualite * 12;
    const cashflowAnnuel = loyerAnnuel - chargesAnnuelles - creditAnnuel;
    const cashflowMensuel = Math.round(cashflowAnnuel / 12);
    const rendementBrut = prixTotal > 0 ? Math.round(dos.loyer * 12 / prixTotal * 10000) / 100 : 0;
    const rendementNet = prixTotal > 0 ? Math.round(loyerAnnuel / prixTotal * 10000) / 100 : 0;

    // Score rentabilité (0-25)
    let scoreRenta = 0;
    if (profil === 'conservateur') scoreRenta = rendementNet >= 4 ? 25 : rendementNet >= 3 ? 18 : rendementNet >= 2 ? 10 : 5;
    else if (profil === 'equilibre') scoreRenta = rendementNet >= 6 ? 25 : rendementNet >= 4 ? 18 : rendementNet >= 3 ? 10 : 5;
    else scoreRenta = rendementNet >= 8 ? 25 : rendementNet >= 6 ? 20 : rendementNet >= 4 ? 12 : 5;

    // Score cashflow (0-25)
    let scoreCash = cashflowMensuel >= 200 ? 25 : cashflowMensuel >= 50 ? 20 : cashflowMensuel >= 0 ? 15 : cashflowMensuel >= -100 ? 8 : 0;
    if (profil === 'conservateur' && cashflowMensuel < 0) scoreCash = 0;

    // Score risque géo (0-25)
    let scoreGeo = 25;
    if (geo) {
      if (geo.nbRisques > 8) scoreGeo -= 15; else if (geo.nbRisques > 4) scoreGeo -= 8; else if (geo.nbRisques > 2) scoreGeo -= 3;
      if (geo.sismique >= 4) scoreGeo -= 8; else if (geo.sismique >= 3) scoreGeo -= 4;
      if (geo.radon >= 3) scoreGeo -= 5; else if (geo.radon >= 2) scoreGeo -= 2;
      if (geo.nbCatnat > 10) scoreGeo -= 5; else if (geo.nbCatnat > 5) scoreGeo -= 2;
      scoreGeo = Math.max(0, scoreGeo);
    }
    if (profil === 'conservateur') scoreGeo = Math.round(scoreGeo * 1.2); // Poids accru pour conservateur
    if (profil === 'dynamique') scoreGeo = Math.round(scoreGeo * 0.8);

    // Score structure (0-25)
    const tauxEffort = dos.loyer > 0 ? (dos.mensualite / dos.loyer * 100) : 100;
    let scoreStruct = 0;
    if (tauxEffort < 70) scoreStruct += 10; else if (tauxEffort < 90) scoreStruct += 5;
    if (dos.vacanceMois <= 1) scoreStruct += 8; else if (dos.vacanceMois <= 2) scoreStruct += 4;
    if (dos.travaux < dos.prix * 0.1) scoreStruct += 7; else if (dos.travaux < dos.prix * 0.2) scoreStruct += 3;

    const total = Math.min(100, Math.max(0, scoreRenta + scoreCash + Math.min(25, scoreGeo) + scoreStruct));

    return {
      total, scoreRenta, scoreCash, scoreGeo: Math.min(25, scoreGeo), scoreStruct,
      rendementBrut, rendementNet, cashflowMensuel, cashflowAnnuel,
      prixTotal, loyerAnnuel, chargesAnnuelles, creditAnnuel, tauxEffort: Math.round(tauxEffort),
    };
  }

  async function lancerAnalyse(dos) {
    const geo = dos.adresse ? await fetchGeorisques(dos.adresse) : null;
    const score = calculerScore(dos, geo, dos.profilRisque || profilRisque);
    setAnalyseDossier({ dossier: dos, geo, score });
    setStep('bilan');
  }

  // ── VUE LISTE ──
  if (step === 'list') return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Investir — Juge de décision</h2>
      <p style={{ fontSize: 13, color: L.textSec, margin: '0 0 20px' }}>Créez un dossier, on analyse tout automatiquement en 5 minutes.</p>

      <button onClick={() => { setForm({}); setStep('create'); }} style={{ ...BTN, padding: '12px 28px', marginBottom: 20 }}
        onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>
        + Nouveau dossier d'investissement
      </button>

      {dossiers.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 48, color: L.textSec }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Aucun dossier</div>
          <div style={{ fontSize: 12 }}>Créez votre premier dossier pour obtenir un verdict automatique.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dossiers.map(dos => {
            const s = calculerScore(dos, null, dos.profilRisque || 'equilibre');
            const sc = scoreColor(s.total);
            return (
              <div key={dos.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 16, borderLeft: `4px solid ${sc}` }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', border: `3px solid ${sc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: sc }}>{s.total}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{dos.nom}</div>
                  <div style={{ fontSize: 11, color: L.textSec }}>{dos.adresse || 'Adresse non renseignée'} · {dos.prix?.toLocaleString()}€ · Loyer {dos.loyer}€/mois</div>
                  <div style={{ fontSize: 11, color: sc, fontWeight: 600, marginTop: 2 }}>{scoreLabel(s.total)} · Cashflow {s.cashflowMensuel >= 0 ? '+' : ''}{s.cashflowMensuel}€/mois</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => lancerAnalyse(dos)} style={{ ...BTN, fontSize: 10, padding: '6px 14px' }}
                    onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>
                    Analyser
                  </button>
                  <button onClick={() => { setData(d => ({ ...d, dossiers: (d.dossiers || []).filter(x => x.id !== dos.id) })); showToast('Supprimé'); }}
                    style={{ padding: '6px 10px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 0, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── VUE CRÉATION RAPIDE ──
  if (step === 'create') return (
    <div>
      <button onClick={() => setStep('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: L.gold, fontWeight: 600, marginBottom: 16, fontFamily: L.font }}>← Retour</button>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Nouveau dossier — 5 minutes chrono</h2>
      <p style={{ fontSize: 13, color: L.textSec, margin: '0 0 20px' }}>Remplissez les infos du bien, on s'occupe du reste.</p>

      {/* Profil risque */}
      <div style={{ marginBottom: 20 }}>
        <label style={LBL}>Votre profil investisseur</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {PROFIL_RISQUE.map(p => (
            <button key={p.id} onClick={() => setProfilRisque(p.id)}
              style={{ flex: 1, padding: '12px', border: `2px solid ${profilRisque === p.id ? p.color : L.border}`, background: profilRisque === p.id ? p.color + '10' : 'transparent', cursor: 'pointer', fontFamily: L.font, textAlign: 'center', transition: 'all .15s' }}>
              <div style={{ fontSize: 22 }}>{p.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: profilRisque === p.id ? p.color : L.text, marginTop: 4 }}>{p.label}</div>
              <div style={{ fontSize: 10, color: L.textSec, marginTop: 2 }}>{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1/-1' }}><label style={LBL}>Nom du projet</label><input value={form.nom || ''} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={INP} placeholder="T2 Nice Centre" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={LBL}>Adresse complète (pour Géorisques)</label><input value={form.adresse || ''} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} style={INP} placeholder="12 rue de la Liberté, 06000 Nice" /></div>
        <div><label style={LBL}>Prix d'achat (€)</label><input type="number" value={form.prix || ''} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} style={INP} placeholder="180000" /></div>
        <div><label style={LBL}>Frais de notaire (€)</label><input type="number" value={form.fraisNotaire || ''} onChange={e => setForm(f => ({ ...f, fraisNotaire: e.target.value }))} style={INP} placeholder="14000" /></div>
        <div><label style={LBL}>Travaux estimés (€)</label><input type="number" value={form.travaux || ''} onChange={e => setForm(f => ({ ...f, travaux: e.target.value }))} style={INP} placeholder="5000" /></div>
        <div><label style={LBL}>Loyer mensuel (€)</label><input type="number" value={form.loyer || ''} onChange={e => setForm(f => ({ ...f, loyer: e.target.value }))} style={INP} placeholder="850" /></div>
        <div><label style={LBL}>Charges mensuelles (€)</label><input type="number" value={form.charges || ''} onChange={e => setForm(f => ({ ...f, charges: e.target.value }))} style={INP} placeholder="120" /></div>
        <div><label style={LBL}>Taxe foncière / mois (€)</label><input type="number" value={form.taxeFonciere || ''} onChange={e => setForm(f => ({ ...f, taxeFonciere: e.target.value }))} style={INP} placeholder="80" /></div>
        <div><label style={LBL}>Assurance PNO / mois (€)</label><input type="number" value={form.assurance || ''} onChange={e => setForm(f => ({ ...f, assurance: e.target.value }))} style={INP} placeholder="20" /></div>
        <div><label style={LBL}>Vacance estimée (mois/an)</label><input type="number" value={form.vacanceMois || ''} onChange={e => setForm(f => ({ ...f, vacanceMois: e.target.value }))} style={INP} placeholder="1" /></div>
        <div><label style={LBL}>Mensualité crédit (€)</label><input type="number" value={form.mensualite || ''} onChange={e => setForm(f => ({ ...f, mensualite: e.target.value }))} style={INP} placeholder="750" /></div>
        <div>
          <label style={LBL}>Stratégie</label>
          <select value={form.strategie || 'Location nue'} onChange={e => setForm(f => ({ ...f, strategie: e.target.value }))} style={INP}>
            {['Location nue', 'Location meublée (LMNP)', 'Colocation', 'Location courte durée', 'Achat-revente', 'Division', 'Immeuble de rapport'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <button onClick={creerDossier} disabled={!form.prix || !form.loyer} style={{ ...BTN, width: '100%', padding: 14, marginTop: 20, fontSize: 14, background: L.gold, opacity: !form.prix || !form.loyer ? 0.5 : 1 }}>
        {geoLoading ? 'Analyse Géorisques en cours...' : '⚡ Analyser ce bien — Verdict en 5 secondes'}
      </button>
    </div>
  );

  // ── VUE BILAN ──
  if (step === 'bilan' && analyseDossier) {
    const { dossier: dos, geo, score: s } = analyseDossier;
    const sc = scoreColor(s.total);
    const verdict = scoreVerdict(s.total);

    return (
      <div>
        <button onClick={() => { setStep('list'); setAnalyseDossier(null); setGeoData(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: L.gold, fontWeight: 600, marginBottom: 16, fontFamily: L.font }}>← Retour aux dossiers</button>

        {/* Verdict principal */}
        <div style={{ background: L.noir, color: '#fff', padding: 'clamp(24px,4vw,36px)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', border: `4px solid ${sc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: sc }}>{s.total}</span>
          </div>
          <div>
            <div style={{ fontSize: 11, color: L.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Verdict Freample</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{verdict.emoji} {scoreLabel(s.total)}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{verdict.text}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{dos.nom} · {dos.adresse || '—'} · Profil : {PROFIL_RISQUE.find(p => p.id === (dos.profilRisque || profilRisque))?.label}</div>
          </div>
        </div>

        {/* 4 piliers du score */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Rentabilité', score: s.scoreRenta, max: 25, icon: '📈', detail: `Brut ${s.rendementBrut}% · Net ${s.rendementNet}%` },
            { label: 'Cashflow', score: s.scoreCash, max: 25, icon: '💰', detail: `${s.cashflowMensuel >= 0 ? '+' : ''}${s.cashflowMensuel}€/mois` },
            { label: 'Risques géo', score: s.scoreGeo, max: 25, icon: '⚠️', detail: geo ? `${geo.nbRisques} risques · Sisme ${geo.sismique}` : 'Non analysé' },
            { label: 'Structure', score: s.scoreStruct, max: 25, icon: '🏗️', detail: `Effort ${s.tauxEffort}% · Vac. ${dos.vacanceMois}m` },
          ].map(p => (
            <div key={p.label} style={{ ...CARD, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: scoreColor(p.score / p.max * 100) }} />
              <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: L.serif, color: scoreColor(p.score / p.max * 100) }}>{p.score}/{p.max}</div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>{p.label}</div>
              <div style={{ fontSize: 10, color: L.textSec, marginTop: 4 }}>{p.detail}</div>
            </div>
          ))}
        </div>

        {/* Chiffres clés */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Chiffres clés</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            {[
              ['Prix total', `${s.prixTotal.toLocaleString()} €`],
              ['Loyer annuel net', `${s.loyerAnnuel.toLocaleString()} €`],
              ['Charges annuelles', `${s.chargesAnnuelles.toLocaleString()} €`],
              ['Crédit annuel', `${s.creditAnnuel.toLocaleString()} €`],
              ['Cashflow annuel', `${s.cashflowAnnuel >= 0 ? '+' : ''}${s.cashflowAnnuel.toLocaleString()} €`],
              ['Rendement brut', `${s.rendementBrut} %`],
              ['Rendement net', `${s.rendementNet} %`],
              ['Taux d\'effort', `${s.tauxEffort} %`],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '8px 12px', background: '#FAFAF8', borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: L.textSec, marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Géorisques */}
        {geo && !geo.error && (
          <div style={{ ...CARD, marginBottom: 16, borderLeft: `4px solid ${geo.nbRisques > 5 ? '#DC2626' : geo.nbRisques > 2 ? '#D97706' : '#16A34A'}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>⚠️ Géorisques — {geo.commune} ({geo.codeInsee})</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              {[
                ['Risques identifiés', geo.nbRisques, geo.nbRisques > 5 ? '#DC2626' : geo.nbRisques > 2 ? '#D97706' : '#16A34A'],
                ['Zone sismique', geo.sismique, geo.sismique >= 4 ? '#DC2626' : geo.sismique >= 3 ? '#D97706' : '#16A34A'],
                ['Radon', `Classe ${geo.radon}`, geo.radon >= 3 ? '#DC2626' : geo.radon >= 2 ? '#D97706' : '#16A34A'],
                ['CATNAT', `${geo.nbCatnat} arrêtés`, geo.nbCatnat > 10 ? '#DC2626' : geo.nbCatnat > 5 ? '#D97706' : '#16A34A'],
              ].map(([k, v, c]) => (
                <div key={k} style={{ textAlign: 'center', padding: '8px', background: c + '10', borderRadius: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontSize: 10, color: L.textSec }}>{k}</div>
                </div>
              ))}
            </div>
            {geo.risques.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {geo.risques.slice(0, 8).map((r, i) => (
                  <span key={i} style={{ fontSize: 10, padding: '3px 8px', background: '#FEF2F2', color: '#DC2626', borderRadius: 4 }}>{r}</span>
                ))}
                {geo.risques.length > 8 && <span style={{ fontSize: 10, padding: '3px 8px', color: L.textSec }}>+{geo.risques.length - 8} autres</span>}
              </div>
            )}
          </div>
        )}

        {/* Recommandations automatiques */}
        <div style={{ ...CARD, borderLeft: `4px solid ${L.gold}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>💡 Recommandations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {s.cashflowMensuel < 0 && <div style={{ fontSize: 12, color: '#DC2626', padding: '6px 10px', background: '#FEF2F2', borderRadius: 6 }}>⚠️ Cashflow négatif — Négociez le prix ou augmentez le loyer cible.</div>}
            {s.tauxEffort > 80 && <div style={{ fontSize: 12, color: '#DC2626', padding: '6px 10px', background: '#FEF2F2', borderRadius: 6 }}>⚠️ Taux d'effort {s.tauxEffort}% — Le crédit absorbe presque tout le loyer.</div>}
            {s.rendementBrut < 4 && <div style={{ fontSize: 12, color: '#D97706', padding: '6px 10px', background: '#FFFBEB', borderRadius: 6 }}>📊 Rendement brut faible ({s.rendementBrut}%) — Envisagez une stratégie plus-value ou meublé.</div>}
            {geo && geo.nbRisques > 5 && <div style={{ fontSize: 12, color: '#D97706', padding: '6px 10px', background: '#FFFBEB', borderRadius: 6 }}>🌊 Zone à risques multiples ({geo.nbRisques}) — Vérifiez les assurances et le PLU.</div>}
            {geo && geo.sismique >= 4 && <div style={{ fontSize: 12, color: '#DC2626', padding: '6px 10px', background: '#FEF2F2', borderRadius: 6 }}>🔴 Zone sismique élevée ({geo.sismique}/5) — Vérifiez les normes parasismiques du bâtiment.</div>}
            {s.cashflowMensuel >= 100 && s.rendementNet >= 5 && <div style={{ fontSize: 12, color: '#16A34A', padding: '6px 10px', background: '#F0FDF4', borderRadius: 6 }}>✅ Cashflow positif + bon rendement — Excellent profil d'investissement.</div>}
            {dos.travaux > dos.prix * 0.15 && <div style={{ fontSize: 12, color: '#D97706', padding: '6px 10px', background: '#FFFBEB', borderRadius: 6 }}>🔧 Travaux importants ({Math.round(dos.travaux / dos.prix * 100)}% du prix) — Faites chiffrer par un pro avant de signer.</div>}
            {(!geo || geo.error) && dos.adresse && <div style={{ fontSize: 12, color: L.textSec, padding: '6px 10px', background: '#FAFAF8', borderRadius: 6 }}>ℹ️ Relancez l'analyse pour obtenir les données Géorisques.</div>}
            {s.total >= 65 && <div style={{ fontSize: 12, color: '#16A34A', padding: '6px 10px', background: '#F0FDF4', borderRadius: 6 }}>🏦 Prochaine étape : préparez votre dossier bancaire et lancez les visites.</div>}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
