import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Font } from '@/constants/openwhen';

// A scrapbook-style photo cluster for the capsule reveal: tilted polaroid frames
// with washi-tape accents, soft shadows and little doodles. Placeholder art for
// now (soft gradients) — swap the LinearGradient for <Image> once Storage is on.

const TILTS = ['-5deg', '4deg', '-3deg', '6deg', '-4deg', '3deg'];
const OFFSETS = [0, 18, 6, 22, 2, 16];
const TAPES = [
  'rgba(214,182,143,0.7)',
  'rgba(154,170,124,0.62)',
  'rgba(209,160,160,0.6)',
  'rgba(140,165,190,0.6)',
];
const GRADS: [string, string][] = [
  ['#cdb38f', '#8a9b7c'],
  ['#7a9bc1', '#c79a6a'],
  ['#d9a0a0', '#9c6f6f'],
  ['#9b8fd0', '#6f7e62'],
  ['#e0b98a', '#b08a64'],
  ['#8aa9b0', '#6f8a7c'],
];
const DOODLES = ['♡', '✿', '☀', '✦', '❀', '♪'];

export function RevealPhotos({ count }: { count: number }) {
  const n = Math.max(1, Math.min(count || 4, 6));
  const extra = (count || 0) - n;

  return (
    <View style={s.wrap}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={[s.slot, { marginTop: OFFSETS[i % OFFSETS.length] }]}>
          <View style={[s.card, { transform: [{ rotate: TILTS[i % TILTS.length] }] }]}>
            <View style={[s.tape, { backgroundColor: TAPES[i % TAPES.length] }]} />
            <LinearGradient
              colors={GRADS[i % GRADS.length]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.photo}
            />
            <Text style={s.doodle}>{DOODLES[i % DOODLES.length]}</Text>
          </View>
        </View>
      ))}

      {extra > 0 ? (
        <View style={[s.slot, { marginTop: OFFSETS[n % OFFSETS.length] }]}>
          <View style={[s.card, { transform: [{ rotate: '3deg' }] }]}>
            <View style={[s.photo, s.moreInner]}>
              <Text style={s.moreText}>+{extra}</Text>
              <Text style={s.moreSub}>more</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
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
  doodle: {
    position: 'absolute',
    bottom: 3,
    alignSelf: 'center',
    fontFamily: Font.script,
    fontSize: 16,
    color: '#9a9186',
  },
  moreInner: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#efe7d6' },
  moreText: { fontFamily: Font.script, fontSize: 26, color: '#8a7f6f' },
  moreSub: { fontFamily: Font.medium, fontSize: 11, color: '#9a9186', marginTop: -2 },
});
