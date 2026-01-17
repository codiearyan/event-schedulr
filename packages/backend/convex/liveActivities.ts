import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const activityConfigValidator = v.union(
	v.object({
		type: v.literal("poll"),
		question: v.string(),
		options: v.array(v.object({ id: v.string(), text: v.string() })),
		allowMultiple: v.boolean(),
		showResultsToParticipants: v.boolean(),
	}),
	v.object({
		type: v.literal("word_cloud"),
		prompt: v.string(),
		maxSubmissionsPerUser: v.number(),
		maxWordLength: v.number(),
	}),
	v.object({
		type: v.literal("reaction_speed"),
		roundCount: v.number(),
		minDelay: v.number(),
		maxDelay: v.number(),
	}),
	v.object({
		type: v.literal("anonymous_chat"),
		maxMessageLength: v.number(),
		slowModeSeconds: v.number(),
	}),
	v.object({
		type: v.literal("guess_logo"),
		category: v.string(),
		logoCount: v.number(),
		timePerLogo: v.number(),
		difficulty: v.union(
			v.literal("easy"),
			v.literal("medium"),
			v.literal("hard"),
		),
		showHints: v.boolean(),
		currentLogoIndex: v.optional(v.number()),
		logoStartedAt: v.optional(v.number()),
	}),
);

const responseDataValidator = v.union(
	v.object({
		type: v.literal("poll_vote"),
		selectedOptionIds: v.array(v.string()),
	}),
	v.object({ type: v.literal("word_submission"), word: v.string() }),
	v.object({
		type: v.literal("reaction_time"),
		roundNumber: v.number(),
		reactionTimeMs: v.number(),
	}),
	v.object({
		type: v.literal("logo_guess"),
		logoIndex: v.number(),
		guess: v.string(),
		isCorrect: v.boolean(),
		timeRemainingMs: v.number(),
		pointsEarned: v.number(),
	}),
);

export const getByEvent = query({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("liveActivities")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.order("desc")
			.collect();
	},
});

export const getActiveByEvent = query({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		const activities = await ctx.db
			.query("liveActivities")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();

		return activities.filter(
			(a) => a.status === "live" || a.status === "scheduled",
		);
	},
});

export const getById = query({
	args: {
		id: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getAggregatedResults = query({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity) {
			throw new Error("Activity not found");
		}

		const responses = await ctx.db
			.query("activityResponses")
			.withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
			.collect();

		const participantIds = [...new Set(responses.map((r) => r.participantId))];

		if (activity.type === "poll") {
			const voteCounts: Record<string, number> = {};
			const config = activity.config as {
				type: "poll";
				options: { id: string; text: string }[];
			};

			for (const option of config.options) {
				voteCounts[option.id] = 0;
			}

			for (const response of responses) {
				if (response.responseData.type === "poll_vote") {
					for (const optionId of response.responseData.selectedOptionIds) {
						voteCounts[optionId] = (voteCounts[optionId] || 0) + 1;
					}
				}
			}

			return {
				type: "poll" as const,
				voteCounts,
				totalVoters: participantIds.length,
			};
		}

		if (activity.type === "word_cloud") {
			const wordCounts: Record<string, number> = {};

			for (const response of responses) {
				if (response.responseData.type === "word_submission") {
					const word = response.responseData.word.toLowerCase();
					wordCounts[word] = (wordCounts[word] || 0) + 1;
				}
			}

			return {
				type: "word_cloud" as const,
				wordCounts,
				totalSubmissions: responses.length,
				uniqueWords: Object.keys(wordCounts).length,
			};
		}

		if (activity.type === "reaction_speed") {
			const bestTimes: Record<string, { participantId: string; time: number }> =
				{};

			for (const response of responses) {
				if (response.responseData.type === "reaction_time") {
					const participantId = response.participantId;
					const time = response.responseData.reactionTimeMs;

					if (
						!bestTimes[participantId] ||
						time < bestTimes[participantId].time
					) {
						bestTimes[participantId] = { participantId, time };
					}
				}
			}

			const participants = await Promise.all(
				Object.keys(bestTimes).map((id) =>
					ctx.db.get(id as typeof args.activityId),
				),
			);

			const leaderboard = Object.values(bestTimes)
				.sort((a, b) => a.time - b.time)
				.map((entry, index) => {
					const participant = participants.find(
						(p) => p?._id === entry.participantId,
					);
					return {
						rank: index + 1,
						participantId: entry.participantId,
						participantName: participant
							? (participant as unknown as { name: string }).name
							: "Unknown",
						bestTime: entry.time,
					};
				});

			return {
				type: "reaction_speed" as const,
				leaderboard,
				totalParticipants: participantIds.length,
			};
		}

		if (activity.type === "guess_logo") {
			const scoresByParticipant = new Map<
				string,
				{ score: number; correctCount: number }
			>();

			for (const response of responses) {
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

			const scoreParticipantIds = Array.from(scoresByParticipant.keys());
			const scoreParticipants = await Promise.all(
				scoreParticipantIds.map((id) =>
					ctx.db.get(id as typeof args.activityId),
				),
			);

			const guessLogoLeaderboard = scoreParticipantIds
				.map((id, i) => {
					const participant = scoreParticipants[i];
					const stats = scoresByParticipant.get(id)!;
					return {
						participantId: id,
						participantName: participant
							? (participant as unknown as { name: string }).name
							: "Unknown",
						score: stats.score,
						correctCount: stats.correctCount,
					};
				})
				.sort((a, b) => b.score - a.score)
				.map((entry, index) => ({
					...entry,
					rank: index + 1,
				}));

			const config = activity.config as {
				type: "guess_logo";
				logoCount: number;
				currentLogoIndex?: number;
			};

			return {
				type: "guess_logo" as const,
				leaderboard: guessLogoLeaderboard,
				totalParticipants: scoreParticipantIds.length,
				currentLogoIndex: config.currentLogoIndex ?? 0,
				totalLogos: config.logoCount,
			};
		}

		return {
			type: "anonymous_chat" as const,
			participantCount: participantIds.length,
		};
	},
});

export const getParticipantResponses = query({
	args: {
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("activityResponses")
			.withIndex("by_activity_participant", (q) =>
				q
					.eq("activityId", args.activityId)
					.eq("participantId", args.participantId),
			)
			.collect();
	},
});

export const create = mutation({
	args: {
		eventId: v.id("events"),
		type: v.union(
			v.literal("poll"),
			v.literal("word_cloud"),
			v.literal("reaction_speed"),
			v.literal("anonymous_chat"),
			v.literal("guess_logo"),
		),
		title: v.string(),
		status: v.union(
			v.literal("draft"),
			v.literal("scheduled"),
			v.literal("live"),
		),
		scheduledStartTime: v.optional(v.number()),
		config: activityConfigValidator,
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.eventId);
		if (!event) {
			throw new Error("Event not found");
		}

		const id = await ctx.db.insert("liveActivities", {
			eventId: args.eventId,
			type: args.type,
			title: args.title,
			status: args.status,
			scheduledStartTime: args.scheduledStartTime,
			actualStartTime: args.status === "live" ? Date.now() : undefined,
			config: args.config,
			createdAt: Date.now(),
		});

		return await ctx.db.get(id);
	},
});

export const update = mutation({
	args: {
		id: v.id("liveActivities"),
		title: v.optional(v.string()),
		status: v.optional(
			v.union(v.literal("draft"), v.literal("scheduled"), v.literal("live")),
		),
		scheduledStartTime: v.optional(v.number()),
		config: v.optional(activityConfigValidator),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.id);
		if (!activity) {
			throw new Error("Activity not found");
		}

		if (activity.status === "ended") {
			throw new Error("Cannot update ended activity");
		}

		const updates: Record<string, unknown> = {};
		if (args.title !== undefined) updates.title = args.title;
		if (args.status !== undefined) updates.status = args.status;
		if (args.scheduledStartTime !== undefined)
			updates.scheduledStartTime = args.scheduledStartTime;
		if (args.config !== undefined) updates.config = args.config;

		if (args.status === "live" && activity.status !== "live") {
			updates.actualStartTime = Date.now();
		}

		if (Object.keys(updates).length > 0) {
			await ctx.db.patch(args.id, updates);
		}

		return await ctx.db.get(args.id);
	},
});

