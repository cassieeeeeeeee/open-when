import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { DraggablePhotos, FORMATS, FormatGlyph, PhotoBlockEditor } from '@/components/openwhen/PhotoBlockEditor';
import { RevealPhotos, type PhotoVariant } from '@/components/openwhen/RevealPhotos';
import { ThemeArt } from '@/components/openwhen/ThemeArt';
import { ThemeSwatchGrid } from '@/components/openwhen/ThemeSwatchGrid';
import { type CapsuleTheme, getCapsuleTheme } from '@/constants/capsuleThemes';
import { Font, OW, TONES } from '@/constants/openwhen';
import { type CapsuleContent, unlockedDetail } from '@/data/sample';
import { updateCapsule, useCapsule } from '@/lib/capsules';

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

// How the section backgrounds crossfade as you scroll: a band eases fully in over the last FADE of
// a screen-height of scroll before its section reaches the top, so the reveal opens on the base
// theme and slides into each section's theme as you scroll to it. Tune FADE for a slower/faster fade.
const FADE = 0.55;

type Band = { startY: number; themeId: string; photo?: string };

// One full-screen background layer for a band. Layer 0 (the top of the document) stays opaque as
// the base; every higher layer fades its opacity in as you scroll past its boundary, crossfading
// over the band below it (alpha-compositing keeps full coverage — no gap ever shows through).
function BandLayer({
  band,
  index,
  scrollY,
  width,
  insetsTop,
  screenH,
}: {
  band: Band;
  index: number;
  scrollY: SharedValue<number>;
  width: number;
  insetsTop: number;
  screenH: number;
}) {
  const animStyle = useAnimatedStyle(() => {
    if (index === 0) return { opacity: 1 };
    const lo = Math.max(0, band.startY - FADE * screenH);
    return { opacity: interpolate(scrollY.value, [lo, band.startY], [0, 1], Extrapolation.CLAMP) };
  });
  const themeObj = getCapsuleTheme(band.themeId);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, animStyle]} pointerEvents="none">
      {band.photo ? (
        <>
          <Image source={{ uri: band.photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.55)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
        </>
      ) : (
        <>
          <LinearGradient colors={themeObj.colors} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
          <ThemeArt art={themeObj.art} width={width} insetsTop={insetsTop} />
        </>
      )}
    </Animated.View>
  );
}

