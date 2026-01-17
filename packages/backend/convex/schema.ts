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
		eventImage: v.optional(
			v.object({
				type: v.union(v.literal("uploaded"), v.literal("preset")),
				value: v.string(),
			}),
		),
		startsAt: v.number(),
		endsAt: v.number(),
		messageToParticipants: v.optional(v.string()),
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

	participants: defineTable({
		eventId: v.id("events"),
		userId: v.optional(v.string()),
		name: v.string(),
		email: v.string(),
		avatarSeed: v.string(),
		accessMethod: v.union(v.literal("qr_code"), v.literal("access_code")),
		joinedAt: v.number(),
		expoPushToken: v.optional(v.string()),
	})
		.index("by_event", ["eventId"])
		.index("by_email_event", ["email", "eventId"])
		.index("by_user", ["userId"]),

	accessCodes: defineTable({
		eventId: v.id("events"),
		code: v.string(),
		isActive: v.boolean(),
		maxUses: v.optional(v.number()),
		useCount: v.number(),
		createdAt: v.number(),
	})
		.index("by_event", ["eventId"])
		.index("by_code", ["code"]),

	liveActivities: defineTable({
		eventId: v.id("events"),
		type: v.union(
			v.literal("poll"),
			v.literal("word_cloud"),
			v.literal("reaction_speed"),
			v.literal("anonymous_chat"),
			v.literal("guess_logo"),
		),
		title: v.string(),
		status: v.union(
			v.literal("draft"),
			v.literal("scheduled"),
			v.literal("live"),
			v.literal("ended"),
		),
		scheduledStartTime: v.optional(v.number()),
		actualStartTime: v.optional(v.number()),
		endedAt: v.optional(v.number()),
		config: v.union(
			v.object({
				type: v.literal("poll"),
				question: v.string(),
				options: v.array(v.object({ id: v.string(), text: v.string() })),
				allowMultiple: v.boolean(),
				showResultsToParticipants: v.boolean(),
			}),
			v.object({
				type: v.literal("word_cloud"),
				prompt: v.string(),
				maxSubmissionsPerUser: v.number(),
				maxWordLength: v.number(),
			}),
			v.object({
				type: v.literal("reaction_speed"),
				roundCount: v.number(),
				minDelay: v.number(),
				maxDelay: v.number(),
			}),
			v.object({
				type: v.literal("anonymous_chat"),
				maxMessageLength: v.number(),
				slowModeSeconds: v.number(),
			}),
			v.object({
				type: v.literal("guess_logo"),
				category: v.string(),
				logoCount: v.number(),
				timePerLogo: v.number(),
				difficulty: v.union(
					v.literal("easy"),
					v.literal("medium"),
					v.literal("hard"),
				),
				showHints: v.boolean(),
				currentLogoIndex: v.optional(v.number()),
				logoStartedAt: v.optional(v.number()),
			}),
		),
		createdAt: v.number(),
	})
		.index("by_event", ["eventId"])
		.index("by_event_status", ["eventId", "status"]),

	activityResponses: defineTable({
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
		responseData: v.union(
			v.object({
				type: v.literal("poll_vote"),
				selectedOptionIds: v.array(v.string()),
			}),
			v.object({ type: v.literal("word_submission"), word: v.string() }),
			v.object({
				type: v.literal("reaction_time"),
				roundNumber: v.number(),
				reactionTimeMs: v.number(),
			}),
			v.object({
				type: v.literal("logo_guess"),
				logoIndex: v.number(),
				guess: v.string(),
				isCorrect: v.boolean(),
				timeRemainingMs: v.number(),
				pointsEarned: v.number(),
			}),
		),
		submittedAt: v.number(),
	})
		.index("by_activity", ["activityId"])
		.index("by_activity_participant", ["activityId", "participantId"]),

	chatMessages: defineTable({
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
		anonymousName: v.string(),
		message: v.string(),
		sentAt: v.number(),
	})
		.index("by_activity", ["activityId"])
		.index("by_activity_time", ["activityId", "sentAt"])
		.index("by_participant_activity", ["participantId", "activityId"]),

	logoItems: defineTable({
		activityId: v.id("liveActivities"),
		index: v.number(),
		companyName: v.string(),
		logoUrl: v.string(),
		hints: v.array(v.string()),
		alternateNames: v.array(v.string()),
	})
		.index("by_activity", ["activityId"])
		.index("by_activity_index", ["activityId", "index"]),

	activityParticipants: defineTable({
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
		joinedAt: v.number(),
	})
		.index("by_activity", ["activityId"])
		.index("by_activity_participant", ["activityId", "participantId"]),

	activityReactions: defineTable({
		activityId: v.id("liveActivities"),
		participantId: v.id("participants"),
		createdAt: v.number(),
	})
		.index("by_activity", ["activityId"])
		.index("by_activity_time", ["activityId", "createdAt"])
		.index("by_activity_participant", ["activityId", "participantId"]),

	sessions: defineTable({
		eventId: v.id("events"),
		title: v.string(),
		description: v.optional(v.string()),
		date: v.number(),
		startTime: v.number(),
		endTime: v.number(),
		location: v.optional(v.string()),
		speaker: v.optional(v.string()),
		// speakerBio: v.optional(v.string()),
		type: v.union(
			v.literal("talk"),
			v.literal("workshop"),
			v.literal("break"),
			v.literal("meal"),
			v.literal("activity"),
			v.literal("ceremony"),
			v.literal("other"),
		),
		status: v.union(
			v.literal("postponed"),
			v.literal("upcoming"),
			v.literal("ongoing"),
			v.literal("completed"),
			v.literal("cancelled"),
		),
	}).index("by_event", ["eventId"]),
});
