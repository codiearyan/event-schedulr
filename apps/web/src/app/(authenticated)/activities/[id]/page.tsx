"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	ArrowLeft,
	BarChart3,
	ChevronRight,
	Cloud,
	ImageIcon,
	MessageSquare,
	Play,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { ActivityQuickActions } from "@/components/activity-dashboard/ActivityQuickActions";
import { ActivityStatsCards } from "@/components/activity-dashboard/ActivityStatsCards";
import { ChatFeed } from "@/components/activity-dashboard/ChatFeed";
import { LeaderboardPanel } from "@/components/activity-dashboard/LeaderboardPanel";
import { PollResultsChart } from "@/components/activity-dashboard/PollResultsChart";
import { WordCloudPreview } from "@/components/activity-dashboard/WordCloudPreview";
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

export default function ActivityDashboardPage() {
	const params = useParams();
	const activityId = params.id as Id<"liveActivities">;

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

	const advanceToNextLogo = useMutation(api.guessLogo.advanceToNextLogo);
	const startGuessLogoGame = useMutation(api.guessLogo.startGame);

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

	const isLive = activity.status === "live";
	const gameInProgress = isLive && currentLogo !== null;

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 py-10">
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
						<p className="text-muted-foreground text-sm">
							{getActivityLabel(activity.type as ActivityType)}
						</p>
					</div>
				</div>
			</div>

			<ActivityQuickActions
				activityId={activityId}
				status={activity.status}
				title={activity.title}
			/>

			<ActivityStatsCards
				activityId={activityId}
				activityType={activity.type}
			/>

			<Separator />

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
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2 text-lg">
										<ImageIcon className="h-5 w-5" />
										Guess the Logo
									</CardTitle>
									<CardDescription>
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
							<div className="text-muted-foreground text-sm">
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
										<p className="font-medium">
											Answer: {logoItems?.[currentLogo.index]?.companyName}
										</p>
										<p className="text-muted-foreground text-sm">
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
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Logo Preview</CardTitle>
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
											<span className="text-center text-muted-foreground text-xs">
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
