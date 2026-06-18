/**
 * Service Worker - Football Manager PWA
 * Intercepta peticiones de red y cachea para modo offline
 */

const CACHE_NAME = 'football-manager-v1';
const urlsACache = [
    './',
    './index.html',
    './manifest.json',
    './data/equipos.json',
    './js/engine/Audio.js',
    './js/engine/Tactica.js',
    './js/models/Noticias.js',
    './js/controllers/integracion.js',
    './js/canvas-render.js',
    './assets/images/icon.png',
    './assets/images/splash-icon.png',
    './assets/images/favicon.png'
];

/**
 * Evento: Instalación del Service Worker
 * Cachea los archivos críticos
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cacheando archivos críticos...');
                return cache.addAll(urlsACache);
            })
            .then(() => {
                console.log('[SW] ✓ Archivos cacheados');
                self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Error durante instalación:', error);
            })
    );
});

/**
 * Evento: Activación del Service Worker
 * Limpia cachés antiguos
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Eliminando caché antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] ✓ Cachés antiguos eliminados');
                return self.clients.claim();
            })
    );
});

/**
 * Evento: Interceptación de peticiones
 * Estrategia: Cache First, Network Fallback
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // No cachear peticiones a dominios externos
    if (url.origin !== location.origin) {
        return;
    }
    
    // Estrategia: Cache First para archivos estáticos
    if (request.method === 'GET') {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        console.log('[SW] Sirviendo desde caché:', request.url);
                        return response;
                    }
                    
                    // Si no está en caché, intentar red
                    return fetch(request)
                        .then((response) => {
                            // No cachear respuestas no exitosas
                            if (!response || response.status !== 200 || response.type === 'error') {
                                return response;
                            }
                            
                            // Cachear respuesta exitosa
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });
                            
                            return response;
                        })
                        .catch(() => {
                            // Si falla la red, intentar caché
                            console.log('[SW] Red no disponible, usando caché:', request.url);
                            return caches.match(request)
                                .then((cachedResponse) => {
                                    if (cachedResponse) {
                                        return cachedResponse;
                                    }
                                    
                                    // Fallback: página offline
                                    if (request.destination === 'document') {
                                        return caches.match('./index.html');
                                    }
                                });
                        });
                })
        );
    }
});

/**
 * Evento: Sincronización en background (opcional)
 * Útil para sincronizar datos cuando se recupera conexión
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-datos') {
        event.waitUntil(
            // Aquí iría la lógica de sincronización
            Promise.resolve()
        );
    }
});

/**
 * Evento: Notificaciones push (opcional)
 */
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'Nueva notificación',
        icon: './assets/images/icon-192.png',
        badge: './assets/images/icon-96.png',
        tag: 'football-manager-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Football Manager', options)
    );
});

console.log('[SW] Service Worker cargado');
