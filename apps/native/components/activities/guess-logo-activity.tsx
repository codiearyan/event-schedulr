import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Chip, Surface, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Animated,
	Image,
	Keyboard,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import ReanimatedModule, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";

import { Container } from "@/components/container";

type GuessLogoConfig = {
	type: "guess_logo";
	category: string;
	logoCount: number;
	timePerLogo: number;
	difficulty: "easy" | "medium" | "hard";
	showHints: boolean;
	currentLogoIndex?: number;
	logoStartedAt?: number;
};

type Activity = {
	_id: Id<"liveActivities">;
	type: "guess_logo";
	title: string;
	status: string;
	config: GuessLogoConfig;
};

type Props = {
	activity: Activity;
	participantId: Id<"participants">;
};

export function GuessLogoActivity({ activity, participantId }: Props) {
	const config = activity.config as GuessLogoConfig;

	const [guess, setGuess] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [lastResult, setLastResult] = useState<{
		isCorrect: boolean;
		isClose: boolean;
		pointsEarned: number;
		correctAnswer: string | null;
		attemptNumber: number;
		canRetry: boolean;
		nextAttemptPoints: number;
	} | null>(null);
	const [hintsRevealed, setHintsRevealed] = useState(0);
	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

	const pulseAnim = useRef(new Animated.Value(1)).current;

	const revealProgress = useSharedValue(0);
	const resultShake = useSharedValue(0);
	const resultScale = useSharedValue(1);

	const currentLogo = useQuery(api.guessLogo.getCurrentLogo, {
		activityId: activity._id,
	});
	const gameState = useQuery(api.guessLogo.getGameState, {
		activityId: activity._id,
		participantId,
	});
	const leaderboard = useQuery(api.guessLogo.getLeaderboard, {
		activityId: activity._id,
	});

	const submitGuess = useMutation(api.guessLogo.submitGuess);

	const accentColor = useThemeColor("accent");
	const successColor = useThemeColor("success");
	const dangerColor = useThemeColor("danger");
	const warningColor = useThemeColor("warning");
	const mutedColor = useThemeColor("muted");

	const currentLogoIndex = currentLogo?.index ?? -1;
	const currentLogoAttempts = gameState?.logoAttempts?.[currentLogoIndex];
	const hasGotCorrect = currentLogoAttempts?.gotCorrect ?? false;
	const attemptCount = currentLogoAttempts?.attempts ?? 0;
	const _canRetryLogo =
		!hasGotCorrect && attemptCount < 5 && (timeRemaining ?? 0) > 0;
	const hasFinishedCurrentLogo =
		hasGotCorrect || (attemptCount >= 5 && !hasGotCorrect);

	const lastSyncRef = useRef<{ serverTime: number; localTime: number } | null>(
		null,
	);

	useEffect(() => {
		setGuess("");
		setLastResult(null);
		setHintsRevealed(0);

		revealProgress.value = 0;
		revealProgress.value = withTiming(1, {
			duration: 5000,
			easing: Easing.out(Easing.cubic),
		});
	}, [currentLogo?.index, revealProgress]);

	useEffect(() => {
		if (currentLogo?.timeRemaining === undefined) {
			return;
		}

		lastSyncRef.current = {
			serverTime: currentLogo.serverTime ?? Date.now(),
			localTime: Date.now(),
		};
		setTimeRemaining(currentLogo.timeRemaining);

		if (currentLogo.timeRemaining <= 0) return;

		const interval = setInterval(() => {
			if (!lastSyncRef.current) return;

			const localElapsed = (Date.now() - lastSyncRef.current.localTime) / 1000;
			const remaining = Math.max(
				0,
				(currentLogo.timeRemaining ?? 0) - Math.floor(localElapsed),
			);
			setTimeRemaining(remaining);

			if (remaining <= 0) {
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [currentLogo?.serverTime, currentLogo?.timeRemaining]);

	useEffect(() => {
		if (timeRemaining !== null && timeRemaining <= 10 && timeRemaining > 0) {
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1.2,
					duration: 200,
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [timeRemaining, pulseAnim]);

	const handleSubmitGuess = useCallback(async () => {
		if (
			isSubmitting ||
			hasFinishedCurrentLogo ||
			timeRemaining === null ||
			timeRemaining <= 0
		)
			return;

		const guessText = guess.trim();
		if (!guessText) return;

		setIsSubmitting(true);
		Keyboard.dismiss();

		try {
			const timeRemainingMs = Math.max(0, (timeRemaining ?? 0) * 1000);

			const result = await submitGuess({
				activityId: activity._id,
				participantId,
				logoIndex: currentLogo?.index ?? 0,
				guess: guessText,
				timeRemainingMs,
				hintsUsed: hintsRevealed,
			});

			setLastResult(result);
			setGuess("");

			if (result.isCorrect) {
				resultScale.value = withSequence(
					withSpring(1.15, { damping: 8, stiffness: 400 }),
					withSpring(1, { damping: 10, stiffness: 300 }),
				);
				if (Platform.OS === "ios") {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
				}
			} else if (result.isClose) {
				resultScale.value = withSequence(
					withSpring(1.05, { damping: 10, stiffness: 400 }),
					withSpring(1, { damping: 10, stiffness: 300 }),
				);
				if (Platform.OS === "ios") {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
				}
			} else {
				resultShake.value = withSequence(
					withTiming(-10, { duration: 50 }),
					withTiming(10, { duration: 50 }),
					withTiming(-10, { duration: 50 }),
					withTiming(10, { duration: 50 }),
					withTiming(0, { duration: 50 }),
				);
				if (Platform.OS === "ios") {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
				}
			}
		} catch (error) {
			console.error("Failed to submit guess:", error);
		} finally {
			setIsSubmitting(false);
		}
	}, [
		guess,
		isSubmitting,
		hasFinishedCurrentLogo,
		timeRemaining,
		submitGuess,
		activity._id,
		participantId,
		currentLogo?.index,
		hintsRevealed,
		resultScale,
		resultShake,
	]);

	const revealHint = useCallback(() => {
		if (currentLogo?.hints && hintsRevealed < currentLogo.hints.length) {
			setHintsRevealed((prev) => prev + 1);
			if (Platform.OS === "ios") {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}
		}
	}, [currentLogo?.hints, hintsRevealed]);

	const getTimerColor = () => {
		if (timeRemaining === null) return mutedColor;
		if (timeRemaining <= 10) return dangerColor;
		if (timeRemaining <= 20) return warningColor;
		return accentColor;
	};

	const logoRevealStyle = useAnimatedStyle(() => ({
		height: revealProgress.value * 160,
		overflow: "hidden",
	}));

	const resultFeedbackStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: resultShake.value },
			{ scale: resultScale.value },
		],
	}));

	const timerProgress =
		timeRemaining !== null
			? Math.max(0, timeRemaining / config.timePerLogo)
			: 0;

	const isTimerExpired = timeRemaining !== null && timeRemaining <= 0;

	const leaderboardData = leaderboard?.leaderboard || [];

	if (!currentLogo) {
		return (
			<Container>
				<ScrollView className="flex-1" contentContainerClassName="p-4">
					<View className="items-center py-8">
						<Ionicons name="hourglass-outline" size={48} color={accentColor} />
						<Text className="mt-4 font-semibold text-foreground text-xl">
							Waiting for Game to Start
						</Text>
						<Text className="mt-2 text-center text-muted text-sm">
							The host will start the game shortly.
						</Text>
					</View>

					<View className="mt-4">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-foreground text-lg">
								Players Ready
							</Text>
							<Text className="text-muted text-sm">
								{leaderboardData.length} joined
							</Text>
						</View>

						{leaderboardData.length === 0 ? (
							<Surface
								variant="secondary"
								className="items-center justify-center rounded-lg py-8"
							>
								<Ionicons name="people-outline" size={32} color={mutedColor} />
								<Text className="mt-2 text-muted text-sm">
									Waiting for players to join...
								</Text>
							</Surface>
						) : (
							<Surface
								variant="secondary"
								className="overflow-hidden rounded-lg"
							>
								{leaderboardData.map((entry, index) => (
									<View
										key={entry.participantId}
										className={`flex-row items-center justify-between p-3 ${
											index > 0 ? "border-bg-muted border-t" : ""
										}`}
									>
										<View className="flex-row items-center gap-3">
											<View className="h-8 w-8 items-center justify-center rounded-full bg-muted">
												<Text className="font-bold text-foreground text-sm">
													{entry.participantName.charAt(0).toUpperCase()}
												</Text>
											</View>
											<Text className="text-foreground">
												{entry.participantName}
											</Text>
										</View>
										<Text className="font-medium text-muted text-sm">
											Ready
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

	return (
		<Container>
			<ScrollView
				className="flex-1"
				contentContainerClassName="p-4"
				keyboardShouldPersistTaps="handled"
			>
				<Surface variant="secondary" className="mb-4 rounded-lg p-4">
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-2">
							<Ionicons name="trophy" size={20} color={accentColor} />
							<Text className="font-semibold text-foreground">
								Score: {gameState?.score ?? 0}
							</Text>
						</View>
						<View className="flex-row items-center gap-3">
							<Chip size="sm" color="default">
								<Chip.Label>
									{`${(currentLogo?.index ?? 0) + 1}/${currentLogo?.totalLogos ?? config.logoCount}`}
								</Chip.Label>
							</Chip>
							{!isTimerExpired ? (
								<Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
									<Chip
										size="sm"
										color={
											timeRemaining !== null && timeRemaining <= 10
												? "danger"
												: "accent"
										}
									>
										<Chip.Label style={{ color: getTimerColor() }}>
											{timeRemaining !== null ? `${timeRemaining}s` : "..."}
										</Chip.Label>
									</Chip>
								</Animated.View>
							) : (
								<Chip size="sm" color="default">
									<Chip.Label style={{ color: mutedColor }}>
										{"Waiting"}
									</Chip.Label>
								</Chip>
							)}
						</View>
					</View>
					{gameState?.streak !== undefined && gameState.streak > 1 && (
						<View className="mt-2 flex-row items-center gap-1">
							<Ionicons name="flame" size={16} color={warningColor} />
							<Text className="text-sm" style={{ color: warningColor }}>
								{gameState.streak} streak!
							</Text>
						</View>
					)}
					{isTimerExpired ? (
						<View className="mt-3 items-center rounded-lg bg-muted/50 py-3">
							<Ionicons name="time-outline" size={20} color={mutedColor} />
							<Text className="mt-1 font-medium text-muted text-sm">
								Waiting for next logo...
							</Text>
						</View>
					) : (
						<View className="mt-3">
							<View className="mb-1 flex-row items-center justify-between">
								<Text className="text-muted text-xs">Time Remaining</Text>
								<Text
									className="font-bold text-sm"
									style={{ color: getTimerColor() }}
								>
									{timeRemaining !== null ? `${timeRemaining}s` : "..."}
								</Text>
							</View>
							<View className="h-3 flex-row overflow-hidden rounded-full bg-muted">
								<View
									className="h-full rounded-full"
									style={{
										backgroundColor: getTimerColor(),
										flex: timerProgress,
									}}
								/>
								<View style={{ flex: 1 - timerProgress }} />
							</View>
						</View>
					)}
				</Surface>

				<View className="mb-6 items-center justify-center rounded-2xl bg-white p-6">
					<ReanimatedModule.View style={logoRevealStyle}>
						<Image
							source={{ uri: currentLogo.logoUrl }}
							style={{ width: 160, height: 160 }}
							resizeMode="contain"
							onError={() => {}}
						/>
					</ReanimatedModule.View>
				</View>

				{config.showHints && currentLogo.hints.length > 0 && (
					<Surface variant="secondary" className="mb-4 rounded-lg p-4">
						<View className="flex-row items-center justify-between">
							<Text className="font-medium text-foreground">Hints</Text>
							{hintsRevealed < currentLogo.hints.length &&
								!hasFinishedCurrentLogo && (
									<Pressable onPress={revealHint}>
										<View className="flex-row items-center gap-1">
											<Ionicons
												name="bulb-outline"
												size={16}
												color={accentColor}
											/>
											<Text className="text-sm" style={{ color: accentColor }}>
												Reveal (-10 pts)
											</Text>
										</View>
									</Pressable>
								)}
						</View>
						{hintsRevealed > 0 && (
							<View className="mt-3 gap-2">
								{currentLogo.hints.slice(0, hintsRevealed).map((hint, i) => (
									<View key={i} className="flex-row items-start gap-2">
										<Text className="text-muted">{i + 1}.</Text>
										<Text className="flex-1 text-foreground text-sm">
											{hint}
										</Text>
									</View>
								))}
							</View>
						)}
						{hintsRevealed === 0 && (
							<Text className="mt-2 text-muted text-xs">
								Tap "Reveal" to see a hint (costs 10 points each)
							</Text>
						)}
					</Surface>
				)}

				{lastResult && (
					<ReanimatedModule.View style={resultFeedbackStyle}>
						<Surface
							variant="secondary"
							className="mb-4 rounded-lg p-4"
							style={{
								borderColor: lastResult.isCorrect
									? successColor
									: lastResult.isClose
										? warningColor
										: dangerColor,
								borderWidth: 2,
							}}
						>
							<View className="items-center gap-2">
								<Ionicons
									name={
										lastResult.isCorrect
											? "checkmark-circle"
											: lastResult.isClose
												? "alert-circle"
												: "close-circle"
									}
									size={48}
									color={
										lastResult.isCorrect
											? successColor
											: lastResult.isClose
												? warningColor
												: dangerColor
									}
								/>
								<Text
									className="font-bold text-xl"
									style={{
										color: lastResult.isCorrect
											? successColor
											: lastResult.isClose
												? warningColor
												: dangerColor,
									}}
								>
									{lastResult.isCorrect
										? "Correct!"
										: lastResult.isClose
											? "You're close!"
											: "Wrong!"}
								</Text>
								{lastResult.isCorrect && (
									<Text className="text-foreground">
										+{lastResult.pointsEarned} points
									</Text>
								)}
								{!lastResult.isCorrect &&
									lastResult.canRetry &&
									!isTimerExpired && (
										<View className="items-center gap-1">
											<Text className="text-muted text-sm">
												Attempt {lastResult.attemptNumber} of 5
											</Text>
											<Text className="text-muted text-sm">
												Next attempt worth {lastResult.nextAttemptPoints} points
											</Text>
										</View>
									)}
								{!lastResult.isCorrect &&
									(!lastResult.canRetry || isTimerExpired) &&
									lastResult.correctAnswer && (
										<Text className="text-center text-muted">
											The answer was:{" "}
											<Text className="font-medium text-foreground">
												{lastResult.correctAnswer}
											</Text>
										</Text>
									)}
								{(lastResult.isCorrect ||
									!lastResult.canRetry ||
									isTimerExpired) && (
									<Text className="mt-2 text-muted text-sm">
										Waiting for next logo...
									</Text>
								)}
							</View>
						</Surface>
					</ReanimatedModule.View>
				)}

				{!hasFinishedCurrentLogo &&
					!isTimerExpired &&
					timeRemaining !== null && (
						<View className="mb-6 gap-3">
							{attemptCount > 0 && (
								<View className="flex-row items-center justify-center gap-2">
									<Ionicons name="refresh" size={14} color={mutedColor} />
									<Text className="text-muted text-sm">
										Attempt {attemptCount + 1} of 5 (worth{" "}
										{[100, 75, 50, 25, 10][attemptCount] || 10} pts)
									</Text>
								</View>
							)}
							<TextInput
								className="h-12 rounded-lg border border-muted bg-background px-4 text-foreground"
								placeholder="Type your guess..."
								placeholderTextColor={mutedColor}
								value={guess}
								onChangeText={setGuess}
								onSubmitEditing={handleSubmitGuess}
								editable={!isSubmitting}
								autoCapitalize="words"
								autoCorrect={false}
							/>
							<Pressable
								onPress={handleSubmitGuess}
								disabled={!guess.trim() || isSubmitting}
							>
								<View
									className={`h-12 items-center justify-center rounded-lg ${
										!guess.trim() || isSubmitting ? "bg-muted" : "bg-primary"
									}`}
								>
									<Text
										className={`font-semibold ${
											!guess.trim() || isSubmitting
												? "text-muted-foreground"
												: "text-white"
										}`}
									>
										{isSubmitting
											? "Submitting..."
											: attemptCount > 0
												? "Try Again"
												: "Submit Guess"}
									</Text>
								</View>
							</Pressable>
						</View>
					)}

				{isTimerExpired && !hasFinishedCurrentLogo && (
					<Surface variant="secondary" className="mb-4 rounded-lg p-4">
						<View className="items-center gap-2">
							<Ionicons name="time-outline" size={48} color={mutedColor} />
							<Text className="font-bold text-foreground text-xl">
								Time's up!
							</Text>
							<Text className="text-muted text-sm">
								Waiting for next logo...
							</Text>
						</View>
					</Surface>
				)}

				<View className="mb-4">
					<View className="mb-3 flex-row items-center justify-between">
						<Text className="font-semibold text-foreground">Leaderboard</Text>
						{leaderboard && (
							<Text className="text-muted text-xs">
								{leaderboard.totalParticipants} players
							</Text>
						)}
					</View>

					{leaderboardData.length === 0 ? (
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
							{leaderboardData.slice(0, 10).map((entry, index) => (
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
										<View>
											<Text className="text-foreground">
												{entry.participantName}
											</Text>
											<Text className="text-muted text-xs">
												{entry.correctCount} correct
											</Text>
										</View>
									</View>
									<Text className="font-semibold text-foreground text-lg">
										{entry.score}
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
