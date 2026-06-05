import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeftIcon, GradientAvatar } from '@/components/openwhen/icons';
import { Font, OW, Radius } from '@/constants/openwhen';
import { useAuth } from '@/lib/auth';
import { USER } from '@/data/sample';

const ROWS = ['Edit profile', 'Notifications', 'Privacy & security', 'Help'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Falls back to sample data when Firebase isn't configured / signed out.
  const name = user?.displayName || USER.name;
  const subtitle = user?.email || 'Capturing the moments that matter';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeftIcon size={22} color={OW.ink2} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <GradientAvatar size={64} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>{subtitle}</Text>
        </View>

        {ROWS.map((r) => (
          <Pressable key={r} style={styles.row}>
            <Text style={styles.rowText}>{r}</Text>
          </Pressable>
        ))}

        <Pressable style={styles.row} onPress={() => signOut()}>
          <Text style={[styles.rowText, styles.signOut]}>Sign out</Text>
        </Pressable>
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
  headerTitle: { fontFamily: Font.bold, fontSize: 17, color: OW.ink },
  spacer: { width: 22 },
  content: { paddingBottom: 24 },
  card: { alignItems: 'center', gap: 8, paddingVertical: 18 },
  name: { fontFamily: Font.bold, fontSize: 18, color: OW.ink },
  handle: { fontFamily: Font.regular, fontSize: 13, color: OW.muted },
  row: {
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 10,
  },
  rowText: { fontFamily: Font.semibold, fontSize: 14, color: OW.ink },
  signOut: { color: '#c0504d' },
});
