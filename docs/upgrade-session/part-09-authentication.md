# Part 09 - Authentication System

## PDF requirements addressed

- Login and registration pages.
- Demo login controls that auto-fill credentials.
- Clean, professional authentication UI.
- Global form requirements: client validation, server validation, error/success feedback, loading state, and connected accessible labels.

## Delivered

- Demo account controls now only fill the selected credentials and announce that Login must be selected to continue; they never submit credentials automatically.
- Login and registration provide custom required-field, email-format, password, optional phone, and address-length validation.
- Each invalid auth control exposes `aria-invalid` and an associated error description. The role picker is a labelled radio group with a semantic legend.
- Error and demo-success messages use live regions. Submission disables the action, shows a spinner, and identifies whether an account is being created or a user is logging in.
- Backend login and registration Zod schemas have direct acceptance/rejection regression coverage.

## Social-login blocker

Google/Facebook sign-in is deliberately not represented by a non-functional button. No OAuth provider client ID, secret, approved redirect URL, callback route, or provider-token verification flow is configured in either repository. Completing this remaining PDF item requires the provider credentials and redirect configuration from the project owner.

## Verification

- Frontend: `npm test` (23 passing), `npm run lint`, and `npm run build`.
- Backend: `npm test` (13 passing), `npm run type-check`, and `npm run build`.
- Local browser interaction QA could not run because the available browser already has an authenticated RentNest session and redirects the auth routes to the landlord dashboard. The session was not inspected or cleared; an unauthenticated-browser check remains for Part 16.
