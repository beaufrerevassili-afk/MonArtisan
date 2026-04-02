// ============================================================
//  utils/mappers.js — snake_case DB rows → camelCase JSON
// ============================================================

function mapUser(row) {
  if (!row) return null;
  return {
    id:                  row.id,
    nom:                 row.nom,
    email:               row.email,
    role:                row.role,
    verified:            row.verified,
    statutVerification:  row.statut_verification,
    statutValidation:    row.statut_validation,
    motifRejet:          row.motif_rejet,
    valideLe:            row.valide_le,
    telephone:           row.telephone,
    metier:              row.metier,
    siret:               row.siret,
    adresse:             row.adresse,
    ville:               row.ville,
    experience:          row.experience,
    description:         row.description,
    documents:           row.documents,
    documentsSoumis:     row.documents_soumis,
    suspendu:            row.suspendu,
    suspenduLe:          row.suspendu_le,
    creeLe:              row.cree_le,
  };
}

function mapMission(row) {
  if (!row) return null;
  return {
    id:          row.id,
    titre:       row.titre,
    description: row.description,
    categorie:   row.categorie,
    urgence:     row.urgence,
    photos:      row.photos,
    clientId:    row.client_id,
    artisanId:   row.artisan_id,
    statut:      row.statut,
    priorite:    row.priorite,
    dateDebut:   row.date_debut,
    dateFin:     row.date_fin,
    budget:      row.budget !== null ? parseFloat(row.budget) : null,
    creeLe:      row.cree_le,
    modifieLe:   row.modifie_le,
  };
}

module.exports = { mapUser, mapMission };
