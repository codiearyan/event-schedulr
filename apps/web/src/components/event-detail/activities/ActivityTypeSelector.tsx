"use client";

import { BarChart3, Cloud, ImageIcon, MessageSquare, Zap } from "lucide-react";

export type ActivityType =
	| "poll"
	| "word_cloud"
	| "reaction_speed"
	| "anonymous_chat"
	| "guess_logo";

const activityTypes: {
	type: ActivityType;
	label: string;
	description: string;
	icon: React.ElementType;
	color: {
		base: string;
		hover: string;
		selected: string;
		iconBg: string;
		iconBgSelected: string;
		ring: string;
		glow: string;
	};
}[] = [
	{
		type: "poll",
		label: "Poll",
		description: "Ask multiple choice questions",
		icon: BarChart3,
		color: {
			base: "border-zinc-700/50",
			hover: "hover:border-blue-500/50 hover:bg-blue-500/5",
			selected:
				"border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/10",
			iconBg:
				"bg-zinc-800/80 text-zinc-400 group-hover:bg-blue-500/20 group-hover:text-blue-400",
			iconBgSelected: "bg-blue-500 text-white shadow-lg shadow-blue-500/30",
			ring: "ring-2 ring-blue-500/30",
			glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
		},
	},
	{
		type: "word_cloud",
		label: "Word Cloud",
		description: "Collect words from audience",
		icon: Cloud,
		color: {
			base: "border-zinc-700/50",
			hover: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
			selected:
				"border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
			iconBg:
				"bg-zinc-800/80 text-zinc-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400",
			iconBgSelected:
				"bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
			ring: "ring-2 ring-emerald-500/30",
			glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
		},
	},
	{
		type: "reaction_speed",
		label: "Reaction Speed",
		description: "Test reaction times",
		icon: Zap,
		color: {
			base: "border-zinc-700/50",
			hover: "hover:border-amber-500/50 hover:bg-amber-500/5",
			selected:
				"border-amber-500 bg-gradient-to-br from-amber-500/20 to-amber-600/10",
			iconBg:
				"bg-zinc-800/80 text-zinc-400 group-hover:bg-amber-500/20 group-hover:text-amber-400",
			iconBgSelected: "bg-amber-500 text-white shadow-lg shadow-amber-500/30",
			ring: "ring-2 ring-amber-500/30",
			glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
		},
	},
	{
		type: "anonymous_chat",
		label: "Anonymous Chat",
		description: "Let participants chat freely",
		icon: MessageSquare,
		color: {
			base: "border-zinc-700/50",
			hover: "hover:border-purple-500/50 hover:bg-purple-500/5",
			selected:
				"border-purple-500 bg-gradient-to-br from-purple-500/20 to-purple-600/10",
			iconBg:
				"bg-zinc-800/80 text-zinc-400 group-hover:bg-purple-500/20 group-hover:text-purple-400",
			iconBgSelected: "bg-purple-500 text-white shadow-lg shadow-purple-500/30",
			ring: "ring-2 ring-purple-500/30",
			glow: "shadow-[0_0_20px_rgba(139,92,246,0.3)]",
		},
	},
	{
		type: "guess_logo",
		label: "Guess the Logo",
		description: "Guess company logos for points",
		icon: ImageIcon,
		color: {
			base: "border-zinc-700/50",
			hover: "hover:border-rose-500/50 hover:bg-rose-500/5",
			selected:
				"border-rose-500 bg-gradient-to-br from-rose-500/20 to-rose-600/10",
			iconBg:
				"bg-zinc-800/80 text-zinc-400 group-hover:bg-rose-500/20 group-hover:text-rose-400",
			iconBgSelected: "bg-rose-500 text-white shadow-lg shadow-rose-500/30",
			ring: "ring-2 ring-rose-500/30",
			glow: "shadow-[0_0_20px_rgba(244,63,94,0.3)]",
		},
	},
];

interface ActivityTypeSelectorProps {
	selectedType: ActivityType | null;
	onSelect: (type: ActivityType) => void;
}

export function ActivityTypeSelector({
	selectedType,
	onSelect,
}: ActivityTypeSelectorProps) {
	return (
		<div className="grid grid-cols-2 gap-4">
			{activityTypes.map(({ type, label, description, icon: Icon, color }) => {
				const isSelected = selectedType === type;
				return (
					<button
						key={type}
						type="button"
						onClick={() => onSelect(type)}
						className={`group relative flex flex-col items-center gap-4 rounded-2xl border-2 p-5 text-center transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
							isSelected
								? `${color.selected} ${color.ring} ${color.glow}`
								: `${color.base} ${color.hover} hover:shadow-lg`
						}`}
					>
						<div
							className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
								isSelected ? color.iconBgSelected : color.iconBg
							}`}
						>
							<Icon
								className={`h-7 w-7 transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-110"}`}
							/>
						</div>
						<div className="space-y-1">
							<div className="font-semibold text-base text-white">{label}</div>
							<div className="text-xs text-zinc-400 leading-relaxed">
								{description}
							</div>
						</div>
					</button>
				);
			})}
		</div>
	);
}

export { activityTypes };
