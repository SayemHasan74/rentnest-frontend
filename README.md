# RentNest Frontend

RentNest is a Next.js App Router frontend for a rental property marketplace.
Tenants can browse properties, submit rental requests, pay after landlord
approval, and leave reviews. Landlords can manage property listings and rental
requests. Admins can manage users, listings, rentals, and categories.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- RentNest REST API

## Backend API

```text
https://rentnest-server.onrender.com/api
```

Copy `.env.example` to `.env.local` for local development:

```env
NEXT_PUBLIC_API_BASE_URL=https://rentnest-server.onrender.com/api
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

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
