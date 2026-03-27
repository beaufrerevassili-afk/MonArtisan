# Guide de lancement — Application Artisans

## Prérequis

- Node.js >= 18.0.0
- npm ou yarn
- (Production) PostgreSQL 15+

---

## 1. Lancer le Backend

```bash
cd backend
npm install
node server.js
```

Le serveur démarre sur **http://localhost:3000**

Documentation des routes disponible sur : `GET http://localhost:3000/`

### Comptes de démonstration

| Rôle        | Email                  | Mot de passe |
|-------------|------------------------|--------------|
| Client      | client@demo.com        | client123    |
| Patron      | patron@demo.com        | patron123    |
| Artisan     | artisan@demo.com       | artisan123   |
| Super Admin | admin@demo.com         | admin123     |

---

## 2. Lancer le Frontend Web

```bash
cd frontend_web
npm install
npm run dev
```

Dashboard disponible sur **http://localhost:3001**

---

## 3. Lancer l'App Mobile

```bash
cd frontend_mobile
npm install
npx expo start
```

- Scanner le QR code avec l'app **Expo Go** (iOS/Android)
- Ou lancer sur simulateur : `npx expo start --ios` / `--android`

> **Important** : Modifier l'URL de l'API dans `frontend_mobile/src/services/api.js`
> Remplacer `localhost` par l'IP de votre machine sur le réseau local
> Ex: `http://192.168.1.100:3000`

---

## 4. Base de données PostgreSQL (Production)

```bash
# Créer la base
createdb artisans_db

# Appliquer les migrations
psql artisans_db < database/migrations/001_initial_schema.sql
psql artisans_db < database/migrations/002_seed_demo.sql
```

Configurer les variables d'environnement dans `backend/.env` :
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artisans_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
```

---

## API — Exemples de requêtes

### Connexion
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patron@demo.com","motdepasse":"patron123"}'
```

### Dashboard patron (avec token)
```bash
curl http://localhost:3000/dashboard/patron \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Créer une mission
```bash
curl -X POST http://localhost:3000/missions \
  -H "Authorization: Bearer TOKEN_CLIENT" \
  -H "Content-Type: application/json" \
  -d '{"titre":"Fuite robinet","description":"Robinet cuisine","budget":200,"categorie":"Plomberie"}'
```

### Simulateur URSSAF
```bash
curl -X POST http://localhost:3000/urssaf/simuler \
  -H "Authorization: Bearer TOKEN_PATRON" \
  -H "Content-Type: application/json" \
  -d '{"ca":50000,"regime":"reel","nbSalaries":3}'
```

### Vérifier les habilitations QSE
```bash
curl -X POST http://localhost:3000/qse/verifier-assignation \
  -H "Authorization: Bearer TOKEN_PATRON" \
  -H "Content-Type: application/json" \
  -d '{"employeId":1,"competencesRequises":["BR","Travail en hauteur"]}'
```
