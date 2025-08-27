/**
 * SystemCraft Service Worker - Performance Optimized Caching
 * Implements advanced caching strategies for optimal performance
 * Version: 1.0.0
 */

const CACHE_NAME = 'systemcraft-v1.0.0';
const STATIC_CACHE_NAME = 'systemcraft-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'systemcraft-dynamic-v1.0.0';
const OFFLINE_PAGE = '/offline.html';

// Cache strategies by resource type
const CACHE_STRATEGIES = {
  // Critical resources - Cache First with background sync
  critical: [
    '/',
    '/index.html',
    '/getting-started/',
    '/fundamentals/l6-vs-l7/',
    '/assets/css/core.min.css',
    '/assets/js/core.min.js',
    '/assets/js/runtime.min.js'
  ],
  
  // Static assets - Cache First with long TTL
  static: [
    /\.(?:css|js|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/,
    /\/assets\//
  ],
  
  // API requests - Network First with fallback
  api: [
    /\/api\//,
    /\/search\//
  ],
  
  // Documentation pages - Stale While Revalidate
  pages: [
    /\.html$/,
    /\/$/
  ],
  
  // External resources - Cache First with network fallback
  external: [
    /^https:\/\/cdn\./,
    /^https:\/\/unpkg\./,
    /^https:\/\/fonts\./
  ]
};

// Performance metrics tracking
const PERFORMANCE_METRICS = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  backgroundSyncs: 0
};

// Install event - Pre-cache critical resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Pre-cache critical resources
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Service Worker: Pre-caching critical resources');
        return cache.addAll(CACHE_STRATEGIES.critical);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - Implement caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Determine caching strategy
  const strategy = getCachingStrategy(request);
  
  switch (strategy) {
    case 'critical':
      event.respondWith(cacheFirstWithUpdate(request, STATIC_CACHE_NAME));
      break;
      
    case 'static':
      event.respondWith(cacheFirstWithFallback(request, STATIC_CACHE_NAME));
      break;
      
    case 'api':
      event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE_NAME));
      break;
      
    case 'pages':
      event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
      break;
      
    case 'external':
      event.respondWith(cacheFirstWithFallback(request, STATIC_CACHE_NAME, 86400000)); // 24 hours
      break;
      
    default:
      event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE_NAME));
  }
});

/**
 * Determine caching strategy for a request
 */
function getCachingStrategy(request) {
  const url = request.url;
  
  // Check critical resources first
  if (CACHE_STRATEGIES.critical.some(pattern => 
    typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)
  )) {
    return 'critical';
  }
  
  // Check static assets
  if (CACHE_STRATEGIES.static.some(pattern => pattern.test(url))) {
    return 'static';
  }
  
  // Check API requests
  if (CACHE_STRATEGIES.api.some(pattern => pattern.test(url))) {
    return 'api';
  }
  
  // Check external resources
  if (CACHE_STRATEGIES.external.some(pattern => pattern.test(url))) {
    return 'external';
  }
  
  // Check pages
  if (CACHE_STRATEGIES.pages.some(pattern => pattern.test(url))) {
    return 'pages';
  }
  
  return 'default';
}

/**
 * Cache First with Background Update
 * Best for critical resources that rarely change
 */
async function cacheFirstWithUpdate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      PERFORMANCE_METRICS.cacheHits++;
      
      // Background update
      event.waitUntil(
        fetch(request).then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
            PERFORMANCE_METRICS.backgroundSyncs++;
          }
        }).catch(() => {
          // Silently fail for background updates
        })
      );
      
      return cachedResponse;
    }
    
    // If not in cache, fetch and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    PERFORMANCE_METRICS.networkRequests++;
    return networkResponse;
    
  } catch (error) {
    PERFORMANCE_METRICS.cacheMisses++;
    return getOfflineFallback(request);
  }
}

/**
 * Cache First with Network Fallback
 * Best for static assets
 */
