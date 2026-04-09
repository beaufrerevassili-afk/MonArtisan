// ══════════════════════════════════════════════════════════════
//  Service de géolocalisation — Haversine + API adresse.data.gouv.fr
// ══════════════════════════════════════════════════════════════

const fetch = require('node-fetch') || globalThis.fetch;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

// Correction route : distance vol d'oiseau × 1.3
function distanceRoute(km) {
  return Math.round(km * 1.3 * 10) / 10;
}

async function geocoder(adresse) {
  try {
    const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`);
    const data = await r.json();
    if (!data.features?.length) return null;
    const [lon, lat] = data.features[0].geometry.coordinates;
    const props = data.features[0].properties;
    return { lat, lon, label: props.label, ville: props.city, codePostal: props.postcode, codeInsee: props.citycode };
  } catch { return null; }
}

async function calculerDistance(adresse1, adresse2) {
  const [geo1, geo2] = await Promise.all([geocoder(adresse1), geocoder(adresse2)]);
  if (!geo1 || !geo2) return { erreur: 'Adresse non trouvée', distance: null };
  const volOiseau = haversineKm(geo1.lat, geo1.lon, geo2.lat, geo2.lon);
  const route = distanceRoute(volOiseau);
  return { volOiseau, route, de: geo1, vers: geo2 };
}

function filtrerParRayon(items, centreGeo, rayonKm, getCoords) {
  return items.map(item => {
    const coords = getCoords(item);
    if (!coords?.lat || !coords?.lon) return { ...item, distance: null };
    const dist = haversineKm(centreGeo.lat, centreGeo.lon, coords.lat, coords.lon);
    return { ...item, distance: Math.round(dist) };
  }).filter(item => item.distance === null || item.distance <= rayonKm)
    .sort((a, b) => (a.distance || 999) - (b.distance || 999));
}

module.exports = { haversineKm, distanceRoute, geocoder, calculerDistance, filtrerParRayon };
