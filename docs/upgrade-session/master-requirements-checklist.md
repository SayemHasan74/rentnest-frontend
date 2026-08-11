# Squid Game-7 Upgrade Master Requirements Checklist

Source: `Squid Game-7 Project 1 Upgrade Session.pdf` (5 pages)

This checklist preserves every PDF requirement as 96 individually verifiable items. A requirement can be marked `VERIFIED` only after source inspection, automated checks where practical, responsive browser testing, and live deployment verification when applicable.

Status meanings:

- `VERIFIED`: currently implemented and supported by baseline evidence.
- `PARTIAL`: some required behavior exists, but the full requirement is not satisfied.
- `MISSING`: no compliant implementation exists.
- `NEEDS_QA`: implementation appears to exist, but exhaustive verification remains for Part 16.

## 1. Global UI and Design Rules

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| UI-01 | Use a maximum of 3 primary colors plus an optional neutral color. | VERIFIED | Part 02 defines neutral, emerald, amber, and red semantic scales; blue and purple visual utilities were removed from the active UI. | 2 |
| UI-02 | Support light and dark mode with proper contrast. | VERIFIED | Semantic light/dark themes, system detection, persistence, a responsive toggle, pre-hydration initialization, contrast calculations, and browser QA are recorded in `part-02-design-system.md`. | 2 |
| UI-03 | Maintain consistent layout, spacing, and alignment throughout. | PARTIAL | Parts 02 and 05 standardize shared spacing and use the same container, surface, border, and radius system across the expanded homepage; later feature pages and final whole-site QA remain. | 2, 5, 16 |
| UI-04 | Keep cards and components consistent in size, border radius, and visual style. | PARTIAL | Part 11 extends the shared surface, border, radius, focus, and responsive-control system to role-aware dashboard navigation; final dashboard content QA remains. | 2, 6, 11, 16 |
| UI-05 | Forms include validation, error messages, success states, and loaders. | PARTIAL | Part 04 contact form has all four states; remaining forms still need consistent coverage. | 4, 9, 10, 12-14, 16 |
| UI-06 | Fully responsive for mobile, tablet, and desktop. | PARTIAL | Parts 02, 04, and 05 passed representative 390px, 768px, and 1440px browser checks without horizontal overflow; every later feature still requires the same gate. | 2-16 |
| UI-07 | No placeholder or dummy content. | PARTIAL | The six public listings and their category copy were replaced with complete, coherent rental content during live remediation. Historic test users, rentals, payments, reviews, and one inactive test-landlord property remain because the deployed API exposes no authorized deletion or edit path for them. | 15, 16 |

## 2. Home / Landing Page

### Navbar

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| HOME-01 | Full-width navbar background. | VERIFIED | The semantic surface and border span the viewport while content remains constrained to the shared maximum width. | 3, 16 |
| HOME-02 | Minimum 4 routes while logged out. | VERIFIED | Logged-out navigation exposes Home, Properties, Login, and Register; the misleading protected Dashboard link was removed. | 3 |
| HOME-03 | Minimum 6 routes/actions while logged in. | VERIFIED | Every role receives Home, Properties, dashboard overview, role-specific destinations, account access, theme control, and Logout; automated role-count checks enforce at least six. | 3 |
| HOME-04 | At least 1 advanced dropdown/profile menu. | VERIFIED | The account dropdown includes identity, role, role-aware destinations, and Logout with outside-click and Escape dismissal. | 3 |
| HOME-05 | Sticky or fixed navbar. | VERIFIED | Browser QA confirmed `position: sticky` and `top: 0` at all tested breakpoints. | 3, 16 |
| HOME-06 | Fully responsive navbar. | VERIFIED | Desktop navigation and tablet/mobile disclosure layouts passed 390px, 768px, and 1440px browser testing without overflow. | 3, 16 |

### Hero

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| HOME-07 | Hero height limited to 60-70% of the screen. | VERIFIED | Part 05 constrains the `/home` hero to `65svh`; browser QA measured 549px / 844px on mobile and 585px / 900px on desktop. | 5 |
| HOME-08 | Hero includes an interactive slider, animation, or CTA. | VERIFIED | Role-aware hero CTAs and the animated, linked live-listing ticker provide interactive progression. | 5, 16 |
| HOME-09 | Clear visual flow to the next section. | VERIFIED | The hero transitions directly into a semantic live-listing summary and neighborhood discovery section. | 5, 16 |

