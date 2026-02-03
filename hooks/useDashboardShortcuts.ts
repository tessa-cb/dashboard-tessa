"use client";

import { useEffect } from "react";

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;

  const tag = el.tagName;
  if (tag === "INPUT") return true;
  if (tag === "TEXTAREA") return true;
  if (tag === "SELECT") return true;

  return false;
}

export function useDashboardShortcuts({
  onRefreshAll,
  onCycleTheme,
  onToggleDensity,
  onToggleHelp,
}: {
  onRefreshAll: () => void;
  onCycleTheme: () => void;
  onToggleDensity: () => void;
  onToggleHelp: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (isEditableTarget(e.target)) return;

      // Help: Shift+/ -> "?" OR event.key === "?"
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        onToggleHelp();
        return;
      }

      // Refresh all
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        onRefreshAll();
        return;
      }

      // Theme cycle
      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        onCycleTheme();
        return;
      }

      // Density toggle
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        onToggleDensity();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCycleTheme, onRefreshAll, onToggleDensity, onToggleHelp]);
}

