import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentResult } from "@/components/payments/payment-result";

export const metadata: Metadata = {
  title: "Payment Cancelled | RentNest",
  description: "RentNest payment cancellation status.",
};

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <PaymentResult status="cancel" />
    </Suspense>
  );
}
