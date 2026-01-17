"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/all";
import { TextPlugin } from "gsap/TextPlugin";
import Link from "next/link";
import { useRef } from "react";
import PublicHeader from "@/components/public-header";

gsap.registerPlugin(TextPlugin, SplitText);

export default function HomePage() {
	const name = [
		"ARNAB",
		"ARYAN",
		"ALECX",
		"ARJUN",
		"ANURAG",
	];

	type TeamItem = {
		image: string;
		links: string;
	};

	const teamData: TeamItem[] = [
		{
			image: "https://avatars.githubusercontent.com/u/106694416?s=130&v=4",
			links: "https://github.com/Xensen008",
		},
		{
			image: "https://avatars.githubusercontent.com/u/123343302?s=130&v=4",
			links: "https://github.com/codiearyan",
		},
		{
			image: "https://avatars.githubusercontent.com/u/150958558?v=4",
			links: "https://github.com/Alecx2004",
		},
		{
			image: "https://avatars.githubusercontent.com/u/144615229?s=130&v=4",
			links: "https://github.com/Arjun-Bhandari",
		},
		{
			image: "https://avatars.githubusercontent.com/u/172275420?v=4",
			links: "https://github.com/AnuragBaruah47",
		},
	];

	const urls = [
		"Start in 5 Minutes",
		"Create in 300s",
		"Set Up Fast",
		"Instant Setup",
		"Quick Start",
		"Ready in Minutes",
		"Make It Flow",
		"Start the Flow",
		"Enter the Flow",
		"Plan Smarter",
		"Flow Starts Here",
	];

	const urlss = [...urls, ...urls];

	const allText = useRef<HTMLDivElement[]>([]);
	const textRed2 = useRef<SplitText | null>(null);
	const textRef = useRef<SplitText | null>(null);

	const ref1 = useRef<HTMLDivElement | null>(null);
	const herosec = useRef<HTMLDivElement | null>(null);
	const marqueeRef = useRef<HTMLDivElement | null>(null);
	const heroText = useRef<HTMLDivElement | null>(null);
	const herosecFadeRef = useRef<HTMLDivElement | null>(null);

	useGSAP(() => {
		if (ref1.current) {
			textRef.current = SplitText.create(ref1.current, { type: "chars" });
		}

		if (!heroText.current || !marqueeRef.current) return;

		const splitText = SplitText.create(heroText.current, {
			type: "words",
			smartWrap: true,
		});

		const track = marqueeRef.current;
		const { width } = track.getBoundingClientRect();
		const styles = window.getComputedStyle(track);
		const gap = Number.parseInt(styles.gap || "0", 10);
		const halfWidth = -1 * ((width + gap) / 2);

		const tl = gsap.timeline();

		tl.fromTo(
			splitText.words,
			{},
			{
				y: "384px",
				autoAlpha: 1,
				stagger: { each: 0.3 },
			},
		).fromTo(herosecFadeRef.current, { autoAlpha: 0 }, { autoAlpha: 1 });

		gsap.to(track, {
			x: halfWidth,
			repeat: -1,
			duration: 15,
			ease: "none",
		});

		if (herosec.current) {
			gsap.to(herosec.current, {
				backgroundImage: `
          radial-gradient(
            circle at center,
            rgba(0, 255, 255, 0.18) 0%,
            rgba(0, 255, 255, 0.12) 10%,
            rgba(0, 255, 255, 0.06) 30%,
            rgba(0, 0, 0, 0) 50%
          )
        `,
				duration: 3,
				repeat: -1,
				yoyo: true,
				ease: "power2.out",
			});
		}
	});

	const onEnter = (e: React.MouseEvent<HTMLDivElement>) => {
		gsap.to(e.currentTarget, {
			height: 160,
			width: 160,
			duration: 0.5,
			ease: "power4.out",
			filter: "grayscale(0)",
		});

		textRed2.current = SplitText.create(
			allText.current[Number(e.currentTarget.className.split(" ")[0])],
			{
				type: "chars",
			},
		);

		gsap.to(textRed2.current.chars, {
			y: "-384px",
			duration: 0.5,
			stagger: {
				amount: 0.25,
				from: "center",
			},
		});
	};

	const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
		gsap.to(e.currentTarget, {
			height: 80,
			width: 80,
			duration: 0.5,
			ease: "power4.inOut",
			filter: "grayscale(1)",
		});

		const index = Number(e.currentTarget.className[0]);
		const el = allText.current[index];
		if (!el) return;

		textRed2.current = SplitText.create(el, { type: "chars" });

		gsap.to(textRed2.current.chars, {
			y: "384px",
			duration: 0.5,
			stagger: {
				amount: 0.25,
				from: "center",
			},
		});

		textRed2.current = null;
	};

	const onMouseEnter2 = () => {
		if (!textRef.current?.chars) return;

		gsap.to(textRef.current.chars, {
			y: "-200px",
			duration: 0.5,
			stagger: { amount: 0.25, from: "center" },
		});
	};

	const onMouseExit2 = () => {
		if (!textRef.current?.chars) return;

		gsap.to(textRef.current.chars, {
			y: "0",
			duration: 0.5,
			stagger: { amount: 0.25, from: "center" },
		});
	};

	return (
		<main className="eve">
			<PublicHeader />

			<div className="flex h-auto w-full flex-col gap-20">
				<div ref={herosec} className="">
					<div className="flex flex-col gap-10">
						<div className="mt-20 flex w-full justify-center text-white">
							<h1
								ref={heroText}
								className="w-3xl -translate-y-96 text-center font-semibold text-7xl leading-20 tracking-wide"
							>
								Events That Flow, Schedules That Work
							</h1>
						</div>
						<div className="flex flex-col gap-10" ref={herosecFadeRef}>
							<div className="flex w-full justify-center text-white">
								<p className="w-284.5 text-center text-[18px] text-slate-200">
									Easily create, manage, and organize events with a
									mobile-first, intuitive scheduling experience in just minutes.
									Plan meetings, reminders, and timelines effortlessly with
									smooth workflows designed for speed and clarity. No technical
									skills or complex setup required
								</p>
							</div>

							<div className="flex w-full justify-center">
								<div className="w-4xl rounded-xl bg-primary-bright p-1">
									<video
										autoPlay
										loop
										muted
										playsInline
										className="relative z-10 w-4xl rounded-[14px] bg-black object-cover"
										src="https://player.vimeo.com/progressive_redirect/playback/1064689144/rendition/1080p/file.mp4?loc=external&log_user=0&signature=9769e12e649f9faf25294a7405057fbe410fb0ab4ab24a6575ad652b3b11ff57&user_id=101816034"
									/>
								</div>
							</div>

							<div className="flex justify-center">
								<div className="h-auto w-6xl gap-6 overflow-clip p-5 text-white">
									<div
										ref={marqueeRef}
										className="flex shrink-0 items-center justify-center gap-10 whitespace-nowrap"
									>
										{urlss.map((each, index) => {
											return (
												<div key={index} className="font-bold text-3xl">
													{each}
												</div>
											);
										})}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="h-full w-full">
					<div className="flex justify-between">
						<div className="ml-40 flex flex-col gap-5">
							<h1 className="font-bold text-primary">THE TOOLKIT</h1>
							<p className="w-2xl font-semibold text-5xl text-white">
								Everything you need to master your next summit
							</p>
						</div>
					</div>

					<div className="mt-10 flex w-full justify-center gap-15">
						<div className="flex h-115 w-[55%] flex-col gap-5 rounded-xl bg-[#161616] p-5">
							<div className="mx-12 mt-5 flex flex-col gap-2">
								<div className="w-8">
									<svg
										fill=" #22b0b8"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										enableBackground="new 0 0 24 24"
									>
										<g id="SVGRepo_bgCarrier" strokeWidth="0" />
										<g
											id="SVGRepo_tracerCarrier"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<g id="SVGRepo_iconCarrier">
											<path d="M2,19c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3v-8H2V19z M19,4h-2V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v1H9V3c0-0.6-0.4-1-1-1S7,2.4,7,3v1H5C3.3,4,2,5.3,2,7v2h20V7C22,5.3,20.7,4,19,4z" />
										</g>
									</svg>
								</div>
								<h1 className="font-semibold text-3xl text-white">
									Precision Scheduling
								</h1>
								<p className="w-xl text-text-muted text-xl">
									AI-powered event management with smart scheduling, conflict
									resolution, and seamless speaker coordination.
								</p>
							</div>
							<div className="mx-12 mt-4 flex w-max flex-col gap-4 rounded-xl bg-[#1E1E1E] text-white">
								<div className="flex h-12 w-full items-center gap-19 rounded-xl bg-[#232323] px-2">
									Access your dashboard instantly and manage all your events
									from one place
									<div className="text-green-300">Available</div>
								</div>
								<div className="flex h-12 w-full items-center gap-61 rounded-xl bg-[#232323] px-2">
									AI-powered event management with smart scheduling
									<div className="text-green-300">Available</div>
								</div>
								<div className="flex h-12 w-full items-center gap-6 rounded-xl bg-[#232323] px-2">
									Intelligent event coordination with automated scheduling and
									real-time optimization.
									<div className="text-green-300">Available</div>
								</div>
							</div>
						</div>
						<div className="right flex w-[25%] flex-col gap-4 rounded-xl">
							<div className="flex h-full w-full flex-col gap-2 rounded-xl bg-[#161616]">
								<div className="mt-10 ml-10 w-30">
									<svg
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										stroke=""
									>
										<g id="SVGRepo_bgCarrier" strokeWidth="0" />
										<g
											id="SVGRepo_tracerCarrier"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<g id="SVGRepo_iconCarrier">
											<path
												opacity="0.4"
												d="M17.9981 7.16C17.9381 7.15 17.8681 7.15 17.8081 7.16C16.4281 7.11 15.3281 5.98 15.3281 4.58C15.3281 3.15 16.4781 2 17.9081 2C19.3381 2 20.4881 3.16 20.4881 4.58C20.4781 5.98 19.3781 7.11 17.9981 7.16Z"
												stroke="#22b0b8"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												opacity="0.4"
												d="M16.9675 14.4402C18.3375 14.6702 19.8475 14.4302 20.9075 13.7202C22.3175 12.7802 22.3175 11.2402 20.9075 10.3002C19.8375 9.59016 18.3075 9.35016 16.9375 9.59016"
												stroke="#22b0b8"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												opacity="0.4"
												d="M5.96656 7.16C6.02656 7.15 6.09656 7.15 6.15656 7.16C7.53656 7.11 8.63656 5.98 8.63656 4.58C8.63656 3.15 7.48656 2 6.05656 2C4.62656 2 3.47656 3.16 3.47656 4.58C3.48656 5.98 4.58656 7.11 5.96656 7.16Z"
												stroke="#22b0b8"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												opacity="0.4"
												d="M6.9975 14.4402C5.6275 14.6702 4.1175 14.4302 3.0575 13.7202C1.6475 12.7802 1.6475 11.2402 3.0575 10.3002C4.1275 9.59016 5.6575 9.35016 7.0275 9.59016"
												stroke="#22b0b8"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M12.0001 14.6302C11.9401 14.6202 11.8701 14.6202 11.8101 14.6302C10.4301 14.5802 9.33008 13.4502 9.33008 12.0502C9.33008 10.6202 10.4801 9.47021 11.9101 9.47021C13.3401 9.47021 14.4901 10.6302 14.4901 12.0502C14.4801 13.4502 13.3801 14.5902 12.0001 14.6302Z"
												stroke="#22b0b8"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M9.0907 17.7804C7.6807 18.7204 7.6807 20.2603 9.0907 21.2003C10.6907 22.2703 13.3107 22.2703 14.9107 21.2003C16.3207 20.2603 16.3207 18.7204 14.9107 17.7804C13.3207 16.7204 10.6907 16.7204 9.0907 17.7804Z"
												stroke="#22b0b8"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</g>
									</svg>
								</div>
								<h1 className="mt-10 ml-10 font-semibold text-3xl text-white">
									Participant Pulse
								</h1>
								<p className="ml-10 w-xs text-text-muted text-xl">
									Track total attendees in real time, without manual counting
								</p>
								<div className="mt-10 ml-10 w-fit rounded-xl bg-[#232323] px-4 py-2 text-green-300 text-xl">
									Available
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex h-full w-full flex-col items-center gap-10">
					<h1 className="font-semibold text-6xl text-white">
						See It in Action
					</h1>
					<div className="flex gap-10">
						<div className="">
							<video
								autoPlay
								loop
								muted
								playsInline
								className="relative z-10 h-150 w-4xl rounded-[14px] border-4 border-white bg-black object-cover"
								src="https://cdn.discordapp.com/attachments/843057977023004692/1461345732983394420/WhatsApp_Video_2026-01-15_at_18.30.15.mp4?ex=696a37c5&is=6968e645&hm=827e5bb26996f2f1ad51eb9ee6fe0084c4a0ffe330e598942374fbaeebd80197&"
							/>
						</div>
						<div className="">
							<video
								autoPlay
								loop
								muted
								playsInline
								className="relative z-10 h-150 w-70 rounded-[14px] border-4 border-white bg-black object-cover"
								src="https://cdn.discordapp.com/attachments/843057977023004692/1461345732983394420/WhatsApp_Video_2026-01-15_at_18.30.15.mp4?ex=696a37c5&is=6968e645&hm=827e5bb26996f2f1ad51eb9ee6fe0084c4a0ffe330e598942374fbaeebd80197&"
							/>
						</div>
					</div>
				</div>

				<div className="flex w-full flex-col gap-10">
					<div className="flex w-full justify-center">
						<h1 className="font-semibold text-6xl text-white">
							Brains Behind the Scenes
						</h1>
					</div>
					<div className="mt-10 flex h-90 w-full justify-center">
						<div className="flex flex-col items-center gap-12">
							<div
								onMouseEnter={onMouseEnter2}
								onMouseLeave={onMouseExit2}
								className="z-20 flex h-20 w-fit items-center justify-center gap-3"
							>
								{teamData.map((each, index) => (
									<Link
										target="_blank"
										href={each.links}
										key={index}
										className={""}
									>
										<img
											onMouseEnter={onEnter}
											onMouseLeave={onLeave}
											src={each.image}
											alt=""
											className={`${index} img h-20 w-20 cursor-pointer rounded-lg bg-center bg-cover grayscale-100`}
										/>
									</Link>
								))}
							</div>
							<div className="font relative flex h-50 w-7xl items-center justify-center overflow-clip">
								<div
									ref={ref1}
									className="absolute -mt-20 anim2 translate-y-0 whitespace-nowrap font-extrabold text-7xl text-[#0000ff] tracking-wide"
								>
									BEROJGAAR ENGINEERS
								</div>

								{name.map((each, index) => {
									return (
										<div
											ref={(el) => {
												if (el) allText.current[index] = el;
											}}
											className="absolute  translate-y-96 anim border-2 text-7xl text-primary tracking-tighter"
											key={index}
										>
											{each}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
