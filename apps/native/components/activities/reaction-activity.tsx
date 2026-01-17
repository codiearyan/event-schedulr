import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Chip, Surface, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

type ReactionSpeedConfig = {
	type: "reaction_speed";
	roundCount: number;
	minDelay: number;
	maxDelay: number;
};

type Activity = {
	_id: Id<"liveActivities">;
	type: "reaction_speed";
	title: string;
	status: string;
	config: ReactionSpeedConfig;
};

type Props = {
	activity: Activity;
	participantId: Id<"participants">;
};

type GameState = "waiting" | "ready" | "go" | "result" | "too_early";

export function ReactionActivity({ activity, participantId }: Props) {
	const config = activity.config as ReactionSpeedConfig;
	const [gameState, setGameState] = useState<GameState>("waiting");
	const [currentRound, setCurrentRound] = useState(1);
	const [reactionTime, setReactionTime] = useState<number | null>(null);
	const [bestTime, setBestTime] = useState<number | null>(null);

	const startTimeRef = useRef<number | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const submitResponse = useMutation(api.liveActivities.submitResponse);
	const results = useQuery(api.liveActivities.getAggregatedResults, {
		activityId: activity._id,
	});

	const accentColor = useThemeColor("accent");
	const successColor = useThemeColor("success");
	const dangerColor = useThemeColor("danger");
	const warningColor = useThemeColor("warning");
	const mutedColor = useThemeColor("muted");

	const leaderboard =
		results?.type === "reaction_speed" ? results.leaderboard : [];

	const cleanup = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	useEffect(() => {
		return cleanup;
	}, [cleanup]);

	const startRound = () => {
		cleanup();
		setGameState("ready");
		setReactionTime(null);

		const delay =
			Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;

		timeoutRef.current = setTimeout(() => {
			setGameState("go");
			startTimeRef.current = Date.now();
			if (Platform.OS === "ios") {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
			}
		}, delay);
	};

	const handleTap = async () => {
		if (gameState === "waiting") {
			startRound();
			return;
		}

		if (gameState === "ready") {
			cleanup();
			setGameState("too_early");
			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			}
			return;
		}

		if (gameState === "go" && startTimeRef.current) {
			const time = Date.now() - startTimeRef.current;
			setReactionTime(time);
			setGameState("result");

			if (bestTime === null || time < bestTime) {
				setBestTime(time);
			}

			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			}

			try {
				await submitResponse({
					activityId: activity._id,
					participantId,
					responseData: {
						type: "reaction_time",
						roundNumber: currentRound,
						reactionTimeMs: time,
					},
				});
			} catch (error) {
				console.error("Failed to submit reaction time:", error);
			}
		}

		if (gameState === "result" || gameState === "too_early") {
			if (currentRound < config.roundCount) {
				setCurrentRound((r) => r + 1);
				startRound();
			} else {
				setGameState("waiting");
				setCurrentRound(1);
			}
		}
	};

	const getBackgroundColor = () => {
		switch (gameState) {
			case "ready":
				return warningColor;
			case "go":
				return successColor;
			case "too_early":
				return dangerColor;
			default:
				return accentColor;
		}
	};

	const getMessage = () => {
		switch (gameState) {
			case "waiting":
				return "Tap to Start";
			case "ready":
				return "Wait...";
			case "go":
				return "TAP NOW!";
			case "too_early":
				return "Too Early!";
			case "result":
				return reactionTime ? `${reactionTime}ms` : "";
		}
	};

	return (
		<Container>
			<ScrollView className="flex-1" contentContainerClassName="p-4">
				<Surface variant="secondary" className="mb-4 rounded-lg p-4">
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-2">
							<Ionicons name="flash" size={20} color={accentColor} />
							<Text className="font-semibold text-foreground">
								Round {currentRound} of {config.roundCount}
							</Text>
						</View>
						{bestTime !== null && (
							<Chip size="sm" color="success">
								<Chip.Label>Best: {bestTime}ms</Chip.Label>
							</Chip>
						)}
					</View>
				</Surface>

				<Pressable onPress={handleTap}>
					<View
						className="mb-6 h-64 items-center justify-center rounded-2xl"
						style={{ backgroundColor: getBackgroundColor() }}
					>
						<Text className="font-bold text-4xl text-white">
							{getMessage()}
						</Text>
						{gameState === "result" && (
							<Text className="mt-2 text-sm text-white opacity-80">
								Tap to{" "}
								{currentRound < config.roundCount ? "continue" : "restart"}
							</Text>
						)}
						{gameState === "too_early" && (
							<Text className="mt-2 text-sm text-white opacity-80">
								Tap to try again
							</Text>
						)}
					</View>
				</Pressable>

				<View className="mb-4">
					<View className="mb-3 flex-row items-center justify-between">
						<Text className="font-semibold text-foreground">Leaderboard</Text>
						{results?.type === "reaction_speed" && (
							<Text className="text-muted text-xs">
								{results.totalParticipants} participants
							</Text>
						)}
					</View>

					{leaderboard.length === 0 ? (
						<Surface
							variant="secondary"
							className="items-center justify-center rounded-lg py-8"
						>
							<Ionicons name="trophy-outline" size={32} color={mutedColor} />
							<Text className="mt-2 text-muted text-sm">
								No scores yet. Be the first!
							</Text>
						</Surface>
					) : (
						<Surface variant="secondary" className="overflow-hidden rounded-lg">
							{leaderboard.slice(0, 10).map((entry, index) => (
								<View
									key={entry.participantId}
									className={`flex-row items-center justify-between p-3 ${
										index > 0 ? "border-bg-muted border-t" : ""
									}`}
								>
									<View className="flex-row items-center gap-3">
										<View
											className={`h-8 w-8 items-center justify-center rounded-full ${
												entry.rank === 1
													? "bg-yellow-500"
													: entry.rank === 2
														? "bg-gray-400"
														: entry.rank === 3
															? "bg-amber-600"
															: "bg-bg-muted"
											}`}
										>
											<Text
												className={`font-bold text-sm ${
													entry.rank <= 3 ? "text-white" : "text-foreground"
												}`}
											>
												{entry.rank}
											</Text>
										</View>
										<Text className="text-foreground">
											{entry.participantName}
										</Text>
									</View>
									<Text className="font-semibold text-foreground">
										{entry.bestTime}ms
									</Text>
								</View>
							))}
						</Surface>
					)}
				</View>
			</ScrollView>
		</Container>
	);
}
