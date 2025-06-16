import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Note {
  strength: string;
  criticism: string;
  score: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  note?: Note;
  ended?: boolean;
}

interface InterviewState {
  messages: Message[];
  duration: number; // in seconds (e.g. 300 for 5 mins)
  timeRemaining: number;
  isPaused: boolean;
  timerInterval: NodeJS.Timeout | null;

  addMessage: (msg: Message) => void;
  resetInterview: () => void;
  endInterview: () => void;
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      messages: [],
      duration: 0,
      timeRemaining: 0,
      isPaused: false,
      timerInterval: null,

      addMessage: (msg) =>
        set((state) => ({
          messages: [...state.messages, msg],
        })),

      resetInterview: () => {
        clearInterval(get().timerInterval!);
        set({
          messages: [],
          duration: 0,
          timeRemaining: 0,
          isPaused: false,
          timerInterval: null,
        });
      },

      endInterview: () => {
        clearInterval(get().timerInterval!);
        set({
          timerInterval: null,
          isPaused: true,
        });
      },

      startTimer: (duration: number) => {
        clearInterval(get().timerInterval!);
        set({
          duration,
          timeRemaining: duration,
          isPaused: false,
        });

        const interval = setInterval(() => {
          const { timeRemaining, isPaused } = get();
          if (!isPaused && timeRemaining > 0) {
            set({ timeRemaining: timeRemaining - 1 });
          } else if (timeRemaining <= 0) {
            clearInterval(interval);
          }
        }, 1000);

        set({ timerInterval: interval });
      },

      pauseTimer: () => set({ isPaused: true }),
      resumeTimer: () => set({ isPaused: false }),
    }),
    {
      name: "interview-messages",
    }
  )
);
