import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Chip, Spinner, Surface, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Container } from "@/components/container";
import { AnimatedActivityCard } from "@/components/ui/AnimatedActivityCard";
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
				<Animated.View entering={FadeIn.duration(400)} className="mb-6">
					<Text className="font-semibold text-2xl text-foreground tracking-tight">
						Live Activities
					</Text>
					<Text className="mt-1 text-muted text-sm">
						Join interactive activities and engage with others
					</Text>
				</Animated.View>

				{activities === undefined && (
					<View className="items-center justify-center py-8">
						<Spinner size="md" />
					</View>
				)}

				{activities && activities.length === 0 && (
					<Animated.View entering={FadeIn.delay(200).duration(400)}>
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
					</Animated.View>
				)}

				{liveActivities.length > 0 && (
					<View className="mb-6">
						<Animated.View
							entering={FadeIn.duration(300)}
							className="mb-3 flex-row items-center justify-between"
						>
							<Text className="font-semibold text-foreground">
								Happening Now
							</Text>
							<Chip variant="primary" color="success" size="sm">
								<Chip.Label>{liveActivities.length}</Chip.Label>
							</Chip>
						</Animated.View>
						<View className="gap-3">
							{liveActivities.map((activity, index) => (
								<AnimatedActivityCard
									key={activity._id}
									activity={activity}
									index={index}
									onPress={() => handleActivityPress(activity)}
								/>
							))}
						</View>
					</View>
				)}

				{scheduledActivities.length > 0 && (
					<View>
						<Animated.View
							entering={FadeIn.delay(liveActivities.length * 80 + 100).duration(
								300,
							)}
							className="mb-3 flex-row items-center justify-between"
						>
							<Text className="font-semibold text-foreground">Coming Up</Text>
							<Chip variant="secondary" size="sm">
								<Chip.Label>{scheduledActivities.length}</Chip.Label>
							</Chip>
						</Animated.View>
						<View className="gap-3">
							{scheduledActivities.map((activity, index) => (
								<AnimatedActivityCard
									key={activity._id}
									activity={activity}
									index={liveActivities.length + index}
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
