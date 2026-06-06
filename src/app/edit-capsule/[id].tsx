import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CalendarIcon,
  ChevronLeftIcon,
  EnvelopeGlyph,
  ImageIcon,
  MusicIcon,
  PencilIcon,
  TrashIcon,
  VideoIcon,
} from '@/components/openwhen/icons';
import { ContentItemRow } from '@/components/openwhen/ui';
import { Font, OW, Radius, type Tone, TONES } from '@/constants/openwhen';
import { type CapsuleContent } from '@/data/sample';
import { deleteCapsule, updateCapsule, useCapsule } from '@/lib/capsules';

// Manage a capsule YOU created: see/add contents, edit the opening method, reseal, delete.
const ADD = [
  { key: 'text', label: 'Text', tone: 'lilac' as Tone, Icon: PencilIcon },
  { key: 'photos', label: 'Photos', tone: 'sage' as Tone, Icon: ImageIcon },
  { key: 'video', label: 'Video', tone: 'blue' as Tone, Icon: VideoIcon },
  { key: 'playlist', label: 'Playlist', tone: 'peach' as Tone, Icon: MusicIcon },
];

const METHODS = [
  { key: 'timed', label: 'On a date', desc: 'Unlocks automatically at a set time' },
  { key: 'manual', label: 'When I release it', desc: 'You choose when to send it' },
  { key: 'recipient', label: 'When they open it', desc: 'They unlock it whenever they’re ready' },
] as const;
type Method = (typeof METHODS)[number]['key'];

