"use client";

import Link from "next/link";
import { useUserStore } from "@/lib/userStore";
import { useEffect, useState } from "react";
import { useHasMounted } from "@/lib/useHasMounted";

const DarkModeToggle = () => {
  const hasMounted = useHasMounted();
  const [dark, setDark] = useState<null | boolean>(null);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    setDark((prev) => {
      const newDark = !prev;
      localStorage.setItem("theme", newDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", newDark);
      return newDark;
    });
  };

  if (!hasMounted || dark === null) return null;

  return (
    <button
      onClick={toggleDark}
      className={`relative w-14 h-7 md:w-16 md:h-8 flex items-center rounded-full shadow-sm px-1 transition-colors cursor-pointer ${
        dark
          ? "bg-[#0f172a] hover:bg-[#1e293b]"
          : "bg-[#facc15] hover:bg-[#fbbf24]"
      }`}
      aria-label="Toggle dark mode"
    >
      <svg
        className={`w-4 h-4 absolute right-2 transition-all duration-300 ease-in-out ${
          dark ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="m13.273 5.865.831.303c.328.12.586.373.707.693l.307.82a1 1 0 0 0 1.873.001l.307-.818c.122-.322.38-.576.708-.695l.831-.303a1 1 0 0 0 0-1.878l-.831-.303a1.188 1.188 0 0 1-.707-.694l-.308-.82a1 1 0 0 0-1.873.001l-.306.817c-.122.322-.38.576-.708.695l-.831.303a1 1 0 0 0 0 1.878Z" />
        <path d="M22.386 12.003a1 1 0 0 0-1.151.279c-.928 1.106-2.507 1.621-4.968 1.621-3.814 0-6.179-1.03-6.179-6.158 0-2.397.532-4.019 1.626-4.957.33-.284.439-.749.269-1.15a.992.992 0 0 0-1.015-.604A10.953 10.953 0 0 0 1 11.977c0 6.062 4.944 10.994 11.022 10.994 5.72 0 10.438-4.278 10.973-9.951a.999.999 0 0 0-.609-1.017ZM12.023 20.97c-4.975 0-9.022-4.035-9.022-8.994a8.953 8.953 0 0 1 5.78-8.402c-.464 1.134-.692 2.517-.692 4.17 0 7.312 4.668 8.158 8.179 8.158 1.216 0 2.761-.094 4.177-.673-1.306 3.396-4.588 5.74-8.421 5.74Z" />
        <circle cx="18.49" cy="11.349" r="1" />
        <circle cx="13.99" cy="10.766" r="1" />
      </svg>

      <svg
        className={`w-5 h-5 absolute left-2 transition-all duration-300 ease-in-out ${
          dark ? "opacity-0 scale-90" : "opacity-100 scale-100"
        }`}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.95 7.05a.999.999 0 0 1 0-1.414l1.415-1.415a.999.999 0 1 1 1.414 1.414L18.364 7.05a.999.999 0 0 1-1.414 0zm-11.314 9.9-1.415 1.415a.999.999 0 1 0 1.414 1.414l1.415-1.415a.999.999 0 1 0-1.414-1.414zm12.728 0a.999.999 0 1 0-1.414 1.414l1.415 1.415a.999.999 0 1 0 1.414-1.414zM5.636 7.05A.999.999 0 1 0 7.05 5.636L5.635 4.221a.999.999 0 1 0-1.414 1.414zM12 5a1 1 0 0 0 1-1V2a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1zm0 14a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1zm10-8h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2zM5 12a1 1 0 0 0-1-1H2a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1zm12 0c0 3.411-1.589 5-5 5s-5-1.589-5-5 1.589-5 5-5 5 1.589 5 5zm-2 0c0-2.299-.701-3-3-3s-3 .701-3 3 .701 3 3 3 3-.701 3-3z" />
      </svg>

      <div
        className={`w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform ${
          dark ? "translate-x-0" : "translate-x-7 md:translate-x-8"
        }`}
      />
    </button>
  );
};

export default function Header() {
  const { name } = useUserStore((s) => s.formData);

  return (
    <header className="absolute top-0 left-0 w-full px-4 md:px-6 py-4 flex justify-between items-center z-20">
      <Link href="/">
        <h1 className="text-2xl logo text-indigo-950/80 hover:text-indigo-950 dark:text-white/80 hover:dark:text-white cursor-pointer transition">
          InterviewBot
        </h1>
      </Link>

      <div className="flex items-center gap-4 text-sm text-indigo-950/80 dark:text-white/80">
        {name && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-indigo-950 dark:text-white font-semibold text-xs shadow-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <span>
              Hey <strong>{name}</strong> 👋
            </span>
          </div>
        )}
        <DarkModeToggle />
      </div>
    </header>
  );
}
