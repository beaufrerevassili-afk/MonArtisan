-- ============================================================
--  002_seed_demo.sql
--  Données de démonstration
-- ============================================================

-- Utilisateurs démo (mots de passe hashés à regénérer en prod)
INSERT INTO users (id, role, email, password_hash, nom, telephone) VALUES
    ('11111111-0000-0000-0000-000000000001', 'client',      'client@demo.com',   '$2b$10$demo_hash_client',   'Alice Dupont',   '0612345678'),
    ('11111111-0000-0000-0000-000000000002', 'patron',      'patron@demo.com',   '$2b$10$demo_hash_patron',   'Bernard Martin', '0623456789'),
    ('11111111-0000-0000-0000-000000000003', 'artisan',     'artisan@demo.com',  '$2b$10$demo_hash_artisan',  'Carlos Garcia',  '0634567890'),
    ('11111111-0000-0000-0000-000000000004', 'super_admin', 'admin@demo.com',    '$2b$10$demo_hash_admin',    'Diana Prince',   '0645678901'),
    ('11111111-0000-0000-0000-000000000005', 'artisan',     'artisan2@demo.com', '$2b$10$demo_hash_artisan2', 'Eric Leroy',     '0656789012'),
    ('11111111-0000-0000-0000-000000000006', 'artisan',     'artisan3@demo.com', '$2b$10$demo_hash_artisan3', 'Fatima Benali',  '0667890123'),
    ('11111111-0000-0000-0000-000000000007', 'client',      'client2@demo.com',  '$2b$10$demo_hash_client2',  'Georges Petit',  '0678901234');

-- Entreprise démo
INSERT INTO companies (id, patron_id, name, siret, secteur_activite, verified, verified_at) VALUES
    ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002',
     'Martin Bâtiment', '12345678901234', 'BTP', TRUE, NOW());

-- Employés démo
INSERT INTO employees (id, company_id, prenom, nom, poste, type_contrat, salaire_base, date_entree, statut) VALUES
    ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Jean', 'Dupont',   'Plombier',     'CDI', 2200, '2022-03-01', 'actif'),
    ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 'Marie','Martin',   'Électricienne','CDI', 2400, '2021-09-15', 'actif'),
    ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 'Ahmed','Benali',   'Carreleur',    'CDD', 2100, '2023-01-10', 'actif');

-- Habilitations démo
INSERT INTO qualifications (employee_id, type, nom, date_obtention, date_expiration, verified) VALUES
    ('33333333-0000-0000-0000-000000000001', 'electrique', 'BR',              '2022-03-01', '2025-03-01', TRUE),
    ('33333333-0000-0000-0000-000000000001', 'metier',     'Travail en hauteur', '2023-05-20', '2026-05-20', TRUE),
    ('33333333-0000-0000-0000-000000000002', 'electrique', 'BC',              '2021-06-15', '2024-06-15', TRUE),
    ('33333333-0000-0000-0000-000000000002', 'caces',      'CACES R486',      '2022-01-10', '2027-01-10', TRUE),
    ('33333333-0000-0000-0000-000000000003', 'metier',     'Qualibat',        '2023-02-01', '2026-02-01', TRUE);

-- Missions démo
INSERT INTO missions (id, client_id, company_id, employee_id, titre, description, categorie, statut, priorite, budget, date_debut, date_fin) VALUES
    ('44444444-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001',
     'Rénovation salle de bain', 'Carrelage, plomberie et peinture complète', 'Plomberie', 'en_cours', 'haute', 3500, '2024-03-01', '2024-03-20'),
    ('44444444-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', NULL,
     'Installation électrique cuisine', 'Mise aux normes et ajout de prises', 'Électricité', 'en_attente', 'normale', 1200, NULL, NULL),
    ('44444444-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000002',
     'Peinture façade', 'Ravalement complet de la façade sud', 'Peinture', 'terminee', 'normale', 4800, '2024-02-01', '2024-02-15');
