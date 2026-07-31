import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, HomeIcon } from "lucide-react";
import {
  defaultPropertyFilterValues,
  PropertyFiltersForm,
} from "@/components/properties/property-filters-form";
import { PropertyPagination } from "@/components/properties/property-pagination";
import { PropertyCard } from "@/components/properties/property-card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { Category, PropertyFilters } from "@/types/rentnest";

export const metadata: Metadata = {
  title: "Browse Properties | RentNest",
  description: "Search and filter available rental properties on RentNest.",
};

type SearchParams = Record<string, string | string[] | undefined>;

const getStringParam = (searchParams: SearchParams, key: string) => {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const getPositiveNumberParam = (
  searchParams: SearchParams,
  key: string,
  fallback?: number,
) => {
  const value = Number(getStringParam(searchParams, key));

  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const buildPropertyFilters = (searchParams: SearchParams): PropertyFilters => ({
  location: getStringParam(searchParams, "location") || undefined,
  type: getStringParam(searchParams, "type") || undefined,
  amenities: getStringParam(searchParams, "amenities") || undefined,
  minPrice: getPositiveNumberParam(searchParams, "minPrice"),
  maxPrice: getPositiveNumberParam(searchParams, "maxPrice"),
  page: getPositiveNumberParam(searchParams, "page", 1),
  limit: getPositiveNumberParam(searchParams, "limit", 9),
});

const getBrowseData = async (filters: PropertyFilters) => {
  const [propertyResult, categoryResult] = await Promise.allSettled([
    api.properties.list(filters),
    api.categories.list(),
  ]);

  return {
    categories:
      categoryResult.status === "fulfilled" ? categoryResult.value : [],
    propertyResult,
  };
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = buildPropertyFilters(resolvedSearchParams);
  const { categories, propertyResult } = await getBrowseData(filters);
  const filterValues = {
    location: getStringParam(resolvedSearchParams, "location"),
    type: getStringParam(resolvedSearchParams, "type"),
    minPrice: getStringParam(resolvedSearchParams, "minPrice"),
    maxPrice: getStringParam(resolvedSearchParams, "maxPrice"),
    amenities: getStringParam(resolvedSearchParams, "amenities"),
    limit:
      getStringParam(resolvedSearchParams, "limit") ||
      defaultPropertyFilterValues.limit,
  };
  const cleanSearchParams = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const hasError = propertyResult.status === "rejected";
  const propertyData =
    propertyResult.status === "fulfilled" ? propertyResult.value : null;

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Badge tone="emerald">Available rentals</Badge>
          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                Browse properties
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Search by location, price, property type, and amenities using
                the live RentNest property API.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-950">
                  {formatNumber(propertyData?.meta.total ?? 0)}
                </p>
                <p className="mt-1 text-slate-600">Matches</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-950">
                  {formatNumber(categories.length)}
                </p>
                <p className="mt-1 text-slate-600">Types</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-950">
                  {formatNumber(propertyData?.meta.page ?? filters.page ?? 1)}
                </p>
                <p className="mt-1 text-slate-600">Page</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
        <aside>
          <PropertyFiltersForm
            categories={categories as Category[]}
            values={filterValues}
          />
        </aside>

        <div>
          {hasError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <div className="flex gap-3 text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                <div>
                  <h2 className="font-semibold">Could not load properties</h2>
                  <p className="mt-1 text-sm">
                    The backend may be waking up. Please refresh in a moment.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {propertyData && propertyData.properties.length > 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {propertyData.properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              <PropertyPagination
                meta={propertyData.meta}
                searchParams={cleanSearchParams}
              />
            </>
          ) : null}

          {propertyData && propertyData.properties.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <HomeIcon size={24} aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-950">
                No properties matched your filters
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Try a broader location, price range, type, or amenity set.
              </p>
              <Link
                className={buttonClasses({ className: "mt-6" })}
                href="/properties"
              >
                Reset filters
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
