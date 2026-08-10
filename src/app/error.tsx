"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-md border border-red-200 bg-surface p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={36} aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {error.message || "The page could not load correctly."}
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
