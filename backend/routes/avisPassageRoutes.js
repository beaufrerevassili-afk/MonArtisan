const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { notify } = require('../utils/notify');
const router = express.Router();

// Ensure table exists
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS avis_passages (
      id SERIAL PRIMARY KEY,
      chantier_id INTEGER,
      employe_id INTEGER,
      employe_nom VARCHAR(255),
      client_nom VARCHAR(255),
      chantier_titre VARCHAR(255),
      chantier_adresse VARCHAR(500),
      date DATE DEFAULT CURRENT_DATE,
      heure_arrivee VARCHAR(10),
      heure_depart VARCHAR(10),
      travaux_realises TEXT,
      materiaux_utilises TEXT,
      observations TEXT,
      signature_base64 TEXT,
      statut VARCHAR(20) DEFAULT 'signe',
      patron_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
ensureTable().catch(e => console.error('avis_passages table:', e.message));

// POST /avis-passage — Salarié crée un avis signé
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { chantierId, chantierTitre, chantierAdresse, clientNom, heureArrivee, heureDepart, travauxRealises, materiauxUtilises, observations, signatureBase64 } = req.body;
    if (!travauxRealises || !signatureBase64) return res.status(400).json({ erreur: 'Travaux réalisés et signature requis' });

    // Get employee info
    const empResult = await db.query('SELECT id, prenom, nom, patron_id FROM employes WHERE user_id = $1', [req.user.id]);
    const emp = empResult.rows[0];
    if (!emp) return res.status(404).json({ erreur: 'Profil employé non trouvé' });

    const { rows } = await db.query(`
      INSERT INTO avis_passages (chantier_id, employe_id, employe_nom, client_nom, chantier_titre, chantier_adresse, heure_arrivee, heure_depart, travaux_realises, materiaux_utilises, observations, signature_base64, patron_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *
    `, [chantierId || null, emp.id, `${emp.prenom} ${emp.nom}`, clientNom || '', chantierTitre || '', chantierAdresse || '', heureArrivee || '', heureDepart || '', travauxRealises, materiauxUtilises || '', observations || '', signatureBase64, emp.patron_id]);

    // Notifier le patron
    if (emp.patron_id) {
      notify(emp.patron_id, 'avis_passage', 'Avis de passage signé', emp.prenom + ' ' + emp.nom + ' a fait signer un avis', '/patron/missions').catch(() => {});
    }

    res.status(201).json({ avis: rows[0], message: 'Avis de passage enregistré' });
  } catch (err) {
    console.error('POST /avis-passage:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /avis-passage — Liste des avis (patron voit ceux de ses employés, salarié voit les siens)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role;
    let rows;
    if (role === 'patron' || role === 'fondateur') {
      const result = await db.query('SELECT * FROM avis_passages WHERE patron_id = $1 ORDER BY created_at DESC', [req.user.id]);
      rows = result.rows;
    } else {
      const empResult = await db.query('SELECT id FROM employes WHERE user_id = $1', [req.user.id]);
      const empId = empResult.rows[0]?.id;
      if (!empId) return res.json({ avis: [] });
      const result = await db.query('SELECT * FROM avis_passages WHERE employe_id = $1 ORDER BY created_at DESC', [empId]);
      rows = result.rows;
    }
    res.json({ avis: rows.map(r => ({
      id: r.id, chantierId: r.chantier_id, employeNom: r.employe_nom, clientNom: r.client_nom,
      chantierTitre: r.chantier_titre, chantierAdresse: r.chantier_adresse, date: r.date,
      heureArrivee: r.heure_arrivee, heureDepart: r.heure_depart, travauxRealises: r.travaux_realises,
      materiauxUtilises: r.materiaux_utilises, observations: r.observations,
      signatureBase64: r.signature_base64, statut: r.statut, creeLe: r.created_at
    })) });
  } catch (err) {
    console.error('GET /avis-passage:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /avis-passage/chantier/:id — Avis pour un chantier spécifique
router.get('/chantier/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM avis_passages WHERE chantier_id = $1 ORDER BY created_at DESC', [req.params.id]);
    res.json({ avis: rows.map(r => ({
      id: r.id, employeNom: r.employe_nom, clientNom: r.client_nom, date: r.date,
      heureArrivee: r.heure_arrivee, heureDepart: r.heure_depart, travauxRealises: r.travaux_realises,
      materiauxUtilises: r.materiaux_utilises, observations: r.observations,
      signatureBase64: r.signature_base64, statut: r.statut, creeLe: r.created_at
    })) });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
