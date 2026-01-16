"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { useRef } from "react";
import { SplitText } from "gsap/all";
import PublicHeader from "@/components/public-header";

gsap.registerPlugin(TextPlugin, SplitText);

export default function HomePage() {
  const name = [
    "Arnab JK (@xensen008)",
    "Aryan Bhati (@codiearyan)",
    "Alecx Singh (@Aleck2004)",
    "Arjun Bhandari (@ArjunBhandari)",
    "Anurag Baruah (@AnuragBaruah47)",
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
    const gap = parseInt(styles.gap || "0", 10);
    const halfWidth = -1 * ((width + gap) / 2);

    const tl = gsap.timeline();

    tl.fromTo(
      splitText.words,
      {},
      {
        y: "384px",
        autoAlpha: 1,
        stagger: { each: 0.3 },
      }
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
      }
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
    <main>
      <PublicHeader />

      <div className="bg-bg-main flex flex-col gap-20 h-auto w-full">
        <div ref={herosec} className="">
          <div className="flex flex-col gap-10">
            <div className="text-white flex justify-center mt-20 w-full">
              <h1
                ref={heroText}
                className="text-7xl -translate-y-96 w-3xl leading-20 tracking-wide text-center font-semibold"
              >
                Events That Flow, Schedules That Work
              </h1>
            </div>
            <div className="flex flex-col gap-10" ref={herosecFadeRef}>
              <div className="w-full text-white flex justify-center">
                <p className="text-[18px] text-slate-200 w-284.5 text-center">
                  Easily create, manage, and organize events with a
                  mobile-first, intuitive scheduling experience in just minutes.
                  Plan meetings, reminders, and timelines effortlessly with
                  smooth workflows designed for speed and clarity. No technical
                  skills or complex setup required
                </p>
              </div>

              <div className="w-full flex justify-center">
                <div className="p-1 w-4xl bg-primary-bright rounded-xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative w-4xl z-10  rounded-[14px] bg-black object-cover"
                    src="https://player.vimeo.com/progressive_redirect/playback/1064689144/rendition/1080p/file.mp4?loc=external&log_user=0&signature=9769e12e649f9faf25294a7405057fbe410fb0ab4ab24a6575ad652b3b11ff57&user_id=101816034"
                  ></video>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="h-auto w-6xl gap-6 p-5 text-white  overflow-clip">
                  <div
                    ref={marqueeRef}
                    className="flex justify-center whitespace-nowrap items-center gap-10 shrink-0 "
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

        <div className="w-full h-full bg-bg-main">
          <div className="flex justify-between">
            <div className="flex flex-col gap-5  ml-40">
              <h1 className="font-bold text-primary">THE TOOLKIT</h1>
              <p className="text-5xl font-semibold text-white w-2xl">
                Everything you need to master your next summit
              </p>
            </div>
          </div>

          <div className="flex mt-10 w-full gap-15 justify-center">
            <div className=" bg-[#161616] flex flex-col gap-10 h-auto p-5 rounded-xl w-[55%]">
              <div className="mx-12 mt-5 flex flex-col gap-2">
                <div className="w-8">
                  <svg
                    fill=" #22b0b8"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    enableBackground="new 0 0 24 24"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path d="M2,19c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3v-8H2V19z M19,4h-2V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v1H9V3c0-0.6-0.4-1-1-1S7,2.4,7,3v1H5C3.3,4,2,5.3,2,7v2h20V7C22,5.3,20.7,4,19,4z"></path>
                    </g>
                  </svg>
                </div>
                <h1 className="font-semibold text-3xl text-white">
                  Precision Scheduling
                </h1>
                <p className="text-xl text-text-muted w-xl">
                  AI-powered event management with smart scheduling, conflict
                  resolution, and seamless speaker coordination.
                </p>
              </div>
              <div className="flex flex-col text-white bg-[#1E1E1E] w-max rounded-xl gap-4 mx-12 mt-4">
                <div className="bg-[#232323] gap-19 flex px-2 items-center w-full h-12 rounded-xl">
                  Access your dashboard instantly and manage all your events
                  from one place
                  <div className="text-green-300">Available</div>
                </div>
                <div className="bg-[#232323] gap-61 flex px-2 items-center w-full h-12 rounded-xl">
                  AI-powered event management with smart scheduling
                  <div className="text-green-300">Available</div>
                </div>
                <div className="bg-[#232323] flex gap-6 px-2 items-center w-full h-12 rounded-xl">
                  Intelligent event coordination with automated scheduling and
                  real-time optimization.
                  <div className="text-green-300">Available</div>
                </div>
              </div>
            </div>
            <div className="right flex flex-col gap-4 rounded-xl w-[25%]">
              <div className="w-full flex flex-col gap-2 bg-[#161616] rounded-xl h-full">
                <div className="w-30 ml-10 mt-10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke=""
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        opacity="0.4"
                        d="M17.9981 7.16C17.9381 7.15 17.8681 7.15 17.8081 7.16C16.4281 7.11 15.3281 5.98 15.3281 4.58C15.3281 3.15 16.4781 2 17.9081 2C19.3381 2 20.4881 3.16 20.4881 4.58C20.4781 5.98 19.3781 7.11 17.9981 7.16Z"
                        stroke="#22b0b8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        opacity="0.4"
                        d="M16.9675 14.4402C18.3375 14.6702 19.8475 14.4302 20.9075 13.7202C22.3175 12.7802 22.3175 11.2402 20.9075 10.3002C19.8375 9.59016 18.3075 9.35016 16.9375 9.59016"
                        stroke="#22b0b8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        opacity="0.4"
                        d="M5.96656 7.16C6.02656 7.15 6.09656 7.15 6.15656 7.16C7.53656 7.11 8.63656 5.98 8.63656 4.58C8.63656 3.15 7.48656 2 6.05656 2C4.62656 2 3.47656 3.16 3.47656 4.58C3.48656 5.98 4.58656 7.11 5.96656 7.16Z"
                        stroke="#22b0b8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        opacity="0.4"
                        d="M6.9975 14.4402C5.6275 14.6702 4.1175 14.4302 3.0575 13.7202C1.6475 12.7802 1.6475 11.2402 3.0575 10.3002C4.1275 9.59016 5.6575 9.35016 7.0275 9.59016"
                        stroke="#22b0b8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        d="M12.0001 14.6302C11.9401 14.6202 11.8701 14.6202 11.8101 14.6302C10.4301 14.5802 9.33008 13.4502 9.33008 12.0502C9.33008 10.6202 10.4801 9.47021 11.9101 9.47021C13.3401 9.47021 14.4901 10.6302 14.4901 12.0502C14.4801 13.4502 13.3801 14.5902 12.0001 14.6302Z"
                        stroke="#22b0b8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        d="M9.0907 17.7804C7.6807 18.7204 7.6807 20.2603 9.0907 21.2003C10.6907 22.2703 13.3107 22.2703 14.9107 21.2003C16.3207 20.2603 16.3207 18.7204 14.9107 17.7804C13.3207 16.7204 10.6907 16.7204 9.0907 17.7804Z"
                        stroke="#22b0b8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </g>
                  </svg>
                </div>
                <h1 className="font-semibold ml-10 mt-10 text-3xl text-white">
                  Participant Pulse
                </h1>
                <p className="text-xl text-text-muted ml-10 w-xs">
                  Track total attendees in real time, without manual counting
                </p>
                <div className="text-green-300 ml-10 mt-10 text-xl bg-[#232323] w-fit px-4 py-2 rounded-xl">
                  Available
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-10 items-center h-full bg-bg-main">
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
                className="border-4 border-white relative w-4xl h-150 z-10  rounded-[14px] bg-black object-cover"
                src="https://cdn.discordapp.com/attachments/843057977023004692/1461345732983394420/WhatsApp_Video_2026-01-15_at_18.30.15.mp4?ex=696a37c5&is=6968e645&hm=827e5bb26996f2f1ad51eb9ee6fe0084c4a0ffe330e598942374fbaeebd80197&"
              ></video>
            </div>
            <div className="">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="border-white border-4 relative w-70 h-150 z-10  rounded-[14px] bg-black object-cover"
                src="https://cdn.discordapp.com/attachments/843057977023004692/1461345732983394420/WhatsApp_Video_2026-01-15_at_18.30.15.mp4?ex=696a37c5&is=6968e645&hm=827e5bb26996f2f1ad51eb9ee6fe0084c4a0ffe330e598942374fbaeebd80197&"
              ></video>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col  gap-10 bg-bg-main">
          <div className="w-full flex justify-center">
            <h1 className="font-semibold text-6xl text-white">
              Brains Behind the Scenes
            </h1>
          </div>
          <div className="w-full mt-10 h-90 flex justify-center">
            <div className="flex flex-col items-center gap-12">
              <div
                onMouseEnter={onMouseEnter2}
                onMouseLeave={onMouseExit2}
                className="flex
         h-20 w-fit justify-center z-20 items-center gap-3"
              >
                {teamData.map((each, index) => (
                  <Link
                    target="_blank"
                    href={each.links}
                    key={index}
                    className={``}
                  >
                    <img
                      onMouseEnter={onEnter}
                      onMouseLeave={onLeave}
                      src={each.image}
                      alt=""
                      className={`${index} bg-cover img grayscale-100 h-20 w-20 bg-center cursor-pointer rounded-lg`}
                    />
                  </Link>
                ))}
              </div>
              <div className=" h-50 relative overflow-clip flex justify-center items-center font w-7xl">
                <div
                  ref={ref1}
                  className="font-extrabold -mt-20 tracking-wide translate-y-0 whitespace-nowrap absolute text-white text-7xl"
                >
                  Berozgaar_Engineers
                </div>

                {name.map((each, index) => {
                  return (
                    <div
                      ref={(el) => {
                        if (el) allText.current[index] = el;
                      }}
                      className="font-extrabold -mt-20 text-primary border-2 translate-y-96 tracking-tighter absolute text-7xl"
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
