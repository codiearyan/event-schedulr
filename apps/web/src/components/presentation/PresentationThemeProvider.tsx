"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "presentation-theme";

export function PresentationThemeProvider({
	children,
	defaultTheme = "dark",
}: {
	children: React.ReactNode;
	defaultTheme?: Theme;
}) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		if (stored === "light" || stored === "dark") {
			setThemeState(stored);
		}
	}, []);

	const setTheme = useCallback((newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem(STORAGE_KEY, newTheme);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(theme === "light" ? "dark" : "light");
	}, [theme, setTheme]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "t" || e.key === "T") {
				if (
					document.activeElement?.tagName !== "INPUT" &&
					document.activeElement?.tagName !== "TEXTAREA"
				) {
					toggleTheme();
				}
			}
			if (e.key === "f" || e.key === "F") {
				if (
					document.activeElement?.tagName !== "INPUT" &&
					document.activeElement?.tagName !== "TEXTAREA"
				) {
					if (document.fullscreenElement) {
						document.exitFullscreen();
					} else {
						document.documentElement.requestFullscreen();
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggleTheme]);

	if (!mounted) {
		return (
			<div
				className="min-h-screen"
				style={{
					backgroundColor: defaultTheme === "dark" ? "#09090b" : "#ffffff",
				}}
			/>
		);
	}

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
			<div
				className="min-h-screen transition-colors duration-300"
				style={
					{
						"--presentation-bg": theme === "dark" ? "#09090b" : "#ffffff",
						"--presentation-text": theme === "dark" ? "#fafafa" : "#18181b",
						"--presentation-muted": theme === "dark" ? "#a1a1aa" : "#71717a",
						"--presentation-card": theme === "dark" ? "#18181b" : "#f4f4f5",
						"--presentation-border": theme === "dark" ? "#27272a" : "#e4e4e7",
						backgroundColor: "var(--presentation-bg)",
						color: "var(--presentation-text)",
					} as React.CSSProperties
				}
			>
				{children}
			</div>
		</ThemeContext.Provider>
	);
}

export function usePresentationTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error(
			"usePresentationTheme must be used within PresentationThemeProvider",
		);
	}
	return context;
}
