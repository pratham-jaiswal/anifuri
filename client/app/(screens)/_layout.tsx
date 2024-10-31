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
        headerLeft: () => (
          <TouchableOpacity
            activeOpacity={0.3}
            onPress={() => router.back()}
            style={{
              borderRadius: 25,
              width: 30,
              aspectRatio: 1,
              paddingLeft: 1,
              marginTop: 1,
              marginRight: 7,
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#ffbade" />
          </TouchableOpacity>
        ),
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
    </Stack>
  );
}
