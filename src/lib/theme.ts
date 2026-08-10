export const THEME_STORAGE_KEY = "rentnest-theme";
export const THEME_CHANGE_EVENT = "rentnest-theme-change";

export type Theme = "light" | "dark";

export const themeInitializationScript = `(() => {
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
  } catch (_) {}
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const theme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : systemTheme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();`;
