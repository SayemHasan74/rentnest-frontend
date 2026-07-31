import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://rentnest-server.onrender.com/api";

const roleCards = [
  {
    title: "Tenants",
    description: "Browse listings, request homes, pay after approval, and review completed rentals.",
    icon: Building2,
  },
  {
    title: "Landlords",
    description: "Create listings, manage availability, and approve or reject incoming requests.",
    icon: WalletCards,
  },
  {
    title: "Admins",
    description: "Oversee users, properties, rental requests, and platform health from one place.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main>
      <section className="bg-slate-50">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <Badge tone="emerald">RentNest Frontend</Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Find and list rental properties with ease.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A responsive role-based marketplace connected to the live RentNest
            backend for tenants, landlords, and administrators.
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

          <p className="mt-8 max-w-xl rounded-md bg-white px-4 py-3 font-mono text-xs text-slate-700 ring-1 ring-slate-200">
            API: {API_BASE_URL}
          </p>
        </div>
      </section>

      <section className="bg-white">
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
