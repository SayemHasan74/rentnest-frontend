import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rentalRequest = readFileSync(
  "src/components/properties/rental-request-panel.tsx",
  "utf8",
);
const landlordDashboard = readFileSync(
  "src/components/dashboard/landlord-properties-dashboard.tsx",
  "utf8",
);
const adminDashboard = readFileSync(
  "src/components/dashboard/admin-users-dashboard.tsx",
  "utf8",
);

test("custom validated forms connect field errors to their inputs", () => {
  assert.match(rentalRequest, /aria-describedby=\{fieldErrors\.moveInDate/);
  assert.match(rentalRequest, /id="moveInDate-error"/);
  assert.match(rentalRequest, /aria-describedby=\{fieldErrors\.rentalMonths/);
  assert.match(rentalRequest, /role="alert"/);
  assert.match(landlordDashboard, /const getErrorProps =/);
  assert.match(landlordDashboard, /\{\.\.\.getErrorProps\("title"\)\}/);
  assert.match(landlordDashboard, /\{\.\.\.getErrorProps\("images"\)\}/);
  assert.match(landlordDashboard, /rejection-\$\{request\.id\}-error/);
  assert.match(adminDashboard, /category-error-\$\{submitLabel\}/);
});

test("custom validated forms opt into accessible controlled validation", () => {
  assert.match(rentalRequest, /<form className="grid gap-4" noValidate/);
  assert.match(landlordDashboard, /<form className="grid gap-5" noValidate/);
  assert.match(landlordDashboard, /<form className="grid gap-3" noValidate/);
  assert.match(adminDashboard, /<form className="grid gap-4" noValidate/);
});
