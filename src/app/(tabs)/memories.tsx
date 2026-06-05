import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlusIcon } from '@/components/openwhen/icons';
import { MemoryCard, Pill, SearchBar } from '@/components/openwhen/ui';
import { Font, OW } from '@/constants/openwhen';
import { useMyMemories } from '@/lib/memories';
import { SORT_OPTIONS, type SortMode, sortByMode } from '@/lib/sort';

export default function MemoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const { memories } = useMyMemories();

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? memories.filter((m) => m.title.toLowerCase().includes(q)) : memories;
    return sortByMode(filtered, sort);
  }, [query, sort, memories]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Memories</Text>
        <Pressable onPress={() => router.push('/memory')} hitSlop={8}>
          <PlusIcon size={20} color={OW.ink2} />
        </Pressable>
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search memories" />
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((o) => (
          <Pill key={o.key} label={o.label} active={sort === o.key} onPress={() => setSort(o.key)} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {list.map((m) => (
          <MemoryCard
            key={m.id}
            full
            title={m.title}
            date={m.date}
            photos={m.photos}
            from={m.from}
            to={m.to}
            onPress={() => router.push({ pathname: '/memory/[id]', params: { id: m.id } })}
          />
        ))}
        {list.length === 0 ? (
          <Text style={styles.empty}>No memories match “{query}”.</Text>
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
  sortRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 4 },
  list: { paddingTop: 12, paddingBottom: 24 },
  empty: {
    fontFamily: Font.regular,
    fontSize: 14,
    color: OW.muted,
    textAlign: 'center',
    marginTop: 28,
  },
});
