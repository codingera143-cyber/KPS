// 1. OneSignal - ISKO HUMESHA TOP PAR RAKHEIN (Varna notification nahi chalega)
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_NAME = 'kps-v10';

const ASSETS_TO_CACHE = [
  './',
  './index',
  './index.css',
  './navbar',
  './noticearchive',
  './footer',
  './site.webmanifest',
  './img/android-chrome-192x192.png',
  './img/android-chrome-512x512.png',
  './img/unnamed (1).webp'
];

// Install Event
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('KPS: Caching Assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event (Storage Clean-up)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // A. Video files ko skip karo (Storage issue fix)
  if (url.pathname.endsWith('.mp4') || url.pathname.endsWith('.webm')) {
    return; 
  }

  // B. Google Sheets (Network-First Strategy)
  if (url.hostname === 'docs.google.com') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Check if response is valid before caching
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request, { ignoreSearch: true });
        })
    );
    return;
  }

  // C. Static Assets (Cache-First)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        // Cache naye GET requests (Jaise images ya icons)
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      });
    })
  );
});
