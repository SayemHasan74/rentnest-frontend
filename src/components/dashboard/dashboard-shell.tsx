import Link from "next/link";
import type { ReactNode } from "react";
import {
  Building2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  Plus,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { getAccountNavigationLinks } from "@/lib/navigation";
import { roleLabels } from "@/lib/auth-session";
import type { UserRole } from "@/types/rentnest";

type DashboardShellProps = {
  children: ReactNode;
  role: UserRole;
};

const dashboardLinkIcons = {
  "Dashboard overview": LayoutDashboard,
  "My rental requests": ClipboardList,
  "Payment history": CreditCard,
  "Add a property": Plus,
  "My properties": Building2,
  "Rental requests": ClipboardList,
  "Manage users": UsersRound,
  "Manage categories": ShieldCheck,
  "Review properties": Building2,
  "Rental activity": ListChecks,
  "Support inbox": MessagesSquare,
  Profile: UserRound,
} as const;

function DashboardNavigation({ role, mobile = false }: { role: UserRole; mobile?: boolean }) {
  const links = getAccountNavigationLinks(role);

  return (
    <nav
      aria-label={`${roleLabels[role]} dashboard navigation`}
      className={mobile ? "flex min-w-max gap-2" : "grid gap-1"}
    >
      {links.map((link) => {
        const Icon = dashboardLinkIcons[link.label as keyof typeof dashboardLinkIcons];

        return (
          <Link
            className={mobile
              ? "inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-surface px-3 text-sm font-semibold text-slate-700 hover:border-emerald-700 hover:text-emerald-800"
              : "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"}
            href={link.href}
            key={link.href}
          >
            <Icon size={17} aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children, role }: DashboardShellProps) {
  return (
    <div className="bg-slate-50 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-slate-300 bg-surface lg:sticky lg:top-[4.5rem] lg:block lg:h-[calc(100vh-4.5rem)]">
        <div className="flex h-full flex-col p-5">
          <div className="border-b border-slate-200 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">RentNest</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{roleLabels[role]} workspace</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use the account menu above for Profile and Logout.</p>
          </div>
          <div className="mt-5"><DashboardNavigation role={role} /></div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="overflow-x-auto border-b border-slate-300 bg-surface px-4 py-3 lg:hidden sm:px-6">
          <DashboardNavigation mobile role={role} />
        </div>
        {children}
      </div>
    </div>
  );
}
