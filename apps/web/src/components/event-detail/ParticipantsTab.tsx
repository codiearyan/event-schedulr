"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Download, QrCode, Search, Ticket, Users } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ParticipantsTabProps {
	eventId: Id<"events">;
}

function formatJoinedDate(timestamp: number): string {
	return new Date(timestamp).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

export function ParticipantsTab({ eventId }: ParticipantsTabProps) {
	const participants = useQuery(api.participants.getByEvent, { eventId });
	const [searchQuery, setSearchQuery] = useState("");

	const filteredParticipants = participants?.filter(
		(p) =>
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.email.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleExport = () => {
		if (!participants || participants.length === 0) return;

		const csvContent = [
			["Name", "Email", "Access Method", "Joined At"].join(","),
			...participants.map((p) =>
				[
					p.name,
					p.email,
					p.accessMethod === "qr_code" ? "QR Code" : "Access Code",
					new Date(p.joinedAt).toISOString(),
				].join(","),
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `participants-${Date.now()}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	if (participants === undefined) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="h-8 w-40 animate-pulse rounded bg-white/10" />
					<div className="h-10 w-24 animate-pulse rounded bg-white/10" />
				</div>
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h2 className="font-semibold text-white text-xl">Participants</h2>
					<Badge variant="secondary" className="bg-white/10 text-white">
						{participants.length}
					</Badge>
				</div>
				<Button
					onClick={handleExport}
					variant="outline"
					size="sm"
					className="border-white/10"
					disabled={participants.length === 0}
				>
					<Download size={14} className="mr-2" />
					Export
				</Button>
			</div>

			<div className="relative">
				<Search
					size={16}
					className="absolute top-1/2 left-3 -translate-y-1/2 text-white/40"
				/>
				<Input
					placeholder="Search by name or email..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="border-white/10 bg-white/5 pl-10"
				/>
			</div>

			{filteredParticipants && filteredParticipants.length > 0 ? (
				<div className="space-y-3">
					{filteredParticipants.map((participant) => (
						<div
							key={participant._id}
							className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
						>
							<img
								src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${participant.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
								alt={participant.name}
								className="h-12 w-12 rounded-full bg-white/10"
							/>

							<div className="flex-1">
								<h3 className="font-medium text-white">{participant.name}</h3>
								<p className="text-sm text-white/50">{participant.email}</p>
							</div>

							<div className="flex items-center gap-4 text-sm text-white/50">
								<span className="flex items-center gap-1">
									{participant.accessMethod === "qr_code" ? (
										<>
											<QrCode size={14} />
											QR Code
										</>
									) : (
										<>
											<Ticket size={14} />
											Access Code
										</>
									)}
								</span>
								<span>{formatJoinedDate(participant.joinedAt)}</span>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center py-16">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
						<Users size={24} className="text-white/30" />
					</div>
					<h3 className="mt-4 font-semibold text-lg text-white">
						{searchQuery ? "No matches found" : "No participants yet"}
					</h3>
					<p className="mt-1 text-sm text-white/50">
						{searchQuery
							? "Try adjusting your search query"
							: "Share the magic link to invite participants"}
					</p>
				</div>
			)}
		</div>
	);
}
