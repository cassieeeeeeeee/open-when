import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Font } from '@/constants/openwhen';

// Scrapbook-style photo layouts for the capsule reveal. Photos are an ordered list
// of ids; each id maps to a placeholder gradient (swap for <Image> once Storage is on).
//
// Each photo is emitted through `renderItem(content, index, id, positionStyle)`, which
// by default just wraps it in a positioned <View>. The editor passes a renderItem that
// wraps each photo in a draggable container — so drag-to-reorder reuses these exact
// layouts instead of duplicating them.

export type PhotoVariant = 'polaroid' | 'clothesline' | 'filmstrip' | 'collage' | 'photobooth';
export type PhotoRenderItem = (content: ReactNode, index: number, id: number, style: StyleProp<ViewStyle>) => ReactNode;

const defaultRender: PhotoRenderItem = (content, index, _id, style) => (
  <View key={index} style={style}>
    {content}
  </View>
);

const GRADS: [string, string][] = [
  ['#cdb38f', '#8a9b7c'],
  ['#7a9bc1', '#c79a6a'],
  ['#d9a0a0', '#9c6f6f'],
  ['#9b8fd0', '#6f7e62'],
  ['#e0b98a', '#b08a64'],
  ['#8aa9b0', '#6f8a7c'],
];
const TILTS = ['-5deg', '4deg', '-3deg', '6deg', '-4deg', '3deg'];
const grad = (id: number): [string, string] => GRADS[((id % GRADS.length) + GRADS.length) % GRADS.length];

export function RevealPhotos({
  count,
  images,
  variant = 'polaroid',
  renderItem = defaultRender,
}: {
  count?: number;
  images?: number[];
  variant?: PhotoVariant;
  renderItem?: PhotoRenderItem;
}) {
  const ids = images && images.length ? images : Array.from({ length: Math.max(1, count ?? 4) }, (_, i) => i);
  if (variant === 'clothesline') return <Clothesline ids={ids.slice(0, 4)} renderItem={renderItem} />;
  if (variant === 'filmstrip') return <Filmstrip ids={ids.slice(0, 8)} renderItem={renderItem} />;
  if (variant === 'collage') return <Collage ids={ids.slice(0, 5)} renderItem={renderItem} />;
  if (variant === 'photobooth') return <Photobooth ids={ids.slice(0, 4)} renderItem={renderItem} />;
  const shown = ids.slice(0, 6);
  return <Polaroids ids={shown} extra={ids.length - shown.length} renderItem={renderItem} />;
}

// ── Polaroids ──────────────────────────────────────────────────────────────────
const OFFSETS = [0, 18, 6, 22, 2, 16];
const TAPES = ['rgba(214,182,143,0.7)', 'rgba(154,170,124,0.62)', 'rgba(209,160,160,0.6)', 'rgba(140,165,190,0.6)'];
const DOODLES = ['♡', '✿', '☀', '✦', '❀', '♪'];