### Sections and footer

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| HOME-10 | Minimum 8 meaningful homepage sections. | VERIFIED | `/home` now has eight semantic sections: hero, live listing summary, neighborhoods, process, role benefits, featured homes, help, and final CTA. | 5 |
| HOME-11 | Fully functional footer. | VERIFIED | The responsive footer includes brand context, application routes, project sources, maintainer contact details, social links, and copyright information. | 3 |
| HOME-12 | Footer contains only working links. | VERIFIED | Internal routes pass the production build and the GitHub, portfolio, and Facebook destinations returned HTTP 200 during Part 03 verification. | 3, 16 |
| HOME-13 | Footer includes contact information and social links. | VERIFIED | The maintainer's publicly published name, email, Dhaka location, GitHub, portfolio, and Facebook links are included; no contact value was invented. | 3, 4 |

## 3. Core Listing / Card Section

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| CARD-01 | Each card includes an image. | VERIFIED | Property cards use Next Image with a fallback. | 6, 16 |
| CARD-02 | Each card includes a title. | VERIFIED | Property title is rendered and linked. | 6, 16 |
| CARD-03 | Each card includes a short description. | VERIFIED | Part 06 renders a two-line, real property-description preview on every card. | 6 |
| CARD-04 | Each card includes meta information. | VERIFIED | Price, location, beds, baths, area, category, and amenities are shown. | 6, 16 |
| CARD-05 | Each card includes a View Details button/link. | VERIFIED | A View details link is rendered. | 6, 16 |
| CARD-06 | Cards have the same height and width. | VERIFIED | Part 06 uses a fixed 38rem card height and equal grid columns; browser QA measured three equal 608px cards at desktop. | 6 |
| CARD-07 | Cards share border radius and layout. | VERIFIED | Part 06 gives every public listing card the shared medium radius, surface, border, image ratio, metadata order, and action placement. | 2, 6 |
| CARD-08 | Desktop displays at least 3 cards per row. | VERIFIED | The public listing grid uses three equal columns from the large desktop breakpoint; browser QA confirmed three 330px cards at 1440px. | 6 |
| CARD-09 | Show a skeleton loader while data loads. | VERIFIED | Part 06 adds a route-level, six-card loading skeleton that matches the completed card dimensions. | 6, 16 |

## 4. Details Page

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| DETAIL-01 | Details page is publicly accessible. | VERIFIED | `/properties/[id]` remains public and rendered without authentication. | 8, 16 |
| DETAIL-02 | Show multiple images or media when applicable. | VERIFIED | Part 08 displays the supplied primary image plus up to four supplied previews; a single-image listing correctly uses one full-width image without duplication. | 8, 15 |
| DETAIL-03 | Separate description/overview section. | VERIFIED | Property overview is present. | 8, 16 |
| DETAIL-04 | Separate key information/specifications section. | VERIFIED | Bedrooms, bathrooms, area, status, and amenities are separated. | 8, 16 |
| DETAIL-05 | Separate reviews/ratings section when applicable. | VERIFIED | Reviews are included. | 8, 16 |
| DETAIL-06 | Separate related-items section when applicable. | VERIFIED | Part 08 adds up to three real same-category related listings, excluding the active property. | 8 |

## 5. Listing / Explore Page

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| EXPLORE-01 | Search bar. | VERIFIED | Part 07 adds broad search across title, description, location, address, and category. | 7 |
| EXPLORE-02 | Filtering using at least 2 fields. | VERIFIED | Location, type, price, amenities, and broad search are supported through one query submission. | 7, 16 |
| EXPLORE-03 | Sorting options. | VERIFIED | Part 07 adds newest, oldest, rent low-to-high, and rent high-to-low sort options with validated backend ordering. | 7 |
| EXPLORE-04 | Pagination or infinite scroll. | VERIFIED | Previous/next pagination preserves all active search, filter, and sort parameters. | 7, 16 |
| EXPLORE-05 | Filtering is fully functional. | VERIFIED | The explicit Update now action applies search, filters, and sort atomically and resets to page 1; server validation and query handling are tested. | 7, 16 |

## 6. Authentication System

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| AUTH-01 | Login and Registration pages. | VERIFIED | Part 09 keeps both responsive routes and adds required-field, format, and optional-field validation plus accessible feedback. | 9, 16 |
| AUTH-02 | Demo login button auto-fills credentials. | VERIFIED | Part 09 demo controls now fill the selected account credentials, announce the result, and wait for the user to select Login. | 9 |
| AUTH-03 | Social login with Google or Facebook. | MISSING | Neither repository has a provider client ID, secret, callback, token-verification route, or approved OAuth redirect. This cannot be truthfully implemented until provider credentials and redirect configuration are supplied. | 9 |
| AUTH-04 | Clean and professional authentication UI. | VERIFIED | Part 09 adds accessible status messages, error associations, radio semantics, and submission-specific loading copy while retaining the responsive layout. | 9, 16 |

