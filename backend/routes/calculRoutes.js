// ============================================================
//  calculRoutes.js — Endpoints de calcul métier
//  Paie, distance, scoring immo, devis
//  Centralise la logique métier côté backend
// ============================================================

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');

// Rate limit : 30 requêtes/minute par IP
const calcLimiter = rateLimit({ windowMs: 60000, max: 30, message: { erreur: 'Trop de requêtes, réessayez dans une minute' } });
router.use(calcLimiter);
const paie = require('../services/paieService');
const geo = require('../services/geoService');
const scoring = require('../services/scoringService');
const devis = require('../services/devisService');

// ── PAIE ──

// POST /calcul/paie/journaliere — Rémunération journalière BTP
router.post('/paie/journaliere', (req, res) => {
  try {
    const result = paie.calculerRemunerationJournaliere(req.body);
    res.json(result);
  } catch (err) { res.status(400).json({ erreur: err.message }); }
});

// POST /calcul/paie/bulletin — Bulletin de paie complet
router.post('/paie/bulletin', (req, res) => {
  try {
    const { brut } = req.body;
    if (!brut || brut <= 0) return res.status(400).json({ erreur: 'Salaire brut requis' });
    const result = paie.calculerBulletinPaie(Number(brut));
    res.json(result);
  } catch (err) { res.status(400).json({ erreur: err.message }); }
});

// POST /calcul/paie/indemnite-trajet — Indemnité de trajet BTP
router.post('/paie/indemnite-trajet', (req, res) => {
  try {
    const { distanceKm } = req.body;
    const result = paie.calculerIndemniteTrajet(Number(distanceKm));
    res.json(result);
  } catch (err) { res.status(400).json({ erreur: err.message }); }
});

// GET /calcul/paie/bareme — Barème des indemnités
router.get('/paie/bareme', (req, res) => {
  res.json({ bareme: paie.BAREME_TRAJET, panierRepas: paie.PANIER_REPAS_BTP, pmss: paie.PMSS });
});

// ── GÉOLOCALISATION ──

// POST /calcul/distance — Distance entre 2 adresses
router.post('/distance', async (req, res) => {
  try {
    const { adresse1, adresse2 } = req.body;
    if (!adresse1 || !adresse2) return res.status(400).json({ erreur: 'Deux adresses requises' });
    const result = await geo.calculerDistance(adresse1, adresse2);
    res.json(result);
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// POST /calcul/geocoder — Géocoder une adresse
router.post('/geocoder', async (req, res) => {
  try {
    const { adresse } = req.body;
    if (!adresse) return res.status(400).json({ erreur: 'Adresse requise' });
    const result = await geo.geocoder(adresse);
    if (!result) return res.status(404).json({ erreur: 'Adresse non trouvée' });
    res.json(result);
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// ── SCORING INVESTISSEMENT ──

// POST /calcul/score-investissement — Score /100 avec géorisques
router.post('/score-investissement', async (req, res) => {
  try {
    const { dossier, geo: geoData, profil } = req.body;
    if (!dossier) return res.status(400).json({ erreur: 'Dossier requis' });

    // Si adresse fournie et pas de géorisques, les chercher
    let geoRisques = geoData || null;
    if (!geoRisques && dossier.adresse) {
      const geoResult = await geo.geocoder(dossier.adresse);
      if (geoResult?.codeInsee) {
        try {
          const fetch = globalThis.fetch;
          const BASE = 'https://www.georisques.gouv.fr/api/v1';
          const [risques, sism, radon, catnat] = await Promise.all([
            fetch(`${BASE}/gaspar/risques?code_insee=${geoResult.codeInsee}&page_size=50`).then(r => r.json()).catch(() => ({ data: [] })),
            fetch(`${BASE}/zonage_sismique?code_insee=${geoResult.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
            fetch(`${BASE}/radon?code_insee=${geoResult.codeInsee}`).then(r => r.json()).catch(() => ({ data: [] })),
            fetch(`${BASE}/gaspar/catnat?code_insee=${geoResult.codeInsee}&page_size=20`).then(r => r.json()).catch(() => ({ data: [] })),
          ]);
          geoRisques = {
            nbRisques: (risques.data?.[0]?.risques_detail || []).length,
            sismique: parseInt(sism.data?.[0]?.code_zone) || 1,
            radon: parseInt(radon.data?.[0]?.classe_potentiel) || 1,
            nbCatnat: (catnat.data || []).length,
          };
        } catch {}
      }
    }

    const result = scoring.calcScore(dossier, geoRisques, profil || 'equilibre');
    res.json({ score: result, georisques: geoRisques });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// ── DEVIS ──

// POST /calcul/devis — Calculer un devis (lignes, totaux)
router.post('/devis', (req, res) => {
  try {
    const { lignes, remiseGlobale } = req.body;
    const validation = devis.validerDevis({ lignes });
    if (!validation.valide) return res.status(400).json({ erreur: 'Devis invalide', erreurs: validation.erreurs });
    const result = devis.calculerDevis(lignes, remiseGlobale || 0);
    res.json(result);
  } catch (err) { res.status(400).json({ erreur: err.message }); }
});

// POST /calcul/devis/valider — Valider un devis sans le calculer
router.post('/devis/valider', (req, res) => {
  try {
    const result = devis.validerDevis(req.body);
    res.json(result);
  } catch (err) { res.status(400).json({ erreur: err.message }); }
});

module.exports = router;
