// ============================================================
//  server.js  –  Backend Node.js Express – Application Artisans
//  Config, middlewares globaux, montage des routes
// ============================================================

require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET non défini dans .env — démarrage annulé.');
  process.exit(1);
}

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const db           = require('./db');

// ─── Routes ────────────────────────────────────────────────
const authRoutes          = require('./routes/authRoutes');
const dashboardRoutes     = require('./routes/dashboardRoutes');
const missionsRoutes      = require('./routes/missionsRoutes');
const erpRoutes           = require('./routes/erpRoutes');
const teamRoutes          = require('./routes/teamRoutes');
const adminRoutes         = require('./routes/adminRoutes');
const profilRoutes        = require('./routes/profilRoutes');
const financeRoutes       = require('./routes/financeRoutes');
const rhRoutes            = require('./routes/rhRoutes');
const qseRoutes           = require('./routes/qseRoutes');
const urssafRoutes        = require('./routes/urssafRoutes');
const clientRoutes        = require('./routes/clientRoutes');
const patronRoutes        = require('./routes/patronRoutes');
const artisanRoutes       = require('./routes/artisanRoutes');
const notificationsRoutes  = require('./routes/notificationsRoutes');
const recrutementRoutes    = require('./routes/recrutementRoutes');
const reservationsRoutes   = require('./routes/reservationsRoutes');
const comRoutes            = require('./routes/comRoutes');
const modulesRoutes        = require('./routes/modulesRoutes');
const immoRoutes           = require('./routes/immoRoutes');
const projetsRoutes        = require('./routes/projetsRoutes');
const calculRoutes         = require('./routes/calculRoutes');
const supportRoutes        = require('./routes/supportRoutes');
const marketplaceRoutes    = require('./routes/marketplaceRoutes');
const avisPassageRoutes    = require('./routes/avisPassageRoutes');
const messagerieRoutes     = require('./routes/messagerieRoutes');

const { authenticateToken } = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globaux ────────────────────────────────────

app.set('trust proxy', 1);

const allowedOrigins = [
  'https://mon-artisan-fawn.vercel.app',
  ...(process.env.CORS_ORIGINS?.split(',') || []),
];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // mobile apps, curl
    if ((origin.startsWith('http://localhost:') || origin.startsWith('http://localhost/')) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", ...(process.env.CORS_ORIGINS?.split(',') || [])],
      fontSrc:    ["'self'"],
      objectSrc:  ["'none'"],
      frameSrc:   ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cookieParser());
app.use(express.json({ limit: '500kb' }));

// ─── Montage des routes ─────────────────────────────────────

// Public (non authentifiées)
app.use('/',             require('./routes/publicRoutes'));
app.use('/',             authRoutes);
app.use('/recrutement',  recrutementRoutes); // routes publiques + patron intégrées
app.use('/reservations', reservationsRoutes); // réservations publiques sans compte
app.use('/com',          comRoutes);          // Freample Com (briefs publics + projets auth)

