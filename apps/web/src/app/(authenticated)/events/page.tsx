"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowRight, PlusIcon, QrCode, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

async function loadImageAsDataUrl(url: string): Promise<string | null> {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}

type EventWithStatus = {
	_id: Id<"events">;
	_creationTime: number;
	name: string;
	description: string;
	eventImage?: { type: "uploaded" | "preset"; value: string };
	startsAt: number;
	endsAt: number;
	messageToParticipants?: string;
	isCurrentEvent: boolean;
	status: "upcoming" | "live" | "ended";
};

function formatTime(timestampMs: number): string {
	const date = new Date(timestampMs);
	return date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

function formatDateLabel(date: Date): { primary: string; secondary: string } {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const isToday = date.toDateString() === today.toDateString();
	const isTomorrow = date.toDateString() === tomorrow.toDateString();
	const isYesterday = date.toDateString() === yesterday.toDateString();

	const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

	if (isToday) return { primary: "Today", secondary: dayName };
	if (isTomorrow) return { primary: "Tomorrow", secondary: dayName };
	if (isYesterday) return { primary: "Yesterday", secondary: dayName };

	return {
		primary: date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		}),
		secondary: dayName,
	};
}

function groupEventsByDate(
	events: EventWithStatus[],
): Map<string, EventWithStatus[]> {
	const groups = new Map<string, EventWithStatus[]>();

	const sortedEvents = [...events].sort((a, b) => a.startsAt - b.startsAt);

	for (const event of sortedEvents) {
		const date = new Date(event.startsAt);
		const key = date.toDateString();
		const existing = groups.get(key) || [];
		existing.push(event);
		groups.set(key, existing);
	}

	return groups;
}

