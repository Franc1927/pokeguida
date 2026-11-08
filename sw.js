// Service worker: rende l'app utilizzabile offline.
// File dell'app: se sei online scarica sempre la versione più recente,
// se sei offline usa la copia salvata. Sprite: copia salvata appena possibile.
const VERSION = 'v6';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-180.png',
  'data/rse.json', 'data/frlg.json', 'data/dppt.json', 'data/hgss.json', 'data/bw.json', 'data/b2w2.json'];
const SHELL_CACHE = `shell-${VERSION}`;

self.addEventListener('install', e => {
  // cache: 'reload' = scarica dal sito, ignorando la cache del browser
  e.waitUntil(caches.open(SHELL_CACHE)
    .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('shell-') && k !== SHELL_CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

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

  if (url.origin === location.origin) {
    e.respondWith((async () => {
      const c = await caches.open(SHELL_CACHE);
      const key = url.origin + url.pathname;
      try {
        const res = await fetch(key, { cache: 'no-cache' });
        if (res.ok) c.put(key, res.clone());
        return res;
      } catch {
        return (await c.match(key)) || (await c.match(e.request, { ignoreSearch: true })) ||
               (e.request.mode === 'navigate' && await c.match('./')) || Response.error();
      }
    })());
  }
});
