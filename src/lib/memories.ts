import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { type Memory, memories as sampleMemories, findMemory } from '@/data/sample';
import { useAuth } from './auth';
import { auth, db } from './firebase';
import { firebaseEnabled } from './firebaseConfig';

const COLLECTION = 'memories';

/** Live list of the signed-in user's memories (falls back to sample when offline). */
export function useMyMemories(): { memories: Memory[]; loading: boolean } {
  const { user } = useAuth();
  const [items, setItems] = useState<Memory[]>(firebaseEnabled ? [] : sampleMemories);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!db || !user) {
      setItems(firebaseEnabled ? [] : sampleMemories);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, COLLECTION), where('ownerId', '==', user.uid));
    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Memory, 'id'>) })));
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [user]);

  return { memories: items, loading };
}

/** A single memory: sample ids resolve from sample data, real ids stream from Firestore. */
export function useMemory(id?: string): { memory: Memory | null; loading: boolean } {
  const { user } = useAuth();
  const sample = id ? findMemory(id) : undefined;
  const [memory, setMemory] = useState<Memory | null>(sample ?? null);
  const [loading, setLoading] = useState(!sample && firebaseEnabled);

  useEffect(() => {
    if (!id) return;
    if (sample) {
      setMemory(sample);
      setLoading(false);
      return;
    }
    if (!db || !user) {
      setMemory(null);
      setLoading(false);
      return;
    }
    return onSnapshot(
      doc(db, COLLECTION, id),
      (snap) => {
        setMemory(snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Memory, 'id'>) } : null);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [id, user, sample]);

  return { memory, loading };
}

export type NewMemory = { title: string; collaborators?: string[] };

const COVERS = [
  { from: '#cdb38f', to: '#8a9b7c' },
  { from: '#7a9bc1', to: '#c79a6a' },
  { from: '#9b8fd0', to: '#6f7e62' },
  { from: '#d9a0a0', to: '#9c6f6f' },
];

/** Create a memory owned by the current user. Returns the new doc id (or null if offline). */
export async function createMemory(input: NewMemory): Promise<string | null> {
  if (!db || !auth?.currentUser) return null;
  const cover = COVERS[Math.floor(Math.random() * COVERS.length)];
  const ref = await addDoc(collection(db, COLLECTION), {
    title: input.title,
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    photos: 0,
    from: cover.from,
    to: cover.to,
    collaborators: input.collaborators ?? [],
    contents: [],
    ownerId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
