"use client";

import { SessionProvider } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const themeListeners = new Set<() => void>();

function notifyThemeChange() {
  themeListeners.forEach((cb) => cb());
}

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    themeListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {}
  return "system";
}

function subscribeSystem(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function readSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const getServerTheme = (): Theme => "system";
const getServerSystem = (): "light" | "dark" => "light";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, readStoredTheme, getServerTheme);
  const systemTheme = useSyncExternalStore(subscribeSystem, readSystemTheme, getServerSystem);
  const resolvedTheme: "light" | "dark" = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme, resolvedTheme]);

  const setTheme = useCallback((t: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {}
    notifyThemeChange();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "system" as Theme,
      setTheme: () => {},
      resolvedTheme: "light" as const,
    };
  }
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
