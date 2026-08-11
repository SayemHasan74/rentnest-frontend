import type { Metadata } from "next";
import { AdminUsersDashboard } from "@/components/dashboard/admin-users-dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard | RentNest",
  description: "Manage RentNest users and account access.",
};

export default function AdminDashboardPage() {
  return (
    <DashboardShell role="ADMIN">
      <AdminUsersDashboard />
    </DashboardShell>
  );
}
