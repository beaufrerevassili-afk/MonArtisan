// ============================================================
//  OnboardingWizard — Configuration guidée première connexion
//  SCI | Chef d'entreprise BTP | Auto-entrepreneur
// ============================================================
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import L from '../../design/luxe';
import { CORPS_METIER_BTP } from '../../utils/profilEntreprise';

const STORAGE_KEY = 'freample_onboarding_done';
const INP = { width: '100%', padding: '12px 14px', border: `1px solid ${L.border}`, fontSize: 14, fontFamily: L.font, outline: 'none', boxSizing: 'border-box', background: L.white, borderRadius: 0 };
const LBL = { fontSize: 11, fontWeight: 600, color: L.textSec, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' };

export function isOnboardingDone() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function markOnboardingDone() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

// ── Détecte le type d'onboarding selon le user ──
export function getOnboardingType(user) {
  if (!user) return null;
  if (user.secteur === 'immo' || user.entrepriseType === 'sci') return 'sci';
  if (user.entrepriseType === 'ae') return 'ae';
  if (user.role === 'patron' && user.secteur === 'btp') return 'patron';
  return null; // pas d'onboarding pour client, salarié, admin
}

// ══════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════
export default function OnboardingWizard({ type, onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({});
  const u = (updates) => setForm(f => ({ ...f, ...updates }));

  const totalSteps = type === 'sci' ? 4 : 3;
  const progress = Math.round((step / totalSteps) * 100);

  function finish() {
    // Sauvegarder les données dans le localStorage approprié
    if (type === 'sci') saveSCI();
    if (type === 'patron') savePatron();
    if (type === 'ae') saveAE();
    markOnboardingDone();
    onComplete?.();
  }

  function saveSCI() {
    const existing = (() => { try { return JSON.parse(localStorage.getItem('freample_immo_data')); } catch { return null; } })();
    const sciId = Date.now();
    const bienId = sciId + 1;
    const locId = sciId + 2;
    const data = {
      ...(existing || {}),
      scis: [...(existing?.scis || []), {
        id: sciId, nom: form.sciNom || 'Ma SCI', type: form.sciType || 'IR',
        parts: 100, tva: false, cloture: '12-31', siret: form.sciSiret || '',
      }],
      biens: form.bienAdresse ? [...(existing?.biens || []), {
        id: bienId, sciId, nom: form.bienNom || 'Mon bien', type: form.bienType || 'Appartement',
        adresse: form.bienAdresse || '', ville: form.bienVille || '', codePostal: form.bienCP || '', arrondissement: Number(form.bienArr) || null,
        surface: Number(form.bienSurface) || 0, pieces: Number(form.bienPieces) || 0,
        prixAchat: Number(form.bienPrix) || 0, fraisNotaire: 0, travaux: 0,
        dateAcquisition: '', valeur: Number(form.bienPrix) || 0, loyer: Number(form.bienLoyer) || 0,
        autresRevenus: 0, charges: 0, chargesNonRecup: 0, vacanceLocative: 0,
        locataireId: form.locNom ? locId : null, dpe: form.bienDPE || 'D',
        assurance: { pno: 0, gli: 0 }, taxeFonciere: 0,
      }] : (existing?.biens || []),
      locataires: form.locNom ? [...(existing?.locataires || []), {
        id: locId, nom: form.locNom || '', prenom: form.locPrenom || '',
        email: form.locEmail || '', tel: '',
        debut: form.locDebut || new Date().toISOString().slice(0, 10),
        fin: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        depot: Number(form.locDepot) || 0,
      }] : (existing?.locataires || []),
      paiements: existing?.paiements || [],
      depenses: existing?.depenses || [],
      credits: existing?.credits || [],
      associes: existing?.associes || [],
      banque: existing?.banque || [],
      travaux: existing?.travaux || [],
      candidatures: [],
      courriers: [],
      compteCourant: [],
      objectifs: existing?.objectifs || { patrimoine: 500000, biens: 5, cashflow: 2000, rendement: 7, horizon: '2030-12-31' },
      nextId: (existing?.nextId || 20) + 10,
    };
    localStorage.setItem('freample_immo_data', JSON.stringify(data));
  }

  function savePatron() {
    // Fusionner avec le profil existant (ne pas écraser les champs déjà remplis)
    const existant = (() => { try { return JSON.parse(localStorage.getItem('freample_profil_patron') || '{}'); } catch { return {}; } })();
    const profil = {
      ...existant,
      nom: form.entrepriseNom || existant.nom || '',
      siret: form.entrepriseSiret || existant.siret || '',
      metier: (form.entrepriseMetiers?.length > 0 ? form.entrepriseMetiers[0] : form.entrepriseMetier) || existant.metier || '',
      metiers: form.entrepriseMetiers?.length > 0 ? form.entrepriseMetiers : (existant.metiers || (form.entrepriseMetier ? [form.entrepriseMetier] : [])),
      decennale: form.entrepriseDecennale || existant.decennale || '',
      forme: existant.forme || 'SAS',
      regimeTVA: existant.regimeTVA || 'standard',
    };
    localStorage.setItem('freample_profil_patron', JSON.stringify(profil));
    // Si un chantier est créé, l'ajouter aux projets
    if (form.chantierClient) {
      const projets = (() => { try { return JSON.parse(localStorage.getItem('freample_projets') || '[]'); } catch { return []; } })();
      projets.push({ id: Date.now(), metier: (form.entrepriseMetiers?.[0] || form.entrepriseMetier || 'BTP'), titre: form.chantierType || 'Chantier', description: `Client : ${form.chantierClient}`, ville: '', budget: Number(form.chantierBudget) || 0, urgence: 'normal', statut: 'en_cours', date: new Date().toISOString().slice(0, 10), nbOffres: 0 });
      localStorage.setItem('freample_projets', JSON.stringify(projets));
    }
  }

  function saveAE() {
    // Sauver le profil AE dans la bonne clé (freample_ae_profil) - fusion avec existant
    const existant = (() => { try { return JSON.parse(localStorage.getItem('freample_ae_profil') || '{}'); } catch { return {}; } })();
    const profil = {
      ...existant,
      activite: form.aeType || existant.activite || 'services',
      metiers: existant.metiers || [form.aeMetier || 'Plomberie'],
      forme: 'Auto-entrepreneur',
      regimeTVA: existant.regimeTVA || 'franchise',
    };
    localStorage.setItem('freample_ae_profil', JSON.stringify(profil));
    // CA antérieur éventuellement reporté dans les factures
    if (form.aeCA && Number(form.aeCA) > 0) {
      const existingData = (() => { try { return JSON.parse(localStorage.getItem('freample_ae_data') || '{}'); } catch { return {}; } })();
      const factures = existingData.factures || [];
      factures.push({ id: Date.now(), numero: 'FAC-' + new Date().getFullYear() + '-001', client: 'CA antérieur', objet: 'Chiffre d\'affaires déjà réalisé', montant: Number(form.aeCA), date: new Date().toISOString().slice(0, 10), statut: 'payee' });
      localStorage.setItem('freample_ae_data', JSON.stringify({ ...existingData, factures }));
    }
  }

  // ══════════════════════════════════════
  //  RENDU
  // ══════════════════════════════════════
  return (
    <div style={{ position: 'fixed', inset: 0, background: L.bg, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: L.font }}>
      <div style={{ width: '100%', maxWidth: 520, padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: L.text, letterSpacing: '-0.04em' }}>Freample<span style={{ color: L.gold }}>.</span></span>
        </div>

        {/* Barre de progression */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ height: 3, background: L.border, borderRadius: 2 }}>
            <div style={{ height: 3, background: L.gold, borderRadius: 2, width: `${progress}%`, transition: 'width .4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: L.textLight }}>Étape {step}/{totalSteps}</span>
            <button onClick={() => { markOnboardingDone(); onComplete?.(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: L.textLight, fontFamily: L.font, textDecoration: 'underline' }}>Je configure plus tard</button>
          </div>
        </div>

        {/* ═══ SCI ═══ */}
        {type === 'sci' && step === 1 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 300, fontFamily: L.serif, fontStyle: 'italic', color: L.text, margin: '0 0 6px' }}>Bienvenue sur <span style={{ fontWeight: 700, fontStyle: 'normal' }}>Freample</span></h1>
            <p style={{ fontSize: 14, color: L.textLight, margin: '0 0 28px' }}>Configurons votre espace de gestion SCI en quelques minutes.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={LBL}>Nom de votre SCI</label><input value={form.sciNom || ''} onChange={e => u({ sciNom: e.target.value })} placeholder="SCI Riviera" style={INP} /></div>
              <div>
                <label style={LBL}>Régime fiscal</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ v: 'IR', label: 'IR — Impôt sur le revenu', desc: 'Les revenus remontent sur votre déclaration personnelle' }, { v: 'IS', label: 'IS — Impôt sur les sociétés', desc: 'La SCI paie l\'impôt, amortissement possible' }].map(r => (
                    <button key={r.v} onClick={() => u({ sciType: r.v })}
                      style={{ flex: 1, padding: '14px 12px', border: `1px solid ${(form.sciType || 'IR') === r.v ? L.gold : L.border}`, background: (form.sciType || 'IR') === r.v ? L.cream : 'transparent', cursor: 'pointer', fontFamily: L.font, textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: (form.sciType || 'IR') === r.v ? L.gold : L.text }}>{r.v}</div>
                      <div style={{ fontSize: 11, color: L.textLight, marginTop: 2 }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div><label style={LBL}>SIRET (optionnel)</label><input value={form.sciSiret || ''} onChange={e => u({ sciSiret: e.target.value })} placeholder="123 456 789 00012" style={INP} /></div>
            </div>
            <button onClick={() => { if (form.sciNom) setStep(2); }} disabled={!form.sciNom}
              style={{ width: '100%', marginTop: 24, padding: '14px', background: form.sciNom ? L.noir : L.border, color: form.sciNom ? '#fff' : L.textLight, border: 'none', fontSize: 14, fontWeight: 600, cursor: form.sciNom ? 'pointer' : 'default', fontFamily: L.font, transition: 'background .2s' }}>
              Continuer
            </button>
          </div>
        )}

        {type === 'sci' && step === 2 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 300, fontFamily: L.serif, fontStyle: 'italic', color: L.text, margin: '0 0 6px' }}>Votre premier <span style={{ fontWeight: 700, fontStyle: 'normal' }}>bien</span></h1>
            <p style={{ fontSize: 14, color: L.textLight, margin: '0 0 28px' }}>Ajoutez un bien pour voir votre dashboard se remplir.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={LBL}>Nom du bien</label><input value={form.bienNom || ''} onChange={e => u({ bienNom: e.target.value })} placeholder="Appt Liberté" style={INP} /></div>
                <div><label style={LBL}>Type</label>
                  <select value={form.bienType || 'Appartement'} onChange={e => u({ bienType: e.target.value })} style={INP}>
                    {['Appartement', 'Studio', 'Maison', 'Local commercial', 'Parking'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={LBL}>Adresse</label><input value={form.bienAdresse || ''} onChange={e => u({ bienAdresse: e.target.value })} placeholder="24 rue de la Liberté" style={INP} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px', gap: 10 }}>
                <div><label style={LBL}>Code postal</label><input value={form.bienCP || ''} onChange={e => u({ bienCP: e.target.value })} placeholder="06000" maxLength={5} style={INP} /></div>
                <div><label style={LBL}>Ville</label><input value={form.bienVille || ''} onChange={e => u({ bienVille: e.target.value })} placeholder="Nice" style={INP} /></div>
                <div><label style={LBL}>Arr.</label><input type="number" value={form.bienArr || ''} onChange={e => u({ bienArr: e.target.value })} placeholder="—" min={1} max={20} style={INP} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', gap: 10 }}>
                <div><label style={LBL}>Surface (m²)</label><input type="number" value={form.bienSurface || ''} onChange={e => u({ bienSurface: e.target.value })} style={INP} /></div>
                <div><label style={LBL}>Prix d'achat (€)</label><input type="number" value={form.bienPrix || ''} onChange={e => u({ bienPrix: e.target.value })} style={INP} /></div>
                <div><label style={LBL}>Loyer (€/mois)</label><input type="number" value={form.bienLoyer || ''} onChange={e => u({ bienLoyer: e.target.value })} style={INP} /></div>
                <div><label style={LBL}>DPE</label>
                  <select value={form.bienDPE || 'D'} onChange={e => u({ bienDPE: e.target.value })} style={INP}>
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ flex: 0, padding: '14px 20px', background: 'transparent', border: `1px solid ${L.border}`, fontSize: 14, cursor: 'pointer', fontFamily: L.font, color: L.textLight }}>Retour</button>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', background: L.noir, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font }}>
                {form.bienAdresse ? 'Continuer' : 'Passer cette étape'}
              </button>
            </div>
          </div>
        )}

        {type === 'sci' && step === 3 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 300, fontFamily: L.serif, fontStyle: 'italic', color: L.text, margin: '0 0 6px' }}>Votre <span style={{ fontWeight: 700, fontStyle: 'normal' }}>locataire</span></h1>
            <p style={{ fontSize: 14, color: L.textLight, margin: '0 0 28px' }}>Si votre bien est loué, ajoutez votre locataire. Sinon, passez cette étape.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={LBL}>Prénom</label><input value={form.locPrenom || ''} onChange={e => u({ locPrenom: e.target.value })} placeholder="Jean" style={INP} /></div>
                <div><label style={LBL}>Nom</label><input value={form.locNom || ''} onChange={e => u({ locNom: e.target.value })} placeholder="Martin" style={INP} /></div>
              </div>
              <div><label style={LBL}>Email</label><input type="email" value={form.locEmail || ''} onChange={e => u({ locEmail: e.target.value })} placeholder="jean.martin@email.com" style={INP} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={LBL}>Date de début du bail</label><input type="date" value={form.locDebut || ''} onChange={e => u({ locDebut: e.target.value })} style={INP} /></div>
                <div><label style={LBL}>Dépôt de garantie (€)</label><input type="number" value={form.locDepot || ''} onChange={e => u({ locDepot: e.target.value })} style={INP} /></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setStep(2)} style={{ flex: 0, padding: '14px 20px', background: 'transparent', border: `1px solid ${L.border}`, fontSize: 14, cursor: 'pointer', fontFamily: L.font, color: L.textLight }}>Retour</button>
              <button onClick={() => setStep(4)} style={{ flex: 1, padding: '14px', background: L.noir, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font }}>
                {form.locNom ? 'Continuer' : 'Mon bien est vacant'}
              </button>
            </div>
          </div>
        )}

        {type === 'sci' && step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 200, color: L.gold, fontFamily: L.serif, marginBottom: 8 }}>C'est prêt.</div>
            <p style={{ fontSize: 14, color: L.textLight, margin: '0 0 24px' }}>Votre espace SCI est configuré{form.bienAdresse ? ` avec ${form.bienNom || 'votre bien'}` : ''}.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginBottom: 28 }}>
              {[
                form.sciNom && `SCI "${form.sciNom}" créée (${form.sciType || 'IR'})`,
                form.bienAdresse && `Bien ajouté : ${form.bienNom || form.bienAdresse}${form.bienLoyer ? ` — ${form.bienLoyer}€/mois` : ''}`,
                form.locNom && `Locataire : ${form.locPrenom} ${form.locNom}`,
                !form.locNom && form.bienAdresse && 'Bien vacant — vous pourrez ajouter un locataire plus tard',
              ].filter(Boolean).map((line, i) => (
                <div key={i} style={{ padding: '10px 14px', background: L.cream, fontSize: 13, color: L.text }}>
                  {line}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: L.textLight, marginBottom: 20 }}>Suggestions pour démarrer :</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
              {['Encaisser un loyer', 'Estimer la valeur de votre bien', 'Simuler un investissement'].map(s => (
                <div key={s} style={{ padding: '10px 14px', border: `1px solid ${L.border}`, fontSize: 13, color: L.textSec, textAlign: 'left' }}>{s}</div>
              ))}
            </div>
            <button onClick={finish} style={{ width: '100%', padding: '14px', background: L.gold, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font }}>
              Accéder à mon espace
            </button>
          </div>
        )}

        {/* ═══ PATRON BTP ═══ */}
        {type === 'patron' && step === 1 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 300, fontFamily: L.serif, fontStyle: 'italic', color: L.text, margin: '0 0 6px' }}>Bienvenue sur <span style={{ fontWeight: 700, fontStyle: 'normal' }}>Freample</span></h1>
            <p style={{ fontSize: 14, color: L.textLight, margin: '0 0 28px' }}>Configurons votre espace entreprise BTP.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={LBL}>Nom de l'entreprise</label><input value={form.entrepriseNom || ''} onChange={e => u({ entrepriseNom: e.target.value })} placeholder="Martin BTP" style={INP} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={LBL}>SIRET</label><input value={form.entrepriseSiret || ''} onChange={e => u({ entrepriseSiret: e.target.value })} placeholder="123 456 789 00012" style={INP} /></div>
                <div><label style={LBL}>Corps de métier (multi-sélection)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 8, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', maxHeight: 140, overflowY: 'auto' }}>
                    {CORPS_METIER_BTP.map(m => {
                      const sel = (form.entrepriseMetiers || []).includes(m);
                      return <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer', padding: '2px 6px', borderRadius: 6, background: sel ? '#2563eb11' : 'transparent' }}>
                        <input type="checkbox" checked={sel} onChange={() => {
                          const cur = form.entrepriseMetiers || [];
                          u({ entrepriseMetiers: sel ? cur.filter(x => x !== m) : [...cur, m] });
                        }} style={{ accentColor: '#2563eb' }} />
                        {m}
                      </label>;
                    })}
                  </div>
                </div>
              </div>
              <div><label style={LBL}>Assurance décennale (assureur + n° police)</label><input value={form.entrepriseDecennale || ''} onChange={e => u({ entrepriseDecennale: e.target.value })} placeholder="MAAF — Police n°123456" style={INP} /></div>
            </div>
            <button onClick={() => { if (form.entrepriseNom) setStep(2); }} disabled={!form.entrepriseNom}
              style={{ width: '100%', marginTop: 24, padding: '14px', background: form.entrepriseNom ? L.noir : L.border, color: form.entrepriseNom ? '#fff' : L.textLight, border: 'none', fontSize: 14, fontWeight: 600, cursor: form.entrepriseNom ? 'pointer' : 'default', fontFamily: L.font }}>
              Continuer
            </button>
          </div>
        )}

        {type === 'patron' && step === 2 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 300, fontFamily: L.serif, fontStyle: 'italic', color: L.text, margin: '0 0 6px' }}>Votre premier <span style={{ fontWeight: 700, fontStyle: 'normal' }}>chantier</span></h1>
            <p style={{ fontSize: 14, color: L.textLight, margin: '0 0 28px' }}>Ajoutez un chantier en cours pour voir votre dashboard en action. Vous pouvez passer cette étape.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={LBL}>Nom du client</label><input value={form.chantierClient || ''} onChange={e => u({ chantierClient: e.target.value })} placeholder="M. Dupont" style={INP} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={LBL}>Type de travaux</label><input value={form.chantierType || ''} onChange={e => u({ chantierType: e.target.value })} placeholder="Rénovation cuisine" style={INP} /></div>
                <div><label style={LBL}>Budget estimé (€)</label><input type="number" value={form.chantierBudget || ''} onChange={e => u({ chantierBudget: e.target.value })} placeholder="8000" style={INP} /></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ flex: 0, padding: '14px 20px', background: 'transparent', border: `1px solid ${L.border}`, fontSize: 14, cursor: 'pointer', fontFamily: L.font, color: L.textLight }}>Retour</button>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', background: L.noir, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font }}>
                {form.chantierClient ? 'Continuer' : 'Passer cette étape'}
              </button>
            </div>
          </div>
        )}

        {type === 'patron' && step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 200, color: L.gold, fontFamily: L.serif, marginBottom: 8 }}>C'est prêt.</div>
            <p style={{ fontSize: 14, color: L.textLight, margin: '0 0 24px' }}>Votre espace {form.entrepriseNom || 'entreprise'} est configuré.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginBottom: 28 }}>
              {[
                `Entreprise "${form.entrepriseNom}" configurée`,
                (form.entrepriseMetiers?.length > 0 || form.entrepriseMetier) && `Métiers : ${(form.entrepriseMetiers || [form.entrepriseMetier]).join(', ')}`,
                form.entrepriseDecennale && 'Assurance décennale renseignée',
                form.chantierClient && `Chantier ajouté : ${form.chantierType || 'Travaux'} — ${form.chantierClient}`,
              ].filter(Boolean).map((line, i) => (
                <div key={i} style={{ padding: '10px 14px', background: L.cream, fontSize: 13, color: L.text }}>{line}</div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: L.textLight, marginBottom: 20 }}>Suggestions pour démarrer :</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
              {['Créer un devis professionnel', 'Consulter les projets clients de votre zone', 'Ajouter un employé'].map(s => (
                <div key={s} style={{ padding: '10px 14px', border: `1px solid ${L.border}`, fontSize: 13, color: L.textSec, textAlign: 'left' }}>{s}</div>
              ))}
            </div>
            <button onClick={finish} style={{ width: '100%', padding: '14px', background: L.gold, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font }}>
              Accéder à mon espace
            </button>
          </div>
        )}

        {/* ═══ AUTO-ENTREPRENEUR ═══ */}
        {type === 'ae' && step === 1 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 300, fontFamily: L.serif, fontStyle: 'italic', color: L.text, margin: '0 0 6px' }}>Bienvenue sur <span style={{ fontWeight: 700, fontStyle: 'normal' }}>Freample</span></h1>
            <p style={{ fontSize: 14, color: L.textLight, margin: '0 0 28px' }}>Configurons votre espace auto-entrepreneur.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={LBL}>Type d'activité</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ v: 'services', label: 'Prestations de services', desc: 'Plafond 77 700€ — Cotisations 21,1%' }, { v: 'commerce', label: 'Vente de marchandises', desc: 'Plafond 188 700€ — Cotisations 12,3%' }].map(r => (
                    <button key={r.v} onClick={() => u({ aeType: r.v })}
                      style={{ flex: 1, padding: '14px 12px', border: `1px solid ${(form.aeType || 'services') === r.v ? L.gold : L.border}`, background: (form.aeType || 'services') === r.v ? L.cream : 'transparent', cursor: 'pointer', fontFamily: L.font, textAlign: 'left' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: (form.aeType || 'services') === r.v ? L.gold : L.text }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: L.textLight, marginTop: 2 }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div><label style={LBL}>Votre métier</label><input value={form.aeMetier || ''} onChange={e => u({ aeMetier: e.target.value })} placeholder="Plombier, Électricien, Peintre..." style={INP} /></div>
            </div>
            <button onClick={() => setStep(2)}
              style={{ width: '100%', marginTop: 24, padding: '14px', background: L.noir, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font }}>
              Continuer
            </button>
          </div>
        )}

        {type === 'ae' && step === 2 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 300, fontFamily: L.serif, fontStyle: 'italic', color: L.text, margin: '0 0 6px' }}>Votre <span style={{ fontWeight: 700, fontStyle: 'normal' }}>chiffre d'affaires</span></h1>
            <p style={{ fontSize: 14, color: L.textLight, margin: '0 0 28px' }}>Avez-vous déjà facturé cette année ? Ça nous permet de configurer votre jauge.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={LBL}>CA déjà réalisé en {new Date().getFullYear()} (€)</label><input type="number" value={form.aeCA || ''} onChange={e => u({ aeCA: e.target.value })} placeholder="0" style={INP} /></div>
              {form.aeCA && Number(form.aeCA) > 0 && (() => {
                const plafond = (form.aeType || 'services') === 'services' ? 77700 : 188700;
                const pct = Math.round(Number(form.aeCA) / plafond * 100);
                return (
                  <div style={{ padding: '14px', background: L.cream }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span>{Number(form.aeCA).toLocaleString('fr-FR')} € / {plafond.toLocaleString('fr-FR')} €</span>
                      <span style={{ fontWeight: 700, color: pct > 90 ? L.red : pct > 75 ? L.orange : L.green }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: L.border, borderRadius: 3 }}>
                      <div style={{ height: 6, borderRadius: 3, background: pct > 90 ? L.red : pct > 75 ? L.orange : L.green, width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ flex: 0, padding: '14px 20px', background: 'transparent', border: `1px solid ${L.border}`, fontSize: 14, cursor: 'pointer', fontFamily: L.font, color: L.textLight }}>Retour</button>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', background: L.noir, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font }}>
                {form.aeCA ? 'Continuer' : 'Je n\'ai pas encore facturé'}
              </button>
            </div>
          </div>
        )}

        {type === 'ae' && step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 200, color: L.gold, fontFamily: L.serif, marginBottom: 8 }}>C'est prêt.</div>
            <p style={{ fontSize: 14, color: L.textLight, margin: '0 0 24px' }}>Votre espace auto-entrepreneur est configuré.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginBottom: 28 }}>
              {[
                `Activité : ${(form.aeType || 'services') === 'services' ? 'Prestations de services' : 'Vente de marchandises'}`,
                form.aeMetier && `Métier : ${form.aeMetier}`,
                form.aeCA && Number(form.aeCA) > 0 ? `CA enregistré : ${Number(form.aeCA).toLocaleString('fr-FR')}€` : 'Aucun CA enregistré — votre jauge part de zéro',
              ].filter(Boolean).map((line, i) => (
                <div key={i} style={{ padding: '10px 14px', background: L.cream, fontSize: 13, color: L.text }}>{line}</div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: L.textLight, marginBottom: 20 }}>Suggestions pour démarrer :</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
              {['Créer votre première facture', 'Simuler vos cotisations URSSAF', 'Suivre votre chiffre d\'affaires'].map(s => (
                <div key={s} style={{ padding: '10px 14px', border: `1px solid ${L.border}`, fontSize: 13, color: L.textSec, textAlign: 'left' }}>{s}</div>
              ))}
            </div>
            <button onClick={finish} style={{ width: '100%', padding: '14px', background: L.gold, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: L.font }}>
              Accéder à mon espace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
