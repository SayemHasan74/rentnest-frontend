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
| UI-01 | Use a maximum of 3 primary colors plus an optional neutral color. | PARTIAL | A mostly neutral editorial palette exists, but it is not governed by documented semantic tokens. | 2 |
| UI-02 | Support light and dark mode with proper contrast. | MISSING | No theme switcher or dark theme exists. | 2 |
| UI-03 | Maintain consistent layout, spacing, and alignment throughout. | PARTIAL | Shared widths and spacing exist, but page and dashboard patterns are not fully standardized. | 2, 16 |
| UI-04 | Keep cards and components consistent in size, border radius, and visual style. | PARTIAL | Shared `Card` primitives exist, but property and dashboard content use several inconsistent patterns. | 2, 6, 11 |
| UI-05 | Forms include validation, error messages, success states, and loaders. | PARTIAL | Implemented forms vary; not every required form exists or has every state. | 4, 9, 10, 12-14, 16 |
| UI-06 | Fully responsive for mobile, tablet, and desktop. | PARTIAL | Existing layouts are responsive, but complete breakpoint testing is not yet recorded. | 2-16 |
| UI-07 | No placeholder or dummy content. | MISSING | Live data contains test/dummy names and descriptions. | 15 |

## 2. Home / Landing Page

### Navbar

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| HOME-01 | Full-width navbar background. | VERIFIED | Sticky header spans the viewport. | 3, 16 |
| HOME-02 | Minimum 4 routes while logged out. | VERIFIED | Home, Properties, Dashboard, Login, and Register are exposed, though route quality will be improved. | 3 |
| HOME-03 | Minimum 6 routes/actions while logged in. | MISSING | Logged-in navigation does not expose six distinct useful destinations/actions. | 3 |
| HOME-04 | At least 1 advanced dropdown/profile menu. | MISSING | No advanced menu exists. | 3 |
| HOME-05 | Sticky or fixed navbar. | VERIFIED | Header uses sticky positioning. | 3, 16 |
| HOME-06 | Fully responsive navbar. | PARTIAL | Mobile toggle exists; keyboard, focus, and complete breakpoint QA remain. | 3, 16 |

### Hero

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| HOME-07 | Hero height limited to 60-70% of the screen. | MISSING | Current landing hero uses approximately 86vh minus header height. | 5 |
| HOME-08 | Hero includes an interactive slider, animation, or CTA. | VERIFIED | CTAs and animated home ticker exist. | 5, 16 |
| HOME-09 | Clear visual flow to the next section. | VERIFIED | Hero leads into a structured journey section. | 5, 16 |

### Sections and footer

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| HOME-10 | Minimum 8 meaningful homepage sections. | MISSING | `/home` has four top-level sections plus a ticker; `/` has three sections. | 5 |
| HOME-11 | Fully functional footer. | PARTIAL | Footer renders and navigates, but required information is incomplete. | 3 |
| HOME-12 | Footer contains only working links. | NEEDS_QA | Existing internal links resolve; final all-link audit remains. | 3, 16 |
| HOME-13 | Footer includes contact information and social links. | MISSING | Neither real contact details nor social links are present. | 3, 4 |

## 3. Core Listing / Card Section

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| CARD-01 | Each card includes an image. | VERIFIED | Property cards use Next Image with a fallback. | 6, 16 |
| CARD-02 | Each card includes a title. | VERIFIED | Property title is rendered and linked. | 6, 16 |
| CARD-03 | Each card includes a short description. | MISSING | Property cards do not render descriptions. | 6 |
| CARD-04 | Each card includes meta information. | VERIFIED | Price, location, beds, baths, area, category, and amenities are shown. | 6, 16 |
| CARD-05 | Each card includes a View Details button/link. | VERIFIED | A View details link is rendered. | 6, 16 |
| CARD-06 | Cards have the same height and width. | PARTIAL | Grid widths are consistent, but content height is not explicitly controlled. | 6 |
| CARD-07 | Cards share border radius and layout. | PARTIAL | Layout is shared, but card/radius treatment differs from other card systems. | 2, 6 |
| CARD-08 | Desktop displays at least 3 cards per row. | PARTIAL | Three columns begin at `xl`; smaller desktop widths use two. | 6 |
| CARD-09 | Show a skeleton loader while data loads. | VERIFIED | Route-level six-card skeleton exists. | 6, 16 |

## 4. Details Page

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| DETAIL-01 | Details page is publicly accessible. | VERIFIED | `/properties/[id]` does not require authentication. | 8, 16 |
| DETAIL-02 | Show multiple images or media when applicable. | PARTIAL | Gallery supports arrays, but live records can repeat a single image. | 8, 15 |
| DETAIL-03 | Separate description/overview section. | VERIFIED | Property overview is present. | 8, 16 |
| DETAIL-04 | Separate key information/specifications section. | VERIFIED | Bedrooms, bathrooms, area, status, and amenities are separated. | 8, 16 |
| DETAIL-05 | Separate reviews/ratings section when applicable. | VERIFIED | Reviews are included. | 8, 16 |
| DETAIL-06 | Separate related-items section when applicable. | MISSING | No related property section exists. | 8 |

## 5. Listing / Explore Page

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| EXPLORE-01 | Search bar. | PARTIAL | Location input exists, but there is no broad property search. | 7 |
| EXPLORE-02 | Filtering using at least 2 fields. | VERIFIED | Location, type, price, and amenities are supported. | 7, 16 |
| EXPLORE-03 | Sorting options. | MISSING | Backend always orders by newest; no UI selector exists. | 7 |
| EXPLORE-04 | Pagination or infinite scroll. | VERIFIED | Previous/next pagination exists. | 7, 16 |
| EXPLORE-05 | Filtering is fully functional. | VERIFIED | Filters are sent to validated backend queries and preserve pagination state. | 7, 16 |

