export {
  canAccessRole,
  clearAuthSession,
  AUTH_SESSION_EVENT,
  getRoleDashboardPath,
  getSafePostLoginPath,
  getStoredRole,
  getStoredToken,
  getStoredUser,
  hasStoredSession,
  persistAuthSession,
  roleLabels,
  syncAuthCookies,
} from "@/lib/auth";

export { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/auth-constants";
