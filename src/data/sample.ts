/**
 * Hardcoded sample data for the prototype (Phase 3). Swap these arrays for live
 * Firestore reads/writes in Phase 4 — the screen components only depend on the
 * shapes below, not on where the data comes from.
 */
import { Tone } from '@/constants/openwhen';

export const USER = { name: 'Maya' };

export type Capsule = {
  id: string;
  title: string;
  who: string; // recipient (created) or sender (received) display name
  date: string; // human-readable trigger label
  tone: Tone;
  locked?: boolean; // show a padlock (no fixed date, or an inactivity trigger)
  personId?: string; // links to a Person (for the "between us" person profile)
  recipientId?: string; // uid of the real recipient account (when sent to an account)
  recipientUsername?: string; // recipient's @handle captured at send time
  recipientEmail?: string; // recipient's email captured at send time
  fromName?: string; // sender's display name (shown as "From" on received capsules)
  theme?: string; // chosen reveal theme id (see constants/capsuleThemes)
  backgroundImage?: string; // custom uploaded background photo (overrides the theme gradient)
  backgroundPhotos?: string[]; // uploaded background photos saved as reusable options for this capsule
  direction: 'created' | 'received'; // made by the user vs sent to them
  status: 'sealed' | 'unlocked'; // not yet opened vs opened
  contents?: CapsuleContent[]; // what's been added inside
};

// Decorative stickers the user can place on an element (clouds, flowers, hearts…).
export type StickerKind =
  | 'cloud'
  | 'flower'
  | 'leaf'
  | 'heart'
  | 'star'
  | 'sparkle'
  | 'tree'
  | 'confetti'
  | 'snowflake'
  | 'petal';

export type Sticker = {
  id: string; // stable unique id within the item (used as the React key)
  kind: StickerKind;
  x: number; // normalized 0..1, CENTER-anchored, relative to the element's content box
  y: number; // normalized 0..1, CENTER-anchored
  scale?: number; // size multiplier, default 1
  rot?: number; // rotation in degrees, default 0
};

export type CapsuleContent = {
  type: 'text' | 'photo' | 'video' | 'playlist';
  label: string;
  preview?: string; // short snippet shown when the item is expanded
  format?: string; // for photos: the layout (polaroid | clothesline | filmstrip | collage)
  textFrame?: string; // for text: the card style (none | letter | note | card | ruled | script | chalkboard | ...)
  textFont?: string; // for text: font key (sans | serif | script | hand | bold) overriding the frame default
  textSize?: number; // for text: body font size overriding the frame default
  textColor?: string; // for text: body colour overriding the frame default
  textAlign?: string; // for text: 'left' | 'center' | 'right'
  count?: number; // for photos: how many images
  images?: number[]; // for photos: ordered gradient ids (placeholder identity + drag identity + decoration)
  photoUris?: Record<string, string>; // for photos: gradient id -> uploaded image uri (missing id = gradient placeholder)
  photoRatios?: Record<string, number>; // for polaroids: gradient id -> chosen frame aspect ratio (missing = 1)
  theme?: string; // per-section reveal theme id; cascades to the blocks below until overridden
  backgroundImage?: string; // per-section background photo (local to this block, does not cascade)
  stickers?: Sticker[]; // free-placed decorations overlaid on this element
};

