"use client";

import type { EventGraphicPreset } from "@/lib/event-graphics";

interface PresetGraphicRendererProps {
	preset: EventGraphicPreset;
	className?: string;
}

export function PresetGraphicRenderer({
	preset,
	className = "",
}: PresetGraphicRendererProps) {
	const textLines = Array(8).fill(preset.textPattern);

	return (
		<div
			className={`relative overflow-hidden ${className}`}
			style={{ background: preset.background }}
		>
			<div className="absolute inset-0 flex flex-col justify-center overflow-hidden">
				{textLines.map((line, index) => (
					<div
						key={index}
						className="whitespace-nowrap font-bold text-2xl tracking-widest"
						style={{
							color: preset.textColor,
							transform: `translateX(${index % 2 === 0 ? "-10%" : "10%"})`,
						}}
					>
						{Array(5).fill(`${line}  •  `).join("")}
					</div>
				))}
			</div>
		</div>
	);
}
