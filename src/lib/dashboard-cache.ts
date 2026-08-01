const CACHE_PREFIX = "rentnest_dashboard_cache";
const CACHE_MAX_AGE_MS = 5 * 60 * 1000;

type CachedValue<T> = {
  savedAt: number;
  value: T;
};

const isBrowser = () => typeof window !== "undefined";

export const getDashboardCache = <T>(key: string): T | null => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(`${CACHE_PREFIX}:${key}`);

    if (!rawValue) {
      return null;
    }

    const cached = JSON.parse(rawValue) as CachedValue<T>;

    if (Date.now() - cached.savedAt > CACHE_MAX_AGE_MS) {
      window.sessionStorage.removeItem(`${CACHE_PREFIX}:${key}`);
      return null;
    }

    return cached.value;
  } catch {
    return null;
  }
};

export const setDashboardCache = <T>(key: string, value: T) => {
  if (!isBrowser()) {
    return;
  }

  const cached: CachedValue<T> = {
    savedAt: Date.now(),
    value,
  };

  window.sessionStorage.setItem(`${CACHE_PREFIX}:${key}`, JSON.stringify(cached));
};
