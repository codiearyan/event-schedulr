"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { format, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, ChevronUp, Clock, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	SimplePopover,
	SimplePopoverTrigger,
	SimplePopoverContent,
} from "@/components/ui/simple-popover";
import {
	SimpleSelect,
	SimpleSelectTrigger,
	SimpleSelectValue,
	SimpleSelectContent,
	SimpleSelectItem,
} from "@/components/ui/simple-select";

type SessionType = "talk" | "workshop" | "break" | "meal" | "activity" | "ceremony" | "other";

interface SessionFormData {
	id: string;
	title: string;
	description: string;
	location: string;
	speaker: string;
	type: SessionType;
	startDate: Date | undefined;
	endDate: Date | undefined;
	startTime: string;
	endTime: string;
	isExpanded: boolean;
}

interface EventDateRange {
	startsAt: number;
	endsAt: number;
}

function generateId() {
	return Math.random().toString(36).substring(2, 9);
}

function getTimesFromTimestamp(timestamp: number) {
	const date = new Date(timestamp);
	return {
		date,
		time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
	};
}

function createEmptySession(eventRange: EventDateRange | null, isExpanded = true): SessionFormData {
	// Default to event start time if available
	if (eventRange) {
		const start = getTimesFromTimestamp(eventRange.startsAt);
		const endTime = new Date(eventRange.startsAt + 60 * 60 * 1000); // 1 hour later

		return {
			id: generateId(),
			title: "",
			description: "",
			location: "",
			speaker: "",
			type: "talk",
			startDate: start.date,
			endDate: endTime,
			startTime: start.time,
			endTime: `${String(endTime.getHours()).padStart(2, "0")}:${String(endTime.getMinutes()).padStart(2, "0")}`,
			isExpanded,
		};
	}

	// Fallback to current time
	const now = new Date();
	const minutes = now.getMinutes();
	const startHours = minutes >= 30 ? now.getHours() + 1 : now.getHours();
	const endHours = startHours + 1;

	const startDate = new Date();
	startDate.setHours(startHours, 0, 0, 0);

	const endDate = new Date();
	endDate.setHours(endHours, 0, 0, 0);

	return {
		id: generateId(),
		title: "",
		description: "",
		location: "",
		speaker: "",
		type: "talk",
		startDate,
		endDate,
		startTime: `${String(startHours % 24).padStart(2, "0")}:00`,
		endTime: `${String(endHours % 24).padStart(2, "0")}:00`,
		isExpanded,
	};
}

export default function CreateSchedulePage() {
	return (
		<Suspense fallback={<CreateScheduleSkeleton />}>
			<CreateScheduleContent />
		</Suspense>
	);
}

function CreateScheduleSkeleton() {
	return (
		<div className="mx-auto max-w-3xl px-6 text-white">
			<div className="py-8">
				<div className="h-10 w-48 animate-pulse rounded bg-white/10" />
			</div>
			<div className="space-y-4">
				<div className="h-16 rounded-xl bg-white/10 animate-pulse" />
				<div className="h-32 rounded-xl bg-white/10 animate-pulse" />
				<div className="h-24 rounded-xl bg-white/10 animate-pulse" />
			</div>
		</div>
	);
}

function CreateScheduleContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const eventId = searchParams.get("eventId") as Id<"events"> | null;

	const event = useQuery(
		api.events.getById,
		eventId ? { id: eventId } : "skip",
	);

	const createMultipleSessions = useMutation(api.schedule.createMultipleSessions);
	const enhanceWithAI = useAction(api.schedule.enhanceSessionWithAI);

	// Memoize event range to prevent unnecessary re-renders
	const eventRange = useMemo(() => {
		if (!event) return null;
		return { startsAt: event.startsAt, endsAt: event.endsAt };
	}, [event?.startsAt, event?.endsAt]);

	const [sessions, setSessions] = useState<SessionFormData[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [enhancingSessionId, setEnhancingSessionId] = useState<string | null>(null);

	// Initialize sessions when event loads
	useEffect(() => {
		if (event && sessions.length === 0) {
			setSessions([createEmptySession(eventRange, true)]);
		}
	}, [event, eventRange, sessions.length]);

	if (!eventId) {
		return (
			<div className="mx-auto max-w-3xl px-6 py-12 text-white">
				<div className="rounded-xl border border-white/10 bg-white/3 p-8 text-center">
					<h2 className="mb-2 font-semibold text-xl">Event ID Required</h2>
					<p className="mb-6 text-white/60">
						Please provide an event ID to create sessions.
					</p>
					<Button
						onClick={() => router.push("/events")}
						className="rounded-xl bg-white text-black hover:bg-white/90"
					>
						Go to Events
					</Button>
				</div>
			</div>
		);
	}

	if (event === undefined) {
		return <CreateScheduleSkeleton />;
	}

	if (event === null) {
		return (
			<div className="mx-auto max-w-3xl px-6 py-12 text-white">
				<div className="rounded-xl border border-white/10 bg-white/3 p-8 text-center">
					<h2 className="mb-2 font-semibold text-xl">Event Not Found</h2>
					<p className="mb-6 text-white/60">
						The event you're looking for doesn't exist.
					</p>
					<Button
						onClick={() => router.push("/events")}
						className="rounded-xl bg-white text-black hover:bg-white/90"
					>
						Go to Events
					</Button>
				</div>
			</div>
		);
	}

	const updateSession = (id: string, updates: Partial<SessionFormData>) => {
		setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
	};

	const toggleExpand = (id: string) => {
		setSessions(prev => prev.map(s => ({
			...s,
			isExpanded: s.id === id ? !s.isExpanded : false,
		})));
	};

	const addNewSession = () => {
		setSessions(prev => [
			...prev.map(s => ({ ...s, isExpanded: false })),
			createEmptySession(eventRange, true),
		]);
	};

	const deleteSession = (id: string) => {
		if (sessions.length === 1) {
			toast.error("You need at least one session");
			return;
		}
		setSessions(prev => {
			const filtered = prev.filter(s => s.id !== id);
			const hasExpanded = filtered.some(s => s.isExpanded);
			if (!hasExpanded && filtered.length > 0) {
				filtered[filtered.length - 1].isExpanded = true;
			}
			return filtered;
		});
	};

	const combineDateTime = (date: Date | undefined, time: string): number => {
		if (!date) return 0;
		const [hours, minutes] = time.split(":").map(Number);
		const combined = new Date(date);
		combined.setHours(hours, minutes, 0, 0);
		return combined.getTime();
	};

	const handleEnhanceWithAI = async (sessionId: string) => {
		const session = sessions.find(s => s.id === sessionId);
		if (!session?.description.trim()) {
			toast.error("Please enter a description first");
			return;
		}

		setEnhancingSessionId(sessionId);
		try {
			const result = await enhanceWithAI({
				description: session.description,
				sessionType: session.type,
				eventContext: event?.name,
			});

			if (result.success) {
				updateSession(sessionId, {
					title: result.title || session.title,
					description: result.description || session.description,
				});
				toast.success("Title & description enhanced!");
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to enhance with AI",
			);
		} finally {
			setEnhancingSessionId(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Validate all sessions
			for (const session of sessions) {
				if (!session.title.trim()) {
					toast.error(`Please enter a title for all sessions`);
					setIsSubmitting(false);
					return;
				}

				if (!session.startDate || !session.endDate) {
					toast.error("Please select start and end dates for all sessions");
					setIsSubmitting(false);
					return;
				}

				const startTimeMs = combineDateTime(session.startDate, session.startTime);
				const endTimeMs = combineDateTime(session.endDate, session.endTime);

				if (startTimeMs >= endTimeMs) {
					toast.error(`Start time must be before end time for "${session.title || 'untitled session'}"`);
					setIsSubmitting(false);
					return;
				}

				// Validate session is within event range
				if (startTimeMs < event.startsAt) {
					toast.error(`Session "${session.title}" starts before the event begins`);
					setIsSubmitting(false);
					return;
				}

				if (endTimeMs > event.endsAt) {
					toast.error(`Session "${session.title}" ends after the event ends`);
					setIsSubmitting(false);
					return;
				}
			}

			// Prepare sessions data for API
			const sessionsData = sessions.map(session => ({
				title: session.title,
				description: session.description || undefined,
				date: (session.startDate || new Date()).getTime(),
				startTime: combineDateTime(session.startDate, session.startTime),
				endTime: combineDateTime(session.endDate, session.endTime),
				location: session.location || undefined,
				speaker: session.speaker || undefined,
				type: session.type,
				status: "upcoming" as const,
			}));

			await createMultipleSessions({
				eventId,
				sessions: sessionsData,
			});

			toast.success(`${sessions.length} session${sessions.length > 1 ? 's' : ''} created successfully!`);
			router.push(`/events/${eventId}?tab=schedule`);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create sessions",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Format event date range for display
	const eventStartDate = new Date(event.startsAt);
	const eventEndDate = new Date(event.endsAt);

	return (
		<div className="mx-auto max-w-3xl px-6 text-white min-h-[calc(100vh+1px)]">
			<div className="py-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl">Create Sessions</h1>
						<p className="text-white/60 mt-1">Add sessions for {event.name}</p>
					</div>
					<span className="text-white/40 text-sm">{sessions.length} session{sessions.length > 1 ? 's' : ''}</span>
				</div>

				{/* Event date range info */}
				<div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3">
					<Clock className="h-4 w-4 text-blue-400 shrink-0" />
					<p className="text-sm text-blue-200">
						<span className="text-blue-400 font-medium">Event runs:</span>{" "}
						{format(eventStartDate, "MMM d, h:mm a")} — {format(eventEndDate, "MMM d, h:mm a, yyyy")}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="pb-16 space-y-4">
				{sessions.map((session, index) => (
					<SessionCard
						key={session.id}
						session={session}
						index={index}
						eventRange={eventRange!}
						onUpdate={(updates) => updateSession(session.id, updates)}
						onToggleExpand={() => toggleExpand(session.id)}
						onDelete={() => deleteSession(session.id)}
						onEnhanceWithAI={() => handleEnhanceWithAI(session.id)}
						isEnhancing={enhancingSessionId === session.id}
						canDelete={sessions.length > 1}
					/>
				))}

				<button
					type="button"
					onClick={addNewSession}
					className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-transparent px-4 py-4 text-white/60 transition-all hover:border-white/40 hover:bg-white/5 hover:text-white"
				>
					<Plus className="h-5 w-5" />
					<span>Add another session</span>
				</button>

				<Button
					type="submit"
					disabled={isSubmitting || sessions.length === 0}
					className="w-full cursor-pointer rounded-xl bg-white py-6 font-medium text-black text-lg hover:bg-white/90 mt-6"
				>
					{isSubmitting
						? "Creating Sessions..."
						: `Create ${sessions.length} Session${sessions.length > 1 ? 's' : ''}`
					}
				</Button>
			</form>
		</div>
	);
}

interface SessionCardProps {
	session: SessionFormData;
	index: number;
	eventRange: EventDateRange;
	onUpdate: (updates: Partial<SessionFormData>) => void;
	onToggleExpand: () => void;
	onDelete: () => void;
	onEnhanceWithAI: () => void;
	isEnhancing: boolean;
	canDelete: boolean;
}

function SessionCard({
	session,
	index,
	eventRange,
	onUpdate,
	onToggleExpand,
	onDelete,
	onEnhanceWithAI,
	isEnhancing,
	canDelete,
}: SessionCardProps) {
	// Calculate valid date range for calendar
	const eventStartDay = startOfDay(new Date(eventRange.startsAt));
	const eventEndDay = endOfDay(new Date(eventRange.endsAt));

	// Disable dates outside event range
	const isDateDisabled = (date: Date) => {
		return isBefore(date, eventStartDay) || isAfter(date, eventEndDay);
	};

	if (!session.isExpanded) {
		// Collapsed view
		return (
			<div className="rounded-xl border border-white/10 bg-[rgba(90,90,90,0.12)] p-4 flex items-center justify-between gap-3 transition-all duration-200">
				<div className="flex items-center gap-3 min-w-0 flex-1">
					<span className="text-white/40 text-sm font-medium shrink-0">#{index + 1}</span>
					<span className="text-white font-medium truncate">
						{session.title || "Untitled Session"}
					</span>
					{session.startDate && (
						<span className="text-white/40 text-sm shrink-0 hidden sm:block">
							{format(session.startDate, "MMM d")} · {session.startTime}
						</span>
					)}
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<button
						type="button"
						onClick={onToggleExpand}
						className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
						title="Edit session"
					>
						<Pencil className="h-4 w-4" />
					</button>
					{canDelete && (
						<button
							type="button"
							onClick={onDelete}
							className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
							title="Delete session"
						>
							<Trash2 className="h-4 w-4" />
						</button>
					)}
				</div>
			</div>
		);
	}

	// Expanded view
	return (
		<div className="rounded-xl border border-white/20 bg-[rgba(90,90,90,0.12)] transition-all duration-200">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-white/10">
				<div className="flex items-center gap-3">
					<span className="text-white/40 text-sm font-medium">#{index + 1}</span>
					<span className="text-white/60 text-sm">Editing session</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={onToggleExpand}
						className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
						title="Collapse"
					>
						<ChevronUp className="h-4 w-4" />
					</button>
					{canDelete && (
						<button
							type="button"
							onClick={onDelete}
							className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
							title="Delete session"
						>
							<Trash2 className="h-4 w-4" />
						</button>
					)}
				</div>
			</div>

			{/* Form content */}
			<div className="p-4 space-y-4">
				{/* Description first with AI enhance */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label className="text-sm font-medium text-white/70">
							What's this session about?
						</Label>
						<button
							type="button"
							onClick={onEnhanceWithAI}
							disabled={isEnhancing || !session.description.trim()}
							className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 px-3 py-1.5 text-xs text-purple-300 transition-all hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
							title="AI will generate a title and polish your description"
						>
							<Sparkles className={`h-3 w-3 ${isEnhancing ? "animate-spin" : ""}`} />
							<span>{isEnhancing ? "Generating..." : "Generate Title & Polish"}</span>
						</button>
					</div>
					<textarea
						value={session.description}
						onChange={(e) => onUpdate({ description: e.target.value })}
						placeholder="Describe your session briefly... (e.g., 'lunch break for everyone' or 'react workshop for beginners')"
						className="min-h-20 w-full resize-none rounded-lg border border-white/10 bg-[rgba(37,37,37,0.4)] p-3 text-sm placeholder:text-white/40 focus:border-white/20 focus:outline-none"
					/>
					<p className="text-xs text-white/40">
						💡 Write a rough description, then click "Generate Title & Polish" to auto-create a catchy title
					</p>
				</div>

				{/* Title */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-white/70">
						Session Title
					</Label>
					<input
						className="w-full rounded-lg border border-white/10 bg-[rgba(37,37,37,0.4)] px-3 py-2.5 font-medium text-lg placeholder:text-white/40 focus:border-white/20 focus:outline-none"
						value={session.title}
						onChange={(e) => onUpdate({ title: e.target.value })}
						placeholder="Auto-generated or type your own..."
						required
					/>
				</div>

				{/* Date/Time */}
				<div className="rounded-lg border border-white/10 bg-[rgba(37,37,37,0.4)] p-4">
					<div className="relative">
						<div className="absolute top-6 bottom-6 left-[7px] z-0 border-white/30 border-l border-dashed" />

						<div className="relative z-10 mb-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="h-2.5 w-2.5 rounded-full bg-white" />
								<label className="font-medium text-white/80 text-sm">Start</label>
							</div>

							<div className="flex items-center gap-2">
								<SimplePopover>
									<SimplePopoverTrigger className="flex items-center gap-2 rounded-lg border border-transparent bg-[rgba(37,37,37,0.6)] px-3 py-1.5 text-sm text-white transition-colors hover:border-white/10">
										<CalendarIcon className="h-4 w-4 text-white/60" />
										{session.startDate
											? format(session.startDate, "EEE, MMM d")
											: "Select date"}
									</SimplePopoverTrigger>
									<SimplePopoverContent className="p-0" align="end">
										<Calendar
											mode="single"
											selected={session.startDate}
											onSelect={(date) => onUpdate({ startDate: date })}
											disabled={isDateDisabled}
											className="bg-[#1a1a1a] text-white"
										/>
									</SimplePopoverContent>
								</SimplePopover>

								<input
									type="time"
									value={session.startTime}
									onChange={(e) => onUpdate({ startTime: e.target.value })}
									className="rounded-lg border border-transparent bg-[rgba(37,37,37,0.6)] px-3 py-1.5 text-sm text-white transition-colors hover:border-white/10 focus:border-white/20 focus:outline-none"
									required
								/>
							</div>
						</div>

						<div className="relative z-10 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="h-2.5 w-2.5 rounded-full border border-white/50 bg-transparent" />
								<label className="font-medium text-white/80 text-sm">End</label>
							</div>

							<div className="flex items-center gap-2">
								<SimplePopover>
									<SimplePopoverTrigger className="flex items-center gap-2 rounded-lg border border-transparent bg-[rgba(37,37,37,0.6)] px-3 py-1.5 text-sm text-white transition-colors hover:border-white/10">
										<CalendarIcon className="h-4 w-4 text-white/60" />
										{session.endDate
											? format(session.endDate, "EEE, MMM d")
											: "Select date"}
									</SimplePopoverTrigger>
									<SimplePopoverContent className="p-0" align="end">
										<Calendar
											mode="single"
											selected={session.endDate}
											onSelect={(date) => onUpdate({ endDate: date })}
											disabled={isDateDisabled}
											className="bg-[#1a1a1a] text-white"
										/>
									</SimplePopoverContent>
								</SimplePopover>

								<input
									type="time"
									value={session.endTime}
									onChange={(e) => onUpdate({ endTime: e.target.value })}
									className="rounded-lg border border-transparent bg-[rgba(37,37,37,0.6)] px-3 py-1.5 text-sm text-white transition-colors hover:border-white/10 focus:border-white/20 focus:outline-none"
									required
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Location & Speaker */}
				<div className="grid gap-3 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor={`location-${session.id}`} className="text-sm font-medium text-white/70">
							Location
						</Label>
						<Input
							id={`location-${session.id}`}
							value={session.location}
							onChange={(e) => onUpdate({ location: e.target.value })}
							placeholder="Main Hall, Room 101..."
							className="h-9 rounded-lg border border-white/10 bg-[rgba(37,37,37,0.4)] text-sm text-white placeholder:text-white/40 focus:border-white/20"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor={`speaker-${session.id}`} className="text-sm font-medium text-white/70">
							Speaker
						</Label>
						<Input
							id={`speaker-${session.id}`}
							value={session.speaker}
							onChange={(e) => onUpdate({ speaker: e.target.value })}
							placeholder="John Doe, Team Lead..."
							className="h-9 rounded-lg border border-white/10 bg-[rgba(37,37,37,0.4)] text-sm text-white placeholder:text-white/40 focus:border-white/20"
						/>
					</div>
				</div>

				{/* Type */}
				<div className="space-y-1.5">
					<Label htmlFor={`type-${session.id}`} className="text-sm font-medium text-white/70">
						Session Type
					</Label>
					<SimpleSelect
						value={session.type}
						onValueChange={(value) => onUpdate({ type: value as SessionType })}
					>
						<SimpleSelectTrigger>
							<SimpleSelectValue />
						</SimpleSelectTrigger>
						<SimpleSelectContent>
							<SimpleSelectItem value="talk">Talk</SimpleSelectItem>
							<SimpleSelectItem value="workshop">Workshop</SimpleSelectItem>
							<SimpleSelectItem value="break">Break</SimpleSelectItem>
							<SimpleSelectItem value="meal">Meal</SimpleSelectItem>
							<SimpleSelectItem value="activity">Activity</SimpleSelectItem>
							<SimpleSelectItem value="other">Other</SimpleSelectItem>
						</SimpleSelectContent>
					</SimpleSelect>
				</div>
			</div>
		</div>
	);
}
