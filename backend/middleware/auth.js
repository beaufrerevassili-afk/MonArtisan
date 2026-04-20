// ============================================================
//  middleware/auth.js — JWT authentication & role authorization
// ============================================================

const jwt = require('jsonwebtoken');
const db = require('../db');
const SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = req.cookies?.token || (authHeader && authHeader.split(' ')[1]);
  if (!token) return res.status(401).json({ erreur: 'Token manquant' });
  jwt.verify(token, SECRET, async (err, user) => {
    if (err) return res.status(403).json({ erreur: 'Token invalide ou expiré' });
    // Vérifier si le compte est suspendu
    try {
      const { rows } = await db.query('SELECT suspendu FROM users WHERE id = $1', [user.id]);
      if (rows[0]?.suspendu) return res.status(403).json({ erreur: 'Compte suspendu' });
    } catch (e) { console.error('Auth DB check:', e.message); }
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

module.exports = { authenticateToken, authorizeRole };
