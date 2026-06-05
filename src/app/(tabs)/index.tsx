import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronRightIcon, GradientAvatar } from '@/components/openwhen/icons';
import {
  ContinueCard,
  EnvelopeCard,
  Logo,
  MemoryCard,
  SectionLabel,
} from '@/components/openwhen/ui';
import { Font, OW, Radius } from '@/constants/openwhen';
import { USER } from '@/data/sample';
import { useMyCapsules } from '@/lib/capsules';
import { useMyMemories } from '@/lib/memories';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { capsules: myCreated } = useMyCapsules();
  const upcoming = myCreated.filter((c) => c.status === 'sealed').slice(0, 2);
  const { memories: myMemories } = useMyMemories();
  const recentMemories = myMemories.slice(0, 2);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Logo size={26} />
        <Pressable onPress={() => router.push('/profile')} hitSlop={8} accessibilityLabel="Open profile">
          <GradientAvatar size={34} />
        </Pressable>
      </View>

      <Text style={styles.greet}>
        {greeting()}, {USER.name} 🌿
      </Text>
      <Text style={styles.sub}>What memory will you capture today?</Text>

      <SectionLabel>Continue where you left off</SectionLabel>
      <ContinueCard
        title="Road trip with Jess"
        date="May 4, 2024"
        progress={0.6}
        progressLabel="3/5 prompts"
        onPress={() => router.push({ pathname: '/memory/[id]', params: { id: 'm1' } })}
      />

      {upcoming.length > 0 ? (
        <>
          <SectionLabel>Upcoming Capsules</SectionLabel>
          {upcoming.map((c) => (
            <EnvelopeCard
              key={c.id}
              tone={c.tone}
              title={c.title}
              who={c.who}
              date={c.date}
              onPress={() => router.push({ pathname: '/edit-capsule/[id]', params: { id: c.id } })}
            />
          ))}
        </>
      ) : null}

      {recentMemories.length > 0 ? (
        <>
          <SectionLabel>Recent Memories</SectionLabel>
          <View style={styles.memGrid}>
            {recentMemories.map((m) => (
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
        </>
      ) : null}

      <Pressable style={styles.wrapped} onPress={() => router.push('/wrapped')}>
        <LinearGradient
          colors={['#8d9d7e', '#6f7e62']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.wrappedGrad}>
          <View style={styles.wrappedText}>
            <Text style={styles.wrappedTitle}>Your 2024 Wrapped ✨</Text>
            <Text style={styles.wrappedSub}>Relive your year in memories</Text>
          </View>
          <ChevronRightIcon size={20} color="#fff" />
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: OW.bg },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  greet: { fontFamily: Font.extrabold, fontSize: 22, color: OW.ink, letterSpacing: -0.2 },
  sub: { fontFamily: Font.regular, fontSize: 14, color: OW.muted, marginTop: 2 },
  memGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  wrapped: { marginTop: 18, borderRadius: Radius.lg, overflow: 'hidden' },
  wrappedGrad: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  wrappedText: { flex: 1 },
  wrappedTitle: { fontFamily: Font.bold, fontSize: 15, color: '#fff' },
  wrappedSub: {
    fontFamily: Font.regular,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
});
