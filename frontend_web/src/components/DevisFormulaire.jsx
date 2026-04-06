import React, { useState } from 'react';

/* ── Constants (same as DevisPro) ── */
const TVA_RATES = [0, 5.5, 10, 20];
const UNITES = ['u', 'm²', 'm', 'ml', 'h', 'j', 'forfait', 'kg', 'm³', 'ensemble'];

const TEMPLATES_BTP = [
  { cat: 'Maçonnerie', items: [
    { description: 'Réalisation de mur en parpaings 20 cm — fourniture et pose', unite: 'm²', prixUnitaire: 85, tva: 10 },
    { description: 'Enduit de façade projeté — préparation + application', unite: 'm²', prixUnitaire: 45, tva: 10 },
    { description: 'Chape liquide autonivelante — fourniture et pose', unite: 'm²', prixUnitaire: 28, tva: 10 },
  ]},
  { cat: 'Carrelage / Sol', items: [
    { description: 'Pose de carrelage 60×60 rectifié — fourniture et pose', unite: 'm²', prixUnitaire: 65, tva: 10 },
    { description: 'Ragréage de sol — préparation et pose', unite: 'm²', prixUnitaire: 18, tva: 10 },
    { description: 'Pose de plinthes carrelage', unite: 'ml', prixUnitaire: 22, tva: 10 },
  ]},
  { cat: 'Peinture', items: [
    { description: 'Peinture intérieure 2 couches — préparation + application', unite: 'm²', prixUnitaire: 22, tva: 10 },
    { description: 'Ravalement de façade — nettoyage + peinture', unite: 'm²', prixUnitaire: 55, tva: 10 },
  ]},
  { cat: 'Plomberie', items: [
    { description: 'Installation salle de bain complète — fourniture et pose', unite: 'forfait', prixUnitaire: 2800, tva: 10 },
    { description: 'Remplacement chauffe-eau — fourniture et pose', unite: 'u', prixUnitaire: 950, tva: 10 },
  ]},
  { cat: 'Électricité', items: [
    { description: 'Mise aux normes tableau électrique', unite: 'forfait', prixUnitaire: 1200, tva: 10 },
    { description: 'Pose de prises et interrupteurs', unite: 'u', prixUnitaire: 85, tva: 10 },
  ]},
  { cat: 'Divers', items: [
    { description: 'Dépose et évacuation déchets de chantier', unite: 'forfait', prixUnitaire: 350, tva: 20 },
    { description: 'Protection et nettoyage chantier', unite: 'forfait', prixUnitaire: 180, tva: 20 },
    { description: 'Main d\'œuvre (h)', unite: 'h', prixUnitaire: 65, tva: 20 },
  ]},
];

const ECHEANCIER_DEFAUT = [
  { label: 'Acompte à la commande', pct: 30 },
  { label: 'Situation en cours de chantier', pct: 40 },
  { label: 'Solde à la réception', pct: 30 },
];

const LIGNE_VIDE = { description: '', quantite: 1, unite: 'u', prixUnitaire: '', tva: 10, remise: 0 };

function calcLine(l) {
  const qty = Number(l.quantite) || 0;
  const pu = Number(l.prixUnitaire) || 0;
  const remPct = Number(l.remise) || 0;
  const ht = qty * pu * (1 - remPct / 100);
  return { ht, tvaAmt: ht * (Number(l.tva) || 0) / 100 };
}

function calcTotals(lignes, remiseGlobale = 0) {
  let totalHTBrut = 0, totalTVA = 0;
  lignes.forEach(l => { const c = calcLine(l); totalHTBrut += c.ht; totalTVA += c.tvaAmt; });
  const remiseMt = totalHTBrut * remiseGlobale / 100;
  const totalHT = totalHTBrut - remiseMt;
  const tvaOnBase = totalHTBrut > 0 ? totalTVA * (totalHT / totalHTBrut) : 0;
  return { totalHTBrut, remiseMt, totalHT, totalTVA: tvaOnBase, totalTTC: totalHT + tvaOnBase };
}

const inp = { width: '100%', padding: '8px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#1C1C1E', background: '#fff', fontFamily: 'inherit' };
const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6E6E73', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 };

/**
 * Reusable devis form following DevisPro methodology.
 * Props:
 *   clientNom     - pre-filled client name
 *   missionTitre  - pre-filled objet
 *   onSoumettre(devis) - callback with devis data when submitted
 *   onAnnuler()   - cancel callback
 *   compact       - boolean: hide conditions/echéancier sections for inline use
 */
