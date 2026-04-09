// ============================================================
//  rhRoutes.js — Module Ressources Humaines (RH)
//  Employés, Planning, Congés, Notes de frais, Habilitations, Bulletins de paie
//  PostgreSQL via db.js
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================================================
//  UTILITAIRES
// ============================================================

function getNumeroSemaine(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// Mapping snake_case → camelCase pour un employé
function mapEmploye(row) {
  if (!row) return null;
  return {
    id: row.id,
    prenom: row.prenom,
    nom: row.nom,
    poste: row.poste,
    email: row.email,
    telephone: row.telephone,
    dateEntree: row.date_entree,
    typeContrat: row.type_contrat,
    salaireBase: parseFloat(row.salaire_base) || 0,
    statut: row.statut,
    adresse: row.adresse,
    numeroSecu: row.numero_secu,
    patronId: row.patron_id,
    userId: row.user_id,
    creeLe: row.cree_le,
    modifieLe: row.modifie_le,
  };
}

// Mapping snake_case → camelCase pour un créneau de planning
function mapPlanning(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeId: row.employe_id,
    missionId: row.mission_id,
    date: row.date,
    heureDebut: row.heure_debut,
    heureFin: row.heure_fin,
    type: row.type,
    semaine: row.semaine,
    creeLe: row.cree_le,
  };
}

// Mapping snake_case → camelCase pour un congé
function mapConge(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeId: row.employe_id,
    dateDebut: row.date_debut,
    dateFin: row.date_fin,
    nbJours: row.nb_jours,
    type: row.type,
    motif: row.motif,
    statut: row.statut,
    commentaire: row.commentaire,
    creeLe: row.cree_le,
    valideeLe: row.validee_le,
  };
}

// Mapping snake_case → camelCase pour une note de frais
function mapNoteFrais(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeId: row.employe_id,
    montant: parseFloat(row.montant) || 0,
    categorie: row.categorie,
    description: row.description,
    missionId: row.mission_id,
    statut: row.statut,
    justificatifUrl: row.justificatif_url,
    bulletinId: row.bulletin_id,
    inclus: row.inclus,
    creeLe: row.cree_le,
    valideeLe: row.validee_le,
  };
}

// Mapping snake_case → camelCase pour une habilitation
function mapHabilitation(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeId: row.employe_id,
    nom: row.nom,
    type: row.type,
    niveau: row.niveau,
    organisme: row.organisme,
    dateObtention: row.date_obtention,
    dateExpiration: row.date_expiration,
    documentUrl: row.document_url,
    documentNom: row.document_nom,
    verifie: row.verifie,
    ocrData: row.ocr_data,
    statut: row.statut,
    creeLe: row.cree_le,
    modifieLe: row.modifie_le,
  };
}

// Mapping snake_case → camelCase pour un bulletin de paie
function mapBulletin(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeId: row.employe_id,
    employeNom: row.employe_nom || null,
    employePoste: row.employe_poste || null,
    periode: row.periode,
    mois: row.mois,
    annee: row.annee,
    brut: parseFloat(row.brut) || 0,
    fraisInclus: parseFloat(row.frais_inclus) || 0,
    netAPayer: parseFloat(row.net_a_payer) || 0,
    coutEmployeur: parseFloat(row.cout_employeur) || 0,
    statut: row.statut,
    datePaiement: row.date_paiement,
    fraisIds: row.frais_ids || [],
    creeLe: row.cree_le,
  };
}

// ============================================================
//  EMPLOYÉS
// ============================================================

