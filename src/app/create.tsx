import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BigEnvelope,
  CloseIcon,
  GradientAvatar,
  HeartIcon,
  ImageIcon,
  MicIcon,
  PencilIcon,
  VideoIcon,
} from '@/components/openwhen/icons';
import { DateField } from '@/components/openwhen/DateField';
import { Font, OW, Radius, Tone, TONES } from '@/constants/openwhen';
import { createCapsule } from '@/lib/capsules';
import { people } from '@/data/sample';

const MSG_TYPES: { key: string; label: string; tone: Tone; Icon: typeof PencilIcon }[] = [
  { key: 'write', label: 'Write', tone: 'lilac', Icon: PencilIcon },
  { key: 'voice', label: 'Voice', tone: 'peach', Icon: MicIcon },
  { key: 'video', label: 'Video', tone: 'blue', Icon: VideoIcon },
  { key: 'photo', label: 'Photo', tone: 'blue', Icon: ImageIcon },
];

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = useState('Open on your wedding day');
  const [note, setNote] = useState("I can't wait to see the amazing life you're going to build.");
  const [recipient, setRecipient] = useState('');
  const [recipientId, setRecipientId] = useState<string | undefined>(undefined);
  const [unlockDate, setUnlockDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 4 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <CloseIcon size={20} color={OW.ink2} />
        </Pressable>
        <Text style={styles.title}>Create a Capsule</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.envWrap}>
          <BigEnvelope size={120} color={OW.pink} soft={OW.pinkSoft} />
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Open when…"
          placeholderTextColor={OW.muted}
        />

        <Text style={styles.label}>For</Text>
        <TextInput
          style={styles.input}
          value={recipient}
          onChangeText={(t) => {
            setRecipient(t);
            setRecipientId(undefined);
          }}
          placeholder="Who is this for?"
          placeholderTextColor={OW.muted}
        />
        <View style={styles.people}>
          {people.map((p) => {
            const on = recipientId === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  setRecipient(p.name);
                  setRecipientId(p.id);
                }}
                style={[styles.contact, on && styles.contactOn]}>
                <GradientAvatar size={22} from={p.from} to={p.to} />
                <Text style={[styles.contactName, on && styles.contactNameOn]}>{p.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Unlock on</Text>
        <DateField value={unlockDate} onChange={setUnlockDate} />

        <Text style={styles.label}>Add a message or memory</Text>
        <View style={styles.msgGrid}>
          {MSG_TYPES.map(({ key, label, tone, Icon }) => (
            <Pressable key={key} style={[styles.msgBtn, { backgroundColor: TONES[tone].soft }]}>
              <View style={styles.msgIcon}>
                <Icon size={14} color={TONES[tone].color} />
              </View>
              <Text style={styles.msgLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Add a note (optional)</Text>
        <TextInput
          style={[styles.input, styles.noteArea]}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Pressable
          style={styles.createBtn}
          onPress={async () => {
            await createCapsule({
              title: title.trim() || 'Untitled capsule',
              who: recipient.trim() || 'Someone special',
              date: unlockDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
              tone: 'pink',
              personId: recipientId,
              contents: note.trim()
                ? [{ type: 'text', label: 'A note', preview: note.trim() }]
                : undefined,
            });
            router.back();
          }}>
          <Text style={styles.createText}>Create Capsule</Text>
          <HeartIcon size={14} color="#fff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: OW.bg, paddingHorizontal: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  title: { fontFamily: Font.bold, fontSize: 17, color: OW.ink },
  content: { paddingTop: 4 },
  envWrap: { alignItems: 'center', marginVertical: 14 },

  label: { fontFamily: Font.bold, fontSize: 12.5, color: OW.ink2, marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: OW.inputLine,
    borderRadius: Radius.md,
    backgroundColor: OW.cardSoft,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: Font.medium,
    fontSize: 14,
    color: OW.ink,
  },
  inputText: { fontFamily: Font.medium, fontSize: 14, color: OW.ink },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  people: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
  },
  contactOn: { backgroundColor: OW.pinkSoft, borderColor: OW.pink },
  contactName: { fontFamily: Font.semibold, fontSize: 13, color: OW.ink2 },
  contactNameOn: { color: OW.ink },

  msgGrid: { flexDirection: 'row', gap: 8 },
  msgBtn: { flex: 1, borderRadius: 13, paddingVertical: 11, alignItems: 'center', gap: 5 },
  msgIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgLabel: { fontFamily: Font.bold, fontSize: 11.5, color: OW.ink2 },

  noteArea: { minHeight: 64, textAlignVertical: 'top', fontFamily: Font.regular, fontStyle: 'italic' },

  createBtn: {
    backgroundColor: OW.dark,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  createText: { fontFamily: Font.bold, fontSize: 15, color: '#fff' },
});
