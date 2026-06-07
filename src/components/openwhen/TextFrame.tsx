import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { type DimensionValue, StyleSheet, Text, type TextStyle, View } from 'react-native';

import { BLUE_FLORAL, BlossomBouquet, Bow, CornerScroll, CornerSprig, PINK_FLORAL, RoseSpray } from '@/components/openwhen/FrameMotifs';
import { Font } from '@/constants/openwhen';

// Selectable card styles for a text/letter block — the text equivalent of the photo layouts.
// Each frame is self-contained (its own background + text colour) so it stays legible on any
// section theme. `letter` is the default and matches the original cream card.
//
// A frame is described once (card container + content padding + body text style + decorations)
// and rendered through TextFrameShell, so both the read view (TextFrame) and the editor's
// TextInput share exactly the same look.
export type TextFrameId =
  | 'letter'
  | 'note'
  | 'card'
  | 'ruled'
  | 'script'
  | 'chalkboard'
  | 'postcard'
  | 'receipt'
  | 'comic'
  | 'filmstrip'
  | 'blueprint'
  | 'cosmic'
  | 'lace'
  | 'floral'
  | 'watercolor'
  | 'rococo';

export const TEXT_FRAMES: { id: TextFrameId; label: string }[] = [
  { id: 'letter', label: 'Letter' },
  { id: 'script', label: 'Handwritten' },
  { id: 'note', label: 'Sticky note' },
  { id: 'card', label: 'Index card' },
  { id: 'ruled', label: 'Notebook' },
  { id: 'postcard', label: 'Postcard' },
  { id: 'receipt', label: 'Receipt' },
  { id: 'comic', label: 'Comic' },
  { id: 'filmstrip', label: 'Film strip' },
  { id: 'blueprint', label: 'Blueprint' },
  { id: 'cosmic', label: 'Cosmic' },
  { id: 'lace', label: 'Lace' },
  { id: 'floral', label: 'Floral' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: 'rococo', label: 'Rococo' },
  { id: 'chalkboard', label: 'Chalkboard' },
];

const DEFAULT_ACCENT = '#d98a8a';

