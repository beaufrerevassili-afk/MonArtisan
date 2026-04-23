const db = require('../db');

/**
 * Create a notification for a user
 * @param {number} userId - The user to notify
 * @param {string} type - Type: 'projet', 'candidature', 'devis', 'avis_passage', 'embauche', 'recrutement', 'conge', 'system'
 * @param {string} titre - Short title
 * @param {string} message - Longer description (stored in 'contenu' column)
 * @param {string} lien - URL to navigate to (optional)
 */
async function notify(userId, type, titre, message, lien) {
  if (!userId) return;
  try {
    await db.query(
      'INSERT INTO notifications (user_id, type, titre, contenu, lien) VALUES ($1,$2,$3,$4,$5)',
      [userId, type, titre, message || '', lien || null]
    );
  } catch (err) {
    console.error('notify error:', err.message);
  }
}

module.exports = { notify };
