import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Login | RentNest",
  description: "Login to your RentNest dashboard.",
};

export default function LoginPage() {
  return (
    <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
