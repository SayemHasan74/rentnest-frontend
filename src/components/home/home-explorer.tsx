"use client";

import Link from "next/link";
import { ArrowRight, Heart, Map, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getRoleDashboardPath, getStoredToken, getStoredUser } from "@/lib/auth-session";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Category, Property, UserRole } from "@/types/rentnest";

const FAVORITES_KEY = "rentnest-favorite-properties";

type AreaCount = { area: string; count: number };
type ActivityItem = { href: string; label: string; value: number };

type HomeExplorerProps = {
  areaCounts: AreaCount[];
  categories: Category[];
  properties: Property[];
  total: number;
};

const gradients = [
  "from-[#1e3a34]",
  "from-[#2a2a1e]",
  "from-[#1e2a3a]",
  "from-[#2a1e2e]",
  "from-[#1e2e2a]",
  "from-[#26241e]",
];

const propertyMeta = (property: Property) => [
  property.bedrooms ? `${property.bedrooms} bd` : null,
  property.bathrooms ? `${property.bathrooms} ba` : null,
  property.areaSqFt ? `${formatNumber(property.areaSqFt)} sqft` : null,
].filter((item): item is string => Boolean(item));

const isRecentlyAdded = (property: Property) =>
  Date.now() - new Date(property.createdAt).getTime() < 1000 * 60 * 60 * 24 * 30;

const getRoleActivity = async (role: UserRole, token: string): Promise<ActivityItem[]> => {
  const dashboardPath = getRoleDashboardPath(role);

  if (role === "TENANT") {
    const [requests, payments] = await Promise.all([
      api.rentals.listMine(token),
      api.payments.listMine(token),
    ]);

    return [
      { href: `${dashboardPath}#my-requests`, label: "Requests", value: requests.length },
      {
        href: `${dashboardPath}#my-requests`,
        label: "Approved",
        value: requests.filter((request) => ["APPROVED", "ACTIVE", "COMPLETED"].includes(request.status)).length,
      },
      {
        href: `${dashboardPath}#payment-history`,
        label: "Payments",
        value: payments.filter((payment) => payment.status === "COMPLETED").length,
      },
    ];
  }

  if (role === "LANDLORD") {
    const [properties, requests] = await Promise.all([
      api.landlord.properties(token),
      api.landlord.requests(token),
    ]);

    return [
      { href: `${dashboardPath}#my-properties`, label: "Listings", value: properties.length },
      {
        href: `${dashboardPath}#rental-requests`,
        label: "Pending",
        value: requests.filter((request) => request.status === "PENDING").length,
      },
      { href: `${dashboardPath}#rental-requests`, label: "Requests", value: requests.length },
    ];
  }

  const [users, properties, rentals] = await Promise.all([
    api.admin.users(token),
    api.admin.properties(token),
    api.admin.rentals(token),
  ]);

  return [
    { href: `${dashboardPath}#users`, label: "Users", value: users.length },
    { href: `${dashboardPath}#properties`, label: "Listings", value: properties.length },
    { href: `${dashboardPath}#rentals`, label: "Rentals", value: rentals.length },
  ];
};

