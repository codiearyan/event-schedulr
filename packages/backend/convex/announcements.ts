import { v } from "convex/values";

import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

const getNotificationTitle = (type: "info" | "warning" | "success") => {
	switch (type) {
		case "info":
			return "📢 New Announcement";
		case "warning":
			return "⚠️ Important Notice";
		case "success":
			return "✅ Good News!";
	}
};

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

		await ctx.scheduler.runAfter(
			0,
			internal.notifications.sendPushNotificationsInternal,
			{
				eventId: args.eventId,
				title: getNotificationTitle(args.type),
				body: args.message,
				data: { type: "ANNOUNCEMENT", announcementId: announcementId },
			},
		);

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
