import React, { useState } from 'react';
import SignaturePad from './SignaturePad';
import api from '../../services/api';
import { isDemo as _isDemo, demoGet, demoSet } from '../../utils/storage';
import { jsPDF } from 'jspdf';

const INP = { width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const LBL = { fontSize: 11, fontWeight: 700, color: '#636363', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };

export default function AvisDePassage({ chantier, onClose, onSaved }) {
  const isDemo = _isDemo();
  const [form, setForm] = useState({
    heureArrivee: '', heureDepart: '',
    travauxRealises: '', materiauxUtilises: '', observations: '',
    clientNom: chantier?.client || '',
  });
  const [signature, setSignature] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  async function handleSubmit() {
    if (!form.travauxRealises.trim()) { alert('Décrivez les travaux réalisés'); return; }
    if (!signature) { alert('La signature du client est requise'); return; }
    setSaving(true);
    try {
      if (isDemo) {
        const avis = demoGet('freample_avis_passages', []);
        avis.unshift({ id: Date.now(), ...form, signatureBase64: signature, chantierTitre: chantier?.titre || chantier?.nom || '', chantierAdresse: chantier?.adresse || '', date: new Date().toISOString(), statut: 'signe' });
        demoSet('freample_avis_passages', avis);
      } else {
        await api.post('/avis-passage', {
          chantierId: chantier?.id, chantierTitre: chantier?.titre || chantier?.nom || '',
          chantierAdresse: chantier?.adresse || '', clientNom: form.clientNom,
          heureArrivee: form.heureArrivee, heureDepart: form.heureDepart,
          travauxRealises: form.travauxRealises, materiauxUtilises: form.materiauxUtilises,
          observations: form.observations, signatureBase64: signature
        });
      }
      setSaved(true);
      onSaved?.();
    } catch { alert('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  }

  function genererPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('AVIS DE PASSAGE', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date : ${today}`, 15, 35);
    doc.text(`Chantier : ${chantier?.titre || chantier?.nom || ''}`, 15, 42);
    doc.text(`Adresse : ${chantier?.adresse || ''}`, 15, 49);
    doc.text(`Client : ${form.clientNom}`, 15, 56);
    doc.text(`Heure arrivée : ${form.heureArrivee || '—'}  |  Heure départ : ${form.heureDepart || '—'}`, 15, 63);
    doc.setFontSize(11);
    doc.text('Travaux réalisés :', 15, 76);
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(form.travauxRealises, 180);
    doc.text(lines, 15, 83);
    let y = 83 + lines.length * 5;
    if (form.materiauxUtilises) {
      y += 8;
      doc.setFontSize(11);
      doc.text('Matériaux utilisés :', 15, y);
      doc.setFontSize(9);
      y += 7;
      doc.text(doc.splitTextToSize(form.materiauxUtilises, 180), 15, y);
      y += 10;
    }
    if (form.observations) {
      y += 5;
      doc.setFontSize(11);
      doc.text('Observations :', 15, y);
      doc.setFontSize(9);
      y += 7;
      doc.text(doc.splitTextToSize(form.observations, 180), 15, y);
      y += 10;
    }
    // Add signature
    if (signature) {
      y += 10;
      doc.setFontSize(10);
      doc.text('Signature du client :', 15, y);
      y += 5;
      try { doc.addImage(signature, 'PNG', 15, y, 80, 40); } catch {}
    }
    doc.save(`avis-passage-${chantier?.titre || 'chantier'}-${new Date().toISOString().slice(0,10)}.pdf`);
  }

  if (saved) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#D1F2E0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>✓</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1A1A', marginBottom: 6 }}>Avis de passage enregistré</div>
        <div style={{ fontSize: 13, color: '#636363', marginBottom: 20 }}>La signature du client a été sauvegardée.</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={genererPDF} style={{ padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>📄 Télécharger le PDF</button>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#F8F7F4', color: '#1A1A1A', border: '1px solid #E8E6E1', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1A1A' }}>Avis de passage</div>
          <div style={{ fontSize: 12, color: '#636363', marginTop: 2 }}>{today}</div>
        </div>
        <button onClick={onClose} style={{ background: '#F2F2F7', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#636363', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      </div>

      <div style={{ background: '#F8F7F4', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
        <strong>{chantier?.titre || chantier?.nom}</strong><br />
        <span style={{ color: '#636363', fontSize: 12 }}>{chantier?.adresse}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={LBL}>Nom du client</label>
          <input value={form.clientNom} onChange={e => setForm(f => ({ ...f, clientNom: e.target.value }))} placeholder="Mme Dupont" style={INP} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={LBL}>Heure arrivée</label>
            <input type="time" value={form.heureArrivee} onChange={e => setForm(f => ({ ...f, heureArrivee: e.target.value }))} style={INP} />
          </div>
          <div>
            <label style={LBL}>Heure départ</label>
            <input type="time" value={form.heureDepart} onChange={e => setForm(f => ({ ...f, heureDepart: e.target.value }))} style={INP} />
          </div>
        </div>
        <div>
          <label style={LBL}>Travaux réalisés *</label>
          <textarea value={form.travauxRealises} onChange={e => setForm(f => ({ ...f, travauxRealises: e.target.value }))} rows={3} placeholder="Décrivez les travaux effectués..." style={{ ...INP, resize: 'vertical' }} />
        </div>
        <div>
          <label style={LBL}>Matériaux utilisés</label>
          <input value={form.materiauxUtilises} onChange={e => setForm(f => ({ ...f, materiauxUtilises: e.target.value }))} placeholder="Raccords cuivre, joint silicone..." style={INP} />
        </div>
        <div>
          <label style={LBL}>Observations</label>
          <textarea value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} rows={2} placeholder="RAS ou problème rencontré..." style={{ ...INP, resize: 'vertical' }} />
        </div>

        <SignaturePad onSave={setSignature} width={Math.min(340, window.innerWidth - 80)} />

        <button onClick={handleSubmit} disabled={saving}
          style={{ width: '100%', padding: 14, background: saving ? '#ccc' : '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', marginTop: 8 }}>
          {saving ? 'Enregistrement...' : '✅ Valider et enregistrer'}
        </button>
      </div>
    </div>
  );
}
