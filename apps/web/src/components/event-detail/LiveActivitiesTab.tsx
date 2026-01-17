"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	BarChart3,
	Cloud,
	MessageSquare,
	Play,
	Plus,
	Square,
	Target,
	Timer,
	Trash2,
	Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LiveActivitiesTabProps {
	eventId: Id<"events">;
}

const activityIcons: Record<string, React.ElementType> = {
	poll: BarChart3,
	word_cloud: Cloud,
	reaction_speed: Zap,
	anonymous_chat: MessageSquare,
	guess_logo: Target,
};

const activityLabels: Record<string, string> = {
	poll: "Poll",
	word_cloud: "Word Cloud",
	reaction_speed: "Reaction Speed",
	anonymous_chat: "Anonymous Chat",
	guess_logo: "Guess the Logo",
};

export function LiveActivitiesTab({ eventId }: LiveActivitiesTabProps) {
	const activities = useQuery(api.liveActivities.getByEvent, { eventId });
	const startActivity = useMutation(api.liveActivities.start);
	const endActivity = useMutation(api.liveActivities.end);
	const removeActivity = useMutation(api.liveActivities.remove);

	const handleStart = async (activityId: Id<"liveActivities">) => {
		try {
			await startActivity({ id: activityId });
			toast.success("Activity started!");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to start activity",
			);
		}
	};

	const handleEnd = async (activityId: Id<"liveActivities">) => {
		try {
			await endActivity({ id: activityId });
			toast.success("Activity ended!");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to end activity",
			);
		}
	};

	const handleRemove = async (activityId: Id<"liveActivities">) => {
		if (!confirm("Are you sure you want to delete this activity?")) return;
		try {
			await removeActivity({ id: activityId });
			toast.success("Activity deleted!");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete activity",
			);
		}
	};

	if (activities === undefined) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="h-8 w-40 animate-pulse rounded bg-white/10" />
					<div className="h-10 w-32 animate-pulse rounded bg-white/10" />
				</div>
				{[1, 2].map((i) => (
					<div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-white text-xl">Live Activities</h2>
				<Button
					size="sm"
					className="bg-white text-black hover:bg-white/90"
					disabled
				>
					<Plus size={14} className="mr-2" />
					Create Activity
				</Button>
			</div>

			{activities.length > 0 ? (
				<div className="space-y-3">
					{activities.map((activity) => {
						const Icon = activityIcons[activity.type] || BarChart3;
						const statusColors = {
							draft: "bg-white/10 text-white/50",
							scheduled: "bg-blue-500/20 text-blue-400",
							live: "bg-green-500/20 text-green-400",
							ended: "bg-white/10 text-white/50",
						};

						return (
							<div
								key={activity._id}
								className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
									<Icon size={20} className="text-white/70" />
								</div>

								<div className="flex-1">
									<div className="flex items-center gap-2">
										<h3 className="font-medium text-white">{activity.title}</h3>
										<Badge
											className={
												statusColors[
													activity.status as keyof typeof statusColors
												]
											}
										>
											{activity.status}
										</Badge>
									</div>
									<p className="text-sm text-white/50">
										{activityLabels[activity.type]}
									</p>
								</div>

								<div className="flex gap-2">
									{activity.status !== "ended" &&
										activity.status !== "live" && (
											<Button
												size="sm"
												variant="outline"
												className="border-white/10"
												onClick={() => handleStart(activity._id)}
											>
												<Play size={14} className="mr-1" />
												Start
											</Button>
										)}
									{activity.status === "live" && (
										<Button
											size="sm"
											variant="outline"
											className="border-white/10"
											onClick={() => handleEnd(activity._id)}
										>
											<Square size={14} className="mr-1" />
											End
										</Button>
									)}
									<Button
										size="sm"
										variant="ghost"
										className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
										onClick={() => handleRemove(activity._id)}
									>
										<Trash2 size={14} />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="flex flex-col items-center py-16">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
						<Timer size={24} className="text-white/30" />
					</div>
					<h3 className="mt-4 font-semibold text-lg text-white">
						No activities yet
					</h3>
					<p className="mt-1 text-sm text-white/50">
						Create interactive activities for your event
					</p>
				</div>
			)}
		</div>
	);
}
