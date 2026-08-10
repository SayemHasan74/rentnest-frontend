import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  FileCheck2,
  HeartHandshake,
  KeyRound,
  Search,
  ShieldCheck,
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

const roleBenefits = [
  {
    description:
      "Compare property details and keep rental requests and payment history in one place.",
    icon: Search,
    title: "For tenants",
  },
  {
    description:
      "Publish a listing, set its availability, and respond to every rental request clearly.",
    icon: Building2,
    title: "For landlords",
  },
  {
    description:
      "Maintain a reliable marketplace through user, category, and property review tools.",
    icon: ShieldCheck,
    title: "For administrators",
  },
];

const helpTopics = [
  [
    "Can I browse before registering?",
    "Yes. Property browsing and property details are public. Create a tenant account when you are ready to send a rental request.",
  ],
  [
    "How do landlords manage availability?",
    "Landlords can add properties, update their availability, and review incoming requests from the landlord dashboard.",
  ],
  [
    "Where can I get help?",
    "Visit Help & Support for practical guidance, or contact RentNest with a question about the marketplace.",
  ],
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

      <section className="h-[65svh] overflow-hidden border-b border-slate-300 bg-surface">
        <div className="mx-auto flex h-full w-full max-w-[90rem] flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
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

          <div className="mt-8 hidden max-w-3xl grid-cols-3 border-y border-slate-300 sm:grid">
            {[
              [formatNumber(totalProperties), "Available listings"],
              [formatNumber(categories.length), "Property types"],
              [formatNumber(neighborhoods.filter((item) => item.count > 0).length), "Active areas"],
            ].map(([value, label], index) => (
              <div
                className={`py-4 pr-4 ${index > 0 ? "border-l border-slate-300 pl-4" : ""}`}
                key={label}
              >
                <p className="text-3xl font-semibold text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Live RentNest listing summary"
        className="home-ticker overflow-hidden border-b border-inverse bg-inverse py-3 text-inverse-foreground"
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
                  className="flex items-center whitespace-nowrap text-xs font-semibold uppercase text-inverse-foreground/85 transition-colors hover:text-inverse-foreground"
                  href={item.href}
                  key={`${copyIndex}-${item.href}-${item.label}`}
                  tabIndex={copyIndex === 1 ? -1 : undefined}
                >
                  <span className="px-5 sm:px-7">{item.label}</span>
                  <span className="text-inverse-muted" aria-hidden="true">◆</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

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
                className={`group min-h-28 border-r border-b border-slate-300 bg-surface p-4 transition-colors hover:bg-inverse hover:text-inverse-foreground ${neighborhood.count === 0 ? "text-slate-400" : "text-slate-950"}`}
                href={`/properties?location=${encodeURIComponent(neighborhood.name)}&page=1`}
                key={neighborhood.name}
              >
                <span className="text-xs text-slate-400 group-hover:text-inverse-muted">
                  0{index + 1}
                </span>
                <h3 className="mt-5 font-semibold">{neighborhood.name}</h3>
                <p className="mt-1 text-xs text-slate-500 group-hover:text-inverse-muted">
                  {formatNumber(neighborhood.count)} {neighborhood.count === 1 ? "listing" : "listings"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-surface">
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

      <section className="border-b border-slate-300 bg-slate-50">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase text-slate-500">
              One marketplace, three clear roles
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Built around the people who make a rental work.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {roleBenefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  className="rounded-md border border-slate-300 bg-surface p-6 shadow-sm"
                  key={benefit.title}
                >
                  <Icon className="text-emerald-700" size={25} strokeWidth={1.7} aria-hidden="true" />
                  <h3 className="mt-6 text-xl font-semibold text-slate-950">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {benefit.description}
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
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property: Property, index: number) => (
              <PropertyCard key={property.id} priority={index === 0} property={property} />
            ))}
          </div>
        ) : (
          <div className="mt-8 border-y border-slate-300 bg-surface py-12 text-center">
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

      <section className="border-y border-slate-300 bg-surface">
        <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-10 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Help when you need it
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              A few useful answers before you begin.
            </h2>
            <Link className={buttonClasses({ variant: "outline", className: "mt-6" })} href="/help">
              Visit Help & Support
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="divide-y divide-slate-300 border-y border-slate-300">
            {helpTopics.map(([question, answer]) => (
              <article className="py-6" key={question}>
                <h3 className="font-semibold text-slate-950">{question}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="rounded-md bg-black px-6 py-10 text-white sm:px-10 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="flex items-center gap-3 text-white/70">
                  <HeartHandshake size={22} aria-hidden="true" />
                  <CircleDollarSign size={22} aria-hidden="true" />
                </div>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
                  Find the place that fits your next chapter.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
                  Explore current rentals across Dhaka, then create an account when you are ready to take the next step.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className={buttonClasses({ size: "lg" })} href="/properties">
                  Explore rentals
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link className={buttonClasses({ variant: "outline", size: "lg", className: "border-white/50 text-white hover:border-white hover:bg-white/10 hover:text-white" })} href="/auth/register">
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
