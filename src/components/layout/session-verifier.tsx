"use client";

import { useEffect } from "react";
import { api, ApiError } from "@/lib/api";
import {
  clearAuthSession,
  getStoredToken,
  persistAuthSession,
} from "@/lib/auth-session";

export function SessionVerifier() {
  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      return;
    }

    api.auth
      .me(token)
      .then((user) => persistAuthSession({ accessToken: token, user }))
      .catch((error: unknown) => {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearAuthSession();

          if (window.location.pathname.startsWith("/dashboard")) {
            const from = encodeURIComponent(window.location.pathname);
            window.location.assign(`/auth/login?from=${from}`);
          }
        }
      });
  }, []);

  return null;
}
