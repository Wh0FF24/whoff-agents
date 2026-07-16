/* SeatSage service worker — cache-first for app shell so it works offline at the venue. */
var CACHE = "seatsage-v2";
var ASSETS = [
  "index.html",
  "app.html",
  "css/style.css",
  "js/config.js",
  "js/app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/sprite.svg",
  "fonts/cabinet-grotesk-700.woff2",
  "fonts/cabinet-grotesk-800.woff2",
  "fonts/satoshi-400.woff2",
  "fonts/satoshi-500.woff2",
  "fonts/satoshi-700.woff2"
];
self.addEventListener("install", function (e) {
  // cache each asset individually so one miss (e.g. SSR-served pages) doesn't
  // break the whole offline install
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(ASSETS.map(function (a) {
      return c.add(a).catch(function () {});
    }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});
