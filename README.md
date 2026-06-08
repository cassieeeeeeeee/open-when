# Open When

> Seal a message or a memory now — let it open when the moment is right.

![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20+%20Firestore-FFCA28?logo=firebase&logoColor=black)

Open When is a mobile app for time capsules and shared memories. Write a letter your
future self opens on a hard day, schedule a note to unlock on a friend's birthday, or
build a collaborative scrapbook of a trip. Capsules stay sealed until their moment
arrives; memories are open keepsakes you grow with the people in them.

I built it end-to-end from a multi-screen design — the design system, UI, navigation,
and a Firebase backend.

## Features

- **Time capsules** — messages that unlock on a date, when you release them, or when the recipient is ready.
- **Shared memories** — collaborative scrapbooks of photos and notes, tied to the people in them.
- **Wrapped** — a year-in-review of your moments and milestones.
- **People** — a chat inbox and a per-person view of everything you've shared with someone.
- **Accounts and live sync** — email sign-in with Firebase Auth; capsules and memories stream from Firestore, scoped per user.
- **Hand-built design system** — a custom palette, type scale, and SVG icon set instead of an off-the-shelf UI kit.

## Tech stack

- Expo SDK 54, React Native 0.81, React 19
- Expo Router (file-based navigation) with a custom tab bar
- TypeScript throughout
- Firebase Authentication + Cloud Firestore
- react-native-svg, expo-linear-gradient, custom fonts (Dancing Script, Plus Jakarta Sans)

## Architecture notes

- **Custom tab bar.** The design needs a raised center "+" button that native tab bars can't host, so the app uses Expo Router's JS tabs with a hand-built bar.
- **Data layer.** Hooks like `useMyCapsules`, `useCapsule`, and `createCapsule` wrap Firestore with live `onSnapshot` subscriptions and fall back to bundled sample data when no backend is configured, so the UI never has to special-case being offline.
- **Per-user security.** Every document is owner-scoped through Firestore security rules.
- **Typed end-to-end.** Shared `Capsule` / `Memory` / `Person` types drive both the sample data and the live data, so screens didn't need rewrites when the backend landed.

## Status

The frontend is complete, and Auth + Firestore are live. In progress:

- Recipient model — send a capsule to another account, or share it as a link that opens in a browser
- Media uploads — photos, voice, and video via Cloud Storage
- Scheduled auto-unlock and push notifications
- Persisted real-time chat

## Running locally

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go. The app runs on bundled sample data out of the box; to
connect the live backend, add your own Firebase web config to `src/lib/firebaseConfig.ts`.
