"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { GoogleIcon } from "@/lib/icons";

export default function GoogleSignIn({ label }: { label: string }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleGoogleSignIn = async () => {
		if (loading) return;

		setLoading(true);

		await authClient.signIn.social(
			{
				provider: "google",
				callbackURL: "/events",
			},
			{
				onSuccess: () => {
					toast.success("Signed in successfully");
					router.push("/events");
				},
				onError: (error) => {
					console.error(error);
					toast.error(error.error.message || error.error.statusText);
					setLoading(false);
				},
			},
		);
	};

	return (
		<Button
			onClick={handleGoogleSignIn}
			disabled={loading}
			className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#6366f1] text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{loading ? (
				<>
					<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
					<span>Signing in...</span>
				</>
			) : (
				<>
					<GoogleIcon />
					<span>{label}</span>
				</>
			)}
		</Button>
	);
}
