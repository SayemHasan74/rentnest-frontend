import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("every account menu includes a protected Profile destination", () => {
  const navigation = readFileSync("src/lib/navigation.ts", "utf8");
  const accountMenu = readFileSync("src/components/layout/account-menu.tsx", "utf8");

  assert.equal((navigation.match(/href: "\/dashboard\/profile"/g) ?? []).length, 3);
  assert.match(accountMenu, /Profile: UserRound/);
  assert.match(accountMenu, /Logout/);
});

test("profile page validates, persists, and synchronizes the signed-in user", () => {
  const form = readFileSync("src/components/profile/profile-form.tsx", "utf8");
  const api = readFileSync("src/lib/api.ts", "utf8");

  assert.match(form, /api\.auth\.updateProfile/);
  assert.match(form, /persistAuthSession\(\{ accessToken: token, user: updatedUser \}\)/);
  assert.match(form, /aria-invalid/);
  assert.match(form, /Saving profile\.\.\./);
  assert.match(api, /method: "PATCH"/);
  assert.match(api, /"\/auth\/me"/);
});
