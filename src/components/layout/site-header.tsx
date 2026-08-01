"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import {
  AUTH_SESSION_EVENT,
  clearAuthSession,
  getStoredUser,
  roleLabels,
} from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import type { User } from "@/types/rentnest";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties", icon: Search },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const subscribeToAuthSession = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_SESSION_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_SESSION_EVENT, callback);
  };
};

const getAuthSnapshot = () => JSON.stringify(getStoredUser());

const getServerAuthSnapshot = () => JSON.stringify(null);

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const userSnapshot = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const user = JSON.parse(userSnapshot) as User | null;

  const handleLogout = () => {
    clearAuthSession();
    setIsOpen(false);
    router.push("/");
  };

  const authActions = user ? (
    <>
      <Link
        className={buttonClasses({ variant: "ghost" })}
        href="/dashboard"
      >
        <LayoutDashboard size={16} aria-hidden="true" />
        {roleLabels[user.role]}
      </Link>
      <Button onClick={handleLogout} variant="outline">
        <LogOut size={16} aria-hidden="true" />
        Logout
      </Button>
    </>
  ) : (
    <>
      <Link
        className={buttonClasses({ variant: "ghost" })}
        href="/auth/login"
      >
        <LogIn size={16} aria-hidden="true" />
        Login
      </Link>
      <Link
        className={buttonClasses({ variant: "primary" })}
        href="/auth/register"
      >
        <UserPlus size={16} aria-hidden="true" />
        Register
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-300 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link className="flex items-center gap-2.5 font-bold text-slate-950" href="/">
          <Building size={23} strokeWidth={1.7} aria-hidden="true" />
          <span className="text-xl">RentNest</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                className={cn(
                  "inline-flex h-10 items-center gap-2 border-b border-transparent px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950",
                  isActive && "border-slate-950 text-slate-950",
                )}
                href={item.href}
                key={item.href}
              >
                {Icon ? <Icon size={16} aria-hidden="true" /> : null}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">{authActions}</div>

        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className={buttonClasses({ variant: "outline", size: "icon", className: "md:hidden" })}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-300 bg-white px-4 py-4 md:hidden">
          <nav className="grid gap-2" aria-label="Mobile navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="flex h-10 items-center gap-2 border-b border-slate-200 px-1 text-sm font-semibold text-slate-700 hover:text-slate-950"
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {Icon ? <Icon size={16} aria-hidden="true" /> : null}
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 grid gap-2">
            {user ? (
              <>
                <Link
                  className={buttonClasses({ variant: "outline" })}
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={16} aria-hidden="true" />
                  {roleLabels[user.role]} dashboard
                </Link>
                <Button onClick={handleLogout} variant="outline">
                  <LogOut size={16} aria-hidden="true" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  className={buttonClasses({ variant: "outline" })}
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn size={16} aria-hidden="true" />
                  Login
                </Link>
                <Link
                  className={buttonClasses({ variant: "primary" })}
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                >
                  <UserPlus size={16} aria-hidden="true" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
