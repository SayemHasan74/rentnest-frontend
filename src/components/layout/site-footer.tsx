import Link from "next/link";
import { Building2 } from "lucide-react";

const footerLinks = [
  { href: "/properties", label: "Browse properties" },
  { href: "/auth/login", label: "Login" },
  { href: "/auth/register", label: "Register" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-700 text-white">
              <Building2 size={20} aria-hidden="true" />
            </span>
            <span>RentNest</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            A role-based rental property marketplace for tenants, landlords,
            and platform administrators.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">Navigation</h2>
          <ul className="mt-4 grid gap-3 text-sm text-slate-600">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link className="hover:text-emerald-700" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">Backend</h2>
          <p className="mt-4 break-all rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700">
            rentnest-server.onrender.com
          </p>
        </div>
      </div>
    </footer>
  );
}
