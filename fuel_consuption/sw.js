const VERSION = "v1.01";
const CACHE_NAME = `fuel-consumption-${VERSION}`;

const APP_STATIC_RESOURCES = [
    "/index.html",
    "/fuel_consuption/icons/icon48x48.png",
    "/fuel_consuption/icons/icon72x72.png",
    "/fuel_consuption/icons/icon96x96.png",
    "/fuel_consuption/icons/icon144x144.png",
    "/fuel_consuption/icons/icon192x192.png",
    "/fuel_consuption/fonts/fontawesome-webfont.woff2",
    "/fuel_consuption/fonts/FontAwesome.otf",
    "/fuel_consuption/css/font-awesome.css",
    "/fuel_consuption/app.js",
    "/fuel_consuption/consumption.html",
    "/fuel_consuption/styles.css",
    "/fuel_consuption/manifest.json",
    "/fuel_consuption/sw.js"
  ];

// Se escucha el evento de la instalación del service worker
// y se almacenan los recursos estáticos en caché
self.addEventListener("install", (event) => {
event.waitUntil(
    (async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll(APP_STATIC_RESOURCES);
    })(),
);
});

// Se escucha el evento de la activación del service worker para borrar los archivos de caché
// que no sean de la versión actual
self.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        const names = await caches.keys();
        await Promise.all(
          names.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          }),
        );
        await clients.claim();
      })(),
    );
  });


// On fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener("fetch", (event) => {
    //As a single page app, direct app to always go to cached home page.
    if (event.request.mode === "navigate") {
      event.respondWith(caches.match("/fuel_consuption/consumption.html"));
      return;
    }
  
    // For all other requests, go to the cache first, and then the network.
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request.url);
        if (cachedResponse) {
          // Return the cached response if it's available.
          return cachedResponse;
        }
        // If resource isn't in the cache, return a 404.
        return new Response("Resource not found", { status: 404, statusText: "Not Found" });
      })(),
    );
  });
  
  
  
  