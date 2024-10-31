import React from 'react';
import { Tabs } from 'expo-router';
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
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
      }}
      sceneContainerStyle={{
        backgroundColor: "#201f31",
      }}>
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Watchlist',
          tabBarIcon: ({ color }) => <FontAwesome name="play-circle" size={22} color={color} />,
        }}
      />
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
        }}
      />
    </Tabs>
  );
}