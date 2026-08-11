import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getAccountNavigationLinks } from "../src/lib/navigation";

test("role-aware dashboard navigation meets the required item counts", () => {
  assert.ok(getAccountNavigationLinks("TENANT").length >= 4);
  assert.ok(getAccountNavigationLinks("ADMIN").length >= 6);
  assert.ok(getAccountNavigationLinks("LANDLORD").length >= 4);
});

test("all role dashboard entry pages use the shared responsive sidebar", () => {
  const shell = readFileSync("src/components/dashboard/dashboard-shell.tsx", "utf8");
  const pages = [
    "src/app/dashboard/tenant/page.tsx",
    "src/app/dashboard/landlord/page.tsx",
    "src/app/dashboard/admin/page.tsx",
  ].map((path) => readFileSync(path, "utf8"));

  assert.match(shell, /<aside/);
  assert.match(shell, /lg:sticky/);
  assert.match(shell, /overflow-x-auto/);
  assert.match(shell, /Profile and Logout/);
  pages.forEach((page) => assert.match(page, /<DashboardShell role=/));
});
