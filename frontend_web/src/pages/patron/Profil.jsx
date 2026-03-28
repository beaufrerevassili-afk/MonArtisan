import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IconCheck, IconAlert } from '../../components/ui/Icons';

export default function ProfilPatron() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    nomEntreprise: '',
    siret: '',
    metier: '',
    tva: '',
    logoUrl: null,
  });
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const logoRef = useRef(null);

  const initials = user?.nom?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'P';

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, logoUrl: URL.createObjectURL(file) }));
  }

  function sauvegarder(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h1>Mon profil</h1>
        <p style={{ marginTop: 4 }}>Gérez vos informations personnelles et votre entreprise</p>
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
          <span className="badge badge-blue" style={{ marginTop: 6, display: 'inline-block' }}>Patron Artisan</span>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>Informations personnelles</h2>
        <form onSubmit={sauvegarder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">Adresse</label>
              <input className="input" placeholder="12 rue de la Paix" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
            </div>
            <div>
              <label className="label">Ville</label>
              <input className="input" placeholder="Paris" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} />
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

      {/* Informations entreprise */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>Informations entreprise</h2>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div
            onClick={() => logoRef.current?.click()}
            style={{ width: 72, height: 72, borderRadius: 14, background: form.logoUrl ? 'transparent' : 'var(--bg)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', fontSize: 24, flexShrink: 0 }}
            title="Cliquer pour ajouter le logo"
          >
            {form.logoUrl ? <img src={form.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '🏢'}
          </div>
          <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
          <div>
            <button type="button" onClick={() => logoRef.current?.click()} style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              {form.logoUrl ? 'Changer le logo' : 'Ajouter le logo'}
            </button>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Le logo apparaîtra sur vos devis et factures</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label className="label">Nom de l'entreprise</label>
            <input className="input" value={form.nomEntreprise} onChange={e => setForm({ ...form, nomEntreprise: e.target.value })} />
          </div>
          <div>
            <label className="label">SIRET</label>
            <input className="input" placeholder="123 456 789 00012" value={form.siret} onChange={e => setForm({ ...form, siret: e.target.value })} />
          </div>
          <div>
            <label className="label">Métier / Spécialité</label>
            <input className="input" value={form.metier} onChange={e => setForm({ ...form, metier: e.target.value })} />
          </div>
          <div>
            <label className="label">N° TVA intracommunautaire</label>
            <input className="input" value={form.tva} onChange={e => setForm({ ...form, tva: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>Sécurité</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Mot de passe actuel</label>
            <input className="input" type="password" placeholder="••••••••" style={{ maxWidth: 300 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
          La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
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
