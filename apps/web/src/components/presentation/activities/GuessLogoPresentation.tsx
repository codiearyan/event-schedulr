"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ImageIcon, Trophy, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface GuessLogoPresentationProps {
	activityId: Id<"liveActivities">;
	results: {
		leaderboard: {
			rank: number;
			participantId: string;
			participantName: string;
			score: number;
			correctCount: number;
		}[];
		totalParticipants: number;
		currentLogoIndex: number;
		totalLogos: number;
	};
}

export function GuessLogoPresentation({
	activityId,
	results,
}: GuessLogoPresentationProps) {
	const currentLogo = useQuery(api.guessLogo.getCurrentLogo, { activityId });
	const reactionCount = useQuery(api.activityReactions.getReactionCount, {
		activityId,
	});

	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
	const lastSyncRef = useRef<{ serverTime: number; localTime: number } | null>(
		null,
	);

	const config = currentLogo
		? { timePerLogo: currentLogo.timePerLogo }
		: { timePerLogo: 30 };

	useEffect(() => {
		if (currentLogo?.timeRemaining === undefined) {
			return;
		}

		lastSyncRef.current = {
			serverTime: currentLogo.serverTime ?? Date.now(),
			localTime: Date.now(),
		};
		setTimeRemaining(currentLogo.timeRemaining);

		if (currentLogo.timeRemaining <= 0) return;

		const interval = setInterval(() => {
			if (!lastSyncRef.current) return;

			const localElapsed = (Date.now() - lastSyncRef.current.localTime) / 1000;
			const remaining = Math.max(
				0,
				currentLogo.timeRemaining! - Math.floor(localElapsed),
			);
			setTimeRemaining(remaining);

			if (remaining <= 0) {
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [currentLogo?.serverTime, currentLogo?.timeRemaining]);

	const timerProgress =
		timeRemaining !== null
			? Math.max(0, timeRemaining / config.timePerLogo)
			: 1;

	const getTimerColor = () => {
		if (timeRemaining === null) return "bg-zinc-600";
		if (timeRemaining <= 10) return "bg-red-500";
		if (timeRemaining <= 20) return "bg-yellow-500";
		return "bg-violet-500";
	};

	const getTimerTextColor = () => {
		if (timeRemaining === null) return "text-zinc-400";
		if (timeRemaining <= 10) return "text-red-500";
		if (timeRemaining <= 20) return "text-yellow-500";
		return "text-violet-400";
	};

	if (!currentLogo) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-6">
				<ImageIcon size={96} style={{ color: "var(--presentation-muted)" }} />
				<p className="text-2xl" style={{ color: "var(--presentation-muted)" }}>
					Waiting for game to start...
				</p>
				<p style={{ color: "var(--presentation-muted)" }}>
					{results.totalParticipants} players connected
				</p>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen">
			<div className="flex flex-1 flex-col items-center justify-center p-8">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="mb-6 text-center"
				>
					<p
						className="font-medium text-lg"
						style={{ color: "var(--presentation-muted)" }}
					>
						Logo {results.currentLogoIndex + 1} of {results.totalLogos}
					</p>
				</motion.div>

				<motion.div
					className="mb-8 rounded-3xl bg-white p-12 shadow-2xl"
					style={{ boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.15)" }}
				>
					<motion.div
						key={currentLogo.index}
						initial={{ clipPath: "inset(0 0 100% 0)" }}
						animate={{ clipPath: "inset(0 0 0 0)" }}
						transition={{ duration: 5, ease: "easeOut" }}
						className="h-48 w-48"
					>
						<img
							src={currentLogo.logoUrl}
							alt="Logo to guess"
							className="h-48 w-48 object-contain"
							onError={(e) => {
								(e.target as HTMLImageElement).src =
									"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
							}}
						/>
					</motion.div>
				</motion.div>

				<div className="w-full max-w-md space-y-3">
					<div className="flex items-center justify-between">
						<span style={{ color: "var(--presentation-muted)" }}>
							Time Remaining
						</span>
						<motion.span
							animate={
								timeRemaining !== null && timeRemaining <= 10
									? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }
									: { scale: 1 }
							}
							transition={
								timeRemaining !== null && timeRemaining <= 10
									? { duration: 0.5, repeat: Number.POSITIVE_INFINITY }
									: {}
							}
							className={`font-bold font-mono text-4xl ${getTimerTextColor()}`}
						>
							{timeRemaining !== null ? `${timeRemaining}s` : "..."}
						</motion.span>
					</div>
					<div
						className="h-4 w-full overflow-hidden rounded-full"
						style={{ backgroundColor: "var(--presentation-border)" }}
					>
						<motion.div
							className={`h-full rounded-full ${getTimerColor()}`}
							initial={{ width: "100%" }}
							animate={{ width: `${timerProgress * 100}%` }}
							transition={{ duration: 0.1, ease: "linear" }}
						/>
					</div>
				</div>

				{currentLogo.hints.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						className="mt-8 max-w-md space-y-2 text-center"
					>
						<p
							className="font-medium"
							style={{ color: "var(--presentation-muted)" }}
						>
							Hints
						</p>
						{currentLogo.hints.map((hint, i) => (
							<p key={i} style={{ color: "var(--presentation-text)" }}>
								{i + 1}. {hint}
							</p>
						))}
					</motion.div>
				)}
			</div>

			<div
				className="w-80 p-6"
				style={{
					backgroundColor: "var(--presentation-card)",
					borderLeft: "1px solid var(--presentation-border)",
				}}
			>
				<h2
					className="mb-6 flex items-center gap-2 font-bold text-xl"
					style={{ color: "var(--presentation-text)" }}
				>
					<Trophy size={24} className="text-yellow-500" />
					Leaderboard
				</h2>

				{results.leaderboard.length === 0 ? (
					<p
						className="text-center"
						style={{ color: "var(--presentation-muted)" }}
					>
						No scores yet
					</p>
				) : (
					<div className="space-y-3">
						<AnimatePresence mode="popLayout">
							{results.leaderboard.slice(0, 10).map((entry) => (
								<motion.div
									key={entry.participantId}
									layout
									initial={{ opacity: 0, scale: 0.8, y: 20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.8 }}
									transition={{
										layout: { type: "spring", stiffness: 300, damping: 30 },
										opacity: { duration: 0.2 },
									}}
									className="flex items-center gap-3 rounded-lg p-3"
									style={{
										backgroundColor:
											entry.rank === 1
												? "rgba(234, 179, 8, 0.1)"
												: entry.rank === 2
													? "rgba(156, 163, 175, 0.1)"
													: entry.rank === 3
														? "rgba(217, 119, 6, 0.1)"
														: "transparent",
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
										className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
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
											className="font-medium"
											style={{ color: "var(--presentation-text)" }}
										>
											{entry.participantName}
										</p>
										<p
											className="text-xs"
											style={{ color: "var(--presentation-muted)" }}
										>
											{entry.correctCount} correct
										</p>
									</div>
									<motion.span
										key={entry.score}
										initial={{ scale: 1.3, color: "#22c55e" }}
										animate={{ scale: 1, color: "var(--presentation-text)" }}
										className="font-bold font-mono text-lg"
									>
										{entry.score}
									</motion.span>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}

				<div className="mt-6 flex gap-3">
					<div
						className="flex-1 rounded-lg p-3 text-center"
						style={{
							backgroundColor: "var(--presentation-border)",
						}}
					>
						<div className="flex items-center justify-center gap-2">
							<Heart size={16} className="fill-red-500 text-red-500" />
							<p
								className="font-bold text-xl"
								style={{ color: "var(--presentation-text)" }}
							>
								{reactionCount?.count ?? 0}
							</p>
						</div>
						<p className="text-xs" style={{ color: "var(--presentation-muted)" }}>
							Likes
						</p>
					</div>
					<div
						className="flex-1 rounded-lg p-3 text-center"
						style={{
							backgroundColor: "var(--presentation-border)",
						}}
					>
						<div className="flex items-center justify-center gap-2">
							<Users size={16} style={{ color: "var(--presentation-muted)" }} />
							<p
								className="font-bold text-xl"
								style={{ color: "var(--presentation-text)" }}
							>
								{results.totalParticipants}
							</p>
						</div>
						<p className="text-xs" style={{ color: "var(--presentation-muted)" }}>
							Players
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
