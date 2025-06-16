"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { speakText, getCurrentVolume, getSpeakingRef } from "@/lib/speak";
import { startTranscription } from "@/lib/transcribe";
import BlobVisualizer from "@/components/BlobVisualizer";
import Header from "@/components/Header";
import { useInterviewStore } from "@/lib/interviewStore";
import { useUserStore } from "@/lib/userStore";
import { playSound } from "@/lib/sound";
import { animate } from "motion";
import { splitText } from "motion-plus";
import type { AnimationPlaybackControls } from "motion";
import gsap from "gsap";

export default function InterviewChatPage() {
  const [interimTranscript, setInterimTranscript] = useState("");
  const [aiCaption, setAiCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [volume, setVolume] = useState(0);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [startCaptionAnim, setStartCaptionAnim] = useState(false);
  const [showCaption, setShowCaption] = useState(false);

  const router = useRouter();
  const stopTranscriptionRef = useRef<(() => void) | null>(null);
  const lastSpokenIndexRef = useRef<number>(-1);
  const handleVoiceInputRef = useRef<() => void>(() => {});
  const lastUserMsgRef = useRef<string>("");
  const inFlightRef = useRef(false);
  const mutedRef = useRef(muted);
  const interviewEndedRef = useRef(interviewEnded);
  const captionRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    mutedRef.current = muted;
    interviewEndedRef.current = interviewEnded;
    pausedRef.current = paused;
  }, [muted, interviewEnded, paused]);

  // Fade in page elements
  useEffect(() => {
    if (!visualizerRef.current) return;

    gsap.fromTo(
      visualizerRef.current,
      { scale: 2, opacity: 0, filter: "blur(10px)" },
      {
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "back.out(1.7)",
        delay: 0.3,
        onStart: () => {
          playSound("/sounds/intro.mp3");
        },
      }
    );

    gsap.fromTo(
      ".fade-in-later",
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.5,
        delay: 2,
        ease: "power2.out",
      }
    );
  }, []);

  const formData = useUserStore((s) => s.formData);
  const messages = useInterviewStore((state) => state.messages);
  const addMessage = useInterviewStore((s) => s.addMessage);
  const {
    startTimer,
    duration,
    timeRemaining,
  } = useInterviewStore();
  const timeElapsed = duration - timeRemaining;

  // Start the intreview timer
  useEffect(() => {
    startTimer(parseInt(formData.length) * 60);
  }, []);

  useEffect(() => {
    const animate = () => {
      setVolume(getCurrentVolume());
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      window.currentInterviewAudio?.pause();
      window.currentInterviewAudio = null;
      stopTranscriptionRef.current?.();
    };
  }, []);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;

    const lastIndex = messages.length - 1;
    if (lastSpokenIndexRef.current === lastIndex) return;

    if (
      pausedRef.current ||
      mutedRef.current ||
      interviewEndedRef.current ||
      getSpeakingRef().current ||
      speechSynthesis.speaking
    )
      return;

    const speakAndResume = async () => {
      if (
        pausedRef.current ||
        mutedRef.current ||
        interviewEndedRef.current ||
        getSpeakingRef().current
      )
        return;

      lastSpokenIndexRef.current = messages.length - 1;

      await speakText(lastMsg.content, () => {
        setLoading(false);
        setAiCaption(lastMsg.content);
        setStartCaptionAnim(true);
      });

      setVolume(0); // reset visualiser

      if (!mutedRef.current && !interviewEndedRef.current) {
        handleVoiceInput();
      }
    };

    speakAndResume();
  }, [messages, paused, muted, interviewEnded]);

  const animationRef = useRef<AnimationPlaybackControls[] | null>(null);
  const lastWordIdx = useRef(-1);
  useEffect(() => {
    if (!startCaptionAnim || !aiCaption || !captionRef.current) return;

    requestAnimationFrame(() => setShowCaption(true));

    const container = captionRef.current;
    const h1 = container.querySelector("h1");
    if (!h1) return;
    lastWordIdx.current = -1;

    const { words } = splitText(h1);
    animationRef.current?.forEach((a) => a.stop()); // Stop any old animation

    const newAnimations: AnimationPlaybackControls[] = [];

    words.forEach((word, i) => {
      const anim = animate(
        word,
        { opacity: [0, 1], y: [4, 0] },
        {
          type: "spring",
          stiffness: 55,
          damping: 18,
          mass: 0.5,
          delay: i * 0.26,
        }
      );

      anim.finished.then(() => {
        lastWordIdx.current = i;
      });
      newAnimations.push(anim);
    });

    animationRef.current = newAnimations;

    Promise.all(newAnimations.map((a) => a.finished)).then(() => {
      setStartCaptionAnim(false);
    });

    return () => {
      animationRef.current?.forEach((a) => a.stop());
    };
  }, [startCaptionAnim, aiCaption]);

  const pauseSpeech = () => {
    if (speechSynthesis.speaking) speechSynthesis.pause();
    window.currentInterviewAudio?.pause();
  };

  const resumeSpeech = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
    window.currentInterviewAudio?.play();
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
    window.currentInterviewAudio?.pause();
    window.currentInterviewAudio = null;
  };

  const handleVoiceInput = () => {
    if (
      mutedRef.current ||
      transcribing ||
      pausedRef.current ||
      interviewEndedRef.current ||
      getSpeakingRef().current
    )
      return;

    stopTranscriptionRef.current?.();
    setTranscribing(true);

    stopTranscriptionRef.current = startTranscription(
      (partial) => {
        setInterimTranscript(partial);
      },
      async (final) => {
        if (mutedRef.current) return;

        const clean = final.trim();
        if (
          !clean ||
          clean === lastUserMsgRef.current || 
          inFlightRef.current || 
          getSpeakingRef().current 
        )
          return;

        inFlightRef.current = true;
        setInterimTranscript("");
        lastUserMsgRef.current = clean;

        const updated = [...messages, { role: "user", content: clean }];
        addMessage({ role: "user", content: clean });
        setLoading(true);

        try {
          const liveTime = useInterviewStore.getState().timeRemaining;
          const payload = {
            ...formData,
            history: updated,
            timeRemaining: liveTime,
          };

          const res = await fetch("/api/interview-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          addMessage({
            role: "assistant",
            content: data.message || "⚠️ No message.",
            note: data.note,
          });

          setShowCaption(false);

          if (data.ended) {
            setInterviewEnded(true);

            await speakText(
              data.message || "This concludes our interview.",
              () => {
                setLoading(false);
                setAiCaption(data.message || "This concludes our interview.");
                setStartCaptionAnim(true);
              }
            );
            
            await new Promise((res) => setTimeout(res, 1000));
            stopSpeech();
            router.push("/results");
            return;
          }
        } catch (err) {
          console.error("API Error:", err);
        } finally {
          setTranscribing(false);
          inFlightRef.current = false;
        }
      },
      (err) => {
        console.error("STT Error:", err);
        setTranscribing(false);
      }
    );
  };

  handleVoiceInputRef.current = handleVoiceInput;

  const togglePause = () => {
    const nowPaused = !paused;
    setPaused(nowPaused);

    const interviewStore = useInterviewStore.getState();

    if (nowPaused) {
      playSound("/sounds/pause.mp3");

      stopTranscriptionRef.current?.();
      setTranscribing(false);
      setInterimTranscript("");
      pauseSpeech();
      interviewStore.pauseTimer();
      animationRef.current?.forEach((ctrl, i) => {
        if (i > lastWordIdx.current + 2) {
          ctrl.pause();
        }
      });
    } else {
      playSound("/sounds/unpause.mp3");

      resumeSpeech();
      interviewStore.resumeTimer();
      animationRef.current?.forEach((ctrl, i) => {
        if (i > lastWordIdx.current) {
          ctrl.play();
        }
      });

      if (muted) return;

      if (speechSynthesis.speaking || getSpeakingRef().current) {
        return;
      }

      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        const context = new AudioCtx();

        context.resume().finally(() => {
          setTimeout(() => handleVoiceInputRef.current(), 300);
        });
      } catch (err) {
        console.warn("AudioContext issue:", err);
        handleVoiceInput();
      }
    }
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);

    if (newMuted) {
      playSound("/sounds/mute.mp3");
    } else {
      playSound("/sounds/unmute.mp3");
    }

    if (newMuted) {
      stopTranscriptionRef.current?.();
      setTranscribing(false);
      setInterimTranscript("");
      return;
    }

    if (interviewEnded || paused) return;

    if (speechSynthesis.speaking || getSpeakingRef().current) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const context = new AudioCtx();

      context.resume().finally(() => {
        setTimeout(() => handleVoiceInputRef.current(), 300);
      });
    } catch (err) {
      console.warn("AudioContext issue:", err);
      handleVoiceInputRef.current();
    }
  };

  const endInterviewEarly = () => {
    useInterviewStore.getState().endInterview();
    stopTranscriptionRef.current?.();
    stopSpeech();
    router.push("/results");
  };

  function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, "0");
    const sec = (totalSec % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  }

  return (
    <main>
      <Header />

      {/* AI Voice + Captions*/}
      <div className="flex flex-col items-center gap-12">
        <div className="fade-in-later flex flex-col items-center gap-4">
          {/* AI Caption */}
          {aiCaption && (
            <div
              className="text-center text-indigo-950/60 dark:text-white/60 text-xs font-medium md:text-lg max-w-xl"
              ref={captionRef}
              style={{ visibility: showCaption ? "visible" : "hidden" }}
            >
              <h1 className="ai-caption">{aiCaption}</h1>
            </div>
          )}

          {/* Timer */}
          <div
            className={`text-xs md:text-sm font-mono flex items-center gap-2 ${
              timeRemaining < 0.1 * duration
                ? "text-red-400"
                : "text-indigo-950/50 dark:text-white/50"
            }`}
          >
            <svg
              className="h-[1em] w-[1em]"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12-5.383,12-12,12Zm0-22C6.486,2,2,6.486,2,12s4.486,10,10,10,10-4.486,10-10S17.514,2,12,2Zm5,10c0-.553-.447-1-1-1h-3V6c0-.553-.448-1-1-1s-1,.447-1,1v6c0,.553,.448,1,1,1h4c.553,0,1-.447,1-1Z" />
            </svg>
            <span>{formatTime(timeElapsed * 1000)}</span>
          </div>
        </div>
        <div ref={visualizerRef}>
          <BlobVisualizer
            volume={volume}
            speaking={getSpeakingRef().current}
            paused={paused}
            loading={loading}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="fade-in-later flex justify-center gap-3 mt-16">
        <button
          onClick={togglePause}
          className={`p-2 transition cursor-pointer active:scale-90 ${
            paused
              ? "text-indigo-950/60 hover:text-indigo-950/80 dark:text-white/80 dark:hover:text-white"
              : "text-indigo-950/40 hover:text-indigo-950/60 dark:text-white/60 dark:hover:text-white/80"
          }`}
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.5,0A3.5,3.5,0,0,0,3,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,6.5,0Z" />
            <path d="M17.5,0A3.5,3.5,0,0,0,14,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,17.5,0Z" />
          </svg>
        </button>

        <button
          onClick={() => setShowEndConfirm(true)}
          className="w-12 h-12 bg-[#B91C1C] hover:bg-[#DC2626] text-white/80 hover:text-white flex items-center justify-center rounded-full transition cursor-pointer shadow-lg active:scale-90"
        >
          <svg
            className="h-8 w-8"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M14.121,12,18,8.117A1.5,1.5,0,0,0,15.883,6L12,9.879,8.11,5.988A1.5,1.5,0,1,0,5.988,8.11L9.879,12,6,15.882A1.5,1.5,0,1,0,8.118,18L12,14.121,15.878,18A1.5,1.5,0,0,0,18,15.878Z" />
          </svg>
        </button>

        <button
          onClick={toggleMute}
          className={`active:scale-90 ${
            muted
              ? "text-[#F87171] hover:text-[#F43F5E]"
              : "text-indigo-950/40 hover:text-indigo-950/60 dark:text-white/60 dark:hover:text-white/80"
          } p-2 transition cursor-pointer`}
        >
          {muted ? (
            // Muted icon
            <svg
              className="h-6 w-6"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="m21.154,19.74c1.833-2.165,2.846-4.883,2.846-7.74,0-.552-.448-1-1-1s-1,.448-1,1c0,2.324-.804,4.54-2.263,6.323l-1.421-1.421c.883-1.134,1.422-2.477,1.601-3.902h-3.917c-.552,0-1-.448-1-1s.448-1,1-1h4v-2h-4c-.552,0-1-.448-1-1s.448-1,1-1h3.931c-.495-3.94-3.859-7-7.931-7-2.819,0-5.355,1.456-6.795,3.791L1.707.293C1.316-.098.684-.098.293.293S-.098,1.316.293,1.707l22,22c.195.195.451.293.707.293s.512-.098.707-.293c.391-.391.391-1.023,0-1.414l-2.553-2.553Zm-4.982,1.352c-1.312.603-2.715.909-4.171.909-5.514,0-10-4.486-10-10,0-.552-.448-1-1-1s-1,.448-1,1c0,6.617,5.383,12,12,12,1.747,0,3.431-.367,5.006-1.091.502-.231.722-.825.491-1.326-.23-.502-.825-.723-1.326-.491Zm-1.047-1.725c-.96.408-2.016.634-3.124.634-4.418,0-8-3.582-8-8v-3.758l11.124,11.124Z" />
            </svg>
          ) : (
            // Unmuted icon
            <svg
              className="h-6 w-6"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M10 12a1 1 0 0 1-1 1H4.069a7.993 7.993 0 0 0 15.862 0H15a1 1 0 0 1 0-2h5V9h-5a1 1 0 0 1 0-2h4.931A7.993 7.993 0 0 0 4.069 7H9a1 1 0 0 1 0 2H4v2h5a1 1 0 0 1 1 1Z" />
              <path d="M23 12a1 1 0 0 0-1 1 9.01 9.01 0 0 1-9 9h-2a9.011 9.011 0 0 1-9-9 1 1 0 0 0-2 0 11.013 11.013 0 0 0 11 11h2a11.013 11.013 0 0 0 11-11 1 1 0 0 0-1-1Z" />
            </svg>
          )}
        </button>
      </div>

      {/* User Captions */}
      {interimTranscript && (
        <div className="mt-8 text-center text-indigo-950 dark:text-white text-sm italic">
          {interimTranscript}
        </div>
      )}

      {/* Confirmation Modal for Ending Interview */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center">
          <div className="relative bg-white/60 dark:bg-[#1e1e2f]/60 backdrop-blur-xl rounded-2xl shadow-xl p-5 pt-8 w-[90%] max-w-sm ">
            <div
              onClick={() => setShowEndConfirm(false)}
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
            <h2 className="text-lg sm:text-xl font-semibold text-indigo-950 dark:text-white mb-1">
              Leave the Interview?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-950/80 dark:text-white/60 mb-6">
              Are you sure you want to leave? Your progress will be saved and
              you&apos;ll see your results.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2 font-medium rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs sm:text-sm text-gray-800 dark:text-white cursor-pointer active:scale-95 transition"
              >
                Continue Interview.
              </button>
              <button
                onClick={endInterviewEarly}
                className="flex-1 px-4 py-2 font-medium rounded-full bg-red-400 hover:bg-red-500 text-white text-xs sm:text-sm shadow cursor-pointer active:scale-95 transition"
              >
                Yes, Show Results!
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
