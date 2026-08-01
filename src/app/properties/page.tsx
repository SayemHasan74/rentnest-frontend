import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, HomeIcon } from "lucide-react";
import {
  defaultPropertyFilterValues,
  PropertyFiltersForm,
} from "@/components/properties/property-filters-form";
import { PropertyPagination } from "@/components/properties/property-pagination";
import { PropertyCard } from "@/components/properties/property-card";
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
    hasCategoryError: categoryResult.status === "rejected",
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
  const { categories, hasCategoryError, propertyResult } = await getBrowseData(filters);
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
      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <p className="text-xs font-semibold uppercase text-slate-500">Available rentals</p>
          <div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold text-slate-950 sm:text-6xl">
                A home for every way of living.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Browse by location, price, property type, and the details that
                make a place feel right.
              </p>
            </div>
            <div className="grid grid-cols-3 border-y border-slate-300 text-sm lg:min-w-[25rem]">
              <div className="border-r border-slate-300 px-4 py-4">
                <p className="text-xl font-semibold text-slate-950">
                  {formatNumber(propertyData?.meta.total ?? 0)}
                </p>
                <p className="mt-1 text-slate-600">Matches</p>
              </div>
              <div className="border-r border-slate-300 px-4 py-4">
                <p className="text-xl font-semibold text-slate-950">
                  {formatNumber(categories.length)}
                </p>
                <p className="mt-1 text-slate-600">Types</p>
              </div>
              <div className="px-4 py-4">
                <p className="text-xl font-semibold text-slate-950">
                  {formatNumber(propertyData?.meta.page ?? filters.page ?? 1)}
                </p>
                <p className="mt-1 text-slate-600">Page</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[90rem] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-10 lg:py-14">
        <aside>
          <PropertyFiltersForm
            categories={categories as Category[]}
            values={filterValues}
          />
        </aside>

        <div>
          {hasCategoryError ? (
            <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              Property types could not be refreshed. Other filters and available listings still work.
            </div>
          ) : null}

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
              <div className="grid gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
                {propertyData.properties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    priority={index === 0}
                    property={property}
                  />
                ))}
              </div>
              <PropertyPagination
                meta={propertyData.meta}
                searchParams={cleanSearchParams}
              />
            </>
          ) : null}

          {propertyData && propertyData.properties.length === 0 ? (
            <div className="border-y border-slate-300 bg-white p-10 text-center">
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
