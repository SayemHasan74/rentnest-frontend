export default function Loading() {
  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6">
        <div className="h-28 animate-pulse rounded-md bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="h-56 animate-pulse rounded-md border border-slate-200 bg-surface"
              key={index}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
