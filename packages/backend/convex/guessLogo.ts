import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, mutation, query } from "./_generated/server";

type _LogoItem = {
	_id: Id<"logoItems">;
	activityId: Id<"liveActivities">;
	index: number;
	companyName: string;
	logoUrl: string;
	hints: string[];
	alternateNames: string[];
};

type GuessLogoConfig = {
	type: "guess_logo";
	category: string;
	logoCount: number;
	timePerLogo: number;
	difficulty: "easy" | "medium" | "hard";
	showHints: boolean;
	currentLogoIndex?: number;
	logoStartedAt?: number;
};

function levenshteinDistance(a: string, b: string): number {
	const matrix: number[][] = [];
	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}
	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}
	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j] + 1,
				);
			}
		}
	}
	return matrix[b.length][a.length];
}

function isCloseMatch(guess: string, correctAnswers: string[]): boolean {
	const normalizedGuess = guess.toLowerCase().trim();
	for (const answer of correctAnswers) {
		const normalizedAnswer = answer.toLowerCase();
		const distance = levenshteinDistance(normalizedGuess, normalizedAnswer);
		const maxLength = Math.max(normalizedGuess.length, normalizedAnswer.length);
		const similarity = 1 - distance / maxLength;
		if (similarity >= 0.7 && similarity < 1) {
			return true;
		}
		if (
			normalizedAnswer.startsWith(normalizedGuess) ||
			normalizedGuess.startsWith(normalizedAnswer)
		) {
			if (
				Math.abs(normalizedGuess.length - normalizedAnswer.length) <=
				Math.ceil(normalizedAnswer.length * 0.3)
			) {
				return true;
			}
		}
	}
	return false;
}

const POINTS_BY_ATTEMPT = [100, 75, 50, 25, 10];
const MAX_ATTEMPTS = 5;

export const generateLogos = action({
	args: {
		activityId: v.id("liveActivities"),
		category: v.string(),
		count: v.number(),
		difficulty: v.string(),
	},
	handler: async (ctx, args) => {
		const openAiKey = process.env.OPENAI_API_KEY;
		if (!openAiKey) {
			throw new Error("OPENAI_API_KEY not configured");
		}

		const difficultyGuide = {
			easy: "Globally famous brands everyone knows (Apple, Google, Nike, etc.)",
			medium:
				"Well-known but not ubiquitous brands (Slack, Dropbox, Discord, etc.)",
			hard: "Industry-specific or regional brands that require some knowledge",
		};

		const prompt = `Generate ${args.count} company names for a "${args.category}" logo guessing game.
Difficulty: ${args.difficulty}
- ${difficultyGuide[args.difficulty as keyof typeof difficultyGuide] || difficultyGuide.medium}

Return ONLY a JSON object (no markdown, no code blocks) with this structure:
{
  "companies": [
    { "name": "Apple", "domain": "apple.com", "alternates": ["Apple Inc", "Apple Computer"] }
  ]
}

Make sure all companies have clear, recognizable logos. Include domain for logo fetching.`;

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${openAiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{
						role: "system",
						content:
							"You are a helpful assistant that generates company lists for a logo guessing game. Always respond with valid JSON only, no markdown formatting.",
					},
					{ role: "user", content: prompt },
				],
				temperature: 0.8,
			}),
		});

		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.statusText}`);
		}

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content || "";

		let companies: {
			name: string;
			domain: string;
			alternates: string[];
		}[];

		try {
			const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
			const parsed = JSON.parse(cleanContent);
			companies = parsed.companies;
		} catch (e) {
			throw new Error(`Failed to parse OpenAI response: ${content}`);
		}

		const logoPromises = companies.map(async (company, index) => {
			const logoDevToken = process.env.LOGO_DEV_TOKEN;
			const logoUrl = logoDevToken
				? `https://img.logo.dev/${company.domain}?token=${logoDevToken}`
				: `https://logo.clearbit.com/${company.domain}`;

			const hintsPrompt = `Generate 3 hints for "${company.name}" in a logo guessing game:
1. Very general (industry/category)
2. More specific (year founded, HQ location)
3. Nearly gives it away (slogan, famous product)

Return ONLY a JSON object: { "hints": ["hint1", "hint2", "hint3"] }`;

			const hintsResponse = await fetch(
				"https://api.openai.com/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${openAiKey}`,
					},
					body: JSON.stringify({
						model: "gpt-4o-mini",
						messages: [
							{
								role: "system",
								content:
									"You generate hints for a logo guessing game. Always respond with valid JSON only.",
							},
							{ role: "user", content: hintsPrompt },
						],
						temperature: 0.7,
					}),
				},
			);

			let hints: string[] = [];
			if (hintsResponse.ok) {
				const hintsData = await hintsResponse.json();
				const hintsContent = hintsData.choices?.[0]?.message?.content || "";
				try {
					const cleanHints = hintsContent
						.replace(/```json\n?|\n?```/g, "")
						.trim();
					const parsedHints = JSON.parse(cleanHints);
					hints = parsedHints.hints || [];
				} catch (e) {
					hints = [
						"This company is in a popular industry",
						"Founded in the modern era",
						"You've probably used their products",
					];
				}
			}

			return {
				index,
				companyName: company.name,
				logoUrl,
				hints,
				alternateNames: company.alternates || [],
			};
		});

		const logoItems = await Promise.all(logoPromises);

		for (const item of logoItems) {
			await ctx.runMutation(api.guessLogo.storeLogoItem, {
				activityId: args.activityId,
				index: item.index,
				companyName: item.companyName,
				logoUrl: item.logoUrl,
				hints: item.hints,
				alternateNames: item.alternateNames,
			});
		}

		return { success: true, count: logoItems.length };
	},
});

