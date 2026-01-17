"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

import { type ActivityConfig, ActivityConfigForm } from "./ActivityConfigForm";
import {
	type ActivityType,
	ActivityTypeSelector,
} from "./ActivityTypeSelector";

interface CreateActivitySheetProps {
	eventId: Id<"events">;
	onCreated?: () => void;
}

export function CreateActivitySheet({
	eventId,
	onCreated,
}: CreateActivitySheetProps) {
	const [open, setOpen] = useState(false);
	const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
	const [title, setTitle] = useState("");
	const [startInstantly, setStartInstantly] = useState(true);
	const [config, setConfig] = useState<Partial<ActivityConfig>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isGeneratingLogos, setIsGeneratingLogos] = useState(false);
	const [logosGenerated, setLogosGenerated] = useState(false);
	const [createdGuessLogoActivityId, setCreatedGuessLogoActivityId] =
		useState<Id<"liveActivities"> | null>(null);

	const createActivity = useMutation(api.liveActivities.create);
	const updateActivity = useMutation(api.liveActivities.update);
	const startActivity = useMutation(api.liveActivities.start);
	const generateLogos = useAction(api.guessLogo.generateLogos);

	const resetForm = () => {
		setSelectedType(null);
		setTitle("");
		setStartInstantly(true);
		setConfig({});
		setIsGeneratingLogos(false);
		setLogosGenerated(false);
		setCreatedGuessLogoActivityId(null);
	};

	const handleGenerateLogos = async (logoConfig: {
		category: string;
		count: number;
		difficulty: "easy" | "medium" | "hard";
	}): Promise<Id<"liveActivities"> | null> => {
		if (!logoConfig.category.trim()) {
			toast.error("Please enter a category first");
			return null;
		}

		setIsGeneratingLogos(true);
		setLogosGenerated(false);

		try {
			const activity = await createActivity({
				eventId,
				type: "guess_logo",
				title: title.trim() || `Guess the Logo: ${logoConfig.category}`,
				status: "draft",
				config: {
					type: "guess_logo" as const,
					category: logoConfig.category.trim(),
					logoCount: logoConfig.count,
					timePerLogo: (config as any).timePerLogo || 45,
					difficulty: logoConfig.difficulty,
					showHints: (config as any).showHints ?? true,
				},
			});

			if (activity) {
				setCreatedGuessLogoActivityId(activity._id);
				await generateLogos({
					activityId: activity._id,
					category: logoConfig.category.trim(),
					count: logoConfig.count,
					difficulty: logoConfig.difficulty,
				});
				setLogosGenerated(true);
				toast.success(`Generated ${logoConfig.count} logos!`);
				return activity._id;
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to generate logos");
		} finally {
			setIsGeneratingLogos(false);
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedType || !title.trim()) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsSubmitting(true);

		try {
			let finalConfig: ActivityConfig;

			switch (selectedType) {
				case "poll": {
					const pollConfig = config as Partial<
						import("./ActivityConfigForm").PollConfig
					>;
					if (!pollConfig.question?.trim()) {
						toast.error("Please enter a poll question");
						setIsSubmitting(false);
						return;
					}
					const validOptions = (pollConfig.options || []).filter((o) =>
						o.text.trim(),
					);
					if (validOptions.length < 2) {
						toast.error("Please add at least 2 options");
						setIsSubmitting(false);
						return;
					}
					finalConfig = {
						type: "poll",
						question: pollConfig.question.trim(),
						options: validOptions.map((o, i) => ({
							id: `opt_${i}`,
							text: o.text.trim(),
						})),
						allowMultiple: pollConfig.allowMultiple || false,
						showResultsToParticipants:
							pollConfig.showResultsToParticipants ?? true,
					};
					break;
				}

				case "word_cloud": {
					const wcConfig = config as Partial<
						import("./ActivityConfigForm").WordCloudConfig
					>;
					if (!wcConfig.prompt?.trim()) {
						toast.error("Please enter a prompt");
						setIsSubmitting(false);
						return;
					}
					finalConfig = {
						type: "word_cloud",
						prompt: wcConfig.prompt.trim(),
						maxSubmissionsPerUser: wcConfig.maxSubmissionsPerUser || 3,
						maxWordLength: wcConfig.maxWordLength || 20,
					};
					break;
				}

				case "reaction_speed": {
					const rsConfig = config as Partial<
						import("./ActivityConfigForm").ReactionSpeedConfig
					>;
					finalConfig = {
						type: "reaction_speed",
						roundCount: rsConfig.roundCount || 3,
						minDelay: rsConfig.minDelay || 1000,
						maxDelay: rsConfig.maxDelay || 5000,
					};
					break;
				}

				case "anonymous_chat": {
					const acConfig = config as Partial<
						import("./ActivityConfigForm").AnonymousChatConfig
					>;
					finalConfig = {
						type: "anonymous_chat",
						maxMessageLength: acConfig.maxMessageLength || 200,
						slowModeSeconds: acConfig.slowModeSeconds || 0,
					};
					break;
				}

				case "guess_logo": {
					const glConfig = config as Partial<
						import("./ActivityConfigForm").GuessLogoConfig
					>;
					if (!glConfig.category?.trim()) {
						toast.error("Please enter a category");
						setIsSubmitting(false);
						return;
					}
					if (!logosGenerated || !createdGuessLogoActivityId) {
						toast.error("Please generate logos first");
						setIsSubmitting(false);
						return;
					}
					finalConfig = {
						type: "guess_logo",
						category: glConfig.category.trim(),
						logoCount: glConfig.logoCount || 10,
						timePerLogo: glConfig.timePerLogo || 45,
						difficulty: glConfig.difficulty || "medium",
						showHints: glConfig.showHints ?? true,
					};
					break;
				}
			}

			const status = startInstantly ? "live" : "draft";

			if (selectedType === "guess_logo" && createdGuessLogoActivityId) {
				await updateActivity({
					id: createdGuessLogoActivityId,
					title: title.trim(),
					status,
					config: finalConfig,
				});
				if (status === "live") {
					await startActivity({ id: createdGuessLogoActivityId });
				}
			} else {
				await createActivity({
					eventId,
					type: selectedType,
					title: title.trim(),
					status,
					config: finalConfig,
				});
			}

			toast.success("Activity created!");
			resetForm();
			setOpen(false);
			onCreated?.();
		} catch (error) {
			console.error(error);
			toast.error("Failed to create activity");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<Button
						size="sm"
						className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:shadow-indigo-500/30"
					>
						<Plus size={16} className="mr-1.5" />
						Create Activity
					</Button>
				}
			/>
			<SheetContent className="w-[45%] min-w-[420px] max-w-[640px] overflow-y-auto border-zinc-800/50 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 text-white">
				<SheetHeader className="pb-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
							<Sparkles className="h-5 w-5 text-white" />
						</div>
						<div>
							<SheetTitle className="text-xl text-white">Create Activity</SheetTitle>
							<SheetDescription className="text-zinc-400 text-sm">
								Engage your event participants with interactive activities
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="space-y-8">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
							<span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Select Type</span>
							<div className="h-px flex-1 bg-gradient-to-l from-zinc-800 to-transparent" />
						</div>
						<ActivityTypeSelector
							selectedType={selectedType}
							onSelect={setSelectedType}
						/>
					</div>

					{selectedType && (
						<>
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
									<span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Details</span>
									<div className="h-px flex-1 bg-gradient-to-l from-zinc-800 to-transparent" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="title" className="text-zinc-300 text-sm font-medium">Activity Title</Label>
									<Input
										id="title"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="Enter a title for this activity"
										required
										className="h-11 border-zinc-700/50 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all duration-200"
									/>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
									<span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Configuration</span>
									<div className="h-px flex-1 bg-gradient-to-l from-zinc-800 to-transparent" />
								</div>
								<div className="rounded-2xl border border-zinc-800/50 bg-zinc-800/20 p-5">
									<ActivityConfigForm
										type={selectedType}
										config={config}
										onChange={setConfig}
										onGenerateLogos={
											selectedType === "guess_logo"
												? handleGenerateLogos
												: undefined
										}
										isGeneratingLogos={isGeneratingLogos}
										logosGenerated={logosGenerated}
									/>
								</div>
							</div>

							<div className="flex items-center space-x-3 rounded-xl bg-zinc-800/30 p-4">
								<Checkbox
									id="startInstantly"
									checked={startInstantly}
									onCheckedChange={(checked) =>
										setStartInstantly(checked === true)
									}
								/>
								<Label htmlFor="startInstantly" className="font-normal text-zinc-300 text-sm cursor-pointer">
									Start activity immediately when created
								</Label>
							</div>

							<div className="flex gap-3 pt-2">
								<Button
									type="button"
									variant="outline"
									className="flex-1 h-11 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-all duration-200"
									onClick={() => {
										resetForm();
										setOpen(false);
									}}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="flex-1 h-11 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Creating...
										</>
									) : (
										"Create Activity"
									)}
								</Button>
							</div>
						</>
					)}
				</form>
			</SheetContent>
		</Sheet>
	);
}
