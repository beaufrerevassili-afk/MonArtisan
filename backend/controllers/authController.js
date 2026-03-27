const { findUserByEmail } = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function login(req, res) {
  const { email, password } = req.body;
  const user = findUserByEmail(email);
  if (!user) return res.status(400).json({ success: false, message: "Utilisateur introuvable" });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ success: false, message: "Mot de passe incorrect" });
  }

  const token = jwt.sign({ email: user.email, role: user.role }, "SECRET_KEY", { expiresIn: "1h" });
  res.json({ success: true, role: user.role, token });
}

module.exports = { login };
