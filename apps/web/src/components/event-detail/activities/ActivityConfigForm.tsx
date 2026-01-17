"use client";

import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { ActivityType } from "./ActivityTypeSelector";

const inputClassName =
	"border-zinc-700/50 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all duration-200";
const labelClassName = "text-zinc-300 font-medium text-sm";
const mutedClassName = "text-zinc-500 text-xs mt-1.5";

export interface PollConfig {
	type: "poll";
	question: string;
	options: { id: string; text: string }[];
	allowMultiple: boolean;
	showResultsToParticipants: boolean;
}

export interface WordCloudConfig {
	type: "word_cloud";
	prompt: string;
	maxSubmissionsPerUser: number;
	maxWordLength: number;
}

export interface ReactionSpeedConfig {
	type: "reaction_speed";
	roundCount: number;
	minDelay: number;
	maxDelay: number;
}

export interface AnonymousChatConfig {
	type: "anonymous_chat";
	maxMessageLength: number;
	slowModeSeconds: number;
}

export interface GuessLogoConfig {
	type: "guess_logo";
	category: string;
	logoCount: number;
	timePerLogo: number;
	difficulty: "easy" | "medium" | "hard";
	showHints: boolean;
}

export type ActivityConfig =
	| PollConfig
	| WordCloudConfig
	| ReactionSpeedConfig
	| AnonymousChatConfig
	| GuessLogoConfig;

interface ActivityConfigFormProps {
	type: ActivityType;
	config: Partial<ActivityConfig>;
	onChange: (config: Partial<ActivityConfig>) => void;
	onGenerateLogos?: (config: {
		category: string;
		count: number;
		difficulty: "easy" | "medium" | "hard";
	}) => Promise<Id<"liveActivities"> | null>;
	isGeneratingLogos?: boolean;
	logosGenerated?: boolean;
}

