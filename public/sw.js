/* ENF@BACKES safe offline shell — never cache authenticated HTML or clinical API responses. */
const OFFLINE_CACHE='enfbackes-offline-v1';
const OFFLINE_PAGE='/offline.html';
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(OFFLINE_CACHE).then(cache=>cache.add(OFFLINE_PAGE)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('enfbackes-offline-')&&k!==OFFLINE_CACHE).map(k=>caches.delete(k)))));
 self.clients.claim();
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 // All APIs, JavaScript and other resources are network-only.
 // Navigation requests use network-first but never cache the page response.
 if(req.mode!=='navigate'||req.method!=='GET')return;
 event.respondWith(fetch(req).catch(()=>caches.match(OFFLINE_PAGE)));
});
