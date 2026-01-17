"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { FloatingReaction } from "./FloatingReaction";

interface Reaction {
	id: string;
	createdAt: number;
}

interface FloatingReactionsContainerProps {
	activityId: Id<"liveActivities">;
}

export function FloatingReactionsContainer({
	activityId,
}: FloatingReactionsContainerProps) {
	const [activeReactions, setActiveReactions] = useState<Reaction[]>([]);
	const lastSeenRef = useRef<number>(Date.now());

	const recentReactions = useQuery(api.activityReactions.getRecentReactions, {
		activityId,
		limit: 10,
		since: lastSeenRef.current - 5000,
	});

	useEffect(() => {
		if (!recentReactions || recentReactions.length === 0) return;

		const newReactions = recentReactions.filter(
			(r) =>
				r.createdAt > lastSeenRef.current &&
				!activeReactions.some((ar) => ar.id === r.id),
		);

		if (newReactions.length > 0) {
			setActiveReactions((prev) => [
				...prev,
				...newReactions.map((r) => ({ id: r.id, createdAt: r.createdAt })),
			]);
			lastSeenRef.current = Math.max(...newReactions.map((r) => r.createdAt));
		}
	}, [recentReactions, activeReactions]);

	const handleReactionComplete = useCallback((id: string) => {
		setActiveReactions((prev) => prev.filter((r) => r.id !== id));
	}, []);

	return (
		<div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
			{activeReactions.map((reaction) => (
				<FloatingReaction
					key={reaction.id}
					id={reaction.id}
					onComplete={() => handleReactionComplete(reaction.id)}
				/>
			))}
		</div>
	);
}