function EventCard({
	event,
	isHighlighted,
}: {
	event: EventWithStatus;
	isHighlighted: boolean;
}) {
	const participants = useQuery(api.participants.getByEvent, {
		eventId: event._id,
	});
	const accessCodes = useQuery(api.accessCodes.listByEvent, {
		eventId: event._id,
	});
	const [isDownloading, setIsDownloading] = useState(false);

	const participantCount = participants?.length ?? 0;
	const hasAccessCode = accessCodes && accessCodes.length > 0;

	const handleDownloadQR = async () => {
		if (!hasAccessCode) {
			toast.error(
				"No access code found. Generate one first from event details.",
			);
			return;
		}

		setIsDownloading(true);
		try {
			const { default: QRCode } = await import("qrcode");
			const { jsPDF } = await import("jspdf");

			const code = accessCodes[0].code;
			const magicLink = `${window.location.origin}/join?code=${code}`;
			const qrDataUrl = await QRCode.toDataURL(magicLink, {
				width: 300,
				margin: 2,
			});

			const logoUrl =
				"https://cdn.discordapp.com/attachments/843057977023004692/1461325669769150736/WhatsApp_Image_2026-01-15_at_16.47.20-removebg-preview_1_-_Edited_1.png?ex=696a2515&is=6968d395&hm=7069116d20d5579ab03b1b6893cf39b95a3d8bb5e0ef470545755aabf7d79462&";
			const logoDataUrl = await loadImageAsDataUrl(logoUrl);

			const pdf = new jsPDF();
			pdf.setFontSize(24);
			pdf.text(event.name, 105, 30, { align: "center" });
			pdf.addImage(qrDataUrl, "PNG", 55, 50, 100, 100);
			pdf.setFontSize(14);
			pdf.text(`Access Code: ${code}`, 105, 165, { align: "center" });
			pdf.setFontSize(10);
			pdf.setTextColor(100);
			pdf.text("Scan this QR code to join the event", 105, 175, {
				align: "center",
			});

			pdf.setDrawColor(200);
			pdf.line(60, 195, 150, 195);

			if (logoDataUrl) {
				pdf.addImage(logoDataUrl, "PNG", 85, 205, 10, 10);
			}
			pdf.setFontSize(9);
			pdf.setTextColor(120);
			pdf.text("Powered by EventSchedulr", 105, 225, { align: "center" });

			pdf.save(`${event.name.replace(/\s+/g, "-")}-qr.pdf`);

			toast.success("QR code PDF downloaded!");
		} catch (error) {
			console.error("Failed to generate QR PDF:", error);
			toast.error("Failed to generate QR code PDF");
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div
			className={`relative flex rounded-xl border p-5 transition-all ${
				isHighlighted
					? "border-purple-500/50 bg-white/[0.08]"
					: "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
			}`}
		>
			<div className="flex flex-1 flex-col gap-3">
				<span className="text-sm text-white/60">
					{formatTime(event.startsAt)}
				</span>
				<h3 className="font-semibold text-white text-xl">{event.name}</h3>

				<div className="flex items-center gap-4 text-sm">
					<span className="flex items-center gap-1.5 text-white/50">
						<Users size={14} />
						{participantCount} participant{participantCount !== 1 ? "s" : ""}
					</span>
				</div>

				<div className="mt-2 flex items-center gap-3">
					<button
						type="button"
						onClick={handleDownloadQR}
						disabled={isDownloading}
						className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<QrCode size={14} />
						{isDownloading ? "Downloading…" : "Download QR"}
					</button>
					<Link
						href={`/events/${event._id}`}
						className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-white/20"
					>
						Manage
						<ArrowRight size={14} />
					</Link>
				</div>
			</div>

			<div className="ml-4 h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-amber-200 to-amber-400">
				<div className="flex h-full w-full items-center justify-center">
					<div className="h-16 w-16 rounded-full border-4 border-white/30" />
				</div>
			</div>
		</div>
	);
}

function EmptyState({ type }: { type: "upcoming" | "past" }) {
	return (
		<div className="flex flex-col items-center py-16">
			<div className="mb-8">
				<img
					className="h-40 w-auto opacity-60"
					src="https://cdn.discordapp.com/attachments/843057977023004692/1461829057414037817/image-Picsart-BackgroundRemover_1.png?ex=696bf9e6&is=696aa866&hm=2b3690aecb716fba50dbafb35e1d97ada901fb03f04c7b6f5d28f710a9304b9c&"
					alt="No events"
					width={160}
					height={160}
				/>
			</div>

			<h2 className="font-semibold text-2xl text-white">
				No {type === "upcoming" ? "Upcoming" : "Past"} Events
			</h2>
			<p className="mt-2 text-white/60">
				{type === "upcoming"
					? "You have no upcoming events. Why not host one?"
					: "You have no past events yet."}
			</p>

			{type === "upcoming" && (
				<Link
					href="/create-event"
					className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-white/20"
				>
					<PlusIcon size={16} />
					Create Event
				</Link>
			)}
		</div>
	);
}

export default function EventsPage() {
	const events = useQuery(api.events.getAll);
	const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

	if (events === undefined) {
		return (
			<div className="mx-auto max-w-5xl px-6 py-12 text-white">
				<div className="animate-pulse">
					<div className="h-10 w-32 rounded bg-white/10" />
					<div className="mt-8 h-40 rounded-xl bg-white/5" />
				</div>
			</div>
		);
	}

	const filteredEvents = events.filter((event) => {
		if (activeTab === "upcoming") {
			return event.status === "upcoming" || event.status === "live";
		}
		return event.status === "ended";
	});

	const groupedEvents = groupEventsByDate(filteredEvents);

	return (
		<div className="mx-auto max-w-5xl px-6 text-white">
			<div className="flex items-center justify-between py-8">
				<h1 className="font-bold text-4xl">Events</h1>

				<div className="flex rounded-xl bg-white/5 p-1">
					<button
						type="button"
						className={`min-w-[100px] cursor-pointer rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
							activeTab === "upcoming"
								? "bg-[#41454E] text-white"
								: "text-white/40 hover:text-white"
						}`}
						onClick={() => setActiveTab("upcoming")}
					>
						Upcoming
					</button>
					<button
						type="button"
						className={`min-w-[100px] cursor-pointer rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
							activeTab === "past"
								? "bg-[#41454E] text-white"
								: "text-white/40 hover:text-white"
						}`}
						onClick={() => setActiveTab("past")}
					>
						Past
					</button>
				</div>
			</div>

			{filteredEvents.length === 0 ? (
				<EmptyState type={activeTab} />
			) : (
				<div className="space-y-8 pb-16">
					{Array.from(groupedEvents.entries()).map(([dateKey, dateEvents]) => {
						const dateLabel = formatDateLabel(new Date(dateKey));
						const isFirstGroup =
							Array.from(groupedEvents.keys())[0] === dateKey;

						return (
							<div key={dateKey} className="relative flex gap-8">
								<div className="relative w-24 flex-shrink-0 pt-1">
									<div className="sticky top-20">
										<span className="block font-semibold text-white">
											{dateLabel.primary}
										</span>
										<span className="block text-sm text-white/50">
											{dateLabel.secondary}
										</span>
									</div>

									<div className="absolute top-2 right-0">
										<div className="h-2 w-2 rounded-full bg-purple-500" />
									</div>
									<div className="absolute top-5 right-[3px] bottom-0 w-px border-white/30 border-l border-dashed" />
								</div>

								<div className="flex-1 space-y-4">
									{dateEvents.map((event) => (
										<EventCard
											key={event._id}
											event={event}
											isHighlighted={
												event.status === "live" || event.isCurrentEvent
											}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}

			<div className="border-purple-500/30 border-t py-12">
				<p className="text-center text-purple-400">
					Host your event with{" "}
					<Link href="/" className="underline hover:text-purple-300">
						EventSchedulr
					</Link>
				</p>
			</div>
		</div>
	);
}
