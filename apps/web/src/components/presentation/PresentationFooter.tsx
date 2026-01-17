"use client";

import { Heart, Users } from "lucide-react";

import { AnimatedNumber } from "./animations/AnimatedNumber";

interface PresentationFooterProps {
	heartCount: number;
	participantCount: number;
}

export function PresentationFooter({
	heartCount,
	participantCount,
}: PresentationFooterProps) {
	return (
		<footer className="absolute right-0 bottom-0 left-0 z-10 flex items-center justify-end gap-4 p-4">
			<div
				className="flex items-center gap-2 rounded-full px-4 py-2"
				style={{
					backgroundColor: "var(--presentation-card)",
					border: "1px solid var(--presentation-border)",
				}}
			>
				<Heart size={18} className="fill-red-500 text-red-500" />
				<AnimatedNumber value={heartCount} />
			</div>

			<div
				className="flex items-center gap-2 rounded-full px-4 py-2"
				style={{
					backgroundColor: "var(--presentation-card)",
					border: "1px solid var(--presentation-border)",
				}}
			>
				<Users size={18} style={{ color: "var(--presentation-muted)" }} />
				<AnimatedNumber value={participantCount} />
			</div>
		</footer>
	);
}
