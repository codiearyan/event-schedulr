import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
	}),

	events: defineTable({
		name: v.string(),
		description: v.string(),
		status: v.union(
			v.literal("upcoming"),
			v.literal("live"),
			v.literal("ended"),
		),
		isCurrentEvent: v.boolean(),
	}),

	announcements: defineTable({
		eventId: v.id("events"),
		message: v.string(),
		type: v.union(
			v.literal("info"),
			v.literal("warning"),
			v.literal("success"),
		),
	}).index("by_event", ["eventId"]),
});
