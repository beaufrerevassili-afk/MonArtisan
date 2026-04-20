import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { secureToken } from '../../utils/security';

// Bouton + modal pour envoyer un devis au client par email avec lien de signature
export default function EnvoyerDevisButton({ devis, onEnvoye, size = 'md', label = 'Envoyer au client' }) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(devis.clientEmail || '');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'sent'
  const [lienCopied, setLienCopied] = useState(false);

  // Générer ou récupérer le token de signature
  const token = devis.signatureToken || secureToken(8);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://freample.com';
  const lienSignature = `${baseUrl}/devis/${devis.id}/signer?token=${token}`;

  const envoyer = () => {
    if (!email.trim()) return;
    // Mettre à jour le devis en statut 'envoye' + sauver le token + email
    try {
      const all = JSON.parse(localStorage.getItem('freample_devis') || '[]');
      const idx = all.findIndex(x => String(x.id) === String(devis.id));
      if (idx >= 0) {
        all[idx] = {
          ...all[idx],
          statut: 'envoye',
          signatureToken: token,
          clientEmail: email,
          messageEnvoi: message,
          envoyeLe: new Date().toISOString(),
          lienSignature,
        };
        localStorage.setItem('freample_devis', JSON.stringify(all));
      }
      // Simuler l'envoi d'email dans un "journal d'emails"
      const emails = JSON.parse(localStorage.getItem('freample_emails_envoyes') || '[]');
      emails.push({
        id: Date.now(), to: email, date: new Date().toISOString(),
        sujet: `Votre devis ${devis.numero} de ${devis.emetteur?.nom || 'votre artisan'}`,
        contenu: message || `Bonjour,\n\nVoici votre devis ${devis.numero}. Vous pouvez le consulter et le signer en ligne via le lien ci-dessous :\n\n${lienSignature}\n\nCordialement,\n${devis.emetteur?.nom || devis.aeNom || 'L\'entreprise'}`,
        devisId: devis.id,
      });
      localStorage.setItem('freample_emails_envoyes', JSON.stringify(emails));
    } catch {}
    setStep('sent');
    if (onEnvoye) onEnvoye();
    addToast(`Devis ${devis.numero} envoyé à ${email}`, 'success');
  };

  const copyLien = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lienSignature);
      setLienCopied(true);
      setTimeout(() => setLienCopied(false), 2000);
    }
  };

  const BTN_SIZE = size === 'sm' ? { padding: '4px 10px', fontSize: 11 } : { padding: '7px 14px', fontSize: 12 };

  return (
    <>
      <button onClick={() => { setOpen(true); setStep(devis.statut === 'envoye' ? 'sent' : 'form'); }}
        style={{ ...BTN_SIZE, background: '#A68B4B', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        {devis.statut === 'envoye' ? 'Relancer / lien' : label}
      </button>

      {open && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto', fontFamily: 'Inter, sans-serif' }}>
            {step === 'form' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Envoyer le devis au client</h3>
                  <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6E6E73' }}>×</button>
                </div>

                <p style={{ fontSize: 13, color: '#6E6E73', margin: '0 0 16px' }}>
                  Envoyez le devis <strong>{devis.numero}</strong> à <strong>{devis.client}</strong>. Il recevra un email avec un lien pour consulter et signer le devis, <strong>sans avoir besoin de compte Freample</strong>.
                </p>

                <label style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Email du client</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="client@email.fr"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 14 }} />

                <label style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Message (optionnel)</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder={`Bonjour ${devis.client?.split(' ')[0] || ''},\n\nVeuillez trouver ci-joint votre devis pour ${devis.objet || 'les travaux demandés'}. Vous pouvez le consulter et le signer en ligne via le lien ci-dessous.`}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 14, minHeight: 100, fontFamily: 'inherit', resize: 'vertical' }} />

                <div style={{ padding: 12, background: '#F8F9FD', borderRadius: 8, marginBottom: 16, fontSize: 11, color: '#636363' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Lien de signature genere</div>
                  <div style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#5B5BD6' }}>{lienSignature}</div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setOpen(false)} style={{ padding: '10px 16px', background: 'transparent', color: '#555', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Annuler</button>
                  <button onClick={envoyer} disabled={!email.trim()}
                    style={{ flex: 1, padding: 10, background: email.trim() ? '#16A34A' : '#C7C7CC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: email.trim() ? 'pointer' : 'not-allowed' }}>
                    Envoyer le devis
                  </button>
                </div>
              </>
            )}

            {step === 'sent' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ width: 60, height: 60, background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 28 }}>✓</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Devis envoye !</h3>
                  <p style={{ fontSize: 13, color: '#6E6E73', margin: '6px 0 0' }}>
                    {devis.clientEmail && `Un email a ete envoye a ${devis.clientEmail}. `}
                    Vous pouvez aussi partager directement le lien ci-dessous.
                  </p>
                </div>

                <div style={{ padding: 14, background: '#F8F9FD', borderRadius: 10, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', marginBottom: 6 }}>Lien de signature</div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#5B5BD6', wordBreak: 'break-all', padding: 10, background: '#fff', borderRadius: 6, border: '1px solid #E5E5EA' }}>{lienSignature}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={copyLien}
                      style={{ flex: 1, padding: '8px 12px', background: lienCopied ? '#16A34A' : '#1C1C1E', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {lienCopied ? 'Lien copie !' : 'Copier le lien'}
                    </button>
                    <a href={lienSignature} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '8px 12px', background: 'transparent', color: '#5B5BD6', border: '1px solid #5B5BD6', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                      Ouvrir
                    </a>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#6E6E73', padding: 10, background: '#FFFBEB', borderRadius: 8, marginBottom: 14, border: '1px solid #D9770620' }}>
                  <strong>Note :</strong> Vous pouvez envoyer ce lien par SMS, WhatsApp ou tout autre moyen. Le client pourra signer sans creer de compte Freample. Apres signature, une facture d'acompte sera automatiquement generee.
                </div>

                <button onClick={() => setOpen(false)} style={{ width: '100%', padding: 10, background: '#1C1C1E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Fermer
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
