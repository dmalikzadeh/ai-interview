"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { MotionPathHelper } from "gsap/MotionPathHelper";
import BackgroundBlob from "./BackgroundBlob";
import { playSound } from "@/lib/sound";
gsap.registerPlugin(
  SplitText,
  CustomEase,
  DrawSVGPlugin,
  MotionPathPlugin,
  MotionPathHelper
);

export default function LandingIntro() {
  const [hidden] = useState(false);

  useEffect(() => {
    playSound("/sounds/magic.mp3", 0.1);

    const split = new SplitText("#li-logo", {
      type: "chars",
    });
    const taglineSplit = new SplitText("#li-tagline", { type: "chars" });

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
    });

    gsap.set(".invisible-before-anim", { visibility: "visible" });
    gsap.set(split.chars, {
      opacity: 0,
      y: 40,
      filter: "blur(8px)",
      scale: 0.9,
    });

    gsap.set([".mp"], { opacity: 0 });

    tl.to(split.chars, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      duration: 1.2,
      ease: "expo.out",
      stagger: {
        each: 0.045,
        from: "center",
      },
    });

    tl.from(
      "#li-tagline",
      {
        opacity: 0,
        filter: "blur(8px)",
        duration: 0.5,
        ease: "power2.out",
      },
      "-=1.2"
    );

    tl.to(
      "#li-tagline",
      {
        filter: "blur(0px)",
        duration: 0.2,
        ease: "power2.out",
      },
      "-=0.6"
    );

    tl.to("#svg-stage", { opacity: 1, duration: 0.3 }, "-=1.6");

    // Animate the swoosh trail: draw forward, then fade out after the head passes
    tl.fromTo(
      ".mp",
      {
        drawSVG: "0% 0%",
        opacity: 1,
        filter:
          "drop-shadow(0 0 3px #d8b4fe) drop-shadow(0 0 6px #f3e8ff) blur(1.1px)",
      },
      {
        duration: 1.1,
        drawSVG: "0% 100%",
        ease: "slow(0.7, 0.9, false)",
        filter:
          "drop-shadow(0 0 6px #eecbff) drop-shadow(0 0 10px #f9a8d4) blur(1.3px)",
        strokeLinecap: "round",
      },
      1.05
    ).to(
      ".mp",
      {
        drawSVG: "80% 100%",
        duration: 1.05,
        ease: "power2.out",
        opacity: 0,
      },
      1.65
    );

    tl.to(
      [split.chars, taglineSplit.chars],
      {
        opacity: 0,
        x: () => gsap.utils.random(-80, 80),
        y: () => gsap.utils.random(-60, 60),
        rotation: () => gsap.utils.random(-45, 45),
        filter: "blur(8px)",
        duration: 0.4,
        ease: "power3.in",
        stagger: {
          each: 0.015,
          from: "center",
        },
      },
      "+=0.1"
    );

    tl.to(
      "#svg-stage",
      {
        opacity: 0,
        duration: 0.4,
        ease: "power1.out",
      },
      "-=0.2"
    );

    tl.to(
      "#li-wrapper",
      {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
          const wrapper = document.getElementById("li-wrapper");
          if (wrapper && wrapper.parentElement) {
            wrapper.parentElement.removeChild(wrapper);
          }
        },
      },
      "-=0.3"
    );

    return () => {
      tl.kill();
      split.revert();
      taglineSplit.revert();
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      id="li-wrapper"
      className="fixed inset-0 z-50 flex flex-col gap-4 items-center justify-center gradient-bg select-none"
    >
      <BackgroundBlob />

      <h1
        id="li-logo"
        className="invisible-before-anim logo text-6xl tracking-tight text-indigo-950 dark:text-white z-10"
      >
        InterviewBot
      </h1>

      <p
        id="li-tagline"
        className="text-center invisible-before-anim text-md font-normal tracking-wide leading-snug text-indigo-950/40 dark:text-white/40 z-10"
      >
        Your personal&nbsp;AI interview&nbsp;coach.
      </p>
      <svg
        id="svg-stage"
        className="absolute left-[50%] top-[10%] -translate-x-1/2 w-full z-0 mix-blend-soft-light"
        viewBox="-40 -180 1250 1100"
      >
        <defs>
          <linearGradient id="trail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e9d8ff" stopOpacity="0.1" />
            <stop offset="45%" stopColor="#d8b4fe" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#f0abfc" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#f5d0fe" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path
          className="mp magic-glow"
          fill="none"
          stroke="url(#trail-grad)"
          strokeWidth="6"
          opacity="0"
          strokeLinecap="round"
          d="M-80.3935 38.4885c226.1587 136.1314 494.2049 270.6289 709.8021 190.8398 123.345-50.6067 190.5209-160.6968 180.5698-256.3098-8.6316-82.987-98.5615-166.7609-214.2597-143.4332-115.698 23.326-161.8831 131.3317-148.847 213.4414 19.177 123.2523 118.394 231.4015 264.3037 288.3298C857.0848 388.2842 1046.3964 393.013 1694-28"
        />
      </svg>
    </div>
  );
}