function Polaroids({ ids, extra, renderItem }: { ids: number[]; extra: number; renderItem: PhotoRenderItem }) {
  return (
    <View style={p.wrap}>
      {ids.map((id, i) =>
        renderItem(
          <View style={[p.card, { transform: [{ rotate: TILTS[id % TILTS.length] }] }]}>
            <View style={[p.tape, { backgroundColor: TAPES[id % TAPES.length] }]} />
            <LinearGradient colors={grad(id)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={p.photo} />
            <Text style={p.doodle}>{DOODLES[id % DOODLES.length]}</Text>
          </View>,
          i,
          id,
          [p.slot, { marginTop: OFFSETS[id % OFFSETS.length] }],
        ),
      )}
      {extra > 0 ? (
        <View key="more" style={[p.slot, { marginTop: OFFSETS[ids.length % OFFSETS.length] }]}>
          <View style={[p.card, { transform: [{ rotate: '3deg' }] }]}>
            <View style={[p.photo, p.moreInner]}>
              <Text style={p.moreText}>+{extra}</Text>
              <Text style={p.moreSub}>more</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ── Clothesline ────────────────────────────────────────────────────────────────
const HANGS = [12, 26, 8, 22];
const PEGS = ['#c9966a', '#a8a06a', '#b97f7f', '#7f93b0'];

function Clothesline({ ids, renderItem }: { ids: number[]; renderItem: PhotoRenderItem }) {
  return (
    <View style={cl.wrap}>
      <View style={cl.string} />
      <View style={cl.row}>
        {ids.map((id, i) =>
          renderItem(
            <>
              <View style={[cl.peg, { backgroundColor: PEGS[id % PEGS.length] }]} />
              <View style={[cl.frame, { transform: [{ rotate: TILTS[id % TILTS.length] }] }]}>
                <LinearGradient colors={grad(id)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={cl.photo} />
              </View>
            </>,
            i,
            id,
            [cl.hang, { marginTop: HANGS[id % HANGS.length] }],
          ),
        )}
      </View>
    </View>
  );
}

// ── Filmstrip ──────────────────────────────────────────────────────────────────
function Sprockets() {
  return (
    <View style={fs.holes}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={fs.hole} />
      ))}
    </View>
  );
}

// Up to four frames per strip; any extra photos spill onto a second strip. The strips get a gentle
// alternating tilt and a slight overlap so a pair of them reads like a little stack of film.
const STRIP_TILTS = ['-3deg', '3.5deg'];

function Filmstrip({ ids, renderItem }: { ids: number[]; renderItem: PhotoRenderItem }) {
  // Up to five photos sit on a single strip; six or more split into two balanced strips, the first
  // taking the larger half: 5 → 5, 6 → 3+3, 7 → 4+3, 8 → 4+4.
  const half = Math.ceil(ids.length / 2);
  const strips: number[][] = ids.length <= 5 ? [ids] : [ids.slice(0, half), ids.slice(half)];
  return (
    <View style={fs.wrap}>
      {strips.map((strip, si) => {
        const offset = strips.slice(0, si).reduce((sum, s) => sum + s.length, 0);
        return (
          <View
            key={si}
            style={[
              fs.strip,
              // Earlier (upper) strips stack on top of later ones, so each strip's downward shadow
            // falls onto the strip below it and stays visible.
            { transform: [{ rotate: STRIP_TILTS[si % STRIP_TILTS.length] }], marginTop: si === 0 ? 0 : -16, zIndex: strips.length - si },
            ]}>
            <Sprockets />
            <View style={fs.frames}>
              {strip.map((id, i) =>
                renderItem(
                  <LinearGradient colors={grad(id)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fs.frameImg} />,
                  offset + i,
                  id,
                  fs.frame,
                ),
              )}
            </View>
            <Sprockets />
          </View>
        );
      })}
    </View>
  );
}

// ── Collage ────────────────────────────────────────────────────────────────────
function Collage({ ids, renderItem }: { ids: number[]; renderItem: PhotoRenderItem }) {
  const tile = (i: number, style: StyleProp<ViewStyle>, withSticker?: boolean) =>
    ids[i] === undefined
      ? null
      : renderItem(
          <>
            <LinearGradient colors={grad(ids[i])} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={co.fill} />
            {withSticker ? (
              <View style={co.sticker}>
                <Text style={co.stickerText}>♡</Text>
              </View>
            ) : null}
          </>,
          i,
          ids[i],
          style,
        );
  return (
    <View style={co.wrap}>
      <View style={co.topRow}>
        {tile(0, co.big, true)}
        <View style={co.rightCol}>
          {tile(1, co.cell)}
          {tile(2, co.cell)}
        </View>
      </View>
      <View style={co.botRow}>
        {tile(3, co.wide)}
        {tile(4, co.cell)}
      </View>
    </View>
  );
}

// ── Photobooth ───────────────────────────────────────────────────────────────────
// A narrow print of stacked frames, like a photo-booth strip. One column, so the editor's
// drag-to-reorder slides cleanly within the single strip (no cross-parent moves).
function Photobooth({ ids, renderItem }: { ids: number[]; renderItem: PhotoRenderItem }) {
  return (
    <View style={pbo.wrap}>
      <View style={pbo.strip}>
        {ids.map((id, i) =>
          renderItem(
            <LinearGradient colors={grad(id)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={pbo.photo} />,
            i,
            id,
            pbo.cell,
          ),
        )}
        <Text style={pbo.caption}>♡</Text>
      </View>
    </View>
  );
}

const p = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 10, paddingBottom: 4 },
  slot: { width: '50%', paddingHorizontal: 7, marginBottom: 12, alignItems: 'center' },
  card: {
    width: '100%',
    backgroundColor: '#fffdf8',
    borderRadius: 4,
    padding: 7,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  tape: {
    position: 'absolute',
    top: -9,
    alignSelf: 'center',
    width: '46%',
    height: 17,
    borderRadius: 2,
    opacity: 0.85,
    transform: [{ rotate: '-6deg' }],
  },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 2 },
  doodle: { position: 'absolute', bottom: 3, alignSelf: 'center', fontFamily: Font.script, fontSize: 16, color: '#9a9186' },
  moreInner: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#efe7d6' },
  moreText: { fontFamily: Font.script, fontSize: 26, color: '#8a7f6f' },
  moreSub: { fontFamily: Font.medium, fontSize: 11, color: '#9a9186', marginTop: -2 },
});

const cl = StyleSheet.create({
  wrap: { paddingTop: 16, paddingBottom: 6 },
  string: { position: 'absolute', top: 14, left: 4, right: 4, height: 2, backgroundColor: '#cdbb95', borderRadius: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  hang: { alignItems: 'center', width: '24%' },
  peg: { width: 9, height: 17, borderRadius: 2, marginBottom: -5, zIndex: 2 },
  frame: {
    width: '100%',
    backgroundColor: '#fffdf8',
    borderRadius: 3,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  photo: { width: '100%', aspectRatio: 0.85, borderRadius: 2 },
});

const fs = StyleSheet.create({
  wrap: { paddingTop: 10, paddingBottom: 6 },
  strip: {
    backgroundColor: '#2b2b30',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 7,
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },
  holes: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, marginVertical: 5 },
  hole: { width: 10, height: 8, borderRadius: 2, backgroundColor: '#f4efe4' },
  frames: { flexDirection: 'row', gap: 5 },
  frame: { flex: 1 },
  frameImg: { width: '100%', aspectRatio: 1, borderRadius: 2 },
});

const co = StyleSheet.create({
  wrap: { gap: 6, paddingTop: 8 },
  topRow: { flexDirection: 'row', gap: 6, height: 168 },
  big: { flex: 1.6, borderRadius: 8, overflow: 'hidden' },
  rightCol: { flex: 1, gap: 6 },
  cell: { flex: 1, borderRadius: 8, overflow: 'hidden' },
  fill: { flex: 1, width: '100%' },
  botRow: { flexDirection: 'row', gap: 6, height: 92 },
  wide: { flex: 1.5, borderRadius: 8, overflow: 'hidden' },
  sticker: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,253,248,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerText: { fontFamily: Font.script, fontSize: 15, color: '#c07b86' },
});

const pbo = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 6 },
  strip: {
    width: '47%',
    backgroundColor: '#fffdf8',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingTop: 7,
    paddingBottom: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 9 },
    elevation: 6,
  },
  cell: { width: '100%', marginBottom: 6 },
  photo: { width: '100%', aspectRatio: 1.2, borderRadius: 2 },
  caption: { fontFamily: Font.script, fontSize: 16, color: '#b88a93', marginTop: 1 },
});
