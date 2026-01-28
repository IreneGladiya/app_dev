// Poovaasam Service Worker
const CACHE_NAME = 'poovaasam-v1.2';

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
            ]);
        })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Update cache in background
                    fetch(event.request).then(response => {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, response);
                        });
                    });
                    return cachedResponse;
                }
                
                return fetch(event.request).catch(() => {
                    // Return offline fallback
                    if (event.request.destination === 'image') {
                        return new Response(
                            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f5f5f5"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999" font-size="10">🌸</text></svg>',
                            { headers: { 'Content-Type': 'image/svg+xml' } }
                        );
                    }
                    
                    // For HTML, return the main page
                    return caches.match('/');
                });
            })
    );
});