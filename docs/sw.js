/**
 * Service Worker for SystemCraft
 * Implements caching strategies for improved performance
 * Note: This won't work on GitHub Pages but serves as a template
 */

const CACHE_NAME = 'systemcraft-v1';
const STATIC_CACHE = 'systemcraft-static-v1';
const DYNAMIC_CACHE = 'systemcraft-dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/getting-started/',
  '/offline.html', // You'd need to create this
  '/manifest.json',
  '/stylesheets/extra.css',
  '/javascripts/performance.js',
  '/javascripts/security.js',
  '/javascripts/mobile-enhancements.js',
  '/javascripts/mathjax.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting() // Activate immediately
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('systemcraft-') && 
                     !['systemcraft-static-v1', 'systemcraft-dynamic-v1'].includes(cacheName);
            })
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      self.clients.claim() // Take control immediately
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // Different strategies for different types of content
  if (isStaticAsset(url.pathname)) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request));
  } else if (isPageRequest(request)) {
    // Network first for pages (with fallback)
    event.respondWith(networkFirst(request));
  } else if (isAPIRequest(url.pathname)) {
    // Network only for API requests
    return;
  } else {
    // Stale while revalidate for other resources
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache first strategy (for static assets)
async function cacheFirst(request) {
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
    console.warn('Failed to fetch:', request.url, error);
    return new Response('Network error', { status: 503 });
  }
}

// Network first strategy (for pages)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      return offlinePage || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.includes('/assets/') || 
         pathname.includes('/stylesheets/') ||
         pathname.includes('/javascripts/') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.svg');
}

function isPageRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

function isAPIRequest(pathname) {
  return pathname.includes('/api/') || pathname.includes('/search/');
}

// Background sync for analytics (if supported)
self.addEventListener('sync', event => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Placeholder for analytics sync
  console.log('Syncing analytics data...');
}

// Push notification handling (for future use)
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: data.actions
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action) {
    // Handle action buttons
    console.log('Notification action clicked:', event.action);
  } else {
    // Handle main notification click
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});