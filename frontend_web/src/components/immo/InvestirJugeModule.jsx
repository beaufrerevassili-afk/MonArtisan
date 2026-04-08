import React, { useState } from 'react';
import L from '../../design/luxe';

const CARD = { background: L.white, border: `1px solid ${L.border}`, padding: '20px' };
const BTN = { padding: '8px 18px', background: L.noir, color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: L.font, transition: 'background .15s' };
const BTN_O = { ...BTN, background: 'transparent', color: L.text, border: `1px solid ${L.border}` };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${L.border}`, fontSize: 13, fontFamily: L.font, outline: 'none', boxSizing: 'border-box', background: L.white };
const LBL = { fontSize: 10, fontWeight: 600, color: L.textSec, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' };
const GEORISQUES_BASE = 'https://www.georisques.gouv.fr/api/v1';

const PROFIL_RISQUE = [
  { id: 'conservateur', label: 'Conservateur', icon: '🛡️', desc: 'Sécurité, cashflow positif', color: '#16A34A' },
  { id: 'equilibre', label: 'Équilibré', icon: '⚖️', desc: 'Bon compromis rendement/risque', color: '#2563EB' },
  { id: 'dynamique', label: 'Dynamique', icon: '🚀', desc: 'Rendement élevé, accepte du risque', color: '#D97706' },
];

function sc(s) { return s >= 70 ? L.green : s >= 45 ? '#D97706' : '#DC2626'; }
function sLabel(s) { return s >= 80 ? 'Excellente opportunité' : s >= 65 ? 'Bonne opportunité' : s >= 45 ? 'Opportunité moyenne' : s >= 25 ? 'Risquée' : 'À éviter'; }
function sVerdict(s) {
  if (s >= 80) return { emoji: '🟢', text: 'FONCEZ — Ce bien coche toutes les cases.' };
  if (s >= 65) return { emoji: '🟢', text: 'GO — Bonne opportunité, quelques points de vigilance.' };
  if (s >= 45) return { emoji: '🟡', text: 'À ÉTUDIER — Potentiel intéressant mais des risques.' };
  if (s >= 25) return { emoji: '🟠', text: 'PRUDENCE — Ratio risque/rendement défavorable.' };
  return { emoji: '🔴', text: 'PASSER — Trop de signaux négatifs.' };
}

function calcScore(dos, geo, profil) {
  const prixTotal = dos.prix + dos.fraisNotaire + dos.travaux;
  const loyerAn = dos.loyer * (12 - dos.vacanceMois);
  const chargesAn = (dos.charges + dos.taxeFonciere + dos.assurance) * 12;
  const creditAn = dos.mensualite * 12;
  const cfAn = loyerAn - chargesAn - creditAn;
  const cfMois = Math.round(cfAn / 12);
  const rdtBrut = prixTotal > 0 ? Math.round(dos.loyer * 12 / prixTotal * 10000) / 100 : 0;
  const rdtNet = prixTotal > 0 ? Math.round(loyerAn / prixTotal * 10000) / 100 : 0;
  const effort = dos.loyer > 0 ? Math.round(dos.mensualite / dos.loyer * 100) : 100;

  let r = 0;
  if (profil === 'conservateur') r = rdtNet >= 4 ? 25 : rdtNet >= 3 ? 18 : rdtNet >= 2 ? 10 : 5;
  else if (profil === 'equilibre') r = rdtNet >= 6 ? 25 : rdtNet >= 4 ? 18 : rdtNet >= 3 ? 10 : 5;
  else r = rdtNet >= 8 ? 25 : rdtNet >= 6 ? 20 : rdtNet >= 4 ? 12 : 5;

  let c = cfMois >= 200 ? 25 : cfMois >= 50 ? 20 : cfMois >= 0 ? 15 : cfMois >= -100 ? 8 : 0;
  if (profil === 'conservateur' && cfMois < 0) c = 0;

  let g = 25;
  if (geo) {
    if (geo.nbRisques > 8) g -= 15; else if (geo.nbRisques > 4) g -= 8; else if (geo.nbRisques > 2) g -= 3;
    if (geo.sismique >= 4) g -= 8; else if (geo.sismique >= 3) g -= 4;
    if (geo.radon >= 3) g -= 5; else if (geo.radon >= 2) g -= 2;
    if (geo.nbCatnat > 10) g -= 5; else if (geo.nbCatnat > 5) g -= 2;
    g = Math.max(0, g);
  }

  let st = 0;
  if (effort < 70) st += 10; else if (effort < 90) st += 5;
  if (dos.vacanceMois <= 1) st += 8; else if (dos.vacanceMois <= 2) st += 4;
  if (dos.travaux < dos.prix * 0.1) st += 7; else if (dos.travaux < dos.prix * 0.2) st += 3;

  return { total: Math.min(100, Math.max(0, r + c + Math.min(25, g) + st)), r, c, g: Math.min(25, g), st, rdtBrut, rdtNet, cfMois, cfAn, prixTotal, loyerAn, chargesAn, creditAn, effort };
}

async function fetchGeo(adresse) {
  try {
    const gR = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`);
    const gJ = await gR.json();
    if (!gJ.features?.length) return null;
    const code = gJ.features[0].properties.citycode;
    const commune = gJ.features[0].properties.city;
    const [risques, sism, radon, rga, catnat] = await Promise.all([
      fetch(`${GEORISQUES_BASE}/gaspar/risques?code_insee=${code}&page_size=50`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${GEORISQUES_BASE}/zonage_sismique?code_insee=${code}`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${GEORISQUES_BASE}/radon?code_insee=${code}`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${GEORISQUES_BASE}/rga?code_insee=${code}`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${GEORISQUES_BASE}/gaspar/catnat?code_insee=${code}&page_size=20`).then(r => r.json()).catch(() => ({ data: [] })),
    ]);
    return {
      commune, codeInsee: code,
      nbRisques: (risques.data?.[0]?.risques_detail || []).length,
      risques: (risques.data?.[0]?.risques_detail || []).map(r => r.libelle_risque_long || ''),
      sismique: parseInt(sism.data?.[0]?.code_zone) || 1,
      radon: parseInt(radon.data?.[0]?.classe_potentiel) || 1,
      argiles: rga.data?.[0]?.exposition || 'faible',
      nbCatnat: (catnat.data || []).length,
    };
  } catch { return null; }
}

