# Part 06 - Core Listing Cards

Completion date: 2026-08-10 (Asia/Dhaka)

## PDF requirements handled

Part 06 completes the Core Listing/Card Section requirements: image, title, short description, price/date/rating/location metadata, View Details action, consistent dimensions and styling, at least three desktop columns, and a loading skeleton.

## Card implementation

Every reusable public `PropertyCard` now includes:

- the first property image (or existing safe fallback);
- category, title, short two-line description, and monthly price;
- location, real property creation date, and an actual calculated average review rating or an honest no-reviews state;
- bedrooms, bathrooms, area, and up to three amenities;
- a clear View Details link.

The public list endpoint now returns only review IDs and ratings alongside each card's existing listing data. This is enough to calculate a real average while avoiding the full review text and tenant data used by the details page.

Cards use a fixed 38rem height, shared medium radius, border, surface, image ratio, metadata order, and bottom-aligned View Details link. Their amenity row clips rather than expands, so a long amenity name cannot make a card taller than its neighbors.

The browse page defers its sidebar layout to the extra-large breakpoint and uses a full-width three-column grid from the large breakpoint. The homepage featured grid uses the same desktop three-column rule. A new `/properties/loading.tsx` renders six matching card skeletons during route loading.

## Responsive and visual evidence

| Viewport | Result |
| --- | --- |
| 390 x 844 | Single 348px card column; no horizontal overflow. |
| 768 x 900 | Two-column intermediate layout; no horizontal overflow. |
| 1440 x 900 | Three 330px grid columns; first three cards each measured 608px high; no horizontal overflow. |

Browser QA confirmed descriptions, locations, listed dates, ratings/no-review states, and View Details links render in the shared card layout. Browser error logs were empty. The existing connection notice was visible because the local backend was unavailable, while the page still used the configured listing API response for card inspection.

## Automated verification

| Repository | Command | Result |
| --- | --- | --- |
| Frontend | `npm test` | PASS - 17 tests, including card-layout and skeleton coverage |
| Frontend | `npm run lint` | PASS |
| Frontend | `npm run build` | PASS |
| Backend | `npm run prisma:generate` | PASS |
| Backend | `npm run type-check` | PASS |
| Backend | `npm test` | PASS - 9 tests, including public card review-data coverage |
| Backend | `npm run build` | PASS |

## Scope and safeguards

- No property record, review, user, deployment, or external account was changed.
- The existing data quality issues in live listings remain reserved for Part 15; this part displays existing data accurately rather than inventing replacements.
- No push or deployment was performed.