export const storeLogoItem = mutation({
	args: {
		activityId: v.id("liveActivities"),
		index: v.number(),
		companyName: v.string(),
		logoUrl: v.string(),
		hints: v.array(v.string()),
		alternateNames: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("logoItems")
			.withIndex("by_activity_index", (q) =>
				q.eq("activityId", args.activityId).eq("index", args.index),
			)
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				companyName: args.companyName,
				logoUrl: args.logoUrl,
				hints: args.hints,
				alternateNames: args.alternateNames,
			});
			return existing._id;
		}

		return await ctx.db.insert("logoItems", {
			activityId: args.activityId,
			index: args.index,
			companyName: args.companyName,
			logoUrl: args.logoUrl,
			hints: args.hints,
			alternateNames: args.alternateNames,
		});
	},
});

export const getCurrentLogo = query({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity || activity.type !== "guess_logo") {
			return null;
		}

		const config = activity.config as GuessLogoConfig;
		const currentIndex = config.currentLogoIndex ?? 0;

		const logoItem = await ctx.db
			.query("logoItems")
			.withIndex("by_activity_index", (q) =>
				q.eq("activityId", args.activityId).eq("index", currentIndex),
			)
			.first();

		if (!logoItem) {
			return null;
		}

		const serverTime = Date.now();
		const elapsedSeconds = config.logoStartedAt
			? (serverTime - config.logoStartedAt) / 1000
			: 0;
		const timeRemaining = Math.max(
			0,
			Math.ceil(config.timePerLogo - elapsedSeconds),
		);

		return {
			index: logoItem.index,
			logoUrl: logoItem.logoUrl,
			hints: config.showHints ? logoItem.hints : [],
			totalLogos: config.logoCount,
			timePerLogo: config.timePerLogo,
			logoStartedAt: config.logoStartedAt,
			serverTime,
			timeRemaining,
		};
	},
});

