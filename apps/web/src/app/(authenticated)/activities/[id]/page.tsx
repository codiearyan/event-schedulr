"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	ArrowLeft,
	BarChart3,
	ChevronRight,
	Clock,
	Cloud,
	ImageIcon,
	MessageSquare,
	Pause,
	Play,
	Presentation,
	Radio,
	Trophy,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";

type ActivityType =
	| "poll"
	| "word_cloud"
	| "reaction_speed"
	| "anonymous_chat"
	| "guess_logo";
type ActivityStatus = "draft" | "scheduled" | "live" | "ended";

const getActivityIcon = (type: ActivityType) => {
	switch (type) {
		case "poll":
			return <BarChart3 className="h-5 w-5" />;
		case "word_cloud":
			return <Cloud className="h-5 w-5" />;
		case "reaction_speed":
			return <Zap className="h-5 w-5" />;
		case "anonymous_chat":
			return <MessageSquare className="h-5 w-5" />;
		case "guess_logo":
			return <ImageIcon className="h-5 w-5" />;
	}
};

const getActivityLabel = (type: ActivityType) => {
	switch (type) {
		case "poll":
			return "Poll";
		case "word_cloud":
			return "Word Cloud";
		case "reaction_speed":
			return "Reaction Speed";
		case "anonymous_chat":
			return "Anonymous Chat";
		case "guess_logo":
			return "Guess the Logo";
	}
};

const getStatusBadgeVariant = (status: ActivityStatus) => {
	switch (status) {
		case "live":
			return "default" as const;
		case "scheduled":
			return "secondary" as const;
		case "draft":
			return "outline" as const;
		case "ended":
			return "outline" as const;
	}
};

export default function ActivityDashboardPage() {
	const params = useParams();
	const activityId = params.id as Id<"liveActivities">;

	const activity = useQuery(api.liveActivities.getById, { id: activityId });
	const results = useQuery(api.liveActivities.getAggregatedResults, {
		activityId,
	});
	const chatMessages = useQuery(
		api.chatMessages.getRecentByActivity,
		activity?.type === "anonymous_chat" ? { activityId, limit: 50 } : "skip",
	);
	const logoItems = useQuery(
		api.guessLogo.getLogoItems,
		activity?.type === "guess_logo" ? { activityId } : "skip",
	);
	const currentLogo = useQuery(
		api.guessLogo.getCurrentLogo,
		activity?.type === "guess_logo" ? { activityId } : "skip",
	);

	const startActivity = useMutation(api.liveActivities.start);
	const endActivity = useMutation(api.liveActivities.end);
	const advanceToNextLogo = useMutation(api.guessLogo.advanceToNextLogo);
	const startGuessLogoGame = useMutation(api.guessLogo.startGame);

	const handleStart = async () => {
		try {
			await startActivity({ id: activityId });
			toast.success("Activity started!");
		} catch (error) {
			toast.error("Failed to start activity");
		}
	};

	const handleEnd = async () => {
		if (!confirm("Are you sure you want to end this activity?")) return;
		try {
			await endActivity({ id: activityId });
			toast.success("Activity ended");
		} catch (error) {
			toast.error("Failed to end activity");
		}
	};

	if (!activity) {
		return (
			<div className="mx-auto w-full max-w-4xl py-10">
				<Card>
					<CardContent className="py-10 text-center">
						<p className="text-muted-foreground">Loading activity...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 py-10">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link href="/activities">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
							{getActivityIcon(activity.type as ActivityType)}
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h1 className="font-semibold text-xl">{activity.title}</h1>
								<Badge
									variant={getStatusBadgeVariant(
										activity.status as ActivityStatus,
									)}
								>
									{activity.status === "live" && (
										<Radio className="mr-1 h-3 w-3" />
									)}
									{activity.status}
								</Badge>
							</div>
							<p className="text-muted-foreground text-sm">
								{getActivityLabel(activity.type as ActivityType)}
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() =>
							window.open(`/activities/${activityId}/present`, "_blank")
						}
					>
						<Presentation className="mr-2 h-4 w-4" />
						Present
					</Button>
					{(activity.status === "draft" || activity.status === "scheduled") && (
						<Button onClick={handleStart}>
							<Play className="mr-2 h-4 w-4" />
							Start Activity
						</Button>
					)}
					{activity.status === "live" && (
						<Button variant="destructive" onClick={handleEnd}>
							<Pause className="mr-2 h-4 w-4" />
							End Activity
						</Button>
					)}
				</div>
			</div>

			{activity.type === "poll" && results?.type === "poll" && (
				<PollResults activity={activity} results={results} />
			)}

			{activity.type === "word_cloud" && results?.type === "word_cloud" && (
				<WordCloudResults activity={activity} results={results} />
			)}

			{activity.type === "reaction_speed" &&
				results?.type === "reaction_speed" && (
					<ReactionSpeedResults activity={activity} results={results} />
				)}

			{activity.type === "anonymous_chat" && (
				<ChatResults
					activity={activity}
					messages={chatMessages || []}
					participantCount={
						results?.type === "anonymous_chat" ? results.participantCount : 0
					}
				/>
			)}

			{activity.type === "guess_logo" && results?.type === "guess_logo" && (
				<GuessLogoResults
					activity={activity}
					results={results}
					logoItems={logoItems || []}
					currentLogo={currentLogo}
					onNextLogo={async () => {
						try {
							const result = await advanceToNextLogo({ activityId });
							if (result.ended) {
								toast.success("Game ended!");
							}
						} catch (error) {
							toast.error("Failed to advance to next logo");
						}
					}}
					onStartGame={async () => {
						try {
							await startGuessLogoGame({ activityId });
							toast.success("Game started!");
						} catch (error) {
							toast.error("Failed to start game");
						}
					}}
				/>
			)}
		</div>
	);
}

