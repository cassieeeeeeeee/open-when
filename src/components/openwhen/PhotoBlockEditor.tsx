import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useRef, useState } from 'react';
import { type GestureResponderHandlers, PanResponder, Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { Easing, LinearTransition, runOnJS, type SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Line, Rect, Svg } from 'react-native-svg';

import { RevealPhotos, type PhotoRenderItem, type PhotoVariant } from '@/components/openwhen/RevealPhotos';
import { Font } from '@/constants/openwhen';

export const FORMATS: { id: PhotoVariant; label: string }[] = [
  { id: 'polaroid', label: 'Polaroids' },
  { id: 'clothesline', label: 'Clothesline' },
  { id: 'filmstrip', label: 'Filmstrip' },
  { id: 'collage', label: 'Collage' },
  { id: 'photobooth', label: 'Photobooth' },
];

const GRADS: [string, string][] = [
  ['#cdb38f', '#8a9b7c'], ['#7a9bc1', '#c79a6a'], ['#d9a0a0', '#9c6f6f'],
  ['#9b8fd0', '#6f7e62'], ['#e0b98a', '#b08a64'], ['#8aa9b0', '#6f8a7c'],
];
const grad = (id: number): [string, string] => GRADS[((id % GRADS.length) + GRADS.length) % GRADS.length];

type Colors = { onBg: string; onBgDim: string; base: string };

// Tiny glyph that previews each layout next to its chip label.
export function FormatGlyph({ id, color, size = 15 }: { id: PhotoVariant; color: string; size?: number }) {
  const sw = 1.6;
  if (id === 'polaroid') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x={5} y={3.5} width={14} height={17} rx={1.6} stroke={color} strokeWidth={sw} fill="none" />
        <Line x1={5} y1={15.5} x2={19} y2={15.5} stroke={color} strokeWidth={sw} />
      </Svg>
    );
  }
  if (id === 'clothesline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Line x1={2.5} y1={6} x2={21.5} y2={6} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <Rect x={5.5} y={7} width={5.5} height={8.5} rx={0.8} stroke={color} strokeWidth={1.5} fill="none" />
        <Rect x={13} y={7} width={5.5} height={8.5} rx={0.8} stroke={color} strokeWidth={1.5} fill="none" />
      </Svg>
    );
  }
  if (id === 'filmstrip') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x={4} y={4.5} width={16} height={15} rx={1.6} stroke={color} strokeWidth={sw} fill="none" />
        {[6.5, 11, 15.5].map((x) => (
          <Rect key={`t${x}`} x={x} y={6.2} width={2} height={1.6} rx={0.4} fill={color} />
        ))}
        {[6.5, 11, 15.5].map((x) => (
          <Rect key={`b${x}`} x={x} y={16.2} width={2} height={1.6} rx={0.4} fill={color} />
        ))}
      </Svg>
    );
  }
  if (id === 'photobooth') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x={8} y={3} width={8} height={18} rx={1.4} stroke={color} strokeWidth={sw} fill="none" />
        <Rect x={9.7} y={4.7} width={4.6} height={3.9} rx={0.6} fill={color} />
        <Rect x={9.7} y={9.3} width={4.6} height={3.9} rx={0.6} fill={color} />
        <Rect x={9.7} y={13.9} width={4.6} height={3.9} rx={0.6} fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={4} y={4} width={7} height={7} rx={1} stroke={color} strokeWidth={sw} fill="none" />
      <Rect x={13} y={4} width={7} height={7} rx={1} stroke={color} strokeWidth={sw} fill="none" />
      <Rect x={4} y={13} width={7} height={7} rx={1} stroke={color} strokeWidth={sw} fill="none" />
      <Rect x={13} y={13} width={7} height={7} rx={1} stroke={color} strokeWidth={sw} fill="none" />
    </Svg>
  );
}

