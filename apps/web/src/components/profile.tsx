"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
	Bell,
	Eye,
	LogOut,
	Mail,
	Megaphone,
	Settings,
	Shield,
	User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
	const router = useRouter();
	const user = useQuery(api.auth.getCurrentUser);

	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				},
			},
		});
	};

	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-900">
				<motion.div
					className="relative h-10 w-10"
					animate={{ rotate: 360 }}
					transition={{
						duration: 1,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				>
					<div className="absolute inset-0 rounded-full border-4 border-primary/20" />
					<div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent" />
				</motion.div>
			</div>
		);
	}

	return (
		<div className="w-full bg-gray-900">
			<div className="mx-auto w-full max-w-4xl px-4 py-16">
				{/* Header Section */}
				<div className="mb-12 space-y-2">
					<h1 className="text-balance font-bold text-5xl text-white">
						Welcome back, <span className="text-primary">{user.name}</span>
					</h1>
					<p className="text-gray-400 text-lg">
						Manage your account and preferences
					</p>
				</div>

				{/* Main Content Container */}
				<div className="space-y-6 rounded-2xl bg-linear-to-br from-gray-800/40 via-gray-850/40 to-gray-900/30 p-8 shadow-2xl backdrop-blur-md">
					{/* Profile Card */}
					<div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-8">
						{/* Avatar */}
						<div className="shrink-0">
							<div className="flex h-24 w-24 items-center justify-center rounded-full bg-white font-bold text-4xl text-primary-foreground shadow-lg">
								{user.name?.[0]?.toUpperCase()}
							</div>
						</div>
						{/* User Info */}
						<div className="flex-1 space-y-4">
							<div>
								<p className="mb-1 text-gray-400 text-sm">Full Name</p>
								<h2 className="font-semibold text-2xl text-white">
									{user.name}
								</h2>
							</div>
							<div className="flex items-center gap-3 rounded-lg bg-gray-700/30 px-4 py-3">
								<Mail className="h-5 w-5 text-accent" />
								<span className="text-gray-200">{user.email}</span>
							</div>
						</div>
					</div>

					<div className="h-px bg-gray-700/30" />

					{/* Settings Section */}
					<div>
						<h2 className="mb-2 font-semibold text-2xl text-white">
							Account Settings
						</h2>
						<p className="mb-6 text-gray-400 text-sm">
							Configure your account preferences
						</p>

						<div className="space-y-4">
							{/* Email Notifications */}
							<div className="flex items-center justify-between rounded-xl bg-gray-700/20 p-4 transition-all hover:bg-gray-700/30">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-primary/20 p-2">
										<Bell className="h-5 w-5 text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-white">
											Email Notifications
										</h3>
										<p className="text-gray-400 text-sm">
											Receive updates about your events
										</p>
									</div>
								</div>
								<span className="ml-4 whitespace-nowrap text-gray-400">
									Coming soon
								</span>
							</div>

							{/* Two-Factor Authentication */}
							<div className="flex items-center justify-between rounded-xl bg-gray-700/20 p-4 transition-all hover:bg-gray-700/30">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-primary/20 p-2">
										<Shield className="h-5 w-5 text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-white">
											Two-Factor Authentication
										</h3>
										<p className="text-gray-400 text-sm">
											Add an extra layer of security
										</p>
									</div>
								</div>
								<span className="ml-4 whitespace-nowrap text-gray-400">
									Coming soon
								</span>
							</div>
						</div>
					</div>

					<div className="h-px bg-gray-700/30" />

					{/* Danger Zone */}
					<div className="rounded-2xl bg-red-900/20 p-6">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-lg bg-red-500/20 p-2">
								<LogOut className="h-5 w-5 text-red-400" />
							</div>
							<div>
								<h3 className="font-semibold text-lg text-red-400">
									Danger Zone
								</h3>
								<p className="text-gray-400 text-sm">
									Actions here cannot be undone
								</p>
							</div>
						</div>
						<Button
							onClick={handleLogout}
							className="w-full rounded-lg bg-red-600 font-medium text-white hover:bg-red-700"
						>
							<LogOut className="mr-2 h-4 w-4" />
							Sign Out
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