const s = StyleSheet.create({
  // body text styles
  bodySerifless: { fontFamily: Font.regular, fontSize: 14, color: '#3a3630', lineHeight: 22, marginBottom: 11 },
  bodyScript: { fontFamily: Font.script, fontSize: 19, color: '#3a3630', lineHeight: 27, marginBottom: 6 },
  noteBody: { fontFamily: Font.regular, fontSize: 14, color: '#5b521f', lineHeight: 22, marginBottom: 10 },
  ruledBody: { fontFamily: Font.regular, fontSize: 14, color: '#34506a', lineHeight: 22, marginBottom: 0 },
  chalkBody: { fontFamily: Font.script, fontSize: 19, color: '#eef1ea', lineHeight: 27, marginBottom: 6 },
  postcardBody: { fontFamily: Font.regular, fontSize: 14, color: '#4a4036', lineHeight: 22, marginBottom: 10 },
  receiptBody: { fontFamily: Font.regular, fontSize: 13.5, color: '#3a352e', lineHeight: 21, marginBottom: 9 },
  comicBody: { fontFamily: Font.semibold, fontSize: 14.5, color: '#1a1a1a', lineHeight: 22, marginBottom: 10 },
  filmBody: { fontFamily: Font.regular, fontSize: 14, color: '#ece8e2', lineHeight: 22, marginBottom: 11 },
  blueprintBody: { fontFamily: Font.regular, fontSize: 14, color: '#eaf2fb', lineHeight: 22, marginBottom: 11 },
  cosmicBody: { fontFamily: Font.script, fontSize: 19, color: '#efeaff', lineHeight: 27, marginBottom: 6 },

  // shadow carrier for cards that clip their content (so the shadow isn't clipped too)
  clipShadow: { marginTop: 12, shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }, elevation: 6 },

  // cards (content padding lives on the pad wrappers below)
  letterCard: { backgroundColor: '#f7f2e8', borderRadius: 16, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 15, shadowOffset: { width: 0, height: 14 }, elevation: 8 },
  noteCard: { backgroundColor: '#fbe48a', borderRadius: 3, overflow: 'hidden' },
  indexCard: { backgroundColor: '#fffdf9', borderRadius: 9, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e2dccd', overflow: 'hidden' },
  ruledCard: { backgroundColor: '#fcfbf6', borderRadius: 8, overflow: 'hidden', minHeight: 80 },
  chalkCard: { backgroundColor: '#2c3733', borderRadius: 10, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  postcardCard: { backgroundColor: '#efe6d4', borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: '#d8cbb0', overflow: 'hidden' },
  receiptCard: { backgroundColor: '#fffefb', borderRadius: 2, borderLeftWidth: 0, borderRightWidth: 0, borderTopWidth: 2, borderBottomWidth: 2, borderStyle: 'dashed', borderColor: '#d6cebf', overflow: 'hidden' },
  comicCard: { backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 3, borderColor: '#1a1a1a', marginTop: 12, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 4 },
  filmCard: { backgroundColor: '#141210', borderRadius: 4, overflow: 'hidden', minHeight: 84 },
  blueprintCard: { backgroundColor: '#0e3a6b', borderRadius: 6, overflow: 'hidden', minHeight: 80 },
  cosmicCard: { borderRadius: 14, marginTop: 12, shadowColor: '#1a1040', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 12 }, elevation: 9 },

  // content padding per frame
  padLetter: { padding: 18 },
  padNote: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22 },
  padIndex: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16 },
  padRuled: { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 42 },
  padChalk: { padding: 20 },
  padPostcard: { paddingTop: 16, paddingHorizontal: 18, paddingBottom: 18 },
  padReceipt: { paddingTop: 16, paddingHorizontal: 18, paddingBottom: 42 },
  padComic: { padding: 16 },
  padFilm: { paddingVertical: 16, paddingHorizontal: 28 },
  padBlueprint: { padding: 18 },
  padCosmic: { padding: 20 },

  // letter / index / ruled / chalk decorations
  indexRule: { position: 'absolute', top: 0, left: 0, right: 0, height: 6 },
  noteFold: { position: 'absolute', right: -16, bottom: -16, width: 32, height: 32, backgroundColor: '#e7d074', transform: [{ rotate: '45deg' }] },
  ruledLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#cfe0ef' },
  ruledMargin: { position: 'absolute', top: 0, bottom: 0, left: 30, width: 1.5, backgroundColor: 'rgba(214,128,120,0.6)' },
  chalkInset: { position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },

  // postcard: faint printed elements behind the message (divider, postmark rings, dashed stamp)
  pcDivider: { position: 'absolute', top: 12, bottom: 12, left: '66%', width: 1, backgroundColor: 'rgba(120,95,60,0.22)' },
  pcRing1: { position: 'absolute', top: 12, right: 14, width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: 'rgba(120,90,55,0.26)' },
  pcRing2: { position: 'absolute', top: 17, right: 19, width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(120,90,55,0.26)' },
  pcStamp: { position: 'absolute', top: 9, right: 9, width: 26, height: 32, borderRadius: 2, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(120,90,55,0.4)', alignItems: 'center', justifyContent: 'center' },
  pcStampDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(150,110,80,0.32)' },

  // receipt: dashed divider + faux barcode at the bottom
  receiptDivider: { position: 'absolute', left: 14, right: 14, bottom: 34, height: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#d6cebf' },
  receiptBarcode: { position: 'absolute', left: 0, right: 0, bottom: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' },
  receiptBar: { backgroundColor: '#2a2620', marginRight: 1.5 },

  // comic: halftone dots + a speech-bubble tail (black outline behind a white tail)
  halftone: { position: 'absolute', top: 9, right: 11, width: 26, flexDirection: 'row', flexWrap: 'wrap' },
  halftoneDot: { width: 2, height: 2, borderRadius: 1, margin: 1.5, backgroundColor: 'rgba(0,0,0,0.16)' },
  comicTailBlack: { position: 'absolute', left: 30, bottom: -17, width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderTopWidth: 17, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#1a1a1a' },
  comicTailWhite: { position: 'absolute', left: 33, bottom: -10, width: 0, height: 0, borderLeftWidth: 9, borderRightWidth: 9, borderTopWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#ffffff' },

  // film strip: sprocket holes down both edges
  sprocket: { position: 'absolute', width: 11, height: 13, borderRadius: 2, backgroundColor: '#efe9dd' },

  // blueprint: fine grid + a little title block in the corner
  bpH: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(150,200,255,0.16)' },
  bpV: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(150,200,255,0.16)' },
  bpTitleBlock: { position: 'absolute', right: 8, bottom: 8, width: 74, height: 22, borderWidth: 1, borderColor: 'rgba(190,220,255,0.45)' },
  bpTitleLine: { position: 'absolute', left: 0, right: 0, top: 11, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(190,220,255,0.4)' },

  // cosmic: scattered stars
  star: { position: 'absolute', backgroundColor: '#ffffff' },

  // ornate bodies
  laceBody: { fontFamily: Font.script, fontSize: 18, color: '#4a4036', lineHeight: 26, marginBottom: 6 },
  floralBody: { fontFamily: Font.regular, fontSize: 14, color: '#46433a', lineHeight: 22, marginBottom: 10 },
  watercolorBody: { fontFamily: Font.regular, fontSize: 14, color: '#5a4e48', lineHeight: 22, marginBottom: 10 },
  rococoBody: { fontFamily: Font.script, fontSize: 18, color: '#4a4036', lineHeight: 26, marginBottom: 6 },

  // ornate cards
  laceCard: { backgroundColor: '#f6f3ec', borderRadius: 5, overflow: 'hidden', minHeight: 96 },
  floralCard: { backgroundColor: '#f3f1e8', borderRadius: 6, overflow: 'hidden', minHeight: 98 },
  watercolorCard: { backgroundColor: '#efe9dd', borderRadius: 6, overflow: 'hidden', minHeight: 100 },
  rococoCard: { borderRadius: 12, marginTop: 12, shadowColor: '#5a6478', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 10 }, elevation: 8 },

  padLace: { padding: 26 },
  padFloral: { paddingVertical: 30, paddingHorizontal: 26 },
  padWatercolor: { paddingTop: 28, paddingHorizontal: 24, paddingBottom: 60 },
  padRococo: { paddingTop: 42, paddingBottom: 42, paddingHorizontal: 40 },

  // corner anchors (mirror with inline transforms in the decor)
  posTL: { position: 'absolute', top: 0, left: 0 },
  posTR: { position: 'absolute', top: 0, right: 0 },
  posBL: { position: 'absolute', bottom: 0, left: 0 },
  posBR: { position: 'absolute', bottom: 0, right: 0 },

  // lace: scalloped bands on every edge + an inner keyline
  laceKeyline: { position: 'absolute', top: 13, left: 13, right: 13, bottom: 13, borderWidth: 1, borderColor: '#cdc4af', borderRadius: 3 },
  laceTop: { position: 'absolute', top: 4, left: 5, right: 5, height: 8, flexDirection: 'row', justifyContent: 'center', overflow: 'hidden' },
  laceBottom: { position: 'absolute', bottom: 4, left: 5, right: 5, height: 8, flexDirection: 'row', justifyContent: 'center', overflow: 'hidden' },
  laceLeft: { position: 'absolute', left: 4, top: 5, bottom: 5, width: 8, flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' },
  laceRight: { position: 'absolute', right: 4, top: 5, bottom: 5, width: 8, flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' },
  bumpDown: { width: 12, height: 6, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, backgroundColor: '#ded6c3', marginHorizontal: 1.5 },
  bumpUp: { width: 12, height: 6, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: '#ded6c3', marginHorizontal: 1.5 },
  bumpRight: { width: 6, height: 12, borderTopRightRadius: 6, borderBottomRightRadius: 6, backgroundColor: '#ded6c3', marginVertical: 1.5 },
  bumpLeft: { width: 6, height: 12, borderTopLeftRadius: 6, borderBottomLeftRadius: 6, backgroundColor: '#ded6c3', marginVertical: 1.5 },

  // floral: thin double keyline inside the corner sprigs
  floralKeyline: { position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderWidth: 1, borderColor: '#bcc8d8', borderRadius: 4 },
  floralKeyline2: { position: 'absolute', top: 11, left: 11, right: 11, bottom: 11, borderWidth: StyleSheet.hairlineWidth, borderColor: '#cfd7e2', borderRadius: 3 },

  // rococo: the ivory writing panel inset within the blue border
  rococoPanel: { position: 'absolute', top: 24, left: 22, right: 22, bottom: 24, backgroundColor: '#f7f3ea', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(180,160,120,0.4)' },
});

const BARS = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1];
const STARS: { top: DimensionValue; left: DimensionValue; size: number; opacity: number }[] = [
  { top: '9%', left: '12%', size: 2, opacity: 0.9 },
  { top: '17%', left: '72%', size: 3, opacity: 0.85 },
  { top: '30%', left: '40%', size: 1.5, opacity: 0.6 },
  { top: '13%', left: '90%', size: 2, opacity: 0.8 },
  { top: '47%', left: '20%', size: 2, opacity: 0.7 },
  { top: '55%', left: '84%', size: 1.5, opacity: 0.55 },
  { top: '67%', left: '55%', size: 2.5, opacity: 0.85 },
  { top: '78%', left: '30%', size: 1.5, opacity: 0.6 },
  { top: '85%', left: '76%', size: 2, opacity: 0.8 },
  { top: '40%', left: '64%', size: 1.5, opacity: 0.5 },
  { top: '62%', left: '9%', size: 2, opacity: 0.75 },
  { top: '90%', left: '46%', size: 1.5, opacity: 0.6 },
];

function ruledDecor(): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 40 }, (_, i) => (
        <View key={i} style={[s.ruledLine, { top: 30 + i * 22 }]} />
      ))}
      <View style={s.ruledMargin} />
    </View>
  );
}

function postcardDecor(accent: string): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={s.pcDivider} />
      <View style={s.pcRing1} />
      <View style={s.pcRing2} />
      <View style={s.pcStamp}>
        <View style={[s.pcStampDot, { backgroundColor: accent, opacity: 0.4 }]} />
      </View>
    </View>
  );
}

