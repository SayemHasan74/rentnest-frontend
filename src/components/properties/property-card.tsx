import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, MoveRight, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { Property } from "@/types/rentnest";

const fallbackImage =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267";

export function PropertyCard({
  priority = false,
  property,
}: {
  priority?: boolean;
  property: Property;
}) {
  const imageUrl = property.images[0] || fallbackImage;

  return (
    <article className="group border-t border-slate-300 bg-transparent pt-3">
      <Link
        className="block"
        href={`/properties/${property.id}`}
        aria-label={`View ${property.title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
          <Image
            alt={property.title}
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={imageUrl}
          />
        </div>
      </Link>
      <div className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone="emerald">{property.category?.name ?? "Rental"}</Badge>
            <h2 className="mt-3 line-clamp-2 text-lg font-semibold text-slate-950">
              <Link href={`/properties/${property.id}`}>{property.title}</Link>
            </h2>
          </div>
          <p className="shrink-0 text-right text-sm font-semibold text-slate-950">
            {formatCurrency(property.rentAmount)}
            <span className="block text-xs font-medium text-slate-500">/month</span>
          </p>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin size={16} aria-hidden="true" />
          {property.location}
        </p>

        <div className="mt-4 grid grid-cols-3 border-y border-slate-300 py-3 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5 border-r border-slate-300 px-2">
            <BedDouble size={14} aria-hidden="true" />
            {property.bedrooms} Bed
          </span>
          <span className="flex items-center gap-1.5 border-r border-slate-300 px-2">
            <Bath size={14} aria-hidden="true" />
            {property.bathrooms} Bath
          </span>
          <span className="flex items-center gap-1.5 px-2">
            <Ruler size={14} aria-hidden="true" />
            {property.areaSqFt ?? "-"} sqft
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {property.amenities.slice(0, 3).map((amenity) => (
            <span
              className="border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600"
              key={amenity}
            >
              {amenity}
            </span>
          ))}
        </div>

        <Link
          className="mt-5 inline-flex items-center gap-2 border-b border-slate-950 pb-1 text-sm font-semibold text-slate-950"
          href={`/properties/${property.id}`}
        >
          View details
          <MoveRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
