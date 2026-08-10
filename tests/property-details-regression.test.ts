import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path: string) => readFileSync(path, "utf8");

test("property details includes the required overview, specifications, reviews, and related listings", () => {
  const source = readSource("src/app/properties/[id]/page.tsx");

  assert.match(source, /Property overview/);
  assert.match(source, /Amenities/);
  assert.match(source, /Reviews/);
  assert.match(source, /getRelatedProperties/);
  assert.match(source, /candidate\.id !== property\.id/);
  assert.match(source, /More \{property\.category/);
});

test("property gallery avoids duplicating a single image and presents supplied previews", () => {
  const source = readSource("src/components/properties/property-gallery.tsx");

  assert.match(source, /secondaryImages\.slice\(0, 4\)/);
  assert.match(source, /previewImages\.length > 0/);
  assert.doesNotMatch(source, /galleryImages\.slice\(0, 1\)/);
});
