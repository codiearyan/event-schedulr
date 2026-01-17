"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
	onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
	({ className, onCheckedChange, checked, ...props }, ref) => {
		return (
			<label
				className={cn(
					"relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
					checked ? "bg-white" : "bg-white/20",
					className,
				)}
			>
				<input
					type="checkbox"
					className="sr-only"
					ref={ref}
					checked={checked}
					onChange={(e) => onCheckedChange?.(e.target.checked)}
					{...props}
				/>
				<span
					className={cn(
						"pointer-events-none block h-4 w-4 rounded-full shadow-lg transition-transform",
						checked ? "translate-x-4 bg-black" : "translate-x-0.5 bg-white/60",
					)}
				/>
			</label>
		);
	},
);

Switch.displayName = "Switch";

export { Switch };