// How the lifted photo settles, and how the displaced siblings slide. The pan-settle and the
// LinearTransition slide MUST share one duration + easing, because for the dragged photo they
// run at the same time on different views (outer slot slides; inner finger-offset unwinds) and
// the visual is their sum. Linear keeps them in lockstep so that sum is a straight glide from
// the finger into the slot — anything else (e.g. ease-out) makes the offset outrun the slide
// and the photo bows toward its old slot mid-settle.
const SETTLE_MS = 260;
const SETTLE_EASING = Easing.linear;
const LIFT_SCALE = 1.08;

type Measurable = { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null;

const dp = StyleSheet.create({
  // The inner transform layer fills the slot so the photo lays out exactly as it does in the
  // read-only reveal; only its transform changes while dragging.
  fill: { flexGrow: 1, alignSelf: 'stretch', alignItems: 'center' },
  // The lifted photo floats above its neighbours while it's being dragged.
  elevated: { zIndex: 30, elevation: 16 },
});

// One photo, split across two views so the reorder slide and the finger-drag don't fight.
//
//  • OUTER = the slot. It owns the position and the `LinearTransition` layout slide, so when
//    the array reorders React just moves this keyed view and reanimated glides it (and every
//    displaced sibling) into the new slot — Fabric-native and per-item, unlike LayoutAnimation
//    (which janks on the New Architecture).
//  • INNER = the lift layer. It owns the shared-value pan/scale transform that tracks the
//    finger and settles on release.
//
// They're separate views on purpose: a layout slide and a transform both resolve to a CSS
// transform on web, so sharing one node makes the slide clobber the finger-settle (the lifted
// photo snaps back to its old slot). Split across two views, the transforms compose, and the
// lifted photo glides continuously from the finger into its new slot on every platform.
function DraggablePhoto({
  id,
  dragId,
  panX,
  panY,
  lift,
  panHandlers,
  posStyle,
  registerRef,
  onMeasure,
  children,
}: {
  id: number;
  dragId: number | null;
  panX: SharedValue<number>;
  panY: SharedValue<number>;
  lift: SharedValue<number>;
  panHandlers: GestureResponderHandlers;
  posStyle: StyleProp<ViewStyle>;
  registerRef: (el: Measurable) => void;
  onMeasure: () => void;
  children: ReactNode;
}) {
  const isDrag = dragId === id;
  // Only the lifted photo reads the shared values; every other photo resolves to an identity
  // transform so its motion comes purely from the outer layout transition.
  const animStyle = useAnimatedStyle(() =>
    isDrag
      ? {
          transform: [{ translateX: panX.value }, { translateY: panY.value }, { scale: 1 + lift.value * (LIFT_SCALE - 1) }],
          opacity: 0.97,
        }
      : { transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }], opacity: 1 },
  );
  return (
    <Animated.View
      accessibilityLabel={`drag-photo-${id}`}
      ref={(el) => registerRef(el as never)}
      onLayout={onMeasure}
      layout={LinearTransition.duration(SETTLE_MS).easing(SETTLE_EASING)}
      {...panHandlers}
      style={[posStyle, isDrag ? dp.elevated : null]}>
      <Animated.View style={[dp.fill, animStyle]}>{children}</Animated.View>
    </Animated.View>
  );
}

