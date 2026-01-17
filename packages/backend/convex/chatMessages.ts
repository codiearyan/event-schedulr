import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const ANONYMOUS_ADJECTIVES = [
	"Clever",
	"Swift",
	"Bright",
	"Calm",
	"Bold",
	"Kind",
	"Wise",
	"Cool",
	"Happy",
	"Lucky",
	"Brave",
	"Gentle",
	"Witty",
	"Merry",
	"Noble",
	"Quick",
];

const ANONYMOUS_ANIMALS = [
	"Fox",
	"Owl",
	"Bear",
	"Wolf",
	"Deer",
	"Hawk",
	"Lion",
	"Panda",
	"Tiger",
	"Eagle",
	"Koala",
	"Otter",
	"Raven",
	"Shark",
	"Whale",
	"Zebra",
];

function generateAnonymousName(): string {
	const adjective =
		ANONYMOUS_ADJECTIVES[
			Math.floor(Math.random() * ANONYMOUS_ADJECTIVES.length)
		];
	const animal =
		ANONYMOUS_ANIMALS[Math.floor(Math.random() * ANONYMOUS_ANIMALS.length)];
	const number = Math.floor(Math.random() * 100);

	return `${adjective} ${animal} #${number}`;
}

export const getByActivity = query({
	args: {
		activityId: v.id("liveActivities"),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const query = ctx.db
			.query("chatMessages")
			.withIndex("by_activity_time", (q) => q.eq("activityId", args.activityId))
			.order("asc");

		if (args.limit) {
			return await query.take(args.limit);
		}

		return await query.collect();
	},
});

export const getRecentByActivity = query({
	args: {
		activityId: v.id("liveActivities"),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const messages = await ctx.db
			.query("chatMessages")
			.withIndex("by_activity_time", (q) => q.eq("activityId", args.activityId))
			.order("desc")
			.take(args.limit ?? 50);

		return messages.reverse();
	},
});

export const getMessageCount = query({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const messages = await ctx.db
			.query("chatMessages")
			.withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
			.collect();

		return messages.length;
	},
});

export const send = mutation({
	args: {
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
		message: v.string(),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity) {
			throw new Error("Activity not found");
		}

		if (activity.status !== "live") {
			throw new Error("Activity is not live");
		}

		if (activity.type !== "anonymous_chat") {
			throw new Error("Activity is not a chat");
		}

		const participant = await ctx.db.get(args.participantId);
		if (!participant) {
			throw new Error("Participant not found");
		}

		const config = activity.config as {
			type: "anonymous_chat";
			maxMessageLength: number;
			slowModeSeconds: number;
		};

		if (args.message.length > config.maxMessageLength) {
			throw new Error("Message too long");
		}

		if (config.slowModeSeconds > 0) {
			const lastMessage = await ctx.db
				.query("chatMessages")
				.withIndex("by_participant_activity", (q) =>
					q
						.eq("participantId", args.participantId)
						.eq("activityId", args.activityId),
				)
				.order("desc")
				.first();

			if (lastMessage) {
				const timeSinceLastMessage = Date.now() - lastMessage.sentAt;
				if (timeSinceLastMessage < config.slowModeSeconds * 1000) {
					const waitTime = Math.ceil(
						(config.slowModeSeconds * 1000 - timeSinceLastMessage) / 1000,
					);
					throw new Error(`Please wait ${waitTime} seconds before sending`);
				}
			}
		}

		const existingMessage = await ctx.db
			.query("chatMessages")
			.withIndex("by_participant_activity", (q) =>
				q
					.eq("participantId", args.participantId)
					.eq("activityId", args.activityId),
			)
			.first();

		const anonymousName = existingMessage
			? existingMessage.anonymousName
			: generateAnonymousName();

		const id = await ctx.db.insert("chatMessages", {
			activityId: args.activityId,
			participantId: args.participantId,
			anonymousName,
			message: args.message.trim(),
			sentAt: Date.now(),
		});

		return await ctx.db.get(id);
	},
});

export const getParticipantAnonymousName = query({
	args: {
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
	},
	handler: async (ctx, args) => {
		const existingMessage = await ctx.db
			.query("chatMessages")
			.withIndex("by_participant_activity", (q) =>
				q
					.eq("participantId", args.participantId)
					.eq("activityId", args.activityId),
			)
			.first();

		return existingMessage?.anonymousName ?? null;
	},
});
