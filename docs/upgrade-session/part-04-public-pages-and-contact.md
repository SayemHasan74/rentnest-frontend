# Part 04 - Public Pages and Contact Form

Completion date: 2026-08-10 (Asia/Dhaka)

## PDF requirements handled

The PDF requires at least two or three additional pages (such as About, Contact, or Help/Support) and names Contact as a required form. It also requires all forms to provide client and server validation, clear errors and success feedback, loading feedback, visible labels, and label-connected accessible controls.

Part 04 delivers:

- `/about` — marketplace purpose and the tenant, landlord, and administrator workflows;
- `/contact` — a public contact route with direct maintainer email and an enquiry form;
- `/help` — practical guidance for property search, rental requests, landlord listing management, and payment history;
- updated footer links to all three pages;
- a public `POST /api/contact` endpoint, modular controller/service/route structure, Prisma model, migration, and OpenAPI entry.

## Contact form behavior

The browser validates name, email format, subject, and message before sending. Invalid controls are marked with `aria-invalid`, error descriptions are associated through `aria-describedby`, and the form reports an accessible summary error. Submission disables the button and renders a spinner. On a successful API response, it clears the form and shows a clear received-message confirmation. Network or server errors stay on the form for recovery.

The server repeats validation through `contactSubmissionValidationSchema`: values are trimmed, email is normalized to lowercase, and bounded minimum/maximum text lengths protect storage. Valid records are stored as `ContactSubmission` rows. The migration is included in source control but was not applied to a remote database or deployed service during this part.

The contact page also warns users not to include passwords, payment-card details, or other sensitive information.

## Responsive and visual evidence

| Viewport | Route | Result |
| --- | --- | --- |
| 390 x 844 | Contact | No horizontal overflow; mobile stack works; invalid submission displays four field errors and an accessible summary. |
| 768 x 900 | About | No horizontal overflow; content and cards remain readable. |
| 1440 x 900 | Help | No horizontal overflow; all support content and Contact links render. |

Dark-mode visual QA exposed a contrast issue in the initial contact information card. It was corrected by keeping that intentional inverse surface black in both themes, with stable white-opacity text. Browser error logs were empty during the final route checks. A global connection-error notice appeared because the local backend was not running; no form submission was sent to the deployed API during QA.

## Automated verification

| Repository | Command | Result |
| --- | --- | --- |
| Frontend | `npm test` | PASS — 15 tests |
| Frontend | `npm run lint` | PASS |
| Frontend | `npm run build` | PASS — `/about`, `/contact`, and `/help` are statically generated |
| Backend | `npm run prisma:generate` | PASS |
| Backend | `npm run type-check` | PASS |
| Backend | `npm test` | PASS — 8 tests, including contact schema normalization and rejection coverage |
| Backend | `npm run build` | PASS |

## Scope and safeguards

- No database migration was applied, no production API was changed, and no contact message was sent.
- No external deployment or push was performed.
- The contact storage model contains only the fields required to receive and respond to an enquiry.