// Renders the photos in their real format layout, each one draggable in place. On drop,
// the photo swaps with whichever slot's measured centre is nearest. Exported so the reveal
// can let you rearrange photos in place without first opening the full editor.
export function DraggablePhotos({
  ids,
  format,
  onReorder,
  onDragActive,
}: {
  ids: number[];
  format: PhotoVariant;
  onReorder: (next: number[]) => void;
  onDragActive?: (active: boolean) => void;
}) {
  const [dragId, setDragId] = useState<number | null>(null);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const lift = useSharedValue(0);
  const positions = useRef<Record<number, { cx: number; cy: number }>>({});
  const refs = useRef<Record<number, Measurable>>({});
  const armed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measure = (id: number) => {
    const node = refs.current[id];
    node?.measureInWindow?.((x, y, w, h) => {
      positions.current[id] = { cx: x + w / 2, cy: y + h / 2 };
    });
  };

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const endDrag = () => {
    armed.current = false;
    setDragId(null);
    onDragActive?.(false);
  };

  // Glide the lifted photo from the finger-release point down into its (possibly new) slot.
  // pan→0 runs on the SAME duration + easing as the siblings' LinearTransition slide, so the
  // photo's finger offset unwinds exactly as its slot box moves under it — one continuous
  // path, no snap. runOnJS hops back to JS to clear the drag state once it lands.
  const settle = () => {
    panX.value = withTiming(0, { duration: SETTLE_MS, easing: SETTLE_EASING });
    panY.value = withTiming(0, { duration: SETTLE_MS, easing: SETTLE_EASING });
    lift.value = withTiming(0, { duration: SETTLE_MS, easing: SETTLE_EASING }, (finished) => {
      if (finished) runOnJS(endDrag)();
    });
  };

  const renderItem: PhotoRenderItem = (content, _i, id, style) => {
    const responder = PanResponder.create({
      // Claim the touch so we can time a long-press; yield to the ScrollView (so it
      // can scroll) until the long-press "arms" the drag.
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => !armed.current,
      onPanResponderGrant: () => {
        armed.current = false;
        panX.value = 0;
        panY.value = 0;
        // Re-measure every photo's CURRENT on-screen position now (handles page
        // scroll / a just-finished swap animation that left old measurements stale).
        ids.forEach((tid) => measure(tid));
        clearTimer();
        timer.current = setTimeout(() => {
          armed.current = true;
          setDragId(id);
          onDragActive?.(true); // freeze the page scroll while dragging
          lift.value = withSpring(1, { mass: 0.5, damping: 12, stiffness: 200 });
        }, 250);
      },
      onPanResponderMove: (_, g) => {
        if (!armed.current) {
          // moved before the long-press fired → it's a scroll/tap, cancel the pickup
          if (Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8) clearTimer();
          return;
        }
        panX.value = g.dx;
        panY.value = g.dy;
      },
      onPanResponderRelease: (_, g) => {
        clearTimer();
        if (!armed.current) return;
        const me = positions.current[id];
        if (me) {
          const tx = me.cx + g.dx;
          const ty = me.cy + g.dy;
          let bestId = id;
          let bestD = Infinity;
          ids.forEach((thatId) => {
            const pj = positions.current[thatId];
            if (!pj) return;
            const dd = (pj.cx - tx) ** 2 + (pj.cy - ty) ** 2;
            if (dd < bestD) {
              bestD = dd;
              bestId = thatId;
            }
          });
          if (bestId !== id) {
            // swap the dragged photo with the one it was dropped on: each takes the other's
            // slot (so both slide past each other via LinearTransition), nothing else shifts.
            const from = ids.indexOf(id);
            const to = ids.indexOf(bestId);
            const next = [...ids];
            [next[from], next[to]] = [next[to], next[from]];
            onReorder(next);
          }
        }
        settle();
      },
      onPanResponderTerminate: () => {
        clearTimer();
        if (armed.current) settle();
      },
    });
    return (
      <DraggablePhoto
        key={id}
        id={id}
        dragId={dragId}
        panX={panX}
        panY={panY}
        lift={lift}
        panHandlers={responder.panHandlers}
        posStyle={style}
        registerRef={(el) => {
          refs.current[id] = el;
        }}
        onMeasure={() => measure(id)}>
        {content}
      </DraggablePhoto>
    );
  };

  return <RevealPhotos images={ids} variant={format} renderItem={renderItem} />;
}

