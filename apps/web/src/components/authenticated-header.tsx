"use client";

import { BarChart3, Bell, Calendar, Megaphone, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UserMenu from "./user-menu";

const navItems = [
	{ label: "Events", href: "/events", icon: Calendar },
	{ label: "Announcements", href: "/announcements", icon: Megaphone },
	{ label: "Analytics", href: "/analytics", icon: BarChart3 },
];

function CurrentTime() {
	const [time, setTime] = useState<string>("");

	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			const timeStr = now.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			});
			const offset = -now.getTimezoneOffset();
			const hours = Math.floor(Math.abs(offset) / 60);
			const minutes = Math.abs(offset) % 60;
			const sign = offset >= 0 ? "+" : "-";
			const gmtStr = `GMT${sign}${hours}${minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : ""}`;
			setTime(`${timeStr} ${gmtStr}`);
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, []);

	return <span className="text-sm text-white/60">{time}</span>;
}

export default function Navbar() {
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-50 w-full bg-transparent">
			<nav className="relative flex h-14 items-center justify-center px-6">
				<Link href="/events" className="absolute left-6">
					<img
						src="https://cdn.discordapp.com/attachments/843057977023004692/1461325669769150736/WhatsApp_Image_2026-01-15_at_16.47.20-removebg-preview_1_-_Edited_1.png?ex=696a2515&is=6968d395&hm=7069116d20d5579ab03b1b6893cf39b95a3d8bb5e0ef470545755aabf7d79462&"
						alt="EventSchedulr"
						className="h-6 w-auto brightness-75 grayscale"
						width={24}
						height={24}
					/>
				</Link>

				<div className="flex items-center gap-6">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href || pathname.startsWith(`${item.href}/`);

						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-2 font-medium text-sm transition-colors ${isActive ? "text-white" : "text-white/40 hover:text-white"}`}
							>
								<item.icon size={18} />
								{item.label}
							</Link>
						);
					})}
				</div>

				<div className="absolute right-6 flex items-center gap-5">
					<CurrentTime />
					<Link
						href="/create-event"
						className={`font-medium text-sm transition-colors ${
							pathname === "/create-event" ||
							pathname.startsWith("/create-event")
								? "text-white"
								: "text-white/60 hover:text-white"
						}`}
					>
						Create Event
					</Link>
					<button
						type="button"
						className="text-white/60 transition-colors hover:text-white"
						aria-label="Search"
					>
						<Search size={18} />
					</button>
					<button
						type="button"
						className="text-white/60 transition-colors hover:text-white"
						aria-label="Notifications"
					>
						<Bell size={18} />
					</button>
					<UserMenu />
				</div>
			</nav>
		</header>
	);
}
