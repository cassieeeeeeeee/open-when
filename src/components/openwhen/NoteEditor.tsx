import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextStyle, View } from 'react-native';

import { frameBody, framePlaceholder, TextFrameShell, type TextFrameId } from '@/components/openwhen/TextFrame';
import { Font } from '@/constants/openwhen';

type Colors = { onBg: string; onBgDim: string; base: string };

// Edit a note's text with a local draft. Edits are KEPT whenever the editor closes — via Save or just
// by tapping away / opening another block — and only thrown away on an explicit Cancel. The input sits
// inside the chosen frame's card, so picking a new frame restyles the editor live. `bodyOverride`
// carries the user's font/size/colour choices so the editor matches the final look.
export function NoteEditor({
  initial,
  colors,
  frameId,
  accent,
  bodyOverride,
  placeholderColor,
  renderStage,
  onCommit,
  onClose,
}: {
  initial: string;
  colors: Colors;
  frameId: TextFrameId;
  accent: string;
  bodyOverride?: TextStyle;
  placeholderColor?: string;
  // Wrap the framed text in the parent's sticker "stage" so decorations anchor to the frame box (the
  // same size shown in the reveal), not the editor's buttons — keeps stickers from shifting on close.
  renderStage?: (node: ReactNode) => ReactNode;
  onCommit: (text: string) => void; // persist the text (no close)
  onClose: () => void; // close the editor
}) {
  const [text, setText] = useState(initial);
  const textRef = useRef(text);
  textRef.current = text;
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;
  const settled = useRef(false); // true once Save/Cancel handled it, so unmount doesn't double-commit
  // On unmount (tapped another block, hit the pencil, navigated away…) keep the edits, unless Cancel.
  useEffect(
    () => () => {
      if (!settled.current) commitRef.current(textRef.current);
    },
    [],
  );
  const save = () => {
    settled.current = true;
    onCommit(text);
    onClose();
  };
  const cancel = () => {
    settled.current = true;
    onClose();
  };
  return (
    <View>
      {(renderStage ?? ((n) => n))(
        <TextFrameShell frameId={frameId} accent={accent}>
          <TextInput
            style={[frameBody(frameId), s.input, bodyOverride]}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            placeholder="Write your note…"
            placeholderTextColor={placeholderColor ?? framePlaceholder(frameId)}
          />
        </TextFrameShell>,
      )}
      <View style={s.row}>
        <Pressable onPress={cancel} style={s.cancel} hitSlop={6}>
          <Text style={[s.cancelText, { color: colors.onBgDim }]}>Cancel</Text>
        </Pressable>
        <Pressable onPress={save} style={[s.save, { backgroundColor: colors.onBg }]} hitSlop={6}>
          <Text style={[s.saveText, { color: colors.base }]}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  input: { backgroundColor: 'transparent', padding: 0, marginBottom: 0, minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 10 },
  cancel: { paddingHorizontal: 16, paddingVertical: 8 },
  cancelText: { fontFamily: Font.semibold, fontSize: 13 },
  save: { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 8 },
  saveText: { fontFamily: Font.bold, fontSize: 13 },
});
