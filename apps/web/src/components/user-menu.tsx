"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function UserMenu() {
	const user = useQuery(api.auth.getCurrentUser);

	if (!user) return null;

	return (
		<DropdownMenu>
			{/* Trigger */}
			<DropdownMenuTrigger>
				<Button
					variant="ghost"
					className="flex cursor-pointer items-center gap-2 rounded-full duration-200"
				>
					{/* Avatar */}
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-indigo-600 font-semibold text-sm text-white transition-all duration-100 ease-in-out hover:from-primary-dark hover:to-primary-bright active:scale-95">
						{user.name?.[0]?.toUpperCase()}
					</div>
				</Button>
			</DropdownMenuTrigger>

			{/* Menu */}
			<DropdownMenuContent
				align="end"
				className="w-64 rounded-xl border border-white/10 bg-[#0b0f1a]/95 shadow-xl backdrop-blur-xl"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className="text-white/50 text-xs">
						My Account
					</DropdownMenuLabel>

					{/* User info */}
					<div className="px-2 py-2">
						<div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary to-indigo-600 font-semibold text-sm text-white">
								{user.name?.[0]?.toUpperCase()}
							</div>
							<div className="min-w-0">
								<p className="truncate font-medium text-sm text-white">
									{user.name}
								</p>
								<p className="truncate text-white/50 text-xs">{user.email}</p>
							</div>
						</div>
					</div>

					<DropdownMenuSeparator className="bg-white/10" />

					{/* Profile */}
					<Link href="/profile">
						<DropdownMenuItem className="cursor-pointer gap-2 text-white/80 focus:bg-white/10 focus:text-white">
							<User className="h-4 w-4" />
							Profile
						</DropdownMenuItem>
					</Link>

					<DropdownMenuSeparator className="bg-white/10" />

					{/* Sign out */}
					<DropdownMenuItem
						className="cursor-pointer gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400"
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										location.reload();
									},
								},
							});
						}}
					>
						<LogOut className="h-4 w-4" />
						Sign out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
