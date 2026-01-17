"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
	"text-violet-500",
	"text-blue-500",
	"text-emerald-500",
	"text-amber-500",
	"text-rose-500",
	"text-cyan-500",
];

interface WordCloudPreviewProps {
	config: {
		prompt: string;
	};
	results: {
		wordCounts: Record<string, number>;
		totalSubmissions: number;
		uniqueWords: number;
	};
}

export function WordCloudPreview({ config, results }: WordCloudPreviewProps) {
	const wordList = Object.entries(results.wordCounts)
		.map(([word, count]) => ({ word, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 20);

	const maxCount = wordList.length > 0 ? wordList[0].count : 1;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Word Cloud</CardTitle>
				<p className="text-muted-foreground text-sm">{config.prompt}</p>
			</CardHeader>
			<CardContent>
				{wordList.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground">
						No words submitted yet
					</p>
				) : (
					<div className="flex flex-wrap items-center justify-center gap-2 py-4">
						{wordList.map(({ word, count }, index) => {
							const size = 14 + (count / maxCount) * 20;
							return (
								<motion.span
									key={word}
									initial={{ opacity: 0, scale: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.03 }}
									className={`font-medium ${COLORS[index % COLORS.length]}`}
									style={{ fontSize: `${size}px` }}
								>
									{word}
								</motion.span>
							);
						})}
					</div>
				)}

				<div className="flex justify-center gap-6 border-t pt-4 text-muted-foreground text-sm">
					<span>{results.totalSubmissions} submissions</span>
					<span>{results.uniqueWords} unique words</span>
				</div>
			</CardContent>
		</Card>
	);
}
