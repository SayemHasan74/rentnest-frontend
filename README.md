# RentNest Frontend

RentNest is a Next.js App Router frontend for a rental property marketplace.
Tenants can browse properties, submit rental requests, pay after landlord
approval, and leave reviews. Landlords can manage property listings and rental
requests. Admins can manage users, listings, rentals, and categories.

## Submission Details

| Item | Value |
| --- | --- |
| Live application | https://rentnest-frontend-eosin.vercel.app |
| Frontend repository | https://github.com/SayemHasan74/rentnest-frontend |
| Backend repository | https://github.com/SayemHasan74/rentnest-server |
| Backend API | https://rentnest-server.onrender.com/api |
| Admin email | `admin@rentnest.com` |
| Admin password | `admin123` |

The video explanation link is submitted separately through the assignment form.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react icons
- RentNest REST API

## Environment

Copy `.env.example` to `.env.local` for local development.

```env
NEXT_PUBLIC_API_BASE_URL=https://rentnest-server.onrender.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

## Demo Credentials

```text
Admin Email: admin@rentnest.com
Admin Password: admin123

Landlord Email: landlord@rentnest.com
Landlord Password: landlord123

Tenant Email: tenant@rentnest.com
Tenant Password: tenant123
```

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm test
npm run lint
npm run build
```

## Routes

```text
/                         Static marketing landing page
/home                     Cached property-focused application home
/properties               Public property browse and filters
/properties/[id]          Property details, gallery, reviews, rental request
/auth/login               Login with demo account shortcuts
/auth/register            Tenant/landlord registration
/about                    Public project information
/contact                  Validated contact form
/help                     Public help and support
/privacy                  Privacy policy for local and social accounts
/data-deletion            Account and social-data deletion instructions
/dashboard                Role redirect
/dashboard/tenant         Tenant rental requests, payments, reviews
/dashboard/tenant/requests/[id]/pay
                          Dedicated Stripe checkout initiation page
/payment/success          Payment success feedback page
/payment/cancel           Payment cancellation feedback page
/dashboard/landlord       Landlord listings, requests, property creation
/dashboard/landlord/properties/new
                          Landlord property creation route
/dashboard/landlord/requests
                          Landlord request management route
/dashboard/admin          Admin users, properties, rentals, categories
/unauthorized             Role access fallback
```

## Role Features

Tenant:
- Browse and filter public properties.
- Submit rental requests from property details.
- Track rental status in the tenant dashboard.
- View payment history.
- Pay approved rentals through Stripe checkout.
- See payment success/cancel feedback pages.
- Review completed rentals.

Landlord:
- View owned properties.
- View active requests and payment earnings at a glance.
- Add new property listings.
- Edit existing property listings.
- Delete eligible property listings.
- Toggle property availability.
- Review rental requests.
- Approve or reject pending requests with optimistic UI updates.
- Complete active paid rentals.
- View earnings from completed payments.

Admin:
- View and filter users in a responsive data table by role, status, and search.
- Paginate user management results.
- Ban or activate user accounts.
- Monitor all properties.
- Monitor rental activity and payment status.
- Create, edit, and delete categories.

Shared UX:
- Route-level loading skeletons.
- Route-level error fallback.
- Toast-style success and failure feedback for dashboard actions.
- Visible warnings when cached dashboard or home data cannot be refreshed.
- Background API warmup to reduce Render cold-start delays.
- Five-minute session cache for instant dashboard revisits with background refresh.
- Startup session verification through `GET /api/auth/me`.

## API Integration

The frontend uses `src/lib/api.ts` as the single API client. It sends bearer
tokens for protected routes and unwraps the backend response format.

Integrated endpoints:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/facebook
GET  /api/auth/me

GET  /api/properties
GET  /api/properties/:id
GET  /api/categories

POST /api/rentals
GET  /api/rentals
GET  /api/rentals/:id

POST /api/payments/create
POST /api/payments/confirm
GET  /api/payments
GET  /api/payments/:id

POST /api/reviews

GET    /api/landlord/properties
POST   /api/landlord/properties
PUT    /api/landlord/properties/:id
PATCH  /api/landlord/properties/:id/availability
DELETE /api/landlord/properties/:id
GET    /api/landlord/requests
PATCH  /api/landlord/requests/:id
PATCH  /api/landlord/requests/:id/complete

GET   /api/admin/users
PATCH /api/admin/users/:id
GET   /api/admin/properties
GET   /api/admin/rentals
POST  /api/categories
PATCH /api/categories/:id
DELETE /api/categories/:id
```

## Authentication

Auth state is stored in `localStorage` for client API calls and in cookies for
Next.js route protection. The middleware proxy protects dashboard routes and
redirects users to their role dashboard.

Google and Facebook buttons exchange a provider credential with the backend.
The backend verifies that credential directly with the provider before issuing
the same RentNest JWT used by password accounts. New social accounts are
created as tenants; existing accounts are never linked by email automatically.

```text
TENANT   -> /dashboard/tenant
LANDLORD -> /dashboard/landlord
ADMIN    -> /dashboard/admin
```
