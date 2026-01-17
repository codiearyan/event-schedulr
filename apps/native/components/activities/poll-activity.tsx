import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Button, Chip, Surface, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
	FadeInRight,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";

import { Container } from "@/components/container";
import { FloatingHeartsContainer } from "@/components/ui/FloatingHeartsContainer";
import { ReactionButton } from "@/components/ui/ReactionButton";
import { springConfigs } from "@/lib/animations";

type PollConfig = {
	type: "poll";
	question: string;
	options: { id: string; text: string }[];
	allowMultiple: boolean;
	showResultsToParticipants: boolean;
};

type Activity = {
	_id: Id<"liveActivities">;
	type: "poll";
	title: string;
	status: string;
	config: PollConfig;
};

type Props = {
	activity: Activity;
	participantId: Id<"participants">;
};

function AnimatedPollOption({
	option,
	isSelected,
	onPress,
	disabled,
	showResults,
	voteCount,
	percentage,
	index,
	accentColor,
}: {
	option: { id: string; text: string };
	isSelected: boolean;
	onPress: () => void;
	disabled: boolean;
	showResults: boolean;
	voteCount: number;
	percentage: number;
	index: number;
	accentColor: string;
}) {
	const scale = useSharedValue(1);
	const progressWidth = useSharedValue(0);

	useEffect(() => {
		if (showResults) {
			progressWidth.value = withTiming(percentage, {
				duration: 800,
			});
		}
	}, [showResults, percentage, progressWidth]);

	const handlePress = () => {
		if (disabled) return;
		scale.value = withSpring(0.95, springConfigs.stiff);
		setTimeout(() => {
			scale.value = withSpring(1, springConfigs.responsive);
		}, 100);
		onPress();
	};

	const scaleStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const progressStyle = useAnimatedStyle(() => ({
		width: `${progressWidth.value}%`,
	}));

	return (
		<Animated.View
			entering={FadeInRight.delay(index * 80).duration(300)}
			style={scaleStyle}
		>
			<Pressable onPress={handlePress} disabled={disabled}>
				<Surface
					variant={isSelected ? "default" : "secondary"}
					className={`rounded-lg p-4 ${
						isSelected ? "border-2 border-accent" : ""
					}`}
				>
					<View className="flex-row items-center justify-between">
						<View className="flex-1 flex-row items-center gap-3">
							<Animated.View
								className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
									isSelected ? "border-accent bg-accent" : "border-muted"
								}`}
							>
								{isSelected && (
									<Ionicons name="checkmark" size={14} color="#fff" />
								)}
							</Animated.View>
							<Text className="flex-1 text-foreground">{option.text}</Text>
						</View>
						{showResults && (
							<View className="flex-row items-center gap-2">
								<Text className="font-semibold text-foreground">
									{percentage}%
								</Text>
								<Chip size="sm" color="default">
									<Chip.Label>{voteCount}</Chip.Label>
								</Chip>
							</View>
						)}
					</View>
					{showResults && (
						<View className="mt-3 h-2 overflow-hidden rounded-full bg-bg-muted">
							<Animated.View
								className="h-full rounded-full"
								style={[{ backgroundColor: accentColor }, progressStyle]}
							/>
						</View>
					)}
				</Surface>
			</Pressable>
		</Animated.View>
	);
}

export function PollActivity({ activity, participantId }: Props) {
	const config = activity.config as PollConfig;
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const submitResponse = useMutation(api.liveActivities.submitResponse);
	const existingResponses = useQuery(
		api.liveActivities.getParticipantResponses,
		{
			activityId: activity._id,
			participantId,
		},
	);
	const results = useQuery(api.liveActivities.getAggregatedResults, {
		activityId: activity._id,
	});

	const accentColor = useThemeColor("accent");
	const successColor = useThemeColor("success");

	const hasVoted = existingResponses && existingResponses.length > 0;
	const showResults = hasVoted && config.showResultsToParticipants;

	const handleOptionPress = (optionId: string) => {
		if (hasVoted) return;

		if (Platform.OS === "ios") {
			Haptics.selectionAsync();
		}

		if (config.allowMultiple) {
			setSelectedOptions((prev) =>
				prev.includes(optionId)
					? prev.filter((id) => id !== optionId)
					: [...prev, optionId],
			);
		} else {
			setSelectedOptions([optionId]);
		}
	};

	const handleSubmit = async () => {
		if (selectedOptions.length === 0) return;

		setIsSubmitting(true);
		try {
			await submitResponse({
				activityId: activity._id,
				participantId,
				responseData: {
					type: "poll_vote",
					selectedOptionIds: selectedOptions,
				},
			});

			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			}
		} catch (error) {
			console.error("Failed to submit vote:", error);
			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const voteCounts = results?.type === "poll" ? results.voteCounts : {};
	const totalVoters = results?.type === "poll" ? results.totalVoters : 0;

	return (
		<Container>
			<FloatingHeartsContainer activityId={activity._id} />
			<View className="flex-1">
				<ScrollView className="flex-1" contentContainerClassName="p-4">
					<Surface variant="secondary" className="mb-6 rounded-lg p-4">
						<View className="mb-2 flex-row items-center gap-2">
							<Ionicons name="stats-chart" size={20} color={accentColor} />
							<Text className="font-semibold text-foreground">Poll</Text>
						</View>
						<Text className="text-foreground text-lg">{config.question}</Text>
						{config.allowMultiple && (
							<Text className="mt-2 text-muted text-xs">
								Select all that apply
							</Text>
						)}
					</Surface>

					<View className="mb-6 gap-3">
						{config.options.map((option, index) => {
							const isSelected = selectedOptions.includes(option.id);
							const voteCount = voteCounts[option.id] || 0;
							const percentage =
								totalVoters > 0
									? Math.round((voteCount / totalVoters) * 100)
									: 0;

							return (
								<AnimatedPollOption
									key={option.id}
									option={option}
									isSelected={isSelected}
									onPress={() => handleOptionPress(option.id)}
									disabled={hasVoted ?? false}
									showResults={showResults ?? false}
									voteCount={voteCount}
									percentage={percentage}
									index={index}
									accentColor={accentColor}
								/>
							);
						})}
					</View>

					{hasVoted && (
						<Surface variant="secondary" className="rounded-lg p-4">
							<View className="flex-row items-center gap-2">
								<Ionicons
									name="checkmark-circle"
									size={20}
									color={successColor}
								/>
								<Text className="font-medium text-foreground">
									Vote submitted!
								</Text>
							</View>
							{config.showResultsToParticipants && totalVoters > 0 && (
								<Text className="mt-2 text-muted text-sm">
									{totalVoters}{" "}
									{totalVoters === 1 ? "person has" : "people have"} voted
								</Text>
							)}
						</Surface>
					)}
				</ScrollView>

				{!hasVoted && (
					<Surface variant="secondary" className="border-bg-muted border-t p-4">
						<View className="flex-row items-center gap-2">
							<Button
								onPress={handleSubmit}
								isDisabled={selectedOptions.length === 0 || isSubmitting}
								className="flex-1"
							>
								{isSubmitting ? "Submitting..." : "Submit Vote"}
							</Button>
							<ReactionButton
								activityId={activity._id}
								participantId={participantId}
								size={44}
							/>
						</View>
					</Surface>
				)}
			</View>
		</Container>
	);
}
