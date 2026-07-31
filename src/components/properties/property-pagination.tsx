import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/rentnest";

const getPageHref = (
  searchParams: Record<string, string | undefined>,
  page: number,
) => {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") {
      params.set(key, value);
    }
  });

  params.set("page", String(page));

  return `/properties?${params.toString()}`;
};

export function PropertyPagination({
  meta,
  searchParams,
}: {
  meta: PaginationMeta;
  searchParams: Record<string, string | undefined>;
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(meta.page - 1, 1);
  const nextPage = Math.min(meta.page + 1, meta.totalPages);

  return (
    <nav
      aria-label="Property pagination"
      className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row"
    >
      <p className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-950">{meta.page}</span> of{" "}
        <span className="font-semibold text-slate-950">{meta.totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Link
          aria-disabled={meta.page <= 1}
          className={cn(
            buttonClasses({ variant: "outline" }),
            meta.page <= 1 && "pointer-events-none opacity-50",
          )}
          href={getPageHref(searchParams, previousPage)}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Previous
        </Link>
        <Link
          aria-disabled={meta.page >= meta.totalPages}
          className={cn(
            buttonClasses({ variant: "outline" }),
            meta.page >= meta.totalPages && "pointer-events-none opacity-50",
          )}
          href={getPageHref(searchParams, nextPage)}
        >
          Next
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
