import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function TabLayout() {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: themeColorBackground,
        },
        headerTintColor: themeColorForeground,
        headerTitleStyle: {
          color: themeColorForeground,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: themeColorBackground,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="live-activities"
        options={{
          title: "Live Activities",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="diamond" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: "Announcements",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
