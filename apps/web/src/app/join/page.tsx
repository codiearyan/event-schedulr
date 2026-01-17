"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Status = "loading" | "redirecting" | "fallback" | "error";

function JoinContent() {
	const searchParams = useSearchParams();
	const code = searchParams.get("code");
	const [status, setStatus] = useState<Status>("loading");

	useEffect(() => {
		if (!code) {
			setStatus("error");
			return;
		}

		const userAgent = navigator.userAgent.toLowerCase();
		const isIOS = /iphone|ipad|ipod/.test(userAgent);
		const isAndroid = /android/.test(userAgent);
		const isMobile = isIOS || isAndroid;

		if (!isMobile) {
			setStatus("fallback");
			return;
		}

		const deepLink = `eventschedulr://join?code=${code}`;
		const startTime = Date.now();

		window.location.href = deepLink;
		setStatus("redirecting");

		const timeoutId = setTimeout(() => {
			if (document.hidden) return;

			const fallbackUrl =
				process.env.NEXT_PUBLIC_EXPO_DEV_URL ||
				(isIOS
					? "https://apps.apple.com/app/eventschedulr/id123456"
					: "https://play.google.com/store/apps/details?id=com.eventschedulr.app");

			window.location.href = fallbackUrl;
		}, 1500);

		const handleVisibilityChange = () => {
			if (document.hidden && Date.now() - startTime < 2000) {
				clearTimeout(timeoutId);
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [code]);

	if (status === "error") {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-bg-main p-6 text-center">
				<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
					<svg
						className="h-10 w-10 text-red-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>
				<h1 className="mb-2 font-bold text-2xl text-foreground">
					Invalid Link
				</h1>
				<p className="text-muted-foreground">
					This join link appears to be invalid or expired.
				</p>
			</div>
		);
	}

	if (status === "fallback") {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-bg-main p-6 text-center">
				<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
					<svg
						className="h-10 w-10 text-primary"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<h1 className="mb-2 font-bold text-2xl text-foreground">
					Open on Mobile
				</h1>
				<p className="mb-6 max-w-md text-muted-foreground">
					Scan this QR code with your phone camera to join the event using the
					EventSchedulr app.
				</p>
				<div className="rounded-xl border bg-card p-4">
					<p className="text-muted-foreground text-sm">
						Access Code:{" "}
						<span className="font-bold font-mono text-foreground">{code}</span>
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-bg-main p-6 text-center">
			<div className="mb-6 flex h-20 w-20 items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
			<h1 className="mb-2 font-bold text-2xl text-foreground">
				Opening EventSchedulr...
			</h1>
			<p className="text-muted-foreground">
				{status === "redirecting"
					? "If the app doesn't open, you'll be redirected to download it."
					: "Please wait..."}
			</p>
		</div>
	);
}

export default function JoinPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen flex-col items-center justify-center bg-bg-main p-6 text-center">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			}
		>
			<JoinContent />
		</Suspense>
	);
}
