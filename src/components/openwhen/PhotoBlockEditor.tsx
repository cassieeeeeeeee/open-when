import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RevealPhotos, type PhotoVariant } from '@/components/openwhen/RevealPhotos';
import { Font } from '@/constants/openwhen';

const FORMATS: { id: PhotoVariant; label: string }[] = [
  { id: 'polaroid', label: 'Polaroids' },
  { id: 'clothesline', label: 'Clothesline' },
  { id: 'filmstrip', label: 'Filmstrip' },
  { id: 'collage', label: 'Collage' },
];

const CELL_GRADS: [string, string][] = [
  ['#cdb38f', '#8a9b7c'], ['#7a9bc1', '#c79a6a'], ['#d9a0a0', '#9c6f6f'],
  ['#9b8fd0', '#6f7e62'], ['#e0b98a', '#b08a64'], ['#8aa9b0', '#6f8a7c'],
];

type Colors = { onBg: string; onBgDim: string; base: string };

// Per-photo-item editor shown in the capsule preview: change the layout/format,
// and select specific images to delete. Images are placeholders for now.
export function PhotoBlockEditor({
  count,
  format,
  colors,
  onChange,
}: {
  count: number;
  format: PhotoVariant;
  colors: Colors;
  onChange: (patch: { format?: string; count?: number }) => void;
}) {
  const [selecting, setSelecting] = useState(false);
  const [sel, setSel] = useState<Record<number, boolean>>({});
  const selectedCount = Object.values(sel).filter(Boolean).length;

  const removeSelected = () => {
    if (selectedCount === 0) return;
    onChange({ count: Math.max(0, count - selectedCount) });
    setSel({});
    setSelecting(false);
  };

  if (selecting) {
    return (
      <View>
        <View style={s.grid}>
          {Array.from({ length: count }).map((_, i) => {
            const on = !!sel[i];
            return (
              <Pressable key={i} accessibilityLabel="photo-cell" style={s.cellWrap} onPress={() => setSel((p) => ({ ...p, [i]: !p[i] }))}>
                <LinearGradient
                  colors={CELL_GRADS[i % CELL_GRADS.length]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[s.cell, on && s.cellOn]}
                />
                <View style={[s.check, on && s.checkOn]}>{on ? <Text style={s.checkMark}>✓</Text> : null}</View>
              </Pressable>
            );
          })}
        </View>
        <View style={s.bar}>
          <Pressable onPress={() => { setSel({}); setSelecting(false); }} style={s.cancelBtn}>
            <Text style={[s.cancelText, { color: colors.onBgDim }]}>Cancel</Text>
          </Pressable>
          <Pressable onPress={removeSelected} disabled={selectedCount === 0} style={[s.removeBtn, selectedCount === 0 && { opacity: 0.4 }]}>
            <Text style={s.removeText}>Remove{selectedCount ? ` (${selectedCount})` : ''}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View>
      <RevealPhotos count={count} variant={format} />
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
        <Pressable onPress={() => onChange({ count: count + 1 })} style={[s.addImgBtn, { borderColor: colors.onBgDim }]}>
          <Text style={[s.addImgText, { color: colors.onBg }]}>+ Add image</Text>
        </Pressable>
        <Pressable onPress={() => setSelecting(true)} disabled={count === 0}>
          <Text style={[s.manageText, { color: colors.onBgDim }]}>Select to remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 8 },
  cellWrap: { width: '22%', aspectRatio: 1 },
  cell: { flex: 1, borderRadius: 8 },
  cellOn: { opacity: 0.5 },
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
  fmtRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  fmtChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  fmtText: { fontFamily: Font.semibold, fontSize: 12 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  addImgBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  addImgText: { fontFamily: Font.semibold, fontSize: 12 },
  manageText: { fontFamily: Font.semibold, fontSize: 12.5, textDecorationLine: 'underline' },
});
