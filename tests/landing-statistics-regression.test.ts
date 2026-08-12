import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const landingPage = readFileSync("src/app/page.tsx", "utf8");

test("landing statistics come from the public property API", () => {
  assert.match(landingPage, /export const revalidate = 300/);
  assert.match(landingPage, /api\.properties\.list\(\{ limit: 100 \}\)/);
  assert.match(landingPage, /getLandingStatistics\(properties\)/);
  assert.match(landingPage, /property\.reviews\?\.length/);
  assert.match(landingPage, /Number\(property\.rentAmount\)/);
});

test("landing page does not advertise fabricated marketplace figures", () => {
  assert.doesNotMatch(landingPage, /2,400\+/);
  assert.doesNotMatch(landingPage, /340 homes|212 homes|198 homes|276 homes/);
  assert.doesNotMatch(landingPage, /98%|Average owner response|Would search again/);
  assert.doesNotMatch(landingPage, /Nusrat J\./);
});

test("landing page handles an unavailable property API without dummy fallback totals", () => {
  assert.match(landingPage, /Live listing totals are temporarily unavailable/);
  assert.match(landingPage, /Live marketplace statistics are temporarily unavailable/);
  assert.match(landingPage, /Live catalogue insights will return/);
});

test("landing page provides at least eight meaningful sections", () => {
  assert.ok((landingPage.match(/<section/g) ?? []).length >= 8);
  assert.match(landingPage, /A clearer rental path/);
  assert.match(landingPage, /From the live catalogue/);
  assert.match(landingPage, /featuredHomes = properties\.slice\(0, 3\)/);
});
