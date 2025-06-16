"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getTempCV } from "@/lib/cvStore";
import { useUserStore } from "@/lib/userStore";
import { useInterviewStore } from "@/lib/interviewStore";

const setFormData = useUserStore.getState().setFormData;

export default function LoadingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Preparing your interview...");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const initialiseInterview = async () => {
      try {
        const formData = useUserStore.getState().formData;

        const { name, role, company, description } = formData;

        // 1. Clear any previous interview data
        setStatus("Getting things ready...");
        useInterviewStore.getState().resetInterview();

        // 2. Check and process CV (if provided)
        setStatus("Looking for your CV...");
        const cvFile = getTempCV();
        if (cvFile && (formData.cv === "" || formData.cv === cvFile.name)) {
          setStatus("Reviewing your CV to tailor the questions...");
          const cvFormData = new FormData();
          cvFormData.append("cv", cvFile);
          const parseRes = await fetch("/api/parse-cv", {
            method: "POST",
            body: cvFormData,
          });

          if (!parseRes.ok) throw new Error("CV parsing failed");
          const parsed = await parseRes.json();
          setFormData({ cv: parsed.summary });
        }

        // 3. Summarise job description (if provided)
        let finalDescription = formData.description;
        if (description.length > 200 && !description.includes("[SUMMARY]")) {
          setStatus("Summarising your job description...");
          const res = await fetch("/api/summarise-description", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description }),
          });
          if (res.ok) {
            const data = await res.json();
            finalDescription = "[SUMMARY] " + data.summary;
          } else {
            console.warn("Description summarisation failed. Using original.");
          }
        }
        setFormData({ description: finalDescription });

        // 4. Generate first message from AI
        setStatus("Thinking of the perfect opening question...");
        const firstMessageRes = await fetch("/api/first-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, role, company }),
        });

        if (!firstMessageRes.ok) throw new Error("Failed to get first message");
        const firstData = await firstMessageRes.json();
        const firstMessage = firstData.firstMessage;

        const { addMessage } = useInterviewStore.getState();
        addMessage({ role: "assistant", content: firstMessage });
        setStatus("Almost ready—just opening the chat...");

        // 5. Redirect to interview page
        router.push("/interview");
      } catch {
        setError("⚠️ Failed to start interview.");
      }
    };

    initialiseInterview();
  }, []);

  if (error) {
    return (
      <main>
        <Header />

        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/30 rounded-xl"
          onClick={() => router.push("/")}
        >
          Go back
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-lg md:text-xl font-medium text-indigo-950/80 dark:text-white/80 mb-8 text-center">
        {status}
      </h1>
      <div className="shimmer-bar" />
    </main>
  );
}
