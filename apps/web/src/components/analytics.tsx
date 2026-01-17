"use client";

import { motion } from "framer-motion";
import {
	Activity,
	BarChart3,
	Calendar,
	Eye,
	Target,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";

export default function AnalyticsPage() {
	const stats = [
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

	return (
		<div className="h-max w-full bg-gray-900 text-white">
			<div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Main Container */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35 }}
					className="space-y-6 rounded-3xl border border-gray-700/40 bg-gradient-to-br from-gray-800/50 via-gray-900/60 to-black/50 p-8 shadow-2xl backdrop-blur-md"
				>
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: -15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35 }}
					>
						<div className="mb-1 flex items-center gap-3">
							<BarChart3 className="h-7 w-7 text-primary" />
							<h1 className="font-bold text-3xl text-white">Analytics</h1>
						</div>
						<p className="text-gray-400 text-sm">
							Monitor your event performance in real-time
						</p>
					</motion.div>

					{/* Divider */}
					<div className="h-px bg-gray-700/20" />

					{/* Stats Grid */}
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
										<p className="text-gray-500 text-xs">Coming soon</p>
									</div>
								</motion.div>
							);
						})}
					</motion.div>

					{/* Divider */}
					<div className="h-px bg-gray-700/20" />

					{/* Event Analytics Section */}
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

						<div className="flex flex-col items-center justify-center rounded-2xl border border-gray-700/20 bg-gray-800/20 py-10 text-center">
							<motion.div
								animate={{ y: [0, -8, 0] }}
								transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
								className="mb-3"
							>
								<BarChart3 className="mx-auto h-12 w-12 text-gray-500" />
							</motion.div>

							<h3 className="mb-2 font-semibold text-lg text-white">
								Coming Soon
							</h3>
							<p className="max-w-sm text-gray-400 text-sm leading-relaxed">
								Advanced analytics and detailed insights are being prepared to
								help you understand event performance.
							</p>

							<div className="mt-5 flex flex-wrap justify-center gap-2">
								<div className="rounded-lg border border-gray-600/30 bg-gray-700/30 px-3 py-1.5 text-gray-300 text-xs">
									📊 Performance
								</div>
								<div className="rounded-lg border border-gray-600/30 bg-gray-700/30 px-3 py-1.5 text-gray-300 text-xs">
									💡 Insights
								</div>
								<div className="rounded-lg border border-gray-600/30 bg-gray-700/30 px-3 py-1.5 text-gray-300 text-xs">
									📈 Growth
								</div>
							</div>
						</div>
					</div>

					{/* Divider */}
					<div className="h-px bg-gray-700/20" />

					{/* Upcoming Features */}
					<div>
						<h3 className="mb-4 flex items-center gap-2 font-semibold text-lg text-white">
							<Zap className="h-5 w-5 text-primary" />
							Features in Development
						</h3>
						<div className="grid gap-4 md:grid-cols-3">
							{[
								{ title: "Real-time Charts", desc: "Live performance data" },
								{ title: "Export Reports", desc: "Download in PDF/CSV" },
								{ title: "Predictions", desc: "AI-powered forecasts" },
							].map((feature, i) => (
								<div
									key={i}
									className="rounded-2xl border border-gray-700/30 bg-gray-800/40 p-4 transition-all duration-300 hover:border-gray-600/50 hover:bg-gray-800/60"
								>
									<p className="font-medium text-sm text-white">
										{feature.title}
									</p>
									<p className="mt-2 text-gray-400 text-xs">{feature.desc}</p>
								</div>
							))}
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
