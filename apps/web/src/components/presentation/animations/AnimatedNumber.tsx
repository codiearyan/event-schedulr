"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface AnimatedNumberProps {
	value: number;
	className?: string;
}

export function AnimatedNumber({ value, className = "" }: AnimatedNumberProps) {
	const spring = useSpring(value, {
		stiffness: 100,
		damping: 30,
		mass: 1,
	});

	const display = useTransform(spring, (current) => Math.round(current));

	useEffect(() => {
		spring.set(value);
	}, [spring, value]);

	return (
		<motion.span
			className={`font-semibold tabular-nums ${className}`}
			style={{ color: "var(--presentation-text)" }}
		>
			{display}
		</motion.span>
	);
}
