import type { Metadata } from "next";
import { LandlordPropertiesDashboard } from "@/components/dashboard/landlord-properties-dashboard";

export const metadata: Metadata = {
  title: "New Property | RentNest",
  description: "Create a RentNest landlord property listing.",
};

export default function NewLandlordPropertyPage() {
  return <LandlordPropertiesDashboard />;
}
