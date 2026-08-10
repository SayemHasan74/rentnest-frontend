# Part 07 - Listing Explore Search, Filters, Sort, and Pagination

Completion date: 2026-08-10 (Asia/Dhaka)

## PDF requirements handled

The Listing/Explore requirements call for a search bar, at least two functional filters, sorting options, and pagination or infinite scroll. Part 07 completes all five explore checklist rows.

## Implementation

The public browse page now supports:

- broad listing search across property title, description, location, address, and category;
- location, property type, minimum/maximum rent, and comma-separated amenity filters;
- four server-validated sort options: newest, oldest, rent low-to-high, and rent high-to-low;
- existing previous/next pagination, which retains every active search, filter, and sort parameter;
- a labelled Update now action that applies the entire filter state atomically and resets pagination to page 1.

The old debounce-based auto-submit was removed after interaction QA revealed that rapid updates could leave sort selection out of sync with the URL. The explicit submission flow prevents that race and gives users a predictable apply point.

Server validation trims broad search text, caps it at 100 characters, defaults sort to newest, and rejects unsupported sort values. The query service combines search with all existing filters, applies the selected order, and continues to paginate the result set.

## Responsive and interaction evidence

| Viewport | Result |
| --- | --- |
| 390 x 844 | Search and Sort by controls are visible in the stacked filter layout; no horizontal overflow. |
| 1440 x 900 | Search, location, and rent-descending sort produced `search=Big&location=Gulshan&sort=rent_desc&page=1` through Update now; no horizontal overflow. |

Browser QA confirmed selected values and query parameters stay aligned after the complete submission. Browser error logs were empty. The local frontend pointed at the currently deployed backend during visual QA, so server-side search/sort behavior is covered through the updated backend source, validation tests, and build rather than a remote production mutation.

## Automated verification

| Repository | Command | Result |
| --- | --- | --- |
| Frontend | `npm test` | PASS - 19 tests |
| Frontend | `npm run lint` | PASS |
| Frontend | `npm run build` | PASS |
| Backend | `npm run type-check` | PASS |
| Backend | `npm test` | PASS - 11 tests |
| Backend | `npm run build` | PASS |

## Scope and safeguards

- No property, category, user, or review data was modified.
- No external deployment or push was performed.
