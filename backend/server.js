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

const { authenticateToken } = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globaux ────────────────────────────────────

app.set('trust proxy', 1);

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow all Vercel preview URLs + configured origins
    if (origin.endsWith('.vercel.app') || origin.includes('localhost') || allowedOrigins.includes(origin)) {
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

// ─── Démarrage ──────────────────────────────────────────────

db.testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`\nServeur démarré sur http://localhost:${PORT}`);
    console.log(`Documentation : GET http://localhost:${PORT}/\n`);
  });
});
