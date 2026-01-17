"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Heart, MessageSquare, Users, Vote } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface ActivityStatsCardsProps {
	activityId: Id<"liveActivities">;
	activityType: string;
}

export function ActivityStatsCards({
	activityId,
	activityType,
}: ActivityStatsCardsProps) {
	const results = useQuery(api.liveActivities.getAggregatedResults, {
		activityId,
	});
	const reactionCount = useQuery(api.activityReactions.getReactionCount, {
		activityId,
	});
	const activityData = useQuery(api.liveActivities.getActivityWithJoinCode, {
		activityId,
	});

	const stats = [
		{
			label: "Participants",
			value: activityData?.participantCount ?? 0,
			icon: Users,
			color: "text-blue-500",
			bgColor: "bg-blue-500/10",
		},
		{
			label: "Reactions",
			value: reactionCount?.count ?? 0,
			icon: Heart,
			color: "text-red-500",
			bgColor: "bg-red-500/10",
		},
	];

	if (results?.type === "poll") {
		stats.push({
			label: "Total Votes",
			value: Object.values(results.voteCounts).reduce((a, b) => a + b, 0),
			icon: Vote,
			color: "text-violet-500",
			bgColor: "bg-violet-500/10",
		});
	}

	if (results?.type === "word_cloud") {
		stats.push({
			label: "Submissions",
			value: results.totalSubmissions,
			icon: MessageSquare,
			color: "text-emerald-500",
			bgColor: "bg-emerald-500/10",
		});
	}

	if (results?.type === "anonymous_chat") {
		stats.push({
			label: "Messages",
			value: results.participantCount,
			icon: MessageSquare,
			color: "text-violet-500",
			bgColor: "bg-violet-500/10",
		});
	}

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			{stats.map((stat, index) => (
				<motion.div
					key={stat.label}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
				>
					<Card>
						<CardContent className="flex items-center gap-4 p-4">
							<div
								className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}
							>
								<stat.icon className={`h-6 w-6 ${stat.color}`} />
							</div>
							<div>
								<motion.p
									key={stat.value}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									className="font-bold text-2xl"
								>
									{stat.value}
								</motion.p>
								<p className="text-muted-foreground text-sm">{stat.label}</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}
