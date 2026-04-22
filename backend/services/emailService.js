// ============================================================
//  emailService.js — Service unifié d'envoi d'emails (Resend)
//  Utilisé par authRoutes, projetsRoutes, clientRoutes, etc.
// ============================================================

const { Resend } = require('resend');

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'Freample <onboarding@resend.dev>';
const FRONTEND = process.env.FRONTEND_URL || 'https://mon-artisan-fawn.vercel.app';

// ── Template wrapper ──────────────────────────────────────
function wrap(content) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <span style="font-size:22px;font-weight:900;color:#1A1A1A;letter-spacing:-0.04em;">Freample<span style="color:#A68B4B">.</span></span>
  </div>
  <div style="background:#fff;border:1px solid #E8E6E1;border-radius:12px;padding:32px 28px;">
    ${content}
  </div>
  <div style="text-align:center;margin-top:24px;font-size:11px;color:#999;">
    © ${new Date().getFullYear()} Freample — Vous recevez cet email car vous êtes inscrit sur Freample.
  </div>
</div>
</body>
</html>`;
}

// ── Send helper ───────────────────────────────────────────
async function send(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] (pas d'API key) → ${to} : ${subject}`);
    return { success: false, reason: 'no_api_key' };
  }
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html: wrap(html) });
    console.log(`[Email] ✓ ${to} : ${subject}`);
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error(`[Email] ✗ ${to} : ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ── Templates ─────────────────────────────────────────────

exports.sendBienvenue = (to, nom) => send(to,
  'Bienvenue sur Freample !',
  `<h2 style="color:#1A1A1A;font-size:20px;margin:0 0 16px;">Bienvenue, ${escapeHtml(nom)} 👋</h2>
   <p style="color:#333;font-size:14px;line-height:1.6;">Votre compte Freample a bien été créé. Vous pouvez dès maintenant publier un projet ou explorer les artisans de votre région.</p>
   <div style="text-align:center;margin:28px 0 12px;">
     <a href="${FRONTEND}/login" style="display:inline-block;padding:14px 32px;background:#2C2520;color:#F5EFE0;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Accéder à mon espace</a>
   </div>`
);

exports.sendResetPassword = (to, nom, token) => send(to,
  'Réinitialisation de votre mot de passe',
  `<h2 style="color:#1A1A1A;font-size:20px;margin:0 0 16px;">Bonjour ${escapeHtml(nom)},</h2>
   <p style="color:#333;font-size:14px;line-height:1.6;">Vous avez demandé la réinitialisation de votre mot de passe. Cliquez ci-dessous pour en choisir un nouveau :</p>
   <div style="text-align:center;margin:28px 0 12px;">
     <a href="${FRONTEND}/reset-password/${token}" style="display:inline-block;padding:14px 32px;background:#A68B4B;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Nouveau mot de passe</a>
   </div>
   <p style="color:#888;font-size:12px;">Ce lien expire dans 1 heure. Ignorez cet email si vous n'avez pas fait cette demande.</p>`
);

exports.sendNouvelleOffre = (to, nomClient, titreProjet, nomArtisan) => send(to,
  `Nouvelle offre reçue — ${titreProjet}`,
  `<h2 style="color:#1A1A1A;font-size:20px;margin:0 0 16px;">Bonne nouvelle, ${escapeHtml(nomClient)} !</h2>
   <p style="color:#333;font-size:14px;line-height:1.6;"><strong>${escapeHtml(nomArtisan)}</strong> a soumis une offre pour votre projet <strong>« ${escapeHtml(titreProjet)} »</strong>.</p>
   <p style="color:#333;font-size:14px;line-height:1.6;">Consultez-la dans votre espace client pour l'accepter ou demander des précisions.</p>
   <div style="text-align:center;margin:28px 0 12px;">
     <a href="${FRONTEND}/client/dashboard" style="display:inline-block;padding:14px 32px;background:#2C2520;color:#F5EFE0;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Voir l'offre</a>
   </div>`
);

exports.sendOffreAcceptee = (to, nomArtisan, titreProjet) => send(to,
  `Votre offre a été acceptée — ${titreProjet}`,
  `<h2 style="color:#1A1A1A;font-size:20px;margin:0 0 16px;">Félicitations, ${escapeHtml(nomArtisan)} ! 🎉</h2>
   <p style="color:#333;font-size:14px;line-height:1.6;">Votre offre pour le projet <strong>« ${escapeHtml(titreProjet)} »</strong> a été acceptée par le client.</p>
   <p style="color:#333;font-size:14px;line-height:1.6;">Vous pouvez maintenant organiser le début des travaux.</p>
   <div style="text-align:center;margin:28px 0 12px;">
     <a href="${FRONTEND}/artisan/dashboard" style="display:inline-block;padding:14px 32px;background:#16A34A;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Mon tableau de bord</a>
   </div>`
);