/** All capsules — created by the user (for others) or received (from others). */
export const capsules: Capsule[] = [
  // Created by you (for others)
  { id: 'c1', title: 'Open on your wedding day', who: 'Sarah', date: 'June 14, 2030', tone: 'pink', direction: 'created', status: 'sealed', contents: [{ type: 'text', label: 'A letter to Sarah', preview: 'Sarah — by the time you open this, I hope the day is everything you dreamed…' }, { type: 'photo', label: '4 photos' }] },
  { id: 'c2', title: 'Open when you become a parent', who: 'My Future Child', date: 'No date set', tone: 'blue', locked: true, direction: 'created', status: 'sealed', contents: [{ type: 'text', label: 'Advice for the road ahead' }] },
  { id: 'c3', title: "Open if I'm no longer here", who: 'Mom', date: 'In 365 days of inactivity', tone: 'peach', locked: true, personId: 'p4', direction: 'created', status: 'sealed', contents: [{ type: 'text', label: 'Things I never said' }, { type: 'video', label: 'A short video' }] },
  { id: 'c4', title: 'Open on your 30th birthday', who: 'Sam', date: 'Nov 12, 2028', tone: 'lilac', personId: 'p2', direction: 'created', status: 'sealed', contents: [{ type: 'photo', label: '8 photos' }, { type: 'playlist', label: '“Songs from your 20s”', preview: 'Mr. Brightside · Dancing Queen · Hey Ya! · +17 more' }] },
  { id: 'c5', title: 'Open on our 5 year anniversary', who: 'You & Sam', date: 'Nov 12, 2027', tone: 'pink', personId: 'p2', direction: 'created', status: 'sealed', contents: [{ type: 'text', label: 'Year-one recap' }] },
  { id: 'c6', title: 'Open when you graduate', who: 'Alex', date: 'Opened June 1, 2026', tone: 'pink', direction: 'created', status: 'unlocked', contents: [{ type: 'text', label: 'Congrats letter' }, { type: 'photo', label: '2 photos' }] },
  // Received by you (from others)
  { id: 'r1', title: 'Open when you feel lost', who: 'Best Friend', date: 'Unlocked May 12, 2024', tone: 'sage', personId: 'p1', direction: 'received', status: 'unlocked' },
  { id: 'r2', title: 'Open on your birthday', who: 'Mom', date: 'No date set', tone: 'peach', locked: true, personId: 'p4', direction: 'received', status: 'sealed' },
  { id: 'r3', title: 'Open when you need a laugh', who: 'College Crew', date: 'No date set', tone: 'lilac', locked: true, personId: 'p3', direction: 'received', status: 'sealed' },
];

/** Home → "Upcoming Capsules" preview (a couple of your sealed, created capsules). */
export const homeUpcoming: Capsule[] = capsules
  .filter((c) => c.direction === 'created' && c.status === 'sealed')
  .slice(0, 2);

export type Person = {
  id: string;
  name: string;
  meta: string; // "132 memories together"
  last: string; // "Last memory: 2d ago"
  from: string; // avatar gradient start
  to: string; // avatar gradient end
};

export const people: Person[] = [
  { id: 'p1', name: 'Jess', meta: '132 memories together', last: 'Last memory: 2d ago', from: '#d9a0a0', to: '#9c6f6f' },
  { id: 'p2', name: 'Sam', meta: '89 memories together', last: 'Last memory: 1d ago', from: '#a0b8d9', to: '#6f86a0' },
  { id: 'p3', name: 'College Crew', meta: '243 memories together', last: 'Last memory: 3d ago', from: '#b8a0d9', to: '#7f6f9c' },
  { id: 'p4', name: 'Family', meta: '187 memories together', last: 'Last memory: 5d ago', from: '#a0d9b0', to: '#6f9c7c' },
];

/** Full content for an unlocked capsule's letter view, keyed by capsule id. */
export type UnlockedDetail = {
  title: string;
  fromName: string;
  unlockedOn: string;
  letter: string[];
  closing: string;
  signature: string;
  audio: { position: string; duration: string; progress: number };
};

export const unlockedDetail: Record<string, UnlockedDetail> = {
  r1: {
    title: 'Open when you feel lost',
    fromName: 'Best Friend',
    unlockedOn: 'May 12, 2024',
    letter: [
      'Hey bestie,',
      "If you're seeing this, I hope it means you're taking a moment for yourself.",
      "You're stronger than you think and I'm so proud of you.",
      "Call me. Let's get food. You're not alone in this. Ever.",
    ],
    closing: 'Love you endlessly,',
    signature: 'Me 💜',
    audio: { position: '0:12', duration: '1:45', progress: 0.12 },
  },
};

const ALL_CAPSULES = capsules;

export function findCapsule(id: string): Capsule | undefined {
  return ALL_CAPSULES.find((c) => c.id === id);
}

