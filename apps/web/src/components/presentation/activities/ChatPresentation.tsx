"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef } from "react";

const NAME_COLORS = [
	"text-violet-400",
	"text-blue-400",
	"text-emerald-400",
	"text-amber-400",
	"text-rose-400",
	"text-cyan-400",
	"text-pink-400",
	"text-lime-400",
];

function getNameColor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

interface ChatPresentationProps {
	activityId: Id<"liveActivities">;
}

export function ChatPresentation({ activityId }: ChatPresentationProps) {
	const chatMessages = useQuery(api.chatMessages.getRecentByActivity, {
		activityId,
		limit: 30,
	});

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollTop = containerRef.current.scrollHeight;
		}
	}, [chatMessages]);

	return (
		<div className="flex min-h-screen flex-col px-8 py-8">
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-6 flex items-center justify-center gap-3"
			>
				<MessageSquare size={32} className="text-violet-500" />
				<h1
					className="font-bold text-2xl"
					style={{ color: "var(--presentation-text)" }}
				>
					Live Chat
				</h1>
			</motion.div>

			<div
				ref={containerRef}
				className="mx-auto w-full max-w-3xl flex-1 space-y-4 overflow-y-auto scroll-smooth"
				style={{ maxHeight: "calc(100vh - 200px)" }}
			>
				{!chatMessages || chatMessages.length === 0 ? (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="pt-32 text-center text-2xl"
						style={{ color: "var(--presentation-muted)" }}
					>
						No messages yet. Waiting for chat...
					</motion.p>
				) : (
					<AnimatePresence mode="popLayout">
						{chatMessages.map((msg, index) => (
							<motion.div
								key={msg._id}
								layout
								initial={{ opacity: 0, y: 30, scale: 0.95 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 25,
								}}
								className="rounded-xl p-5"
								style={{
									backgroundColor: "var(--presentation-card)",
									border: "1px solid var(--presentation-border)",
								}}
							>
								<div className="mb-2 flex items-center justify-between">
									<span
										className={`font-semibold text-lg ${getNameColor(msg.anonymousName)}`}
									>
										{msg.anonymousName}
									</span>
									<motion.span
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.2 }}
										className="text-sm"
										style={{ color: "var(--presentation-muted)" }}
									>
										{new Date(msg.sentAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</motion.span>
								</div>
								<p
									className="text-xl leading-relaxed"
									style={{ color: "var(--presentation-text)" }}
								>
									{msg.message}
								</p>
							</motion.div>
						))}
					</AnimatePresence>
				)}
			</div>
		</div>
	);
}
