"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function SpinnerLoader(){
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    gsap.to(el, {
      rotate: 360,
      duration: 1.2,
      ease: "linear",
      repeat: -1,
    });

    gsap.to(el, {
      duration: 2.4,
      repeat: -1,
      ease: "none",
      keyframes: [
        {
          backgroundColor: "#7C3AED",
          boxShadow: "0 0 28px rgba(124,58,237,0.6)",
        },
        {
          backgroundColor: "#2563EB",
          boxShadow: "0 0 28px rgba(37,99,235,0.6)",
        },
        {
          backgroundColor: "#06B6D4",
          boxShadow: "0 0 28px rgba(6,182,212,0.6)",
        },
        {
          backgroundColor: "#7C3AED",
          boxShadow: "0 0 28px rgba(124,58,237,0.6)",
        },
      ],
    });

    return () => {
      gsap.killTweensOf(el);
    };
  }, []);

  return (
	<div className="h-screen w-full flex justify-center items-center eve">
    <div className="flex items-center justify-center">
      <div
        ref={loaderRef}
        className="h-14 w-14 rounded-full bg-violet-600"
      />
    </div>
	</div>

  );
}
