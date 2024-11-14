import React from 'react';
import { Tabs } from 'expo-router';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Share, TouchableOpacity } from 'react-native';

export default function TabLayout() {
  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `🎉 Discover Anime with Anifuri! 🎉\n\nStream your favorite anime for free, explore trending titles, and keep track of episodes with ease. Anifuri provides an intuitive experience with no ads or hidden costs—just pure anime streaming!\n\n✨ Download and start watching now: https://github.com/pratham-jaiswal/anifuri/releases/latest\n\n🌟 Happy streaming!`,
      });
    } catch (error) {
      console.error("Error sharing content: ", error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerStyle: {
          backgroundColor: "#201f31",
          shadowColor: "#ffbade",
        },
        headerTitleStyle: {
          fontFamily: "monospace",
          color: "#ffbade",
        },
        tabBarActiveTintColor: "#201f31",
        tabBarStyle: {
          height: 60,
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          borderRadius: 16,
          backgroundColor: "#ffbade",
        },
        tabBarLabelStyle: {
          fontFamily: "monospace",
        },
        tabBarShowLabel: false,
        headerRight: () => (
          <TouchableOpacity activeOpacity={0.3} onPress={() => handleSharePress()}>
            <FontAwesome name="share-alt" size={20} color="#ffbade" style={{ marginRight: 16 }} />
          </TouchableOpacity>
        ),
      }}
      sceneContainerStyle={{
        backgroundColor: "#201f31",
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <FontAwesome name="search" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome name="gear" size={20} color={color} />
        }}
      />
    </Tabs>
  );
}