// GroupForge Service Worker
// Caches all app files on first visit so the app works fully offline afterwards.
// Bump CACHE_NAME any time you update the app files to force a fresh cache.

const CACHE_NAME = 'groupforge-v1';

// All files that make up the app — must match your actual filenames
const APP_FILES = [
  './',
  './group-creator.html',
  './manifest.json',
  './icon-512.png',
  './icon-192.png',
];

// ---- Install: pre-cache all app files ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // addAll fails if any file 404s — use individual adds so one missing
        // optional file (like icons) doesn't break the whole install
        return Promise.allSettled(
          APP_FILES.map(url =>
            cache.add(url).catch(err => console.warn('SW: could not cache', url, err.message))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ---- Activate: delete old caches ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---- Fetch: cache-first strategy ----
// Serve from cache when available; fall back to network and cache the response.
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-http(s) requests (chrome-extension://, etc.)
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {
            // Only cache valid responses from same origin
            if (
              !response ||
              response.status !== 200 ||
              (response.type !== 'basic' && response.type !== 'cors')
            ) {
              return response;
            }

            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));

            return response;
          })
          .catch(() => {
            // Network failed and not in cache — return a minimal offline fallback
            if (event.request.destination === 'document') {
              return caches.match('./group-creator.html');
            }
          });
      })
  );
});
