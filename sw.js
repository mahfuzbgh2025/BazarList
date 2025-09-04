// Cache version নাম
const CACHE_NAME = "bazarlist-cache-v3";

// Pre-cache ফাইল লিস্ট
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./style.css",
  "./app.js",
  "./offline.html", // offline fallback

  // ---- Android Icons ----
  "./android/android-launchericon-48-48.png",
  "./android/android-launchericon-72-72.png",
  "./android/android-launchericon-96-96.png",
  "./android/android-launchericon-144-144.png",
  "./android/android-launchericon-192-192.png",
  "./android/android-launchericon-512-512.png",

  // ---- iOS Icons ----
  "./ios/16.png",
  "./ios/20.png",
  "./ios/29.png",
  "./ios/32.png",
  "./ios/40.png",
  "./ios/50.png",
  "./ios/57.png",
  "./ios/58.png",
  "./ios/60.png",
  "./ios/64.png",
  "./ios/72.png",
  "./ios/76.png",
  "./ios/80.png",
  "./ios/87.png",
  "./ios/100.png",
  "./ios/114.png",
  "./ios/120.png",
  "./ios/128.png",
  "./ios/144.png",
  "./ios/152.png",
  "./ios/167.png",
  "./ios/180.png",
  "./ios/192.png",
  "./ios/256.png",
  "./ios/512.png",
  "./ios/1024.png",

  // ---- Windows Icons ----
  "./windows11/SmallTile.scale-100.png",
  "./windows11/SmallTile.scale-125.png",
  "./windows11/SmallTile.scale-150.png",
  "./windows11/SmallTile.scale-200.png",
  "./windows11/SmallTile.scale-400.png",
  "./windows11/Square150x150Logo.scale-100.png",
  "./windows11/Square150x150Logo.scale-125.png",
  "./windows11/Square150x150Logo.scale-150.png",
  "./windows11/Square150x150Logo.scale-200.png",
  "./windows11/Square150x150Logo.scale-400.png",
  "./windows11/Wide310x150Logo.scale-100.png",
  "./windows11/Wide310x150Logo.scale-125.png",
  "./windows11/Wide310x150Logo.scale-150.png",
  "./windows11/Wide310x150Logo.scale-200.png",
  "./windows11/Wide310x150Logo.scale-400.png",
  "./windows11/LargeTile.scale-100.png",
  "./windows11/LargeTile.scale-125.png",
  "./windows11/LargeTile.scale-150.png",
  "./windows11/LargeTile.scale-200.png",
  "./windows11/LargeTile.scale-400.png",
  "./windows11/Square44x44Logo.scale-100.png",
  "./windows11/Square44x44Logo.scale-125.png",
  "./windows11/Square44x44Logo.scale-150.png",
  "./windows11/Square44x44Logo.scale-200.png",
  "./windows11/Square44x44Logo.scale-400.png",
  "./windows11/StoreLogo.scale-100.png",
  "./windows11/StoreLogo.scale-125.png",
  "./windows11/StoreLogo.scale-150.png",
  "./windows11/StoreLogo.scale-200.png",
  "./windows11/StoreLogo.scale-400.png",
  "./windows11/SplashScreen.scale-100.png",
  "./windows11/SplashScreen.scale-125.png",
  "./windows11/SplashScreen.scale-150.png",
  "./windows11/SplashScreen.scale-200.png",
  "./windows11/SplashScreen.scale-400.png"
];

// Install Event (Pre-cache)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and adding files...");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch Event (Dynamic cache + Offline fallback)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // cache hit
      }
      return fetch(event.request)
        .then((networkResponse) => {
          // নতুন রিসোর্স cache করে রাখা
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // যদি offline হয় এবং cache না থাকে → offline.html দেখাও
          if (event.request.mode === "navigate") {
            return caches.match("./offline.html");
          }
        });
    })
  );
});

// Activate Event (Old cache clean)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Old cache removed:", cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});