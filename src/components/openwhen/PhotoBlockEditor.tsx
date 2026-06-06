import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { RevealPhotos, type PhotoVariant } from '@/components/openwhen/RevealPhotos';
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

const CELL = 54; // thumbnail (46) + gap (8)

// Horizontal strip of draggable thumbnails (styled per format) — drag to reorder.
function DraggableImages({ ids, format, onReorder }: { ids: number[]; format: PhotoVariant; onReorder: (next: number[]) => void }) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dx = useRef(new Animated.Value(0)).current;

  const renderTile = (id: number, i: number) => {
    const img = <LinearGradient colors={grad(id)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={d.img} />;
    if (format === 'filmstrip') return <View style={d.film}>{img}</View>;
    if (format === 'collage') return <View style={d.collage}>{img}</View>;
    const tilt = i % 2 ? '4deg' : '-4deg';
    return (
      <View style={[d.polaroid, { transform: [{ rotate: tilt }] }]}>
        {format === 'clothesline' ? <View style={d.peg} /> : null}
        {img}
      </View>
    );
  };

  return (
    <View style={d.strip}>
      {ids.map((id, i) => {
        const responder = PanResponder.create({
          onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) >= Math.abs(g.dy),
          onPanResponderGrant: () => {
            setDragIndex(i);
            dx.setValue(0);
          },
          onPanResponderMove: (_, g) => dx.setValue(g.dx),
          onPanResponderRelease: (_, g) => {
            const target = Math.max(0, Math.min(ids.length - 1, i + Math.round(g.dx / CELL)));
            if (target !== i) {
              const next = [...ids];
              const [moved] = next.splice(i, 1);
              next.splice(target, 0, moved);
              onReorder(next);
            }
            setDragIndex(null);
            dx.setValue(0);
          },
          onPanResponderTerminate: () => {
            setDragIndex(null);
            dx.setValue(0);
          },
        });
        const isDrag = dragIndex === i;
        return (
          <Animated.View
            key={i}
            {...responder.panHandlers}
            style={[d.cell, isDrag && { transform: [{ translateX: dx }], zIndex: 10, elevation: 8, opacity: 0.95 }]}>
            {renderTile(id, i)}
          </Animated.View>
        );
      })}
    </View>
  );
}

// Per-photo-item editor: drag to rearrange (in-format), change format, add, select-to-remove.
export function PhotoBlockEditor({
  images,
  format,
  colors,
  onChange,
}: {
  images: number[];
  format: PhotoVariant;
  colors: Colors;
  onChange: (patch: { format?: string; count?: number; images?: number[] }) => void;
}) {
  const [selecting, setSelecting] = useState(false);
  const [sel, setSel] = useState<Record<number, boolean>>({});
  const selectedCount = Object.values(sel).filter(Boolean).length;

  const removeSelected = () => {
    if (!selectedCount) return;
    const next = images.filter((_, i) => !sel[i]);
    onChange({ images: next, count: next.length });
    setSel({});
    setSelecting(false);
  };
  const addImage = () => {
    const nextId = images.length ? Math.max(...images) + 1 : 0;
    const next = [...images, nextId];
    onChange({ images: next, count: next.length });
  };

  if (selecting) {
    return (
      <View>
        <View style={s.grid}>
          {images.map((id, i) => {
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
      {images.length > 1 ? <Text style={[s.dragHint, { color: colors.onBgDim }]}>Drag to rearrange</Text> : null}
      <DraggableImages ids={images} format={format} onReorder={(next) => onChange({ images: next, count: next.length })} />
      <View style={s.fmtRow}>
        {FORMATS.map((f) => {
          const on = format === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => onChange({ format: f.id })}
              style={[s.fmtChip, on ? { backgroundColor: colors.onBg } : { borderColor: colors.onBgDim, borderWidth: 1 }]}>
              <Text style={[s.fmtText, { color: on ? colors.base : colors.onBg }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={s.actionsRow}>
        <Pressable onPress={addImage} style={[s.addImgBtn, { borderColor: colors.onBgDim }]}>
          <Text style={[s.addImgText, { color: colors.onBg }]}>+ Add image</Text>
        </Pressable>
        <Pressable onPress={() => setSelecting(true)} disabled={!images.length}>
          <Text style={[s.manageText, { color: colors.onBgDim }]}>Select to remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const d = StyleSheet.create({
  strip: { flexDirection: 'row', gap: 8, paddingTop: 12, paddingBottom: 4, alignItems: 'center' },
  cell: { width: 46 },
  img: { width: '100%', aspectRatio: 1, borderRadius: 2 },
  polaroid: {
    backgroundColor: '#fffdf8',
    borderRadius: 3,
    padding: 3,
    paddingBottom: 9,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  film: { backgroundColor: '#2b2b30', borderRadius: 3, padding: 4 },
  collage: { borderRadius: 8, overflow: 'hidden' },
  peg: { position: 'absolute', top: -5, alignSelf: 'center', width: 7, height: 12, borderRadius: 2, backgroundColor: '#c9966a', zIndex: 2 },
});

const s = StyleSheet.create({
  dragHint: { fontFamily: Font.medium, fontSize: 11.5, marginTop: 6 },
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
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  cancelText: { fontFamily: Font.semibold, fontSize: 13 },
  removeBtn: { backgroundColor: '#c0504d', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 },
  removeText: { fontFamily: Font.bold, fontSize: 13, color: '#fff' },
  fmtRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  fmtChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  fmtText: { fontFamily: Font.semibold, fontSize: 12 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  addImgBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  addImgText: { fontFamily: Font.semibold, fontSize: 12 },
  manageText: { fontFamily: Font.semibold, fontSize: 12.5, textDecorationLine: 'underline' },
});
