import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable } from "react-native";

export default function ActivityLayout() {
	const backgroundColor = useThemeColor("background");
	const foregroundColor = useThemeColor("foreground");
	const router = useRouter();

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor,
				},
				headerTintColor: foregroundColor,
				headerTitleStyle: {
					fontWeight: "600",
				},
				headerBackTitle: "Back",
				headerBackVisible: true,
				headerLeft: () => (
					<Pressable
						onPress={() => router.back()}
						style={{ marginRight: 16, padding: 4 }}
					>
						<Ionicons name="arrow-back" size={24} color={foregroundColor} />
					</Pressable>
				),
			}}
		>
			<Stack.Screen
				name="[id]"
				options={{
					headerTitle: "Activity",
				}}
			/>
		</Stack>
	);
}