export const getGameState = query({
	args: {
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity || activity.type !== "guess_logo") {
			return null;
		}

		const config = activity.config as GuessLogoConfig;

		const responses = await ctx.db
			.query("activityResponses")
			.withIndex("by_activity_participant", (q) =>
				q
					.eq("activityId", args.activityId)
					.eq("participantId", args.participantId),
			)
			.collect();

		const logoGuesses = responses.filter(
			(r) => r.responseData.type === "logo_guess",
		);

		const totalScore = logoGuesses.reduce((sum, r) => {
			if (r.responseData.type === "logo_guess") {
				return sum + r.responseData.pointsEarned;
			}
			return sum;
		}, 0);

		const correctCount = logoGuesses.filter(
			(r) => r.responseData.type === "logo_guess" && r.responseData.isCorrect,
		).length;

		const answeredIndices = logoGuesses.map((r) => {
			if (r.responseData.type === "logo_guess") {
				return r.responseData.logoIndex;
			}
			return -1;
		});

		const logoAttempts: Record<
			number,
			{ attempts: number; gotCorrect: boolean; lastGuess: string }
		> = {};

		for (const response of logoGuesses) {
			if (response.responseData.type === "logo_guess") {
				const logoIndex = response.responseData.logoIndex;
				if (!logoAttempts[logoIndex]) {
					logoAttempts[logoIndex] = {
						attempts: 0,
						gotCorrect: false,
						lastGuess: "",
					};
				}
				logoAttempts[logoIndex].attempts++;
				if (response.responseData.isCorrect) {
					logoAttempts[logoIndex].gotCorrect = true;
				}
				logoAttempts[logoIndex].lastGuess = response.responseData.guess;
			}
		}

		let streak = 0;
		const uniqueLogoIndices = [...new Set(answeredIndices)].sort(
			(a, b) => b - a,
		);
		for (const logoIndex of uniqueLogoIndices) {
			if (logoAttempts[logoIndex]?.gotCorrect) {
				streak++;
			} else {
				break;
			}
		}

		return {
			currentIndex: config.currentLogoIndex ?? 0,
			totalLogos: config.logoCount,
			score: totalScore,
			correctCount,
			answeredIndices,
			logoAttempts,
			streak,
			status: activity.status,
		};
	},
});

export const getLeaderboard = query({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const activityParticipants = await ctx.db
			.query("activityParticipants")
			.withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
			.collect();

		const responses = await ctx.db
			.query("activityResponses")
			.withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
			.collect();

		const logoGuesses = responses.filter(
			(r) => r.responseData.type === "logo_guess",
		);

		const scoresByParticipant = new Map<
			string,
			{ score: number; correctCount: number }
		>();

		for (const response of logoGuesses) {
			if (response.responseData.type !== "logo_guess") continue;

			const participantId = response.participantId;
			const current = scoresByParticipant.get(participantId) || {
				score: 0,
				correctCount: 0,
			};

			current.score += response.responseData.pointsEarned;
			if (response.responseData.isCorrect) {
				current.correctCount++;
			}

			scoresByParticipant.set(participantId, current);
		}

		const allParticipantIds = [
			...new Set([
				...activityParticipants.map((ap) => ap.participantId),
				...Array.from(scoresByParticipant.keys()),
			]),
		];

		const participants = await Promise.all(
			allParticipantIds.map((id) => ctx.db.get(id as Id<"participants">)),
		);

		const leaderboard = allParticipantIds
			.map((id, i) => {
				const participant = participants[i];
				const stats = scoresByParticipant.get(id) || {
					score: 0,
					correctCount: 0,
				};
				return {
					participantId: id,
					participantName: participant?.name || "Unknown",
					score: stats.score,
					correctCount: stats.correctCount,
				};
			})
			.sort((a, b) => {
				if (b.score !== a.score) {
					return b.score - a.score;
				}
				return a.participantName.localeCompare(b.participantName);
			})
			.map((entry, index) => ({
				...entry,
				rank: index + 1,
			}));

		return {
			leaderboard,
			totalParticipants: leaderboard.length,
		};
	},
});

export const getLogoItems = query({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const items = await ctx.db
			.query("logoItems")
			.withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
			.collect();

		return items.sort((a, b) => a.index - b.index);
	},
});

