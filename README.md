# Freample

Plateforme multi-services francaise : mise en relation artisans/clients (BTP), montage video (Com), gestion immobiliere (Immo), services juridiques (Droit) et beaute (Coiffure).

---

## Structure du projet

```
application_artisans/
├── frontend_web/          # Application web React (Vite + Tailwind)
├── frontend_mobile/       # Application mobile React Native (Expo)
├── backend/               # API REST Node.js / Express / PostgreSQL
├── database/              # Scripts SQL, migrations
├── docs/                  # Documentation
├── logos/                 # Assets graphiques
├── vercel.json            # Configuration deploiement Vercel
└── README.md
```

---

## Stack technique

| Couche     | Technologies                                      |
|------------|---------------------------------------------------|
| Frontend   | React 18, Vite 5, Tailwind CSS 3, React Router 6 |
| Backend    | Node.js, Express 5, PostgreSQL, JWT, Helmet       |
| Mobile     | React Native, Expo                                |
| Paiements  | Stripe, PayPal                                    |
| Emails     | Resend, Nodemailer                                |
| SMS        | Twilio                                            |
| Signature  | YouSign                                           |
| Deploy     | Vercel (frontend), backend TBD                    |

---

## Installation et developpement

### Pre-requis

- Node.js >= 18
- PostgreSQL >= 14
- npm

### Frontend web

```bash
cd frontend_web
npm install
# Creer .env avec VITE_API_URL=http://localhost:3000
npm run dev
```

Le serveur Vite demarre sur http://localhost:5173.

Le compte dev freamplecom@gmail.com (mot de passe quelconque) fonctionne sans backend pour acceder a Freample Immo Demo.

### Backend

```bash
cd backend
npm install
cp .env.example .env   # renseigner les variables
npm start
```

Le serveur Express demarre sur le port configure dans .env (defaut : 3000).

---

## Architecture frontend

```
frontend_web/src/
├── App.jsx               # Routeur principal (React Router)
├── main.jsx              # Point d'entree
├── pages/                # Pages organisees par role
│   ├── public/           #   Pages publiques (landing, demos)
│   ├── client/           #   Espace client
│   ├── patron/           #   Espace patron / gerant
│   ├── artisan/          #   Espace artisan
│   ├── admin/            #   Espace administrateur
│   └── shared/           #   Pages partagees entre roles
├── components/
│   ├── immo/             #   16 modules Freample Immo
│   ├── layout/           #   Layout, Sidebar
│   ├── public/           #   Composants publics (Navbar)
│   ├── qse/              #   Composants QSE
│   └── ui/               #   Icons
├── services/
│   └── api.js            # Instance Axios centralisee (API_URL unique)
├── context/              # AuthContext, ToastContext
├── design/
│   └── luxe.js           # Design tokens (source unique)
└── utils/                # Fonctions utilitaires
```

---

## Modules Freample Immo

Les 16 modules du vertical immobilier (components/immo/) :

| Module               | Description                                    |
|----------------------|------------------------------------------------|
| CRMModule            | CRM contacts, RGPD, import, celebrations       |
| ProspectionModule    | Terrain, phoning, secteurs, immeubles, geoloc  |
| PigeModule           | Veille annonces marche, baisses de prix        |
| EstimationModule     | Estimation comparative, rapports, relances      |
| MandatsModule        | Mandats, registre Hoguet, delegation           |
| MultidiffusionModule | Diffusion portails, stats budget/CA            |
| AcquereursModule     | Fiches acquereurs, matching, mandats recherche |
| VisitesModule        | Planning visites, bons, comptes rendus         |
| VentesModule         | Pipeline 8 etapes, offres, compromis           |
| ContratsModule       | 56 modeles, signature eIDAS, registres         |
| CampagnesModule      | Email/SMS/courrier, 23 modeles, ciblage        |
| AutomationsModule    | 33 workflows automatiques, journal             |
| AgendaImmoModule     | Agenda semaine, 6 types evenements             |
| ClesModule           | Tableau cles, sorties/retours                  |
| SiteWebModule        | Site agence, SEO, analytics                    |
| ParametresModule     | Bareme, parrainage, multi-agences              |

---

## Variables d'environnement

### Frontend (frontend_web/.env)

| Variable       | Description                                            |
|----------------|--------------------------------------------------------|
| VITE_API_URL   | URL de base de l'API backend (http://localhost:3000)   |

### Backend (backend/.env)

| Variable         | Description                        |
|------------------|------------------------------------|
| PORT             | Port du serveur Express            |
| DATABASE_URL     | URL de connexion PostgreSQL        |
| JWT_SECRET       | Cle secrete JWT                    |
| CORS_ORIGINS     | Origines autorisees (CSV)          |
| RESEND_API_KEY   | Cle API Resend (emails)            |
| TWILIO_*         | Config Twilio (SMS)                |
| STRIPE_*         | Config Stripe (paiements)          |
| YOUSIGN_*        | Config YouSign (signature)         |

---

## Deploiement

Le frontend est deploye automatiquement sur Vercel a chaque push sur main.

Configuration (vercel.json) :
- Build : cd frontend_web && npm install && npm run build
- Output : frontend_web/dist
- Framework : Vite
- SPA rewrites vers index.html

Le backend est a deployer separement (Render, Railway, ou Vercel Functions).
