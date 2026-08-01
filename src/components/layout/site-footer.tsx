import Link from "next/link";
import { ArrowUpRight, Building } from "lucide-react";

const footerLinks = [
  { href: "/home", label: "Home" },
  { href: "/properties", label: "Browse properties" },
  { href: "/auth/login", label: "Login" },
  { href: "/auth/register", label: "Register" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black bg-black text-white">
      <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-10">
        <div>
          <div className="flex items-center gap-2.5 text-xl font-bold text-white">
            <Building size={23} strokeWidth={1.7} aria-hidden="true" />
            <span>RentNest</span>
          </div>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
            A considered rental marketplace connecting tenants with homes and
            landlords with the people looking for them.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase text-slate-400">Explore</h2>
          <ul className="mt-5 grid gap-3 text-sm text-white">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link className="inline-flex items-center gap-1.5 hover:text-slate-300" href={link.href}>
                  {link.label}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase text-slate-400">Platform</h2>
          <p className="mt-5 max-w-xs text-sm leading-6 text-slate-300">
            Secure accounts, role-based dashboards, rental requests, payments,
            and reviews in one connected experience.
          </p>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-2 border-t border-slate-800 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>RentNest rental marketplace</p>
        <p>Built for tenants, landlords, and administrators</p>
      </div>
    </footer>
  );
}