// GET /rh/employes — Liste des employés
router.get('/employes', async (req, res) => {
  try {
    const patronId = req.user?.id;
    const result = await db.query('SELECT * FROM employes WHERE patron_id = $1 ORDER BY nom, prenom', [patronId]);
    const liste = result.rows.map(mapEmploye);
    res.json({ total: liste.length, employes: liste });
  } catch (err) {
    console.error('GET /employes error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /rh/employes/:id — Fiche employé (vérifie ownership)
router.get('/employes/:id', async (req, res) => {
  try {
    const patronId = req.user?.id;
    const result = await db.query('SELECT * FROM employes WHERE id = $1 AND patron_id = $2', [req.params.id, patronId]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Employé introuvable' });
    res.json(mapEmploye(result.rows[0]));
  } catch (err) {
    console.error('GET /employes/:id error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /rh/employes — Créer une fiche employé + compte utilisateur
router.post('/employes', async (req, res) => {
  try {
    const { prenom, nom, poste, email, telephone, dateEntree, typeContrat, salaireBase, adresse, numeroSecu, creerCompte } = req.body;
    if (!prenom || !nom || !poste || !email) {
      return res.status(400).json({ erreur: 'Champs requis : prenom, nom, poste, email' });
    }

    const patronId = req.user?.id || null;
    let userId = null;

    // Créer un compte utilisateur si demandé (par défaut oui)
    if (creerCompte !== false) {
      const bcrypt = require('bcrypt');
      const tempPassword = require('crypto').randomBytes(6).toString('hex');
      const hash = await bcrypt.hash(tempPassword, 12);

      const existing = await db.query('SELECT id, role FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
      } else {
        const userResult = await db.query(
          `INSERT INTO users (nom, email, motdepasse, role, verified, telephone)
           VALUES ($1, $2, $3, 'employe', true, $4) RETURNING id`,
          [`${prenom} ${nom}`, email, hash, telephone || null]
        );
        userId = userResult.rows[0].id;
      }
    }

    const result = await db.query(
      `INSERT INTO employes
        (prenom, nom, poste, email, telephone, date_entree, type_contrat, salaire_base, statut, adresse, numero_secu, patron_id, user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'actif',$9,$10,$11,$12)
       RETURNING *`,
      [
        prenom, nom, poste, email,
        telephone || '',
        dateEntree || new Date().toISOString().split('T')[0],
        typeContrat || 'CDI',
        parseFloat(salaireBase) || 0,
        adresse || null,
        numeroSecu || null,
        patronId,
        userId,
      ]
    );

    res.status(201).json({ message: 'Fiche employé créée avec compte', employe: mapEmploye(result.rows[0]) });
  } catch (err) {
    console.error('POST /employes error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /rh/employes/:id/depart — L'employé quitte l'entreprise (compte reste actif)
router.put('/employes/:id/depart', async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE employes SET statut = 'parti', patron_id = NULL, modifie_le = NOW() WHERE id = $1 AND patron_id = $2 RETURNING *`,
      [req.params.id, req.user?.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Employé non trouvé' });
    res.json({ message: 'Employé marqué comme parti — son compte reste actif', employe: mapEmploye(result.rows[0]) });
  } catch (err) {
    console.error('PUT /employes/:id/depart error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /rh/mon-profil — L'employé récupère ses données et son entreprise
router.get('/mon-profil', async (req, res) => {
  try {
    const userId = req.user?.id;
    const empResult = await db.query('SELECT * FROM employes WHERE user_id = $1', [userId]);
    if (empResult.rows.length === 0) return res.status(404).json({ erreur: 'Profil employé non trouvé' });
    const emp = empResult.rows[0];

    let patron = null;
    if (emp.patron_id) {
      const patronResult = await db.query('SELECT id, nom, email, telephone, metier, siret, adresse, ville FROM users WHERE id = $1', [emp.patron_id]);
      patron = patronResult.rows[0] || null;
    }

    res.json({ employe: mapEmploye(emp), patron });
  } catch (err) {
    console.error('GET /mon-profil error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /rh/employes/:id — Modifier une fiche employé
router.put('/employes/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM employes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Employé introuvable' });

    const { prenom, nom, poste, email, telephone, salaireBase, typeContrat, statut, adresse, numeroSecu } = req.body;
    const emp = result.rows[0];

    const updated = await db.query(
      `UPDATE employes SET
        prenom       = $1,
        nom          = $2,
        poste        = $3,
        email        = $4,
        telephone    = $5,
        salaire_base = $6,
        type_contrat = $7,
        statut       = $8,
        adresse      = $9,
        numero_secu  = $10,
        modifie_le   = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        prenom       !== undefined ? prenom       : emp.prenom,
        nom          !== undefined ? nom          : emp.nom,
        poste        !== undefined ? poste        : emp.poste,
        email        !== undefined ? email        : emp.email,
        telephone    !== undefined ? telephone    : emp.telephone,
        salaireBase  !== undefined ? parseFloat(salaireBase) : emp.salaire_base,
        typeContrat  !== undefined ? typeContrat  : emp.type_contrat,
        statut       !== undefined ? statut       : emp.statut,
        adresse      !== undefined ? adresse      : emp.adresse,
        numeroSecu   !== undefined ? numeroSecu   : emp.numero_secu,
        req.params.id,
      ]
    );

    res.json({ message: 'Fiche employé mise à jour', employe: mapEmploye(updated.rows[0]) });
  } catch (err) {
    console.error('PUT /employes/:id error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  PLANNING
// ============================================================

// GET /rh/planning — Planning hebdomadaire
router.get('/planning', async (req, res) => {
  try {
    const { semaine, employeId } = req.query;
    let text = 'SELECT * FROM planning WHERE 1=1';
    const params = [];
    if (semaine) { params.push(semaine); text += ` AND semaine=$${params.length}`; }
    if (employeId) { params.push(parseInt(employeId)); text += ` AND employe_id=$${params.length}`; }
    text += ' ORDER BY date, heure_debut';

    const result = await db.query(text, params);
    const liste = result.rows.map(mapPlanning);
    res.json({ total: liste.length, planning: liste });
  } catch (err) {
    console.error('GET /planning error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /rh/planning — Ajouter un créneau au planning
router.post('/planning', async (req, res) => {
  try {
    const { employeId, missionId, date, heureDebut, heureFin, type } = req.body;
    if (!employeId || !date) {
      return res.status(400).json({ erreur: 'employeId et date requis' });
    }

    const semaine = getNumeroSemaine(new Date(date));

    const result = await db.query(
      `INSERT INTO planning (employe_id, mission_id, date, heure_debut, heure_fin, type, semaine)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        parseInt(employeId),
        missionId ? parseInt(missionId) : null,
        date,
        heureDebut || '08:00',
        heureFin || '17:00',
        type || 'chantier',
        semaine,
      ]
    );

    res.status(201).json({ message: 'Créneau ajouté au planning', creneau: mapPlanning(result.rows[0]) });
  } catch (err) {
    console.error('POST /planning error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  CONGÉS ET ABSENCES
// ============================================================

// GET /rh/conges — Liste des congés
router.get('/conges', async (req, res) => {
  try {
    const { employeId, statut } = req.query;
    let text = 'SELECT * FROM conges WHERE 1=1';
    const params = [];
    if (employeId) { params.push(parseInt(employeId)); text += ` AND employe_id=$${params.length}`; }
    if (statut) { params.push(statut); text += ` AND statut=$${params.length}`; }
    text += ' ORDER BY cree_le DESC';

    const result = await db.query(text, params);
    const liste = result.rows.map(mapConge);
    res.json({ total: liste.length, conges: liste });
  } catch (err) {
    console.error('GET /conges error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /rh/conges — Demander des congés
router.post('/conges', async (req, res) => {
  try {
    const { employeId, dateDebut, dateFin, type, motif } = req.body;
    if (!employeId || !dateDebut || !dateFin) {
      return res.status(400).json({ erreur: 'employeId, dateDebut, dateFin requis' });
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const nbJours = Math.ceil((fin - debut) / 86400000) + 1;

    const result = await db.query(
      `INSERT INTO conges (employe_id, date_debut, date_fin, nb_jours, type, motif, statut)
       VALUES ($1,$2,$3,$4,$5,$6,'en_attente')
       RETURNING *`,
      [
        parseInt(employeId),
        dateDebut, dateFin,
        nbJours,
        type || 'conge_paye',
        motif || '',
      ]
    );

    res.status(201).json({ message: 'Demande de congés envoyée', conge: mapConge(result.rows[0]) });
  } catch (err) {
    console.error('POST /conges error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /rh/conges/:id/valider — Valider ou refuser une demande
router.put('/conges/:id/valider', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM conges WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Demande de congé introuvable' });

    const { decision, commentaire } = req.body;
    if (!['approuvé', 'refusé'].includes(decision)) {
      return res.status(400).json({ erreur: 'decision doit être : approuvé ou refusé' });
    }

    const updated = await db.query(
      `UPDATE conges SET statut=$1, commentaire=$2, validee_le=NOW() WHERE id=$3 RETURNING *`,
      [decision, commentaire || '', req.params.id]
    );

    res.json({ message: `Congé ${decision}`, conge: mapConge(updated.rows[0]) });
  } catch (err) {
    console.error('PUT /conges/:id/valider error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  NOTES DE FRAIS
// ============================================================

// GET /rh/notes-frais — Liste des notes de frais
router.get('/notes-frais', async (req, res) => {
  try {
    const { employeId, statut } = req.query;
    let text = 'SELECT * FROM notes_frais WHERE 1=1';
    const params = [];
    if (employeId) { params.push(parseInt(employeId)); text += ` AND employe_id=$${params.length}`; }
    if (statut) { params.push(statut); text += ` AND statut=$${params.length}`; }
    text += ' ORDER BY cree_le DESC';

    const result = await db.query(text, params);
    const liste = result.rows.map(mapNoteFrais);
    res.json({ total: liste.length, notesFrais: liste });
  } catch (err) {
    console.error('GET /notes-frais error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /rh/notes-frais — Soumettre une note de frais
router.post('/notes-frais', async (req, res) => {
  try {
    const { employeId, montant, categorie, description, missionId } = req.body;
    if (!employeId || !montant || !categorie) {
      return res.status(400).json({
        erreur: 'employeId, montant, categorie requis',
        categories: 'carburant, repas, hebergement, materiel, autre',
      });
    }

    const result = await db.query(
      `INSERT INTO notes_frais (employe_id, montant, categorie, description, mission_id, statut)
       VALUES ($1,$2,$3,$4,$5,'en_attente')
       RETURNING *`,
      [
        parseInt(employeId),
        parseFloat(montant),
        categorie,
        description || '',
        missionId ? parseInt(missionId) : null,
      ]
    );

    res.status(201).json({ message: 'Note de frais soumise', noteFrais: mapNoteFrais(result.rows[0]) });
  } catch (err) {
    console.error('POST /notes-frais error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /rh/notes-frais/:id/valider — Valider ou refuser
router.put('/notes-frais/:id/valider', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM notes_frais WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Note de frais introuvable' });

    const { decision } = req.body;
    if (!['approuvée', 'refusée'].includes(decision)) {
      return res.status(400).json({ erreur: 'decision doit être : approuvée ou refusée' });
    }

    const updated = await db.query(
      `UPDATE notes_frais SET statut=$1, validee_le=NOW() WHERE id=$2 RETURNING *`,
      [decision, req.params.id]
    );

    res.json({ message: `Note de frais ${decision}`, noteFrais: mapNoteFrais(updated.rows[0]) });
  } catch (err) {
    console.error('PUT /notes-frais/:id/valider error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  TABLEAU DE BORD RH
// ============================================================

// GET /rh/tableau-de-bord
router.get('/tableau-de-bord', async (req, res) => {
  try {
    const [empResult, congesResult, fraisResult] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE statut='actif') AS actifs,
          COUNT(*) FILTER (WHERE type_contrat='CDI') AS cdi,
          COUNT(*) FILTER (WHERE type_contrat='CDD') AS cdd,
          COALESCE(SUM(salaire_base) FILTER (WHERE statut='actif'), 0) AS masse_salariale,
          json_agg(
            json_build_object('id',id,'nom',prenom||' '||nom,'poste',poste,'salaireBase',salaire_base)
            ORDER BY nom, prenom
          ) FILTER (WHERE statut='actif') AS employes_actifs
        FROM employes
      `),
      db.query(`SELECT COUNT(*) AS n FROM conges WHERE statut='en_attente'`),
      db.query(`SELECT COUNT(*) AS n FROM notes_frais WHERE statut='en_attente'`),
    ]);

    const emp = empResult.rows[0];
    const masseSalariale = parseFloat(emp.masse_salariale) || 0;

    res.json({
      equipe: {
        total: parseInt(emp.total),
        actifs: parseInt(emp.actifs),
        contratsCDI: parseInt(emp.cdi),
        contratsCDD: parseInt(emp.cdd),
      },
      masseSalariale: {
        totalBrut: masseSalariale,
        chargesPatronales: Math.round(masseSalariale * 0.42 * 100) / 100,
        coutTotal: Math.round(masseSalariale * 1.42 * 100) / 100,
      },
      alertes: {
        congesEnAttente: parseInt(congesResult.rows[0].n),
        fraisEnAttente: parseInt(fraisResult.rows[0].n),
      },
      employes: emp.employes_actifs || [],
    });
  } catch (err) {
    console.error('GET /tableau-de-bord error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  HABILITATIONS
// ============================================================

// GET /rh/habilitations
router.get('/habilitations', async (req, res) => {
  try {
    const { employeId } = req.query;
    let text = 'SELECT * FROM habilitations WHERE 1=1';
    const params = [];
    if (employeId) { params.push(parseInt(employeId)); text += ` AND employe_id=$${params.length}`; }
    text += ' ORDER BY date_expiration';

    const result = await db.query(text, params);
    const now = new Date();

    const liste = result.rows.map(row => {
      const h = mapHabilitation(row);
      const exp = new Date(row.date_expiration);
      const diffDays = Math.ceil((exp - now) / 86400000);
      let alerte = null;
      if (diffDays < 0) alerte = 'expirée';
      else if (diffDays < 7) alerte = 'urgente';
      else if (diffDays < 30) alerte = 'bientôt';
      return { ...h, alerte, joursRestants: diffDays };
    });

    res.json({ total: liste.length, habilitations: liste });
  } catch (err) {
    console.error('GET /habilitations error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /rh/habilitations
router.post('/habilitations', async (req, res) => {
  try {
    const { employeId, nom, type, niveau, organisme, dateObtention, dateExpiration, documentNom, documentUrl, ocrData } = req.body;
    if (!employeId || !nom || !dateExpiration) {
      return res.status(400).json({ erreur: 'employeId, nom, dateExpiration requis' });
    }

    const statut = new Date(dateExpiration) > new Date() ? 'valide' : 'expiree';

    const result = await db.query(
      `INSERT INTO habilitations
        (employe_id, nom, type, niveau, organisme, date_obtention, date_expiration,
         document_url, document_nom, ocr_data, statut)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        parseInt(employeId),
        nom,
        type || 'autre',
        niveau || '',
        organisme || '',
        dateObtention || new Date().toISOString().split('T')[0],
        dateExpiration,
        documentUrl || null,
        documentNom || null,
        ocrData ? JSON.stringify(ocrData) : null,
        statut,
      ]
    );

    res.status(201).json({ message: 'Habilitation ajoutée', habilitation: mapHabilitation(result.rows[0]) });
  } catch (err) {
    console.error('POST /habilitations error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /rh/habilitations/:id
router.put('/habilitations/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM habilitations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Habilitation introuvable' });

    const h = result.rows[0];
    const { nom, type, niveau, organisme, dateObtention, dateExpiration, documentUrl, documentNom, verifie, ocrData, statut } = req.body;

    const updated = await db.query(
      `UPDATE habilitations SET
        nom             = $1,
        type            = $2,
        niveau          = $3,
        organisme       = $4,
        date_obtention  = $5,
        date_expiration = $6,
        document_url    = $7,
        document_nom    = $8,
        verifie         = $9,
        ocr_data        = $10,
        statut          = $11,
        modifie_le      = NOW()
       WHERE id = $12
       RETURNING *`,
      [
        nom            !== undefined ? nom            : h.nom,
        type           !== undefined ? type           : h.type,
        niveau         !== undefined ? niveau         : h.niveau,
        organisme      !== undefined ? organisme      : h.organisme,
        dateObtention  !== undefined ? dateObtention  : h.date_obtention,
        dateExpiration !== undefined ? dateExpiration : h.date_expiration,
        documentUrl    !== undefined ? documentUrl    : h.document_url,
        documentNom    !== undefined ? documentNom    : h.document_nom,
        verifie        !== undefined ? verifie        : h.verifie,
        ocrData        !== undefined ? JSON.stringify(ocrData) : h.ocr_data,
        statut         !== undefined ? statut         : h.statut,
        req.params.id,
      ]
    );

    res.json({ message: 'Habilitation mise à jour', habilitation: mapHabilitation(updated.rows[0]) });
  } catch (err) {
    console.error('PUT /habilitations/:id error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// DELETE /rh/habilitations/:id
router.delete('/habilitations/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM habilitations WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Habilitation introuvable' });
    res.json({ message: 'Habilitation supprimée' });
  } catch (err) {
    console.error('DELETE /habilitations/:id error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  GESTION DE PAIE — BULLETINS
// ============================================================

const moisNoms = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// GET /rh/bulletins-paie
router.get('/bulletins-paie', async (req, res) => {
  try {
    const { employeId, mois, annee } = req.query;
    let text = `
      SELECT bp.*,
             e.prenom||' '||e.nom AS employe_nom,
             e.poste              AS employe_poste
      FROM bulletins_paie bp
      LEFT JOIN employes e ON e.id = bp.employe_id
      WHERE 1=1
    `;
    const params = [];
    if (employeId) { params.push(parseInt(employeId)); text += ` AND bp.employe_id=$${params.length}`; }
    if (mois)      { params.push(parseInt(mois));      text += ` AND bp.mois=$${params.length}`; }
    if (annee)     { params.push(parseInt(annee));     text += ` AND bp.annee=$${params.length}`; }
    text += ' ORDER BY bp.annee DESC, bp.mois DESC, bp.cree_le DESC';

    const result = await db.query(text, params);
    const liste = result.rows.map(mapBulletin);
    res.json({ total: liste.length, bulletins: liste });
  } catch (err) {
    console.error('GET /bulletins-paie error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /rh/bulletins-paie — Créer et payer un bulletin
router.post('/bulletins-paie', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { employeId, mois, annee, fraisIds } = req.body;

    const empResult = await client.query('SELECT * FROM employes WHERE id = $1', [parseInt(employeId)]);
    if (empResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erreur: 'Employé introuvable' });
    }
    const emp = empResult.rows[0];

    // Récupérer les notes de frais approuvées à inclure
    let fraisAInclure = [];
    if (fraisIds && fraisIds.length > 0) {
      const fraisResult = await client.query(
        `SELECT * FROM notes_frais WHERE id = ANY($1::int[]) AND statut='approuvée'`,
        [fraisIds]
      );
      fraisAInclure = fraisResult.rows;
    }
    const totalFrais = fraisAInclure.reduce((s, n) => s + parseFloat(n.montant || 0), 0);

    const brut = parseFloat(emp.salaire_base) || 0;
    const totalSal = brut * 0.2285;
    const netBase = brut - totalSal;
    const netAPayer = netBase + totalFrais;
    const totalPat = brut * 0.42;
    const coutEmployeur = brut + totalPat;

    // Générer l'ID du bulletin : BP-YYYY-MM-NNN
    const moisPad = String(mois).padStart(2, '0');
    const countResult = await client.query(
      `SELECT COUNT(*)+1 AS n FROM bulletins_paie WHERE annee=$1 AND mois=$2`,
      [parseInt(annee), parseInt(mois)]
    );
    const seq = parseInt(countResult.rows[0].n);
    const bulletinId = `BP-${annee}-${moisPad}-${String(seq).padStart(3, '0')}`;
    const periode = `${moisNoms[parseInt(mois)]} ${annee}`;
    const datePaiement = new Date().toISOString().split('T')[0];

    const bulletinResult = await client.query(
      `INSERT INTO bulletins_paie
        (id, employe_id, periode, mois, annee, brut, frais_inclus, net_a_payer,
         cout_employeur, statut, date_paiement, frais_ids)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'payé',$10,$11)
       RETURNING *`,
      [
        bulletinId,
        parseInt(employeId),
        periode,
        parseInt(mois),
        parseInt(annee),
        brut,
        totalFrais,
        netAPayer,
        coutEmployeur,
        datePaiement,
        JSON.stringify(fraisAInclure.map(f => f.id)),
      ]
    );

    // Marquer les notes de frais comme incluses dans ce bulletin
    if (fraisAInclure.length > 0) {
      await client.query(
        `UPDATE notes_frais SET bulletin_id=$1, inclus=true WHERE id = ANY($2::int[])`,
        [bulletinId, fraisAInclure.map(f => f.id)]
      );
    }

    await client.query('COMMIT');

    const bulletin = mapBulletin(bulletinResult.rows[0]);
    bulletin.employeNom = `${emp.prenom} ${emp.nom}`;
    bulletin.employePoste = emp.poste;
    const notification = `Votre salaire de ${netAPayer.toFixed(2)} € a été versé pour ${periode}.`;

    res.status(201).json({ message: 'Bulletin créé et paie effectuée', bulletin, notification });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /bulletins-paie error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

// GET /rh/masse-salariale — Suivi mensuel
router.get('/masse-salariale', async (req, res) => {
  try {
    const moisAbrev = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
    const annee = parseInt(req.query.annee) || new Date().getFullYear();

    const result = await db.query(
      `SELECT
         mois,
         COUNT(*) AS nb_bulletins,
         COALESCE(SUM(brut),0) AS total_brut,
         COALESCE(SUM(net_a_payer),0) AS total_net,
         COALESCE(SUM(frais_inclus),0) AS total_frais,
         COALESCE(SUM(cout_employeur),0) AS cout_total
       FROM bulletins_paie
       WHERE annee=$1 AND statut='payé'
       GROUP BY mois
       ORDER BY mois`,
      [annee]
    );

    const parMoisMap = {};
    result.rows.forEach(r => { parMoisMap[r.mois] = r; });

    const parMois = Array.from({ length: 12 }, (_, i) => {
      const moisNum = i + 1;
      const r = parMoisMap[moisNum] || {};
      return {
        mois: moisAbrev[i],
        moisNum,
        nbBulletins: parseInt(r.nb_bulletins) || 0,
        totalBrut: parseFloat(r.total_brut) || 0,
        totalNet: parseFloat(r.total_net) || 0,
        totalFrais: parseFloat(r.total_frais) || 0,
        coutTotal: parseFloat(r.cout_total) || 0,
      };
    });

    const totalAnnee = {
      brut:  parMois.reduce((s, m) => s + m.totalBrut, 0),
      frais: parMois.reduce((s, m) => s + m.totalFrais, 0),
      cout:  parMois.reduce((s, m) => s + m.coutTotal, 0),
    };

    res.json({ annee, parMois, totalAnnee });
  } catch (err) {
    console.error('GET /masse-salariale error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  DOCUMENTS EMPLOYÉ — Upload / Consultation en temps réel
// ============================================================

// POST /rh/documents — L'employé dépose un document
router.post('/documents', async (req, res) => {
  try {
    const userId = req.user?.id;
    const empResult = await db.query('SELECT id, patron_id FROM employes WHERE user_id = $1', [userId]);
    if (!empResult.rows[0]) return res.status(404).json({ erreur: 'Profil employé non trouvé' });
    const emp = empResult.rows[0];

    const { typeDocument, nomFichier, contenuBase64, taille, mimeType } = req.body;
    if (!typeDocument || !nomFichier) return res.status(400).json({ erreur: 'typeDocument et nomFichier requis' });

    // Upsert — remplace si même type déjà uploadé
    const existing = await db.query(
      'SELECT id FROM documents_employe WHERE employe_id = $1 AND type_document = $2',
      [emp.id, typeDocument]
    );

    let doc;
    if (existing.rows[0]) {
      const r = await db.query(
        `UPDATE documents_employe SET nom_fichier=$1, contenu_base64=$2, taille=$3, mime_type=$4, statut='en_attente', uploaded_at=NOW()
         WHERE id=$5 RETURNING *`,
        [nomFichier, contenuBase64 || null, taille || null, mimeType || null, existing.rows[0].id]
      );
      doc = r.rows[0];
    } else {
      const r = await db.query(
        `INSERT INTO documents_employe (employe_id, patron_id, type_document, nom_fichier, contenu_base64, taille, mime_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [emp.id, emp.patron_id, typeDocument, nomFichier, contenuBase64 || null, taille || null, mimeType || null]
      );
      doc = r.rows[0];
    }

    res.status(201).json({ message: 'Document déposé', document: doc });
  } catch (err) {
    console.error('POST /documents error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /rh/documents — L'employé voit ses propres documents
router.get('/documents', async (req, res) => {
  try {
    const userId = req.user?.id;
    const empResult = await db.query('SELECT id FROM employes WHERE user_id = $1', [userId]);
    if (!empResult.rows[0]) return res.status(404).json({ erreur: 'Profil non trouvé' });

    const { rows } = await db.query(
      'SELECT id, type_document, nom_fichier, taille, mime_type, statut, commentaire, uploaded_at FROM documents_employe WHERE employe_id = $1 ORDER BY uploaded_at DESC',
      [empResult.rows[0].id]
    );
    res.json({ documents: rows });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /rh/employes/:id/documents — Le patron voit les documents d'un employé
router.get('/employes/:id/documents', async (req, res) => {
  try {
    const patronId = req.user?.id;
    // Vérifier que l'employé appartient au patron
    const empCheck = await db.query('SELECT id FROM employes WHERE id = $1 AND patron_id = $2', [req.params.id, patronId]);
    if (!empCheck.rows[0]) return res.status(403).json({ erreur: 'Accès refusé' });

    const { rows } = await db.query(
      'SELECT id, type_document, nom_fichier, taille, mime_type, statut, commentaire, uploaded_at FROM documents_employe WHERE employe_id = $1 ORDER BY uploaded_at DESC',
      [req.params.id]
    );
    res.json({ documents: rows });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /rh/documents/:id/valider — Le patron valide ou refuse un document
router.put('/documents/:id/valider', async (req, res) => {
  try {
    const { statut, commentaire } = req.body; // 'valide' | 'refuse'
    if (!['valide', 'refuse'].includes(statut)) return res.status(400).json({ erreur: 'Statut invalide' });

    const { rows } = await db.query(
      `UPDATE documents_employe SET statut=$1, commentaire=$2 WHERE id=$3 AND patron_id=$4 RETURNING *`,
      [statut, commentaire || null, req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ erreur: 'Document non trouvé' });
    res.json({ message: `Document ${statut}`, document: rows[0] });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
