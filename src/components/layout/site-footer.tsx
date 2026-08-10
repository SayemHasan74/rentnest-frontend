import Link from "next/link";
import {
  ArrowUpRight,
  Building,
  GitBranch,
  Globe2,
  Mail,
  MapPin,
  MessagesSquare,
  UserRound,
} from "lucide-react";

const footerLinks = [
  { href: "/home", label: "Home" },
  { href: "/properties", label: "Browse properties" },
  { href: "/about", label: "About RentNest" },
  { href: "/help", label: "Help & support" },
  { href: "/contact", label: "Contact us" },
  { href: "/auth/login", label: "Login" },
  { href: "/auth/register", label: "Register" },
];

const projectLinks = [
  {
    href: "https://github.com/SayemHasan74/rentnest-frontend",
    label: "Frontend source",
  },
  {
    href: "https://github.com/SayemHasan74/rentnest-server",
    label: "Backend source",
  },
];

const socialLinks = [
  {
    href: "https://github.com/SayemHasan74",
    icon: GitBranch,
    label: "GitHub profile",
  },
  {
    href: "https://portfolio-rose-sigma-60.vercel.app/",
    icon: Globe2,
    label: "Developer portfolio",
  },
  {
    href: "https://www.facebook.com/hasanmohammadsayem.sayem",
    icon: MessagesSquare,
    label: "Facebook profile",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black bg-black text-white">
      <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.35fr_0.8fr_0.9fr_1fr] lg:px-10">
        <div>
          <Link className="flex items-center gap-2.5 text-xl font-bold text-white" href="/home">
            <Building size={23} strokeWidth={1.7} aria-hidden="true" />
            <span>RentNest</span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/65">
            A considered rental marketplace connecting tenants with homes and
            landlords with the people looking for them.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase text-white/55">Explore</h2>
          <ul className="mt-5 grid gap-3 text-sm text-white">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link className="inline-flex items-center gap-1.5 hover:text-white/70" href={link.href}>
                  {link.label}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase text-white/55">Project</h2>
          <ul className="mt-5 grid gap-3 text-sm text-white">
            {projectLinks.map((link) => (
              <li key={link.href}>
                <a
                  className="inline-flex items-center gap-1.5 hover:text-white/70"
                  href={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase text-white/55">Contact</h2>
          <div className="mt-5 flex items-start gap-2.5 text-sm text-white/70">
            <UserRound className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">Hasan Mohammad Sayem</p>
              <p className="mt-1 text-xs leading-5 text-white/50">RentNest project maintainer</p>
            </div>
          </div>
          <a
            className="mt-4 flex items-start gap-2 text-sm text-white/70 hover:text-white"
            href="mailto:sayemhasan4700@gmail.com"
          >
            <Mail className="mt-0.5 shrink-0" size={15} aria-hidden="true" />
            <span className="break-all">sayemhasan4700@gmail.com</span>
          </a>
          <p className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <MapPin className="shrink-0" size={15} aria-hidden="true" />
            Badda, Dhaka
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {socialLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-white/25 text-white transition-colors hover:border-white/50 hover:bg-white/10"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                  title={link.label}
                >
                  <Icon size={17} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-2 border-t border-white/15 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>© {new Date().getFullYear()} RentNest rental marketplace</p>
        <p>Built for tenants, landlords, and administrators</p>
      </div>
    </footer>
  );
}
