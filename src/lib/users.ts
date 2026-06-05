import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import { db } from './firebase';

export type Recipient = {
  uid: string;
  username?: string;
  email?: string;
  displayName?: string;
};

/**
 * Resolve a typed value (an email or a @username) to a real account.
 * Returns null if nothing matches or Firebase isn't configured.
 */
export async function findRecipient(text: string): Promise<Recipient | null> {
  if (!db) return null;
  const raw = text.trim().replace(/^@/, '');
  if (!raw) return null;

  if (raw.includes('@')) {
    // Looks like an email → query the users collection by its lowercased email.
    const snap = await getDocs(
      query(collection(db, 'users'), where('emailLower', '==', raw.toLowerCase()), limit(1))
    );
    if (snap.empty) return null;
    const d = snap.docs[0];
    const data = d.data() as { email?: string; username?: string; displayName?: string };
    return { uid: d.id, email: data.email, username: data.username, displayName: data.displayName };
  }

  // Otherwise treat it as a username → the public usernames/{handle} lookup doc.
  const handle = raw.toLowerCase();
  const uSnap = await getDoc(doc(db, 'usernames', handle));
  if (!uSnap.exists()) return null;
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
