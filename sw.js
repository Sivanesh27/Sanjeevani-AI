const CACHE_NAME = "sanjeevani-ai-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/i18n.js",
  "./js/interactionEngine.js",
  "./js/app.js",
  "./data/drugs.js",
  "./data/interactions.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network-first for CDN (OCR library), cache-first for local app shell/data.
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
