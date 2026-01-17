import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, Calendar, Megaphone, Plus } from "lucide-react";

import UserMenu from "@/components/user-menu";

export default function AuthenticatedHeader() {
  const location = useLocation();

  const navItems = [
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Create Event", href: "/create-event", icon: Plus },
    { label: "Announcements", href: "/announcements", icon: Megaphone },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-linear-to-b from-[#0b0f1a] via-[#0a0d14] to-[#06080f]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.15),transparent_40%)]" />
      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-4 flex items-center justify-between border-b border-white/10">
        <Link to="/events" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="https://cdn.discordapp.com/attachments/843057977023004692/1461325669769150736/WhatsApp_Image_2026-01-15_at_16.47.20-removebg-preview_1_-_Edited_1.png?ex=696a2515&is=6968d395&hm=7069116d20d5579ab03b1b6893cf39b95a3d8bb5e0ef470545755aabf7d79462&"
              alt="EventSchedulr"
              className="h-10 w-auto relative z-10"
            />
            <span className="absolute -inset-2 rounded-xl bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-white font-semibold tracking-wide">
            EventSchedulr
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = location.pathname === href;
            return (
              <Link
                key={label}
                to={href}
                className="relative px-4 py-2 rounded-lg"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 bg-white/10 rounded-lg"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <span
                  className={`relative flex items-center gap-2 text-sm font-medium transition-colors ${
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
