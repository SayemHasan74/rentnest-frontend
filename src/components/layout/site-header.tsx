"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, LogIn, Menu, Search, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties", icon: Search },
  { href: "/dashboard/tenant", label: "Dashboard", icon: LayoutDashboard },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2 font-bold text-slate-950" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-700 text-white">
            <Building2 size={20} aria-hidden="true" />
          </span>
          <span className="text-lg">RentNest</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                  isActive && "bg-slate-100 text-slate-950",
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

        <div className="hidden items-center gap-2 md:flex">
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
        </div>

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
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-sm md:hidden">
          <nav className="grid gap-2" aria-label="Mobile navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
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
          </div>
        </div>
      ) : null}
    </header>
  );
}
