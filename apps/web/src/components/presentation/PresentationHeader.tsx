"use client";

import { Moon, Sun } from "lucide-react";

import { usePresentationTheme } from "./PresentationThemeProvider";

interface PresentationHeaderProps {
	joinCode?: string | null;
	showBranding?: boolean;
}

export function PresentationHeader({
	joinCode,
	showBranding = true,
}: PresentationHeaderProps) {
	const { theme, toggleTheme } = usePresentationTheme();

	return (
		<header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-4">
			{joinCode ? (
				<div
					className="rounded-full px-6 py-2 font-medium text-sm"
					style={{
						backgroundColor: "var(--presentation-card)",
						border: "1px solid var(--presentation-border)",
					}}
				>
					<span style={{ color: "var(--presentation-muted)" }}>
						Join at event-schedulr.com | use code{" "}
					</span>
					<span
						className="font-bold tracking-wider"
						style={{ color: "var(--presentation-text)" }}
					>
						{joinCode}
					</span>
				</div>
			) : (
				<div />
			)}

			<div className="flex items-center gap-3">
				<button
					onClick={toggleTheme}
					className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:opacity-80"
					style={{
						backgroundColor: "var(--presentation-card)",
						border: "1px solid var(--presentation-border)",
					}}
					title="Toggle theme (T)"
					type="button"
				>
					{theme === "dark" ? (
						<Sun size={18} style={{ color: "var(--presentation-text)" }} />
					) : (
						<Moon size={18} style={{ color: "var(--presentation-text)" }} />
					)}
				</button>

				{showBranding && (
					<div
						className="flex items-center gap-2 rounded-lg px-4 py-2"
						style={{
							backgroundColor: "var(--presentation-card)",
							border: "1px solid var(--presentation-border)",
						}}
					>
						<div className="h-6 w-6 rounded bg-gradient-to-br from-violet-500 to-purple-600" />
						<span
							className="font-semibold text-sm"
							style={{ color: "var(--presentation-text)" }}
						>
							EventSchedulr
						</span>
					</div>
				)}
			</div>
		</header>
	);
}
