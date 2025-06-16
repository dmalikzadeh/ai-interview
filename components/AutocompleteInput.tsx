"use client";

import { useState, useEffect, useRef } from "react";

interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  suggestions: string[];
  maxLength?: number; // ✅ Added this line
}

export default function AutocompleteInput({
  value,
  onChange,
  placeholder,
  suggestions,
  maxLength,
}: AutocompleteInputProps) {
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const inputLower = value.toLowerCase().trim();

    if (inputLower.length < 2) {
      setFiltered([]);
      setShowSuggestions(false);
      return;
    }

    const matches = suggestions.filter((item) =>
      item.toLowerCase().includes(inputLower)
    );
    setFiltered(matches);
    setShowSuggestions(matches.length > 0);
  }, [value, suggestions]);

  const handleSelect = (val: string) => {
    onChange(val);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength} // ✅ Added this line
        className="w-full bg-black/5 dark:bg-white/10 border border-transparent backdrop-blur-md shadow-xs text-indigo-950 placeholder-indigo-950/60 dark:text-white dark:placeholder-white/60 rounded-full px-6 py-3 focus:outline-none focus:bg-transparent focus:border focus:border-black/10 focus:dark:border-white/30 transition"
        onFocus={() => setShowSuggestions(filtered.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay to allow click
      />
      {showSuggestions && (
        <ul className="absolute top-full mt-2 left-0 w-full z-50 bg-white text-black rounded-xl shadow-lg overflow-y-auto max-h-60">          {filtered.map((item) => (
            <li
              key={item}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
