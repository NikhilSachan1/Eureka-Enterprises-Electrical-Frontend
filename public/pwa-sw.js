// Minimal PWA service worker: enables "Add to Home Screen" only.
// All requests go to the network — no app asset caching.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