## 7. Role-Based Dashboard

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| DASH-01 | Multiple roles such as User/Admin/Manager. | VERIFIED | Tenant, Landlord, and Admin roles exist in frontend and backend. | 11-14, 16 |
| DASH-02 | User sidebar has at least 4 menu items/pages. | VERIFIED | Part 11 adds a responsive tenant sidebar with Dashboard overview, My rental requests, Payment history, and Profile. | 11, 12 |
| DASH-03 | Admin sidebar has at least 6 menu items/pages. | VERIFIED | Part 11 adds a responsive admin sidebar with Dashboard overview, Manage users, Manage categories, Review properties, Rental activity, and Profile. | 11, 14 |
| DASH-04 | Dashboard navbar has profile icon/dropdown with Profile and Logout. | VERIFIED | Part 10 adds Profile to the existing icon-based responsive account dropdown, which is present in the shared dashboard shell alongside Logout and role-aware actions. | 10, 11 |
| DASH-05 | Dashboard includes overview cards. | VERIFIED | Tenant, landlord, and admin dashboards have API-derived statistic cards. | 12-14, 16 |
| DASH-06 | Dashboard includes charts backed by real dynamic data. | VERIFIED | Parts 12-14 add tenant, landlord, and admin status charts calculated from their live role-scoped API data. | 12-14 |
| DASH-07 | Dashboard includes data tables. | VERIFIED | Tenant payment, landlord inventory, and admin user-management tables provide real operational data for each dashboard role. | 11-14 |
| DASH-08 | Editable profile page. | VERIFIED | Part 10 adds protected `/dashboard/profile` with a validated name, phone, and address form backed by authenticated `PATCH /api/auth/me`. | 10 |
| DASH-09 | All dashboard tables support filtering and pagination. | VERIFIED | Tenant payment and landlord inventory tables use client filters/pagination; admin users use validated server filters plus pagination. | 11-14 |

## 8. Additional Pages

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| PAGE-01 | At least 2-3 additional pages such as About, Contact, Blog, Help, Privacy, or Terms. | VERIFIED | Part 04 adds responsive About, Contact, and Help & Support pages, all linked from the footer. | 4 |

## 9. UX and Responsiveness

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| UX-01 | No lorem ipsum or placeholder content. | PARTIAL | Public listing cards no longer expose the previous malformed/test property titles. Historic dashboard-only test records remain, pending direct database access or a deployed administrative cleanup workflow. | 4, 5, 15, 16 |
| UX-02 | Fully responsive across all devices. | PARTIAL | Parts 02, 04, and 05 passed representative mobile/tablet/desktop QA; complete post-feature verification remains. | 2-16 |
| UX-03 | Proper spacing and alignment. | PARTIAL | Part 02 standardized shared radii, control heights, card padding, surfaces, and focus states; final all-page visual QA remains. | 2, 16 |
| UX-04 | All buttons and links are clickable. | NEEDS_QA | Existing primary flows work, but an exhaustive interactive audit remains. | 3-16 |
| UX-05 | Dark mode maintains proper contrast. | VERIFIED | Dark mode passed representative browser QA and sampled foreground/background ratios ranged from 8.89:1 to 18.38:1. | 2, 16 |

## 10. Forms Handling

### Requirements for every form

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| FORM-01 | Client-side required-field and format validation. | PARTIAL | Parts 04, 09, and 10 validate required fields, email format, minimum lengths, and profile contact limits; the remaining dashboard forms still need standardization. | 4, 9, 10, 12-14, 16 |
| FORM-02 | Server-side validation. | VERIFIED | Existing write endpoints use Zod validation; Part 10 adds a tested validation schema for authenticated profile updates. | 4, 9, 10, 13-15 |
| FORM-03 | Proper error and success messages. | PARTIAL | Part 10 adds accessible profile save success and error feedback; every form is not yet covered. | 4, 9, 10, 12-14, 16 |
| FORM-04 | Loading state via spinner or disabled button. | PARTIAL | Part 10 disables profile submission and shows a spinner with saving feedback; final all-form verification remains. | 4, 9, 10, 12-14, 16 |
| FORM-05 | Proper label usage. | PARTIAL | Part 10 profile controls have visible labels; some composite controls elsewhere need improvement. | 4, 9, 10, 12-14, 16 |
| FORM-06 | Accessible inputs with labels connected to inputs. | PARTIAL | Part 10 profile inputs now expose connected labels, invalid state, and error descriptions; all controls have not passed a full accessibility audit. | 4, 9, 10, 12-14, 16 |

