import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

function generateCode(length: number = 6): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	for (let i = 0; i < length; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

function getEventStatus(
	startsAt: number,
	endsAt: number,
): "upcoming" | "live" | "ended" {
	const now = Date.now();
	if (now < startsAt) return "upcoming";
	if (now > endsAt) return "ended";
	return "live";
}

export const generate = mutation({
	args: {
		eventId: v.id("events"),
		maxUses: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.eventId);
		if (!event) {
			throw new Error("Event not found");
		}

		const status = getEventStatus(event.startsAt, event.endsAt);
		if (status === "ended") {
			throw new Error("Cannot create code for ended event");
		}

		let code = generateCode();
		let existing = await ctx.db
			.query("accessCodes")
			.withIndex("by_code", (q) => q.eq("code", code))
			.first();

		while (existing) {
			code = generateCode();
			existing = await ctx.db
				.query("accessCodes")
				.withIndex("by_code", (q) => q.eq("code", code))
				.first();
		}

		const id = await ctx.db.insert("accessCodes", {
			eventId: args.eventId,
			code,
			isActive: true,
			maxUses: args.maxUses,
			useCount: 0,
			createdAt: Date.now(),
		});

		return await ctx.db.get(id);
	},
});

export const validate = query({
	args: {
		code: v.string(),
	},
	handler: async (ctx, args) => {
		const normalizedCode = args.code.toUpperCase().trim();

		const accessCode = await ctx.db
			.query("accessCodes")
			.withIndex("by_code", (q) => q.eq("code", normalizedCode))
			.first();

		if (!accessCode) {
			return { valid: false, error: "Invalid code" };
		}

		if (!accessCode.isActive) {
			return { valid: false, error: "Code is no longer active" };
		}

		const event = await ctx.db.get(accessCode.eventId);
		if (!event) {
			return { valid: false, error: "Event not found" };
		}

		const status = getEventStatus(event.startsAt, event.endsAt);
		if (status === "ended") {
			return { valid: false, error: "Event has ended" };
		}

		if (
			accessCode.maxUses !== undefined &&
			accessCode.useCount >= accessCode.maxUses
		) {
			return { valid: false, error: "Code has reached maximum uses" };
		}

		return {
			valid: true,
			accessCode,
			event: {
				...event,
				status,
			},
		};
	},
});

export const use = mutation({
	args: {
		code: v.string(),
	},
	handler: async (ctx, args) => {
		const normalizedCode = args.code.toUpperCase().trim();

		const accessCode = await ctx.db
			.query("accessCodes")
			.withIndex("by_code", (q) => q.eq("code", normalizedCode))
			.first();

		if (!accessCode) {
			throw new Error("Invalid code");
		}

		if (!accessCode.isActive) {
			throw new Error("Code is no longer active");
		}

		const event = await ctx.db.get(accessCode.eventId);
		if (!event) {
			throw new Error("Event not found");
		}

		const status = getEventStatus(event.startsAt, event.endsAt);
		if (status === "ended") {
			throw new Error("Event has ended");
		}

		if (
			accessCode.maxUses !== undefined &&
			accessCode.useCount >= accessCode.maxUses
		) {
			throw new Error("Code has reached maximum uses");
		}

		await ctx.db.patch(accessCode._id, {
			useCount: accessCode.useCount + 1,
		});

		return {
			accessCode,
			event: {
				...event,
				status,
			},
		};
	},
});

export const listByEvent = query({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("accessCodes")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();
	},
});

export const deactivate = mutation({
	args: {
		id: v.id("accessCodes"),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { isActive: false });
		return { success: true };
	},
});
