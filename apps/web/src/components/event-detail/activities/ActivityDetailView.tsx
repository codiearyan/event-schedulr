"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	ArrowLeft,
	BarChart3,
	ChevronRight,
	Cloud,
	ExternalLink,
	ImageIcon,
	MessageSquare,
	Play,
	Square,
	Zap,
} from "lucide-react";
import { toast } from "sonner";

import { ActivityStatsCards } from "@/components/activity-dashboard/ActivityStatsCards";
import { ChatFeed } from "@/components/activity-dashboard/ChatFeed";
import { LeaderboardPanel } from "@/components/activity-dashboard/LeaderboardPanel";
import { PollResultsChart } from "@/components/activity-dashboard/PollResultsChart";
import { WordCloudPreview } from "@/components/activity-dashboard/WordCloudPreview";
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

interface ActivityDetailViewProps {
	activityId: Id<"liveActivities">;
	onBack: () => void;
}

const activityIcons: Record<ActivityType, React.ElementType> = {
	poll: BarChart3,
	word_cloud: Cloud,
	reaction_speed: Zap,
	anonymous_chat: MessageSquare,
	guess_logo: ImageIcon,
};

const activityLabels: Record<ActivityType, string> = {
	poll: "Poll",
	word_cloud: "Word Cloud",
	reaction_speed: "Reaction Speed",
	anonymous_chat: "Anonymous Chat",
	guess_logo: "Guess the Logo",
};

const statusConfig: Record<
	string,
	{ label: string; className: string; showPulse?: boolean }
> = {
	draft: {
		label: "Draft",
		className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
	},
	scheduled: {
		label: "Scheduled",
		className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
	},
	live: {
		label: "Live",
		className: "bg-green-500/20 text-green-400 border-green-500/30",
		showPulse: true,
	},
	ended: {
		label: "Ended",
		className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
	},
};

export function ActivityDetailView({
	activityId,
	onBack,
}: ActivityDetailViewProps) {
	const activity = useQuery(api.liveActivities.getById, { id: activityId });
	const results = useQuery(api.liveActivities.getAggregatedResults, {
		activityId,
	});
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

	if (!activity) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
			</div>
		);
	}

	const Icon = activityIcons[activity.type as ActivityType] || BarChart3;
	const status = statusConfig[activity.status];
	const isLive = activity.status === "live";
	const gameInProgress = isLive && currentLogo !== null;

	const handleStart = async () => {
		try {
			await startActivity({ id: activityId });
			toast.success("Activity started!");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to start activity",
			);
		}
	};

	const handleEnd = async () => {
		try {
			await endActivity({ id: activityId });
			toast.success("Activity ended!");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to end activity",
			);
		}
	};

	const handlePresent = () => {
		window.open(`/activities/${activityId}/present`, "_blank");
	};

	return (
		<div className="space-y-6">
			<button
				onClick={onBack}
				className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
			>
				<ArrowLeft size={16} />
				Back to Activities
			</button>

			<div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
							<Icon size={28} className="text-white/70" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-white/50 text-xs uppercase tracking-wide">
									{activityLabels[activity.type as ActivityType]}
								</span>
								<Badge
									variant="outline"
									className={`${status.className} border`}
								>
									{status.showPulse && (
										<span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
									)}
									{status.label}
								</Badge>
							</div>
							<h2 className="mt-1 font-semibold text-white text-xl">
								{activity.title}
							</h2>
						</div>
					</div>

					<div className="flex gap-2">
						{activity.status !== "ended" && activity.status !== "live" && (
							<Button
								size="sm"
								variant="outline"
								className="border-white/10 bg-white/5"
								onClick={handleStart}
							>
								<Play size={14} className="mr-1" />
								Start
							</Button>
						)}
						{activity.status === "live" && (
							<Button
								size="sm"
								variant="outline"
								className="border-white/10 bg-white/5"
								onClick={handleEnd}
							>
								<Square size={14} className="mr-1" />
								End
							</Button>
						)}
						{(activity.status === "live" || activity.status === "ended") && (
							<Button
								size="sm"
								className="bg-white text-black hover:bg-white/90"
								onClick={handlePresent}
							>
								<ExternalLink size={14} className="mr-1" />
								Present
							</Button>
						)}
					</div>
				</div>
			</div>

			<ActivityStatsCards
				activityId={activityId}
				activityType={activity.type}
			/>

			<Separator className="bg-white/10" />

			{activity.type === "poll" && results?.type === "poll" && (
				<PollResultsChart
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
				<WordCloudPreview
					config={activity.config as { prompt: string }}
					results={results}
				/>
			)}

			{activity.type === "reaction_speed" &&
				results?.type === "reaction_speed" && (
					<LeaderboardPanel
						title="Reaction Speed Leaderboard"
						entries={results.leaderboard}
						totalParticipants={results.totalParticipants}
					/>
				)}

			{activity.type === "anonymous_chat" && (
				<ChatFeed activityId={activityId} />
			)}

			{activity.type === "guess_logo" && results?.type === "guess_logo" && (
				<div className="space-y-6">
					<Card className="border-white/10 bg-white/[0.03]">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2 text-lg text-white">
										<ImageIcon className="h-5 w-5" />
										Guess the Logo
									</CardTitle>
									<CardDescription className="text-white/50">
										{(activity.config as { category: string }).category} ·{" "}
										{results.totalLogos} logos
									</CardDescription>
								</div>
								{activity.status === "draft" &&
									logoItems &&
									logoItems.length > 0 && (
										<Button
											onClick={async () => {
												try {
													await startGuessLogoGame({ activityId });
													toast.success("Game started!");
												} catch (error) {
													toast.error("Failed to start game");
												}
											}}
											className="bg-white text-black hover:bg-white/90"
										>
											<Play className="mr-2 h-4 w-4" />
											Start Game
										</Button>
									)}
								{gameInProgress && (
									<Button
										variant="secondary"
										onClick={async () => {
											try {
												const result = await advanceToNextLogo({ activityId });
												if (result.ended) {
													toast.success("Game ended!");
												}
											} catch (error) {
												toast.error("Failed to advance to next logo");
											}
										}}
									>
										<ChevronRight className="mr-2 h-4 w-4" />
										Next Logo
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-white/50">
								Logo {results.currentLogoIndex + 1} of {results.totalLogos}
							</div>
							{currentLogo && (
								<div className="mt-4 flex items-center gap-4">
									<div className="rounded-lg bg-white p-3">
										<img
											src={currentLogo.logoUrl}
											alt="Current logo"
											className="h-16 w-16 object-contain"
											onError={(e) => {
												(e.target as HTMLImageElement).src =
													"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
											}}
										/>
									</div>
									<div>
										<p className="font-medium text-white">
											Answer: {logoItems?.[currentLogo.index]?.companyName}
										</p>
										<p className="text-sm text-white/50">
											Time per logo:{" "}
											{(activity.config as { timePerLogo: number }).timePerLogo}
											s
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					<LeaderboardPanel
						title="Game Leaderboard"
						entries={results.leaderboard}
						totalParticipants={results.totalParticipants}
					/>

					{logoItems && logoItems.length > 0 && (
						<Card className="border-white/10 bg-white/[0.03]">
							<CardHeader>
								<CardTitle className="text-lg text-white">
									Logo Preview
								</CardTitle>
								<CardDescription className="text-white/50">
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
													: "border-white/10"
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
											<span className="text-center text-white/50 text-xs">
												{item.index + 1}. {item.companyName}
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			)}
		</div>
	);
}
