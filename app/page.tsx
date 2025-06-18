"use client";

import { Suspense, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import jobTitles from "@/lib/data/jobTitles.json";
import companies from "@/lib/data/companies.json";
import AutocompleteInput from "@/components/AutocompleteInput";
import Header from "@/components/Header";
import { setTempCV } from "@/lib/cvStore";
import { useUserStore } from "@/lib/userStore";
import StepHandler from "@/components/StepHandler";
import LandingIntro from "@/components/LandingIntro";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);

  const router = useRouter();

  const startTimeRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    company: string;
    cv: File | null;
    description: string;
    length: string;
  }>({
    name: "",
    role: "",
    company: "",
    cv: null,
    description: "",
    length: "5",
  });

  const questions = [
    {
      label: (
        <>
          What&apos;s your <strong className="text-indigo-950 dark:text-white font-semibold">name</strong>
          ?
        </>
      ),
      name: "name",
      type: "input",
      placeholder: "e.g. Sarah",
      required: true,
    },
    {
      label: (
        <>
          What <strong className="text-indigo-950 dark:text-white font-semibold">job role</strong>{" "}
          are you preparing for?
        </>
      ),
      name: "role",
      type: "input",
      placeholder: "e.g. Frontend Developer",
      required: true,
    },
    {
      label: (
        <>
          Which <strong className="text-indigo-950 dark:text-white font-semibold">company</strong> is
          the interview with?
        </>
      ),
      name: "company",
      type: "input",
      placeholder: "e.g. Spotify",
      required: true,
    },
    {
      label: (
        <>
          Want to upload your{" "}
          <strong className="text-indigo-950 dark:text-white font-semibold">CV</strong>?
        </>
      ),
      name: "cv",
      type: "file",
      placeholder: "",
      required: false,
    },
    {
      label: (
        <>
          Can you share the{" "}
          <strong className="text-indigo-950 dark:text-white font-semibold">job description</strong>?
        </>
      ),
      name: "description",
      type: "textarea",
      placeholder: "Paste it here or describe the role…",
      required: false,
    },
    {
      label: (
        <>
          What&apos;s your preferred{" "}
          <strong className="text-indigo-950 dark:text-white font-semibold">interview length</strong>
          ?
        </>
      ),
      name: "length",
      type: "select",
      options: ["5", "10", "15"],
      required: true,
    },
  ];

  const current = questions[currentStep];

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      useUserStore.getState().setFormData({
        ...useUserStore.getState().formData,
        name: formData.name,
      });

      router.push(`?step=${currentStep + 1}`);
    } else {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      } 
      setTempCV(formData.cv);
      useUserStore.getState().setFormData({
        ...formData,
        cv: formData.cv?.name || "",
      });
      router.push("/loading");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && current.type !== "textarea") {
      e.preventDefault();
      handleNext();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (current.type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFormData({ ...formData, [current.name]: file });
    } else {
      setFormData({ ...formData, [current.name]: e.target.value });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, cv: file }));
    }
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const currentValue = formData[current.name as keyof typeof formData];
  const isFilled =
    !current.required ||
    (typeof currentValue === "string" && currentValue.trim() !== "") ||
    (current.type === "file" && currentValue instanceof File);

  return (
    <main>
      <LandingIntro />

      <Suspense fallback={null}>
        <StepHandler onStep={setCurrentStep} />
      </Suspense>

      <Header />

      <div className="w-full max-w-md min-w-[280px] space-y-4 mx-auto">
        <label className="block mb-8 text-center text-xl sm:text-2xl font-medium text-indigo-950/80 dark:text-white/80">
          {current.label}
          {!current.required && (
            <p className="text-indigo-950/40 dark:text-white/40 text-sm text-center">Optional</p>
          )}
        </label>

        <div className="relative w-full">
          <div className="relative w-full">
            <div className="w-full">
              {current.type === "input" && current.name === "role" && (
                <div onKeyDown={handleKeyDown}>
                  <AutocompleteInput
                    value={formData.role}
                    onChange={(val) => setFormData({ ...formData, role: val })}
                    placeholder={current.placeholder}
                    suggestions={jobTitles}
                    maxLength={100}
                  />
                </div>
              )}

              {current.type === "input" && current.name === "company" && (
                <div onKeyDown={handleKeyDown}>
                  <AutocompleteInput
                    value={formData.company}
                    onChange={(val) =>
                      setFormData({ ...formData, company: val })
                    }
                    placeholder={current.placeholder}
                    suggestions={companies}
                    maxLength={100}
                  />
                </div>
              )}

              {current.type === "input" &&
                current.name !== "role" &&
                current.name !== "company" && (
                  <input
                    name={current.name}
                    value={
                      (formData[current.name as keyof typeof formData] ??
                        "") as string
                    }
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    maxLength={100}
                    className="w-full bg-black/5 dark:bg-white/10 border border-transparent backdrop-blur-md shadow-xs text-indigo-950 placeholder-indigo-950/60 dark:text-white dark:placeholder-white/60 rounded-full px-6 py-3 focus:outline-none focus:bg-transparent focus:border focus:border-black/10 focus:dark:border-white/30 transition"
                    placeholder={current.placeholder}
                  />
                )}

              {current.type === "textarea" && (
                <>
                  <textarea
                    name={current.name}
                    value={
                      (formData[current.name as keyof typeof formData] ??
                        "") as string
                    }
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    rows={5}
                    maxLength={1000}
                    className="w-full border border-black/10 dark:border-white/30 backdrop-blur-md shadow-xs text-indigo-950 placeholder-indigo-950/60 dark:text-white dark:placeholder-white/60 rounded-2xl px-6 py-3 pr-10 focus:outline-none focus:bg-transparent focus:border focus:border-black/20 focus:dark:border-white/60 transition"
                    placeholder={current.placeholder}
                  />
                  <p className="text-sm text-indigo-950/40 dark:text-white/40 mt-1 text-right">
                    {formData.description.length}/1000
                  </p>
                </>
              )}

              {current.type === "file" && (
                <label
                  htmlFor="cv-upload"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`w-full border-2 border-dashed ${
                    formData.cv
                      ? "border-black/10 dark:border-white/30"
                      : isDragging
                      ? "border-black/20 dark:border-white/60"
                      : "border-black/10 hover:border-black/20 dark:border-white/30 hover:dark:border-white/60"
                  } backdrop-blur-md shadow-xs text-indigo-950/60 dark:text-white/60 ${
                    formData.cv ? "" : "hover:text-indigo-950 hover:dark:text-white"
                  } placeholder-indigo-950/60 dark:placeholder-white/60 rounded-2xl px-6 py-12 text-center ${
                    formData.cv ? "cursor-default" : "cursor-pointer"
                  } transition flex flex-col items-center justify-center gap-4`}
                >
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleChange}
                    className="hidden"
                    disabled={!!formData.cv}
                  />

                  {!formData.cv && (
                    <>
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512.02 512.02"
                      >
                        <path d="m165.56 141.89 59.33-59.35.44 290.82a32 32 0 0 0 64 0L288.9 82.9l58.98 58.99a32 32 0 1 0 45.25-45.25L324.6 28.12a96 96 0 0 0-135.77 0l-68.52 68.52a32 32 0 0 0 45.25 45.25z" />
                        <path d="M480.01 309.36a32 32 0 0 0-32 32v97.94a8.75 8.75 0 0 1-8.72 8.72H72.74A8.75 8.75 0 0 1 64 439.3v-97.94a32 32 0 0 0-64 0v97.94a72.81 72.81 0 0 0 72.73 72.72h366.54a72.81 72.81 0 0 0 72.73-72.72v-97.94a32 32 0 0 0-32-32z" />
                      </svg>
                      <span className="text-sm">
                        Click or drag to upload your CV (PDF, DOCX)
                      </span>
                    </>
                  )}

                  {formData.cv && (
                    <div className="flex items-center justify-between w-full px-4 text-indigo-950/80 dark:text-white/80 text-sm">
                      <span className="truncate">
                        {(formData.cv as File).name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFormData({ ...formData, cv: null });
                        }}
                        className="text-indigo-950/60 hover:text-indigo-950 dark:text-white/60 dark:hover:text-white transition text-2xl cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </label>
              )}
            </div>

            {currentStep < questions.length - 1 && (
              <div
                className={`flex justify-center mt-4 sm:mt-0 sm:absolute sm:right-[-2.5rem] sm:top-1/2 sm:-translate-y-1/2 transition-opacity duration-300 ${
                  isFilled || !current.required ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
              >
                <button
                  onClick={handleNext}
                  className="text-indigo-950/70 hover:text-indigo-950 dark:text-white/70 hover:dark:text-white cursor-pointer transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.12,9.91,19.25,6a1,1,0,0,0-1.42,0h0a1,1,0,0,0,0,1.41L21.39,11H1a1,1,0,0,0-1,1H0a1,1,0,0,0,1,1H21.45l-3.62,3.61a1,1,0,0,0,0,1.42h0a1,1,0,0,0,1.42,0l3.87-3.88A3,3,0,0,0,23.12,9.91Z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {current.type === "select" && (
          <div className="flex justify-center gap-3 w-full">
            {current.options?.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, [current.name]: option })
                }
                className={`flex-1 px-4 py-3 rounded-full text-sm font-medium border backdrop-blur-md transition-all ${
                  formData[current.name as keyof typeof formData] === option
                    ? "bg-[#f3eaff] border-[#dabdff] text-[#1e1e2f] dark:bg-[#8D6BD8] dark:border-[#BBA3FF] dark:text-white shadow-sm"
                    : "bg-black/5 dark:bg-white/5 text-indigo-950/70 dark:text-white/70 border-black/10 dark:border-white/20 hover:bg-black/10 hover:dark:bg-white/10 hover:border-black/20 hover:dark:border-white/30 cursor-pointer"
                }`}
              >
                {option} min
              </button>
            ))}
          </div>
        )}

        {currentStep === questions.length - 1 && (
          <div className="w-full flex items-center justify-center transition-opacity duration-300 opacity-100">
            <button
              onClick={handleNext}
              className="bg-[#4B3E8D] hover:bg-[#6353B3] text-white dark:bg-[#f3eaff] hover:dark:bg-[#D0C6FF] dark:text-[#1E1E2F] mt-8 px-6 py-3 text-sm font-semibold rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                Generate Interview
                <svg className="w-[1.2em] h-[1.2em]" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.13 11.57a1 1 0 0 0-.54-.9c-.86-.43-1.78-.83-2.82-1.23a6.07 6.07 0 0 1-3.6-3.64 29.2 29.2 0 0 0-1.2-2.86 1 1 0 0 0-1.8 0c-.43.87-.83 1.8-1.21 2.86a6.07 6.07 0 0 1-3.6 3.64c-1.03.4-1.96.8-2.81 1.24a1 1 0 0 0 0 1.78c.86.44 1.78.84 2.81 1.23a6.07 6.07 0 0 1 3.6 3.65c.38 1.05.78 1.98 1.21 2.85a1 1 0 0 0 1.8 0c.42-.87.82-1.8 1.2-2.85.65-1.73 1.9-3 3.6-3.65 1.03-.39 1.96-.8 2.82-1.23a1 1 0 0 0 .54-.9ZM17.1 6.54c.25.13.5.24.75.33.2.08.35.23.43.44l.32.76a1 1 0 0 0 1.8 0c.12-.25.23-.5.32-.76a.72.72 0 0 1 .43-.43c.25-.1.5-.2.76-.34a1 1 0 0 0 0-1.78c-.26-.13-.51-.23-.76-.33a.72.72 0 0 1-.43-.44l-.32-.76a1 1 0 0 0-1.8 0c-.12.26-.23.51-.32.76a.72.72 0 0 1-.43.44c-.25.1-.5.2-.75.33a1 1 0 0 0 0 1.78ZM22.45 17.18a9.3 9.3 0 0 0-.93-.4 1.2 1.2 0 0 1-.72-.73 9.88 9.88 0 0 0-.4-.95 1 1 0 0 0-1.8 0c-.15.32-.28.63-.4.94-.13.35-.38.6-.7.73-.32.12-.64.25-.95.42a1 1 0 0 0 0 1.78c.31.16.63.3.94.41.34.13.58.38.71.72.12.32.25.63.4.95a1 1 0 0 0 1.8 0c.16-.31.29-.63.4-.94.13-.35.38-.6.72-.73.3-.12.62-.25.93-.41a1 1 0 0 0 0-1.79Z"/></svg>
              </span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
