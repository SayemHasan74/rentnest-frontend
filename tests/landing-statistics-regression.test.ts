import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const landingPage = readFileSync("src/app/page.tsx", "utf8");

test("landing statistics come from the public property API", () => {
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
