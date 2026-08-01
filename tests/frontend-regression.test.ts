import assert from "node:assert/strict";
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
