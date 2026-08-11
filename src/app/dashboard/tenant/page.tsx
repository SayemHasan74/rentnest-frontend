import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TenantRentalsDashboard } from "@/components/dashboard/tenant-rentals-dashboard";

export const metadata: Metadata = {
  title: "Tenant Dashboard | RentNest",
  description: "Track RentNest rental requests and tenant activity.",
};

export default function TenantDashboardPage() {
  return (
    <DashboardShell role="TENANT">
      <TenantRentalsDashboard />
    </DashboardShell>
  );
}
