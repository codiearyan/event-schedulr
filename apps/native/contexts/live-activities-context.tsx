import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import * as SecureStore from "expo-secure-store";
import type { PropsWithChildren } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

const SEEN_ACTIVITIES_KEY = "seen_live_activities";

type LiveActivitiesContextType = {
	unseenCount: number;
	markAsSeen: (activityId: string) => void;
	markAllAsSeen: () => void;
};

const LiveActivitiesContext = createContext<
	LiveActivitiesContextType | undefined
>(undefined);

export function LiveActivitiesProvider({ children }: PropsWithChildren) {
	const [seenActivityIds, setSeenActivityIds] = useState<string[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);

	const event = useQuery(api.events.getCurrentEvent);
	const activities = useQuery(
		api.liveActivities.getActiveByEvent,
		event ? { eventId: event._id } : "skip",
	);

	useEffect(() => {
		const loadSeenActivities = async () => {
			try {
				const stored = await SecureStore.getItemAsync(SEEN_ACTIVITIES_KEY);
				if (stored) {
					setSeenActivityIds(JSON.parse(stored));
				}
			} catch (error) {
				console.error("Failed to load seen activities:", error);
			} finally {
				setIsLoaded(true);
			}
		};

		loadSeenActivities();
	}, []);

	const saveSeenActivities = async (ids: string[]) => {
		try {
			await SecureStore.setItemAsync(SEEN_ACTIVITIES_KEY, JSON.stringify(ids));
		} catch (error) {
			console.error("Failed to save seen activities:", error);
		}
	};

	const unseenCount = useMemo(() => {
		if (!isLoaded || !activities) return 0;

		const liveActivities = activities.filter((a) => a.status === "live");
		return liveActivities.filter((a) => !seenActivityIds.includes(a._id))
			.length;
	}, [activities, seenActivityIds, isLoaded]);

	const markAsSeen = useCallback((activityId: string) => {
		setSeenActivityIds((prev) => {
			if (prev.includes(activityId)) return prev;
			const newIds = [...prev, activityId];
			saveSeenActivities(newIds);
			return newIds;
		});
	}, []);

	const markAllAsSeen = useCallback(() => {
		if (!activities) return;
		const allIds = activities.map((a) => a._id);
		setSeenActivityIds(allIds);
		saveSeenActivities(allIds);
	}, [activities]);

	const value = useMemo(
		() => ({
			unseenCount,
			markAsSeen,
			markAllAsSeen,
		}),
		[unseenCount, markAsSeen, markAllAsSeen],
	);

	return (
		<LiveActivitiesContext.Provider value={value}>
			{children}
		</LiveActivitiesContext.Provider>
	);
}

export function useLiveActivities() {
	const context = useContext(LiveActivitiesContext);
	if (!context) {
		throw new Error(
			"useLiveActivities must be used within LiveActivitiesProvider",
		);
	}
	return context;
}
