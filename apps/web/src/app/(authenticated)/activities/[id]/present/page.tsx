"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import { ChatPresentation } from "@/components/presentation/activities/ChatPresentation";
import { GuessLogoPresentation } from "@/components/presentation/activities/GuessLogoPresentation";
import { PollPresentation } from "@/components/presentation/activities/PollPresentation";
import { ReactionSpeedPresentation } from "@/components/presentation/activities/ReactionSpeedPresentation";
import { WordCloudPresentation } from "@/components/presentation/activities/WordCloudPresentation";
import { PresentationLayout } from "@/components/presentation/PresentationLayout";

export default function PresentModePage() {
	const params = useParams();
	const activityId = params.id as Id<"liveActivities">;

	const activity = useQuery(api.liveActivities.getById, { id: activityId });
	const results = useQuery(api.liveActivities.getAggregatedResults, {
		activityId,
	});

	if (!activity) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-950">
				<Loader2 className="h-8 w-8 animate-spin text-violet-500" />
			</div>
		);
	}

	return (
		<PresentationLayout
			activityId={activityId}
			showFooter={activity.type !== "guess_logo"}
		>
			{activity.type === "poll" && results?.type === "poll" && (
				<PollPresentation
					config={
						activity.config as {
							question: string;
							options: { id: string; text: string }[];
						}
					}
					results={results}
				/>
			)}

			{activity.type === "word_cloud" && results?.type === "word_cloud" && (
				<WordCloudPresentation
					config={activity.config as { prompt: string }}
					results={results}
				/>
			)}

			{activity.type === "reaction_speed" &&
				results?.type === "reaction_speed" && (
					<ReactionSpeedPresentation results={results} />
				)}

			{activity.type === "anonymous_chat" && (
				<ChatPresentation activityId={activityId} />
			)}

			{activity.type === "guess_logo" && results?.type === "guess_logo" && (
				<GuessLogoPresentation activityId={activityId} results={results} />
			)}
		</PresentationLayout>
	);
}
