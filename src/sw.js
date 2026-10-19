// Service worker: permite abrir la app sin conexión (p. ej. en un gimnasio sin señal).
// Abre al instante con la copia guardada en el teléfono y, a la vez, descarga la versión nueva
// para la próxima apertura (así funciona igual con poca o ninguna señal). Solo toca archivos de la propia app.
// tools/build.mjs sustituye __VERSION__ en cada compilación.
const CACHE = "th-__VERSION__";
const SHELL = ["./", "./index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      // Una petición de página (navigate) no admite opciones: se pide por su URL.
      // no-cache: pregunta al servidor si hay versión nueva (si no la hay, apenas gasta datos).
      const net = fetch(req.mode === "navigate" ? req.url : req, { cache: "no-cache" }).then((res) => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      });
      const saved = (await cache.match(req, { ignoreSearch: true })) || (req.mode === "navigate" && (await cache.match("./index.html")));
      if (saved) {
        e.waitUntil(net.catch(() => {}));
        return saved;
      }
      return net;
    })(),
  );
});
