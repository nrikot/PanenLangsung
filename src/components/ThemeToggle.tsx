"use client";

import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 ${
        theme === "dark"
          ? "border-white/10 bg-white/5 text-[#8b9e93] hover:border-white/20 hover:bg-white/10 hover:text-gray-100"
          : "border-black/10 bg-black/5 text-slate-500 hover:border-black/15 hover:bg-black/8 hover:text-slate-700"
      } ${className}`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
