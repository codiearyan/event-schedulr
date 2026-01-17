"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	Calendar,
	CheckCircle,
	Clock,
	Copy,
	Download,
	Edit3,
	Facebook,
	Link2,
	Linkedin,
	Megaphone,
	QrCode,
	Share2,
	Twitter,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPresetById } from "@/lib/event-graphics";

type EventWithStatus = {
	_id: Id<"events">;
	_creationTime: number;
	name: string;
	description: string;
	eventImage?: { type: "uploaded" | "preset"; value: string };
	resolvedImageUrl?: string | null;
	startsAt: number;
	endsAt: number;
	messageToParticipants?: string;
	isCurrentEvent: boolean;
	status: "upcoming" | "live" | "ended";
};

interface OverviewTabProps {
	event: EventWithStatus;
	eventId: Id<"events">;
	isEditing: boolean;
	setIsEditing: (value: boolean) => void;
}

function QuickActionCard({
	icon: Icon,
	title,
	description,
	onClick,
}: {
	icon: React.ElementType;
	title: string;
	description: string;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex flex-1 cursor-pointer flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center transition-colors hover:bg-white/[0.06]"
		>
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
				<Icon size={20} className="text-white" />
			</div>
			<div>
				<h3 className="font-medium text-white">{title}</h3>
				<p className="mt-1 text-sm text-white/50">{description}</p>
			</div>
		</button>
	);
}

function getPresetBackground(presetId: string): string {
	const preset = getPresetById(presetId);
	return (
		preset?.background || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
	);
}

