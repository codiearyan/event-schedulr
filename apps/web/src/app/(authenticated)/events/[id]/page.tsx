"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AnnouncementsTab } from "@/components/event-detail/AnnouncementsTab";
import { FeedbackTab } from "@/components/event-detail/FeedbackTab";
import { LiveActivitiesTab } from "@/components/event-detail/LiveActivitiesTab";
import { OverviewTab } from "@/components/event-detail/OverviewTab";
import { ParticipantsTab } from "@/components/event-detail/ParticipantsTab";
import { ScheduleTab } from "@/components/event-detail/ScheduleTab";

const tabs = [
	{ id: "overview", label: "Overview" },
	{ id: "participants", label: "Participants" },
	{ id: "activities", label: "Live Activities" },
	{ id: "announcements", label: "Announcements" },
	{ id: "schedule", label: "Schedule" },
	{ id: "feedback", label: "Feedback" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function EventDetailSkeleton() {
	return (
		<div className="mx-auto max-w-5xl px-6 text-white">
			<div className="py-8">
				<div className="h-4 w-24 animate-pulse rounded bg-white/10" />
				<div className="mt-4 h-10 w-64 animate-pulse rounded bg-white/10" />
			</div>
			<div className="flex gap-4">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div key={i} className="h-8 w-24 animate-pulse rounded bg-white/10" />
				))}
			</div>
			<div className="mt-8 h-96 animate-pulse rounded-xl bg-white/5" />
		</div>
	);
}

function EventNotFound() {
	return (
		<div className="mx-auto max-w-5xl px-6 py-16 text-center text-white">
			<h1 className="font-bold text-2xl">Event Not Found</h1>
			<p className="mt-2 text-white/60">
				The event you're looking for doesn't exist or has been deleted.
			</p>
			<Link
				href="/events"
				className="mt-6 inline-block rounded-lg bg-white/10 px-4 py-2 font-medium text-sm transition-colors hover:bg-white/20"
			>
				Back to Events
			</Link>
		</div>
	);
}

function EventDetailContent() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();

	const eventId = params.id as Id<"events">;
	const event = useQuery(api.events.getById, { id: eventId });

	const activeTab = (searchParams.get("tab") as TabId) || "overview";
	const [isEditing, setIsEditing] = useState(false);

	const setActiveTab = (tab: TabId) => {
		const newParams = new URLSearchParams(searchParams.toString());
		if (tab === "overview") {
			newParams.delete("tab");
		} else {
			newParams.set("tab", tab);
		}
		router.push(`/events/${eventId}?${newParams.toString()}`);
	};

	if (event === undefined) {
		return <EventDetailSkeleton />;
	}

	if (event === null) {
		return <EventNotFound />;
	}

	const publicEventUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/e/${eventId}`;

	return (
		<div className="mx-auto max-w-5xl px-6 pb-16 text-white">
			<div className="py-8">
				<div className="flex items-center gap-2 text-sm text-white/50">
					<Link href="/events" className="hover:text-white">
						Events
					</Link>
					<ChevronRight size={14} />
					<span className="text-white/80">Personal</span>
				</div>

				<div className="mt-4 flex items-center justify-between">
					{isEditing ? (
						<input
							type="text"
							defaultValue={event.name}
							className="h-12 w-full max-w-md rounded-lg border border-white/20 bg-white/5 px-4 font-bold text-3xl focus:border-purple-500 focus:outline-none"
							autoFocus
						/>
					) : (
						<h1 className="font-bold text-3xl">{event.name}</h1>
					)}

					<a
						href={publicEventUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-medium text-sm transition-colors hover:bg-white/10"
					>
						Event Page
						<ArrowUpRight size={14} />
					</a>
				</div>
			</div>

			<div
				className="flex gap-1 border-white/10 border-b"
				role="tablist"
				aria-label="Event sections"
			>
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={activeTab === tab.id}
						aria-controls={`panel-${tab.id}`}
						onClick={() => setActiveTab(tab.id)}
						className={`relative cursor-pointer px-4 py-3 font-medium text-sm transition-colors ${
							activeTab === tab.id
								? "text-white"
								: "text-white/40 hover:text-white/70"
						}`}
					>
						{tab.label}
						{activeTab === tab.id && (
							<div className="absolute right-0 bottom-0 left-0 h-0.5 bg-white" />
						)}
					</button>
				))}
			</div>

			<div className="mt-8">
				{activeTab === "overview" && (
					<OverviewTab
						event={event}
						eventId={eventId}
						isEditing={isEditing}
						setIsEditing={setIsEditing}
					/>
				)}
				{activeTab === "participants" && <ParticipantsTab eventId={eventId} />}
				{activeTab === "activities" && <LiveActivitiesTab eventId={eventId} />}
				{activeTab === "announcements" && (
					<AnnouncementsTab eventId={eventId} />
				)}
				{activeTab === "schedule" && <ScheduleTab eventId={eventId} />}
				{activeTab === "feedback" && <FeedbackTab eventId={eventId} />}
			</div>
		</div>
	);
}

export default function EventDetailPage() {
	return (
		<Suspense fallback={<EventDetailSkeleton />}>
			<EventDetailContent />
		</Suspense>
	);
}
