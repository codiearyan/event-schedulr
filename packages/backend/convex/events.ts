import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

import { mutation, query } from "./_generated/server";

const eventImageValidator = v.optional(
	v.object({
		type: v.union(v.literal("uploaded"), v.literal("preset")),
		value: v.string(),
	}),
);

function getEventStatus(
	startsAt: number,
	endsAt: number,
): "upcoming" | "live" | "ended" {
	const now = Date.now();
	if (now < startsAt) return "upcoming";
	if (now > endsAt) return "ended";
	return "live";
}

function withStatus<T extends { startsAt: number; endsAt: number }>(
	event: T,
): T & { status: "upcoming" | "live" | "ended" } {
	return {
		...event,
		status: getEventStatus(event.startsAt, event.endsAt),
	};
}

export const getCurrentEvent = query({
	handler: async (ctx) => {
		const event = await ctx.db
			.query("events")
			.filter((q) => q.eq(q.field("isCurrentEvent"), true))
			.first();

		if (!event) return null;
		return withStatus(event);
	},
});

export const getById = query({
	args: {
		id: v.id("events"),
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.id);
		if (!event) return null;

		let resolvedImageUrl: string | null = null;
		if (event.eventImage?.type === "uploaded") {
			resolvedImageUrl = await ctx.storage.getUrl(
				event.eventImage.value as Id<"_storage">,
			);
		}

		return {
			...withStatus(event),
			resolvedImageUrl,
		};
	},
});

export const getAll = query({
	handler: async (ctx) => {
		const events = await ctx.db.query("events").collect();
		return Promise.all(
			events.map(async (event) => {
				let resolvedImageUrl: string | null = null;
				if (event.eventImage?.type === "uploaded") {
					resolvedImageUrl = await ctx.storage.getUrl(
						event.eventImage.value as Id<"_storage">,
					);
				}
				return {
					...withStatus(event),
					resolvedImageUrl,
				};
			}),
		);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.string(),
		eventImage: eventImageValidator,
		startsAt: v.number(),
		endsAt: v.number(),
		messageToParticipants: v.optional(v.string()),
		isCurrentEvent: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		if (args.startsAt >= args.endsAt) {
			throw new Error("Event start time must be before end time");
		}

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
			eventImage: args.eventImage,
			startsAt: args.startsAt,
			endsAt: args.endsAt,
			messageToParticipants: args.messageToParticipants,
			isCurrentEvent: args.isCurrentEvent ?? false,
		});

		const event = await ctx.db.get(eventId);
		return event ? withStatus(event) : null;
	},
});

export const update = mutation({
	args: {
		id: v.id("events"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		eventImage: eventImageValidator,
		startsAt: v.optional(v.number()),
		endsAt: v.optional(v.number()),
		messageToParticipants: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;

		const event = await ctx.db.get(id);
		if (!event) {
			throw new Error("Event not found");
		}

		const newStartsAt = updates.startsAt ?? event.startsAt;
		const newEndsAt = updates.endsAt ?? event.endsAt;

		if (newStartsAt >= newEndsAt) {
			throw new Error("Event start time must be before end time");
		}

		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, value]) => value !== undefined),
		);

		if (Object.keys(filteredUpdates).length > 0) {
			await ctx.db.patch(id, filteredUpdates);
		}

		const updated = await ctx.db.get(id);
		return updated ? withStatus(updated) : null;
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

export const remove = mutation({
	args: {
		id: v.id("events"),
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.id);
		if (!event) {
			throw new Error("Event not found");
		}
		await ctx.db.delete(args.id);
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
			return withStatus(existing);
		}

		const now = Date.now();
		const eventId = await ctx.db.insert("events", {
			name: "TechConf 2025",
			description:
				"Annual technology conference featuring talks, workshops, and networking opportunities.",
			startsAt: now,
			endsAt: now + 24 * 60 * 60 * 1000,
			messageToParticipants:
				"Welcome to TechConf 2025! Check out the schedule and don't miss the keynote at 10 AM.",
			isCurrentEvent: true,
		});

		const event = await ctx.db.get(eventId);
		return event ? withStatus(event) : null;
	},
});
