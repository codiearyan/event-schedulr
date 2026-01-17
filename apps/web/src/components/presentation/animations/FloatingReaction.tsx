"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface FloatingReactionProps {
	id: string;
	onComplete: () => void;
}

export function FloatingReaction({ id, onComplete }: FloatingReactionProps) {
	const startX = 10 + Math.random() * 80;
	const drift = (Math.random() - 0.5) * 60;
	const size = 24 + Math.random() * 16;

	return (
		<motion.div
			key={id}
			className="pointer-events-none absolute"
			style={{
				left: `${startX}%`,
				bottom: 80,
			}}
			initial={{
				y: 0,
				x: 0,
				scale: 0,
				opacity: 1,
			}}
			animate={{
				y: -window.innerHeight * 0.6,
				x: drift,
				scale: [0, 1.2, 1, 0.8],
				opacity: [1, 1, 1, 0],
			}}
			transition={{
				duration: 2.5,
				ease: "easeOut",
			}}
			onAnimationComplete={onComplete}
		>
			<Heart size={size} className="fill-red-500 text-red-500 drop-shadow-lg" />
		</motion.div>
	);
}
