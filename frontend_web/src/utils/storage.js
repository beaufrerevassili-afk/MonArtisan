/**
 * Safe localStorage helpers.
 * For real accounts (non-demo), localStorage data is NEVER read for business data.
 * Demo accounts (token ending in '.dev') use localStorage as their database.
 */

export function isDemo() {
  return localStorage.getItem('token')?.endsWith('.dev') || false;
}

/**
 * Read from localStorage — returns fallback for real accounts.
 * Only demo accounts get localStorage data.
 */
export function demoGet(key, fallback = []) {
  if (!isDemo()) return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Write to localStorage — only for demo accounts.
 */
export function demoSet(key, value) {
  if (!isDemo()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
