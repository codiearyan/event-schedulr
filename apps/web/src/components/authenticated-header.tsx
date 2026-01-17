"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Megaphone, BarChart3 } from "lucide-react";
import UserMenu from "./user-menu";

const navItems = [
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Announcements", href: "/announcements", icon: Megaphone },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const rightNavItems = [
  {
    id: "create-event",
    type: "button",
    label: "Create Event",
    href: "/create-event",
  },
  {
    id: "avatar",
    type: "avatar",
    initials: "JD",
    action: "profile",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <nav className="flex h-14 items-center justify-around px-6">
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors
                  ${isActive ? "text-white" : "text-white/40 hover:text-white"}
                `}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          {rightNavItems.map((item) => {
            if (item.type === "text") {
              return (
                <span key={item.id} className="text-sm text-white/40">
                  {item.label}
                </span>
              );
            }

            if (item.type === "button") {
              const isActive =
                pathname === item.href || pathname.startsWith(`/create-event`);
              return (
                <Link
                  key={item.href}
                  href={item.href || "/create-event"}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors
                  ${isActive ? "text-white" : "text-white/40 hover:text-white"}
                `}
                >
                  {item.label}
                </Link>
              );
            }

            if (item.type === "avatar") {
              return <UserMenu />;
            }

            return null;
          })}
        </div>
      </nav>
    </header>
  );
}
