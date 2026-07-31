import type { Metadata } from "next";
import { LandlordPropertiesDashboard } from "@/components/dashboard/landlord-properties-dashboard";

export const metadata: Metadata = {
  title: "Landlord Requests | RentNest",
  description: "Manage RentNest rental requests for landlord properties.",
};

export default function LandlordRequestsPage() {
  return <LandlordPropertiesDashboard />;
}
