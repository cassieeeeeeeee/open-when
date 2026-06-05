import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeftIcon, PlayIcon, PlusIcon } from '@/components/openwhen/icons';
import { Font, OW, Radius, type Tone, TONES } from '@/constants/openwhen';

type MediaType = 'photo' | 'video' | 'playlist' | 'text';

const META: Record<MediaType, { heading: string; cta: string; tone: Tone }> = {
  photo: { heading: 'Photos', cta: 'Upload more photos', tone: 'sage' },
  video: { heading: 'Videos', cta: 'Upload more videos', tone: 'blue' },
  playlist: { heading: 'Playlist', cta: 'Add more songs', tone: 'peach' },
  text: { heading: 'Note', cta: 'Edit note', tone: 'lilac' },
};

// Full view of one media type inside a memory/capsule. Media here is placeholder
// for now — it becomes real once cloud storage (Blaze) is enabled.
export default function MediaScreen() {
  const { type, title, preview } = useLocalSearchParams<{
    type?: string;
    title?: string;
    preview?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const mtype: MediaType = (['photo', 'video', 'playlist', 'text'] as const).includes(
    type as MediaType
  )
    ? (type as MediaType)
    : 'photo';
  const meta = META[mtype];
  const t = TONES[meta.tone];

  const songs = (preview ?? '')
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean);

  const onUpload = () =>
    Alert.alert('Coming soon', 'This will be enabled once cloud storage is turned on.');

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeftIcon size={22} color={OW.ink2} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title || meta.heading}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}>
        {mtype === 'photo' ? (
          <View style={styles.grid}>
            {Array.from({ length: 9 }).map((_, i) => (
              <LinearGradient
                key={i}
                colors={[t.color, t.soft]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.photo}
              />
            ))}
          </View>
        ) : mtype === 'video' ? (
          <View style={styles.videoList}>
            {Array.from({ length: 3 }).map((_, i) => (
              <LinearGradient
                key={i}
                colors={[t.color, t.soft]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.video}>
                <View style={styles.play}>
                  <PlayIcon size={18} color={OW.dark} />
                </View>
              </LinearGradient>
            ))}
          </View>
        ) : mtype === 'playlist' ? (
          <View>
            {(songs.length ? songs : ['Song one', 'Song two', 'Song three']).map((s, i) => (
              <View key={i} style={styles.song}>
                <LinearGradient
                  colors={[t.color, t.soft]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cover}
                />
                <Text style={styles.songName} numberOfLines={1}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.note}>{preview || 'Your note will appear here.'}</Text>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={[styles.uploadBtn, { borderColor: t.color }]} onPress={onUpload}>
          <PlusIcon size={16} color={t.color} />
          <Text style={[styles.uploadText, { color: t.color }]}>{meta.cta}</Text>
        </Pressable>
      </View>
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
  title: { fontFamily: Font.bold, fontSize: 16, color: OW.ink, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  content: { paddingTop: 8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: '31%', aspectRatio: 1, borderRadius: 12 },

  videoList: { gap: 12 },
  video: { height: 180, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  play: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  song: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: OW.line,
  },
  cover: { width: 48, height: 48, borderRadius: 8 },
  songName: { flex: 1, fontFamily: Font.semibold, fontSize: 14, color: OW.ink },

  note: {
    fontFamily: Font.regular,
    fontSize: 15,
    lineHeight: 23,
    color: OW.ink,
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: Radius.md,
    padding: 14,
  },

  footer: { paddingTop: 10, borderTopWidth: 1, borderTopColor: OW.line, backgroundColor: OW.bg },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderRadius: Radius.pill,
    paddingVertical: 13,
  },
  uploadText: { fontFamily: Font.bold, fontSize: 14.5 },
});
