import type { AuthPayload, User, UserRole } from "@/types/rentnest";
import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/auth-constants";

export const AUTH_TOKEN_KEY = "rentnest_access_token";
export const AUTH_USER_KEY = "rentnest_user";
export const AUTH_SESSION_EVENT = "rentnest-auth-session";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const isBrowser = () => typeof window !== "undefined";

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const setCookie = (name: string, value: string, maxAge = COOKIE_MAX_AGE_SECONDS) => {
  if (!isBrowser()) {
    return;
  }

  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${maxAge}`,
    "samesite=lax",
  ].join("; ");
};

const deleteCookie = (name: string) => {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

export const syncAuthCookies = (accessToken: string, user: User) => {
  setCookie(AUTH_TOKEN_COOKIE, accessToken);
  setCookie(AUTH_ROLE_COOKIE, user.role);
};

export const persistAuthSession = ({ accessToken, user }: AuthPayload) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  syncAuthCookies(accessToken, user);
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

export const clearAuthSession = () => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  deleteCookie(AUTH_TOKEN_COOKIE);
  deleteCookie(AUTH_ROLE_COOKIE);
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

export const getStoredToken = () => {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getStoredUser = () => {
  if (!isBrowser()) {
    return null;
  }

  return safeJsonParse<User>(window.localStorage.getItem(AUTH_USER_KEY));
};

export const getStoredRole = () => getStoredUser()?.role ?? null;

export const hasStoredSession = () => Boolean(getStoredToken() && getStoredUser());

export const getRoleDashboardPath = (role: UserRole) => {
  const dashboardPaths: Record<UserRole, string> = {
    TENANT: "/dashboard/tenant",
    LANDLORD: "/dashboard/landlord",
    ADMIN: "/dashboard/admin",
  };

  return dashboardPaths[role];
};

export const getPaymentResultAction = (user: User | null) => {
  if (!user) {
    return {
      href: "/auth/login?from=%2Fdashboard%2Ftenant",
      label: "Login to view dashboard",
    };
  }

  return {
    href: getRoleDashboardPath(user.role),
    label: `${roleLabels[user.role]} dashboard`,
  };
};

export const getHomeRoleAction = (user: User | null) => {
  if (user?.role === "LANDLORD") {
    return {
      href: "/dashboard/landlord#add-property",
      label: "List a property",
    };
  }

  if (user?.role === "TENANT") {
    return {
      href: "/dashboard/tenant#my-requests",
      label: "View my requests",
    };
  }

  if (user?.role === "ADMIN") {
    return {
      href: "/dashboard/admin",
      label: "Open moderation",
    };
  }

  return {
    href: "/auth/register",
    label: "List your property",
  };
};

export const getSafePostLoginPath = (role: UserRole, from: string | null) => {
  const dashboardPath = getRoleDashboardPath(role);

  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return "/home";
  }

  if (from === "/dashboard") {
    return dashboardPath;
  }

  if (from.startsWith("/dashboard")) {
    return from === dashboardPath || from.startsWith(`${dashboardPath}/`)
      ? from
      : dashboardPath;
  }

  return from === "/" || from === "/home" || from.startsWith("/properties") || from.startsWith("/contact")
    ? from
    : dashboardPath;
};

export const canAccessRole = (userRole: UserRole | null, allowedRoles: UserRole[]) =>
  Boolean(userRole && allowedRoles.includes(userRole));

export const roleLabels: Record<UserRole, string> = {
  TENANT: "Tenant",
  LANDLORD: "Landlord",
  ADMIN: "Admin",
};
