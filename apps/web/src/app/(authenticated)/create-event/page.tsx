"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import {
	EventImagePicker,
	type EventImageValue,
} from "@/components/create-event/EventImagePicker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { eventGraphicsPresets } from "@/lib/event-graphics";

export default function CreateEventPage() {
	return (
		<Suspense fallback={<CreateEventSkeleton />}>
			<CreateEventContent />
		</Suspense>
	);
}

function CreateEventSkeleton() {
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

function CreateEventContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const eventId = searchParams.get("eventId");

	const event = useQuery(
		api.events.getById,
		eventId ? { id: eventId as any } : "skip",
	);

	const createEvent = useMutation(api.events.create);
	const updateEvent = useMutation(api.events.update);
	const generateAccessCode = useMutation(api.accessCodes.generate);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		messageToParticipants: "",
		isCurrentEvent: true,
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

	const [eventImage, setEventImage] = useState<EventImageValue | null>({
		type: "preset",
		value: eventGraphicsPresets[0].id,
	});
	const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(
		null,
	);

	const [showDescription, setShowDescription] = useState(false);
	const [showMessage, setShowMessage] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditMode = !!eventId;

	useEffect(() => {
		if (event) {
			const start = new Date(event.startsAt);
			const end = new Date(event.endsAt);

			setFormData({
				name: event.name,
				description: event.description,
				messageToParticipants: event.messageToParticipants || "",
				isCurrentEvent: event.isCurrentEvent,
			});

			setStartDate(start);
			setEndDate(end);
			setStartTime(
				`${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
			);
			setEndTime(
				`${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
			);

			if (event.eventImage) {
				setEventImage(event.eventImage);
				if (event.eventImage.type === "uploaded" && event.resolvedImageUrl) {
					setUploadedPreviewUrl(event.resolvedImageUrl);
				}
			}

			if (event.description) {
				setShowDescription(true);
			}
			if (event.messageToParticipants) {
				setShowMessage(true);
			}
		}
	}, [event]);

	const combineDateTime = (date: Date | undefined, time: string): number => {
		if (!date) return 0;
		const [hours, minutes] = time.split(":").map(Number);
		const combined = new Date(date);
		combined.setHours(hours, minutes, 0, 0);
		return combined.getTime();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const startsAt = combineDateTime(startDate, startTime);
			const endsAt = combineDateTime(endDate, endTime);

			if (!startDate || !endDate) {
				toast.error("Please select start and end dates");
				setIsSubmitting(false);
				return;
			}

			if (startsAt >= endsAt) {
				toast.error("Start time must be before end time");
				setIsSubmitting(false);
				return;
			}

			if (isEditMode && eventId) {
				await updateEvent({
					id: eventId as any,
					name: formData.name,
					description: formData.description,
					eventImage: eventImage || undefined,
					startsAt,
					endsAt,
					messageToParticipants: formData.messageToParticipants || undefined,
				});

				toast.success("Event updated successfully!");
			} else {
				const newEvent = await createEvent({
					name: formData.name,
					description: formData.description,
					eventImage: eventImage || undefined,
					startsAt,
					endsAt,
					messageToParticipants: formData.messageToParticipants || undefined,
					isCurrentEvent: formData.isCurrentEvent,
				});

				if (!newEvent) {
					throw new Error("Failed to create event");
				}

				await generateAccessCode({
					eventId: newEvent._id,
					maxUses: 999,
				});
				toast.success("Event created successfully!");
			}

			router.push("/events");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save event",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-5xl px-6 text-white">
			<div className="flex items-center justify-between py-8">
				<h1 className="font-bold text-4xl">
					{isEditMode ? "Edit Event" : "Create Event"}
				</h1>
			</div>

			<form onSubmit={handleSubmit} className="pb-16">
				<div className="flex gap-6">
					<div className="w-72 flex-shrink-0 space-y-4">
						<EventImagePicker
							value={eventImage}
							onChange={setEventImage}
							uploadedPreviewUrl={uploadedPreviewUrl}
							onUploadPreviewChange={setUploadedPreviewUrl}
						/>

						{!isEditMode && (
							<div className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] px-4 py-4">
								<span className="text-sm text-white">Set as Current Event</span>
								<Switch
									checked={formData.isCurrentEvent}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, isCurrentEvent: checked })
									}
								/>
							</div>
						)}
					</div>

					<div className="flex max-w-xl flex-1 flex-col gap-5">
						<input
							id="name"
							className="h-16 w-full rounded-xl border-none bg-transparent px-4 font-bold text-4xl tracking-wide placeholder:text-white/40 focus:outline-none focus:ring-0"
							style={{ fontFamily: "var(--font-input)" }}
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="Event Name"
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
							<textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="Describe your event..."
								className="min-h-32 w-full resize-none rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] p-4 text-lg placeholder:text-white/40 focus:border-white/20 focus:outline-none"
								required
							/>
						)}

						{!showMessage ? (
							<button
								type="button"
								onClick={() => setShowMessage(true)}
								className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] px-4 py-3 text-white/60 transition-colors hover:bg-[rgba(90,90,90,0.2)] hover:text-white"
							>
								<Plus className="h-4 w-4" />
								<span>Add Message to Participants</span>
							</button>
						) : (
							<textarea
								id="messageToParticipants"
								value={formData.messageToParticipants}
								onChange={(e) =>
									setFormData({
										...formData,
										messageToParticipants: e.target.value,
									})
								}
								placeholder="A welcome message for your participants..."
								className="min-h-24 w-full resize-none rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] p-4 text-lg placeholder:text-white/40 focus:border-white/20 focus:outline-none"
							/>
						)}

						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full cursor-pointer rounded-xl bg-white py-6 font-medium text-black text-lg hover:bg-white/90"
						>
							{isSubmitting
								? isEditMode
									? "Updating Event..."
									: "Creating Event..."
								: isEditMode
									? "Update Event"
									: "Create Event"}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
