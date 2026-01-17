"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
	Activity,
	BarChart3,
	Calendar,
	Database,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export default function AnalyticsPage() {
	const analytics = useQuery(api.analytics.getOverallAnalytics);
	const seedAnalytics = useMutation(api.analytics.seed);
	const [isSeeding, setIsSeeding] = useState(false);

	const handleSeedData = async () => {
		if (
			!confirm(
				"This will generate dummy analytics data (5 events, 100-150 participants, sessions, activities, etc.). Continue?",
			)
		) {
			return;
		}

		setIsSeeding(true);
		try {
			const result = await seedAnalytics();
			toast.success(
				`Seed data created! ${result.eventsCreated} events and ${result.participantsCreated} participants.`,
			);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to seed analytics data",
			);
		} finally {
			setIsSeeding(false);
		}
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 15 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.3 },
		},
	};

	const stats = analytics
		? [
				{
					title: "Total Events",
					value: analytics.overview.totalEvents,
					icon: Calendar,
					iconColor: "text-blue-400",
				},
				{
					title: "Total Participants",
					value: analytics.overview.totalParticipants,
					icon: Users,
					iconColor: "text-purple-400",
				},
				{
					title: "Engagement Rate",
					value: analytics.overview.engagementRate.toFixed(1),
					icon: TrendingUp,
					iconColor: "text-emerald-400",
				},
				{
					title: "Active Now",
					value: analytics.overview.activeEvents,
					icon: Activity,
					iconColor: "text-orange-400",
				},
			]
		: [
				{
					title: "Total Events",
					value: "--",
					icon: Calendar,
					iconColor: "text-blue-400",
				},
				{
					title: "Total Participants",
					value: "--",
					icon: Users,
					iconColor: "text-purple-400",
				},
				{
					title: "Engagement Rate",
					value: "--",
					icon: TrendingUp,
					iconColor: "text-emerald-400",
				},
				{
					title: "Active Now",
					value: "--",
					icon: Activity,
					iconColor: "text-orange-400",
				},
			];

	const formatChartDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	const chartData =
		analytics?.participants.growthData.map((item) => ({
			date: formatChartDate(item.date),
			participants: item.cumulative,
			new: item.count,
		})) || [];

	return (
		<div className="h-max w-full text-white">
			<div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35 }}
					className="space-y-6 rounded-3xl p-8 shadow-2xl backdrop-blur-md"
				>
					<motion.div
						initial={{ opacity: 0, y: -15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35 }}
					>
						<div className="mb-1 flex items-center justify-between">
							<div>
								<h1 className="font-bold text-3xl text-white">Analytics</h1>
								<p className="mt-1 text-gray-400 text-sm">
									Monitor your event performance in real-time
								</p>
							</div>
							<Button
								onClick={handleSeedData}
								disabled={isSeeding}
								className="flex items-center gap-2 rounded-xl border border-gray-700/30 bg-gray-800/40 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-800/60 disabled:opacity-50"
							>
								<Database className="h-4 w-4" />
								{isSeeding ? "Seeding..." : "Seed Test Data"}
							</Button>
						</div>
					</motion.div>

					<div className="h-px bg-gray-700/20" />

					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
					>
						{stats.map((stat, index) => {
							const Icon = stat.icon;
							return (
								<motion.div
									key={index}
									variants={itemVariants}
									whileHover={{ y: -3 }}
									className="group rounded-2xl border border-gray-700/30 bg-gray-800/40 p-5 transition-all duration-300 hover:border-gray-600/50 hover:bg-gray-800/60"
								>
									<div className="mb-3 flex items-start justify-between">
										<h3 className="font-medium text-gray-300 text-sm">
											{stat.title}
										</h3>
										<Icon className={`h-5 w-5 ${stat.iconColor}`} />
									</div>

									<div className="space-y-0.5">
										<div className="font-bold text-2xl text-white">
											{stat.value}
										</div>
										{analytics && (
											<p className="text-gray-500 text-xs">
												{stat.title === "Engagement Rate"
													? "Activities + Sessions per event"
													: stat.title === "Active Now"
														? "Events currently live"
														: "All time"}
											</p>
										)}
									</div>
								</motion.div>
							);
						})}
					</motion.div>

					<div className="h-px bg-gray-700/20" />

					{analytics && (
						<>
							<div>
								<div className="mb-4">
									<div className="mb-1 flex items-center gap-2">
										<TrendingUp className="h-5 w-5 text-cyan-400" />
										<h2 className="font-semibold text-white text-xl">
											Participant Growth
										</h2>
									</div>
									<p className="text-gray-400 text-sm">
										Track participant growth over time
									</p>
								</div>

								<div className="rounded-2xl border border-gray-700/20 bg-gray-800/20 p-6">
									{chartData.length > 0 ? (
										<ResponsiveContainer width="100%" height={300}>
											<AreaChart data={chartData}>
												<defs>
													<linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
														<stop
															offset="5%"
															stopColor="#8b5cf6"
															stopOpacity={0.3}
														/>
														<stop
															offset="95%"
															stopColor="#8b5cf6"
															stopOpacity={0}
														/>
													</linearGradient>
												</defs>
												<CartesianGrid
													strokeDasharray="3 3"
													stroke="#374151"
													opacity={0.3}
												/>
												<XAxis
													dataKey="date"
													stroke="#9ca3af"
													style={{ fontSize: "12px" }}
												/>
												<YAxis
													stroke="#9ca3af"
													style={{ fontSize: "12px" }}
												/>
												<Tooltip
													contentStyle={{
														backgroundColor: "#1f2937",
														border: "1px solid #374151",
														borderRadius: "8px",
														color: "#fff",
													}}
													labelStyle={{ color: "#9ca3af" }}
												/>
												<Area
													type="monotone"
													dataKey="participants"
													stroke="#8b5cf6"
													strokeWidth={2}
													fillOpacity={1}
													fill="url(#colorParticipants)"
												/>
											</AreaChart>
										</ResponsiveContainer>
									) : (
										<div className="flex h-[300px] items-center justify-center text-gray-400">
											No participant data available yet
										</div>
									)}
								</div>
							</div>

							<div className="h-px bg-gray-700/20" />
						</>
					)}

					<div>
						<div className="mb-4">
							<div className="mb-1 flex items-center gap-2">
								<Zap className="h-5 w-5 text-cyan-400" />
								<h2 className="font-semibold text-white text-xl">
									Event Analytics
								</h2>
							</div>
							<p className="text-gray-400 text-sm">
								Comprehensive insights about your events
							</p>
						</div>

						{analytics ? (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-2xl border border-gray-700/20 bg-gray-800/20 p-6">
									<h3 className="mb-4 font-semibold text-white text-lg">
										Events by Status
									</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-gray-300 text-sm">Upcoming</span>
											<span className="font-semibold text-white">
												{analytics.overview.upcomingEvents}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-300 text-sm">Live</span>
											<span className="font-semibold text-white">
												{analytics.overview.activeEvents}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-300 text-sm">Ended</span>
											<span className="font-semibold text-white">
												{analytics.overview.endedEvents}
											</span>
										</div>
									</div>
								</div>

								<div className="rounded-2xl border border-gray-700/20 bg-gray-800/20 p-6">
									<h3 className="mb-4 font-semibold text-white text-lg">
										Join Method Breakdown
									</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-gray-300 text-sm">QR Code</span>
											<span className="font-semibold text-white">
												{analytics.participants.joinMethodBreakdown.qr_code}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-300 text-sm">Access Code</span>
											<span className="font-semibold text-white">
												{
													analytics.participants.joinMethodBreakdown
														.access_code
												}
											</span>
										</div>
									</div>
								</div>

								<div className="rounded-2xl border border-gray-700/20 bg-gray-800/20 p-6">
									<h3 className="mb-4 font-semibold text-white text-lg">
										Session Types
									</h3>
									<div className="space-y-2">
										{Object.entries(analytics.sessions.byType)
											.filter(([, count]) => count > 0)
											.map(([type, count]) => (
												<div
													key={type}
													className="flex items-center justify-between"
												>
													<span className="capitalize text-gray-300 text-sm">
														{type}
													</span>
													<span className="font-semibold text-white">
														{count}
													</span>
												</div>
											))}
									</div>
								</div>

								<div className="rounded-2xl border border-gray-700/20 bg-gray-800/20 p-6">
									<h3 className="mb-4 font-semibold text-white text-lg">
										Activity Types
									</h3>
									<div className="space-y-2">
										{Object.entries(analytics.activities.byType)
											.filter(([, count]) => count > 0)
											.map(([type, count]) => (
												<div
													key={type}
													className="flex items-center justify-between"
												>
													<span className="capitalize text-gray-300 text-sm">
														{type.replace("_", " ")}
													</span>
													<span className="font-semibold text-white">
														{count}
													</span>
												</div>
											))}
									</div>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-2xl border border-gray-700/20 bg-gray-800/20 py-10 text-center">
								<motion.div
									animate={{ y: [0, -8, 0] }}
									transition={{
										duration: 2.5,
										repeat: Number.POSITIVE_INFINITY,
									}}
									className="mb-3"
								>
									<BarChart3 className="mx-auto h-12 w-12 text-gray-500" />
								</motion.div>

								<h3 className="mb-2 font-semibold text-lg text-white">
									Loading Analytics...
								</h3>
								<p className="max-w-sm text-gray-400 text-sm leading-relaxed">
									Fetching your event performance data.
								</p>
							</div>
						)}
					</div>

					{analytics && analytics.topPerformingEvents.length > 0 && (
						<>
							<div className="h-px bg-gray-700/20" />

							<div>
								<h3 className="mb-4 font-semibold text-lg text-white">
									Top Performing Events
								</h3>
								<div className="space-y-3">
									{analytics.topPerformingEvents.map((event, index) => (
										<div
											key={event.eventId}
											className="flex items-center justify-between rounded-xl border border-gray-700/30 bg-gray-800/40 p-4"
										>
											<div className="flex items-center gap-3">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 font-semibold text-purple-400">
													{index + 1}
												</div>
												<div>
													<p className="font-medium text-white">
														{event.eventName}
													</p>
													<p className="text-gray-400 text-xs capitalize">
														{event.status}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Users className="h-4 w-4 text-gray-400" />
												<span className="font-semibold text-white">
													{event.participantCount}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						</>
					)}
				</motion.div>
			</div>
		</div>
	);
}
