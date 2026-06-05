import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlusIcon } from '@/components/openwhen/icons';
import { EnvelopeCard, Pill, SearchBar, SectionLabel } from '@/components/openwhen/ui';
import { Font, OW } from '@/constants/openwhen';
import { type Capsule, capsules as sampleCapsules } from '@/data/sample';
import { useMyCapsules } from '@/lib/capsules';
import { SORT_OPTIONS, type SortMode, sortByMode } from '@/lib/sort';

export default function CapsulesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [box, setBox] = useState<'created' | 'received'>('created');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const { capsules: myCreated } = useMyCapsules();

  const inBox = useMemo(() => {
    const base =
      box === 'created' ? myCreated : sampleCapsules.filter((c) => c.direction === 'received');
    const q = query.trim().toLowerCase();
    return base.filter(
      (c) => !q || c.title.toLowerCase().includes(q) || c.who.toLowerCase().includes(q)
    );
  }, [box, query, myCreated]);

  const sealed = useMemo(
    () => sortByMode(inBox.filter((c) => c.status === 'sealed'), sort),
    [inBox, sort]
  );
  const unlocked = useMemo(
    () => sortByMode(inBox.filter((c) => c.status === 'unlocked'), sort),
    [inBox, sort]
  );

  const labels =
    box === 'created'
      ? { sealed: 'Sealed · you can still add', unlocked: 'Opened' }
      : { sealed: 'Waiting to unlock', unlocked: 'Unlocked' };

  const renderCard = (c: Capsule) => (
    <EnvelopeCard
      key={c.id}
      tone={c.tone}
      title={c.title}
      who={c.who}
      date={c.date}
      locked={c.locked}
      received={c.direction === 'received'}
      onPress={() =>
        router.push(
          c.direction === 'created'
            ? { pathname: '/edit-capsule/[id]', params: { id: c.id } }
            : { pathname: '/capsule/[id]', params: { id: c.id } }
        )
      }
    />
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Capsules</Text>
        <Pressable onPress={() => router.push('/create')} hitSlop={8}>
          <PlusIcon size={20} color={OW.ink2} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {(['created', 'received'] as const).map((b) => (
          <Pressable key={b} onPress={() => setBox(b)} style={styles.tabItem}>
            <Text style={[styles.tabText, box === b && styles.tabTextActive]}>
              {b === 'created' ? 'Created' : 'Received'}
            </Text>
            {box === b ? <View style={styles.tabUnderline} /> : null}
          </Pressable>
        ))}
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search capsules" />
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((o) => (
          <Pill key={o.key} label={o.label} active={sort === o.key} onPress={() => setSort(o.key)} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {sealed.length > 0 ? (
          <>
            <SectionLabel>{labels.sealed}</SectionLabel>
            {sealed.map(renderCard)}
          </>
        ) : null}
        {unlocked.length > 0 ? (
          <>
            <SectionLabel>{labels.unlocked}</SectionLabel>
            {unlocked.map(renderCard)}
          </>
        ) : null}
        {sealed.length === 0 && unlocked.length === 0 ? (
          <Text style={styles.empty}>
            {query ? `No capsules match “${query}”.` : 'Nothing here yet.'}
          </Text>
        ) : null}
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
    paddingVertical: 6,
  },
  title: { fontFamily: Font.extrabold, fontSize: 21, color: OW.ink },
  tabs: {
    flexDirection: 'row',
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: OW.line,
    marginTop: 6,
    marginBottom: 12,
  },
  tabItem: { paddingVertical: 9 },
  tabText: { fontFamily: Font.bold, fontSize: 14, color: OW.muted },
  tabTextActive: { color: OW.ink },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 2.5,
    backgroundColor: OW.dark,
    borderRadius: 3,
  },
  sortRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 4 },
  list: { paddingTop: 6, paddingBottom: 24 },
  empty: {
    fontFamily: Font.regular,
    fontSize: 14,
    color: OW.muted,
    textAlign: 'center',
    marginTop: 28,
  },
});
