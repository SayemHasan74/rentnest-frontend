# Part 01 - Baseline, Safeguards, and Upgrade Control Record

Baseline date: 2026-08-10 (Asia/Dhaka)

## Scope

Part 01 establishes the evidence and safeguards required before feature work. It does not change application behavior, production data, environment secrets, or deployments.

The complete five-page PDF was text-extracted and visually inspected. Its requirements are preserved as 96 independently verifiable rows in `master-requirements-checklist.md`.

## Canonical repositories

| Repository | Local path | Branch at baseline | Baseline commit | Remote comparison after fetch |
| --- | --- | --- | --- | --- |
| Frontend | `/Users/ghost/My Computer/Local Disk E/CODES/rentnest-frontend` | `main` | `017147c` | 0 ahead, 0 behind `origin/main` |
| Backend | `/Users/ghost/My Computer/Local Disk E/CODES/Study/rentnest-server` | `main` | `4f06714` | 0 ahead, 0 behind `origin/main` |

Canonical remotes:

- Frontend: `https://github.com/SayemHasan74/rentnest-frontend.git`
- Backend: `https://github.com/SayemHasan74/rentnest-server.git`

The `/Users/ghost/My Computer/Local Disk E/CODES/Assignment 5` repository is the assignment/starter repository and is not the completed RentNest application.

## Working-tree safeguards

- Frontend was clean before Part 01 documentation was added.
- Backend contained pre-existing untracked `.DS_Store` and `src/.DS_Store` files. They are user-owned and were not changed or deleted.
- No environment values were printed or copied. Only environment key names were inventoried.
- No database mutation, API write, deployment, push, login, payment, or destructive action was performed.

## Verified deployment inventory

All endpoints below returned HTTP 200 during the baseline check:

| Purpose | URL |
| --- | --- |
| Live frontend / Vercel deployment | `https://rentnest-frontend-eosin.vercel.app/` |
| Backend service root | `https://rentnest-server.onrender.com/` |
| Backend health | `https://rentnest-server.onrender.com/api/health` |
| Swagger documentation | `https://rentnest-server.onrender.com/api/docs` |
| Frontend GitHub | `https://github.com/SayemHasan74/rentnest-frontend` |
| Backend GitHub | `https://github.com/SayemHasan74/rentnest-server` |

The health response identified `rentnest-server` version `1.0.0` running in production.

No local `.vercel/project.json`, `vercel.json`, `render.yaml`, Procfile, or Dockerfile is committed. Deployment appears to be provider-side Git integration and must be re-confirmed before the final release.

## Frontend baseline

### Stack

- Next.js 16.2.12 App Router
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- lucide-react

### Routes (15 page files)

```text
/
/auth/login
/auth/register
/dashboard/admin
/dashboard/landlord
/dashboard/landlord/properties/new
/dashboard/landlord/requests
/dashboard/tenant
/dashboard/tenant/requests/[id]/pay
/home
/payment/cancel
/payment/success
/properties
/properties/[id]
/unauthorized
```

Additional framework routes include the not-found and error boundaries.

### Environment contract

Committed `.env.example` key:

```text
NEXT_PUBLIC_API_BASE_URL
```

No local frontend secret environment file was found in the repository root.

### Verification result

| Command | Result |
| --- | --- |
| `npm test` | PASS - 9 tests |
| `npm run lint` | PASS |
| `npm run build` | PASS - 16 generated/served application routes plus proxy |

## Backend baseline

### Stack

- Node.js and Express 5.2.1
- TypeScript
- PostgreSQL
- Prisma 6.19.3
- Zod 4.4.3
- bcryptjs
- JSON Web Token authentication
- Stripe
- Swagger/OpenAPI

### Structure

- 9 route files
- 9 controllers
- 9 services
- 7 schema files
- 2 automated test files
- 2 Prisma migrations

### API inventory

