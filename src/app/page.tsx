import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  HomeIcon,
  ShieldCheck,
  Tags,
  Users,
  WalletCards,
} from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import { buttonClasses } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { Category, Property } from "@/types/rentnest";

const fallbackHero =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";

const roleItems = [
  {
    title: "Find your next home",
    label: "For tenants",
    description:
      "Search real listings, send rental requests, complete secure payments, and review your stay.",
    icon: Building2,
  },
  {
    title: "Manage every listing",
    label: "For landlords",
    description:
      "Publish properties, track availability, and respond to tenant requests from one dashboard.",
    icon: WalletCards,
  },
  {
    title: "Keep the platform trusted",
    label: "For administrators",
    description:
      "Oversee users, properties, rental activity, and platform health with clear operational tools.",
    icon: ShieldCheck,
  },
];

const getHomeData = async () => {
  const [propertyResult, categoryResult] = await Promise.allSettled([
    api.properties.list({ limit: 4 }),
    api.categories.list(),
  ]);

  const propertyData =
    propertyResult.status === "fulfilled"
      ? propertyResult.value
      : { meta: { page: 1, limit: 4, total: 0, totalPages: 0 }, properties: [] };

  return {
    categories: categoryResult.status === "fulfilled" ? categoryResult.value : [],
    properties: propertyData.properties,
    totalProperties: propertyData.meta.total,
  };
};

export default async function Home() {
  const { categories, properties, totalProperties } = await getHomeData();
  const totalCategoryProperties = categories.reduce(
    (sum: number, category: Category) => sum + (category._count?.properties ?? 0),
    0,
  );
  const stats = [
    {
      label: "Available listings",
      value: formatNumber(totalProperties || totalCategoryProperties),
      icon: HomeIcon,
    },
    { label: "Property categories", value: formatNumber(categories.length), icon: Tags },
    { label: "Dedicated dashboards", value: "3", icon: Users },
  ];
  const heroImage = properties[0]?.images[0] || fallbackHero;

  return (
    <main>
      <section className="relative min-h-[calc(92vh-4.5rem)] overflow-hidden bg-black text-white">
        <Image
          alt="A contemporary rental home"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={heroImage}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex min-h-[calc(92vh-4.5rem)] w-full max-w-[90rem] flex-col justify-end px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <p className="text-xs font-semibold uppercase text-white/70">Rental living, thoughtfully connected</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] text-white sm:text-7xl lg:text-8xl">
            RentNest
          </h1>
          <div className="mt-7 grid max-w-4xl gap-6 border-t border-white/40 pt-6 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Discover considered rental homes, connect directly with landlords,
              and manage the entire journey in one clear place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className={buttonClasses({ size: "lg", className: "!border-white !bg-white !text-black hover:!bg-slate-200" })} href="/properties">
                Explore homes
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className={buttonClasses({ variant: "outline", size: "lg", className: "border-white/60 bg-transparent text-white hover:bg-white hover:text-black" })} href="/auth/login">
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto grid w-full max-w-[90rem] sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div className="flex min-h-36 items-center gap-5 border-b border-slate-300 px-4 py-8 last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:last:border-r-0 lg:px-10" key={stat.label}>
                <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="text-3xl font-semibold text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div className="flex flex-col justify-between gap-6 border-b border-slate-300 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Selected properties</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-5xl">Homes worth considering</h2>
            </div>
            <Link className={buttonClasses({ variant: "outline" })} href="/properties">
              Browse all
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="mt-8 grid gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
              {properties.map((property: Property, index: number) => (
                <PropertyCard key={property.id} priority={index === 0} property={property} />
              ))}
            </div>
          ) : (
            <div className="mt-8 border-y border-slate-300 py-14 text-center">
              <h3 className="text-xl font-semibold text-slate-950">Listings are loading</h3>
              <p className="mt-2 text-sm text-slate-600">The property service may be waking up. Please refresh shortly.</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-slate-300 bg-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">One connected platform</p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">A clear path for every role.</h2>
            </div>
            <div className="border-t border-slate-300">
              {roleItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article className="grid gap-5 border-b border-slate-300 py-7 sm:grid-cols-[3rem_1fr_1.2fr] sm:items-start" key={item.label}>
                    <span className="text-sm text-slate-500">0{index + 1}</span>
                    <div>
                      <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                      <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{item.label}</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-slate-600 sm:pt-10">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
