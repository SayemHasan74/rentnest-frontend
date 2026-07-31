import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Register | RentNest",
  description: "Create a tenant or landlord account on RentNest.",
};

export default function RegisterPage() {
  return (
    <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </main>
  );
}
