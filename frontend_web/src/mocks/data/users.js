// Demo users — credentials visible in Login.jsx demo buttons
export const DEMO_USERS = [
  { id: 1, nom: 'Alice Dupont',   email: 'client@demo.com',  motdepasse: 'client123',  role: 'client'      },
  { id: 2, nom: 'Bernard Martin', email: 'patron@demo.com',  motdepasse: 'patron123',  role: 'patron'      },
  { id: 3, nom: 'Carlos Garcia',  email: 'artisan@demo.com', motdepasse: 'artisan123', role: 'artisan'     },
  { id: 4, nom: 'Diana Prince',   email: 'admin@demo.com',   motdepasse: 'admin123',   role: 'super_admin' },
  { id: 5, nom: 'Vassili Beaufrere', email: 'beaufrere.vassili@gmail.com', motdepasse: 'Val23222', role: 'fondateur' },
];

// AuthContext decodes with JSON.parse(atob(token.split('.')[1]))
// so the middle segment must be standard btoa JSON
export function makeToken(user) {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id:    user.id,
    nom:   user.nom,
    email: user.email,
    role:  user.role,
    exp:   Math.floor(Date.now() / 1000) + 86400 * 30,
  }));
  return `${header}.${payload}.demo_sig`;
}
