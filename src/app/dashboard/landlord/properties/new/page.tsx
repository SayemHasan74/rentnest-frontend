import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LandlordPropertiesDashboard } from "@/components/dashboard/landlord-properties-dashboard";

export const metadata: Metadata = {
  title: "New Property | RentNest",
  description: "Create a RentNest landlord property listing.",
};

export default function NewLandlordPropertyPage() {
  return (
    <DashboardShell role="LANDLORD">
      <LandlordPropertiesDashboard />
    </DashboardShell>
  );
}
