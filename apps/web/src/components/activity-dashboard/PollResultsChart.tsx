"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
	"bg-violet-500",
	"bg-blue-500",
	"bg-emerald-500",
	"bg-amber-500",
	"bg-rose-500",
	"bg-cyan-500",
];

interface PollResultsChartProps {
	config: {
		question: string;
		options: { id: string; text: string }[];
	};
	results: {
		voteCounts: Record<string, number>;
		totalVoters: number;
	};
}

export function PollResultsChart({ config, results }: PollResultsChartProps) {
	const totalVotes = Object.values(results.voteCounts).reduce(
		(sum, count) => sum + count,
		0,
	);
	const maxVotes = Math.max(...Object.values(results.voteCounts), 1);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Poll Results</CardTitle>
				<p className="text-muted-foreground text-sm">{config.question}</p>
			</CardHeader>
			<CardContent className="space-y-4">
				{config.options.map((option, index) => {
					const count = results.voteCounts[option.id] || 0;
					const percentage =
						totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
					const barWidth = maxVotes > 0 ? (count / maxVotes) * 100 : 0;

					return (
						<div key={option.id} className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="font-medium">{option.text}</span>
								<motion.span
									key={count}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									className="font-semibold"
								>
									{percentage}%{" "}
									<span className="font-normal text-muted-foreground">
										({count})
									</span>
								</motion.span>
							</div>
							<div className="h-3 w-full overflow-hidden rounded-full bg-muted">
								<motion.div
									className={`h-full rounded-full ${COLORS[index % COLORS.length]}`}
									initial={{ width: 0 }}
									animate={{ width: `${barWidth}%` }}
									transition={{
										type: "spring",
										stiffness: 100,
										damping: 20,
									}}
								/>
							</div>
						</div>
					);
				})}

				<div className="pt-4 text-center text-muted-foreground text-sm">
					{results.totalVoters} total voters
				</div>
			</CardContent>
		</Card>
	);
}
