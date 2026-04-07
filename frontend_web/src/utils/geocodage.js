// ══════════════════════════════════════════════════════════════
//  Géocodage et calcul de distance via API adresse.data.gouv.fr
//  API gratuite, pas de clé, hébergée en France
//  https://adresse.data.gouv.fr/api-doc/adresse
// ══════════════════════════════════════════════════════════════

/**
 * Géocode une adresse française → coordonnées GPS
 * @param {string} adresse - Adresse complète (ex: "24 rue de la Liberté, Nice")
 * @returns {Promise<{lat: number, lon: number, label: string} | null>}
 */
export async function geocoder(adresse) {
  if (!adresse || adresse.trim().length < 5) return null;
  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.features || data.features.length === 0) return null;
    const feature = data.features[0];
    const [lon, lat] = feature.geometry.coordinates;
    return { lat, lon, label: feature.properties.label };
  } catch {
    return null;
  }
}

/**
 * Calcule la distance en km entre 2 points GPS (formule de Haversine)
 * @param {number} lat1 - Latitude point 1
 * @param {number} lon1 - Longitude point 1
 * @param {number} lat2 - Latitude point 2
 * @param {number} lon2 - Longitude point 2
 * @returns {number} Distance en km (arrondi à 1 décimale)
 */
export function calculerDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Coefficient 1.3 pour approximer la distance route vs vol d'oiseau
  return Math.round(R * c * 1.3 * 10) / 10;
}

/**
 * Calcule la distance entre 2 adresses françaises
 * @param {string} adresse1 - Adresse de départ (dépôt)
 * @param {string} adresse2 - Adresse d'arrivée (chantier)
 * @returns {Promise<{distanceKm: number, depart: string, arrivee: string} | null>}
 */
export async function calculerDistanceEntreAdresses(adresse1, adresse2) {
  const [geo1, geo2] = await Promise.all([geocoder(adresse1), geocoder(adresse2)]);
  if (!geo1 || !geo2) return null;
  const distanceKm = calculerDistanceKm(geo1.lat, geo1.lon, geo2.lat, geo2.lon);
  return { distanceKm, depart: geo1.label, arrivee: geo2.label };
}
