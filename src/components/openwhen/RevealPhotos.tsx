import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Font } from '@/constants/openwhen';

// Scrapbook-style photo layouts for the capsule reveal. Photos are an ordered list
// of ids; each id maps to a placeholder gradient (swap for <Image> once Storage is on).

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
const grad = (id: number): [string, string] => GRADS[((id % GRADS.length) + GRADS.length) % GRADS.length];

export function RevealPhotos({
  count,
  images,
  variant = 'polaroid',
}: {
  count?: number;
  images?: number[];
  variant?: PhotoVariant;
}) {
  const ids = images && images.length ? images : Array.from({ length: Math.max(1, count ?? 4) }, (_, i) => i);
  if (variant === 'clothesline') return <Clothesline ids={ids.slice(0, 4)} />;
  if (variant === 'filmstrip') return <Filmstrip ids={ids.slice(0, 3)} />;
  if (variant === 'collage') return <Collage ids={ids} />;
  const shown = ids.slice(0, 6);
  return <Polaroids ids={shown} extra={ids.length - shown.length} />;
}

// ── Polaroids ──────────────────────────────────────────────────────────────────
const OFFSETS = [0, 18, 6, 22, 2, 16];
const TAPES = ['rgba(214,182,143,0.7)', 'rgba(154,170,124,0.62)', 'rgba(209,160,160,0.6)', 'rgba(140,165,190,0.6)'];
const DOODLES = ['♡', '✿', '☀', '✦', '❀', '♪'];

function Polaroids({ ids, extra }: { ids: number[]; extra: number }) {
  return (
    <View style={p.wrap}>
      {ids.map((id, i) => (
        <View key={i} style={[p.slot, { marginTop: OFFSETS[i % OFFSETS.length] }]}>
          <View style={[p.card, { transform: [{ rotate: TILTS[i % TILTS.length] }] }]}>
            <View style={[p.tape, { backgroundColor: TAPES[i % TAPES.length] }]} />
            <LinearGradient colors={grad(id)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={p.photo} />
            <Text style={p.doodle}>{DOODLES[i % DOODLES.length]}</Text>
          </View>
        </View>
      ))}
      {extra > 0 ? (
        <View style={[p.slot, { marginTop: OFFSETS[ids.length % OFFSETS.length] }]}>
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

// ── Clothesline ────────────────────────────────────────────────────────────────
const HANGS = [12, 26, 8, 22];
const PEGS = ['#c9966a', '#a8a06a', '#b97f7f', '#7f93b0'];

function Clothesline({ ids }: { ids: number[] }) {
  return (
    <View style={cl.wrap}>
      <View style={cl.string} />
      <View style={cl.row}>
        {ids.map((id, i) => (
          <View key={i} style={[cl.hang, { marginTop: HANGS[i % HANGS.length] }]}>
            <View style={[cl.peg, { backgroundColor: PEGS[i % PEGS.length] }]} />
            <View style={[cl.frame, { transform: [{ rotate: TILTS[i % TILTS.length] }] }]}>
              <LinearGradient colors={grad(id)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={cl.photo} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Filmstrip ──────────────────────────────────────────────────────────────────
function Sprockets() {
  return (
    <View style={fs.holes}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={fs.hole} />
      ))}
    </View>
  );
}

function Filmstrip({ ids }: { ids: number[] }) {
  return (
    <View style={fs.strip}>
      <Sprockets />
      <View style={fs.frames}>
        {ids.map((id, i) => (
          <LinearGradient key={i} colors={grad(id)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fs.frame} />
        ))}
      </View>
      <Sprockets />
    </View>
  );
}

// ── Collage ────────────────────────────────────────────────────────────────────
function Collage({ ids }: { ids: number[] }) {
  const g = (i: number): [string, string] => grad(ids[i % ids.length]);
  return (
    <View style={co.wrap}>
      <View style={co.topRow}>
        <View style={co.big}>
          <LinearGradient colors={g(0)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={co.fill} />
          <View style={co.sticker}>
            <Text style={co.stickerText}>♡</Text>
          </View>
        </View>
        <View style={co.rightCol}>
          <LinearGradient colors={g(1)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={co.fill} />
          <LinearGradient colors={g(2)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={co.fill} />
        </View>
      </View>
      <View style={co.botRow}>
        <LinearGradient colors={g(3)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={co.wide} />
        <LinearGradient colors={g(4)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={co.sq} />
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
