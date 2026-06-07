import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import { DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import { Lora_500Medium } from '@expo-google-fonts/lora';
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { Quicksand_500Medium } from '@expo-google-fonts/quicksand';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { OW } from '@/constants/openwhen';
import { AuthProvider, useAuth } from '@/lib/auth';

SplashScreen.preventAutoHideAsync();

// Keep the whole app on the warm cream background regardless of the OS color scheme.
const OWNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: OW.bg,
    card: OW.card,
    text: OW.ink,
    border: OW.line,
    primary: OW.dark,
    notification: OW.rose,
  },
};

// Sends signed-out users to /login — but ONLY once Firebase is configured, so the
// app keeps working as before until a real config is pasted into firebaseConfig.ts.
function useAuthGate() {
  const { user, initializing, configured } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!configured || initializing) return;
    const inAuthScreen = segments[0] === 'login' || segments[0] === 'signup';
    if (!user && !inAuthScreen) router.replace('/login');
    else if (user && inAuthScreen) router.replace('/');
  }, [user, initializing, configured, segments, router]);
}

function RootNavigator() {
  useAuthGate();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: OW.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="memory" options={{ presentation: 'modal' }} />
      <Stack.Screen name="memory/[id]" />
      <Stack.Screen name="capsule/[id]" options={{ contentStyle: { backgroundColor: '#1f2540' } }} />
      <Stack.Screen name="edit-capsule/[id]" />
      <Stack.Screen name="wrapped" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="person/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DancingScript_700Bold,
    Lora_500Medium,
    Caveat_700Bold,
    PlayfairDisplay_600SemiBold,
    Quicksand_500Medium,
    SpaceMono_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={OWNavTheme}>
          <RootNavigator />
          <StatusBar style="dark" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