function receiptDecor(): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={s.receiptDivider} />
      <View style={s.receiptBarcode}>
        {BARS.map((w, i) => (
          <View key={i} style={[s.receiptBar, { width: w, height: 16 }]} />
        ))}
      </View>
    </View>
  );
}

function comicDecor(): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={s.halftone}>
        {Array.from({ length: 15 }, (_, i) => (
          <View key={i} style={s.halftoneDot} />
        ))}
      </View>
      <View style={s.comicTailBlack} />
      <View style={s.comicTailWhite} />
    </View>
  );
}

function filmDecor(): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 16 }, (_, i) => (
        <View key={`l${i}`} style={[s.sprocket, { left: 7, top: 8 + i * 20 }]} />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <View key={`r${i}`} style={[s.sprocket, { right: 7, top: 8 + i * 20 }]} />
      ))}
    </View>
  );
}

function blueprintDecor(): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 30 }, (_, i) => (
        <View key={`h${i}`} style={[s.bpH, { top: i * 22 }]} />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <View key={`v${i}`} style={[s.bpV, { left: i * 26 }]} />
      ))}
      <View style={s.bpTitleBlock}>
        <View style={s.bpTitleLine} />
      </View>
    </View>
  );
}

function cosmicDecor(): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STARS.map((st, i) => (
        <View key={i} style={[s.star, { top: st.top, left: st.left, width: st.size, height: st.size, borderRadius: st.size / 2, opacity: st.opacity }]} />
      ))}
    </View>
  );
}

