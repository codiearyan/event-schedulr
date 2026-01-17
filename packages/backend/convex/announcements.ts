import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getByEvent = query({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("announcements")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.order("desc")
			.collect();
	},
});

export const create = mutation({
	args: {
		eventId: v.id("events"),
		message: v.string(),
		type: v.union(
			v.literal("info"),
			v.literal("warning"),
			v.literal("success"),
		),
	},
	handler: async (ctx, args) => {
		const announcementId = await ctx.db.insert("announcements", {
			eventId: args.eventId,
			message: args.message,
			type: args.type,
		});
		return await ctx.db.get(announcementId);
	},
});

export const remove = mutation({
	args: {
		id: v.id("announcements"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return { success: true };
	},
});
