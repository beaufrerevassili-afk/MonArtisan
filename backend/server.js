// ============================================================
//  server.js  –  Backend Node.js Express – Application Artisans
//  Stack : Express, bcrypt, jsonwebtoken, PostgreSQL (via db.js)
//  Modules : Auth, Missions, ERP, Finance, RH, QSE, URSSAF,
//            Notifications, Client (Litiges, Notations)
// ============================================================

require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET non défini dans .env — démarrage annulé.');
  process.exit(1);
}

const express      = require('express');
const bodyParser   = require('body-parser');
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const db           = require('./db');

// Routes modules
const financeRoutes       = require('./routes/financeRoutes');
const rhRoutes            = require('./routes/rhRoutes');
const qseRoutes           = require('./routes/qseRoutes');
const urssafRoutes        = require('./routes/urssafRoutes');
const clientRoutes        = require('./routes/clientRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const patronRoutes        = require('./routes/patronRoutes');
const artisanRoutes       = require('./routes/artisanRoutes');

const app    = express();
const PORT   = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

// ============================================================
//  MIDDLEWARES GLOBAUX
// ============================================================

app.set('trust proxy', 1);

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : false,
  credentials: true,
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", ...( process.env.CORS_ORIGINS?.split(',') || [] )],
      fontSrc:    ["'self'"],
      objectSrc:  ["'none'"],
      frameSrc:   ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '500kb' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  message: { erreur: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  message: { erreur: 'Trop de requêtes. Réessayez dans une heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================
//  resetTokens : Map en mémoire (temporaire par nature)
// ============================================================
const resetTokens = new Map(); // token -> { userId, expiresAt }

// ============================================================
//  DONNÉES ARTISANS PUBLICS (landing page, sans auth)
// ============================================================

const artisansPublics = [
  { id: 1,  nom: 'Carlos Garcia',    metier: 'Plomberie',    ville: 'Paris 11e',     note: 4.9, nbAvis: 127, disponibilite: 'aujourd_hui',  prixHeure: 65,  verified: true,  certifications: ['RGE', 'Qualibat'],      description: "Plombier certifié avec 15 ans d'expérience. Intervention rapide en urgence, 7j/7."     },
  { id: 2,  nom: 'Éric Leroy',       metier: 'Électricité',  ville: 'Paris 15e',     note: 4.8, nbAvis: 98,  disponibilite: 'cette_semaine', prixHeure: 70,  verified: true,  certifications: ['CONSUEL', 'Qualifelec'], description: 'Électricien agréé, mise aux normes, dépannage et installation neuve.'                },
  { id: 3,  nom: 'Fatima Benali',    metier: 'Peinture',     ville: 'Lyon 3e',       note: 4.7, nbAvis: 84,  disponibilite: 'ce_mois',      prixHeure: 45,  verified: true,  certifications: ['Qualibat'],             description: 'Peintre décorateur, ravalement façade, intérieur/extérieur.'                        },
  { id: 4,  nom: 'Marc Dupuis',      metier: 'Carrelage',    ville: 'Marseille 6e',  note: 4.6, nbAvis: 61,  disponibilite: 'cette_semaine', prixHeure: 50,  verified: true,  certifications: ['Qualibat'],             description: 'Carreleur professionnel, pose de carrelage mural et au sol, salle de bain, cuisine.' },
  { id: 5,  nom: 'Sophie Renaud',    metier: 'Menuiserie',   ville: 'Bordeaux',      note: 4.9, nbAvis: 143, disponibilite: 'aujourd_hui',  prixHeure: 60,  verified: true,  certifications: ['Qualibat', 'Artisan'],  description: 'Menuisière ébéniste, fabrication sur mesure, portes, fenêtres, parquet.'             },
  { id: 6,  nom: 'Youssef Amrani',   metier: 'Maçonnerie',   ville: 'Paris 18e',     note: 4.5, nbAvis: 52,  disponibilite: 'ce_mois',      prixHeure: 55,  verified: false, certifications: [],                      description: 'Maçon polyvalent, gros œuvre, rénovation, extension de maison.'                    },
  { id: 7,  nom: 'Lucie Girard',     metier: 'Chauffage',    ville: 'Toulouse',      note: 4.8, nbAvis: 77,  disponibilite: 'cette_semaine', prixHeure: 72,  verified: true,  certifications: ['RGE', 'QualiPAC'],     description: 'Technicienne chauffagiste, pompe à chaleur, climatisation, entretien chaudière.'     },
  { id: 8,  nom: 'Karim Moussaoui',  metier: 'Serrurerie',   ville: 'Paris 20e',     note: 4.7, nbAvis: 119, disponibilite: 'aujourd_hui',  prixHeure: 80,  verified: true,  certifications: ['Artisan'],             description: 'Serrurier dépannage 24h/24, ouverture de porte, blindage, installation.'             },
  { id: 9,  nom: 'Nathalie Poirier', metier: 'Jardinage',    ville: 'Nice',          note: 4.6, nbAvis: 38,  disponibilite: 'cette_semaine', prixHeure: 40,  verified: true,  certifications: ['Artisan'],             description: 'Jardinière paysagiste, entretien, taille, création de jardin.'                      },
  { id: 10, nom: 'Thomas Blanc',     metier: 'Plomberie',    ville: 'Lyon 7e',       note: 4.4, nbAvis: 45,  disponibilite: 'cette_semaine', prixHeure: 60,  verified: false, certifications: [],                      description: 'Plombier sanitaire, installation et dépannage, chauffage central.'                  },
  { id: 11, nom: 'Amélie Fontaine',  metier: 'Peinture',     ville: 'Paris 12e',     note: 4.8, nbAvis: 92,  disponibilite: 'ce_mois',      prixHeure: 48,  verified: true,  certifications: ['Qualibat'],            description: 'Peintre en bâtiment, enduits décoratifs, béton ciré, tadelakt.'                    },
  { id: 12, nom: 'Rachid Boukhari',  metier: 'Électricité',  ville: 'Marseille 13e', note: 4.5, nbAvis: 63,  disponibilite: 'aujourd_hui',  prixHeure: 65,  verified: true,  certifications: ['CONSUEL'],             description: 'Électricien tous travaux, domotique, borne de recharge véhicule électrique.'         },
];

// ============================================================
//  MIDDLEWARES AUTH
// ============================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = req.cookies?.token || (authHeader && authHeader.split(' ')[1]);
  if (!token) return res.status(401).json({ erreur: 'Token manquant' });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ erreur: 'Token invalide ou expiré' });
    req.user = user;
    next();
  });
}