async function cacheFirstWithFallback(request, cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still fresh
      if (maxAge && isCacheExpired(cachedResponse, maxAge)) {
        throw new Error('Cache expired');
      }
      
      PERFORMANCE_METRICS.cacheHits++;
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Add timestamp for cache expiration
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set('sw-cache-timestamp', Date.now().toString());
      cache.put(request, responseToCache);
    }
    
    PERFORMANCE_METRICS.networkRequests++;
    return networkResponse;
    
  } catch (error) {
    PERFORMANCE_METRICS.cacheMisses++;
    
    // Try cache again as fallback
    const cache = await caches.open(cacheName);
    const fallback = await cache.match(request);
    
    if (fallback) {
      return fallback;
    }
    
    return getOfflineFallback(request);
  }
}

/**
 * Network First with Cache Fallback
 * Best for API requests and dynamic content
 */
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    PERFORMANCE_METRICS.networkRequests++;
    return networkResponse;
    
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      PERFORMANCE_METRICS.cacheHits++;
      return cachedResponse;
    }
    
    PERFORMANCE_METRICS.cacheMisses++;
    return getOfflineFallback(request);
  }
}

/**
 * Stale While Revalidate
 * Best for documentation pages that change occasionally
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
      PERFORMANCE_METRICS.backgroundSyncs++;
    }
    return response;
  }).catch(() => {
    // Ignore network errors for background updates
  });
  
  if (cachedResponse) {
    PERFORMANCE_METRICS.cacheHits++;
    // Update in background
    event.waitUntil(fetchPromise);
    return cachedResponse;
  }
  
  // If no cache, wait for network
  try {
    const networkResponse = await fetchPromise;
    PERFORMANCE_METRICS.networkRequests++;
    return networkResponse;
  } catch (error) {
    PERFORMANCE_METRICS.cacheMisses++;
    return getOfflineFallback(request);
  }
}

/**
 * Check if cached response is expired
 */
function isCacheExpired(response, maxAge) {
  const timestamp = response.headers.get('sw-cache-timestamp');
  if (!timestamp) return false;
  
  return Date.now() - parseInt(timestamp) > maxAge;
}

/**
 * Get offline fallback response
 */
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For navigation requests, return offline page
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const offlinePage = await cache.match(OFFLINE_PAGE);
    
    if (offlinePage) {
      return offlinePage;
    }
    
    // Return basic offline response
    return new Response(
      '<html><body><h1>Offline</h1><p>This page is not available offline.</p></body></html>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
  
  // For other resources, return appropriate fallback
  if (url.pathname.endsWith('.js')) {
    return new Response('console.warn("Script not available offline");', {
      status: 200,
      headers: { 'Content-Type': 'application/javascript' }
    });
  }
  
  if (url.pathname.endsWith('.css')) {
    return new Response('/* Styles not available offline */', {
      status: 200,
      headers: { 'Content-Type': 'text/css' }
    });
  }
  
  // Generic fallback
  return new Response('Resource not available offline', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline analytics, form submissions, etc.
  console.log('Service Worker: Background sync');
  
  try {
    // Send queued analytics data
    await sendQueuedAnalytics();
    
    // Update caches
    await updateCriticalCaches();
    
    PERFORMANCE_METRICS.backgroundSyncs++;
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function sendQueuedAnalytics() {
  // Implementation for sending queued analytics data
  const queuedData = await getQueuedAnalytics();
  
  if (queuedData.length > 0) {
    try {
      await fetch('/analytics/batch', {
        method: 'POST',
        body: JSON.stringify(queuedData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Clear queue after successful send
      await clearAnalyticsQueue();
    } catch (error) {
      console.log('Analytics sync will retry later');
    }
  }
}

async function updateCriticalCaches() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Update critical resources
  const updatePromises = CACHE_STRATEGIES.critical.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.log(`Failed to update cache for ${url}`);
    }
  });
  
  await Promise.allSettled(updatePromises);
}

// Handle push notifications (for future features)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/assets/images/icon-192x192.png',
        badge: '/assets/images/badge-72x72.png',
        tag: data.tag,
        requireInteraction: true
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_PERFORMANCE_METRICS') {
    event.ports[0].postMessage({
      type: 'PERFORMANCE_METRICS',
      data: PERFORMANCE_METRICS
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
    event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Utility functions for analytics queue (implement based on IndexedDB)
async function getQueuedAnalytics() {
  // Implementation would use IndexedDB to store offline analytics
  return [];
}

async function clearAnalyticsQueue() {
  // Clear IndexedDB queue
}

// Log service worker lifecycle for debugging
console.log('Service Worker: Script loaded');