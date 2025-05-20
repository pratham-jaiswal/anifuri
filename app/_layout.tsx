import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Constants from "expo-constants";
import { Alert, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";

const GITHUB_REPO = "pratham-jaiswal/anifuri";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

const fetchLatestRelease = async () => {
  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) throw new Error("Failed to fetch release information.");
    const release = await response.json();
    return release;
  } catch (error) {
    console.error("Error fetching latest release:", error);
    return null;
  }
};

const checkForUpdates = async () => {
  const release = await fetchLatestRelease();
  const latestVersion = release?.tag_name;
  const downloadUrl = "https://sourceforge.net/projects/anifuri/files/latest/download";
  const currentVersion = "v" + Constants.expoConfig?.version;

  if (latestVersion && latestVersion !== currentVersion && downloadUrl) {
    Alert.alert(
      "Update Available",
      `A new version of Anifuri (${latestVersion}) is now available! Would you like to download and install it?`,
      [
        { text: "Not Now" },
        {
          text: "Download",
          onPress: () => Linking.openURL(downloadUrl),
        },
      ]
    );
  }
};

export default function RootLayout() {
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  useEffect(() => {
    const hideSplashScreen = async () => {
      await SplashScreen.preventAutoHideAsync();
      await checkForUpdates();
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 3000);
    };

    hideSplashScreen();
  }, []);

  return (
    <>
      <StatusBar backgroundColor="transparent" translucent={true} hidden={true} /> 
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(screens)" />
      </Stack>
    </>
  );
}
