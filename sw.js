/* =============================================
   SERVICE WORKER — Drak Nay PWA
   ============================================= */

const CACHE_NAME = 'draknay-v1';

// ไฟล์ที่จะ cache ไว้ใช้ offline
const CACHE_FILES = [
  './',
  './index.html',
  './card.html',
  './manifest.json',
  './images/front.png',
  './images/back.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap'
];

/* ── Install: cache ไฟล์ทั้งหมด ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

/* ── Activate: ลบ cache เก่า ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: Cache First → Network Fallback ── */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // cache ไฟล์ใหม่ที่ดึงมาด้วย
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, cloned);
          });
        }
        return response;
      }).catch(() => {
        // ถ้า offline และไม่มี cache → แสดง index.html แทน
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
