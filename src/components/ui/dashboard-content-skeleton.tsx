export function DashboardContentSkeleton({ label }: { label: string }) {
  return (
    <div aria-label={label} className="grid gap-3" role="status">
      {Array.from({ length: 2 }).map((_, index) => (
        <div className="animate-pulse rounded-md border border-slate-200 bg-surface p-4" key={index}>
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-36 bg-slate-200" />
            <div className="h-7 w-24 bg-slate-200" />
          </div>
          <div className="mt-4 h-3 w-2/3 bg-slate-100" />
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="h-12 bg-slate-100" />
            <div className="h-12 bg-slate-100" />
            <div className="h-12 bg-slate-100" />
          </div>
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
