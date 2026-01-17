"use node";

import { v } from "convex/values";
import { Expo } from "expo-server-sdk";
import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

const expo = new Expo();

const pushNotificationArgs = {
	eventId: v.id("events"),
	title: v.string(),
	body: v.string(),
	data: v.optional(v.any()),
};

export const sendPushNotificationsInternal = internalAction({
	args: pushNotificationArgs,
	handler: async (ctx, args) => {
		const tokens: string[] = await ctx.runQuery(
			internal.participants.getEventPushTokens,
			{ eventId: args.eventId },
		);

		const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

		if (validTokens.length === 0) {
			return { sent: 0, total: 0 };
		}

		const messages = validTokens.map((token) => ({
			to: token,
			sound: "default" as const,
			title: args.title,
			body: args.body,
			data: (args.data || {}) as Record<string, unknown>,
			channelId: "announcements",
		}));

		const chunks = expo.chunkPushNotifications(messages);
		let successCount = 0;

		for (const chunk of chunks) {
			try {
				const tickets = await expo.sendPushNotificationsAsync(chunk);
				successCount += tickets.filter((t) => t.status === "ok").length;
			} catch (error) {
				console.error("Error sending push notification chunk:", error);
			}
		}

		return { sent: successCount, total: validTokens.length };
	},
});

export const sendPushNotifications = action({
	args: pushNotificationArgs,
	handler: async (ctx, args) => {
		const tokens: string[] = await ctx.runQuery(
			internal.participants.getEventPushTokens,
			{ eventId: args.eventId },
		);

		const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

		if (validTokens.length === 0) {
			return { sent: 0, total: 0 };
		}

		const messages = validTokens.map((token) => ({
			to: token,
			sound: "default" as const,
			title: args.title,
			body: args.body,
			data: (args.data || {}) as Record<string, unknown>,
			channelId: "announcements",
		}));

		const chunks = expo.chunkPushNotifications(messages);
		let successCount = 0;

		for (const chunk of chunks) {
			try {
				const tickets = await expo.sendPushNotificationsAsync(chunk);
				successCount += tickets.filter((t) => t.status === "ok").length;
			} catch (error) {
				console.error("Error sending push notification chunk:", error);
			}
		}

		return { sent: successCount, total: validTokens.length };
	},
});
