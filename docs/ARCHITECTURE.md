# Architecture — Application Artisans

## Vue d'ensemble

Application mobile et web de **mise en relation clients / artisans** avec un **ERP de gestion d'entreprise intégré**.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTS / UTILISATEURS                    │
├─────────────┬────────────────┬───────────────┬──────────────┤
│   Client    │ Patron Artisan │ Artisan Salarié│  Super Admin │
│  (mobile +  │  (mobile + web)│   (mobile)    │   (web only) │
│    web)     │                │               │              │
└──────┬──────┴────────┬───────┴───────┬───────┴──────┬───────┘
       │               │               │              │
       ▼               ▼               ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND                                  │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │   React Native (Expo)   │  │     React.js + Vite      │  │
│  │   iOS + Android         │  │     Tailwind CSS         │  │
│  │   frontend_mobile/      │  │     frontend_web/        │  │
│  └────────────┬────────────┘  └────────────┬─────────────┘  │
└───────────────┼────────────────────────────┼────────────────┘
                │           HTTPS/REST        │
                ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  server.js — Point d'entrée principal                │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Routes :                                            │   │
│  │  /auth        → Authentification JWT                 │   │
│  │  /missions    → Gestion des chantiers                │   │
│  │  /finance     → Devis, Factures, Salaires            │   │
│  │  /rh          → Employés, Planning, Congés           │   │
│  │  /qse         → Habilitations, Documents sécurité   │   │
│  │  /urssaf      → Cotisations, Simulateur              │   │
│  │  /client      → Recherche artisans, Litiges          │   │
│  │  /notifications → Push, Email, SMS                  │   │
│  │  /admin       → Validation, Suspension               │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────┬──────────────────────────────────────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌─────────────┐  ┌──────────────┐
│ PostgreSQL  │  │   Firebase   │
│  (données  │  │ (notifs temps │
│ structurées)│  │    réel)     │
└─────────────┘  └──────────────┘
```

## Structure des dossiers

```
Application_Artisans/
├── backend/                    # API Node.js/Express
│   ├── server.js               # Point d'entrée, routes principales
│   ├── routes/
│   │   ├── financeRoutes.js    # Devis, factures, salaires
│   │   ├── rhRoutes.js         # RH : employés, planning, congés
│   │   ├── qseRoutes.js        # QSE : habilitations, EPI
│   │   ├── urssafRoutes.js     # URSSAF : cotisations, simulateur
│   │   ├── clientRoutes.js     # Client : recherche, litiges, notations
│   │   └── notificationsRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── users.js
│   └── .env.example
│
├── frontend_web/               # Dashboard React.js
│   ├── src/
│   │   ├── App.jsx             # Router principal
│   │   ├── context/AuthContext.jsx
│   │   ├── services/api.js     # Axios instance
│   │   ├── components/layout/Layout.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── client/Dashboard.jsx
│   │       ├── patron/
│   │       │   ├── Dashboard.jsx
│   │       │   ├── Finance.jsx
│   │       │   ├── RH.jsx
│   │       │   ├── QSE.jsx
│   │       │   └── URSSAF.jsx
│   │       ├── admin/Dashboard.jsx
│   │       └── shared/Missions.jsx
│   └── index.html
│
├── frontend_mobile/            # App React Native (Expo)
│   ├── App.js                  # Navigation principale
│   └── src/
│       ├── services/api.js
│       └── screens/
│           ├── auth/LoginScreen.js
│           ├── client/
│           │   ├── DashboardScreen.js
│           │   ├── NouvelleMission.js
│           │   ├── RechercheArtisans.js
│           │   └── SuiviMission.js
│           ├── patron/
│           │   ├── DashboardScreen.js
│           │   └── MissionsScreen.js
│           ├── artisan/
│           │   ├── DashboardScreen.js
│           │   └── PointageScreen.js
│           └── admin/DashboardScreen.js
│
└── database/
    └── migrations/
        ├── 001_initial_schema.sql   # Schéma complet PostgreSQL
        └── 002_seed_demo.sql        # Données démo
```

## Flux d'authentification

```
1. POST /login { email, motdepasse }
2. Backend vérifie bcrypt
3. Génère JWT (expires 8h)
4. Client stocke le token (AsyncStorage mobile / localStorage web)
5. Chaque requête : Header "Authorization: Bearer <token>"
6. Middleware authenticateToken vérifie + injecte req.user
7. Middleware authorizeRole vérifie le rôle
```

## Flux d'une mission

```
Client crée mission → Patron reçoit → Patron assigne artisan
→ Artisan arrive sur chantier (pointage) → Artisan termine
→ Client valide → Paiement → Notation
```

## Sécurité

- JWT avec expiration 8h
- Mots de passe hashés avec bcrypt (coût 10)
- CORS configuré
- Validation des rôles sur chaque route
- Variables d'environnement pour les secrets
- En production : AES-256 pour les données sensibles, HTTPS obligatoire
