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
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  EnvelopeGlyph,
  HeartIcon,
  LockIcon,
  PencilIcon,
  PlayIcon,
  SaveIcon,
  SharePlaneIcon,
  TrashIcon,
} from '@/components/openwhen/icons';
import { NoteEditor } from '@/components/openwhen/NoteEditor';
import { PhotoBlockEditor } from '@/components/openwhen/PhotoBlockEditor';
import { RevealPhotos, type PhotoVariant } from '@/components/openwhen/RevealPhotos';
import { CAPSULE_THEMES, getCapsuleTheme } from '@/constants/capsuleThemes';
import { Font, OW, TONES } from '@/constants/openwhen';
import { type CapsuleContent, unlockedDetail } from '@/data/sample';
import { updateCapsule, useCapsule } from '@/lib/capsules';

const STARS: [number, number][] = [
  [20, 40], [70, 28], [120, 60], [170, 30], [220, 54],
  [265, 36], [40, 100], [150, 90], [250, 104], [95, 130],
];

const PHOTO_FORMATS: { id: PhotoVariant; label: string }[] = [
  { id: 'polaroid', label: 'Polaroids' },
  { id: 'clothesline', label: 'Clothesline' },
  { id: 'filmstrip', label: 'Filmstrip' },
  { id: 'collage', label: 'Collage' },
];
const ADD_TYPES: { type: CapsuleContent['type']; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'photo', label: 'Photos' },
  { type: 'video', label: 'Video' },
  { type: 'playlist', label: 'Playlist' },
];
const ADD_LABELS: Record<CapsuleContent['type'], string> = {
  text: 'A note',
  photo: 'Photos',
  video: 'Video',
  playlist: 'Playlist',
};

