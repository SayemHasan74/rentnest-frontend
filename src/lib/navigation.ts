import type { UserRole } from "@/types/rentnest";

export type ShellLink = {
  href: string;
  label: string;
};

export const publicNavigationLinks: ShellLink[] = [
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const accountNavigationLinks: Record<UserRole, ShellLink[]> = {
  TENANT: [
    { href: "/dashboard/tenant", label: "Dashboard overview" },
    { href: "/dashboard/tenant#my-requests", label: "My rental requests" },
    { href: "/dashboard/tenant#payment-history", label: "Payment history" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  LANDLORD: [
    { href: "/dashboard/landlord", label: "Dashboard overview" },
    { href: "/dashboard/landlord#add-property", label: "Add a property" },
    { href: "/dashboard/landlord#my-properties", label: "My properties" },
    { href: "/dashboard/landlord#rental-requests", label: "Rental requests" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Dashboard overview" },
    { href: "/dashboard/admin#users", label: "Manage users" },
    { href: "/dashboard/admin#categories", label: "Manage categories" },
    { href: "/dashboard/admin#properties", label: "Review properties" },
    { href: "/dashboard/admin#rental-activity", label: "Rental activity" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
};

export const getAccountNavigationLinks = (role: UserRole) =>
  accountNavigationLinks[role];

export const getPrimaryRoleLink = (role: UserRole) => {
  const primaryLinks: Record<UserRole, ShellLink> = {
    TENANT: accountNavigationLinks.TENANT[1],
    LANDLORD: accountNavigationLinks.LANDLORD[2],
    ADMIN: accountNavigationLinks.ADMIN[1],
  };

  return primaryLinks[role];
};
