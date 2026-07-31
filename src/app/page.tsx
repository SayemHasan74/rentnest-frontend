const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://rentnest-server.onrender.com/api";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-950">
      <section className="mx-auto w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          RentNest Frontend
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Find and list rental properties with ease.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          This Next.js App Router project is configured for the RentNest
          assignment and will connect to the live RentNest API.
        </p>
        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-md border border-slate-200 p-4">
            <dt className="font-semibold text-slate-900">Tenant</dt>
            <dd className="mt-1 text-slate-600">Browse, request, pay, review.</dd>
          </div>
          <div className="rounded-md border border-slate-200 p-4">
            <dt className="font-semibold text-slate-900">Landlord</dt>
            <dd className="mt-1 text-slate-600">List, manage, approve.</dd>
          </div>
          <div className="rounded-md border border-slate-200 p-4">
            <dt className="font-semibold text-slate-900">Admin</dt>
            <dd className="mt-1 text-slate-600">Moderate users and rentals.</dd>
          </div>
        </dl>
        <p className="mt-8 rounded-md bg-slate-100 px-4 py-3 font-mono text-xs text-slate-700">
          API: {API_BASE_URL}
        </p>
      </section>
    </main>
  );
}
