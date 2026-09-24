// Subir este número cada vez que se suba un cambio importante del HTML/CSS/JS
// (fuerza a los dispositivos ya instalados a bajar la versión nueva).
const CACHE_NAME = 'ferreteria-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Firebase (datos y auth) y librerías externas (CDN): siempre a la red,
  // nunca cachear, para no mostrar stock/pedidos/proveedores viejos.
  const esExterno = url.origin !== self.location.origin;
  if (esExterno || event.request.method !== 'GET') {
    return;
  }

  // Archivos propios: red primero, caché como respaldo (offline o sin señal).
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copia = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
