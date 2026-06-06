import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CAPSULE_THEMES } from '@/constants/capsuleThemes';
import { Font } from '@/constants/openwhen';

// The reusable wrapping grid of theme swatch + name chips, shared by the bottom "Theme" tab and
// the per-section appearance picker. `selectedId` highlights the chosen theme; `textColor` keeps
// the names legible against whichever background the grid sits on.
export function ThemeSwatchGrid({
  selectedId,
  onSelect,
  textColor,
}: {
  selectedId?: string;
  onSelect: (id: string) => void;
  textColor: string;
}) {
  return (
    <View style={s.row}>
      {CAPSULE_THEMES.map((th) => {
        const on = selectedId === th.id;
        return (
          <Pressable key={th.id} onPress={() => onSelect(th.id)} style={s.option} hitSlop={2}>
            <LinearGradient
              colors={th.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.swatch, { borderColor: on ? textColor : 'transparent' }]}
            />
            <Text numberOfLines={1} style={[s.name, { color: textColor, fontFamily: on ? Font.bold : Font.semibold }]}>
              {th.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10 },
  option: { alignItems: 'center', width: 56 },
  swatch: { width: 30, height: 30, borderRadius: 9, borderWidth: 2 },
  name: { fontSize: 10.5, marginTop: 4, textAlign: 'center' },
});
