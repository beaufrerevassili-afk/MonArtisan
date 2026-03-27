# ============================================================
#  GUIDE DE TESTS CURL – Backend Clients / Artisans / ERP v2
# ============================================================
#
#  Astuce : remplacez TOKEN_* par le token obtenu au login.
#  Sous Linux/Mac vous pouvez capturer le token automatiquement :
#
#    TOKEN=$(curl -s -X POST http://localhost:3000/login \
#      -H "Content-Type: application/json" \
#      -d '{"email":"patron@demo.com","motdepasse":"patron123"}' \
#      | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
#    echo $TOKEN
#
# ============================================================

BASE=http://localhost:3000


# ============================================================
# 0. DOCUMENTATION DES ROUTES
# ============================================================

curl $BASE/


# ============================================================
# 1. LOGIN – Obtenir un token JWT
# ============================================================

# Client
curl -X POST $BASE/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@demo.com","motdepasse":"client123"}'

# Patron
curl -X POST $BASE/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patron@demo.com","motdepasse":"patron123"}'

# Artisan
curl -X POST $BASE/login \
  -H "Content-Type: application/json" \
  -d '{"email":"artisan@demo.com","motdepasse":"artisan123"}'

# Super Admin
curl -X POST $BASE/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","motdepasse":"admin123"}'


# ============================================================
# 2. DASHBOARDS
# ============================================================

# Dashboard client (remplacer TOKEN_CLIENT par votre token)
curl $BASE/dashboard/client \
  -H "Authorization: Bearer TOKEN_CLIENT"

# Dashboard artisan
curl $BASE/dashboard/artisan \
  -H "Authorization: Bearer TOKEN_ARTISAN"

# Dashboard patron (contient finances + équipe + toutes missions)
curl $BASE/dashboard/patron \
  -H "Authorization: Bearer TOKEN_PATRON"

# Dashboard super admin
curl $BASE/dashboard/admin \
  -H "Authorization: Bearer TOKEN_ADMIN"


# ============================================================
# 3. MISSIONS
# ============================================================

## Lister toutes les missions (patron voit tout, client/artisan voient les leurs)
curl $BASE/missions \
  -H "Authorization: Bearer TOKEN_PATRON"

## Filtrer par statut
curl "$BASE/missions?statut=en_attente" \
  -H "Authorization: Bearer TOKEN_PATRON"

## Filtrer par priorité
curl "$BASE/missions?priorite=urgente" \
  -H "Authorization: Bearer TOKEN_PATRON"

## Filtrer par artisan
curl "$BASE/missions?artisanId=3" \
  -H "Authorization: Bearer TOKEN_PATRON"

## Voir le détail d'une mission
curl $BASE/missions/1 \
  -H "Authorization: Bearer TOKEN_PATRON"

## Créer une mission (en tant que client)
curl -X POST $BASE/missions \
  -H "Authorization: Bearer TOKEN_CLIENT" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Réparation fenêtres",
    "description": "Remplacement de 3 fenêtres simple vitrage en double vitrage",
    "budget": 2100,
    "priorite": "normale"
  }'

## Créer une mission pour un client spécifique (en tant que patron)
curl -X POST $BASE/missions \
  -H "Authorization: Bearer TOKEN_PATRON" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Installation climatisation",
    "description": "Pose de 2 unités split dans le salon et la chambre",
    "budget": 3200,
    "priorite": "haute",
    "clientId": 1,
    "dateDebut": "2024-04-01",
    "dateFin": "2024-04-03"
  }'

## Modifier une mission (patron)
curl -X PUT $BASE/missions/2 \
  -H "Authorization: Bearer TOKEN_PATRON" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 1400,
    "priorite": "haute",
    "dateDebut": "2024-04-10"
  }'

## Assigner un artisan à une mission (patron uniquement)
#  → artisanId 3 = Carlos Garcia, 5 = Éric Leroy, 6 = Fatima Benali
curl -X PUT $BASE/missions/2/assigner \
  -H "Authorization: Bearer TOKEN_PATRON" \
  -H "Content-Type: application/json" \
  -d '{"artisanId": 5}'

## Changer le statut d'une mission (artisan → en_cours ou terminee)
curl -X PUT $BASE/missions/2/statut \
  -H "Authorization: Bearer TOKEN_ARTISAN" \
  -H "Content-Type: application/json" \
  -d '{"statut": "en_cours"}'

## Marquer une mission comme terminée (artisan)
curl -X PUT $BASE/missions/1/statut \
  -H "Authorization: Bearer TOKEN_ARTISAN" \
  -H "Content-Type: application/json" \
  -d '{"statut": "terminee"}'

