"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";
import {
  clearAuthSession,
  getStoredToken,
  persistAuthSession,
} from "@/lib/auth-session";

export function SessionVerifier() {
  const [errorMessage, setErrorMessage] = useState("");

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

          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "RentNest could not verify your session. Please try again.",
        );
      });
  }, []);

  return <Toast message={errorMessage} tone="error" />;
}
