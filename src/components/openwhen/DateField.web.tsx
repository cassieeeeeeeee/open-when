import { StyleSheet, Text, View } from 'react-native';

import { Font, OW, Radius } from '@/constants/openwhen';
import { CalendarIcon } from './icons';

const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Web preview fallback (display only). The native build (DateField.tsx) uses the real picker.
export function DateField({ value }: { value: Date; onChange: (d: Date) => void }) {
  return (
    <View style={styles.row}>
      <CalendarIcon size={18} color={OW.muted} />
      <Text style={styles.text}>{fmt(value)}</Text>
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
    backgroundColor: OW.cardSoft,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  text: { fontFamily: Font.medium, fontSize: 14, color: OW.ink },
});
