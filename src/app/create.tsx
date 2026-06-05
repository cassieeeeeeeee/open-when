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
  PencilIcon,
  VideoIcon,
} from '@/components/openwhen/icons';
import { DateField } from '@/components/openwhen/DateField';
import { Font, OW, Radius, Tone, TONES } from '@/constants/openwhen';
import { createCapsule } from '@/lib/capsules';
import { findRecipient, type Recipient } from '@/lib/users';

const MSG_TYPES: { key: string; label: string; tone: Tone; Icon: typeof PencilIcon }[] = [
  { key: 'write', label: 'Write', tone: 'lilac', Icon: PencilIcon },
  { key: 'voice', label: 'Voice', tone: 'peach', Icon: MicIcon },
  { key: 'video', label: 'Video', tone: 'blue', Icon: VideoIcon },
  { key: 'photo', label: 'Photo', tone: 'blue', Icon: ImageIcon },
];

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = useState('Open on your wedding day');
  const [note, setNote] = useState("I can't wait to see the amazing life you're going to build.");
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [lookup, setLookup] = useState<'idle' | 'searching' | 'notfound'>('idle');
  const [saving, setSaving] = useState(false);
  const [unlockDate, setUnlockDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  });

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
    // If they typed someone but didn't tap Find, try to resolve it now.
    let to = recipient;
    if (!to && recipientQuery.trim()) {
      try {
        to = await findRecipient(recipientQuery);
      } catch {
        to = null;
      }
    }
    await createCapsule({
      title: title.trim() || 'Untitled capsule',
      who: to?.displayName || to?.username || recipientQuery.trim() || 'Someone special',
      date: unlockDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      tone: 'pink',
      recipientId: to?.uid,
      recipientUsername: to?.username,
      recipientEmail: to?.email,
      contents: note.trim() ? [{ type: 'text', label: 'A note', preview: note.trim() }] : undefined,
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

        <Text style={styles.label}>Add a message or memory</Text>
        <View style={styles.msgGrid}>
          {MSG_TYPES.map(({ key, label, tone, Icon }) => (
            <Pressable key={key} style={[styles.msgBtn, { backgroundColor: TONES[tone].soft }]}>
              <View style={styles.msgIcon}>
                <Icon size={14} color={TONES[tone].color} />
              </View>
              <Text style={styles.msgLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

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
