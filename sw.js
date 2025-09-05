const staticCacheName = 'site-static-v3';
const assets = [
  '/BazarList/',
  '/BazarList/index.html',
  '/BazarList/app.js',
  '/BazarList/style.css',
  '/BazarList/offline.html',
  '/BazarList/manifest.json',
  '/BazarList/AppImages/android/android-launchericon-192-192.png',
  '/BazarList/AppImages/android/android-launchericon-512-512.png'
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
  if (evt.request.url.startsWith('http')) {
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).catch(() => caches.match('/BazarList/offline.html'));
      })
    );
  }
});
