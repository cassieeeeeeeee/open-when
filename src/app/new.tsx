import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronRightIcon, CloseIcon, EnvelopeTabIcon, ImageIcon } from '@/components/openwhen/icons';
import { Font, OW, Radius, TONES } from '@/constants/openwhen';

// The "+" chooser. Opened from the center tab button; it sends you into the
// Memory or Capsule composer. Natural home for the future "templates" step.
export default function NewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 4 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <CloseIcon size={20} color={OW.ink2} />
        </Pressable>
        <Text style={styles.title}>Create</Text>
        <View style={styles.spacer} />
      </View>

      <Text style={styles.prompt}>What would you like to create?</Text>

      <Pressable
        style={[styles.card, { backgroundColor: TONES.sage.soft }]}
        onPress={() => router.replace('/memory')}>
        <View style={styles.iconWrap}>
          <ImageIcon size={22} color={TONES.sage.color} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>New Memory</Text>
          <Text style={styles.cardDesc}>A scrapbook of a moment — no unlock, just keep it.</Text>
        </View>
        <ChevronRightIcon size={20} color={TONES.sage.color} />
      </Pressable>

      <Pressable
        style={[styles.card, { backgroundColor: TONES.pink.soft }]}
        onPress={() => router.replace('/create')}>
        <View style={styles.iconWrap}>
          <EnvelopeTabIcon size={22} color={TONES.pink.color} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>New Capsule</Text>
          <Text style={styles.cardDesc}>A message that unlocks for someone later.</Text>
        </View>
        <ChevronRightIcon size={20} color={TONES.pink.color} />
      </Pressable>
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
  spacer: { width: 20 },
  prompt: {
    fontFamily: Font.regular,
    fontSize: 14,
    color: OW.muted,
    marginTop: 4,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { fontFamily: Font.bold, fontSize: 16, color: OW.ink },
  cardDesc: { fontFamily: Font.regular, fontSize: 12.5, color: OW.ink2, marginTop: 2 },
});
