import type { Metadata } from "next";
import { AdminUsersDashboard } from "@/components/dashboard/admin-users-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | RentNest",
  description: "Manage RentNest users and account access.",
};

export default function AdminDashboardPage() {
  return <AdminUsersDashboard />;
}
