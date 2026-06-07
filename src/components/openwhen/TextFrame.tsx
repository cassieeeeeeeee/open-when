import { StyleSheet, Text, View } from 'react-native';

import { Font } from '@/constants/openwhen';

// Selectable card styles for a text/letter block — the text equivalent of the photo layouts.
// Each frame is self-contained (its own background + text colour) so it stays legible on any
// section theme. `letter` is the default and matches the original cream card exactly.
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

function Lines({ lines, style }: { lines: string[]; style: object }) {
  return (
    <>
      {lines.map((p, k) => (
        <Text key={k} style={style}>
          {p || ' '}
        </Text>
      ))}
    </>
  );
}

function LetterFrame({ lines }: { lines: string[] }) {
  return (
    <View style={s.letter}>
      <Lines lines={lines} style={s.bodySerifless} />
    </View>
  );
}

function ScriptFrame({ lines }: { lines: string[] }) {
  return (
    <View style={s.letter}>
      <Lines lines={lines} style={s.bodyScript} />
    </View>
  );
}

function NoteFrame({ lines }: { lines: string[] }) {
  return (
    <View style={s.noteShadow}>
      <View style={s.noteCard}>
        <Lines lines={lines} style={s.noteBody} />
        {/* a turned-up corner — a darker square rotated into the clipped corner reads as a dog-ear */}
        <View style={s.noteFold} />
      </View>
    </View>
  );
}

function CardFrame({ lines, accent }: { lines: string[]; accent: string }) {
  return (
    <View style={s.indexCard}>
      <View style={[s.indexRule, { backgroundColor: accent }]} />
      <Lines lines={lines} style={s.bodySerifless} />
    </View>
  );
}

function RuledFrame({ lines }: { lines: string[] }) {
  // a background of evenly spaced ruled lines + a margin line; text rides on top at the same rhythm
  return (
    <View style={s.ruledCard}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 40 }, (_, i) => (
          <View key={i} style={[s.ruledLine, { top: 30 + i * 22 }]} />
        ))}
        <View style={s.ruledMargin} />
      </View>
      <View style={s.ruledTextWrap}>
        <Lines lines={lines} style={s.ruledBody} />
      </View>
    </View>
  );
}

function ChalkFrame({ lines }: { lines: string[] }) {
  return (
    <View style={s.chalkCard}>
      <View style={s.chalkInset} pointerEvents="none" />
      <Lines lines={lines} style={s.chalkBody} />
    </View>
  );
}

export function TextFrame({ frameId, lines, accent = DEFAULT_ACCENT }: { frameId: TextFrameId; lines: string[]; accent?: string }) {
  switch (frameId) {
    case 'note':
      return <NoteFrame lines={lines} />;
    case 'card':
      return <CardFrame lines={lines} accent={accent} />;
    case 'ruled':
      return <RuledFrame lines={lines} />;
    case 'script':
      return <ScriptFrame lines={lines} />;
    case 'chalkboard':
      return <ChalkFrame lines={lines} />;
    default:
      return <LetterFrame lines={lines} />;
  }
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

const s = StyleSheet.create({
  // shared bodies
  bodySerifless: { fontFamily: Font.regular, fontSize: 14, color: '#3a3630', lineHeight: 22, marginBottom: 11 },
  bodyScript: { fontFamily: Font.script, fontSize: 19, color: '#3a3630', lineHeight: 27, marginBottom: 6 },

  // letter / handwritten (cream card)
  letter: {
    backgroundColor: '#f7f2e8',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },

  // sticky note
  noteShadow: {
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  noteCard: { backgroundColor: '#fbe48a', borderRadius: 3, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22, overflow: 'hidden' },
  noteBody: { fontFamily: Font.regular, fontSize: 14, color: '#5b521f', lineHeight: 22, marginBottom: 10 },
  noteFold: { position: 'absolute', right: -16, bottom: -16, width: 32, height: 32, backgroundColor: '#e7d074', transform: [{ rotate: '45deg' }] },

  // index card
  indexCard: {
    backgroundColor: '#fffdf9',
    borderRadius: 9,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2dccd',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  indexRule: { position: 'absolute', top: 0, left: 0, right: 0, height: 6 },

  // notebook / ruled paper
  ruledCard: {
    backgroundColor: '#fcfbf6',
    borderRadius: 8,
    marginTop: 12,
    overflow: 'hidden',
    minHeight: 80,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  ruledLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#cfe0ef' },
  ruledMargin: { position: 'absolute', top: 0, bottom: 0, left: 30, width: 1.5, backgroundColor: 'rgba(214,128,120,0.6)' },
  ruledTextWrap: { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 42 },
  ruledBody: { fontFamily: Font.regular, fontSize: 14, color: '#34506a', lineHeight: 22, marginBottom: 0 },

  // chalkboard
  chalkCard: {
    backgroundColor: '#2c3733',
    borderRadius: 10,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  chalkInset: { position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  chalkBody: { fontFamily: Font.script, fontSize: 19, color: '#eef1ea', lineHeight: 27, marginBottom: 6 },
});

const g = StyleSheet.create({
  box: { width: 20, height: 15, borderRadius: 3 },
  noteFold: { position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, backgroundColor: '#e7d074', transform: [{ rotate: '45deg' }] },
  cardRule: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  ruleLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#cfe0ef' },
  ruleMargin: { position: 'absolute', top: 0, bottom: 0, left: 5, width: 1, backgroundColor: 'rgba(214,128,120,0.7)' },
  scriptMark: { fontFamily: Font.script, fontSize: 13, color: '#3a3630', lineHeight: 15 },
  chalkInset: { position: 'absolute', top: 2.5, left: 2.5, right: 2.5, bottom: 2.5, borderRadius: 2, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.4)' },
});
