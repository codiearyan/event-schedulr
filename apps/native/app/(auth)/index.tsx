import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Image, Platform, Pressable, Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

type EntryMethodProps = {
	icon: keyof typeof Ionicons.glyphMap;
	title: string;
	description: string;
	onPress: () => void;
	delay: number;
};

function EntryMethodButton({
	icon,
	title,
	description,
	onPress,
	delay,
}: EntryMethodProps) {
	const handlePress = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		onPress();
	};

	return (
		<Animated.View entering={FadeInUp.delay(delay).duration(500)}>
			<Pressable
				onPress={handlePress}
				className="active:scale-[0.98] active:opacity-90"
			>
				<View className="flex-row items-center gap-4 rounded-2xl bg-bg-card p-4">
					<View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-muted">
						<Ionicons name={icon} size={24} color={colors.primary.default} />
					</View>
					<View className="flex-1">
						<Text className="font-semibold text-base text-text-primary">
							{title}
						</Text>
						<Text className="mt-0.5 text-sm text-text-muted">{description}</Text>
					</View>
					<Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
				</View>
			</Pressable>
		</Animated.View>
	);
}

export default function WelcomeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 bg-bg-main px-6"
			style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }}
		>
			<Animated.View
				entering={FadeIn.delay(100).duration(600)}
				className="mb-4 items-center"
			>
				<Image
					source={require("@/assets/images/logo.png")}
					className="mb-6 h-24 w-24"
					resizeMode="contain"
				/>
			</Animated.View>

			<Animated.View
				entering={FadeInDown.delay(200).duration(500)}
				className="mb-2 items-center"
			>
				<Text className="font-bold text-3xl text-text-primary tracking-tight">
					EventSchedulr
				</Text>
			</Animated.View>

			<Animated.View
				entering={FadeInDown.delay(300).duration(500)}
				className="mb-12 items-center"
			>
				<Text className="text-center text-base text-text-muted">
					Join your event and stay updated{"\n"}with real-time notifications
				</Text>
			</Animated.View>

			<Animated.View
				entering={FadeInDown.delay(400).duration(500)}
				className="mb-6"
			>
				<Text className="font-medium text-sm text-text-muted uppercase tracking-wider">
					Choose how to join
				</Text>
			</Animated.View>

			<View className="gap-3">
				<EntryMethodButton
					icon="qr-code-outline"
					title="Scan QR Code"
					description="Scan the code at the event venue"
					onPress={() => router.push("/(auth)/scan-qr")}
					delay={500}
				/>

				<EntryMethodButton
					icon="keypad-outline"
					title="Enter Access Code"
					description="Enter the code shared by organizer"
					onPress={() => router.push("/(auth)/enter-code")}
					delay={600}
				/>
			</View>

			<Animated.View
				entering={FadeIn.delay(900).duration(500)}
				className="mt-auto items-center pt-8"
			>
				<Text className="text-center text-xs text-text-muted">
					Don't have an access code?{"\n"}Contact your event organizer
				</Text>
			</Animated.View>
		</View>
	);
}
