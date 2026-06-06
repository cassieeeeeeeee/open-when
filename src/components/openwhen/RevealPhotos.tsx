import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Font } from '@/constants/openwhen';

// Scrapbook-style photo layouts for the capsule reveal. Placeholder art for now
// (soft gradients) — swap each LinearGradient for <Image> once Storage is on.

export type PhotoVariant = 'polaroid' | 'clothesline' | 'filmstrip' | 'collage';

const GRADS: [string, string][] = [
  ['#cdb38f', '#8a9b7c'],
  ['#7a9bc1', '#c79a6a'],
  ['#d9a0a0', '#9c6f6f'],
  ['#9b8fd0', '#6f7e62'],
  ['#e0b98a', '#b08a64'],
  ['#8aa9b0', '#6f8a7c'],
];
const TILTS = ['-5deg', '4deg', '-3deg', '6deg', '-4deg', '3deg'];
const grad = (i: number) => GRADS[i % GRADS.length];
const Photo = ({ i, style }: { i: number; style?: object }) => (
  <LinearGradient colors={grad(i)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style} />
);

export function RevealPhotos({ count, variant = 'polaroid' }: { count: number; variant?: PhotoVariant }) {
  const n = Math.max(1, Math.min(count || 4, 6));
  if (variant === 'clothesline') return <Clothesline n={Math.min(n, 4)} />;
  if (variant === 'filmstrip') return <Filmstrip n={Math.min(n, 3)} />;
  if (variant === 'collage') return <Collage />;
  return <Polaroids n={n} extra={(count || 0) - n} />;
}

// ── Option 1: tilted polaroids with washi tape + doodles ───────────────────────
const OFFSETS = [0, 18, 6, 22, 2, 16];
const TAPES = ['rgba(214,182,143,0.7)', 'rgba(154,170,124,0.62)', 'rgba(209,160,160,0.6)', 'rgba(140,165,190,0.6)'];
const DOODLES = ['♡', '✿', '☀', '✦', '❀', '♪'];

function Polaroids({ n, extra }: { n: number; extra: number }) {
  return (
    <View style={p.wrap}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={[p.slot, { marginTop: OFFSETS[i % OFFSETS.length] }]}>
          <View style={[p.card, { transform: [{ rotate: TILTS[i % TILTS.length] }] }]}>
            <View style={[p.tape, { backgroundColor: TAPES[i % TAPES.length] }]} />
            <Photo i={i} style={p.photo} />
            <Text style={p.doodle}>{DOODLES[i % DOODLES.length]}</Text>
          </View>
        </View>
      ))}
      {extra > 0 ? (
        <View style={[p.slot, { marginTop: OFFSETS[n % OFFSETS.length] }]}>
          <View style={[p.card, { transform: [{ rotate: '3deg' }] }]}>
            <View style={[p.photo, p.moreInner]}>
              <Text style={p.moreText}>+{extra}</Text>
              <Text style={p.moreSub}>more</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ── Option 2: photos hung from a string with little pegs ───────────────────────
const HANGS = [12, 26, 8, 22];
const PEGS = ['#c9966a', '#a8a06a', '#b97f7f', '#7f93b0'];

function Clothesline({ n }: { n: number }) {
  return (
    <View style={cl.wrap}>
      <View style={cl.string} />
      <View style={cl.row}>
        {Array.from({ length: n }).map((_, i) => (
          <View key={i} style={[cl.hang, { marginTop: HANGS[i % HANGS.length] }]}>
            <View style={[cl.peg, { backgroundColor: PEGS[i % PEGS.length] }]} />
            <View style={[cl.frame, { transform: [{ rotate: TILTS[i % TILTS.length] }] }]}>
              <Photo i={i} style={cl.photo} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Option 3: a retro filmstrip with sprocket holes ────────────────────────────
function Sprockets() {
  return (
    <View style={fs.holes}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={fs.hole} />
      ))}
    </View>
  );
}

function Filmstrip({ n }: { n: number }) {
  return (
    <View style={fs.strip}>
      <Sprockets />
      <View style={fs.frames}>
        {Array.from({ length: n }).map((_, i) => (
          <Photo key={i} i={i} style={fs.frame} />
        ))}
      </View>
      <Sprockets />
    </View>
  );
}

// ── Option 4: a magazine-style collage mosaic ──────────────────────────────────
function Collage() {
  return (
    <View style={co.wrap}>
      <View style={co.topRow}>
        <View style={co.big}>
          <Photo i={0} style={co.fill} />
          <View style={co.sticker}>
            <Text style={co.stickerText}>♡</Text>
          </View>
        </View>
        <View style={co.rightCol}>
          <Photo i={1} style={co.fill} />
          <Photo i={2} style={co.fill} />
        </View>
      </View>
      <View style={co.botRow}>
        <Photo i={3} style={co.wide} />
        <Photo i={4} style={co.sq} />
      </View>
    </View>
  );
}

const p = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 10, paddingBottom: 4 },
  slot: { width: '50%', paddingHorizontal: 7, marginBottom: 12, alignItems: 'center' },
  card: {
    width: '100%',
    backgroundColor: '#fffdf8',
    borderRadius: 4,
    padding: 7,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  tape: {
    position: 'absolute',
    top: -9,
    alignSelf: 'center',
    width: '46%',
    height: 17,
    borderRadius: 2,
    opacity: 0.85,
    transform: [{ rotate: '-6deg' }],
  },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 2 },
  doodle: { position: 'absolute', bottom: 3, alignSelf: 'center', fontFamily: Font.script, fontSize: 16, color: '#9a9186' },
  moreInner: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#efe7d6' },
  moreText: { fontFamily: Font.script, fontSize: 26, color: '#8a7f6f' },
  moreSub: { fontFamily: Font.medium, fontSize: 11, color: '#9a9186', marginTop: -2 },
});

const cl = StyleSheet.create({
  wrap: { paddingTop: 16, paddingBottom: 6 },
  string: { position: 'absolute', top: 14, left: 4, right: 4, height: 2, backgroundColor: '#cdbb95', borderRadius: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  hang: { alignItems: 'center', width: '24%' },
  peg: { width: 9, height: 17, borderRadius: 2, marginBottom: -5, zIndex: 2 },
  frame: {
    width: '100%',
    backgroundColor: '#fffdf8',
    borderRadius: 3,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  photo: { width: '100%', aspectRatio: 0.85, borderRadius: 2 },
});

const fs = StyleSheet.create({
  strip: { backgroundColor: '#2b2b30', borderRadius: 6, paddingVertical: 7, paddingHorizontal: 7, marginTop: 10 },
  holes: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, marginVertical: 5 },
  hole: { width: 12, height: 9, borderRadius: 2, backgroundColor: '#f4efe4' },
  frames: { flexDirection: 'row', gap: 6 },
  frame: { flex: 1, aspectRatio: 1, borderRadius: 2 },
});

const co = StyleSheet.create({
  wrap: { gap: 6, paddingTop: 8 },
  topRow: { flexDirection: 'row', gap: 6, height: 168 },
  big: { flex: 1.6, borderRadius: 8, overflow: 'hidden' },
  rightCol: { flex: 1, gap: 6 },
  fill: { flex: 1, borderRadius: 8 },
  botRow: { flexDirection: 'row', gap: 6, height: 92 },
  wide: { flex: 1.5, borderRadius: 8 },
  sq: { flex: 1, borderRadius: 8 },
  sticker: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,253,248,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerText: { fontFamily: Font.script, fontSize: 15, color: '#c07b86' },
});
