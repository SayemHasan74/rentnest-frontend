"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSyncExternalStore } from "react";
import { buttonClasses } from "@/components/ui/button";
import {
  AUTH_SESSION_EVENT,
  getHomeRoleAction,
  getStoredUser,
} from "@/lib/auth-session";
import type { User } from "@/types/rentnest";

const subscribeToAuthSession = (callback: () => void) => {
  window.addEventListener(AUTH_SESSION_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};

const getUserSnapshot = () => JSON.stringify(getStoredUser());
const getServerUserSnapshot = () => "null";

export function HomeHeroActions({ inverted = false }: { inverted?: boolean }) {
  const userSnapshot = useSyncExternalStore(
    subscribeToAuthSession,
    getUserSnapshot,
    getServerUserSnapshot,
  );
  const action = getHomeRoleAction(JSON.parse(userSnapshot) as User | null);

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link className={buttonClasses({ size: "lg" })} href="/properties">
        Browse all properties
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
      <Link
        className={buttonClasses({
          variant: "outline",
          size: "lg",
          className: inverted
            ? "border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white"
            : undefined,
        })}
        href={action.href}
      >
        {action.label}
      </Link>
    </div>
  );
}
