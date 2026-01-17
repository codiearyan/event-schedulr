"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { LogOut, Mail, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
			<div className="min-h-screen w-full bg-bg-main text-white">
				<div className="mx-auto w-full max-w-2xl py-10">
					<Card>
						<CardContent className="py-10 text-center">
							<p className="text-muted-foreground">Loading profile...</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full bg-bg-main text-white">
			<div className="mx-auto w-full max-w-2xl space-y-6 py-10">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<User className="h-5 w-5" />
							<CardTitle>Profile</CardTitle>
						</div>
						<CardDescription>
							Manage your account settings and preferences
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-6">
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-primary to-indigo-600 font-bold text-3xl text-white">
								{user.name?.[0]?.toUpperCase()}
							</div>
							<div className="space-y-1">
								<h2 className="font-semibold text-2xl">{user.name}</h2>
								<div className="flex items-center gap-2 text-muted-foreground">
									<Mail className="h-4 w-4" />
									<span>{user.email}</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							<CardTitle>Account Settings</CardTitle>
						</div>
						<CardDescription>
							Configure your account preferences
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between rounded-lg border border-white/10 p-4">
							<div>
								<p className="font-medium">Email Notifications</p>
								<p className="text-muted-foreground text-sm">
									Receive updates about your events
								</p>
							</div>
							<span className="text-muted-foreground text-sm">Coming soon</span>
						</div>

						<div className="flex items-center justify-between rounded-lg border border-white/10 p-4">
							<div>
								<p className="font-medium">Two-Factor Authentication</p>
								<p className="text-muted-foreground text-sm">
									Add an extra layer of security
								</p>
							</div>
							<span className="text-muted-foreground text-sm">Coming soon</span>
						</div>
					</CardContent>
				</Card>

				<Separator className="bg-white/10" />

				<Card className="border-red-500/20">
					<CardHeader>
						<CardTitle className="text-red-400">Danger Zone</CardTitle>
						<CardDescription>Actions here cannot be undone</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="destructive"
							onClick={handleLogout}
							className="w-full"
						>
							<LogOut className="mr-2 h-4 w-4" />
							Sign Out
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
