import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LandlordPropertiesDashboard } from "@/components/dashboard/landlord-properties-dashboard";

export const metadata: Metadata = {
  title: "Landlord Dashboard | RentNest",
  description: "Manage RentNest landlord property listings.",
};

export default function LandlordDashboardPage() {
  return (
    <DashboardShell role="LANDLORD">
      <LandlordPropertiesDashboard />
    </DashboardShell>
  );
}
