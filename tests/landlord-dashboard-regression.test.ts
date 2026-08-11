import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync("src/components/dashboard/landlord-properties-dashboard.tsx", "utf8");

test("landlord dashboard visualizes live portfolio activity", () => {
  assert.match(dashboard, /function LandlordPortfolioChart/);
  assert.match(dashboard, /Landlord portfolio activity chart/);
  assert.match(dashboard, /property\.status === "AVAILABLE"/);
  assert.match(dashboard, /request\.status === "PENDING"/);
  assert.match(dashboard, /<LandlordPortfolioChart properties=\{visibleProperties\} requests=\{visibleRequests\}/);
});

test("landlord inventory table supports filtering and pagination", () => {
  assert.match(dashboard, /landlord-inventory-search/);
  assert.match(dashboard, /landlord-inventory-status/);
  assert.match(dashboard, /const filteredProperties = useMemo/);
  assert.match(dashboard, /const inventoryTotalPages/);
  assert.match(dashboard, /paginatedProperties\.map/);
  assert.match(dashboard, /setInventoryPage\(1\)/);
});
