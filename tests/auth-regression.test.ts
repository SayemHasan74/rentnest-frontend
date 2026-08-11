import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authForm = readFileSync("src/components/auth/auth-form.tsx", "utf8");

test("demo account controls fill credentials without submitting them", () => {
  assert.match(authForm, /demo credentials filled\. Select Login to continue\./);
  assert.doesNotMatch(authForm, /await loginAndRedirect\(account\.email, account\.password\)/);
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
