// ============================================================
//  comRoutes.js — Freample Com API (briefs, projets, devis)
// ============================================================
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { Resend } = require('resend');

// ── Email config (Resend) ──
const resend = new Resend(process.env.RESEND_API_KEY || 're_MXvfZKdv_344N1BptPeCwJbX5UWqLcsGr');

async function sendEmail(to, subject, html) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Freample Com <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }
    console.log(`✉️ Email envoyé à ${to}: ${subject} (id: ${data?.id})`);
    return true;
  } catch (err) {
    console.error('❌ Email error:', err.message);
    return false;
  }
}

// ── PUBLIC: Soumettre un brief (pas besoin d'être connecté) ──
router.post('/briefs', async (req, res) => {
  try {
    const { type, format, quantite, style, options, reference, description, nom, email, telephone, deadline } = req.body;
    
    if (!type || !nom || !email) {
      return res.status(400).json({ erreur: 'Type, nom et email requis' });
    }

    // Générer un token unique de suivi
    const suiviToken = Math.random().toString(36).slice(2, 8).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

    // Sauvegarder en base
    const result = await query(
      `INSERT INTO com_projets (type, format, quantite, style, options, reference, description, client_nom, client_email, client_telephone, deadline, statut, suivi_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'brief_recu',$12)
       RETURNING id`,
      [type, format || null, quantite || '1', style || null, JSON.stringify(options || []), reference || null, description || null, nom, email, telephone || null, deadline || null, suiviToken]
    );

    const projetId = result.rows[0].id;

    // Envoyer email à l'équipe
    await sendEmail(
      process.env.COM_EMAIL || 'freamplecom@gmail.com',
      `🎬 Nouvelle demande Freample Com — ${nom}`,
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#8B5CF6;">🎬 Nouvelle demande reçue !</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Client</td><td style="padding:8px;border-bottom:1px solid #eee;">${nom}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
          ${telephone ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Téléphone</td><td style="padding:8px;border-bottom:1px solid #eee;">${telephone}</td></tr>` : ''}
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Service</td><td style="padding:8px;border-bottom:1px solid #eee;">${type}${format ? ' · ' + format : ''}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Quantité</td><td style="padding:8px;border-bottom:1px solid #eee;">${quantite || '1'}</td></tr>
          ${style ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Style</td><td style="padding:8px;border-bottom:1px solid #eee;">${style}</td></tr>` : ''}
          ${options?.length ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Options</td><td style="padding:8px;border-bottom:1px solid #eee;">${options.join(', ')}</td></tr>` : ''}
          ${reference ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Référence</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="${reference}">${reference}</a></td></tr>` : ''}
          ${deadline ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Deadline</td><td style="padding:8px;border-bottom:1px solid #eee;">${deadline}</td></tr>` : ''}
        </table>
        ${description ? `<div style="margin-top:16px;padding:12px;background:#F5F3FF;border-radius:8px;"><strong>Instructions :</strong><br/>${description}</div>` : ''}
        <p style="margin-top:20px;color:#888;">Projet #${projetId} — Répondez au client dans les 24h</p>
      </div>
      `
    );

    // Envoyer confirmation au client
    await sendEmail(
      email,
      'Votre demande Freample Com a bien été reçue ✓',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#8B5CF6;">Merci ${nom} ! 🎬</h2>
        <p>Nous avons bien reçu votre demande. Notre équipe l'analyse et vous répondra sous <strong>24 heures</strong> avec un devis personnalisé.</p>
        <div style="margin:20px 0;padding:16px;background:#F5F3FF;border-radius:8px;">
          <strong>Récapitulatif :</strong><br/>
          Service : ${type}${format ? ' · ' + format : ''}<br/>
          Quantité : ${quantite || '1'}<br/>
          ${style ? 'Style : ' + style + '<br/>' : ''}
          ${options?.length ? 'Options : ' + options.join(', ') + '<br/>' : ''}
        </div>
        <div style="margin:20px 0;padding:20px;background:#0F0A1A;border-radius:12px;text-align:center;">
          <p style="color:rgba(255,255,255,0.7);margin:0 0 12px;font-size:14px;">Suivez votre commande en temps réel :</p>
          <a href="${process.env.FRONTEND_URL || 'https://frontendweb-ruby.vercel.app'}/suivi/${suiviToken}"
             style="display:inline-block;padding:12px 28px;background:#8B5CF6;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
            📦 Suivre ma commande
          </a>
          <p style="color:rgba(255,255,255,0.4);margin:12px 0 0;font-size:12px;">Code de suivi : ${suiviToken}</p>
        </div>
        <p>Si vous avez des questions, répondez directement à cet email ou contactez-nous sur WhatsApp.</p>
        <p style="color:#888;">— L'équipe Freample Com</p>
      </div>
      `
    );

    res.json({ success: true, projetId, suiviToken, message: 'Brief reçu, email envoyé' });
  } catch (err) {
    console.error('Erreur brief:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ── PUBLIC: Suivi de commande par token (pas besoin de compte) ──
router.get('/suivi/:token', async (req, res) => {
  try {
    const result = await query('SELECT id, type, format, quantite, style, client_nom, statut, fichiers_faits, montant_ht, devis_ref, deadline, created_at FROM com_projets WHERE suivi_token = $1', [req.params.token]);
    if (!result.rows.length) return res.status(404).json({ erreur: 'Commande introuvable' });
    const p = result.rows[0];
    const qte = Number(p.quantite) || 1;
    const fait = Number(p.fichiers_faits) || 0;
    const avancement = (p.statut === 'livre' || p.statut === 'paye') ? 100 : (qte > 0 ? Math.round((fait/qte)*100) : 0);

    const statusLabels = {
      brief_recu: 'Demande reçue — analyse en cours',
      devis_envoye: 'Devis envoyé — en attente de votre réponse',
      en_cours: 'En cours de réalisation',
      revision: 'En cours de révision',
      livre: 'Livré — en attente de votre validation',
      paye: 'Terminé et payé',
      archive: 'Projet archivé',
    };

    res.json({
      titre: `${p.type}${p.format ? ' · ' + p.format : ''}`,
      client: p.client_nom,
      statut: p.statut,
      statutLabel: statusLabels[p.statut] || p.statut,
      avancement,
      fichiersFaits: fait,
      quantite: qte,
      montant: Number(p.montant_ht) || 0,
      devis: p.devis_ref,
      deadline: p.deadline,
      dateCommande: p.created_at,
    });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ── AUTH: Liste des projets Com (patron) ──
router.get('/projets', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM com_projets ORDER BY created_at DESC');
    res.json({ projets: result.rows });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ── AUTH: Détail d'un projet ──
router.get('/projets/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM com_projets WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ erreur: 'Projet non trouvé' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ── AUTH: Mettre à jour le statut d'un projet ──
router.put('/projets/:id/statut', authenticateToken, async (req, res) => {
  try {
    const { statut } = req.body;
    await query('UPDATE com_projets SET statut = $1 WHERE id = $2', [statut, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ── AUTH: Envoyer un devis au client ──
router.post('/projets/:id/devis', authenticateToken, async (req, res) => {
  try {
    const { montantHT, tva, lignes, conditions } = req.body;
    const projet = await query('SELECT * FROM com_projets WHERE id = $1', [req.params.id]);
    if (!projet.rows.length) return res.status(404).json({ erreur: 'Projet non trouvé' });
    
    const p = projet.rows[0];
    const montantTTC = Math.round(montantHT * (1 + (tva || 20) / 100));
    const devisRef = `DC-${new Date().getFullYear()}-${String(req.params.id).padStart(3, '0')}`;

    await query(
      'UPDATE com_projets SET montant_ht = $1, tva = $2, devis_ref = $3, statut = $4, lignes_devis = $5 WHERE id = $6',
      [montantHT, tva || 20, devisRef, 'devis_envoye', JSON.stringify(lignes || []), req.params.id]
    );

    // Envoyer le devis par email au client
    const lignesHTML = (lignes || []).map(l => 
      `<tr><td style="padding:6px;border-bottom:1px solid #eee;">${l.description}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${l.quantite}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${l.prixUnitaire}€</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${l.quantite * l.prixUnitaire}€</td></tr>`
    ).join('');

    await sendEmail(
      p.client_email,
      `Votre devis Freample Com — ${devisRef}`,
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#8B5CF6;">Votre devis est prêt ! 📝</h2>
        <p>Bonjour ${p.client_nom},</p>
        <p>Suite à votre demande, voici notre proposition :</p>
        
        <div style="border:1px solid #E9E5F5;border-radius:12px;overflow:hidden;margin:20px 0;">
          <div style="padding:16px;background:#F5F3FF;">
            <strong>Devis ${devisRef}</strong> · ${p.type}${p.format ? ' · ' + p.format : ''}
          </div>
          ${lignesHTML ? `<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#FAFAFA;"><th style="padding:8px;text-align:left;">Description</th><th style="padding:8px;text-align:right;">Qté</th><th style="padding:8px;text-align:right;">P.U.</th><th style="padding:8px;text-align:right;">Total</th></tr></thead><tbody>${lignesHTML}</tbody></table>` : ''}
          <div style="padding:16px;border-top:1px solid #E9E5F5;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Total HT</span><strong>${montantHT}€</strong></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>TVA ${tva || 20}%</span><strong>${montantTTC - montantHT}€</strong></div>
            <div style="display:flex;justify-content:space-between;font-size:18px;margin-top:8px;"><span><strong>Total TTC</strong></span><strong style="color:#8B5CF6;">${montantTTC}€</strong></div>
          </div>
        </div>

        <p>Pour accepter ce devis, répondez simplement "OK" à cet email ou contactez-nous sur WhatsApp.</p>
        <p style="color:#888;">— L'équipe Freample Com</p>
      </div>
      `
    );

    res.json({ success: true, devisRef, montantTTC });
  } catch (err) {
    console.error('Erreur devis:', err.message);
    res.status(500).json({ erreur: err.message });
  }
});

// ── AUTH: Supprimer un projet ──
router.delete('/projets/:id', authenticateToken, async (req, res) => {
  try {
    await query('DELETE FROM com_projets WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ── AUTH: Refuser un brief → email poli au client ──
router.post('/projets/:id/refuser', authenticateToken, async (req, res) => {
  try {
    const projet = await query('SELECT * FROM com_projets WHERE id = $1', [req.params.id]);
    if (!projet.rows.length) return res.status(404).json({ erreur: 'Projet non trouvé' });
    const p = projet.rows[0];

    await query('UPDATE com_projets SET statut = $1 WHERE id = $2', ['refuse', req.params.id]);

    await sendEmail(
      p.client_email,
      'Votre demande Freample Com',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#8B5CF6;">Merci pour votre demande, ${p.client_nom} 🙏</h2>
        <p>Après analyse de votre demande, nous ne sommes malheureusement pas en mesure de répondre à cette demande pour le moment.</p>
        <p>N'hésitez pas à nous recontacter pour un futur projet — nous serions ravis de travailler avec vous !</p>
        <p style="color:#888;">— L'équipe Freample Com</p>
      </div>
      `
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// AGENDA
// ══════════════════════════════════════════════════════════

router.get('/agenda', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM com_agenda ORDER BY date, heure');
    res.json({ events: result.rows });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.post('/agenda', authenticateToken, async (req, res) => {
  try {
    const { titre, heure, heure_fin, jour, date, type, personne, projet } = req.body;
    const result = await query(
      'INSERT INTO com_agenda (titre, heure, heure_fin, jour, date, type, personne, projet) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
      [titre, heure, heure_fin, jour, date, type || 'montage', personne, projet]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.put('/agenda/:id', authenticateToken, async (req, res) => {
  try {
    const { titre, heure, heure_fin, jour, date, type, personne, projet } = req.body;
    await query(
      'UPDATE com_agenda SET titre=$1, heure=$2, heure_fin=$3, jour=$4, date=$5, type=$6, personne=$7, projet=$8 WHERE id=$9',
      [titre, heure, heure_fin, jour, date, type, personne, projet, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.delete('/agenda/:id', authenticateToken, async (req, res) => {
  try {
    await query('DELETE FROM com_agenda WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// ══════════════════════════════════════════════════════════
// TARIFS
// ══════════════════════════════════════════════════════════

router.get('/tarifs', async (req, res) => {
  try {
    const result = await query('SELECT data FROM com_tarifs ORDER BY id DESC LIMIT 1');
    const row = result.rows[0]?.data;
    // Support both old format (array) and new format ({tarifs, packs})
    if (Array.isArray(row)) {
      res.json({ tarifs: row, packs: null });
    } else if (row && typeof row === 'object') {
      res.json({ tarifs: row.tarifs || null, packs: row.packs || null });
    } else {
      res.json({ tarifs: null, packs: null });
    }
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.put('/tarifs', authenticateToken, async (req, res) => {
  try {
    const { tarifs, packs } = req.body;
    const payload = JSON.stringify({ tarifs, packs });
    const existing = await query('SELECT id FROM com_tarifs LIMIT 1');
    if (existing.rows.length) {
      await query('UPDATE com_tarifs SET data = $1, updated_at = NOW() WHERE id = $2', [payload, existing.rows[0].id]);
    } else {
      await query('INSERT INTO com_tarifs (data) VALUES ($1)', [payload]);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// ══════════════════════════════════════════════════════════
// AVANCEMENT (fichiers faits)
// ══════════════════════════════════════════════════════════

router.put('/projets/:id/avancement', authenticateToken, async (req, res) => {
  try {
    const { fichiers_faits } = req.body;
    await query('UPDATE com_projets SET fichiers_faits = $1 WHERE id = $2', [fichiers_faits, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// ══════════════════════════════════════════════════════════
// PORTFOLIO
// ══════════════════════════════════════════════════════════

// Auto-create table
(async () => {
  try {
    await query(`CREATE TABLE IF NOT EXISTS com_portfolio (
      id SERIAL PRIMARY KEY,
      titre VARCHAR(255) NOT NULL,
      description TEXT,
      categorie VARCHAR(100),
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
  } catch (e) { console.log('com_portfolio table check:', e.message); }
})();

// GET all portfolio items (public)
router.get('/portfolio', async (req, res) => {
  try {
    const result = await query('SELECT * FROM com_portfolio ORDER BY created_at DESC');
    res.json({ items: result.rows });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// POST new portfolio item
router.post('/portfolio', authenticateToken, async (req, res) => {
  try {
    const { titre, description, categorie, video_url, thumbnail_url } = req.body;
    const result = await query(
      'INSERT INTO com_portfolio (titre, description, categorie, video_url, thumbnail_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [titre, description || '', categorie || '', video_url, thumbnail_url || '']
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// DELETE portfolio item
router.delete('/portfolio/:id', authenticateToken, async (req, res) => {
  try {
    await query('DELETE FROM com_portfolio WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

module.exports = router;