// Profil entreprise public (pas d'auth)
app.get('/entreprise/:id', async (req, res) => {
  try {
    const patronId = parseInt(req.params.id);
    const { rows: userRows } = await db.query('SELECT id, nom, ville, metier, photo_profil FROM users WHERE id = $1', [patronId]);
    if (!userRows[0]) return res.status(404).json({ erreur: 'Entreprise introuvable' });

    const { rows: profil } = await db.query('SELECT * FROM profil_entreprise WHERE patron_id = $1', [patronId]);
    const { rows: avis } = await db.query('SELECT id, client_nom, projet_titre, note, commentaire, reponse_patron, created_at FROM avis_clients WHERE patron_id = $1 ORDER BY created_at DESC', [patronId]);
    const noteMoyenne = avis.length > 0 ? Math.round(avis.reduce((s, a) => s + a.note, 0) / avis.length * 10) / 10 : null;

    const user = userRows[0];
    res.json({
      entreprise: { id: user.id, nom: user.nom, ville: user.ville, metier: user.metier, photoProfil: user.photo_profil },
      profil: profil[0] ? {
        description: profil[0].description, specialites: profil[0].specialites,
        zoneIntervention: profil[0].zone_intervention, certifications: profil[0].certifications,
        photos: profil[0].photos, anneeCreation: profil[0].annee_creation, effectif: profil[0].effectif
      } : null,
      avis: avis.map(a => ({ id: a.id, clientNom: a.client_nom, projetTitre: a.projet_titre, note: a.note, commentaire: a.commentaire, reponsePatron: a.reponse_patron, creeLe: a.created_at })),
      noteMoyenne,
      nbAvis: avis.length
    });
  } catch (err) {
    console.error('GET /entreprise/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

app.use('/modules',     authenticateToken, modulesRoutes);  // Incidents, NC, BSDD, Certifs, Audits, etc.

// Authentifiées
app.use('/dashboard',   dashboardRoutes);
app.use('/missions',    missionsRoutes);
app.use('/erp',         erpRoutes);        // /erp/rapport, /erp/stats
app.use('/',            teamRoutes);       // /artisans, /artisans/:id/missions, /clients
app.use('/admin',       adminRoutes);
app.use('/users',       profilRoutes);

// Modules ERP (auth appliquée au montage)
app.use('/finance',       authenticateToken, financeRoutes);
app.use('/rh',            authenticateToken, rhRoutes);
app.use('/qse',           authenticateToken, qseRoutes);
app.use('/urssaf',        authenticateToken, urssafRoutes);
app.use('/notifications', authenticateToken, notificationsRoutes);

// Modules par rôle
app.use('/client',  authenticateToken, clientRoutes);
app.use('/patron',  authenticateToken, patronRoutes);
app.use('/artisan', authenticateToken, artisanRoutes);
app.use('/immo',    authenticateToken, immoRoutes);
app.use('/projets', projetsRoutes);  // mix public + auth
app.use('/calcul',  calculRoutes);   // endpoints de calcul métier (public + auth)
app.use('/support', supportRoutes);  // tickets de support (public + fondateur)
app.use('/marketplace', marketplaceRoutes);  // messagerie projet + devis versionné + suivi patron
app.use('/avis-passage', avisPassageRoutes);  // avis de passage avec signature électronique
app.use('/messagerie',  messagerieRoutes);   // messagerie centralisée

// ─── Analytics (visites) ────────────────────────────────────
(async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS analytics_visits (
      id SERIAL PRIMARY KEY,
      page VARCHAR(255) NOT NULL,
      referrer TEXT,
      user_agent TEXT,
      ip VARCHAR(64),
      created_at TIMESTAMP DEFAULT NOW()
    )`);
  } catch(e) { console.log('analytics table:', e.message); }
})();

// Track visit (public, no auth)
app.post('/analytics/visit', (req, res) => {
  const { page } = req.body;
  if (!page) return res.status(400).json({ error:'page required' });
  const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';
  const ref = req.headers['referer'] || '';
  db.query('INSERT INTO analytics_visits (page, referrer, user_agent, ip) VALUES ($1,$2,$3,$4)', [page, ref, ua, ip]).catch(e => console.error('Analytics write failed:', e.message));
  res.json({ ok:true });
});

// Get stats (auth required)
app.get('/analytics/stats', authenticateToken, async (req, res) => {
  try {
    const total = await db.query('SELECT COUNT(*) as total FROM analytics_visits');
    const today = await db.query("SELECT COUNT(*) as total FROM analytics_visits WHERE created_at >= CURRENT_DATE");
    const week = await db.query("SELECT COUNT(*) as total FROM analytics_visits WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'");
    const month = await db.query("SELECT COUNT(*) as total FROM analytics_visits WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'");
    const byPage = await db.query("SELECT page, COUNT(*) as views FROM analytics_visits GROUP BY page ORDER BY views DESC LIMIT 20");
    const byDay = await db.query("SELECT DATE(created_at) as day, COUNT(*) as views FROM analytics_visits WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY day");
    res.json({
      total: parseInt(total.rows[0]?.total||0),
      today: parseInt(today.rows[0]?.total||0),
      week: parseInt(week.rows[0]?.total||0),
      month: parseInt(month.rows[0]?.total||0),
      byPage: byPage.rows,
      byDay: byDay.rows,
    });
  } catch(err) { res.status(500).json({ error:err.message }); }
});

// ─── Démarrage ──────────────────────────────────────────────

db.testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`\nServeur démarré sur http://localhost:${PORT}`);
    console.log(`Documentation : GET http://localhost:${PORT}/\n`);
  });
});

module.exports = app;