export function HomeExplorer({ areaCounts, categories, properties, total }: HomeExplorerProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityError, setActivityError] = useState(false);

  useEffect(() => {
    let isActive = true;
    let favoriteFrame = 0;

    try {
      const saved = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]") as unknown;
      if (Array.isArray(saved) && saved.every((id) => typeof id === "string")) {
        favoriteFrame = window.requestAnimationFrame(() => {
          if (isActive) {
            setFavoriteIds(saved);
          }
        });
      }
    } catch {
      window.localStorage.removeItem(FAVORITES_KEY);
    }

    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      return () => {
        isActive = false;
        window.cancelAnimationFrame(favoriteFrame);
      };
    }

    getRoleActivity(user.role, token)
      .then((items) => {
        if (isActive) {
          setActivity(items);
        }
      })
      .catch(() => {
        if (isActive) {
          setActivityError(true);
        }
      });

    return () => {
      isActive = false;
      window.cancelAnimationFrame(favoriteFrame);
    };
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const toggleFavorite = (propertyId: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : [...current, propertyId];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="sticky top-[4.5rem] z-50 flex gap-2 overflow-x-auto border-b border-slate-300 bg-background px-4 py-3 sm:px-7">
        <Link className="shrink-0 rounded-full border border-primary bg-[color-mix(in_srgb,var(--rn-primary)_12%,transparent)] px-4 py-2 text-sm font-medium text-primary" href="/home">All homes</Link>
        {categories.slice(0, 4).map((category) => (
          <Link className="shrink-0 rounded-full border border-slate-300 bg-surface px-4 py-2 text-sm text-slate-600 hover:border-slate-400 hover:text-slate-950" href={`/properties?type=${encodeURIComponent(category.name)}&page=1`} key={category.id}>{category.name}</Link>
        ))}
        <Link className="shrink-0 rounded-full border border-slate-300 bg-surface px-4 py-2 text-sm text-slate-500 hover:text-slate-950" href="/properties?sort=rent_asc&page=1">Lowest price</Link>
        <Link className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-surface px-4 py-2 text-sm text-slate-500 hover:text-slate-950" href="/properties"><SlidersHorizontal size={14} aria-hidden="true" />More filters</Link>
        <div className="ml-auto hidden shrink-0 items-center gap-4 lg:flex"><span className="text-sm text-slate-500"><b className="text-slate-950">{formatNumber(total)}</b> homes in Dhaka</span><Link className="rounded-lg border border-slate-300 bg-surface px-3 py-2 text-sm text-slate-600 hover:border-slate-400" href="/properties?sort=newest&page=1">Sort: Newest</Link></div>
      </section>

      <div className="mx-auto grid w-full max-w-[1440px] lg:grid-cols-[230px_minmax(0,1fr)_300px]">
        <aside className="hidden border-r border-slate-300 px-7 py-6 lg:block">
          <section className="mb-8">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Quick searches</h2>
            <div className="mt-4 grid gap-3">
              {areaCounts.filter(({ count }) => count > 0).slice(0, 2).map(({ area, count }) => (
                <Link className="rounded-lg border border-slate-300 bg-surface p-3 transition hover:border-primary" href={`/properties?location=${encodeURIComponent(area)}&page=1`} key={area}>
                  <p className="text-sm font-semibold text-slate-950">Homes in {area}</p>
                  <p className="mt-1 font-mono text-[11px] text-slate-400">{formatNumber(count)} {count === 1 ? "listing" : "listings"} available</p>
                </Link>
              ))}
            </div>
          </section>
          <section><h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Browse by area</h2><div className="mt-3">{areaCounts.map(({ area, count }) => <Link className="flex items-center justify-between border-b border-slate-300 py-2 text-sm text-slate-500 hover:text-slate-950" href={`/properties?location=${encodeURIComponent(area)}&page=1`} key={area}>{area}<span className="font-mono text-xs text-slate-400">{formatNumber(count)}</span></Link>)}</div></section>
        </aside>

        <section className="px-4 py-6 sm:px-7">
          <div className="mb-5 flex items-end justify-between lg:hidden"><p className="text-sm text-slate-500"><b className="text-slate-950">{formatNumber(total)}</b> homes in Dhaka</p><a className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-surface px-3 py-2 text-sm text-slate-600" href="https://www.openstreetmap.org/#map=12/23.8103/90.4125" rel="noreferrer" target="_blank"><Map size={14} aria-hidden="true" />Map</a></div>
          {properties.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {properties.slice(0, 6).map((property, index) => {
                const isFavorite = favoriteSet.has(property.id);
                return (
                  <article className="group overflow-hidden rounded-xl border border-slate-300 bg-surface transition hover:-translate-y-0.5 hover:border-slate-400" key={property.id}>
                    <div className={`relative h-40 bg-gradient-to-br ${gradients[index % gradients.length]} to-slate-100`} style={property.images[0] ? { backgroundImage: `linear-gradient(135deg, rgba(10,10,11,.14), rgba(10,10,11,.55)), url(${property.images[0]})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                      <Link aria-label={`View ${property.title}`} className="absolute inset-0" href={`/properties/${property.id}`} />
                      <span className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{isRecentlyAdded(property) ? "New" : "Available"}</span>
                      {property.category ? <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{property.category.name}</span> : null}
                      <button aria-label={`${isFavorite ? "Remove" : "Save"} ${property.title} ${isFavorite ? "from" : "to"} favorites`} aria-pressed={isFavorite} className="absolute bottom-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-black" onClick={() => toggleFavorite(property.id)} type="button"><Heart className={isFavorite ? "fill-primary text-primary" : ""} size={15} aria-hidden="true" /></button>
                    </div>
                    <div className="p-4"><p className="font-mono text-base font-semibold text-slate-950">{formatCurrency(Number(property.rentAmount))}<span className="ml-1 text-xs font-normal text-slate-500">/mo</span></p><Link className="mt-1 block text-sm font-semibold text-slate-950 hover:text-primary" href={`/properties/${property.id}`}>{property.title}</Link><p className="mt-1 text-xs text-slate-500">{property.address ?? property.location}</p><div className="mt-3 flex flex-wrap gap-2">{propertyMeta(property).map((item) => <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500" key={item}>{item}</span>)}</div></div>
                  </article>
                );
              })}
            </div>
          ) : <div className="rounded-xl border border-slate-300 bg-surface px-6 py-16 text-center"><p className="font-serif text-2xl text-slate-950">Homes are being refreshed.</p><Link className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary" href="/properties">Browse all properties <ArrowRight size={15} aria-hidden="true" /></Link></div>}
          <div className="mt-7 flex justify-center"><Link className="rounded-full border border-slate-300 bg-surface px-6 py-3 text-sm font-semibold text-slate-950 hover:border-primary" href="/properties">Browse all {formatNumber(total)} homes</Link></div>
        </section>

        <aside className="hidden border-l border-slate-300 px-7 py-6 lg:block">
          <section className="mb-7"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Dhaka map</h2><a className="text-xs font-medium text-primary hover:underline" href="https://www.openstreetmap.org/#map=12/23.8103/90.4125" rel="noreferrer" target="_blank">Open map</a></div><iframe className="mt-4 h-44 w-full rounded-xl border border-slate-300 bg-surface" loading="lazy" referrerPolicy="no-referrer" src="https://www.openstreetmap.org/export/embed.html?bbox=90.3300%2C23.7400%2C90.5000%2C23.8800&layer=mapnik&marker=23.8103%2C90.4125" title="Interactive map of Dhaka" /></section>
          <section className="mb-7"><h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Your activity</h2>{activityError ? <p className="mt-4 rounded-lg border border-slate-300 bg-surface p-3 text-xs leading-5 text-slate-500">Activity could not refresh. Use your account menu to open the dashboard.</p> : activity.length ? <div className="mt-4 grid grid-cols-3 gap-2">{activity.map((item) => <Link className="rounded-lg border border-slate-300 bg-surface p-3 text-center hover:border-primary" href={item.href} key={item.label}><b className="block font-mono text-lg text-primary">{formatNumber(item.value)}</b><span className="text-[10px] text-slate-400">{item.label}</span></Link>)}</div> : <p className="mt-4 text-xs text-slate-400">Loading your live activity…</p>}<p className="mt-3 text-xs text-slate-500">{formatNumber(favoriteIds.length)} saved {favoriteIds.length === 1 ? "home" : "homes"} on this device</p></section>
          <section><h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Continue browsing</h2><div className="mt-3">{properties.slice(0, 3).map((property, index) => <Link className="flex gap-3 border-b border-slate-300 py-2" href={`/properties/${property.id}`} key={property.id}><span className={`size-10 shrink-0 rounded-lg bg-gradient-to-br ${gradients[index]} to-slate-100 bg-cover bg-center`} style={property.images[0] ? { backgroundImage: `url(${property.images[0]})` } : undefined} /><span className="min-w-0"><b className="block truncate text-xs text-slate-950">{property.title}</b><small className="font-mono text-[11px] text-slate-400">{formatCurrency(Number(property.rentAmount))}/mo</small></span></Link>)}</div></section>
        </aside>
      </div>
    </main>
  );
}
