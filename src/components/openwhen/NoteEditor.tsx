import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { frameBody, framePlaceholder, TextFrameShell, type TextFrameId } from '@/components/openwhen/TextFrame';
import { Font } from '@/constants/openwhen';

type Colors = { onBg: string; onBgDim: string; base: string };

// Edit a note's text with a local draft, committed only on Save (Cancel reverts). The input sits
// inside the chosen frame's card, so picking a new frame restyles the editor live.
export function NoteEditor({
  initial,
  colors,
  frameId,
  accent,
  onSave,
  onCancel,
}: {
  initial: string;
  colors: Colors;
  frameId: TextFrameId;
  accent: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial);
  return (
    <View>
      <TextFrameShell frameId={frameId} accent={accent}>
        <TextInput
          style={[frameBody(frameId), s.input]}
          value={text}
          onChangeText={setText}
          multiline
          autoFocus
          placeholder="Write your note…"
          placeholderTextColor={framePlaceholder(frameId)}
        />
      </TextFrameShell>
      <View style={s.row}>
        <Pressable onPress={onCancel} style={s.cancel} hitSlop={6}>
          <Text style={[s.cancelText, { color: colors.onBgDim }]}>Cancel</Text>
        </Pressable>
        <Pressable onPress={() => onSave(text)} style={[s.save, { backgroundColor: colors.onBg }]} hitSlop={6}>
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
