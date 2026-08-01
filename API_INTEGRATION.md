# RentNest API Integration

The frontend uses `src/lib/api.ts` as its single typed API client. Protected
requests read the JWT from the browser auth session and send it as a Bearer
token. API failures are normalized through `ApiError` and displayed as inline
feedback, toast notifications, or the App Router error boundary.

Base URL:

```env
NEXT_PUBLIC_API_BASE_URL=https://rentnest-server.onrender.com/api
```

## Public And Authentication

| Frontend route or component | Method and endpoint | Purpose |
| --- | --- | --- |
| `src/app/page.tsx` | None | Static landing page that renders immediately and warms the API in the background |
| `src/app/home/page.tsx` | `GET /properties` | Cached featured properties and marketplace totals |
| `src/app/home/page.tsx` | `GET /categories` | Cached property-type navigation and totals |
| `src/app/properties/page.tsx` | `GET /properties` | Paginated location, price, type, and amenity filtering |
| `src/app/properties/page.tsx` | `GET /categories` | Property-type filter options |
| `src/app/properties/[id]/page.tsx` | `GET /properties/:id` | Property details, gallery, landlord, and reviews |
| `src/components/auth/auth-form.tsx` | `POST /auth/register` | Tenant or landlord registration |
| `src/components/auth/auth-form.tsx` | `POST /auth/login` | Login and JWT session creation |
| Auth API client | `GET /auth/me` | Resolve the current authenticated user |

## Tenant

| Frontend route or component | Method and endpoint | Purpose |
| --- | --- | --- |
| `rental-request-panel.tsx` | `POST /rentals` | Submit a property rental request |
| `tenant-rentals-dashboard.tsx` | `GET /rentals` | Tenant request history and statuses |
| `tenant-pay-panel.tsx` | `GET /rentals/:id` | Validate the selected request before payment |
| `tenant-pay-panel.tsx` | `POST /payments/create` | Create a Stripe Checkout session |
| `payment-result.tsx` | `POST /payments/confirm` | Verify Stripe success or record cancellation |
| `tenant-rentals-dashboard.tsx` | `GET /payments` | Tenant payment history |
| Payment API client | `GET /payments/:id` | Retrieve one tenant-owned payment |
| `tenant-rentals-dashboard.tsx` | `POST /reviews` | Review a completed rental |

The checkout session ID is saved in `sessionStorage` before redirecting to
Stripe. The success route uses Stripe's `session_id` query parameter, while the
cancel route uses the saved session ID. Both routes synchronize the result with
the backend before directing the tenant back to the dashboard.
The checkout request also supplies frontend-origin success and cancel URLs so
the same flow returns correctly in local development and on Vercel.

## Landlord

| Frontend route or component | Method and endpoint | Purpose |
| --- | --- | --- |
| `landlord-properties-dashboard.tsx` | `GET /landlord/properties` | Owned listings and dashboard totals |
| `landlord-properties-dashboard.tsx` | `POST /landlord/properties` | Create a listing |
| `landlord-properties-dashboard.tsx` | `PUT /landlord/properties/:id` | Edit listing details |
| `landlord-properties-dashboard.tsx` | `PATCH /landlord/properties/:id/availability` | Toggle availability |
| `landlord-properties-dashboard.tsx` | `DELETE /landlord/properties/:id` | Delete an eligible listing |
| `landlord-properties-dashboard.tsx` | `GET /landlord/requests` | Incoming rental requests and tenant history |
| `landlord-properties-dashboard.tsx` | `PATCH /landlord/requests/:id` | Approve or reject a pending request |
| `landlord-properties-dashboard.tsx` | `PATCH /landlord/requests/:id/complete` | Complete a paid active rental |

## Admin

| Frontend route or component | Method and endpoint | Purpose |
| --- | --- | --- |
| `admin-users-dashboard.tsx` | `GET /admin/users` | Search and filter users |
| `admin-users-dashboard.tsx` | `PATCH /admin/users/:id` | Ban or reactivate a user |
| `admin-users-dashboard.tsx` | `GET /admin/properties` | Inspect all listings |
| `admin-users-dashboard.tsx` | `GET /admin/rentals` | Inspect platform rental and payment activity |
| `admin-users-dashboard.tsx` | `GET /categories` | Load category moderation data |
| `admin-users-dashboard.tsx` | `POST /categories` | Create a category |
| `admin-users-dashboard.tsx` | `PATCH /categories/:id` | Edit a category |
| `admin-users-dashboard.tsx` | `DELETE /categories/:id` | Delete an unused category |

## Error And Loading Behavior

- `src/app/loading.tsx` provides route-level skeleton loading.
- `src/app/error.tsx` provides a recoverable error boundary.
- `src/app/not-found.tsx` handles unknown routes and missing properties.
- Forms render field-level validation and API messages.
- Dashboard mutations render success and error toast notifications.
- The app warms the Render API in the background on first entry.
- Role dashboards reuse five-minute session data while fresh API data reloads.