/* ══ EXPORT PDF via window.print ══ */
function exportPDF(title, contentId) {
  const el = document.getElementById(contentId);
  if (!el) return;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
    body{font-family:Arial,sans-serif;padding:32px;color:#1a1a1a;font-size:13px;line-height:1.6}
    h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:20px 0 8px;border-bottom:1px solid #e5e5ea;padding-bottom:4px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
    .kpi{background:#f8f8f6;padding:10px 14px;border-radius:6px}
    .kpi .label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.05em}
    .kpi .val{font-size:18px;font-weight:700}
    .green{color:#16a34a}.orange{color:#d97706}.red{color:#dc2626}.blue{color:#2563eb}
    .tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;margin:2px}
    .tag-red{background:#fef2f2;color:#dc2626}.tag-green{background:#f0fdf4;color:#16a34a}.tag-orange{background:#fffbeb;color:#d97706}
    table{width:100%;border-collapse:collapse;margin:8px 0}td,th{text-align:left;padding:6px 10px;border-bottom:1px solid #e5e5ea;font-size:12px}
    @media print{body{padding:16px}}
  </style></head><body>${el.innerHTML}<script>setTimeout(()=>window.print(),300)</script></body></html>`);
  w.document.close();
}

export default function InvestirJugeModule({ data, setData, showToast }) {
  const [step, setStep] = useState('list');
  const [form, setForm] = useState({});
  const [formBanque, setFormBanque] = useState({});
  const [profilRisque, setProfilRisque] = useState('equilibre');
  const [geoLoading, setGeoLoading] = useState(false);
  const [analyseDossier, setAnalyseDossier] = useState(null);
  const [activeDoc, setActiveDoc] = useState('jugement'); // 'jugement' | 'banque' | 'checklist'
  const [checkedDocs, setCheckedDocs] = useState({});

  const dossiers = data.dossiers || [];

  const creerDossier = async () => {
    const d = {
      id: Date.now(), nom: form.nom || 'Sans nom', adresse: form.adresse || '',
      prix: Number(form.prix) || 0, fraisNotaire: Number(form.fraisNotaire) || 0, travaux: Number(form.travaux) || 0,
      loyer: Number(form.loyer) || 0, charges: Number(form.charges) || 0, taxeFonciere: Number(form.taxeFonciere) || 0,
      vacanceMois: Number(form.vacanceMois) || 1, assurance: Number(form.assurance) || 0,
      mensualite: Number(form.mensualite) || 0, dureeCredit: Number(form.dureeCredit) || 20, tauxCredit: Number(form.tauxCredit) || 2.5,
      strategie: form.strategie || 'Location nue', profilRisque, created: new Date().toISOString(),
      // Dossier banque
      banque: {
        revenusMensuels: Number(formBanque.revenus) || 0, chargesMensuelles: Number(formBanque.chargesPerso) || 0,
        apport: Number(formBanque.apport) || 0, epargne: Number(formBanque.epargne) || 0,
        situationPro: formBanque.situationPro || 'CDI', anciennete: Number(formBanque.anciennete) || 0,
        autresCredits: Number(formBanque.autresCredits) || 0, nbBiensExistants: Number(formBanque.nbBiens) || data.biens?.length || 0,
        loyersPercus: Number(formBanque.loyersPercus) || 0,
      },
    };
    setData(prev => ({ ...prev, dossiers: [d, ...(prev.dossiers || [])] }));
    showToast('Dossier créé — analyse en cours...');
    await lancerAnalyse(d);
  };

  async function lancerAnalyse(dos) {
    setGeoLoading(true);
    const geo = dos.adresse ? await fetchGeo(dos.adresse) : null;
    setGeoLoading(false);
    const score = calcScore(dos, geo, dos.profilRisque || profilRisque);
    const b = dos.banque || {};
    const revTotal = b.revenusMensuels + b.loyersPercus * 0.7;
    const chargesTotal = b.chargesMensuelles + b.autresCredits + dos.mensualite;
    const txEndettement = revTotal > 0 ? Math.round(chargesTotal / revTotal * 100) : 0;
    const resteAVivre = revTotal - chargesTotal;
    const capMens = Math.max(0, revTotal * 0.35 - (b.chargesMensuelles + b.autresCredits));
    const tM = 0.025 / 12; const dur = 240;
    const capEmprunt = capMens > 0 ? Math.round(capMens * (Math.pow(1 + tM, dur) - 1) / (tM * Math.pow(1 + tM, dur))) : 0;
    const scoreBanque = Math.min(100, Math.max(0,
      (txEndettement < 35 ? 30 : txEndettement < 50 ? 15 : 0) +
      (resteAVivre > 800 ? 25 : resteAVivre > 300 ? 15 : resteAVivre > 0 ? 5 : 0) +
      (b.apport >= dos.prix * 0.1 ? 20 : b.apport > 0 ? 10 : 0) +
      (['CDI', 'Fonctionnaire'].includes(b.situationPro) ? 15 : b.situationPro === 'Indépendant' && b.anciennete >= 3 ? 10 : 5) +
      (b.nbBiensExistants >= 3 ? 10 : b.nbBiensExistants >= 1 ? 5 : 0)
    ));

    setAnalyseDossier({ dossier: dos, geo, score, banque: { txEndettement, resteAVivre, capEmprunt, scoreBanque, revTotal, chargesTotal } });
    setStep('bilan'); setActiveDoc('jugement');
  }

  function supprimerDossier(id) {
    setData(d => ({ ...d, dossiers: (d.dossiers || []).filter(x => x.id !== id) }));
    showToast('Supprimé');
  }

  // ═══ LISTE ═══
  if (step === 'list') return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Investir — Juge de décision</h2>
      <p style={{ fontSize: 13, color: L.textSec, margin: '0 0 20px' }}>Créez un dossier complet (banque + analyse), verdict automatique en 5 minutes.</p>
      <button onClick={() => { setForm({}); setFormBanque({}); setStep('create'); }} style={{ ...BTN, padding: '12px 28px', marginBottom: 20 }}
        onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>
        + Nouveau dossier d'investissement
      </button>
      {dossiers.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 48, color: L.textSec }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Aucun dossier</div>
          <div style={{ fontSize: 12 }}>Créez votre premier dossier pour obtenir un verdict + dossier bancaire.</div>
        </div>
      ) : dossiers.map(dos => {
        const s = calcScore(dos, null, dos.profilRisque || 'equilibre');
        return (
          <div key={dos.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 16, borderLeft: `4px solid ${sc(s.total)}`, marginBottom: 8 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', border: `3px solid ${sc(s.total)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: sc(s.total) }}>{s.total}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{dos.nom}</div>
              <div style={{ fontSize: 11, color: L.textSec }}>{dos.adresse || '—'} · {dos.prix?.toLocaleString()}€ · {dos.strategie}</div>
              <div style={{ fontSize: 11, color: sc(s.total), fontWeight: 600, marginTop: 2 }}>{sLabel(s.total)} · CF {s.cfMois >= 0 ? '+' : ''}{s.cfMois}€/mois</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => lancerAnalyse(dos)} style={{ ...BTN, fontSize: 10, padding: '6px 14px' }} onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>Analyser</button>
              <button onClick={() => supprimerDossier(dos.id)} style={{ padding: '6px 10px', background: '#FEF2F2', color: '#DC2626', border: 'none', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ═══ CRÉATION (2 volets : bien + banque) ═══
  if (step === 'create') return (
    <div>
      <button onClick={() => setStep('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: L.gold, fontWeight: 600, marginBottom: 16, fontFamily: L.font }}>← Retour</button>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Nouveau dossier — 5 min chrono</h2>
      <p style={{ fontSize: 13, color: L.textSec, margin: '0 0 20px' }}>Remplissez les 2 volets, on génère automatiquement votre dossier bancaire + verdict d'opportunité.</p>

      {/* Profil risque */}
      <div style={{ marginBottom: 20 }}>
        <label style={LBL}>Profil investisseur</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {PROFIL_RISQUE.map(p => (
            <button key={p.id} onClick={() => setProfilRisque(p.id)}
              style={{ flex: 1, padding: '10px', border: `2px solid ${profilRisque === p.id ? p.color : L.border}`, background: profilRisque === p.id ? p.color + '10' : 'transparent', cursor: 'pointer', fontFamily: L.font, textAlign: 'center', transition: 'all .15s' }}>
              <div style={{ fontSize: 20 }}>{p.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: profilRisque === p.id ? p.color : L.text, marginTop: 2 }}>{p.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Volet 1 : Le bien */}
        <div style={{ flex: '1 1 340px', ...CARD }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🏠 Le bien</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ gridColumn: '1/-1' }}><label style={LBL}>Nom du projet</label><input value={form.nom || ''} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={INP} placeholder="T2 Nice Centre" /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={LBL}>Adresse (pour Géorisques auto)</label><input value={form.adresse || ''} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} style={INP} placeholder="12 rue de la Liberté, Nice" /></div>
            <div><label style={LBL}>Prix d'achat €</label><input type="number" value={form.prix || ''} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} style={INP} placeholder="180000" /></div>
            <div><label style={LBL}>Frais notaire €</label><input type="number" value={form.fraisNotaire || ''} onChange={e => setForm(f => ({ ...f, fraisNotaire: e.target.value }))} style={INP} placeholder="14000" /></div>
            <div><label style={LBL}>Travaux €</label><input type="number" value={form.travaux || ''} onChange={e => setForm(f => ({ ...f, travaux: e.target.value }))} style={INP} placeholder="5000" /></div>
            <div><label style={LBL}>Loyer mensuel €</label><input type="number" value={form.loyer || ''} onChange={e => setForm(f => ({ ...f, loyer: e.target.value }))} style={INP} placeholder="850" /></div>
            <div><label style={LBL}>Charges/mois €</label><input type="number" value={form.charges || ''} onChange={e => setForm(f => ({ ...f, charges: e.target.value }))} style={INP} placeholder="120" /></div>
            <div><label style={LBL}>Taxe foncière/mois €</label><input type="number" value={form.taxeFonciere || ''} onChange={e => setForm(f => ({ ...f, taxeFonciere: e.target.value }))} style={INP} placeholder="80" /></div>
            <div><label style={LBL}>Assurance PNO/mois €</label><input type="number" value={form.assurance || ''} onChange={e => setForm(f => ({ ...f, assurance: e.target.value }))} style={INP} placeholder="20" /></div>
            <div><label style={LBL}>Vacance (mois/an)</label><input type="number" value={form.vacanceMois || ''} onChange={e => setForm(f => ({ ...f, vacanceMois: e.target.value }))} style={INP} placeholder="1" /></div>
            <div><label style={LBL}>Mensualité crédit €</label><input type="number" value={form.mensualite || ''} onChange={e => setForm(f => ({ ...f, mensualite: e.target.value }))} style={INP} placeholder="750" /></div>
            <div><label style={LBL}>Stratégie</label>
              <select value={form.strategie || 'Location nue'} onChange={e => setForm(f => ({ ...f, strategie: e.target.value }))} style={INP}>
                {['Location nue', 'LMNP meublé', 'Colocation', 'Courte durée', 'Achat-revente', 'Division', 'Immeuble de rapport'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Volet 2 : Profil bancaire */}
        <div style={{ flex: '1 1 340px', ...CARD }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🏦 Votre profil bancaire</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={LBL}>Revenus mensuels nets €</label><input type="number" value={formBanque.revenus || ''} onChange={e => setFormBanque(f => ({ ...f, revenus: e.target.value }))} style={INP} placeholder="3500" /></div>
            <div><label style={LBL}>Charges perso/mois €</label><input type="number" value={formBanque.chargesPerso || ''} onChange={e => setFormBanque(f => ({ ...f, chargesPerso: e.target.value }))} style={INP} placeholder="500" /></div>
            <div><label style={LBL}>Apport disponible €</label><input type="number" value={formBanque.apport || ''} onChange={e => setFormBanque(f => ({ ...f, apport: e.target.value }))} style={INP} placeholder="25000" /></div>
            <div><label style={LBL}>Épargne résiduelle €</label><input type="number" value={formBanque.epargne || ''} onChange={e => setFormBanque(f => ({ ...f, epargne: e.target.value }))} style={INP} placeholder="15000" /></div>
            <div><label style={LBL}>Situation professionnelle</label>
              <select value={formBanque.situationPro || 'CDI'} onChange={e => setFormBanque(f => ({ ...f, situationPro: e.target.value }))} style={INP}>
                {['CDI', 'Fonctionnaire', 'Indépendant', 'CDD', 'Profession libérale', 'Retraité'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={LBL}>Ancienneté (années)</label><input type="number" value={formBanque.anciennete || ''} onChange={e => setFormBanque(f => ({ ...f, anciennete: e.target.value }))} style={INP} placeholder="5" /></div>
            <div><label style={LBL}>Autres crédits/mois €</label><input type="number" value={formBanque.autresCredits || ''} onChange={e => setFormBanque(f => ({ ...f, autresCredits: e.target.value }))} style={INP} placeholder="0" /></div>
            <div><label style={LBL}>Loyers déjà perçus/mois €</label><input type="number" value={formBanque.loyersPercus || ''} onChange={e => setFormBanque(f => ({ ...f, loyersPercus: e.target.value }))} style={INP} placeholder="0" /></div>
            <div><label style={LBL}>Nb biens existants</label><input type="number" value={formBanque.nbBiens || ''} onChange={e => setFormBanque(f => ({ ...f, nbBiens: e.target.value }))} style={INP} placeholder="0" /></div>
          </div>
        </div>
      </div>

      <button onClick={creerDossier} disabled={!form.prix || !form.loyer || geoLoading}
        style={{ ...BTN, width: '100%', padding: 14, marginTop: 20, fontSize: 14, background: L.gold, opacity: !form.prix || !form.loyer ? 0.5 : 1 }}>
        {geoLoading ? '🔍 Analyse Géorisques en cours...' : '⚡ Créer le dossier + Analyser automatiquement'}
      </button>
    </div>
  );

  // ═══ BILAN (2 documents) ═══
  if (step === 'bilan' && analyseDossier) {
    const { dossier: dos, geo, score: s, banque: bk } = analyseDossier;
    const verdict = sVerdict(s.total);
    const bkColor = sc(bk.scoreBanque);

    return (
      <div>
        <button onClick={() => { setStep('list'); setAnalyseDossier(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: L.gold, fontWeight: 600, marginBottom: 16, fontFamily: L.font }}>← Retour aux dossiers</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{dos.nom}</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setActiveDoc('jugement')} style={activeDoc === 'jugement' ? BTN : BTN_O}>📊 Verdict</button>
            <button onClick={() => setActiveDoc('banque')} style={activeDoc === 'banque' ? BTN : BTN_O}>🏦 Profil banque</button>
            <button onClick={() => setActiveDoc('checklist')} style={activeDoc === 'checklist' ? BTN : BTN_O}>📋 Dossier complet</button>
          </div>
        </div>

        {/* ══ DOC 1 : VERDICT D'OPPORTUNITÉ ══ */}
        {activeDoc === 'jugement' && <>
          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <button onClick={() => exportPDF(`Verdict - ${dos.nom}`, 'pdf-jugement')} style={{ ...BTN, fontSize: 11, padding: '6px 14px' }}
              onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>🖨️ Exporter / Imprimer</button>
          </div>
          <div id="pdf-jugement">
            {/* Score principal */}
            <div style={{ background: L.noir, color: '#fff', padding: 'clamp(20px,3vw,32px)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${sc(s.total)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: sc(s.total) }}>{s.total}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: L.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Verdict Freample</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{verdict.emoji} {sLabel(s.total)}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{verdict.text}</div>
              </div>
            </div>

            {/* 4 piliers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Rentabilité', score: s.r, icon: '📈', detail: `Brut ${s.rdtBrut}% · Net ${s.rdtNet}%` },
                { label: 'Cashflow', score: s.c, icon: '💰', detail: `${s.cfMois >= 0 ? '+' : ''}${s.cfMois}€/mois` },
                { label: 'Risques géo', score: s.g, icon: '⚠️', detail: geo ? `${geo.nbRisques} risques` : 'Non analysé' },
                { label: 'Structure', score: s.st, icon: '🏗️', detail: `Effort ${s.effort}%` },
              ].map(p => (
                <div key={p.label} style={{ ...CARD, textAlign: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: sc(p.score / 25 * 100) }} />
                  <div style={{ fontSize: 16 }}>{p.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: L.serif, color: sc(p.score / 25 * 100) }}>{p.score}/25</div>
                  <div style={{ fontSize: 10, fontWeight: 700 }}>{p.label}</div>
                  <div style={{ fontSize: 9, color: L.textSec, marginTop: 2 }}>{p.detail}</div>
                </div>
              ))}
            </div>

            {/* Chiffres clés */}
            <div style={{ ...CARD, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Chiffres clés</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
                {[['Prix total', `${s.prixTotal.toLocaleString()} €`], ['Loyer annuel', `${s.loyerAn.toLocaleString()} €`], ['Charges annuelles', `${s.chargesAn.toLocaleString()} €`], ['Crédit annuel', `${s.creditAn.toLocaleString()} €`], ['Cashflow annuel', `${s.cfAn >= 0 ? '+' : ''}${s.cfAn.toLocaleString()} €`], ['Rendement brut', `${s.rdtBrut}%`], ['Rendement net', `${s.rdtNet}%`], ['Taux effort', `${s.effort}%`]].map(([k, v]) => (
                  <div key={k} style={{ padding: '6px 10px', background: '#FAFAF8', borderRadius: 4 }}>
                    <div style={{ fontSize: 9, color: L.textSec }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Géorisques */}
            {geo && <div style={{ ...CARD, marginBottom: 12, borderLeft: `4px solid ${geo.nbRisques > 5 ? '#DC2626' : geo.nbRisques > 2 ? '#D97706' : '#16A34A'}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>⚠️ Géorisques — {geo.commune}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {[['Risques', geo.nbRisques], ['Sismique', `Zone ${geo.sismique}`], ['Radon', `Classe ${geo.radon}`], ['CATNAT', geo.nbCatnat]].map(([k, v]) => (
                  <span key={k} style={{ fontSize: 11, padding: '4px 10px', background: '#FAFAF8', borderRadius: 4 }}>{k} : <strong>{v}</strong></span>
                ))}
              </div>
              {geo.risques.length > 0 && <div style={{ fontSize: 11, color: L.textSec }}>{geo.risques.slice(0, 6).join(' · ')}{geo.risques.length > 6 ? ` +${geo.risques.length - 6}` : ''}</div>}
            </div>}

            {/* Recommandations */}
            <div style={{ ...CARD, borderLeft: `4px solid ${L.gold}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>💡 Recommandations</div>
              {s.cfMois < 0 && <div style={{ fontSize: 12, color: '#DC2626', padding: '4px 8px', background: '#FEF2F2', borderRadius: 4, marginBottom: 4 }}>⚠️ Cashflow négatif — négociez le prix ou le loyer.</div>}
              {s.effort > 80 && <div style={{ fontSize: 12, color: '#DC2626', padding: '4px 8px', background: '#FEF2F2', borderRadius: 4, marginBottom: 4 }}>⚠️ Taux d'effort {s.effort}% — le crédit absorbe presque tout.</div>}
              {s.rdtBrut < 4 && <div style={{ fontSize: 12, color: '#D97706', padding: '4px 8px', background: '#FFFBEB', borderRadius: 4, marginBottom: 4 }}>📊 Rendement faible — envisagez meublé ou courte durée.</div>}
              {geo && geo.nbRisques > 5 && <div style={{ fontSize: 12, color: '#D97706', padding: '4px 8px', background: '#FFFBEB', borderRadius: 4, marginBottom: 4 }}>🌊 Zone multi-risques — vérifiez assurances et PLU.</div>}
              {s.cfMois >= 100 && s.rdtNet >= 5 && <div style={{ fontSize: 12, color: '#16A34A', padding: '4px 8px', background: '#F0FDF4', borderRadius: 4, marginBottom: 4 }}>✅ Cashflow positif + bon rendement — excellent profil.</div>}
              {s.total >= 65 && <div style={{ fontSize: 12, color: '#16A34A', padding: '4px 8px', background: '#F0FDF4', borderRadius: 4, marginBottom: 4 }}>🏦 Prochaine étape : préparez le dossier bancaire (onglet ci-dessus).</div>}
            </div>
          </div>
        </>}

        {/* ══ DOC 2 : DOSSIER BANCAIRE ══ */}
        {activeDoc === 'banque' && <>
          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <button onClick={() => exportPDF(`Dossier Bancaire - ${dos.nom}`, 'pdf-banque')} style={{ ...BTN, fontSize: 11, padding: '6px 14px' }}
              onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>🖨️ Exporter / Imprimer</button>
          </div>
          <div id="pdf-banque">
            {/* Score bancabilité */}
            <div style={{ background: L.noir, color: '#fff', padding: 'clamp(20px,3vw,32px)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${bkColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: bkColor }}>{bk.scoreBanque}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: L.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Score bancabilité</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{bk.scoreBanque >= 70 ? 'Dossier solide' : bk.scoreBanque >= 40 ? 'Dossier à renforcer' : 'Dossier fragile'}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Profil : {dos.banque?.situationPro} · {dos.banque?.anciennete || 0} an(s) ancienneté</div>
              </div>
            </div>

            {/* KPIs banquier */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
              {[
                { l: 'Taux endettement', v: `${bk.txEndettement}%`, ok: bk.txEndettement < 35, warn: bk.txEndettement < 50, note: '< 35% requis' },
                { l: 'Reste à vivre', v: `${bk.resteAVivre}€/mois`, ok: bk.resteAVivre > 800, warn: bk.resteAVivre > 0, note: '> 800€ idéal' },
                { l: 'Apport', v: `${(dos.banque?.apport || 0).toLocaleString()}€`, ok: (dos.banque?.apport || 0) >= dos.prix * 0.1, warn: (dos.banque?.apport || 0) > 0, note: '> 10% du prix' },
                { l: 'Épargne résiduelle', v: `${(dos.banque?.epargne || 0).toLocaleString()}€`, ok: (dos.banque?.epargne || 0) > 10000, warn: (dos.banque?.epargne || 0) > 0, note: 'Matelas de sécurité' },
                { l: 'Capacité emprunt', v: `${(bk.capEmprunt / 1000).toFixed(0)}k€`, ok: bk.capEmprunt > dos.prix, warn: bk.capEmprunt > 50000, note: '20 ans, 2.5%' },
                { l: 'Revenus retenus', v: `${bk.revTotal}€/mois`, ok: true, warn: true, note: 'Salaire + 70% loyers' },
              ].map(k => (
                <div key={k.l} style={{ ...CARD, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.ok ? L.green : k.warn ? '#D97706' : '#DC2626' }} />
                  <div style={{ fontSize: 9, color: L.textSec, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: L.serif, color: k.ok ? L.green : k.warn ? '#D97706' : '#DC2626' }}>{k.v}</div>
                  <div style={{ fontSize: 9, color: L.textSec, marginTop: 2 }}>{k.note}</div>
                </div>
              ))}
            </div>

            {/* Résumé du projet */}
            <div style={{ ...CARD, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Résumé du projet</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <tbody>
                  {[
                    ['Bien', dos.nom], ['Adresse', dos.adresse || '—'], ['Prix d\'achat', `${dos.prix.toLocaleString()} €`],
                    ['Frais de notaire', `${dos.fraisNotaire.toLocaleString()} €`], ['Travaux', `${dos.travaux.toLocaleString()} €`],
                    ['Coût total', `${s.prixTotal.toLocaleString()} €`], ['Apport', `${(dos.banque?.apport || 0).toLocaleString()} €`],
                    ['Montant emprunté', `${(s.prixTotal - (dos.banque?.apport || 0)).toLocaleString()} €`],
                    ['Mensualité crédit', `${dos.mensualite} €/mois`], ['Stratégie', dos.strategie],
                    ['Loyer prévu', `${dos.loyer} €/mois`], ['Rendement brut', `${s.rdtBrut}%`], ['Cashflow net', `${s.cfMois >= 0 ? '+' : ''}${s.cfMois} €/mois`],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ padding: '6px 10px', borderBottom: `1px solid ${L.border}`, color: L.textSec }}>{k}</td>
                      <td style={{ padding: '6px 10px', borderBottom: `1px solid ${L.border}`, fontWeight: 600, textAlign: 'right' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Conseils pour la banque */}
            <div style={{ ...CARD, borderLeft: `4px solid ${L.gold}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>💡 Conseils pour le rendez-vous banque</div>
              {bk.txEndettement >= 35 && <div style={{ fontSize: 12, color: '#DC2626', padding: '4px 8px', background: '#FEF2F2', borderRadius: 4, marginBottom: 4 }}>⚠️ Endettement à {bk.txEndettement}% — proposez un apport plus important ou une durée plus longue.</div>}
              {(dos.banque?.apport || 0) < dos.prix * 0.1 && <div style={{ fontSize: 12, color: '#D97706', padding: '4px 8px', background: '#FFFBEB', borderRadius: 4, marginBottom: 4 }}>💰 Apport &lt; 10% — les banques préfèrent au moins 10% du prix d'achat.</div>}
              {bk.resteAVivre < 500 && <div style={{ fontSize: 12, color: '#D97706', padding: '4px 8px', background: '#FFFBEB', borderRadius: 4, marginBottom: 4 }}>📉 Reste à vivre faible — la banque sera vigilante sur votre capacité de remboursement.</div>}
              {dos.banque?.situationPro === 'CDI' && <div style={{ fontSize: 12, color: '#16A34A', padding: '4px 8px', background: '#F0FDF4', borderRadius: 4, marginBottom: 4 }}>✅ CDI — votre situation professionnelle est un atout pour le dossier.</div>}
              {(dos.banque?.nbBiensExistants || 0) >= 2 && <div style={{ fontSize: 12, color: '#16A34A', padding: '4px 8px', background: '#F0FDF4', borderRadius: 4, marginBottom: 4 }}>✅ Expérience investisseur ({dos.banque.nbBiensExistants} biens) — valorisez votre track record.</div>}
              {s.cfMois > 0 && <div style={{ fontSize: 12, color: '#16A34A', padding: '4px 8px', background: '#F0FDF4', borderRadius: 4, marginBottom: 4 }}>✅ Cashflow positif — argument fort : le bien s'autofinance.</div>}
              <div style={{ fontSize: 12, color: L.textSec, padding: '4px 8px', background: '#FAFAF8', borderRadius: 4, marginTop: 4 }}>📋 Apportez : 3 derniers bulletins de salaire, avis d'imposition, relevés bancaires 3 mois, compromis de vente, simulation crédit.</div>
            </div>
          </div>
        </>}

        {/* ══ DOC 3 : DOSSIER BANCAIRE COMPLET — CHECKLIST ══ */}
        {activeDoc === 'checklist' && (() => {
          const b = dos.banque || {};
          const hasSCI = dos.strategie?.includes('SCI') || data.scis?.length > 0;
          const hasLocsExistants = (b.nbBiensExistants || 0) > 0;
          const isIndep = ['Indépendant', 'Profession libérale'].includes(b.situationPro);
          const isCDD = b.situationPro === 'CDD';
          const hasTravaux = dos.travaux > 0;
          const hasCopro = true; // par défaut on inclut

          const DOSSIER_SECTIONS = [
            { id: 'identite', title: 'Pièces d\'identité', icon: '🪪', items: [
              { id: 'cni', label: 'Carte nationale d\'identité ou passeport (recto-verso, en cours de validité)', auto: false },
              { id: 'domicile', label: 'Justificatif de domicile < 3 mois (facture EDF, eau ou quittance de loyer)', auto: false },
              { id: 'famille', label: 'Livret de famille ou certificat de PACS (si co-emprunteur)', auto: false, optional: true },
            ]},
            { id: 'revenus', title: 'Justificatifs de revenus', icon: '💼', items: [
              { id: 'bulletins', label: '3 derniers bulletins de salaire (chaque emprunteur)', auto: false },
              { id: 'avis_impo', label: '2 derniers avis d\'imposition (impots.gouv.fr)', auto: false },
              { id: 'contrat_travail', label: `Contrat de travail — ${b.situationPro || 'CDI'}${isCDD ? ' + historique de missions' : ''}`, auto: !!b.situationPro, autoValue: b.situationPro },
              { id: 'attestation_emp', label: `Attestation employeur (contrat, ancienneté${b.anciennete ? ` : ${b.anciennete} an(s)` : ''}, salaire${b.revenusMensuels ? ` : ${b.revenusMensuels}€` : ''})`, auto: !!(b.anciennete || b.revenusMensuels), autoValue: `${b.situationPro} · ${b.anciennete || '?'} ans · ${b.revenusMensuels || '?'}€/mois` },
              ...(hasLocsExistants ? [{ id: 'baux_existants', label: `Baux en cours + relevés de loyers perçus (${b.nbBiensExistants} bien(s), ${b.loyersPercus || 0}€/mois)`, auto: true, autoValue: `${b.nbBiensExistants} biens · ${b.loyersPercus}€/mois` }] : []),
              ...(isIndep ? [{ id: 'bilans', label: '3 derniers bilans comptables + liasse fiscale', auto: false }] : []),
            ]},
            { id: 'comptes', title: 'Relevés de comptes et épargne', icon: '🏦', items: [
              { id: 'releves_courant', label: '3 derniers relevés de tous les comptes courants (gestion saine, sans découvert)', auto: false },
              { id: 'releves_epargne', label: `Relevés d'épargne (livret A, PEL, assurance-vie…) — ${b.epargne ? `${b.epargne.toLocaleString()}€ disponibles` : 'à joindre'}`, auto: !!b.epargne, autoValue: `${b.epargne?.toLocaleString() || 0}€` },
              { id: 'apport', label: `Justificatif d'apport personnel — ${b.apport ? `${b.apport.toLocaleString()}€ (${dos.prix > 0 ? Math.round(b.apport / dos.prix * 100) : 0}% du prix)` : 'virement ou attestation notariale'}`, auto: !!b.apport, autoValue: `${b.apport?.toLocaleString() || 0}€ · ${dos.prix > 0 ? Math.round((b.apport || 0) / dos.prix * 100) : 0}% du prix` },
              ...(b.autresCredits > 0 ? [{ id: 'amortissement', label: `Tableaux d'amortissement des crédits en cours (${b.autresCredits}€/mois)`, auto: true, autoValue: `${b.autresCredits}€/mois` }] : []),
            ]},
            { id: 'bien', title: 'Documents sur le bien', icon: '🏠', items: [
              { id: 'compromis', label: 'Compromis de vente signé — pièce centrale du dossier', auto: false },
              { id: 'diagnostics', label: 'Diagnostics techniques obligatoires (DPE, amiante, plomb, termites…)', auto: false },
              { id: 'plan', label: 'Plan du bien avec superficie loi Carrez', auto: false },
              ...(hasTravaux ? [{ id: 'devis_travaux', label: `Devis artisans pour travaux prévus (${dos.travaux.toLocaleString()}€)${dos.strategie?.includes('éco') ? ' — artisans RGE pour éco-PTZ' : ''}`, auto: true, autoValue: `${dos.travaux.toLocaleString()}€` }] : []),
              ...(hasCopro ? [
                { id: 'pv_ag', label: '3 derniers PV d\'assemblée générale de copropriété', auto: false },
                { id: 'reglement_copro', label: 'Règlement de copropriété', auto: false },
              ] : []),
            ]},
            { id: 'analyse', title: 'Analyse financière du projet', icon: '📊', items: [
              { id: 'note_presentation', label: `Note de présentation (1-2 pages) : localisation, stratégie ${dos.strategie || 'locative'}, loyer visé ${dos.loyer}€, profil locataire`, auto: true, autoValue: `${dos.nom} · ${dos.adresse || '—'} · ${dos.strategie} · ${dos.loyer}€/mois` },
              { id: 'tableau_renta', label: `Tableau de rentabilité : brut ${s.rdtBrut}%, net ${s.rdtNet}%, cashflow ${s.cfMois >= 0 ? '+' : ''}${s.cfMois}€/mois, effort ${s.effort}%`, auto: true, autoValue: 'Généré automatiquement par Freample' },
              { id: 'etude_marche', label: 'Étude de marché locatif : loyers comparables, tension locative du secteur', auto: false },
              { id: 'simulation', label: `Simulation de financement : ${(s.prixTotal - (b.apport || 0)).toLocaleString()}€ empruntés, ${dos.mensualite}€/mois, reste à vivre ${bk.resteAVivre}€`, auto: true, autoValue: 'Généré automatiquement' },
              ...(hasLocsExistants ? [{ id: 'bail_existant', label: 'Bail en cours avec quittances de loyer', auto: false }] : [{ id: 'modele_bail', label: 'Modèle de bail envisagé', auto: false }]),
            ]},
            ...(hasSCI ? [{ id: 'juridique', title: 'Montage juridique et fiscal', icon: '⚖️', items: [
              { id: 'statuts_sci', label: 'Statuts de la SCI + Kbis + répartition des parts', auto: false },
              { id: 'regime_fiscal', label: `Régime fiscal choisi : ${dos.strategie || '—'} — impact fiscal estimé`, auto: !!dos.strategie, autoValue: dos.strategie },
              { id: 'justif_apport', label: `Justificatif apport : ${(b.apport || 0).toLocaleString()}€ (virement ou attestation notariale) — visez ${dos.prix > 0 && (b.apport || 0) / dos.prix < 0.1 ? '⚠️ < 10%, augmentez si possible' : (b.apport || 0) / dos.prix >= 0.2 ? '✅ > 20%, excellent' : '10-20%'}`, auto: !!b.apport },
            ]}] : [{ id: 'juridique', title: 'Montage juridique et fiscal', icon: '⚖️', items: [
              { id: 'regime_fiscal', label: `Régime fiscal : ${dos.strategie || '—'}`, auto: !!dos.strategie, autoValue: dos.strategie },
              { id: 'justif_apport', label: `Justificatif apport : ${(b.apport || 0).toLocaleString()}€ — visez min. 10% du prix`, auto: !!b.apport },
            ]}]),
          ];

          const totalItems = DOSSIER_SECTIONS.reduce((s, sec) => s + sec.items.length, 0);
          const autoItems = DOSSIER_SECTIONS.reduce((s, sec) => s + sec.items.filter(it => it.auto).length, 0);
          const checkedCount = Object.values(checkedDocs).filter(Boolean).length;
          const pct = Math.round((checkedCount + autoItems) / totalItems * 100);

          return <>
            <div style={{ textAlign: 'right', marginBottom: 12 }}>
              <button onClick={() => exportPDF(`Dossier Bancaire Complet - ${dos.nom}`, 'pdf-checklist')} style={{ ...BTN, fontSize: 11, padding: '6px 14px' }}
                onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>🖨️ Exporter / Imprimer</button>
            </div>
            <div id="pdf-checklist">
              {/* Progression */}
              <div style={{ ...CARD, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Dossier bancaire — {dos.nom}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? L.green : L.gold }}>{checkedCount + autoItems}/{totalItems} pièces</span>
                  </div>
                  <div style={{ height: 6, background: '#E8E6E1', borderRadius: 3 }}>
                    <div style={{ height: 6, background: pct === 100 ? L.green : L.gold, borderRadius: 3, width: `${pct}%`, transition: 'width .3s' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11 }}>
                    <span style={{ color: L.green }}>✓ {autoItems} pré-remplis automatiquement</span>
                    <span style={{ color: L.gold }}>{checkedCount} validés manuellement</span>
                    <span style={{ color: L.textSec }}>{totalItems - autoItems - checkedCount} restants</span>
                  </div>
                </div>
                <span style={{ fontSize: 24, fontWeight: 500, fontFamily: L.serif, color: pct === 100 ? L.green : L.text }}>{pct}%</span>
              </div>

              {/* Sections */}
              {DOSSIER_SECTIONS.map(sec => (
                <div key={sec.id} style={{ ...CARD, marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{sec.icon}</span> {sec.title}
                    <span style={{ fontSize: 10, color: L.textSec, fontWeight: 400, marginLeft: 'auto' }}>{sec.items.filter(it => it.auto || checkedDocs[it.id]).length}/{sec.items.length}</span>
                  </div>
                  {sec.items.map(it => {
                    const done = it.auto || checkedDocs[it.id];
                    return (
                      <div key={it.id} onClick={() => { if (!it.auto) setCheckedDocs(prev => ({ ...prev, [it.id]: !prev[it.id] })); }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', borderBottom: `1px solid ${L.border}`, cursor: it.auto ? 'default' : 'pointer', background: done ? '#F0FDF408' : 'transparent', transition: 'background .15s' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${done ? L.green : '#E8E6E1'}`, background: done ? L.green : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1, transition: 'all .15s' }}>
                          {done ? '✓' : ''}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 12, color: done ? L.green : L.text, textDecoration: done ? 'line-through' : 'none' }}>{it.label}</span>
                          {it.auto && <div style={{ fontSize: 10, color: L.gold, fontWeight: 600, marginTop: 2 }}>⚡ Pré-rempli depuis votre dossier Freample{it.autoValue ? ` : ${it.autoValue}` : ''}</div>}
                          {it.optional && <span style={{ fontSize: 9, color: L.textSec, marginLeft: 6 }}>(si applicable)</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Conseil final */}
              <div style={{ borderLeft: `3px solid ${L.gold}`, paddingLeft: 16, marginTop: 16 }}>
                <p style={{ fontSize: 13, fontStyle: 'italic', color: L.text, lineHeight: 1.7, margin: 0 }}>
                  Un dossier complet et bien présenté fait gagner du temps à votre conseiller bancaire et augmente vos chances d'obtenir un taux favorable. Les éléments marqués ⚡ sont déjà calculés par Freample — imprimez ce document et joignez les pièces restantes.
                </p>
              </div>
            </div>
          </>;
        })()}
      </div>
    );
  }

  return null;
}
