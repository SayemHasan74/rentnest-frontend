import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync("src/components/dashboard/admin-users-dashboard.tsx", "utf8");

test("admin dashboard visualizes live rental activity", () => {
  assert.match(dashboard, /function AdminRentalActivityChart/);
  assert.match(dashboard, /Admin rental activity chart/);
  assert.match(dashboard, /request\.status === "APPROVED"/);
  assert.match(dashboard, /request\.status === "COMPLETED"/);
  assert.match(dashboard, /<AdminRentalActivityChart rentals=\{visibleRentals\}/);
});

test("admin user table keeps server filters and client pagination", () => {
  assert.match(dashboard, /admin-user-search/);
  assert.match(dashboard, /admin-role-filter/);
  assert.match(dashboard, /admin-status-filter/);
  assert.match(dashboard, /loadUsers\(toQuery\(filters\)\)/);
  assert.match(dashboard, /const userTotalPages/);
  assert.match(dashboard, /users=\{paginatedUsers\}/);
});
