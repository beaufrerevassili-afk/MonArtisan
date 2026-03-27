-- ============================================================
--  schema.sql — Application Artisans
--  Créer la base de données : psql -U postgres -d artisans_db -f schema.sql
-- ============================================================

-- Extension UUID (optionnel, pour futurs usages)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
--  UTILISATEURS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                   SERIAL PRIMARY KEY,
  nom                  VARCHAR(255) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  motdepasse           TEXT NOT NULL,
  role                 VARCHAR(50) NOT NULL DEFAULT 'client',
  verified             BOOLEAN DEFAULT false,
  statut_verification  VARCHAR(50),
  statut_validation    VARCHAR(50),
  motif_rejet          TEXT,
  valide_le            TIMESTAMPTZ,
  telephone            VARCHAR(20),
  metier               VARCHAR(100),
  siret                VARCHAR(30),
  adresse              TEXT,
  ville                VARCHAR(100),
  experience           VARCHAR(100),
  description          TEXT,
  documents            JSONB DEFAULT '{}',
  documents_soumis     INTEGER DEFAULT 0,
  suspendu             BOOLEAN DEFAULT false,
  suspendu_le          TIMESTAMPTZ,
  cree_le              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  MISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS missions (
  id          SERIAL PRIMARY KEY,
  titre       VARCHAR(255) NOT NULL,
  description TEXT,
  categorie   VARCHAR(100) DEFAULT 'Autres',
  urgence     VARCHAR(50) DEFAULT 'cette_semaine',
  photos      JSONB DEFAULT '[]',
  client_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  artisan_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  statut      VARCHAR(50) DEFAULT 'en_attente',
  priorite    VARCHAR(50) DEFAULT 'normale',
  date_debut  DATE,
  date_fin    DATE,
  budget      DECIMAL(12,2),
  cree_le     TIMESTAMPTZ DEFAULT NOW(),
  modifie_le  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  FINANCE — DEVIS
-- ============================================================
CREATE TABLE IF NOT EXISTS devis (
  id               SERIAL PRIMARY KEY,
  numero           VARCHAR(50) UNIQUE,
  client_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  mission_id       INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  lignes           JSONB NOT NULL DEFAULT '[]',
  montant_ht       DECIMAL(12,2),
  montant_tva      DECIMAL(12,2),
  montant_ttc      DECIMAL(12,2),
  acompte_percent  INTEGER DEFAULT 30,
  acompte_amount   DECIMAL(12,2),
  statut           VARCHAR(50) DEFAULT 'brouillon',
  validite_jours   INTEGER DEFAULT 30,
  date_expiration  DATE,
  signe_le         TIMESTAMPTZ,
  document_url     TEXT,
  cree_le          TIMESTAMPTZ DEFAULT NOW(),
  modifie_le       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  FINANCE — FACTURES
-- ============================================================
CREATE TABLE IF NOT EXISTS factures (
  id               SERIAL PRIMARY KEY,
  numero           VARCHAR(50) UNIQUE,
  devis_id         INTEGER REFERENCES devis(id) ON DELETE SET NULL,
  client_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  mission_id       INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  montant_ht       DECIMAL(12,2),
  montant_tva      DECIMAL(12,2),
  montant_ttc      DECIMAL(12,2),
  acompte_amount   DECIMAL(12,2),
  statut           VARCHAR(50) DEFAULT 'en_attente',
  date_echeance    DATE,
  payee_le         TIMESTAMPTZ,
  relances         INTEGER DEFAULT 0,
  derniere_relance TIMESTAMPTZ,
  cree_le          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  FINANCE — DÉPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS depenses (
  id          SERIAL PRIMARY KEY,
  montant     DECIMAL(12,2) NOT NULL,
  categorie   VARCHAR(100),
  description TEXT,
  mission_id  INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  statut      VARCHAR(50) DEFAULT 'validée',
  cree_le     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  FINANCE — SALAIRES VERSÉS
-- ============================================================
CREATE TABLE IF NOT EXISTS salaires (
  id             SERIAL PRIMARY KEY,
  employe_id     INTEGER,
  nom_employe    VARCHAR(255),
  mois           INTEGER,
  annee          INTEGER,
  salaire_base   DECIMAL(12,2),
  salaire_net    DECIMAL(12,2),
  statut         VARCHAR(50) DEFAULT 'payé',
  paye_le        TIMESTAMPTZ,
  fiche_paie_url TEXT,
  cree_le        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  RH — EMPLOYÉS
-- ============================================================
CREATE TABLE IF NOT EXISTS employes (
  id            SERIAL PRIMARY KEY,
  prenom        VARCHAR(100),
  nom           VARCHAR(100),
  poste         VARCHAR(100),
  email         VARCHAR(255),
  telephone     VARCHAR(20),
  date_entree   DATE,
  type_contrat  VARCHAR(20) DEFAULT 'CDI',
  salaire_base  DECIMAL(12,2),
  statut        VARCHAR(50) DEFAULT 'actif',
  adresse       TEXT,
  numero_secu   VARCHAR(50),
  cree_le       TIMESTAMPTZ DEFAULT NOW(),
  modifie_le    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  RH — PLANNING
-- ============================================================
CREATE TABLE IF NOT EXISTS planning (
  id          SERIAL PRIMARY KEY,
  employe_id  INTEGER REFERENCES employes(id) ON DELETE CASCADE,
  mission_id  INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  date        DATE NOT NULL,
  heure_debut TIME DEFAULT '08:00',
  heure_fin   TIME DEFAULT '17:00',
  type        VARCHAR(50) DEFAULT 'chantier',
  semaine     INTEGER,
  cree_le     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  RH — CONGÉS
-- ============================================================
CREATE TABLE IF NOT EXISTS conges (
  id          SERIAL PRIMARY KEY,
  employe_id  INTEGER REFERENCES employes(id) ON DELETE CASCADE,
  date_debut  DATE,
  date_fin    DATE,
  nb_jours    INTEGER,
  type        VARCHAR(50),
  motif       TEXT,
  statut      VARCHAR(50) DEFAULT 'en_attente',
  commentaire TEXT,
  cree_le     TIMESTAMPTZ DEFAULT NOW(),
  validee_le  TIMESTAMPTZ
);

-- ============================================================
--  RH — NOTES DE FRAIS
-- ============================================================
CREATE TABLE IF NOT EXISTS notes_frais (
  id               SERIAL PRIMARY KEY,
  employe_id       INTEGER REFERENCES employes(id) ON DELETE CASCADE,
  montant          DECIMAL(12,2),
  categorie        VARCHAR(100),
  description      TEXT,
  mission_id       INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  statut           VARCHAR(50) DEFAULT 'en_attente',
  justificatif_url TEXT,
  bulletin_id      VARCHAR(50),
  inclus           BOOLEAN DEFAULT false,
  cree_le          TIMESTAMPTZ DEFAULT NOW(),
  validee_le       TIMESTAMPTZ
);

-- ============================================================
--  RH — HABILITATIONS (aussi utilisé par QSE)
-- ============================================================
CREATE TABLE IF NOT EXISTS habilitations (
  id              SERIAL PRIMARY KEY,
  employe_id      INTEGER REFERENCES employes(id) ON DELETE CASCADE,
  nom             VARCHAR(255),
  type            VARCHAR(100),
  niveau          VARCHAR(100),
  organisme       VARCHAR(255),
  date_obtention  DATE,
  date_expiration DATE NOT NULL,
  document_url    TEXT,
  document_nom    VARCHAR(255),
  verifie         BOOLEAN DEFAULT false,
  ocr_data        JSONB,
  statut          VARCHAR(50),
  cree_le         TIMESTAMPTZ DEFAULT NOW(),
  modifie_le      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  RH — BULLETINS DE PAIE
-- ============================================================
CREATE TABLE IF NOT EXISTS bulletins_paie (
  id             VARCHAR(50) PRIMARY KEY,
  employe_id     INTEGER REFERENCES employes(id) ON DELETE SET NULL,
  periode        VARCHAR(50),
  mois           INTEGER,
  annee          INTEGER,
  brut           DECIMAL(12,2),
  frais_inclus   DECIMAL(12,2) DEFAULT 0,
  net_a_payer    DECIMAL(12,2),
  cout_employeur DECIMAL(12,2),
  statut         VARCHAR(50) DEFAULT 'payé',
  date_paiement  DATE,
  frais_ids      JSONB DEFAULT '[]',
  cree_le        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  QSE — DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents_qse (
  id          SERIAL PRIMARY KEY,
  mission_id  INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  type        VARCHAR(100),
  titre       VARCHAR(255),
  contenu     TEXT,
  statut      VARCHAR(50) DEFAULT 'brouillon',
  signataires JSONB DEFAULT '[]',
  document_url TEXT,
  cree_le     TIMESTAMPTZ DEFAULT NOW(),
  modifie_le  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  QSE — EPI
-- ============================================================
CREATE TABLE IF NOT EXISTS epi (
  id               SERIAL PRIMARY KEY,
  employe_id       INTEGER REFERENCES employes(id) ON DELETE CASCADE,
  equipements      JSONB,
  date_attribution DATE,
  statut           VARCHAR(50) DEFAULT 'attribué',
  signature        TEXT,
  cree_le          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  URSSAF — DÉCLARATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS urssaf_declarations (
  id                   SERIAL PRIMARY KEY,
  periode              VARCHAR(20),
  ca                   DECIMAL(12,2),
  cotisations_calculees DECIMAL(12,2),
  statut               VARCHAR(50) DEFAULT 'en_attente',
  date_limite          DATE,
  payee_le             DATE
);

-- ============================================================
--  NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type    VARCHAR(100),
  titre   VARCHAR(255),
  contenu TEXT,
  canal   JSONB DEFAULT '["push"]',
  lu      BOOLEAN DEFAULT false,
  lu_le   TIMESTAMPTZ,
  cree_le TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  CLIENT — NOTATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notations (
  id          SERIAL PRIMARY KEY,
  mission_id  INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  artisan_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  note        INTEGER CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  cree_le     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  CLIENT — LITIGES
-- ============================================================
CREATE TABLE IF NOT EXISTS litiges (
  id               SERIAL PRIMARY KEY,
  mission_id       INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  description      TEXT,
  montant_conteste DECIMAL(12,2),
  photos           JSONB DEFAULT '[]',
  statut           VARCHAR(50) DEFAULT 'ouvert',
  etape            VARCHAR(100) DEFAULT 'Ouverture',
  etape_actuelle   INTEGER DEFAULT 0,
  resolution       TEXT,
  remboursement    DECIMAL(12,2),
  assigne_admin    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  cree_le          TIMESTAMPTZ DEFAULT NOW(),
  modifie_le       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  CLIENT — PARRAINAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS parrainages (
  id         SERIAL PRIMARY KEY,
  parrain_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  filleul_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  code       VARCHAR(100),
  statut     VARCHAR(50) DEFAULT 'en_attente',
  cree_le    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  CLIENT — MESSAGERIE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  mission_id  INTEGER REFERENCES missions(id) ON DELETE CASCADE,
  auteur      VARCHAR(50),
  nom_auteur  VARCHAR(255),
  texte       TEXT NOT NULL,
  date        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  CLIENT — DEVIS REÇUS PAR LES CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS devis_clients (
  id                SERIAL PRIMARY KEY,
  mission_id        INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  artisan_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  artisan_nom       VARCHAR(255),
  artisan_specialite VARCHAR(100),
  artisan_note      DECIMAL(3,2),
  titre             VARCHAR(255),
  montant_ht        DECIMAL(12,2),
  tva               DECIMAL(12,2),
  montant_ttc       DECIMAL(12,2),
  description       TEXT,
  delai             VARCHAR(100),
  validite_jours    INTEGER DEFAULT 15,
  validite_date     DATE,
  lignes            JSONB DEFAULT '[]',
  statut            VARCHAR(50) DEFAULT 'en_attente',
  accepte_le        TIMESTAMPTZ,
  refuse_le         TIMESTAMPTZ,
  cree_le           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  CLIENT — HISTORIQUE PAIEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS paiements_client (
  id          SERIAL PRIMARY KEY,
  mission_id  INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  titre       VARCHAR(255),
  artisan_nom VARCHAR(255),
  montant     DECIMAL(12,2),
  methode     VARCHAR(100),
  statut      VARCHAR(50) DEFAULT 'en_attente',
  facture     VARCHAR(100),
  date        TIMESTAMPTZ,
  cree_le     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  PATRON — DEVIS PROFESSIONNELS
-- ============================================================
CREATE TABLE IF NOT EXISTS devis_pro (
  id            SERIAL PRIMARY KEY,
  numero        VARCHAR(50) UNIQUE,
  client        JSONB,
  titre         VARCHAR(255),
  lignes        JSONB DEFAULT '[]',
  total_ht      DECIMAL(12,2),
  tva           DECIMAL(12,2),
  total_ttc     DECIMAL(12,2),
  validite      INTEGER DEFAULT 30,
  validite_date DATE,
  conditions    TEXT,
  statut        VARCHAR(50) DEFAULT 'brouillon',
  cree_le       TIMESTAMPTZ DEFAULT NOW(),
  envoye_le     TIMESTAMPTZ,
  signe_le      TIMESTAMPTZ,
  signature_nom VARCHAR(255)
);

-- ============================================================
--  PATRON — CHANTIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS chantiers (
  id             SERIAL PRIMARY KEY,
  nom            VARCHAR(255),
  client         VARCHAR(255),
  adresse        TEXT,
  chef           VARCHAR(255),
  statut         VARCHAR(50) DEFAULT 'planifie',
  avancement     INTEGER DEFAULT 0,
  budget_prevu   DECIMAL(12,2),
  budget_reel    DECIMAL(12,2) DEFAULT 0,
  date_debut     DATE,
  date_fin       DATE,
  date_fin_reelle DATE,
  equipe         JSONB DEFAULT '[]',
  description    TEXT,
  alertes        JSONB DEFAULT '[]',
  cree_le        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  INDEX POUR LES PERFORMANCES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role      ON users(role);
CREATE INDEX IF NOT EXISTS idx_missions_client ON missions(client_id);
CREATE INDEX IF NOT EXISTS idx_missions_artisan ON missions(artisan_id);
CREATE INDEX IF NOT EXISTS idx_missions_statut ON missions(statut);
CREATE INDEX IF NOT EXISTS idx_notifs_user     ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_habilitations_employe ON habilitations(employe_id);
CREATE INDEX IF NOT EXISTS idx_habilitations_exp ON habilitations(date_expiration);
CREATE INDEX IF NOT EXISTS idx_messages_mission ON messages(mission_id);
CREATE INDEX IF NOT EXISTS idx_devis_client    ON devis(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_client ON factures(client_id);
