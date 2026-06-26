const CACHE_NAME = "linkorder-v5";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/icon-512.png",
  "/icon-192.png",
  "/icon-512.jpg"
];

// Install Event - cache core static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching core assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - handle requests and offline mode
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass API calls, manifest, websockets, and dev-server assets from caching
  if (
    url.pathname.startsWith("/api") || 
    url.pathname.includes("manifest.json") || 
    url.pathname.includes("/socket.io") || 
    url.pathname.includes("@vite")
  ) {
    return;
  }

  // Cache-First strategy for static assets, network-first for pages
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version but fetch fresh copy in background for next time
        fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, networkResponse);
            });
          }
        }).catch(() => {
          // Ignore network errors in background update
        });
        return cachedResponse;
      }

      return fetch(req)
        .then((networkResponse) => {
          // Cache newly requested assets dynamically
          if (networkResponse && networkResponse.status === 200 && req.method === "GET") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is for index.html or document, return index from cache
          if (req.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline mode active. Check your network connection.", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ "Content-Type": "text/plain" })
          });
        });
    })
  );
});
