"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Cloud } from "lucide-react";
import { useMemo } from "react";

const COLORS = [
	"text-violet-500",
	"text-blue-500",
	"text-emerald-500",
	"text-amber-500",
	"text-rose-500",
	"text-cyan-500",
	"text-pink-500",
	"text-lime-500",
	"text-indigo-500",
	"text-teal-500",
];

interface WordCloudPresentationProps {
	config: {
		prompt: string;
	};
	results: {
		wordCounts: Record<string, number>;
		totalSubmissions: number;
		uniqueWords: number;
	};
}

interface WordItem {
	word: string;
	count: number;
	size: number;
	color: string;
	x: number;
	y: number;
	rotation: number;
}

function generateWordLayout(
	wordCounts: Record<string, number>,
	maxCount: number,
): WordItem[] {
	const words = Object.entries(wordCounts)
		.map(([word, count]) => ({ word, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 50);

	const items: WordItem[] = [];
	const centerX = 50;
	const centerY = 50;

	words.forEach((w, index) => {
		const sizeFactor = w.count / maxCount;
		const size = 18 + sizeFactor * 54;

		const angle = (index / words.length) * Math.PI * 2 * 3;
		const radius = 5 + (index / words.length) * 35;

		const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 10;
		const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 10;

		const rotation = (Math.random() - 0.5) * 20;

		items.push({
			word: w.word,
			count: w.count,
			size,
			color: COLORS[index % COLORS.length],
			x: Math.max(10, Math.min(90, x)),
			y: Math.max(15, Math.min(85, y)),
			rotation,
		});
	});

	return items;
}

export function WordCloudPresentation({
	config,
	results,
}: WordCloudPresentationProps) {
	const maxCount = useMemo(() => {
		const counts = Object.values(results.wordCounts);
		return counts.length > 0 ? Math.max(...counts) : 1;
	}, [results.wordCounts]);

	const wordItems = useMemo(
		() => generateWordLayout(results.wordCounts, maxCount),
		[results.wordCounts, maxCount],
	);

	return (
		<div className="flex min-h-screen flex-col items-center px-8 py-8">
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-4"
			>
				<Cloud size={48} className="text-violet-500" />
			</motion.div>

			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="mb-8 max-w-4xl text-center font-bold text-3xl"
				style={{ color: "var(--presentation-text)" }}
			>
				{config.prompt}
			</motion.h1>

			<div className="relative h-[60vh] w-full max-w-5xl">
				{wordItems.length === 0 ? (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-2xl"
						style={{ color: "var(--presentation-muted)" }}
					>
						No words submitted yet. Waiting for responses...
					</motion.p>
				) : (
					<AnimatePresence>
						{wordItems.map((item, index) => (
							<motion.span
								key={item.word}
								className={`absolute font-semibold ${item.color}`}
								style={{
									left: `${item.x}%`,
									top: `${item.y}%`,
									fontSize: `${item.size}px`,
									transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
								}}
								initial={{
									opacity: 0,
									scale: 0,
								}}
								animate={{
									opacity: 1,
									scale: 1,
								}}
								transition={{
									type: "spring",
									stiffness: 200,
									damping: 15,
									delay: index * 0.03,
								}}
							>
								{item.word}
							</motion.span>
						))}
					</AnimatePresence>
				)}
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="mt-8 flex gap-8"
			>
				<div
					className="rounded-2xl px-8 py-4 text-center"
					style={{
						backgroundColor: "var(--presentation-card)",
						border: "1px solid var(--presentation-border)",
					}}
				>
					<motion.span
						key={results.totalSubmissions}
						initial={{ scale: 1.2 }}
						animate={{ scale: 1 }}
						className="font-bold text-3xl"
						style={{ color: "var(--presentation-text)" }}
					>
						{results.totalSubmissions}
					</motion.span>
					<p style={{ color: "var(--presentation-muted)" }}>submissions</p>
				</div>
				<div
					className="rounded-2xl px-8 py-4 text-center"
					style={{
						backgroundColor: "var(--presentation-card)",
						border: "1px solid var(--presentation-border)",
					}}
				>
					<motion.span
						key={results.uniqueWords}
						initial={{ scale: 1.2 }}
						animate={{ scale: 1 }}
						className="font-bold text-3xl"
						style={{ color: "var(--presentation-text)" }}
					>
						{results.uniqueWords}
					</motion.span>
					<p style={{ color: "var(--presentation-muted)" }}>unique words</p>
				</div>
			</motion.div>
		</div>
	);
}
