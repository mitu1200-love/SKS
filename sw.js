/* 透かしスタジオ — service worker
   Bump CACHE_VERSION whenever you change index.html or any local asset. */
const CACHE_VERSION = 'v2';
const PRECACHE = `watermark-studio-precache-${CACHE_VERSION}`;
const RUNTIME = `watermark-studio-runtime-${CACHE_VERSION}`;

// Relative paths, so this works from any GitHub Pages sub-directory.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

// Third-party assets the app pulls in. Cached on first use so the app keeps
// working offline afterwards.
const RUNTIME_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      // addAll() fails as a unit, so add individually and tolerate misses
      .then(cache => Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(new Request(url, { cache: 'reload' })))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== PRECACHE && key !== RUNTIME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navigations: network first, fall back to the cached shell when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(PRECACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html', { ignoreSearch: true })
          .then(hit => hit || caches.match('./')))
    );
    return;
  }

  // Fonts and JSZip: cache first, then fill the cache in the background.
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(req).then(hit => {
        if (hit) return hit;
        return fetch(req).then(res => {
          // opaque responses are fine to store for these
          const copy = res.clone();
          caches.open(RUNTIME).then(c => c.put(req, copy));
          return res;
        });
      })
    );
    return;
  }

  // Same-origin assets: cache first with a network fallback.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(hit => {
        if (hit) return hit;
        return fetch(req).then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME).then(c => c.put(req, copy));
          }
          return res;
        });
      })
    );
  }
});
