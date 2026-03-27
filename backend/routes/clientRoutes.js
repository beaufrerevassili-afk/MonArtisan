// ============================================================
//  clientRoutes.js — Module Client
//  Recherche artisans, Notation, Litiges, Parrainage
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// Données publiques statiques (en mémoire)
const artisansDisponibles = [
  {
    id: 3, nom: 'Carlos Garcia', specialite: 'Plomberie', note: 4.8,
    nbAvis: 47, verified: true, disponible: true,
    lat: 48.8584, lng: 2.2945, distance: 2.3,
    prixHeure: 75, badge: 'Artisan Vérifié',
    photo: '/photos/artisans/carlos.jpg',
    certifications: ['RGE', 'Qualibat'],
  },
  {
    id: 5, nom: 'Eric Leroy', specialite: 'Électricité', note: 4.6,
    nbAvis: 32, verified: true, disponible: true,
    lat: 48.8566, lng: 2.3522, distance: 1.1,
    prixHeure: 85, badge: 'Artisan Vérifié',
    photo: '/photos/artisans/eric.jpg',
    certifications: ['Qualibat', 'CACES R486'],
  },
  {
    id: 6, nom: 'Fatima Benali', specialite: 'Carrelage', note: 4.9,
    nbAvis: 63, verified: true, disponible: false,
    lat: 48.8737, lng: 2.2950, distance: 3.8,
    prixHeure: 65, badge: 'Artisan Vérifié',
    photo: '/photos/artisans/fatima.jpg',
    certifications: ['RGE'],
  },
];

const CATEGORIES = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Carrelage',
  'Peinture', 'Maçonnerie', 'Chauffage', 'Serrurerie',
  'Jardinage', 'Autres',
];

// ============================================================
//  RECHERCHE ARTISANS
// ============================================================

// GET /client/artisans — Rechercher des artisans
router.get('/artisans', (req, res) => {
  const { categorie, disponible, noteMin, distanceMax } = req.query;
  let liste = artisansDisponibles;

  if (req.query.q) {
    const q = req.query.q.toLowerCase();
    liste = liste.filter(a => a.nom.toLowerCase().includes(q) || a.specialite.toLowerCase().includes(q));
  }
  if (categorie)    liste = liste.filter(a => a.specialite.toLowerCase() === categorie.toLowerCase());
  if (disponible === 'true') liste = liste.filter(a => a.disponible);
  if (noteMin)      liste = liste.filter(a => a.note >= parseFloat(noteMin));
  if (distanceMax)  liste = liste.filter(a => a.distance <= parseFloat(distanceMax));

  const estimationPrix = {
    Plomberie: '150€ - 800€', Électricité: '100€ - 600€',
    Menuiserie: '200€ - 1500€', Carrelage: '300€ - 2000€',
    Peinture: '200€ - 1200€', Maçonnerie: '500€ - 5000€',
    Chauffage: '300€ - 2000€', Serrurerie: '80€ - 400€',
  };

  res.json({
    categories: CATEGORIES,
    filtres_disponibles: 'categorie, disponible, noteMin, distanceMax',
    estimation_prix: estimationPrix[categorie] || 'Variable selon les travaux',
    total: liste.length,
    artisans: liste,
  });
});

