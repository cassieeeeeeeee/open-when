import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeftIcon, GradientAvatar, SharePlaneIcon } from '@/components/openwhen/icons';
import { Font, OW } from '@/constants/openwhen';
import { type ChatMessage, findPerson, messagesByPerson } from '@/data/sample';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const person = id ? findPerson(id) : undefined;
  const [messages, setMessages] = useState<ChatMessage[]>(
    id && messagesByPerson[id] ? messagesByPerson[id] : []
  );
  const [draft, setDraft] = useState('');

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: `local-${prev.length}`, text, mine: true, time: 'now' }]);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeftIcon size={22} color={OW.ink2} />
        </Pressable>
        <Pressable
          style={styles.headerCenter}
          onPress={() => id && router.push({ pathname: '/person/[id]', params: { id } })}>
          {person ? <GradientAvatar size={30} from={person.from} to={person.to} /> : null}
          <Text style={styles.headerName}>{person?.name ?? 'Chat'}</Text>
        </Pressable>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}>
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubbleRow, m.mine ? styles.alignRight : styles.alignLeft]}>
            <View style={[styles.bubble, m.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={[styles.bubbleText, m.mine && styles.bubbleTextMine]}>{m.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={`Message ${person?.name ?? ''}…`}
          placeholderTextColor={OW.muted}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!draft.trim()}>
          <SharePlaneIcon size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: OW.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: OW.line,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerName: { fontFamily: Font.bold, fontSize: 16, color: OW.ink },
  spacer: { width: 22 },

  messages: { padding: 16, gap: 8 },
  bubbleRow: { flexDirection: 'row' },
  alignLeft: { justifyContent: 'flex-start' },
  alignRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', paddingVertical: 9, paddingHorizontal: 13, borderRadius: 16 },
  bubbleTheirs: {
    backgroundColor: OW.card,
    borderWidth: 1,
    borderColor: OW.line,
    borderBottomLeftRadius: 4,
  },
  bubbleMine: { backgroundColor: OW.sage, borderBottomRightRadius: 4 },
  bubbleText: { fontFamily: Font.regular, fontSize: 14, color: OW.ink, lineHeight: 19 },
  bubbleTextMine: { color: '#fff' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: OW.line,
    backgroundColor: OW.card,
  },
  input: {
    flex: 1,
    backgroundColor: OW.cardSoft,
    borderWidth: 1,
    borderColor: OW.inputLine,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontFamily: Font.regular,
    fontSize: 14,
    color: OW.ink,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: OW.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
