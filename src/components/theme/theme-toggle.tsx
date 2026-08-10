"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <Button
      aria-label={`Switch to ${nextTheme} mode`}
      className={cn(showLabel && "w-full justify-start")}
      onClick={toggleTheme}
      size={showLabel ? "md" : "icon"}
      title={`Switch to ${nextTheme} mode`}
      variant="ghost"
    >
      <Icon size={17} aria-hidden="true" />
      {showLabel ? <span>Use {nextTheme} mode</span> : null}
    </Button>
  );
}
