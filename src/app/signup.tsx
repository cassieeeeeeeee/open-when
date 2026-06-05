import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/openwhen/ui';
import { Font, OW, Radius } from '@/constants/openwhen';
import { useAuth } from '@/lib/auth';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await signUp(name, email, password);
      // The auth gate redirects to Home once the account is created.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 48 }]}>
      <View style={styles.logoWrap}>
        <Logo size={34} />
      </View>
      <Text style={styles.tagline}>Start capturing what matters.</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={OW.muted}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={OW.muted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
        placeholderTextColor={OW.muted}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={[styles.btn, busy && styles.btnBusy]} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create account</Text>}
      </Pressable>

      <View style={styles.row}>
        <Text style={styles.muted}>Already have an account? </Text>
        <Link href="/login" style={styles.link}>
          Sign in
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: OW.bg, paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 8 },
  tagline: { fontFamily: Font.regular, fontSize: 15, color: OW.muted, textAlign: 'center', marginBottom: 28 },
  label: { fontFamily: Font.bold, fontSize: 12.5, color: OW.ink2, marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: OW.inputLine,
    borderRadius: Radius.md,
    backgroundColor: OW.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Font.medium,
    fontSize: 15,
    color: OW.ink,
  },
  error: { fontFamily: Font.medium, fontSize: 13, color: '#c0504d', marginTop: 12 },
  btn: {
    backgroundColor: OW.dark,
    borderRadius: Radius.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  btnBusy: { opacity: 0.7 },
  btnText: { fontFamily: Font.bold, fontSize: 15, color: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  muted: { fontFamily: Font.regular, fontSize: 14, color: OW.muted },
  link: { fontFamily: Font.bold, fontSize: 14, color: OW.dark },
});
