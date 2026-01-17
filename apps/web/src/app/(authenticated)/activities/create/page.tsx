"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import {
	ArrowLeft,
	BarChart3,
	Cloud,
	ImageIcon,
	Loader2,
	MessageSquare,
	Plus,
	Trash2,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ActivityType =
	| "poll"
	| "word_cloud"
	| "reaction_speed"
	| "anonymous_chat"
	| "guess_logo";

const activityTypes: {
	type: ActivityType;
	label: string;
	description: string;
	icon: React.ReactNode;
}[] = [
	{
		type: "poll",
		label: "Poll",
		description: "Ask a question with multiple choice options",
		icon: <BarChart3 className="h-6 w-6" />,
	},
	{
		type: "word_cloud",
		label: "Word Cloud",
		description: "Collect words from participants and display as a cloud",
		icon: <Cloud className="h-6 w-6" />,
	},
	{
		type: "reaction_speed",
		label: "Reaction Speed",
		description: "Test reaction times with a tap game",
		icon: <Zap className="h-6 w-6" />,
	},
	{
		type: "anonymous_chat",
		label: "Anonymous Chat",
		description: "Let participants chat anonymously",
		icon: <MessageSquare className="h-6 w-6" />,
	},
	{
		type: "guess_logo",
		label: "Guess the Logo",
		description: "Participants guess company logos for points",
		icon: <ImageIcon className="h-6 w-6" />,
	},
];

