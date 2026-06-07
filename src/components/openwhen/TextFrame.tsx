import { type ReactNode } from 'react';
import { StyleSheet, Text, type TextStyle, View } from 'react-native';

import { Font } from '@/constants/openwhen';

// Selectable card styles for a text/letter block — the text equivalent of the photo layouts.
// Each frame is self-contained (its own background + text colour) so it stays legible on any
// section theme. `letter` is the default and matches the original cream card.
//
// A frame is described once (card container + content padding + body text style + decorations)
// and rendered through TextFrameShell, so both the read view (TextFrame) and the editor's
// TextInput share exactly the same look.
export type TextFrameId = 'letter' | 'note' | 'card' | 'ruled' | 'script' | 'chalkboard';

export const TEXT_FRAMES: { id: TextFrameId; label: string }[] = [
  { id: 'letter', label: 'Letter' },
  { id: 'note', label: 'Sticky note' },
  { id: 'card', label: 'Index card' },
  { id: 'ruled', label: 'Notebook' },
  { id: 'script', label: 'Handwritten' },
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

  // shadow carrier for cards that clip their content (so the shadow isn't clipped too)
  clipShadow: { marginTop: 12, shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }, elevation: 6 },

  // cards (content padding lives on the pad wrappers below)
  letterCard: { backgroundColor: '#f7f2e8', borderRadius: 16, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 15, shadowOffset: { width: 0, height: 14 }, elevation: 8 },
  noteCard: { backgroundColor: '#fbe48a', borderRadius: 3, overflow: 'hidden' },
  indexCard: { backgroundColor: '#fffdf9', borderRadius: 9, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e2dccd', overflow: 'hidden' },
  ruledCard: { backgroundColor: '#fcfbf6', borderRadius: 8, overflow: 'hidden', minHeight: 80 },
  chalkCard: { backgroundColor: '#2c3733', borderRadius: 10, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 12 }, elevation: 8 },

  // content padding per frame
  padLetter: { padding: 18 },
  padNote: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22 },
  padIndex: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16 },
  padRuled: { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 42 },
  padChalk: { padding: 20 },

  // decorations
  indexRule: { position: 'absolute', top: 0, left: 0, right: 0, height: 6 },
  noteFold: { position: 'absolute', right: -16, bottom: -16, width: 32, height: 32, backgroundColor: '#e7d074', transform: [{ rotate: '45deg' }] },
  ruledLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#cfe0ef' },
  ruledMargin: { position: 'absolute', top: 0, bottom: 0, left: 30, width: 1.5, backgroundColor: 'rgba(214,128,120,0.6)' },
  chalkInset: { position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
});

type FrameDef = {
  wrapper?: object; // optional outer view that carries the shadow when the card itself clips
  card: object; // card container (no content padding)
  pad: object; // padding wrapper around the content
  body: TextStyle; // text style for the content / input
  placeholder: string; // placeholder colour when editing
  decor?: (accent: string) => ReactNode; // absolute decorations layered inside the card
};

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

const DEFS: Record<TextFrameId, FrameDef> = {
  letter: { card: s.letterCard, pad: s.padLetter, body: s.bodySerifless, placeholder: '#9a9186' },
  script: { card: s.letterCard, pad: s.padLetter, body: s.bodyScript, placeholder: '#b3a98f' },
  note: { wrapper: s.clipShadow, card: s.noteCard, pad: s.padNote, body: s.noteBody, placeholder: '#b0a25a', decor: () => <View style={s.noteFold} /> },
  card: { wrapper: s.clipShadow, card: s.indexCard, pad: s.padIndex, body: s.bodySerifless, placeholder: '#b8b09c', decor: (a) => <View style={[s.indexRule, { backgroundColor: a }]} /> },
  ruled: { wrapper: s.clipShadow, card: s.ruledCard, pad: s.padRuled, body: s.ruledBody, placeholder: '#8aa0b5', decor: ruledDecor },
  chalkboard: { card: s.chalkCard, pad: s.padChalk, body: s.chalkBody, placeholder: 'rgba(238,241,234,0.5)', decor: () => <View style={s.chalkInset} pointerEvents="none" /> },
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
  const inner = (
    <View style={def.card}>
      {def.decor ? def.decor(accent) : null}
      <View style={def.pad}>{children}</View>
    </View>
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
});
