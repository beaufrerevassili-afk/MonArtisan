-- ============================================================
--  001_initial_schema.sql
--  Schéma initial PostgreSQL — Application Artisans
--  Toutes les tables : utilisateurs, missions, finance, RH, QSE, URSSAF
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;  -- Pour la géolocalisation

-- ============================================================
--  UTILISATEURS & AUTH
-- ============================================================

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role          VARCHAR(20) NOT NULL CHECK (role IN ('client', 'patron', 'artisan', 'super_admin')),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nom           VARCHAR(100) NOT NULL,
    telephone     VARCHAR(20),
    avatar_url    VARCHAR(500),
    suspendu      BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  ENTREPRISES (Patrons / Artisans)
-- ============================================================

CREATE TABLE companies (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patron_id           UUID REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(200) NOT NULL,
    siret               VARCHAR(14) UNIQUE,
    forme_juridique     VARCHAR(50),
    adresse             TEXT,
    ville               VARCHAR(100),
    code_postal         VARCHAR(10),
    secteur_activite    VARCHAR(100),
    kbis_url            VARCHAR(500),
    assurance_dec_url   VARCHAR(500),
    assurance_rc_url    VARCHAR(500),
    assurance_dec_exp   DATE,
    verified            BOOLEAN DEFAULT FALSE,
    verified_at         TIMESTAMP,
    verified_by         UUID REFERENCES users(id),
    statut_validation   VARCHAR(20) DEFAULT 'en_attente',
    motif_rejet         TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  EMPLOYÉS
-- ============================================================

CREATE TABLE employees (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id       UUID REFERENCES users(id),
    prenom        VARCHAR(100) NOT NULL,
    nom           VARCHAR(100) NOT NULL,
    poste         VARCHAR(100),
    email         VARCHAR(255),
    telephone     VARCHAR(20),
    type_contrat  VARCHAR(20) DEFAULT 'CDI' CHECK (type_contrat IN ('CDI', 'CDD', 'interim', 'apprenti')),
    salaire_base  DECIMAL(10,2),
    date_entree   DATE,
    date_sortie   DATE,
    numero_secu   VARCHAR(20),
    adresse       TEXT,
    statut        VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'conge')),
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  HABILITATIONS & QUALIFICATIONS (QSE)
-- ============================================================