export default function CreateActivityPage() {
	const router = useRouter();
	const event = useQuery(api.events.getCurrentEvent);
	const createActivity = useMutation(api.liveActivities.create);

	const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
	const [title, setTitle] = useState("");
	const [startInstantly, setStartInstantly] = useState(true);
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

	const [logoCategory, setLogoCategory] = useState("");
	const [logoCount, setLogoCount] = useState(10);
	const [timePerLogo, setTimePerLogo] = useState(45);
	const [logoDifficulty, setLogoDifficulty] = useState<
		"easy" | "medium" | "hard"
	>("medium");
	const [showHints, setShowHints] = useState(true);
	const [isGeneratingLogos, setIsGeneratingLogos] = useState(false);
	const [logosGenerated, setLogosGenerated] = useState(false);
	const [createdGuessLogoActivityId, setCreatedGuessLogoActivityId] = useState<
		string | null
	>(null);

	const generateLogos = useAction(api.guessLogo.generateLogos);
	const updateActivity = useMutation(api.liveActivities.update);
	const startActivity = useMutation(api.liveActivities.start);

	const generatedLogoItems = useQuery(
		api.guessLogo.getLogoItems,
		createdGuessLogoActivityId
			? { activityId: createdGuessLogoActivityId as Id<"liveActivities"> }
			: "skip",
	);

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
		if (!event || !selectedType || !title.trim()) return;

		setIsSubmitting(true);
		try {
			let config;
			switch (selectedType) {
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
				case "guess_logo":
					if (!logoCategory.trim()) {
						toast.error("Please enter a category");
						setIsSubmitting(false);
						return;
					}
					if (!logosGenerated || !createdGuessLogoActivityId) {
						toast.error("Please generate logos first");
						setIsSubmitting(false);
						return;
					}
					config = {
						type: "guess_logo" as const,
						category: logoCategory.trim(),
						logoCount,
						timePerLogo,
						difficulty: logoDifficulty,
						showHints,
					};
					break;
			}

			const status = startInstantly
				? "live"
				: scheduledTime
					? "scheduled"
					: "draft";

			if (selectedType === "guess_logo" && createdGuessLogoActivityId) {
				await updateActivity({
					id: createdGuessLogoActivityId as any,
					title: title.trim(),
					status: status as "draft" | "scheduled" | "live",
					scheduledStartTime: scheduledTime
						? new Date(scheduledTime).getTime()
						: undefined,
					config,
				});
				if (status === "live") {
					await startActivity({ id: createdGuessLogoActivityId as any });
				}
			} else {
				await createActivity({
					eventId: event._id,
					type: selectedType,
					title: title.trim(),
					status,
					scheduledStartTime: scheduledTime
						? new Date(scheduledTime).getTime()
						: undefined,
					config,
				});
			}

			toast.success("Activity created!");
			router.push("/activities");
		} catch (error) {
			console.error(error);
			toast.error("Failed to create activity");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!event) {
		return (
			<div className="mx-auto w-full max-w-2xl py-10">
				<Card>
					<CardContent className="py-10 text-center">
						<p className="text-muted-foreground">Loading...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 py-10">
			<div className="flex items-center gap-4">
				<Link href="/activities">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="font-semibold text-2xl">Create Activity</h1>
					<p className="text-muted-foreground text-sm">
						Create an interactive activity for participants
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Activity Type</CardTitle>
						<CardDescription>
							Choose the type of activity you want to create
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 sm:grid-cols-2">
						{activityTypes.map(({ type, label, description, icon }) => (
							<button
								key={type}
								type="button"
								onClick={() => setSelectedType(type)}
								className={`flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 ${
									selectedType === type
										? "border-primary bg-primary/5"
										: "border-border"
								}`}
							>
								<div
									className={`rounded-lg p-2 ${
										selectedType === type
											? "bg-primary text-primary-foreground"
											: "bg-muted"
									}`}
								>
									{icon}
								</div>
								<div>
									<div className="font-medium">{label}</div>
									<div className="text-muted-foreground text-xs">
										{description}
									</div>
								</div>
							</button>
						))}
					</CardContent>
				</Card>

				{selectedType && (
					<>
						<Card>
							<CardHeader>
								<CardTitle>Basic Info</CardTitle>
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

								<div className="space-y-3">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="startInstantly"
											checked={startInstantly}
											onCheckedChange={(checked) =>
												setStartInstantly(checked === true)
											}
										/>
										<Label htmlFor="startInstantly" className="font-normal">
											Start instantly when created
										</Label>
									</div>

									{!startInstantly && (
										<div className="space-y-2">
											<Label htmlFor="scheduledTime">Schedule Start Time</Label>
											<Input
												id="scheduledTime"
												type="datetime-local"
												value={scheduledTime}
												onChange={(e) => setScheduledTime(e.target.value)}
											/>
											<p className="text-muted-foreground text-xs">
												Leave empty to save as draft
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{selectedType === "poll" && (
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

						{selectedType === "word_cloud" && (
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
												onChange={(e) =>
													setMaxSubmissions(Number(e.target.value))
												}
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
												onChange={(e) =>
													setMaxWordLength(Number(e.target.value))
												}
											/>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{selectedType === "reaction_speed" && (
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
									<p className="text-muted-foreground text-xs">
										The delay before showing "TAP NOW!" will be random between
										these values
									</p>
								</CardContent>
							</Card>
						)}

						{selectedType === "anonymous_chat" && (
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
											onChange={(e) =>
												setMaxMessageLength(Number(e.target.value))
											}
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
											onChange={(e) =>
												setSlowModeSeconds(Number(e.target.value))
											}
										/>
										<p className="text-muted-foreground text-xs">
											Set to 0 to disable slow mode
										</p>
									</div>
								</CardContent>
							</Card>
						)}

						{selectedType === "guess_logo" && (
							<Card>
								<CardHeader>
									<CardTitle>Guess the Logo Configuration</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="category">Category</Label>
										<Input
											id="category"
											value={logoCategory}
											onChange={(e) => setLogoCategory(e.target.value)}
											placeholder="e.g., tech companies, fast food, car brands"
											required
										/>
									</div>

									<div className="grid gap-4 sm:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="logoCount">Number of Logos</Label>
											<Input
												id="logoCount"
												type="number"
												min={5}
												max={20}
												value={logoCount}
												onChange={(e) => setLogoCount(Number(e.target.value))}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="timePerLogo">
												Time per Logo (seconds)
											</Label>
											<select
												id="timePerLogo"
												value={timePerLogo}
												onChange={(e) => setTimePerLogo(Number(e.target.value))}
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
											>
												<option value={30}>30 seconds</option>
												<option value={45}>45 seconds</option>
												<option value={60}>60 seconds</option>
												<option value={90}>90 seconds</option>
											</select>
										</div>
									</div>

									<div className="space-y-2">
										<Label>Difficulty</Label>
										<div className="flex gap-2">
											{(["easy", "medium", "hard"] as const).map((d) => (
												<Button
													key={d}
													type="button"
													variant={logoDifficulty === d ? "default" : "outline"}
													onClick={() => setLogoDifficulty(d)}
													className="flex-1 capitalize"
												>
													{d}
												</Button>
											))}
										</div>
										<p className="text-muted-foreground text-xs">
											Easy: Famous brands. Medium: Well-known. Hard:
											Industry-specific.
										</p>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="showHints"
											checked={showHints}
											onCheckedChange={(checked) =>
												setShowHints(checked === true)
											}
										/>
										<Label htmlFor="showHints" className="font-normal">
											Show hints to participants (with point penalty)
										</Label>
									</div>

									<div className="border-t pt-4">
										<Button
											type="button"
											variant="secondary"
											onClick={async () => {
												if (!logoCategory.trim()) {
													toast.error("Please enter a category first");
													return;
												}
												if (!event) return;

												setIsGeneratingLogos(true);
												setLogosGenerated(false);

												try {
													const activity = await createActivity({
														eventId: event._id,
														type: "guess_logo",
														title:
															title.trim() || `Guess the Logo: ${logoCategory}`,
														status: "draft",
														config: {
															type: "guess_logo" as const,
															category: logoCategory.trim(),
															logoCount,
															timePerLogo,
															difficulty: logoDifficulty,
															showHints,
														},
													});

													if (activity) {
														setCreatedGuessLogoActivityId(activity._id);
														await generateLogos({
															activityId: activity._id,
															category: logoCategory.trim(),
															count: logoCount,
															difficulty: logoDifficulty,
														});
														setLogosGenerated(true);
														toast.success(`Generated ${logoCount} logos!`);
													}
												} catch (error) {
													console.error(error);
													toast.error("Failed to generate logos");
												} finally {
													setIsGeneratingLogos(false);
												}
											}}
											disabled={isGeneratingLogos || !logoCategory.trim()}
											className="w-full"
										>
											{isGeneratingLogos ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Generating Logos with AI...
												</>
											) : logosGenerated ? (
												"Regenerate Logos"
											) : (
												"Generate Logos with AI"
											)}
										</Button>
										{logosGenerated && (
											<div className="mt-4 space-y-3">
												<p className="text-center text-green-600 text-sm">
													Logos generated successfully!
												</p>
												{createdGuessLogoActivityId && (
													<Link
														href={`/activities/${createdGuessLogoActivityId}`}
													>
														<Button variant="outline" className="w-full">
															View Activity Details
														</Button>
													</Link>
												)}
											</div>
										)}
									</div>

									{generatedLogoItems && generatedLogoItems.length > 0 && (
										<div className="border-t pt-4">
											<Label className="mb-3 block">
												Generated Logos Preview
											</Label>
											<div className="grid grid-cols-5 gap-3">
												{generatedLogoItems.map((item) => (
													<div
														key={item.index}
														className="flex flex-col items-center gap-1 rounded-lg border p-2"
													>
														<div className="rounded bg-white p-1">
															<img
																src={item.logoUrl}
																alt={`Logo ${item.index + 1}`}
																className="h-10 w-10 object-contain"
																onError={(e) => {
																	(e.target as HTMLImageElement).src =
																		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
																}}
															/>
														</div>
														<span className="text-center text-muted-foreground text-xs">
															{item.companyName}
														</span>
													</div>
												))}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						<div className="flex justify-end gap-3">
							<Link href="/activities">
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</Link>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Create Activity"}
							</Button>
						</div>
					</>
				)}
			</form>
		</div>
	);
}
