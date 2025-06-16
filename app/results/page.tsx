"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/userStore";
import { useInterviewStore } from "@/lib/interviewStore";
import gsap from "gsap";

interface FeedbackNote {
  strength: string;
  criticism: string;
  score: number;
}

interface AIResult {
  intro: string;
  score: number;
  strengths: string[];
  improvements: string[];
  finalNote: string;
}

function AnimatedScore({ target }: { target: number }) {
  const [display, setDisplay] = useState("0.0");

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2.5,
      delay: 0.8,
      ease: "power3.out",
      onUpdate: () => {
        const rounded = (Math.round(obj.val * 10) / 10).toFixed(1);
        setDisplay(rounded);
      },
    });
  }, [target]);

  return (
    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-300 dark:text-indigo-600">
      {display} / 10
    </p>
  );
}

export default function InterviewResults() {
  const fetchedOnce = useRef(false);
  const animatedOnce = useRef(false);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AIResult | null>(null);
  const messages = useInterviewStore((state) => state.messages);
  const notes = messages
    .filter((m) => m.note)
    .map((m) => m.note as FeedbackNote);
  const formData = useUserStore((state) => state.formData);

  const router = useRouter();
  const resetFormData = useUserStore((state) => state.resetFormData);
  const resetInterview = useInterviewStore((state) => state.resetInterview);

  function handleNewInterview() {
    resetFormData();
    resetInterview();
    router.push("/");
  }

  function handleRetry() {
    router.push("/loading");
  }

  useEffect(() => {
    if (fetchedOnce.current) return; // ⬅️ skip 2nd mount
    fetchedOnce.current = true;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/interview-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            role: formData.role,
            company: formData.company,
            notes,
          }),
        });
        setResult(await res.json());
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading || !result) return;
    if (animatedOnce.current) return; // ⬅️ skip duplicate animation
    animatedOnce.current = true;

    const tl = gsap.timeline();
    tl.fromTo(
      "#top-card",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4 }
    )
      .fromTo("#intro", { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo("#score", { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .to({}, { duration: 1 })
      .fromTo(
        "#strengths-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 }
      )
      .fromTo(
        ".strength-item",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.6 }
      )
      .fromTo(
        "#weaknesses-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 }
      )
      .fromTo(
        ".weakness-item",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.6 }
      )
      .fromTo(
        "#final-note",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 }
      )
      .fromTo(
        "#buttons",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      );
  }, [loading, result]);

  return (
    <main className="w-full max-w-6xl px-4 py-24">
      <Header />
      <h1 className="text-2xl sm:text-3xl font-semibold mb-10 text-center text-indigo-950/90 dark:text-white/90">
        Interview complete 🎉
      </h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 mt-12">
          <div className="shimmer-bar w-[200px] h-4 rounded-full" />
          <p className="text-indigo-950/60 dark:text-white/60 text-sm tracking-wide">
            Generating your results...
          </p>
        </div>
      ) : result ? (
        <div className="space-y-2 sm:space-y-4">
          <div
            id="top-card"
            className="bg-[#4B3E8D] text-white dark:bg-[#f3eaff] dark:text-[#1E1E2F] flex items-center justify-between gap-4 sm:gap-20 shadow-lg backdrop-blur-lg p-4 sm:p-8 rounded-xl sm:rounded-2xl"
          >
            <p id="intro" className="flex-1 font-base sm:font-medium text-sm sm:text-lg">
              {result.intro}
            </p>

            <div id="score" className="flex-1 text-center">
              <AnimatedScore target={result.score} />
              <p className="text-sm mt-1">Overall performance score</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row align-center justify-between gap-2 sm:gap-4">
            <div
              id="strengths-card"
              className="flex-1 border bg-black/5 dark:bg-white/10 border-lime-600 dark:border-lime-500 shadow-xs backdrop-blur-md p-4 sm:p-8 rounded-xl sm:rounded-2xl"
            >
              <h3 className="item text-md sm:text-xl font-semibold mb-2 text-indigo-950 dark:text-white">
                What went well
              </h3>
              <div className="space-y-1">
                {result.strengths.length > 0 ? (
                  result.strengths.map((s, i) => (
                    <div
                      key={i}
                      className="item strength-item flex items-start gap-2"
                    >
                      <svg
                        className="w-2 h-2 sm:w-3 sm:h-3 mt-[0.25rem] sm:mt-[0.4rem] text-lime-600 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5.35 19.549h-.7c-1.674 0-3.109-1.26-3.338-2.93-.129-.941-.195-2-.195-3.149s.07-2.13.208-3.074c.239-1.628 1.67-2.856 3.33-2.856h.695v12.009ZM19.228 22.632c-1.78.599-5.396.355-7.973.045-2.091-.251-3.513-1.417-3.905-3.127V5.324l.105-1.035a3.647 3.647 0 0 1 3.638-3.288 3.66 3.66 0 0 1 2.723 1.216 3.662 3.662 0 0 1 .91 2.84l-.2 1.816c1.655-.167 4.318-.322 5.491.24 2.526 1.211 2.867 4.571 2.867 7.697 0 4.559-1.128 6.971-3.656 7.821Z" />
                      </svg>
                      <span className="text-indigo-950/80 dark:text-white/80 text-xs sm:text-base leading-snug">
                        {s}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="item text-indigo-950/60 dark:text-white/60 italic">
                    No specific strengths were highlighted this time — but don't
                    worry! Focus on the feedback and keep improving.
                  </p>
                )}
              </div>
            </div>
            <div
              id="weaknesses-card"
              className="flex-1 border bg-black/5 dark:bg-white/10 border-orange-400 dark:border-orange-300 shadow-xs backdrop-blur-md p-4 sm:p-8 rounded-xl sm:rounded-2xl"
            >
              <h3 className="item text-md sm:text-xl font-semibold mb-2 text-indigo-950 dark:text-white">
                Areas to improve
              </h3>
              <div className="space-y-1">
                {result.improvements.length > 0 ? (
                  result.improvements.map((s, i) => (
                    <div
                      key={i}
                      className="item weakness-item flex items-start gap-2"
                    >
                      <svg
                        className="w-2 h-2 sm:w-3 sm:h-3 mt-[0.25rem] sm:mt-[0.4rem] text-orange-400 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="m10.54,15.49c.596.595.596,1.561,0,2.157l-5.508,5.508c-1.188,1.188-3.138,1.15-4.278-.115-1.068-1.186-.901-3.043.227-4.171l5.39-5.39c.595-.595,1.561-.596,2.156,0l2.012,2.012Zm5.412-4.487c1.263.002,2.544.501,3.487,1.445.561.552,1.313.446,1.561.275,1.819-1.259,3.018-3.343,3.018-5.723,0-.413-.037-.817-.106-1.21-.136-.768-1.107-1.041-1.659-.49l-1.647,1.647c-1.146,1.146-2.653,1.322-3.665.494-1.164-.952-1.228-2.672-.191-3.709l1.965-1.965c.551-.552.281-1.526-.487-1.662-.393-.07-.797-.106-1.21-.106-2.943,0-5.455,1.818-6.489,4.391-.207.514-.086,1.105.306,1.496l5.117,5.116Zm2.073,2.859c-.761-.761-1.831-1.007-2.804-.761l-7.222-7.221v-1.881c0-.752-.402-1.448-1.054-1.824L3.539.211C2.921-.146,2.14-.043,1.635.462L.463,1.634C-.043,2.139-.146,2.921.211,3.539l1.965,3.407c.376.652,1.071,1.053,1.823,1.053h1.878l7.224,7.223c-.245.972,0,2.042.761,2.803l5.057,5.003c1.147,1.147,3.128,1.256,4.274.108,1.148-1.15,1.003-2.867-.001-4.162l-5.166-5.112Z" />
                      </svg>
                      <span className="text-indigo-950/80 dark:text-white/80 text-xs sm:text-base leading-snug">
                        {s}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="item text-indigo-950/60 dark:text-white/60 italic">
                    No major areas of improvement were flagged — great job! Keep
                    building on your strengths.
                  </p>
                )}
              </div>
            </div>
          </div>

          <p
            id="final-note"
            className="text-md sm:text-xl max-w-lg mx-auto mt-8 text-center text-indigo-950/70 dark:text-white/70"
          >
            {result.finalNote}
          </p>

          <div
            id="buttons"
            className="mt-6 flex justify-center gap-2 text-xs sm:text-sm font-semibold"
          >
            <button
              onClick={handleNewInterview}
              className="bg-[#4B3E8D] hover:bg-[#5C4BD1] dark:bg-[#f3eaff] dark:hover:bg-[#e6dbff] dark:text-[#1E1E2F] text-white px-4 py-2 rounded-xl shadow transition cursor-pointer active:scale-[0.95]"
            >
              Start a new interview
            </button>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 border border-[#4B3E8D]/60 text-[#4B3E8D]/80 hover:text-[#4B3E8D] hover:bg-black/5 dark:border-[#f3eaff]/60 dark:text-[#f3eaff]/80 dark:hover:text-[#f3eaff] dark:hover:bg-white/10 px-4 py-2 rounded-xl shadow transition cursor-pointer active:scale-[0.95]"
            >
              <svg
                className="h-[1em] w-[1em]"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 511.494 511.494"
              >
                <path d="M478.291 255.492c-16.133.143-29.689 12.161-31.765 28.16-15.37 105.014-112.961 177.685-217.975 162.315S50.866 333.006 66.236 227.992 179.197 50.307 284.211 65.677a192.168 192.168 0 0 1 96.907 43.959l-24.107 24.107c-8.33 8.332-8.328 21.84.004 30.17a21.333 21.333 0 0 0 15.142 6.246h97.835c11.782 0 21.333-9.551 21.333-21.333V50.991c-.003-11.782-9.556-21.331-21.338-21.329a21.333 21.333 0 0 0-15.078 6.246l-28.416 28.416C320.774-29.34 159.141-19.568 65.476 86.152S-18.415 353.505 87.304 447.17s267.353 83.892 361.017-21.828a255.752 255.752 0 0 0 61.607-132.431c2.828-17.612-9.157-34.183-26.769-37.011a32.265 32.265 0 0 0-4.868-.408z" />
              </svg>
              <span>Retry this interview</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-red-400 mt-8">
          Something went wrong while generating your results.
        </p>
      )}
    </main>
  );
}