function laceDecor(): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={s.laceKeyline} />
      <View style={s.laceTop}>{Array.from({ length: 26 }, (_, i) => <View key={i} style={s.bumpDown} />)}</View>
      <View style={s.laceBottom}>{Array.from({ length: 26 }, (_, i) => <View key={i} style={s.bumpUp} />)}</View>
      <View style={s.laceLeft}>{Array.from({ length: 32 }, (_, i) => <View key={i} style={s.bumpRight} />)}</View>
      <View style={s.laceRight}>{Array.from({ length: 32 }, (_, i) => <View key={i} style={s.bumpLeft} />)}</View>
    </View>
  );
}

function floralDecor(): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={s.floralKeyline} />
      <View style={s.floralKeyline2} />
      <View style={[s.posTL, { top: 3, left: 3 }]}><CornerSprig size={60} p={BLUE_FLORAL} /></View>
      <View style={[s.posTR, { top: 3, right: 3, transform: [{ scaleX: -1 }] }]}><CornerSprig size={60} p={BLUE_FLORAL} /></View>
      <View style={[s.posBL, { bottom: 3, left: 3, transform: [{ scaleY: -1 }] }]}><CornerSprig size={60} p={BLUE_FLORAL} /></View>
      <View style={[s.posBR, { bottom: 3, right: 3, transform: [{ scaleX: -1 }, { scaleY: -1 }] }]}><CornerSprig size={60} p={BLUE_FLORAL} /></View>
    </View>
  );
}

