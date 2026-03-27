const bcrypt = require('bcrypt');

let users = []; // stocke les comptes demo

function initDemoUsers() {
  const demoUsers = [
    { email: "client@test.com", password: "1234", role: "Client" },
    { email: "patron@test.com", password: "1234", role: "Patron" },
    { email: "artisan@test.com", password: "1234", role: "Artisan" },
    { email: "admin@test.com", password: "1234", role: "Super Admin" },
  ];

  demoUsers.forEach(u => {
    const hashed = bcrypt.hashSync(u.password, 10);
    users.push({ email: u.email, password: hashed, role: u.role });
  });
}

function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

module.exports = { initDemoUsers, findUserByEmail };
