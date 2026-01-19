import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

// Session data type for batch creation
const sessionDataValidator = v.object({
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
		v.literal("other"),
	),
	status: v.union(
		v.literal("postponed"),
		v.literal("upcoming"),
		v.literal("ongoing"),
		v.literal("completed"),
		v.literal("cancelled"),
	),
});

// Create multiple sessions at once (batch creation like Twitter threads)
export const createMultipleSessions = mutation({
	args: {
		eventId: v.id("events"),
		sessions: v.array(sessionDataValidator),
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.eventId);
		if (!event) {
			throw new Error("Event not found");
		}

		if (Date.now() > event.endsAt) {
			throw new Error(
				"Cannot create sessions for an event that has already ended",
			);
		}

		if (args.sessions.length === 0) {
			throw new Error("At least one session is required");
		}

		// Validate all sessions are within event date range
		for (const sessionData of args.sessions) {
			if (sessionData.startTime < event.startsAt) {
				throw new Error(
					`Session "${sessionData.title}" starts before the event begins`,
				);
			}
			if (sessionData.endTime > event.endsAt) {
				throw new Error(
					`Session "${sessionData.title}" ends after the event ends`,
				);
			}
			if (sessionData.startTime >= sessionData.endTime) {
				throw new Error(
					`Session "${sessionData.title}" has invalid time range`,
				);
			}
		}

		const createdSessions = [];

		for (const sessionData of args.sessions) {
			const sessionId = await ctx.db.insert("sessions", {
				eventId: args.eventId,
				title: sessionData.title,
				description: sessionData.description,
				date: sessionData.date,
				startTime: sessionData.startTime,
				endTime: sessionData.endTime,
				location: sessionData.location,
				speaker: sessionData.speaker,
				type: sessionData.type,
				status: sessionData.status,
			});

			const session = await ctx.db.get(sessionId);
			createdSessions.push(session);
		}

		return createdSessions;
	},
});

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
			v.literal("other"),
		),
		status: v.union(
			v.literal("postponed"),
			v.literal("upcoming"),
			v.literal("ongoing"),
			v.literal("completed"),
			v.literal("cancelled"),
		),
	},
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.eventId);
		if (!event) {
			throw new Error("Event not found");
		}

		if (Date.now() > event.endsAt) {
			throw new Error(
				"Cannot create sessions for an event that has already ended",
			);
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

		const session = await ctx.db.get(sessionId);
		return session;
	},
});

//get all session by event (sorted by time) All session
export const getSessionsByEvent = query({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();

		//sort by startime (earluest first)
		return sessions.sort((a, b) => a.startTime - b.startTime);
	},
});

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
				v.literal("other"),
			),
		),
		status: v.union(
			v.literal("postponed"),
			v.literal("upcoming"),
			v.literal("ongoing"),
			v.literal("completed"),
			v.literal("cancelled"),
		),
	},
	handler: async (ctx, args) => {
		const { sessionId, ...updates } = args;
		// verify session exists
		const session = await ctx.db.get(sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		//update only provides fields
		await ctx.db.patch(sessionId, updates);
		return sessionId;
	},
});

//delete the session
export const deleteSession = mutation({
	args: {
		sessionId: v.id("sessions"),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		//delete the session
		await ctx.db.delete(args.sessionId);
		return { success: true };
	},
});

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
			v.literal("cancelled"),
		),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		// update status
		await ctx.db.patch(args.sessionId, {
			status: args.status,
		});

		return { success: true, sessionId: args.sessionId };
	},
});

// get current and upcmming session (All ongoing + upcoming)
export const getCurrentAndUpcomingSessions = query({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// get all sessions for this event
		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();

		// filter for current (on going ) and upcomming session
		const releventSession = sessions.filter((session) => {
			//yaha pe ayega current session  time start  then now and then end time
			const isCurrent = session.startTime <= now && session.endTime >= now;

			//yaha pe ayega upcomming session
			const isUpcoming = session.startTime > now;

			return isCurrent || isUpcoming;
		});

		return releventSession.sort((a, b) => a.startTime - b.startTime);
	},
});