export const start = mutation({
	args: {
		id: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.id);
		if (!activity) {
			throw new Error("Activity not found");
		}

		if (activity.status === "ended") {
			throw new Error("Cannot start ended activity");
		}

		await ctx.db.patch(args.id, {
			status: "live",
			actualStartTime: Date.now(),
		});

		return await ctx.db.get(args.id);
	},
});

export const end = mutation({
	args: {
		id: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.id);
		if (!activity) {
			throw new Error("Activity not found");
		}

		await ctx.db.patch(args.id, {
			status: "ended",
			endedAt: Date.now(),
		});

		return await ctx.db.get(args.id);
	},
});

export const remove = mutation({
	args: {
		id: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const responses = await ctx.db
			.query("activityResponses")
			.withIndex("by_activity", (q) => q.eq("activityId", args.id))
			.collect();

		for (const response of responses) {
			await ctx.db.delete(response._id);
		}

		const chatMessages = await ctx.db
			.query("chatMessages")
			.withIndex("by_activity", (q) => q.eq("activityId", args.id))
			.collect();

		for (const message of chatMessages) {
			await ctx.db.delete(message._id);
		}

		const logoItems = await ctx.db
			.query("logoItems")
			.withIndex("by_activity", (q) => q.eq("activityId", args.id))
			.collect();

		for (const item of logoItems) {
			await ctx.db.delete(item._id);
		}

		await ctx.db.delete(args.id);
		return { success: true };
	},
});

export const submitResponse = mutation({
	args: {
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
		responseData: responseDataValidator,
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity) {
			throw new Error("Activity not found");
		}

		if (activity.status !== "live") {
			throw new Error("Activity is not live");
		}

		const participant = await ctx.db.get(args.participantId);
		if (!participant) {
			throw new Error("Participant not found");
		}

		if (participant.eventId !== activity.eventId) {
			throw new Error("You can only participate in activities from your event");
		}

		if (args.responseData.type === "poll_vote") {
			const existingVote = await ctx.db
				.query("activityResponses")
				.withIndex("by_activity_participant", (q) =>
					q
						.eq("activityId", args.activityId)
						.eq("participantId", args.participantId),
				)
				.first();

			if (existingVote) {
				throw new Error("Already voted");
			}
		}

		if (args.responseData.type === "word_submission") {
			const config = activity.config as {
				type: "word_cloud";
				maxSubmissionsPerUser: number;
				maxWordLength: number;
			};

			const existingSubmissions = await ctx.db
				.query("activityResponses")
				.withIndex("by_activity_participant", (q) =>
					q
						.eq("activityId", args.activityId)
						.eq("participantId", args.participantId),
				)
				.collect();

			if (existingSubmissions.length >= config.maxSubmissionsPerUser) {
				throw new Error("Maximum submissions reached");
			}

			if (args.responseData.word.length > config.maxWordLength) {
				throw new Error("Word too long");
			}
		}

		const id = await ctx.db.insert("activityResponses", {
			activityId: args.activityId,
			participantId: args.participantId,
			responseData: args.responseData,
			submittedAt: Date.now(),
		});

		return await ctx.db.get(id);
	},
});