```text
GET    /
GET    /api/health
GET    /api/docs
GET    /api/docs.json

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/properties
GET    /api/properties/:id

GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id

GET    /api/admin/users
PATCH  /api/admin/users/:id
GET    /api/admin/properties
GET    /api/admin/rentals

GET    /api/landlord/properties
POST   /api/landlord/properties
PUT    /api/landlord/properties/:id
PATCH  /api/landlord/properties/:id/availability
DELETE /api/landlord/properties/:id
GET    /api/landlord/requests
PATCH  /api/landlord/requests/:id
PATCH  /api/landlord/requests/:id/complete

POST   /api/rentals
GET    /api/rentals
GET    /api/rentals/:id

GET    /api/payments/success
GET    /api/payments/cancel
POST   /api/payments/create
POST   /api/payments/confirm
POST   /api/payments/webhook
GET    /api/payments
GET    /api/payments/:id

POST   /api/reviews
```

### Environment contract

Committed `.env.example` keys:

```text
NODE_ENV
PORT
ALLOWED_ORIGINS
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_SUCCESS_URL
STRIPE_CANCEL_URL
```

No local backend `.env` file was found in the repository root.

### Verification result

| Command | Result |
| --- | --- |
| `npm test` | PASS - 7 tests |
| `npm run type-check` | PASS |
| `npm run build` | PASS |

## Behavior that later parts must preserve

The following currently working behavior is protected from regression:

- Public landing, home, property listing, and property details routes.
- Property filtering by location, type, price, and amenities.
- Property pagination.
- Tenant, Landlord, and Admin authentication and route restrictions.
- Demo Tenant, Landlord, and Admin accounts.
- Tenant rental request lifecycle.
- Landlord property create, edit, availability, and delete workflows.
- Landlord request approval, rejection, and completion workflows.
- Admin user status and category management.
- Stripe checkout creation, confirmation, success, and cancellation flows.
- Completed-rental reviews.
- BDT currency display and Stripe minor-unit conversion.
- Dashboard cache/error feedback and offline feedback.
- API health and Swagger documentation.
- Production CORS restriction against wildcard origins.

## Known production content requiring later cleanup

The live application exposes test/dummy content that conflicts with the PDF. Examples observed during the audit include:

- `PHHHHHH`
- `programing`
- `ABCD`
- `Banglo 23`
- `adadad`
- `Postman Demo Apartment`
- `Stripe E2E Tenant`

Part 15 must replace or remove these only after explicit production-data authorization and after a recoverable backup/export is confirmed.

## External inputs and authority required later

These are not Part 01 blockers, but they are required before final completion:

1. Google or Facebook OAuth application credentials and approved origins/callback URLs.
2. Real contact details and social-profile URLs for the footer/contact pages.
3. Explicit permission to replace or delete live dummy/test database records.
4. Authorization to push final frontend/backend branches and trigger Vercel/Render deployments.
5. Confirmation of the final demo video URL if the submission requires it outside the PDF.

## Branch and commit strategy

- Use the same branch name in both repositories: `codex/squid-game-7-upgrade`.
- Keep one focused commit per completed part; split frontend/backend commits where a part changes both repositories.
- Never mix unrelated cleanup with a feature part.
- Before each part: confirm branch, working tree, upstream comparison, and relevant tests.
- After each part: run its acceptance gate, update the master checklist, record evidence, and stop before the next part.
- Do not push or deploy until the user explicitly authorizes the release action.
- Do not rewrite, squash, reset, or delete user history.

Recommended commit pattern:

```text
docs: establish upgrade baseline and requirements tracker
feat(ui): complete part 02 design system and dark mode
feat(navigation): complete part 03 application shell
...
test(release): complete part 16 compliance verification
```

## Part 01 completion criteria

- [x] Complete PDF was re-read and visually verified.
- [x] All 96 requirements were transferred to the master checklist.
- [x] Canonical repositories and remotes were identified.
- [x] Both repositories were fetched and confirmed 0 ahead / 0 behind `origin/main`.
- [x] Existing untracked user files were identified and preserved.
- [x] Route and API inventories were captured.
- [x] Environment key contracts were captured without exposing values.
- [x] Live URLs and repository URLs returned HTTP 200.
- [x] Frontend tests, lint, and production build passed.
- [x] Backend tests, type-check, and production build passed.
- [x] Protected baseline behavior and future external dependencies were documented.
- [x] Branch, commit, verification, deployment, and destructive-data safeguards were established.