exports.sendPaiementLibere = (to, nom, montant, titreProjet) => send(to,
  `Paiement libéré — ${montant}€`,
  `<h2 style="color:#1A1A1A;font-size:20px;margin:0 0 16px;">Paiement confirmé 💰</h2>
   <p style="color:#333;font-size:14px;line-height:1.6;">Le paiement de <strong>${escapeHtml(String(montant))} €</strong> pour le projet <strong>« ${escapeHtml(titreProjet)} »</strong> a été libéré avec succès.</p>
   <p style="color:#333;font-size:14px;line-height:1.6;">Merci pour votre confiance, ${escapeHtml(nom)}.</p>
   <div style="text-align:center;margin:28px 0 12px;">
     <a href="${FRONTEND}/login" style="display:inline-block;padding:14px 32px;background:#2C2520;color:#F5EFE0;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Mon espace</a>
   </div>`
);

exports.sendVerificationCode = (to, code) => send(to,
  'Votre code de vérification Freample',
  `<h2 style="color:#1A1A1A;font-size:20px;margin:0 0 16px;">Code de vérification</h2>
   <p style="color:#333;font-size:14px;line-height:1.6;">Voici votre code de vérification :</p>
   <div style="text-align:center;margin:24px 0;">
     <span style="display:inline-block;padding:16px 32px;background:#FAFAF8;border:2px solid #A68B4B;border-radius:10px;font-size:32px;font-weight:900;letter-spacing:0.3em;color:#1A1A1A;">${escapeHtml(code)}</span>
   </div>
   <p style="color:#888;font-size:12px;line-height:1.5;">Ce code est valable 10 minutes. Si vous n'avez pas demandé ce code, ignorez cet email.</p>`
);

exports.sendNouvelAvis = (to, nomArtisan, note, nomClient) => send(to,
  `Nouvel avis reçu — ${note}★`,
  `<h2 style="color:#1A1A1A;font-size:20px;margin:0 0 16px;">Nouvel avis, ${escapeHtml(nomArtisan)} !</h2>
   <p style="color:#333;font-size:14px;line-height:1.6;"><strong>${escapeHtml(nomClient)}</strong> vous a laissé un avis <strong style="color:#A68B4B;">${'★'.repeat(note)}${'☆'.repeat(5 - note)}</strong></p>
   <p style="color:#333;font-size:14px;line-height:1.6;">Consultez-le et répondez dans votre tableau de bord.</p>
   <div style="text-align:center;margin:28px 0 12px;">
     <a href="${FRONTEND}/patron/dashboard" style="display:inline-block;padding:14px 32px;background:#2C2520;color:#F5EFE0;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Voir l'avis</a>
   </div>`
);

exports.sendWelcomeEmploye = (to, prenom, nomEntreprise) => send(to,
  `Vous avez rejoint ${escapeHtml(nomEntreprise)} sur Freample`,
  `<h2 style="color:#1A1A1A;font-size:20px;margin:0 0 16px;">Bienvenue dans l'équipe, ${escapeHtml(prenom)} ! 🎉</h2>
   <p style="color:#333;font-size:14px;line-height:1.6;"><strong>${escapeHtml(nomEntreprise)}</strong> vous a intégré à son équipe sur Freample.</p>
   <p style="color:#333;font-size:14px;line-height:1.6;">Connectez-vous avec votre compte existant pour accéder à votre espace salarié : planning, bulletins de paie, congés, documents.</p>
   <div style="text-align:center;margin:28px 0 12px;">
     <a href="${FRONTEND}/login" style="display:inline-block;padding:14px 32px;background:#2C2520;color:#F5EFE0;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Accéder à mon espace</a>
   </div>`
);

exports.sendIdentifiantsEmploye = (to, prenom, nom, tempPassword) => send(to,
  `Vos identifiants Freample — Bienvenue !`,
  `<h2 style="color:#1A1A1A;font-size:20px;margin:0 0 16px;">Votre compte est prêt, ${escapeHtml(prenom)} ! 🔑</h2>
   <p style="color:#333;font-size:14px;line-height:1.6;">Un compte a été créé pour vous sur Freample. Voici vos identifiants :</p>
   <div style="background:#F4F4F8;border-radius:12px;padding:16px 18px;margin:20px 0;">
     <p style="margin:0 0 8px;font-size:14px;"><strong>Email :</strong> ${escapeHtml(to)}</p>
     <p style="margin:0;font-size:14px;"><strong>Mot de passe temporaire :</strong> <code style="background:#E8E6E1;padding:2px 8px;border-radius:4px;font-size:16px;font-weight:700;">${escapeHtml(tempPassword)}</code></p>
   </div>
   <p style="color:#333;font-size:14px;line-height:1.6;">Connectez-vous pour accéder à votre espace salarié.</p>
   <p style="color:#DC2626;font-weight:600;font-size:13px;">⚠️ Pensez à changer votre mot de passe dès la première connexion.</p>
   <div style="text-align:center;margin:28px 0 12px;">
     <a href="${FRONTEND}/login" style="display:inline-block;padding:14px 32px;background:#2C2520;color:#F5EFE0;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Me connecter</a>
   </div>`
);
