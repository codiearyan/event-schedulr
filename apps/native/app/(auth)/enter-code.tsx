import { api } from "@event-schedulr/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

const CODE_LENGTH = 6;

export default function EnterCodeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const inputRef = useRef<TextInput>(null);

	const [code, setCode] = useState("");
	const [isValidating, setIsValidating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const shakeX = useSharedValue(0);

	const validation = useQuery(
		api.accessCodes.validate,
		code.length === CODE_LENGTH ? { code } : "skip",
	);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: shakeX.value }],
	}));

	const shake = useCallback(() => {
		shakeX.value = withSequence(
			withTiming(-10, { duration: 50 }),
			withTiming(10, { duration: 50 }),
			withTiming(-10, { duration: 50 }),
			withTiming(10, { duration: 50 }),
			withTiming(0, { duration: 50 }),
		);
	}, [shakeX]);

	useEffect(() => {
		if (validation && code.length === CODE_LENGTH) {
			if (validation.valid && validation.event) {
				if (Platform.OS === "ios") {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
				}
				router.push({
					pathname: "/(auth)/profile-setup",
					params: {
						code,
						eventId: validation.event._id,
						eventName: validation.event.name,
						accessMethod: "access_code",
						messageToParticipants: validation.event.messageToParticipants || "",
					},
				});
			} else if (!validation.valid) {
				setError(validation.error || "Invalid code");
				shake();
				if (Platform.OS === "ios") {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
				}
			}
		}
	}, [validation, code, router, shake]);

	const handleCodeChange = (text: string) => {
		const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
		if (cleaned.length <= CODE_LENGTH) {
			setCode(cleaned);
			setError(null);
		}
	};

	const handleBack = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.back();
	};

	const focusInput = () => {
		inputRef.current?.focus();
	};

	return (
		<View
			className="flex-1 bg-bg-main px-6"
			style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
		>
			<Animated.View entering={FadeIn.duration(300)}>
				<Pressable
					onPress={handleBack}
					className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-bg-card active:opacity-70"
				>
					<Ionicons name="arrow-back" size={20} color={colors.text.primary} />
				</Pressable>
			</Animated.View>

			<Animated.View entering={FadeInDown.delay(100).duration(500)}>
				<Text className="mb-2 font-bold text-2xl text-text-primary">
					Enter Access Code
				</Text>
				<Text className="mb-8 text-base text-text-muted">
					Enter the 6-character code provided by your event organizer
				</Text>
			</Animated.View>

			<Animated.View
				entering={FadeInDown.delay(200).duration(500)}
				style={animatedStyle}
			>
				<Pressable onPress={focusInput}>
					<View className="flex-row justify-center gap-2">
						{Array.from({ length: CODE_LENGTH }).map((_, index) => {
							const char = code[index] || "";
							const isFilled = char !== "";
							const isActive = index === code.length;

							return (
								<View
									key={index}
									className={`h-14 w-12 items-center justify-center rounded-xl border-2 ${
										error
											? "border-error bg-error-muted"
											: isActive
												? "border-primary bg-bg-input"
												: isFilled
													? "border-primary bg-primary-muted"
													: "border-border bg-bg-input"
									}`}
								>
									<Text
										className={`font-bold text-2xl ${
											error
												? "text-error"
												: isFilled
													? "text-primary"
													: "text-text-muted"
										}`}
									>
										{char}
									</Text>
								</View>
							);
						})}
					</View>
				</Pressable>

				<TextInput
					ref={inputRef}
					value={code}
					onChangeText={handleCodeChange}
					maxLength={CODE_LENGTH}
					autoCapitalize="characters"
					autoCorrect={false}
					autoFocus
					keyboardType="default"
					className="absolute opacity-0"
				/>
			</Animated.View>

			{error && (
				<Animated.View
					entering={FadeIn.duration(200)}
					className="mt-4 items-center"
				>
					<View className="flex-row items-center gap-2 rounded-lg bg-error-muted px-4 py-2">
						<Ionicons
							name="alert-circle"
							size={18}
							color={colors.semantic.error}
						/>
						<Text className="text-error text-sm">{error}</Text>
					</View>
				</Animated.View>
			)}

			<Animated.View
				entering={FadeIn.delay(400).duration(500)}
				className="mt-8 items-center"
			>
				<Text className="text-center text-sm text-text-muted">
					Code is case-insensitive
				</Text>
			</Animated.View>

			{validation === undefined && code.length === CODE_LENGTH && (
				<Animated.View
					entering={FadeIn.duration(200)}
					className="mt-6 items-center"
				>
					<View className="flex-row items-center gap-2">
						<View className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<Text className="text-sm text-text-muted">Validating code...</Text>
					</View>
				</Animated.View>
			)}
		</View>
	);
}
