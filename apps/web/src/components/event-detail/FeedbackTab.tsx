"use client";

import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { MessageCircle } from "lucide-react";

interface FeedbackTabProps {
	eventId: Id<"events">;
}

export function FeedbackTab({ eventId }: FeedbackTabProps) {
	return (
		<div className="flex flex-col items-center py-16">
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/10">
				<MessageCircle size={32} className="text-purple-400" />
			</div>
			<h3 className="mt-6 font-semibold text-white text-xl">
				Feedback Feature Coming Soon
			</h3>
			<p className="mt-2 max-w-md text-center text-white/60">
				Collect feedback from your event participants including ratings,
				comments, and NPS scores to improve your future events.
			</p>
		</div>
	);
}
