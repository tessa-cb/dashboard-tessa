export type ThemePreference = "system" | "light" | "dark";
export type DensityPreference = "comfortable" | "compact";

const THEME_KEY = "dashboard-tessa:theme";
const DENSITY_KEY = "dashboard-tessa:density";

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function isDensityPreference(value: unknown): value is DensityPreference {
  return value === "comfortable" || value === "compact";
}

export function loadThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const raw = window.localStorage.getItem(THEME_KEY);
  return isThemePreference(raw) ? raw : "system";
}

export function saveThemePreference(theme: ThemePreference): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, theme);
}

export function loadDensityPreference(): DensityPreference {
  if (typeof window === "undefined") return "comfortable";
  const raw = window.localStorage.getItem(DENSITY_KEY);
  return isDensityPreference(raw) ? raw : "comfortable";
}

export function saveDensityPreference(density: DensityPreference): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DENSITY_KEY, density);
}

export function applyThemePreference(
  theme: ThemePreference,
  el?: HTMLElement,
): void {
  const docEl = el ?? (typeof document !== "undefined"
    ? document.documentElement
    : undefined);
  if (!docEl) return;

  // If unset, CSS will follow `prefers-color-scheme`.
  if (theme === "system") {
    docEl.removeAttribute("data-theme");
    return;
  }

  docEl.setAttribute("data-theme", theme);
}

export function applyDensityPreference(
  density: DensityPreference,
  el?: HTMLElement,
): void {
  const docEl = el ?? (typeof document !== "undefined"
    ? document.documentElement
    : undefined);
  if (!docEl) return;

  if (density === "compact") docEl.classList.add("compact");
  else docEl.classList.remove("compact");
}

