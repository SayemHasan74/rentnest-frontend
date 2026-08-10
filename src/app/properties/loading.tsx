import { PropertyCardSkeleton } from "@/components/properties/property-card-skeleton";

export default function PropertiesLoading() {
  return (
    <main aria-label="Loading properties" className="bg-slate-50">
      <section className="border-b border-slate-300 bg-surface">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 h-14 max-w-2xl animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-5 max-w-xl animate-pulse rounded bg-slate-200" />
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-[90rem] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-10 lg:py-14">
        <div className="hidden min-h-96 animate-pulse rounded-md border border-slate-300 bg-surface lg:block" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <PropertyCardSkeleton key={index} />)}
        </div>
      </section>
    </main>
  );
}
