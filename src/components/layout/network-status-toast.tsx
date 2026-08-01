"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui/toast";

export function NetworkStatusToast() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!window.navigator.onLine);

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <Toast
      message={
        isOffline
          ? "You are offline. Check your connection before using live RentNest features."
          : ""
      }
      placement="bottom"
      tone="error"
    />
  );
}
