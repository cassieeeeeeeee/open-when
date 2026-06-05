import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeftIcon, GradientAvatar } from '@/components/openwhen/icons';
import { EnvelopeCard, MemoryCard, SectionLabel } from '@/components/openwhen/ui';
import { Font, OW } from '@/constants/openwhen';
import { capsulesForPerson, findPerson, memoriesForPerson } from '@/data/sample';

// Profile of another person/group, reached by tapping the chat header.
// Shows the memories and capsules shared between them and the current user.
export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const person = id ? findPerson(id) : undefined;
  const mems = id ? memoriesForPerson(id) : [];
  const caps = id ? capsulesForPerson(id) : [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeftIcon size={22} color={OW.ink2} />
        </Pressable>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {person ? <GradientAvatar size={84} from={person.from} to={person.to} /> : null}
          <Text style={styles.name}>{person?.name ?? 'Person'}</Text>
          {person ? <Text style={styles.meta}>{person.meta}</Text> : null}
        </View>

        <SectionLabel>Memories together</SectionLabel>
        {mems.length > 0 ? (
          <View style={styles.grid}>
            {mems.map((m) => (
              <MemoryCard
                key={m.id}
                title={m.title}
                date={m.date}
                photos={m.photos}
                from={m.from}
                to={m.to}
                onPress={() => router.push({ pathname: '/memory/[id]', params: { id: m.id } })}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No shared memories yet.</Text>
        )}

        <SectionLabel>Capsules</SectionLabel>
        {caps.length > 0 ? (
          caps.map((c) => (
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
          ))
        ) : (
          <Text style={styles.empty}>No shared capsules yet.</Text>
        )}
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
  spacer: { width: 22 },
  content: { paddingBottom: 24 },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  name: { fontFamily: Font.extrabold, fontSize: 22, color: OW.ink },
  meta: { fontFamily: Font.regular, fontSize: 13, color: OW.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  empty: { fontFamily: Font.regular, fontSize: 13, color: OW.muted, marginBottom: 4 },
});