function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ erreur: `Accès refusé. Rôles requis : ${roles.join(', ')}` });
    }
    next();
  };
}

// Utilitaire : mapper une ligne DB (snake_case) vers JSON camelCase pour un user
function mapUser(row) {
  if (!row) return null;
  return {
    id:                  row.id,
    nom:                 row.nom,
    email:               row.email,
    role:                row.role,
    verified:            row.verified,
    statutVerification:  row.statut_verification,
    statutValidation:    row.statut_validation,
    motifRejet:          row.motif_rejet,
    valideLe:            row.valide_le,
    telephone:           row.telephone,
    metier:              row.metier,
    siret:               row.siret,
    adresse:             row.adresse,
    ville:               row.ville,
    experience:          row.experience,
    description:         row.description,
    documents:           row.documents,
    documentsSoumis:     row.documents_soumis,
    suspendu:            row.suspendu,
    suspenduLe:          row.suspendu_le,
    creeLe:              row.cree_le,
  };
}

// Utilitaire : mapper une ligne DB missions vers JSON camelCase
function mapMission(row) {
  if (!row) return null;
  return {
    id:          row.id,
    titre:       row.titre,
    description: row.description,
    categorie:   row.categorie,
    urgence:     row.urgence,
    photos:      row.photos,
    clientId:    row.client_id,
    artisanId:   row.artisan_id,
    statut:      row.statut,
    priorite:    row.priorite,
    dateDebut:   row.date_debut,
    dateFin:     row.date_fin,
    budget:      row.budget !== null ? parseFloat(row.budget) : null,
    creeLe:      row.cree_le,
    modifieLe:   row.modifie_le,
  };
}

// ============================================================
//  ROUTES — AUTHENTIFICATION
// ============================================================

app.post('/login', process.env.NODE_ENV === 'production' ? loginLimiter : (req, res, next) => next(), async (req, res) => {
  try {
    const { email, motdepasse } = req.body;
    if (!email || !motdepasse) return res.status(400).json({ erreur: 'Email et mot de passe requis' });

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });

    const valide = await bcrypt.compare(motdepasse, user.motdepasse);
    if (!valide) return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, nom: user.nom }, SECRET, { expiresIn: '8h' });

    res.json({ message: `Bienvenue ${user.nom} !`, token, role: user.role, userId: user.id, nom: user.nom, email: user.email });
  } catch (err) {
    console.error('Erreur /login :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.post('/logout', (req, res) => {
  res.json({ message: 'Déconnecté' });
});

