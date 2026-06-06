import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Line, Rect, Svg } from 'react-native-svg';

import { RevealPhotos, type PhotoRenderItem, type PhotoVariant } from '@/components/openwhen/RevealPhotos';
import { Font } from '@/constants/openwhen';

const FORMATS: { id: PhotoVariant; label: string }[] = [
  { id: 'polaroid', label: 'Polaroids' },
  { id: 'clothesline', label: 'Clothesline' },
  { id: 'filmstrip', label: 'Filmstrip' },
  { id: 'collage', label: 'Collage' },
];

const GRADS: [string, string][] = [
  ['#cdb38f', '#8a9b7c'], ['#7a9bc1', '#c79a6a'], ['#d9a0a0', '#9c6f6f'],
  ['#9b8fd0', '#6f7e62'], ['#e0b98a', '#b08a64'], ['#8aa9b0', '#6f8a7c'],
];
const grad = (id: number): [string, string] => GRADS[((id % GRADS.length) + GRADS.length) % GRADS.length];

type Colors = { onBg: string; onBgDim: string; base: string };

// Tiny glyph that previews each layout next to its chip label.
function FormatGlyph({ id, color, size = 15 }: { id: PhotoVariant; color: string; size?: number }) {
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
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={4} y={4} width={7} height={7} rx={1} stroke={color} strokeWidth={sw} fill="none" />
      <Rect x={13} y={4} width={7} height={7} rx={1} stroke={color} strokeWidth={sw} fill="none" />
      <Rect x={4} y={13} width={7} height={7} rx={1} stroke={color} strokeWidth={sw} fill="none" />
      <Rect x={13} y={13} width={7} height={7} rx={1} stroke={color} strokeWidth={sw} fill="none" />
    </Svg>
  );
}

// Renders the photos in their real format layout, each one draggable in place.
// On drop, the photo snaps to whichever slot's measured centre is nearest.
function DraggablePhotos({ ids, format, onReorder }: { ids: number[]; format: PhotoVariant; onReorder: (next: number[]) => void }) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const positions = useRef<Record<number, { cx: number; cy: number }>>({});
  const refs = useRef<Record<number, { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null>>({});

  const measure = (i: number) => {
    const node = refs.current[i];
    node?.measureInWindow?.((x, y, w, h) => {
      positions.current[i] = { cx: x + w / 2, cy: y + h / 2 };
    });
  };

  const renderItem: PhotoRenderItem = (content, i, _id, style) => {
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8,
      onPanResponderGrant: () => {
        setDragIndex(i);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        const me = positions.current[i];
        if (me) {
          const tx = me.cx + g.dx;
          const ty = me.cy + g.dy;
          let best = i;
          let bestD = Infinity;
          ids.forEach((_v, j) => {
            const pj = positions.current[j];
            if (!pj) return;
            const dd = (pj.cx - tx) ** 2 + (pj.cy - ty) ** 2;
            if (dd < bestD) {
              bestD = dd;
              best = j;
            }
          });
          if (best !== i) {
            const next = [...ids];
            const [moved] = next.splice(i, 1);
            next.splice(best, 0, moved);
            onReorder(next);
          }
        }
        pan.setValue({ x: 0, y: 0 });
        setDragIndex(null);
      },
      onPanResponderTerminate: () => {
        pan.setValue({ x: 0, y: 0 });
        setDragIndex(null);
      },
    });
    const isDrag = dragIndex === i;
    return (
      <Animated.View
        key={i}
        ref={(el) => {
          refs.current[i] = el as never;
        }}
        onLayout={() => measure(i)}
        {...responder.panHandlers}
        style={[style, isDrag ? { transform: pan.getTranslateTransform(), zIndex: 30, elevation: 16, opacity: 0.95 } : null]}>
        {content}
      </Animated.View>
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
}: {
  images: number[];
  format: PhotoVariant;
  colors: Colors;
  onSave: (patch: { format: string; count: number; images: number[] }) => void;
  onCancel: () => void;
}) {
  const [draftImages, setDraftImages] = useState<number[]>(images);
  const [draftFormat, setDraftFormat] = useState<PhotoVariant>(format);
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
      {draftImages.length > 1 ? <Text style={[s.dragHint, { color: colors.onBgDim }]}>Drag a photo to rearrange</Text> : null}
      <DraggablePhotos ids={draftImages} format={draftFormat} onReorder={setDraftImages} />
      <View style={s.fmtRow}>
        {FORMATS.map((f) => {
          const on = draftFormat === f.id;
          const fg = on ? colors.base : colors.onBg;
          return (
            <Pressable
              key={f.id}
              onPress={() => setDraftFormat(f.id)}
              style={[s.fmtChip, on ? { backgroundColor: colors.onBg } : { borderColor: colors.onBgDim, borderWidth: 1 }]}>
              <FormatGlyph id={f.id} color={fg} />
              <Text style={[s.fmtText, { color: fg }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>
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
          onPress={() => onSave({ images: draftImages, format: draftFormat, count: draftImages.length })}
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
