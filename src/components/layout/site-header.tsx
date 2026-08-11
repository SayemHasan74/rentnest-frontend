"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  Menu,
  Search,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { buttonClasses } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AccountMenu } from "@/components/layout/account-menu";
import {
  AUTH_SESSION_EVENT,
  clearAuthSession,
  getRoleDashboardPath,
  getStoredToken,
  getStoredUser,
  syncAuthCookies,
} from "@/lib/auth-session";
import { getPrimaryRoleLink, publicNavigationLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { User } from "@/types/rentnest";

const navIcons = {
  "Explore rentals": Search,
  Properties: Search,
  Dashboard: LayoutDashboard,
  "My rental requests": ClipboardList,
  "My properties": Building,
  "Manage users": UsersRound,
} as const;

const subscribeToAuthSession = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_SESSION_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_SESSION_EVENT, callback);
  };
};

const getAuthSnapshot = () =>
  JSON.stringify({ token: getStoredToken(), user: getStoredUser() });

const getServerAuthSnapshot = () => JSON.stringify({ token: null, user: null });

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const userSnapshot = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { token, user } = JSON.parse(userSnapshot) as {
    token: string | null;
    user: User | null;
  };
  const isAuthenticated = Boolean(token && user);
  const dashboardPath = user ? getRoleDashboardPath(user.role) : "/dashboard";
  const primaryRoleLink = user ? getPrimaryRoleLink(user.role) : null;
  const navLinks = [
    ...publicNavigationLinks,
    ...(isAuthenticated ? [{ href: dashboardPath, label: "Dashboard" }] : []),
    ...(isAuthenticated && primaryRoleLink ? [primaryRoleLink] : []),
  ];

  useEffect(() => {
    if (isAuthenticated && token && user) {
      syncAuthCookies(token, user);
    }
  }, [isAuthenticated, token, user]);

  const handleLogout = () => {
    clearAuthSession();
    setIsOpen(false);
    window.location.assign("/");
  };

  const authActions = isAuthenticated && user ? (
    <AccountMenu onLogout={handleLogout} user={user} />
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
    <header className="sticky top-0 z-[60] border-b border-slate-300 bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link className="flex items-center gap-2.5 font-bold text-slate-950" href="/">
          <Building size={23} strokeWidth={1.7} aria-hidden="true" />
          <span className="text-xl">RentNest</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((item) => {
            const Icon = navIcons[item.label as keyof typeof navIcons];
            const routePath = item.href.split("#")[0];
            const isActive = !item.href.includes("#") && pathname.startsWith(routePath);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
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

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {authActions}
        </div>

        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className={buttonClasses({ variant: "outline", size: "icon", className: "lg:hidden" })}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-300 bg-surface px-4 py-4 lg:hidden">
          <nav className="grid gap-2" aria-label="Mobile navigation">
            {navLinks.map((item) => {
              const Icon = navIcons[item.label as keyof typeof navIcons];
              const routePath = item.href.split("#")[0];
              const isActive = !item.href.includes("#") && pathname.startsWith(routePath);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-2 border-b border-slate-200 px-1 text-sm font-semibold text-slate-700 hover:text-slate-950",
                    isActive && "border-slate-950 text-slate-950",
                  )}
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
            <ThemeToggle showLabel />
            {isAuthenticated && user ? (
              <AccountMenu
                mobile
                onLogout={handleLogout}
                onNavigate={() => setIsOpen(false)}
                user={user}
              />
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
