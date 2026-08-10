"use client";

import Link from "next/link";
import {
  Building2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { getAccountNavigationLinks } from "@/lib/navigation";
import { roleLabels } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import type { User } from "@/types/rentnest";

type AccountMenuProps = {
  mobile?: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
  user: User;
};

const linkIcons = {
  "Dashboard overview": LayoutDashboard,
  "My rental requests": ClipboardList,
  "Payment history": CreditCard,
  "Add a property": Plus,
  "My properties": Building2,
  "Rental requests": ClipboardList,
  "Manage users": UsersRound,
  "Manage categories": ShieldCheck,
  "Review properties": Building2,
} as const;

export function AccountMenu({
  mobile = false,
  onLogout,
  onNavigate,
  user,
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const links = getAccountNavigationLinks(user.role);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeAndNavigate = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  return (
    <div className={cn("relative", mobile && "w-full")} ref={containerRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={buttonClasses({
          variant: "outline",
          className: cn(mobile ? "w-full justify-between" : "max-w-52"),
        })}
        onClick={() => setIsOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <UserRound className="shrink-0" size={16} aria-hidden="true" />
          <span className="truncate">{user.name}</span>
        </span>
        <ChevronDown
          className={cn("shrink-0 transition-transform", isOpen && "rotate-180")}
          size={15}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          aria-label="Account navigation"
          className={cn(
            "z-50 overflow-hidden rounded-md border border-slate-300 bg-surface shadow-xl",
            mobile ? "mt-2 w-full" : "absolute right-0 top-full mt-2 w-72",
          )}
          id={menuId}
          role="menu"
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-950">{user.name}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
            <p className="mt-2 text-xs font-semibold uppercase text-emerald-700">
              {roleLabels[user.role]} account
            </p>
          </div>
          <div className="p-1.5">
            {links.map((link) => {
              const Icon = linkIcons[link.label as keyof typeof linkIcons];

              return (
                <Link
                  className="flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-offset-0"
                  href={link.href}
                  key={link.href}
                  onClick={closeAndNavigate}
                  role="menuitem"
                >
                  <Icon size={16} aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-slate-200 p-1.5">
            <button
              className={buttonClasses({
                variant: "ghost",
                className: "w-full justify-start text-red-700 hover:bg-red-50 hover:text-red-700",
              })}
              onClick={onLogout}
              role="menuitem"
              type="button"
            >
              <LogOut size={16} aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
