// Service Worker for PWA functionality
const CACHE_NAME = 'ip-calculator-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  // Add other static assets as needed
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.ipify\.org/,
  /^https:\/\/ip-api\.com/,
  /^https:\/\/cloudflare-dns\.com/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML documents - network first, fallback to cache
    event.respondWith(networkFirstStrategy(request));
  } else if (isStaticAsset(request)) {
    // Static assets - cache first
    event.respondWith(cacheFirstStrategy(request));
  } else if (isAPIRequest(url)) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirstWithCacheStrategy(request));
  } else {
    // Other requests - network first
    event.respondWith(networkFirstStrategy(request));
  }
});

// Network first strategy (for HTML and API)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

// Cache first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Failed to fetch asset', request.url, error);
    throw error;
  }
}

// Network first with cache strategy (for API requests)
async function networkFirstWithCacheStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Cache API responses for 5 minutes
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set('sw-cache-timestamp', Date.now().toString());
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: API request failed, trying cache', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if cached response is still fresh (5 minutes)
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
      if (cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 5 * 60 * 1000) {
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/);
}

function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-calculation-sync') {
    event.waitUntil(syncCalculations());
  }
});

// Sync calculations when back online
async function syncCalculations() {
  try {
    // Get pending calculations from IndexedDB or localStorage
    const pendingCalculations = JSON.parse(localStorage.getItem('pending-calculations') || '[]');
    
    if (pendingCalculations.length > 0) {
      console.log('Service Worker: Syncing pending calculations', pendingCalculations.length);
      
      // Process pending calculations
      for (const calculation of pendingCalculations) {
        // Perform any necessary API calls or processing
        console.log('Service Worker: Processing calculation', calculation.id);
      }
      
      // Clear pending calculations
      localStorage.removeItem('pending-calculations');
      
      // Notify clients
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'CALCULATIONS_SYNCED',
          count: pendingCalculations.length
        });
      });
    }
  } catch (error) {
    console.error('Service Worker: Error syncing calculations', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ouvrir l\'application',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Calculateur IP', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});