"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	Calendar,
	Clock,
	Coffee,
	MapPin,
	Mic2,
	Plus,
	Sparkles,
	Trash2,
	User,
	Utensils,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ScheduleTabProps {
	eventId: Id<"events">;
}

const typeConfig = {
	talk: {
		icon: Mic2,
		label: "Talk",
		color: "bg-purple-500/20 text-purple-400",
	},
	workshop: {
		icon: Sparkles,
		label: "Workshop",
		color: "bg-blue-500/20 text-blue-400",
	},
	break: {
		icon: Coffee,
		label: "Break",
		color: "bg-yellow-500/20 text-yellow-400",
	},
	meal: {
		icon: Utensils,
		label: "Meal",
		color: "bg-orange-500/20 text-orange-400",
	},
	activity: {
		icon: Sparkles,
		label: "Activity",
		color: "bg-green-500/20 text-green-400",
	},
	ceremony: {
		icon: Sparkles,
		label: "Ceremony",
		color: "bg-pink-500/20 text-pink-400",
	},
	other: { icon: Calendar, label: "Other", color: "bg-white/10 text-white/50" },
};

const statusColors = {
	postponed: "bg-yellow-500/20 text-yellow-400",
	upcoming: "bg-blue-500/20 text-blue-400",
	ongoing: "bg-green-500/20 text-green-400",
	completed: "bg-white/10 text-white/50",
	cancelled: "bg-red-500/20 text-red-400",
};

export function ScheduleTab({ eventId }: ScheduleTabProps) {
	const sessions = useQuery(api.schedule.getSessionsByEvent, { eventId });
	const deleteSession = useMutation(api.schedule.deleteSession);

	const handleDelete = async (sessionId: Id<"sessions">) => {
		if (!confirm("Are you sure you want to delete this session?")) return;
		try {
			await deleteSession({ sessionId });
			toast.success("Session deleted!");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete session",
			);
		}
	};

	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	if (sessions === undefined) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="h-8 w-32 animate-pulse rounded bg-white/10" />
					<div className="h-10 w-32 animate-pulse rounded bg-white/10" />
				</div>
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-28 animate-pulse rounded-xl bg-white/5" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-white text-xl">Schedule</h2>
				<Button
					size="sm"
					className="bg-white text-black hover:bg-white/90"
					disabled
				>
					<Plus size={14} className="mr-2" />
					Add Session
				</Button>
			</div>

			{sessions.length > 0 ? (
				<div className="space-y-3">
					{sessions.map((session) => {
						const config = typeConfig[session.type] || typeConfig.other;
						const Icon = config.icon;

						return (
							<div
								key={session._id}
								className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
							>
								<div className="flex flex-col items-center gap-1 text-center">
									<span className="font-semibold text-lg text-white">
										{formatTime(session.startTime)}
									</span>
									<span className="text-white/40 text-xs">to</span>
									<span className="text-sm text-white/60">
										{formatTime(session.endTime)}
									</span>
								</div>

								<div className="h-auto w-px bg-white/10" />

								<div className="flex-1">
									<div className="flex items-center gap-2">
										<h3 className="font-medium text-white">{session.title}</h3>
										<Badge className={config.color}>{config.label}</Badge>
										<Badge
											className={
												statusColors[session.status] || statusColors.upcoming
											}
										>
											{session.status}
										</Badge>
									</div>

									{session.description && (
										<p className="mt-1 text-sm text-white/60">
											{session.description}
										</p>
									)}

									<div className="mt-2 flex flex-wrap gap-4 text-sm text-white/50">
										{session.speaker && (
											<span className="flex items-center gap-1">
												<User size={12} />
												{session.speaker}
											</span>
										)}
										{session.location && (
											<span className="flex items-center gap-1">
												<MapPin size={12} />
												{session.location}
											</span>
										)}
									</div>
								</div>

								<Button
									size="sm"
									variant="ghost"
									className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
									onClick={() => handleDelete(session._id)}
								>
									<Trash2 size={14} />
								</Button>
							</div>
						);
					})}
				</div>
			) : (
				<div className="flex flex-col items-center py-16">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
						<Clock size={24} className="text-white/30" />
					</div>
					<h3 className="mt-4 font-semibold text-lg text-white">
						No sessions scheduled
					</h3>
					<p className="mt-1 text-sm text-white/50">
						Add sessions to create your event schedule
					</p>
				</div>
			)}
		</div>
	);
}
