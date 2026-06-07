import { type ReactNode, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  LinearTransition,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { OW } from '@/constants/openwhen';
import type { Sticker, StickerKind } from '@/data/sample';

// Decorative stickers the user drags onto an element. One module-scope SVG switch drives BOTH the
// palette thumbnails and the placed stickers (sized via `size`). Most kinds reuse the motifs from
// ThemeArt/icons; cloud, sparkle, snowflake, star and petal are small new shapes. Each kind carries
// its own tasteful default colour, overridable via `color`.

// Unit directions of 5 petals (72° apart), shared with ThemeArt's flowers.
const PETAL5: [number, number][] = [
  [0, -1], [0.95, -0.31], [0.59, 0.81], [-0.59, 0.81], [-0.95, -0.31],
];

export function StickerGlyph({ kind, size = 28, color }: { kind: StickerKind; size?: number; color?: string }) {
  const svg = (children: ReactNode) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {children}
    </Svg>
  );

  if (kind === 'cloud') {
    // Near-white puffs with a faint outline layer behind, so it reads on light OR dark backgrounds.
    const c = color ?? 'rgba(255,255,255,0.96)';
    const o = 'rgba(86,104,134,0.4)';
    const puffs = (fill: string, g: number) => (
      <G fill={fill}>
        <Circle cx={9} cy={14} r={4.2 + g} />
        <Circle cx={13.6} cy={11.4} r={5.4 + g} />
        <Circle cx={17.4} cy={14} r={3.8 + g} />
        <Rect x={5 - g} y={13.4 - g} width={13.6 + g * 2} height={5.6 + g} rx={2.8} />
      </G>
    );
    return svg(
      <>
        {puffs(o, 0.7)}
        {puffs(c, 0)}
      </>,
    );
  }

  if (kind === 'flower') {
    const petal = color ?? OW.pink;
    const pr = 4;
    const d = 5.5;
    return svg(
      <G>
        {PETAL5.map(([ox, oy], j) => (
          <Circle key={j} cx={12 + ox * d} cy={12 + oy * d} r={pr} fill={petal} />
        ))}
        <Circle cx={12} cy={12} r={pr * 0.7} fill={OW.gold} />
      </G>,
    );
  }

  if (kind === 'leaf') {
    const c = color ?? OW.sage;
    return svg(
      <G transform="translate(12,12) rotate(18) scale(1.05)">
        <Path d="M0,-9 Q8,-3 0,9 Q-8,-3 0,-9 Z" fill={c} />
        <Line x1={0} y1={-7} x2={0} y2={7} stroke="rgba(60,80,52,0.5)" strokeWidth={0.8} />
      </G>,
    );
  }

  if (kind === 'heart') {
    return svg(
      <Path d="M12 21c-5-4-9-6.5-9-11a4.2 4.2 0 0 1 9-1.4A4.2 4.2 0 0 1 21 10c0 4.5-4 7-9 11z" fill={color ?? OW.rose} />,
    );
  }

  if (kind === 'star') {
    return svg(
      <Polygon
        points="12,2 14.3,8.8 21.5,8.9 15.8,13.2 17.9,20.1 12,16 6.1,20.1 8.2,13.2 2.5,8.9 9.7,8.8"
        fill={color ?? OW.gold}
      />,
    );
  }

  if (kind === 'sparkle') {
    return svg(<Polygon points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10" fill={color ?? '#e8c45e'} />);
  }

  if (kind === 'tree') {
    return svg(
      <G>
        <Rect x={10.5} y={18} width={3} height={4} rx={0.5} fill="#7a5a46" />
        <Polygon points="12,9 4,18.5 20,18.5" fill={color ?? '#6f9f6f'} />
        <Polygon points="12,3.5 6,12.5 18,12.5" fill={color ?? '#7faa7f'} />
      </G>,
    );
  }

  if (kind === 'confetti') {
    // Inherently multicolour — ignores `color`.
    return svg(
      <G>
        <Rect x={3.5} y={5} width={4} height={4} rx={1} transform="rotate(-18 5.5 7)" fill={OW.gold} />
        <Rect x={15.5} y={4} width={4} height={4} rx={1} transform="rotate(22 17.5 6)" fill={OW.pink} />
        <Rect x={6} y={15} width={4} height={4} rx={1} transform="rotate(14 8 17)" fill={OW.blue} />
        <Circle cx={18} cy={15.5} r={2} fill={OW.rose} />
        <Circle cx={12} cy={10} r={1.8} fill={OW.sage} />
      </G>,
    );
  }

  if (kind === 'snowflake') {
    const c = color ?? '#a9c7e0';
    return svg(
      <G stroke={c} strokeWidth={1.4} strokeLinecap="round">
        <Line x1={12} y1={3} x2={12} y2={21} />
        <Line x1={4.2} y1={7.5} x2={19.8} y2={16.5} />
        <Line x1={4.2} y1={16.5} x2={19.8} y2={7.5} />
        <Line x1={12} y1={6.5} x2={9.6} y2={4.8} />
        <Line x1={12} y1={6.5} x2={14.4} y2={4.8} />
        <Line x1={12} y1={17.5} x2={9.6} y2={19.2} />
        <Line x1={12} y1={17.5} x2={14.4} y2={19.2} />
      </G>,
    );
  }

  // petal
  return svg(<Path d="M12,3 C17,8 17,15 12,21 C7,15 7,8 12,3 Z" fill={color ?? '#e9aebd'} />);
}

// Palette manifest — drives the Decor grid in SectionAppearance.
export const STICKERS: { kind: StickerKind; label: string }[] = [
  { kind: 'cloud', label: 'Cloud' },
  { kind: 'flower', label: 'Flower' },
  { kind: 'leaf', label: 'Leaf' },
  { kind: 'heart', label: 'Heart' },
  { kind: 'star', label: 'Star' },
  { kind: 'sparkle', label: 'Sparkle' },
  { kind: 'tree', label: 'Tree' },
  { kind: 'confetti', label: 'Confetti' },
  { kind: 'snowflake', label: 'Snow' },
  { kind: 'petal', label: 'Petal' },
];

// Stable, collision-proof id (monotonic seq + time). Plain app code — the Date.now/Math.random ban
// only applies to workflow scripts.
let seq = 0;
export function makeStickerId(): string {
  return `s${Date.now().toString(36)}${(seq++).toString(36)}`;
}

// Base on-screen size of a placed sticker (before its per-sticker scale).
const BASE = 40;
const ARM_MS = 250; // press-and-hold before a drag arms (so vertical scroll wins until then)
const SETTLE = { duration: 240, easing: Easing.linear };
const LIFT = 1.12; // scale bump while a sticker is held
const MIN_SCALE = 0.4;
const MAX_SCALE = 3;
const HANDLE = 18;

type Measurable = { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null;
type StageRect = { x: number; y: number; w: number; h: number };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Renders an element's stickers as an absolute overlay inside the "stage" that wraps the element's
// content. Positions are normalized (0..1, center-anchored) → pixels via the measured stage size, so
// they survive re-render and screen-size changes and can overhang the edges. In the reveal the layer
// is inert (pointerEvents none); in edit mode it lets touches fall through empty space (box-none) and
// each sticker is press-and-hold draggable, with resize/rotate/✕ handles on the selected one.
export function StickerLayer({
  stickers,
  size,
  editable,
  selectedId = null,
  onSelect,
  onUpdate,
  onRemove,
  onDragActive,
}: {
  stickers: Sticker[];
  size?: { w: number; h: number };
  editable: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onUpdate?: (id: string, patch: Partial<Sticker>) => void;
  onRemove?: (id: string) => void;
  onDragActive?: (active: boolean) => void;
}) {
  // One set of shared values drives whichever sticker is currently active (only one at a time).
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const lift = useSharedValue(0);
  const scaleSV = useSharedValue(1);
  const rotSV = useSharedValue(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const layerRef = useRef<View>(null);
  const stageRect = useRef<StageRect>({ x: 0, y: 0, w: 0, h: 0 });

  // Re-measure the stage's window rect at the start of every gesture (handles page scroll / layout shift).
  const measureStage = () => {
    (layerRef.current as Measurable)?.measureInWindow?.((x, y, w, h) => {
      stageRect.current = { x, y, w, h };
    });
  };
  const endDrag = () => {
    setActiveId(null);
    onDragActive?.(false);
  };
  const settle = () => {
    panX.value = withTiming(0, SETTLE);
    panY.value = withTiming(0, SETTLE);
    lift.value = withTiming(0, SETTLE, (fin) => {
      if (fin) runOnJS(endDrag)();
    });
  };
  // Any interaction (move/resize/rotate) on a sticker makes it "active" and seeds the live transform
  // shared values from its persisted values, so the glyph tracks the gesture without a jump.
  const beginActive = (st: Sticker) => {
    panX.value = 0;
    panY.value = 0;
    scaleSV.value = st.scale ?? 1;
    rotSV.value = st.rot ?? 0;
    setActiveId(st.id);
    onDragActive?.(true);
  };

  if (!size || !stickers.length) return null;
  const { w, h } = size;
  const selected = editable ? stickers.find((s) => s.id === selectedId) ?? null : null;

  return (
    <View ref={layerRef} style={StyleSheet.absoluteFill} pointerEvents={editable ? 'box-none' : 'none'}>
      {stickers.map((st) =>
        editable ? (
          <DraggableSticker
            key={st.id}
            sticker={st}
            w={w}
            h={h}
            active={activeId === st.id}
            panX={panX}
            panY={panY}
            lift={lift}
            scaleSV={scaleSV}
            rotSV={rotSV}
            measureStage={measureStage}
            stageRect={stageRect}
            onBegin={() => beginActive(st)}
            onPersist={(patch) => onUpdate?.(st.id, patch)}
            settle={settle}
            onTap={() => onSelect?.(selectedId === st.id ? null : st.id)}
          />
        ) : (
          <StaticSticker key={st.id} sticker={st} w={w} h={h} />
        ),
      )}
      {selected ? (
        <SelectionControls
          sticker={selected}
          w={w}
          h={h}
          scaleSV={scaleSV}
          rotSV={rotSV}
          measureStage={measureStage}
          stageRect={stageRect}
          onBegin={() => beginActive(selected)}
          onPersist={(patch) => onUpdate?.(selected.id, patch)}
          settle={settle}
          onRemove={() => onRemove?.(selected.id)}
        />
      ) : null}
    </View>
  );
}

// A non-interactive sticker — used in the reveal and any non-edit view.
function StaticSticker({ sticker, w, h }: { sticker: Sticker; w: number; h: number }) {
  return (
    <View
      pointerEvents="none"
      style={[sl.item, { left: sticker.x * w - BASE / 2, top: sticker.y * h - BASE / 2, transform: [{ scale: sticker.scale ?? 1 }, { rotate: `${sticker.rot ?? 0}deg` }] }]}>
      <StickerGlyph kind={sticker.kind} size={BASE} />
    </View>
  );
}

// One draggable sticker. OUTER owns the position + a LinearTransition layout slide; INNER owns the
// pan/scale/rotate transforms. On release the persisted x/y change moves OUTER by exactly the drag
// delta while the pan unwinds the same delta — they sum to a still hold, so there's no snap-back.
function DraggableSticker({
  sticker,
  w,
  h,
  active,
  panX,
  panY,
  lift,
  scaleSV,
  rotSV,
  measureStage,
  stageRect,
  onBegin,
  onPersist,
  settle,
  onTap,
}: {
  sticker: Sticker;
  w: number;
  h: number;
  active: boolean;
  panX: SharedValue<number>;
  panY: SharedValue<number>;
  lift: SharedValue<number>;
  scaleSV: SharedValue<number>;
  rotSV: SharedValue<number>;
  measureStage: () => void;
  stageRect: { current: StageRect };
  onBegin: () => void;
  onPersist: (patch: Partial<Sticker>) => void;
  settle: () => void;
  onTap: () => void;
}) {
  const armed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const animStyle = useAnimatedStyle(() => {
    if (!active) return { transform: [{ scale: sticker.scale ?? 1 }, { rotate: `${sticker.rot ?? 0}deg` }] };
    return {
      transform: [
        { translateX: panX.value },
        { translateY: panY.value },
        { scale: scaleSV.value * (1 + lift.value * (LIFT - 1)) },
        { rotate: `${rotSV.value}deg` },
      ],
    };
  });

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => !armed.current,
    onPanResponderGrant: () => {
      armed.current = false;
      measureStage();
      clearTimer();
      timer.current = setTimeout(() => {
        armed.current = true;
        onBegin();
        lift.value = withSpring(1, { mass: 0.4, damping: 12, stiffness: 220 });
      }, ARM_MS);
    },
    onPanResponderMove: (_, g) => {
      if (!armed.current) {
        if (Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8) clearTimer(); // it's a scroll/tap, not a hold
        return;
      }
      panX.value = g.dx;
      panY.value = g.dy;
    },
    onPanResponderRelease: (_, g) => {
      clearTimer();
      if (armed.current) {
        const r = stageRect.current;
        const sw = r.w || w;
        const sh = r.h || h;
        onPersist({ x: clamp(sticker.x + g.dx / sw, -0.1, 1.1), y: clamp(sticker.y + g.dy / sh, -0.1, 1.1) });
        settle();
      } else if (Math.abs(g.dx) < 8 && Math.abs(g.dy) < 8) {
        onTap();
      }
    },
    onPanResponderTerminate: () => {
      clearTimer();
      if (armed.current) settle();
    },
  });

  return (
    <Animated.View
      accessibilityLabel={`sticker-${sticker.kind}`}
      layout={LinearTransition.duration(SETTLE.duration).easing(Easing.linear)}
      {...responder.panHandlers}
      style={[sl.item, active ? sl.lifted : null, { left: sticker.x * w - BASE / 2, top: sticker.y * h - BASE / 2 }]}>
      <Animated.View style={[sl.fill, animStyle]}>
        <StickerGlyph kind={sticker.kind} size={BASE} />
      </Animated.View>
    </Animated.View>
  );
}

// Outline + ✕/rotate/resize handles for the selected sticker, drawn on top of all stickers. The
// rotate/resize handles drag immediately (no hold) and lock scroll on grant; they write live to the
// shared values (so the glyph tracks the gesture) and persist the final value on release.
function SelectionControls({
  sticker,
  w,
  h,
  scaleSV,
  rotSV,
  measureStage,
  stageRect,
  onBegin,
  onPersist,
  settle,
  onRemove,
}: {
  sticker: Sticker;
  w: number;
  h: number;
  scaleSV: SharedValue<number>;
  rotSV: SharedValue<number>;
  measureStage: () => void;
  stageRect: { current: StageRect };
  onBegin: () => void;
  onPersist: (patch: Partial<Sticker>) => void;
  settle: () => void;
  onRemove: () => void;
}) {
  const cx = sticker.x * w;
  const cy = sticker.y * h;
  const half = (BASE * (sticker.scale ?? 1)) / 2;
  const refer = (BASE / 2) * Math.SQRT2; // center→corner distance at scale 1

  const angleAt = (g: { moveX: number; moveY: number }) => {
    const r = stageRect.current;
    return (Math.atan2(g.moveY - r.y - cy, g.moveX - r.x - cx) * 180) / Math.PI + 90;
  };
  const scaleAt = (g: { moveX: number; moveY: number }) => {
    const r = stageRect.current;
    return clamp(Math.hypot(g.moveX - r.x - cx, g.moveY - r.y - cy) / refer, MIN_SCALE, MAX_SCALE);
  };

  const rotateResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      measureStage();
      onBegin();
    },
    onPanResponderMove: (_, g) => {
      rotSV.value = angleAt(g);
    },
    onPanResponderRelease: (_, g) => {
      onPersist({ rot: Math.round(angleAt(g)) });
      settle();
    },
    onPanResponderTerminate: () => settle(),
  });

  const resizeResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      measureStage();
      onBegin();
    },
    onPanResponderMove: (_, g) => {
      scaleSV.value = scaleAt(g);
    },
    onPanResponderRelease: (_, g) => {
      onPersist({ scale: Math.round(scaleAt(g) * 100) / 100 });
      settle();
    },
    onPanResponderTerminate: () => settle(),
  });

  return (
    <>
      <View
        pointerEvents="none"
        style={[sl.outline, { left: cx - half - 3, top: cy - half - 3, width: half * 2 + 6, height: half * 2 + 6, transform: [{ rotate: `${sticker.rot ?? 0}deg` }] }]}
      />
      <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="Remove sticker" style={[sl.handle, sl.delHandle, { left: cx + half - HANDLE / 2, top: cy - half - HANDLE / 2 }]}>
        <Text style={sl.delX}>×</Text>
      </Pressable>
      <View {...rotateResponder.panHandlers} accessibilityLabel="Rotate sticker" style={[sl.handle, sl.rotHandle, { left: cx - HANDLE / 2, top: cy - half - HANDLE - 8 }]} />
      <View {...resizeResponder.panHandlers} accessibilityLabel="Resize sticker" style={[sl.handle, sl.szHandle, { left: cx + half - HANDLE / 2, top: cy + half - HANDLE / 2 }]} />
    </>
  );
}

const sl = StyleSheet.create({
  item: { position: 'absolute', width: BASE, height: BASE, alignItems: 'center', justifyContent: 'center' },
  fill: { width: BASE, height: BASE, alignItems: 'center', justifyContent: 'center' },
  lifted: { zIndex: 40, elevation: 20 },
  outline: { position: 'absolute', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)', borderStyle: 'dashed' },
  handle: { position: 'absolute', width: HANDLE, height: HANDLE, borderRadius: HANDLE / 2, alignItems: 'center', justifyContent: 'center', zIndex: 50, elevation: 24 },
  delHandle: { backgroundColor: '#d0596a' },
  delX: { color: '#fff', fontSize: 13, lineHeight: 15, fontWeight: '700', marginTop: -1 },
  rotHandle: { backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 1, borderColor: '#7a86a0' },
  szHandle: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#7a86a0' },
});