export const submitGuess = mutation({
	args: {
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
		logoIndex: v.number(),
		guess: v.string(),
		timeRemainingMs: v.number(),
		hintsUsed: v.number(),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity || activity.type !== "guess_logo") {
			throw new Error("Activity not found or not a guess_logo activity");
		}

		const participant = await ctx.db.get(args.participantId);
		if (!participant) {
			throw new Error("Participant not found");
		}
		if (participant.eventId !== activity.eventId) {
			throw new Error("You can only participate in activities from your event");
		}

		if (activity.status !== "live") {
			throw new Error("Activity is not live");
		}

		const config = activity.config as GuessLogoConfig;
		const currentIndex = config.currentLogoIndex ?? 0;

		if (args.logoIndex !== currentIndex) {
			throw new Error("Not on the current logo");
		}

		const existingGuesses = await ctx.db
			.query("activityResponses")
			.withIndex("by_activity_participant", (q) =>
				q
					.eq("activityId", args.activityId)
					.eq("participantId", args.participantId),
			)
			.filter((q) => q.eq(q.field("responseData.type"), "logo_guess"))
			.collect();

		const guessesForThisLogo = existingGuesses.filter(
			(r) =>
				r.responseData.type === "logo_guess" &&
				r.responseData.logoIndex === args.logoIndex,
		);

		const attemptNumber = guessesForThisLogo.length + 1;

		const alreadyCorrect = guessesForThisLogo.some(
			(r) => r.responseData.type === "logo_guess" && r.responseData.isCorrect,
		);

		if (alreadyCorrect) {
			throw new Error("Already answered correctly for this logo");
		}

		if (attemptNumber > MAX_ATTEMPTS) {
			throw new Error("Maximum attempts reached for this logo");
		}

		const logoItem = await ctx.db
			.query("logoItems")
			.withIndex("by_activity_index", (q) =>
				q.eq("activityId", args.activityId).eq("index", args.logoIndex),
			)
			.first();

		if (!logoItem) {
			throw new Error("Logo item not found");
		}

		const normalizedGuess = args.guess.toLowerCase().trim();
		const correctAnswers = [
			logoItem.companyName.toLowerCase(),
			...logoItem.alternateNames.map((n) => n.toLowerCase()),
		];

		const isCorrect = correctAnswers.some(
			(answer) =>
				normalizedGuess === answer ||
				answer.startsWith(normalizedGuess) ||
				normalizedGuess.startsWith(answer),
		);

		const isClose =
			!isCorrect &&
			isCloseMatch(args.guess, [
				logoItem.companyName,
				...logoItem.alternateNames,
			]);

		let pointsEarned = 0;
		if (isCorrect) {
			const basePoints = POINTS_BY_ATTEMPT[attemptNumber - 1] || 10;
			const timeBonus = Math.floor(
				(args.timeRemainingMs / (config.timePerLogo * 1000)) * 50,
			);
			const hintPenalty = args.hintsUsed * 10;

			const correctGuessesForOtherLogos = existingGuesses.filter(
				(r) =>
					r.responseData.type === "logo_guess" &&
					r.responseData.isCorrect &&
					r.responseData.logoIndex !== args.logoIndex,
			);

			const uniqueCorrectLogos = [
				...new Set(
					correctGuessesForOtherLogos.map((r) =>
						r.responseData.type === "logo_guess"
							? r.responseData.logoIndex
							: -1,
					),
				),
			].sort((a, b) => b - a);

			let streak = 0;
			for (let i = 0; i < uniqueCorrectLogos.length; i++) {
				const logoIndex = uniqueCorrectLogos[i];
				if (logoIndex === currentIndex - 1 - i) {
					streak++;
				} else {
					break;
				}
			}

			const streakBonus = Math.floor(
				(basePoints + timeBonus - hintPenalty) * (streak * 0.1),
			);

			pointsEarned = Math.max(
				0,
				basePoints + timeBonus - hintPenalty + streakBonus,
			);
		}

		const canRetry = !isCorrect && attemptNumber < MAX_ATTEMPTS;

		await ctx.db.insert("activityResponses", {
			activityId: args.activityId,
			participantId: args.participantId,
			responseData: {
				type: "logo_guess",
				logoIndex: args.logoIndex,
				guess: args.guess,
				isCorrect,
				timeRemainingMs: args.timeRemainingMs,
				pointsEarned,
			},
			submittedAt: Date.now(),
		});

		return {
			isCorrect,
			isClose,
			pointsEarned,
			correctAnswer: canRetry ? null : logoItem.companyName,
			attemptNumber,
			canRetry,
			nextAttemptPoints: canRetry ? POINTS_BY_ATTEMPT[attemptNumber] || 10 : 0,
		};
	},
});

