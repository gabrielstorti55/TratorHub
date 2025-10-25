// Service Worker para cache offline e melhor performance
const CACHE_NAME = 'agromachine-v1';
const RUNTIME_CACHE = 'agromachine-runtime';

// Recursos para cache inicial
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instalação - fazer cache dos recursos iniciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Estratégia de cache: Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não sejam GET
  if (event.request.method !== 'GET') return;

  // Ignorar requisições de APIs externas (Supabase, IBGE)
  if (event.request.url.includes('supabase') || 
      event.request.url.includes('ibge.gov.br')) {
    return;
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Cachear apenas respostas bem-sucedidas
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // Se falhar (offline), tentar buscar do cache
          return cache.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Se não estiver no cache, retornar página offline
            return caches.match('/');
          });
        });
    })
  );
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
