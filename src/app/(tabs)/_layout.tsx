import { Tabs } from 'expo-router';

import { OWTabBar } from '@/components/openwhen/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <OWTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="people" options={{ title: 'People' }} />
      <Tabs.Screen name="capsules" options={{ title: 'Capsules' }} />
      <Tabs.Screen name="memories" options={{ title: 'Memories' }} />
    </Tabs>
  );
}
