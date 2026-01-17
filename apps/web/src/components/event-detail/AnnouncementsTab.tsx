"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	AlertTriangle,
	CheckCircle,
	Info,
	Megaphone,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AnnouncementsTabProps {
	eventId: Id<"events">;
}

const typeConfig = {
	info: {
		icon: Info,
		color: "bg-blue-500/20 text-blue-400",
		iconColor: "text-blue-400",
	},
	warning: {
		icon: AlertTriangle,
		color: "bg-yellow-500/20 text-yellow-400",
		iconColor: "text-yellow-400",
	},
	success: {
		icon: CheckCircle,
		color: "bg-green-500/20 text-green-400",
		iconColor: "text-green-400",
	},
};

export function AnnouncementsTab({ eventId }: AnnouncementsTabProps) {
	const announcements = useQuery(api.announcements.getByEvent, { eventId });
	const createAnnouncement = useMutation(api.announcements.create);
	const removeAnnouncement = useMutation(api.announcements.remove);

	const [message, setMessage] = useState("");
	const [type, setType] = useState<"info" | "warning" | "success">("info");
	const [isCreating, setIsCreating] = useState(false);

	const handleCreate = async () => {
		if (!message.trim()) {
			toast.error("Please enter a message");
			return;
		}

		setIsCreating(true);
		try {
			await createAnnouncement({
				eventId,
				message: message.trim(),
				type,
			});
			setMessage("");
			toast.success("Announcement sent!");
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create announcement",
			);
		} finally {
			setIsCreating(false);
		}
	};

	const handleRemove = async (id: Id<"announcements">) => {
		if (!confirm("Are you sure you want to delete this announcement?")) return;
		try {
			await removeAnnouncement({ id });
			toast.success("Announcement deleted!");
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to delete announcement",
			);
		}
	};

	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	if (announcements === undefined) {
		return (
			<div className="space-y-4">
				<div className="h-32 animate-pulse rounded-xl bg-white/5" />
				{[1, 2].map((i) => (
					<div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
				<h3 className="font-semibold text-white">New Announcement</h3>
				<Textarea
					placeholder="Type your announcement message..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="mt-4 min-h-24 border-white/10 bg-white/5"
				/>

				<div className="mt-4 flex items-center justify-between">
					<div className="flex gap-2">
						{(["info", "warning", "success"] as const).map((t) => {
							const config = typeConfig[t];
							const Icon = config.icon;
							return (
								<button
									key={t}
									type="button"
									onClick={() => setType(t)}
									className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
										type === t
											? config.color
											: "bg-white/5 text-white/50 hover:bg-white/10"
									}`}
								>
									<Icon size={14} />
									{t.charAt(0).toUpperCase() + t.slice(1)}
								</button>
							);
						})}
					</div>

					<Button
						onClick={handleCreate}
						disabled={isCreating || !message.trim()}
						className="bg-white text-black hover:bg-white/90"
					>
						<Plus size={14} className="mr-2" />
						{isCreating ? "Sending..." : "Send Announcement"}
					</Button>
				</div>
			</div>

			<div>
				<h2 className="font-semibold text-white text-xl">Announcements</h2>

				{announcements.length > 0 ? (
					<div className="mt-4 space-y-3">
						{announcements.map((announcement) => {
							const config = typeConfig[announcement.type];
							const Icon = config.icon;

							return (
								<div
									key={announcement._id}
									className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
								>
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}
									>
										<Icon size={18} />
									</div>

									<div className="flex-1">
										<p className="text-white">{announcement.message}</p>
										<p className="mt-1 text-sm text-white/50">
											{formatTime(announcement._creationTime)}
										</p>
									</div>

									<Button
										size="sm"
										variant="ghost"
										className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
										onClick={() => handleRemove(announcement._id)}
									>
										<Trash2 size={14} />
									</Button>
								</div>
							);
						})}
					</div>
				) : (
					<div className="mt-8 flex flex-col items-center py-12">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
							<Megaphone size={24} className="text-white/30" />
						</div>
						<h3 className="mt-4 font-semibold text-lg text-white">
							No announcements yet
						</h3>
						<p className="mt-1 text-sm text-white/50">
							Send an announcement to notify all participants
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
