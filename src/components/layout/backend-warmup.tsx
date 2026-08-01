"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-session";

const WARMUP_KEY = "rentnest_backend_warmed";

export function BackendWarmup() {
  const [error, setError] = useState("");

  useEffect(() => {
    if (getStoredToken() || window.sessionStorage.getItem(WARMUP_KEY)) {
      return;
    }

    window.sessionStorage.setItem(WARMUP_KEY, "true");
    api.health().catch(() => {
      window.sessionStorage.removeItem(WARMUP_KEY);
      setError("RentNest could not reach the backend. Some live data may be unavailable.");
    });
  }, []);

  return <Toast message={error} tone="error" />;
}
