"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	BarChart3,
	Cloud,
	Eye,
	ImageIcon,
	MessageSquare,
	Pencil,
	Plus,
	Radio,
	Trash2,
	Zap,
} from "lucide-react";
import Link from "next/link";
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

type ActivityType =
	| "poll"
	| "word_cloud"
	| "reaction_speed"
	| "anonymous_chat"
	| "guess_logo";
type ActivityStatus = "draft" | "scheduled" | "live" | "ended";

type Activity = {
	_id: Id<"liveActivities">;
	type: ActivityType;
	title: string;
	status: ActivityStatus;
	scheduledStartTime?: number;
	actualStartTime?: number;
	createdAt: number;
};

const getActivityIcon = (type: ActivityType) => {
	switch (type) {
		case "poll":
			return <BarChart3 className="h-5 w-5" />;
		case "word_cloud":
			return <Cloud className="h-5 w-5" />;
		case "reaction_speed":
			return <Zap className="h-5 w-5" />;
		case "anonymous_chat":
			return <MessageSquare className="h-5 w-5" />;
		case "guess_logo":
			return <ImageIcon className="h-5 w-5" />;
	}
};

const getActivityLabel = (type: ActivityType) => {
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

const getStatusBadgeVariant = (status: ActivityStatus) => {
	switch (status) {
		case "live":
			return "default";
		case "scheduled":
			return "secondary";
		case "draft":
			return "outline";
		case "ended":
			return "outline";
	}
};

export default function ActivitiesPage() {
	const event = useQuery(api.events.getCurrentEvent);
	const activities = useQuery(
		api.liveActivities.getByEvent,
		event ? { eventId: event._id } : "skip",
	) as Activity[] | undefined;

	const removeActivity = useMutation(api.liveActivities.remove);

	const handleDelete = async (id: Id<"liveActivities">) => {
		if (!confirm("Are you sure you want to delete this activity?")) return;

		try {
			await removeActivity({ id });
			toast.success("Activity deleted");
		} catch (error) {
			toast.error("Failed to delete activity");
		}
	};

	if (!event) {
		return (
			<div className="mx-auto w-full max-w-4xl py-10">
				<Card>
					<CardContent className="py-10 text-center">
						<p className="text-muted-foreground">Loading event...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const liveActivities = activities?.filter((a) => a.status === "live") || [];
	const scheduledActivities =
		activities?.filter((a) => a.status === "scheduled") || [];
	const draftActivities = activities?.filter((a) => a.status === "draft") || [];
	const endedActivities = activities?.filter((a) => a.status === "ended") || [];

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 py-10">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="flex items-center gap-2">
								<Radio className="h-5 w-5" />
								Live Activities
							</CardTitle>
							<CardDescription>
								Create interactive activities for participants
							</CardDescription>
						</div>
						<Link href="/activities/create">
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Create Activity
							</Button>
						</Link>
					</div>
				</CardHeader>
			</Card>

			{activities === undefined && (
				<Card>
					<CardContent className="py-10 text-center">
						<p className="text-muted-foreground">Loading activities...</p>
					</CardContent>
				</Card>
			)}

			{activities && activities.length === 0 && (
				<Card>
					<CardContent className="py-10 text-center">
						<Radio className="mx-auto h-12 w-12 text-muted-foreground" />
						<p className="mt-4 font-medium">No activities yet</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Create your first activity to engage participants
						</p>
						<Link href="/activities/create">
							<Button className="mt-4">
								<Plus className="mr-2 h-4 w-4" />
								Create Activity
							</Button>
						</Link>
					</CardContent>
				</Card>
			)}

			{liveActivities.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<span className="relative flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
							</span>
							Live Now
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{liveActivities.map((activity) => (
							<ActivityCard
								key={activity._id}
								activity={activity}
								onDelete={() => handleDelete(activity._id)}
							/>
						))}
					</CardContent>
				</Card>
			)}

			{scheduledActivities.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Scheduled</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{scheduledActivities.map((activity) => (
							<ActivityCard
								key={activity._id}
								activity={activity}
								onDelete={() => handleDelete(activity._id)}
							/>
						))}
					</CardContent>
				</Card>
			)}

			{draftActivities.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Drafts</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{draftActivities.map((activity) => (
							<ActivityCard
								key={activity._id}
								activity={activity}
								onDelete={() => handleDelete(activity._id)}
							/>
						))}
					</CardContent>
				</Card>
			)}

			{endedActivities.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Ended</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{endedActivities.map((activity) => (
							<ActivityCard
								key={activity._id}
								activity={activity}
								onDelete={() => handleDelete(activity._id)}
							/>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function ActivityCard({
	activity,
	onDelete,
}: {
	activity: Activity;
	onDelete: () => void;
}) {
	const canEdit =
		activity.status === "draft" || activity.status === "scheduled";

	return (
		<div className="flex items-center justify-between rounded-lg border bg-card p-4">
			<div className="flex items-center gap-4">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
					{getActivityIcon(activity.type)}
				</div>
				<div>
					<div className="flex items-center gap-2">
						<span className="font-medium">{activity.title}</span>
						<Badge variant={getStatusBadgeVariant(activity.status)}>
							{activity.status === "live" && <Radio className="mr-1 h-3 w-3" />}
							{activity.status}
						</Badge>
					</div>
					<p className="text-muted-foreground text-sm">
						{getActivityLabel(activity.type)}
						{activity.scheduledStartTime && activity.status === "scheduled" && (
							<span>
								{" "}
								· Scheduled for{" "}
								{new Date(activity.scheduledStartTime).toLocaleString()}
							</span>
						)}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Link href={`/activities/${activity._id}`}>
					<Button variant="outline" size="sm">
						<Eye className="mr-1 h-4 w-4" />
						View
					</Button>
				</Link>
				{canEdit && (
					<Link href={`/activities/${activity._id}/edit`}>
						<Button variant="outline" size="sm">
							<Pencil className="mr-1 h-4 w-4" />
							Edit
						</Button>
					</Link>
				)}
				<Button variant="ghost" size="icon" onClick={onDelete}>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
