"use client";

import { motion } from "framer-motion";

interface AnimatedBarProps {
	percentage: number;
	color: string;
	height?: string;
}

export function AnimatedBar({
	percentage,
	color,
	height = "h-3",
}: AnimatedBarProps) {
	return (
		<div
			className={`w-full overflow-hidden rounded-full ${height}`}
			style={{ backgroundColor: "var(--presentation-border)" }}
		>
			<motion.div
				className={`h-full rounded-full ${color}`}
				initial={{ width: 0 }}
				animate={{ width: `${percentage}%` }}
				transition={{
					type: "spring",
					stiffness: 100,
					damping: 20,
				}}
			/>
		</div>
	);
}
