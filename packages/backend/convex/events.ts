import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getCurrentEvent = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("events")
			.filter((q) => q.eq(q.field("isCurrentEvent"), true))
			.first();
	},
});

export const getAll = query({
	handler: async (ctx) => {
		return await ctx.db.query("events").collect();
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.string(),
		status: v.union(
			v.literal("upcoming"),
			v.literal("live"),
			v.literal("ended"),
		),
		isCurrentEvent: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		if (args.isCurrentEvent) {
			const existingCurrent = await ctx.db
				.query("events")
				.filter((q) => q.eq(q.field("isCurrentEvent"), true))
				.first();
			if (existingCurrent) {
				await ctx.db.patch(existingCurrent._id, { isCurrentEvent: false });
			}
		}

		const eventId = await ctx.db.insert("events", {
			name: args.name,
			description: args.description,
			status: args.status,
			isCurrentEvent: args.isCurrentEvent ?? false,
		});
		return await ctx.db.get(eventId);
	},
});

export const updateStatus = mutation({
	args: {
		id: v.id("events"),
		status: v.union(
			v.literal("upcoming"),
			v.literal("live"),
			v.literal("ended"),
		),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { status: args.status });
		return { success: true };
	},
});

export const setCurrentEvent = mutation({
	args: {
		id: v.id("events"),
	},
	handler: async (ctx, args) => {
		const existingCurrent = await ctx.db
			.query("events")
			.filter((q) => q.eq(q.field("isCurrentEvent"), true))
			.first();
		if (existingCurrent) {
			await ctx.db.patch(existingCurrent._id, { isCurrentEvent: false });
		}
		await ctx.db.patch(args.id, { isCurrentEvent: true });
		return { success: true };
	},
});

export const seed = mutation({
	handler: async (ctx) => {
		const existing = await ctx.db
			.query("events")
			.filter((q) => q.eq(q.field("isCurrentEvent"), true))
			.first();
		if (existing) {
			return existing;
		}

		const eventId = await ctx.db.insert("events", {
			name: "TechConf 2025",
			description:
				"Annual technology conference featuring talks, workshops, and networking opportunities.",
			status: "live",
			isCurrentEvent: true,
		});
		return await ctx.db.get(eventId);
	},
});
