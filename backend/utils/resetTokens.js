// ============================================================
//  utils/resetTokens.js — Shared in-memory reset token store
//  NOTE: tokens are lost on restart — use a DB table for production
// ============================================================

const resetTokens = new Map(); // token -> { userId, expiresAt }

module.exports = resetTokens;