function PollResults({
	activity,
	results,
}: {
	activity: { config: unknown };
	results: { voteCounts: Record<string, number>; totalVoters: number };
}) {
	const config = activity.config as {
		question: string;
		options: { id: string; text: string }[];
	};

	const totalVotes = Object.values(results.voteCounts).reduce(
		(sum, count) => sum + count,
		0,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Poll Results</CardTitle>
				<CardDescription>{config.question}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-4 text-muted-foreground text-sm">
					<div className="flex items-center gap-1">
						<Users className="h-4 w-4" />
						<span>{results.totalVoters} voters</span>
					</div>
					<div>{totalVotes} total votes</div>
				</div>

				<Separator />

				<div className="space-y-3">
					{config.options.map((option) => {
						const count = results.voteCounts[option.id] || 0;
						const percentage =
							totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

						return (
							<div key={option.id} className="space-y-1">
								<div className="flex items-center justify-between text-sm">
									<span>{option.text}</span>
									<span className="font-medium">
										{percentage}% ({count})
									</span>
								</div>
								<div className="h-3 overflow-hidden rounded-full bg-muted">
									<div
										className="h-full rounded-full bg-primary transition-all"
										style={{ width: `${percentage}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

function WordCloudResults({
	activity,
	results,
}: {
	activity: { config: unknown };
	results: {
		wordCounts: Record<string, number>;
		totalSubmissions: number;
		uniqueWords: number;
	};
}) {
	const config = activity.config as { prompt: string };

	const wordList = Object.entries(results.wordCounts)
		.map(([word, count]) => ({ word, count }))
		.sort((a, b) => b.count - a.count);

	const maxCount = wordList.length > 0 ? wordList[0].count : 1;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Word Cloud Results</CardTitle>
				<CardDescription>{config.prompt}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-4 text-muted-foreground text-sm">
					<div>{results.totalSubmissions} submissions</div>
					<div>{results.uniqueWords} unique words</div>
				</div>

				<Separator />

				{wordList.length === 0 ? (
					<p className="py-6 text-center text-muted-foreground">
						No words submitted yet
					</p>
				) : (
					<div className="flex flex-wrap justify-center gap-3 py-4">
						{wordList.map(({ word, count }) => {
							const size = 14 + (count / maxCount) * 24;
							return (
								<span
									key={word}
									className="text-primary"
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

				<Separator />

				<div className="space-y-2">
					<h4 className="font-medium text-sm">Word Frequency</h4>
					<div className="max-h-60 overflow-y-auto rounded-lg border">
						<table className="w-full text-sm">
							<thead className="bg-muted/50">
								<tr>
									<th className="p-2 text-left font-medium">Word</th>
									<th className="p-2 text-right font-medium">Count</th>
								</tr>
							</thead>
							<tbody>
								{wordList.map(({ word, count }) => (
									<tr key={word} className="border-t">
										<td className="p-2">{word}</td>
										<td className="p-2 text-right">{count}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function ReactionSpeedResults({
	activity,
	results,
}: {
	activity: { config: unknown };
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
	const config = activity.config as { roundCount: number };

	return (
		<Card>
			<CardHeader>
				<CardTitle>Reaction Speed Leaderboard</CardTitle>
				<CardDescription>
					{config.roundCount} rounds · Best time wins
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-1 text-muted-foreground text-sm">
					<Users className="h-4 w-4" />
					<span>{results.totalParticipants} participants</span>
				</div>

				<Separator />

				{results.leaderboard.length === 0 ? (
					<p className="py-6 text-center text-muted-foreground">
						No scores yet
					</p>
				) : (
					<div className="space-y-2">
						{results.leaderboard.map((entry) => (
							<div
								key={entry.participantId}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div className="flex items-center gap-3">
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
											entry.rank === 1
												? "bg-yellow-500 text-white"
												: entry.rank === 2
													? "bg-gray-400 text-white"
													: entry.rank === 3
														? "bg-amber-600 text-white"
														: "bg-muted"
										}`}
									>
										{entry.rank}
									</div>
									<span className="font-medium">{entry.participantName}</span>
								</div>
								<span className="font-mono font-semibold">
									{entry.bestTime}ms
								</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function ChatResults({
	activity,
	messages,
	participantCount,
}: {
	activity: { config: unknown };
	messages: {
		_id: string;
		anonymousName: string;
		message: string;
		sentAt: number;
	}[];
	participantCount: number;
}) {
	const config = activity.config as { slowModeSeconds: number };

	return (
		<Card>
			<CardHeader>
				<CardTitle>Chat Feed</CardTitle>
				<CardDescription>
					Anonymous chat
					{config.slowModeSeconds > 0 &&
						` · Slow mode: ${config.slowModeSeconds}s`}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-4 text-muted-foreground text-sm">
					<div className="flex items-center gap-1">
						<Users className="h-4 w-4" />
						<span>{participantCount} participants</span>
					</div>
					<div>{messages.length} messages</div>
				</div>

				<Separator />

				{messages.length === 0 ? (
					<p className="py-6 text-center text-muted-foreground">
						No messages yet
					</p>
				) : (
					<div className="max-h-96 space-y-3 overflow-y-auto">
						{messages.map((msg) => (
							<div key={msg._id} className="rounded-lg border bg-card p-3">
								<div className="flex items-center justify-between text-sm">
									<span className="font-medium text-primary">
										{msg.anonymousName}
									</span>
									<span className="text-muted-foreground text-xs">
										{new Date(msg.sentAt).toLocaleTimeString()}
									</span>
								</div>
								<p className="mt-1 text-sm">{msg.message}</p>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function GuessLogoResults({
	activity,
	results,
	logoItems,
	currentLogo,
	onNextLogo,
	onStartGame,
}: {
	activity: { config: unknown; status: string };
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
	logoItems: {
		index: number;
		companyName: string;
		logoUrl: string;
	}[];
	currentLogo:
		| {
				index: number;
				logoUrl: string;
				hints: string[];
				totalLogos: number;
				timePerLogo: number;
				logoStartedAt?: number;
				serverTime?: number;
				timeRemaining?: number;
		  }
		| null
		| undefined;
	onNextLogo: () => void;
	onStartGame: () => void;
}) {
	const config = activity.config as {
		category: string;
		logoCount: number;
		timePerLogo: number;
		difficulty: string;
		showHints: boolean;
		logoStartedAt?: number;
	};

	const isLive = activity.status === "live";
	const gameInProgress = isLive && currentLogo !== null;

	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
	const lastSyncRef = useRef<{ serverTime: number; localTime: number } | null>(
		null,
	);

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
		if (timeRemaining === null) return "bg-muted";
		if (timeRemaining <= 10) return "bg-red-500";
		if (timeRemaining <= 20) return "bg-yellow-500";
		return "bg-primary";
	};

	const getTimerTextColor = () => {
		if (timeRemaining === null) return "text-muted-foreground";
		if (timeRemaining <= 10) return "text-red-500";
		if (timeRemaining <= 20) return "text-yellow-500";
		return "text-primary";
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<ImageIcon className="h-5 w-5" />
								Guess the Logo
							</CardTitle>
							<CardDescription>
								Category: {config.category} · {config.logoCount} logos ·{" "}
								{config.difficulty} difficulty
							</CardDescription>
						</div>
						{activity.status === "draft" && logoItems.length > 0 && (
							<Button onClick={onStartGame}>
								<Play className="mr-2 h-4 w-4" />
								Start Game
							</Button>
						)}
						{gameInProgress && (
							<Button onClick={onNextLogo} variant="secondary">
								<ChevronRight className="mr-2 h-4 w-4" />
								Next Logo
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4 text-muted-foreground text-sm">
						<div className="flex items-center gap-1">
							<Users className="h-4 w-4" />
							<span>{results.totalParticipants} participants</span>
						</div>
						<div>
							Logo {results.currentLogoIndex + 1} of {results.totalLogos}
						</div>
						<div>{config.timePerLogo}s per logo</div>
					</div>

					{gameInProgress && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-sm">
									<Clock className="h-4 w-4" />
									<span>Time Remaining</span>
								</div>
								<span className={`font-bold text-lg ${getTimerTextColor()}`}>
									{timeRemaining !== null ? `${timeRemaining}s` : "..."}
								</span>
							</div>
							<div className="h-3 w-full overflow-hidden rounded-full bg-muted">
								<div
									className={`h-full rounded-full transition-all duration-100 ${getTimerColor()}`}
									style={{ width: `${timerProgress * 100}%` }}
								/>
							</div>
						</div>
					)}

					{currentLogo && (
						<>
							<Separator />
							<div className="flex flex-col items-center gap-4">
								<p className="font-medium text-sm">Current Logo:</p>
								<div className="rounded-lg border bg-white p-4">
									<img
										src={currentLogo.logoUrl}
										alt="Logo to guess"
										className="h-24 w-24 object-contain"
										onError={(e) => {
											(e.target as HTMLImageElement).src =
												"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
										}}
									/>
								</div>
								{currentLogo.hints.length > 0 && (
									<div className="text-center text-muted-foreground text-sm">
										<p className="font-medium">Hints:</p>
										<ul className="mt-1">
											{currentLogo.hints.map((hint, i) => (
												<li key={i}>
													{i + 1}. {hint}
												</li>
											))}
										</ul>
									</div>
								)}
								<p className="text-muted-foreground text-xs">
									(Answer:{" "}
									{logoItems[currentLogo.index]?.companyName || "Unknown"})
								</p>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Trophy className="h-5 w-5" />
						{!isLive ? "Players Ready" : "Leaderboard"}
					</CardTitle>
					{!isLive && results.leaderboard.length > 0 && (
						<CardDescription>
							{results.leaderboard.length} player
							{results.leaderboard.length !== 1 ? "s" : ""} waiting to start
						</CardDescription>
					)}
				</CardHeader>
				<CardContent>
					{results.leaderboard.length === 0 ? (
						<p className="py-6 text-center text-muted-foreground">
							{!isLive
								? "Waiting for players to join..."
								: "No scores yet"}
						</p>
					) : (
						<div className="space-y-2">
							{results.leaderboard.map((entry) => (
								<div
									key={entry.participantId}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<div
											className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
												isLive && entry.rank === 1
													? "bg-yellow-500 text-white"
													: isLive && entry.rank === 2
														? "bg-gray-400 text-white"
														: isLive && entry.rank === 3
															? "bg-amber-600 text-white"
															: "bg-muted"
											}`}
										>
											{isLive ? entry.rank : entry.participantName.charAt(0).toUpperCase()}
										</div>
										<div>
											<span className="font-medium">
												{entry.participantName}
											</span>
											{isLive ? (
												<p className="text-muted-foreground text-xs">
													{entry.correctCount} correct
												</p>
											) : (
												<p className="text-muted-foreground text-xs">
													Ready
												</p>
											)}
										</div>
									</div>
									<span className="font-mono font-semibold text-lg">
										{isLive ? `${entry.score} pts` : "0 pts"}
									</span>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{logoItems.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Logo Preview</CardTitle>
						<CardDescription>
							All generated logos for this activity
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-5 gap-4">
							{logoItems.map((item) => (
								<div
									key={item.index}
									className={`flex flex-col items-center gap-2 rounded-lg border p-3 ${
										item.index === results.currentLogoIndex
											? "border-primary bg-primary/5"
											: ""
									}`}
								>
									<div className="rounded bg-white p-2">
										<img
											src={item.logoUrl}
											alt={`Logo ${item.index + 1}`}
											className="h-12 w-12 object-contain"
											onError={(e) => {
												(e.target as HTMLImageElement).src =
													"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
											}}
										/>
									</div>
									<span className="text-center text-xs">
										{item.index + 1}. {item.companyName}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