// Per-photo-item editor. Edits a local draft (format + ordered images); nothing is
// committed until Save, so Cancel reverts cleanly.
export function PhotoBlockEditor({
  images,
  format,
  colors,
  onSave,
  onCancel,
  onDragActive,
}: {
  images: number[];
  format: PhotoVariant;
  colors: Colors;
  onSave: (patch: { count: number; images: number[] }) => void;
  onCancel: () => void;
  onDragActive?: (active: boolean) => void;
}) {
  const [draftImages, setDraftImages] = useState<number[]>(images);
  const [selecting, setSelecting] = useState(false);
  const [sel, setSel] = useState<Record<number, boolean>>({});
  const selectedCount = Object.values(sel).filter(Boolean).length;

  const removeSelected = () => {
    if (!selectedCount) return;
    setDraftImages(draftImages.filter((_, i) => !sel[i]));
    setSel({});
    setSelecting(false);
  };
  const addImage = () => {
    const nextId = draftImages.length ? Math.max(...draftImages) + 1 : 0;
    setDraftImages([...draftImages, nextId]);
  };

  if (selecting) {
    return (
      <View>
        <View style={s.grid}>
          {draftImages.map((id, i) => {
            const on = !!sel[i];
            return (
              <Pressable key={i} accessibilityLabel="photo-cell" style={s.cellWrap} onPress={() => setSel((prev) => ({ ...prev, [i]: !prev[i] }))}>
                <LinearGradient colors={grad(id)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.gridImg, on && s.gridImgOn]} />
                <View style={[s.check, on && s.checkOn]}>{on ? <Text style={s.checkMark}>✓</Text> : null}</View>
              </Pressable>
            );
          })}
        </View>
        <View style={s.bar}>
          <Pressable onPress={() => { setSel({}); setSelecting(false); }} style={s.cancelBtn}>
            <Text style={[s.cancelText, { color: colors.onBgDim }]}>Cancel</Text>
          </Pressable>
          <Pressable onPress={removeSelected} disabled={!selectedCount} style={[s.removeBtn, !selectedCount && { opacity: 0.4 }]}>
            <Text style={s.removeText}>Remove{selectedCount ? ` (${selectedCount})` : ''}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View>
      {draftImages.length > 1 ? <Text style={[s.dragHint, { color: colors.onBgDim }]}>Press and hold a photo, then drag to rearrange</Text> : null}
      <DraggablePhotos ids={draftImages} format={format} onReorder={setDraftImages} onDragActive={onDragActive} />
      <View style={s.actionsRow}>
        <Pressable onPress={addImage} style={[s.addImgBtn, { borderColor: colors.onBgDim }]}>
          <Text style={[s.addImgText, { color: colors.onBg }]}>+ Add image</Text>
        </Pressable>
        <Pressable onPress={() => setSelecting(true)} disabled={!draftImages.length}>
          <Text style={[s.manageText, { color: colors.onBgDim }]}>Select to remove</Text>
        </Pressable>
      </View>
      <View style={s.footer}>
        <Pressable onPress={onCancel} style={s.cancelBtn} hitSlop={6}>
          <Text style={[s.cancelText, { color: colors.onBgDim }]}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => onSave({ images: draftImages, count: draftImages.length })}
          style={[s.saveBtn, { backgroundColor: colors.onBg }]}
          hitSlop={6}>
          <Text style={[s.saveText, { color: colors.base }]}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  dragHint: { fontFamily: Font.medium, fontSize: 11.5, marginTop: 6, marginBottom: -2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 8 },
  cellWrap: { width: '22%', aspectRatio: 1 },
  gridImg: { flex: 1, borderRadius: 8 },
  gridImgOn: { opacity: 0.5 },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: '#3f9c6d', borderColor: '#fff' },
  checkMark: { color: '#fff', fontSize: 11, fontFamily: Font.bold },
  bar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  cancelText: { fontFamily: Font.semibold, fontSize: 13 },
  removeBtn: { backgroundColor: '#c0504d', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 },
  removeText: { fontFamily: Font.bold, fontSize: 13, color: '#fff' },
  fmtRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  fmtChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14 },
  fmtText: { fontFamily: Font.semibold, fontSize: 12 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  addImgBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  addImgText: { fontFamily: Font.semibold, fontSize: 12 },
  manageText: { fontFamily: Font.semibold, fontSize: 12.5, textDecorationLine: 'underline' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 16 },
  saveBtn: { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 8 },
  saveText: { fontFamily: Font.bold, fontSize: 13 },
});
