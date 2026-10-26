// Background push handler for Firebase Cloud Messaging.
// Keep this config in sync with environment FIREBASE values.
// Without this file at the site root, pushes do not show while the tab is closed.

importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: 'AIzaSyBHsnK3de9lnvPb0R8QaoSP8d1-UgXRplQ',
  authDomain: 'eureka-peopleops.firebaseapp.com',
  projectId: 'eureka-peopleops',
  storageBucket: 'eureka-peopleops.firebasestorage.app',
  messagingSenderId: '183927025702',
  appId: '1:183927025702:web:a238a58b40a9182523b6e7',
});

const messaging = firebase.messaging();

// Fallback if the payload is data-only (no notification block).
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || payload.data?.title || 'Notification';
  const body = payload.notification?.body || payload.data?.body || '';
  const link =
    payload.fcmOptions?.link ||
    payload.data?.route ||
    payload.notification?.click_action ||
    '/';

  return self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    data: { url: link, ...payload.data },
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target =
    event.notification.data?.url ||
    event.notification.data?.route ||
    '/';
  const absolute =
    typeof target === 'string' && target.startsWith('http')
      ? target
      : new URL(target || '/', self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if ('focus' in client && 'navigate' in client) {
            return client.navigate(absolute).then(c => (c ? c.focus() : client.focus()));
          }
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(absolute);
        }
        return undefined;
      })
  );
});
