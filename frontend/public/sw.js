const CACHE_VERSION = "krishinayan-v3";
const APP_CACHE = `${CACHE_VERSION}-app`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

const APP_SHELL = [
  "/",
  "/scan",
  "/farm",
  "/alerts",
  "/recovery",
  "/chatbot",
  "/policies",
  "/profile",
  "/health",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/images/farmers-field.jpg",
  "/fonts/bricolage-grotesque-400.ttf",
  "/fonts/bricolage-grotesque-600.ttf",
  "/fonts/bricolage-grotesque-700.ttf",
  "/fonts/bricolage-grotesque-800.ttf",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(APP_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/offline.html"))
        )
    );
    return;
  }

  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(APP_CACHE).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  if (
    url.pathname.includes("/weather") ||
    url.pathname.includes("/crops") ||
    url.pathname.includes("/soil/") ||
    url.pathname.includes("/plots") ||
    url.pathname.includes("/alerts") ||
    url.pathname.includes("/recovery") ||
    url.pathname.includes("/crop-health") ||
    url.pathname.includes("/policies") ||
    url.pathname.includes("/profile")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) return response;
          const copy = response.clone();
          caches.open(DATA_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              new Response(
                JSON.stringify({
                  detail:
                    "Offline. Cached data is not available for this request yet.",
                  offline: true,
                }),
                {
                  status: 503,
                  headers: { "Content-Type": "application/json" },
                }
              )
          )
        )
    );
  }
});
