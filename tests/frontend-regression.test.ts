import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getHomeRoleAction,
  getPaymentResultAction,
  getSafePostLoginPath,
} from "../src/lib/auth";
import { formatCurrency } from "../src/lib/format";
import {
  getAccountNavigationLinks,
  publicNavigationLinks,
} from "../src/lib/navigation";
import type { User } from "../src/types/rentnest";

const userWithRole = (role: User["role"]) => ({ role }) as User;

test("rent is displayed in Bangladeshi taka", () => {
  const formatted = formatCurrency(25_000);

  assert.match(formatted, /25,000/);
  assert.match(formatted, /\u09F3|BDT/);
  assert.doesNotMatch(formatted, /\$/);
});

test("cross-role dashboard redirects are rejected", () => {
  assert.equal(getSafePostLoginPath("TENANT", null), "/home");
  assert.equal(getSafePostLoginPath("TENANT", "/home"), "/home");
  assert.equal(
    getSafePostLoginPath("LANDLORD", "/dashboard/admin"),
    "/dashboard/landlord",
  );
  assert.equal(
    getSafePostLoginPath("TENANT", "/dashboard/tenant/requests/123/pay"),
    "/dashboard/tenant/requests/123/pay",
  );
});

test("the authenticated home route is protected on the server and after session expiry", () => {
  const proxy = readFileSync("src/proxy.ts", "utf8");
  const verifier = readFileSync(
    "src/components/layout/session-verifier.tsx",
    "utf8",
  );

  assert.match(proxy, /pathname === "\/home" && \(!token \|\| !role\)/);
  assert.match(proxy, /matcher: \["\/auth\/:path\*", "\/dashboard\/:path\*", "\/home"\]/);
  assert.match(verifier, /window\.location\.pathname === "\/home"/);
});

test("authenticated home uses real routes, activity data, map, and device favorites", () => {
  const home = readFileSync("src/components/home/home-explorer.tsx", "utf8");
  const header = readFileSync("src/components/layout/site-header.tsx", "utf8");

  assert.match(header, /action="\/properties"/);
  assert.match(header, /name="maxPrice"/);
  assert.match(header, /pathname === "\/home"[\s\S]*aria-label="Main navigation"/);
  assert.match(home, /openstreetmap\.org\/export\/embed\.html/);
  assert.match(home, /api\.rentals\.listMine/);
  assert.match(home, /api\.landlord\.requests/);
  assert.match(home, /api\.admin\.rentals/);
  assert.match(home, /rentnest-favorite-properties/);
  assert.doesNotMatch(home, /% match|14 new|Tours|Message/);
});

test("background API failures have visible UI feedback", () => {
  const propertyPage = readFileSync("src/app/properties/page.tsx", "utf8");
  const warmup = readFileSync("src/components/layout/backend-warmup.tsx", "utf8");
  const verifier = readFileSync("src/components/layout/session-verifier.tsx", "utf8");

  assert.match(propertyPage, /hasCategoryError/);
  assert.match(warmup, /<Toast message=\{error\}/);
  assert.match(verifier, /<Toast message=\{errorMessage\}/);
});

test("paid rentals are counted once across rental and payment records", () => {
  const dashboard = readFileSync(
    "src/components/dashboard/tenant-rentals-dashboard.tsx",
    "utf8",
  );

  assert.match(dashboard, /const paidRentalIds = new Set/);
  assert.match(dashboard, /paidRentalIds\.add\(payment\.rentalRequestId\)/);
  assert.match(dashboard, /value: paidRentalIds\.size/);
  assert.doesNotMatch(dashboard, /value: active \+ paid/);
});

test("offline browser state produces global visible feedback", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  const networkToast = readFileSync(
    "src/components/layout/network-status-toast.tsx",
    "utf8",
  );

  assert.match(layout, /<NetworkStatusToast \/>/);
  assert.match(networkToast, /window\.addEventListener\("offline", updateStatus\)/);
  assert.match(networkToast, /You are offline/);
  assert.match(networkToast, /placement="bottom"/);
});

test("payment result never renders the Stripe session identifier", () => {
  const paymentResult = readFileSync(
    "src/components/payments/payment-result.tsx",
    "utf8",
  );

  assert.doesNotMatch(paymentResult, /\{sessionId\}/);
  assert.match(paymentResult, /window\.history\.replaceState/);
  assert.match(paymentResult, /window\.location\.pathname/);
});

test("payment result dashboard action follows the active session", () => {
  assert.equal(
    getPaymentResultAction(null).href,
    "/auth/login?from=%2Fdashboard%2Ftenant",
  );
  assert.equal(
    getPaymentResultAction(userWithRole("LANDLORD")).href,
    "/dashboard/landlord",
  );
  assert.equal(
    getPaymentResultAction(userWithRole("TENANT")).href,
    "/dashboard/tenant",
  );
});

test("homepage actions are appropriate for each role", () => {
  assert.equal(getHomeRoleAction(null).href, "/auth/register");
  assert.equal(
    getHomeRoleAction(userWithRole("LANDLORD")).href,
    "/dashboard/landlord#add-property",
  );
  assert.equal(
    getHomeRoleAction(userWithRole("TENANT")).href,
    "/dashboard/tenant#my-requests",
  );
  assert.equal(
    getHomeRoleAction(userWithRole("ADMIN")).href,
    "/dashboard/admin",
  );
  assert.notEqual(
    getHomeRoleAction(userWithRole("TENANT")).label,
    "List a property",
  );
});

