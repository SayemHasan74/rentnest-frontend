import type { Metadata } from "next";
import { TenantPayPanel } from "@/components/dashboard/tenant-pay-panel";

type PageParams = {
  id: string;
};

export const metadata: Metadata = {
  title: "Pay Rental Request | RentNest",
  description: "Start secure RentNest rental payment checkout.",
};

export default async function TenantPayPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = await params;

  return <TenantPayPanel rentalRequestId={id} />;
}
