// Minimal service worker for Psych. Network-first for navigation
// requests with an offline-page fallback. Cache-first for built static
// assets (so installed PWAs feel snappier).
//
// Kept deliberately small — no precache of route HTML, no asset
// fingerprint tracking — so it stays safe across Vercel deploys.

const CACHE_VERSION = "psych-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.addAll([OFFLINE_URL, "/manifest.json", "/icon.svg"]).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET; don't interfere with POSTs etc.
  if (req.method !== "GET") return;

  // Don't try to handle cross-origin requests.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Don't cache Next.js HMR / dev endpoints.
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Navigation requests → network first, fall back to offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(OFFLINE_URL).then((r) => r || new Response("Offline", { status: 503 }))
      )
    );
    return;
  }

  // Static assets → cache first, populate on miss.
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy).catch(() => {}));
            return res;
          })
          .catch(() => caches.match(OFFLINE_URL) as Promise<Response>)
    )
  );
});
