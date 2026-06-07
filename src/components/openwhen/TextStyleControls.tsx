import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { type GestureResponderEvent, PanResponder, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Font } from '@/constants/openwhen';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// A definite control width (the appearance panel is content-sized, and onLayout reports 0 for a
// flex-stretched child here, so we derive a fixed width from the screen and centre the control).
const useControlW = () => {
  const { width } = useWindowDimensions();
  return clamp(width - 48, 240, 380);
};

// --- colour maths ---------------------------------------------------------
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hx = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${hx(f(0))}${hx(f(8))}${hx(f(4))}`;
}

function hexToHsl(hex?: string): { h: number; s: number; l: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? '');
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

const SAT = 70;
const HUE_STOPS = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'] as [string, string, ...string[]];

// A two-bar hue + shade spectrum. Drag (or tap) the rainbow to pick a hue and the lower bar to pick a
// shade; the chosen hex is committed on release so a single colour write happens per pick.
export function ColorSpectrum({ value, onChange }: { value?: string; onChange: (hex: string) => void }) {
  const W = useControlW();
  const vals = useRef<{ hue: number; light: number }>({ hue: 210, light: 52 });
  const inited = useRef(false);
  if (!inited.current) {
    inited.current = true;
    const hsl = hexToHsl(value);
    if (hsl) vals.current = { hue: hsl.h, light: clamp(hsl.l, 6, 94) };
  }
  const [, setTick] = useState(0);
  const hueRef = useRef<View>(null);
  const shadeRef = useRef<View>(null);
  const hueLeft = useRef(0);
  const shadeLeft = useRef(0);

  const set = (patch: Partial<{ hue: number; light: number }>) => {
    vals.current = { ...vals.current, ...patch };
    setTick((t) => t + 1);
  };
  const commit = () => onChange(hslToHex(vals.current.hue, SAT, vals.current.light));

  // Latest callbacks live in a ref so the per-drag re-render doesn't swap the (stable) pan responders.
  const cb = useRef({ onHue: (_f: number) => {}, onShade: (_f: number) => {}, commit: () => {}, w: 1 });
  cb.current.onHue = (f) => set({ hue: f * 360 });
  cb.current.onShade = (f) => set({ light: 6 + f * 88 });
  cb.current.commit = commit;
  cb.current.w = W;
  const frac = (e: GestureResponderEvent, left: number) => clamp01((e.nativeEvent.pageX - left) / cb.current.w);

  const huePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => cb.current.onHue(frac(e, hueLeft.current)),
      onPanResponderMove: (e) => cb.current.onHue(frac(e, hueLeft.current)),
      onPanResponderRelease: () => cb.current.commit(),
      onPanResponderTerminate: () => cb.current.commit(),
    }),
  ).current;
  const shadePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => cb.current.onShade(frac(e, shadeLeft.current)),
      onPanResponderMove: (e) => cb.current.onShade(frac(e, shadeLeft.current)),
      onPanResponderRelease: () => cb.current.commit(),
      onPanResponderTerminate: () => cb.current.commit(),
    }),
  ).current;

  const measureLeft = (ref: React.RefObject<View | null>, store: React.MutableRefObject<number>) => {
    ref.current?.measureInWindow?.((x) => {
      store.current = x;
    });
  };

  const cur = hslToHex(vals.current.hue, SAT, vals.current.light);
  const hueColor = hslToHex(vals.current.hue, SAT, 50);
  const huePos = clamp((vals.current.hue / 360) * W - 7, 0, W - 14);
  const shadePos = clamp(((vals.current.light - 6) / 88) * W - 7, 0, W - 14);

  return (
    <View style={[cs.wrap, { width: W }]}>
      <View style={cs.previewRow}>
        <View style={[cs.preview, { backgroundColor: cur }]} />
        <Text style={cs.hex} accessibilityLabel="spectrum-hex">
          {cur.toUpperCase()}
        </Text>
      </View>
      <View ref={hueRef} style={cs.bar} onLayout={() => measureLeft(hueRef, hueLeft)} {...huePan.panHandlers} accessibilityLabel="hue-bar">
        <LinearGradient colors={HUE_STOPS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View pointerEvents="none" style={[cs.handle, { left: huePos }]} />
      </View>
      <View ref={shadeRef} style={cs.bar} onLayout={() => measureLeft(shadeRef, shadeLeft)} {...shadePan.panHandlers} accessibilityLabel="shade-bar">
        <LinearGradient colors={['#000000', hueColor, '#ffffff'] as [string, string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View pointerEvents="none" style={[cs.handle, { left: shadePos }]} />
      </View>
    </View>
  );
}

// A horizontal scroll wheel of font sizes; the value centred under the marker is the selection,
// committed when the scroll settles.
export function SizeWheel({ value, onChange, color }: { value?: number; onChange: (n: number) => void; color: string }) {
  const SIZES = Array.from({ length: 31 }, (_, i) => 10 + i); // 10..40
  const ITEM = 46;
  const W = useControlW();
  const pad = (W - ITEM) / 2;
  const ref = useRef<ScrollView>(null);
  const inited = useRef(false);
  const cur = value ?? 16;

  useEffect(() => {
    if (!inited.current) {
      inited.current = true;
      const idx = Math.max(0, SIZES.indexOf(cur));
      // let the ScrollView mount first
      setTimeout(() => ref.current?.scrollTo({ x: idx * ITEM, animated: false }), 0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commit = (offsetX: number) => onChange(SIZES[clamp(Math.round(offsetX / ITEM), 0, SIZES.length - 1)]);
  const onScrollSettle = (offsetX: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(offsetX), 130);
  };

  return (
    <View style={[sw.wrap, { width: W }]}>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: pad }}
        scrollEventThrottle={16}
        onScroll={(e) => onScrollSettle(e.nativeEvent.contentOffset.x)}
        onMomentumScrollEnd={(e) => commit(e.nativeEvent.contentOffset.x)}
        onScrollEndDrag={(e) => commit(e.nativeEvent.contentOffset.x)}>
        {SIZES.map((sz) => (
          <View key={sz} style={{ width: ITEM, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: Font.semibold, fontSize: 16, color, opacity: sz === cur ? 1 : 0.4 }}>{sz}</Text>
          </View>
        ))}
      </ScrollView>
      <View pointerEvents="none" style={[sw.mark, { borderColor: color, marginLeft: -ITEM / 2, width: ITEM }]} />
    </View>
  );
}

const cs = StyleSheet.create({
  wrap: { marginTop: 12, gap: 8, alignSelf: 'center' },
  previewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  preview: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(127,127,127,0.5)' },
  hex: { fontFamily: Font.semibold, fontSize: 12.5, color: '#ffffff', letterSpacing: 0.5 },
  bar: { height: 22, borderRadius: 7, overflow: 'hidden', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.4)' },
  handle: { position: 'absolute', top: -2, bottom: -2, width: 14, borderRadius: 7, borderWidth: 2.5, borderColor: '#ffffff', backgroundColor: 'rgba(0,0,0,0.12)' },
});

const sw = StyleSheet.create({
  wrap: { height: 40, justifyContent: 'center', marginTop: 10, alignSelf: 'center' },
  mark: { position: 'absolute', left: '50%', top: 4, bottom: 4, borderRadius: 11, borderWidth: 1.5, opacity: 0.85 },
});
