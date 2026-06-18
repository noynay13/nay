/* =============================================
   SERVICE WORKER — NØYNAY PWA  v0.1.4
   ============================================= */

const CACHE_NAME = 'noynay-v0.1.4';

const CACHE_FILES = [
  './',
  './index.html',
  './card.html',
  './style.css',
  './script.js',
  './manifest.json',
  './images/front.png',
  './images/back.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Sarabun:wght@300;400;500;600;700&display=swap'
];

/* timers สำหรับ notification ที่ schedule ไว้ใน SW context */
let _swNotifTimers = [];

/* ── Install: cache ไฟล์ทั้งหมด ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

/* ── Activate: ลบ cache เก่า แล้วแจ้ง client ให้ reschedule ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(async () => {
        /* แจ้งทุก tab ที่เปิดอยู่ว่า SW พร้อมแล้ว → page จะ reschedule notifs */
        const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        all.forEach(c => c.postMessage({ type: 'SW_READY' }));
      })
  );
});

/* ── Fetch: Cache First → Network Fallback ── */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if(cached) return cached;
      return fetch(event.request).then(response => {
        if(response && response.status === 200 && response.type === 'basic'){
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => {
        if(event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

/* ── Message: รับ schedule / cancel จาก page ── */
self.addEventListener('message', event => {
  const { type, schedule } = event.data || {};

  /* SCHEDULE_NOTIFS — ตั้ง timer ใน SW context
     ทำงานแม้ tab จะถูก hide แต่ browser ยังเปิดอยู่ */
  if(type === 'SCHEDULE_NOTIFS'){
    _swNotifTimers.forEach(t => clearTimeout(t));
    _swNotifTimers = [];

    let cnt = 0;
    (schedule || []).forEach(item => {
      const delay = item.timestamp - Date.now();
      if(delay <= 0) return;
      _swNotifTimers.push(setTimeout(() => {
        self.registration.showNotification(item.title, {
          body  : item.body,
          icon  : './icons/icon-192.png',
          badge : './icons/icon-192.png',
          tag   : item.tag,
          silent: false,
          data  : { url: './index.html' }
        });
      }, delay));
      cnt++;
    });

    /* ยืนยันกลับหา page */
    event.source?.postMessage({ type: 'NOTIFS_SCHEDULED', count: cnt });
  }

  /* CANCEL_NOTIFS — ยกเลิก timer ทั้งหมด */
  if(type === 'CANCEL_NOTIFS'){
    _swNotifTimers.forEach(t => clearTimeout(t));
    _swNotifTimers = [];
  }
});

/* ── Notification click: เปิด/focus app ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        /* ถ้ามี tab เปิดอยู่แล้ว → focus */
        for(const client of list){
          if(client.url.includes('index.html') && 'focus' in client) return client.focus();
        }
        /* ไม่มี → เปิด tab ใหม่ */
        return self.clients.openWindow('./index.html');
      })
  );
});
