import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

function generateAvatarSeed(): string {
	return Math.random().toString(36).substring(2, 15);
}

export const join = mutation({
	args: {
		eventId: v.id("events"),
		name: v.string(),
		email: v.string(),
		avatarSeed: v.optional(v.string()),
		accessMethod: v.union(v.literal("qr_code"), v.literal("access_code")),
		userId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.eventId);
		if (!event) {
			throw new Error("Event not found");
		}

		const existing = await ctx.db
			.query("participants")
			.withIndex("by_email_event", (q) =>
				q.eq("email", args.email).eq("eventId", args.eventId),
			)
			.first();

		if (existing) {
			return existing;
		}

		const id = await ctx.db.insert("participants", {
			eventId: args.eventId,
			userId: args.userId,
			name: args.name,
			email: args.email,
			avatarSeed: args.avatarSeed ?? generateAvatarSeed(),
			accessMethod: args.accessMethod,
			joinedAt: Date.now(),
		});

		return await ctx.db.get(id);
	},
});

export const getByEvent = query({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("participants")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();
	},
});

export const getByEmail = query({
	args: {
		email: v.string(),
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("participants")
			.withIndex("by_email_event", (q) =>
				q.eq("email", args.email).eq("eventId", args.eventId),
			)
			.first();
	},
});

export const getByUser = query({
	args: {
		userId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("participants")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();
	},
});

export const updateProfile = mutation({
	args: {
		id: v.id("participants"),
		name: v.optional(v.string()),
		avatarSeed: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;

		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, value]) => value !== undefined),
		);

		if (Object.keys(filteredUpdates).length > 0) {
			await ctx.db.patch(id, filteredUpdates);
		}

		return await ctx.db.get(id);
	},
});

export const randomizeAvatar = mutation({
	args: {
		id: v.id("participants"),
	},
	handler: async (ctx, args) => {
		const newSeed = generateAvatarSeed();
		await ctx.db.patch(args.id, { avatarSeed: newSeed });
		return { avatarSeed: newSeed };
	},
});
