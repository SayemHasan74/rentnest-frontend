import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileCheck2,
  KeyRound,
  Search,
} from "lucide-react";
import { HomeHeroActions } from "@/components/home/home-hero-actions";
import { PropertyCard } from "@/components/properties/property-card";
import { buttonClasses } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { Property } from "@/types/rentnest";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Home | RentNest",
  description: "Explore rental homes and neighborhoods across Dhaka with RentNest.",
};

const neighborhoodNames = [
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Uttara",
  "Badda",
  "Mirpur",
];

const steps = [
  {
    description:
      "Compare current homes by neighborhood, rent, property type, and amenities.",
    icon: Search,
    number: "01",
    title: "Browse listings",
  },
  {
    description:
      "Choose your dates and send a rental request directly to the landlord.",
    icon: FileCheck2,
    number: "02",
    title: "Send a request",
  },
  {
    description:
      "Track approval, pay securely through Stripe, and keep your rental history together.",
    icon: KeyRound,
    number: "03",
    title: "Move in",
  },
];

const getHomeData = async () => {
  const [propertyResult, categoryResult] = await Promise.allSettled([
    api.properties.list({ limit: 50 }),
    api.categories.list(),
  ]);
  const propertyData =
    propertyResult.status === "fulfilled"
      ? propertyResult.value
      : { meta: { page: 1, limit: 50, total: 0, totalPages: 0 }, properties: [] };

  return {
    categories: categoryResult.status === "fulfilled" ? categoryResult.value : [],
    errorMessage:
      propertyResult.status === "rejected" || categoryResult.status === "rejected"
        ? "Some RentNest data could not be refreshed. Available results are shown below."
        : "",
    properties: propertyData.properties,
    totalProperties: propertyData.meta.total,
  };
};

export default async function HomePage() {
  const { categories, errorMessage, properties, totalProperties } = await getHomeData();
  const featuredProperties = properties.slice(0, 3);
  const neighborhoods = neighborhoodNames.map((name) => ({
    count: properties.filter((property) =>
      property.location.toLowerCase().includes(name.toLowerCase()),
    ).length,
    name,
  }));
  const tickerItems = [
    {
      href: "/properties",
      label: `${formatNumber(totalProperties)} homes available`,
    },
    ...neighborhoods
      .filter((neighborhood) => neighborhood.count > 0)
      .map((neighborhood) => ({
        href: `/properties?location=${encodeURIComponent(neighborhood.name)}&page=1`,
        label: `${neighborhood.name} · ${formatNumber(neighborhood.count)} ${neighborhood.count === 1 ? "listing" : "listings"}`,
      })),
    ...categories.map((category) => {
      const count = category._count?.properties ?? 0;

      return {
        href: `/properties?type=${encodeURIComponent(category.name)}&page=1`,
        label: `${category.name} · ${formatNumber(count)} ${count === 1 ? "home" : "homes"}`,
      };
    }),
  ];

  return (
    <main className="bg-slate-50 text-slate-950">
      {errorMessage ? (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900">
          {errorMessage}
        </div>
      ) : null}

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase text-slate-500">
              RentNest · Dhaka
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Every neighborhood tells a different story.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Find a home across Dhaka, compare the essentials, and connect
              directly with landlords through one clear rental process.
            </p>
            <HomeHeroActions />
          </div>

          <div className="mt-14 grid max-w-3xl grid-cols-2 border-y border-slate-300 sm:grid-cols-3">
            {[
              [formatNumber(totalProperties), "Available listings"],
              [formatNumber(categories.length), "Property types"],
              [formatNumber(neighborhoods.filter((item) => item.count > 0).length), "Active areas"],
            ].map(([value, label], index) => (
              <div
                className={`py-5 pr-5 ${index > 0 ? "border-l border-slate-300 pl-5" : ""} ${index === 2 ? "col-span-2 border-t border-slate-300 sm:col-span-1 sm:border-t-0" : ""}`}
                key={label}
              >
                <p className="text-3xl font-semibold text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div
        aria-label="Live RentNest listing summary"
        className="home-ticker overflow-hidden border-b border-slate-950 bg-slate-950 py-3 text-white"
      >
        <div className="home-ticker-track flex w-max items-center">
          {[0, 1].map((copyIndex) => (
            <div
              aria-hidden={copyIndex === 1 ? "true" : undefined}
              className="flex shrink-0 items-center"
              key={copyIndex}
            >
              {tickerItems.map((item) => (
                <Link
                  className="flex items-center whitespace-nowrap text-xs font-semibold uppercase text-white/85 transition-colors hover:text-white"
                  href={item.href}
                  key={`${copyIndex}-${item.href}-${item.label}`}
                  tabIndex={copyIndex === 1 ? -1 : undefined}
                >
                  <span className="px-5 sm:px-7">{item.label}</span>
                  <span className="text-white/35" aria-hidden="true">◆</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="border-b border-slate-300 bg-slate-50">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Explore Dhaka
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Browse by neighborhood
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Choose an area to see its current listings.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 border-l border-t border-slate-300 sm:grid-cols-3 lg:grid-cols-6">
            {neighborhoods.map((neighborhood, index) => (
              <Link
                className={`group min-h-28 border-r border-b border-slate-300 bg-white p-4 transition-colors hover:bg-slate-950 hover:text-white ${neighborhood.count === 0 ? "text-slate-400" : "text-slate-950"}`}
                href={`/properties?location=${encodeURIComponent(neighborhood.name)}&page=1`}
                key={neighborhood.name}
              >
                <span className="text-xs text-slate-400 group-hover:text-slate-400">
                  0{index + 1}
                </span>
                <h3 className="mt-5 font-semibold">{neighborhood.name}</h3>
                <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-300">
                  {formatNumber(neighborhood.count)} {neighborhood.count === 1 ? "listing" : "listings"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.55fr_1.45fr] lg:px-10 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Simple from search to move-in
            </p>
            <h2 className="mt-3 max-w-sm text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              How RentNest works
            </h2>
          </div>
          <div className="border-t border-slate-300">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  className="grid gap-4 border-b border-slate-300 py-6 sm:grid-cols-[3rem_13rem_1fr] sm:items-center"
                  key={step.number}
                >
                  <span className="text-sm text-slate-500">{step.number}</span>
                  <div className="flex items-center gap-3">
                    <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                    <h3 className="font-semibold text-slate-950">{step.title}</h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-300 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              {formatNumber(totalProperties)} available listings
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Homes to explore now
            </h2>
          </div>
          <Link className={buttonClasses({ variant: "outline" })} href="/properties">
            View all properties
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {featuredProperties.length > 0 ? (
          <div className="mt-8 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {featuredProperties.map((property: Property, index: number) => (
              <PropertyCard key={property.id} priority={index === 0} property={property} />
            ))}
          </div>
        ) : (
          <div className="mt-8 border-y border-slate-300 bg-white py-12 text-center">
            <Building2 className="mx-auto text-slate-400" size={28} aria-hidden="true" />
            <p className="mt-4 font-semibold text-slate-950">
              Properties are being refreshed.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Browse all listings in a moment.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