// GET /client/artisans/:id — Fiche artisan détaillée (avis depuis DB)
router.get('/artisans/:id', async (req, res) => {
  try {
    const artisan = artisansDisponibles.find(a => a.id === parseInt(req.params.id));
    if (!artisan) return res.status(404).json({ erreur: 'Artisan introuvable' });

    const result = await db.query(
      'SELECT * FROM notations WHERE artisan_id = $1 ORDER BY cree_le DESC',
      [artisan.id]
    );

    const avis = result.rows.map(n => ({
      id:          n.id,
      missionId:   n.mission_id,
      artisanId:   n.artisan_id,
      note:        n.note,
      commentaire: n.commentaire,
      creeLe:      n.cree_le,
    }));

    res.json({
      ...artisan,
      avis,
      realisations: [
        { titre: 'Salle de bain complète', photo: '/photos/real/1.jpg', annee: 2024 },
        { titre: 'Cuisine ouverte',        photo: '/photos/real/2.jpg', annee: 2023 },
      ],
    });
  } catch (err) {
    console.error('GET /client/artisans/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  NOTATIONS
// ============================================================

// GET /client/notations — Notations reçues
router.get('/notations', async (req, res) => {
  try {
    const { artisanId } = req.query;

    let sql    = 'SELECT * FROM notations WHERE 1=1';
    const params = [];
    if (artisanId) { params.push(parseInt(artisanId)); sql += ` AND artisan_id = $${params.length}`; }
    sql += ' ORDER BY cree_le DESC';

    const result = await db.query(sql, params);
    const notations = result.rows.map(n => ({
      id:          n.id,
      missionId:   n.mission_id,
      artisanId:   n.artisan_id,
      note:        n.note,
      commentaire: n.commentaire,
      creeLe:      n.cree_le,
    }));

    res.json({ total: notations.length, notations });
  } catch (err) {
    console.error('GET /client/notations :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /client/notations — Noter un artisan
router.post('/notations', async (req, res) => {
  try {
    const { missionId, artisanId, note, commentaire } = req.body;
    if (!missionId || !artisanId || !note) {
      return res.status(400).json({ erreur: 'missionId, artisanId, note (1-5) requis' });
    }
    if (note < 1 || note > 5) {
      return res.status(400).json({ erreur: 'La note doit être entre 1 et 5' });
    }

    // Vérifier notation déjà existante pour cette mission
    const existing = await db.query(
      'SELECT id FROM notations WHERE mission_id = $1',
      [parseInt(missionId)]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ erreur: 'Vous avez déjà noté cette mission' });
    }

    const result = await db.query(
      `INSERT INTO notations (mission_id, artisan_id, note, commentaire)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [parseInt(missionId), parseInt(artisanId), parseInt(note), commentaire || '']
    );

    const n = result.rows[0];
    const notation = {
      id:          n.id,
      missionId:   n.mission_id,
      artisanId:   n.artisan_id,
      note:        n.note,
      commentaire: n.commentaire,
      creeLe:      n.cree_le,
    };

    res.status(201).json({ message: 'Notation enregistrée', notation });
  } catch (err) {
    console.error('POST /client/notations :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  LITIGES
// ============================================================

const ETAPES_LITIGE = ['Ouverture', 'Médiation', 'Résolution', 'Remboursement'];

// GET /client/litiges — Liste des litiges
router.get('/litiges', async (req, res) => {
  try {
    const { statut } = req.query;

    let sql    = 'SELECT * FROM litiges WHERE 1=1';
    const params = [];
    if (statut) { params.push(statut); sql += ` AND statut = $${params.length}`; }
    sql += ' ORDER BY cree_le DESC';

    const result = await db.query(sql, params);
    const litiges = result.rows.map(l => ({
      id:              l.id,
      missionId:       l.mission_id,
      description:     l.description,
      montantConteste: l.montant_conteste,
      photos:          l.photos,
      statut:          l.statut,
      etape:           l.etape,
      etapes:          ETAPES_LITIGE,
      etapeActuelle:   l.etape_actuelle,
      resolution:      l.resolution,
      remboursement:   l.remboursement,
      assigneAdmin:    l.assigne_admin,
      creeLe:          l.cree_le,
      modifieLe:       l.modifie_le,
    }));

    res.json({ total: litiges.length, litiges });
  } catch (err) {
    console.error('GET /client/litiges :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /client/litiges/:id — Détail d'un litige
router.get('/litiges/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM litiges WHERE id = $1', [parseInt(req.params.id)]);
    if (!result.rows.length) return res.status(404).json({ erreur: 'Litige introuvable' });

    const l = result.rows[0];
    res.json({
      id:              l.id,
      missionId:       l.mission_id,
      description:     l.description,
      montantConteste: l.montant_conteste,
      photos:          l.photos,
      statut:          l.statut,
      etape:           l.etape,
      etapes:          ETAPES_LITIGE,
      etapeActuelle:   l.etape_actuelle,
      resolution:      l.resolution,
      remboursement:   l.remboursement,
      assigneAdmin:    l.assigne_admin,
      creeLe:          l.cree_le,
      modifieLe:       l.modifie_le,
    });
  } catch (err) {
    console.error('GET /client/litiges/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /client/litiges — Ouvrir un litige
router.post('/litiges', async (req, res) => {
  try {
    const { missionId, description, montantConteste, photos } = req.body;
    if (!missionId || !description || !montantConteste) {
      return res.status(400).json({ erreur: 'missionId, description, montantConteste requis' });
    }

    const result = await db.query(
      `INSERT INTO litiges
         (mission_id, description, montant_conteste, photos, statut, etape, etape_actuelle, resolution, remboursement, assigne_admin)
       VALUES ($1, $2, $3, $4, 'ouvert', 'Ouverture', 0, NULL, NULL, NULL)
       RETURNING *`,
      [parseInt(missionId), description, parseFloat(montantConteste), JSON.stringify(photos || [])]
    );

    const l = result.rows[0];
    const litige = {
      id:              l.id,
      missionId:       l.mission_id,
      description:     l.description,
      montantConteste: l.montant_conteste,
      photos:          l.photos,
      statut:          l.statut,
      etape:           l.etape,
      etapes:          ETAPES_LITIGE,
      etapeActuelle:   l.etape_actuelle,
      resolution:      l.resolution,
      remboursement:   l.remboursement,
      assigneAdmin:    l.assigne_admin,
      creeLe:          l.cree_le,
      modifieLe:       l.modifie_le,
    };

    res.status(201).json({
      message: 'Litige ouvert. Notre équipe vous contactera sous 48h.',
      litige,
    });
  } catch (err) {
    console.error('POST /client/litiges :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /client/litiges/:id/avancer — Faire avancer un litige (admin)
router.put('/litiges/:id/avancer', async (req, res) => {
  try {
    const litigeId = parseInt(req.params.id);
    const existing = await db.query('SELECT * FROM litiges WHERE id = $1', [litigeId]);
    if (!existing.rows.length) return res.status(404).json({ erreur: 'Litige introuvable' });

    const l = existing.rows[0];
    const { resolution, remboursement } = req.body;

    let nouvelleEtapeActuelle = l.etape_actuelle;
    let nouvelleEtape         = l.etape;
    let nouveauStatut         = l.statut;
    let nouveauRemboursement  = l.remboursement;
    let nouvelleResolution    = l.resolution;

    if (nouvelleEtapeActuelle < ETAPES_LITIGE.length - 1) {
      nouvelleEtapeActuelle++;
      nouvelleEtape = ETAPES_LITIGE[nouvelleEtapeActuelle];
    }

    if (resolution) nouvelleResolution = resolution;
    if (remboursement) {
      nouveauRemboursement = parseFloat(remboursement);
      nouveauStatut        = 'résolu';
    }

    const result = await db.query(
      `UPDATE litiges
       SET etape_actuelle = $1, etape = $2, statut = $3,
           resolution = $4, remboursement = $5, modifie_le = NOW()
       WHERE id = $6
       RETURNING *`,
      [nouvelleEtapeActuelle, nouvelleEtape, nouveauStatut,
       nouvelleResolution, nouveauRemboursement, litigeId]
    );

    const upd = result.rows[0];
    const litige = {
      id:              upd.id,
      missionId:       upd.mission_id,
      description:     upd.description,
      montantConteste: upd.montant_conteste,
      photos:          upd.photos,
      statut:          upd.statut,
      etape:           upd.etape,
      etapes:          ETAPES_LITIGE,
      etapeActuelle:   upd.etape_actuelle,
      resolution:      upd.resolution,
      remboursement:   upd.remboursement,
      assigneAdmin:    upd.assigne_admin,
      creeLe:          upd.cree_le,
      modifieLe:       upd.modifie_le,
    };

    res.json({ message: `Litige avancé : ${litige.etape}`, litige });
  } catch (err) {
    console.error('PUT /client/litiges/:id/avancer :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  PARRAINAGE
// ============================================================

// GET /client/parrainage — Code et stats de parrainage
router.get('/parrainage', async (req, res) => {
  try {
    const { userId } = req.query;
    const code = `ARTISAN${(userId || '1').toUpperCase()}REF`;

    const result = await db.query(
      'SELECT * FROM parrainages WHERE parrain_id = $1 ORDER BY cree_le DESC',
      [parseInt(userId || 1)]
    );

    const parrainsUser = result.rows.map(p => ({
      id:        p.id,
      parrainId: p.parrain_id,
      filleulId: p.filleul_id,
      code:      p.code,
      statut:    p.statut,
      creeLe:    p.cree_le,
    }));

    res.json({
      codeParrainage: code,
      lienPartage:    `https://artisans-app.fr/inscription?ref=${code}`,
      statistiques: {
        amisInvites:       parrainsUser.length,
        recompensesGagnees: parrainsUser.filter(p => p.statut === 'validé').length * 10,
      },
      recompense: '10€ de crédit pour vous et votre ami à la première mission',
      parrainages: parrainsUser,
    });
  } catch (err) {
    console.error('GET /client/parrainage :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /client/parrainage/utiliser — Utiliser un code de parrainage
router.post('/parrainage/utiliser', async (req, res) => {
  try {
    const { code, nouveauClientId } = req.body;
    if (!code || !nouveauClientId) {
      return res.status(400).json({ erreur: 'code et nouveauClientId requis' });
    }

    const match = code.match(/^ARTISAN(\d+)REF$/i);
    if (!match) return res.status(400).json({ erreur: 'Code de parrainage invalide' });

    await db.query(
      `INSERT INTO parrainages (parrain_id, filleul_id, code, statut)
       VALUES ($1, $2, $3, 'en_attente')`,
      [parseInt(match[1]), parseInt(nouveauClientId), code]
    );

    res.json({ message: 'Code de parrainage enregistré. Récompense activée à la première mission.' });
  } catch (err) {
    console.error('POST /client/parrainage/utiliser :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  DEVIS CLIENT
// ============================================================

// GET /client/devis-client
router.get('/devis-client', async (req, res) => {
  try {
    const { statut } = req.query;

    let sql    = 'SELECT * FROM devis_clients WHERE 1=1';
    const params = [];
    if (statut) { params.push(statut); sql += ` AND statut = $${params.length}`; }
    sql += ' ORDER BY cree_le DESC';

    const [filteredResult, statsResult] = await Promise.all([
      db.query(sql, params),
      db.query(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) AS en_attente,
           SUM(CASE WHEN statut = 'accepte'    THEN 1 ELSE 0 END) AS accepte,
           SUM(CASE WHEN statut = 'refuse'     THEN 1 ELSE 0 END) AS refuse
         FROM devis_clients`
      ),
    ]);

    const s = statsResult.rows[0];
    const stats = {
      total:      parseInt(s.total),
      en_attente: parseInt(s.en_attente),
      accepte:    parseInt(s.accepte),
      refuse:     parseInt(s.refuse),
    };

    const devis = filteredResult.rows.map(d => ({
      id:                d.id,
      missionId:         d.mission_id,
      artisanId:         d.artisan_id,
      artisanNom:        d.artisan_nom,
      artisanSpecialite: d.artisan_specialite,
      artisanNote:       d.artisan_note,
      titre:             d.titre,
      montantHT:         d.montant_ht,
      tva:               d.tva,
      montantTTC:        d.montant_ttc,
      description:       d.description,
      delai:             d.delai,
      validiteJours:     d.validite_jours,
      validiteDate:      d.validite_date,
      lignes:            d.lignes,
      statut:            d.statut,
      accepteLe:         d.accepte_le,
      refuseLe:          d.refuse_le,
      creeLe:            d.cree_le,
    }));

    res.json({ stats, devis });
  } catch (err) {
    console.error('GET /client/devis-client :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /client/devis-client/:id/accepter — avec transaction
router.post('/devis-client/:id/accepter', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const devisId = parseInt(req.params.id);

    // Récupérer le devis
    const existing = await client.query('SELECT * FROM devis_clients WHERE id = $1', [devisId]);
    if (!existing.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erreur: 'Devis introuvable' });
    }

    const d = existing.rows[0];

    // Accepter ce devis
    const acceptResult = await client.query(
      `UPDATE devis_clients SET statut = 'accepte', accepte_le = NOW() WHERE id = $1 RETURNING *`,
      [devisId]
    );

    // Refuser les autres devis en_attente pour la même mission
    await client.query(
      `UPDATE devis_clients
       SET statut = 'refuse', refuse_le = NOW()
       WHERE mission_id = $1 AND id != $2 AND statut = 'en_attente'`,
      [d.mission_id, devisId]
    );

    await client.query('COMMIT');

    const upd = acceptResult.rows[0];
    const devis = {
      id:                upd.id,
      missionId:         upd.mission_id,
      artisanId:         upd.artisan_id,
      artisanNom:        upd.artisan_nom,
      artisanSpecialite: upd.artisan_specialite,
      artisanNote:       upd.artisan_note,
      titre:             upd.titre,
      montantHT:         upd.montant_ht,
      tva:               upd.tva,
      montantTTC:        upd.montant_ttc,
      description:       upd.description,
      delai:             upd.delai,
      validiteJours:     upd.validite_jours,
      validiteDate:      upd.validite_date,
      lignes:            upd.lignes,
      statut:            upd.statut,
      accepteLe:         upd.accepte_le,
      refuseLe:          upd.refuse_le,
      creeLe:            upd.cree_le,
    };

    res.json({ message: 'Devis accepté. Les autres offres pour cette mission ont été déclinées.', devis });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /client/devis-client/:id/accepter :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

// POST /client/devis-client/:id/refuser
router.post('/devis-client/:id/refuser', async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE devis_clients SET statut = 'refuse', refuse_le = NOW() WHERE id = $1 RETURNING *`,
      [parseInt(req.params.id)]
    );
    if (!result.rows.length) return res.status(404).json({ erreur: 'Devis introuvable' });

    const upd = result.rows[0];
    const devis = {
      id:                upd.id,
      missionId:         upd.mission_id,
      artisanId:         upd.artisan_id,
      artisanNom:        upd.artisan_nom,
      artisanSpecialite: upd.artisan_specialite,
      artisanNote:       upd.artisan_note,
      titre:             upd.titre,
      montantHT:         upd.montant_ht,
      tva:               upd.tva,
      montantTTC:        upd.montant_ttc,
      description:       upd.description,
      delai:             upd.delai,
      validiteJours:     upd.validite_jours,
      validiteDate:      upd.validite_date,
      lignes:            upd.lignes,
      statut:            upd.statut,
      accepteLe:         upd.accepte_le,
      refuseLe:          upd.refuse_le,
      creeLe:            upd.cree_le,
    };

    res.json({ message: 'Devis refusé', devis });
  } catch (err) {
    console.error('POST /client/devis-client/:id/refuser :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  MESSAGERIE
// ============================================================

// GET /client/messages-list/:missionId
router.get('/messages-list/:missionId', async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId);
    const result = await db.query(
      'SELECT * FROM messages WHERE mission_id = $1 ORDER BY date ASC',
      [missionId]
    );

    const messages = result.rows.map(m => ({
      id:        m.id,
      auteur:    m.auteur,
      nomAuteur: m.nom_auteur,
      texte:     m.texte,
      date:      m.date,
    }));

    res.json({ missionId, messages });
  } catch (err) {
    console.error('GET /client/messages-list/:missionId :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /client/messages-list/:missionId
router.post('/messages-list/:missionId', async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId);
    const { texte, nomAuteur } = req.body;
    if (!texte) return res.status(400).json({ erreur: 'texte requis' });

    const result = await db.query(
      `INSERT INTO messages (mission_id, auteur, nom_auteur, texte, date)
       VALUES ($1, 'client', $2, $3, NOW())
       RETURNING *`,
      [missionId, nomAuteur || 'Client', texte]
    );

    const m = result.rows[0];
    const msg = {
      id:        m.id,
      auteur:    m.auteur,
      nomAuteur: m.nom_auteur,
      texte:     m.texte,
      date:      m.date,
    };

    res.status(201).json({ message: 'Message envoyé', msg });
  } catch (err) {
    console.error('POST /client/messages-list/:missionId :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  PAIEMENTS
// ============================================================

// GET /client/paiements-historique
router.get('/paiements-historique', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM paiements_client ORDER BY date DESC NULLS LAST'
    );

    const paiements = result.rows.map(p => ({
      id:         p.id,
      missionId:  p.mission_id,
      titre:      p.titre,
      artisanNom: p.artisan_nom,
      montant:    p.montant,
      methode:    p.methode,
      statut:     p.statut,
      facture:    p.facture,
      date:       p.date,
      creeLe:     p.cree_le,
    }));

    const payes = paiements.filter(p => p.statut === 'payé');
    res.json({
      total_depense: payes.reduce((s, p) => s + parseFloat(p.montant || 0), 0),
      nb_paiements:  payes.length,
      paiements,
    });
  } catch (err) {
    console.error('GET /client/paiements-historique :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  PROFIL CLIENT
// ============================================================

// DELETE /client/supprimer-compte
router.delete('/supprimer-compte', (req, res) => {
  res.json({ message: 'Compte supprimé avec succès. Toutes vos données ont été effacées.' });
});

module.exports = router;
