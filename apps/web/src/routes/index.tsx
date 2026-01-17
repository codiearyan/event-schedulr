import { createFileRoute } from "@tanstack/react-router";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { useRef } from "react";
import { SplitText } from "gsap/all";

gsap.registerPlugin(TextPlugin);
gsap.registerPlugin(SplitText);

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
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
  const herosec = useRef<HTMLDivElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const heroText = useRef<HTMLDivElement | null>(null);
  const herosecFadeRef = useRef<HTMLDivElement | null>(null);
  useGSAP(() => {
    const tl = gsap.timeline();
    const splitText = SplitText.create(heroText.current, {
      type: "words",
      smartWrap: true,
    });
    const track = marqueeRef.current;

    if (!track) return;

    const { width } = track.getBoundingClientRect();

    const styles = window.getComputedStyle(track);
    const gap = parseInt(styles.gap || "0", 10);

    const halfWidth: number = -1 * ((width + gap) / 2);

    tl.fromTo(
      splitText.words,
      {},
      {
        y: "384px",
        autoAlpha: 1,
        stagger: {
          each: 0.3,
        },
      }
    ).fromTo(
      herosecFadeRef.current,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
        y: "0",
      }
    );

    gsap.to(marqueeRef.current, {
      x: halfWidth,
      repeat: -1,
      duration: 15,
      ease: "none",
    });

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
  });
  return (
    <div className="bg-bg-main h-auto w-full">
      <div ref={herosec} className="h-full flex flex-col gap-20 back">
        <div className="flex flex-col gap-10">
          <div className="text-white flex overflow-clip justify-center mt-20 w-full">
            <h1
              ref={heroText}
              className="text-7xl -translate-y-96 w-3xl leading-20 tracking-wide text-center font-semibold"
            >
              Events That Flow, Schedules That Work
            </h1>
          </div>
          <div
            className="flex flex-col translate-y-20 gap-5"
            ref={herosecFadeRef}
          >
            <div className="w-full text-white flex justify-center">
              <p className="text-[18px] text-slate-200 w-284.5 text-center">
                Easily create, manage, and organize events with a mobile-first,
                intuitive scheduling experience in just minutes. Plan meetings,
                reminders, and timelines effortlessly with smooth workflows
                designed for speed and clarity. No technical skills or complex
                setup required
              </p>
            </div>

            <div className="w-full flex justify-center">
              <div className="p-1 bg-primary-bright rounded-xl">
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
                  {urlss.map((each) => {
                    return (
                      <div key={each} className="font-bold text-3xl">
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
        <div></div>
        <div className="flex flex-col gap-5">
          <h1 className="font-bold text-primary ml-20">THE TOOLKIT</h1>
          <p className="text-5xl font-semibold ml-20 text-white w-2xl">
            Everything you need to master your next summit
          </p>
        </div>
      </div>
    </div>
  );
}
