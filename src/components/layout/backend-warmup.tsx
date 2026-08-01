"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

const WARMUP_KEY = "rentnest_backend_warmed";

export function BackendWarmup() {
  useEffect(() => {
    if (window.sessionStorage.getItem(WARMUP_KEY)) {
      return;
    }

    window.sessionStorage.setItem(WARMUP_KEY, "true");
    api.health().catch(() => window.sessionStorage.removeItem(WARMUP_KEY));
  }, []);

  return null;
}