export function OverviewTab({
	event,
	eventId,
	isEditing,
	setIsEditing,
}: OverviewTabProps) {
	const accessCodes = useQuery(api.accessCodes.listByEvent, { eventId });
	const participants = useQuery(api.participants.getByEvent, { eventId });
	const generateAccessCode = useMutation(api.accessCodes.generate);

	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [maxUses, setMaxUses] = useState("");
	const qrCanvasRef = useRef<HTMLCanvasElement>(null);

	const participantCount = participants?.length ?? 0;

	useEffect(() => {
		if (accessCodes && accessCodes.length > 0 && !qrCodeUrl) {
			generateQRCode(accessCodes[0].code);
		}
	}, [accessCodes, qrCodeUrl]);

	const generateQRCode = async (code: string) => {
		try {
			const { default: QRCode } = await import("qrcode");
			const magicLink = `${window.location.origin}/join?code=${code}`;
			const dataUrl = await QRCode.toDataURL(magicLink, {
				width: 400,
				margin: 2,
			});
			setQrCodeUrl(dataUrl);
		} catch (error) {
			console.error("Failed to generate QR code:", error);
		}
	};

	const handleGenerateCode = async () => {
		try {
			const maxUsesNum = maxUses ? Number.parseInt(maxUses, 10) : undefined;
			const newCode = await generateAccessCode({
				eventId,
				maxUses: maxUsesNum,
			});
			if (newCode) {
				generateQRCode(newCode.code);
				setMaxUses("");
				toast.success(`Access code generated: ${newCode.code}`);
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to generate code",
			);
		}
	};

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		toast.success("Access code copied!");
	};

	const handleCopyMagicLink = (code: string) => {
		const magicLink = `${window.location.origin}/join?code=${code}`;
		navigator.clipboard.writeText(magicLink);
		toast.success("Magic link copied!");
	};

	const handleDownloadQR = () => {
		if (!qrCodeUrl || !qrCanvasRef.current) return;

		const canvas = qrCanvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const img = new Image();
		img.onload = () => {
			canvas.width = 400;
			canvas.height = 400;
			ctx.drawImage(img, 0, 0);
			canvas.toBlob((blob) => {
				if (!blob) return;
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `event-qr-${event.name.replace(/\s+/g, "-")}-${Date.now()}.png`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				toast.success("QR code downloaded!");
			});
		};
		img.src = qrCodeUrl;
	};

	const eventUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/e/${eventId}`;

	const shareUrls = {
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
		twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(`Check out ${event.name}!`)}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`,
	};

	const handleCopyEventLink = () => {
		navigator.clipboard.writeText(eventUrl);
		toast.success("Event link copied!");
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	const scrollToShare = () => {
		document.getElementById("share-section")?.scrollIntoView({
			behavior: "smooth",
		});
	};

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-3 gap-4">
				<QuickActionCard
					icon={UserPlus}
					title="Invite Guests"
					description="Share the magic link"
					onClick={() =>
						accessCodes?.[0] && handleCopyMagicLink(accessCodes[0].code)
					}
				/>
				<QuickActionCard
					icon={Megaphone}
					title="Send Announcement"
					description="Notify participants"
				/>
				<QuickActionCard
					icon={Share2}
					title="Share Event"
					description="Spread the word"
					onClick={scrollToShare}
				/>
			</div>

			<div className="grid grid-cols-2 gap-6">
				<div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
					<div className="flex gap-4">
						{event.eventImage?.type === "uploaded" && event.resolvedImageUrl ? (
							<img
								src={event.resolvedImageUrl}
								alt={event.name}
								className="h-32 w-32 rounded-lg object-cover"
							/>
						) : event.eventImage?.type === "preset" ? (
							<div
								className="h-32 w-32 rounded-lg"
								style={{
									background: getPresetBackground(event.eventImage.value),
								}}
							/>
						) : (
							<div className="h-32 w-32 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
						)}

						<div className="flex-1">
							<h3 className="font-semibold text-lg text-white">{event.name}</h3>
							<p className="mt-1 text-sm text-white/60">
								{formatDate(event.startsAt)}
							</p>
							<p className="text-sm text-white/60">
								{formatTime(event.startsAt)} - {formatTime(event.endsAt)}
							</p>

							<div className="mt-3 flex items-center gap-2 text-sm text-white/50">
								<Users size={14} />
								<span>
									{participantCount} participant
									{participantCount !== 1 ? "s" : ""}
								</span>
							</div>

							{event.messageToParticipants && (
								<p className="mt-3 text-sm text-white/70">
									{event.messageToParticipants}
								</p>
							)}
						</div>
					</div>

					{accessCodes && accessCodes.length > 0 && (
						<div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
							<Link2 size={14} className="text-white/50" />
							<code className="flex-1 truncate font-mono text-sm text-white/70">
								{`${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${accessCodes[0].code}`}
							</code>
							<button
								type="button"
								onClick={() => handleCopyMagicLink(accessCodes[0].code)}
								className="text-white/50 transition-colors hover:text-white"
								aria-label="Copy magic link"
							>
								<Copy size={14} />
							</button>
						</div>
					)}
				</div>

				<div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
					<h3 className="font-semibold text-white">When & Where</h3>

					<div className="mt-4 space-y-4">
						<div className="flex items-start gap-3">
							<Calendar size={18} className="mt-0.5 text-white/50" />
							<div>
								<p className="font-medium text-white">
									{formatDate(event.startsAt)}
								</p>
								<p className="text-sm text-white/60">
									{new Date(event.startsAt).toLocaleDateString("en-US", {
										weekday: "long",
									})}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Clock size={18} className="mt-0.5 text-white/50" />
							<div>
								<p className="font-medium text-white">
									{formatTime(event.startsAt)} - {formatTime(event.endsAt)}
								</p>
								<p className="text-sm text-white/60">
									{Intl.DateTimeFormat().resolvedOptions().timeZone}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div
				id="share-section"
				className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
			>
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-white">Share Event</h3>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setIsEditing(!isEditing)}
							className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 font-medium text-sm transition-colors hover:bg-white/20"
						>
							<Edit3 size={14} />
							{isEditing ? "Cancel Edit" : "Edit Event"}
						</button>
					</div>
				</div>

				<div className="mt-4 flex items-center gap-3">
					<a
						href={shareUrls.facebook}
						target="_blank"
						rel="noopener noreferrer"
						className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
						aria-label="Share on Facebook"
					>
						<Facebook size={18} />
					</a>
					<a
						href={shareUrls.twitter}
						target="_blank"
						rel="noopener noreferrer"
						className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
						aria-label="Share on X (Twitter)"
					>
						<Twitter size={18} />
					</a>
					<a
						href={shareUrls.linkedin}
						target="_blank"
						rel="noopener noreferrer"
						className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
						aria-label="Share on LinkedIn"
					>
						<Linkedin size={18} />
					</a>
					<button
						type="button"
						onClick={handleCopyEventLink}
						className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
						aria-label="Copy event link"
					>
						<Copy size={18} />
					</button>
				</div>
			</div>

			<div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-semibold text-white">Access Codes</h3>
						<p className="mt-1 text-sm text-white/50">
							Generate codes for participants to join
						</p>
					</div>
					<div className="flex gap-2">
						<Input
							type="number"
							placeholder="Max uses"
							value={maxUses}
							onChange={(e) => setMaxUses(e.target.value)}
							className="w-24 border-white/10 bg-white/5"
						/>
						<Button
							onClick={handleGenerateCode}
							size="sm"
							className="bg-white text-black hover:bg-white/90"
						>
							Generate
						</Button>
					</div>
				</div>

				{accessCodes && accessCodes.length > 0 ? (
					<div className="mt-4 space-y-3">
						{accessCodes.map((code) => (
							<div
								key={code._id}
								className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<code className="rounded bg-white/10 px-2 py-1 font-bold font-mono text-lg">
											{code.code}
										</code>
										{code.isActive ? (
											<span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-green-400 text-xs">
												<CheckCircle size={12} />
												Active
											</span>
										) : (
											<span className="rounded-full bg-white/10 px-2 py-0.5 text-white/50 text-xs">
												Inactive
											</span>
										)}
									</div>
									<p className="mt-1 text-sm text-white/50">
										Uses: {code.useCount}
										{code.maxUses ? ` / ${code.maxUses}` : " (unlimited)"}
									</p>
								</div>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => handleCopyCode(code.code)}
										className="rounded-lg bg-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/20"
										aria-label="Copy access code"
									>
										<Copy size={14} />
									</button>
									<button
										type="button"
										onClick={() => handleCopyMagicLink(code.code)}
										className="rounded-lg bg-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/20"
										aria-label="Copy magic link"
									>
										<Link2 size={14} />
									</button>
									<button
										type="button"
										onClick={() => generateQRCode(code.code)}
										className="rounded-lg bg-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/20"
										aria-label="Generate QR code"
									>
										<QrCode size={14} />
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="mt-4 text-center text-sm text-white/50">
						No access codes yet. Generate one above.
					</p>
				)}

				{qrCodeUrl && (
					<div className="mt-6">
						<div className="flex items-center justify-between">
							<h4 className="font-medium text-white">QR Code</h4>
							<Button
								onClick={handleDownloadQR}
								size="sm"
								variant="outline"
								className="border-white/10"
							>
								<Download size={14} className="mr-2" />
								Download
							</Button>
						</div>
						<div className="mt-3 flex justify-center rounded-lg bg-white p-4">
							<img src={qrCodeUrl} alt="QR Code" className="h-48 w-48" />
							<canvas ref={qrCanvasRef} className="hidden" />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
