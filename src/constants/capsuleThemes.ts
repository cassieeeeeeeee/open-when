// Visual themes for the "opened capsule" reveal. Each theme drives the background
// gradient, the decorative art, and the on-background text colors. Shared so both
// the viewer and (later) the create/edit customizer can use the same set.

export type CapsuleArt = 'mountains' | 'stars' | 'sun' | 'none';

export type CapsuleTheme = {
  id: string;
  name: string;
  colors: readonly [string, string, string]; // background gradient (top → bottom)
  art: CapsuleArt;
  onBg: string; // primary text/icon color on the background
  onBgDim: string; // secondary text color on the background
  statusBar: 'light' | 'dark';
};

export const CAPSULE_THEMES: CapsuleTheme[] = [
  {
    id: 'twilight',
    name: 'Twilight',
    colors: ['#1f2540', '#344063', '#5a6a8a'],
    art: 'mountains',
    onBg: '#eef0f6',
    onBgDim: 'rgba(238,240,246,0.7)',
    statusBar: 'light',
  },
  {
    id: 'starry',
    name: 'Starry',
    colors: ['#0e1430', '#1c2350', '#3a3470'],
    art: 'stars',
    onBg: '#eef0f6',
    onBgDim: 'rgba(238,240,246,0.7)',
    statusBar: 'light',
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    colors: ['#3a2a3f', '#8a5a6a', '#e0a878'],
    art: 'sun',
    onBg: '#fff4ec',
    onBgDim: 'rgba(255,244,236,0.8)',
    statusBar: 'light',
  },
  {
    id: 'meadow',
    name: 'Meadow',
    colors: ['#2c3a2a', '#5a7a52', '#9bbf86'],
    art: 'mountains',
    onBg: '#f1f6ec',
    onBgDim: 'rgba(241,246,236,0.82)',
    statusBar: 'light',
  },
  {
    id: 'paper',
    name: 'Paper',
    colors: ['#efe7d6', '#f3ece0', '#f8f3ea'],
    art: 'none',
    onBg: '#4a4236',
    onBgDim: 'rgba(74,66,54,0.7)',
    statusBar: 'dark',
  },
];

export const getCapsuleTheme = (id?: string): CapsuleTheme =>
  CAPSULE_THEMES.find((t) => t.id === id) ?? CAPSULE_THEMES[0];
