"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";

import { ActivityDetailView } from "./activities/ActivityDetailView";
import { ActivityListView } from "./activities/ActivityListView";
import { CreateActivitySheet } from "./activities/CreateActivitySheet";

interface LiveActivitiesTabProps {
	eventId: Id<"events">;
}

export function LiveActivitiesTab({ eventId }: LiveActivitiesTabProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const activities = useQuery(api.liveActivities.getByEvent, { eventId });

	const selectedActivityId = searchParams.get(
		"activity",
	) as Id<"liveActivities"> | null;

	const handleSelectActivity = (activityId: Id<"liveActivities">) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("activity", activityId);
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleBack = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("activity");
		router.push(`?${params.toString()}`, { scroll: false });
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

	if (selectedActivityId) {
		return (
			<ActivityDetailView activityId={selectedActivityId} onBack={handleBack} />
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-white text-xl">Live Activities</h2>
				<CreateActivitySheet eventId={eventId} />
			</div>

			<ActivityListView
				eventId={eventId}
				activities={activities}
				onSelectActivity={handleSelectActivity}
			/>
		</div>
	);
}