CREATE TABLE qualifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID REFERENCES employees(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL CHECK (type IN ('electrique', 'caces', 'metier', 'administratif')),
    nom             VARCHAR(100) NOT NULL,
    date_obtention  DATE,
    date_expiration DATE NOT NULL,
    document_url    VARCHAR(500),
    verified        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_qualifications_expiration ON qualifications(date_expiration);
CREATE INDEX idx_qualifications_employee   ON qualifications(employee_id);

-- ============================================================
--  MISSIONS
-- ============================================================

CREATE TABLE missions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id     UUID REFERENCES users(id),
    company_id    UUID REFERENCES companies(id),
    employee_id   UUID REFERENCES employees(id),
    titre         VARCHAR(200) NOT NULL,
    description   TEXT,
    categorie     VARCHAR(50),
    urgence       VARCHAR(20) DEFAULT 'cette_semaine',
    piece         VARCHAR(50),
    statut        VARCHAR(20) DEFAULT 'en_attente'
                  CHECK (statut IN ('en_attente', 'assignee', 'en_cours', 'terminee', 'annulee')),
    priorite      VARCHAR(20) DEFAULT 'normale'
                  CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
    budget        DECIMAL(10,2),
    adresse       TEXT,
    lat           DECIMAL(10,7),
    lng           DECIMAL(10,7),
    photos        TEXT[],
    date_debut    DATE,
    date_fin      DATE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_missions_client   ON missions(client_id);
CREATE INDEX idx_missions_company  ON missions(company_id);
CREATE INDEX idx_missions_statut   ON missions(statut);

-- ============================================================
--  DEVIS
-- ============================================================

CREATE TABLE quotes (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id       UUID REFERENCES missions(id),
    company_id       UUID REFERENCES companies(id),
    client_id        UUID REFERENCES users(id),
    numero           VARCHAR(50) UNIQUE,
    lignes           JSONB,               -- [{description, quantite, prixUnitaire, tva}]
    montant_ht       DECIMAL(10,2),
    montant_tva      DECIMAL(10,2),
    montant_ttc      DECIMAL(10,2),
    acompte_percent  DECIMAL(5,2) DEFAULT 30,
    acompte_amount   DECIMAL(10,2),
    statut           VARCHAR(20) DEFAULT 'brouillon'
                     CHECK (statut IN ('brouillon', 'envoyé', 'accepté', 'refusé', 'expiré')),
    validite_jours   INT DEFAULT 30,
    date_expiration  DATE,
    document_url     VARCHAR(500),
    signe_le         TIMESTAMP,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  FACTURES
-- ============================================================

CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id        UUID REFERENCES quotes(id),
    company_id      UUID REFERENCES companies(id),
    client_id       UUID REFERENCES users(id),
    mission_id      UUID REFERENCES missions(id),
    numero          VARCHAR(50) UNIQUE,
    montant_ht      DECIMAL(10,2),
    montant_tva     DECIMAL(10,2),
    montant_ttc     DECIMAL(10,2),
    acompte_amount  DECIMAL(10,2),
    statut          VARCHAR(20) DEFAULT 'en_attente'
                    CHECK (statut IN ('en_attente', 'payée', 'en_retard', 'annulée')),
    date_echeance   DATE,
    payee_le        TIMESTAMP,
    relances        INT DEFAULT 0,
    derniere_relance TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  PAIEMENTS
-- ============================================================

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id          UUID REFERENCES invoices(id),
    company_id          UUID REFERENCES companies(id),
    client_id           UUID REFERENCES users(id),
    montant             DECIMAL(10,2) NOT NULL,
    methode             VARCHAR(20) CHECK (methode IN ('stripe', 'paypal', 'virement')),
    stripe_payment_id   VARCHAR(200),
    paypal_order_id     VARCHAR(200),
    statut              VARCHAR(20) DEFAULT 'pending' CHECK (statut IN ('pending', 'completed', 'failed', 'refunded')),
    created_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  SALAIRES
-- ============================================================

CREATE TABLE salaries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID REFERENCES employees(id) ON DELETE CASCADE,
    company_id      UUID REFERENCES companies(id),
    mois            INT NOT NULL CHECK (mois BETWEEN 1 AND 12),
    annee           INT NOT NULL,
    salaire_base    DECIMAL(10,2),
    primes          DECIMAL(10,2) DEFAULT 0,
    salaire_brut    DECIMAL(10,2),
    cotisations     DECIMAL(10,2),
    salaire_net     DECIMAL(10,2),
    charges_patron  DECIMAL(10,2),
    cout_total      DECIMAL(10,2),
    statut          VARCHAR(20) DEFAULT 'calculé' CHECK (statut IN ('calculé', 'payé', 'erreur')),
    paye_le         TIMESTAMP,
    fiche_paie_url  VARCHAR(500),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(employee_id, mois, annee)
);

-- ============================================================
--  DÉPENSES
-- ============================================================

CREATE TABLE expenses (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id   UUID REFERENCES companies(id),
    employee_id  UUID REFERENCES employees(id),
    mission_id   UUID REFERENCES missions(id),
    montant      DECIMAL(10,2) NOT NULL,
    categorie    VARCHAR(50) CHECK (categorie IN ('materiaux', 'carburant', 'sous-traitant', 'outillage', 'repas', 'hebergement', 'autre')),
    description  TEXT,
    justificatif_url VARCHAR(500),
    statut       VARCHAR(20) DEFAULT 'validée' CHECK (statut IN ('en_attente', 'validée', 'refusée')),
    valide_par   UUID REFERENCES users(id),
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  CONGÉS & ABSENCES (RH)
-- ============================================================

CREATE TABLE leaves (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id  UUID REFERENCES employees(id) ON DELETE CASCADE,
    company_id   UUID REFERENCES companies(id),
    date_debut   DATE NOT NULL,
    date_fin     DATE NOT NULL,
    nb_jours     INT,
    type         VARCHAR(30) DEFAULT 'conge_paye' CHECK (type IN ('conge_paye', 'rtt', 'sans_solde', 'maladie', 'maternite')),
    motif        TEXT,
    statut       VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuvé', 'refusé')),
    commentaire  TEXT,
    valide_par   UUID REFERENCES users(id),
    validee_le   TIMESTAMP,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  NOTES DE FRAIS (RH)
-- ============================================================

CREATE TABLE expense_reports (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id      UUID REFERENCES employees(id) ON DELETE CASCADE,
    company_id       UUID REFERENCES companies(id),
    mission_id       UUID REFERENCES missions(id),
    montant          DECIMAL(10,2) NOT NULL,
    categorie        VARCHAR(30),
    description      TEXT,
    justificatif_url VARCHAR(500),
    statut           VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuvée', 'refusée')),
    valide_par       UUID REFERENCES users(id),
    validee_le       TIMESTAMP,
    created_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  PLANNING
-- ============================================================

CREATE TABLE schedule (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id  UUID REFERENCES employees(id) ON DELETE CASCADE,
    company_id   UUID REFERENCES companies(id),
    mission_id   UUID REFERENCES missions(id),
    date         DATE NOT NULL,
    heure_debut  TIME DEFAULT '08:00',
    heure_fin    TIME DEFAULT '17:00',
    type         VARCHAR(30) DEFAULT 'chantier',
    semaine      INT,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  DOCUMENTS QSE
-- ============================================================

CREATE TABLE qse_documents (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id   UUID REFERENCES companies(id),
    mission_id   UUID REFERENCES missions(id),
    type         VARCHAR(50) NOT NULL,
    titre        VARCHAR(200),
    contenu      TEXT,
    document_url VARCHAR(500),
    statut       VARCHAR(20) DEFAULT 'brouillon',
    signataires  UUID[],
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  EPI (Équipements de Protection Individuelle)
-- ============================================================

CREATE TABLE epi_attributions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id      UUID REFERENCES employees(id) ON DELETE CASCADE,
    company_id       UUID REFERENCES companies(id),
    equipements      TEXT[],
    date_attribution DATE DEFAULT CURRENT_DATE,
    statut           VARCHAR(20) DEFAULT 'attribué',
    signature_url    VARCHAR(500),
    created_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  MESSAGERIE
-- ============================================================

CREATE TABLE messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id  UUID REFERENCES missions(id) ON DELETE CASCADE,
    sender_id   UUID REFERENCES users(id),
    contenu     TEXT NOT NULL,
    lu          BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_mission ON messages(mission_id);

-- ============================================================
--  NOTATIONS
-- ============================================================

CREATE TABLE ratings (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id   UUID REFERENCES missions(id) UNIQUE,
    from_user_id UUID REFERENCES users(id),
    to_user_id   UUID REFERENCES users(id),
    score        INT NOT NULL CHECK (score BETWEEN 1 AND 5),
    commentaire  TEXT,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  LITIGES
-- ============================================================

CREATE TABLE disputes (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id       UUID REFERENCES missions(id),
    opened_by        UUID REFERENCES users(id),
    description      TEXT NOT NULL,
    montant_conteste DECIMAL(10,2),
    photos           TEXT[],
    statut           VARCHAR(20) DEFAULT 'ouvert' CHECK (statut IN ('ouvert', 'en_mediation', 'résolu', 'fermé')),
    etape_actuelle   INT DEFAULT 0,
    resolution       TEXT,
    remboursement    DECIMAL(10,2),
    assigne_admin    UUID REFERENCES users(id),
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL,
    titre      VARCHAR(200),
    contenu    TEXT NOT NULL,
    canal      TEXT[] DEFAULT ARRAY['push'],
    lu         BOOLEAN DEFAULT FALSE,
    lu_le      TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_lu   ON notifications(lu);

-- ============================================================
--  PARRAINAGE
-- ============================================================

CREATE TABLE referrals (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parrain_id     UUID REFERENCES users(id),
    filleul_id     UUID REFERENCES users(id),
    code           VARCHAR(50) NOT NULL,
    statut         VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'validé', 'expiré')),
    recompense_val DECIMAL(10,2) DEFAULT 10.00,
    created_at     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--  TRIGGER : updated_at automatique
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['users', 'companies', 'missions', 'quotes', 'qse_documents']
    LOOP
        EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
    END LOOP;
END;
$$;
