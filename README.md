# Open When 💌

> Seal a message or a memory now — let it open when the moment is right.

![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)

**Open When** is a mobile app for **time capsules** and **shared memories**. Write a letter your future self will open on a hard day, schedule a note to unlock on a friend's birthday, or build a little collaborative scrapbook of a trip together. Capsules stay sealed until their moment arrives; memories are open keepsakes you grow with the people in them.

A solo project: I took a multi-screen design and built it end-to-end into a working, backend-connected mobile app — design system, UI, navigation, and a Firebase backend.

## ✨ Features

- ⏳ **Time capsules** — messages that unlock on a date, when you release them, or when the recipient is ready
- 📖 **Shared memories** — collaborative scrapbooks of photos and notes, tied to the people in them
- 🎁 **Wrapped** — a year-in-review of your moments and milestones
- 👥 **People** — a chat inbox and a per-person view of everything you've shared with them
- 🔐 **Accounts & live sync** — email sign-in (Firebase Auth); capsules and memories stream live from Firestore, scoped privately per user
- 🎨 **Hand-built design system** — a warm, cohesive look (custom palette, type scale, and SVG icon set) rather than an off-the-shelf UI kit

## 📱 Screenshots

_Device screenshots coming soon — until then, clone & run (below) to see it live on your phone._

<!--
  Add images to docs/screenshots/ (home.png, capsules.png, memory.png, wrapped.png), then
  replace the line above with the grid below:

<p align="center">
  <img src="docs/screenshots/home.png"     width="200" alt="Home" />
  <img src="docs/screenshots/capsules.png" width="200" alt="Capsules" />
  <img src="docs/screenshots/memory.png"   width="200" alt="Memory" />
  <img src="docs/screenshots/wrapped.png"  width="200" alt="Wrapped" />
</p>
-->

## 🛠 Tech stack

- **Expo SDK 54** · **React Native 0.81** · **React 19**
- **Expo Router** — file-based navigation, with a custom tab bar
- **TypeScript** throughout
- **Firebase** — Authentication + Cloud Firestore
- **react-native-svg** (custom icon set), **expo-linear-gradient**, custom fonts (Dancing Script + Plus Jakarta Sans)

## 🏗 Architecture highlights

A few things I'm proud of under the hood:

- **Custom tab bar** — the design calls for a raised center "+" button in the middle of the navigation, which native tab bars can't host, so the app uses Expo Router's JS tabs with a hand-built tab bar.
- **A clean data layer** — hooks like `useMyCapsules`, `useCapsule`, and `createCapsule` wrap Firestore with live `onSnapshot` subscriptions and fall back gracefully to bundled sample data when no backend is configured, so the UI never has to special-case being offline.
- **Per-user security** — every document is owner-scoped via Firestore security rules.
- **Typed end-to-end** — shared `Capsule` / `Memory` / `Person` types drive both the sample data and the live data, so screens didn't need rewrites when the backend landed.

## 🚧 Status & roadmap

The frontend is complete, and Auth + Firestore are live. Currently building:

- [ ] **Recipient model** — send a capsule to another account, or share it as a link that opens in the browser
- [ ] **Media uploads** — photos, voice, and video via Cloud Storage
- [ ] **Scheduled auto-unlock** + push notifications
- [ ] **Real-time chat** (persisted)

## ▶️ Running it locally

```bash
npm install
npx expo start
```

Then scan the QR code with **Expo Go** on your phone. The app runs on bundled sample data out of the box; to connect the live backend, add your own Firebase web config to `src/lib/firebaseConfig.ts`.

---

<p align="center"><sub>Built with React Native &amp; a lot of care. 💌</sub></p>