## 6. Authentication System

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| AUTH-01 | Login and Registration pages. | VERIFIED | Both routes and forms exist. | 9, 16 |
| AUTH-02 | Demo login button auto-fills credentials. | MISSING | Existing demo buttons immediately log in instead of only auto-filling. | 9 |
| AUTH-03 | Social login with Google or Facebook. | MISSING | No social provider integration exists. | 9 |
| AUTH-04 | Clean and professional authentication UI. | VERIFIED | Current authentication UI is structured, labelled, and responsive. | 9, 16 |

## 7. Role-Based Dashboard

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| DASH-01 | Multiple roles such as User/Admin/Manager. | VERIFIED | Tenant, Landlord, and Admin roles exist in frontend and backend. | 11-14, 16 |
| DASH-02 | User sidebar has at least 4 menu items/pages. | MISSING | Tenant dashboard currently exposes two section links. | 11, 12 |
| DASH-03 | Admin sidebar has at least 6 menu items/pages. | MISSING | No admin sidebar or six-page navigation exists. | 11, 14 |
| DASH-04 | Dashboard navbar has profile icon/dropdown with Profile and Logout. | MISSING | No dashboard-specific profile dropdown exists. | 10, 11 |
| DASH-05 | Dashboard includes overview cards. | VERIFIED | Tenant, landlord, and admin dashboards have API-derived statistic cards. | 12-14, 16 |
| DASH-06 | Dashboard includes charts backed by real dynamic data. | MISSING | No charts or chart dependency exists. | 11-14 |
| DASH-07 | Dashboard includes data tables. | PARTIAL | Admin users and tenant payments are tables; other datasets are cards. | 11-14 |
| DASH-08 | Editable profile page. | MISSING | No profile route or update API exists. | 10 |
| DASH-09 | All dashboard tables support filtering and pagination. | MISSING | Only admin users have both; other datasets do not. | 11-14 |

## 8. Additional Pages

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| PAGE-01 | At least 2-3 additional pages such as About, Contact, Blog, Help, Privacy, or Terms. | MISSING | None of the suggested supporting pages currently exists. | 4 |

## 9. UX and Responsiveness

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| UX-01 | No lorem ipsum or placeholder content. | MISSING | Live database exposes dummy/test entries. | 4, 5, 15 |
| UX-02 | Fully responsive across all devices. | PARTIAL | Mobile containment exists, but comprehensive breakpoint verification remains. | 2-16 |
| UX-03 | Proper spacing and alignment. | PARTIAL | Generally structured; design-system and final visual QA remain. | 2, 16 |
| UX-04 | All buttons and links are clickable. | NEEDS_QA | Existing primary flows work, but an exhaustive interactive audit remains. | 3-16 |
| UX-05 | Dark mode maintains proper contrast. | MISSING | Dark mode is absent. | 2, 16 |

## 10. Forms Handling

### Requirements for every form

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| FORM-01 | Client-side required-field and format validation. | PARTIAL | Several forms validate, but coverage and consistency are incomplete. | 4, 9, 10, 12-14, 16 |
| FORM-02 | Server-side validation. | VERIFIED | Existing write endpoints use Zod validation. New forms will require schemas. | 4, 9, 10, 13-15 |
| FORM-03 | Proper error and success messages. | PARTIAL | Major workflows have feedback; every form is not yet covered. | 4, 9, 10, 12-14, 16 |
| FORM-04 | Loading state via spinner or disabled button. | PARTIAL | Major asynchronous forms have loading states; final all-form verification remains. | 4, 9, 10, 12-14, 16 |
| FORM-05 | Proper label usage. | PARTIAL | Most fields use labels; some composite controls need improvement. | 4, 9, 10, 12-14, 16 |
| FORM-06 | Accessible inputs with labels connected to inputs. | PARTIAL | Standard inputs are connected; all controls have not passed a full accessibility audit. | 4, 9, 10, 12-14, 16 |

### Required forms

| ID | Requirement | Baseline status | Evidence / gap | Planned part |
| --- | --- | --- | --- | --- |
| FORM-07 | Login form. | VERIFIED | Implemented. | 9, 16 |
| FORM-08 | Registration form. | VERIFIED | Implemented. | 9, 16 |
| FORM-09 | Contact form. | MISSING | No contact page or API exists. | 4 |
| FORM-10 | Create-item form. | VERIFIED | Landlord property creation form exists. | 13, 16 |
| FORM-11 | Edit-item form. | VERIFIED | Landlord property editing exists. | 13, 16 |
| FORM-12 | Profile-update form. | MISSING | No profile form exists. | 10 |

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
| BACK-07 | Proper HTTP status code usage. | PARTIAL | Controllers use explicit response codes, but a full endpoint-by-endpoint contract audit remains. | 15, 16 |

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
| CODE-03 | Custom hooks for React. | MISSING | No dedicated custom hook files exist. | 15 |
| CODE-04 | Proper environment-variable usage. | PARTIAL | Env examples exist, but backend has development fallback secrets that must be production-safe. | 15 |
| CODE-05 | No console logs in production. | MISSING | Backend server lifecycle uses `console.log`; seed logs are also present. | 15 |
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
