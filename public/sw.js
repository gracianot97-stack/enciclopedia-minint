const CACHE_NAME = 'minint-prep-cache-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Evento de Instalação: Cacheia os arquivos essenciais iniciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pré-cacheando arquivos estáticos');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Evento de Ativação: Limpa caches antigos de imediato
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento de Fetch: Intercepta requisições e serve da rede primeiro (com fallback para cache se offline)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Ignorar requisições do chrome-extension ou esquemas não-http
  if (!event.request.url.startsWith('http')) return;

  // Estratégia Network-First (Rede Primeiro) com Cache Fallback (Queda para Cache)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Salva apenas respostas de sucesso (status 200) no cache dinâmico
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se a rede falhar (está offline), busca do Cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Caso seja navegação de página principal e falhe, tenta retornar a raiz do cache
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
