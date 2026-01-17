"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Cloud, ImageIcon, MessageSquare, Zap } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ActivityType =
	| "poll"
	| "word_cloud"
	| "reaction_speed"
	| "anonymous_chat"
	| "guess_logo";

export default function PresentModePage() {
	const params = useParams();
	const activityId = params.id as Id<"liveActivities">;

	const activity = useQuery(api.liveActivities.getById, { id: activityId });
	const results = useQuery(api.liveActivities.getAggregatedResults, {
		activityId,
	});

	if (!activity) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-950">
				<p className="text-xl text-zinc-400">Loading...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-zinc-950 text-white">
			<header className="absolute top-4 right-4 z-10">
				<div className="flex items-center gap-2 rounded-lg bg-zinc-900/80 px-4 py-2 backdrop-blur">
					<div className="h-6 w-6 rounded bg-gradient-to-br from-violet-500 to-purple-600" />
					<span className="font-semibold text-sm">EventSchedulr</span>
				</div>
			</header>

			{activity.type === "guess_logo" && results?.type === "guess_logo" && (
				<GuessLogoPresentMode activityId={activityId} results={results} />
			)}

			{activity.type === "poll" && results?.type === "poll" && (
				<PollPresentMode
					config={
						activity.config as {
							question: string;
							options: { id: string; text: string }[];
						}
					}
					results={results}
				/>
			)}

			{activity.type === "word_cloud" && results?.type === "word_cloud" && (
				<WordCloudPresentMode
					config={activity.config as { prompt: string }}
					results={results}
				/>
			)}

			{activity.type === "reaction_speed" &&
				results?.type === "reaction_speed" && (
					<ReactionSpeedPresentMode results={results} />
				)}

			{activity.type === "anonymous_chat" && (
				<AnonymousChatPresentMode activityId={activityId} />
			)}
		</div>
	);
}

