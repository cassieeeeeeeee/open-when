import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronLeftIcon,
  GradientAvatar,
  ImageIcon,
  MusicIcon,
  PencilIcon,
  PlusIcon,
  VideoIcon,
} from '@/components/openwhen/icons';
import { ContentItemRow } from '@/components/openwhen/ui';
import { Font, OW, type Tone, TONES } from '@/constants/openwhen';
import { findPerson, type Person } from '@/data/sample';
import { useMemory } from '@/lib/memories';

const ADD = [
  { key: 'text', label: 'Text', tone: 'lilac' as Tone, Icon: PencilIcon },
  { key: 'photos', label: 'Photos', tone: 'sage' as Tone, Icon: ImageIcon },
  { key: 'video', label: 'Video', tone: 'blue' as Tone, Icon: VideoIcon },
  { key: 'playlist', label: 'Playlist', tone: 'peach' as Tone, Icon: MusicIcon },
];

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { memory } = useMemory(id);
  const contents = memory?.contents ?? [];
  const collaborators = (memory?.collaborators ?? [])
    .map((pid) => findPerson(pid))
    .filter((p): p is Person => !!p);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[memory?.from ?? '#cdb38f', memory?.to ?? '#8a9b7c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cover, { paddingTop: insets.top + 6 }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
            <ChevronLeftIcon size={22} color="#fff" />
          </Pressable>
          <View>
            <Text style={styles.coverTitle} numberOfLines={2}>
              {memory?.title ?? 'Memory'}
            </Text>
            <Text style={styles.coverDate}>{memory?.date}</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.label}>In this memory</Text>
          <View style={styles.peopleRow}>
            <View style={styles.person}>
              <GradientAvatar size={40} />
              <Text style={styles.personName}>You</Text>
            </View>
            {collaborators.map((p) => (
              <View key={p.id} style={styles.person}>
                <GradientAvatar size={40} from={p.from} to={p.to} />
                <Text style={styles.personName}>{p.name}</Text>
              </View>
            ))}
            <Pressable style={styles.person}>
              <View style={styles.addPerson}>
                <PlusIcon size={18} color={OW.muted} />
              </View>
              <Text style={styles.personName}>Add</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>What&apos;s inside</Text>
          {contents.length > 0 ? (
            contents.map((c, i) => <ContentItemRow key={i} item={c} />)
          ) : (
            <Text style={styles.empty}>Nothing added yet.</Text>
          )}

          <Text style={styles.label}>Add to this memory</Text>
          <View style={styles.addGrid}>
            {ADD.map(({ key, label, tone, Icon }) => (
              <Pressable key={key} style={[styles.addBtn, { backgroundColor: TONES[tone].soft }]}>
                <View style={styles.addIcon}>
                  <Icon size={16} color={TONES[tone].color} />
                </View>
                <Text style={styles.addLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: OW.bg },
  cover: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    minHeight: 190,
    justifyContent: 'space-between',
  },
  back: { width: 36, height: 36, justifyContent: 'center' },
  coverTitle: { fontFamily: Font.script, fontSize: 30, color: '#fff' },
  coverDate: { fontFamily: Font.regular, fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  body: { paddingHorizontal: 18, paddingTop: 4 },
  label: { fontFamily: Font.bold, fontSize: 12.5, color: OW.ink2, marginTop: 18, marginBottom: 8 },

  peopleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  person: { alignItems: 'center', gap: 6, width: 56 },
  personName: { fontFamily: Font.medium, fontSize: 12, color: OW.ink2 },
  addPerson: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: OW.inputLine,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  contentIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: OW.card,
    borderWidth: 1,
    borderColor: OW.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentText: { fontFamily: Font.semibold, fontSize: 14, color: OW.ink },
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
});
