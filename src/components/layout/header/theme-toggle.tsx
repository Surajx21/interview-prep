"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { useModeAnimation } from "react-theme-switch-animation";
import { Toggle } from "@/components/ui/toggle";

export default function ThemeToggle() {
  const { ref, toggleSwitchTheme, isDarkMode } = useModeAnimation({
    duration: 400,
  });

  return (
    <div className="relative">
      <Toggle
        variant="outline"
        className="group data-[state=on]:hover:bg-muted text-muted-foreground data-[state=on]:text-muted-foreground data-[state=on]:hover:text-foreground size-8 rounded-full border-none shadow-none data-[state=on]:bg-transparent"
        pressed={isDarkMode}
        onPressedChange={toggleSwitchTheme}
        aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        ref={ref}
      >
        {/* Note: After dark mode implementation, rely on dark: prefix rather than group-data-[state=on]: */}
        <MoonIcon
          size={16}
          className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
          aria-hidden="true"
        />
        <SunIcon
          size={16}
          className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0"
          aria-hidden="true"
        />
      </Toggle>
    </div>
  );
}
