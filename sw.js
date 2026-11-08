// Service worker: rende l'app utilizzabile offline.
// Quando aggiorni i file, cambia VERSION per forzare il ricaricamento.
const VERSION = 'v5';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-180.png',
  'data/rse.json', 'data/frlg.json', 'data/dppt.json', 'data/hgss.json', 'data/bw.json', 'data/b2w2.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(`shell-${VERSION}`).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('shell-') && k !== `shell-${VERSION}`).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Sprite: dalla cache se presenti, altrimenti scarico e salvo
  if (url.hostname === 'raw.githubusercontent.com') {
    e.respondWith(caches.open('sprites').then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok || res.type === 'opaque') c.put(e.request, res.clone());
      return res;
    }));
    return;
  }
  // File dell'app: prima la cache, poi la rete
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
  }
});
