import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path: string) => readFileSync(path, "utf8");

test("property cards expose complete listing information in a consistent fixed-height layout", () => {
  const source = readSource("src/components/properties/property-card.tsx");

  assert.match(source, /h-\[38rem\]/);
  assert.match(source, /property\.description/);
  assert.match(source, /Listed \{formatListedDate\(property\.createdAt\)\}/);
  assert.match(source, /averageRating\.toFixed\(1\)/);
  assert.match(source, /View details/);
});

test("property listing uses a three-column desktop grid and route-level card skeletons", () => {
  const listingSource = readSource("src/app/properties/page.tsx");
  const loadingSource = readSource("src/app/properties/loading.tsx");

  assert.match(listingSource, /lg:grid-cols-3/);
  assert.match(loadingSource, /PropertyCardSkeleton/);
  assert.match(loadingSource, /length: 6/);
});
