/* Service Worker — Artisans ERP */
const CACHE_NAME = 'freample-v4';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for everything: always serve fresh HTML/JS
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept same-origin GET requests for navigation (HTML)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // For HTML navigation requests: network-first, no caching
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request));
    return;
  }

  // For hashed assets (/assets/...): cache-first (safe, immutable)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
});
