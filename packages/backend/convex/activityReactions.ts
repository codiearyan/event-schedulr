import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const sendReaction = mutation({
	args: {
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
	},
	handler: async (ctx, args) => {
		const activity = await ctx.db.get(args.activityId);
		if (!activity || activity.status !== "live") {
			throw new Error("Activity is not live");
		}

		const now = Date.now();

		const recentReaction = await ctx.db
			.query("activityReactions")
			.withIndex("by_activity_participant", (q) =>
				q
					.eq("activityId", args.activityId)
					.eq("participantId", args.participantId),
			)
			.order("desc")
			.first();

		if (recentReaction && now - recentReaction.createdAt < 1000) {
			throw new Error(
				"Rate limited: Please wait before sending another reaction",
			);
		}

		await ctx.db.insert("activityReactions", {
			activityId: args.activityId,
			participantId: args.participantId,
			createdAt: now,
		});

		return { success: true };
	},
});

export const getReactionCount = query({
	args: {
		activityId: v.id("liveActivities"),
	},
	handler: async (ctx, args) => {
		const reactions = await ctx.db
			.query("activityReactions")
			.withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
			.collect();

		return { count: reactions.length };
	},
});

export const getRecentReactions = query({
	args: {
		activityId: v.id("liveActivities"),
		limit: v.optional(v.number()),
		since: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;
		const since = args.since ?? 0;

		const reactions = await ctx.db
			.query("activityReactions")
			.withIndex("by_activity_time", (q) =>
				q.eq("activityId", args.activityId).gt("createdAt", since),
			)
			.order("desc")
			.take(limit);

		return reactions.map((r) => ({
			id: r._id,
			createdAt: r.createdAt,
		}));
	},
});
