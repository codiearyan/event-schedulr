import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Button, Chip, Surface, TextField, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

type WordCloudConfig = {
	type: "word_cloud";
	prompt: string;
	maxSubmissionsPerUser: number;
	maxWordLength: number;
};

type Activity = {
	_id: Id<"liveActivities">;
	type: "word_cloud";
	title: string;
	status: string;
	config: WordCloudConfig;
};

type Props = {
	activity: Activity;
	participantId: Id<"participants">;
};

export function WordCloudActivity({ activity, participantId }: Props) {
	const config = activity.config as WordCloudConfig;
	const [word, setWord] = useState("");
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
	const mutedColor = useThemeColor("muted");

	const submissionCount = existingResponses?.length || 0;
	const remainingSubmissions = config.maxSubmissionsPerUser - submissionCount;
	const canSubmit = remainingSubmissions > 0;

	const wordCounts = results?.type === "word_cloud" ? results.wordCounts : {};
	const wordList = useMemo(() => {
		return Object.entries(wordCounts)
			.map(([word, count]) => ({ word, count: count as number }))
			.sort((a, b) => b.count - a.count);
	}, [wordCounts]);

	const maxCount = wordList.length > 0 ? wordList[0].count : 1;

	const handleSubmit = async () => {
		if (!word.trim() || !canSubmit) return;

		setIsSubmitting(true);
		try {
			await submitResponse({
				activityId: activity._id,
				participantId,
				responseData: {
					type: "word_submission",
					word: word.trim().toLowerCase(),
				},
			});

			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			}
			setWord("");
		} catch (error) {
			console.error("Failed to submit word:", error);
			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const getFontSize = (count: number) => {
		const minSize = 14;
		const maxSize = 32;
		const ratio = count / maxCount;
		return minSize + (maxSize - minSize) * ratio;
	};

	return (
		<Container>
			<ScrollView className="flex-1" contentContainerClassName="p-4">
				<Surface variant="secondary" className="mb-6 rounded-lg p-4">
					<View className="mb-2 flex-row items-center gap-2">
						<Ionicons name="cloud" size={20} color={accentColor} />
						<Text className="font-semibold text-foreground">Word Cloud</Text>
					</View>
					<Text className="text-foreground text-lg">{config.prompt}</Text>
				</Surface>

				{canSubmit && (
					<Surface variant="secondary" className="mb-6 rounded-lg p-4">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-medium text-foreground">Add a word</Text>
							<Chip
								size="sm"
								color={remainingSubmissions > 0 ? "accent" : "default"}
							>
								<Chip.Label>{remainingSubmissions} left</Chip.Label>
							</Chip>
						</View>
						<View className="flex-row gap-2">
							<View className="flex-1">
								<TextField>
									<TextField.Input
										value={word}
										onChangeText={setWord}
										placeholder="Enter a word..."
										maxLength={config.maxWordLength}
										autoCapitalize="none"
										returnKeyType="send"
										onSubmitEditing={handleSubmit}
									/>
								</TextField>
							</View>
							<Button
								onPress={handleSubmit}
								isDisabled={!word.trim() || isSubmitting}
							>
								<Ionicons name="send" size={18} color="#fff" />
							</Button>
						</View>
						<Text className="mt-2 text-muted text-xs">
							Max {config.maxWordLength} characters
						</Text>
					</Surface>
				)}

				{!canSubmit && (
					<Surface variant="secondary" className="mb-6 rounded-lg p-4">
						<View className="flex-row items-center gap-2">
							<Ionicons
								name="checkmark-circle"
								size={20}
								color={successColor}
							/>
							<Text className="font-medium text-foreground">
								All submissions used!
							</Text>
						</View>
						<Text className="mt-2 text-muted text-sm">
							You've submitted {submissionCount} word
							{submissionCount !== 1 ? "s" : ""}
						</Text>
					</Surface>
				)}

				<View className="mb-4">
					<View className="mb-3 flex-row items-center justify-between">
						<Text className="font-semibold text-foreground">Word Cloud</Text>
						{results?.type === "word_cloud" && (
							<Text className="text-muted text-xs">
								{results.totalSubmissions} submissions
							</Text>
						)}
					</View>

					{wordList.length === 0 ? (
						<Surface
							variant="secondary"
							className="items-center justify-center rounded-lg py-10"
						>
							<Ionicons name="cloud-outline" size={40} color={mutedColor} />
							<Text className="mt-3 font-medium text-foreground">
								No words yet
							</Text>
							<Text className="mt-1 text-center text-muted text-xs">
								Be the first to add a word!
							</Text>
						</Surface>
					) : (
						<Surface variant="secondary" className="rounded-lg p-4">
							<View className="flex-row flex-wrap justify-center gap-2">
								{wordList.map(({ word, count }) => (
									<Text
										key={word}
										style={{
											fontSize: getFontSize(count),
											color: accentColor,
											fontWeight: count === maxCount ? "700" : "500",
										}}
									>
										{word}
									</Text>
								))}
							</View>
						</Surface>
					)}
				</View>
			</ScrollView>
		</Container>
	);
}
