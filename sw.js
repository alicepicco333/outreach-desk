// Keeps the app shell available offline; email data always comes fresh from the network.
const CACHE = "outreach-v10";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting() });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== "GET") return;          // ntfy and fonts: straight to network
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});

// Notifications sent by your PC (web push). Tapping one opens Outreach.
self.addEventListener("push", e => {
  let d = { title: "Outreach", body: "", url: "./" };
  try { d = Object.assign(d, e.data.json()) } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: "icon-192.png", badge: "icon-192.png", data: { url: d.url } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) if ("focus" in c) return c.focus();
    return clients.openWindow(e.notification.data.url);
  }));
});
