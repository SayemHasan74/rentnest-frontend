import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Map, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Property } from "@/types/rentnest";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Browse homes | RentNest",
  description: "Your authenticated RentNest home browser.",
};

const areas = ["Gulshan", "Banani", "Dhanmondi", "Uttara", "Baridhara", "Mirpur"];
const gradients = ["from-[#1e3a34]", "from-[#2a2a1e]", "from-[#1e2a3a]", "from-[#2a1e2e]", "from-[#1e2e2a]", "from-[#26241e]"];

const getHomeData = async () => {
  const [propertiesResult, categoriesResult] = await Promise.allSettled([
    api.properties.list({ limit: 12, sort: "newest" }),
    api.categories.list(),
  ]);

  return {
    properties: propertiesResult.status === "fulfilled" ? propertiesResult.value.properties : [],
    total: propertiesResult.status === "fulfilled" ? propertiesResult.value.meta.total : 0,
    categories: categoriesResult.status === "fulfilled" ? categoriesResult.value : [],
  };
};

const propertyMeta = (property: Property) => [
  property.bedrooms ? `${property.bedrooms} bd` : null,
  property.bathrooms ? `${property.bathrooms} ba` : null,
  property.areaSqFt ? `${formatNumber(property.areaSqFt)} sqft` : null,
].filter(Boolean);

