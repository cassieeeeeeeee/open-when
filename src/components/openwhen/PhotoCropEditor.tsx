import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { POLAROID_RATIOS } from '@/components/openwhen/RevealPhotos';
import { Font } from '@/constants/openwhen';

const MIN_SCALE = 1; // 1 = the photo just covers the frame
const MAX_SCALE = 4;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// After the user picks a raw photo this fills the screen: the photo sits inside a frame of the chosen
// shape; drag to move and pinch / −＋ to resize it within that frame; polaroids can switch the frame
// shape from the row at the bottom. On "Add photo" the visible region is cropped (expo-image-manipulator)
// to the frame's aspect, so the rest of the app just renders that cropped image cover-fit.
export function PhotoCropEditor({
  uri,
  sourceWidth,
  sourceHeight,
  allowShapes,
  initialRatio,
  onDone,
  onCancel,
}: {
  uri: string;
  sourceWidth: number;
  sourceHeight: number;
  allowShapes: boolean; // polaroid: offer Square/Portrait/Landscape; else the frame is fixed
  initialRatio: number; // frame aspect (width / height) to start with
  onDone: (croppedUri: string, ratio: number) => void;
  onCancel: () => void;
}) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [ratio, setRatio] = useState(initialRatio);
  const [busy, setBusy] = useState(false);
  // Measure the photo's true pixel size from the loaded image — the picker's reported width/height is
  // unreliable on web, and the crop math must use real source pixels to map the visible region back.
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  const sw = natural?.w ?? (sourceWidth > 0 ? sourceWidth : 1000);
  const sh = natural?.h ?? (sourceHeight > 0 ? sourceHeight : 1000);

  // The crop frame, fit within a box that leaves room for the controls.
  const maxW = screenW - 48;
  const maxH = screenH * 0.5;
  const frameW = ratio >= maxW / maxH ? maxW : maxH * ratio;
  const frameH = frameW / ratio;

  // Base "cover" size of the photo for this frame (at scale 1 it exactly fills, centered).
  const coverScale = Math.max(frameW / sw, frameH / sh);
  const baseW = sw * coverScale;
  const baseH = sh * coverScale;

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const startTx = useRef(0);
  const startTy = useRef(0);
  const startScale = useRef(1);

  const maxTx = () => Math.max(0, (baseW * scale.value - frameW) / 2);
  const maxTy = () => Math.max(0, (baseH * scale.value - frameH) / 2);
  const clampPan = () => {
    tx.value = clamp(tx.value, -maxTx(), maxTx());
    ty.value = clamp(ty.value, -maxTy(), maxTy());
  };
  const setScale = (s: number) => {
    scale.value = clamp(s, MIN_SCALE, MAX_SCALE);
    clampPan();
  };
  const chooseRatio = (r: number) => {
    setRatio(r);
    scale.value = 1;
    tx.value = 0;
    ty.value = 0;
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  // Drag to move (single finger) — PanResponder, so it also responds to a mouse on web.
  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startTx.current = tx.value;
      startTy.current = ty.value;
    },
    onPanResponderMove: (_, g) => {
      tx.value = clamp(startTx.current + g.dx, -maxTx(), maxTx());
      ty.value = clamp(startTy.current + g.dy, -maxTy(), maxTy());
    },
    onPanResponderRelease: clampPan,
    onPanResponderTerminate: clampPan,
  });

  // Pinch to resize (two fingers) — gesture-handler.
  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.current = scale.value;
    })
    .onUpdate((e) => {
      scale.value = clamp(startScale.current * e.scale, MIN_SCALE, MAX_SCALE);
    })
    .onEnd(() => {
      const mx = Math.max(0, (baseW * scale.value - frameW) / 2);
      const my = Math.max(0, (baseH * scale.value - frameH) / 2);
      tx.value = Math.max(-mx, Math.min(mx, tx.value));
      ty.value = Math.max(-my, Math.min(my, ty.value));
    });

  const doCrop = async () => {
    setBusy(true);
    const displayScale = coverScale * scale.value;
    let cropW = Math.min(frameW / displayScale, sw);
    let cropH = Math.min(frameH / displayScale, sh);
    let cropX = clamp(sw / 2 - (frameW / 2 + tx.value) / displayScale, 0, sw - cropW);
    let cropY = clamp(sh / 2 - (frameH / 2 + ty.value) / displayScale, 0, sh - cropH);
    try {
      const res = await manipulateAsync(
        uri,
        [{ crop: { originX: Math.round(cropX), originY: Math.round(cropY), width: Math.round(cropW), height: Math.round(cropH) } }],
        { compress: 0.85, format: SaveFormat.JPEG },
      );
      onDone(res.uri, ratio);
    } catch {
      onDone(uri, ratio); // fall back to the uncropped photo if manipulation fails
    }
  };

  return (
    <View style={sl.overlay}>
      <Text style={sl.title}>Move &amp; resize to fit</Text>
      <View style={sl.stage}>
        <View style={[sl.frame, { width: frameW, height: frameH }]}>
          <GestureDetector gesture={pinch}>
            <Animated.View
              {...responder.panHandlers}
              style={[{ position: 'absolute', width: baseW, height: baseH, left: (frameW - baseW) / 2, top: (frameH - baseH) / 2 }, animStyle]}>
              <Image
                source={{ uri }}
                style={sl.fillImg}
                contentFit="fill"
                onLoad={(e) => {
                  const src = e?.source;
                  if (src?.width && src?.height) setNatural({ w: src.width, h: src.height });
                }}
              />
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
      <View style={sl.zoomRow}>
        <Pressable onPress={() => setScale(scale.value - 0.3)} style={sl.zoomBtn} accessibilityLabel="Zoom out" hitSlop={8}>
          <Text style={sl.zoomText}>−</Text>
        </Pressable>
        <Text style={sl.hint}>Drag to move · pinch or − ＋ to resize</Text>
        <Pressable onPress={() => setScale(scale.value + 0.3)} style={sl.zoomBtn} accessibilityLabel="Zoom in" hitSlop={8}>
          <Text style={sl.zoomText}>＋</Text>
        </Pressable>
      </View>
      {allowShapes ? (
        <View style={sl.shapeRow}>
          {POLAROID_RATIOS.map((r) => {
            const on = Math.abs(r.ratio - ratio) < 0.01;
            return (
              <Pressable key={r.label} onPress={() => chooseRatio(r.ratio)} style={[sl.shapeChip, on && sl.shapeChipOn]} accessibilityLabel={`${r.label} frame`}>
                <View style={{ width: 16, height: Math.round(16 / r.ratio), borderWidth: 2, borderColor: on ? '#1b2a4a' : '#fff', borderRadius: 2 }} />
                <Text style={[sl.shapeText, on && { color: '#1b2a4a' }]}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <View style={sl.actions}>
        <Pressable onPress={onCancel} disabled={busy} style={sl.cancelBtn} hitSlop={6}>
          <Text style={sl.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable onPress={doCrop} disabled={busy} style={sl.doneBtn} hitSlop={6} accessibilityLabel="Add cropped photo">
          <Text style={sl.doneText}>{busy ? 'Saving…' : 'Add photo'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const sl = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#11131c', paddingTop: 48 },
  title: { fontFamily: Font.bold, fontSize: 16, color: '#fff', textAlign: 'center' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  frame: { overflow: 'hidden', borderRadius: 4, backgroundColor: '#000', borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)' },
  fillImg: { width: '100%', height: '100%' },
  zoomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 10 },
  zoomBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  zoomText: { color: '#fff', fontSize: 22, lineHeight: 24, fontFamily: Font.bold },
  hint: { color: 'rgba(255,255,255,0.7)', fontFamily: Font.medium, fontSize: 11.5 },
  shapeRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10, paddingBottom: 6 },
  shapeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
  shapeChipOn: { backgroundColor: '#fff', borderColor: '#fff' },
  shapeText: { fontFamily: Font.semibold, fontSize: 12.5, color: '#fff' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 28, paddingTop: 10, paddingBottom: 30 },
  cancelBtn: { paddingHorizontal: 18, paddingVertical: 10 },
  cancelText: { fontFamily: Font.semibold, fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  doneBtn: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 22, paddingVertical: 10 },
  doneText: { fontFamily: Font.bold, fontSize: 14, color: '#1b2a4a' },
});
