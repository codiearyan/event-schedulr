"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Users, Zap } from "lucide-react";

interface ReactionSpeedPresentationProps {
	results: {
		leaderboard: {
			rank: number;
			participantId: string;
			participantName: string;
			bestTime: number;
		}[];
		totalParticipants: number;
	};
}

export function ReactionSpeedPresentation({
	results,
}: ReactionSpeedPresentationProps) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-12 py-8">
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-4"
			>
				<Zap size={48} className="text-yellow-500" />
			</motion.div>

			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="mb-12 font-bold text-4xl"
				style={{ color: "var(--presentation-text)" }}
			>
				Reaction Speed Leaderboard
			</motion.h1>

			{results.leaderboard.length === 0 ? (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="text-2xl"
					style={{ color: "var(--presentation-muted)" }}
				>
					No scores yet. Waiting for participants...
				</motion.p>
			) : (
				<div className="w-full max-w-2xl space-y-4">
					<AnimatePresence mode="popLayout">
						{results.leaderboard.slice(0, 10).map((entry, index) => (
							<motion.div
								key={entry.participantId}
								layout
								initial={{ opacity: 0, scale: 0.8, y: 20 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{
									layout: { type: "spring", stiffness: 300, damping: 30 },
									opacity: { duration: 0.2 },
									delay: index * 0.05,
								}}
								className="flex items-center gap-4 rounded-xl p-5"
								style={{
									backgroundColor:
										entry.rank === 1
											? "rgba(234, 179, 8, 0.1)"
											: entry.rank === 2
												? "rgba(156, 163, 175, 0.1)"
												: entry.rank === 3
													? "rgba(217, 119, 6, 0.1)"
													: "var(--presentation-card)",
									border:
										entry.rank <= 3
											? entry.rank === 1
												? "1px solid rgba(234, 179, 8, 0.3)"
												: entry.rank === 2
													? "1px solid rgba(156, 163, 175, 0.3)"
													: "1px solid rgba(217, 119, 6, 0.3)"
											: "1px solid var(--presentation-border)",
								}}
							>
								<motion.div
									key={`rank-${entry.rank}`}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									className={`flex h-14 w-14 items-center justify-center rounded-full font-bold text-2xl ${
										entry.rank === 1
											? "bg-yellow-500 text-black"
											: entry.rank === 2
												? "bg-gray-400 text-black"
												: entry.rank === 3
													? "bg-amber-600 text-white"
													: ""
									}`}
									style={
										entry.rank > 3
											? {
													backgroundColor: "var(--presentation-border)",
													color: "var(--presentation-muted)",
												}
											: undefined
									}
								>
									{entry.rank}
								</motion.div>
								<div className="flex-1">
									<p
										className="font-medium text-2xl"
										style={{ color: "var(--presentation-text)" }}
									>
										{entry.participantName}
									</p>
								</div>
								<motion.span
									key={entry.bestTime}
									initial={{ scale: 1.3, color: "#22c55e" }}
									animate={{ scale: 1, color: "#22c55e" }}
									className="font-bold font-mono text-3xl"
								>
									{entry.bestTime}ms
								</motion.span>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			)}

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="mt-12 flex items-center gap-2 rounded-2xl px-8 py-4"
				style={{
					backgroundColor: "var(--presentation-card)",
					border: "1px solid var(--presentation-border)",
				}}
			>
				<Users size={24} style={{ color: "var(--presentation-muted)" }} />
				<motion.span
					key={results.totalParticipants}
					initial={{ scale: 1.2 }}
					animate={{ scale: 1 }}
					className="font-bold text-3xl"
					style={{ color: "var(--presentation-text)" }}
				>
					{results.totalParticipants}
				</motion.span>
				<span style={{ color: "var(--presentation-muted)" }}>participants</span>
			</motion.div>
		</div>
	);
}
