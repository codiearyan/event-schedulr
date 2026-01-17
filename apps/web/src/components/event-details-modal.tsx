import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	Calendar,
	CalendarClock,
	CheckCircle,
	Copy,
	Download,
	FileText,
	QrCode,
	Radio,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getPresetById } from "@/lib/event-graphics";

function getPresetBackground(presetId: string): string {
	const preset = getPresetById(presetId);
	return (
		preset?.background || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
	);
}

interface EventDetailsModalProps {
	eventId: Id<"events">;
	onClose: () => void;
}

export function EventDetailsModal({
	eventId,
	onClose,
}: EventDetailsModalProps) {
	const event = useQuery(api.events.getById, { id: eventId });
	const accessCodes = useQuery(api.accessCodes.listByEvent, { eventId });
	const generateAccessCode = useMutation(api.accessCodes.generate);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [maxUses, setMaxUses] = useState("");
	const qrCanvasRef = useRef<HTMLCanvasElement>(null);

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
			toast.error("Failed to generate QR code");
		}
	};

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		toast.success("Access code copied to clipboard!");
	};

	const handleCopyMagicLink = (code: string) => {
		const magicLink = `${window.location.origin}/join?code=${code}`;
		navigator.clipboard.writeText(magicLink);
		toast.success("Magic link copied to clipboard!");
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
				a.download = `event-qr-${event?.name.replace(
					/\s+/g,
					"-",
				)}-${Date.now()}.png`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				toast.success("QR code downloaded!");
			});
		};
		img.src = qrCodeUrl;
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

	if (!event) {
		return null;
	}

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "live":
				return "default";
			case "upcoming":
				return "secondary";
			case "ended":
				return "outline";
			default:
				return "outline";
		}
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-main p-4">
			<Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="flex items-center gap-3">
								{event.eventImage?.type === "uploaded" &&
									event.resolvedImageUrl && (
										<img
											src={event.resolvedImageUrl}
											alt={event.name}
											className="h-16 w-16 rounded-lg object-cover"
										/>
									)}
								{event.eventImage?.type === "preset" && (
									<div
										className="h-16 w-16 rounded-lg"
										style={{
											background: getPresetBackground(event.eventImage.value),
										}}
									/>
								)}
								<div className="flex-1">
									<CardTitle>{event.name}</CardTitle>
									<CardDescription className="mt-1">
										{event.description}
									</CardDescription>
								</div>
							</div>
							<div className="mt-4 flex items-center gap-2">
								<Badge variant={getStatusBadgeVariant(event.status)}>
									{event.status === "live" && (
										<Radio className="mr-1 h-3 w-3" />
									)}
									{event.status}
								</Badge>
								{event.isCurrentEvent && (
									<Badge variant="outline">Current Event</Badge>
								)}
							</div>
						</div>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="flex items-start gap-2">
							<Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-xs">Starts</p>
								<p className="font-medium">{formatDate(event.startsAt)}</p>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-xs">Ends</p>
								<p className="font-medium">{formatDate(event.endsAt)}</p>
							</div>
						</div>
					</div>

					{event.messageToParticipants && (
						<div className="flex items-start gap-2">
							<FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-xs">Message</p>
								<p className="text-sm">{event.messageToParticipants}</p>
							</div>
						</div>
					)}

					<Separator />

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="font-semibold">Access Codes</h3>
								<p className="text-muted-foreground text-sm">
									Generate codes for participants to join
								</p>
							</div>
							<div className="flex gap-2">
								<Input
									type="number"
									placeholder="Max uses (optional)"
									value={maxUses}
									onChange={(e) => setMaxUses(e.target.value)}
									className="w-32"
								/>
								<Button onClick={handleGenerateCode} size="sm">
									Generate Code
								</Button>
							</div>
						</div>

						{accessCodes && accessCodes.length > 0 ? (
							<div className="space-y-3">
								{accessCodes.map((code) => (
									<div
										key={code._id}
										className="flex items-center justify-between rounded-lg border p-3"
									>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<code className="rounded bg-muted px-2 py-1 font-bold font-mono text-lg">
													{code.code}
												</code>
												{code.isActive ? (
													<Badge variant="default" className="text-xs">
														<CheckCircle className="mr-1 h-3 w-3" />
														Active
													</Badge>
												) : (
													<Badge variant="outline" className="text-xs">
														Inactive
													</Badge>
												)}
											</div>
											<div className="mt-2 flex gap-2 text-muted-foreground text-xs">
												<span>
													Uses: {code.useCount}
													{code.maxUses ? ` / ${code.maxUses}` : " (unlimited)"}
												</span>
											</div>
										</div>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleCopyCode(code.code)}
											>
												<Copy className="mr-1 h-3 w-3" />
												Copy Code
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleCopyMagicLink(code.code)}
											>
												Copy Link
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => generateQRCode(code.code)}
											>
												<QrCode className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-center text-muted-foreground text-sm">
								No access codes generated yet. Generate one above.
							</p>
						)}
					</div>

					{qrCodeUrl && (
						<>
							<Separator />
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-semibold">QR Code</h3>
										<p className="text-muted-foreground text-sm">
											Scan this QR code to join the event
										</p>
									</div>
									<Button onClick={handleDownloadQR} size="sm">
										<Download className="mr-2 h-4 w-4" />
										Download QR
									</Button>
								</div>
								<div className="flex justify-center rounded-lg border bg-white p-4">
									<img src={qrCodeUrl} alt="QR Code" className="h-64 w-64" />
									<canvas ref={qrCanvasRef} className="hidden" />
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
