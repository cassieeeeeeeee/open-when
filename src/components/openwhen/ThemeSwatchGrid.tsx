import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ImageIcon } from '@/components/openwhen/icons';
import { CAPSULE_THEMES } from '@/constants/capsuleThemes';
import { Font } from '@/constants/openwhen';

// The reusable wrapping grid of background options for a section: any photos saved for this capsule
// come first, then the theme swatch+name chips, then an "upload" tile. `selectedId` / `selectedPhoto`
// highlight the active choice; `textColor` keeps the names legible against whichever background the
// grid sits on. Photos and the upload tile only render when their callbacks are supplied.
export function ThemeSwatchGrid({
  selectedId,
  onSelect,
  textColor,
  photos = [],
  selectedPhoto,
  onSelectPhoto,
  onAddPhoto,
}: {
  selectedId?: string;
  onSelect: (id: string) => void;
  textColor: string;
  photos?: string[];
  selectedPhoto?: string;
  onSelectPhoto?: (uri: string) => void;
  onAddPhoto?: () => void;
}) {
  return (
    <View style={s.row}>
      {photos.map((uri, i) => {
        const on = selectedPhoto === uri;
        return (
          <Pressable key={`photo-${uri}`} onPress={() => onSelectPhoto?.(uri)} style={s.option} hitSlop={2} accessibilityLabel="Saved background photo">
            <Image source={{ uri }} style={[s.swatch, { borderColor: on ? textColor : 'transparent' }]} contentFit="cover" />
            <Text numberOfLines={1} style={[s.name, { color: textColor, fontFamily: on ? Font.bold : Font.semibold }]}>
              {photos.length > 1 ? `Photo ${i + 1}` : 'Photo'}
            </Text>
          </Pressable>
        );
      })}
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
      {onAddPhoto ? (
        <Pressable key="add-photo" onPress={onAddPhoto} style={s.option} hitSlop={2} accessibilityLabel="Upload background photo">
          <View style={[s.swatch, s.addSwatch, { borderColor: textColor }]}>
            <ImageIcon size={15} color={textColor} />
          </View>
          <Text numberOfLines={1} style={[s.name, { color: textColor, fontFamily: Font.semibold }]}>
            Upload
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10 },
  option: { alignItems: 'center', width: 56 },
  swatch: { width: 30, height: 30, borderRadius: 9, borderWidth: 2 },
  addSwatch: { alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' },
  name: { fontSize: 10.5, marginTop: 4, textAlign: 'center' },
});
