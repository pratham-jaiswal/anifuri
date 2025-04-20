import React from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#201f31",
          height: 60,
        },
        tabBarButton(props) {
          return <Pressable {...props} android_ripple={{}}></Pressable>;
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
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="gear" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
