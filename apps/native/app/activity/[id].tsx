import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Spinner, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ChatActivity } from "@/components/activities/chat-activity";
import { GuessLogoActivity } from "@/components/activities/guess-logo-activity";
import { PollActivity } from "@/components/activities/poll-activity";
import { ReactionActivity } from "@/components/activities/reaction-activity";
import { WordCloudActivity } from "@/components/activities/word-cloud-activity";
import { Container } from "@/components/container";
import { useParticipant } from "@/contexts/participant-context";

const getActivityTitle = (type: string) => {
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
		default:
			return "Activity";
	}
};

export default function ActivityScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { session } = useParticipant();
	const mutedColor = useThemeColor("muted");

	const activity = useQuery(
		api.liveActivities.getById,
		id ? { id: id as Id<"liveActivities"> } : "skip",
	);

	if (!id) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center p-4">
					<Ionicons name="alert-circle-outline" size={48} color={mutedColor} />
					<Text className="mt-4 font-medium text-foreground text-lg">
						Activity Not Found
					</Text>
				</View>
			</Container>
		);
	}

	if (activity === undefined) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center">
					<Spinner size="lg" />
					<Text className="mt-3 text-muted text-sm">Loading activity...</Text>
				</View>
			</Container>
		);
	}

	if (!activity) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center p-4">
					<Ionicons name="alert-circle-outline" size={48} color={mutedColor} />
					<Text className="mt-4 font-medium text-foreground text-lg">
						Activity Not Found
					</Text>
					<Text className="mt-2 text-center text-muted text-sm">
						This activity may have been removed.
					</Text>
				</View>
			</Container>
		);
	}

	if (activity.status === "ended") {
		return (
			<Container>
				<View className="flex-1 items-center justify-center p-4">
					<Ionicons name="time-outline" size={48} color={mutedColor} />
					<Text className="mt-4 font-medium text-foreground text-lg">
						Activity Ended
					</Text>
					<Text className="mt-2 text-center text-muted text-sm">
						This activity has ended.
					</Text>
				</View>
			</Container>
		);
	}

	if (activity.type !== "guess_logo" && activity.status !== "live") {
		return (
			<Container>
				<View className="flex-1 items-center justify-center p-4">
					<Ionicons name="time-outline" size={48} color={mutedColor} />
					<Text className="mt-4 font-medium text-foreground text-lg">
						Activity Not Available
					</Text>
					<Text className="mt-2 text-center text-muted text-sm">
						This activity hasn't started yet.
					</Text>
				</View>
			</Container>
		);
	}

	if (!session) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center p-4">
					<Ionicons name="person-outline" size={48} color={mutedColor} />
					<Text className="mt-4 font-medium text-foreground text-lg">
						Not Signed In
					</Text>
					<Text className="mt-2 text-center text-muted text-sm">
						Please sign in to participate in this activity.
					</Text>
				</View>
			</Container>
		);
	}

	const participantId = session.participantId as Id<"participants">;

	return (
		<>
			<Stack.Screen
				options={{
					headerTitle: activity.title || getActivityTitle(activity.type),
				}}
			/>
			{activity.type === "poll" && (
				<PollActivity
					activity={activity as Parameters<typeof PollActivity>[0]["activity"]}
					participantId={participantId}
				/>
			)}
			{activity.type === "word_cloud" && (
				<WordCloudActivity
					activity={
						activity as Parameters<typeof WordCloudActivity>[0]["activity"]
					}
					participantId={participantId}
				/>
			)}
			{activity.type === "reaction_speed" && (
				<ReactionActivity
					activity={
						activity as Parameters<typeof ReactionActivity>[0]["activity"]
					}
					participantId={participantId}
				/>
			)}
			{activity.type === "anonymous_chat" && (
				<ChatActivity
					activity={activity as Parameters<typeof ChatActivity>[0]["activity"]}
					participantId={participantId}
				/>
			)}
			{activity.type === "guess_logo" && (
				<GuessLogoActivityWrapper
					activity={
						activity as Parameters<typeof GuessLogoActivity>[0]["activity"]
					}
					participantId={participantId}
				/>
			)}
		</>
	);
}

function GuessLogoActivityWrapper({
	activity,
	participantId,
}: {
	activity: Parameters<typeof GuessLogoActivity>[0]["activity"];
	participantId: Id<"participants">;
}) {
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const [hasJoined, setHasJoined] = useState(false);
	const [joinError, setJoinError] = useState<string | null>(null);

	const canJoin = useQuery(api.guessLogo.canJoinActivity, {
		activityId: activity._id,
	});
	const joinActivity = useMutation(api.guessLogo.joinActivity);

	useEffect(() => {
		if (canJoin === undefined) return;
		if (!canJoin.canJoin) return;
		if (hasJoined) return;

		joinActivity({
			activityId: activity._id,
			participantId,
		})
			.then(() => {
				setHasJoined(true);
			})
			.catch((error) => {
				setJoinError(error.message || "Failed to join activity");
			});
	}, [canJoin, hasJoined, activity._id, participantId, joinActivity]);

	if (canJoin === undefined) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center">
					<Spinner size="lg" />
					<Text className="mt-3 text-muted text-sm">Loading...</Text>
				</View>
			</Container>
		);
	}

	if (!canJoin.canJoin) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center p-4">
					<Ionicons name="close-circle-outline" size={48} color={dangerColor} />
					<Text className="mt-4 font-medium text-foreground text-lg">
						{canJoin.reason === "ended"
							? "Game Has Ended"
							: canJoin.reason === "not_found"
								? "Activity Not Found"
								: "Cannot Join"}
					</Text>
					<Text className="mt-2 text-center text-muted text-sm">
						{canJoin.reason === "ended"
							? "This game has already ended."
							: canJoin.reason === "not_found"
								? "This activity does not exist."
								: "Unable to join this activity."}
					</Text>
				</View>
			</Container>
		);
	}

	if (joinError) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center p-4">
					<Ionicons name="alert-circle-outline" size={48} color={dangerColor} />
					<Text className="mt-4 font-medium text-foreground text-lg">
						Join Failed
					</Text>
					<Text className="mt-2 text-center text-muted text-sm">
						{joinError}
					</Text>
				</View>
			</Container>
		);
	}

	if (!hasJoined) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center">
					<Spinner size="lg" />
					<Text className="mt-3 text-muted text-sm">Joining game...</Text>
				</View>
			</Container>
		);
	}

	return <GuessLogoActivity activity={activity} participantId={participantId} />;
}
