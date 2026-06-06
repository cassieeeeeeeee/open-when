// Visual themes for the "opened capsule" reveal. Each theme drives the background
// gradient, the decorative art, and the on-background text colors. Shared so both
// the viewer and (later) the create/edit customizer can use the same set.

export type CapsuleArt =
  | 'mountains'
  | 'stars'
  | 'sun'
  | 'petals'
  | 'flowers'
  | 'leaves'
  | 'snowscape'
  | 'graduation'
  | 'christmas'
  | 'none';

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
  {
    id: 'spring',
    name: 'Spring',
    colors: ['#bfe0a8', '#d8eecb', '#eef6e2'],
    art: 'flowers',
    onBg: '#3f5436',
    onBgDim: 'rgba(63,84,54,0.72)',
    statusBar: 'dark',
  },
  {
    id: 'summer',
    name: 'Summer',
    colors: ['#1d7f93', '#3fa9bd', '#ffe0a0'],
    art: 'sun',
    onBg: '#fff7e8',
    onBgDim: 'rgba(255,247,232,0.85)',
    statusBar: 'light',
  },
  {
    id: 'fall',
    name: 'Autumn',
    colors: ['#3a2014', '#8a4424', '#d98a44'],
    art: 'leaves',
    onBg: '#fff0e0',
    onBgDim: 'rgba(255,240,224,0.82)',
    statusBar: 'light',
  },
  {
    id: 'winter',
    name: 'Winter',
    colors: ['#28394a', '#587a92', '#bcd6e2'],
    art: 'snowscape',
    onBg: '#f0f7fb',
    onBgDim: 'rgba(240,247,251,0.85)',
    statusBar: 'light',
  },
  {
    id: 'floral',
    name: 'Floral',
    colors: ['#5a2a44', '#a85a7a', '#e8acc4'],
    art: 'flowers',
    onBg: '#fff0f6',
    onBgDim: 'rgba(255,240,246,0.84)',
    statusBar: 'light',
  },
  {
    id: 'wedding',
    name: 'Wedding',
    colors: ['#efdfe2', '#f5ebe9', '#fbf5ef'],
    art: 'petals',
    onBg: '#6e4d56',
    onBgDim: 'rgba(110,77,86,0.72)',
    statusBar: 'dark',
  },
  {
    id: 'graduation',
    name: 'Graduation',
    colors: ['#19213f', '#2b3560', '#b89653'],
    art: 'graduation',
    onBg: '#f4ecd6',
    onBgDim: 'rgba(244,236,214,0.8)',
    statusBar: 'light',
  },
  {
    id: 'christmas',
    name: 'Christmas',
    colors: ['#2a1216', '#6e2228', '#a84a48'],
    art: 'christmas',
    onBg: '#fdeeea',
    onBgDim: 'rgba(253,238,234,0.85)',
    statusBar: 'light',
  },
];

export const getCapsuleTheme = (id?: string): CapsuleTheme =>
  CAPSULE_THEMES.find((t) => t.id === id) ?? CAPSULE_THEMES[0];