// Per-section appearance controls, shown while a block is being edited: a Theme button (which opens
// the swatch grid — choosing one themes this block and every block below it, until another override),
// a Layout button for photo blocks (a menu of photo layouts), and a Background-photo button. Each
// writes straight to the content item via the callbacks.
function SectionAppearance({
  item,
  sec,
  inheritedName,
  photos,
  onSetTheme,
  onClearTheme,
  onSetLayout,
  onSelectPhoto,
  onAddPhoto,
  onRemovePhoto,
}: {
  item: CapsuleContent;
  sec: CapsuleTheme;
  inheritedName: string;
  photos: string[];
  onSetTheme: (id: string) => void;
  onClearTheme: () => void;
  onSetLayout: (format: PhotoVariant) => void;
  onSelectPhoto: (uri: string) => void;
  onAddPhoto: () => void;
  onRemovePhoto: () => void;
}) {
  const [open, setOpen] = useState<'none' | 'theme' | 'layout'>('none');
  const toggle = (m: 'theme' | 'layout') => setOpen((v) => (v === m ? 'none' : m));
  const fmt = (item.format ?? 'polaroid') as PhotoVariant;
  return (
    <View style={styles.sectionAppear}>
      <View style={styles.sectionAppearRow}>
        <Pressable onPress={() => toggle('theme')} style={[styles.bgBtn, { borderColor: sec.onBgDim }]} accessibilityLabel="Section theme">
          {item.backgroundImage ? (
            <Image source={{ uri: item.backgroundImage }} style={[styles.itemThemeChip, { borderColor: sec.onBg }]} contentFit="cover" />
          ) : (
            <LinearGradient colors={sec.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.itemThemeChip, { borderColor: sec.onBg }]} />
          )}
          <Text style={[styles.bgBtnText, { color: sec.onBg }]}>Theme</Text>
        </Pressable>
        {item.type === 'photo' ? (
          <Pressable onPress={() => toggle('layout')} style={[styles.bgBtn, { borderColor: sec.onBgDim }]} accessibilityLabel="Section layout">
            <FormatGlyph id={fmt} color={sec.onBg} size={14} />
            <Text style={[styles.bgBtnText, { color: sec.onBg }]}>Layout</Text>
          </Pressable>
        ) : null}
      </View>
      {open === 'theme' ? (
        <View style={styles.sectionThemeGrid}>
          <ThemeSwatchGrid
            selectedId={item.backgroundImage ? undefined : item.theme}
            textColor={sec.onBg}
            onSelect={(themeId) => { onSetTheme(themeId); setOpen('none'); }}
            photos={photos}
            selectedPhoto={item.backgroundImage}
            onSelectPhoto={(uri) => { onSelectPhoto(uri); setOpen('none'); }}
            onAddPhoto={onAddPhoto}
          />
          {item.backgroundImage ? (
            <Pressable onPress={() => { onRemovePhoto(); setOpen('none'); }} hitSlop={6}>
              <Text style={[styles.bgRemove, { color: sec.onBgDim }]}>Remove background photo</Text>
            </Pressable>
          ) : item.theme ? (
            <Pressable onPress={() => { onClearTheme(); setOpen('none'); }} hitSlop={6}>
              <Text style={[styles.bgRemove, { color: sec.onBgDim }]}>Use inherited theme ({inheritedName})</Text>
            </Pressable>
          ) : (
            <Text style={[styles.sectionInheritNote, { color: sec.onBgDim }]}>
              Inheriting “{inheritedName}”. Pick a theme for this section and the ones below it, or a photo for just this one.
            </Text>
          )}
        </View>
      ) : null}
      {open === 'layout' ? (
        <View style={styles.sectionLayoutMenu}>
          {FORMATS.map((f) => {
            const on = fmt === f.id;
            const fg = on ? sec.colors[0] : sec.onBg;
            return (
              <Pressable
                key={f.id}
                onPress={() => { onSetLayout(f.id); setOpen('none'); }}
                style={[styles.layoutChip, on ? { backgroundColor: sec.onBg } : { borderColor: sec.onBgDim, borderWidth: 1 }]}>
                <FormatGlyph id={f.id} color={fg} />
                <Text style={[styles.layoutChipText, { color: fg }]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export default function CapsuleScreen() {
  const { id, preview } = useLocalSearchParams<{ id: string; preview?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height: screenH } = useWindowDimensions();

  const { capsule } = useCapsule(id);
  const detail = id ? unlockedDetail[id] : undefined; // sample rich letter (demo)
  const isPreview = preview === '1';

  const [contentsDraft, setContentsDraft] = useState<CapsuleContent[] | null>(null);
  const [libDraft, setLibDraft] = useState<string[] | null>(null);
  const [photoPicker, setPhotoPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [blockTops, setBlockTops] = useState<number[]>([]);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // A whole-capsule background photo (stored on the capsule) still wins over the theme gradient,
  // forcing light text + a dark scrim; otherwise the per-section bands paint the background.
  const bgImage = capsule?.backgroundImage ?? null;
  const baseThemeId = capsule?.theme ?? 'twilight';
  const baseTheme = getCapsuleTheme(baseThemeId);
  const theme = bgImage ? { ...baseTheme, onBg: '#ffffff', onBgDim: 'rgba(255,255,255,0.86)', statusBar: 'light' as const } : baseTheme;
  const contents = contentsDraft ?? capsule?.contents ?? [];
  // Photos the user has uploaded for this capsule, offered as background options alongside the
  // themes in every section's theme menu. Drafted locally (like contents) so sample capsules update.
  const photoLib = libDraft ?? capsule?.backgroundPhotos ?? [];
  // Each block's effective theme id: its own `theme` if set, else the nearest block above it,
  // else the capsule base — so choosing a theme cascades to the blocks below until overridden.
  const sectionThemeIds = useMemo(() => {
    const out: string[] = [];
    let cur = baseThemeId;
    for (const item of contents) {
      if (item.theme) cur = item.theme;
      out.push(cur);
    }
    return out;
  }, [contents, baseThemeId]);
  // Collapse the header + each section into background "bands": adjacent slots that share the same
  // theme (and neither uses a photo) merge into one; a section with its own photo stands alone.
  // Unmeasured sections sit far off-screen (MAX_SAFE_INTEGER) so nothing flashes before layout.
  const bands = useMemo<Band[]>(() => {
    const out: Band[] = [];
    const push = (themeId: string, photo: string | undefined, top: number) => {
      const prev = out[out.length - 1];
      if (prev && prev.themeId === themeId && (prev.photo ?? null) === (photo ?? null)) return;
      out.push({ startY: out.length === 0 ? 0 : top, themeId, photo });
    };
    push(baseThemeId, undefined, 0); // the header (title/meta) sits on the base theme
    contents.forEach((item, i) => push(sectionThemeIds[i], item.backgroundImage, blockTops[i] ?? Number.MAX_SAFE_INTEGER));
    return out;
  }, [contents, sectionThemeIds, blockTops, baseThemeId]);
  const showReveal = !!detail || capsule?.status === 'unlocked' || isPreview;

  const saveContents = (next: CapsuleContent[]) => {
    setContentsDraft(next);
    if (id) updateCapsule(id, { contents: next });
  };
  const saveLib = (next: string[]) => {
    setLibDraft(next);
    if (id) updateCapsule(id, { backgroundPhotos: next });
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
  // Clear a per-section override by deleting the key (so the cascade falls through, and Firestore
  // — which rejects `undefined` — stays happy).
  const clearItemTheme = (index: number) => {
    saveContents(
      contents.map((c, k) => {
        if (k !== index || c.theme === undefined) return c;
        const next = { ...c };
        delete next.theme;
        return next;
      }),
    );
  };
  const pickItemBackground = async (index: number) => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 });
      if (!res.canceled && res.assets?.[0]) {
        const uri = res.assets[0].uri;
        updateItem(index, { backgroundImage: uri });
        if (!photoLib.includes(uri)) saveLib([...photoLib, uri]); // keep it as a reusable option for this capsule
      }
    } catch {
      // user dismissed or no library access — leave the section background unchanged
    }
  };
  // Pick one of the capsule's already-saved photos as this section's background.
  const selectItemPhoto = (index: number, uri: string) => updateItem(index, { backgroundImage: uri });
  // Set a section's cascading theme. If the section is currently showing a photo, keep that photo as
  // a saved option for the capsule, then swap this section's background over to the chosen theme.
  const setItemTheme = (index: number, themeId: string) => {
    const item = contents[index];
    if (item?.backgroundImage) {
      const uri = item.backgroundImage;
      if (!photoLib.includes(uri)) saveLib([...photoLib, uri]);
      saveContents(
        contents.map((c, k) => {
          if (k !== index) return c;
          const next = { ...c, theme: themeId };
          delete next.backgroundImage; // photo → theme swap (Firestore rejects undefined, so strip it)
          return next;
        }),
      );
    } else {
      updateItem(index, { theme: themeId });
    }
  };
  const clearItemBackground = (index: number) => {
    saveContents(
      contents.map((c, k) => {
        if (k !== index || c.backgroundImage === undefined) return c;
        const next = { ...c };
        delete next.backgroundImage;
        return next;
      }),
    );
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

  // Resolve a block's effective theme object, forcing the legible white-on-scrim treatment when
  // the block (or the whole capsule) shows a photo behind it.
  const sectionTheme = (index: number, item: CapsuleContent): CapsuleTheme => {
    const base = getCapsuleTheme(sectionThemeIds[index] ?? baseThemeId);
    return bgImage || item.backgroundImage
      ? { ...base, onBg: '#ffffff', onBgDim: 'rgba(255,255,255,0.86)', statusBar: 'light' as const }
      : base;
  };

  const renderBlock = (item: CapsuleContent, index: number, sec: CapsuleTheme) => {
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
          <Text style={[styles.sectionLabel, { color: sec.onBgDim }]}>
            {imgs.length} {imgs.length === 1 ? 'photo' : 'photos'}
          </Text>
          {editing ? (
            <PhotoBlockEditor
              images={imgs}
              format={fmt}
              colors={{ onBg: sec.onBg, onBgDim: sec.onBgDim, base: sec.colors[0] }}
              onSave={(patch) => {
                updateItem(index, patch);
                setEditingIndex(null);
              }}
              onCancel={() => setEditingIndex(null)}
              onDragActive={setScrollLocked}
            />
          ) : isPreview ? (
            // Outside the editor you can still press-and-hold to rearrange — the new order
            // saves straight to the item, no need to open edit mode first.
            <>
              {imgs.length > 1 ? (
                <Text style={[styles.dragHintReveal, { color: sec.onBgDim }]}>Press and hold a photo to rearrange</Text>
              ) : null}
              <DraggablePhotos
                ids={imgs}
                format={fmt}
                onReorder={(next) => updateItem(index, { images: next })}
                onDragActive={setScrollLocked}
              />
            </>
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
          <Text style={[styles.sectionLabel, { color: sec.onBgDim }]}>{item.label}</Text>
          <LinearGradient colors={[sec.colors[1], sec.colors[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.videoTile}>
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
          <Text style={[styles.sectionLabel, { color: sec.onBgDim }]}>{item.label}</Text>
          {item.preview ? <Text style={[styles.sectionText, { color: sec.onBgDim }]}>{item.preview}</Text> : null}
          {deleteRow}
        </View>
      );
    }
    return (
      <View>
        {editing ? (
          <NoteEditor
            initial={item.preview ?? item.label}
            colors={{ onBg: sec.onBg, onBgDim: sec.onBgDim, base: sec.colors[0] }}
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
      {bgImage ? (
        <>
          <Image source={{ uri: bgImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.55)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
        </>
      ) : (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {bands.map((band, k) => (
            <BandLayer
              key={`${k}-${band.photo ?? band.themeId}`}
              band={band}
              index={k}
              scrollY={scrollY}
              width={width}
              insetsTop={insets.top}
              screenH={screenH}
            />
          ))}
        </View>
      )}

      <LinearGradient
        colors={[theme.statusBar === 'dark' ? 'rgba(247,242,232,0.55)' : 'rgba(8,10,22,0.5)', 'transparent']}
        style={[styles.topScrim, { height: insets.top + 54 }]}
        pointerEvents="none"
      />
      <View style={[styles.barDark, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeftIcon size={22} color={theme.onBg} />
        </Pressable>
        <Text style={[styles.unlockedTag, { color: theme.onBg }]}>{isPreview ? 'Preview' : 'Unlocked ✨'}</Text>
        <View style={styles.spacer} />
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollEnabled={!scrollLocked}
        contentContainerStyle={[
          styles.darkScroll,
          // Extra room at the bottom when sections are themed, so the last section can scroll up
          // far enough for its background to finish fading in.
          { paddingBottom: insets.bottom + (isPreview ? 40 : 96) + (bands.length > 1 ? screenH * 0.4 : 0) },
        ]}
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
            {contents.map((item, i) => {
              const sec = sectionTheme(i, item);
              const editing = isPreview && editingIndex === i;
              const inheritedName = getCapsuleTheme(i > 0 ? sectionThemeIds[i - 1] : baseThemeId).name;
              // A faint hairline between sections to make the divisions clear. Tie it to the
              // section's text polarity (light text → light line, dark text → dark line) so it
              // stays visible whichever theme is behind it.
              const dividerColor = sec.statusBar === 'dark' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)';
              return (
                <View
                  key={i}
                  onLayout={(e) => {
                    const y = e.nativeEvent.layout.y;
                    setBlockTops((prev) => {
                      if (prev[i] === y) return prev;
                      const next = prev.slice();
                      next[i] = y;
                      return next;
                    });
                  }}>
                  {i > 0 ? <View style={[styles.divider, { backgroundColor: dividerColor }]} /> : null}
                  {renderBlock(item, i, sec)}
                  {isPreview ? (
                    <View style={styles.itemBar}>
                      <Pressable onPress={() => moveItem(i, -1)} disabled={i === 0} hitSlop={8}>
                        <View style={[styles.arrowUp, { opacity: i === 0 ? 0.3 : 1 }]}>
                          <ChevronDownIcon size={16} color={sec.onBg} />
                        </View>
                      </Pressable>
                      <Pressable onPress={() => moveItem(i, 1)} disabled={i === contents.length - 1} hitSlop={8}>
                        <View style={{ opacity: i === contents.length - 1 ? 0.3 : 1 }}>
                          <ChevronDownIcon size={16} color={sec.onBg} />
                        </View>
                      </Pressable>
                      <Pressable onPress={() => setEditingIndex(editingIndex === i ? null : i)} hitSlop={8} accessibilityLabel="Edit item">
                        <PencilIcon size={16} color={sec.onBg} />
                      </Pressable>
                    </View>
                  ) : null}
                  {editing ? (
                    <SectionAppearance
                      item={item}
                      sec={sec}
                      inheritedName={inheritedName}
                      photos={photoLib}
                      onSetTheme={(themeId) => setItemTheme(i, themeId)}
                      onClearTheme={() => clearItemTheme(i)}
                      onSetLayout={(fmt) => updateItem(i, { format: fmt })}
                      onSelectPhoto={(uri) => selectItemPhoto(i, uri)}
                      onAddPhoto={() => pickItemBackground(i)}
                      onRemovePhoto={() => clearItemBackground(i)}
                    />
                  ) : null}
                </View>
              );
            })}

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
      </Animated.ScrollView>

      {isPreview ? null : (
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
  topScrim: { position: 'absolute', left: 0, right: 0, top: 0 },
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

  divider: { height: 1, marginTop: 16, marginBottom: 2, marginHorizontal: 4, borderRadius: 1 },
  section: { marginTop: 12 },
  sectionLabel: { fontFamily: Font.bold, fontSize: 12.5, marginBottom: 8 },
  dragHintReveal: { fontFamily: Font.medium, fontSize: 11, marginTop: -2, marginBottom: 2 },
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
  // Absolute + bottom-anchored so the swatch grid reveals upward from the tab as the clip's
  // animated height grows, and so it doesn't add to the clip's own (animated) height.
  themePanelInner: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 8, paddingBottom: 8 },
  custRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10 },
  custSwatch: { width: 30, height: 30, borderRadius: 9, borderWidth: 2 },
  themeOption: { alignItems: 'center', width: 56 },
  themeName: { fontSize: 10.5, marginTop: 4, textAlign: 'center' },
  bgRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 },
  bgBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1 },
  bgBtnText: { fontFamily: Font.semibold, fontSize: 12 },
  bgRemove: { fontFamily: Font.semibold, fontSize: 12, textDecorationLine: 'underline' },
  sectionAppear: { marginTop: 10 },
  sectionAppearRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10 },
  itemThemeChip: { width: 16, height: 16, borderRadius: 5, borderWidth: 1.5 },
  sectionThemeGrid: { marginTop: 12, gap: 8 },
  sectionInheritNote: { fontFamily: Font.medium, fontSize: 11, textAlign: 'center', marginTop: 2, paddingHorizontal: 10, lineHeight: 15 },
  sectionLayoutMenu: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  layoutChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14 },
  layoutChipText: { fontFamily: Font.semibold, fontSize: 12 },
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