function watercolorDecor(): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={s.posBL}><BlossomBouquet size={88} p={PINK_FLORAL} /></View>
      <View style={[s.posBR, { transform: [{ scaleX: -1 }] }]}><BlossomBouquet size={88} p={PINK_FLORAL} /></View>
      <View style={[s.posTL, { top: 7, left: 7 }]}><Bow /></View>
      <View style={[s.posTR, { top: 7, right: 7, transform: [{ scaleX: -1 }] }]}><Bow /></View>
    </View>
  );
}

function rococoDecor(): ReactNode {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={s.rococoPanel} />
      <View style={[s.posTL, { top: 14, left: 12 }]}><CornerScroll size={50} /></View>
      <View style={[s.posTR, { top: 14, right: 12, transform: [{ scaleX: -1 }] }]}><CornerScroll size={50} /></View>
      <View style={[s.posBL, { bottom: 14, left: 12, transform: [{ scaleY: -1 }] }]}><CornerScroll size={50} /></View>
      <View style={[s.posBR, { bottom: 14, right: 12, transform: [{ scaleX: -1 }, { scaleY: -1 }] }]}><CornerScroll size={50} /></View>
      <View style={s.posTL}><RoseSpray size={56} /></View>
      <View style={[s.posTR, { transform: [{ scaleX: -1 }] }]}><RoseSpray size={56} /></View>
      <View style={[s.posBL, { transform: [{ scaleY: -1 }] }]}><RoseSpray size={56} /></View>
      <View style={[s.posBR, { transform: [{ scaleX: -1 }, { scaleY: -1 }] }]}><RoseSpray size={56} /></View>
    </View>
  );
}

type FrameDef = {
  wrapper?: object; // optional outer view that carries the shadow when the card itself clips
  card: object; // card container (no content padding)
  gradient?: string[]; // when set, the card is a vertical LinearGradient of these colours
  pad: object; // padding wrapper around the content
  body: TextStyle; // text style for the content / input
  placeholder: string; // placeholder colour when editing
  decor?: (accent: string) => ReactNode; // absolute decorations layered inside the card
};

