import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync("src/components/dashboard/tenant-rentals-dashboard.tsx", "utf8");

test("tenant dashboard visualizes live rental activity", () => {
  assert.match(dashboard, /function TenantActivityChart/);
  assert.match(dashboard, /Rental request activity chart/);
  assert.match(dashboard, /requests\.filter\(\(request\) => request\.status === "ACTIVE"\)/);
  assert.match(dashboard, /<TenantActivityChart requests=\{visibleRequests\}/);
});

test("tenant payment table supports local filtering and pagination", () => {
  assert.match(dashboard, /tenant-payment-search/);
  assert.match(dashboard, /tenant-payment-status/);
  assert.match(dashboard, /const filteredPayments = useMemo/);
  assert.match(dashboard, /const paymentTotalPages/);
  assert.match(dashboard, /paginatedPayments\.map/);
  assert.match(dashboard, /setPaymentPage\(1\)/);
});
