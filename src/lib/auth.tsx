import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { auth, db } from './firebase';
import { firebaseEnabled } from './firebaseConfig';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  configured: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (name: string, username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/** Canonical (lookup) form of a username: trimmed + lowercased. */
function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

/** Upsert a discoverable profile doc for this user, so other accounts can find them later. */
async function upsertUserDoc(u: User, extra?: Record<string, unknown>) {
  if (!db) return;
  const data: Record<string, unknown> = {
    uid: u.uid,
    email: u.email ?? null,
    emailLower: (u.email ?? '').trim().toLowerCase(),
    updatedAt: serverTimestamp(),
    ...extra,
  };
  // Only write displayName when we have one, so a later auth event (which can fire
  // before the name is set during sign-up) can't clobber it back to null.
  if (u.displayName) data.displayName = u.displayName;
  try {
    await setDoc(doc(db, 'users', u.uid), data, { merge: true });
  } catch {
    // Non-fatal: the app still works if this background write fails (e.g. rules not updated yet).
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(firebaseEnabled);

  useEffect(() => {
    if (!auth) {
      setInitializing(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
      if (u) void upsertUserDoc(u);
    });
  }, []);

  // Accepts an email OR a username. Usernames have no "@", so we look up the
  // email they map to (a public, pre-auth read) and sign in with that.
  const signIn = async (identifier: string, password: string) => {
    if (!auth) throw new Error('Firebase is not configured yet.');
    const id = identifier.trim();
    let email = id;
    if (!id.includes('@')) {
      if (!db) throw new Error('Username sign-in is unavailable right now — try your email.');
      let snap;
      try {
        snap = await getDoc(doc(db, 'usernames', normalizeUsername(id)));
      } catch {
        throw new Error('Couldn’t look up that username — try your email instead.');
      }
      const mapped = snap.exists() ? (snap.data() as { email?: string }).email : undefined;
      if (!mapped) throw new Error('No account found with that username.');
      email = mapped;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (name: string, username: string, email: string, password: string) => {
    if (!auth) throw new Error('Firebase is not configured yet.');
    const handle = normalizeUsername(username);
    if (!USERNAME_RE.test(handle)) {
      throw new Error('Username must be 3–20 characters: lowercase letters, numbers, or underscores.');
    }
    // Check availability up front so we don't create an account for a taken handle.
    // (Swallow read errors like "rules not published yet" — only our "taken" message re-throws.)
    if (db) {
      try {
        const existing = await getDoc(doc(db, 'usernames', handle));
        if (existing.exists()) throw new Error('That username is already taken.');
      } catch (e) {
        if (e instanceof Error && e.message.includes('already taken')) throw e;
      }
    }

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });

    // Reserve the username (create-only in the rules, so a rare race loses cleanly),
    // then save it onto the profile doc. If reservation fails, the account still
    // works via email — it just won't have a username until set later.
    if (db) {
      try {
        await setDoc(doc(db, 'usernames', handle), {
          uid: cred.user.uid,
          email: cred.user.email ?? email.trim(),
        });
        await upsertUserDoc(cred.user, { username: handle });
      } catch {
        await upsertUserDoc(cred.user);
      }
    }
  };

  const signOut = async () => {
    if (auth) await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, initializing, configured: firebaseEnabled, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