export const advanceToNextLogo = mutation({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity || activity.type !== "guess_logo") {
			throw new Error("Activity not found or not a guess_logo activity");
		}

		const config = activity.config as GuessLogoConfig;
		const currentIndex = config.currentLogoIndex ?? 0;
		const nextIndex = currentIndex + 1;

		if (nextIndex >= config.logoCount) {
			await ctx.db.patch(args.activityId, {
				status: "ended",
				endedAt: Date.now(),
			});
			return { ended: true, newIndex: currentIndex };
		}

		await ctx.db.patch(args.activityId, {
			config: {
				...config,
				currentLogoIndex: nextIndex,
				logoStartedAt: Date.now(),
			},
		});

		return { ended: false, newIndex: nextIndex };
	},
});

export const startGame = mutation({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity || activity.type !== "guess_logo") {
			throw new Error("Activity not found or not a guess_logo activity");
		}

		const config = activity.config as GuessLogoConfig;

		await ctx.db.patch(args.activityId, {
			status: "live",
			actualStartTime: Date.now(),
			config: {
				...config,
				currentLogoIndex: 0,
				logoStartedAt: Date.now(),
			},
		});

		return { success: true };
	},
});

export const deleteLogoItems = mutation({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const items = await ctx.db
			.query("logoItems")
			.withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
			.collect();

		for (const item of items) {
			await ctx.db.delete(item._id);
		}

		return { deleted: items.length };
	},
});

export const canJoinActivity = query({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity) {
			return { canJoin: false, reason: "not_found" as const };
		}
		if (activity.type !== "guess_logo") {
			return { canJoin: true, reason: null };
		}
		if (activity.status === "ended") {
			return { canJoin: false, reason: "ended" as const };
		}
		return { canJoin: true, reason: null };
	},
});

export const joinActivity = mutation({
	args: {
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity || activity.type !== "guess_logo") {
			throw new Error("Activity not found or not a guess_logo activity");
		}

		const participant = await ctx.db.get(args.participantId);
		if (!participant) {
			throw new Error("Participant not found");
		}
		if (participant.eventId !== activity.eventId) {
			throw new Error("You can only join activities from your event");
		}

		if (activity.status === "ended") {
			throw new Error("Game has ended");
		}

		const existing = await ctx.db
			.query("activityParticipants")
			.withIndex("by_activity_participant", (q) =>
				q
					.eq("activityId", args.activityId)
					.eq("participantId", args.participantId),
			)
			.first();

		if (existing) {
			return { alreadyJoined: true, success: true };
		}

		await ctx.db.insert("activityParticipants", {
			activityId: args.activityId,
			participantId: args.participantId,
			joinedAt: Date.now(),
		});

		return { alreadyJoined: false, success: true };
	},
});

export const getActivityParticipants = query({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const activityParticipants = await ctx.db
			.query("activityParticipants")
			.withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
			.collect();

		const participantIds = activityParticipants.map((ap) => ap.participantId);
		const participants = await Promise.all(
			participantIds.map((id) => ctx.db.get(id)),
		);

		return activityParticipants
			.map((ap, i) => ({
				participantId: ap.participantId,
				participantName: participants[i]?.name || "Unknown",
				joinedAt: ap.joinedAt,
			}))
			.sort((a, b) => a.participantName.localeCompare(b.participantName));
	},
});
