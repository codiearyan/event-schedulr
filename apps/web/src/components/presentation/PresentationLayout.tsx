"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";

import { FloatingReactionsContainer } from "./animations/FloatingReactionsContainer";
import { PresentationFooter } from "./PresentationFooter";
import { PresentationHeader } from "./PresentationHeader";
import { PresentationThemeProvider } from "./PresentationThemeProvider";

interface PresentationLayoutProps {
	activityId: Id<"liveActivities">;
	children: React.ReactNode;
	showJoinCode?: boolean;
	showFooter?: boolean;
}

export function PresentationLayout({
	activityId,
	children,
	showJoinCode = true,
	showFooter = true,
}: PresentationLayoutProps) {
	const activityData = useQuery(api.liveActivities.getActivityWithJoinCode, {
		activityId,
	});
	const reactionCount = useQuery(api.activityReactions.getReactionCount, {
		activityId,
	});

	return (
		<PresentationThemeProvider>
			<div className="relative min-h-screen">
				<PresentationHeader
					joinCode={showJoinCode ? activityData?.joinCode : null}
				/>

				<main className="min-h-screen pt-20 pb-20">{children}</main>

				{showFooter && (
					<PresentationFooter
						heartCount={reactionCount?.count ?? 0}
						participantCount={activityData?.participantCount ?? 0}
					/>
				)}

				<FloatingReactionsContainer activityId={activityId} />
			</div>
		</PresentationThemeProvider>
	);
}
