import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  CreditCard,
  Search,
  ShieldCheck,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Property } from "@/types/rentnest";

export const metadata: Metadata = {
  title: "RentNest | A calmer way to call Dhaka home",
  description:
    "Verified rental homes, transparent pricing, and a clearer way to find your next place in Dhaka.",
};

const areaGradients = [
  "from-[#1e3a34]",
  "from-[#2a2a1e]",
  "from-[#1e2a3a]",
  "from-[#2a1e2e]",
];

const roles = [
  {
    title: "Tenant",
    description:
      "Search with real filters, request rentals directly, and keep every home you have viewed in one place.",
    items: ["Save and compare listings", "Request a rental in-app", "Pay securely after approval"],
  },
  {
    title: "Landlord",
    description:
      "List a property in minutes, review interest, and manage every request from one clear dashboard.",
    items: ["Publish in under five minutes", "Track views and requests", "Approve tenants with confidence"],
  },
  {
    title: "Administrator",
    description:
      "Maintain a reliable marketplace with the tools to review users, listings, and activity at a glance.",
    items: ["Review marketplace activity", "Manage categories and users", "Keep listings trustworthy"],
  },
];

const rentalSteps = [
  {
    number: "01",
    title: "Search with context",
    description:
      "Compare live homes by area, monthly rent, property type, and the amenities that matter to you.",
    icon: Search,
  },
  {
    number: "02",
    title: "Request the right home",
    description:
      "Open the full listing, review its specifications, and send your preferred move-in details directly to the landlord.",
    icon: ClipboardCheck,
  },
  {
    number: "03",
    title: "Pay after approval",
    description:
      "Once a landlord approves the request, complete the rental payment through the protected Stripe checkout flow.",
    icon: CreditCard,
  },
];

const getAreaName = (location: string) => location.split(",")[0]?.trim() || location;

const getLandingStatistics = (properties: Property[]) => {
  const areaCounts = new Map<string, number>();

  properties.forEach((property) => {
    const area = getAreaName(property.location);
    areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
  });

  const areas = [...areaCounts.entries()]
    .sort(([leftName, leftCount], [rightName, rightCount]) =>
      rightCount - leftCount || leftName.localeCompare(rightName),
    )
    .map(([name, count], index) => ({
      name,
      count,
      className: areaGradients[index % areaGradients.length],
    }));
  const rents = properties.map((property) => Number(property.rentAmount));
  const totalRent = rents.reduce((total, rent) => total + rent, 0);

  return {
    availableHomes: properties.filter((property) => property.status === "AVAILABLE").length,
    averageRent: properties.length ? Math.round(totalRent / properties.length) : 0,
    areas,
    highestRent: rents.length ? Math.max(...rents) : 0,
    lowestRent: rents.length ? Math.min(...rents) : 0,
    propertyTypes: new Set(
      properties.map((property) => property.category?.name).filter(Boolean),
    ).size,
    ratings: properties.reduce(
      (total, property) => total + (property.reviews?.length ?? 0),
      0,
    ),
    totalHomes: properties.length,
  };
};

const getLandingProperties = async () => {
  try {
    const response = await api.properties.list({ limit: 100 });
    return response.properties;
  } catch {
    return [];
  }
};

