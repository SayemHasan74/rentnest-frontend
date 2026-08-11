import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LandlordPropertiesDashboard } from "@/components/dashboard/landlord-properties-dashboard";

export const metadata: Metadata = {
  title: "Landlord Requests | RentNest",
  description: "Manage RentNest rental requests for landlord properties.",
};

export default function LandlordRequestsPage() {
  return (
    <DashboardShell role="LANDLORD">
      <LandlordPropertiesDashboard />
    </DashboardShell>
  );
}
