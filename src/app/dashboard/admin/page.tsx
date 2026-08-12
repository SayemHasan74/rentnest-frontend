import type { Metadata } from "next";
import { AdminUsersDashboard } from "@/components/dashboard/admin-users-dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AdminSupportInbox } from "@/components/dashboard/admin-support-inbox";

export const metadata: Metadata = {
  title: "Admin Dashboard | RentNest",
  description: "Manage RentNest users and account access.",
};

export default function AdminDashboardPage() {
  return (
    <DashboardShell role="ADMIN">
      <AdminUsersDashboard />
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"><AdminSupportInbox /></div>
    </DashboardShell>
  );
}