export default async function LandingPage() {
  const properties = await getLandingProperties();
  const statistics = getLandingStatistics(properties);
  const featuredHomes = properties.slice(0, 3);
  const featuredAreas = statistics.areas.slice(0, 4);
  const tickerAreas = statistics.areas.map((area) => area.name);
  const hasLiveStatistics = statistics.totalHomes > 0;
  const snapshotRows = hasLiveStatistics
    ? [
        ["Available homes", formatNumber(statistics.availableHomes)],
        ["Areas represented", formatNumber(statistics.areas.length)],
        ["Average monthly rent", formatCurrency(statistics.averageRent)],
      ]
    : [];
  const marketplaceStatistics = hasLiveStatistics
    ? [
        [formatNumber(statistics.totalHomes), "Public rental listings"],
        [formatNumber(statistics.areas.length), "Areas represented"],
        [formatNumber(statistics.propertyTypes), "Property types listed"],
        [formatNumber(statistics.ratings), "Submitted ratings"],
      ]
    : [];

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-slate-300">
        <div className="pointer-events-none absolute inset-x-[-10%] top-[-20%] h-[38rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--rn-primary)_12%,transparent),transparent_60%)]" />
        <div className="relative mx-auto grid w-full max-w-[1180px] gap-10 px-6 py-20 sm:px-8 lg:grid-cols-[1.1fr_.8fr] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 before:text-primary before:content-['✦']">
              Thoughtful rentals, Dhaka
            </p>
            <h1 className="mt-6 max-w-3xl font-serif text-5xl font-medium leading-[1.02] tracking-[-0.03em] text-slate-950 sm:text-7xl">
              A calmer way<br />to call Dhaka<br /><em className="font-normal text-primary">home.</em>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              No cold calls, no guessing games. Verified listings, transparent pricing, and a process built so you always know what happens next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={buttonClasses({ size: "lg", className: "rounded-full px-6" })} href="/properties">
                Explore homes <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className={buttonClasses({ variant: "outline", size: "lg", className: "rounded-full px-6" })} href="/auth/register">
                List your property
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {["No broker spam", "Verified owners only", "Free to browse"].map((item) => (
                <span className="flex items-center gap-2 text-xs text-slate-400" key={item}>
                  <i className="h-1.5 w-1.5 rounded-full bg-primary" />{item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-5 lg:pt-0">
            <div className="w-px bg-gradient-to-b from-slate-300 to-slate-400">
              <div className="h-[52px]" />
              <aside className="relative ml-[-140px] w-[280px] rotate-[-4deg] rounded-2xl border border-slate-300 bg-surface px-7 pb-7 pt-8 shadow-2xl shadow-black/20">
                <i className="absolute left-1/2 top-[-9px] h-4 w-4 -translate-x-1/2 rounded-full border border-slate-300 bg-background" />
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-slate-400">Live marketplace snapshot</p>
                {snapshotRows.length ? snapshotRows.map(([label, value]) => (
                    <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-dashed border-slate-300 pt-3 first:border-t-0 first:pt-0" key={label}>
                      <span className="text-xs text-slate-500">{label}</span><b className="text-right font-mono text-base font-semibold text-primary">{value}</b>
                    </div>
                  )) : (
                    <p className="mt-4 border-t border-dashed border-slate-300 pt-4 text-xs leading-5 text-slate-500">
                      Live listing totals are temporarily unavailable. Browse properties to try again.
                    </p>
                  )}
              </aside>
            </div>
          </div>
        </div>
      </section>

      {tickerAreas.length ? (
        <div className="home-ticker border-b border-slate-300 bg-slate-100 py-4" aria-label="Areas represented by live RentNest listings">
          <div className="home-ticker-track flex w-max">
            {[...tickerAreas, ...tickerAreas].map((area, index) => (
              <span className="flex items-center gap-7 px-7 font-mono text-xs text-slate-400 after:text-primary after:content-['·']" key={`${area}-${index}`}>{area}</span>
            ))}
          </div>
        </div>
      ) : null}

      <section id="roles" className="mx-auto w-full max-w-[1180px] px-6 py-20 sm:px-8 lg:py-24">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">One marketplace</p>
          <h2 className="mt-3 font-serif text-4xl font-medium leading-tight tracking-[-0.02em] text-slate-950 sm:text-5xl">Three roles, each with a clear path.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">Whoever you are in the rental, RentNest gives you a role-built view instead of one confusing dashboard.</p>
        </div>
        <div className="grid gap-6 border-t border-slate-300 pt-6 md:grid-cols-3">
          {roles.map((role, index) => (
            <article className="relative overflow-hidden rounded-2xl border border-slate-300 bg-surface p-7" key={role.title}>
              <div className="absolute inset-x-0 top-[78px] border-t border-dashed border-slate-300" />
              <i className="absolute -left-2 top-[69px] h-[18px] w-[18px] rounded-full border border-slate-300 bg-background" />
              <p className="font-mono text-xs text-slate-400">ROLE / 0{index + 1}</p>
              <h3 className="mt-10 font-serif text-2xl font-medium text-slate-950">{role.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{role.description}</p>
              <ul className="mt-5 grid gap-2 text-sm text-slate-500">
                {role.items.map((item) => <li className="flex gap-2" key={item}><ArrowRight className="mt-0.5 shrink-0 text-primary" size={15} aria-hidden="true" />{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-300 bg-slate-100">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-20 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">A clearer rental path</p>
              <h2 className="mt-3 font-serif text-4xl font-medium leading-tight tracking-[-0.02em] text-slate-950 sm:text-5xl">From first search to an approved home.</h2>
              <p className="mt-5 text-base leading-7 text-slate-600">Three deliberate steps keep property details, landlord decisions, and payment status in one connected flow.</p>
              <Link className={buttonClasses({ variant: "outline", className: "mt-7 rounded-full" })} href="/properties">
                Start with live listings <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <ol className="border-t border-slate-300">
              {rentalSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <li className="grid gap-4 border-b border-slate-300 py-7 sm:grid-cols-[3rem_1fr_auto] sm:items-start" key={step.number}>
                    <span className="font-mono text-xs text-slate-400">{step.number}</span>
                    <div>
                      <h3 className="font-serif text-2xl font-medium text-slate-950">{step.title}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{step.description}</p>
                    </div>
                    <span className="flex size-11 items-center justify-center rounded-full border border-slate-300 bg-surface text-primary">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-300 bg-slate-100">
        <div className="mx-auto grid w-full max-w-[1180px] sm:grid-cols-2 lg:grid-cols-4">
          {marketplaceStatistics.map(([number, label], index) => (
            <div className={`border-slate-300 px-8 py-12 ${index > 0 ? 'border-t sm:border-l sm:border-t-0' : ''} ${index === 2 ? 'lg:border-t-0' : ''}`} key={label}>
              <b className="block font-serif text-4xl font-medium text-primary">{number}</b><span className="mt-1 block text-sm text-slate-500">{label}</span>
            </div>
          ))}
          {!marketplaceStatistics.length ? (
            <p className="px-8 py-12 text-sm text-slate-600 sm:col-span-2 lg:col-span-4">
              Live marketplace statistics are temporarily unavailable.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-6 py-20 sm:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-300 pb-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">From the live catalogue</p>
            <h2 className="mt-3 font-serif text-4xl font-medium leading-tight tracking-[-0.02em] text-slate-950 sm:text-5xl">A current look at homes on RentNest.</h2>
          </div>
          <Link className="inline-flex items-center gap-2 border-b border-slate-950 pb-1 text-sm font-semibold text-slate-950" href="/properties">
            Browse every listing <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {featuredHomes.length ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {featuredHomes.map((property, index) => (
              <article className="group flex min-h-72 flex-col justify-between overflow-hidden rounded-2xl border border-slate-300 bg-surface p-6" key={property.id}>
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs text-slate-400">HOME / 0{index + 1}</span>
                    <span className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{property.category?.name ?? "Rental"}</span>
                  </div>
                  <h3 className="mt-10 font-serif text-2xl font-medium leading-tight text-slate-950">{property.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{getAreaName(property.location)} · {property.bedrooms} bed · {property.bathrooms} bath</p>
                </div>
                <div className="mt-8 flex items-end justify-between gap-4 border-t border-dashed border-slate-300 pt-5">
                  <p><b className="block font-serif text-2xl font-medium text-primary">{formatCurrency(property.rentAmount)}</b><span className="text-xs text-slate-400">per month</span></p>
                  <Link aria-label={`View ${property.title}`} className="flex size-11 items-center justify-center rounded-full border border-slate-300 text-slate-950 transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground" href={`/properties/${property.id}`}>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-slate-600">Live home previews will return when the property service is available.</p>
        )}
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:px-8 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Live catalogue insight</p>
        {hasLiveStatistics ? (
          <>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-relaxed text-slate-950 sm:text-4xl">
              Current monthly rents range from {formatCurrency(statistics.lowestRent)} to {formatCurrency(statistics.highestRent)} across {formatNumber(statistics.areas.length)} represented areas.
            </h2>
            <p className="mt-7 text-sm text-slate-500">
              Calculated from all {formatNumber(statistics.totalHomes)} public listings currently returned by the RentNest database.
            </p>
          </>
        ) : (
          <p className="mt-4 text-base leading-7 text-slate-600">
            Live catalogue insights will return when the property service is available.
          </p>
        )}
      </section>

      <section id="cities" className="mx-auto w-full max-w-[1180px] px-6 py-20 sm:px-8 lg:py-24">
        <div className="mb-14 max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Featured areas</p><h2 className="mt-3 font-serif text-4xl font-medium leading-tight tracking-[-0.02em] text-slate-950 sm:text-5xl">Start where you already know you want to be.</h2></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredAreas.map((area) => (
            <Link className={`relative flex h-64 items-end overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-br ${area.className} to-background p-6 text-white after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/75 after:to-transparent`} href={`/properties?location=${area.name}&page=1`} key={area.name}>
              <span className="relative z-10"><b className="block font-serif text-2xl font-medium">{area.name}</b><small className="font-mono text-xs text-white/80">{formatNumber(area.count)} {area.count === 1 ? "listing" : "listings"}</small></span>
            </Link>
          ))}
          {!featuredAreas.length ? (
            <p className="text-sm text-slate-600 sm:col-span-2 lg:col-span-4">
              Featured areas will return when live listings are available.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-4 mb-20 rounded-[28px] border border-slate-300 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--rn-primary)_12%,transparent),transparent_70%),var(--rn-surface)] px-6 py-20 text-center sm:mx-8 sm:px-12 lg:mx-12">
        <ShieldCheck className="mx-auto text-primary" size={28} aria-hidden="true" />
        <h2 className="mx-auto mt-5 max-w-2xl font-serif text-4xl font-medium leading-tight tracking-[-0.02em] text-slate-950 sm:text-5xl">Your next home is a calmer search away.</h2>
        <p className="mt-5 text-base text-slate-600">Create a free account and start browsing verified listings today.</p>
        <Link className={buttonClasses({ size: "lg", className: "mt-8 rounded-full px-7" })} href="/properties">Explore homes <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>
    </main>
  );
}
