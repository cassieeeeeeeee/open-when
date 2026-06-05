import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CalendarIcon,
  CloseIcon,
  GradientAvatar,
  HeartIcon,
  ImageIcon,
  MusicIcon,
  PencilIcon,
  VideoIcon,
} from '@/components/openwhen/icons';
import { Font, OW, Radius, type Tone, TONES } from '@/constants/openwhen';
import { createMemory } from '@/lib/memories';
import { people } from '@/data/sample';

// A "memory" is an everyday scrapbook entry with NO unlock time — distinct from a capsule.
// Content upload + real collaborators are stubs for now; persistence comes with the backend.
const CONTENT = [
  { key: 'text', label: 'Text', tone: 'lilac' as Tone, Icon: PencilIcon },
  { key: 'photos', label: 'Photos', tone: 'sage' as Tone, Icon: ImageIcon },
  { key: 'video', label: 'Video', tone: 'blue' as Tone, Icon: VideoIcon },
  { key: 'playlist', label: 'Playlist', tone: 'peach' as Tone, Icon: MusicIcon },
];

export default function MemoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = useState('Road trip with Jess');
  const [collaborators, setCollaborators] = useState<string[]>(['p1']);

  const toggle = (id: string) =>
    setCollaborators((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 4 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <CloseIcon size={20} color={OW.ink2} />
        </Pressable>
        <Text style={styles.title}>New Memory</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>A little scrapbook for a moment you want to keep.</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Name this memory"
          placeholderTextColor={OW.muted}
        />

        <Text style={styles.label}>When</Text>
        <Pressable style={[styles.input, styles.rowCenter]}>
          <CalendarIcon size={18} color={OW.muted} />
          <Text style={styles.inputText}>Today</Text>
        </Pressable>

        <Text style={styles.label}>Who can add to this</Text>
        <View style={styles.people}>
          {people.map((p) => {
            const on = collaborators.includes(p.id);
            return (
              <Pressable
                key={p.id}
                onPress={() => toggle(p.id)}
                style={[styles.contact, on && styles.contactOn]}>
                <GradientAvatar size={24} from={p.from} to={p.to} />
                <Text style={[styles.contactName, on && styles.contactNameOn]}>{p.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Add to this memory</Text>
        <View style={styles.contentGrid}>
          {CONTENT.map(({ key, label, tone, Icon }) => (
            <Pressable key={key} style={[styles.contentBtn, { backgroundColor: TONES[tone].soft }]}>
              <View style={styles.contentIcon}>
                <Icon size={16} color={TONES[tone].color} />
              </View>
              <Text style={styles.contentLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.createBtn}
          onPress={async () => {
            await createMemory({ title: title.trim() || 'Untitled memory', collaborators });
            router.back();
          }}>
          <Text style={styles.createText}>Create Memory</Text>
          <HeartIcon size={14} color="#fff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  spacer: { width: 20 },
  screen: { flex: 1, backgroundColor: OW.bg, paddingHorizontal: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  title: { fontFamily: Font.bold, fontSize: 17, color: OW.ink },
  content: { paddingTop: 4 },
  intro: { fontFamily: Font.regular, fontSize: 13, color: OW.muted, marginBottom: 6 },

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
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  people: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  contactOn: { backgroundColor: OW.sageSoft, borderColor: OW.sage },
  contactName: { fontFamily: Font.semibold, fontSize: 13, color: OW.ink2 },
  contactNameOn: { color: OW.ink },

  contentGrid: { flexDirection: 'row', gap: 8 },
  contentBtn: { flex: 1, borderRadius: 13, paddingVertical: 11, alignItems: 'center', gap: 5 },
  contentIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentLabel: { fontFamily: Font.bold, fontSize: 11.5, color: OW.ink2 },

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