export default async function HomePage() {
  const { categories, properties, total } = await getHomeData();
  const areaCounts = areas.map((area) => ({
    area,
    count: properties.filter((property) => property.location.toLowerCase().includes(area.toLowerCase())).length,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="sticky top-[4.5rem] z-50 flex gap-2 overflow-x-auto border-b border-slate-300 bg-background px-4 py-3 sm:px-7">
        <Link className="shrink-0 rounded-full border border-primary bg-[color-mix(in_srgb,var(--rn-primary)_12%,transparent)] px-4 py-2 text-sm font-medium text-primary" href="/home">All homes</Link>
        {categories.slice(0, 3).map((category) => <Link className="shrink-0 rounded-full border border-slate-300 bg-surface px-4 py-2 text-sm text-slate-600 hover:border-slate-400 hover:text-slate-950" href={`/properties?type=${encodeURIComponent(category.name)}`} key={category.id}>{category.name}</Link>)}
        <Link className="shrink-0 rounded-full border border-slate-300 bg-surface px-4 py-2 text-sm text-slate-500 hover:text-slate-950" href="/properties?sort=price-asc">Price</Link>
        <Link className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-surface px-4 py-2 text-sm text-slate-500 hover:text-slate-950" href="/properties"><SlidersHorizontal size={14} aria-hidden="true" />More filters</Link>
        <div className="ml-auto hidden shrink-0 items-center gap-4 lg:flex"><span className="text-sm text-slate-500"><b className="text-slate-950">{formatNumber(total)}</b> homes in Dhaka</span><Link className="rounded-lg border border-slate-300 bg-surface px-3 py-2 text-sm text-slate-600" href="/properties?sort=newest">Sort: Recommended</Link></div>
      </section>

      <div className="mx-auto grid w-full max-w-[1440px] lg:grid-cols-[230px_minmax(0,1fr)_300px]">
        <aside className="hidden border-r border-slate-300 px-7 py-6 lg:block">
          <section className="mb-8"><h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Saved searches</h2><div className="mt-4 grid gap-3"><div className="rounded-lg border border-slate-300 bg-surface p-3"><p className="text-sm font-semibold text-slate-950">Gulshan, 2 bed</p><p className="mt-1 font-mono text-[11px] text-slate-400">14 new · ৳45k–70k</p></div><div className="rounded-lg border border-slate-300 bg-surface p-3"><p className="text-sm font-semibold text-slate-950">Dhanmondi, studio</p><p className="mt-1 font-mono text-[11px] text-slate-400">3 new · under ৳30k</p></div></div></section>
          <section><h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Browse by area</h2><div className="mt-3">{areaCounts.map(({ area, count }) => <Link className="flex items-center justify-between border-b border-slate-300 py-2 text-sm text-slate-500 hover:text-slate-950" href={`/properties?location=${area}`} key={area}>{area}<span className="font-mono text-xs text-slate-400">{formatNumber(count)}</span></Link>)}</div></section>
        </aside>

        <section className="px-4 py-6 sm:px-7">
          <div className="mb-5 flex items-end justify-between lg:hidden"><p className="text-sm text-slate-500"><b className="text-slate-950">{formatNumber(total)}</b> homes in Dhaka</p><Link className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-surface px-3 py-2 text-sm text-slate-600" href="/properties"><Map size={14} aria-hidden="true" />Map</Link></div>
          {properties.length ? <div className="grid gap-5 sm:grid-cols-2">{properties.slice(0, 6).map((property, index) => <Link className="group overflow-hidden rounded-xl border border-slate-300 bg-surface transition hover:-translate-y-0.5 hover:border-slate-400" href={`/properties/${property.id}`} key={property.id}><div className={`relative flex h-40 items-start justify-between bg-gradient-to-br ${gradients[index % gradients.length]} to-slate-100 p-3`} style={property.images[0] ? { backgroundImage: `linear-gradient(135deg, rgba(10,10,11,.20), rgba(10,10,11,.72)), url(${property.images[0]})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{index % 2 ? "Verified" : "New"}</span><span className="rounded-full border border-primary/60 bg-black/60 px-2.5 py-1 font-mono text-[11px] font-semibold text-primary backdrop-blur">{92 - index * 2}% match</span><span className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur"><Heart size={14} aria-hidden="true" /></span></div><div className="p-4"><p className="font-mono text-base font-semibold text-slate-950">{formatCurrency(Number(property.rentAmount))}<span className="ml-1 text-xs font-normal text-slate-500">/mo</span></p><h2 className="mt-1 text-sm font-semibold text-slate-950">{property.title}</h2><p className="mt-1 text-xs text-slate-500">{property.address ?? property.location}</p><div className="mt-3 flex flex-wrap gap-2">{propertyMeta(property).map((item) => <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500" key={item}>{item}</span>)}</div></div></Link>)}</div> : <div className="rounded-xl border border-slate-300 bg-surface px-6 py-16 text-center"><p className="font-serif text-2xl text-slate-950">Homes are being refreshed.</p><Link className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary" href="/properties">Browse all properties <ArrowRight size={15} aria-hidden="true" /></Link></div>}
          <div className="mt-7 flex justify-center"><Link className="rounded-full border border-slate-300 bg-surface px-6 py-3 text-sm font-semibold text-slate-950 hover:border-slate-400" href="/properties">Load more homes</Link></div>
        </section>

        <aside className="hidden border-l border-slate-300 px-7 py-6 lg:block"><section className="mb-7"><h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Map preview</h2><div className="relative mt-4 h-44 overflow-hidden rounded-xl border border-slate-300 bg-[radial-gradient(circle_at_30%_40%,color-mix(in_srgb,var(--rn-primary)_12%,transparent),transparent_40%),radial-gradient(circle_at_70%_65%,color-mix(in_srgb,var(--rn-primary)_12%,transparent),transparent_40%),var(--rn-surface)]">{[["top-[38%]","left-[28%]"],["top-[60%]","left-[66%]"],["top-[24%]","left-[60%]"],["top-[72%]","left-[38%]"]].map(([top, left]) => <i className={`absolute size-2.5 rounded-full border-2 border-background bg-primary ${top} ${left}`} key={`${top}-${left}`} />)}</div></section><section className="mb-7"><h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Your activity</h2><div className="mt-4 grid grid-cols-3 gap-2">{[["3","Saved"],["2","Tours"],["1","Message"]].map(([value,label]) => <div className="rounded-lg border border-slate-300 bg-surface p-3 text-center" key={label}><b className="block font-mono text-lg text-primary">{value}</b><span className="text-[10px] text-slate-400">{label}</span></div>)}</div></section><section><h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Continue browsing</h2><div className="mt-3">{properties.slice(0, 3).map((property, index) => <Link className="flex gap-3 border-b border-slate-300 py-2" href={`/properties/${property.id}`} key={property.id}><i className={`size-10 shrink-0 rounded-lg bg-gradient-to-br ${gradients[index]} to-slate-100`} /><span><b className="block text-xs text-slate-950">{property.title}</b><small className="font-mono text-[11px] text-slate-400">{formatCurrency(Number(property.rentAmount))}/mo</small></span></Link>)}</div></section></aside>
      </div>
    </main>
  );
}
