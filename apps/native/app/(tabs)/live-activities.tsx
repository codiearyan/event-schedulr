import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Chip, Spinner, Surface, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import {
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";

import { Container } from "@/components/container";
import { useLiveActivities } from "@/contexts/live-activities-context";
import { useParticipant } from "@/contexts/participant-context";

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

function ActivityCard({
	activity,
	onPress,
}: {
	activity: Activity;
	onPress: () => void;
}) {
	const mutedColor = useThemeColor("muted");
	const accentColor = useThemeColor("accent");

	return (
		<Pressable onPress={onPress}>
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
						<Chip.Label style={{ textTransform: "capitalize" }}>
							{activity.status === "live" ? "● Live" : activity.status}
						</Chip.Label>
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
	);
}

export default function LiveActivitiesScreen() {
	const router = useRouter();
	const { session } = useParticipant();
	const { markAllAsSeen } = useLiveActivities();
	const [refreshing, setRefreshing] = useState(false);

	const event = useQuery(api.events.getCurrentEvent);
	const activities = useQuery(
		api.liveActivities.getActiveByEvent,
		event ? { eventId: event._id } : "skip",
	) as Activity[] | undefined;

	const mutedColor = useThemeColor("muted");

	useEffect(() => {
		if (activities && activities.length > 0) {
			markAllAsSeen();
		}
	}, [activities, markAllAsSeen]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setTimeout(() => setRefreshing(false), 500);
	}, []);

	const handleActivityPress = (activity: Activity) => {
		if (activity.status === "live") {
			router.push(`/activity/${activity._id}`);
		}
	};

	const isLoading = event === undefined;

	if (isLoading) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center">
					<Spinner size="lg" />
					<Text className="mt-3 text-muted text-sm">Loading...</Text>
				</View>
			</Container>
		);
	}

	if (!event) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center p-4">
					<Ionicons name="calendar-outline" size={48} color={mutedColor} />
					<Text className="mt-4 font-medium text-foreground text-lg">
						No Active Event
					</Text>
					<Text className="mt-2 text-center text-muted text-sm">
						There is no event currently active. Check back later!
					</Text>
				</View>
			</Container>
		);
	}

	const liveActivities = activities?.filter((a) => a.status === "live") || [];
	const scheduledActivities =
		activities?.filter((a) => a.status === "scheduled") || [];

	return (
		<Container>
			<ScrollView
				className="flex-1"
				contentContainerClassName="p-4"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<View className="mb-6">
					<Text className="font-semibold text-2xl text-foreground tracking-tight">
						Live Activities
					</Text>
					<Text className="mt-1 text-muted text-sm">
						Join interactive activities and engage with others
					</Text>
				</View>

				{activities === undefined && (
					<View className="items-center justify-center py-8">
						<Spinner size="md" />
					</View>
				)}

				{activities && activities.length === 0 && (
					<Surface
						variant="secondary"
						className="items-center justify-center rounded-lg py-10"
					>
						<Ionicons name="diamond-outline" size={40} color={mutedColor} />
						<Text className="mt-3 font-medium text-foreground">
							No activities yet
						</Text>
						<Text className="mt-1 px-4 text-center text-muted text-xs">
							When the organizer starts an activity, it will appear here
						</Text>
					</Surface>
				)}

				{liveActivities.length > 0 && (
					<View className="mb-6">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-foreground">
								Happening Now
							</Text>
							<Chip variant="primary" color="success" size="sm">
								<Chip.Label>{liveActivities.length}</Chip.Label>
							</Chip>
						</View>
						<View className="gap-3">
							{liveActivities.map((activity) => (
								<ActivityCard
									key={activity._id}
									activity={activity}
									onPress={() => handleActivityPress(activity)}
								/>
							))}
						</View>
					</View>
				)}

				{scheduledActivities.length > 0 && (
					<View>
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-foreground">Coming Up</Text>
							<Chip variant="secondary" size="sm">
								<Chip.Label>{scheduledActivities.length}</Chip.Label>
							</Chip>
						</View>
						<View className="gap-3">
							{scheduledActivities.map((activity) => (
								<ActivityCard
									key={activity._id}
									activity={activity}
									onPress={() => handleActivityPress(activity)}
								/>
							))}
						</View>
					</View>
				)}
			</ScrollView>
		</Container>
	);
}
