import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ComponentType } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronLeftIcon,
  Donut,
  GradientThumb,
  HeartIcon,
  IconProps,
  ImageIcon,
  MicIcon,
  PeopleIcon,
  UploadIcon,
} from '@/components/openwhen/icons';
import { Font, OW, Radius, TONES } from '@/constants/openwhen';
import { wrapped } from '@/data/sample';

const STAT_ICON: Record<string, ComponentType<IconProps>> = {
  memories: HeartIcon,
  prompts: PeopleIcon,
  voice: MicIcon,
  photos: ImageIcon,
};

export default function WrappedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeftIcon size={22} color={OW.ink2} />
        </Pressable>
        <Text style={styles.topTitle}>Wrapped</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#8d9d7e', '#6f7e62']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.flex}>
            <Text style={styles.heroYear}>Your {wrapped.year}</Text>
            <Text style={styles.heroWrapped}>Wrapped</Text>
            <Text style={styles.heroDesc}>A look back on your favorite moments together.</Text>
          </View>
          <View style={styles.polaroid}>
            <GradientThumb width={96} height={74} radius={2} from="#cc9c9c" to="#7a8a6a" />
          </View>
        </LinearGradient>

        <View style={styles.statGrid}>
          {wrapped.stats.map((s) => {
            const Icon = STAT_ICON[s.key];
            return (
              <View key={s.key} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: TONES[s.tone].soft }]}>
                  <Icon size={16} color={TONES[s.tone].color} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Top Moments</Text>
          {wrapped.moments.map((m, i) => (
            <Pressable
              key={m.id}
              onPress={() => router.push({ pathname: '/memory/[id]', params: { id: m.id } })}
              style={[styles.moment, i === wrapped.moments.length - 1 && styles.lastMoment]}>
              <GradientThumb width={34} height={34} radius={9} />
              <View>
                <Text style={styles.momentName}>{m.name}</Text>
                <Text style={styles.momentDate}>{m.date}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Most Common Vibes</Text>
          <View style={styles.vibes}>
            <Donut
              size={92}
              thickness={28}
              segments={wrapped.vibes.map((v) => ({ value: v.value, color: TONES[v.tone].color }))}
            />
            <View style={styles.flex}>
              {wrapped.vibes.map((v) => (
                <View key={v.label} style={styles.vibeRow}>
                  <View style={[styles.vibeDot, { backgroundColor: TONES[v.tone].color }]} />
                  <Text style={styles.vibeLabel}>{v.label}</Text>
                  <Text style={styles.vibePct}>{v.value}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Pressable>
          <LinearGradient
            colors={['#8d9d7e', '#6f7e62']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareBtn}>
            <UploadIcon size={15} color="#fff" />
            <Text style={styles.shareText}>Share Your Wrapped</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  spacer: { width: 22 },
  screen: { flex: 1, backgroundColor: OW.bg },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  topTitle: { fontFamily: Font.extrabold, fontSize: 18, color: OW.ink },
  content: { paddingHorizontal: 18, paddingTop: 6 },

  hero: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroYear: { fontFamily: Font.script, fontSize: 22, color: '#f4f1e8' },
  heroWrapped: { fontFamily: Font.script, fontSize: 30, color: '#f4f1e8', marginTop: -2 },
  heroDesc: { fontFamily: Font.regular, fontSize: 12.5, color: 'rgba(244,241,232,0.9)', marginTop: 8 },
  polaroid: {
    backgroundColor: '#fff',
    padding: 7,
    paddingBottom: 16,
    borderRadius: 4,
    transform: [{ rotate: '4deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 11,
    marginTop: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontFamily: Font.extrabold, fontSize: 22, color: OW.ink },
  statLabel: { fontFamily: Font.regular, fontSize: 11, color: OW.muted, marginTop: 2, textAlign: 'center' },

  box: {
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: 16,
    padding: 15,
    marginTop: 14,
  },
  boxTitle: { fontFamily: Font.bold, fontSize: 14, color: OW.ink, marginBottom: 12 },
  moment: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 11 },
  lastMoment: { marginBottom: 0 },
  momentName: { fontFamily: Font.semibold, fontSize: 13.5, color: OW.ink },
  momentDate: { fontFamily: Font.regular, fontSize: 12, color: OW.muted, marginTop: 1 },

  vibes: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  vibeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  vibeDot: { width: 9, height: 9, borderRadius: 5 },
  vibeLabel: { fontFamily: Font.medium, fontSize: 12.5, color: OW.ink2 },
  vibePct: { fontFamily: Font.semibold, fontSize: 12.5, color: OW.muted, marginLeft: 'auto' },

  shareBtn: {
    borderRadius: Radius.pill,
    paddingVertical: 14,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareText: { fontFamily: Font.bold, fontSize: 14, color: '#fff' },
});
