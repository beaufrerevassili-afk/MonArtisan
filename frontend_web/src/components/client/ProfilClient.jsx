import React, { useState } from 'react';
import api from '../../services/api';

const CARD = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: '20px 24px' };
const INP = { width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1A1A1A' };
const BTN = { padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };

export default function ProfilClient({ user, isDemo }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || '',
    ville: user?.ville || '',
  });

  const sauver = async () => {
    setSaving(true);
    try {
      if (!isDemo) {
        await api.put('/users/profil', form);
      }
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: '#1A1A1A' }}>Mon profil</h2>

      {saved && (
        <div style={{ padding: '10px 14px', background: '#F0FDF4', border: '1px solid #16A34A40', borderRadius: 8, marginBottom: 16, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>
          Profil mis à jour
        </div>
      )}

      <div style={CARD}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { key: 'nom', label: 'Nom complet', placeholder: 'Jean Dupont' },
            { key: 'email', label: 'Email', placeholder: 'jean@email.com', type: 'email' },
            { key: 'telephone', label: 'Téléphone', placeholder: '06 12 34 56 78', type: 'tel' },
            { key: 'ville', label: 'Ville', placeholder: 'Marseille' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 10, color: '#444', fontWeight: 700, display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</label>
              {editMode ? (
                <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={INP} />
              ) : (
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', padding: '10px 12px', background: '#F8F7F4', borderRadius: 8 }}>{form[f.key] || '—'}</div>
              )}
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: 10, color: '#444', fontWeight: 700, display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Adresse</label>
            {editMode ? (
              <input value={form.adresse} onChange={e => setForm(p => ({ ...p, adresse: e.target.value }))} placeholder="12 rue de la Liberté, 13001 Marseille" style={INP} />
            ) : (
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', padding: '10px 12px', background: '#F8F7F4', borderRadius: 8 }}>{form.adresse || '—'}</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {editMode ? (
            <>
              <button onClick={sauver} disabled={saving} style={{ ...BTN, opacity: saving ? 0.5 : 1 }}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
              <button onClick={() => setEditMode(false)} style={{ ...BTN, background: '#F8F7F4', color: '#1A1A1A', border: '1px solid #E8E6E1' }}>Annuler</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} style={BTN}>Modifier mes informations</button>
          )}
        </div>
      </div>

      {/* Info membre */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: '#F8F7F4', borderRadius: 10, fontSize: 12, color: '#444' }}>
        Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '2026'} · Rôle : {user?.role || 'client'}
      </div>
    </div>
  );
}