/** Year-in-review ("Wrapped") sample data. */
export const wrapped = {
  year: '2024',
  stats: [
    { key: 'memories', label: 'Memories captured', value: '128', tone: 'pink' as Tone },
    { key: 'prompts', label: 'Prompts answered', value: '276', tone: 'lilac' as Tone },
    { key: 'voice', label: 'Voice notes recorded', value: '34', tone: 'peach' as Tone },
    { key: 'photos', label: 'Photos added', value: '89', tone: 'blue' as Tone },
  ],
  moments: [
    { id: 'm2', name: 'Beach day 🏖️', date: 'June 18' },
    { id: 'm3', name: 'Late night talks', date: 'Aug 2' },
    { id: 'm4', name: 'Hiking adventure', date: 'Oct 11' },
  ],
  vibes: [
    { label: 'Happy', value: 48, tone: 'pink' as Tone },
    { label: 'Grateful', value: 22, tone: 'sage' as Tone },
    { label: 'Inspired', value: 16, tone: 'blue' as Tone },
    { label: 'Nostalgic', value: 14, tone: 'lilac' as Tone },
  ],
};

/** Memories = everyday scrapbook entries (no unlock time). Shown on Home + the Memories tab. */
export type Memory = {
  id: string;
  title: string;
  date: string;
  photos: number;
  from: string; // cover gradient start
  to: string; // cover gradient end
  personId?: string; // links to a Person (for the "between us" person profile)
  contents?: CapsuleContent[]; // what's been uploaded to this memory
  collaborators?: string[]; // Person ids who are also in this memory
};

export const memories: Memory[] = [
  { id: 'm1', title: 'Road trip with Jess', date: 'May 4, 2024', photos: 12, from: '#cdb38f', to: '#8a9b7c', personId: 'p1', collaborators: ['p1'], contents: [{ type: 'photo', label: '12 photos' }, { type: 'text', label: '“best weekend ever” — Jess', preview: 'We drove 600 miles, got lost twice, and laughed the whole way.' }, { type: 'playlist', label: '“Road trip vol. 1”', preview: 'Life is a Highway · Born to Run · Ho Hey · +9 more' }] },
  { id: 'm2', title: 'Beach day', date: 'June 18, 2024', photos: 24, from: '#7a9bc1', to: '#c79a6a', personId: 'p1', collaborators: ['p1', 'p3'], contents: [{ type: 'photo', label: '24 photos' }, { type: 'video', label: 'Sunset clip' }] },
  { id: 'm3', title: 'Late night talks', date: 'Aug 2, 2024', photos: 5, from: '#9b8fd0', to: '#6f7e62', personId: 'p2', collaborators: ['p2'], contents: [{ type: 'photo', label: '5 photos' }, { type: 'text', label: 'A few notes to remember' }] },
  { id: 'm4', title: 'Hiking adventure', date: 'Oct 11, 2024', photos: 18, from: '#8a9b7c', to: '#6f7e62', personId: 'p3', collaborators: ['p3'], contents: [{ type: 'photo', label: '18 photos' }, { type: 'video', label: 'Summit view' }] },
];

/** Chat messages per person/group (keyed by Person id). `mine` = sent by the current user. */
export type ChatMessage = { id: string; text: string; mine: boolean; time: string };

export const messagesByPerson: Record<string, ChatMessage[]> = {
  p1: [
    { id: 'p1-1', text: 'that road trip was unreal 😭', mine: false, time: '2d' },
    { id: 'p1-2', text: 'right?? we have to do it again', mine: true, time: '2d' },
    { id: 'p1-3', text: 'adding the photos to our memory now 📸', mine: false, time: '2d' },
    { id: 'p1-4', text: 'yes!! tag me when it’s up', mine: true, time: '2d' },
  ],
  p2: [
    { id: 'p2-1', text: 'can’t believe we’re actually building the app', mine: false, time: '1d' },
    { id: 'p2-2', text: 'our wedding capsule is still sealed btw 👀', mine: false, time: '1d' },
    { id: 'p2-3', text: 'good. no peeking 😄', mine: true, time: '1d' },
  ],
  p3: [
    { id: 'p3-1', text: 'who’s free for the reunion capsule?', mine: false, time: '3d' },
    { id: 'p3-2', text: 'i’m in!', mine: true, time: '3d' },
  ],
  p4: [
    { id: 'p4-1', text: 'added the holiday photos 🎄', mine: false, time: '5d' },
    { id: 'p4-2', text: 'love these', mine: true, time: '5d' },
  ],
};

export function findPerson(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function memoriesForPerson(id: string): Memory[] {
  return memories.filter((m) => m.personId === id);
}

export function capsulesForPerson(id: string): Capsule[] {
  return ALL_CAPSULES.filter((c) => c.personId === id);
}

export function findMemory(id: string): Memory | undefined {
  return memories.find((m) => m.id === id);
}
