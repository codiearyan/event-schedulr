"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	ArrowLeft,
	BarChart3,
	Cloud,
	MessageSquare,
	Plus,
	Trash2,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ActivityType = "poll" | "word_cloud" | "reaction_speed" | "anonymous_chat";

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
	}
};

export default function EditActivityPage() {
	const params = useParams();
	const router = useRouter();
	const activityId = params.id as Id<"liveActivities">;

	const activity = useQuery(api.liveActivities.getById, { id: activityId });
	const updateActivity = useMutation(api.liveActivities.update);

	const [title, setTitle] = useState("");
	const [scheduledTime, setScheduledTime] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [pollQuestion, setPollQuestion] = useState("");
	const [pollOptions, setPollOptions] = useState(["", ""]);
	const [allowMultiple, setAllowMultiple] = useState(false);
	const [showResults, setShowResults] = useState(true);

	const [wordCloudPrompt, setWordCloudPrompt] = useState("");
	const [maxSubmissions, setMaxSubmissions] = useState(3);
	const [maxWordLength, setMaxWordLength] = useState(20);

	const [roundCount, setRoundCount] = useState(3);
	const [minDelay, setMinDelay] = useState(1000);
	const [maxDelay, setMaxDelay] = useState(5000);

	const [maxMessageLength, setMaxMessageLength] = useState(200);
	const [slowModeSeconds, setSlowModeSeconds] = useState(0);

	useEffect(() => {
		if (activity) {
			setTitle(activity.title);
			if (activity.scheduledStartTime) {
				const date = new Date(activity.scheduledStartTime);
				setScheduledTime(date.toISOString().slice(0, 16));
			}

			const config = activity.config as Record<string, unknown>;
			if (activity.type === "poll") {
				setPollQuestion((config.question as string) || "");
				const options =
					(config.options as { id: string; text: string }[]) || [];
				setPollOptions(
					options.length > 0 ? options.map((o) => o.text) : ["", ""],
				);
				setAllowMultiple((config.allowMultiple as boolean) || false);
				setShowResults((config.showResultsToParticipants as boolean) ?? true);
			} else if (activity.type === "word_cloud") {
				setWordCloudPrompt((config.prompt as string) || "");
				setMaxSubmissions((config.maxSubmissionsPerUser as number) || 3);
				setMaxWordLength((config.maxWordLength as number) || 20);
			} else if (activity.type === "reaction_speed") {
				setRoundCount((config.roundCount as number) || 3);
				setMinDelay((config.minDelay as number) || 1000);
				setMaxDelay((config.maxDelay as number) || 5000);
			} else if (activity.type === "anonymous_chat") {
				setMaxMessageLength((config.maxMessageLength as number) || 200);
				setSlowModeSeconds((config.slowModeSeconds as number) || 0);
			}
		}
	}, [activity]);

	const addPollOption = () => {
		if (pollOptions.length < 10) {
			setPollOptions([...pollOptions, ""]);
		}
	};

	const removePollOption = (index: number) => {
		if (pollOptions.length > 2) {
			setPollOptions(pollOptions.filter((_, i) => i !== index));
		}
	};

	const updatePollOption = (index: number, value: string) => {
		const newOptions = [...pollOptions];
		newOptions[index] = value;
		setPollOptions(newOptions);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!activity || !title.trim()) return;

		setIsSubmitting(true);
		try {
			let config;
			switch (activity.type) {
				case "poll": {
					if (!pollQuestion.trim()) {
						toast.error("Please enter a poll question");
						setIsSubmitting(false);
						return;
					}
					const validOptions = pollOptions.filter((o) => o.trim());
					if (validOptions.length < 2) {
						toast.error("Please add at least 2 options");
						setIsSubmitting(false);
						return;
					}
					config = {
						type: "poll" as const,
						question: pollQuestion.trim(),
						options: validOptions.map((text, i) => ({
							id: `opt_${i}`,
							text: text.trim(),
						})),
						allowMultiple,
						showResultsToParticipants: showResults,
					};
					break;
				}
				case "word_cloud":
					if (!wordCloudPrompt.trim()) {
						toast.error("Please enter a prompt");
						setIsSubmitting(false);
						return;
					}
					config = {
						type: "word_cloud" as const,
						prompt: wordCloudPrompt.trim(),
						maxSubmissionsPerUser: maxSubmissions,
						maxWordLength,
					};
					break;
				case "reaction_speed":
					config = {
						type: "reaction_speed" as const,
						roundCount,
						minDelay,
						maxDelay,
					};
					break;
				case "anonymous_chat":
					config = {
						type: "anonymous_chat" as const,
						maxMessageLength,
						slowModeSeconds,
					};
					break;
			}

			await updateActivity({
				id: activityId,
				title: title.trim(),
				scheduledStartTime: scheduledTime
					? new Date(scheduledTime).getTime()
					: undefined,
				config,
			});

			toast.success("Activity updated!");
			router.push(`/activities/${activityId}`);
		} catch (error) {
			console.error(error);
			toast.error("Failed to update activity");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!activity) {
		return (
			<div className="mx-auto w-full max-w-2xl py-10">
				<Card>
					<CardContent className="py-10 text-center">
						<p className="text-muted-foreground">Loading activity...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (activity.status === "live" || activity.status === "ended") {
		return (
			<div className="mx-auto w-full max-w-2xl py-10">
				<Card>
					<CardContent className="py-10 text-center">
						<p className="text-muted-foreground">
							Cannot edit a {activity.status} activity
						</p>
						<Link href={`/activities/${activityId}`}>
							<Button className="mt-4">Back to Dashboard</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 py-10">
			<div className="flex items-center gap-4">
				<Link href={`/activities/${activityId}`}>
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="font-semibold text-2xl">Edit Activity</h1>
					<p className="text-muted-foreground text-sm">
						{getActivityLabel(activity.type as ActivityType)}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							{getActivityIcon(activity.type as ActivityType)}
							Basic Info
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Activity Title</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Enter a title for this activity"
								required
							/>
						</div>

						{activity.status === "scheduled" && (
							<div className="space-y-2">
								<Label htmlFor="scheduledTime">Scheduled Start Time</Label>
								<Input
									id="scheduledTime"
									type="datetime-local"
									value={scheduledTime}
									onChange={(e) => setScheduledTime(e.target.value)}
								/>
							</div>
						)}
					</CardContent>
				</Card>

				{activity.type === "poll" && (
					<Card>
						<CardHeader>
							<CardTitle>Poll Configuration</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="question">Question</Label>
								<Textarea
									id="question"
									value={pollQuestion}
									onChange={(e) => setPollQuestion(e.target.value)}
									placeholder="What would you like to ask?"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label>Options</Label>
								<div className="space-y-2">
									{pollOptions.map((option, index) => (
										<div key={index} className="flex gap-2">
											<Input
												value={option}
												onChange={(e) =>
													updatePollOption(index, e.target.value)
												}
												placeholder={`Option ${index + 1}`}
											/>
											{pollOptions.length > 2 && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removePollOption(index)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									))}
								</div>
								{pollOptions.length < 10 && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addPollOption}
									>
										<Plus className="mr-1 h-4 w-4" />
										Add Option
									</Button>
								)}
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="allowMultiple"
									checked={allowMultiple}
									onCheckedChange={(checked) =>
										setAllowMultiple(checked === true)
									}
								/>
								<Label htmlFor="allowMultiple" className="font-normal">
									Allow multiple answers
								</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="showResults"
									checked={showResults}
									onCheckedChange={(checked) =>
										setShowResults(checked === true)
									}
								/>
								<Label htmlFor="showResults" className="font-normal">
									Show results to participants after voting
								</Label>
							</div>
						</CardContent>
					</Card>
				)}

				{activity.type === "word_cloud" && (
					<Card>
						<CardHeader>
							<CardTitle>Word Cloud Configuration</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="prompt">Prompt</Label>
								<Textarea
									id="prompt"
									value={wordCloudPrompt}
									onChange={(e) => setWordCloudPrompt(e.target.value)}
									placeholder="What word comes to mind when you think of...?"
									required
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="maxSubmissions">
										Max Submissions Per User
									</Label>
									<Input
										id="maxSubmissions"
										type="number"
										min={1}
										max={10}
										value={maxSubmissions}
										onChange={(e) => setMaxSubmissions(Number(e.target.value))}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="maxWordLength">Max Word Length</Label>
									<Input
										id="maxWordLength"
										type="number"
										min={5}
										max={50}
										value={maxWordLength}
										onChange={(e) => setMaxWordLength(Number(e.target.value))}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{activity.type === "reaction_speed" && (
					<Card>
						<CardHeader>
							<CardTitle>Reaction Speed Configuration</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="roundCount">Number of Rounds</Label>
								<Input
									id="roundCount"
									type="number"
									min={1}
									max={10}
									value={roundCount}
									onChange={(e) => setRoundCount(Number(e.target.value))}
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="minDelay">Min Delay (ms)</Label>
									<Input
										id="minDelay"
										type="number"
										min={500}
										max={10000}
										value={minDelay}
										onChange={(e) => setMinDelay(Number(e.target.value))}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="maxDelay">Max Delay (ms)</Label>
									<Input
										id="maxDelay"
										type="number"
										min={500}
										max={10000}
										value={maxDelay}
										onChange={(e) => setMaxDelay(Number(e.target.value))}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{activity.type === "anonymous_chat" && (
					<Card>
						<CardHeader>
							<CardTitle>Chat Configuration</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="maxMessageLength">Max Message Length</Label>
								<Input
									id="maxMessageLength"
									type="number"
									min={50}
									max={500}
									value={maxMessageLength}
									onChange={(e) => setMaxMessageLength(Number(e.target.value))}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="slowMode">Slow Mode (seconds)</Label>
								<Input
									id="slowMode"
									type="number"
									min={0}
									max={60}
									value={slowModeSeconds}
									onChange={(e) => setSlowModeSeconds(Number(e.target.value))}
								/>
								<p className="text-muted-foreground text-xs">
									Set to 0 to disable slow mode
								</p>
							</div>
						</CardContent>
					</Card>
				)}

				<div className="flex justify-end gap-3">
					<Link href={`/activities/${activityId}`}>
						<Button type="button" variant="outline">
							Cancel
						</Button>
					</Link>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</form>
		</div>
	);
}
