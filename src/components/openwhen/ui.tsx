/**
 * Reusable UI pieces ported from the mockup's repeated markup. Built once here and
 * shared across screens (EnvelopeCard appears on both Home and the Capsules list, etc.).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ComponentType, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Font, OW, Radius, Tone, TONES } from '@/constants/openwhen';
import { type CapsuleContent } from '@/data/sample';
import {
  ChevronDownIcon,
  CloseIcon,
  EnvelopeGlyph,
  GradientAvatar,
  GradientThumb,
  HeartIcon,
  IconProps,
  ImageIcon,
  LockIcon,
  MicIcon,
  MusicIcon,
  PencilIcon,
  PlayIcon,
  SearchIcon,
  VideoIcon,
} from './icons';

/** The "Open When ♥" wordmark in the script font. */
export function Logo({ size = 25 }: { size?: number }) {
  return (
    <View style={styles.logoRow}>
      <Text style={[styles.logoText, { fontSize: size }]}>Open When</Text>
      <HeartIcon size={size * 0.62} color={OW.rose} />
    </View>
  );
}

/** Small uppercase-ish section heading (e.g. "Upcoming Capsules"). */
export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

/** A colored quick-action tile from the Home grid. */
export function ActionTile({
  tone,
  label,
  subtitle,
  icon: Icon,
  onPress,
}: {
  tone: Tone;
  label: string;
  subtitle?: string;
  icon: ComponentType<IconProps>;
  onPress?: () => void;
}) {
  const t = TONES[tone];
  return (
    <Pressable style={[styles.tile, { backgroundColor: t.soft }]} onPress={onPress}>
      <View style={styles.tileIcon}>
        <Icon size={18} color={t.color} />
      </View>
      <View>
        <Text style={styles.tileLabel}>{label}</Text>
        {subtitle ? <Text style={styles.tileSub}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

/** A capsule row card: envelope glyph + title/recipient/date + optional padlock. */
export function EnvelopeCard({
  tone,
  title,
  who,
  date,
  locked,
  received,
  onPress,
}: {
  tone: Tone;
  title: string;
  who: string;
  date: string;
  locked?: boolean;
  received?: boolean; // sent to the user ("From") vs created by them ("For")
  onPress?: () => void;
}) {
  const t = TONES[tone];
  return (
    <Pressable style={styles.envCard} onPress={onPress}>
      <EnvelopeGlyph size={42} color={t.color} soft={t.soft} />
      <View style={styles.flex}>
        <Text style={styles.envTitle}>{title}</Text>
        <Text style={styles.envSub}>
          {received ? 'From' : 'For'}: {who}
        </Text>
        <Text style={styles.envSub}>{date}</Text>
      </View>
      {locked ? <LockIcon size={16} color={OW.muted} /> : null}
    </Pressable>
  );
}

/** "Continue where you left off" card with a progress bar. */
export function ContinueCard({
  title,
  date,
  progress,
  progressLabel,
  onPress,
}: {
  title: string;
  date: string;
  progress: number; // 0..1
  progressLabel: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.contCard} onPress={onPress}>
      <GradientThumb width={46} height={46} radius={11} />
      <View style={styles.flex}>
        <Text style={styles.envTitle}>{title}</Text>
        <Text style={[styles.envSub, { marginBottom: 6 }]}>{date}</Text>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <Text style={[styles.envSub, { marginTop: 4 }]}>{progressLabel}</Text>
      </View>
    </Pressable>
  );
}

/** A rounded filter pill (People screen). */
export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

/** A person/circle row on the People screen. */
export function PersonRow({
  name,
  preview,
  time,
  from,
  to,
  onPress,
}: {
  name: string;
  preview?: string; // most recent message
  time?: string; // when it was sent
  from: string;
  to: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.person} onPress={onPress}>
      <GradientAvatar size={46} from={from} to={to} />
      <View style={styles.flex}>
        <Text style={styles.personName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.personPreview} numberOfLines={1}>
          {preview ?? 'Start the conversation'}
        </Text>
      </View>
      {time ? <Text style={styles.personTime}>{time}</Text> : null}
    </Pressable>
  );
}

/** A memory tile: a gradient cover + title + date·photos (used on Home and the Memories tab). */
export function MemoryCard({
  title,
  date,
  photos,
  from,
  to,
  onPress,
  full,
}: {
  title: string;
  date: string;
  photos?: number;
  from: string;
  to: string;
  onPress?: () => void;
  full?: boolean; // full-width row (Memories tab) vs 48% tile (Home peek)
}) {
  return (
    <Pressable style={full ? styles.memCardFull : styles.memCard} onPress={onPress}>
      <LinearGradient
        colors={[from, to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={full ? styles.memCoverFull : styles.memCover}
      />
      <Text style={styles.memTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.memMeta}>{photos != null ? `${date} · ${photos} photos` : date}</Text>
    </Pressable>
  );
}

/** Search field used on the Memories and Capsules tabs. */
export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.searchBar}>
      <SearchIcon size={16} color={OW.muted} />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Search'}
        placeholderTextColor={OW.muted}
        autoCorrect={false}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <CloseIcon size={16} color={OW.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const CONTENT_ICON: Record<CapsuleContent['type'], ComponentType<IconProps>> = {
  text: PencilIcon,
  photo: ImageIcon,
  video: VideoIcon,
  audio: MicIcon,
  playlist: MusicIcon,
};

/** A capsule/memory content item that expands to a small preview when tapped.
 *  Tapping the open preview opens the full media view; pass onDelete to show a remove button. */
export function ContentItemRow({
  item,
  tone = 'sage',
  onDelete,
}: {
  item: CapsuleContent;
  tone?: Tone;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const Icon = CONTENT_ICON[item.type];
  const t = TONES[tone];

  const openFull = () =>
    router.push({
      pathname: '/media/[type]',
      params: { type: item.type, title: item.label, preview: item.preview ?? '' },
    });

  const viewAllLabel =
    item.type === 'photo'
      ? 'See all photos'
      : item.type === 'video'
        ? 'See all videos'
        : item.type === 'playlist'
          ? 'See full playlist'
          : 'Open note';

  return (
    <View style={styles.ciWrap}>
      <Pressable style={styles.ciRow} onPress={() => setOpen((o) => !o)}>
        <View style={styles.ciIcon}>
          <Icon size={16} color={OW.ink2} />
        </View>
        <Text style={styles.ciText}>{item.label}</Text>
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={8} accessibilityLabel="Remove item" style={styles.ciDelete}>
            <CloseIcon size={15} color={OW.muted} />
          </Pressable>
        ) : null}
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <ChevronDownIcon size={16} color={OW.muted} />
        </View>
      </Pressable>

      {open ? (
        <Pressable style={styles.ciPreview} onPress={openFull}>
          {item.type === 'photo' ? (
            <View style={styles.ciPhotos}>
              {[0, 1, 2, 3].map((i) => (
                <GradientThumb key={i} width={56} height={56} radius={10} from={t.color} to={t.soft} />
              ))}
            </View>
          ) : item.type === 'video' ? (
            <LinearGradient
              colors={[t.color, t.soft]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ciVideo}>
              <View style={styles.ciPlay}>
                <PlayIcon size={16} color={OW.dark} />
              </View>
            </LinearGradient>
          ) : item.type === 'playlist' ? (
            <View>
              <View style={styles.ciCovers}>
                {[0, 1, 2, 3].map((i) => (
                  <GradientThumb key={i} width={48} height={48} radius={8} from={t.color} to={t.soft} />
                ))}
              </View>
              <Text style={styles.ciPreviewText}>{item.preview ?? 'A few songs saved here.'}</Text>
            </View>
          ) : (
            <Text style={styles.ciPreviewText}>{item.preview ?? 'A note saved inside.'}</Text>
          )}
          <View style={styles.ciViewAll}>
            <Text style={styles.ciViewAllText}>{viewAllLabel} →</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  logoText: { fontFamily: Font.script, color: OW.ink },

  sectionLabel: {
    fontFamily: Font.bold,
    fontSize: 13,
    color: OW.ink2,
    marginTop: 18,
    marginBottom: 9,
  },

  tile: {
    width: '48%',
    minHeight: 104,
    borderRadius: Radius.xl,
    padding: 14,
    justifyContent: 'space-between',
  },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontFamily: Font.bold, fontSize: 15, color: OW.ink },
  tileSub: { fontFamily: Font.regular, fontSize: 11.5, color: OW.muted, marginTop: 2 },

  envCard: {
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  envTitle: { fontFamily: Font.bold, fontSize: 14.5, color: OW.ink, lineHeight: 18 },
  envSub: { fontFamily: Font.regular, fontSize: 12, color: OW.muted, marginTop: 2 },

  contCard: {
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: Radius.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  bar: { height: 5, backgroundColor: OW.track, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: OW.sage, borderRadius: 5 },

  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f1ece2',
  },
  pillActive: { backgroundColor: OW.dark },
  pillText: { fontFamily: Font.bold, fontSize: 13, color: OW.ink2 },
  pillTextActive: { color: '#fff' },

  person: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  personName: { fontFamily: Font.bold, fontSize: 15, color: OW.ink },
  personPreview: { fontFamily: Font.regular, fontSize: 13, color: OW.muted, marginTop: 3 },
  personTime: {
    fontFamily: Font.regular,
    fontSize: 11.5,
    color: OW.muted,
    alignSelf: 'flex-start',
    marginTop: 2,
  },

  memCard: { width: '48%' },
  memCardFull: { width: '100%', marginBottom: 16 },
  memCover: { width: '100%', height: 92, borderRadius: 14 },
  memCoverFull: { width: '100%', height: 150, borderRadius: 16 },
  memTitle: { fontFamily: Font.bold, fontSize: 13.5, color: OW.ink, marginTop: 8 },
  memMeta: { fontFamily: Font.regular, fontSize: 11.5, color: OW.muted, marginTop: 2 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: { flex: 1, fontFamily: Font.medium, fontSize: 14, color: OW.ink, padding: 0 },

  ciWrap: { marginBottom: 8 },
  ciRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: Radius.md,
    padding: 12,
  },
  ciIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: OW.card,
    borderWidth: 1,
    borderColor: OW.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ciText: { flex: 1, fontFamily: Font.semibold, fontSize: 14, color: OW.ink },
  ciPreview: {
    backgroundColor: OW.card,
    borderWidth: 1,
    borderColor: OW.line,
    borderRadius: Radius.md,
    padding: 12,
    marginTop: 6,
  },
  ciPreviewText: {
    fontFamily: Font.regular,
    fontSize: 13,
    color: OW.ink2,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  ciPhotos: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  ciVideo: { height: 120, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ciPlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ciDelete: { padding: 4 },
  ciCovers: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  ciViewAll: { marginTop: 10, alignItems: 'flex-end' },
  ciViewAllText: { fontFamily: Font.semibold, fontSize: 12.5, color: OW.dark },
});
