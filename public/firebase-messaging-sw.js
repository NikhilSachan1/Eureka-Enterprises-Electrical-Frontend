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

firebase.messaging();
// Server sends a notification payload with a click link, so Firebase shows
// the system notification and opens the portal page on click.
