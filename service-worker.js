const BASE = location.pathname;
const FILES_TO_CACHE = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}style.css`,
  `${BASE}script.js`,
  `${BASE}scores.json`,
  `${BASE}tweets.json`,
  `${BASE}logo.png`,
  `${BASE}stadium.png`,
  `${BASE}flags/india.png`,
  `${BASE}flags/pakistan.png`,
  `${BASE}flags/australia.png`,
  `${BASE}flags/england.png`,
  `${BASE}flags/south-africa.png`,
  `${BASE}flags/new-zealand.png`,
];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) =>
      response || fetch(event.request)
    )
  );
});

