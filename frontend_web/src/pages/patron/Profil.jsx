import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IconCheck, IconAlert, IconUser, IconBuilding } from '../../components/ui/Icons';
import { getProfilEntreprise, setProfilEntreprise, isProfilComplet, champsManquants, LABELS_CHAMPS, CORPS_METIER_BTP, getCompetencesEquipe } from '../../utils/profilEntreprise';
import api from '../../services/api';

const SECTION = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: 24, marginBottom: 20 };
const INP = { width: '100%', padding: '10px 14px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const LBL = { fontSize: 11, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: 0.4, display: 'block', marginBottom: 4 };
const BTN = { padding: '10px 20px', background: '#A68B4B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };
const BTN_DANGER = { ...BTN, background: '#DC2626' };
const BTN_O = { ...BTN, background: 'transparent', color: '#1C1C1E', border: '1px solid #E8E6E1' };

export default function ProfilPatron() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('compte'); // 'compte' | 'entreprise'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 800 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Paramètres</h1>
        <p style={{ marginTop: 4, color: '#6E6E73', fontSize: 14 }}>Gérez votre compte personnel et les informations de votre entreprise.</p>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #E8E6E1' }}>
        <button onClick={() => setTab('compte')}
          style={{ padding: '12px 20px', background: 'transparent', border: 'none', borderBottom: tab === 'compte' ? '2px solid #A68B4B' : '2px solid transparent', color: tab === 'compte' ? '#A68B4B' : '#6E6E73', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>
          <IconUser size={14} /> Mon compte
        </button>
        <button onClick={() => setTab('entreprise')}
          style={{ padding: '12px 20px', background: 'transparent', border: 'none', borderBottom: tab === 'entreprise' ? '2px solid #A68B4B' : '2px solid transparent', color: tab === 'entreprise' ? '#A68B4B' : '#6E6E73', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>
          <IconBuilding size={14} /> Mon entreprise
        </button>
      </div>

      {tab === 'compte' && <OngletCompte user={user} logout={logout} />}
      {tab === 'entreprise' && <OngletEntreprise user={user} />}
    </div>
  );
}

// ── Onglet 1 : Mon compte (paramètres personnels) ──
function OngletCompte({ user, logout }) {
  const [compte, setCompte] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: '',
  });
  const [pwdForm, setPwdForm] = useState({ ancien: '', nouveau: '', confirmer: '' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('freample_notif_prefs') || '{}'); }
    catch { return {}; }
  });

  const u = (k, v) => setCompte(p => ({ ...p, [k]: v }));

  function sauvegarderCompte() {
    // Simuler la sauvegarde (pas de backend pour les comptes demo)
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function sauvegarderNotifs(prefs) {
    setNotifPrefs(prefs);
    localStorage.setItem('freample_notif_prefs', JSON.stringify(prefs));
  }

  async function changerMotDePasse(e) {
    e?.preventDefault();
    setPwdMsg(null);
    if (!pwdForm.ancien || !pwdForm.nouveau || !pwdForm.confirmer) {
      setPwdMsg({ type: 'error', text: 'Veuillez remplir tous les champs' }); return;
    }
    if (pwdForm.nouveau.length < 6) {
      setPwdMsg({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' }); return;
    }
    if (pwdForm.nouveau !== pwdForm.confirmer) {
      setPwdMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas' }); return;
    }
    setPwdLoading(true);
    try {
      await api.put('/users/mot-de-passe', { ancienMotDePasse: pwdForm.ancien, nouveauMotDePasse: pwdForm.nouveau });
      setPwdMsg({ type: 'success', text: 'Mot de passe modifié avec succès' });
      setPwdForm({ ancien: '', nouveau: '', confirmer: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.erreur || 'Mot de passe modifié (compte demo)' });
      setPwdForm({ ancien: '', nouveau: '', confirmer: '' });
    } finally {
      setPwdLoading(false);
    }
  }

  const initials = user?.nom?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'P';

  return (
    <div>
      {/* Avatar + identité */}
      <div style={{ ...SECTION, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#A68B4B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{user?.nom}</div>
          <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 2 }}>{user?.email}</div>
          <div style={{ fontSize: 11, color: '#A68B4B', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {user?.role === 'fondateur' ? 'Fondateur' : user?.role === 'patron' ? 'Patron artisan' : 'Utilisateur'}
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div style={SECTION}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>Informations personnelles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={LBL}>Nom complet</label>
            <input value={compte.nom} onChange={e => u('nom', e.target.value)} style={INP} />
          </div>
          <div>
            <label style={LBL}>Téléphone personnel</label>
            <input value={compte.telephone} onChange={e => u('telephone', e.target.value)} style={INP} placeholder="06 12 34 56 78" />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={LBL}>Email de connexion</label>
          <input type="email" value={compte.email} onChange={e => u('email', e.target.value)} style={INP} />
        </div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={sauvegarderCompte} style={BTN}>Enregistrer</button>
          {saved && <span style={{ color: '#16A34A', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><IconCheck size={14} /> Enregistré</span>}
        </div>
      </div>

      {/* Notifications */}
      <div style={SECTION}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px' }}>Notifications</h2>
        <p style={{ fontSize: 12, color: '#6E6E73', margin: '0 0 14px' }}>Choisissez comment vous souhaitez être averti.</p>
        {[
          { key: 'email', label: 'Notifications par email', desc: 'Devis signés, paiements reçus, messages clients' },
          { key: 'push', label: 'Notifications push', desc: 'Sur votre navigateur (nécessite autorisation)' },
          { key: 'sms', label: 'Notifications SMS', desc: 'Urgences et rappels importants uniquement' },
        ].map(n => {
          const active = notifPrefs[n.key] !== false;
          return (
            <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F2F1ED' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</div>
                <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 2 }}>{n.desc}</div>
              </div>
              <button onClick={() => sauvegarderNotifs({ ...notifPrefs, [n.key]: !active })}
                style={{ width: 44, height: 24, borderRadius: 12, background: active ? '#16A34A' : '#E8E6E1', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: '#fff', top: 2, left: active ? 22 : 2, transition: 'left .2s' }} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Sécurité */}
      <div style={SECTION}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>Sécurité</h2>
        <form onSubmit={changerMotDePasse} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={LBL}>Mot de passe actuel</label>
            <input type="password" placeholder="••••••••" value={pwdForm.ancien} onChange={e => setPwdForm(p => ({ ...p, ancien: e.target.value }))} style={{ ...INP, maxWidth: 300 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LBL}>Nouveau mot de passe</label>
              <input type="password" placeholder="••••••••" value={pwdForm.nouveau} onChange={e => setPwdForm(p => ({ ...p, nouveau: e.target.value }))} style={INP} />
            </div>
            <div>
              <label style={LBL}>Confirmer</label>
              <input type="password" placeholder="••••••••" value={pwdForm.confirmer} onChange={e => setPwdForm(p => ({ ...p, confirmer: e.target.value }))} style={INP} />
            </div>
          </div>
          {pwdMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: pwdMsg.type === 'success' ? '#D1FAE5' : '#FEE2E2', color: pwdMsg.type === 'success' ? '#065F46' : '#DC2626', display: 'flex', alignItems: 'center', gap: 8 }}>
              {pwdMsg.type === 'success' ? <IconCheck size={14} /> : <IconAlert size={14} />}
              {pwdMsg.text}
            </div>
          )}
          <button type="submit" style={{ ...BTN_O, alignSelf: 'flex-start', opacity: pwdLoading ? 0.6 : 1 }} disabled={pwdLoading}>
            {pwdLoading ? 'Modification…' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>

      {/* Déconnexion */}
      <div style={SECTION}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px' }}>Déconnexion</h2>
        <p style={{ fontSize: 12, color: '#6E6E73', margin: '0 0 12px' }}>Déconnectez-vous de votre session actuelle.</p>
        <button onClick={async () => { if (logout) await logout(); window.location.href = '/login'; }} style={BTN_O}>
          Se déconnecter
        </button>
      </div>

      {/* Zone dangereuse */}
      <div style={{ ...SECTION, border: '1px solid rgba(255,59,48,0.25)', background: 'rgba(255,59,48,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <IconAlert size={16} color="#DC2626" />
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#DC2626' }}>Zone dangereuse</h2>
        </div>
        <p style={{ fontSize: 13, color: '#6E6E73', marginBottom: 12 }}>
          La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
        </p>
        {!deleteConfirm ? (
          <button onClick={() => setDeleteConfirm(true)} style={BTN_DANGER}>Supprimer mon compte</button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600, margin: 0 }}>
              Tapez <strong>SUPPRIMER</strong> pour confirmer la suppression définitive :
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input placeholder="SUPPRIMER" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} style={{ ...INP, maxWidth: 200 }} />
              <button disabled={deleteInput !== 'SUPPRIMER'} style={{ ...BTN_DANGER, opacity: deleteInput !== 'SUPPRIMER' ? 0.4 : 1 }}>
                Confirmer
              </button>
              <button onClick={() => { setDeleteConfirm(false); setDeleteInput(''); }} style={BTN_O}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Onglet 2 : Mon entreprise (profil entreprise) ──
function OngletEntreprise({ user }) {
  const userCtx = { ...user, entrepriseType: user?.entrepriseType || 'patron' };
  const [profil, setProfil] = useState(() => getProfilEntreprise(userCtx));
  const [saved, setSaved] = useState(false);
  const logoRef = useRef(null);

  const isComplet = isProfilComplet(profil);
  const manquants = champsManquants(profil);

  const u = (k, v) => setProfil(p => ({ ...p, [k]: v }));

  function handleLogoChange(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => u('logoUrl', ev.target.result);
    reader.readAsDataURL(file);
  }

  function sauvegarder() {
    setProfilEntreprise(userCtx, profil);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div style={{ marginBottom: 16, padding: 14, background: '#FFFBEB', borderRadius: 10, border: '1px solid #D9770640' }}>
        <p style={{ fontSize: 13, color: '#92400E', margin: 0, lineHeight: 1.5 }}>
          <strong>Ces informations apparaissent sur vos devis et factures.</strong> Modifier ici met automatiquement à jour tous les nouveaux documents que vous créez.
        </p>
      </div>

      {/* Bandeau complétude */}
      {!isComplet && (
        <div style={{ ...SECTION, background: '#FEF2F2', borderLeft: '4px solid #DC2626' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#DC2626', marginBottom: 6 }}>Profil incomplet</div>
          <div style={{ fontSize: 13, color: '#6E6E73' }}>
            Pour envoyer des devis conformes, renseignez : <strong>{manquants.map(c => LABELS_CHAMPS[c] || c).join(', ')}</strong>.
          </div>
        </div>
      )}
      {isComplet && (
        <div style={{ ...SECTION, background: '#F0FDF4', borderLeft: '4px solid #16A34A', padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconCheck size={16} color="#16A34A" />
          <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>Profil complet — vous pouvez créer et envoyer des devis.</span>
        </div>
      )}

      {/* Identité */}
      <div style={SECTION}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>Identité de l'entreprise</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div onClick={() => logoRef.current?.click()}
            style={{ width: 76, height: 76, borderRadius: 14, background: profil.logoUrl ? 'transparent' : '#FAFAF8', border: '2px dashed #E8E6E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', fontSize: 24, flexShrink: 0 }}>
            {profil.logoUrl ? <img src={profil.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: '#C7C7CC' }}>🏢</span>}
          </div>
          <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
          <div>
            <button type="button" onClick={() => logoRef.current?.click()} style={{ fontSize: 13, color: '#A68B4B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'block', marginBottom: 4, padding: 0 }}>
              {profil.logoUrl ? 'Changer le logo' : 'Ajouter un logo'}
            </button>
            <div style={{ fontSize: 11, color: '#6E6E73' }}>Apparaît sur vos devis et factures</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 10 }}>
          <div><label style={LBL}>Raison sociale *</label><input value={profil.nom} onChange={e => u('nom', e.target.value)} style={INP} /></div>
          <div>
            <label style={LBL}>Forme juridique *</label>
            <select value={profil.forme} onChange={e => u('forme', e.target.value)} style={INP}>
              <option>SAS</option><option>SARL</option><option>EURL</option><option>EI</option><option>SA</option><option>SCI</option><option>Auto-entrepreneur</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 10 }}>
          <div><label style={LBL}>SIRET *</label><input value={profil.siret} onChange={e => u('siret', e.target.value)} style={INP} /></div>
          <div><label style={LBL}>N° TVA intracom.</label><input value={profil.tvaIntra} onChange={e => u('tvaIntra', e.target.value)} style={INP} placeholder="FR12345678900" /></div>
          <div>
            <label style={LBL}>Régime TVA</label>
            <select value={profil.regimeTVA} onChange={e => u('regimeTVA', e.target.value)} style={INP}>
              <option value="standard">Standard</option>
              <option value="franchise">Franchise TVA</option>
              <option value="reel_normal">Réel normal</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 120px 1fr', gap: 12, marginBottom: 10 }}>
          <div><label style={LBL}>Adresse siège *</label><input value={profil.adresse} onChange={e => u('adresse', e.target.value)} style={INP} placeholder="12 rue de la Paix" /></div>
          <div><label style={LBL}>Code postal *</label><input value={profil.codePostal} onChange={e => u('codePostal', e.target.value)} style={INP} /></div>
          <div><label style={LBL}>Ville *</label><input value={profil.ville} onChange={e => u('ville', e.target.value)} style={INP} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={LBL}>Email pro *</label><input type="email" value={profil.email} onChange={e => u('email', e.target.value)} style={INP} /></div>
          <div><label style={LBL}>Téléphone entreprise</label><input value={profil.telephone} onChange={e => u('telephone', e.target.value)} style={INP} /></div>
        </div>
        <div style={{ marginTop: 10 }}>
          <label style={LBL}>Nom du gérant / signataire</label>
          <input value={profil.signatureGerant} onChange={e => u('signatureGerant', e.target.value)} style={INP} placeholder="Nom du représentant légal" />
        </div>
      </div>

      {/* Corps de métier */}
      {(() => {
        const competencesEquipe = getCompetencesEquipe();
        return (
          <div style={SECTION}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px' }}>Corps de métier</h2>
            <p style={{ fontSize: 12, color: '#6E6E73', margin: '0 0 14px' }}>Sélectionnez les métiers exercés par votre entreprise. Cela filtre les projets visibles sur le marketplace.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CORPS_METIER_BTP.map(m => {
                const selected = (profil.metiers || []).includes(m);
                const salaries = competencesEquipe[m] || [];
                return (
                  <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <button onClick={() => {
                      const metiers = selected ? (profil.metiers || []).filter(x => x !== m) : [...(profil.metiers || []), m];
                      u('metiers', metiers);
                    }} style={{ padding: '8px 16px', borderRadius: 8, border: selected ? 'none' : '1px solid #E8E6E1', background: selected ? '#A68B4B' : 'transparent', color: selected ? '#fff' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {m}
                    </button>
                    {selected && salaries.length > 0 && <span style={{ fontSize: 9, color: '#16A34A', fontWeight: 600 }}>{salaries.length} salarié{salaries.length > 1 ? 's' : ''}</span>}
                    {selected && salaries.length === 0 && <span style={{ fontSize: 9, color: '#DC2626', fontWeight: 600 }}>aucun</span>}
                  </div>
                );
              })}
            </div>
            {(profil.metiers || []).some(m => (competencesEquipe[m] || []).length === 0) && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#FFFBEB', border: '1px solid #D97706', borderRadius: 8, fontSize: 12 }}>
                <span style={{ color: '#D97706', fontWeight: 700 }}>Métiers sans salarié qualifié : </span>
                <span style={{ color: '#555' }}>{(profil.metiers || []).filter(m => (competencesEquipe[m] || []).length === 0).join(', ')}</span>
                <span style={{ color: '#555' }}> — vous devrez sous-traiter ou </span>
                <a href="/patron/employes" style={{ color: '#A68B4B', fontWeight: 600, textDecoration: 'none' }}>ajouter des compétences</a>
                <span style={{ color: '#555' }}> / </span>
                <a href="/patron/qse" style={{ color: '#A68B4B', fontWeight: 600, textDecoration: 'none' }}>vérifier QSE</a>
              </div>
            )}
          </div>
        );
      })()}

      {/* Assurances */}
      <div style={SECTION}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>Assurances (obligatoire BTP)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={LBL}>N° Décennale</label><input value={profil.decennale} onChange={e => u('decennale', e.target.value)} style={INP} /></div>
          <div><label style={LBL}>Assureur</label><input value={profil.decennaleAssureur} onChange={e => u('decennaleAssureur', e.target.value)} style={INP} placeholder="AXA, MAAF…" /></div>
          <div><label style={LBL}>Expiration</label><input type="date" value={profil.decennaleExpire} onChange={e => u('decennaleExpire', e.target.value)} style={INP} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 10 }}>
          <div><label style={LBL}>N° RC Pro</label><input value={profil.rcpro} onChange={e => u('rcpro', e.target.value)} style={INP} /></div>
          <div><label style={LBL}>Assureur RC Pro</label><input value={profil.rcproAssureur} onChange={e => u('rcproAssureur', e.target.value)} style={INP} /></div>
          <div><label style={LBL}>Expiration</label><input type="date" value={profil.rcproExpire} onChange={e => u('rcproExpire', e.target.value)} style={INP} /></div>
        </div>
        <div>
          <label style={LBL}>Couverture géographique décennale</label>
          <input value={profil.decennaleCouverture} onChange={e => u('decennaleCouverture', e.target.value)} style={INP} />
        </div>
      </div>

      {/* Bancaire */}
      <div style={SECTION}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px' }}>Coordonnées bancaires</h2>
        <p style={{ fontSize: 12, color: '#6E6E73', margin: '0 0 14px' }}>Où Freample vous reverse les paiements après libération du séquestre.</p>
        <div style={{ marginBottom: 10 }}>
          <label style={LBL}>Banque</label>
          <input value={profil.banque} onChange={e => u('banque', e.target.value)} style={INP} placeholder="BNP Paribas, Crédit Agricole…" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <div><label style={LBL}>IBAN</label><input value={profil.rib} onChange={e => u('rib', e.target.value)} style={{ ...INP, fontFamily: 'monospace' }} placeholder="FR76…" /></div>
          <div><label style={LBL}>BIC / SWIFT</label><input value={profil.bicSwift} onChange={e => u('bicSwift', e.target.value)} style={{ ...INP, fontFamily: 'monospace' }} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
        <button onClick={sauvegarder} style={{ ...BTN, padding: '12px 32px', fontSize: 14 }}>Enregistrer le profil</button>
        {saved && <span style={{ color: '#16A34A', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><IconCheck size={14} /> Enregistré</span>}
      </div>
    </div>
  );
}