const DEFS: Record<TextFrameId, FrameDef> = {
  letter: { card: s.letterCard, pad: s.padLetter, body: s.bodySerifless, placeholder: '#9a9186' },
  script: { card: s.letterCard, pad: s.padLetter, body: s.bodyScript, placeholder: '#b3a98f' },
  note: { wrapper: s.clipShadow, card: s.noteCard, pad: s.padNote, body: s.noteBody, placeholder: '#b0a25a', decor: () => <View style={s.noteFold} /> },
  card: { wrapper: s.clipShadow, card: s.indexCard, pad: s.padIndex, body: s.bodySerifless, placeholder: '#b8b09c', decor: (a) => <View style={[s.indexRule, { backgroundColor: a }]} /> },
  ruled: { wrapper: s.clipShadow, card: s.ruledCard, pad: s.padRuled, body: s.ruledBody, placeholder: '#8aa0b5', decor: ruledDecor },
  chalkboard: { card: s.chalkCard, pad: s.padChalk, body: s.chalkBody, placeholder: 'rgba(238,241,234,0.5)', decor: () => <View style={s.chalkInset} pointerEvents="none" /> },
  postcard: { wrapper: s.clipShadow, card: s.postcardCard, pad: s.padPostcard, body: s.postcardBody, placeholder: '#a8997f', decor: postcardDecor },
  receipt: { wrapper: s.clipShadow, card: s.receiptCard, pad: s.padReceipt, body: s.receiptBody, placeholder: '#b3aa98', decor: receiptDecor },
  comic: { card: s.comicCard, pad: s.padComic, body: s.comicBody, placeholder: '#9a9a9a', decor: comicDecor },
  filmstrip: { wrapper: s.clipShadow, card: s.filmCard, pad: s.padFilm, body: s.filmBody, placeholder: 'rgba(236,232,226,0.45)', decor: filmDecor },
  blueprint: { wrapper: s.clipShadow, card: s.blueprintCard, pad: s.padBlueprint, body: s.blueprintBody, placeholder: 'rgba(234,242,251,0.5)', decor: blueprintDecor },
  cosmic: { card: s.cosmicCard, gradient: ['#1c1547', '#3a2470', '#221a4f'], pad: s.padCosmic, body: s.cosmicBody, placeholder: 'rgba(239,234,255,0.5)', decor: cosmicDecor },
  lace: { wrapper: s.clipShadow, card: s.laceCard, pad: s.padLace, body: s.laceBody, placeholder: '#b3a98f', decor: laceDecor },
  floral: { wrapper: s.clipShadow, card: s.floralCard, pad: s.padFloral, body: s.floralBody, placeholder: '#a7adb0', decor: floralDecor },
  watercolor: { wrapper: s.clipShadow, card: s.watercolorCard, pad: s.padWatercolor, body: s.watercolorBody, placeholder: '#b3a6a0', decor: watercolorDecor },
  rococo: { card: s.rococoCard, gradient: ['#bcc8da', '#d4dbe7', '#c1ccdb'], pad: s.padRococo, body: s.rococoBody, placeholder: '#a89f93', decor: rococoDecor },
};

export function frameBody(id: TextFrameId): TextStyle {
  return (DEFS[id] ?? DEFS.letter).body;
}
export function framePlaceholder(id: TextFrameId): string {
  return (DEFS[id] ?? DEFS.letter).placeholder;
}

