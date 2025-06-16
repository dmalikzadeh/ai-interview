import React, { useEffect, useRef } from "react";
import "./blob.css";
import gsap from "gsap";

interface Props {
  volume: number;
  speaking: boolean;
  loading: boolean;
  paused?: boolean;
}

const BlobVisualizer: React.FC<Props> = ({ volume, speaking, paused, loading }) => {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading || paused || speaking || !loaderRef.current) return;

    const dots = loaderRef.current.querySelectorAll<HTMLDivElement>(".dot");
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(dots, {
      y: -12,
      duration: 0.35,
      ease: "power1.inOut",
      stagger: {
        each: 0.15,
        yoyo: true,
        repeat: 1,
      },
    });

    return () => {
      tl.kill();
    };
  }, [loading, paused, speaking]);

  return (
    <div className="relative">
      <div
        className="blob-ring"
        style={{
          transform: `scale(${1 + volume * 1.3})`,
          opacity: speaking ? 1 : 0.4,
          transition: "transform 0.1s ease-out, opacity 0.3s ease",
        }}
      ></div>
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center text-indigo-950/60 dark:text-white/60 font-medium text-base md:text-lg text-center pointer-events-none transition-opacity duration-300`}
        style={{
          opacity: paused ? 1 : 0,
          textShadow: "0 0 4px rgba(0,0,0,0.3)",
        }}
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.5,0A3.5,3.5,0,0,0,3,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,6.5,0Z" />
          <path d="M17.5,0A3.5,3.5,0,0,0,14,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,17.5,0Z" />
        </svg>
        <span>Paused</span>
      </div>
      {loading && !paused && !speaking && (
        <div
          ref={loaderRef}
          className="flex items-center justify-center gap-2 absolute inset-0"
        >
          <div className="dot w-3 h-3 rounded-full bg-indigo-950/60 dark:bg-white/60 backdrop-blur-md will-change-transform" />
          <div className="dot w-3 h-3 rounded-full bg-indigo-950/60 dark:bg-white/60 backdrop-blur-md will-change-transform" />
          <div className="dot w-3 h-3 rounded-full bg-indigo-950/60 dark:bg-white/60 backdrop-blur-md will-change-transform" />
        </div>
      )}
    </div>
  );
};

export default BlobVisualizer;