function GuessLogoPresentMode({
	activityId,
	results,
}: {
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
}) {
	const currentLogo = useQuery(api.guessLogo.getCurrentLogo, { activityId });
	const logoItems = useQuery(api.guessLogo.getLogoItems, { activityId });

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
				<ImageIcon className="h-24 w-24 text-zinc-600" />
				<p className="text-2xl text-zinc-400">Waiting for game to start...</p>
				<p className="text-zinc-500">
					{results.totalParticipants} players connected
				</p>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen">
			<div className="flex flex-1 flex-col items-center justify-center p-8">
				<div className="mb-6 text-center">
					<p className="font-medium text-lg text-zinc-400">
						Logo {results.currentLogoIndex + 1} of {results.totalLogos}
					</p>
				</div>

				<div className="mb-8 rounded-3xl bg-white p-12 shadow-2xl shadow-violet-500/10">
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
				</div>

				<div className="w-full max-w-md space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-zinc-400">Time Remaining</span>
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
					<div className="h-4 w-full overflow-hidden rounded-full bg-zinc-800">
						<motion.div
							className={`h-full rounded-full ${getTimerColor()}`}
							initial={{ width: "100%" }}
							animate={{ width: `${timerProgress * 100}%` }}
							transition={{ duration: 0.1, ease: "linear" }}
						/>
					</div>
				</div>

				{currentLogo.hints.length > 0 && (
					<div className="mt-8 max-w-md space-y-2 text-center">
						<p className="font-medium text-zinc-400">Hints</p>
						{currentLogo.hints.map((hint, i) => (
							<p key={i} className="text-zinc-300">
								{i + 1}. {hint}
							</p>
						))}
					</div>
				)}
			</div>

			<div className="w-80 border-zinc-800 border-l bg-zinc-900/50 p-6">
				<h2 className="mb-6 flex items-center gap-2 font-bold text-xl">
					<span className="text-2xl">🏆</span> Leaderboard
				</h2>

				{results.leaderboard.length === 0 ? (
					<p className="text-center text-zinc-500">No scores yet</p>
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
									className={`flex items-center gap-3 rounded-lg p-3 ${
										entry.rank === 1
											? "bg-yellow-500/10 ring-1 ring-yellow-500/30"
											: entry.rank === 2
												? "bg-zinc-400/10 ring-1 ring-zinc-400/30"
												: entry.rank === 3
													? "bg-amber-600/10 ring-1 ring-amber-600/30"
													: "bg-zinc-800/50"
									}`}
								>
									<motion.div
										key={`rank-${entry.rank}`}
										initial={{ scale: 1.2 }}
										animate={{ scale: 1 }}
										className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
											entry.rank === 1
												? "bg-yellow-500 text-black"
												: entry.rank === 2
													? "bg-zinc-400 text-black"
													: entry.rank === 3
														? "bg-amber-600 text-white"
														: "bg-zinc-700 text-zinc-300"
										}`}
									>
										{entry.rank}
									</motion.div>
									<div className="flex-1">
										<p className="font-medium">{entry.participantName}</p>
										<p className="text-xs text-zinc-500">
											{entry.correctCount} correct
										</p>
									</div>
									<motion.span
										key={entry.score}
										initial={{ scale: 1.3, color: "#22c55e" }}
										animate={{ scale: 1, color: "#ffffff" }}
										className="font-bold font-mono text-lg"
									>
										{entry.score}
									</motion.span>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}

				<div className="mt-6 rounded-lg bg-zinc-800/50 p-4 text-center">
					<p className="font-bold text-2xl text-zinc-300">
						{results.totalParticipants}
					</p>
					<p className="text-xs text-zinc-500">Players</p>
				</div>
			</div>
		</div>
	);
}

function PollPresentMode({
	config,
	results,
}: {
	config: { question: string; options: { id: string; text: string }[] };
	results: { voteCounts: Record<string, number>; totalVoters: number };
}) {
	const totalVotes = Object.values(results.voteCounts).reduce(
		(sum, count) => sum + count,
		0,
	);

	const maxVotes = Math.max(...Object.values(results.voteCounts), 1);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-12">
			<div className="mb-4">
				<BarChart3 className="mx-auto h-12 w-12 text-violet-500" />
			</div>
			<h1 className="mb-12 max-w-4xl text-center font-bold text-4xl">
				{config.question}
			</h1>

			<div className="w-full max-w-3xl space-y-6">
				{config.options.map((option, index) => {
					const count = results.voteCounts[option.id] || 0;
					const percentage =
						totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
					const barWidth = maxVotes > 0 ? (count / maxVotes) * 100 : 0;

					const colors = [
						"bg-violet-500",
						"bg-blue-500",
						"bg-emerald-500",
						"bg-amber-500",
						"bg-rose-500",
						"bg-cyan-500",
					];

					return (
						<div key={option.id} className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="font-medium text-xl">{option.text}</span>
								<span className="font-bold text-2xl">
									{percentage}%{" "}
									<span className="font-normal text-lg text-zinc-500">
										({count})
									</span>
								</span>
							</div>
							<div className="h-12 overflow-hidden rounded-lg bg-zinc-800">
								<div
									className={`h-full rounded-lg transition-all duration-500 ${colors[index % colors.length]}`}
									style={{ width: `${barWidth}%` }}
								/>
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-12 rounded-xl bg-zinc-800/50 px-8 py-4">
				<span className="font-bold text-3xl">{results.totalVoters}</span>
				<span className="ml-2 text-xl text-zinc-400">total voters</span>
			</div>
		</div>
	);
}

function WordCloudPresentMode({
	config,
	results,
}: {
	config: { prompt: string };
	results: {
		wordCounts: Record<string, number>;
		totalSubmissions: number;
		uniqueWords: number;
	};
}) {
	const wordList = Object.entries(results.wordCounts)
		.map(([word, count]) => ({ word, count }))
		.sort((a, b) => b.count - a.count);

	const maxCount = wordList.length > 0 ? wordList[0].count : 1;

	const colors = [
		"text-violet-400",
		"text-blue-400",
		"text-emerald-400",
		"text-amber-400",
		"text-rose-400",
		"text-cyan-400",
		"text-pink-400",
		"text-lime-400",
	];

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-12">
			<div className="mb-4">
				<Cloud className="mx-auto h-12 w-12 text-violet-500" />
			</div>
			<h1 className="mb-12 max-w-4xl text-center font-bold text-3xl">
				{config.prompt}
			</h1>

			{wordList.length === 0 ? (
				<p className="text-2xl text-zinc-500">
					No words submitted yet. Waiting for responses...
				</p>
			) : (
				<div className="flex max-w-5xl flex-wrap items-center justify-center gap-4">
					{wordList.slice(0, 50).map(({ word, count }, index) => {
						const size = 16 + (count / maxCount) * 48;
						return (
							<span
								key={word}
								className={`transition-all duration-300 ${colors[index % colors.length]}`}
								style={{
									fontSize: `${size}px`,
									fontWeight: count === maxCount ? 700 : 500,
								}}
							>
								{word}
							</span>
						);
					})}
				</div>
			)}

			<div className="mt-12 flex gap-8">
				<div className="rounded-xl bg-zinc-800/50 px-8 py-4 text-center">
					<span className="font-bold text-3xl">{results.totalSubmissions}</span>
					<p className="text-zinc-400">submissions</p>
				</div>
				<div className="rounded-xl bg-zinc-800/50 px-8 py-4 text-center">
					<span className="font-bold text-3xl">{results.uniqueWords}</span>
					<p className="text-zinc-400">unique words</p>
				</div>
			</div>
		</div>
	);
}

function ReactionSpeedPresentMode({
	results,
}: {
	results: {
		leaderboard: {
			rank: number;
			participantId: string;
			participantName: string;
			bestTime: number;
		}[];
		totalParticipants: number;
	};
}) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-12">
			<div className="mb-4">
				<Zap className="mx-auto h-12 w-12 text-yellow-500" />
			</div>
			<h1 className="mb-12 font-bold text-4xl">Reaction Speed Leaderboard</h1>

			{results.leaderboard.length === 0 ? (
				<p className="text-2xl text-zinc-500">
					No scores yet. Waiting for participants...
				</p>
			) : (
				<div className="w-full max-w-2xl space-y-4">
					{results.leaderboard.slice(0, 10).map((entry) => (
						<div
							key={entry.participantId}
							className={`flex items-center gap-4 rounded-xl p-6 ${
								entry.rank === 1
									? "bg-yellow-500/10 ring-2 ring-yellow-500/30"
									: entry.rank === 2
										? "bg-zinc-400/10 ring-2 ring-zinc-400/30"
										: entry.rank === 3
											? "bg-amber-600/10 ring-2 ring-amber-600/30"
											: "bg-zinc-800/50"
							}`}
						>
							<div
								className={`flex h-14 w-14 items-center justify-center rounded-full font-bold text-2xl ${
									entry.rank === 1
										? "bg-yellow-500 text-black"
										: entry.rank === 2
											? "bg-zinc-400 text-black"
											: entry.rank === 3
												? "bg-amber-600 text-white"
												: "bg-zinc-700 text-zinc-300"
								}`}
							>
								{entry.rank}
							</div>
							<div className="flex-1">
								<p className="font-medium text-2xl">{entry.participantName}</p>
							</div>
							<span className="font-bold font-mono text-3xl text-emerald-400">
								{entry.bestTime}ms
							</span>
						</div>
					))}
				</div>
			)}

			<div className="mt-12 rounded-xl bg-zinc-800/50 px-8 py-4">
				<span className="font-bold text-3xl">{results.totalParticipants}</span>
				<span className="ml-2 text-xl text-zinc-400">participants</span>
			</div>
		</div>
	);
}

function AnonymousChatPresentMode({
	activityId,
}: {
	activityId: Id<"liveActivities">;
}) {
	const chatMessages = useQuery(api.chatMessages.getRecentByActivity, {
		activityId,
		limit: 50,
	});

	return (
		<div className="flex min-h-screen flex-col p-8">
			<div className="mb-6 flex items-center gap-3">
				<MessageSquare className="h-8 w-8 text-violet-500" />
				<h1 className="font-bold text-2xl">Live Chat</h1>
			</div>

			<div className="flex-1 space-y-4 overflow-y-auto">
				{!chatMessages || chatMessages.length === 0 ? (
					<p className="pt-20 text-center text-2xl text-zinc-500">
						No messages yet. Waiting for chat...
					</p>
				) : (
					chatMessages.map((msg) => (
						<div
							key={msg._id}
							className="rounded-xl bg-zinc-800/50 p-6 transition-all duration-300"
						>
							<div className="mb-2 flex items-center justify-between">
								<span className="font-semibold text-lg text-violet-400">
									{msg.anonymousName}
								</span>
								<span className="text-sm text-zinc-500">
									{new Date(msg.sentAt).toLocaleTimeString()}
								</span>
							</div>
							<p className="text-xl">{msg.message}</p>
						</div>
					))
				)}
			</div>
		</div>
	);
}
