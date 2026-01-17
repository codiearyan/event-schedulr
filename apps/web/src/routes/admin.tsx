import { convexQuery } from "@convex-dev/react-query";
import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import {
	AlertCircle,
	CheckCircle,
	Info,
	Megaphone,
	Radio,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin")({
	component: AdminRoute,
});

type EventStatus = "upcoming" | "live" | "ended";
type AnnouncementType = "info" | "warning" | "success";

function AdminRoute() {
	const [message, setMessage] = useState("");
	const [announcementType, setAnnouncementType] =
		useState<AnnouncementType>("info");

	const eventQuery = useSuspenseQuery(
		convexQuery(api.events.getCurrentEvent, {}),
	);
	const event = eventQuery.data;

	const announcements = useQuery(
		api.announcements.getByEvent,
		event ? { eventId: event._id } : "skip",
	);

	const seedEvent = useMutation(api.events.seed);
	const updateStatus = useMutation(api.events.updateStatus);
	const createAnnouncement = useMutation(api.announcements.create);
	const removeAnnouncement = useMutation(api.announcements.remove);

	useEffect(() => {
		if (!event) {
			seedEvent();
		}
	}, [event, seedEvent]);

	const handleStatusChange = async (status: EventStatus) => {
		if (!event) return;
		try {
			await updateStatus({ id: event._id, status });
			toast.success(`Event status changed to ${status}`);
		} catch {
			toast.error("Failed to update status");
		}
	};

	const handlePostAnnouncement = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!event || !message.trim()) return;

		try {
			await createAnnouncement({
				eventId: event._id,
				message: message.trim(),
				type: announcementType,
			});
			setMessage("");
			toast.success("Announcement posted");
		} catch {
			toast.error("Failed to post announcement");
		}
	};

	const handleDeleteAnnouncement = async (id: Id<"announcements">) => {
		try {
			await removeAnnouncement({ id });
			toast.success("Announcement deleted");
		} catch {
			toast.error("Failed to delete announcement");
		}
	};

	const getStatusBadgeVariant = (status: EventStatus) => {
		switch (status) {
			case "live":
				return "default";
			case "upcoming":
				return "secondary";
			case "ended":
				return "outline";
		}
	};

	const getAnnouncementIcon = (type: AnnouncementType) => {
		switch (type) {
			case "info":
				return <Info className="h-4 w-4" />;
			case "warning":
				return <AlertCircle className="h-4 w-4" />;
			case "success":
				return <CheckCircle className="h-4 w-4" />;
		}
	};

	const getAnnouncementStyle = (type: AnnouncementType) => {
		switch (type) {
			case "info":
				return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
			case "warning":
				return "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20";
			case "success":
				return "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
		}
	};

	if (!event) {
		return (
			<div className="mx-auto w-full max-w-2xl py-10">
				<Card>
					<CardContent className="py-10 text-center">
						<p className="text-muted-foreground">Setting up event...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 py-10">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="flex items-center gap-2">
								<Megaphone className="h-5 w-5" />
								Admin Dashboard
							</CardTitle>
							<CardDescription>
								Manage your event and post announcements
							</CardDescription>
						</div>
					</div>
				</CardHeader>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<CardTitle>{event.name}</CardTitle>
							<CardDescription>{event.description}</CardDescription>
						</div>
						<Badge variant={getStatusBadgeVariant(event.status)}>
							{event.status === "live" && <Radio className="h-3 w-3" />}
							{event.status}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<span className="text-muted-foreground text-sm">Event Status:</span>
						<Select value={event.status} onValueChange={handleStatusChange}>
							<SelectTrigger className="w-35">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="upcoming">Upcoming</SelectItem>
								<SelectItem value="live">Live</SelectItem>
								<SelectItem value="ended">Ended</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Post Announcement</CardTitle>
					<CardDescription>
						Send real-time updates to all participants
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handlePostAnnouncement} className="space-y-4">
						<div className="flex gap-3">
							<Select
								value={announcementType}
								onValueChange={(v) =>
									setAnnouncementType(v as AnnouncementType)
								}
							>
								<SelectTrigger className="w-30">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="info">
										<Info className="h-4 w-4" />
										Info
									</SelectItem>
									<SelectItem value="warning">
										<AlertCircle className="h-4 w-4" />
										Warning
									</SelectItem>
									<SelectItem value="success">
										<CheckCircle className="h-4 w-4" />
										Success
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Type your announcement here... (e.g., 'Lunch break in 5 minutes!')"
							className="min-h-25"
						/>
						<Button type="submit" disabled={!message.trim()} className="w-full">
							<Megaphone className="mr-2 h-4 w-4" />
							Post Announcement
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Recent Announcements</CardTitle>
					<CardDescription>
						{announcements?.length ?? 0} announcement
						{(announcements?.length ?? 0) !== 1 ? "s" : ""} posted
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!announcements || announcements.length === 0 ? (
						<p className="py-6 text-center text-muted-foreground">
							No announcements yet. Post one above!
						</p>
					) : (
						<div className="space-y-3">
							{announcements.map((announcement, index) => (
								<div key={announcement._id}>
									{index > 0 && <Separator className="my-3" />}
									<div
										className={`flex items-start justify-between rounded-md border-l-4 p-3 ${getAnnouncementStyle(announcement.type)}`}
									>
										<div className="flex gap-3">
											<div className="mt-0.5 text-muted-foreground">
												{getAnnouncementIcon(announcement.type)}
											</div>
											<div className="space-y-1">
												<p className="text-sm">{announcement.message}</p>
												<p className="text-muted-foreground text-xs">
													{new Date(
														announcement._creationTime,
													).toLocaleString()}
												</p>
											</div>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleDeleteAnnouncement(announcement._id)}
											aria-label="Delete announcement"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
