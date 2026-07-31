import type { Metadata } from "next";
import { LandlordPropertiesDashboard } from "@/components/dashboard/landlord-properties-dashboard";

export const metadata: Metadata = {
  title: "Landlord Dashboard | RentNest",
  description: "Manage RentNest landlord property listings.",
};

export default function LandlordDashboardPage() {
  return <LandlordPropertiesDashboard />;
}
