import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authForm = readFileSync("src/components/auth/auth-form.tsx", "utf8");
const socialLogin = readFileSync("src/components/auth/social-login.tsx", "utf8");
const api = readFileSync("src/lib/api.ts", "utf8");

test("demo account controls fill credentials without submitting them", () => {
  assert.match(authForm, /demo credentials filled\. Select Login to continue\./);
  assert.doesNotMatch(authForm, /await loginAndRedirect\(account\.email, account\.password\)/);
});

test("Google and Facebook buttons exchange provider credentials for RentNest sessions", () => {
  assert.match(authForm, /<SocialLogin/);
  assert.match(socialLogin, /google\.accounts\.id\.initialize/);
  assert.match(socialLogin, /FB\.login/);
  assert.match(socialLogin, /scope: "public_profile,email"/);
  assert.match(api, /"\/auth\/google"/);
  assert.match(api, /"\/auth\/facebook"/);
});

test("authentication controls provide client validation and accessible error feedback", () => {
  assert.match(authForm, /\^\\S\+@\\S\+\\\.\\S\+\$/);
  assert.match(authForm, /aria-invalid=\{Boolean\(fieldErrors\.email\)\}/);
  assert.match(authForm, /aria-describedby=\{fieldErrors\.password/);
  assert.match(authForm, /role="radiogroup"/);
  assert.match(authForm, /noValidate/);
  assert.match(authForm, /Creating account\.\.\./);
  assert.match(authForm, /Logging in\.\.\./);
});
