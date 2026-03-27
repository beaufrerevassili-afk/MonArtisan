const jwt = require('jsonwebtoken');

function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: "Token manquant" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Accès refusé" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: "Token invalide" });
    }
  };
}

module.exports = { authorizeRole };