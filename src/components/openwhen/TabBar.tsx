/**
 * Custom bottom tab bar: Home, People, Capsules, Memories, with a raised dark
 * center "+" that opens the Create-a-Capsule modal. (Profile moved off the tab
 * bar — it's reached by tapping the avatar on Home.)
 *
 * Native tab bars (expo-router's NativeTabs) can't host a floating center button,
 * so we use the JS Tabs navigator with this custom `tabBar` renderer instead.
 */
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Font, OW } from '@/constants/openwhen';
import {
  EnvelopeTabIcon,
  HomeIcon,
  IconProps,
  ImageIcon,
  PeopleIcon,
  PlusIcon,
} from './icons';

const TAB: Record<string, { label: string; Icon: ComponentType<IconProps> }> = {
  index: { label: 'Home', Icon: HomeIcon },
  people: { label: 'People', Icon: PeopleIcon },
  capsules: { label: 'Capsules', Icon: EnvelopeTabIcon },
  memories: { label: 'Memories', Icon: ImageIcon },
};

export function OWTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const renderTab = (name: string) => {
    const index = state.routes.findIndex((r) => r.name === name);
    const route = state.routes[index];
    if (!route) return null;

    const focused = state.index === index;
    const color = focused ? OW.ink : OW.muted;
    const { label, Icon } = TAB[name];

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name as never);
      }
    };

    return (
      <Pressable key={name} style={styles.tab} onPress={onPress} hitSlop={6}>
        <Icon size={21} color={color} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { height: 62 + insets.bottom, paddingBottom: insets.bottom }]}>
      {renderTab('index')}
      {renderTab('people')}
      <View style={styles.center}>
        <Pressable
          style={styles.centerBtn}
          onPress={() => router.push('/new')}
          accessibilityRole="button"
          accessibilityLabel="Create">
          <PlusIcon size={20} color="#fff" />
        </Pressable>
      </View>
      {renderTab('capsules')}
      {renderTab('memories')}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OW.card,
    borderTopWidth: 1,
    borderTopColor: OW.line,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontFamily: Font.semibold, fontSize: 9 },
  center: { flex: 1, alignItems: 'center' },
  centerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: OW.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
    shadowColor: OW.dark,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
