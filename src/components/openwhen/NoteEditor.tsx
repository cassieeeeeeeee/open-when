import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Font } from '@/constants/openwhen';

type Colors = { onBg: string; onBgDim: string; base: string };

// Edit a note's text with a local draft, committed only on Save (Cancel reverts).
export function NoteEditor({
  initial,
  colors,
  onSave,
  onCancel,
}: {
  initial: string;
  colors: Colors;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial);
  return (
    <View>
      <TextInput
        style={s.input}
        value={text}
        onChangeText={setText}
        multiline
        autoFocus
        placeholder="Write your note…"
        placeholderTextColor="#9a9186"
      />
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
  input: {
    backgroundColor: '#f7f2e8',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    fontFamily: Font.regular,
    fontSize: 14,
    color: '#3a3630',
    lineHeight: 22,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 10 },
  cancel: { paddingHorizontal: 16, paddingVertical: 8 },
  cancelText: { fontFamily: Font.semibold, fontSize: 13 },
  save: { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 8 },
  saveText: { fontFamily: Font.bold, fontSize: 13 },
});
