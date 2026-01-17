"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Calendar, Clock, MapPin, User, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function SchedulePage() {
	const currentEvent = useQuery(api.events.getCurrentEvent);
	const sessions = useQuery(
		api.schedule.getSessionsByEvent,
		currentEvent ? { eventId: currentEvent._id } : "skip",
	);
	const currentSession = useQuery(
		api.schedule.getCurrentSession,
		currentEvent ? { eventId: currentEvent._id } : "skip",
	);
	const nextSession = useQuery(
		api.schedule.getNextUpcomingSession,
		currentEvent ? { eventId: currentEvent._id } : "skip",
	);

	const [selectedEventFilter, setSelectedEventFilter] = useState("all");

	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "ongoing":
				return "default";
			case "upcoming":
				return "secondary";
			case "completed":
				return "outline";
			case "cancelled":
				return "destructive";
			default:
				return "outline";
		}
	};

	const getTypeBadgeVariant = (type: string) => {
		switch (type) {
			case "talk":
				return "default";
			case "workshop":
				return "secondary";
			case "break":
				return "outline";
			case "meal":
				return "default";
			default:
				return "outline";
		}
	};

	const groupSessionsByDate = (sessions: any[]) => {
		const grouped: Record<string, any[]> = {};
		sessions.forEach((session) => {
			const dateKey = new Date(session.date).toDateString();
			if (!grouped[dateKey]) {
				grouped[dateKey] = [];
			}
			grouped[dateKey].push(session);
		});
		return grouped;
	};

	if (currentEvent === undefined || sessions === undefined) {
		return (
			<div className="eve w-full text-white">
				<div className="mx-auto container w-full space-y-6 py-10">
					<Card>
						<CardContent className="py-10 text-center">
							<p className="text-muted-foreground">Loading schedule...</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (!currentEvent) {
		return (
			<div className="eve w-full text-white">
				<div className="mx-auto container w-full space-y-6 py-10">
					<Card>
						<CardContent className="py-16 text-center">
							<Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="mb-2 text-lg font-semibold">No current event</h3>
							<p className="mb-6 text-muted-foreground">
								Set a current event to view its schedule
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const groupedSessions = groupSessionsByDate(sessions || []);
	const dates = Object.keys(groupedSessions).sort(
		(a, b) => new Date(a).getTime() - new Date(b).getTime(),
	);

	return (
		<div className="eve w-full text-white min-h-screen">
			<div className="mx-auto container w-full space-y-6 py-10 px-4">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h1 className="flex items-center gap-2 text-3xl font-bold">
							<Calendar className="h-6 w-6" />
							Schedule
						</h1>
						<p className="text-muted-foreground">
							Manage sessions for your events
						</p>
					</div>
					<div className="flex items-center gap-4">
						<Select value={selectedEventFilter} onValueChange={(value) => setSelectedEventFilter(value || "all")}>
							<SelectTrigger className="w-[140px] rounded-xl">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Events</SelectItem>
								<SelectItem value="today">Today</SelectItem>
								<SelectItem value="upcoming">Upcoming</SelectItem>
							</SelectContent>
						</Select>
						<Link href="/schedule/create">
							<Button className="rounded-xl">
								<Plus className="mr-2 h-4 w-4" />
								Create Session
							</Button>
						</Link>
					</div>
				</div>

				{(currentSession || nextSession) && (
					<div className="grid gap-4 sm:grid-cols-2">
						{currentSession && (
							<Card className="bg-green-600/20 border-green-500/50 rounded-2xl">
								<CardHeader>
									<div className="flex items-center gap-2">
										<div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
										<CardTitle className="text-green-400">HAPPENING NOW</CardTitle>
									</div>
								</CardHeader>
								<CardContent>
									<h3 className="text-xl font-semibold mb-2">
										{currentSession.title}
									</h3>
									<div className="flex items-center gap-4 text-sm text-green-200">
										<span className="flex items-center gap-1">
											<Clock className="h-4 w-4" />
											{formatTime(currentSession.startTime)} -{" "}
											{formatTime(currentSession.endTime)}
										</span>
										{currentSession.location && (
											<span className="flex items-center gap-1">
												<MapPin className="h-4 w-4" />
												{currentSession.location}
											</span>
										)}
									</div>
								</CardContent>
							</Card>
						)}

						{nextSession && (
							<Card className="bg-blue-600/20 border-blue-500/50 rounded-2xl">
								<CardHeader>
									<div className="flex items-center gap-2">
										<div className="h-3 w-3 rounded-full bg-orange-500" />
										<CardTitle className="text-blue-400">UP NEXT</CardTitle>
									</div>
								</CardHeader>
								<CardContent>
									<h3 className="text-xl font-semibold mb-2">
										{nextSession.title}
									</h3>
									<div className="flex items-center gap-4 text-sm text-blue-200">
										<span className="flex items-center gap-1">
											<Clock className="h-4 w-4" />
											{formatTime(nextSession.startTime)} -{" "}
											{formatTime(nextSession.endTime)}
										</span>
										{nextSession.location && (
											<span className="flex items-center gap-1">
												<MapPin className="h-4 w-4" />
												{nextSession.location}
											</span>
										)}
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				)}

				{dates.length > 0 ? (
					dates.map((dateKey) => {
						const dateSessions = groupedSessions[dateKey];
						const displayDate = formatDate(new Date(dateKey).getTime());

						return (
							<div key={dateKey} className="space-y-4">
								<div className="relative flex items-center justify-center my-8">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-primary/30" />
									</div>
									<div className="relative bg-bg-main px-4">
										<span className="text-muted-foreground text-sm">
											{displayDate}
										</span>
									</div>
								</div>

								<div className="space-y-4">
									{dateSessions.map((session) => (
										<Card key={session._id} className="bg-bg-card rounded-2xl border border-border/50">
											<CardContent className="p-6">
												<div className="flex gap-6">
													<div className="flex flex-col items-center min-w-[100px]">
														<div className="text-sm font-medium">
															{formatTime(session.startTime)}
														</div>
														<div className="text-sm text-muted-foreground">
															{formatTime(session.endTime)}
														</div>
													</div>
													<div className="flex-1 space-y-2">
														<div className="flex items-start justify-between">
															<div>
																<h3 className="text-lg font-semibold">
																	{session.title}
																</h3>
																{session.description && (
																	<p className="text-sm text-muted-foreground mt-1">
																		{session.description}
																	</p>
																)}
															</div>
														</div>
														<div className="flex items-center gap-4 text-sm text-muted-foreground">
															{session.location && (
																<span className="flex items-center gap-1">
																	<MapPin className="h-4 w-4" />
																	{session.location}
																</span>
															)}
															{session.speaker && (
																<span className="flex items-center gap-1">
																	<User className="h-4 w-4" />
																	{session.speaker}
																</span>
															)}
														</div>
														<div className="flex items-center gap-2 mt-3">
															<Badge variant={getTypeBadgeVariant(session.type)} className="rounded-lg">
																{session.type.charAt(0).toUpperCase() +
																	session.type.slice(1)}
															</Badge>
															<Badge variant={getStatusBadgeVariant(session.status)} className="rounded-lg">
																{session.status.charAt(0).toUpperCase() +
																	session.status.slice(1)}
															</Badge>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						);
					})
				) : (
					<Card className="rounded-2xl">
						<CardContent className="py-16 text-center">
							<Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="mb-2 text-lg font-semibold">No sessions scheduled</h3>
							<p className="mb-6 text-muted-foreground">
								Create your first session to get started
							</p>
							<Link href="/schedule/create">
								<Button className="rounded-xl">
									<Plus className="mr-2 h-4 w-4" />
									Create Session
								</Button>
							</Link>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
