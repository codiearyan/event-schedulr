import { Ionicons } from "@expo/vector-icons";
import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { useParticipant } from "@/contexts/participant-context";
import {
	Image,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

const AVATAR_STYLES = [
	"adventurer",
	"adventurer-neutral",
	"avataaars",
	"big-ears",
	"bottts",
	"fun-emoji",
	"lorelei",
	"notionists",
];

function generateAvatarUrl(seed: string, style: string = "adventurer"): string {
	return `https://api.dicebear.com/9.x/${style}/png?seed=${seed}&size=200`;
}

function generateRandomSeed(): string {
	return Math.random().toString(36).substring(2, 12);
}

type AvatarOptionProps = {
	seed: string;
	style: string;
	isSelected: boolean;
	onSelect: () => void;
	index: number;
};

function AvatarOption({
	seed,
	style,
	isSelected,
	onSelect,
	index,
}: AvatarOptionProps) {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePress = () => {
		scale.value = withSpring(0.9, {}, () => {
			scale.value = withSpring(1);
		});
		if (Platform.OS === "ios") {
			Haptics.selectionAsync();
		}
		onSelect();
	};

	return (
		<Animated.View
			entering={FadeInUp.delay(200 + index * 50).duration(400)}
			style={animatedStyle}
		>
			<Pressable onPress={handlePress}>
				<View
					className={`h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 ${
						isSelected ? "border-primary" : "border-transparent"
					}`}
				>
					<Image
						source={{ uri: generateAvatarUrl(seed, style) }}
						className="h-14 w-14 rounded-xl bg-bg-card"
					/>
				</View>
			</Pressable>
		</Animated.View>
	);
}

export default function ProfileSetupScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { setSession } = useParticipant();
	const params = useLocalSearchParams<{
		code?: string;
		eventId: string;
		eventName: string;
		accessMethod: "qr_code" | "access_code";
		messageToParticipants?: string;
	}>();

	const joinEvent = useMutation(api.participants.join);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [avatarSeed, setAvatarSeed] = useState(generateRandomSeed());
	const [selectedStyle, setSelectedStyle] = useState(AVATAR_STYLES[0]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

	const diceRotation = useSharedValue(0);

	const diceAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${diceRotation.value}deg` }],
	}));

	const handleBack = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.back();
	};

	const handleRandomize = useCallback(() => {
		diceRotation.value = withSpring(diceRotation.value + 360);
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
		setAvatarSeed(generateRandomSeed());
		setSelectedStyle(AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)]);
	}, [diceRotation]);

	const validate = (): boolean => {
		const newErrors: { name?: string; email?: string } = {};

		if (!name.trim()) {
			newErrors.name = "Name is required";
		} else if (name.trim().length < 2) {
			newErrors.name = "Name must be at least 2 characters";
		}

		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Please enter a valid email";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleContinue = async () => {
		if (!validate()) {
			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			}
			return;
		}

		setIsSubmitting(true);

		try {
			const fullAvatarSeed = `${avatarSeed}-${selectedStyle}`;
			const participant = await joinEvent({
				eventId: params.eventId as Id<"events">,
				name: name.trim(),
				email: email.trim().toLowerCase(),
				avatarSeed: fullAvatarSeed,
				accessMethod: params.accessMethod,
			});

			if (participant) {
				await setSession({
					participantId: participant._id,
					eventId: params.eventId,
					name: name.trim(),
					email: email.trim().toLowerCase(),
					avatarSeed: fullAvatarSeed,
				});
			}

			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			}
		} catch (error) {
			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			}
			setErrors({ email: "Failed to join event. Please try again." });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View
			className="flex-1 bg-bg-main px-6"
			style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
		>
			<Animated.View entering={FadeIn.duration(300)}>
				<Pressable
					onPress={handleBack}
					className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-bg-card active:opacity-70"
				>
					<Ionicons name="arrow-back" size={20} color={colors.text.primary} />
				</Pressable>
			</Animated.View>

			<Animated.View entering={FadeInDown.delay(100).duration(500)}>
				<View className="mb-1 flex-row items-center gap-2">
					<View className="h-2 w-2 rounded-full bg-success" />
					<Text className="text-sm text-success">Joining {params.eventName}</Text>
				</View>
				<Text className="mb-2 font-bold text-2xl text-text-primary">
					Set up your profile
				</Text>
				<Text className="mb-4 text-base text-text-muted">
					This helps other attendees recognize you
				</Text>
				{params.messageToParticipants && (
					<View className="mb-4 rounded-xl bg-primary-muted p-3">
						<View className="flex-row items-start gap-2">
							<Ionicons name="information-circle" size={18} color={colors.primary.default} />
							<Text className="flex-1 text-sm text-primary">
								{params.messageToParticipants}
							</Text>
						</View>
					</View>
				)}
			</Animated.View>

			<Animated.View
				entering={FadeInDown.delay(200).duration(500)}
				className="mb-6 items-center"
			>
				<View className="relative">
					<Image
						source={{ uri: generateAvatarUrl(avatarSeed, selectedStyle) }}
						className="h-28 w-28 rounded-3xl bg-bg-card"
					/>
					<Animated.View style={diceAnimatedStyle} className="absolute -right-2 -bottom-2">
						<Pressable
							onPress={handleRandomize}
							className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-80"
						>
							<Ionicons name="dice" size={20} color={colors.text.inverse} />
						</Pressable>
					</Animated.View>
				</View>
			</Animated.View>

			<Animated.View
				entering={FadeInDown.delay(300).duration(500)}
				className="mb-6"
			>
				<Text className="mb-3 text-sm text-text-muted">Choose a style</Text>
				<View className="flex-row flex-wrap justify-center gap-2">
					{AVATAR_STYLES.map((style, index) => (
						<AvatarOption
							key={style}
							seed={avatarSeed}
							style={style}
							isSelected={selectedStyle === style}
							onSelect={() => setSelectedStyle(style)}
							index={index}
						/>
					))}
				</View>
			</Animated.View>

			<Animated.View entering={FadeInDown.delay(400).duration(500)} className="gap-4">
				<View>
					<Text className="mb-2 text-sm font-medium text-text-primary">
						Full Name
					</Text>
					<TextInput
						value={name}
						onChangeText={(text) => {
							setName(text);
							if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
						}}
						placeholder="Enter your name"
						placeholderTextColor={colors.text.muted}
						className={`h-12 rounded-xl border px-4 text-text-primary ${
							errors.name ? "border-error bg-error-muted" : "border-border bg-bg-input"
						}`}
						autoCapitalize="words"
						autoCorrect={false}
					/>
					{errors.name && (
						<Text className="mt-1 text-xs text-error">{errors.name}</Text>
					)}
				</View>

				<View>
					<Text className="mb-2 text-sm font-medium text-text-primary">
						Email Address
					</Text>
					<TextInput
						value={email}
						onChangeText={(text) => {
							setEmail(text);
							if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
						}}
						placeholder="Enter your email"
						placeholderTextColor={colors.text.muted}
						className={`h-12 rounded-xl border px-4 text-text-primary ${
							errors.email ? "border-error bg-error-muted" : "border-border bg-bg-input"
						}`}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
					/>
					{errors.email && (
						<Text className="mt-1 text-xs text-error">{errors.email}</Text>
					)}
				</View>
			</Animated.View>

			<Animated.View
				entering={FadeIn.delay(500).duration(500)}
				className="mt-auto pt-6"
			>
				<Pressable
					onPress={handleContinue}
					disabled={isSubmitting}
					className={`h-14 items-center justify-center rounded-2xl ${
						isSubmitting ? "bg-primary-dark" : "bg-primary active:opacity-90"
					}`}
				>
					{isSubmitting ? (
						<View className="flex-row items-center gap-2">
							<View className="h-5 w-5 animate-spin rounded-full border-2 border-bg-main border-t-transparent" />
							<Text className="font-semibold text-base text-text-inverse">
								Joining...
							</Text>
						</View>
					) : (
						<Text className="font-semibold text-base text-text-inverse">
							Join Event
						</Text>
					)}
				</Pressable>
			</Animated.View>
		</View>
	);
}
