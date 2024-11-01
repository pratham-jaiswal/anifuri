import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

useEffect(() => {
  const hideSplashScreen = async () => {
    await SplashScreen.preventAutoHideAsync();
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 3000);
  };

  hideSplashScreen();
}, []);

export default function RootLayout() {
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(screens)" options={{ headerShown: false }} />
    </Stack>
  );
}