/**
 * Open When — design tokens, ported from the HTML mockup's :root variables.
 *
 * The app uses a single warm, light palette. (The "Unlocked" screen is intentionally
 * dark and styles itself locally.) So these are fixed values rather than light/dark
 * pairs — we are not wiring system dark-mode for the prototype.
 */

export const OW = {
  bg: '#f8f3ea',
  card: '#ffffff',
  cardSoft: '#fbf8f2',
  ink: '#2c2a33',
  ink2: '#4a4753',
  muted: '#9b97a3',
  line: '#efeae0',
  inputLine: '#e7e0d4',
  track: '#ece6db',

  sage: '#8a9b7c',
  sageSoft: '#dde4d3',
  lilac: '#9b8fd0',
  lilacSoft: '#e6e1f4',
  peach: '#c79a6a',
  peachSoft: '#f1e1cd',
  blue: '#7a9bc1',
  blueSoft: '#dbe5f0',
  pink: '#d98e98',
  pinkSoft: '#f5dde1',
  gold: '#c9a24a',
  goldSoft: '#f1e6c8',
  rose: '#d08a93',
  dark: '#2f2840',
} as const;

export type Tone = 'sage' | 'lilac' | 'peach' | 'blue' | 'pink' | 'gold';

export const TONES: Record<Tone, { color: string; soft: string }> = {
  sage: { color: OW.sage, soft: OW.sageSoft },
  lilac: { color: OW.lilac, soft: OW.lilacSoft },
  peach: { color: OW.peach, soft: OW.peachSoft },
  blue: { color: OW.blue, soft: OW.blueSoft },
  pink: { color: OW.pink, soft: OW.pinkSoft },
  gold: { color: OW.gold, soft: OW.goldSoft },
};

/**
 * Custom font families. These names must match the keys loaded by `useFonts`
 * in app/_layout.tsx (the @expo-google-fonts export identifiers).
 */
export const Font = {
  script: 'DancingScript_700Bold',
  serif: 'Lora_500Medium',
  hand: 'Caveat_700Bold',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const Radius = { sm: 11, md: 12, lg: 16, xl: 18, pill: 24 } as const;
