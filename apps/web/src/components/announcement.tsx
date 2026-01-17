"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle,
	Clock,
	Info,
	Megaphone,
	MessageSquare,
	Radio,
	Send,
	Sparkles,
	Trash2,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type EventStatus = "upcoming" | "live" | "ended";
type AnnouncementType = "info" | "warning" | "success";

interface Announcement {
	_id: string;
	message: string;
	type: AnnouncementType;
	_creationTime: number;
}

interface Event {
	_id: string;
	name: string;
	description: string;
	status: EventStatus;
	logo?: string;
	startsAt: number;
	endsAt: number;
	messageToParticipants?: string;
}

export default function AnnouncementsPage() {
	const [message, setMessage] = useState("");
	const [announcementType, setAnnouncementType] =
		useState<AnnouncementType>("info");
	const [isLoading, setIsLoading] = useState(false);

	const event = useQuery(api.events.getCurrentEvent);

	const announcements =
		useQuery(
			api.announcements.getByEvent,
			event ? { eventId: event._id } : "skip",
		) ?? [];

	const seedEvent = useMutation(api.events.seed);
	const updateStatus = useMutation(api.events.update);
	const createAnnouncement = useMutation(api.announcements.create);
	const removeAnnouncement = useMutation(api.announcements.remove);

	useEffect(() => {
		if (event === null) seedEvent();
	}, [event, seedEvent]);

	const handleStatusChange = async (status: EventStatus) => {
		if (!event) return;
		try {
			setIsLoading(true);
			// Backend derives `status` from `startsAt`/`endsAt`.
			// Compute new start/end timestamps to reflect the selected status.
			const now = Date.now();
			let newStartsAt = event.startsAt;
			let newEndsAt = event.endsAt;

			if (status === "live") {
				// ensure now is between startsAt and endsAt
				newStartsAt = Math.min(event.startsAt, now - 1000);
				newEndsAt = Math.max(event.endsAt, now + 60 * 60 * 1000);
			} else if (status === "upcoming") {
				// push start into the future (1 hour from now)
				newStartsAt = now + 60 * 60 * 1000;
				newEndsAt =
					newStartsAt + Math.max(60 * 60 * 1000, event.endsAt - event.startsAt);
			} else if (status === "ended") {
				// set end in the past
				newEndsAt = now - 1000;
				newStartsAt = Math.min(event.startsAt, newEndsAt - 60 * 60 * 1000);
			}

			await updateStatus({
				id: event._id,
				name: event.name,
				description: event.description,
				eventImage: event.eventImage,
				startsAt: newStartsAt,
				endsAt: newEndsAt,
				messageToParticipants: event.messageToParticipants,
			});
			toast.success(`Event status changed to ${status}`);
		} catch {
			toast.error("Failed to update status");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePostAnnouncement = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!event || !message.trim()) return;

		try {
			setIsLoading(true);
			await createAnnouncement({
				eventId: event._id,
				message: message.trim(),
				type: announcementType,
			});
			setMessage("");
			toast.success("Announcement posted");
		} catch {
			toast.error("Failed to post announcement");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteAnnouncement = async (id: Id<"announcements">) => {
		try {
			setIsLoading(true);
			await removeAnnouncement({ id });
			toast.success("Announcement deleted");
		} catch {
			toast.error("Failed to delete announcement");
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusBadgeVariant = (status: EventStatus) => {
		switch (status) {
			case "live":
				return "default";
			case "upcoming":
				return "secondary";
			case "ended":
				return "outline";
		}
	};

	const getAnnouncementIcon = (type: AnnouncementType) => {
		switch (type) {
			case "info":
				return <Info className="h-5 w-5" />;
			case "warning":
				return <AlertTriangle className="h-5 w-5" />;
			case "success":
				return <CheckCircle className="h-5 w-5" />;
		}
	};

	const getAnnouncementColor = (type: AnnouncementType) => {
		switch (type) {
			case "info":
				return {
					bg: "bg-blue-50 dark:bg-blue-950/30",
					//   border: "border-blue-200 dark:border-blue-800",
					icon: "text-blue-600 dark:text-blue-400",
					badge:
						"bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
				};
			case "warning":
				return {
					bg: "bg-amber-50 dark:bg-amber-950/30",
					//   border: "border-amber-200 dark:border-amber-800",
					icon: "text-amber-600 dark:text-amber-400",
					badge:
						"bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
				};
			case "success":
				return {
					bg: "bg-emerald-50 dark:bg-emerald-950/30",
					//   border: "border-emerald-200 dark:border-emerald-800",
					icon: "text-emerald-600 dark:text-emerald-400",
					badge:
						"bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
				};
		}
	};

	if (!event) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-900">
				<motion.div
					className="relative h-10 w-10"
					animate={{ rotate: 360 }}
					transition={{
						duration: 1,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				>
					<div className="absolute inset-0 rounded-full border-4 border-primary/20" />
					<div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent" />
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-bg-main text-blue-100">
			<div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35 }}
					className="relative mb-12"
				>
					<div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-primary/5 blur-3xl" />
					<div className="mb-4 flex items-center gap-4">
						<motion.div
							animate={{ rotate: [0, 5, -5, 0] }}
							transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
							className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/30 to-primary/10 p-3 shadow-lg"
						>
							<Megaphone className="h-8 w-8 text-primary" />
						</motion.div>
						<div>
							<h1 className="bg-linear-to-r from-primary to-blue-400 bg-clip-text font-bold text-4xl text-transparent tracking-tight">
								Broadcast Announcement
							</h1>
							<p className="mt-1 text-muted-foreground text-sm">
								Keep your community informed with instant updates
							</p>
						</div>
					</div>
				</motion.div>

				{/* Main Content Container */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35 }}
					className="rounded-2xl border border-gray-700/50 bg-linear-to-br from-gray-800/60 via-gray-900/50 to-black/40 p-6 shadow-2xl backdrop-blur-md"
				>
					{/* Form Section */}
					<div className="mb-8">
						<div className="mb-5 flex items-center gap-2">
							<div className="rounded-lg bg-linear-to-br from-primary/30 to-primary/10 p-2">
								<Sparkles className="h-5 w-5 text-primary" />
							</div>
							<h2 className="font-semibold text-foreground text-xl">
								Create Announcement
							</h2>
						</div>
						<form onSubmit={handlePostAnnouncement} className="space-y-5">
							<div>
								<label className="mb-2 block font-medium text-gray-300 text-sm">
									Announcement Type
								</label>
								<Select
									value={announcementType}
									onValueChange={(v) =>
										setAnnouncementType(v as AnnouncementType)
									}
									disabled={isLoading}
								>
									<SelectTrigger className="h-11 rounded-xl border border-gray-600/50 bg-gray-700/50 text-foreground shadow-sm transition-colors hover:bg-gray-700/70">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="rounded-xl border border-gray-700/50 bg-gray-800 text-gray-300 shadow-lg">
										<SelectItem value="info">📋 Info</SelectItem>
										<SelectItem value="warning">⚠️ Warning</SelectItem>
										<SelectItem value="success">✅ Success</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<label className="mb-2 block font-medium text-gray-300 text-sm">
									Message
								</label>
								<Textarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder="Share important updates with your participants..."
									className="min-h-28 resize-none rounded-xl border border-gray-600/50 bg-gray-700/30 text-foreground text-sm placeholder-gray-500 shadow-sm transition-all focus:border-primary/50 focus:shadow-lg"
									disabled={isLoading}
								/>
							</div>

							<motion.div
								whileHover={{ scale: message.trim() ? 1.01 : 1 }}
								whileTap={{ scale: message.trim() ? 0.99 : 1 }}
							>
								<Button
									type="submit"
									disabled={!message.trim() || isLoading}
									className="h-11 w-full rounded-xl bg-linear-to-r from-primary to-blue-500 font-semibold shadow-lg transition-all hover:from-primary/90 hover:to-blue-500/90 hover:shadow-xl active:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
								>
									<Send className="mr-2 h-5 w-5" />
									{isLoading ? "Posting..." : "Post Announcement"}
								</Button>
							</motion.div>
						</form>
					</div>

					{/* Divider */}
					<div className="mb-6 h-px bg-gray-700/30" />

					{/* Announcements List */}
					<div>
						<div className="mb-6 pt-2">
							<div className="mb-2 flex items-center gap-3">
								<div className="rounded-lg bg-linear-to-br from-blue-500/30 to-cyan-500/10 p-2">
									<MessageSquare className="h-5 w-5 text-blue-400" />
								</div>
								<div>
									<h2 className="font-semibold text-2xl text-foreground">
										Recent Announcements
									</h2>
									<p className="mt-0.5 text-gray-400 text-xs">
										{announcements.length} update
										{announcements.length !== 1 ? "s" : ""} posted
									</p>
								</div>
							</div>
						</div>
						{announcements.length === 0 ? (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="rounded-xl border border-gray-700/30 bg-linear-to-br from-gray-700/20 to-transparent px-4 py-16 text-center"
							>
								<motion.div
									animate={{ y: [0, -8, 0] }}
									transition={{
										duration: 2.5,
										repeat: Number.POSITIVE_INFINITY,
									}}
								>
									<Megaphone className="mx-auto mb-4 h-16 w-16 text-primary/40" />
								</motion.div>
								<p className="mb-2 font-semibold text-gray-300 text-lg">
									No announcements yet
								</p>
								<p className="text-gray-400 text-sm">
									Create your first announcement above to keep everyone in the
									loop
								</p>
							</motion.div>
						) : (
							<div className="space-y-3.5">
								<AnimatePresence mode="popLayout">
									{announcements.map((announcement, index) => {
										const colors = getAnnouncementColor(announcement.type);
										return (
											<motion.div
												key={announcement._id}
												initial={{ opacity: 0, y: -10, scale: 0.95 }}
												animate={{ opacity: 1, y: 0, scale: 1 }}
												exit={{ opacity: 0, y: -10, scale: 0.95 }}
												transition={{ duration: 0.25, delay: index * 0.08 }}
												className={`flex items-start justify-between gap-4 rounded-xl p-5 ${colors.bg} group border border-gray-700/40 shadow-md backdrop-blur-sm transition-all hover:scale-[1.01] hover:shadow-lg`}
											>
												<div className="flex min-w-0 flex-1 gap-4">
													<motion.div
														animate={{ scale: [1, 1.1, 1] }}
														transition={{
															duration: 2,
															repeat: Number.POSITIVE_INFINITY,
														}}
														className={`mt-1 shrink-0 rounded-lg p-2.5 ${colors.bg} ${colors.icon} bg-opacity-50`}
													>
														{getAnnouncementIcon(announcement.type)}
													</motion.div>
													<div className="min-w-0 flex-1">
														<p className="wrap-break-word font-medium text-foreground text-sm leading-relaxed">
															{announcement.message}
														</p>
														<p className="mt-3 flex items-center gap-1 text-gray-400 text-xs">
															<Clock className="h-3 w-3" />
															{new Date(
																announcement._creationTime,
															).toLocaleString()}
														</p>
													</div>
												</div>
												<motion.button
													whileHover={{ scale: 1.15, rotate: 90 }}
													whileTap={{ scale: 0.9 }}
													onClick={() =>
														handleDeleteAnnouncement(announcement._id)
													}
													disabled={isLoading}
													className="shrink-0 rounded-lg p-2.5 text-gray-500 opacity-0 transition-all hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100"
													aria-label="Delete announcement"
												>
													<Trash2 className="h-4 w-4" />
												</motion.button>
											</motion.div>
										);
									})}
								</AnimatePresence>
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</div>
	);
}
