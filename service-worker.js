const CACHE_NAME = 'cricext-cache-v1';
const BASE_PATH = '/cricext';

const FILES_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/script.js`,
  `${BASE_PATH}/scores.json`,
  `${BASE_PATH}/tweets.json`,
  `${BASE_PATH}/logo.png`,
  `${BASE_PATH}/stadium.png`,
  `${BASE_PATH}/flags/india.png`,
  `${BASE_PATH}/flags/pakistan.png`,
  `${BASE_PATH}/flags/australia.png`,
  `${BASE_PATH}/flags/england.png`,
  `${BASE_PATH}/flags/south-africa.png`,
  `${BASE_PATH}/flags/new-zealand.png`,
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
