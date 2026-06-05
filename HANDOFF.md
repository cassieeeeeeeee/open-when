# Open When — Development Handoff (as of 2026-06-04)

Paste this into a new conversation to continue building. It's the single source of truth
for project state. (A condensed version also lives in Claude's auto-memory.)

## 1. What this is
"Open When" — a personal **time-capsule + shared-memories** mobile app. Capsules are
messages/media that unlock later; memories are little shared scrapbooks. Goal: ship to
**Google Play** (iOS later). Built from a 7-screen HTML/CSS mockup. Warm cream aesthetic
(#f8f3ea), Dancing Script + Plus Jakarta Sans fonts.

## 2. Owner & working style
Caitlyn — comes from an HTML/React background, newer to React Native/mobile. Explain steps;
**pause and ask before steps that need her** (installing things, creating accounts, console
work). She iterates in small, concrete tweaks and tests on her **iPhone (iOS 26.5)** via Expo Go.

## 3. Environment (CRITICAL)
- Windows. Project root: `C:\Users\Caitlyn\open-when`. NOTE: the Claude session cwd is the
  PARENT `C:\Users\Caitlyn` (matters for the Claude Preview MCP, which reads `.claude/` from there).
- **Node 24 is installed at `C:\Program Files\nodejs` but NOT on the tool shell's PATH.** Prepend
  it before every npm/npx/expo command: `$env:Path = "C:\Program Files\nodejs;" + $env:Path`.
  (Caitlyn's own VS Code terminal is fine — this only affects the agent's shell.)
- Git 2.54 + VS Code are on PATH. PowerShell execution policy already set to RemoteSigned
  (so `npx` works in her terminal).

## 4. Tech stack
- **Expo SDK 54** (expo-router 6.x, React Native 0.81, React 19.1), TypeScript.
  - History: scaffolded on SDK 56 → downgraded 56→55→54 because the **App Store Expo Go supports SDK 54**.
    DO NOT upgrade the SDK without confirming Expo Go support, or her phone can't open it.
  - SDK-54 import gotchas: `Tabs` from `expo-router` (NOT `expo-router/js-tabs`, that's 56);
    `DefaultTheme`/`ThemeProvider` from `@react-navigation/native`; `BottomTabBarProps` from
    `@react-navigation/bottom-tabs`.
- `app.json` experiments: `typedRoutes` + `reactCompiler` on.
- Deps: firebase 12.14, @react-native-async-storage/async-storage, react-native-svg,
  expo-linear-gradient, @expo-google-fonts/{dancing-script,plus-jakarta-sans},
  @react-native-community/datetimepicker 8.4.4.
- After adding any dep, restart Metro with `npx expo start -c`.

## 5. Current status
**Frontend prototype: COMPLETE** (all mockup screens ported + extra flows).
**Backend: Auth + Firestore (capsules, memories) LIVE.**

- **Auth (LIVE, verified):** Firebase project `open-when-c82c9`, Email/Password enabled.
  Persists across restarts (AsyncStorage). Test account: `test+ow@example.com` / `<password redacted — kept out of the public repo>`.
- **Firestore (LIVE, verified):** `capsules` + `memories` collections, per-user (ownerId).
  Create/read/delete work; data falls back to `sample.ts` when Firebase isn't configured.
- **Storage: DEFERRED** — requires the Blaze plan; media uploads are still stubs.

## 6. Screens & navigation
Bottom tabs: **Home · People · [ + center ] · Capsules · Memories**. Profile is reached by
tapping the avatar on Home (not a tab). The center "+" opens a **chooser** (`/new`) → New Memory or New Capsule.
- **Home** (`(tabs)/index.tsx`): greeting, "Continue" card (→ memory m1, sample), Upcoming
  Capsules (live Firestore, → manage screen), Recent Memories (live Firestore, → viewer),
  Wrapped banner (→ /wrapped). Avatar → /profile. Sections hide when empty.
- **Capsules** (`(tabs)/capsules.tsx`): **Created / Received** top tabs; each split into
  **Sealed / Unlocked** sections; search + sort. Created = live Firestore; Received = sample.
  Created card → `/edit-capsule/[id]`; Received card → `/capsule/[id]`.
- **Memories** (`(tabs)/memories.tsx`): single-column list, search + sort, "+" → composer.
  Card → `/memory/[id]`.
- **People** (`(tabs)/people.tsx`): chat **inbox** (latest message + time per person), filter
  pills. Row → `/chat/[id]`.
- **Create capsule** (`create.tsx`, modal): title; recipient (contact chips → `who`+`personId`,
  or free text); **real unlock date** via native `DateField`; message-type buttons (stub); note.
  Writes to Firestore.
- **Memory composer** (`memory.tsx`, modal): title, When, collaborator chips, content buttons
  (stub), "Create Memory" → Firestore.
- **Manage created capsule** (`edit-capsule/[id].tsx`): contents (collapsible previews via
  `ContentItemRow`), Add-more buttons, opening-method radios (timed/manual/recipient),
  Reseal, "Release now" (manual only), Delete (red trash, top-right, confirmed → deletes doc).
- **Capsule viewer** (`capsule/[id].tsx`): dark "Unlocked" letter view (gradient, mountains,
  letter, audio player, Save/Share) for received-unlocked; sealed fallback otherwise.
- **Memory viewer** (`memory/[id].tsx`): cover, "In this memory" collaborators, "What's inside"
  (collapsible previews), Add buttons. Streams from Firestore.
- **Chat** (`chat/[id].tsx`): bubbles + input; messages in-memory (NOT yet persisted). Header
  (avatar+name) → `/person/[id]`.
- **Person profile** (`person/[id].tsx`): name/avatar + memories & capsules shared (sample).
- **Wrapped** (`wrapped.tsx`): year-in-review (hero, stat cards, Top Moments → memory, donut, share).
- **Profile** (`profile.tsx`): account (real displayName/email), placeholder rows, working Sign out.
- **Login/Signup** (`login.tsx`, `signup.tsx`).

## 7. Code map (`src/`)
- `app/` — routes (above). Root `app/_layout.tsx` = Stack + `AuthProvider` + auth gate
  (`useAuthGate` redirects to /login when signed-out, only once Firebase configured).
- `components/openwhen/`
  - `icons.tsx` — all SVG icons + envelope/glyph + GradientAvatar/Thumb + Donut (ported from mockup paths).
  - `ui.tsx` — Logo, SectionLabel, ActionTile, EnvelopeCard (For/From + locked), ContinueCard,
    Pill, PersonRow (inbox), MemoryCard (`full` one-col vs tile), SearchBar, **ContentItemRow** (collapsible preview).
  - `TabBar.tsx` — custom JS tab bar with the raised center "+".
  - `DateField.tsx` (native picker) + `DateField.web.tsx` (display-only fallback).
- `constants/openwhen.ts` — `OW` palette, `TONES`, `Font`, `Radius`.
- `data/sample.ts` — sample/fallback data + TYPES: `Capsule`, `CapsuleContent`, `Memory`,
  `Person`, `ChatMessage`; helpers `findCapsule/findMemory/findPerson`,
  `capsulesForPerson/memoriesForPerson`, `messagesByPerson`, `wrapped`, `USER`.
- `lib/` — `firebase.ts`, `firebaseConfig.ts` (config + `firebaseEnabled`), `auth.tsx`
  (`AuthProvider`/`useAuth`), `capsules.ts`, `memories.ts`, `sort.ts`.

## 8. Data model (Firestore)
- `capsules/{id}`: `{ ownerId, title, who, date, tone, direction:'created'|'received',
  status:'sealed'|'unlocked', locked?, personId?, contents?: {type,label,preview?}[], createdAt }`.
  Queried by `where('ownerId','==', uid)`; sorted client-side (no composite index needed).
- `memories/{id}`: `{ ownerId, title, date, photos, from, to, collaborators: string[],
  contents?: {...}[], createdAt }`.
- Lib hooks (`capsules.ts`/`memories.ts`): `useMyX` (live list), `useX(id)` (single; sample ids
  resolve from sample.ts, real ids stream from Firestore), `createX/updateX/deleteX`
  (no-op for sample ids / when unconfigured).

## 9. Architecture decisions & gotchas
- Native tab bar can't host the raised "+", so we use the **JS Tabs + custom tabBar**.
- Firebase RN auth persistence: `getReactNativePersistence(AsyncStorage)` accessed via an
  `any`-cast (it's in firebase's RN build but not the web type defs). No Metro tweak needed —
  firebase 12 has a `react-native` export condition.
- `firebaseEnabled` (config not placeholder) gates EVERYTHING — the app runs fully on sample
  data when unconfigured, and the auth gate is dormant until configured.
- Everything is keyed off `sample.ts` shapes so screens didn't need rewrites when Firestore landed.

## 10. Known stubs / NOT done yet
- **Chat is in-memory** (resets on reload) — not in Firestore.
- **Received capsules + person-profile lists are sample** — no real "send to someone" model
  (need recipient identity by uid/email + a recipient query).
- **Media/content upload** (photos/voice/video/playlist buttons) are stubs — need **Storage (Blaze)**.
- Capsule **reseal / release / opening-method** changes don't persist; **memory contents/photos** don't persist.
- **Scheduled unlocking** (hourly Cloud Function) + **push notifications** (Expo Notifications) — not started; **Functions need Blaze**.
- Profile rows besides Sign out are placeholders. Home "Continue" card is hardcoded to sample memory `m1`.

## 11. Recommended next steps (in order)
1. **Chat → Firestore** (real-time `onSnapshot` messages subcollection per conversation) + extend security rules.
2. **Send / received model** — choose recipients by account; query capsules/memories where the user is a recipient; make Received + person-profile real.
3. **Persist** capsule method/reseal/release + memory edits.
4. When Caitlyn upgrades to **Blaze**: Storage (real media upload) → then the **scheduled-unlock Cloud Function** + Expo push notifications (the core "it unlocks and notifies" loop).
5. Polish: real Profile screens, a real "Continue" source, empty states.

## 12. How to run & verify
- Run: `cd open-when` then `npx expo start` (use `-c` after dep changes); scan QR with Expo Go (iPhone).
- Typecheck after changes: `npx tsc --noEmit` (agent must prepend the Node PATH first).
- Visual checks: Claude Preview MCP runs Expo **web** on port 8082 (`.claude/launch.json` =
  `open-when-web`). The **screenshot tool is flaky (frequent timeouts)** — prefer verifying via
  `preview_eval` reading `document.body.innerText`. The web app requires login now; the test
  session usually persists. Native-only bits (date picker) won't render on web (that's expected).

## 13. ACTION ITEMS for Caitlyn
- **Publish Firestore security rules** (Firestore → Rules → Publish) — her DB is in test mode:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /capsules/{id} {
        allow read, update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
        allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      }
      match /memories/{id} {
        allow read, update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
        allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      }
    }
  }
  ```
  (Add a `chats` rule when chat → Firestore lands.)
- On the phone, `npx expo start -c` to pick up new deps.
- Upgrade to **Blaze** only when ready for media uploads / Cloud Functions (free under quotas; set a budget alert).
