import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { Chip, Surface, useThemeColor } from "heroui-native";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
	Easing,
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";

import { springConfigs } from "@/lib/animations";

type ActivityType =
	| "poll"
	| "word_cloud"
	| "reaction_speed"
	| "anonymous_chat"
	| "guess_logo";
type ActivityStatus = "draft" | "scheduled" | "live" | "ended";

type Activity = {
	_id: Id<"liveActivities">;
	eventId: Id<"events">;
	type: ActivityType;
	title: string;
	status: ActivityStatus;
	scheduledStartTime?: number;
	actualStartTime?: number;
	createdAt: number;
};

interface AnimatedActivityCardProps {
	activity: Activity;
	index: number;
	onPress: () => void;
}

const getActivityIcon = (
	type: ActivityType,
): keyof typeof Ionicons.glyphMap => {
	switch (type) {
		case "poll":
			return "stats-chart";
		case "word_cloud":
			return "cloud";
		case "reaction_speed":
			return "flash";
		case "anonymous_chat":
			return "chatbubbles";
		case "guess_logo":
			return "images";
	}
};

const getActivityLabel = (type: ActivityType): string => {
	switch (type) {
		case "poll":
			return "Poll";
		case "word_cloud":
			return "Word Cloud";
		case "reaction_speed":
			return "Reaction Speed";
		case "anonymous_chat":
			return "Anonymous Chat";
		case "guess_logo":
			return "Guess the Logo";
	}
};

const getStatusColor = (status: ActivityStatus) => {
	switch (status) {
		case "live":
			return "success";
		case "scheduled":
			return "accent";
		default:
			return "default";
	}
};

function LiveIndicator() {
	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);

	useEffect(() => {
		scale.value = withRepeat(
			withSequence(
				withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
				withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
			),
			-1,
			true,
		);
		opacity.value = withRepeat(
			withSequence(
				withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
				withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
			),
			-1,
			true,
		);
	}, [scale, opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	return (
		<Animated.View
			style={animatedStyle}
			className="mr-1 h-2 w-2 rounded-full bg-green-500"
		/>
	);
}

export function AnimatedActivityCard({
	activity,
	index,
	onPress,
}: AnimatedActivityCardProps) {
	const mutedColor = useThemeColor("muted");
	const accentColor = useThemeColor("accent");

	const scale = useSharedValue(1);

	const handlePressIn = () => {
		scale.value = withSpring(0.98, springConfigs.stiff);
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, springConfigs.responsive);
	};

	const cardStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<Animated.View
			entering={FadeInDown.delay(index * 80)
				.duration(400)
				.springify()
				.damping(15)}
			style={cardStyle}
		>
			<Pressable
				onPress={onPress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
			>
				<Surface variant="secondary" className="rounded-lg p-4">
					<View className="flex-row items-start justify-between">
						<View className="flex-1 flex-row items-center gap-3">
							<View
								className="h-10 w-10 items-center justify-center rounded-lg"
								style={{ backgroundColor: `${accentColor}20` }}
							>
								<Ionicons
									name={getActivityIcon(activity.type)}
									size={20}
									color={accentColor}
								/>
							</View>
							<View className="flex-1">
								<Text className="font-medium text-foreground">
									{activity.title}
								</Text>
								<Text className="mt-0.5 text-muted text-xs">
									{getActivityLabel(activity.type)}
								</Text>
							</View>
						</View>
						<Chip size="sm" color={getStatusColor(activity.status)}>
							<View className="flex-row items-center">
								{activity.status === "live" && <LiveIndicator />}
								<Chip.Label style={{ textTransform: "capitalize" }}>
									{activity.status === "live" ? "Live" : activity.status}
								</Chip.Label>
							</View>
						</Chip>
					</View>
					{activity.status === "scheduled" && activity.scheduledStartTime && (
						<View className="mt-3 flex-row items-center gap-2">
							<Ionicons name="time-outline" size={14} color={mutedColor} />
							<Text className="text-muted text-xs">
								Starts at{" "}
								{new Date(activity.scheduledStartTime).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Text>
						</View>
					)}
					{activity.status === "live" && (
						<View className="mt-3 flex-row items-center gap-2">
							<Ionicons name="arrow-forward" size={14} color={accentColor} />
							<Text className="text-primary text-xs">Tap to join</Text>
						</View>
					)}
				</Surface>
			</Pressable>
		</Animated.View>
	);
}