## Annuler une mission (client, uniquement si en_attente)
curl -X PUT $BASE/missions/4/statut \
  -H "Authorization: Bearer TOKEN_CLIENT" \
  -H "Content-Type: application/json" \
  -d '{"statut": "annulee"}'

## Patron peut passer n'importe quel statut
curl -X PUT $BASE/missions/5/statut \
  -H "Authorization: Bearer TOKEN_PATRON" \
  -H "Content-Type: application/json" \
  -d '{"statut": "en_cours"}'

## Supprimer une mission (patron/admin uniquement)
curl -X DELETE $BASE/missions/4 \
  -H "Authorization: Bearer TOKEN_PATRON"


# ============================================================
# 4. GESTION DE L'ÉQUIPE
# ============================================================

## Liste des artisans avec charge de travail (patron/admin)
curl $BASE/artisans \
  -H "Authorization: Bearer TOKEN_PATRON"

## Missions d'un artisan spécifique
curl $BASE/artisans/3/missions \
  -H "Authorization: Bearer TOKEN_PATRON"

## Un artisan peut voir ses propres missions
curl $BASE/artisans/3/missions \
  -H "Authorization: Bearer TOKEN_ARTISAN"

## Liste des clients avec leur budget total
curl $BASE/clients \
  -H "Authorization: Bearer TOKEN_PATRON"


# ============================================================
# 5. ERP
# ============================================================

## Rapport ERP complet (finances + RH + missions + documents)
curl $BASE/erp/rapport \
  -H "Authorization: Bearer TOKEN_PATRON"

## Finances uniquement
curl $BASE/erp/finances \
  -H "Authorization: Bearer TOKEN_PATRON"

## Documents
curl $BASE/erp/documents \
  -H "Authorization: Bearer TOKEN_PATRON"

## Stats rapides
curl $BASE/erp/stats \
  -H "Authorization: Bearer TOKEN_PATRON"


# ============================================================
# 6. SCÉNARIO COMPLET – De la création à la clôture
# ============================================================

# Étape 1 : Le client crée une mission
curl -X POST $BASE/missions \
  -H "Authorization: Bearer TOKEN_CLIENT" \
  -H "Content-Type: application/json" \
  -d '{"titre":"Carrelage terrasse","description":"Pose 30m² grès cérame","budget":2800,"priorite":"normale"}'

# Étape 2 : Le patron voit les missions en attente
curl "$BASE/missions?statut=en_attente" \
  -H "Authorization: Bearer TOKEN_PATRON"

# Étape 3 : Le patron vérifie la disponibilité des artisans
curl $BASE/artisans \
  -H "Authorization: Bearer TOKEN_PATRON"

# Étape 4 : Le patron assigne la mission (id=6 dans cet exemple)
curl -X PUT $BASE/missions/6/assigner \
  -H "Authorization: Bearer TOKEN_PATRON" \
  -H "Content-Type: application/json" \
  -d '{"artisanId": 6}'

# Étape 5 : L'artisan démarre la mission
curl -X PUT $BASE/missions/6/statut \
  -H "Authorization: Bearer TOKEN_ARTISAN" \
  -H "Content-Type: application/json" \
  -d '{"statut": "en_cours"}'

# Étape 6 : L'artisan termine la mission
curl -X PUT $BASE/missions/6/statut \
  -H "Authorization: Bearer TOKEN_ARTISAN" \
  -H "Content-Type: application/json" \
  -d '{"statut": "terminee"}'

# Étape 7 : Le patron consulte le rapport ERP mis à jour
curl $BASE/erp/rapport \
  -H "Authorization: Bearer TOKEN_PATRON"


# ============================================================
# 7. TESTS D'ERREURS (vérifier que les protections fonctionnent)
# ============================================================

# Accès sans token → 401
curl $BASE/missions

# Mauvais rôle : client tente de voir tous les artisans → 403
curl $BASE/artisans \
  -H "Authorization: Bearer TOKEN_CLIENT"

# Artisan tente d'assigner une mission → 403
curl -X PUT $BASE/missions/2/assigner \
  -H "Authorization: Bearer TOKEN_ARTISAN" \
  -H "Content-Type: application/json" \
  -d '{"artisanId": 3}'

# Artisan tente de mettre en statut "annulee" → 403
curl -X PUT $BASE/missions/1/statut \
  -H "Authorization: Bearer TOKEN_ARTISAN" \
  -H "Content-Type: application/json" \
  -d '{"statut": "annulee"}'

# Mission introuvable → 404
curl $BASE/missions/999 \
  -H "Authorization: Bearer TOKEN_PATRON"
