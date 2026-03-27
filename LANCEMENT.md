# Guide de déploiement — Application Artisans

## Prérequis
- Node.js 20+
- PostgreSQL 14+
- Docker (optionnel)

---

## Déploiement local (sans Docker)

### 1. Base de données PostgreSQL
```bash
# Créer la base de données
psql -U postgres -c "CREATE DATABASE artisans_db;"

# Créer le schéma et les tables
psql -U postgres -d artisans_db -f backend/schema.sql
```

### 2. Backend
```bash
cd backend

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (DB, JWT_SECRET, etc.)

# Installer les dépendances
npm install

# Insérer les données démo
npm run seed

# Lancer le serveur
npm start
# → http://localhost:3000
```

### 3. Frontend Web
```bash
cd frontend_web

# Copier et configurer
cp .env .env.local
# Vérifier VITE_API_URL=http://localhost:3000

# Installer et lancer en dev
npm install
npm run dev
# → http://localhost:5173

# Ou build de production
npm run build
npm run preview
```

### 4. Application Mobile (Expo)
```bash
cd frontend_mobile

# Configurer l'URL du backend
# Éditer .env : EXPO_PUBLIC_API_URL=http://VOTRE_IP:3000

npm install
npx expo start
```

---

## Déploiement avec Docker (recommandé)

```bash
# Lancer tout en une commande
docker-compose up -d

# La première fois, seeder la base de données :
docker exec artisans_backend node seed.js

# Accès :
# Frontend : http://localhost:80
# Backend API : http://localhost:3000
# PostgreSQL : localhost:5432
```

---

## Déploiement en production

### Backend → Railway / Render / Heroku
1. Créer un service Node.js
2. Ajouter les variables d'environnement du `.env.example`
3. Connecter une base PostgreSQL (Railway fournit PostgreSQL intégré)
4. Le `railway.toml` ou `Procfile` configure le démarrage automatiquement
5. Après le premier déploiement, lancer `node seed.js` une seule fois

### Frontend Web → Vercel / Netlify
1. Build command : `npm run build`
2. Output directory : `dist`
3. Variable d'environnement : `VITE_API_URL=https://votre-backend.railway.app`

### Application Mobile → Expo EAS Build
```bash
cd frontend_mobile
# Configurer .env.production avec l'URL du backend déployé
npx eas build --platform all
```

---

## Comptes démo (après seed)

| Rôle        | Email               | Mot de passe  |
|-------------|---------------------|---------------|
| Client      | client@demo.com     | client123     |
| Patron/ERP  | patron@demo.com     | patron123     |
| Artisan     | artisan@demo.com    | artisan123    |
| Super Admin | admin@demo.com      | admin123      |

---

## Architecture

```
application_artisans/
├── backend/          # API Node.js + Express + PostgreSQL
├── frontend_web/     # Dashboard web React.js + Tailwind
├── frontend_mobile/  # App mobile React Native + Expo
├── database/         # Schémas et migrations
├── docker-compose.yml
└── LANCEMENT.md      # Ce fichier
```

## Endpoints API principaux

- `POST /login` — Authentification
- `POST /register` — Inscription
- `GET /dashboard/:role` — Dashboard (client/artisan/patron/admin)
- `GET /missions` — Liste des missions
- `GET /finance/tableau-de-bord` — Tableau de bord financier
- `GET /rh/tableau-de-bord` — Tableau de bord RH
- `GET /qse/tableau-de-bord` — Tableau de bord QSE
- `GET /patron/chantiers` — Chantiers en cours
- `GET /notifications` — Notifications utilisateur
