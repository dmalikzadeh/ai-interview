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
    playSound("/sounds/magic.mp3");

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
      duration: 1.8,
      ease: "expo.out",
      stagger: {
        each: 0.05,
        from: "center",
      },
    });

    tl.from(
      "#li-tagline",
      {
        opacity: 0,
        filter: "blur(8px)",
        duration: 1,
        ease: "power2.out",
      },
      "-=1.2"
    );

    tl.to(
      "#li-tagline",
      {
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.6"
    );

    tl.to("#svg-stage", { opacity: 1, duration: 0.3 }, "-=1.6");

    // Animate the swoosh trail: draw forward, then fade out after the head passes
    tl.fromTo(
      ".mp",
      { drawSVG: "0% 0%", opacity: 1 },
      {
        duration: 2.2,
        drawSVG: "0% 100%",
        ease: "slow(0.7, 0.9, false)", // smoother accel/decel
        filter: "blur(2px)",
        strokeLinecap: "round",
      },
      "-=1.6"
    ).to(
      ".mp",
      {
        drawSVG: "80% 100%",
        duration: 1.2,
        ease: "power2.out",
        opacity: 0,
      },
      "-=1.0"
    );

    tl.to(
      [split.chars, taglineSplit.chars],
      {
        opacity: 0,
        x: () => gsap.utils.random(-80, 80),
        y: () => gsap.utils.random(-60, 60),
        rotation: () => gsap.utils.random(-45, 45),
        filter: "blur(8px)",
        duration: 0.8,
        ease: "power3.in",
        stagger: {
          each: 0.015,
          from: "center",
        },
      },
      "+=0.6"
    );

    tl.to(
      "#svg-stage",
      {
        opacity: 0,
        duration: 0.5,
        ease: "power1.out",
      },
      "-=0.2"
    );

    // Fade out the entire wrapper after the animations
    tl.to(
      "#li-wrapper",
      {
        autoAlpha: 0,
        duration: 0.8,
        ease: "power2.inOut",
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
        className="invisible-before-anim logo text-6xl tracking-tight text-indigo-950 dark:text-white"
      >
        InterviewBot
      </h1>

      <p
        id="li-tagline"
        className="text-center invisible-before-anim text-lg font-light tracking-wide leading-relaxed text-indigo-950/60 dark:text-white/60"
      >
        Your personal&nbsp;AI interview&nbsp;coach.
      </p>
      <svg
        id="svg-stage"
        className="absolute left-[52%] top-[10%] -translate-x-1/2 w-full"
        viewBox="-40 -180 1250 1100"
      >
        <defs>
          <linearGradient id="trail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path
          className="mp"
          fill="none"
          stroke="url(#trail-grad)"
          strokeWidth="6"
          opacity="0"
          filter="blur(2px)"
          strokeLinecap="round"
          d="M-80.3935 38.4885c226.1587 136.1314 494.2049 270.6289 709.8021 190.8398 123.345-50.6067 190.5209-160.6968 180.5698-256.3098-8.6316-82.987-98.5615-166.7609-214.2597-143.4332-115.698 23.326-161.8831 131.3317-148.847 213.4414 19.177 123.2523 118.394 231.4015 264.3037 288.3298C857.0848 388.2842 1046.3964 393.013 1694-28"
        />
      </svg>
    </div>
  );
}
