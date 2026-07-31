import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentResult } from "@/components/payments/payment-result";

export const metadata: Metadata = {
  title: "Payment Success | RentNest",
  description: "RentNest payment success status.",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentResult status="success" />
    </Suspense>
  );
}
