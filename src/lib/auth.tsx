import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { auth } from './firebase';
import { firebaseEnabled } from './firebaseConfig';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase is not configured yet.');
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUp = async (name: string, email: string, password: string) => {
    if (!auth) throw new Error('Firebase is not configured yet.');
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
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
