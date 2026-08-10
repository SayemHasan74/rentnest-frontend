import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path: string) => readFileSync(path, "utf8");

test("property explore exposes search, sort, and one atomic filter submission", () => {
  const source = readSource("src/components/properties/property-filters-form.tsx");

  assert.match(source, /htmlFor="search"/);
  assert.match(source, /htmlFor="sort"/);
  assert.match(source, /value="rent_asc"/);
  assert.match(source, /value="rent_desc"/);
  assert.match(source, /router\.push\(buildFilterUrl\(filterValues\)\)/);
  assert.doesNotMatch(source, /router\.replace/);
});

test("property explore sends search and sort to the API while preserving them for pagination", () => {
  const source = readSource("src/app/properties/page.tsx");
  const paginationSource = readSource("src/components/properties/property-pagination.tsx");

  assert.match(source, /search: getStringParam\(searchParams, "search"\)/);
  assert.match(source, /sort: \(getStringParam\(searchParams, "sort"\)/);
  assert.match(paginationSource, /key !== "page"/);
});
