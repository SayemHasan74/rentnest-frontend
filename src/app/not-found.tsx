import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-md border border-slate-200 bg-surface p-8 text-center shadow-sm">
        <SearchX className="mx-auto text-emerald-700" size={42} aria-hidden="true" />
        <p className="mt-5 text-sm font-semibold text-emerald-700">404 error</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The page may have moved, or the rental listing is no longer available.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link className={buttonClasses()} href="/">
            <Home size={16} aria-hidden="true" />
            Home
          </Link>
          <Link className={buttonClasses({ variant: "outline" })} href="/properties">
            Browse properties
          </Link>
        </div>
      </div>
    </main>
  );
}
