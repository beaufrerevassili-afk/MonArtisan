import React, { useState, useRef, useEffect, useCallback } from 'react';
import DS from '../design/ds';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── Constantes ───────────────────────────────────────────────────────────────

const METIERS = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Carrelage', 'Peinture',
  'Maçonnerie', 'Chauffage', 'Serrurerie', 'Jardinage', 'Couverture',
  'Isolation', 'Climatisation', 'Plâtrerie', 'Charpente', 'Vitrier', 'Autre',
];

const DOCUMENTS_REQUIS = [
  {
    id:       'piece_identite',
    label:    "Pièce d'identité",
    detail:   'CNI recto-verso ou passeport en cours de validité',
    accept:   'image/*,.pdf',
    required: true,
    icon:     '🪪',
  },
  {
    id:       'kbis',
    label:    'Extrait Kbis',
    detail:   'Moins de 3 mois — preuve d\'immatriculation de votre entreprise',
    accept:   '.pdf,image/*',
    required: true,
    icon:     '🏢',
  },
  {
    id:       'rc_pro',
    label:    'Attestation RC Pro',
    detail:   'Responsabilité Civile Professionnelle en cours de validité',
    accept:   '.pdf,image/*',
    required: true,
    icon:     '🛡️',
  },
  {
    id:       'attestation_urssaf',
    label:    'Attestation de vigilance URSSAF',
    detail:   'À télécharger sur le site urssaf.fr — moins de 6 mois',
    accept:   '.pdf,image/*',
    required: true,
    icon:     '📋',
  },
  {
    id:       'diplome',
    label:    'Diplôme / Certificat de qualification',
    detail:   'CAP, BEP, Bac Pro, certification professionnelle ou titre équivalent',
    accept:   '.pdf,image/*',
    required: true,
    icon:     '🎓',
  },
  {
    id:       'rib',
    label:    'RIB (Relevé d\'Identité Bancaire)',
    detail:   'Pour recevoir vos paiements en toute sécurité',
    accept:   '.pdf,image/*',
    required: true,
    icon:     '🏦',
  },
  {
    id:       'assurance_decennale',
    label:    'Assurance décennale',
    detail:   'Obligatoire pour les travaux de construction et rénovation',
    accept:   '.pdf,image/*',
    required: false,
    icon:     '📄',
  },
];

const STEPS_ARTISAN = [
  { num: 1, label: 'Compte'       },
  { num: 2, label: 'Profil'       },
  { num: 3, label: 'Documents'    },
  { num: 4, label: 'Confirmation' },
];

// ─── Sous-composants ──────────────────────────────────────────────────────────

