import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: -2 },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: "Learn",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "school" : "school-outline"} size={22} color={color} /> }} />
      <Tabs.Screen name="vault" options={{ title: "Vault",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "library" : "library-outline"} size={22} color={color} /> }} />
      <Tabs.Screen name="thrive" options={{ title: "Thrive",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "leaf" : "leaf-outline"} size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ href: null }} />
    </Tabs>
  );
}
