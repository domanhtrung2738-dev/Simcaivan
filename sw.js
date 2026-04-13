const CACHE_NAME = 'simcaivan-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/assets/logo.png',
  '/js/queDich-data.js',
  '/js/core-parse.js',
  '/js/tu-truong.js',
  '/js/que-dich.js',
  '/js/personal-fit.js',
  '/js/analysis-core.js',
  '/js/ui-renderers.js',
  '/js/app-controller.js',
  '/js/book-loader.js',
  '/js/book/book-manifest.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Stale-while-revalidate strategy for PWA
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
  );
});
