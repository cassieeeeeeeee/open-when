import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { EyeIcon, EyeOffIcon } from '@/components/openwhen/icons';
import { Font, OW, Radius } from '@/constants/openwhen';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

/** A password input with a show/hide eye toggle, styled to match the app's text fields. */
export function PasswordField({ value, onChangeText, placeholder }: Props) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={OW.muted}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        onPress={() => setShow((s) => !s)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOffIcon size={20} color={OW.muted} /> : <EyeIcon size={20} color={OW.muted} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: OW.inputLine,
    borderRadius: Radius.md,
    backgroundColor: OW.card,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: Font.medium,
    fontSize: 15,
    color: OW.ink,
  },
});
