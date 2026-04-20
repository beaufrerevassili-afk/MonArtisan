// ── Utilitaires cryptographiques sécurisés ──
// Remplace les usages de Math.random() pour les tokens, IDs sensibles, etc.
// Utilise l'API Web Crypto du navigateur (disponible sur 100% des navigateurs modernes).

/**
 * Génère un token cryptographiquement sécurisé (hex).
 * @param {number} bytes - nombre d'octets (32 = 256 bits = 64 chars hex). Défaut: 16 bytes = 128 bits.
 * @returns {string} Token en hexadécimal.
 */
export function secureToken(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Génère un ID sécurisé, utilisable comme identifiant de ressource.
 * Plus court que secureToken mais suffisant (96 bits = 24 chars hex).
 * @returns {string}
 */
export function secureId() {
  return secureToken(12);
}

/**
 * Hash SHA-256 d'une chaîne (utilisé pour mots de passe stockés côté client en mode démo).
 * NE REMPLACE PAS un vrai hash backend avec bcrypt/argon2.
 * Utile uniquement pour ne pas stocker des mots de passe en clair en localStorage
 * pendant la phase démo (en attendant le backend).
 * @param {string} texte
 * @returns {Promise<string>} Hash hex
 */
export async function sha256(texte) {
  const data = new TextEncoder().encode(texte);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Génère un mot de passe temporaire sécurisé.
 * Utilisé pour les comptes auto-créés après signature d'un devis.
 * @param {number} length - longueur (défaut 12)
 * @returns {string}
 */
export function secureTempPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => chars[b % chars.length]).join('');
}

/**
 * Vérifie si un timestamp est encore valide (non expiré).
 * @param {number} expiresAt - timestamp en ms
 * @returns {boolean}
 */
export function isNotExpired(expiresAt) {
  return typeof expiresAt === 'number' && expiresAt > Date.now();
}

/**
 * Retourne un timestamp d'expiration à partir d'un délai en heures.
 * @param {number} hours
 * @returns {number}
 */
export function expiresInHours(hours = 24) {
  return Date.now() + hours * 3600 * 1000;
}
