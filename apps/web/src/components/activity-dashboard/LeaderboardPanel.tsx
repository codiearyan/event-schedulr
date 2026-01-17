"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardEntry {
	rank: number;
	participantId: string;
	participantName: string;
	score?: number;
	bestTime?: number;
	correctCount?: number;
}

interface LeaderboardPanelProps {
	title: string;
	entries: LeaderboardEntry[];
	scoreLabel?: string;
	showScore?: boolean;
	totalParticipants: number;
}

export function LeaderboardPanel({
	title,
	entries,
	scoreLabel = "Score",
	showScore = true,
	totalParticipants,
}: LeaderboardPanelProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Trophy className="h-5 w-5 text-yellow-500" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{entries.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground">
						No scores yet
					</p>
				) : (
					<div className="space-y-2">
						<AnimatePresence mode="popLayout">
							{entries.slice(0, 10).map((entry) => (
								<motion.div
									key={entry.participantId}
									layout
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className={`flex items-center gap-3 rounded-lg border p-3 ${
										entry.rank === 1
											? "border-yellow-500/30 bg-yellow-500/5"
											: entry.rank === 2
												? "border-gray-400/30 bg-gray-400/5"
												: entry.rank === 3
													? "border-amber-600/30 bg-amber-600/5"
													: ""
									}`}
								>
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
											entry.rank === 1
												? "bg-yellow-500 text-black"
												: entry.rank === 2
													? "bg-gray-400 text-black"
													: entry.rank === 3
														? "bg-amber-600 text-white"
														: "bg-muted"
										}`}
									>
										{entry.rank}
									</div>
									<div className="flex-1">
										<p className="font-medium">{entry.participantName}</p>
										{entry.correctCount !== undefined && (
											<p className="text-muted-foreground text-xs">
												{entry.correctCount} correct
											</p>
										)}
									</div>
									{showScore && (
										<motion.span
											key={entry.score ?? entry.bestTime}
											initial={{ scale: 1.2 }}
											animate={{ scale: 1 }}
											className="font-mono font-semibold"
										>
											{entry.bestTime !== undefined
												? `${entry.bestTime}ms`
												: `${entry.score} pts`}
										</motion.span>
									)}
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}

				<div className="mt-4 border-t pt-4 text-center text-muted-foreground text-sm">
					{totalParticipants} participants
				</div>
			</CardContent>
		</Card>
	);
}
