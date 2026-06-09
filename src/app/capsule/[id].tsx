import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  PanResponder,
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
import { PhotoCropEditor } from '@/components/openwhen/PhotoCropEditor';
import { type PhotoRatios, type PhotoUris, type PhotoVariant, RevealPhotos } from '@/components/openwhen/RevealPhotos';
import { makeStickerId, STICKERS, StickerGlyph, StickerLayer } from '@/components/openwhen/StickerArt';
import { FONT_CHOICES, fontFamilyFor, TEXT_COLORS, TEXT_FRAMES, TextFrame, type TextFrameId, TextFrameGlyph } from '@/components/openwhen/TextFrame';
import { ColorSpectrum, SizeWheel } from '@/components/openwhen/TextStyleControls';
import { ThemeArt } from '@/components/openwhen/ThemeArt';
import { ThemeSwatchGrid } from '@/components/openwhen/ThemeSwatchGrid';
import { type CapsuleTheme, getCapsuleTheme } from '@/constants/capsuleThemes';
import { Font, OW, TONES } from '@/constants/openwhen';
import { type CapsuleContent, type Sticker, type StickerKind, unlockedDetail } from '@/data/sample';
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
  { type: 'audio', label: 'Voice' },
  { type: 'playlist', label: 'Playlist' },
];
const ADD_LABELS: Record<CapsuleContent['type'], string> = {
  text: 'A note',
  photo: 'Photos',
  video: 'Video',
  audio: 'A voice note',
  playlist: 'Playlist',
};
// Faux waveform for the stand-in voice-note tile (until real audio capture/playback lands).
const AUDIO_BARS = [9, 16, 24, 13, 21, 28, 17, 11, 23, 27, 15, 25, 19, 10, 22, 14, 26, 18, 12, 20];

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
          <LinearGradient colors={['rgba(0,0,0,0.32)', 'rgba(0,0,0,0.06)', 'rgba(0,0,0,0.4)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
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

// A palette chip you press-and-hold, then drag out onto the element to drop a sticker exactly where
// you release. This is the same long-press-to-arm gesture as the photo rearrange and the placed-
// sticker move: it yields to page scrolling until the hold arms (so a flick still scrolls the page),
// then keeps the drag. A plain tap does nothing — placement is drag-only (no spawn-on-tap).
function StickerPaletteChip({
  sticker,
  textColor,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: {
  sticker: { kind: StickerKind; label: string };
  textColor: string;
  onDragStart: (kind: StickerKind, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (kind: StickerKind, x: number, y: number) => void;
  onDragCancel: () => void;
}) {
  // Latest callbacks in a ref + a PanResponder created ONCE. The ghost follows via state, which
  // re-renders this chip; a fresh responder each render would reset its gesture state mid-drag.
  const cb = useRef({ onDragStart, onDragMove, onDragEnd, onDragCancel, kind: sticker.kind });
  cb.current = { onDragStart, onDragMove, onDragEnd, onDragCancel, kind: sticker.kind };
  const armed = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const responderRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  if (!responderRef.current) {
    responderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => !armed.current, // let the ScrollView scroll until armed
      onPanResponderGrant: (_, g) => {
        armed.current = false;
        start.current = { x: g.x0, y: g.y0 };
        clearTimer();
        timer.current = setTimeout(() => {
          armed.current = true;
          cb.current.onDragStart(cb.current.kind, start.current.x, start.current.y);
        }, 250);
      },
      onPanResponderMove: (_, g) => {
        if (!armed.current) {
          if (Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8) clearTimer(); // moved before the hold → a scroll
          return;
        }
        cb.current.onDragMove(g.moveX, g.moveY);
      },
      onPanResponderRelease: (_, g) => {
        clearTimer();
        if (armed.current) cb.current.onDragEnd(cb.current.kind, g.moveX, g.moveY);
        armed.current = false;
      },
      onPanResponderTerminate: () => {
        clearTimer();
        if (armed.current) cb.current.onDragCancel();
        armed.current = false;
      },
    });
  }
  const responder = responderRef.current;
  return (
    <View {...responder.panHandlers} style={styles.stickerPaletteChip} accessibilityLabel={`Add ${sticker.label} sticker`}>
      <StickerGlyph kind={sticker.kind} size={26} />
      <Text numberOfLines={1} style={[styles.stickerPaletteText, { color: textColor }]}>
        {sticker.label}
      </Text>
    </View>
  );
}

// Three little bars aligned left / centre / right — the glyph for the text-alignment chips.
function AlignGlyph({ dir, color }: { dir: 'left' | 'center' | 'right'; color: string }) {
  const items = dir === 'left' ? 'flex-start' : dir === 'right' ? 'flex-end' : 'center';
  return (
    <View style={{ width: 18, gap: 2.5, alignItems: items }}>
      <View style={{ height: 2, width: 16, borderRadius: 1, backgroundColor: color }} />
      <View style={{ height: 2, width: 9, borderRadius: 1, backgroundColor: color }} />
      <View style={{ height: 2, width: 13, borderRadius: 1, backgroundColor: color }} />
    </View>
  );
}

// Per-section appearance controls, shown while a block is being edited: a Theme button (which opens
// the swatch grid — choosing one themes this block and every block below it, until another override),
// a Layout button for photo blocks (a menu of photo layouts), and a Background-photo button. Each
// writes straight to the content item via the callbacks.
function SectionAppearance({
  item,
  sec,
  overPhoto,
  inheritedName,
  photos,
  onSetTheme,
  onClearTheme,
  onSetLayout,
  onSetFrame,
  onSetTextStyle,
  onSelectPhoto,
  onAddPhoto,
  onRemovePhoto,
  onClearStickers,
  paletteRef,
  onStickerDragStart,
  onStickerDragMove,
  onStickerDragEnd,
  onStickerDragCancel,
}: {
  item: CapsuleContent;
  sec: CapsuleTheme;
  overPhoto: boolean;
  inheritedName: string;
  photos: string[];
  onSetTheme: (id: string) => void;
  onClearTheme: () => void;
  onSetLayout: (format: PhotoVariant) => void;
  onSetFrame: (id: TextFrameId) => void;
  onSetTextStyle: (patch: { textFont?: string; textSize?: number; textColor?: string; textAlign?: string }) => void;
  onSelectPhoto: (uri: string) => void;
  onAddPhoto: () => void;
  onRemovePhoto: () => void;
  onClearStickers: () => void;
  paletteRef: { current: View | null };
  onStickerDragStart: (kind: StickerKind, x: number, y: number) => void;
  onStickerDragMove: (x: number, y: number) => void;
  onStickerDragEnd: (kind: StickerKind, x: number, y: number) => void;
  onStickerDragCancel: () => void;
}) {
  const [open, setOpen] = useState<'none' | 'theme' | 'layout' | 'frame' | 'text' | 'stickers'>('none');
  const toggle = (m: 'theme' | 'layout' | 'frame' | 'text' | 'stickers') => setOpen((v) => (v === m ? 'none' : m));
  const fmt = (item.format ?? 'polaroid') as PhotoVariant;
  const textFrame = (item.textFrame ?? 'letter') as TextFrameId;
  return (
    <View style={styles.sectionAppear}>
      <View style={styles.sectionAppearRow}>
        <Pressable onPress={() => toggle('theme')} style={[styles.bgBtn, { borderColor: sec.onBgDim }, overPhoto && styles.onPhotoChip]} accessibilityLabel="Section theme">
          {item.backgroundImage ? (
            <Image source={{ uri: item.backgroundImage }} style={[styles.itemThemeChip, { borderColor: sec.onBg }]} contentFit="cover" />
          ) : (
            <LinearGradient colors={sec.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.itemThemeChip, { borderColor: sec.onBg }]} />
          )}
          <Text style={[styles.bgBtnText, { color: sec.onBg }]}>Theme</Text>
        </Pressable>
        {item.type === 'photo' ? (
          <Pressable onPress={() => toggle('layout')} style={[styles.bgBtn, { borderColor: sec.onBgDim }, overPhoto && styles.onPhotoChip]} accessibilityLabel="Section layout">
            <FormatGlyph id={fmt} color={sec.onBg} size={14} />
            <Text style={[styles.bgBtnText, { color: sec.onBg }]}>Layout</Text>
          </Pressable>
        ) : null}
        {item.type === 'text' ? (
          <Pressable onPress={() => toggle('frame')} style={[styles.bgBtn, { borderColor: sec.onBgDim }, overPhoto && styles.onPhotoChip]} accessibilityLabel="Section frame">
            <TextFrameGlyph id={textFrame} accent={sec.colors[0]} />
            <Text style={[styles.bgBtnText, { color: sec.onBg }]}>Frame</Text>
          </Pressable>
        ) : null}
        {item.type === 'text' ? (
          <Pressable onPress={() => toggle('text')} style={[styles.bgBtn, { borderColor: sec.onBgDim }, overPhoto && styles.onPhotoChip]} accessibilityLabel="Section text style">
            <Text style={{ fontFamily: fontFamilyFor(item.textFont) ?? Font.bold, fontSize: 15, color: sec.onBg }}>Aa</Text>
            <Text style={[styles.bgBtnText, { color: sec.onBg }]}>Text</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => toggle('stickers')} style={[styles.bgBtn, { borderColor: sec.onBgDim }, overPhoto && styles.onPhotoChip]} accessibilityLabel="Section decorations">
          <StickerGlyph kind="flower" size={15} />
          <Text style={[styles.bgBtnText, { color: sec.onBg }]}>Decor</Text>
        </Pressable>
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
                style={[styles.layoutChip, on ? { backgroundColor: sec.onBg } : { borderColor: sec.onBgDim, borderWidth: 1 }, overPhoto && !on && styles.onPhotoChip]}>
                <FormatGlyph id={f.id} color={fg} />
                <Text style={[styles.layoutChipText, { color: fg }]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {open === 'frame' ? (
        <View style={styles.sectionLayoutMenu}>
          {TEXT_FRAMES.map((f) => {
            const on = textFrame === f.id;
            const fg = on ? sec.colors[0] : sec.onBg;
            return (
              <Pressable
                key={f.id}
                onPress={() => { onSetFrame(f.id); setOpen('none'); }}
                style={[styles.layoutChip, on ? { backgroundColor: sec.onBg } : { borderColor: sec.onBgDim, borderWidth: 1 }, overPhoto && !on && styles.onPhotoChip]}>
                <TextFrameGlyph id={f.id} accent={sec.colors[0]} />
                <Text style={[styles.layoutChipText, { color: fg }]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {open === 'text' ? (
        <View style={styles.textPanel}>
          <View style={styles.sectionLayoutMenu}>
            {FONT_CHOICES.map((f) => {
              const on = item.textFont === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => onSetTextStyle({ textFont: f.key })}
                  style={[styles.layoutChip, on ? { backgroundColor: sec.onBg } : { borderColor: sec.onBgDim, borderWidth: 1 }, overPhoto && !on && styles.onPhotoChip]}>
                  <Text style={{ fontFamily: f.family, fontSize: 14.5, color: on ? sec.colors[0] : sec.onBg }}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.sectionLayoutMenu}>
            {(['left', 'center', 'right'] as const).map((a) => {
              const on = (item.textAlign ?? 'left') === a;
              return (
                <Pressable
                  key={a}
                  onPress={() => onSetTextStyle({ textAlign: a })}
                  style={[styles.sizeChip, on ? { backgroundColor: sec.onBg } : { borderColor: sec.onBgDim, borderWidth: 1 }, overPhoto && !on && styles.onPhotoChip]}
                  accessibilityLabel={`Align ${a}`}>
                  <AlignGlyph dir={a} color={on ? sec.colors[0] : sec.onBg} />
                </Pressable>
              );
            })}
          </View>
          <SizeWheel value={item.textSize} onChange={(n) => onSetTextStyle({ textSize: n })} color={sec.onBg} />
          <View style={styles.swatchRow}>
            <Pressable
              onPress={() => onSetTextStyle({ textColor: undefined })}
              style={[styles.swatch, styles.swatchAuto, { borderColor: item.textColor ? sec.onBgDim : sec.onBg, borderWidth: item.textColor ? 1 : 2 }]}
              accessibilityLabel="Default text colour">
              <Text style={{ fontFamily: Font.bold, fontSize: 11, color: sec.onBg }}>A</Text>
            </Pressable>
            {TEXT_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => onSetTextStyle({ textColor: c })}
                style={[styles.swatch, { backgroundColor: c, borderColor: item.textColor === c ? sec.onBg : 'rgba(127,127,127,0.4)', borderWidth: item.textColor === c ? 2.5 : 1 }]}
                accessibilityLabel={`Text colour ${c}`}
              />
            ))}
          </View>
          <ColorSpectrum value={item.textColor} onChange={(hex) => onSetTextStyle({ textColor: hex })} />
          <Pressable onPress={() => onSetTextStyle({ textFont: undefined, textSize: undefined, textColor: undefined, textAlign: undefined })} hitSlop={6} style={styles.textResetRow}>
            <Text style={[styles.bgRemove, { color: sec.onBgDim }]}>Reset text styling</Text>
          </Pressable>
        </View>
      ) : null}
      {open === 'stickers' ? (
        <View ref={paletteRef} style={styles.sectionLayoutMenu}>
          {STICKERS.map((sti) => (
            <StickerPaletteChip
              key={sti.kind}
              sticker={sti}
              textColor={sec.onBg}
              onDragStart={onStickerDragStart}
              onDragMove={onStickerDragMove}
              onDragEnd={onStickerDragEnd}
              onDragCancel={onStickerDragCancel}
            />
          ))}
          {(item.stickers?.length ?? 0) > 0 ? (
            <Pressable onPress={onClearStickers} hitSlop={6} style={styles.stickerClearRow}>
              <Text style={[styles.bgRemove, { color: sec.onBgDim }]}>Remove all decorations ({item.stickers?.length})</Text>
            </Pressable>
          ) : null}
          <Text style={[styles.stickerHint, { color: sec.onBgDim }]}>
            Press and hold a sticker, then drag it onto your element to place it. Drag a placed one to move it — drag it back here to remove it.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

type WindowMeasurable = { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null;
type Rect = { x: number; y: number; w: number; h: number };

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
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [stageSizes, setStageSizes] = useState<{ w: number; h: number }[]>([]);
  const [paletteDrag, setPaletteDrag] = useState<{ kind: StickerKind; x: number; y: number } | null>(null);
  const [bgCropState, setBgCropState] = useState<{ uri: string; w: number; h: number; index: number } | null>(null);
  // The owner's view has two modes: the "workdesk" (editing tools on) and "preview" (the final reveal,
  // exactly as the recipient will see it — no editing chrome). `editable` is the workdesk gate.
  const [previewing, setPreviewing] = useState(false);
  const paletteRectRef = useRef<Rect | null>(null);
  const paletteViewRef = useRef<View | null>(null);
  const stageRefs = useRef<Record<number, View | null>>({});
  // Set true for one delete so the open text editor's commit-on-unmount (the "save on tap-away"
  // behaviour) doesn't re-save — and thereby resurrect — the block we're removing. Cleared below.
  const deleteGuard = useRef(false);
  const scrollY = useSharedValue(0);
  // Drop any sticker selection when the edited element changes, so a stray handle/✕ doesn't linger,
  // and clear the one-shot delete guard (consumed by the unmount that the delete triggered).
  useEffect(() => {
    setSelectedStickerId(null);
    deleteGuard.current = false;
  }, [editingIndex]);
  // Editing affordances show only in the workdesk; the preview hides them to mirror the final reveal.
  const editable = isPreview && !previewing;
  const togglePreview = () => {
    setEditingIndex(null);
    setSelectedStickerId(null);
    setPhotoPicker(false);
    setPreviewing((v) => !v);
  };
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // A whole-capsule background photo (stored on the capsule) still wins over the theme gradient,
  // forcing light text + a dark scrim; otherwise the per-section bands paint the background.
  const bgImage = capsule?.backgroundImage ?? null;
  const baseThemeId = capsule?.theme ?? 'twilight';
  const contents = contentsDraft ?? capsule?.contents ?? [];
  // Photos the user has uploaded for this capsule, offered as background options alongside the
  // themes in every section's theme menu. Drafted locally (like contents) so sample capsules update.
  const photoLib = libDraft ?? capsule?.backgroundPhotos ?? [];
  // The reveal opens on whatever sits at the very top: the title/meta and the first background band
  // take the first element's theme (and its photo, if it has one) instead of always the capsule's
  // base theme — so the beginning matches the topmost section rather than defaulting away from it.
  const topThemeId = contents[0]?.theme ?? baseThemeId;
  const topPhoto = contents[0]?.backgroundImage ?? null;
  const topTheme = getCapsuleTheme(topThemeId);
  const theme =
    bgImage || topPhoto
      ? { ...topTheme, onBg: '#ffffff', onBgDim: 'rgba(255,255,255,0.86)', statusBar: 'light' as const }
      : topTheme;
  // Whether the bottom "Add to this capsule" area sits over an uploaded photo (capsule-wide bg or the last section's).
  const addOverPhoto = !!(bgImage || contents[contents.length - 1]?.backgroundImage);
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
    push(topThemeId, topPhoto ?? undefined, 0); // header mirrors the first element, so the top matches it (and merges with section 0)
    contents.forEach((item, i) => push(sectionThemeIds[i], item.backgroundImage, blockTops[i] ?? Number.MAX_SAFE_INTEGER));
    return out;
  }, [contents, sectionThemeIds, blockTops, topThemeId, topPhoto]);
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
  // Save a photo block's draft. Unlike updateItem's shallow merge, this SETS or DELETES the
  // photoUris/photoRatios maps so an emptied map is removed rather than left stale (Firestore-safe).
  const savePhotoBlock = (index: number, patch: { count: number; images: number[]; photoUris?: PhotoUris; photoRatios?: PhotoRatios }) => {
    saveContents(
      contents.map((c, k) => {
        if (k !== index) return c;
        const next: CapsuleContent = { ...c, images: patch.images, count: patch.count };
        if (patch.photoUris && Object.keys(patch.photoUris).length) next.photoUris = patch.photoUris;
        else delete next.photoUris;
        if (patch.photoRatios && Object.keys(patch.photoRatios).length) next.photoRatios = patch.photoRatios;
        else delete next.photoRatios;
        return next;
      }),
    );
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
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      // Open the in-app crop screen (one fixed full-screen ratio, pan/zoom to frame it) before applying.
      setBgCropState({ uri: a.uri, w: a.width ?? 0, h: a.height ?? 0, index });
    } catch {
      // user dismissed or no library access — leave the section background unchanged
    }
  };
  // The crop screen handed back a framed background; apply it to the section and keep it as a reusable option.
  const applyBgCrop = (croppedUri: string) => {
    if (!bgCropState) return;
    const { index } = bgCropState;
    updateItem(index, { backgroundImage: croppedUri });
    if (!photoLib.includes(croppedUri)) saveLib([...photoLib, croppedUri]);
    setBgCropState(null);
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
  // Apply a text block's font/size/colour overrides; a null value clears that key (Firestore rejects undefined).
  const setItemTextStyle = (index: number, patch: { textFont?: string; textSize?: number; textColor?: string; textAlign?: string }) => {
    saveContents(
      contents.map((c, k) => {
        if (k !== index) return c;
        const next: CapsuleContent = { ...c };
        if ('textFont' in patch) { if (patch.textFont == null) delete next.textFont; else next.textFont = patch.textFont; }
        if ('textSize' in patch) { if (patch.textSize == null) delete next.textSize; else next.textSize = patch.textSize; }
        if ('textColor' in patch) { if (patch.textColor == null) delete next.textColor; else next.textColor = patch.textColor; }
        if ('textAlign' in patch) { if (patch.textAlign == null) delete next.textAlign; else next.textAlign = patch.textAlign; }
        return next;
      }),
    );
  };

  // ---- Stickers (free-placed decorations on an element) ----
  // Record an element's content-box size (measured on the sticker "stage") so normalized sticker
  // coordinates can be converted to pixels. Guard against no-op updates to avoid layout→setState loops.
  const setStageSize = (index: number, w: number, h: number) => {
    setStageSizes((prev) => {
      const cur = prev[index];
      if (cur && cur.w === w && cur.h === h) return prev;
      const next = prev.slice();
      next[index] = { w, h };
      return next;
    });
  };
  const updateSticker = (index: number, stickerId: string, patch: Partial<Sticker>) => {
    const list = contents[index]?.stickers;
    if (!list) return;
    updateItem(index, { stickers: list.map((s) => (s.id === stickerId ? { ...s, ...patch } : s)) });
  };
  const removeSticker = (index: number, stickerId: string) => {
    const list = contents[index]?.stickers;
    if (!list) return;
    const next = list.filter((s) => s.id !== stickerId);
    saveContents(
      contents.map((c, k) => {
        if (k !== index) return c;
        const copy = { ...c };
        if (next.length) copy.stickers = next;
        else delete copy.stickers; // last one gone → strip the key (Firestore rejects undefined)
        return copy;
      }),
    );
    setSelectedStickerId(null);
  };
  const clearStickers = (index: number) => {
    saveContents(
      contents.map((c, k) => {
        if (k !== index || c.stickers === undefined) return c;
        const copy = { ...c };
        delete copy.stickers;
        return copy;
      }),
    );
    setSelectedStickerId(null);
  };

  // ---- Sticker drag-and-drop: from the palette onto the element (place), and back onto the
  //      palette (delete). Hit-testing is in window coordinates; scroll is locked during a drag.
  const inRect = (x: number, y: number, r: Rect | null) => !!r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  const measurePalette = () => {
    const v = paletteViewRef.current as WindowMeasurable;
    if (v?.measureInWindow) v.measureInWindow((x, y, w, h) => (paletteRectRef.current = w && h ? { x, y, w, h } : null));
    else paletteRectRef.current = null;
  };
  const addStickerAt = (index: number, kind: StickerKind, nx: number, ny: number) => {
    const list = contents[index]?.stickers ?? [];
    const clamp01 = (v: number) => Math.max(-0.05, Math.min(1.05, v));
    const sticker: Sticker = { id: makeStickerId(), kind, x: clamp01(nx), y: clamp01(ny) };
    updateItem(index, { stickers: [...list, sticker] });
    setSelectedStickerId(sticker.id);
  };
  // A placed sticker was dropped: onto the open palette → delete, otherwise move to the new position.
  const onStickerMoveRelease = (index: number, id: string, screenX: number, screenY: number, nx: number, ny: number) => {
    if (inRect(screenX, screenY, paletteRectRef.current)) removeSticker(index, id);
    else updateSticker(index, id, { x: nx, y: ny });
  };
  const onPaletteDragStart = (kind: StickerKind, x: number, y: number) => {
    setPaletteDrag({ kind, x, y });
    setScrollLocked(true);
  };
  const onPaletteDragMove = (x: number, y: number) => setPaletteDrag((d) => (d ? { ...d, x, y } : d));
  const onPaletteDragCancel = () => {
    setPaletteDrag(null);
    setScrollLocked(false);
  };
  const onPaletteDragEnd = (kind: StickerKind, x: number, y: number) => {
    setPaletteDrag(null);
    setScrollLocked(false);
    if (editingIndex == null) return;
    const idx = editingIndex;
    // Drop the sticker where it's released — but only if that's actually on the element. Released
    // anywhere else (e.g. back over the palette, or off the element) → cancelled, nothing is added.
    const stage = stageRefs.current[idx] as WindowMeasurable;
    stage?.measureInWindow?.((sx, sy, sw, sh) => {
      if (sw && sh && x >= sx && x <= sx + sw && y >= sy && y <= sy + sh) addStickerAt(idx, kind, (x - sx) / sw, (y - sy) / sh);
    });
  };

  // Wrap a block's display content in the sticker "stage" — the box sticker coordinates are normalized
  // against. It hugs ONLY the photo / text frame / tile (the same size whether or not the editor is
  // open); edit chrome (the "N photos" label, the editor's own controls, the delete row) stays OUTSIDE
  // it. That's what stops placed stickers from jumping upward when the editor closes. `live` = this
  // block is being edited, so its stickers are draggable.
  const renderStage = (i: number, content: ReactNode, live: boolean) => (
    <View
      ref={(el) => {
        stageRefs.current[i] = el;
      }}
      style={styles.stickerStage}
      onLayout={(e) => setStageSize(i, e.nativeEvent.layout.width, e.nativeEvent.layout.height)}>
      {content}
      <StickerLayer
        stickers={contents[i]?.stickers ?? []}
        size={stageSizes[i]}
        editable={live}
        selectedId={selectedStickerId}
        onSelect={setSelectedStickerId}
        onUpdate={(sid, patch) => updateSticker(i, sid, patch)}
        onRemove={(sid) => removeSticker(i, sid)}
        onMoveRelease={(sid, sx, sy, nx, ny) => onStickerMoveRelease(i, sid, sx, sy, nx, ny)}
        onGrab={measurePalette}
        onDragActive={setScrollLocked}
      />
    </View>
  );

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

  // Colour for the little closing line under the last element — matches the bottom section's polarity.
  const closingDividerColor =
    contents.length > 0 && sectionTheme(contents.length - 1, contents[contents.length - 1]).statusBar === 'dark'
      ? 'rgba(0,0,0,0.12)'
      : 'rgba(255,255,255,0.18)';

  const renderBlock = (item: CapsuleContent, index: number, sec: CapsuleTheme) => {
    const editing = editable && editingIndex === index;
    const deleteRow = editing ? (
      <Pressable
        onPress={() => {
          deleteGuard.current = true; // suppress the text editor's unmount-commit so the block can't come back
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
      const uris = item.photoUris;
      const ratios = item.photoRatios;
      return (
        <View style={styles.section}>
          {editable ? (
            <Text style={[styles.sectionLabel, { color: sec.onBgDim }]}>
              {imgs.length} {imgs.length === 1 ? 'photo' : 'photos'}
            </Text>
          ) : null}
          {editing ? (
            <PhotoBlockEditor
              images={imgs}
              format={fmt}
              colors={{ onBg: sec.onBg, onBgDim: sec.onBgDim, base: sec.colors[0] }}
              uris={uris}
              ratios={ratios}
              renderStage={(node) => renderStage(index, node, true)}
              onSave={(patch) => {
                savePhotoBlock(index, patch);
                setEditingIndex(null);
              }}
              onCancel={() => setEditingIndex(null)}
              onDragActive={setScrollLocked}
            />
          ) : editable ? (
            // Outside the editor you can still press-and-hold to rearrange — the new order
            // saves straight to the item, no need to open edit mode first.
            <>
              {imgs.length > 1 ? (
                <Text style={[styles.dragHintReveal, { color: sec.onBgDim }]}>Press and hold a photo to rearrange</Text>
              ) : null}
              {renderStage(
                index,
                <DraggablePhotos
                  ids={imgs}
                  format={fmt}
                  onReorder={(next) => updateItem(index, { images: next })}
                  onDragActive={setScrollLocked}
                  uris={uris}
                  ratios={ratios}
                />,
                false,
              )}
            </>
          ) : (
            renderStage(index, <RevealPhotos images={imgs} variant={fmt} uris={uris} ratios={ratios} />, false)
          )}
          {deleteRow}
        </View>
      );
    }
    if (item.type === 'video') {
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: sec.onBgDim }]}>{item.label}</Text>
          {renderStage(
            index,
            <LinearGradient colors={[sec.colors[1], sec.colors[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.videoTile}>
              <View style={styles.playBadge}>
                <PlayIcon size={18} color={OW.dark} />
              </View>
            </LinearGradient>,
            editing,
          )}
          {deleteRow}
        </View>
      );
    }
    if (item.type === 'audio') {
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: sec.onBgDim }]}>{item.label}</Text>
          {renderStage(
            index,
            <LinearGradient colors={[sec.colors[1], sec.colors[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.audioTile}>
              <View style={styles.audioPlay}>
                <PlayIcon size={15} color={OW.dark} />
              </View>
              <View style={styles.audioWave}>
                {AUDIO_BARS.map((h, k) => (
                  <View key={k} style={[styles.audioBar, { height: h }]} />
                ))}
              </View>
              <Text style={styles.audioTime}>0:42</Text>
            </LinearGradient>,
            editing,
          )}
          {deleteRow}
        </View>
      );
    }
    if (item.type === 'playlist') {
      return (
        <View style={styles.section}>
          {renderStage(
            index,
            <>
              <Text style={[styles.sectionLabel, { color: sec.onBgDim }]}>{item.label}</Text>
              {item.preview ? <Text style={[styles.sectionText, { color: sec.onBgDim }]}>{item.preview}</Text> : null}
            </>,
            editing,
          )}
          {deleteRow}
        </View>
      );
    }
    const tFrame = (item.textFrame ?? 'letter') as TextFrameId;
    const noneFrame = tFrame === 'none';
    // The user's font/size/colour choices, applied over the frame's defaults. For "No frame" the
    // text sits on the section background, so its default colour follows the section (sec.onBg).
    const bodyOverride = {
      fontFamily: fontFamilyFor(item.textFont),
      fontSize: item.textSize,
      lineHeight: item.textSize ? Math.round(item.textSize * 1.5) : undefined,
      color: item.textColor ?? (noneFrame ? sec.onBg : undefined),
      textAlign: item.textAlign as 'left' | 'center' | 'right' | undefined,
    };
    const frameView = <TextFrame frameId={tFrame} lines={item.preview ? item.preview.split('\n') : [item.label]} accent={sec.colors[0]} bodyOverride={bodyOverride} />;
    return (
      <View>
        {editing ? (
          <NoteEditor
            initial={item.preview ?? item.label}
            colors={{ onBg: sec.onBg, onBgDim: sec.onBgDim, base: sec.colors[0] }}
            frameId={tFrame}
            accent={sec.colors[0]}
            bodyOverride={bodyOverride}
            placeholderColor={noneFrame ? sec.onBgDim : undefined}
            renderStage={(node) => renderStage(index, node, true)}
            onCommit={(t) => {
              if (deleteGuard.current) return; // mid-delete — don't resurrect the block via auto-save
              updateItem(index, { preview: t });
            }}
            onClose={() => setEditingIndex(null)}
          />
        ) : editable ? (
          // Tap the text itself to edit it — no need to hit the pencil first.
          <Pressable onPress={() => setEditingIndex(index)} accessibilityLabel="Edit text">
            {renderStage(index, frameView, false)}
          </Pressable>
        ) : (
          renderStage(index, frameView, false)
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
          <LinearGradient colors={['rgba(0,0,0,0.32)', 'rgba(0,0,0,0.06)', 'rgba(0,0,0,0.4)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
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
        <View style={styles.barSide}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeftIcon size={22} color={theme.onBg} />
          </Pressable>
        </View>
        <Text style={[styles.unlockedTag, { color: theme.onBg }]}>{isPreview ? (previewing ? 'Preview' : 'Workdesk') : 'Unlocked ✨'}</Text>
        <View style={[styles.barSide, { justifyContent: 'flex-end' }]}>
          {isPreview ? (
            <Pressable onPress={togglePreview} style={[styles.modeToggle, { borderColor: theme.onBgDim }, !previewing && !!(bgImage || topPhoto) && styles.onPhotoChip, previewing && { backgroundColor: theme.onBg }]} hitSlop={6} accessibilityLabel={previewing ? 'Back to workdesk' : 'Preview final version'}>
              <Text style={[styles.modeToggleText, { color: previewing ? theme.colors[0] : theme.onBg }]}>{previewing ? 'Workdesk' : 'Preview'}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollEnabled={!scrollLocked}
        contentContainerStyle={[
          styles.darkScroll,
          // Extra room at the bottom when sections are themed, so the last section can scroll up
          // far enough for its background to finish fading in.
          { paddingBottom: insets.bottom + (editable ? 40 : 96) + (bands.length > 1 ? screenH * 0.4 : 0) },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleWrap}>
          <Text style={[styles.whenTitle, { color: theme.onBg }]}>{title}</Text>
          <HeartIcon size={18} color="#f1b6c0" />
        </View>
        <Text style={[styles.darkMeta, { color: theme.onBgDim }]}>
          From: {fromName}
          {whenLabel ? `\n${editable ? 'Opens' : 'Unlocked'}: ${whenLabel}` : ''}
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
              const sectionOverPhoto = !!(bgImage || item.backgroundImage);
              const editing = editable && editingIndex === i;
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
                  {editable && i > 0 ? <View style={[styles.divider, { backgroundColor: dividerColor }]} /> : null}
                  {renderBlock(item, i, sec)}
                  {editable ? (
                    <View style={[styles.itemBar, sectionOverPhoto && styles.itemBarOnPhoto]}>
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
                      overPhoto={sectionOverPhoto}
                      inheritedName={inheritedName}
                      photos={photoLib}
                      onSetTheme={(themeId) => setItemTheme(i, themeId)}
                      onClearTheme={() => clearItemTheme(i)}
                      onSetLayout={(fmt) => updateItem(i, { format: fmt })}
                      onSetFrame={(frameId) => updateItem(i, { textFrame: frameId })}
                      onSetTextStyle={(patch) => setItemTextStyle(i, patch)}
                      onSelectPhoto={(uri) => selectItemPhoto(i, uri)}
                      onAddPhoto={() => pickItemBackground(i)}
                      onRemovePhoto={() => clearItemBackground(i)}
                      onClearStickers={() => clearStickers(i)}
                      paletteRef={paletteViewRef}
                      onStickerDragStart={onPaletteDragStart}
                      onStickerDragMove={onPaletteDragMove}
                      onStickerDragEnd={onPaletteDragEnd}
                      onStickerDragCancel={onPaletteDragCancel}
                    />
                  ) : null}
                </View>
              );
            })}

            {contents.length === 0 ? (
              <Text style={[styles.emptyReveal, { color: theme.onBgDim }]}>
                Nothing inside yet{editable ? ' — add something below.' : '.'}
              </Text>
            ) : null}

            {editable ? (
              <View style={styles.addWrap}>
                {contents.length > 0 ? <View style={[styles.divider, styles.closingDivider, { backgroundColor: closingDividerColor }]} /> : null}
                <Text style={[styles.addLabel, { color: theme.onBgDim }]}>Add to this capsule</Text>
                <View style={styles.addRow}>
                  {ADD_TYPES.map((t) => (
                    <Pressable
                      key={t.type}
                      onPress={() => (t.type === 'photo' ? setPhotoPicker((v) => !v) : addItem(t.type))}
                      style={[styles.addChip, { borderColor: theme.onBgDim }, addOverPhoto && styles.onPhotoChip, t.type === 'photo' && photoPicker && { backgroundColor: theme.onBg }]}>
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
                        <Pressable key={f.id} onPress={() => addPhoto(f.id)} style={[styles.fmtPickChip, { borderColor: theme.onBgDim }, addOverPhoto && styles.onPhotoChip]}>
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

      {editable ? null : (
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

      {/* The sticker being dragged out of the palette follows the finger until it's dropped. */}
      {paletteDrag ? (
        <View pointerEvents="none" style={[styles.stickerGhost, { left: paletteDrag.x - 24, top: paletteDrag.y - 24 }]}>
          <StickerGlyph kind={paletteDrag.kind} size={48} />
        </View>
      ) : null}

      {/* Setting a section background opens the same crop screen, but with a single fixed full-screen
          ratio (no shape options) — the user just pans/zooms to frame the photo behind the reveal. */}
      {bgCropState ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setBgCropState(null)}>
          <PhotoCropEditor
            uri={bgCropState.uri}
            sourceWidth={bgCropState.w}
            sourceHeight={bgCropState.h}
            allowShapes={false}
            initialRatio={screenH > 0 ? width / screenH : 0.5}
            doneLabel="Set background"
            onCancel={() => setBgCropState(null)}
            onDone={(croppedUri) => applyBgCrop(croppedUri)}
          />
        </Modal>
      ) : null}
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
  barSide: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  unlockedTag: { fontFamily: Font.bold, fontSize: 14 },
  modeToggle: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  modeToggleText: { fontFamily: Font.bold, fontSize: 12.5 },
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
  closingDivider: { alignSelf: 'center', width: '44%', marginTop: 0, marginBottom: 22, marginHorizontal: 0 },
  section: { marginTop: 12 },
  sectionLabel: { fontFamily: Font.bold, fontSize: 12.5, marginBottom: 8 },
  dragHintReveal: { fontFamily: Font.medium, fontSize: 11, marginTop: -2, marginBottom: 2 },
  sectionText: { fontFamily: Font.regular, fontSize: 13, lineHeight: 20 },
  videoTile: { height: 160, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  playBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  audioTile: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 66, borderRadius: 14, paddingHorizontal: 14 },
  audioPlay: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  audioWave: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3, height: 30 },
  audioBar: { flex: 1, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.85)' },
  audioTime: { fontFamily: Font.medium, fontSize: 12, color: 'rgba(255,255,255,0.92)' },

  itemBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 18, marginTop: 14, marginBottom: -6 },
  // A dark backdrop so editing chrome stays legible over an uploaded background photo.
  onPhotoChip: { backgroundColor: 'rgba(0,0,0,0.36)', borderColor: 'rgba(255,255,255,0.6)' },
  itemBarOnPhoto: { alignSelf: 'flex-end', backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 6, gap: 16, marginBottom: 0 },
  arrowUp: { transform: [{ rotate: '180deg' }] },
  deleteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, backgroundColor: 'rgba(214,110,110,0.2)', borderWidth: 1, borderColor: 'rgba(214,110,110,0.6)' },
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
  textPanel: { marginTop: 4 },
  sizeChip: { minWidth: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 12 },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  swatchAuto: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  textResetRow: { alignItems: 'center', marginTop: 12 },
  stickerStage: { position: 'relative' },
  stickerGhost: { position: 'absolute', width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: 0.92, zIndex: 100 },
  stickerPaletteChip: { alignItems: 'center', width: 54, gap: 3, paddingVertical: 4 },
  stickerPaletteText: { fontFamily: Font.semibold, fontSize: 10.5, textAlign: 'center' },
  stickerClearRow: { width: '100%', alignItems: 'center', marginTop: 4 },
  stickerHint: { width: '100%', fontFamily: Font.medium, fontSize: 11, textAlign: 'center', marginTop: 4, paddingHorizontal: 10, lineHeight: 15 },
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
