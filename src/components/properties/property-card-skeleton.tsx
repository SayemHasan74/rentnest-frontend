export function PropertyCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[38rem] overflow-hidden rounded-md border border-slate-300 bg-surface shadow-sm"
    >
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-4 p-5 sm:p-6">
        <div className="h-7 w-20 animate-pulse rounded-md bg-slate-200" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="space-y-2"><div className="h-4 w-full animate-pulse rounded bg-slate-200" /><div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" /></div>
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-14 animate-pulse border-y border-slate-200 bg-slate-100" />
      </div>
    </div>
  );
}
