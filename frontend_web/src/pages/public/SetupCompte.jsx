import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sha256, isNotExpired } from '../../utils/security';

const L = {
  gold: '#A68B4B', goldLight: '#F5EFE0', border: '#E8E6E1', bg: '#FAFAF8',
  text: '#1A1A1A', muted: '#333', subtle: '#555', green: '#16A34A', greenBg: '#F0FDF4',
  red: '#DC2626', redBg: '#FEF2F2', blue: '#2563EB', blueBg: '#EFF6FF',
};

const INP = { width: '100%', padding: '11px 14px', border: `1px solid ${L.border}`, borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const LBL = { fontSize: 11, fontWeight: 700, color: L.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };

export default function SetupCompte() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithMagicToken } = useAuth();

  const [compte, setCompte] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = password, 2 = profil
  const [loading, setLoading] = useState(true);

  // Form state
  const [mdp, setMdp] = useState('');
  const [mdpConfirm, setMdpConfirm] = useState('');
  const [profil, setProfil] = useState({
    tel: '', adresse: '', codePostal: '', ville: '', type: 'particulier', raisonSociale: '', siret: '',
  });

  useEffect(() => {
    try {
      const autoComptes = JSON.parse(localStorage.getItem('freample_clients_auto') || '[]');
      const c = autoComptes.find(x => x.magicToken === token);
      if (!c) { setError('Lien invalide.'); setLoading(false); return; }
      // Vérifier expiration du magic token (24h par défaut)
      if (c.magicTokenExpire && !isNotExpired(c.magicTokenExpire)) {
        setError('Ce lien a expiré. Demandez un nouveau lien à votre artisan.');
        setLoading(false); return;
      }
      // Vérifier qu'il n'a pas déjà été utilisé (one-time use) - sauf si déjà configuré
      if (c.magicTokenUsed && !c.mdpDefinitif) {
        setError('Ce lien a déjà été utilisé.');
        setLoading(false); return;
      }
      setCompte(c);
      setProfil(prev => ({ ...prev, tel: c.tel || '' }));
      if (c.mdpDefinitif && c.profilComplet) {
        // Déjà configuré — connexion directe
        loginWithMagicToken(token).then(() => navigate('/client/dashboard')).catch(() => {});
      }
    } catch (e) {
      setError('Erreur de chargement.');
    }
    setLoading(false);
  }, [token]);

  const validerMdp = async () => {
    if (mdp.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return; }
    if (mdp !== mdpConfirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setError('');
    // Hasher le mot de passe avant stockage (SHA-256 côté client, en attendant backend bcrypt)
    const mdpHash = await sha256(mdp);
    const autoComptes = JSON.parse(localStorage.getItem('freample_clients_auto') || '[]');
    const idx = autoComptes.findIndex(c => c.magicToken === token);
    if (idx >= 0) {
      autoComptes[idx] = {
        ...autoComptes[idx],
        motDePasseHash: mdpHash,
        mdpDefinitif: true,
        magicTokenUsed: true, // Token consommé (one-time use)
      };
      // Supprimer l'éventuel ancien champ motDePasse en clair si présent
      delete autoComptes[idx].motDePasse;
      localStorage.setItem('freample_clients_auto', JSON.stringify(autoComptes));
    }
    setStep(2);
  };

  const validerProfil = () => {
    if (!profil.tel || !profil.adresse || !profil.codePostal || !profil.ville) {
      setError('Tous les champs obligatoires doivent être remplis.');
      return;
    }
    setError('');
    // Sauver le profil client
    localStorage.setItem('freample_client_profil', JSON.stringify(profil));
    // Marquer compte complet
    const autoComptes = JSON.parse(localStorage.getItem('freample_clients_auto') || '[]');
    const idx = autoComptes.findIndex(c => c.magicToken === token);
    if (idx >= 0) {
      autoComptes[idx] = { ...autoComptes[idx], profilComplet: true, tel: profil.tel };
      localStorage.setItem('freample_clients_auto', JSON.stringify(autoComptes));
    }
    // Connexion automatique
    loginWithMagicToken(token).then(() => navigate('/client/dashboard')).catch(err => setError(err.message || 'Erreur de connexion'));
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: L.bg, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ color: L.subtle }}>Chargement...</div>
    </div>
  );

  if (error && !compte) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: L.bg, padding: 20, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 40, color: L.red, marginBottom: 10 }}>✕</div>
        <h2 style={{ marginTop: 0, color: L.text }}>Lien invalide</h2>
        <p style={{ color: L.subtle, fontSize: 14 }}>{error}</p>
        <button onClick={() => navigate('/login')} style={{ marginTop: 16, padding: '10px 20px', background: L.gold, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Aller à la connexion</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: L.bg, minHeight: '100vh', padding: '32px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: L.gold, letterSpacing: '-0.03em' }}>Freample</div>
          <div style={{ fontSize: 12, color: L.subtle, marginTop: 4 }}>Bienvenue {compte?.nom}</div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 4, background: step >= 1 ? L.gold : L.border, borderRadius: 2 }} />
          <div style={{ flex: 1, height: 4, background: step >= 2 ? L.gold : L.border, borderRadius: 2 }} />
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {step === 1 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Définissez votre mot de passe</h2>
              <p style={{ fontSize: 13, color: L.subtle, margin: '0 0 20px' }}>
                Pour accéder à votre espace et suivre l'avancement de votre chantier en temps réel.
              </p>

              {error && <div style={{ background: L.redBg, border: `1px solid ${L.red}`, padding: 10, borderRadius: 8, color: L.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}

              <div style={{ padding: 12, background: L.goldLight, borderRadius: 8, marginBottom: 16, fontSize: 12, color: L.muted }}>
                <strong>Email associé :</strong> {compte?.email}
              </div>

              <label style={LBL}>Nouveau mot de passe *</label>
              <input type="password" value={mdp} onChange={e => setMdp(e.target.value)} placeholder="8 caractères minimum" style={INP} />
              <div style={{ marginTop: 10 }}>
                <label style={LBL}>Confirmer le mot de passe *</label>
                <input type="password" value={mdpConfirm} onChange={e => setMdpConfirm(e.target.value)} style={INP} />
              </div>

              <button onClick={validerMdp} disabled={!mdp || !mdpConfirm}
                style={{ width: '100%', padding: 14, marginTop: 20, background: mdp && mdpConfirm ? L.gold : '#C7C7CC', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: mdp && mdpConfirm ? 'pointer' : 'default' }}>
                Continuer
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Complétez votre profil</h2>
              <p style={{ fontSize: 13, color: L.subtle, margin: '0 0 20px' }}>
                Ces informations faciliteront vos futurs devis et chantiers.
              </p>

              {error && <div style={{ background: L.redBg, border: `1px solid ${L.red}`, padding: 10, borderRadius: 8, color: L.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}

              <div style={{ marginBottom: 12 }}>
                <label style={LBL}>Téléphone *</label>
                <input value={profil.tel} onChange={e => setProfil(p => ({ ...p, tel: e.target.value }))} placeholder="06 12 34 56 78" style={INP} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={LBL}>Adresse *</label>
                <input value={profil.adresse} onChange={e => setProfil(p => ({ ...p, adresse: e.target.value }))} placeholder="12 rue de la Paix" style={INP} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={LBL}>Code postal *</label>
                  <input value={profil.codePostal} onChange={e => setProfil(p => ({ ...p, codePostal: e.target.value }))} placeholder="13001" style={INP} />
                </div>
                <div>
                  <label style={LBL}>Ville *</label>
                  <input value={profil.ville} onChange={e => setProfil(p => ({ ...p, ville: e.target.value }))} placeholder="Marseille" style={INP} />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={LBL}>Type de compte</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setProfil(p => ({ ...p, type: 'particulier' }))}
                    style={{ flex: 1, padding: 12, background: profil.type === 'particulier' ? L.gold : 'transparent', color: profil.type === 'particulier' ? '#fff' : L.muted, border: `1px solid ${profil.type === 'particulier' ? L.gold : L.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Particulier
                  </button>
                  <button onClick={() => setProfil(p => ({ ...p, type: 'entreprise' }))}
                    style={{ flex: 1, padding: 12, background: profil.type === 'entreprise' ? L.gold : 'transparent', color: profil.type === 'entreprise' ? '#fff' : L.muted, border: `1px solid ${profil.type === 'entreprise' ? L.gold : L.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Entreprise
                  </button>
                </div>
              </div>

              {profil.type === 'entreprise' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={LBL}>Raison sociale</label>
                    <input value={profil.raisonSociale} onChange={e => setProfil(p => ({ ...p, raisonSociale: e.target.value }))} style={INP} />
                  </div>
                  <div>
                    <label style={LBL}>SIRET</label>
                    <input value={profil.siret} onChange={e => setProfil(p => ({ ...p, siret: e.target.value }))} style={INP} />
                  </div>
                </div>
              )}

              <button onClick={validerProfil}
                style={{ width: '100%', padding: 14, marginTop: 12, background: L.gold, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Accéder à mon espace
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