export default function EditCapsuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { capsule } = useCapsule(id);
  const tone = TONES[capsule?.tone ?? 'pink'];
  const opened = capsule?.status === 'unlocked';
  const contents: CapsuleContent[] = capsule?.contents ?? [];

  const [method, setMethod] = useState<Method>('timed');

  const removeItem = async (index: number) => {
    if (!id) return;
    await updateCapsule(id, { contents: contents.filter((_, i) => i !== index) });
  };

  const confirmDelete = () => {
    Alert.alert('Delete capsule?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (id) await deleteCapsule(id);
          router.back();
        },
      },
    ]);
  };

  const confirmRelease = () => {
    Alert.alert(
      'Release this capsule?',
      `${capsule?.who ?? 'They'} will be able to open it right now. This can’t be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Release', onPress: () => router.back() },
      ]
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeftIcon size={22} color={OW.ink2} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {capsule?.title ?? 'Capsule'}
        </Text>
        <Pressable onPress={confirmDelete} hitSlop={8} accessibilityLabel="Delete capsule">
          <TrashIcon size={20} color="#c0504d" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroRow}>
          <EnvelopeGlyph size={48} color={tone.color} soft={tone.soft} />
          <View style={styles.flex}>
            <Text style={styles.title}>{capsule?.title}</Text>
            {capsule ? <Text style={styles.sub}>For: {capsule.who}</Text> : null}
          </View>
        </View>

        <Pressable
          style={styles.previewBtn}
          onPress={() => id && router.push({ pathname: '/capsule/[id]', params: { id, preview: '1' } })}>
          <Text style={styles.previewText}>Preview capsule ✨</Text>
        </Pressable>

        {opened ? (
          <Text style={styles.openedNote}>This capsule has been opened — it’s locked from edits.</Text>
        ) : null}

        <Text style={styles.label}>Inside this capsule</Text>
        {contents.length > 0 ? (
          contents.map((c, i) => (
            <ContentItemRow
              key={i}
              item={c}
              tone={capsule?.tone ?? 'pink'}
              onDelete={!opened ? () => removeItem(i) : undefined}
            />
          ))
        ) : (
          <Text style={styles.empty}>Nothing added yet.</Text>
        )}

        {!opened ? (
          <>
            <Text style={styles.label}>Add more</Text>
            <View style={styles.addGrid}>
              {ADD.map(({ key, label, tone: t, Icon }) => (
                <Pressable key={key} style={[styles.addBtn, { backgroundColor: TONES[t].soft }]}>
                  <View style={styles.addIcon}>
                    <Icon size={16} color={TONES[t].color} />
                  </View>
                  <Text style={styles.addLabel}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Opening method</Text>
            {METHODS.map((m) => {
              const on = method === m.key;
              return (
                <Pressable
                  key={m.key}
                  onPress={() => setMethod(m.key)}
                  style={[styles.method, on && styles.methodOn]}>
                  <View style={[styles.radio, on && styles.radioOn]}>
                    {on ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.methodLabel}>{m.label}</Text>
                    <Text style={styles.methodDesc}>{m.desc}</Text>
                  </View>
                </Pressable>
              );
            })}

            {method === 'timed' ? (
              <Pressable style={styles.dateRow}>
                <CalendarIcon size={18} color={OW.muted} />
                <Text style={styles.dateText}>
                  {capsule?.date && capsule.date !== 'No date set' ? capsule.date : 'Pick a date'}
                </Text>
              </Pressable>
            ) : null}

            {method === 'manual' ? (
              <Pressable style={styles.release} onPress={confirmRelease}>
                <Text style={styles.releaseText}>Release capsule now</Text>
              </Pressable>
            ) : null}

            <Pressable style={styles.reseal} onPress={() => router.back()}>
              <Text style={styles.resealText}>Reseal capsule</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  spacer: { width: 22 },
  screen: { flex: 1, backgroundColor: OW.bg, paddingHorizontal: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  headerTitle: {
    fontFamily: Font.bold,
    fontSize: 16,
    color: OW.ink,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  content: { paddingTop: 4 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  title: { fontFamily: Font.bold, fontSize: 16, color: OW.ink },
  sub: { fontFamily: Font.regular, fontSize: 12.5, color: OW.muted, marginTop: 2 },
  openedNote: {
    fontFamily: Font.medium,
    fontSize: 12.5,
    color: OW.ink2,
    marginTop: 12,
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: Radius.md,
    padding: 10,
  },

  label: { fontFamily: Font.bold, fontSize: 12.5, color: OW.ink2, marginTop: 18, marginBottom: 8 },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 8,
  },
  contentRowIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: OW.card,
    borderWidth: 1,
    borderColor: OW.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRowText: { fontFamily: Font.semibold, fontSize: 14, color: OW.ink },
  empty: { fontFamily: Font.regular, fontSize: 13, color: OW.muted },

  addGrid: { flexDirection: 'row', gap: 8 },
  addBtn: { flex: 1, borderRadius: 13, paddingVertical: 11, alignItems: 'center', gap: 5 },
  addIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: { fontFamily: Font.bold, fontSize: 11.5, color: OW.ink2 },

  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 8,
  },
  methodOn: { borderColor: OW.dark },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: OW.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: OW.dark },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: OW.dark },
  methodLabel: { fontFamily: Font.bold, fontSize: 14, color: OW.ink },
  methodDesc: { fontFamily: Font.regular, fontSize: 12, color: OW.muted, marginTop: 1 },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.inputLine,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 2,
  },
  dateText: { fontFamily: Font.medium, fontSize: 14, color: OW.ink },

  reseal: {
    backgroundColor: OW.dark,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  resealText: { fontFamily: Font.bold, fontSize: 15, color: '#fff' },

  release: {
    borderRadius: Radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: OW.dark,
  },
  releaseText: { fontFamily: Font.bold, fontSize: 15, color: OW.dark },
  previewBtn: {
    marginTop: 14,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
  },
  previewText: { fontFamily: Font.bold, fontSize: 14, color: OW.ink },
  themesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 2 },
  themeWrap: { alignItems: 'center', gap: 5, width: 56 },
  themeSwatch: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  themeSwatchOn: { borderColor: OW.dark },
  themeName: { fontFamily: Font.medium, fontSize: 11, color: OW.muted },
  themeNameOn: { color: OW.ink },
});
