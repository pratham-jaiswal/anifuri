import React from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Share, TouchableOpacity } from "react-native";

export default function TabLayout() {
  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `🎬 Watch your favorite anime for free on Anifuri! 🤩\n\nStream top anime titles, explore trending series, and keep track of episodes effortlessly. Anifuri offers an ad-free experience with no hidden costs—just pure anime streaming!\n\n📥 Download now: https://github.com/pratham-jaiswal/anifuri/releases/latest\n\n🌟 Enjoy your anime journey!`,
      });
    } catch (error) {
      console.error("Error sharing content: ", error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#201f31",
        },
        tabBarActiveTintColor: "#201f31",
        tabBarStyle: {
          height: 60,
          position: "absolute",
          bottom: 16,
          marginHorizontal: 16,
          borderRadius: 16,
          backgroundColor: "#ffbade",
        },
        tabBarItemStyle: {
          marginVertical: 10,
        },
        tabBarShowLabel: false,
        headerRight: () => (
          <TouchableOpacity
            activeOpacity={0.3}
            onPress={() => handleSharePress()}
          >
            <FontAwesome
              name="share-alt"
              size={20}
              color="#ffbade"
              style={{ marginRight: 16 }}
            />
          </TouchableOpacity>
        ),
        sceneStyle: {
          backgroundColor: "#201f31",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="gear" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
