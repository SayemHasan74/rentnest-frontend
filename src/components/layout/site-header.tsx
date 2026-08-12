"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building,
  ClipboardList,
  House,
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
  Home: House,
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
    ...(isAuthenticated ? [{ href: "/home", label: "Home" }] : []),
    ...publicNavigationLinks.filter(
      (link) => !(isAuthenticated && link.href === "/"),
    ),
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

  if (pathname === "/home") {
    return (
      <header className="sticky top-0 z-[60] border-b border-slate-300 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.5rem] w-full max-w-[1440px] items-center gap-4 px-4 sm:px-7">
          <Link className="flex shrink-0 items-center gap-2 font-bold text-slate-950" href="/">
            <Building size={22} className="rounded-md bg-primary p-1 text-primary-foreground" aria-hidden="true" />
            <span>RentNest</span>
          </Link>
          <form action="/properties" className="hidden min-w-0 max-w-2xl flex-1 overflow-hidden rounded-xl border border-slate-300 bg-surface md:flex">
            <label className="flex min-w-0 flex-1 flex-col justify-center border-r border-slate-300 px-4 py-2"><span className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">Location</span><input className="min-w-0 bg-transparent text-sm text-slate-950 outline-none" name="location" placeholder="Dhaka, all areas" /></label>
            <label className="flex flex-1 flex-col justify-center border-r border-slate-300 px-4 py-2"><span className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">Budget</span><select className="bg-transparent text-sm text-slate-950 outline-none" defaultValue="" name="maxPrice"><option value="">Any budget</option><option value="30000">Up to ৳30k</option><option value="50000">Up to ৳50k</option><option value="80000">Up to ৳80k</option><option value="120000">Up to ৳120k</option></select></label>
            <input name="page" type="hidden" value="1" />
            <button className="inline-flex items-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover" type="submit"><Search size={15} aria-hidden="true" />Search</button>
          </form>
          <div className="ml-auto flex items-center gap-2"><ThemeToggle />{authActions}</div>
        </div>
        <nav className="overflow-x-auto border-t border-slate-300" aria-label="Main navigation">
          <div className="mx-auto flex h-12 w-max min-w-full items-center justify-center gap-1 px-4 sm:px-7">
            {navLinks.map((item) => {
              const Icon = navIcons[item.label as keyof typeof navIcons];
              const routePath = item.href.split("#")[0];
              const isActive = !item.href.includes("#") && pathname.startsWith(routePath);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex h-12 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-950",
                    isActive && "border-primary text-slate-950",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {Icon ? <Icon size={17} aria-hidden="true" /> : null}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
    );
  }

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
