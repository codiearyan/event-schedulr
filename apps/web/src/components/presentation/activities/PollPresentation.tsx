"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const COLORS = [
	"bg-violet-500",
	"bg-blue-500",
	"bg-emerald-500",
	"bg-amber-500",
	"bg-rose-500",
	"bg-cyan-500",
	"bg-pink-500",
	"bg-lime-500",
];

const BORDER_COLORS = [
	"border-violet-500",
	"border-blue-500",
	"border-emerald-500",
	"border-amber-500",
	"border-rose-500",
	"border-cyan-500",
	"border-pink-500",
	"border-lime-500",
];

interface PollPresentationProps {
	config: {
		question: string;
		options: { id: string; text: string }[];
	};
	results: {
		voteCounts: Record<string, number>;
		totalVoters: number;
	};
}

export function PollPresentation({ config, results }: PollPresentationProps) {
	const totalVotes = Object.values(results.voteCounts).reduce(
		(sum, count) => sum + count,
		0,
	);
	const maxVotes = Math.max(...Object.values(results.voteCounts), 1);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-12 py-8">
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-4"
			>
				<BarChart3 size={48} className="text-violet-500" />
			</motion.div>

			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="mb-16 max-w-4xl text-center font-bold text-4xl leading-tight"
				style={{ color: "var(--presentation-text)" }}
			>
				{config.question}
			</motion.h1>

			<div className="w-full max-w-4xl space-y-8">
				<AnimatePresence>
					{config.options.map((option, index) => {
						const count = results.voteCounts[option.id] || 0;
						const percentage = maxVotes > 0 ? (count / maxVotes) * 100 : 0;

						return (
							<motion.div
								key={option.id}
								initial={{ opacity: 0, x: -50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="space-y-2"
							>
								<div className="flex items-center justify-between">
									<span
										className="font-medium text-xl"
										style={{ color: "var(--presentation-text)" }}
									>
										{option.text}
									</span>
									<motion.span
										key={count}
										initial={{ scale: 1.5, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										className="font-bold text-2xl"
										style={{ color: "var(--presentation-text)" }}
									>
										{count}
									</motion.span>
								</div>

								<div
									className="h-4 w-full overflow-hidden rounded-full"
									style={{ backgroundColor: "var(--presentation-border)" }}
								>
									<motion.div
										className={`h-full rounded-full ${COLORS[index % COLORS.length]}`}
										initial={{ width: 0 }}
										animate={{ width: `${percentage}%` }}
										transition={{
											type: "spring",
											stiffness: 100,
											damping: 20,
										}}
									/>
								</div>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="mt-16 rounded-2xl px-8 py-4 text-center"
				style={{
					backgroundColor: "var(--presentation-card)",
					border: "1px solid var(--presentation-border)",
				}}
			>
				<motion.span
					key={results.totalVoters}
					initial={{ scale: 1.2 }}
					animate={{ scale: 1 }}
					className="font-bold text-3xl"
					style={{ color: "var(--presentation-text)" }}
				>
					{results.totalVoters}
				</motion.span>
				<span
					className="ml-2 text-xl"
					style={{ color: "var(--presentation-muted)" }}
				>
					total voters
				</span>
			</motion.div>
		</div>
	);
}
