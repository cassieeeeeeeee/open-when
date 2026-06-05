import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Font, OW, Radius } from '@/constants/openwhen';
import { CalendarIcon } from './icons';

const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export function DateField({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const [show, setShow] = useState(false);
  return (
    <View>
      <Pressable style={styles.row} onPress={() => setShow((s) => !s)}>
        <CalendarIcon size={18} color={OW.muted} />
        <Text style={styles.text}>{fmt(value)}</Text>
      </Pressable>
      {show ? (
        <DateTimePicker
          value={value}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, d) => {
            if (Platform.OS !== 'ios') setShow(false);
            if (event.type === 'set' && d) onChange(d);
            if (event.type === 'dismissed') setShow(false);
          }}
        />
      ) : null}
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
