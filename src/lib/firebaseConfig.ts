// ───────────────────────────────────────────────────────────────────────────
// PASTE YOUR FIREBASE WEB CONFIG HERE.
// Firebase console → Project settings (gear) → Your apps → web app → firebaseConfig.
// These web values are NOT secrets in Firebase's model (security comes from rules),
// but keep them here in one place. `firebaseEnabled` flips to true automatically
// once you replace the placeholder apiKey below — until then the app runs exactly
// as it does now (no login required).
// ───────────────────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: 'AIzaSyBIah-WZxkC6WB_HvS4hktHzhLHaMMJnr8',
  authDomain: 'open-when-c82c9.firebaseapp.com',
  projectId: 'open-when-c82c9',
  storageBucket: 'open-when-c82c9.firebasestorage.app',
  messagingSenderId: '651395050347',
  appId: '1:651395050347:web:cee1a305875d5cd8853a2e',
};

export const firebaseEnabled = !firebaseConfig.apiKey.startsWith('PASTE');
