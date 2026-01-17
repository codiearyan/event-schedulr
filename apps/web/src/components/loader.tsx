"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function ThreeBallLoader() {
  const ballsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const balls = ballsRef.current;
    if (!balls.length) return;

    // reset
    gsap.set(balls, { opacity: 0, scale: 0.6 });

    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "power2.out" },
    });

    tl.to(balls[0], { opacity: 1, scale: 1, duration: 0.25 })
      .to(balls[1], { opacity: 1, scale: 1, duration: 0.25 }, "+=0.05")
      .to(balls[2], { opacity: 1, scale: 1, duration: 0.25 }, "+=0.05")
      .to(balls, { opacity: 0, scale: 0.6, duration: 0.3 }, "+=0.3");

    
    return () => {
      gsap.killTweensOf(balls);
      tl.kill();
    };
  }, []);

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="flex items-center gap-3">
        {[0, 1, 2].map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) ballsRef.current[i] = el;
            }}
            className="
            h-5 w-5
            rounded-full
            bg-violet-900
          "
          />
        ))}
      </div>
    </div>
  );
}
