"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NAME_COLORS = [
	"text-violet-500",
	"text-blue-500",
	"text-emerald-500",
	"text-amber-500",
	"text-rose-500",
	"text-cyan-500",
];

function getNameColor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

interface ChatFeedProps {
	activityId: Id<"liveActivities">;
}

export function ChatFeed({ activityId }: ChatFeedProps) {
	const chatMessages = useQuery(api.chatMessages.getRecentByActivity, {
		activityId,
		limit: 20,
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<MessageSquare className="h-5 w-5" />
					Live Chat
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[300px] overflow-y-auto pr-4">
					{!chatMessages || chatMessages.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground">
							No messages yet
						</p>
					) : (
						<AnimatePresence mode="popLayout">
							<div className="space-y-3">
								{chatMessages.map((msg) => (
									<motion.div
										key={msg._id}
										layout
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0 }}
										className="rounded-lg border bg-card p-3"
									>
										<div className="mb-1 flex items-center justify-between">
											<span
												className={`font-medium text-sm ${getNameColor(msg.anonymousName)}`}
											>
												{msg.anonymousName}
											</span>
											<span className="text-muted-foreground text-xs">
												{new Date(msg.sentAt).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
										<p className="text-sm">{msg.message}</p>
									</motion.div>
								))}
							</div>
						</AnimatePresence>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
