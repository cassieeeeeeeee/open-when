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
import Svg, { Circle, Path } from 'react-native-svg';

import {
  ChevronLeftIcon,
  EnvelopeGlyph,
  HeartIcon,
  LockIcon,
  PlayIcon,
  SaveIcon,
  SharePlaneIcon,
} from '@/components/openwhen/icons';
import { getCapsuleTheme } from '@/constants/capsuleThemes';
import { Font, OW, TONES } from '@/constants/openwhen';
import { unlockedDetail } from '@/data/sample';
import { useCapsule } from '@/lib/capsules';

const STARS: [number, number][] = [
  [20, 40], [70, 28], [120, 60], [170, 30], [220, 54],
  [265, 36], [40, 100], [150, 90], [250, 104], [95, 130],
];

export default function CapsuleScreen() {
  const { id, preview } = useLocalSearchParams<{ id: string; preview?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { capsule } = useCapsule(id);
  const detail = id ? unlockedDetail[id] : undefined; // sample rich letter (demo)
  const theme = getCapsuleTheme(capsule?.theme);
  const isPreview = preview === '1';
  const showReveal = !!detail || capsule?.status === 'unlocked' || isPreview;

  // ---- Sealed capsule: a simple light placeholder ----
  if (!showReveal) {
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
          <View style={styles.sealedLock}>
            <LockIcon size={15} color={OW.muted} />
            <Text style={styles.sealedSub}>This capsule is still sealed</Text>
          </View>
        </View>
      </View>
    );
  }

  // ---- Unlocked / preview: the themeable reveal ----
  const title = detail?.title ?? capsule?.title ?? 'A capsule';
  const fromName = detail?.fromName ?? capsule?.fromName ?? capsule?.who ?? 'Someone';
  const whenLabel = detail?.unlockedOn ?? capsule?.date ?? '';
  const textItem = capsule?.contents?.find((c) => c.type === 'text');
  const paragraphs =
    detail?.letter ??
    (textItem?.preview ? textItem.preview.split('\n') : textItem ? [textItem.label] : ['Your message will appear here.']);
  const photoItem = capsule?.contents?.find((c) => c.type === 'photo');
  const playlistItem = capsule?.contents?.find((c) => c.type === 'playlist');
  const audio = detail?.audio;
  const frost = theme.statusBar === 'dark' ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.22)';

  return (
    <View style={[styles.dark, { backgroundColor: theme.colors[0] }]}>
      <StatusBar style={theme.statusBar} />
      <LinearGradient colors={theme.colors} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />

      {theme.art === 'mountains' ? (
        <Svg width={width} height={(width * 90) / 292} viewBox="0 0 292 90" preserveAspectRatio="none" style={[styles.art, { top: insets.top + 250 }]}>
          <Path d="M0 90 L0 55 L55 22 L110 60 L150 35 L200 68 L250 40 L292 64 L292 90 Z" fill="rgba(0,0,0,0.28)" />
        </Svg>
      ) : theme.art === 'stars' ? (
        <Svg width={width} height={width * 0.8} viewBox="0 0 300 240" style={[styles.art, { top: insets.top + 36 }]}>
          {STARS.map(([cx, cy], i) => (
            <Circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 2 : 1.2} fill="rgba(255,255,255,0.75)" />
          ))}
        </Svg>
      ) : theme.art === 'sun' ? (
        <Svg width={width} height={width * 0.6} viewBox="0 0 100 60" preserveAspectRatio="none" style={[styles.art, { top: insets.top + 110 }]}>
          <Circle cx="50" cy="56" r="26" fill="rgba(255,236,210,0.20)" />
          <Circle cx="50" cy="56" r="16" fill="rgba(255,236,210,0.28)" />
        </Svg>
      ) : null}

      <View style={[styles.barDark, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeftIcon size={22} color={theme.onBg} />
        </Pressable>
        <Text style={[styles.unlockedTag, { color: theme.onBg }]}>{isPreview ? 'Preview' : 'Unlocked ✨'}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.darkScroll, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleWrap}>
          <Text style={[styles.whenTitle, { color: theme.onBg }]}>{title}</Text>
          <HeartIcon size={18} color="#f1b6c0" />
        </View>
        <Text style={[styles.darkMeta, { color: theme.onBgDim }]}>
          From: {fromName}
          {whenLabel ? `\n${isPreview ? 'Opens' : 'Unlocked'}: ${whenLabel}` : ''}
        </Text>

        <View style={styles.letter}>
          {paragraphs.map((p, i) => (
            <Text key={i} style={styles.letterP}>
              {p}
            </Text>
          ))}
          {detail?.closing ? <Text style={styles.letterP}>{detail.closing}</Text> : null}
          {detail?.signature ? <Text style={styles.sig}>{detail.signature}</Text> : null}
        </View>

        {photoItem ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.onBgDim }]}>{photoItem.label}</Text>
            <View style={styles.photoRow}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.photo, { backgroundColor: frost }]} />
              ))}
            </View>
          </View>
        ) : null}

        {playlistItem ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.onBgDim }]}>{playlistItem.label}</Text>
            {playlistItem.preview ? (
              <Text style={[styles.sectionText, { color: theme.onBgDim }]}>{playlistItem.preview}</Text>
            ) : null}
          </View>
        ) : null}

        {audio ? (
          <View style={styles.player}>
            <View style={[styles.track, { backgroundColor: frost }]}>
              <View style={[styles.trackFill, { width: `${audio.progress * 100}%`, backgroundColor: theme.onBg }]} />
            </View>
            <View style={styles.timeRow}>
              <Text style={[styles.time, { color: theme.onBgDim }]}>{audio.position}</Text>
              <Text style={[styles.time, { color: theme.onBgDim }]}>{audio.duration}</Text>
            </View>
            <View style={styles.playRow}>
              <Pressable style={styles.playBtn}>
                <PlayIcon size={15} color={OW.dark} />
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {isPreview ? (
        <View style={[styles.previewNote, { paddingBottom: insets.bottom + 12 }]}>
          <Text style={[styles.previewNoteText, { color: theme.onBgDim }]}>
            This is how it will open ✨
          </Text>
        </View>
      ) : (
        <View style={[styles.actions, { paddingBottom: insets.bottom + 10 }]}>
          <Pressable style={styles.action}>
            <SaveIcon size={20} color={theme.onBg} />
            <Text style={[styles.actionText, { color: theme.onBgDim }]}>Save</Text>
          </Pressable>
          <Pressable style={styles.action}>
            <SharePlaneIcon size={20} color={theme.onBg} />
            <Text style={[styles.actionText, { color: theme.onBgDim }]}>Share</Text>
          </Pressable>
        </View>
      )}
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

  // Unlocked (themeable) view
  dark: { flex: 1 },
  art: { position: 'absolute', left: 0, right: 0 },
  barDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  unlockedTag: { fontFamily: Font.bold, fontSize: 14 },
  darkScroll: { paddingHorizontal: 18 },
  titleWrap: { alignItems: 'center', gap: 8, marginTop: 18 },
  whenTitle: { fontFamily: Font.script, fontSize: 30, textAlign: 'center' },
  darkMeta: { fontFamily: Font.regular, fontSize: 12.5, textAlign: 'center', marginTop: 8, lineHeight: 19 },
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

  section: { marginTop: 18 },
  sectionLabel: { fontFamily: Font.bold, fontSize: 12.5, marginBottom: 8 },
  sectionText: { fontFamily: Font.regular, fontSize: 13, lineHeight: 20 },
  photoRow: { flexDirection: 'row', gap: 8 },
  photo: { flex: 1, aspectRatio: 1, borderRadius: 10 },

  player: { marginTop: 18 },
  track: { height: 4, borderRadius: 4, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 4 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  time: { fontFamily: Font.regular, fontSize: 11 },
  playRow: { alignItems: 'center', marginTop: 8 },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewNote: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingTop: 12 },
  previewNoteText: { fontFamily: Font.medium, fontSize: 12.5 },

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
  actionText: { fontFamily: Font.medium, fontSize: 12 },
});
