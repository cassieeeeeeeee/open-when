import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  ChevronLeftIcon,
  EnvelopeGlyph,
  HeartIcon,
  LockIcon,
  PlayIcon,
  SaveIcon,
  SharePlaneIcon,
} from '@/components/openwhen/icons';
import { Font, OW, TONES } from '@/constants/openwhen';
import { findCapsule, unlockedDetail } from '@/data/sample';

export default function CapsuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const detail = id ? unlockedDetail[id] : undefined;

  // ---- Sealed capsule: a simple light placeholder (no mockup design for this) ----
  if (!detail) {
    const capsule = id ? findCapsule(id) : undefined;
    const tone = TONES[capsule?.tone ?? 'pink'];
    return (
      <View style={styles.sealed}>
        <View style={[styles.barLight, { paddingTop: insets.top + 6 }]}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeftIcon size={22} color={OW.ink2} />
          </Pressable>
          <View style={styles.spacer} />
        </View>
        <View style={styles.sealedBody}>
          <EnvelopeGlyph size={104} color={tone.color} soft={tone.soft} />
          <Text style={styles.sealedTitle}>{capsule?.title ?? 'Capsule'}</Text>
          {capsule ? (
            <Text style={styles.sealedSub}>
              {capsule.direction === 'received' ? 'From' : 'For'}: {capsule.who}
            </Text>
          ) : null}
          {capsule ? <Text style={styles.sealedSub}>{capsule.date}</Text> : null}
          {capsule?.status === 'unlocked' ? (
            <Text style={styles.sealedSub}>Opened — this capsule is locked from edits.</Text>
          ) : (
            <View style={styles.sealedLock}>
              <LockIcon size={15} color={OW.muted} />
              <Text style={styles.sealedSub}>This capsule is still sealed</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // ---- Unlocked capsule: the dark letter view ----
  return (
    <View style={styles.dark}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1f2540', '#344063', '#5a6a8a']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        width={width}
        height={(width * 90) / 292}
        viewBox="0 0 292 90"
        preserveAspectRatio="none"
        style={[styles.mountains, { top: insets.top + 250 }]}>
        <Path
          d="M0 90 L0 55 L55 22 L110 60 L150 35 L200 68 L250 40 L292 64 L292 90 Z"
          fill="rgba(20,24,45,0.55)"
        />
      </Svg>

      <View style={[styles.barDark, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeftIcon size={22} color="#eef0f6" />
        </Pressable>
        <Text style={styles.unlockedTag}>Unlocked ✨</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.darkScroll, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleWrap}>
          <Text style={styles.whenTitle}>{detail.title}</Text>
          <HeartIcon size={18} color="#f1b6c0" />
        </View>
        <Text style={styles.darkMeta}>
          From: {detail.fromName}
          {'\n'}Unlocked: {detail.unlockedOn}
        </Text>

        <View style={styles.letter}>
          {detail.letter.map((p, i) => (
            <Text key={i} style={styles.letterP}>
              {p}
            </Text>
          ))}
          <Text style={styles.letterP}>{detail.closing}</Text>
          <Text style={styles.sig}>{detail.signature}</Text>
        </View>

        <View style={styles.player}>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${detail.audio.progress * 100}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{detail.audio.position}</Text>
            <Text style={styles.time}>{detail.audio.duration}</Text>
          </View>
          <View style={styles.playRow}>
            <Pressable style={styles.playBtn}>
              <PlayIcon size={15} color={OW.dark} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 10 }]}>
        <Pressable style={styles.action}>
          <SaveIcon size={20} color="rgba(238,240,246,0.9)" />
          <Text style={styles.actionText}>Save</Text>
        </Pressable>
        <Pressable style={styles.action}>
          <SharePlaneIcon size={20} color="rgba(238,240,246,0.9)" />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spacer: { width: 22 },

  // Sealed (light) view
  sealed: { flex: 1, backgroundColor: OW.bg, paddingHorizontal: 18 },
  barLight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sealedBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 60 },
  sealedTitle: {
    fontFamily: Font.extrabold,
    fontSize: 20,
    color: OW.ink,
    textAlign: 'center',
    marginTop: 8,
  },
  sealedSub: { fontFamily: Font.regular, fontSize: 13, color: OW.muted },
  sealedLock: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },

  // Unlocked (dark) view
  dark: { flex: 1, backgroundColor: '#1f2540' },
  mountains: { position: 'absolute', left: 0, right: 0 },
  barDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  unlockedTag: { fontFamily: Font.bold, fontSize: 14, color: '#eef0f6' },
  darkScroll: { paddingHorizontal: 18 },
  titleWrap: { alignItems: 'center', gap: 8, marginTop: 18 },
  whenTitle: { fontFamily: Font.script, fontSize: 30, color: '#eef0f6', textAlign: 'center' },
  darkMeta: {
    fontFamily: Font.regular,
    fontSize: 12.5,
    color: 'rgba(238,240,246,0.7)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  letter: {
    backgroundColor: '#f7f2e8',
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  letterP: { fontFamily: Font.regular, fontSize: 14, color: '#3a3630', lineHeight: 22, marginBottom: 11 },
  sig: { fontFamily: Font.script, fontSize: 20, color: '#3a3630' },
  player: { marginTop: 18 },
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden' },
  trackFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  time: { fontFamily: Font.regular, fontSize: 11, color: 'rgba(238,240,246,0.75)' },
  playRow: { alignItems: 'center', marginTop: 8 },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingTop: 12,
  },
  action: { alignItems: 'center', gap: 4 },
  actionText: { fontFamily: Font.medium, fontSize: 12, color: 'rgba(238,240,246,0.85)' },
});
