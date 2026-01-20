// 1. OneSignal - ISKO HUMESHA TOP PAR RAKHEIN
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_NAME = 'kps-v11';

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

  // A. Video files ko skip karo
  if (url.pathname.endsWith('.mp4') || url.pathname.endsWith('.webm')) {
    return; 
  }

  // B. Google Sheets & API (NEW Smart Background Sync Strategy)
  // Isse purana notice turant dikhega aur naya background mein download hoga
  if (url.hostname === 'docs.google.com' || url.hostname === 'sheetdb.io') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
          
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone()); // Naya data save ho gaya for future
            }
            return networkResponse;
          }).catch(() => {
             console.log("Network down, using only cache");
          });

          // Cached data pehle dikhao (Speed), Fetch background mein chalne do (Sync)
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // C. Static Assets (Cache-First) - Purana Logic as it is
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      });
    })
  );
});