test("homepage ticker moves from right to left", () => {
  const styles = readFileSync("src/app/globals.css", "utf8");

  assert.match(styles, /@keyframes home-ticker-right-to-left/);
  assert.match(
    styles,
    /from\s*\{\s*transform: translateX\(0\);[\s\S]*to\s*\{\s*transform: translateX\(-50%\);/,
  );
});

test("theme is selected before hydration and remains persistent", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  const themeLibrary = readFileSync("src/lib/theme.ts", "utf8");
  const themeProvider = readFileSync(
    "src/components/theme/theme-provider.tsx",
    "utf8",
  );

  assert.match(layout, /suppressHydrationWarning/);
  assert.match(layout, /data-scroll-behavior="smooth"/);
  assert.match(layout, /themeInitializationScript/);
  assert.match(layout, /<ThemeProvider>/);
  assert.match(themeLibrary, /rentnest-theme/);
  assert.match(themeLibrary, /prefers-color-scheme: dark/);
  assert.match(themeLibrary, /document\.documentElement\.dataset\.theme = theme/);
  assert.match(themeProvider, /window\.localStorage\.setItem/);
  assert.match(themeProvider, /window\.addEventListener\("storage"/);
});

test("light and dark modes share semantic, three-color design tokens", () => {
  const styles = readFileSync("src/app/globals.css", "utf8");
  const badge = readFileSync("src/components/ui/badge.tsx", "utf8");
  const button = readFileSync("src/components/ui/button.tsx", "utf8");

  assert.match(styles, /\[data-theme="light"\]/);
  assert.match(styles, /\[data-theme="dark"\]/);
  assert.match(styles, /--color-primary: var\(--rn-primary\)/);
  assert.match(styles, /--color-surface: var\(--rn-surface\)/);
  assert.match(styles, /--color-inverse-foreground/);
  assert.doesNotMatch(styles, /--rn-(blue|purple)-/);
  assert.doesNotMatch(badge, /(?:bg|text|ring)-(?:blue|purple)-/);
  assert.match(button, /bg-primary text-primary-foreground/);
});

test("theme controls are available in desktop and mobile navigation", () => {
  const header = readFileSync("src/components/layout/site-header.tsx", "utf8");
  const toggle = readFileSync(
    "src/components/theme/theme-toggle.tsx",
    "utf8",
  );

  assert.match(header, /<ThemeToggle \/>/);
  assert.match(header, /<ThemeToggle showLabel \/>/);
  assert.match(toggle, /aria-label=\{`Switch to \$\{nextTheme\} mode`\}/);
  assert.match(toggle, /title=\{`Switch to \$\{nextTheme\} mode`\}/);
});

test("application shell exposes the required logged-out and logged-in actions", () => {
  const header = readFileSync("src/components/layout/site-header.tsx", "utf8");
  const loggedOutDestinations = [
    ...publicNavigationLinks.map((link) => link.href),
    "/auth/login",
    "/auth/register",
  ];

  assert.ok(new Set(loggedOutDestinations).size >= 4);
  assert.equal(publicNavigationLinks.some((link) => link.label === "Home"), false);
  assert.match(header, /isAuthPage = pathname\.startsWith\("\/auth\/"\)/);
  assert.match(header, /if \(isAuthPage\)/);
  assert.doesNotMatch(header, /pathname === "\/"\s*\? \[\]/);
  assert.match(header, /isAuthenticated \? \[\{ href: dashboardPath/);
  assert.match(header, /<AccountMenu onLogout=\{handleLogout\} user=\{user\} \/>/);

  for (const role of ["TENANT", "LANDLORD", "ADMIN"] as const) {
    const loggedInActions = new Set([
      ...publicNavigationLinks.map((link) => link.href),
      ...getAccountNavigationLinks(role).map((link) => link.href),
      "logout",
    ]);

    assert.ok(loggedInActions.size >= 6, `${role} must expose at least six actions`);
  }
});

test("account menu supports pointer, keyboard, and assistive-technology use", () => {
  const accountMenu = readFileSync(
    "src/components/layout/account-menu.tsx",
    "utf8",
  );

  assert.match(accountMenu, /aria-haspopup="menu"/);
  assert.match(accountMenu, /aria-expanded=\{isOpen\}/);
  assert.match(accountMenu, /role="menu"/);
  assert.match(accountMenu, /role="menuitem"/);
  assert.match(accountMenu, /event\.key === "Escape"/);
  assert.match(accountMenu, /document\.addEventListener\("pointerdown"/);
  assert.match(accountMenu, /triggerRef\.current\?\.focus\(\)/);
});

test("footer contains only real internal routes and verified maintainer links", () => {
  const footer = readFileSync("src/components/layout/site-footer.tsx", "utf8");

  for (const route of [
    "/properties",
    "/privacy",
    "/data-deletion",
    "/auth/login",
    "/auth/register",
  ]) {
    assert.match(footer, new RegExp(route.replaceAll("/", "\\/")));
  }

  assert.match(footer, /Hasan Mohammad Sayem/);
  assert.match(footer, /RentNest project maintainer/);
  assert.match(footer, /mailto:sayemhasan4700@gmail\.com/);
  assert.match(footer, /Badda, Dhaka/);
  assert.match(footer, /https:\/\/github\.com\/SayemHasan74/);
  assert.match(footer, /https:\/\/portfolio-rose-sigma-60\.vercel\.app\//);
  assert.match(footer, /https:\/\/www\.facebook\.com\/hasanmohammadsayem\.sayem/);
  assert.match(footer, /target="_blank"/);
  assert.match(footer, /rel="noreferrer"/);
  assert.doesNotMatch(footer, /hello@|support@|contact@/);
  assert.doesNotMatch(footer, /text-slate-|border-slate-|hover:bg-slate-/);
});
