import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import { useCallback, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";

import { springConfigs } from "@/lib/animations";

interface ReactionButtonProps {
	activityId: Id<"liveActivities">;
	participantId: Id<"participants">;
	size?: number;
}

export function ReactionButton({
	activityId,
	participantId,
	size = 48,
}: ReactionButtonProps) {
	const [isRateLimited, setIsRateLimited] = useState(false);
	const lastTapRef = useRef<number>(0);

	const scale = useSharedValue(1);
	const shake = useSharedValue(0);

	const sendReaction = useMutation(api.activityReactions.sendReaction);

	const handlePress = useCallback(async () => {
		const now = Date.now();
		if (now - lastTapRef.current < 1000) {
			shake.value = withSequence(
				withTiming(-8, { duration: 50 }),
				withTiming(8, { duration: 50 }),
				withTiming(-8, { duration: 50 }),
				withTiming(8, { duration: 50 }),
				withTiming(0, { duration: 50 }),
			);
			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
			}
			return;
		}

		lastTapRef.current = now;

		scale.value = withSequence(
			withSpring(0.9, springConfigs.stiff),
			withSpring(1.3, springConfigs.bouncy),
			withSpring(1, springConfigs.gentle),
		);

		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}

		try {
			await sendReaction({ activityId, participantId });
		} catch (error) {
			if (error instanceof Error && error.message.includes("Rate limited")) {
				setIsRateLimited(true);
				shake.value = withSequence(
					withTiming(-8, { duration: 50 }),
					withTiming(8, { duration: 50 }),
					withTiming(-8, { duration: 50 }),
					withTiming(8, { duration: 50 }),
					withTiming(0, { duration: 50 }),
				);
				setTimeout(() => setIsRateLimited(false), 1000);
			}
		}
	}, [activityId, participantId, scale, sendReaction, shake]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }, { translateX: shake.value }],
	}));

	return (
		<Pressable onPress={handlePress}>
			<Animated.View
				style={[
					styles.button,
					{ width: size, height: size, borderRadius: size / 2 },
					animatedStyle,
				]}
			>
				<Ionicons
					name="heart"
					size={size * 0.5}
					color={isRateLimited ? "#9ca3af" : "#ef4444"}
				/>
			</Animated.View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(239, 68, 68, 0.1)",
	},
});
