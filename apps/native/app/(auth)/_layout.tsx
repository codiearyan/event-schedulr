import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function AuthLayout() {
	const backgroundColor = useThemeColor("background");

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor },
				animation: "slide_from_right",
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="enter-code" />
			<Stack.Screen name="scan-qr" />
			<Stack.Screen name="profile-setup" />
		</Stack>
	);
}
