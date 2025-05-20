import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { TouchableOpacity, StyleSheet, View  } from "react-native";

function CustomHeader() {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#ffbade" />
      </TouchableOpacity>
    </View>
  );
}

export default function ScreenLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <CustomHeader />,
        headerStyle: {
          backgroundColor: "#201f31",
        },
        contentStyle: {
          backgroundColor: "#201f31",
        },
      }}
    >
      <Stack.Screen
        name="[anime_id]"
        options={{
          headerTitle: "",
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#201f31",
          },
        }}
      />
      <Stack.Screen
        name="videoPlayer"
        options={{
          headerTitle: "",
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#201f31",
          },
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#201f31",
  },
  headerContainer: {
    marginTop: 25,
    marginBottom: 5,
    height: 30,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  backButton: {
  },
});
