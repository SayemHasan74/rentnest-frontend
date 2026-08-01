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
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL, api } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { Category, Property } from "@/types/rentnest";

const roleCards = [
  {
    title: "Tenants",
    description:
      "Browse listings, request homes, pay after approval, and review completed rentals.",
    icon: Building2,
  },
  {
    title: "Landlords",
    description:
      "Create listings, manage availability, and approve or reject incoming requests.",
    icon: WalletCards,
  },
  {
    title: "Admins",
    description:
      "Oversee users, properties, rental requests, and platform health from one place.",
    icon: ShieldCheck,
  },
];

const getHomeData = async () => {
  const [propertyResult, categoryResult] = await Promise.allSettled([
    api.properties.list({ limit: 3 }),
    api.categories.list(),
  ]);

  const propertyData =
    propertyResult.status === "fulfilled"
      ? propertyResult.value
      : { meta: { page: 1, limit: 3, total: 0, totalPages: 0 }, properties: [] };

  const categories =
    categoryResult.status === "fulfilled" ? categoryResult.value : [];

  return {
    categories,
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
    {
      label: "Property categories",
      value: formatNumber(categories.length),
      icon: Tags,
    },
    {
      label: "Role dashboards",
      value: "3",
      icon: Users,
    },
  ];

  return (
    <main>
      <section className="bg-slate-50">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <Badge tone="emerald">Live RentNest marketplace</Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Find and list rental properties with ease.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Browse real property data from the RentNest API, then continue into
            role-based dashboards for tenants, landlords, and administrators.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className={buttonClasses({ size: "lg" })} href="/properties">
              Browse properties
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              className={buttonClasses({ variant: "outline", size: "lg" })}
              href="/auth/login"
            >
              Login to dashboard
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  key={stat.label}
                >
                  <Icon className="text-emerald-700" size={20} aria-hidden="true" />
                  <p className="mt-3 text-2xl font-bold text-slate-950">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <p className="mt-8 max-w-xl rounded-md bg-white px-4 py-3 font-mono text-xs text-slate-700 ring-1 ring-slate-200">
            API: {API_BASE_URL}
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Badge tone="blue">Featured homes</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                Recently listed properties
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                These listings are loaded from your deployed RentNest backend
                and use optimized images through Next.js.
              </p>
            </div>
            <Link
              className={buttonClasses({ variant: "outline" })}
              href="/properties"
            >
              View all properties
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property: Property, index: number) => (
                <PropertyCard
                  key={property.id}
                  priority={index === 0}
                  property={property}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-950">
                No featured properties available
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                The backend may be waking up. Try refreshing in a moment.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {roleCards.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title}>
                <CardHeader>
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <CardTitle className="mt-4">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
