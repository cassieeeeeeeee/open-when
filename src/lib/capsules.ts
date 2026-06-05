import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { type Capsule, type CapsuleContent, capsules as sampleCapsules, findCapsule } from '@/data/sample';
import { type Tone } from '@/constants/openwhen';
import { useAuth } from './auth';
import { auth, db } from './firebase';
import { firebaseEnabled } from './firebaseConfig';

const COLLECTION = 'capsules';

// Sample ids ('c1', 'r1', …) are demo data, not Firestore docs — skip writes for them.
const isSample = (id: string) => !!findCapsule(id);
const sampleCreated = () => sampleCapsules.filter((c) => c.direction === 'created');
const sampleReceived = () => sampleCapsules.filter((c) => c.direction === 'received');

/** Live list of the signed-in user's CREATED capsules (falls back to sample when offline). */
export function useMyCapsules(): { capsules: Capsule[]; loading: boolean } {
  const { user } = useAuth();
  const [items, setItems] = useState<Capsule[]>(firebaseEnabled ? [] : sampleCreated());
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!db || !user) {
      setItems(firebaseEnabled ? [] : sampleCreated());
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, COLLECTION), where('ownerId', '==', user.uid));
    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Capsule, 'id'>) })));
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [user]);

  return { capsules: items, loading };
}

/** Live list of capsules sent TO the signed-in user (falls back to sample when offline). */
export function useReceivedCapsules(): { capsules: Capsule[]; loading: boolean } {
  const { user } = useAuth();
  const [items, setItems] = useState<Capsule[]>(firebaseEnabled ? [] : sampleReceived());
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!db || !user) {
      setItems(firebaseEnabled ? [] : sampleReceived());
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, COLLECTION), where('recipientId', '==', user.uid));
    return onSnapshot(
      q,
      (snap) => {
        setItems(
          snap.docs.map((d) => {
            const data = d.data() as Omit<Capsule, 'id'>;
            // From the recipient's side this capsule is "received", and the person
            // to show is the sender (fromName), not the stored recipient name.
            return { ...data, id: d.id, direction: 'received' as const, who: data.fromName || data.who };
          })
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [user]);

  return { capsules: items, loading };
}

/** A single capsule: sample ids resolve from sample data, real ids stream from Firestore. */
export function useCapsule(id?: string): { capsule: Capsule | null; loading: boolean } {
  const { user } = useAuth();
  const sample = id ? findCapsule(id) : undefined;
  const [capsule, setCapsule] = useState<Capsule | null>(sample ?? null);
  const [loading, setLoading] = useState(!sample && firebaseEnabled);

  useEffect(() => {
    if (!id) return;
    if (sample) {
      setCapsule(sample);
      setLoading(false);
      return;
    }
    if (!db || !user) {
      setCapsule(null);
      setLoading(false);
      return;
    }
    return onSnapshot(
      doc(db, COLLECTION, id),
      (snap) => {
        setCapsule(snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Capsule, 'id'>) } : null);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [id, user, sample]);

  return { capsule, loading };
}

export type NewCapsule = {
  title: string;
  who: string;
  date: string;
  tone: Tone;
  locked?: boolean;
  personId?: string;
  recipientId?: string;
  recipientUsername?: string;
  recipientEmail?: string;
  contents?: CapsuleContent[];
};

/** Create a capsule owned by the current user. Returns the new doc id (or null if offline). */
export async function createCapsule(input: NewCapsule): Promise<string | null> {
  if (!db || !auth?.currentUser) return null;
  // Firestore rejects fields whose value is `undefined`, so drop them before writing.
  const clean = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
  const ref = await addDoc(collection(db, COLLECTION), {
    ...clean,
    ownerId: auth.currentUser.uid,
    fromName: auth.currentUser.displayName || auth.currentUser.email || 'Someone',
    direction: 'created',
    status: 'sealed',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCapsule(id: string, patch: Partial<Capsule>): Promise<void> {
  if (!db || !auth?.currentUser || isSample(id)) return;
  await updateDoc(doc(db, COLLECTION, id), patch);
}

export async function deleteCapsule(id: string): Promise<void> {
  if (!db || !auth?.currentUser || isSample(id)) return;
  await deleteDoc(doc(db, COLLECTION, id));
}
