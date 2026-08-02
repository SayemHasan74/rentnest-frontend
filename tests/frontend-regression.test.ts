import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getHomeRoleAction,
  getPaymentResultAction,
  getSafePostLoginPath,
} from "../src/lib/auth";
import { formatCurrency } from "../src/lib/format";
import type { User } from "../src/types/rentnest";

const userWithRole = (role: User["role"]) => ({ role }) as User;

test("rent is displayed in Bangladeshi taka", () => {
  const formatted = formatCurrency(25_000);

  assert.match(formatted, /25,000/);
  assert.match(formatted, /\u09F3|BDT/);
  assert.doesNotMatch(formatted, /\$/);
});

test("cross-role dashboard redirects are rejected", () => {
  assert.equal(
    getSafePostLoginPath("LANDLORD", "/dashboard/admin"),
    "/dashboard/landlord",
  );
  assert.equal(
    getSafePostLoginPath("TENANT", "/dashboard/tenant/requests/123/pay"),
    "/dashboard/tenant/requests/123/pay",
  );
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
