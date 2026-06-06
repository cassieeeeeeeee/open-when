import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
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
import { CAPSULE_THEMES, getCapsuleTheme } from '@/constants/capsuleThemes';
import { Font, OW, TONES } from '@/constants/openwhen';
import { findCapsule, unlockedDetail } from '@/data/sample';

const STARS: [number, number][] = [
  [20, 40], [70, 28], [120, 60], [170, 30], [220, 54],
  [265, 36], [40, 100], [150, 90], [250, 104], [95, 130],
];

export default function CapsuleScreen() {
  const { id, theme: themeParam } = useLocalSearchParams<{ id: string; theme?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const detail = id ? unlockedDetail[id] : undefined;
  const [themeId, setThemeId] = useState<string>(themeParam ?? 'twilight');
  const theme = getCapsuleTheme(themeId);

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

  // ---- Unlocked capsule: the themeable letter view ----
  return (
    <View style={[styles.dark, { backgroundColor: theme.colors[0] }]}>
      <StatusBar style={theme.statusBar} />
      <LinearGradient colors={theme.colors} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />

      {theme.art === 'mountains' ? (
        <Svg
          width={width}
          height={(width * 90) / 292}
          viewBox="0 0 292 90"
          preserveAspectRatio="none"
          style={[styles.art, { top: insets.top + 250 }]}>
          <Path
            d="M0 90 L0 55 L55 22 L110 60 L150 35 L200 68 L250 40 L292 64 L292 90 Z"
            fill="rgba(0,0,0,0.28)"
          />
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
        <Text style={[styles.unlockedTag, { color: theme.onBg }]}>Unlocked ✨</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.darkScroll, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleWrap}>
          <Text style={[styles.whenTitle, { color: theme.onBg }]}>{detail.title}</Text>
          <HeartIcon size={18} color="#f1b6c0" />
        </View>
        <Text style={[styles.darkMeta, { color: theme.onBgDim }]}>
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
          <View
            style={[
              styles.track,
              { backgroundColor: theme.statusBar === 'dark' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)' },
            ]}>
            <View style={[styles.trackFill, { width: `${detail.audio.progress * 100}%`, backgroundColor: theme.onBg }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={[styles.time, { color: theme.onBgDim }]}>{detail.audio.position}</Text>
            <Text style={[styles.time, { color: theme.onBgDim }]}>{detail.audio.duration}</Text>
          </View>
          <View style={styles.playRow}>
            <Pressable style={styles.playBtn}>
              <PlayIcon size={15} color={OW.dark} />
            </Pressable>
          </View>
        </View>

        <View style={styles.themePicker}>
          <Text style={[styles.themeLabel, { color: theme.onBgDim }]}>Theme</Text>
          <View style={styles.swatchRow}>
            {CAPSULE_THEMES.map((th) => {
              const on = themeId === th.id;
              return (
                <Pressable key={th.id} onPress={() => setThemeId(th.id)} style={styles.swatchWrap}>
                  <LinearGradient
                    colors={th.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.swatch, on && { borderColor: theme.onBg }]}
                  />
                  <Text style={[styles.swatchName, { color: on ? theme.onBg : theme.onBgDim }]}>{th.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

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

  themePicker: { marginTop: 26 },
  themeLabel: { fontFamily: Font.bold, fontSize: 12.5, marginBottom: 10, textAlign: 'center' },
  swatchRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14 },
  swatchWrap: { alignItems: 'center', gap: 6, width: 58 },
  swatch: { width: 46, height: 46, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  swatchName: { fontFamily: Font.medium, fontSize: 11 },

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
