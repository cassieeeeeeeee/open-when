// Firebase web config for this project. These web values are not secrets in Firebase's
// model — access is enforced by Firestore security rules, not by hiding the config — so
// they live here in one place. `firebaseEnabled` stays false until a real apiKey is set,
// so the app runs on bundled sample data (no login) until the backend is wired up.
export const firebaseConfig = {
  apiKey: 'AIzaSyBIah-WZxkC6WB_HvS4hktHzhLHaMMJnr8',
  authDomain: 'open-when-c82c9.firebaseapp.com',
  projectId: 'open-when-c82c9',
  storageBucket: 'open-when-c82c9.firebasestorage.app',
  messagingSenderId: '651395050347',
  appId: '1:651395050347:web:cee1a305875d5cd8853a2e',
};

export const firebaseEnabled = !firebaseConfig.apiKey.startsWith('PASTE');
