# Part 02 - Design System, Theme, and Responsive Foundation

Completion date: 2026-08-10 (Asia/Dhaka)

## PDF requirements handled in this part

Part 02 implements the global visual and UX foundation required by the upgrade PDF:

- no more than three primary/functional colors plus a neutral family;
- complete light and dark modes with proper contrast;
- consistent layout, spacing, alignment, component size, radius, and style;
- consistent form, loading, disabled, success, and error presentation foundations;
- responsive behavior for mobile, tablet, and desktop;
- proper spacing, clickable theme controls, and readable dark-mode content;
- reusable components and a custom React hook.

Feature-specific forms, all-page responsive certification, property-card content, and dashboard restructuring remain in their assigned later parts. Part 02 provides the primitives those parts must use.

## Implemented design system

`src/app/globals.css` now defines two semantic themes instead of a fixed light palette. The dark theme uses navy-blue and blue-grey neutrals; emerald is reserved for brand actions and semantic feedback rather than page surfaces. The visual palette is limited to:

| Family | Purpose |
| --- | --- |
| Neutral | backgrounds, surfaces, borders, typography, and inverse regions |
| Emerald | brand, primary actions, focus, information, and success |
| Amber | warning and pending states |
| Red | destructive actions and error states |

Semantic tokens include background, foreground, surface, primary, primary foreground, primary hover, inverse, inverse foreground, inverse hover, and inverse-muted colors. Existing slate, emerald, amber, and red utility names are mapped to theme-aware values. Active blue and purple visual utilities were removed.

Shared primitives were standardized as follows:

- buttons use a 40px default height, `rounded-md`, semantic primary/inverse variants, visible focus outlines, and disabled behavior;
- inputs, textareas, and property filters use matching heights/radii, semantic surfaces, emerald focus rings, placeholder colors, and disabled colors;
- cards use equal-height behavior, `rounded-md`, semantic surfaces, a consistent border/shadow, and responsive 20/24px padding;
- badges use the shared radius and theme-aware status colors;
- loading skeletons use the same card surface and radius;
- page, error, loading, payment, authentication, property, and dashboard surfaces no longer depend on hard-coded white backgrounds.

The intentionally photographic landing hero and global footer keep absolute black/white treatment because those are stable high-contrast neutral regions in both themes.

## Theme behavior

The root layout runs a small initialization script before hydration. It selects a valid saved theme when one exists and otherwise uses `prefers-color-scheme`. It applies both `data-theme` and the browser `color-scheme` before the page paints, while `suppressHydrationWarning` prevents an expected root-attribute mismatch.

`ThemeProvider` uses `useSyncExternalStore` to:

- expose the reusable `useTheme` custom hook;
- persist explicit light/dark choices;
- react to system-theme changes until a user choice exists;
- synchronize theme changes between browser tabs;
- apply the selected theme to native browser controls.

An accessible theme button appears in desktop navigation and as a labelled action in mobile navigation. Its accessible name and tooltip always describe the next action.

## Contrast evidence

Representative WCAG contrast calculations:

| Pair | Ratio |
| --- | ---: |
| Light body text / page background | 15.01:1 |
| Light muted text / surface | 7.45:1 |
| Light primary button text / button | 7.68:1 |
| Light inverse foreground / inverse surface | 18.93:1 |
| Light error text / error surface | 5.91:1 |
| Dark body text / page background | 17.09:1 |
| Dark muted text / surface | 11.95:1 |
| Dark primary button text / button | 8.89:1 |
| Dark inverse foreground / inverse surface | 17.06:1 |
| Dark error text / error surface | 9.33:1 |

All sampled normal-text pairs exceed WCAG AA's 4.5:1 threshold.

## Responsive and interaction evidence

Local browser checks were completed against the running Next.js application:

| Viewport | Theme and route coverage | Result |
| --- | --- | --- |
| 390 x 844 | Light/dark home, open mobile navigation, labelled theme action, property filters/cards | PASS - no horizontal overflow; mobile controls and content remained readable and operable |
| 768 x 1024 | Dark home and navigation | PASS - no horizontal overflow; tablet layout and action row remained contained |
| 1440 x 900 | Light/dark home and dark landlord dashboard/forms | PASS - no horizontal overflow; semantic surfaces and inverse dashboard sections remained readable |

Additional verified behavior:

- switching theme updated the document theme and toggle label immediately;
- the selected dark theme survived a page reload;
- switching from the mobile labelled action updated the complete page;
- browser console inspection returned no warnings or errors from the theme interaction;
- focus styling was visibly present on the active theme control.

The local backend was unavailable during visual QA, so the existing global connection-error toast was visible. That state was useful for verifying error colors in both themes and did not prevent layout testing.

## Automated verification

| Command | Result |
| --- | --- |
| `npm test` | PASS - 12 tests |
| `npm run lint` | PASS |
| `npm run build` | PASS - all 16 application routes generated/served successfully |

Regression tests now protect pre-hydration initialization, system-theme detection, theme persistence wiring, semantic color limits, semantic primary buttons, and desktop/mobile theme controls.

## Scope and safeguards

- No backend file, database record, external account, deployment, or environment setting was changed.
- No push or deployment was performed.
- Existing application workflows and role/session behavior were preserved.
- Part 02 does not claim final whole-application responsiveness; each later part must pass the same three-viewport check, followed by the exhaustive Part 16 audit.
