"use client";

import { motion } from "framer-motion";
import { BarChart3, Calendar, Megaphone, Plus, Radio } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import UserMenu from "@/components/user-menu";

export default function AuthenticatedHeader() {
	const pathname = usePathname();

	const navItems = [
		{ label: "Events", href: "/events", icon: Calendar },
		{ label: "Create Event", href: "/create-event", icon: Plus },
		{ label: "Activities", href: "/activities", icon: Radio },
		{ label: "Announcements", href: "/announcements", icon: Megaphone },
		{ label: "Analytics", href: "/analytics", icon: BarChart3 },
	];

	return (
		<header className="sticky top-0 z-50">
			<div className="absolute inset-0 bg-linear-to-b from-[#0b0f1a] via-[#0a0d14] to-[#06080f]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.15),transparent_40%)]" />
			<div className="absolute inset-0 backdrop-blur-xl" />

			<div className="relative mx-auto flex max-w-7xl items-center justify-between border-white/10 border-b px-6 py-4">
				<Link href="/events" className="group flex items-center gap-3">
					<div className="relative">
						<img
							src="https://cdn.discordapp.com/attachments/843057977023004692/1461325669769150736/WhatsApp_Image_2026-01-15_at_16.47.20-removebg-preview_1_-_Edited_1.png?ex=696a2515&is=6968d395&hm=7069116d20d5579ab03b1b6893cf39b95a3d8bb5e0ef470545755aabf7d79462&"
							alt="EventSchedulr"
							className="relative z-10 h-10 w-auto"
						/>
						<span className="absolute -inset-2 rounded-xl bg-primary/30 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
					</div>
					<span className="font-semibold text-white tracking-wide">
						EventSchedulr
					</span>
				</Link>

				<nav className="hidden items-center gap-2 md:flex">
					{navItems.map(({ label, href, icon: Icon }) => {
						const isActive = pathname === href;
						return (
							<Link
								key={label}
								href={href}
								className="relative rounded-lg px-4 py-2"
							>
								{isActive && (
									<motion.div
										layoutId="activeNavBg"
										className="absolute inset-0 rounded-lg bg-white/10"
										transition={{ type: "spring", duration: 0.5 }}
									/>
								)}
								<span
									className={`relative flex items-center gap-2 font-medium text-sm transition-colors ${
										isActive ? "text-white" : "text-white/70 hover:text-white"
									}`}
								>
									<Icon className="h-4 w-4" />
									{label}
								</span>
							</Link>
						);
					})}
				</nav>

				<div className="flex items-center gap-4">
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