function EyeIcon({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => {
        const done   = s.num < current;
        const active = s.num === current;
        return (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8125rem', fontWeight: 700, transition: 'all 0.25s',
                background: done ? '#059669' : active ? 'linear-gradient(135deg, #5B5BD6, #7C3AED)' : 'rgba(255,255,255,0.08)',
                boxShadow: active ? '0 4px 14px rgba(91,91,214,0.4)' : 'none',
                color: (done || active) ? '#fff' : 'rgba(255,255,255,0.3)',
                border: active ? 'none' : done ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}>
                {done
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : s.num
                }
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: active ? '#818CF8' : done ? '#34D399' : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1.5, background: done ? '#059669' : 'rgba(255,255,255,0.08)', margin: '0 8px', marginBottom: 22, minWidth: 20, maxWidth: 48, transition: 'background 0.3s', borderRadius: 2 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FileUploadZone({ doc, file, onChange }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = f => {
    if (!f) return;
    const maxMB = 10;
    if (f.size > maxMB * 1024 * 1024) { alert(`Fichier trop volumineux (max ${maxMB} Mo)`); return; }
    onChange(doc.id, f);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
          <span>{doc.icon}</span>
          {doc.label}
          {doc.required && <span style={{ color: '#F87171', fontSize: '0.75rem' }}>*</span>}
        </label>
        {!doc.required && (
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
            Optionnel
          </span>
        )}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>{doc.detail}</p>

      <div
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `1.5px dashed ${file ? 'rgba(52,211,153,0.5)' : dragging ? 'rgba(91,91,214,0.6)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
          background: file ? 'rgba(52,211,153,0.06)' : dragging ? 'rgba(91,91,214,0.08)' : 'rgba(255,255,255,0.03)',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        {file ? (
          <>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#34D399', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                {(file.size / 1024).toFixed(0)} Ko · {file.type.split('/')[1]?.toUpperCase()}
              </p>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(doc.id, null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </>
        ) : (
          <>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                Glissez ou <span style={{ color: DS.accent }}>parcourez</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>PDF, JPG, PNG — max 10 Mo</p>
            </div>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept={doc.accept} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function Register() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [searchParams]    = useSearchParams();
  const urlRole    = searchParams.get('role') || 'client';
  const urlSecteur = searchParams.get('secteur') || 'btp';
  const [role, setRole]   = useState(urlRole);
  const [secteur] = useState(urlSecteur);
  const [step, setStep]   = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Données compte
  const [compte, setCompte] = useState({ nom: '', email: '', telephone: '', motdepasse: '' });
  // Données profil artisan
  const [profil, setProfil] = useState({ metier: '', siret: '', adresse: '', ville: '', experience: '', description: '' });
  // Documents uploadés { id: File }
  const [documents, setDocuments] = useState({});

  // ── Vérification SIRET ──
  // 'idle' | 'checking' | 'valid' | 'invalid' | 'error'
  const [siretStatus, setSiretStatus] = useState('idle');
  const [siretData,   setSiretData]   = useState(null); // { nom, adresse, ville, codeNaf, libNaf, actif }

  // Algorithme de Luhn pour valider mathématiquement le SIRET
  const luhnCheck = (num) => {
    let sum = 0;
    let alternate = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num[i], 10);
      if (alternate) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  };

  const verifySiret = useCallback(async (siretRaw) => {
    const siret = siretRaw.replace(/\s/g, '');
    if (siret.length !== 14) return;
    setSiretStatus('checking');
    setSiretData(null);

    // Vérification mathématique du numéro (algorithme de Luhn)
    if (!luhnCheck(siret)) {
      setSiretStatus('invalid');
      setSiretData({ nom: null, luhnFail: true });
      return;
    }

    const siren = siret.slice(0, 9);
    try {
      // API publique recherche-entreprises.api.gouv.fr (aucune clé requise, CORS ok)
      const res = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${siren}&page=1&per_page=1`
      );
      if (!res.ok) { setSiretStatus('error'); return; }

      const json = await res.json();
      const results = json.results || [];
      if (results.length === 0) { setSiretStatus('invalid'); return; }

      const entreprise = results[0];

      // Vérifier que le SIREN correspond exactement
      if (entreprise.siren !== siren) { setSiretStatus('invalid'); return; }

      const nom    = entreprise.nom_complet || entreprise.nom_raison_sociale || 'Entreprise inconnue';
      const actif  = entreprise.etat_administratif === 'A';
      const siege  = entreprise.siege || {};
      const adresse= siege.adresse || '';
      const commune= siege.libelle_commune || '';
      const cp     = siege.code_postal || '';
      const villeStr = [cp, commune].filter(Boolean).join(' ') || adresse;
      const codeNaf= siege.activite_principale || entreprise.activite_principale || '';

      if (!actif) {
        setSiretStatus('invalid');
        setSiretData({ nom, adresse, ville: villeStr, codeNaf, libNaf: '', actif: false });
        return;
      }

      setSiretData({ nom, adresse, ville: villeStr, codeNaf, libNaf: '', actif: true });
      setSiretStatus('valid');

      // Pré-remplir adresse et ville si vides
      setProfil(prev => ({
        ...prev,
        adresse: prev.adresse.trim() ? prev.adresse : adresse,
        ville:   prev.ville.trim()   ? prev.ville   : commune,
      }));
    } catch {
      setSiretStatus('error');
    }
  }, []);

  function setDoc(id, file) {
    setDocuments(prev => ({ ...prev, [id]: file }));
  }

  // Déclencher la vérification dès que le SIRET atteint 14 chiffres
  useEffect(() => {
    const digits = profil.siret.replace(/\s/g, '');
    if (digits.length === 14) {
      verifySiret(profil.siret);
    } else {
      // Réinitialiser si l'utilisateur efface
      setSiretStatus('idle');
      setSiretData(null);
    }
  }, [profil.siret, verifySiret]);

  // ── Validation par étape ──
  function validateStep1() {
    if (!compte.nom.trim())   return 'Le nom est requis';
    if (!compte.email.trim()) return 'L\'email est requis';
    if (!/\S+@\S+\.\S+/.test(compte.email)) return 'Email invalide';
    if (compte.motdepasse.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (role === 'artisan' && !compte.telephone.trim()) return 'Le numéro de téléphone est requis';
    return null;
  }

  function validateStep2() {
    if (!profil.metier)          return 'Sélectionnez votre métier';
    if (!profil.siret.trim())    return 'Le numéro SIRET est requis';
    if (profil.siret.replace(/\s/g, '').length !== 14) return 'Le SIRET doit contenir 14 chiffres';
    if (siretStatus === 'checking') return 'Vérification du SIRET en cours, veuillez patienter...';
    if (siretStatus === 'invalid')  return 'SIRET invalide ou entreprise radiée — vérifiez le numéro';
    if (siretStatus === 'error')    return 'Impossible de vérifier le SIRET (réseau) — réessayez';
    if (siretStatus !== 'valid')    return 'Veuillez attendre la vérification du SIRET';
    if (!profil.ville.trim())    return 'La ville est requise';
    if (!profil.description.trim()) return 'Décrivez brièvement votre activité';
    return null;
  }

  function validateStep3() {
    const manquants = DOCUMENTS_REQUIS
      .filter(d => d.required && !documents[d.id])
      .map(d => d.label);
    if (manquants.length > 0) return `Documents manquants : ${manquants.join(', ')}`;
    return null;
  }

  function nextStep() {
    setError('');
    let err = null;
    if (step === 1) err = validateStep1();
    if (step === 2) err = validateStep2();
    if (step === 3) err = validateStep3();
    if (err) { setError(err); return; }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      // Préparer les métadonnées des documents (pas d'upload réel en démo)
      const docsMetadata = Object.entries(documents).reduce((acc, [id, file]) => {
        if (file) acc[id] = { nom: file.name, taille: file.size, type: file.type, soumisLe: new Date().toISOString() };
        return acc;
      }, {});

      const payload = {
        nom:        compte.nom,
        email:      compte.email,
        motdepasse: compte.motdepasse,
        role,
        ...(role === 'artisan' && {
          telephone:    compte.telephone,
          metier:       profil.metier,
          siret:        profil.siret.replace(/\s/g, ''),
          adresse:      profil.adresse,
          ville:        profil.ville,
          experience:   profil.experience,
          description:  profil.description,
          documents:    docsMetadata,
          statut_verification: 'en_attente',
        }),
      };

      const { data } = await api.post('/register', payload);

      if (role === 'artisan') {
        // Artisan → pas d'auto-login, compte en attente de vérification
        setStep(5); // Page de confirmation
      } else {
        // Client → auto-login direct
        const logged = await login(compte.email, compte.motdepasse);
        navigate('/client/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Rendu principal ─────────────────────────────────────────────────────────

  const isArtisan = role === 'artisan';
  const isPatron  = role === 'patron';
  const isPro = isArtisan || isPatron;
  const maxWidth  = (isArtisan && step === 3) ? 600 : 440;

  // Page de succès artisan
  if (step === 5) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 40px rgba(52,211,153,0.15)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.03em' }}>Dossier soumis !</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 28, fontSize: '0.9375rem' }}>
            Votre dossier de vérification est en cours d'examen.<br />
            Notre équipe vous contacte sous <strong style={{ color: 'rgba(255,255,255,0.8)' }}>24 à 48h</strong> par e-mail.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Étapes de validation</p>
            {[
              { label: 'Vérification de l\'identité',               done: true  },
              { label: `Contrôle SIRET${siretData ? ` — ${siretData.nom}` : ''}`, done: siretStatus === 'valid' },
              { label: 'Validation de la RC Pro',                   done: false },
              { label: 'Vérification de l\'attestation URSSAF',     done: false },
              { label: 'Activation du compte artisan',              done: false },
            ].map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: e.done ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)', border: e.done ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {e.done
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                  }
                </div>
                <span style={{ fontSize: '0.875rem', color: e.done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontWeight: e.done ? 500 : 400 }}>{e.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', letterSpacing: '0.01em', boxShadow: '0 4px 20px rgba(91,91,214,0.35)' }}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080F', padding: '32px 16px 56px', fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
      <style>{`
        .reg-input {
          width: 100%; box-sizing: border-box;
          padding: 12px 14px; border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: #fff; font-size: 0.9375rem; outline: none;
          transition: all 0.2s ease; font-family: inherit;
        }
        .reg-input::placeholder { color: rgba(255,255,255,0.22); }
        .reg-input:focus {
          border-color: rgba(91,91,214,0.55);
          background: rgba(91,91,214,0.07);
          box-shadow: 0 0 0 3px rgba(91,91,214,0.12);
        }
        .reg-select {
          width: 100%; box-sizing: border-box;
          padding: 12px 14px; border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: #fff; font-size: 0.9375rem; outline: none;
          transition: all 0.2s ease; font-family: inherit;
          appearance: none; cursor: pointer;
        }
        .reg-select:focus {
          border-color: rgba(91,91,214,0.55);
          background: rgba(91,91,214,0.07);
          box-shadow: 0 0 0 3px rgba(91,91,214,0.12);
        }
        .reg-select option { background: #1A1A2E; color: #fff; }
        .reg-label { display: block; margin-bottom: 7px; font-size: 0.8125rem; font-weight: 600; color: rgba(255,255,255,0.55); letter-spacing: 0.02em; }
        .reg-card { background: rgba(255,255,255,0.04); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); padding: 24px; }
        .reg-btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 20px; border-radius: 11px;
          background: linear-gradient(135deg, #5B5BD6, #7C3AED);
          border: none; color: #fff; font-size: 0.9375rem; font-weight: 600;
          cursor: pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          letter-spacing: 0.01em; font-family: inherit; width: 100%;
        }
        .reg-btn-primary:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(91,91,214,0.4); }
        .reg-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .reg-btn-secondary {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 13px 16px; border-radius: 11px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7); font-size: 0.9375rem; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease; font-family: inherit;
        }
        .reg-btn-secondary:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .reg-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: regSpin 0.7s linear infinite; }
        @keyframes regSpin { to { transform: rotate(360deg); } }
        @keyframes regFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ width: '100%', maxWidth: maxWidth, margin: '0 auto', animation: 'regFadeUp 0.5s ease both' }}>

        {/* Logo + titre */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <button onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, fontWeight:900, color:DS.ink, letterSpacing:'-0.05em', marginBottom:16, fontFamily:DS.font }}>
            Artisans<span style={{color:DS.gold}}>.</span>
          </button>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.04em', color: DS.ink, marginBottom: 6 }}>
            {role==='artisan' ? 'Rejoindre la plateforme' : role==='patron' ? 'Créer mon espace pro' : 'Créer votre compte'}
          </h1>
          <p style={{ color: DS.muted, fontSize: '0.9375rem' }}>
            {role==='client' ? 'Un seul compte pour tous les services — coiffure, artisans, restaurants…' : role==='patron' ? `Gérez votre activité ${secteur} en ligne` : 'Développez votre activité avec Artisans.'}
          </p>
        </div>

        {/* Sélecteur rôle (seulement step 1) */}
        {step === 1 && (
          <div style={{ padding: 5, marginBottom: 16, display: 'flex', gap: 4, background: DS.bgSoft, borderRadius: DS.r.full, border: `1px solid ${DS.border}` }}>
            {[
              { value: 'client',  label: '👤 Je suis client' },
              { value: 'artisan', label: '🔨 Je suis artisan' },
              { value: 'patron',  label: '🏢 J'ai une entreprise' },
            ].map(r => (
              <button
                key={r.value}
                onClick={() => { setRole(r.value); setError(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: DS.r.full, fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: role === r.value ? DS.accent : 'transparent', color: role === r.value ? '#fff' : DS.muted, fontFamily: DS.font }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* Step indicator artisan */}
        {isArtisan && <StepIndicator steps={STEPS_ARTISAN} current={step} />}

        {/* ══ STEP 1 — Compte ══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="reg-card">
            {isArtisan && (
              <div style={{ background: 'rgba(91,91,214,0.08)', border: '1px solid rgba(91,91,214,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10 }}>
                <span style={{ flexShrink: 0, fontSize: '1rem' }}>ℹ️</span>
                <p style={{ fontSize: '0.8125rem', color: '#818CF8', lineHeight: 1.5 }}>
                  <strong>Processus de vérification obligatoire</strong> — Pour garantir la sécurité de nos clients, chaque artisan est vérifié avant activation : pièce d'identité, Kbis, RC Pro, attestation URSSAF et diplôme.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label htmlFor="reg-nom" className="reg-label">Prénom et nom complet</label>
                <input id="reg-nom" className="reg-input" type="text" placeholder={isArtisan ? 'Carlos Garcia' : 'Marie Dupont'} value={compte.nom} onChange={e => setCompte({ ...compte, nom: e.target.value })} autoComplete="name" />
              </div>

              <div>
                <label htmlFor="reg-email" className="reg-label">Adresse e-mail</label>
                <input id="reg-email" className="reg-input" type="email" placeholder="votre@email.com" value={compte.email} onChange={e => setCompte({ ...compte, email: e.target.value })} autoComplete="email" />
              </div>

              {isArtisan && (
                <div>
                  <label htmlFor="reg-tel" className="reg-label">Numéro de téléphone <span style={{ color: '#F87171' }}>*</span></label>
                  <input id="reg-tel" className="reg-input" type="tel" placeholder="06 12 34 56 78" value={compte.telephone} onChange={e => setCompte({ ...compte, telephone: e.target.value })} autoComplete="tel" />
                </div>
              )}

              <div>
                <label htmlFor="reg-password" className="reg-label">Mot de passe <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>— 8 caractères minimum</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
                    className="reg-input"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={compte.motdepasse}
                    onChange={e => setCompte({ ...compte, motdepasse: e.target.value })}
                    autoComplete="new-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', display: 'flex', padding: 2 }}>
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
                {compte.motdepasse && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[2, 6, 10].map((threshold, i) => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: compte.motdepasse.length >= threshold ? (compte.motdepasse.length >= 10 ? '#34D399' : '#FBBF24') : 'rgba(255,255,255,0.08)', transition: 'background 0.2s' }} />
                    ))}
                    <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', marginLeft: 6, whiteSpace: 'nowrap' }}>
                      {compte.motdepasse.length < 6 ? 'Faible' : compte.motdepasse.length < 10 ? 'Moyen' : 'Fort'}
                    </span>
                  </div>
                )}
              </div>

              {error && <ErrorBox message={error} />}

              <ActionButton label={isArtisan ? 'Continuer →' : 'Créer mon compte'} onClick={isArtisan ? nextStep : handleSubmit} loading={loading} />
            </div>
          </div>
        )}

        {/* ══ STEP 2 — Profil professionnel ════════════════════════════════════ */}
        {step === 2 && (
          <div className="reg-card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 20 }}>Votre profil professionnel</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label className="reg-label">Métier principal <span style={{ color: '#F87171' }}>*</span></label>
                <select className="reg-select" value={profil.metier} onChange={e => setProfil({ ...profil, metier: e.target.value })}>
                  <option value="">Sélectionnez votre métier</option>
                  {METIERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="reg-label">
                  Numéro SIRET <span style={{ color: '#F87171' }}>*</span>
                  <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>— 14 chiffres</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="reg-input"
                    type="text"
                    placeholder="123 456 789 01234"
                    value={profil.siret}
                    maxLength={17}
                    style={{
                      paddingRight: 40,
                      borderColor: siretStatus === 'valid' ? 'rgba(52,211,153,0.5)' : siretStatus === 'invalid' || siretStatus === 'error' ? 'rgba(248,113,113,0.5)' : undefined,
                    }}
                    onChange={e => {
                      const v = e.target.value.replace(/[^\d]/g, '');
                      const f = v.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
                      setProfil({ ...profil, siret: f });
                    }}
                  />
                  {siretStatus === 'checking' && (
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                        </path>
                      </svg>
                    </div>
                  )}
                  {siretStatus === 'valid' && (
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                  {(siretStatus === 'invalid' || siretStatus === 'error') && (
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </div>
                  )}
                </div>

                {siretStatus === 'checking' && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
                    Vérification en cours sur le registre national...
                  </p>
                )}
                {siretStatus === 'valid' && siretData && (
                  <div style={{ marginTop: 8, background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34D399' }}>Entreprise vérifiée</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', margin: 0 }}>{siretData.nom}</p>
                    {siretData.adresse && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: '3px 0 0' }}>{siretData.adresse}</p>}
                    {siretData.ville && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: '1px 0 0' }}>{siretData.ville}</p>}
                    {siretData.codeNaf && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: '5px 0 0' }}>NAF : {siretData.codeNaf}</p>}
                  </div>
                )}
                {siretStatus === 'invalid' && (
                  <div style={{ marginTop: 8, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '8px 12px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#F87171', margin: 0 }}>
                      {siretData?.luhnFail
                        ? '❌ Numéro SIRET invalide (clé de contrôle incorrecte)'
                        : siretData && !siretData.actif
                        ? `⚠️ ${siretData.nom} — entreprise fermée ou radiée`
                        : '❌ Numéro SIRET introuvable dans le registre national'}
                    </p>
                  </div>
                )}
                {siretStatus === 'error' && (
                  <div style={{ marginTop: 8, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ fontSize: '0.75rem', color: '#FBBF24', margin: 0 }}>
                      ⚠️ Impossible de contacter le registre — vérifiez votre connexion
                    </p>
                    <button
                      type="button"
                      onClick={() => verifySiret(profil.siret)}
                      style={{ fontSize: '0.75rem', color: '#818CF8', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}
                    >
                      Réessayer
                    </button>
                  </div>
                )}
                {siretStatus === 'idle' && profil.siret.replace(/\s/g, '').length < 14 && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 5 }}>
                    Vérification automatique sur <span style={{ color: DS.accent }}>registre national entreprises</span>
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="reg-label">Ville d'exercice <span style={{ color: '#F87171' }}>*</span></label>
                  <input className="reg-input" placeholder="Paris, Lyon..." value={profil.ville} onChange={e => setProfil({ ...profil, ville: e.target.value })} />
                </div>
                <div>
                  <label className="reg-label">Années d'expérience</label>
                  <select className="reg-select" value={profil.experience} onChange={e => setProfil({ ...profil, experience: e.target.value })}>
                    <option value="">Sélectionner</option>
                    {['Moins d\'1 an', '1 à 3 ans', '3 à 5 ans', '5 à 10 ans', '10 à 20 ans', '+20 ans'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="reg-label">Adresse professionnelle</label>
                <input className="reg-input" placeholder="Numéro, rue, code postal" value={profil.adresse} onChange={e => setProfil({ ...profil, adresse: e.target.value })} />
              </div>

              <div>
                <label className="reg-label">Présentation de votre activité <span style={{ color: '#F87171' }}>*</span></label>
                <textarea
                  className="reg-input"
                  rows={3}
                  placeholder="Décrivez vos spécialités, votre zone d'intervention, vos points forts..."
                  value={profil.description}
                  onChange={e => setProfil({ ...profil, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
                <p style={{ fontSize: '0.75rem', color: profil.description.length > 20 ? '#34D399' : 'rgba(255,255,255,0.25)', marginTop: 5 }}>
                  {profil.description.length} / 500 caractères
                </p>
              </div>

              {error && <ErrorBox message={error} />}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setStep(1); setError(''); }} className="reg-btn-secondary" style={{ flex: 1 }}>← Retour</button>
                <button onClick={nextStep} className="reg-btn-primary" style={{ flex: 2 }}>Continuer →</button>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — Documents ═══════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="reg-card">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>Documents de vérification</h2>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                Ces documents sont <strong style={{ color: 'rgba(255,255,255,0.65)' }}>obligatoires</strong> pour garantir votre identité et votre sérieux. Traitement strictement confidentiel.
              </p>
            </div>

            <div style={{ background: 'rgba(91,91,214,0.08)', border: '1px solid rgba(91,91,214,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ flexShrink: 0 }}>🔒</span>
              <p style={{ fontSize: '0.75rem', color: '#818CF8', lineHeight: 1.4 }}>
                Chiffrement AES-256 · Stockage en France · Suppression 30j après validation · Conformité RGPD
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {DOCUMENTS_REQUIS.map(doc => (
                <FileUploadZone key={doc.id} doc={doc} file={documents[doc.id] || null} onChange={setDoc} />
              ))}
            </div>

            <div style={{ margin: '20px 0 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                <span>{Object.values(documents).filter(Boolean).length} / {DOCUMENTS_REQUIS.filter(d => d.required).length} documents obligatoires</span>
                <span style={{ color: '#818CF8', fontWeight: 600 }}>{Math.round(Object.values(documents).filter(Boolean).length / DOCUMENTS_REQUIS.filter(d => d.required).length * 100)}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #5B5BD6, #7C3AED)', borderRadius: 3, width: `${Math.round(Object.values(documents).filter(Boolean).length / DOCUMENTS_REQUIS.filter(d => d.required).length * 100)}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {error && <ErrorBox message={error} />}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setStep(2); setError(''); }} className="reg-btn-secondary" style={{ flex: 1 }}>← Retour</button>
              <button onClick={nextStep} className="reg-btn-primary" style={{ flex: 2 }}>Vérifier et continuer →</button>
            </div>
          </div>
        )}

        {/* ══ STEP 4 — Récapitulatif ════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="reg-card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 20 }}>Récapitulatif de votre dossier</h2>

            <RecapSection title="Compte">
              <RecapRow label="Nom"       value={compte.nom}       />
              <RecapRow label="Email"     value={compte.email}     />
              <RecapRow label="Téléphone" value={compte.telephone} />
            </RecapSection>

            <RecapSection title="Profil professionnel">
              <RecapRow label="Métier"      value={profil.metier}     />
              <RecapRow label="SIRET"       value={profil.siret}      />
              <RecapRow label="Ville"       value={profil.ville}      />
              <RecapRow label="Expérience"  value={profil.experience} />
            </RecapSection>

            <RecapSection title="Documents">
              {DOCUMENTS_REQUIS.map(doc => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.65)' }}>{doc.icon} {doc.label}</span>
                  {documents[doc.id]
                    ? <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34D399', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Fourni
                      </span>
                    : <span style={{ fontSize: '0.75rem', color: doc.required ? '#F87171' : 'rgba(255,255,255,0.25)' }}>
                        {doc.required ? '⚠️ Manquant' : 'Non fourni'}
                      </span>
                  }
                </div>
              ))}
            </RecapSection>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', marginBottom: 18 }}>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                En soumettant ce dossier, je certifie que tous les documents fournis sont authentiques et conformes. Je comprends que toute fausse déclaration entraîne la suppression immédiate de mon compte et peut faire l'objet de poursuites judiciaires.
              </p>
            </div>

            {error && <ErrorBox message={error} />}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setStep(3); setError(''); }} className="reg-btn-secondary" style={{ flex: 1 }}>← Modifier</button>
              <button onClick={handleSubmit} className="reg-btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading
                  ? <><div className="reg-spinner" /> Envoi en cours...</>
                  : '✓ Soumettre mon dossier'
                }
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#818CF8', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Micro-composants utilitaires ─────────────────────────────────────────────

function ErrorBox({ message }) {
  return (
    <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: '0.875rem', display: 'flex', gap: 8 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {message}
    </div>
  );
}

function ActionButton({ label, onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="reg-btn-primary"
      style={{ marginTop: 4 }}
    >
      {loading ? <><div className="reg-spinner" /> Création...</> : label}
    </button>
  );
}

function RecapSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</p>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>{children}</div>
    </div>
  );
}

function RecapRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{value}</span>
    </div>
  );
}