app.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ erreur: 'Email requis' });

    const { rows } = await db.query('SELECT id, email, nom FROM users WHERE email = $1', [email]);
    const user = rows[0];
    // Always return 200 to avoid email enumeration
    if (!user) return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });

    const token = require('crypto').randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
    resetTokens.set(token, { userId: user.id, expiresAt });

    // TODO: send email with reset link (SendGrid / Resend)
    console.log(`[RESET] Lien: /reset-password/${token} pour ${user.email}`);
    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (err) {
    console.error('Erreur /forgot-password :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.post('/reset-password', async (req, res) => {
  try {
    const { token, motdepasse } = req.body;
    if (!token || !motdepasse) return res.status(400).json({ erreur: 'Token et nouveau mot de passe requis' });

    const entry = resetTokens.get(token);
    if (!entry) return res.status(400).json({ erreur: 'Token invalide ou déjà utilisé' });
    if (Date.now() > entry.expiresAt) {
      resetTokens.delete(token);
      return res.status(400).json({ erreur: 'Token expiré. Veuillez refaire une demande.' });
    }

    const { rows } = await db.query('SELECT id FROM users WHERE id = $1', [entry.userId]);
    if (!rows[0]) return res.status(400).json({ erreur: 'Utilisateur introuvable' });

    const hash = await bcrypt.hash(motdepasse, 12);
    await db.query('UPDATE users SET motdepasse = $1 WHERE id = $2', [hash, entry.userId]);
    resetTokens.delete(token);

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    console.error('Erreur /reset-password :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.post('/register', authLimiter, async (req, res) => {
  try {
    const { nom, email, motdepasse, role, telephone, metier, siret, adresse, ville, experience, description, documents, statut_verification } = req.body;
    if (!nom || !email || !motdepasse) return res.status(400).json({ erreur: 'nom, email, motdepasse requis' });

    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) return res.status(400).json({ erreur: 'Cet email est déjà utilisé' });

    // Validation artisan
    if (role === 'artisan') {
      const docsObligatoires = ['piece_identite', 'kbis', 'rc_pro', 'attestation_urssaf', 'diplome', 'rib'];
      if (!siret) return res.status(400).json({ erreur: 'Le numéro SIRET est requis pour un artisan' });
      if (!metier) return res.status(400).json({ erreur: 'Le métier est requis' });
      const manquants = docsObligatoires.filter(d => !documents || !documents[d]);
      if (manquants.length > 0) return res.status(400).json({ erreur: `Documents manquants : ${manquants.join(', ')}` });
    }

    const rolesValides = ['client', 'patron', 'artisan'];
    const roleValide   = rolesValides.includes(role) ? role : 'client';
    const isVerified   = roleValide !== 'patron' && roleValide !== 'artisan';
    const hash         = await bcrypt.hash(motdepasse, 12);

    const docsObj        = role === 'artisan' ? (documents || {}) : null;
    const docsSoumis     = role === 'artisan' ? Object.keys(documents || {}).length : 0;
    const statutVerif    = role === 'artisan' ? 'en_attente' : null;

    const { rows: inserted } = await db.query(
      `INSERT INTO users
         (nom, email, motdepasse, role, verified, statut_verification,
          telephone, metier, siret, adresse, ville, experience, description,
          documents, documents_soumis, suspendu)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING id, nom, email, role`,
      [
        nom, email, hash, roleValide, isVerified, statutVerif,
        telephone || null, metier || null, siret || null,
        adresse || null, ville || null, experience || null, description || null,
        docsObj ? JSON.stringify(docsObj) : '{}',
        docsSoumis, false,
      ]
    );

    const newUser = inserted[0];

    if (roleValide === 'artisan') {
      return res.status(201).json({
        message: `Dossier soumis pour ${nom}. Votre compte sera activé après vérification de vos documents (24-48h).`,
        statut: 'en_attente_verification',
        userId: newUser.id,
      });
    }

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, nom: newUser.nom }, SECRET, { expiresIn: '8h' });
    res.status(201).json({ message: `Compte créé pour ${nom}`, token, role: newUser.role, userId: newUser.id });
  } catch (err) {
    console.error('Erreur /register :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  ROUTES — DASHBOARDS
// ============================================================

app.get('/dashboard/client', authenticateToken, authorizeRole('client'), async (req, res) => {
  try {
    const { rows: missions } = await db.query(
      'SELECT * FROM missions WHERE client_id = $1',
      [req.user.id]
    );
    const mapped = missions.map(mapMission);
    res.json({
      dashboard: 'Client',
      utilisateur: { nom: req.user.nom, email: req.user.email },
      resume: {
        missions_total:      mapped.length,
        missions_en_attente: mapped.filter(m => m.statut === 'en_attente').length,
        missions_en_cours:   mapped.filter(m => m.statut === 'en_cours').length,
        missions_terminees:  mapped.filter(m => m.statut === 'terminee').length,
        budget_total:        mapped.reduce((s, m) => s + (m.budget || 0), 0),
      },
      mes_missions: mapped,
    });
  } catch (err) {
    console.error('Erreur /dashboard/client :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.get('/dashboard/artisan', authenticateToken, authorizeRole('artisan'), async (req, res) => {
  try {
    const { rows: missions } = await db.query(
      'SELECT * FROM missions WHERE artisan_id = $1',
      [req.user.id]
    );
    const mapped = missions.map(mapMission);
    res.json({
      dashboard: 'Artisan',
      utilisateur: { nom: req.user.nom, email: req.user.email },
      resume: {
        missions_assignees: mapped.length,
        missions_en_cours:  mapped.filter(m => m.statut === 'en_cours').length,
        missions_terminees: mapped.filter(m => m.statut === 'terminee').length,
        missions_urgentes:  mapped.filter(m => m.priorite === 'urgente').length,
        revenus_missions:   mapped.filter(m => m.statut === 'terminee').reduce((s, m) => s + (m.budget || 0), 0),
      },
      mes_missions: mapped,
    });
  } catch (err) {
    console.error('Erreur /dashboard/artisan :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.get('/dashboard/patron', authenticateToken, authorizeRole('patron'), async (req, res) => {
  try {
    const { rows: artisans } = await db.query("SELECT id, nom, email, role FROM users WHERE role='artisan'");
    const { rows: clients }  = await db.query("SELECT id, nom, email FROM users WHERE role='client'");
    const { rows: mStats }   = await db.query('SELECT statut, priorite, budget FROM missions');
    const { rows: facStats }  = await db.query(
      "SELECT COUNT(*) FILTER (WHERE statut='en_attente') AS en_attente, COALESCE(SUM(montant_ttc) FILTER (WHERE statut='en_attente'),0) AS montant_en_attente FROM factures"
    );
    const { rows: allMissions } = await db.query('SELECT * FROM missions');

    // Artisans actifs = ayant au moins une mission assignee/en_cours
    const artisanIdsActifs = new Set(
      allMissions.filter(m => ['assignee', 'en_cours'].includes(m.statut)).map(m => m.artisan_id).filter(Boolean)
    );

    const budgetTotal = mStats.reduce((s, m) => s + (m.budget ? parseFloat(m.budget) : 0), 0);
    const facRow = facStats[0] || {};

    res.json({
      dashboard: 'Patron',
      utilisateur: { nom: req.user.nom, email: req.user.email },
      resume_missions: {
        total:        mStats.length,
        en_attente:   mStats.filter(m => m.statut === 'en_attente').length,
        assignees:    mStats.filter(m => m.statut === 'assignee').length,
        en_cours:     mStats.filter(m => m.statut === 'en_cours').length,
        terminees:    mStats.filter(m => m.statut === 'terminee').length,
        urgentes:     mStats.filter(m => m.priorite === 'urgente').length,
        budget_total: budgetTotal,
      },
      equipe: {
        artisans_total:  artisans.length,
        clients_total:   clients.length,
        artisans_actifs: artisanIdsActifs.size,
      },
      finances: {
        chiffre_affaire_annuel: null, // calculé via /erp/rapport
        benefice_net:           null,
        tresorerie:             null,
        factures_en_attente:    parseInt(facRow.en_attente) || 0,
      },
      artisans,
      toutes_missions: allMissions.map(mapMission),
    });
  } catch (err) {
    console.error('Erreur /dashboard/patron :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  PROFIL UTILISATEUR
// ============================================================

app.put('/users/profil', authenticateToken, async (req, res) => {
  try {
    const { nom, telephone, adresse, ville, metier, siret, tva, nomEntreprise } = req.body;
    await db.query(
      `UPDATE users SET
        nom = COALESCE($1, nom),
        telephone = COALESCE($2, telephone),
        adresse = COALESCE($3, adresse),
        ville = COALESCE($4, ville),
        metier = COALESCE($5, metier),
        siret = COALESCE($6, siret)
       WHERE id = $7`,
      [nom || null, telephone || null, adresse || null, ville || null, metier || null, siret || null, req.user.id]
    );
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Profil mis à jour', user: mapUser(rows[0]) });
  } catch (err) {
    console.error('Erreur PUT /users/profil :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.get('/dashboard/admin', authenticateToken, authorizeRole('super_admin'), async (req, res) => {
  try {
    const { rows: allUsers }    = await db.query('SELECT id, nom, email, role, verified, statut_verification, statut_validation, motif_rejet, suspendu, cree_le FROM users');
    const { rows: allMissions } = await db.query('SELECT * FROM missions');
    const { rows: recentDocs }  = await db.query(
      "SELECT id, numero AS nom, 'devis' AS type, cree_le AS date, montant_ttc AS montant FROM devis UNION ALL SELECT id, numero AS nom, 'facture' AS type, cree_le AS date, montant_ttc AS montant FROM factures ORDER BY date DESC LIMIT 5"
    );

    const mappedUsers    = allUsers.map(mapUser);
    const mappedMissions = allMissions.map(mapMission);

    res.json({
      dashboard: 'Super Admin',
      utilisateur: { nom: req.user.nom, email: req.user.email },
      statistiques_globales: {
        utilisateurs_total: allUsers.length,
        par_role: {
          clients:      allUsers.filter(u => u.role === 'client').length,
          artisans:     allUsers.filter(u => u.role === 'artisan').length,
          patrons:      allUsers.filter(u => u.role === 'patron').length,
          super_admins: allUsers.filter(u => u.role === 'super_admin').length,
        },
        missions_total:   mappedMissions.length,
        missions_actives: mappedMissions.filter(m => ['assignee', 'en_cours'].includes(m.statut)).length,
      },
      erp: { documents_recents: recentDocs },
      tous_utilisateurs: mappedUsers,
      toutes_missions:   mappedMissions,
    });
  } catch (err) {
    console.error('Erreur /dashboard/admin :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  ROUTE PUBLIQUE — ARTISANS (landing page, sans auth)
// ============================================================

app.get('/public/artisans', (req, res) => {
  let results = [...artisansPublics];
  const { q, metier, ville, disponibilite, noteMin } = req.query;

  if (q)            results = results.filter(a => [a.nom, a.metier, a.ville, a.description].some(s => s.toLowerCase().includes(q.toLowerCase())));
  if (metier)       results = results.filter(a => a.metier === metier);
  if (ville)        results = results.filter(a => a.ville.toLowerCase().includes(ville.toLowerCase()));
  if (disponibilite) results = results.filter(a => a.disponibilite === disponibilite);
  if (noteMin)      results = results.filter(a => a.note >= parseFloat(noteMin));

  res.json({ artisans: results, total: results.length });
});

// ============================================================
//  ROUTES — MISSIONS
// ============================================================

app.get('/missions', authenticateToken, async (req, res) => {
  try {
    let baseQuery = 'SELECT * FROM missions WHERE 1=1';
    const params  = [];
    let idx = 1;

    if (req.user.role === 'client') {
      baseQuery += ` AND client_id = $${idx++}`;
      params.push(req.user.id);
    } else if (req.user.role === 'artisan') {
      baseQuery += ` AND artisan_id = $${idx++}`;
      params.push(req.user.id);
    } else if (!['patron', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ erreur: 'Accès refusé' });
    }

    const { statut, priorite, artisanId, clientId } = req.query;
    if (statut) {
      baseQuery += ` AND statut = $${idx++}`;
      params.push(statut);
    }
    if (priorite) {
      baseQuery += ` AND priorite = $${idx++}`;
      params.push(priorite);
    }
    if (artisanId) {
      baseQuery += ` AND artisan_id = $${idx++}`;
      params.push(parseInt(artisanId));
    }
    if (clientId) {
      baseQuery += ` AND client_id = $${idx++}`;
      params.push(parseInt(clientId));
    }

    const { rows } = await db.query(baseQuery, params);
    const mapped = rows.map(mapMission);
    res.json({ total: mapped.length, missions: mapped });
  } catch (err) {
    console.error('Erreur GET /missions :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.get('/missions/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM missions WHERE id = $1', [parseInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Mission introuvable' });
    const mission = mapMission(rows[0]);

    if (req.user.role === 'client'  && mission.clientId  !== req.user.id) return res.status(403).json({ erreur: 'Accès refusé' });
    if (req.user.role === 'artisan' && mission.artisanId !== req.user.id) return res.status(403).json({ erreur: 'Accès refusé' });

    // Enrichir avec client et artisan
    let client  = null;
    let artisan = null;
    if (mission.clientId) {
      const { rows: cr } = await db.query('SELECT id, nom, email, role FROM users WHERE id = $1', [mission.clientId]);
      client = cr[0] || null;
    }
    if (mission.artisanId) {
      const { rows: ar } = await db.query('SELECT id, nom, email, role, metier FROM users WHERE id = $1', [mission.artisanId]);
      artisan = ar[0] || null;
    }

    res.json({ ...mission, client, artisan });
  } catch (err) {
    console.error('Erreur GET /missions/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.post('/missions', authenticateToken, authorizeRole('client', 'patron', 'super_admin'), async (req, res) => {
  try {
    const { titre, description, budget, priorite, dateDebut, dateFin, clientId, categorie, urgence, photos } = req.body;
    if (!titre || !description || !budget) return res.status(400).json({ erreur: 'titre, description, budget requis' });

    let cId = req.user.id;
    if (['patron', 'super_admin'].includes(req.user.role) && clientId) {
      const { rows: cr } = await db.query("SELECT id FROM users WHERE id = $1 AND role = 'client'", [parseInt(clientId)]);
      if (!cr[0]) return res.status(400).json({ erreur: `Aucun client trouvé avec l'id ${clientId}` });
      cId = parseInt(clientId);
    }

    const prioritesValides = ['basse', 'normale', 'haute', 'urgente'];
    const prioriteValide   = prioritesValides.includes(priorite) ? priorite : 'normale';

    const { rows: inserted } = await db.query(
      `INSERT INTO missions (titre, description, categorie, urgence, photos, client_id, artisan_id, statut, priorite, date_debut, date_fin, budget)
       VALUES ($1,$2,$3,$4,$5,$6,NULL,'en_attente',$7,$8,$9,$10)
       RETURNING *`,
      [
        titre, description,
        categorie || 'Autres',
        urgence || 'cette_semaine',
        JSON.stringify(photos || []),
        cId,
        prioriteValide,
        dateDebut || null,
        dateFin || null,
        parseFloat(budget),
      ]
    );

    res.status(201).json({ message: 'Mission créée', mission: mapMission(inserted[0]) });
  } catch (err) {
    console.error('Erreur POST /missions :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.put('/missions/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM missions WHERE id = $1', [parseInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Mission introuvable' });
    const mission = mapMission(rows[0]);

    const isPatronAdmin = ['patron', 'super_admin'].includes(req.user.role);
    const isOwner = req.user.role === 'client' && mission.clientId === req.user.id;
    if (!isPatronAdmin && !isOwner) return res.status(403).json({ erreur: 'Accès refusé' });
    if (isOwner && mission.statut !== 'en_attente') return res.status(400).json({ erreur: 'Modification impossible dans ce statut' });

    const fields  = [];
    const values  = [];
    let   idx     = 1;

    const mapping = {
      titre:       'titre',
      description: 'description',
      budget:      'budget',
      priorite:    'priorite',
      dateDebut:   'date_debut',
      dateFin:     'date_fin',
    };

    for (const [jsonKey, dbCol] of Object.entries(mapping)) {
      if (req.body[jsonKey] !== undefined) {
        fields.push(`${dbCol} = $${idx++}`);
        values.push(jsonKey === 'budget' ? parseFloat(req.body[jsonKey]) : req.body[jsonKey]);
      }
    }

    if (fields.length === 0) return res.status(400).json({ erreur: 'Aucun champ à modifier' });

    fields.push(`modifie_le = NOW()`);
    values.push(parseInt(req.params.id));

    const { rows: updated } = await db.query(
      `UPDATE missions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    res.json({ message: 'Mission mise à jour', mission: mapMission(updated[0]) });
  } catch (err) {
    console.error('Erreur PUT /missions/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.put('/missions/:id/assigner', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM missions WHERE id = $1', [parseInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Mission introuvable' });
    const mission = mapMission(rows[0]);

    const { artisanId } = req.body;
    if (!artisanId) return res.status(400).json({ erreur: 'artisanId requis' });

    const { rows: ar } = await db.query("SELECT id, nom, email, role FROM users WHERE id = $1 AND role = 'artisan'", [parseInt(artisanId)]);
    if (!ar[0]) return res.status(400).json({ erreur: `Aucun artisan avec l'id ${artisanId}` });
    if (['terminee', 'annulee'].includes(mission.statut)) return res.status(400).json({ erreur: "Impossible d'assigner dans ce statut" });

    const { rows: updated } = await db.query(
      "UPDATE missions SET artisan_id = $1, statut = 'assignee', modifie_le = NOW() WHERE id = $2 RETURNING *",
      [parseInt(artisanId), parseInt(req.params.id)]
    );

    res.json({ message: `Mission assignée à ${ar[0].nom}`, mission: mapMission(updated[0]), artisan: ar[0] });
  } catch (err) {
    console.error('Erreur PUT /missions/:id/assigner :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.put('/missions/:id/statut', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM missions WHERE id = $1', [parseInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Mission introuvable' });
    const mission = mapMission(rows[0]);

    const { statut } = req.body;
    const statutsValides = ['en_attente', 'assignee', 'en_cours', 'terminee', 'annulee'];
    if (!statut || !statutsValides.includes(statut)) return res.status(400).json({ erreur: 'Statut invalide', statuts_valides: statutsValides });

    const role = req.user.role;
    if (role === 'artisan') {
      if (mission.artisanId !== req.user.id) return res.status(403).json({ erreur: 'Mission non assignée' });
      if (!['en_cours', 'terminee'].includes(statut)) return res.status(403).json({ erreur: 'Artisan peut passer en : en_cours, terminee' });
    } else if (role === 'client') {
      if (mission.clientId !== req.user.id) return res.status(403).json({ erreur: 'Accès refusé' });
      if (statut !== 'annulee' || mission.statut !== 'en_attente') return res.status(403).json({ erreur: 'Client peut seulement annuler une mission en_attente' });
    }

    const { rows: updated } = await db.query(
      'UPDATE missions SET statut = $1, modifie_le = NOW() WHERE id = $2 RETURNING *',
      [statut, parseInt(req.params.id)]
    );

    res.json({ message: `Statut mis à jour : ${statut}`, mission: mapMission(updated[0]) });
  } catch (err) {
    console.error('Erreur PUT /missions/:id/statut :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.delete('/missions/:id', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query('DELETE FROM missions WHERE id = $1 RETURNING *', [parseInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Mission introuvable' });
    res.json({ message: 'Mission supprimée', mission: mapMission(rows[0]) });
  } catch (err) {
    console.error('Erreur DELETE /missions/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  ROUTES — ÉQUIPE & CLIENTS
// ============================================================

app.get('/artisans', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        u.id, u.nom, u.email, u.role, u.verified, u.statut_verification, u.statut_validation,
        u.motif_rejet, u.valide_le, u.telephone, u.metier, u.siret, u.adresse, u.ville,
        u.experience, u.description, u.documents, u.documents_soumis, u.suspendu, u.suspendu_le, u.cree_le,
        COUNT(m.id)                                                         AS missions_total,
        COUNT(m.id) FILTER (WHERE m.statut = 'en_cours')                   AS missions_en_cours,
        BOOL_OR(m.statut IN ('assignee','en_cours'))                        AS non_disponible
      FROM users u
      LEFT JOIN missions m ON m.artisan_id = u.id
      WHERE u.role = 'artisan'
      GROUP BY u.id
    `);

    const artisans = rows.map(r => ({
      ...mapUser(r),
      missions_total:    parseInt(r.missions_total) || 0,
      missions_en_cours: parseInt(r.missions_en_cours) || 0,
      disponible:        !r.non_disponible,
    }));

    res.json({ total: artisans.length, artisans });
  } catch (err) {
    console.error('Erreur GET /artisans :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.get('/artisans/:id/missions', authenticateToken, async (req, res) => {
  try {
    const artisanId = parseInt(req.params.id);
    const { rows: ar } = await db.query("SELECT id, nom, email, role, metier FROM users WHERE id = $1 AND role = 'artisan'", [artisanId]);
    if (!ar[0]) return res.status(404).json({ erreur: 'Artisan introuvable' });
    if (req.user.role === 'artisan' && req.user.id !== artisanId) return res.status(403).json({ erreur: 'Accès refusé' });

    const { rows: missions } = await db.query('SELECT * FROM missions WHERE artisan_id = $1', [artisanId]);
    res.json({ artisan: ar[0], total: missions.length, missions: missions.map(mapMission) });
  } catch (err) {
    console.error('Erreur GET /artisans/:id/missions :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.get('/clients', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        u.id, u.nom, u.email, u.role, u.telephone, u.adresse, u.ville, u.cree_le,
        COUNT(m.id)                                              AS missions_total,
        COALESCE(SUM(m.budget),0)                               AS budget_total
      FROM users u
      LEFT JOIN missions m ON m.client_id = u.id
      WHERE u.role = 'client'
      GROUP BY u.id
    `);

    const clients = rows.map(r => ({
      id:            r.id,
      nom:           r.nom,
      email:         r.email,
      role:          r.role,
      telephone:     r.telephone,
      adresse:       r.adresse,
      ville:         r.ville,
      creeLe:        r.cree_le,
      missions_total: parseInt(r.missions_total) || 0,
      budget_total:   parseFloat(r.budget_total) || 0,
    }));

    res.json({ total: clients.length, clients });
  } catch (err) {
    console.error('Erreur GET /clients :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  ROUTES — ERP
// ============================================================

app.get('/erp/rapport', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows: missionRows } = await db.query('SELECT statut FROM missions');

    // Agrégation des finances depuis les factures
    const { rows: facAgg } = await db.query(`
      SELECT
        COUNT(*)                                                        AS emises,
        COUNT(*) FILTER (WHERE statut = 'payée')                       AS payees,
        COUNT(*) FILTER (WHERE statut = 'en_attente')                  AS en_attente,
        COALESCE(SUM(montant_ttc) FILTER (WHERE statut = 'en_attente'),0) AS montant_en_attente,
        COALESCE(SUM(montant_ttc) FILTER (WHERE statut = 'payée'),0)   AS ca_total
      FROM factures
    `);
    const { rows: depAgg } = await db.query("SELECT COALESCE(SUM(montant),0) AS total FROM depenses WHERE statut = 'validée'");

    const facRow = facAgg[0] || {};
    const caTotal = parseFloat(facRow.ca_total) || 0;
    const charges  = parseFloat(depAgg[0]?.total) || 0;

    // Documents récents : devis + factures
    const { rows: docRows } = await db.query(`
      SELECT id, numero AS nom, 'devis' AS type, cree_le AS date, montant_ttc AS montant FROM devis
      UNION ALL
      SELECT id, numero AS nom, 'facture' AS type, cree_le AS date, montant_ttc AS montant FROM factures
      ORDER BY date DESC
      LIMIT 10
    `);

    res.json({
      rapport: 'ERP Complet',
      date_rapport: new Date().toISOString(),
      finances: {
        chiffreAffaireAnnuel: caTotal,
        chargesAnnuelles:     charges,
        beneficeNet:          caTotal - charges,
        factures: {
          emises:            parseInt(facRow.emises) || 0,
          payees:            parseInt(facRow.payees) || 0,
          en_attente:        parseInt(facRow.en_attente) || 0,
          montant_en_attente: parseFloat(facRow.montant_en_attente) || 0,
        },
      },
      missions: {
        total: missionRows.length,
        par_statut: {
          en_attente: missionRows.filter(m => m.statut === 'en_attente').length,
          assignees:  missionRows.filter(m => m.statut === 'assignee').length,
          en_cours:   missionRows.filter(m => m.statut === 'en_cours').length,
          terminees:  missionRows.filter(m => m.statut === 'terminee').length,
        },
      },
      documents: { total: docRows.length, liste: docRows },
    });
  } catch (err) {
    console.error('Erreur GET /erp/rapport :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.get('/erp/stats', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows: mStats } = await db.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE statut IN ('assignee','en_cours')) AS actives FROM missions");
    const { rows: uStats } = await db.query("SELECT COUNT(*) FILTER (WHERE role='artisan') AS artisans, COUNT(*) FILTER (WHERE role='client') AS clients FROM users");
    const { rows: facAgg } = await db.query("SELECT COALESCE(SUM(montant_ttc) FILTER (WHERE statut='payée'),0) AS ca FROM factures");

    res.json({
      missions:   { total: parseInt(mStats[0].total) || 0, actives: parseInt(mStats[0].actives) || 0 },
      artisans:   { total: parseInt(uStats[0].artisans) || 0 },
      clients:    { total: parseInt(uStats[0].clients) || 0 },
      ca_annuel:  parseFloat(facAgg[0].ca) || 0,
      tresorerie: null,
    });
  } catch (err) {
    console.error('Erreur GET /erp/stats :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  ADMIN — VALIDATION ARTISANS
// ============================================================

app.get('/admin/artisans-en-attente', authenticateToken, authorizeRole('super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, nom, email, role, verified, statut_verification, statut_validation, motif_rejet, telephone, metier, siret, documents, documents_soumis, cree_le FROM users WHERE (role = 'artisan' OR role = 'patron') AND verified = false"
    );
    res.json({ total: rows.length, artisans: rows.map(mapUser) });
  } catch (err) {
    console.error('Erreur GET /admin/artisans-en-attente :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.put('/admin/valider-artisan/:id', authenticateToken, authorizeRole('super_admin'), async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT id FROM users WHERE id = $1', [parseInt(req.params.id)]);
    if (!existing[0]) return res.status(404).json({ erreur: 'Utilisateur introuvable' });

    const { decision, motif } = req.body;
    if (!['valide', 'rejete'].includes(decision)) return res.status(400).json({ erreur: 'decision: valide ou rejete' });

    const { rows: updated } = await db.query(
      `UPDATE users
       SET verified = $1, statut_validation = $2, motif_rejet = $3, valide_le = NOW()
       WHERE id = $4
       RETURNING id, nom, email, role, verified, statut_validation, motif_rejet, valide_le`,
      [decision === 'valide', decision, motif || null, parseInt(req.params.id)]
    );

    res.json({ message: `Compte ${decision === 'valide' ? 'validé' : 'rejeté'}`, user: mapUser(updated[0]) });
  } catch (err) {
    console.error('Erreur PUT /admin/valider-artisan/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.put('/admin/suspendre/:id', authenticateToken, authorizeRole('super_admin'), async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT id, suspendu FROM users WHERE id = $1', [parseInt(req.params.id)]);
    if (!existing[0]) return res.status(404).json({ erreur: 'Utilisateur introuvable' });

    const currentlySuspendu = existing[0].suspendu;
    const newSuspendu       = !currentlySuspendu;

    const { rows: updated } = await db.query(
      `UPDATE users
       SET suspendu = $1, suspendu_le = $2
       WHERE id = $3
       RETURNING id, nom, email, role, suspendu, suspendu_le`,
      [newSuspendu, newSuspendu ? new Date() : null, parseInt(req.params.id)]
    );

    res.json({ message: `Compte ${newSuspendu ? 'suspendu' : 'réactivé'}`, user: mapUser(updated[0]) });
  } catch (err) {
    console.error('Erreur PUT /admin/suspendre/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  MONTAGE DES MODULES
// ============================================================

app.use('/finance',       financeRoutes);
app.use('/rh',            rhRoutes);
app.use('/qse',           qseRoutes);
app.use('/urssaf',        urssafRoutes);
app.use('/client',  authenticateToken, clientRoutes);
app.use('/patron',  authenticateToken, patronRoutes);
app.use('/artisan', authenticateToken, artisanRoutes);
app.use('/notifications', notificationsRoutes);

// ============================================================
//  ROUTE — AIDE
// ============================================================

app.get('/', (req, res) => {
  res.json({
    api: 'Application Artisans — Backend Complet',
    version: '4.0.0',
    modules: {
      auth:          ['POST /login', 'POST /register', 'POST /forgot-password', 'POST /reset-password'],
      dashboards:    ['GET /dashboard/client', '/dashboard/artisan', '/dashboard/patron', '/dashboard/admin'],
      missions:      ['GET/POST /missions', 'PUT /missions/:id', '/missions/:id/assigner', '/missions/:id/statut', 'DELETE /missions/:id'],
      equipe:        ['GET /artisans', '/artisans/:id/missions', '/clients'],
      erp:           ['GET /erp/rapport', '/erp/stats'],
      finance:       ['GET/POST /finance/devis', '/finance/factures', '/finance/salaires', '/finance/tableau-de-bord'],
      rh:            ['GET /rh/employes', '/rh/planning', '/rh/conges', '/rh/notes-frais', '/rh/tableau-de-bord'],
      qse:           ['GET /qse/habilitations', '/qse/documents', '/qse/epi', 'POST /qse/verifier-assignation'],
      urssaf:        ['POST /urssaf/simuler', 'GET /urssaf/historique', '/urssaf/alertes', '/urssaf/recapitulatif'],
      client:        ['GET /client/artisans', 'POST /client/notations', '/client/litiges', '/client/parrainage'],
      notifications: ['GET /notifications', 'PUT /notifications/:id/lire', 'POST /notifications/envoyer'],
      admin:         ['GET /admin/artisans-en-attente', 'PUT /admin/valider-artisan/:id', '/admin/suspendre/:id'],
    },
    comptes_demo: [
      { role: 'client',      email: 'client@demo.com',   motdepasse: 'client123'  },
      { role: 'artisan',     email: 'artisan@demo.com',  motdepasse: 'artisan123' },
      { role: 'patron',      email: 'patron@demo.com',   motdepasse: 'patron123'  },
      { role: 'super_admin', email: 'admin@demo.com',    motdepasse: 'admin123'   },
    ],
  });
});

// ============================================================
//  DÉMARRAGE
// ============================================================

db.testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`\nServeur démarré sur http://localhost:${PORT}`);
    console.log(`Documentation : GET http://localhost:${PORT}/\n`);
    console.log('Modules actifs : Auth, Missions, Finance, RH, QSE, URSSAF, Notifications, Client, Admin\n');
  });
});
