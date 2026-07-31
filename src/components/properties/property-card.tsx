import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, MoveRight, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { Property } from "@/types/rentnest";

const fallbackImage =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267";

export function PropertyCard({ property }: { property: Property }) {
  const imageUrl = property.images[0] || fallbackImage;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        className="block"
        href={`/properties/${property.id}`}
        aria-label={`View ${property.title}`}
      >
        <div className="relative aspect-[4/3] bg-slate-100">
          <Image
            alt={property.title}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={imageUrl}
          />
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone="emerald">{property.category?.name ?? "Rental"}</Badge>
            <h2 className="mt-3 line-clamp-2 text-lg font-semibold tracking-tight text-slate-950">
              <Link href={`/properties/${property.id}`}>{property.title}</Link>
            </h2>
          </div>
          <p className="shrink-0 text-right text-sm font-bold text-emerald-700">
            {formatCurrency(property.rentAmount)}
            <span className="block text-xs font-medium text-slate-500">/month</span>
          </p>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin size={16} aria-hidden="true" />
          {property.location}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-2">
            <BedDouble size={14} aria-hidden="true" />
            {property.bedrooms} Bed
          </span>
          <span className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-2">
            <Bath size={14} aria-hidden="true" />
            {property.bathrooms} Bath
          </span>
          <span className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-2">
            <Ruler size={14} aria-hidden="true" />
            {property.areaSqFt ?? "-"} sqft
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {property.amenities.slice(0, 3).map((amenity) => (
            <span
              className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
              key={amenity}
            >
              {amenity}
            </span>
          ))}
        </div>

        <Link
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          href={`/properties/${property.id}`}
        >
          View details
          <MoveRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
