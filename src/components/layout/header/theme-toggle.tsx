"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useModeAnimation } from "react-theme-switch-animation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { ref, toggleSwitchTheme, isDarkMode } = useModeAnimation({
    duration: 400,
  });

  // Prevent hydration mismatch by only rendering theme-specific content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="bg-muted text-muted-foreground rounded-full border-none"
              size="icon"
              disabled
            >
              <SunIcon size={16} className="opacity-0" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle theme</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="bg-muted text-muted-foreground rounded-full border-none"
            onClick={toggleSwitchTheme}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            ref={ref}
            size="icon"
          >
            {isDarkMode ? (
              <MoonIcon size={16} aria-hidden="true" />
            ) : (
              <SunIcon size={16} aria-hidden="true" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle theme</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
