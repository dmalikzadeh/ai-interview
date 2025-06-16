"use client";

import { useEffect, useState } from "react";

export default function BackgroundBlob() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      target = {
        x: (e.clientX - innerWidth / 2) / 8,
        y: (e.clientY - innerHeight / 2) / 8,
      };
    };

    let animationFrame: number;
    const animate = () => {
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;
      setPosition({ x: current.x, y: current.y });
      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div
      className="absolute top-1/2 left-1/2 w-[600px] h-[600px] sm:w-[400px] sm:h-[400px]
  rounded-full pointer-events-none z-0 transition-transform duration-[800ms] ease-out animate-blob-pulse
  bg-[radial-gradient(circle,_#c084fc_0%,_#9339df_100%)]
  dark:bg-[radial-gradient(circle,_#d8b4fe_0%,_#a78bfa_100%)]
  opacity-40 blur-[160px]"
      style={{
        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
      }}
    />
  );
}