export default function CapsuleScreen() {
  const { id, preview } = useLocalSearchParams<{ id: string; preview?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { capsule } = useCapsule(id);
  const detail = id ? unlockedDetail[id] : undefined; // sample rich letter (demo)
  const isPreview = preview === '1';

  const [themeOverride, setThemeOverride] = useState<string | undefined>(undefined);
  const [contentsDraft, setContentsDraft] = useState<CapsuleContent[] | null>(null);
  const [photoPicker, setPhotoPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [themePanelH, setThemePanelH] = useState(0);
  const themeMenu = useSharedValue(0);
  const themePanelStyle = useAnimatedStyle(() => ({ height: themeMenu.value * themePanelH, opacity: themeMenu.value }));
  const themeChevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${180 - themeMenu.value * 180}deg` }] }));

  const theme = getCapsuleTheme(themeOverride ?? capsule?.theme);
  const contents = contentsDraft ?? capsule?.contents ?? [];
  const showReveal = !!detail || capsule?.status === 'unlocked' || isPreview;

  const pickTheme = (t: string) => {
    setThemeOverride(t);
    if (id) updateCapsule(id, { theme: t });
  };
  // The theme picker lives in a pull-up tab: tap to open, and it drops back down once a
  // swatch is chosen so it never sits in front of the reveal.
  const setThemeMenu = (open: boolean) => {
    setThemeMenuOpen(open);
    themeMenu.value = withTiming(open ? 1 : 0, { duration: 240, easing: Easing.out(Easing.cubic) });
  };
  const saveContents = (next: CapsuleContent[]) => {
    setContentsDraft(next);
    if (id) updateCapsule(id, { contents: next });
  };
  const moveItem = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= contents.length) return;
    const next = [...contents];
    [next[index], next[j]] = [next[j], next[index]];
    saveContents(next);
  };
  const addItem = (type: CapsuleContent['type'], extra?: Partial<CapsuleContent>) => {
    saveContents([...contents, { type, label: ADD_LABELS[type], ...extra }]);
  };
  const addPhoto = (format: PhotoVariant) => {
    addItem('photo', { format, count: 4, images: [0, 1, 2, 3] });
    setPhotoPicker(false);
  };
  const removeItem = (index: number) => {
    saveContents(contents.filter((_, k) => k !== index));
  };
  const updateItem = (index: number, patch: Partial<CapsuleContent>) => {
    saveContents(contents.map((c, k) => (k === index ? { ...c, ...patch } : c)));
  };

  // ---- Sealed capsule ----
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

  const title = detail?.title ?? capsule?.title ?? 'A capsule';
  const fromName = detail?.fromName ?? capsule?.fromName ?? capsule?.who ?? 'Someone';
  const whenLabel = detail?.unlockedOn ?? capsule?.date ?? '';
  const frost = theme.statusBar === 'dark' ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.22)';

  const renderBlock = (item: CapsuleContent, index: number) => {
    const editing = isPreview && editingIndex === index;
    const deleteRow = editing ? (
      <Pressable
        onPress={() => {
          removeItem(index);
          setEditingIndex(null);
        }}
        style={styles.deleteRow}
        hitSlop={6}
        accessibilityLabel="Delete item">
        <TrashIcon size={14} color="#d98a8a" />
        <Text style={styles.deleteRowText}>Delete</Text>
      </Pressable>
    ) : null;

    if (item.type === 'photo') {
      const imgs = item.images ?? Array.from({ length: item.count ?? (parseInt(item.label, 10) || 4) }, (_, k) => k);
      const fmt = (item.format ?? 'polaroid') as PhotoVariant;
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.onBgDim }]}>
            {imgs.length} {imgs.length === 1 ? 'photo' : 'photos'}
          </Text>
          {editing ? (
            <PhotoBlockEditor
              images={imgs}
              format={fmt}
              colors={{ onBg: theme.onBg, onBgDim: theme.onBgDim, base: theme.colors[0] }}
              onSave={(patch) => {
                updateItem(index, patch);
                setEditingIndex(null);
              }}
              onCancel={() => setEditingIndex(null)}
              onDragActive={setScrollLocked}
            />
          ) : (
            <RevealPhotos images={imgs} variant={fmt} />
          )}
          {deleteRow}
        </View>
      );
    }
    if (item.type === 'video') {
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.onBgDim }]}>{item.label}</Text>
          <LinearGradient colors={[theme.colors[1], theme.colors[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.videoTile}>
            <View style={styles.playBadge}>
              <PlayIcon size={18} color={OW.dark} />
            </View>
          </LinearGradient>
          {deleteRow}
        </View>
      );
    }
    if (item.type === 'playlist') {
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.onBgDim }]}>{item.label}</Text>
          {item.preview ? <Text style={[styles.sectionText, { color: theme.onBgDim }]}>{item.preview}</Text> : null}
          {deleteRow}
        </View>
      );
    }
    return (
      <View>
        {editing ? (
          <NoteEditor
            initial={item.preview ?? item.label}
            colors={{ onBg: theme.onBg, onBgDim: theme.onBgDim, base: theme.colors[0] }}
            onSave={(t) => {
              updateItem(index, { preview: t });
              setEditingIndex(null);
            }}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <View style={styles.letter}>
            {(item.preview ? item.preview.split('\n') : [item.label]).map((p, k) => (
              <Text key={k} style={styles.letterP}>
                {p}
              </Text>
            ))}
          </View>
        )}
        {deleteRow}
      </View>
    );
  };

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
        scrollEnabled={!scrollLocked}
        contentContainerStyle={[styles.darkScroll, { paddingBottom: insets.bottom + (isPreview ? 130 : 96) }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleWrap}>
          <Text style={[styles.whenTitle, { color: theme.onBg }]}>{title}</Text>
          <HeartIcon size={18} color="#f1b6c0" />
        </View>
        <Text style={[styles.darkMeta, { color: theme.onBgDim }]}>
          From: {fromName}
          {whenLabel ? `\n${isPreview ? 'Opens' : 'Unlocked'}: ${whenLabel}` : ''}
        </Text>

        {detail ? (
          <>
            <View style={styles.letter}>
              {detail.letter.map((p, i) => (
                <Text key={i} style={styles.letterP}>
                  {p}
                </Text>
              ))}
              <Text style={styles.letterP}>{detail.closing}</Text>
              <Text style={styles.sig}>{detail.signature}</Text>
            </View>
            {detail.audio ? (
              <View style={styles.player}>
                <View style={[styles.track, { backgroundColor: frost }]}>
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
            ) : null}
          </>
        ) : (
          <>
            {contents.map((item, i) => (
              <View key={i}>
                {isPreview ? (
                  <View style={styles.itemBar}>
                    <Pressable onPress={() => moveItem(i, -1)} disabled={i === 0} hitSlop={8}>
                      <View style={[styles.arrowUp, { opacity: i === 0 ? 0.3 : 1 }]}>
                        <ChevronDownIcon size={16} color={theme.onBg} />
                      </View>
                    </Pressable>
                    <Pressable onPress={() => moveItem(i, 1)} disabled={i === contents.length - 1} hitSlop={8}>
                      <View style={{ opacity: i === contents.length - 1 ? 0.3 : 1 }}>
                        <ChevronDownIcon size={16} color={theme.onBg} />
                      </View>
                    </Pressable>
                    <Pressable onPress={() => setEditingIndex(editingIndex === i ? null : i)} hitSlop={8} accessibilityLabel="Edit item">
                      <PencilIcon size={16} color={theme.onBg} />
                    </Pressable>
                  </View>
                ) : null}
                {renderBlock(item, i)}
              </View>
            ))}

            {contents.length === 0 ? (
              <Text style={[styles.emptyReveal, { color: theme.onBgDim }]}>
                Nothing inside yet{isPreview ? ' — add something below.' : '.'}
              </Text>
            ) : null}

            {isPreview ? (
              <View style={styles.addWrap}>
                <Text style={[styles.addLabel, { color: theme.onBgDim }]}>Add to this capsule</Text>
                <View style={styles.addRow}>
                  {ADD_TYPES.map((t) => (
                    <Pressable
                      key={t.type}
                      onPress={() => (t.type === 'photo' ? setPhotoPicker((v) => !v) : addItem(t.type))}
                      style={[styles.addChip, { borderColor: theme.onBgDim }, t.type === 'photo' && photoPicker && { backgroundColor: theme.onBg }]}>
                      <Text style={[styles.addChipText, { color: t.type === 'photo' && photoPicker ? theme.colors[0] : theme.onBg }]}>
                        + {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {photoPicker ? (
                  <View style={styles.fmtPick}>
                    <Text style={[styles.fmtPickLabel, { color: theme.onBgDim }]}>Choose a format:</Text>
                    <View style={styles.fmtPickChips}>
                      {PHOTO_FORMATS.map((f) => (
                        <Pressable key={f.id} onPress={() => addPhoto(f.id)} style={[styles.fmtPickChip, { borderColor: theme.onBgDim }]}>
                          <Text style={[styles.fmtPickText, { color: theme.onBg }]}>{f.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      {isPreview ? (
        <View
          style={[
            styles.themeBar,
            {
              paddingBottom: insets.bottom + 8,
              backgroundColor: theme.statusBar === 'dark' ? 'rgba(8,10,22,0.72)' : 'rgba(255,255,255,0.72)',
            },
          ]}>
          <Animated.View style={[styles.themePanelClip, themePanelStyle]}>
            <View style={styles.themePanelInner} onLayout={(e) => setThemePanelH(e.nativeEvent.layout.height)}>
              <View style={styles.custRow}>
                {CAPSULE_THEMES.map((th) => {
                  const on = (themeOverride ?? capsule?.theme ?? 'twilight') === th.id;
                  return (
                    <Pressable
                      key={th.id}
                      onPress={() => {
                        pickTheme(th.id);
                        setThemeMenu(false);
                      }}
                      hitSlop={4}>
                      <LinearGradient
                        colors={th.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.custSwatch, { borderColor: on ? theme.onBg : 'transparent' }]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Animated.View>
          <Pressable onPress={() => setThemeMenu(!themeMenuOpen)} style={styles.themeTab} hitSlop={6} accessibilityLabel="Toggle theme menu">
            <View style={[styles.themeGrabber, { backgroundColor: theme.onBgDim }]} />
            <View style={styles.themeTabRow}>
              <Text style={[styles.themeTabText, { color: theme.onBg }]}>Theme</Text>
              <LinearGradient
                colors={theme.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.themeTabSwatch, { borderColor: theme.onBg }]}
              />
              <Animated.View style={themeChevronStyle}>
                <ChevronDownIcon size={15} color={theme.onBg} />
              </Animated.View>
            </View>
          </Pressable>
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

  sealed: { flex: 1, backgroundColor: OW.bg, paddingHorizontal: 18 },
  barLight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sealedBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 60 },
  sealedTitle: { fontFamily: Font.extrabold, fontSize: 20, color: OW.ink, textAlign: 'center', marginTop: 8 },
  sealedSub: { fontFamily: Font.regular, fontSize: 13, color: OW.muted },
  sealedLock: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },

  dark: { flex: 1 },
  art: { position: 'absolute', left: 0, right: 0 },
  barDark: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  unlockedTag: { fontFamily: Font.bold, fontSize: 14 },
  darkScroll: { paddingHorizontal: 18 },
  titleWrap: { alignItems: 'center', gap: 8, marginTop: 18 },
  whenTitle: { fontFamily: Font.script, fontSize: 30, textAlign: 'center' },
  darkMeta: { fontFamily: Font.regular, fontSize: 12.5, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  letter: {
    backgroundColor: '#f7f2e8',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  letterP: { fontFamily: Font.regular, fontSize: 14, color: '#3a3630', lineHeight: 22, marginBottom: 11 },
  sig: { fontFamily: Font.script, fontSize: 20, color: '#3a3630' },

  section: { marginTop: 12 },
  sectionLabel: { fontFamily: Font.bold, fontSize: 12.5, marginBottom: 8 },
  sectionText: { fontFamily: Font.regular, fontSize: 13, lineHeight: 20 },
  videoTile: { height: 160, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  playBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },

  itemBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 18, marginTop: 14, marginBottom: -6 },
  arrowUp: { transform: [{ rotate: '180deg' }] },
  deleteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, alignSelf: 'flex-start' },
  deleteRowText: { fontFamily: Font.semibold, fontSize: 12.5, color: '#d98a8a' },
  emptyReveal: { fontFamily: Font.regular, fontSize: 13, textAlign: 'center', marginTop: 24 },
  addWrap: { marginTop: 24 },
  addLabel: { fontFamily: Font.bold, fontSize: 12.5, marginBottom: 8 },
  addRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1 },
  addChipText: { fontFamily: Font.semibold, fontSize: 12.5 },
  fmtPick: { marginTop: 12 },
  fmtPickLabel: { fontFamily: Font.semibold, fontSize: 12, marginBottom: 8 },
  fmtPickChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fmtPickChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1 },
  fmtPickText: { fontFamily: Font.semibold, fontSize: 12.5 },

  player: { marginTop: 18 },
  track: { height: 4, borderRadius: 4, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 4 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  time: { fontFamily: Font.regular, fontSize: 11 },
  playRow: { alignItems: 'center', marginTop: 8 },
  playBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  themeBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 6,
    paddingHorizontal: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  themePanelClip: { overflow: 'hidden', alignSelf: 'stretch' },
  themePanelInner: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 8, paddingBottom: 8 },
  custRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10 },
  custSwatch: { width: 30, height: 30, borderRadius: 9, borderWidth: 2 },
  themeTab: { alignItems: 'center', paddingTop: 2 },
  themeGrabber: { width: 34, height: 4, borderRadius: 2, opacity: 0.5, marginBottom: 7 },
  themeTabRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 2 },
  themeTabText: { fontFamily: Font.bold, fontSize: 12.5 },
  themeTabSwatch: { width: 18, height: 18, borderRadius: 6, borderWidth: 1.5 },

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
