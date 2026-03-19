import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
import { 
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const { user, isLoading, isGuest } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans_400Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans_500Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans_600SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans_700Bold': PlusJakartaSans_700Bold,
    'Manrope-Regular': Manrope_400Regular,
    'Manrope-Medium': Manrope_500Medium,
    'Manrope-SemiBold': Manrope_600SemiBold,
    'Manrope-Bold': Manrope_700Bold,
  });

    useEffect(() => {
    console.log(`[RootLayout] Fonts loaded: ${fontsLoaded}, Auth loading: ${isLoading}, Segments: ${segments.join('/')}`);
    if (isLoading) {
      console.log("[RootLayout] Still loading auth...");
      return;
    }

    const inAuthGroup = segments[0] === 'auth';

    console.log(`[RootLayout] Check transition: user=${!!user}, isGuest=${isGuest}, inAuthGroup=${inAuthGroup}`);

    if (!user && !isGuest && !inAuthGroup) {
      console.log("[RootLayout] Redirecting to /auth/role-selection");
      router.replace('/auth/role-selection');
    } else if (user && inAuthGroup) {
      console.log("[RootLayout] Redirecting to /(tabs) (User detected)");
      router.replace('/(tabs)');
    } else {
      console.log("[RootLayout] No redirect needed");
    }

    if (!isLoading && fontsLoaded) {
      console.log("[RootLayout] Conditions met for SplashScreen hide");
      SplashScreen.hideAsync()
        .then(() => console.log("[RootLayout] SplashScreen hidden successfully"))
        .catch((err) => {
          console.warn("[RootLayout] Failed to hide splash screen:", err);
        });
    }

    // Failsafe: Hide splash screen after 5s regardless of loading state
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);

    return () => clearTimeout(timer);
  }, [user, isLoading, segments, fontsLoaded]);

  const colorScheme = useColorScheme();

  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1c1022', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#af25f4" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="pro" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="profile/userListings" options={{ headerShown: false }} />
            <Stack.Screen name="profile/verify" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

import { FeedProvider } from '@/context/FeedContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <FeedProvider>
          <RootLayoutNav />
        </FeedProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
