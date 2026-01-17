import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { Modal, Pressable, Text, View } from "react-native";

import { useLiveActivities } from "@/contexts/live-activities-context";
import { useNotifications } from "@/lib/hooks/use-notifications";

function TabBarIcon({
	name,
	color,
	size,
	badgeCount,
}: {
	name: keyof typeof Ionicons.glyphMap;
	color: string;
	size: number;
	badgeCount?: number;
}) {
	return (
		<View>
			<Ionicons name={name} size={size} color={color} />
			{badgeCount !== undefined && badgeCount > 0 && (
				<View className="absolute -top-1 -right-2 h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1">
					<Text className="font-bold text-[10px] text-white">
						{badgeCount > 9 ? "9+" : badgeCount}
					</Text>
				</View>
			)}
		</View>
	);
}

export default function TabLayout() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");
	const { unseenCount } = useLiveActivities();
	const notifications = useNotifications();

	return (
		<>
			<Modal
				visible={notifications?.showSettingsModal ?? false}
				transparent
				animationType="fade"
				onRequestClose={notifications?.dismissSettingsModal}
			>
				<Pressable
					className="flex-1 items-center justify-center bg-black/50"
					onPress={notifications?.dismissSettingsModal}
				>
					<Pressable
						className="mx-6 w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-neutral-900"
						onPress={(e) => e.stopPropagation()}
					>
						<View className="mb-4 items-center">
							<View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
								<Ionicons name="notifications-off" size={28} color="#f59e0b" />
							</View>
							<Text className="mb-2 text-center font-semibold text-lg text-neutral-900 dark:text-white">
								Enable Notifications
							</Text>
							<Text className="text-center text-neutral-600 dark:text-neutral-400">
								Notifications are disabled. Enable them in settings to receive
								important announcements and activity updates.
							</Text>
						</View>
						<View className="gap-3">
							<Button onPress={notifications?.openSettings}>
								<Text className="font-semibold text-white">Open Settings</Text>
							</Button>
							<Pressable
								className="items-center rounded-xl border border-neutral-200 py-3 dark:border-neutral-700"
								onPress={notifications?.dismissSettingsModal}
							>
								<Text className="font-medium text-neutral-700 dark:text-neutral-300">
									Maybe Later
								</Text>
							</Pressable>
						</View>
					</Pressable>
				</Pressable>
			</Modal>
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
							<TabBarIcon name="home" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="schedule"
					options={{
						title: "Schedule",
						tabBarIcon: ({ color, size }: { color: string; size: number }) => (
							<TabBarIcon name="calendar" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="live-activities"
					options={{
						title: "Activities",
						tabBarIcon: ({ color, size }: { color: string; size: number }) => (
							<TabBarIcon
								name="play-circle"
								size={size}
								color={color}
								badgeCount={unseenCount}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name="announcements"
					options={{
						title: "Announcements",
						tabBarIcon: ({ color, size }: { color: string; size: number }) => (
							<TabBarIcon name="megaphone" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="profile"
					options={{
						title: "Profile",
						tabBarIcon: ({ color, size }: { color: string; size: number }) => (
							<TabBarIcon name="person" size={size} color={color} />
						),
					}}
				/>
			</Tabs>
		</>
	);
}
