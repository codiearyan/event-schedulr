import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import { FloatingHeart } from "./FloatingHeart";

interface Reaction {
	id: string;
	createdAt: number;
}

interface ApiReaction {
	id: Id<"activityReactions">;
	createdAt: number;
}

interface FloatingHeartsContainerProps {
	activityId: Id<"liveActivities">;
}

export function FloatingHeartsContainer({
	activityId,
}: FloatingHeartsContainerProps) {
	const [activeReactions, setActiveReactions] = useState<Reaction[]>([]);
	const lastSeenRef = useRef<number>(Date.now());

	const recentReactions = useQuery(api.activityReactions.getRecentReactions, {
		activityId,
		limit: 10,
		since: lastSeenRef.current - 5000,
	});

	useEffect(() => {
		if (!recentReactions || recentReactions.length === 0) return;

		const newReactions = (recentReactions as ApiReaction[]).filter(
			(r: ApiReaction) =>
				r.createdAt > lastSeenRef.current &&
				!activeReactions.some((ar) => ar.id === r.id),
		);

		if (newReactions.length > 0) {
			setActiveReactions((prev) => [
				...prev,
				...newReactions.map((r: ApiReaction) => ({
					id: r.id,
					createdAt: r.createdAt,
				})),
			]);
			lastSeenRef.current = Math.max(
				...newReactions.map((r: ApiReaction) => r.createdAt),
			);
		}
	}, [recentReactions, activeReactions]);

	const handleReactionComplete = useCallback((id: string) => {
		setActiveReactions((prev) => prev.filter((r) => r.id !== id));
	}, []);

	return (
		<View style={styles.container} pointerEvents="none">
			{activeReactions.map((reaction) => (
				<FloatingHeart
					key={reaction.id}
					id={reaction.id}
					onComplete={() => handleReactionComplete(reaction.id)}
				/>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		overflow: "hidden",
		zIndex: 50,
	},
});
