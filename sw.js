'use strict';
/* Service worker do simulador: guarda a página e as bibliotecas para abrir sem internet. Nenhum dado digitado passa por aqui:
   o cálculo e o rascunho ficam no navegador de quem usa. A cada nova publicação o nome do cache muda e o antigo é apagado. */
const CACHE = "escalas-ec141-721e8493-mwdow72j";
const BASICO = ['./', 'index.html', 'manifest.webmanifest', 'icones/icone-192.png', 'icones/icone-512.png', 'icones/apple-touch-icon.png', 'icones/favicon-32.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASICO)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
const guardar = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(CACHE).then((k) => k.put(req, c)); } return res; };
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    // página: sempre a versão mais nova quando há rede; sem rede, a última guardada
    e.respondWith(fetch(req).then((r) => guardar('index.html', r)).catch(() => caches.match('index.html')));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req).then((c) => c || fetch(req).then((r) => guardar(req, r))));
    return;
  }
  // bibliotecas e fontes de CDN: rede primeiro, cópia guardada se cair
  e.respondWith(fetch(req).then((r) => guardar(req, r)).catch(() => caches.match(req)));
});
