import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/auth-constants";
import type { UserRole } from "@/types/rentnest";

const roleDashboardPaths: Record<UserRole, string> = {
  TENANT: "/dashboard/tenant",
  LANDLORD: "/dashboard/landlord",
  ADMIN: "/dashboard/admin",
};

const roleProtectedRoutes: Array<{
  prefix: string;
  roles: UserRole[];
}> = [
  { prefix: "/dashboard/tenant", roles: ["TENANT"] },
  { prefix: "/dashboard/landlord", roles: ["LANDLORD"] },
  { prefix: "/dashboard/admin", roles: ["ADMIN"] },
];

const isUserRole = (role: string | undefined): role is UserRole =>
  role === "TENANT" || role === "LANDLORD" || role === "ADMIN";

const createRedirect = (request: NextRequest, pathname: string) =>
  NextResponse.redirect(new URL(pathname, request.url));

const createLoginRedirect = (request: NextRequest) => {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const roleCookie = request.cookies.get(AUTH_ROLE_COOKIE)?.value;
  const role = isUserRole(roleCookie) ? roleCookie : null;

  if (pathname.startsWith("/auth") && token && role) {
    return createRedirect(request, roleDashboardPaths[role]);
  }

  if (pathname === "/dashboard" && token && role) {
    return createRedirect(request, roleDashboardPaths[role]);
  }

  if (pathname.startsWith("/dashboard") && (!token || !role)) {
    return createLoginRedirect(request);
  }

  const route = roleProtectedRoutes.find(({ prefix }) =>
    pathname.startsWith(prefix),
  );

  if (route && role && !route.roles.includes(role)) {
    return createRedirect(request, "/unauthorized");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*"],
};
