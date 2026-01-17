import { api } from "@event-schedulr/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { Chip, type ChipColor, Surface } from "heroui-native";
import { Image, Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";
import { colors } from "@/constants/colors";
import { useParticipant } from "@/contexts/participant-context";

function generateAvatarUrl(avatarSeed: string): string {
	const dashIndex = avatarSeed.indexOf("-");
	if (dashIndex === -1) {
		return `https://api.dicebear.com/9.x/adventurer/png?seed=${avatarSeed}&size=200`;
	}
	const seed = avatarSeed.substring(0, dashIndex);
	const style = avatarSeed.substring(dashIndex + 1);
	return `https://api.dicebear.com/9.x/${style}/png?seed=${seed}&size=200`;
}

function formatTimeUntil(timestamp: number): string {
	const now = Date.now();
	const diff = timestamp - now;

	if (diff <= 0) return "Now";

	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `in ${days}d ${hours % 24}h`;
	if (hours > 0) return `in ${hours}h ${minutes % 60}m`;
	return `in ${minutes}m`;
}

function StatCard({
	icon,
	label,
	value,
	color,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	value: number | string;
	color: string;
}) {
	return (
		<Surface
			variant="secondary"
			className="flex-1 items-center rounded-2xl p-4"
		>
			<View
				className="mb-2 h-10 w-10 items-center justify-center rounded-full"
				style={{ backgroundColor: `${color}20` }}
			>
				<Ionicons name={icon} size={20} color={color} />
			</View>
			<Text className="font-bold text-2xl text-foreground">{value}</Text>
			<Text className="text-muted text-xs">{label}</Text>
		</Surface>
	);
}

export default function Home() {
	const { session } = useParticipant();

	const event = useQuery(api.events.getCurrentEvent, session ? {} : "skip");
	const participants = useQuery(
		api.participants.getByEvent,
		event ? { eventId: event._id } : "skip",
	);
	const activities = useQuery(
		api.liveActivities.getActiveByEvent,
		event ? { eventId: event._id } : "skip",
	);
	const announcements = useQuery(
		api.announcements.getByEvent,
		event ? { eventId: event._id } : "skip",
	);
	const nextSession = useQuery(
		api.schedule.getNextUpcomingSession,
		event ? { eventId: event._id } : "skip",
	);
	const currentSession = useQuery(
		api.schedule.getCurrentSession,
		event ? { eventId: event._id } : "skip",
	);

	const sessionToShow = currentSession || nextSession;
	const recentAnnouncements = announcements?.slice(0, 3) || [];
	const liveActivities = activities?.filter((a) => a.status === "live") || [];

	return (
		<Container className="px-4">
			{/* Welcome Header */}
			<View className="mb-6 pt-2">
				<View className="flex-row items-center justify-between">
					<View className="flex-1 flex-row items-center gap-3">
						{session && (
							<Image
								source={{ uri: generateAvatarUrl(session.avatarSeed) }}
								className="h-14 w-14 rounded-2xl bg-bg-card"
							/>
						)}
						<View className="flex-1">
							<Text className="text-muted text-sm">Welcome back,</Text>
							<Text className="font-semibold text-foreground text-xl">
								{session?.name || "Guest"}
							</Text>
						</View>
					</View>
					{event && (
						<Chip
							size="sm"
							color={
								(event.status === "live"
									? "success"
									: event.status === "upcoming"
										? "primary"
										: "default") as ChipColor
							}
						>
							{event.status === "live" && "● "}
							{event.status.charAt(0).toUpperCase() + event.status.slice(1)}
						</Chip>
					)}
				</View>
			</View>

			{/* Event Card */}
			{event && (
				<Surface variant="secondary" className="mb-4 rounded-2xl p-4">
					<Text className="font-bold text-foreground text-lg">
						{event.name}
					</Text>
					<Text className="mt-1 text-muted text-sm" numberOfLines={2}>
						{event.description}
					</Text>
				</Surface>
			)}

			{/* Stats Row */}
			<View className="mb-4 flex-row gap-3">
				<StatCard
					icon="people"
					label="Participants"
					value={participants?.length ?? 0}
					color={colors.primary.default}
				/>
				<StatCard
					icon="play-circle"
					label="Activities"
					value={activities?.length ?? 0}
					color={colors.semantic.success}
				/>
				<StatCard
					icon="megaphone"
					label="Announcements"
					value={announcements?.length ?? 0}
					color={colors.semantic.warning}
				/>
			</View>

			{/* Live Now Section */}
			{liveActivities.length > 0 && (
				<View className="mb-4">
					<View className="mb-2 flex-row items-center gap-2">
						<View className="h-2 w-2 rounded-full bg-success" />
						<Text className="font-semibold text-foreground">Happening Now</Text>
					</View>
					{liveActivities.slice(0, 2).map((activity) => (
						<Pressable
							key={activity._id}
							onPress={() => router.push(`/activity/${activity._id}`)}
						>
							<Surface
								variant="secondary"
								className="mb-2 flex-row items-center gap-3 rounded-2xl border border-success/30 p-4"
							>
								<View className="h-10 w-10 items-center justify-center rounded-xl bg-success/20">
									<Ionicons
										name="play"
										size={20}
										color={colors.semantic.success}
									/>
								</View>
								<View className="flex-1">
									<Text className="font-medium text-foreground">
										{activity.title}
									</Text>
									<Text className="text-success text-xs">Live now</Text>
								</View>
								<Ionicons
									name="chevron-forward"
									size={20}
									color={colors.text.muted}
								/>
							</Surface>
						</Pressable>
					))}
				</View>
			)}

			{/* Next/Current Session */}
			{sessionToShow && (
				<View className="mb-4">
					<Text className="mb-2 font-semibold text-foreground">
						{currentSession ? "Happening Now" : "Coming Up"}
					</Text>
					<Surface variant="secondary" className="rounded-2xl p-4">
						<View className="flex-row items-center gap-3">
							<View
								className="h-12 w-12 items-center justify-center rounded-xl"
								style={{ backgroundColor: `${colors.primary.default}20` }}
							>
								<Ionicons
									name={
										sessionToShow.type === "talk"
											? "mic"
											: sessionToShow.type === "workshop"
												? "construct"
												: sessionToShow.type === "break"
													? "cafe"
													: sessionToShow.type === "meal"
														? "restaurant"
														: "calendar"
									}
									size={24}
									color={colors.primary.default}
								/>
							</View>
							<View className="flex-1">
								<Text className="font-medium text-foreground">
									{sessionToShow.title}
								</Text>
								<Text className="text-muted text-sm">
									{currentSession
										? "In progress"
										: formatTimeUntil(sessionToShow.startTime)}
								</Text>
							</View>
						</View>
						{sessionToShow.speaker && (
							<View className="mt-3 flex-row items-center gap-2">
								<Ionicons
									name="person-outline"
									size={14}
									color={colors.text.muted}
								/>
								<Text className="text-muted text-xs">
									{sessionToShow.speaker}
								</Text>
							</View>
						)}
						{sessionToShow.location && (
							<View className="mt-1 flex-row items-center gap-2">
								<Ionicons
									name="location-outline"
									size={14}
									color={colors.text.muted}
								/>
								<Text className="text-muted text-xs">
									{sessionToShow.location}
								</Text>
							</View>
						)}
					</Surface>
				</View>
			)}

			{/* Recent Announcements */}
			{recentAnnouncements.length > 0 && (
				<View className="mb-4">
					<View className="mb-2 flex-row items-center justify-between">
						<Text className="font-semibold text-foreground">
							Recent Announcements
						</Text>
						<Pressable onPress={() => router.push("/(tabs)/announcements")}>
							<Text className="text-primary text-sm">See all</Text>
						</Pressable>
					</View>
					{recentAnnouncements.map((announcement) => (
						<Surface
							key={announcement._id}
							variant="secondary"
							className="mb-2 flex-row items-start gap-3 rounded-xl p-3"
						>
							<View
								className={`mt-1 h-2 w-2 rounded-full ${
									announcement.type === "warning"
										? "bg-warning"
										: announcement.type === "success"
											? "bg-success"
											: "bg-primary"
								}`}
							/>
							<Text
								className="flex-1 text-foreground text-sm"
								numberOfLines={2}
							>
								{announcement.message}
							</Text>
						</Surface>
					))}
				</View>
			)}

			{/* Empty State */}
			{!event && (
				<View className="flex-1 items-center justify-center py-20">
					<Ionicons
						name="calendar-outline"
						size={48}
						color={colors.text.muted}
					/>
					<Text className="mt-4 font-medium text-foreground">
						No Event Found
					</Text>
					<Text className="mt-1 text-center text-muted text-sm">
						You haven't joined any event yet.
					</Text>
				</View>
			)}
		</Container>
	);
}
