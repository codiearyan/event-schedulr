"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	BarChart3,
	Cloud,
	ExternalLink,
	ImageIcon,
	MessageSquare,
	Pencil,
	Play,
	Square,
	Timer,
	Trash2,
	Users,
	Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ActivityStatus = "draft" | "scheduled" | "live" | "ended";

interface Activity {
	_id: Id<"liveActivities">;
	type: string;
	title: string;
	status: ActivityStatus;
	config: Record<string, unknown>;
	createdAt: number;
}

interface ActivityListViewProps {
	eventId: Id<"events">;
	activities: Activity[];
	onSelectActivity: (activityId: Id<"liveActivities">) => void;
}

const activityIcons: Record<string, React.ElementType> = {
	poll: BarChart3,
	word_cloud: Cloud,
	reaction_speed: Zap,
	anonymous_chat: MessageSquare,
	guess_logo: ImageIcon,
};

const activityLabels: Record<string, string> = {
	poll: "Poll",
	word_cloud: "Word Cloud",
	reaction_speed: "Reaction Speed",
	anonymous_chat: "Anonymous Chat",
	guess_logo: "Guess the Logo",
};

const statusConfig: Record<
	ActivityStatus,
	{ label: string; className: string; showPulse?: boolean }
> = {
	draft: {
		label: "Draft",
		className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
	},
	scheduled: {
		label: "Scheduled",
		className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
	},
	live: {
		label: "Live",
		className: "bg-green-500/20 text-green-400 border-green-500/30",
		showPulse: true,
	},
	ended: {
		label: "Ended",
		className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
	},
};

export function ActivityListView({
	eventId,
	activities,
	onSelectActivity,
}: ActivityListViewProps) {
	const startActivity = useMutation(api.liveActivities.start);
	const endActivity = useMutation(api.liveActivities.end);
	const removeActivity = useMutation(api.liveActivities.remove);

	const handleStart = async (
		e: React.MouseEvent,
		activityId: Id<"liveActivities">,
	) => {
		e.stopPropagation();
		try {
			await startActivity({ id: activityId });
			toast.success("Activity started!");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to start activity",
			);
		}
	};

	const handleEnd = async (
		e: React.MouseEvent,
		activityId: Id<"liveActivities">,
	) => {
		e.stopPropagation();
		try {
			await endActivity({ id: activityId });
			toast.success("Activity ended!");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to end activity",
			);
		}
	};

	const handleRemove = async (
		e: React.MouseEvent,
		activityId: Id<"liveActivities">,
	) => {
		e.stopPropagation();
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

	const handlePresent = (
		e: React.MouseEvent,
		activityId: Id<"liveActivities">,
	) => {
		e.stopPropagation();
		window.open(`/activities/${activityId}/present`, "_blank");
	};

	if (activities.length === 0) {
		return (
			<div className="flex flex-col items-center py-16">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
					<Timer size={24} className="text-white/30" />
				</div>
				<h3 className="mt-4 font-semibold text-lg text-white">
					No activities yet
				</h3>
				<p className="mt-1 text-center text-sm text-white/50">
					Create interactive activities for your event participants
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{activities.map((activity) => {
				const Icon = activityIcons[activity.type] || BarChart3;
				const status = statusConfig[activity.status];

				return (
					<div
						key={activity._id}
						onClick={() => onSelectActivity(activity._id)}
						className="group cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/20 hover:bg-white/[0.05]"
					>
						<div className="flex items-start gap-4">
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
								<Icon size={22} className="text-white/70" />
							</div>

							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<span className="text-white/50 text-xs uppercase tracking-wide">
										{activityLabels[activity.type]}
									</span>
									<Badge
										variant="outline"
										className={`${status.className} border`}
									>
										{status.showPulse && (
											<span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
										)}
										{status.label}
									</Badge>
								</div>
								<h3 className="mt-1 truncate font-medium text-white">
									{activity.title}
								</h3>

								<ActivityMetrics
									activityId={activity._id}
									type={activity.type}
								/>
							</div>
						</div>

						<div className="mt-4 flex flex-wrap gap-2">
							{activity.status !== "ended" && activity.status !== "live" && (
								<Button
									size="sm"
									variant="outline"
									className="border-white/10 bg-white/5"
									onClick={(e) => handleStart(e, activity._id)}
								>
									<Play size={14} className="mr-1" />
									Start
								</Button>
							)}
							{activity.status === "live" && (
								<Button
									size="sm"
									variant="outline"
									className="border-white/10 bg-white/5"
									onClick={(e) => handleEnd(e, activity._id)}
								>
									<Square size={14} className="mr-1" />
									End
								</Button>
							)}
							{(activity.status === "live" || activity.status === "ended") && (
								<Button
									size="sm"
									variant="outline"
									className="border-white/10 bg-white/5"
									onClick={(e) => handlePresent(e, activity._id)}
								>
									<ExternalLink size={14} className="mr-1" />
									Present
								</Button>
							)}
							{activity.status === "draft" && (
								<Button
									size="sm"
									variant="ghost"
									className="text-white/60"
									onClick={(e) => {
										e.stopPropagation();
										onSelectActivity(activity._id);
									}}
								>
									<Pencil size={14} className="mr-1" />
									Edit
								</Button>
							)}
							<Button
								size="sm"
								variant="ghost"
								className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
								onClick={(e) => handleRemove(e, activity._id)}
							>
								<Trash2 size={14} />
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function ActivityMetrics({
	activityId,
	type,
}: {
	activityId: Id<"liveActivities">;
	type: string;
}) {
	const results = useQuery(api.liveActivities.getAggregatedResults, {
		activityId,
	});

	if (!results) {
		return null;
	}

	const metrics: { label: string; value: number }[] = [];

	if (results.type === "poll") {
		metrics.push({ label: "voters", value: results.totalVoters });
		const totalVotes = Object.values(results.voteCounts).reduce(
			(a, b) => a + b,
			0,
		);
		metrics.push({ label: "votes", value: totalVotes });
	} else if (results.type === "word_cloud") {
		metrics.push({ label: "words", value: results.uniqueWords });
		metrics.push({ label: "submissions", value: results.totalSubmissions });
	} else if (results.type === "reaction_speed") {
		metrics.push({ label: "players", value: results.totalParticipants });
	} else if (results.type === "anonymous_chat") {
		metrics.push({ label: "participants", value: results.participantCount });
	} else if (results.type === "guess_logo") {
		metrics.push({ label: "players", value: results.totalParticipants });
	}

	if (metrics.length === 0) return null;

	return (
		<div className="mt-2 flex items-center gap-3 text-white/50 text-xs">
			{metrics.map((metric, i) => (
				<span key={metric.label} className="flex items-center gap-1">
					{i === 0 && <Users size={12} />}
					{metric.value} {metric.label}
				</span>
			))}
		</div>
	);
}
