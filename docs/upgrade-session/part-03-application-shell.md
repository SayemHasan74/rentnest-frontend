# Part 03 - Responsive Application Shell

Completion date: 2026-08-10 (Asia/Dhaka)

## PDF requirements handled in this part

Part 03 implements every Navbar and Footer requirement in the upgrade PDF:

- a full-width navbar background;
- at least four useful routes/actions while logged out;
- at least six useful routes/actions while logged in;
- an advanced dropdown/profile menu;
- sticky or fixed positioning;
- complete responsive behavior;
- a fully functional footer;
- working footer links only;
- real contact information and social links.

Hero sizing/content and the eight required homepage sections remain in Part 05. Additional About, Contact, Help, Privacy, or Terms pages and the contact form remain in Part 04.

## Navbar implementation

The header keeps a full-width semantic background while its content uses the shared `max-w-[90rem]` container. It remains sticky at `top: 0`, now uses the documented Next.js smooth-scroll marker, and sits above page toasts so an open menu cannot be obscured.

Logged-out navigation exposes exactly four useful destinations/actions:

1. Home
2. Properties
3. Login
4. Register

The former logged-out Dashboard link was removed because it was protected and therefore not a useful public destination.

Logged-in navigation is role aware. All roles receive Home, Properties, dashboard overview, a primary role destination, theme control, the account menu, and Logout. The account menu adds these destinations:

| Role | Account destinations |
| --- | --- |
| Tenant | Dashboard overview, My rental requests, Payment history |
| Landlord | Dashboard overview, Add a property, My properties, Rental requests |
| Admin | Dashboard overview, Manage users, Manage categories, Review properties |

Admin dashboard anchors were added to the existing Users, Categories, and Properties sections so every role-aware link has a valid target.

## Advanced account menu

The reusable account menu displays the active user's name, email, and role. It supports:

- explicit expanded/collapsed state;
- an accessible trigger relationship through `aria-controls`, `aria-expanded`, and `aria-haspopup`;
- labelled menu and menu-item semantics;
- mouse/touch activation;
- outside-click dismissal;
- Escape dismissal with focus returned to the trigger;
- automatic closing after internal navigation;
- the same account destinations and Logout on desktop, tablet, and mobile.

The navigation switches to its disclosure layout below the large breakpoint. This prevents the crowded 768px header observed during Part 02 and keeps the complete role navigation available on tablets.

## Footer implementation

The footer now contains four responsive information groups:

- RentNest identity and marketplace purpose;
- working internal Explore routes;
- verified frontend and backend repository links;
- real maintainer contact information and social links.

Contact details were taken only from the maintainer's publicly published portfolio:

- Hasan Mohammad Sayem;
- `sayemhasan4700@gmail.com`;
- Badda, Dhaka;
- GitHub profile;
- developer portfolio;
- Facebook profile.

The publicly listed phone number was intentionally not copied because the PDF does not require it. No contact value or social account was invented.

The footer keeps an intentional black neutral background in both themes. Its foreground colors use stable white-opacity values rather than theme-reversing slate tokens. The lowest footer text treatment is 50% white on black, approximately 5.28:1 contrast, which clears WCAG AA for normal text.

## Link verification

| Destination | Verification |
| --- | --- |
| `/home` | Included in successful Next.js production build |
| `/properties` | Included in successful Next.js production build |
| `/auth/login` | Included in successful Next.js production build |
| `/auth/register` | Included in successful Next.js production build |
| Frontend GitHub repository | HTTP 200 |
| Backend GitHub repository | HTTP 200 |
| Maintainer GitHub profile | HTTP 200 |
| Maintainer portfolio | HTTP 200 |
| Maintainer Facebook profile | HTTP 200 |
| Maintainer email | Valid `mailto:` destination matching the published portfolio contact |

External links open in a new tab with `rel="noreferrer"`. Social icon links include accessible names and tooltips.

## Responsive and interaction evidence

| Viewport | Coverage | Result |
| --- | --- | --- |
| 390 x 844 | Mobile navigation, role links, account disclosure, footer stack, contact and social links | PASS - no horizontal overflow |
| 768 x 1024 | Tablet navigation disclosure and expanded account destinations | PASS - no horizontal overflow |
| 1440 x 900 | Full desktop navigation, account dropdown, toast overlap, Escape and outside-click dismissal | PASS - no horizontal overflow |

Additional browser evidence:

- computed header position was `sticky` with `top: 0px`;
- the desktop dropdown displayed all Landlord destinations and Logout;
- Escape closed the menu and returned focus to the account trigger;
- clicking outside closed the menu;
- the header's stacking level kept the complete account identity block above the global connection-error toast;
- mobile and tablet layouts exposed the same theme and account controls;
- browser error logs were empty during the final shell interaction check.

The local backend was unavailable, so the existing connection-error toast was visible during QA. This did not prevent shell interaction testing and helped expose the dropdown stacking issue that was corrected in this part.

## Automated verification

| Command | Result |
| --- | --- |
| `npm test` | PASS - 15 tests |
| `npm run lint` | PASS |
| `npm run build` | PASS - all 16 application routes generated/served successfully |

Regression coverage now protects logged-out and per-role logged-in action counts, account menu semantics and dismissal behavior, verified footer destinations, real contact details, external-link safety attributes, and the footer's theme-independent contrast classes.

## Scope and safeguards

- No backend file, database record, environment value, external account, deployment, or production content was changed.
- The existing signed-in browser session was not logged out or otherwise modified during QA.
- No external form was submitted and no message was sent.
- No push or deployment was performed.
