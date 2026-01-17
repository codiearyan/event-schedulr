import { motion } from "framer-motion";

interface WelcomeMessageProps {
	mode: "signin" | "signup";
}

const container = {
	hidden: {},
	show: {
		transition: {
			staggerChildren: 0.12,
		},
	},
};

const item = {
	hidden: { opacity: 0, y: 14 },
	show: { opacity: 1, y: 0 },
};

export default function WelcomeMessage({ mode }: WelcomeMessageProps) {
	const isSignUp = mode === "signup";

	return (
		<motion.div
			key={mode}
			variants={container}
			initial="hidden"
			animate="show"
			className="max-w-md space-y-10 text-left text-white"
		>
			{/* Logo / Icon */}
			<motion.div variants={item} className="flex items-center space-x-4">
				<div className="flex h-20 w-20 items-center justify-center rounded-xl bg-transparent backdrop-blur">
					<img
						className="absolute top-0 h-15"
						src="https://cdn.discordapp.com/attachments/843057977023004692/1461325669769150736/WhatsApp_Image_2026-01-15_at_16.47.20-removebg-preview_1_-_Edited_1.png?ex=696a2515&is=6968d395&hm=7069116d20d5579ab03b1b6893cf39b95a3d8bb5e0ef470545755aabf7d79462&"
						alt="logo"
					/>
				</div>
				<span className="font-semibold text-xl tracking-wide">
					EventSchedulr
				</span>
			</motion.div>

			{/* Heading */}
			<motion.div variants={item} className="space-y-4">
				<h1 className="font-bold text-4xl leading-tight lg:text-5xl">
					{isSignUp ? "Plan Events Without Chaos" : "Welcome Back, Organizer"}
				</h1>
				<p className="text-blue-100 text-lg">
					{isSignUp
						? "Create, schedule, and manage events with clarity and confidence."
						: "Pick up where you left off and keep your events running smoothly."}
				</p>
			</motion.div>

			{/* Feature list */}
			<motion.div variants={container} className="space-y-5">
				{(isSignUp
					? [
							[
								"Smart Scheduling",
								"Avoid conflicts with intelligent timelines",
							],
							["Attendee Management", "Track guests, RSVPs, and check-ins"],
							["Real-Time Updates", "Instant changes across all devices"],
						]
					: [
							["Upcoming Events", "View schedules at a glance"],
							["Live Adjustments", "Edit agendas in real time"],
							["Team Coordination", "Collaborate with staff & speakers"],
						]
				).map(([title, desc]) => (
					<motion.div
						key={title}
						variants={item}
						className="flex items-start space-x-4"
					>
						<span className="mt-1 text-xl">✔</span>
						<div>
							<h3 className="font-semibold">{title}</h3>
							<p className="text-blue-100 text-sm">{desc}</p>
						</div>
					</motion.div>
				))}
			</motion.div>

			{/* Social proof / trust */}
			<motion.div
				variants={item}
				className="border-white/20 border-t pt-6 text-blue-100 text-sm"
			>
				Trusted by event organizers, conferences, and communities worldwide
			</motion.div>
		</motion.div>
	);
}