export const getCurrentSession = query({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		const event = await ctx.db.get(args.eventId);
		if (!event || now > event.endsAt) {
			return null;
		}

		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();

		// Find all sessions where startTime <= now <= endTime
		const currentSessions = sessions.filter(
			(session) => session.startTime <= now && session.endTime >= now,
		);

		if (currentSessions.length === 0) {
			return null;
		}

		// Return the session with the latest start time (most recently started)
		currentSessions.sort((a, b) => b.startTime - a.startTime);
		return currentSessions[0];
	},
});

export const getNextUpcomingSession = query({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		const event = await ctx.db.get(args.eventId);
		if (!event || now > event.endsAt) {
			return null;
		}

		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();

		// Filter only upcoming sessions, sort by startTime, return first one
		const upcoming = sessions
			.filter((session) => session.startTime > now)
			.sort((a, b) => a.startTime - b.startTime);

		return upcoming[0] || null;
	},
});

// AI Enhancement using Gemini - enhances description and suggests title
export const enhanceSessionWithAI = action({
	args: {
		description: v.string(),
		sessionType: v.optional(v.string()),
		eventContext: v.optional(v.string()),
	},
	handler: async (_ctx, args) => {
		const geminiApiKey = process.env.GEMINI_API_KEY;
		if (!geminiApiKey) {
			throw new Error("GEMINI_API_KEY not configured");
		}

		const sessionTypeContext = args.sessionType
			? `This is a "${args.sessionType}" type session.`
			: "";
		const eventContextInfo = args.eventContext
			? `Event context: ${args.eventContext}`
			: "";

		const prompt = `You are an event organizer. The user wrote a rough description for a session. Your job is to:

1. Create a SHORT, CATCHY TITLE (20-35 characters)
2. Rewrite the description to be CLEAR, FRIENDLY, and PROFESSIONAL in simple English (120-200 characters)

${sessionTypeContext}
${eventContextInfo}

User's rough notes: "${args.description}"

Make it sound welcoming and easy to understand. Fix grammar, add helpful details, and make it engaging.

Examples:
- Input: "lunch break everyone eat food"
  Output: {"title":"Lunch Break","description":"Take a break and enjoy your meal! Grab your food, relax with fellow attendees, and recharge for the afternoon sessions."}

- Input: "coding workshop learn react"
  Output: {"title":"React Workshop","description":"Learn React basics in this hands-on coding workshop. Build your first component, understand state management, and create interactive UIs."}

Now transform the user's input above. Return ONLY valid JSON:
{"title":"Your Title","description":"Your enhanced description"}`;

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: [
						{
							parts: [{ text: prompt }],
						},
					],
					generationConfig: {
						temperature: 0.8,
						maxOutputTokens: 1024,
						stopSequences: ["}"],
					},
				}),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
		}

		const data = await response.json();
		const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

		// Clean up the response - remove markdown, whitespace, etc.
		let cleanContent = content
			.replace(/```json\s*/gi, "")
			.replace(/```\s*/gi, "")
			.replace(/^\s+|\s+$/g, "")
			.trim();

		// Try to extract JSON from the response
		const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			cleanContent = jsonMatch[0];
		}

		// Try to fix incomplete JSON by adding closing characters
		let jsonToParse = cleanContent;
		if (!jsonToParse.endsWith("}")) {
			if (jsonToParse.includes('"description"')) {
				jsonToParse = jsonToParse + '"}';
			}
		}

		try {
			const parsed = JSON.parse(jsonToParse);
			return {
				success: true,
				title: parsed.title || "",
				description: parsed.description || "",
			};
		} catch (_parseError) {
			// Fallback: Try to extract title and description using regex
			const titleMatch = content.match(/"title"\s*:\s*"([^"]+)"/i);
			const descMatch = content.match(/"description"\s*:\s*"([^"]*)/i);

			if (titleMatch || descMatch) {
				return {
					success: true,
					title: titleMatch?.[1] || "",
					description: descMatch?.[1] || "",
				};
			}

			// Last resort: Use the raw content as enhanced description
			if (content.length > 0 && content.length < 500) {
				return {
					success: true,
					title: "",
					description: content.trim().slice(0, 200),
				};
			}

			throw new Error("Could not parse AI response. Please try again.");
		}
	},
});
