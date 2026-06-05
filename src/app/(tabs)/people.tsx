import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlusIcon } from '@/components/openwhen/icons';
import { PersonRow, Pill } from '@/components/openwhen/ui';
import { Font, OW } from '@/constants/openwhen';
import { messagesByPerson, people } from '@/data/sample';

const FILTERS = ['All', 'Best Friends', 'Family', 'Partner'];

export default function PeopleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState('Best Friends');

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>People</Text>
        <Pressable onPress={() => router.push('/create')} hitSlop={8}>
          <PlusIcon size={20} color={OW.ink2} />
        </Pressable>
      </View>

      <View style={styles.pills}>
        {FILTERS.map((f) => (
          <Pill key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {people.map((p, i) => {
          const msgs = messagesByPerson[p.id];
          const last = msgs?.[msgs.length - 1];
          return (
            <View key={p.id}>
              <PersonRow
                name={p.name}
                preview={last?.text}
                time={last?.time}
                from={p.from}
                to={p.to}
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: p.id } })}
              />
              {i < people.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
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
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 12 },
  listScroll: { flex: 1 },
  list: { paddingBottom: 24 },
  divider: { borderTopWidth: 1, borderTopColor: OW.line },
});
