import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  CalendarClock,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Star,
  UserRound,
} from "lucide-react";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { RentalRequestPanel } from "@/components/properties/rental-request-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Property } from "@/types/rentnest";

type PageParams = {
  id: string;
};

const getProperty = async (id: string) => {
  try {
    return await api.properties.details(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  return {
    title: `${property.title} | RentNest`,
    description: property.description,
  };
}

const specItems = (property: Property) => [
  {
    label: "Bedrooms",
    value: property.bedrooms,
    icon: BedDouble,
  },
  {
    label: "Bathrooms",
    value: property.bathrooms,
    icon: Bath,
  },
  {
    label: "Area",
    value: property.areaSqFt ? `${property.areaSqFt} sqft` : "Not listed",
    icon: Ruler,
  },
  {
    label: "Status",
    value: property.status,
    icon: CalendarClock,
  },
];

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = await params;
  const property = await getProperty(id);
  const reviews = property.reviews ?? [];

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <Link
            className="border-b border-slate-950 pb-1 text-sm font-semibold text-slate-950"
            href="/properties"
          >
            Back to properties
          </Link>
          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <Badge tone="emerald">{property.category?.name ?? "Rental"}</Badge>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold text-slate-950 sm:text-6xl">
                {property.title}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={16} aria-hidden="true" />
                {property.address || property.location}
              </p>
            </div>
            <div className="border-l border-slate-300 px-5 py-2 text-left lg:text-right">
              <p className="text-3xl font-semibold text-slate-950">
                {formatCurrency(property.rentAmount)}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">per month</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <PropertyGallery images={property.images} title={property.title} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Property overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-7 text-slate-600">{property.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {specItems(property).map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        className="rounded-md border border-slate-200 bg-slate-50 p-4"
                        key={item.label}
                      >
                        <Icon className="text-emerald-700" size={18} aria-hidden="true" />
                        <p className="mt-3 text-lg font-bold text-slate-950">
                          {item.value}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                {property.amenities.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {property.amenities.map((amenity) => (
                      <div
                        className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                        key={amenity}
                      >
                        <CheckCircle2 size={16} className="text-emerald-700" aria-hidden="true" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No amenities listed.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="grid gap-4">
                    {reviews.map((review) => (
                      <article
                        className="rounded-md border border-slate-200 p-4"
                        key={review.id}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-950">
                            {review.tenant?.name ?? "Tenant"}
                          </p>
                          <p className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                            <Star size={15} fill="currentColor" aria-hidden="true" />
                            {review.rating}/5
                          </p>
                        </div>
                        {review.comment ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {review.comment}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">
                    No reviews yet. Completed tenants can leave the first review.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="grid gap-6 self-start lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle>Request this property</CardTitle>
              </CardHeader>
              <CardContent>
                <RentalRequestPanel propertyId={property.id} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Landlord</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <UserRound size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">
                      {property.landlord?.name ?? "Landlord"}
                    </p>
                    <p className="text-sm text-slate-600">Property owner</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 text-sm text-slate-600">
                  {property.landlord?.email ? (
                    <p className="flex items-center gap-2">
                      <Mail size={16} aria-hidden="true" />
                      {property.landlord.email}
                    </p>
                  ) : null}
                  {property.landlord?.phone ? (
                    <p className="flex items-center gap-2">
                      <Phone size={16} aria-hidden="true" />
                      {property.landlord.phone}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
