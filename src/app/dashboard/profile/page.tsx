import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Profile | RentNest",
  description: "View and update your RentNest account profile.",
};

export default function ProfilePage() {
  return <ProfileForm />;
}
