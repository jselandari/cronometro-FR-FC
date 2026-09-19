// ⬇️ CAMBIAR ESTE NÚMERO CUANDO QUIERAS FORZAR UNA ACTUALIZACIÓN
const CACHE_NAME = 'cronometro-v2';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ---------- Install: precachear todo ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // Activa el SW nuevo apenas termina de instalarse, sin esperar a que se
  // cierren las pestañas abiertas.
  self.skipWaiting();
});

// ---------- Activate: borrar TODOS los caches viejos ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)   // cualquier caché ≠ al actual se elimina
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ---------- Fetch: cache-first ESTRICTO (sin runtime caching) ----------
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Si está en caché, se sirve. Nunca se actualiza en background.
      if (cached) return cached;

      // Si no está en caché, se va a la red pero NO se guarda.
      return fetch(event.request).catch(() => {
        // Fallback offline: si navegaban a una URL del scope, devolver index.
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
