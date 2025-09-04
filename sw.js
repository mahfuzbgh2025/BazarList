const CACHE_NAME = "bazarlist-cache-v3";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./style.css",
  "./app.js",
  "./offline.html",

  // ---- Android Icons ----
  "./AppImages/android/android-launchericon-48-48.png",
  "./AppImages/android/android-launchericon-72-72.png",
  "./AppImages/android/android-launchericon-96-96.png",
  "./AppImages/android/android-launchericon-144-144.png",
  "./AppImages/android/android-launchericon-192-192.png",
  "./AppImages/android/android-launchericon-512-512.png",

  // ---- iOS Icons ----
  "./AppImages/ios/16.png",
  "./AppImages/ios/20.png",
  "./AppImages/ios/29.png",
  "./AppImages/ios/32.png",
  "./AppImages/ios/40.png",
  "./AppImages/ios/50.png",
  "./AppImages/ios/57.png",
  "./AppImages/ios/58.png",
  "./AppImages/ios/60.png",
  "./AppImages/ios/64.png",
  "./AppImages/ios/72.png",
  "./AppImages/ios/76.png",
  "./AppImages/ios/80.png",
  "./AppImages/ios/87.png",
  "./AppImages/ios/100.png",
  "./AppImages/ios/114.png",
  "./AppImages/ios/120.png",
  "./AppImages/ios/128.png",
  "./AppImages/ios/144.png",
  "./AppImages/ios/152.png",
  "./AppImages/ios/167.png",
  "./AppImages/ios/180.png",
  "./AppImages/ios/192.png",
  "./AppImages/ios/256.png",
  "./AppImages/ios/512.png",
  "./AppImages/ios/1024.png",

  // ---- Windows Icons ----
  "./AppImages/windows11/SmallTile.scale-100.png",
  "./AppImages/windows11/SmallTile.scale-125.png",
  "./AppImages/windows11/SmallTile.scale-150.png",
  "./AppImages/windows11/SmallTile.scale-200.png",
  "./AppImages/windows11/SmallTile.scale-400.png",
  "./AppImages/windows11/Square150x150Logo.scale-100.png",
  "./AppImages/windows11/Square150x150Logo.scale-125.png",
  "./AppImages/windows11/Square150x150Logo.scale-150.png",
  "./AppImages/windows11/Square150x150Logo.scale-200.png",
  "./AppImages/windows11/Square150x150Logo.scale-400.png",
  "./AppImages/windows11/Wide310x150Logo.scale-100.png",
  "./AppImages/windows11/Wide310x150Logo.scale-125.png",
  "./AppImages/windows11/Wide310x150Logo.scale-150.png",
  "./AppImages/windows11/Wide310x150Logo.scale-200.png",
  "./AppImages/windows11/Wide310x150Logo.scale-400.png",
  "./AppImages/windows11/LargeTile.scale-100.png",
  "./AppImages/windows11/LargeTile.scale-125.png",
  "./AppImages/windows11/LargeTile.scale-150.png",
  "./AppImages/windows11/LargeTile.scale-200.png",
  "./AppImages/windows11/LargeTile.scale-400.png",
  "./AppImages/windows11/Square44x44Logo.scale-100.png",
  "./AppImages/windows11/Square44x44Logo.scale-125.png",
  "./AppImages/windows11/Square44x44Logo.scale-150.png",
  "./AppImages/windows11/Square44x44Logo.scale-200.png",
  "./AppImages/windows11/Square44x44Logo.scale-400.png",
  "./AppImages/windows11/StoreLogo.scale-100.png",
  "./AppImages/windows11/StoreLogo.scale-125.png",
  "./AppImages/windows11/StoreLogo.scale-150.png",
  "./AppImages/windows11/StoreLogo.scale-200.png",
  "./AppImages/windows11/StoreLogo.scale-400.png",
  "./AppImages/windows11/SplashScreen.scale-100.png",
  "./AppImages/windows11/SplashScreen.scale-125.png",
  "./AppImages/windows11/SplashScreen.scale-150.png",
  "./AppImages/windows11/SplashScreen.scale-200.png",
  "./AppImages/windows11/SplashScreen.scale-400.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and adding files...");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./offline.html");
          }
        });
    })
  );
});

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