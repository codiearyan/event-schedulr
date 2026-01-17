import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { success } from "zod";

//create sesion function
export const createSession = mutation({
    args: {
        eventId: v.id("events"),
        title: v.string(),
        description: v.optional(v.string()),
        date: v.number(),
        startTime: v.number(),
        endTime: v.number(),
        location: v.optional(v.string()),
        speaker: v.optional(v.string()),
        type: v.union(
            v.literal("talk"),
            v.literal("workshop"),
            v.literal("break"),
            v.literal("meal"),
            v.literal("activity"),
            v.literal("ceremony"),
            v.literal("other")
        ),
        status: v.union(
            v.literal("postponed"),
            v.literal("upcoming"),
            v.literal("ongoing"),
            v.literal("completed"),
            v.literal("cancelled")
        ),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);
        if (!event) {
            throw new Error("Event not found")
        }

        //creating the session
        const sessionId = await ctx.db.insert("sessions", {
            eventId: args.eventId,
            title: args.title,
            description: args.description,
            date: args.date,
            startTime: args.startTime,
            endTime: args.endTime,
            location: args.location,
            speaker: args.speaker,
            type: args.type,
            status: args.status,
        });

    }
})

//get all session by event (sorted by time)
export const getSessionsByEvent = query({
    args: {
        eventId: v.id("events")
    },
    handler: async (ctx, args) => {
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .collect()

        //sort by startime (earluest first)
        return sessions.sort((a, b) => a.startTime - b.startTime)
    }
})

//update session
export const updateSession = mutation({
    args: {
        sessionId: v.id("sessions"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        date: v.optional(v.number()),
        startTime: v.optional(v.number()),
        endTime: v.optional(v.number()),
        location: v.optional(v.string()),
        speaker: v.optional(v.string()),
        type: v.optional(
            v.union(
                v.literal("talk"),
                v.literal("workshop"),
                v.literal("break"),
                v.literal("meal"),
                v.literal("activity"),
                v.literal("ceremony"),
                v.literal("other")
            )
        ),
        status: v.union(
            v.literal("postponed"),
            v.literal("upcoming"),
            v.literal("ongoing"),
            v.literal("completed"),
            v.literal("cancelled")
        ),
    },
    handler: async (ctx, args) => {
        const { sessionId, ...updates } = args;
        // verify session exists
        const session = await ctx.db.get(sessionId);
        if (!session) {
            throw new Error("Session not found")
        }

        //update only provides fields
        await ctx.db.patch(sessionId, updates);
        return sessionId
    }
})

//delete the session
export const deleteSession = mutation({
    args: {
        sessionId: v.id("sessions")
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) {
            throw new Error("Session not found");
        }

        //delete the session
        await ctx.db.delete(args.sessionId
        )
        return { success: true }
    }
})

//update the session status
//TODO:agar crob job lagaya toh isko change karna hoga 
export const updateSessionStatus = mutation({
    args: {
        sessionId: v.id("sessions"),
        status: v.union(
            v.literal("postponed"),
            v.literal("upcoming"),
            v.literal("ongoing"),
            v.literal("completed"),
            v.literal("cancelled")
        )
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) {
            throw new Error("Session not found");
        }

        // update status
        await ctx.db.patch(args.sessionId, {
            status: args.status
        })

        return { success: true, sessionId: args.sessionId }
    }
})


// get current and upcmming session
export const getCurrentAndUpcomingSessions = query({
    args: {
        eventId: v.id("events")
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // get all sessions for this event
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .collect()

        // filter for current (on going ) and upcomming session
        const releventSession = sessions.filter((session) => {
            //yaha pe ayega current session  time start  then now and then end time
            const isCurrent = session.startTime <= now && session.endTime >= now;

            //yaha pe ayega upcomming session
            const isUpcoming = session.startTime > now;

            return isCurrent || isUpcoming
        })

        return releventSession.sort((a, b) => a.startTime - b.startTime)

    }
})

