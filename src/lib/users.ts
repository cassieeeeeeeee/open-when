import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import { people } from '@/data/sample';

import { db } from './firebase';

export type Recipient = {
  uid: string;
  username?: string;
  email?: string;
  displayName?: string;
};

// The bundled People (e.g. Jess, Sam) double as demo contacts you can send to, so the send-to flow
// works without a second real account having to exist. Real Firebase accounts take priority; these
// fill in when there's no live match. Their uid is the sample person id, so they're a stand-in
// recipient (great for demos/screenshots), not a real deliverable inbox.
function sampleRecipient(raw: string): Recipient | null {
  const lc = raw.toLowerCase();
  const p = people.find(
    (x) => x.username?.toLowerCase() === lc || x.email?.toLowerCase() === lc || x.name.toLowerCase() === lc
  );
  return p ? { uid: p.id, username: p.username, email: p.email, displayName: p.name } : null;
}

/**
 * Resolve a typed value (an email, a @username, or a known name) to a recipient — a real Firebase
 * account first, otherwise one of the bundled demo contacts. Returns null if nothing matches.
 */
export async function findRecipient(text: string): Promise<Recipient | null> {
  const raw = text.trim().replace(/^@/, '');
  if (!raw) return null;

  if (db) {
    try {
      if (raw.includes('@')) {
        // Looks like an email → query the users collection by its lowercased email.
        const snap = await getDocs(
          query(collection(db, 'users'), where('emailLower', '==', raw.toLowerCase()), limit(1))
        );
        if (!snap.empty) {
          const d = snap.docs[0];
          const data = d.data() as { email?: string; username?: string; displayName?: string };
          return { uid: d.id, email: data.email, username: data.username, displayName: data.displayName };
        }
      } else {
        // Otherwise treat it as a username → the public usernames/{handle} lookup doc.
        const handle = raw.toLowerCase();
        const uSnap = await getDoc(doc(db, 'usernames', handle));
        if (uSnap.exists()) {
          const { uid, email } = uSnap.data() as { uid: string; email?: string };
          let displayName: string | undefined;
          let username: string | undefined = handle;
          try {
            const profile = await getDoc(doc(db, 'users', uid));
            if (profile.exists()) {
              const pd = profile.data() as { displayName?: string; username?: string };
              displayName = pd.displayName;
              username = pd.username ?? handle;
            }
          } catch {
            // Non-fatal: we still have uid + email + handle to send to.
          }
          return { uid, email, username, displayName };
        }
      }
    } catch {
      // Firestore unavailable / permission denied → fall back to the bundled demo contacts.
    }
  }

  return sampleRecipient(raw);
}
