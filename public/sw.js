/* ไฟล์นี้ถูก generate อัตโนมัติโดย scripts/gen-sw.js ตอน build ห้ามแก้มือ */
const CACHE_NAME = "sum-mun-mrrkcn41";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // หน้า HTML (navigation) ต้องได้เนื้อหาล่าสุดก่อนเสมอเมื่อมีเน็ต ไม่งั้นแอปที่ปักหน้าจอ
  // (โดยเฉพาะ iOS PWA) จะค้างเวอร์ชันเก่าเพราะไม่มีการ reload ให้เช็คเอง
  const isNavigation =
    event.request.mode === "navigate" || event.request.headers.get("accept")?.includes("text/html");

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // asset อื่นๆ (js/css/รูป ที่มี hash ในชื่อไฟล์อยู่แล้ว) ใช้ stale-while-revalidate ตามเดิม
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
