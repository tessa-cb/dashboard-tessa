"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyDensityPreference,
  applyThemePreference,
  DensityPreference,
  loadDensityPreference,
  loadThemePreference,
  saveDensityPreference,
  saveThemePreference,
  ThemePreference,
} from "@/lib/uiPreferences";

function cycleTheme(theme: ThemePreference): ThemePreference {
  if (theme === "system") return "light";
  if (theme === "light") return "dark";
  return "system";
}

export function useUiPreferences() {
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [density, setDensity] = useState<DensityPreference>("comfortable");

  useEffect(() => {
    const t = loadThemePreference();
    const d = loadDensityPreference();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(t);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDensity(d);

    applyThemePreference(t);
    applyDensityPreference(d);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveThemePreference(theme);
    applyThemePreference(theme);
  }, [hydrated, theme]);

  useEffect(() => {
    if (!hydrated) return;
    saveDensityPreference(density);
    applyDensityPreference(density);
  }, [density, hydrated]);

  const themeLabel = useMemo(() => {
    switch (theme) {
      case "system":
        return "System";
      case "light":
        return "Light";
      case "dark":
        return "Dark";
    }
    // Safety net for unexpected values.
    return "System";
  }, [theme]);

  const densityLabel = useMemo(
    () => (density === "compact" ? "Compact" : "Comfortable"),
    [density],
  );

  const toggleDensity = useCallback(() => {
    setDensity((d) => (d === "compact" ? "comfortable" : "compact"));
  }, []);

  const cycleThemePreference = useCallback(() => {
    setTheme((t) => cycleTheme(t));
  }, []);

  return {
    hydrated,
    theme,
    setTheme,
    cycleTheme: cycleThemePreference,
    themeLabel,
    density,
    setDensity,
    toggleDensity,
    densityLabel,
  };
}
