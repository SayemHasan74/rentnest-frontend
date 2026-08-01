import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getSafePostLoginPath } from "../src/lib/auth";
import { formatCurrency } from "../src/lib/format";

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
