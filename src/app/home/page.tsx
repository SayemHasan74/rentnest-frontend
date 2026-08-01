import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, Search } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import { buttonClasses } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { Category, Property } from "@/types/rentnest";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Home | RentNest",
  description: "Search current RentNest properties and explore rental categories.",
};

const getHomeData = async () => {
  const [propertyResult, categoryResult] = await Promise.allSettled([
    api.properties.list({ limit: 6 }),
    api.categories.list(),
  ]);
  const propertyData =
    propertyResult.status === "fulfilled"
      ? propertyResult.value
      : { meta: { page: 1, limit: 6, total: 0, totalPages: 0 }, properties: [] };

  return {
    categories: categoryResult.status === "fulfilled" ? categoryResult.value : [],
    properties: propertyData.properties,
    totalProperties: propertyData.meta.total,
  };
};

export default async function HomePage() {
  const { categories, properties, totalProperties } = await getHomeData();

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">RentNest home</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-slate-950 sm:text-6xl">
                Find a place that fits the way you live.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
                Search current homes, compare essentials, and send a rental request directly.
              </p>
            </div>

            <form
              action="/properties"
              className="grid gap-3 border-t border-slate-950 pt-5 sm:grid-cols-[1fr_9rem_9rem_auto]"
            >
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Location
                <span className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-500" size={16} aria-hidden="true" />
                  <input
                    className="h-10 w-full border border-slate-400 bg-white pl-9 pr-3 outline-none focus:border-black"
                    name="location"
                    placeholder="Dhaka"
                  />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Min rent
                <input className="h-10 border border-slate-400 px-3 outline-none focus:border-black" min="1" name="minPrice" placeholder="20000" type="number" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Max rent
                <input className="h-10 border border-slate-400 px-3 outline-none focus:border-black" min="1" name="maxPrice" placeholder="80000" type="number" />
              </label>
              <button
                aria-label="Search properties"
                className="flex h-10 items-center justify-center self-end bg-black px-5 text-white hover:bg-slate-800"
                type="submit"
              >
                <Search size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-300 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              {formatNumber(totalProperties)} available listings
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Homes to explore now</h2>
          </div>
          <Link className={buttonClasses({ variant: "outline" })} href="/properties">
            View all properties
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="mt-8 grid gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property: Property, index: number) => (
              <PropertyCard key={property.id} priority={index === 0} property={property} />
            ))}
          </div>
        ) : (
          <div className="mt-8 border-y border-slate-300 bg-white py-12 text-center">
            <p className="font-semibold text-slate-950">Properties are being refreshed.</p>
            <p className="mt-2 text-sm text-slate-600">Browse all listings in a moment.</p>
          </div>
        )}
      </section>

      <section className="border-t border-slate-300 bg-white">
        <div className="mx-auto grid w-full max-w-[90rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.55fr_1.45fr] lg:px-10 lg:py-16">
          <div>
            <Building2 size={24} strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Browse by property type</h2>
          </div>
          <div className="border-t border-slate-300">
            {categories.map((category: Category, index: number) => (
              <Link
                className="grid grid-cols-[3rem_1fr_auto] items-center border-b border-slate-300 py-5 text-slate-950 hover:bg-slate-50"
                href={`/properties?type=${encodeURIComponent(category.name)}&page=1`}
                key={category.id}
              >
                <span className="text-sm text-slate-500">0{index + 1}</span>
                <span className="font-semibold">{category.name}</span>
                <span className="text-sm text-slate-500">
                  {formatNumber(category._count?.properties ?? 0)} homes
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
