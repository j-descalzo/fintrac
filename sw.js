// ============================================================
//  Fintrac Service Worker
//  Estrategia: Cache-first para assets estáticos,
//              Network-first para datos dinámicos,
//              Offline fallback para cuando no hay red.
// ============================================================

const APP_VERSION = 'v1.1.0';
const CACHE_STATIC = `fintrac-static-${APP_VERSION}`;
const CACHE_DYNAMIC = `fintrac-dynamic-${APP_VERSION}`;

// Assets que se cachean en el install (shell de la app)
const STATIC_ASSETS = [
  './',
  'index.html',
  '/fintrac/manifest.json',
  '/fintrac/icons/icon-192.png',
  '/fintrac/icons/icon-512.png',
  // Librerías externas — ajustá si usás versiones distintas
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
];

// ── INSTALL ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando ${CACHE_STATIC}...`);
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Assets estáticos cacheados ✓');
      return self.skipWaiting(); // Activar inmediatamente
    }).catch((err) => {
      console.error('[SW] Error al cachear assets:', err);
    })
  );
});

// ── ACTIVATE ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activando ${CACHE_STATIC}...`);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_STATIC && key !== CACHE_DYNAMIC)
          .map((key) => {
            console.log(`[SW] Eliminando caché viejo: ${key}`);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.log('[SW] Listo para interceptar requests ✓');
      return self.clients.claim(); // Tomar control de tabs abiertas
    })
  );
});

// ── FETCH ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No interceptar requests a la API de Anthropic (siempre necesitan red)
  if (url.hostname === 'api.anthropic.com') {
    event.respondWith(networkOnly(request));
    return;
  }

  // No interceptar requests a Supabase (auth + DB siempre necesitan red)
  if (url.hostname.endsWith('supabase.co')) {
    event.respondWith(networkOnly(request));
    return;
  }

  // No interceptar jsdelivr (Supabase SDK)
  if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(networkOnly(request));
    return;
  }

  // No interceptar métodos que no sean GET
  if (request.method !== 'GET') return;

  // Assets estáticos del shell → Cache First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Resto → Network First con fallback a caché
  event.respondWith(networkFirst(request));
});

// ── ESTRATEGIAS DE CACHÉ ────────────────────────────────────

/** Cache First: sirve desde caché, si no está va a red y guarda */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(request);
  }
}

/** Network First: intenta red, si falla usa caché */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback(request);
  }
}

/** Network Only: siempre va a red, sin caché */
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Sin conexión. La API de escaneo requiere internet.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/** Fallback offline: devuelve la app shell (index.html) para navegación */
async function offlineFallback(request) {
  const url = new URL(request.url);

  // Para requests de navegación HTML → devolver app shell
  if (request.destination === 'document') {
    const cached = await caches.match('index.html');
    if (cached) return cached;
  }

  // Fallback genérico
  return new Response(
    '<h1>Fintrac — Sin conexión</h1><p>Revisá tu conexión e intentá de nuevo.</p>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

// ── HELPERS ─────────────────────────────────────────────────

function isStaticAsset(url) {
  const staticExtensions = ['.html', '.css', '.js', '.json', '.png', '.jpg', '.svg', '.woff2', '.ico'];
  const isAppOrigin = url.origin === self.location.origin;
  const isCDN = url.hostname === 'cdnjs.cloudflare.com' || url.hostname === 'fonts.googleapis.com';
  const hasStaticExtension = staticExtensions.some((ext) => url.pathname.endsWith(ext));

  return (isAppOrigin && hasStaticExtension) || isCDN;
}

// ── MENSAJES DESDE LA APP ───────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: APP_VERSION });
  }

  // Limpiar caché manualmente desde Settings
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      Promise.all(keys.map((key) => caches.delete(key))).then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
    });
  }
});
