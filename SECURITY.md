# Checklist sécurité Freample — avant déploiement production

Ce document liste les vérifications à faire **avant chaque déploiement production** pour éviter les erreurs de sécurité critiques identifiées lors de l'audit.

## ✅ Phase 1 — corrections appliquées (côté frontend)

- [x] **Tokens cryptographiques** : `crypto.getRandomValues()` via `utils/security.js` pour tous les magic links et signatures tokens (256 bits d'entropie).
- [x] **Hash mots de passe** : les comptes clients auto-créés utilisent SHA-256 (Web Crypto API) côté frontend. Le champ `motDePasse` en clair a été supprimé de `freample_clients_auto`.
- [x] **Expiration magic tokens** : 24h par défaut, vérifié dans `SetupCompte.jsx` et `AuthContext.loginWithMagicToken()`.
- [x] **Tokens one-time use** : un magic token consommé ne peut plus être réutilisé (`magicTokenUsed: true`).
- [x] **Migration silencieuse** : les anciens comptes avec `motDePasse` en clair sont migrés vers `motDePasseHash` lors de la première connexion.

## ⚠️ Phase 2 — à faire AVANT de déployer le backend

### Authentification routes patron (`backend/routes/patronRoutes.js`)

Actuellement 19 routes sont exposées sans `authenticateToken`. À ajouter sur chaque route :

```javascript
router.get('/devis-pro', authenticateToken, authorizeRole('patron'), async (req, res) => { ... });
```

Routes concernées : `/devis-pro`, `/chantiers`, `/pipeline`, `/alertes`, `/stock`, `/agenda`, `/avis` et leurs dérivées.

### Injection SQL (`modulesRoutes.js`, `immoRoutes.js`)

Le code fait actuellement `db.query(\`SELECT * FROM ${table} WHERE ...\`)` — utiliser une whitelist stricte :

```javascript
const ALLOWED_TABLES = ['incidents', 'non_conformites', 'bsdd', ...];
if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ erreur: 'Table invalide' });
```

### JWT_SECRET

- ✅ `backend/.env` est dans `.gitignore` (vérifié avec `git check-ignore`)
- ⚠️ **Régénérer une nouvelle clé** avant production :
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
  ```
- Utiliser uniquement les variables d'environnement Render/Railway — **jamais** le `.env` local.

### JWT expiration

Dans `backend/routes/authRoutes.js` ligne 54, passer de :
```javascript
{ expiresIn: '8h' }
```
à :
```javascript
{ expiresIn: '15m' }
// + implémenter refresh tokens (7 jours, HTTP-only cookie)
```

### Rate limiting

Ajouter sur les routes sensibles manquantes :
- `POST /reset-password` (3 tentatives / heure par email)
- `POST /patron/devis-pro/:id/signer` (3 tentatives / heure par IP)
- `POST /client/notations` (10 / heure)

### Rejet JWT signature `.dev` en production

Dans `middleware/auth.js`, si `NODE_ENV === 'production'`, rejeter tout JWT avec suffixe `.dev` :

```javascript
if (process.env.NODE_ENV === 'production' && token.endsWith('.dev')) {
  return res.status(401).json({ erreur: 'Token invalide' });
}
```

### Comptes demo

Dans `AuthContext.jsx` (frontend) et route `/login` (backend), désactiver les comptes démo en production :

```javascript
if (process.env.NODE_ENV === 'production') {
  // ne pas accepter les emails demo-* ou freamplecom@gmail.com
}
```

## 🔄 Phase 3 — hardening (post-déploiement)

- [ ] CSP stricte via Helmet (déjà partiellement configurée dans `server.js`)
- [ ] CSRF tokens sur toutes les mutations (POST/PUT/DELETE)
- [ ] Validation inputs avec Zod ou Joi sur toutes les routes
- [ ] Audit logging (winston + stockage externe)
- [ ] 2FA pour rôles `super_admin` et `fondateur`
- [ ] UUIDs v4 au lieu de `Date.now()` pour IDs sensibles
- [ ] Vérification email obligatoire avant activation compte
- [ ] Monitoring erreurs (Sentry ou équivalent)

## 📝 Variables d'environnement requises en production

À configurer sur Render / Railway / Vercel :

```env
NODE_ENV=production
JWT_SECRET=<généré avec crypto.randomBytes(48)>
DATABASE_URL=<neon.tech ou render postgres>
RESEND_API_KEY=<compte Resend avec domaine vérifié>
EMAIL_FROM=Freample <noreply@freample.com>
FRONTEND_URL=https://freample.com
CORS_ORIGINS=https://freample.com,https://www.freample.com
```

## 🔒 Ne JAMAIS commit

- `backend/.env` (ignoré mais attention)
- Mots de passe, clés API, IBAN, numéros de CB
- Dumps de base de données
- Fichiers d'uploads clients