### Required forms

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| FORM-07 | Login form. | VERIFIED | Implemented. | 9, 16 |
| FORM-08 | Registration form. | VERIFIED | Implemented. | 9, 16 |
| FORM-09 | Contact form. | VERIFIED | Public Contact page validates client-side, persists through `POST /api/contact`, validates server-side, and provides loading, error, and success states. | 4 |
| FORM-10 | Create-item form. | VERIFIED | Landlord property creation form exists. | 13, 16 |
| FORM-11 | Edit-item form. | VERIFIED | Landlord property editing exists. | 13, 16 |
| FORM-12 | Profile-update form. | VERIFIED | Part 10 provides an authenticated, editable profile form with client/server validation, accessible feedback, and save state. | 10 |

## 11. Backend Requirements

### Required stack

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| BACK-01 | Express. | VERIFIED | Express 5.2.1 is used. | 15, 16 |
| BACK-02 | MongoDB, PostgreSQL, or MySQL. | VERIFIED | PostgreSQL datasource is configured through Prisma. | 15, 16 |
| BACK-03 | Mongoose ODM or Prisma ORM. | VERIFIED | Prisma 6.19.3 is used. | 15, 16 |

### Architecture

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| BACK-04 | Basic modular folder structure. | VERIFIED | Modules separate controllers, services, routes, schemas, middleware, config, and libraries. | 15 |
| BACK-05 | API route separation. | VERIFIED | Nine route files are mounted through the API router. | 15 |
| BACK-06 | Centralized error handling. | VERIFIED | `globalErrorHandler` handles AppError, Zod, Prisma, syntax, and general errors. | 15 |
| BACK-07 | Proper HTTP status code usage. | VERIFIED | Part 16 inspected every controller response path: creates return 201, reads/updates use the shared 200 default, validation failures return 400, unknown routes return 404, and unexpected errors return 500. | 15, 16 |

### Database

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| BACK-08 | Proper schema planning. | VERIFIED | User, Category, Property, RentalRequest, Payment, and Review models exist with indexes. | 15 |
| BACK-09 | Relationships where needed. | VERIFIED | Prisma relations connect all core marketplace entities. | 15 |

### Security

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| BACK-10 | Password hashing with bcrypt. | VERIFIED | bcryptjs hashes passwords with cost 12. | 15, 16 |
| BACK-11 | JWT token authentication. | VERIFIED | Tokens are created and verified for protected requests. | 15, 16 |
| BACK-12 | Input validation. | VERIFIED | Zod schemas protect current write and filter endpoints. | 15, 16 |
| BACK-13 | CORS configuration. | VERIFIED | Allowed origins are restricted and wildcard production CORS is tested. | 15, 16 |
| BACK-14 | Role-based access control. | VERIFIED | Auth middleware enforces Tenant, Landlord, and Admin permissions. | 15, 16 |

## 12. Code Quality Rules

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| CODE-01 | Clean and organized folder structure. | VERIFIED | Frontend and backend use clear feature/module separation. | 15 |
| CODE-02 | Reusable components. | VERIFIED | Shared layout, UI, property, and dashboard components exist. | 2, 6, 11, 15 |
| CODE-03 | Custom hooks for React. | VERIFIED | Part 02 adds the reusable `useTheme` hook through the shared theme provider. | 2, 15 |
| CODE-04 | Proper environment-variable usage. | VERIFIED | Part 15 requires JWT, Stripe, and callback configuration in production while retaining non-production defaults only for local/test execution. | 15 |
| CODE-05 | No console logs in production. | VERIFIED | Part 15 removes console logging from the server lifecycle and seed script; development lifecycle output is explicitly suppressed in production and seed output no longer exposes credentials. | 15 |
| CODE-06 | Meaningful commit messages. | VERIFIED | Recent histories use descriptive `feat`, `fix`, and `docs` messages. | 1-16 |

## 13. Final Submission Requirements

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| SUBMIT-01 | Live website URL. | VERIFIED | `https://rentnest-frontend-eosin.vercel.app` returns HTTP 200. | 16 |
| SUBMIT-02 | Frontend GitHub repository link. | VERIFIED | `https://github.com/SayemHasan74/rentnest-frontend` is reachable. | 16 |
| SUBMIT-03 | Backend GitHub repository link. | VERIFIED | `https://github.com/SayemHasan74/rentnest-server` is reachable. | 16 |
| SUBMIT-04 | Demo user email and password. | VERIFIED | Tenant demo credentials are documented in the frontend README. | 9, 16 |
| SUBMIT-05 | Demo admin email and password. | VERIFIED | Admin demo credentials are documented in both READMEs. | 9, 16 |

## Completion rule

The upgrade is complete only when all 96 rows are `VERIFIED`, both repositories pass their complete verification suites, every applicable item passes live browser testing, and the deployed frontend/backend match the audited Git commits.
