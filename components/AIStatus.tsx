"use client";
import { useState } from "react";

export default function AIStatus() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 sm:gap-2 fixed bottom-4 left-4 z-50 bg-orange-600/15 dark:bg-orange-400/15 backdrop-blur-md border-[0.5px] border-orange-700/30 dark:border-500/30 text-orange-600 dark:text-orange-500 px-2 sm:px-3 py-1 rounded-full shadow-lg text-xs sm:text-sm">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-600 dark:bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex size-2 rounded-full bg-orange-600/90 dark:bg-orange-500/90"></span>
        </span>
        <span className="tracking-tight font-medium">
          AI is currently disabled
        </span>
        <svg
          onClick={() => setShowInfo(true)}
          className="h-[1em] w-[1em] ml-2 sm:ml-4 opacity-60 hover:opacity-100 transition cursor-pointer"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10.011,10.011,0,0,1,12,22Z" />
          <path d="M12,10H11a1,1,0,0,0,0,2h1v6a1,1,0,0,0,2,0V12A2,2,0,0,0,12,10Z" />
          <circle cx="12" cy="6.5" r="1.5" />
        </svg>
      </div>
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center">
          <div className="relative bg-white/60 dark:bg-[#1e1e2f]/60 backdrop-blur-xl rounded-2xl shadow-xl p-5 pt-8 w-[90%] max-w-sm">
            <div
              onClick={() => setShowInfo(false)}
              className="absolute right-2 top-2 text-indigo-950/40 hover:text-indigo-950/60 dark:text-white/60 dark:hover:text-white p-2 cursor-pointer transition"
            >
              <svg
                className="h-3 w-3"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512.02 512.02"
              >
                <path d="M301.26 256.01 502.64 54.65a32 32 0 1 0-45.26-45.27L256 210.76 54.65 9.38A32 32 0 1 0 9.38 54.65L210.76 256 9.38 457.38a32 32 0 1 0 45.27 45.26L256 301.26l201.37 201.38a32 32 0 1 0 45.26-45.26L301.26 256z" />
              </svg>
            </div>
            <h2 className="text-indigo-950/80 dark:text-white/60 mb-3">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10.011,10.011,0,0,1,12,22Z" />
                <path d="M12,10H11a1,1,0,0,0,0,2h1v6a1,1,0,0,0,2,0V12A2,2,0,0,0,12,10Z" />
                <circle cx="12" cy="6.5" r="1.5" />
              </svg>
            </h2>
            <p className="text-sm sm:text-md text-indigo-950/80 dark:text-white/60">
              AI is temporarily disabled to manage server costs or due to daily usage limits. You&apos;re welcome to explore, but
              note <strong>answers are demo content</strong>.
            </p>
            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-4 flex-1 px-4 py-2 font-medium rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm text-gray-800 dark:text-white cursor-pointer active:scale-95 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
