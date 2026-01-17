"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ExternalLink, Pause, Play, Square } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActivityQuickActionsProps {
	activityId: Id<"liveActivities">;
	status: string;
	title: string;
}

export function ActivityQuickActions({
	activityId,
	status,
	title,
}: ActivityQuickActionsProps) {
	const startActivity = useMutation(api.liveActivities.start);
	const endActivity = useMutation(api.liveActivities.end);

	const handleStart = async () => {
		try {
			await startActivity({ id: activityId });
			toast.success("Activity started!");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to start activity",
			);
		}
	};

	const handleEnd = async () => {
		if (!confirm("Are you sure you want to end this activity?")) return;
		try {
			await endActivity({ id: activityId });
			toast.success("Activity ended!");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to end activity",
			);
		}
	};

	const handlePresent = () => {
		window.open(`/activities/${activityId}/present`, "_blank");
	};

	const getStatusBadge = () => {
		switch (status) {
			case "live":
				return (
					<Badge className="bg-green-500/20 text-green-500">
						<span className="relative mr-2 flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
							<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
						</span>
						Live
					</Badge>
				);
			case "scheduled":
				return <Badge variant="secondary">Scheduled</Badge>;
			case "draft":
				return <Badge variant="outline">Draft</Badge>;
			case "ended":
				return <Badge variant="outline">Ended</Badge>;
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<div className="flex items-center gap-3">
				<h1 className="font-semibold text-2xl">{title}</h1>
				{getStatusBadge()}
			</div>

			<div className="flex items-center gap-2">
				<Button variant="outline" onClick={handlePresent}>
					<ExternalLink className="mr-2 h-4 w-4" />
					Present
				</Button>

				{(status === "draft" || status === "scheduled") && (
					<Button onClick={handleStart}>
						<Play className="mr-2 h-4 w-4" />
						Start Activity
					</Button>
				)}

				{status === "live" && (
					<Button variant="destructive" onClick={handleEnd}>
						<Square className="mr-2 h-4 w-4" />
						End Activity
					</Button>
				)}
			</div>
		</div>
	);
}
