import { api } from "@event-schedulr/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Chip, Spinner, Surface, useThemeColor } from "heroui-native";
import { ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

type AnnouncementType = "info" | "warning" | "success";

export default function ScheduleScreen() {
	const event = useQuery(api.events.getCurrentEvent);
	const announcements = useQuery(
		api.announcements.getByEvent,
		event ? { eventId: event._id } : "skip",
	);

	const mutedColor = useThemeColor("muted");
	const infoColor = useThemeColor("background-inverse");
	const warningColor = useThemeColor("warning");
	const successColor = useThemeColor("success");

	const getStatusColor = (status: string) => {
		switch (status) {
			case "live":
				return "success";
			case "upcoming":
				return "default";
			case "ended":
				return "default";
			default:
				return "default";
		}
	};

	const getAnnouncementIcon = (type: AnnouncementType) => {
		switch (type) {
			case "info":
				return "information-circle";
			case "warning":
				return "alert-circle";
			case "success":
				return "checkmark-circle";
		}
	};

	const getAnnouncementColor = (type: AnnouncementType) => {
		switch (type) {
			case "info":
				return infoColor;
			case "warning":
				return warningColor;
			case "success":
				return successColor;
		}
	};

	const getAnnouncementBgClass = (type: AnnouncementType) => {
		switch (type) {
			case "info":
				return "border-l-4 border-l-blue-500";
			case "warning":
				return "border-l-4 border-l-amber-500";
			case "success":
				return "border-l-4 border-l-emerald-500";
		}
	};

	const isLoading = event === undefined;

	if (isLoading) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center">
					<Spinner size="lg" />
					<Text className="mt-3 text-muted text-sm">Loading event...</Text>
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

	return (
		<Container>
			<ScrollView className="flex-1" contentContainerClassName="p-4">
				<Surface variant="secondary" className="mb-6 rounded-lg p-4">
					<View className="flex-row items-start justify-between">
						<View className="flex-1 pr-3">
							<Text className="font-semibold text-foreground text-xl tracking-tight">
								{event.name}
							</Text>
							<Text className="mt-2 text-muted text-sm">
								{event.description}
							</Text>
						</View>
						<Chip
							variant="primary"
							color={getStatusColor(event.status)}
							size="sm"
						>
							<Chip.Label style={{ textTransform: "capitalize" }}>
								{event.status === "live" ? `● ${event.status}` : event.status}
							</Chip.Label>
						</Chip>
					</View>
				</Surface>

				<View className="mb-4 flex-row items-center justify-between">
					<Text className="font-semibold text-foreground text-lg">
						Announcements
					</Text>
					{announcements && announcements.length > 0 && (
						<Chip variant="secondary" size="sm">
							<Chip.Label>{announcements.length}</Chip.Label>
						</Chip>
					)}
				</View>

				{announcements === undefined && (
					<View className="items-center justify-center py-8">
						<Spinner size="md" />
					</View>
				)}

				{announcements && announcements.length === 0 && (
					<Surface
						variant="secondary"
						className="items-center justify-center rounded-lg py-10"
					>
						<Ionicons name="megaphone-outline" size={40} color={mutedColor} />
						<Text className="mt-3 font-medium text-foreground">
							No announcements yet
						</Text>
						<Text className="mt-1 text-center text-muted text-xs">
							Announcements from organizers will appear here
						</Text>
					</Surface>
				)}

				{announcements && announcements.length > 0 && (
					<View className="gap-3">
						{announcements.map((announcement) => (
							<Surface
								key={announcement._id}
								variant="secondary"
								className={`rounded-lg p-4 ${getAnnouncementBgClass(
									announcement.type,
								)}`}
							>
								<View className="flex-row items-start gap-3">
									<Ionicons
										name={getAnnouncementIcon(announcement.type)}
										size={20}
										color={getAnnouncementColor(announcement.type)}
									/>
									<View className="flex-1">
										<Text className="text-foreground text-sm">
											{announcement.message}
										</Text>
										<Text className="mt-2 text-muted text-xs">
											{new Date(announcement._creationTime).toLocaleString()}
										</Text>
									</View>
								</View>
							</Surface>
						))}
					</View>
				)}
			</ScrollView>
		</Container>
	);
}