export function ActivityConfigForm({
	type,
	config,
	onChange,
	onGenerateLogos,
	isGeneratingLogos,
	logosGenerated,
}: ActivityConfigFormProps) {
	const [pollOptions, setPollOptions] = useState<string[]>(
		(config as Partial<PollConfig>).options?.map((o) => o.text) || ["", ""],
	);

	const updatePollOptions = (options: string[]) => {
		setPollOptions(options);
		onChange({
			...config,
			type: "poll",
			options: options.map((text, i) => ({ id: `opt_${i}`, text })),
		});
	};

	if (type === "poll") {
		const pollConfig = config as Partial<PollConfig>;
		return (
			<div className="space-y-5">
				<div className="space-y-2.5">
					<Label htmlFor="question" className={labelClassName}>
						Question
					</Label>
					<Textarea
						id="question"
						value={pollConfig.question || ""}
						onChange={(e) =>
							onChange({ ...config, type: "poll", question: e.target.value })
						}
						placeholder="What would you like to ask?"
						className={`min-h-[100px] resize-none ${inputClassName}`}
					/>
				</div>

				<div className="space-y-3">
					<Label className={labelClassName}>Answer Options</Label>
					<div className="space-y-2.5">
						{pollOptions.map((option, index) => (
							<div key={index} className="group flex gap-2">
								<div className="relative flex-1">
									<span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-zinc-500">
										{index + 1}.
									</span>
									<Input
										value={option}
										onChange={(e) => {
											const newOptions = [...pollOptions];
											newOptions[index] = e.target.value;
											updatePollOptions(newOptions);
										}}
										placeholder={`Option ${index + 1}`}
										className={`pl-8 ${inputClassName}`}
									/>
								</div>
								{pollOptions.length > 2 && (
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => {
											updatePollOptions(
												pollOptions.filter((_, i) => i !== index),
											);
										}}
										className="text-zinc-500 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
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
							onClick={() => updatePollOptions([...pollOptions, ""])}
							className="border-zinc-700/50 border-dashed text-zinc-400 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-300"
						>
							<Plus className="mr-1.5 h-4 w-4" />
							Add Option
						</Button>
					)}
				</div>

				<div className="space-y-3 rounded-xl bg-zinc-800/30 p-4">
					<div className="flex items-center space-x-3">
						<Checkbox
							id="allowMultiple"
							checked={pollConfig.allowMultiple || false}
							onCheckedChange={(checked) =>
								onChange({
									...config,
									type: "poll",
									allowMultiple: checked === true,
								})
							}
						/>
						<Label
							htmlFor="allowMultiple"
							className="cursor-pointer font-normal text-sm text-zinc-300"
						>
							Allow multiple answers
						</Label>
					</div>

					<div className="flex items-center space-x-3">
						<Checkbox
							id="showResults"
							checked={pollConfig.showResultsToParticipants ?? true}
							onCheckedChange={(checked) =>
								onChange({
									...config,
									type: "poll",
									showResultsToParticipants: checked === true,
								})
							}
						/>
						<Label
							htmlFor="showResults"
							className="cursor-pointer font-normal text-sm text-zinc-300"
						>
							Show results to participants after voting
						</Label>
					</div>
				</div>
			</div>
		);
	}

	if (type === "word_cloud") {
		const wordCloudConfig = config as Partial<WordCloudConfig>;
		return (
			<div className="space-y-5">
				<div className="space-y-2.5">
					<Label htmlFor="prompt" className={labelClassName}>
						Prompt
					</Label>
					<Textarea
						id="prompt"
						value={wordCloudConfig.prompt || ""}
						onChange={(e) =>
							onChange({
								...config,
								type: "word_cloud",
								prompt: e.target.value,
							})
						}
						placeholder="What word comes to mind when you think of...?"
						className={`min-h-[100px] resize-none ${inputClassName}`}
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2.5">
						<Label htmlFor="maxSubmissions" className={labelClassName}>
							Max Submissions
						</Label>
						<Input
							id="maxSubmissions"
							type="number"
							min={1}
							max={10}
							value={wordCloudConfig.maxSubmissionsPerUser || 3}
							onChange={(e) =>
								onChange({
									...config,
									type: "word_cloud",
									maxSubmissionsPerUser: Number(e.target.value),
								})
							}
							className={inputClassName}
						/>
						<p className={mutedClassName}>Per participant</p>
					</div>
					<div className="space-y-2.5">
						<Label htmlFor="maxWordLength" className={labelClassName}>
							Max Word Length
						</Label>
						<Input
							id="maxWordLength"
							type="number"
							min={5}
							max={50}
							value={wordCloudConfig.maxWordLength || 20}
							onChange={(e) =>
								onChange({
									...config,
									type: "word_cloud",
									maxWordLength: Number(e.target.value),
								})
							}
							className={inputClassName}
						/>
						<p className={mutedClassName}>Characters allowed</p>
					</div>
				</div>
			</div>
		);
	}

	if (type === "reaction_speed") {
		const reactionConfig = config as Partial<ReactionSpeedConfig>;
		return (
			<div className="space-y-5">
				<div className="space-y-2.5">
					<Label htmlFor="roundCount" className={labelClassName}>
						Number of Rounds
					</Label>
					<Input
						id="roundCount"
						type="number"
						min={1}
						max={10}
						value={reactionConfig.roundCount || 3}
						onChange={(e) =>
							onChange({
								...config,
								type: "reaction_speed",
								roundCount: Number(e.target.value),
							})
						}
						className={inputClassName}
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2.5">
						<Label htmlFor="minDelay" className={labelClassName}>
							Min Delay
						</Label>
						<Input
							id="minDelay"
							type="number"
							min={500}
							max={10000}
							step={100}
							value={reactionConfig.minDelay || 1000}
							onChange={(e) =>
								onChange({
									...config,
									type: "reaction_speed",
									minDelay: Number(e.target.value),
								})
							}
							className={inputClassName}
						/>
						<p className={mutedClassName}>Milliseconds</p>
					</div>
					<div className="space-y-2.5">
						<Label htmlFor="maxDelay" className={labelClassName}>
							Max Delay
						</Label>
						<Input
							id="maxDelay"
							type="number"
							min={500}
							max={10000}
							step={100}
							value={reactionConfig.maxDelay || 5000}
							onChange={(e) =>
								onChange({
									...config,
									type: "reaction_speed",
									maxDelay: Number(e.target.value),
								})
							}
							className={inputClassName}
						/>
						<p className={mutedClassName}>Milliseconds</p>
					</div>
				</div>
				<div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
					<p className="text-amber-400/80 text-xs">
						The delay before showing "TAP NOW!" will be random between min and
						max values
					</p>
				</div>
			</div>
		);
	}

	if (type === "anonymous_chat") {
		const chatConfig = config as Partial<AnonymousChatConfig>;
		return (
			<div className="space-y-5">
				<div className="space-y-2.5">
					<Label htmlFor="maxMessageLength" className={labelClassName}>
						Max Message Length
					</Label>
					<Input
						id="maxMessageLength"
						type="number"
						min={50}
						max={500}
						value={chatConfig.maxMessageLength || 200}
						onChange={(e) =>
							onChange({
								...config,
								type: "anonymous_chat",
								maxMessageLength: Number(e.target.value),
							})
						}
						className={inputClassName}
					/>
					<p className={mutedClassName}>Characters per message</p>
				</div>

				<div className="space-y-2.5">
					<Label htmlFor="slowMode" className={labelClassName}>
						Slow Mode
					</Label>
					<Input
						id="slowMode"
						type="number"
						min={0}
						max={60}
						value={chatConfig.slowModeSeconds || 0}
						onChange={(e) =>
							onChange({
								...config,
								type: "anonymous_chat",
								slowModeSeconds: Number(e.target.value),
							})
						}
						className={inputClassName}
					/>
					<p className={mutedClassName}>
						Seconds between messages (0 = disabled)
					</p>
				</div>
			</div>
		);
	}

	if (type === "guess_logo") {
		const logoConfig = config as Partial<GuessLogoConfig>;
		return (
			<div className="space-y-5">
				<div className="space-y-2.5">
					<Label htmlFor="category" className={labelClassName}>
						Category
					</Label>
					<Input
						id="category"
						value={logoConfig.category || ""}
						onChange={(e) =>
							onChange({
								...config,
								type: "guess_logo",
								category: e.target.value,
							})
						}
						placeholder="e.g., tech companies, fast food, car brands"
						className={inputClassName}
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2.5">
						<Label htmlFor="logoCount" className={labelClassName}>
							Number of Logos
						</Label>
						<Input
							id="logoCount"
							type="number"
							min={5}
							max={20}
							value={logoConfig.logoCount || 10}
							onChange={(e) =>
								onChange({
									...config,
									type: "guess_logo",
									logoCount: Number(e.target.value),
								})
							}
							className={inputClassName}
						/>
					</div>
					<div className="space-y-2.5">
						<Label htmlFor="timePerLogo" className={labelClassName}>
							Time per Logo
						</Label>
						<select
							id="timePerLogo"
							value={logoConfig.timePerLogo || 45}
							onChange={(e) =>
								onChange({
									...config,
									type: "guess_logo",
									timePerLogo: Number(e.target.value),
								})
							}
							className="flex h-10 w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-white transition-all duration-200 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500/50"
						>
							<option value={30}>30 seconds</option>
							<option value={45}>45 seconds</option>
							<option value={60}>60 seconds</option>
							<option value={90}>90 seconds</option>
						</select>
					</div>
				</div>

				<div className="space-y-2.5">
					<Label className={labelClassName}>Difficulty</Label>
					<div className="grid grid-cols-3 gap-2">
						{(["easy", "medium", "hard"] as const).map((d) => (
							<button
								key={d}
								type="button"
								onClick={() =>
									onChange({ ...config, type: "guess_logo", difficulty: d })
								}
								className={`rounded-lg border-2 px-4 py-2.5 font-medium text-sm capitalize transition-all duration-200 ${
									logoConfig.difficulty === d
										? d === "easy"
											? "border-green-500 bg-green-500/20 text-green-400"
											: d === "medium"
												? "border-amber-500 bg-amber-500/20 text-amber-400"
												: "border-red-500 bg-red-500/20 text-red-400"
										: "border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50"
								}`}
							>
								{d}
							</button>
						))}
					</div>
					<p className={mutedClassName}>
						Easy: Famous brands · Medium: Well-known · Hard: Industry-specific
					</p>
				</div>

				<div className="flex items-center space-x-3 rounded-xl bg-zinc-800/30 p-4">
					<Checkbox
						id="showHints"
						checked={logoConfig.showHints ?? true}
						onCheckedChange={(checked) =>
							onChange({
								...config,
								type: "guess_logo",
								showHints: checked === true,
							})
						}
					/>
					<Label
						htmlFor="showHints"
						className="cursor-pointer font-normal text-sm text-zinc-300"
					>
						Show hints to participants (with point penalty)
					</Label>
				</div>

				{onGenerateLogos && (
					<div className="border-zinc-700/50 border-t pt-5">
						<Button
							type="button"
							onClick={() =>
								onGenerateLogos({
									category: logoConfig.category || "",
									count: logoConfig.logoCount || 10,
									difficulty: logoConfig.difficulty || "medium",
								})
							}
							disabled={isGeneratingLogos || !logoConfig.category?.trim()}
							className={`h-11 w-full font-medium text-sm transition-all duration-200 ${
								logosGenerated
									? "bg-green-600 text-white hover:bg-green-700"
									: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20 hover:from-rose-600 hover:to-pink-600"
							}`}
						>
							{isGeneratingLogos ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Generating Logos...
								</>
							) : logosGenerated ? (
								<>
									<Sparkles className="mr-2 h-4 w-4" />
									Regenerate Logos
								</>
							) : (
								<>
									<Sparkles className="mr-2 h-4 w-4" />
									Generate Logos with AI
								</>
							)}
						</Button>
						{logosGenerated && (
							<p className="mt-3 flex items-center justify-center gap-2 text-center text-green-400 text-sm">
								<span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
								Logos generated successfully!
							</p>
						)}
					</div>
				)}
			</div>
		);
	}

	return null;
}
