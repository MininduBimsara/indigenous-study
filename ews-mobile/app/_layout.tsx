import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AlertProvider } from '../contexts/AlertContext';
import { UserPreferencesProvider } from '../contexts/UserPreferencesContext';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  useEffect(() => {
    // Hide splash once we know onboarding state
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboard" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="check-in" options={{ presentation: 'modal' }} />
        <Stack.Screen name="sos" options={{ presentation: 'modal' }} />
        <Stack.Screen name="shelter" options={{ presentation: 'card' }} />
        <Stack.Screen name="safe-route" options={{ presentation: 'card' }} />
        <Stack.Screen name="offline" options={{ presentation: 'card' }} />
        {/* G42: All 128 design guidelines reference – reachable from settings */}
        <Stack.Screen name="guidelines" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserPreferencesProvider>
        <AlertProvider>
          <RootNavigator />
        </AlertProvider>
      </UserPreferencesProvider>
    </GestureHandlerRootView>
  );
}
