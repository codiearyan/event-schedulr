"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function CreateSchedulePage() {
	return (
		<Suspense fallback={<CreateScheduleSkeleton />}>
			<CreateScheduleContent />
		</Suspense>
	);
}

function CreateScheduleSkeleton() {
	return (
		<div className="mx-auto max-w-5xl px-6 text-white">
			<div className="py-8">
				<div className="h-10 w-48 animate-pulse rounded bg-white/10" />
			</div>
			<div className="flex gap-6">
				<div className="w-72 animate-pulse">
					<div className="aspect-square rounded-xl bg-white/10" />
				</div>
				<div className="flex-1 animate-pulse space-y-4">
					<div className="h-16 rounded-xl bg-white/10" />
					<div className="h-32 rounded-xl bg-white/10" />
					<div className="h-24 rounded-xl bg-white/10" />
				</div>
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

	const createSession = useMutation(api.schedule.createSession);
	const enhanceWithAI = useAction(api.schedule.enhanceSessionWithAI);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		location: "",
		speaker: "",
		type: "talk" as
			| "talk"
			| "workshop"
			| "break"
			| "meal"
			| "activity"
			| "ceremony"
			| "other",
		status: "upcoming" as
			| "postponed"
			| "upcoming"
			| "ongoing"
			| "completed"
			| "cancelled",
	});

	const [startDate, setStartDate] = useState<Date | undefined>(() => {
		const now = new Date();
		const minutes = now.getMinutes();
		if (minutes >= 30) {
			now.setHours(now.getHours() + 1, 0, 0, 0);
		} else {
			now.setMinutes(0, 0, 0);
		}
		return now;
	});
	const [endDate, setEndDate] = useState<Date | undefined>(() => {
		const now = new Date();
		const minutes = now.getMinutes();
		if (minutes >= 30) {
			now.setHours(now.getHours() + 2, 0, 0, 0);
		} else {
			now.setHours(now.getHours() + 1, 0, 0, 0);
		}
		return now;
	});
	const [startTime, setStartTime] = useState(() => {
		const now = new Date();
		const minutes = now.getMinutes();
		const hours = minutes >= 30 ? now.getHours() + 1 : now.getHours();
		return `${String(hours % 24).padStart(2, "0")}:00`;
	});
	const [endTime, setEndTime] = useState(() => {
		const now = new Date();
		const minutes = now.getMinutes();
		const hours = minutes >= 30 ? now.getHours() + 2 : now.getHours() + 1;
		return `${String(hours % 24).padStart(2, "0")}:00`;
	});

	const [showDescription, setShowDescription] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isEnhancing, setIsEnhancing] = useState(false);

	if (!eventId) {
		return (
			<div className="mx-auto max-w-5xl px-6 py-12 text-white">
				<div className="rounded-xl border border-white/10 bg-white/3 p-8 text-center">
					<h2 className="mb-2 font-semibold text-xl">Event ID Required</h2>
					<p className="mb-6 text-white/60">
						Please provide an event ID to create a session.
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
			<div className="mx-auto max-w-5xl px-6 py-12 text-white">
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

	const combineDateTime = (date: Date | undefined, time: string): number => {
		if (!date) return 0;
		const [hours, minutes] = time.split(":").map(Number);
		const combined = new Date(date);
		combined.setHours(hours, minutes, 0, 0);
		return combined.getTime();
	};

	const handleEnhanceWithAI = async () => {
		if (!formData.description.trim()) {
			toast.error("Please enter a description first");
			return;
		}

		setIsEnhancing(true);
		try {
			const result = await enhanceWithAI({
				description: formData.description,
				sessionType: formData.type,
				eventContext: event?.name,
			});

			if (result.success) {
				setFormData((prev) => ({
					...prev,
					title: result.title || prev.title,
					description: result.description || prev.description,
				}));
				toast.success("Enhanced with AI!");
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to enhance with AI",
			);
		} finally {
			setIsEnhancing(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const date = startDate || new Date();
			const startTimeMs = combineDateTime(startDate, startTime);
			const endTimeMs = combineDateTime(endDate, endTime);

			if (!startDate || !endDate) {
				toast.error("Please select start and end dates");
				setIsSubmitting(false);
				return;
			}

			if (startTimeMs >= endTimeMs) {
				toast.error("Start time must be before end time");
				setIsSubmitting(false);
				return;
			}

			await createSession({
				eventId,
				title: formData.title,
				description: formData.description || undefined,
				date: date.getTime(),
				startTime: startTimeMs,
				endTime: endTimeMs,
				location: formData.location || undefined,
				speaker: formData.speaker || undefined,
				type: formData.type,
				status: formData.status,
			});

			toast.success("Session created successfully!");
			router.push(`/events/${eventId}?tab=schedule`);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create session",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-5xl px-6 text-white">
			<div className="flex items-center justify-between py-8">
				<h1 className="font-bold text-4xl">Create Session</h1>
			</div>

			<form onSubmit={handleSubmit} className="pb-16">
				<div className="flex gap-6">
					<div className="w-72 shrink-0 space-y-4">
						<div className="aspect-square flex items-center justify-center rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)]">
							<CalendarIcon className="h-16 w-16 text-white/30" />
						</div>
					</div>

					<div className="flex max-w-xl flex-1 flex-col gap-5">
						<input
							id="title"
							className="h-16 w-full rounded-xl border-none bg-transparent px-4 font-bold text-4xl tracking-wide placeholder:text-white/40 focus:outline-none focus:ring-0"
							style={{ fontFamily: "var(--font-input)" }}
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							placeholder="Session Title"
							required
						/>

						<div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] p-5">
							<div className="relative">
								<div className="absolute top-8 bottom-8 left-[7px] z-0 border-white/30 border-l border-dashed" />

								<div className="relative z-10 mb-6 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="h-2.5 w-2.5 rounded-full bg-white" />
										<label className="font-medium text-white/80">Start</label>
									</div>

									<div className="flex items-center gap-2">
										<Popover>
											<PopoverTrigger className="flex items-center gap-2 rounded-lg border border-transparent bg-[rgba(37,37,37,0.6)] px-3 py-1.5 text-sm text-white transition-colors hover:border-white/10">
												<CalendarIcon className="h-4 w-4 text-white/60" />
												{startDate
													? format(startDate, "EEE, MMM d")
													: "Select date"}
											</PopoverTrigger>
											<PopoverContent
												className="w-auto rounded-xl border border-white/10 bg-[#1a1a1a] p-0"
												align="end"
											>
												<Calendar
													mode="single"
													selected={startDate}
													onSelect={setStartDate}
													className="bg-[#1a1a1a] text-white"
												/>
											</PopoverContent>
										</Popover>

										<input
											type="time"
											value={startTime}
											onChange={(e) => setStartTime(e.target.value)}
											className="rounded-lg border border-transparent bg-[rgba(37,37,37,0.6)] px-3 py-1.5 text-sm text-white transition-colors hover:border-white/10 focus:border-white/20 focus:outline-none"
											required
										/>
									</div>
								</div>

								<div className="relative z-10 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="h-2.5 w-2.5 rounded-full border border-white/50 bg-transparent" />
										<label className="font-medium text-white/80">End</label>
									</div>

									<div className="flex items-center gap-2">
										<Popover>
											<PopoverTrigger className="flex items-center gap-2 rounded-lg border border-transparent bg-[rgba(37,37,37,0.6)] px-3 py-1.5 text-sm text-white transition-colors hover:border-white/10">
												<CalendarIcon className="h-4 w-4 text-white/60" />
												{endDate
													? format(endDate, "EEE, MMM d")
													: "Select date"}
											</PopoverTrigger>
											<PopoverContent
												className="w-auto rounded-xl border border-white/10 bg-[#1a1a1a] p-0"
												align="end"
											>
												<Calendar
													mode="single"
													selected={endDate}
													onSelect={setEndDate}
													className="bg-[#1a1a1a] text-white"
												/>
											</PopoverContent>
										</Popover>

										<input
											type="time"
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
											className="rounded-lg border border-transparent bg-[rgba(37,37,37,0.6)] px-3 py-1.5 text-sm text-white transition-colors hover:border-white/10 focus:border-white/20 focus:outline-none"
											required
										/>
									</div>
								</div>
							</div>
						</div>

						{!showDescription ? (
							<button
								type="button"
								onClick={() => setShowDescription(true)}
								className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] px-4 py-3 text-white/60 transition-colors hover:bg-[rgba(90,90,90,0.2)] hover:text-white"
							>
								<Plus className="h-4 w-4" />
								<span>Add Description</span>
							</button>
						) : (
							<div className="space-y-2">
								<textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									placeholder="Describe your session..."
									className="min-h-32 w-full resize-none rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] p-4 text-lg placeholder:text-white/40 focus:border-white/20 focus:outline-none"
								/>
								<button
									type="button"
									onClick={handleEnhanceWithAI}
									disabled={isEnhancing || !formData.description.trim()}
									className="flex items-center gap-2 rounded-lg bg-linear-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 px-4 py-2 text-sm text-purple-300 transition-all hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<Sparkles className={`h-4 w-4 ${isEnhancing ? "animate-spin" : ""}`} />
									<span>{isEnhancing ? "Enhancing..." : "Enhance with AI"}</span>
								</button>
							</div>
						)}

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="location" className="text-base font-medium text-white">
									Location (optional)
								</Label>
								<Input
									id="location"
									value={formData.location}
									onChange={(e) =>
										setFormData({ ...formData, location: e.target.value })
									}
									placeholder="Main Hall"
									className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] text-white placeholder:text-white/40 focus:border-white/20"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="speaker" className="text-base font-medium text-white">
									Speaker (optional)
								</Label>
								<Input
									id="speaker"
									value={formData.speaker}
									onChange={(e) =>
										setFormData({ ...formData, speaker: e.target.value })
									}
									placeholder="John Doe"
									className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] text-white placeholder:text-white/40 focus:border-white/20"
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="type" className="text-base font-medium text-white">
									Session Type *
								</Label>
								<Select
									value={formData.type}
									onValueChange={(value: any) =>
										setFormData({ ...formData, type: value })
									}
								>
									<SelectTrigger className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] text-white">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="text-white">
										<SelectItem value="talk">Talk</SelectItem>
										<SelectItem value="workshop">Workshop</SelectItem>
										<SelectItem value="break">Break</SelectItem>
										<SelectItem value="meal">Meal</SelectItem>
										<SelectItem value="activity">Activity</SelectItem>
										<SelectItem value="ceremony">Ceremony</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status" className="text-base font-medium text-white">
									Status *
								</Label>
								<Select
									value={formData.status}
									onValueChange={(value: any) =>
										setFormData({ ...formData, status: value })
									}
								>
									<SelectTrigger className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] text-white">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="text-white">
										<SelectItem value="upcoming">Upcoming</SelectItem>
										<SelectItem value="ongoing">Ongoing</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
										<SelectItem value="postponed">Postponed</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full cursor-pointer rounded-xl bg-white py-6 font-medium text-black text-lg hover:bg-white/90"
						>
							{isSubmitting ? "Creating Session..." : "Create Session"}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
