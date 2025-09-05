const staticCacheName = 'site-static-v2';
const assets = [
  '/BazarList/',
  '/BazarList/index.html',
  '/BazarList/app.js',
  '/BazarList/style.css',
  '/BazarList/offline.html',
  './AppImages/android/android-launchericon-192-192.png',
  './AppImages/android/android-launchericon-512-512.png'
];

// Install event
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('caching shell assets');
      return cache.addAll(assets);
    })
  );
});

// Activate event
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', evt => {
  if (evt.request.url.indexOf('http') === 0) { // Check if the request is for a network resource
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).catch(() => caches.match('/BazarList/offline.html'));
      })
    );
  }
});
