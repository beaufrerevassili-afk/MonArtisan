// ============================================================
//  DevisRapide.jsx — Formulaire simplifié de création de devis
//  Permet de créer un devis en 30 secondes
//  Pour le mode complet, utiliser DevisFormulaire (mode avancé)
// ============================================================
import React, { useState, useMemo } from 'react';
import DS from '../../design/luxe';

const CARD = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: 20 };
const INP = { width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 14, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box', color: '#1A1A1A' };
const LBL = { fontSize: 11, fontWeight: 700, color: '#636363', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };
const BTN = { padding: '12px 24px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font };

const TEMPLATES = [
  { label: '\u{1F527} Plomberie', lines: [
    { desc: 'Remplacement robinetterie', prix: 350 },
    { desc: 'Fourniture sanitaire', prix: 800 },
    { desc: 'Main d\'oeuvre pose', prix: 600 },
  ]},
  { label: '\u26A1 Electricite', lines: [
    { desc: 'Mise aux normes tableau', prix: 1200 },
    { desc: 'Pose prises et interrupteurs', prix: 450 },
    { desc: 'Main d\'oeuvre cablage', prix: 800 },
  ]},
  { label: '\u{1F9F1} Maconnerie', lines: [
    { desc: 'Demolition cloison', prix: 500 },
    { desc: 'Construction mur', prix: 1500 },
    { desc: 'Enduit et finition', prix: 600 },
  ]},
  { label: '\u{1F3A8} Peinture', lines: [
    { desc: 'Preparation surfaces', prix: 400 },
    { desc: 'Peinture 2 couches', prix: 1200 },
    { desc: 'Finitions et nettoyage', prix: 300 },
  ]},
  { label: '\u{1F3E0} Carrelage', lines: [
    { desc: 'Fourniture carrelage', prix: 800 },
    { desc: 'Pose carrelage sol', prix: 1200 },
    { desc: 'Pose plinthes', prix: 300 },
  ]},
  { label: '\u{1F528} Renovation complete', lines: [
    { desc: 'Demolition et depose', prix: 1500 },
    { desc: 'Plomberie', prix: 2000 },
    { desc: 'Electricite', prix: 1500 },
    { desc: 'Carrelage', prix: 1800 },
    { desc: 'Peinture', prix: 1200 },
  ]},
];

export default function DevisRapide({ onSoumettre, onAnnuler, onModeAvance, initialClient = '' }) {
  const [client, setClient] = useState(initialClient);
  const [objet, setObjet] = useState('');
  const [lignes, setLignes] = useState([{ desc: '', prix: '' }]);
  const [tvaRate, setTvaRate] = useState(10);
  const [saving, setSaving] = useState(false);

  const totalHT = useMemo(() => lignes.reduce((s, l) => s + (Number(l.prix) || 0), 0), [lignes]);
  const totalTVA = Math.round(totalHT * tvaRate) / 100;
  const totalTTC = totalHT + totalTVA;

  function addLigne() { setLignes(prev => [...prev, { desc: '', prix: '' }]); }
  function removeLigne(i) { setLignes(prev => prev.filter((_, idx) => idx !== i)); }
  function updateLigne(i, field, val) { setLignes(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l)); }

  function useTemplate(tmpl) {
    setLignes(tmpl.lines.map(l => ({ desc: l.desc, prix: l.prix })));
  }

  function soumettre() {
    if (!client.trim() || !objet.trim()) return;
    const validLines = lignes.filter(l => l.desc.trim() && Number(l.prix) > 0);
    if (validLines.length === 0) return;

    setSaving(true);
    const totalHTCalc = validLines.reduce((s, l) => s + Number(l.prix), 0);
    const totalTVACalc = Math.round(totalHTCalc * tvaRate) / 100;
    const totalTTCCalc = totalHTCalc + totalTVACalc;

    const devisData = {
      client: { nom: client.trim() },
      objet: objet.trim(),
      titre: objet.trim(),
      lignes: validLines.map(l => ({
        description: l.desc,
        quantite: 1,
        prixHT: Number(l.prix),
        tva: tvaRate / 100,
        unite: 'forfait',
        type: 'Divers',
      })),
      totalHT: totalHTCalc,
      totalTVA: totalTVACalc,
      totalTTC: totalTTCCalc,
      validiteJours: 30,
      _action: 'brouillon',
    };
    onSoumettre(devisData);
    setSaving(false);
  }

  const canSubmit = client.trim() && objet.trim() && lignes.some(l => l.desc.trim() && Number(l.prix));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Nouveau devis</div>
          <div style={{ fontSize: 12, color: '#636363', marginTop: 2 }}>Creez un devis en quelques secondes</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onModeAvance && (
            <button onClick={onModeAvance} style={{ padding: '8px 16px', background: 'none', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#636363', fontFamily: DS.font }}>
              Mode avance →
            </button>
          )}
          {onAnnuler && (
            <button onClick={onAnnuler} style={{ padding: '8px 16px', background: '#F2F2F7', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#636363', fontFamily: DS.font }}>
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Templates rapides */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#A68B4B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Modele rapide</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TEMPLATES.map(t => (
            <button key={t.label} onClick={() => useTemplate(t)}
              style={{ padding: '8px 14px', background: '#F8F7F4', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font, color: '#1A1A1A', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#A68B4B'; e.currentTarget.style.background = '#F5EFE0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E6E1'; e.currentTarget.style.background = '#F8F7F4'; }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={CARD}>
        {/* Client + Objet */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={LBL}>Client *</label>
            <input value={client} onChange={e => setClient(e.target.value)} placeholder="Nom du client" style={INP} />
          </div>
          <div>
            <label style={LBL}>Objet du devis *</label>
            <input value={objet} onChange={e => setObjet(e.target.value)} placeholder="Renovation salle de bain" style={INP} />
          </div>
        </div>

        {/* Lignes */}
        <div style={{ marginBottom: 16 }}>
          <label style={LBL}>Prestations</label>
          {lignes.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <input value={l.desc} onChange={e => updateLigne(i, 'desc', e.target.value)}
                placeholder="Description de la prestation"
                style={{ ...INP, flex: 1 }} />
              <div style={{ position: 'relative', width: 120, flexShrink: 0 }}>
                <input type="number" value={l.prix} onChange={e => updateLigne(i, 'prix', e.target.value)}
                  placeholder="Prix HT"
                  style={{ ...INP, paddingRight: 28, textAlign: 'right' }} />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#636363', fontSize: 13, pointerEvents: 'none' }}>\u20AC</span>
              </div>
              {lignes.length > 1 && (
                <button onClick={() => removeLigne(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 16, padding: 4, flexShrink: 0 }}>\u00D7</button>
              )}
            </div>
          ))}
          <button onClick={addLigne} style={{ background: 'none', border: '1px dashed #E8E6E1', borderRadius: 8, padding: '10px', width: '100%', cursor: 'pointer', fontSize: 13, color: '#A68B4B', fontWeight: 600, fontFamily: DS.font, marginTop: 4 }}>
            + Ajouter une ligne
          </button>
        </div>

        {/* TVA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '10px 14px', background: '#F8F7F4', borderRadius: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#636363' }}>TVA :</span>
          {[0, 5.5, 10, 20].map(rate => (
            <button key={rate} onClick={() => setTvaRate(rate)}
              style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font, border: tvaRate === rate ? '2px solid #2C2520' : '1px solid #E8E6E1', background: tvaRate === rate ? '#2C2520' : '#fff', color: tvaRate === rate ? '#F5EFE0' : '#1A1A1A' }}>
              {rate}%
            </button>
          ))}
        </div>

        {/* Totaux */}
        <div style={{ borderTop: '2px solid #E8E6E1', paddingTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#636363' }}>Total HT</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{totalHT.toLocaleString('fr-FR')} \u20AC</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#636363' }}>TVA ({tvaRate}%)</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} \u20AC</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #E8E6E1' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>Total TTC</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#2C2520' }}>{totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} \u20AC</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button onClick={soumettre} disabled={saving || !canSubmit}
        style={{ ...BTN, width: '100%', marginTop: 16, padding: 16, fontSize: 15, opacity: canSubmit ? 1 : 0.5 }}>
        {saving ? 'Creation...' : 'Creer le devis'}
      </button>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 640px) {
          .devis-rapide-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