// Renders the chosen frame's card + decorations with `children` in the content area. Used by both
// the read-only TextFrame and the editor, so picking a frame restyles the editor in place.
export function TextFrameShell({ frameId, accent = DEFAULT_ACCENT, children }: { frameId: TextFrameId; accent?: string; children: ReactNode }) {
  const def = DEFS[frameId] ?? DEFS.letter;
  const content = (
    <>
      {def.decor ? def.decor(accent) : null}
      <View style={def.pad}>{children}</View>
    </>
  );
  const inner = def.gradient ? (
    <LinearGradient colors={def.gradient as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={def.card}>
      {content}
    </LinearGradient>
  ) : (
    <View style={def.card}>{content}</View>
  );
  return def.wrapper ? <View style={def.wrapper}>{inner}</View> : inner;
}

export function TextFrame({ frameId, lines, accent = DEFAULT_ACCENT }: { frameId: TextFrameId; lines: string[]; accent?: string }) {
  const body = frameBody(frameId);
  return (
    <TextFrameShell frameId={frameId} accent={accent}>
      {lines.map((p, k) => (
        <Text key={k} style={body}>
          {p || ' '}
        </Text>
      ))}
    </TextFrameShell>
  );
}

// A tiny visual of each frame for the picker chips and the toolbar button.
export function TextFrameGlyph({ id, accent = DEFAULT_ACCENT }: { id: TextFrameId; accent?: string }) {
  if (id === 'note') {
    return (
      <View style={[g.box, { backgroundColor: '#fbe48a', borderRadius: 2, overflow: 'hidden' }]}>
        <View style={g.noteFold} />
      </View>
    );
  }
  if (id === 'card') {
    return (
      <View style={[g.box, { backgroundColor: '#fffdf9', borderWidth: StyleSheet.hairlineWidth, borderColor: '#d9d2c2' }]}>
        <View style={[g.cardRule, { backgroundColor: accent }]} />
      </View>
    );
  }
  if (id === 'ruled') {
    return (
      <View style={[g.box, { backgroundColor: '#fcfbf6', overflow: 'hidden' }]}>
        <View style={[g.ruleLine, { top: 5 }]} />
        <View style={[g.ruleLine, { top: 9 }]} />
        <View style={[g.ruleLine, { top: 13 }]} />
        <View style={g.ruleMargin} />
      </View>
    );
  }
  if (id === 'script') {
    return (
      <View style={[g.box, { backgroundColor: '#f7f2e8', alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={g.scriptMark}>ab</Text>
      </View>
    );
  }
  if (id === 'chalkboard') {
    return (
      <View style={[g.box, { backgroundColor: '#2c3733' }]}>
        <View style={g.chalkInset} />
      </View>
    );
  }
  if (id === 'postcard') {
    return (
      <View style={[g.box, { backgroundColor: '#efe6d4', overflow: 'hidden' }]}>
        <View style={g.pcDiv} />
        <View style={g.pcStamp} />
      </View>
    );
  }
  if (id === 'receipt') {
    return (
      <View style={[g.box, { backgroundColor: '#fffefb', borderTopWidth: 1.5, borderBottomWidth: 1.5, borderStyle: 'dashed', borderColor: '#c9c0b0', overflow: 'hidden' }]}>
        <View style={g.rcBars}>
          {[1, 2, 1, 2, 1, 1].map((w, i) => (
            <View key={i} style={{ width: w, height: 5, backgroundColor: '#333', marginRight: 1 }} />
          ))}
        </View>
      </View>
    );
  }
  if (id === 'comic') {
    return (
      <View style={[g.box, { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1a1a1a' }]}>
        <View style={g.comicTail} />
      </View>
    );
  }
  if (id === 'filmstrip') {
    return (
      <View style={[g.box, { backgroundColor: '#141210', overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 1.5 }]}>
        <View style={g.filmCol}>
          <View style={g.filmHole} />
          <View style={g.filmHole} />
        </View>
        <View style={g.filmCol}>
          <View style={g.filmHole} />
          <View style={g.filmHole} />
        </View>
      </View>
    );
  }
  if (id === 'blueprint') {
    return (
      <View style={[g.box, { backgroundColor: '#0e3a6b', overflow: 'hidden' }]}>
        <View style={g.bpH} />
        <View style={g.bpV} />
      </View>
    );
  }
  if (id === 'cosmic') {
    return (
      <View style={[g.box, { backgroundColor: '#241a52', overflow: 'hidden' }]}>
        <View style={[g.star, { top: 3, left: 4 }]} />
        <View style={[g.star, { top: 8, left: 13 }]} />
        <View style={[g.star, { top: 5, left: 9 }]} />
      </View>
    );
  }
  if (id === 'lace') {
    return (
      <View style={[g.box, { backgroundColor: '#f6f3ec', overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: '#d6cdb8' }]}>
        <View style={g.laceRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={g.laceBump} />
          ))}
        </View>
      </View>
    );
  }
  if (id === 'floral') {
    return (
      <View style={[g.box, { backgroundColor: '#f3f1e8', overflow: 'hidden' }]}>
        <View style={[g.miniFlower, { top: 2, left: 2, backgroundColor: '#8ea6c6' }]} />
        <View style={[g.miniLeaf, { top: 7, left: 7 }]} />
        <View style={[g.miniFlower, { bottom: 2, right: 2, width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#b3c3d9' }]} />
      </View>
    );
  }
  if (id === 'watercolor') {
    return (
      <View style={[g.box, { backgroundColor: '#efe9dd', overflow: 'hidden' }]}>
        <View style={[g.miniFlower, { bottom: 2, left: 2, backgroundColor: '#e3aebe' }]} />
        <View style={[g.miniFlower, { bottom: 5, left: 6, width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#eec6d2' }]} />
      </View>
    );
  }
  if (id === 'rococo') {
    return (
      <View style={[g.box, { backgroundColor: '#c2cedd', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }]}>
        <View style={g.rococoMini} />
      </View>
    );
  }
  // letter (default)
  return <View style={[g.box, { backgroundColor: '#f7f2e8' }]} />;
}

const g = StyleSheet.create({
  box: { width: 20, height: 15, borderRadius: 3 },
  noteFold: { position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, backgroundColor: '#e7d074', transform: [{ rotate: '45deg' }] },
  cardRule: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  ruleLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#cfe0ef' },
  ruleMargin: { position: 'absolute', top: 0, bottom: 0, left: 5, width: 1, backgroundColor: 'rgba(214,128,120,0.7)' },
  scriptMark: { fontFamily: Font.script, fontSize: 13, color: '#3a3630', lineHeight: 15 },
  chalkInset: { position: 'absolute', top: 2.5, left: 2.5, right: 2.5, bottom: 2.5, borderRadius: 2, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.4)' },
  pcDiv: { position: 'absolute', top: 0, bottom: 0, left: 13, width: 1, backgroundColor: 'rgba(120,95,60,0.3)' },
  pcStamp: { position: 'absolute', top: 2, right: 2, width: 6, height: 7, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(120,90,55,0.5)' },
  rcBars: { position: 'absolute', bottom: 1.5, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  comicTail: { position: 'absolute', bottom: -4, left: 4, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#1a1a1a' },
  filmCol: { height: '100%', justifyContent: 'space-around', paddingVertical: 1 },
  filmHole: { width: 2.5, height: 3, borderRadius: 1, backgroundColor: '#efe9dd', marginVertical: 0.5 },
  bpH: { position: 'absolute', left: 0, right: 0, top: 7, height: 1, backgroundColor: 'rgba(150,200,255,0.5)' },
  bpV: { position: 'absolute', top: 0, bottom: 0, left: 10, width: 1, backgroundColor: 'rgba(150,200,255,0.5)' },
  star: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: '#fff' },
  laceRow: { position: 'absolute', top: 1, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  laceBump: { width: 4, height: 2, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: '#d8d0bd', marginHorizontal: 0.5 },
  miniFlower: { position: 'absolute', width: 4, height: 4, borderRadius: 2 },
  miniLeaf: { position: 'absolute', width: 3, height: 1.5, borderRadius: 1, backgroundColor: '#a9b596', transform: [{ rotate: '45deg' }] },
  rococoMini: { width: 12, height: 9, borderRadius: 2, backgroundColor: '#f3efe5' },
});