export default function DevisFormulaire({ clientNom = '', missionTitre = '', onSoumettre, onAnnuler, compact = false }) {
  const [client, setClient] = useState({ nom: clientNom, email: '', telephone: '', adresse: '' });
  const [objet, setObjet] = useState(missionTitre);
  const [lignes, setLignes] = useState([{ ...LIGNE_VIDE }]);
  const [remiseGlobale, setRemiseGlobale] = useState(0);
  const [echeancier, setEcheancier] = useState(ECHEANCIER_DEFAUT.map(e => ({ ...e })));
  const [notes, setNotes] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCat, setTemplateCat] = useState(null);

  const totals = calcTotals(lignes, remiseGlobale);

  function updateLigne(i, field, val) {
    setLignes(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  }
  function removeLigne(i) { setLignes(prev => prev.filter((_, idx) => idx !== i)); }
  function addLigne(template) {
    setLignes(prev => [...prev, template ? { ...LIGNE_VIDE, ...template, remise: 0 } : { ...LIGNE_VIDE }]);
    setShowTemplates(false);
    setTemplateCat(null);
  }

  function handleSubmit() {
    const devis = { client, objet, lignes, remiseGlobale, echeancier, notes, ...totals, creeLe: new Date().toISOString() };
    onSoumettre?.(devis);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Client + Objet */}
      <div style={{ background: '#F8F9FD', borderRadius: 14, padding: 18, border: '1px solid #E0EAFF' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', marginBottom: 14 }}>Informations client & objet</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Nom client / entreprise</label>
            <input value={client.nom} onChange={e => setClient(p => ({ ...p, nom: e.target.value }))} placeholder="Jean Dupont ou SARL Immo+" style={inp} />
          </div>
          <div>
            <label style={lbl}>Email</label>
            <input type="email" value={client.email} onChange={e => setClient(p => ({ ...p, email: e.target.value }))} placeholder="client@email.fr" style={inp} />
          </div>
          <div>
            <label style={lbl}>Téléphone</label>
            <input value={client.telephone} onChange={e => setClient(p => ({ ...p, telephone: e.target.value }))} placeholder="06 12 34 56 78" style={inp} />
          </div>
          <div>
            <label style={lbl}>Adresse chantier</label>
            <input value={client.adresse} onChange={e => setClient(p => ({ ...p, adresse: e.target.value }))} placeholder="12 rue de la Paix, 75001 Paris" style={inp} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Objet du devis</label>
            <input value={objet} onChange={e => setObjet(e.target.value)} placeholder="Ex : Rénovation salle de bain — 12 m²" style={inp} />
          </div>
        </div>
      </div>

      {/* Lignes */}
      <div style={{ background: '#F8F9FD', borderRadius: 14, padding: 18, border: '1px solid #E0EAFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>Prestations</div>
          <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setShowTemplates(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#fff', border: '1px solid #E5E5EA', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#5B5BD6' }}>
              ⚡ Templates BTP
            </button>
            {showTemplates && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 100, background: '#fff', borderRadius: 12, border: '1px solid #E5E5EA', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 320, overflow: 'hidden' }}>
                {TEMPLATES_BTP.map(cat => (
                  <div key={cat.cat}>
                    <button type="button" onClick={() => setTemplateCat(templateCat === cat.cat ? null : cat.cat)}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: templateCat === cat.cat ? '#F0F5FF' : 'none', border: 'none', borderBottom: '1px solid #F2F2F7', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1C1C1E' }}>
                      {cat.cat} {templateCat === cat.cat ? '▲' : '▶'}
                    </button>
                    {templateCat === cat.cat && cat.items.map((item, i) => (
                      <button key={i} type="button" onClick={() => addLigne(item)}
                        style={{ width: '100%', textAlign: 'left', padding: '8px 24px', background: 'none', border: 'none', borderBottom: '1px solid #F9F9F9', cursor: 'pointer', fontSize: 12, color: '#3C3C43' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F7FF'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        {item.description} — <strong>{item.prixUnitaire} €/{item.unite}</strong>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 60px 70px 90px 60px 60px 70px 28px', gap: 6, marginBottom: 6, padding: '0 2px' }}>
          {['Description', 'Qté', 'Unité', 'P.U. HT (€)', 'TVA %', 'Rem. %', 'Total HT', ''].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</div>
          ))}
        </div>

        {/* Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lignes.map((l, i) => {
            const { ht } = calcLine(l);
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 60px 70px 90px 60px 60px 70px 28px', gap: 6, alignItems: 'center' }}>
                <input value={l.description} onChange={e => updateLigne(i, 'description', e.target.value)}
                  placeholder="Prestation / matériel…" style={inp} />
                <input type="number" value={l.quantite} min="0" onChange={e => updateLigne(i, 'quantite', e.target.value)}
                  style={{ ...inp, textAlign: 'center' }} />
                <select value={l.unite} onChange={e => updateLigne(i, 'unite', e.target.value)} style={{ ...inp, padding: '8px 4px' }}>
                  {UNITES.map(u => <option key={u}>{u}</option>)}
                </select>
                <input type="number" value={l.prixUnitaire} min="0" onChange={e => updateLigne(i, 'prixUnitaire', e.target.value)}
                  placeholder="0" style={{ ...inp, textAlign: 'right' }} />
                <select value={l.tva} onChange={e => updateLigne(i, 'tva', Number(e.target.value))} style={{ ...inp, padding: '8px 4px' }}>
                  {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
                <input type="number" value={l.remise} min="0" max="100" onChange={e => updateLigne(i, 'remise', e.target.value)}
                  placeholder="0" style={{ ...inp, textAlign: 'right' }} />
                <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#1C1C1E', padding: '0 2px' }}>
                  {ht.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </div>
                <button type="button" onClick={() => lignes.length > 1 && removeLigne(i)}
                  style={{ background: 'none', border: 'none', cursor: lignes.length > 1 ? 'pointer' : 'default', color: '#FF3B30', fontSize: 18, lineHeight: 1, opacity: lignes.length > 1 ? 1 : 0.25 }}>×</button>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
          <button type="button" onClick={() => addLigne(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'none', border: '1px dashed #C7C7CC', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#6E6E73' }}>
            + Ajouter une ligne
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ ...lbl, margin: 0, whiteSpace: 'nowrap' }}>Remise globale (%)</label>
            <input type="number" value={remiseGlobale} min="0" max="100" onChange={e => setRemiseGlobale(Number(e.target.value))}
              style={{ ...inp, width: 70, textAlign: 'right' }} />
          </div>
        </div>
      </div>

      {/* Totals */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1px solid #E0EAFF' }}>
        {[
          totals.remiseMt > 0 && ['Total HT brut', totals.totalHTBrut, false],
          totals.remiseMt > 0 && [`Remise globale ${remiseGlobale}%`, -totals.remiseMt, false],
          ['Total HT', totals.totalHT, false],
          ['TVA', totals.totalTVA, false],
          ['Total TTC', totals.totalTTC, true],
        ].filter(Boolean).map(([label, val, bold]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: bold ? '2px solid #E5E5EA' : 'none', marginTop: bold ? 6 : 0, paddingTop: bold ? 10 : 4 }}>
            <span style={{ fontSize: bold ? 15 : 13, fontWeight: bold ? 800 : 500, color: bold ? '#1C1C1E' : '#6E6E73' }}>{label}</span>
            <span style={{ fontSize: bold ? 16 : 13, fontWeight: bold ? 800 : 600, color: bold ? '#5B5BD6' : '#1C1C1E' }}>
              {Math.abs(val).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              {val < 0 && ' (réduction)'}
            </span>
          </div>
        ))}
      </div>

      {/* Échéancier */}
      {!compact && (
        <div style={{ background: '#F8F9FD', borderRadius: 14, padding: 18, border: '1px solid #E0EAFF' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', marginBottom: 14 }}>Échéancier de paiement</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {echeancier.map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10, alignItems: 'center' }}>
                <input value={e.label} onChange={ev => setEcheancier(prev => prev.map((x, j) => j === i ? { ...x, label: ev.target.value } : x))} style={inp} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="number" value={e.pct} min="0" max="100"
                    onChange={ev => setEcheancier(prev => prev.map((x, j) => j === i ? { ...x, pct: Number(ev.target.value) } : x))}
                    style={{ ...inp, textAlign: 'right', width: 56 }} />
                  <span style={{ fontSize: 13, color: '#6E6E73', flexShrink: 0 }}>%</span>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: echeancier.reduce((s, e) => s + e.pct, 0) === 100 ? '#34C759' : '#FF3B30', fontWeight: 600 }}>
              Total : {echeancier.reduce((s, e) => s + e.pct, 0)}% {echeancier.reduce((s, e) => s + e.pct, 0) === 100 ? '✓' : '(doit être égal à 100%)'}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div style={{ background: '#F8F9FD', borderRadius: 14, padding: 18, border: '1px solid #E0EAFF' }}>
        <label style={{ ...lbl, marginBottom: 8 }}>Notes complémentaires</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Conditions particulières, délai d'exécution, garanties…"
          style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        {onAnnuler && (
          <button type="button" onClick={onAnnuler}
            style={{ padding: '10px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#1C1C1E' }}>
            ← Retour
          </button>
        )}
        <button type="button" onClick={handleSubmit} disabled={totals.totalTTC === 0}
          style={{ padding: '10px 28px', border: 'none', borderRadius: 10, background: totals.totalTTC > 0 ? '#5B5BD6' : '#C7C7CC', color: '#fff', cursor: totals.totalTTC > 0 ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14 }}>
          📤 Soumettre le devis
        </button>
      </div>
    </div>
  );
}
