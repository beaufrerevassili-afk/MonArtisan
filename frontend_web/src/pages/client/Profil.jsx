import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { IconCheck, IconAlert, IconPlus } from '../../components/ui/Icons';

const METHODES = [
  { id: 1, type: 'visa',   label: 'Visa •••• 4242', expiry: '12/26', principale: true  },
  { id: 2, type: 'paypal', label: 'PayPal — marie.d@gmail.com',      principale: false },
];

export default function ProfilClient() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]               = useState({
    nom: user?.nom || '', email: user?.email || '', telephone: '',
    adresse: '', codePostal: '', ville: '', batiment: '', etage: '', typeLogement: 'maison',
  });
  const [saved, setSaved]             = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const initials = user?.nom?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  async function sauvegarder(e) {
    e.preventDefault();
    try {
      await api.put('/users/profil', {
        nom: form.nom,
        telephone: form.telephone,
        adresse: form.adresse,
        ville: form.ville,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde profil:', err);
    }
  }

  async function supprimerCompte() {
    if (deleteInput !== 'SUPPRIMER') return;
    await api.delete('/client/supprimer-compte');
    logout();
    navigate('/');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h1>Mon profil</h1>
        <p style={{ marginTop: 4 }}>Gérez vos informations personnelles et la sécurité de votre compte</p>
      </div>

      {/* Avatar + identité */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 70, height: 70, borderRadius: '50%',
          background: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.5rem', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text)' }}>{user?.nom}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</p>
          <span className="badge badge-blue" style={{ marginTop: 6, display: 'inline-block' }}>Client</span>
        </div>
      </div>

      {/* Informations */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>Informations personnelles</h2>
        <form onSubmit={sauvegarder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-2">
            <div>
              <label className="label">Nom complet</label>
              <input className="input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input className="input" placeholder="06 12 34 56 78" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Adresse email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          {/* Adresse */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: 14 }}>Adresse du logement</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Type logement */}
              <div>
                <label className="label">Type de logement</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ val: 'maison', label: '🏠 Maison' }, { val: 'appartement', label: '🏢 Appartement' }].map(t => (
                    <button key={t.val} type="button" onClick={() => setForm({ ...form, typeLogement: t.val })}
                      style={{ flex: 1, padding: '9px 0', border: `2px solid ${form.typeLogement === t.val ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, background: form.typeLogement === t.val ? 'var(--primary-light)' : 'var(--bg)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: form.typeLogement === t.val ? 'var(--primary)' : 'var(--text-secondary)', transition: 'var(--transition)' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Adresse (numéro et rue)</label>
                <input className="input" placeholder="12 rue de la Paix" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12 }}>
                <div>
                  <label className="label">Code postal</label>
                  <input className="input" placeholder="75001" value={form.codePostal} onChange={e => setForm({ ...form, codePostal: e.target.value })} />
                </div>
                <div>
                  <label className="label">Ville</label>
                  <input className="input" placeholder="Paris" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} />
                </div>
              </div>

              {form.typeLogement === 'appartement' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Bâtiment / Résidence</label>
                    <input className="input" placeholder="Bât. A, Résidence Les Pins…" value={form.batiment} onChange={e => setForm({ ...form, batiment: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Étage</label>
                    <input className="input" placeholder="3ème étage, porte 12…" value={form.etage} onChange={e => setForm({ ...form, etage: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="submit" className="btn-primary">Sauvegarder les modifications</button>
            {saved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1A7A3C', fontSize: '0.875rem', fontWeight: 500 }}>
                <IconCheck size={14} /> Sauvegardé
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Méthodes paiement */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Moyens de paiement</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {METHODES.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 10,
              border: `1px solid ${m.principale ? 'rgba(52,199,89,0.4)' : 'var(--border-light)'}`,
              background: m.principale ? 'rgba(52,199,89,0.04)' : 'var(--bg)',
            }}>
              <div style={{
                width: 42, height: 26, borderRadius: 5, flexShrink: 0,
                background: m.type === 'visa' ? '#1A1F71' : '#003087',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '0.5rem', letterSpacing: 0.5 }}>
                  {m.type === 'visa' ? 'VISA' : 'PP'}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{m.label}</p>
                {m.expiry && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Expire {m.expiry}</p>}
              </div>
              {m.principale && <span className="badge badge-green">Principale</span>}
            </div>
          ))}
        </div>
        <button className="btn-secondary" style={{ fontSize: '0.875rem' }}>
          <IconPlus size={14} /> Ajouter une carte
        </button>
      </div>

      {/* Sécurité */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>Sécurité</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Mot de passe actuel</label>
            <input className="input" type="password" placeholder="••••••••" style={{ maxWidth: 300 }} />
          </div>
          <div className="grid-2">
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="label">Confirmer</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
          </div>
          <button className="btn-secondary" style={{ alignSelf: 'flex-start' }}>Changer le mot de passe</button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: 24, border: '1px solid rgba(255,59,48,0.25)', background: 'rgba(255,59,48,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <IconAlert size={16} color="var(--danger)" />
          <h2 style={{ color: 'var(--danger)' }}>Zone dangereuse</h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16 }}>
          La suppression de votre compte est irréversible. Toutes vos données (missions, messages, paiements) seront définitivement effacées.
        </p>

        {!deleteConfirm ? (
          <button className="btn-danger" onClick={() => setDeleteConfirm(true)}>
            Supprimer mon compte
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 500 }}>
              Tapez <strong>SUPPRIMER</strong> pour confirmer la suppression définitive :
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="input"
                placeholder="SUPPRIMER"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                style={{ maxWidth: 200 }}
              />
              <button
                className="btn-danger"
                disabled={deleteInput !== 'SUPPRIMER'}
                onClick={supprimerCompte}
                style={{ opacity: deleteInput !== 'SUPPRIMER' ? 0.45 : 1 }}
              >
                Confirmer la suppression
              </button>
              <button className="btn-ghost" onClick={() => { setDeleteConfirm(false); setDeleteInput(''); }}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
