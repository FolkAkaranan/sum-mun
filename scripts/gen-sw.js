// สร้าง public/sw.js ใหม่ทุกครั้งที่ build โดยฝัง build id ลงชื่อ cache
// เพื่อให้ browser เห็นว่าไฟล์ sw.js เปลี่ยน (ไบต์ต่างจากเดิม) แล้ว trigger install/activate ใหม่ทันที
// รันอัตโนมัติก่อน next build ผ่าน npm "prebuild" hook (ดู package.json)
const fs = require("fs");
const path = require("path");

const buildId = Date.now().toString(36);
const cacheName = `sum-mun-${buildId}`;

const sw = `/* ไฟล์นี้ถูก generate อัตโนมัติโดย scripts/gen-sw.js ตอน build ห้ามแก้มือ */
const CACHE_NAME = "${cacheName}";

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
`;

const out = path.join(__dirname, "..", "public", "sw.js");
fs.writeFileSync(out, sw);
console.log("wrote", out, "cache:", cacheName);
