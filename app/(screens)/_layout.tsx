import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function ScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#201f31",
        },
        headerTintColor: "#ffbade",
      }}
    >
      <Stack.Screen
        name="[anime_id]"
        options={{
          headerTitle: "",
          headerShown: true,
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
          headerShown: true,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#201f31",
          },
        }}
      />
    </Stack>
  );
}
