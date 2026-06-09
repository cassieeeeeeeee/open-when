import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BigEnvelope,
  CloseIcon,
  HeartIcon,
  ImageIcon,
  MicIcon,
  MusicIcon,
  PencilIcon,
  VideoIcon,
} from '@/components/openwhen/icons';
import { DateField } from '@/components/openwhen/DateField';
import { CAPSULE_THEMES } from '@/constants/capsuleThemes';
import { Font, OW, Radius, Tone, TONES } from '@/constants/openwhen';
import { type CapsuleContent, people } from '@/data/sample';
import { createCapsule } from '@/lib/capsules';
import { findRecipient, type Recipient } from '@/lib/users';

const MSG_TYPES: { type: CapsuleContent['type']; label: string; tone: Tone; Icon: typeof PencilIcon }[] = [
  { type: 'photo', label: 'Photo', tone: 'blue', Icon: ImageIcon },
  { type: 'text', label: 'Text', tone: 'lilac', Icon: PencilIcon },
  { type: 'audio', label: 'Voice', tone: 'peach', Icon: MicIcon },
  { type: 'playlist', label: 'Playlist', tone: 'pink', Icon: MusicIcon },
  { type: 'video', label: 'Video', tone: 'blue', Icon: VideoIcon },
];

// What a freshly added block starts as — details get filled in later in the workdesk.
const BLOCK_DEFAULTS: Record<CapsuleContent['type'], Omit<CapsuleContent, 'type'>> = {
  photo: { label: 'Photos', format: 'polaroid', count: 4, images: [0, 1, 2, 3] },
  text: { label: 'A message' },
  audio: { label: 'A voice note' },
  playlist: { label: 'A playlist' },
  video: { label: 'A video' },
};

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = useState('Open on your wedding day');
  const [note, setNote] = useState("I can't wait to see the amazing life you're going to build.");
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [lookup, setLookup] = useState<'idle' | 'searching' | 'notfound'>('idle');
  const [themeId, setThemeId] = useState('twilight');
  const [saving, setSaving] = useState(false);
  const [unlockDate, setUnlockDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  });
  const [blocks, setBlocks] = useState<CapsuleContent[]>([]);
  const addBlock = (type: CapsuleContent['type']) => setBlocks((b) => [...b, { type, ...BLOCK_DEFAULTS[type] }]);
  const removeBlock = (i: number) => setBlocks((b) => b.filter((_, k) => k !== i));

  const resolveRecipient = async () => {
    const q = recipientQuery.trim();
    if (!q) return;
    setLookup('searching');
    try {
      const found = await findRecipient(q);
      if (found) {
        setRecipient(found);
        setLookup('idle');
      } else {
        setLookup('notfound');
      }
    } catch {
      setLookup('notfound');
    }
  };

  const clearRecipient = () => {
    setRecipient(null);
    setRecipientQuery('');
    setLookup('idle');
  };

  const create = async () => {
    if (saving) return;
    setSaving(true);
    let to = recipient;
    if (!to && recipientQuery.trim()) {
      try {
        to = await findRecipient(recipientQuery);
      } catch {
        to = null;
      }
    }
    const noteBlock: CapsuleContent[] = note.trim() ? [{ type: 'text', label: 'A note', preview: note.trim() }] : [];
    const contents = [...noteBlock, ...blocks];
    await createCapsule({
      title: title.trim() || 'Untitled capsule',
      who: to?.displayName || to?.username || recipientQuery.trim() || 'Someone special',
      date: unlockDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      tone: 'pink',
      theme: themeId,
      recipientId: to?.uid,
      recipientUsername: to?.username,
      recipientEmail: to?.email,
      contents: contents.length ? contents : undefined,
    });
    router.back();
  };

  const initial = (recipient?.displayName || recipient?.username || '?').charAt(0).toUpperCase();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 4 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <CloseIcon size={20} color={OW.ink2} />
        </Pressable>
        <Text style={styles.title}>Create a Capsule</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.envWrap}>
          <BigEnvelope size={120} color={OW.pink} soft={OW.pinkSoft} />
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Open when…"
          placeholderTextColor={OW.muted}
        />

        <Text style={styles.label}>Send to</Text>
        {recipient ? (
          <View style={styles.found}>
            <View style={styles.foundAvatar}>
              <Text style={styles.foundInitial}>{initial}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.foundName} numberOfLines={1}>
                {recipient.displayName || recipient.username || recipient.email}
              </Text>
              {recipient.username ? (
                <Text style={styles.foundHandle} numberOfLines={1}>
                  @{recipient.username}
                </Text>
              ) : null}
            </View>
            <Pressable onPress={clearRecipient} hitSlop={8} accessibilityLabel="Clear recipient">
              <CloseIcon size={16} color={OW.muted} />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.searchRow}>
              <TextInput
                style={[styles.input, styles.flex]}
                value={recipientQuery}
                onChangeText={(t) => {
                  setRecipientQuery(t);
                  if (lookup === 'notfound') setLookup('idle');
                }}
                placeholder="@username or email"
                placeholderTextColor={OW.muted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onSubmitEditing={resolveRecipient}
                returnKeyType="search"
              />
              <Pressable style={styles.findBtn} onPress={resolveRecipient} disabled={lookup === 'searching'}>
                <Text style={styles.findText}>{lookup === 'searching' ? '…' : 'Find'}</Text>
              </Pressable>
            </View>
            {people.some((p) => p.username) ? (
              <View style={styles.suggestRow}>
                {people
                  .filter((p) => p.username)
                  .map((p) => (
                    <Pressable
                      key={p.id}
                      style={styles.suggestChip}
                      onPress={() => {
                        setRecipient({ uid: p.id, username: p.username, email: p.email, displayName: p.name });
                        setLookup('idle');
                      }}
                      accessibilityLabel={`Send to ${p.name}`}>
                      <View style={[styles.suggestAvatar, { backgroundColor: p.from }]}>
                        <Text style={styles.suggestInitial}>{p.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.suggestName}>{p.name}</Text>
                    </Pressable>
                  ))}
              </View>
            ) : null}
            {lookup === 'notfound' ? (
              <Text style={styles.notFound}>
                No account found. Check the spelling — or they may not be on Open When yet.
              </Text>
            ) : (
              <Text style={styles.hint}>Find someone by their @username or email.</Text>
            )}
          </>
        )}

        <Text style={styles.label}>Unlock on</Text>
        <DateField value={unlockDate} onChange={setUnlockDate} />

        <Text style={styles.label}>How it opens</Text>
        <Text style={styles.hint}>Pick the theme they&apos;ll see when the capsule unlocks.</Text>
        <View style={styles.themesRow}>
          {CAPSULE_THEMES.map((th) => {
            const on = themeId === th.id;
            return (
              <Pressable key={th.id} onPress={() => setThemeId(th.id)} style={styles.themeWrap}>
                <LinearGradient
                  colors={th.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.themeSwatch, on && styles.themeSwatchOn]}
                />
                <Text style={[styles.themeName, on && styles.themeNameOn]}>{th.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>What&apos;s inside</Text>
        <Text style={styles.hint}>Tap to add a piece — fill in the details in the workdesk after.</Text>
        <View style={styles.msgGrid}>
          {MSG_TYPES.map(({ type, label, tone, Icon }) => (
            <Pressable
              key={type}
              style={[styles.msgBtn, { backgroundColor: TONES[tone].soft }]}
              onPress={() => addBlock(type)}
              accessibilityLabel={`Add ${label}`}>
              <View style={styles.msgIcon}>
                <Icon size={14} color={TONES[tone].color} />
              </View>
              <Text style={styles.msgLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {blocks.length ? (
          <View style={styles.blockList}>
            {blocks.map((b, i) => (
              <View key={i} style={styles.blockRow}>
                <Text style={styles.blockLabel}>{b.label}</Text>
                <Pressable onPress={() => removeBlock(i)} hitSlop={8} accessibilityLabel={`Remove ${b.label}`}>
                  <CloseIcon size={14} color={OW.muted} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.label}>Add a note (optional)</Text>
        <TextInput
          style={[styles.input, styles.noteArea]}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Pressable
          style={[styles.createBtn, saving && styles.createBtnBusy]}
          onPress={create}
          disabled={saving}>
          <Text style={styles.createText}>{saving ? 'Creating…' : 'Create Capsule'}</Text>
          <HeartIcon size={14} color="#fff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: OW.bg, paddingHorizontal: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  title: { fontFamily: Font.bold, fontSize: 17, color: OW.ink },
  content: { paddingTop: 4 },
  envWrap: { alignItems: 'center', marginVertical: 14 },

  label: { fontFamily: Font.bold, fontSize: 12.5, color: OW.ink2, marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: OW.inputLine,
    borderRadius: Radius.md,
    backgroundColor: OW.cardSoft,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: Font.medium,
    fontSize: 14,
    color: OW.ink,
  },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  findBtn: {
    backgroundColor: OW.dark,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 58,
  },
  findText: { fontFamily: Font.bold, fontSize: 14, color: '#fff' },
  hint: { fontFamily: Font.regular, fontSize: 12, color: OW.muted, marginTop: 6 },
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  suggestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 13,
    borderRadius: 20,
    backgroundColor: OW.pinkSoft,
    borderWidth: 1,
    borderColor: OW.pink,
  },
  suggestAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  suggestInitial: { fontFamily: Font.bold, fontSize: 12, color: '#fff' },
  suggestName: { fontFamily: Font.medium, fontSize: 13, color: OW.ink },
  blockList: { gap: 7, marginTop: 10 },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  blockLabel: { fontFamily: Font.medium, fontSize: 13, color: OW.ink },
  notFound: { fontFamily: Font.medium, fontSize: 12.5, color: '#c0504d', marginTop: 6 },

  found: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: OW.pinkSoft,
    borderWidth: 1,
    borderColor: OW.pink,
    borderRadius: Radius.md,
    padding: 10,
  },
  foundAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: OW.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foundInitial: { fontFamily: Font.bold, fontSize: 15, color: '#fff' },
  foundName: { fontFamily: Font.bold, fontSize: 14, color: OW.ink },
  foundHandle: { fontFamily: Font.regular, fontSize: 12, color: OW.muted, marginTop: 1 },

  themesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 2 },
  themeWrap: { alignItems: 'center', gap: 5, width: 56 },
  themeSwatch: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  themeSwatchOn: { borderColor: OW.dark },
  themeName: { fontFamily: Font.medium, fontSize: 11, color: OW.muted },
  themeNameOn: { color: OW.ink },

  msgGrid: { flexDirection: 'row', gap: 8 },
  msgBtn: { flex: 1, borderRadius: 13, paddingVertical: 11, alignItems: 'center', gap: 5 },
  msgIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgLabel: { fontFamily: Font.bold, fontSize: 11.5, color: OW.ink2 },

  noteArea: { minHeight: 64, textAlignVertical: 'top', fontFamily: Font.regular, fontStyle: 'italic' },

  createBtn: {
    backgroundColor: OW.dark,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  createBtnBusy: { opacity: 0.7 },
  createText: { fontFamily: Font.bold, fontSize: 15, color: '#fff' },
});
