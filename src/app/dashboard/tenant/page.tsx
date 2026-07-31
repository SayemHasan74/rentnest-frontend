import type { Metadata } from "next";
import { TenantRentalsDashboard } from "@/components/dashboard/tenant-rentals-dashboard";

export const metadata: Metadata = {
  title: "Tenant Dashboard | RentNest",
  description: "Track RentNest rental requests and tenant activity.",
};

export default function TenantDashboardPage() {
  return <TenantRentalsDashboard />;
}
