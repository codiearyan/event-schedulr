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
    logo: v.optional(v.string()),
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
      v.literal("success")
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
});
